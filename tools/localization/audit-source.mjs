import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repository = resolve(import.meta.dirname, '../..');
const sourceRoots = ['src', 'apps/web/src', 'packages/ui/src'];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const localizedAttributes = new Set(['aria-label', 'aria-description', 'placeholder', 'title', 'alt']);

// Deliberate non-catalog text: approved brand rendering and an app-independent
// component fallback. App page wrappers supply common.sessionUi.practiceLatestEmpty.
const exceptions = new Map([
  ['apps/web/src/public-site/MarketingOverview/MarketingOverview.tsx|jsx-text|Dry Fire With Ease', 'Approved product name'],
  ['packages/ui/src/BrandHeader/BrandHeader.tsx|jsx-aria-label|Dry Fire With Ease', 'Accessible product name'],
  ['packages/ui/src/BrandHeader/BrandHeader.tsx|jsx-text|DRY', 'Approved brand lockup'],
  ['packages/ui/src/BrandHeader/BrandHeader.tsx|jsx-text|FIRE', 'Approved brand lockup'],
  ['packages/ui/src/BrandHeader/BrandHeader.tsx|jsx-text|WITH EASE', 'Approved brand lockup'],
  ['packages/ui/src/BrandHeader/BrandHeader.tsx|jsx-text|BETA', 'Edition badge'],
]);

async function* sourceFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (['generated', 'localization', 'node_modules'].includes(entry.name)) continue;
      yield* sourceFiles(filename);
    } else if (sourceExtensions.has(extname(filename)) && !/\.(test|spec)\./.test(filename)) {
      yield filename;
    }
  }
}

export function inspectLocalizedSource(filename, source, root = repository, exceptionMap = exceptions) {
  const findings = [];
  const relativePath = relative(root, filename).replaceAll('\\', '/');
  const kind = /\.[jt]sx$/.test(filename) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, kind);
  const record = (node, type, text) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (/^\{\{[A-Za-z][A-Za-z0-9_]*\}\}$/.test(normalized)) return;
    if (!normalized || !/[A-Za-z]{3}/.test(normalized)) return;
    const key = `${relativePath}|${type}|${normalized}`;
    findings.push({ key, allowed: exceptionMap.get(key), line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1 });
  };
  const visit = node => {
    if (ts.isJsxText(node)) record(node, 'jsx-text', node.text);
    if (ts.isJsxAttribute(node) && localizedAttributes.has(node.name.getText(ast)) && node.initializer) {
      const value = ts.isStringLiteral(node.initializer)
        ? node.initializer.text
        : ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isStringLiteral(node.initializer.expression)
          ? node.initializer.expression.text
          : null;
      if (value !== null) record(node, `jsx-${node.name.getText(ast)}`, value);
    }
    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) {
      record(node, 'jsx-expression', node.expression.text);
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && ts.isStringLiteral(node.right) && relativePath.startsWith('apps/web/') && /[A-Za-z]{3}/.test(node.right.text) && /\s/.test(node.right.text)) {
      let parent = node.parent;
      while (parent && parent !== ast && !ts.isJsxElement(parent) && !ts.isJsxFragment(parent)) {
        if (ts.isJsxAttribute(parent)) break;
        parent = parent.parent;
      }
      if (parent && !ts.isJsxAttribute(parent)) record(node.right, 'jsx-fallback', node.right.text);
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(node.left) && ['textContent', 'innerHTML'].includes(node.left.name.text) && (ts.isStringLiteral(node.right) || ts.isNoSubstitutionTemplateLiteral(node.right))) {
      record(node, `dom-${node.left.name.text}`, node.right.text);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'setAttribute' && node.arguments.length > 1 && ts.isStringLiteral(node.arguments[0]) && ['aria-label', 'aria-description', 'title', 'placeholder'].includes(node.arguments[0].text) && ts.isStringLiteral(node.arguments[1])) {
      record(node, `dom-${node.arguments[0].text}`, node.arguments[1].text);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'node' && node.arguments.length > 1 && ts.isStringLiteral(node.arguments[1])) {
      record(node, 'dom-node-text', node.arguments[1].text);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'textNode' && node.arguments.length > 3 && ts.isStringLiteral(node.arguments[3])) {
      record(node, 'dom-text-node', node.arguments[3].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return findings;
}

export async function auditLocalizedJsx({ root = repository } = {}) {
  const findings = [];
  for (const sourceRoot of sourceRoots) {
    for await (const filename of sourceFiles(resolve(root, sourceRoot))) {
      findings.push(...inspectLocalizedSource(filename, await readFile(filename, 'utf8'), root));
    }
  }
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = await auditLocalizedJsx();
  const unowned = findings.filter(finding => !finding.allowed);
  if (unowned.length) {
    throw new Error(`Unowned user-facing JSX text found:\n${unowned.map(finding => `${finding.key} (line ${finding.line})`).join('\n')}`);
  }
  console.log(`Localized application source audit passed (${findings.length} approved brand literal(s)).`);
}
