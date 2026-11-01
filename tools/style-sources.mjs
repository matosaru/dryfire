import { readFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';

export const lazyStyleOwners = Object.freeze({
  'src/optional/progressView.js': Object.freeze(['packages/ui/src/ProgressContent/ProgressContent.css'])
});

export function lazyStyleSources() {
  return [...new Set(Object.values(lazyStyleOwners).flat())];
}

/** Follow the ordered local CSS entry without changing its cascade. The same
 * dependency list is used for media fingerprints and source contract checks. */
export function styleSources(entry = 'src/styles.css', root = process.cwd()) {
  const ordered = [], seen = new Set();
  const visit = path => {
    if (seen.has(path)) throw new Error(`Repeated/circular CSS import: ${path}`);
    seen.add(path);
    const text = readFileSync(resolve(root, path), 'utf8');
    ordered.push(path);
    for (const match of text.matchAll(/^@import "([^"]+)";$/gm)) {
      const next = relative(root, resolve(root, dirname(path), match[1]));
      if (next.startsWith('..') || next.startsWith('/')) throw new Error('CSS import leaves repository.');
      visit(next);
    }
  };
  visit(entry);
  return ordered;
}

export function composedStyles(entry = 'src/styles.css', root = process.cwd()) {
  const sources = styleSources(entry, root);
  const expand = path => readFileSync(resolve(root, path), 'utf8').replace(/^@import "([^"]+)";\n/gm,
    (_, next) => expand(relative(root, resolve(root, dirname(path), next))));
  return { sources, css: expand(entry) };
}
