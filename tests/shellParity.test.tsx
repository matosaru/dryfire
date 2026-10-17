/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppShell } from '@dryfire/ui/AppShell';

const legacy = readFileSync(new URL('./fixtures/legacy-shell.html', import.meta.url), 'utf8');
// Whitespace around block elements/HTML comments and attribute order are not
// visual contracts. Every actual element, attribute, SVG path and text is.
function tree(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, ' ').trim() || null;
  if (!(node instanceof Element)) return null;
  return [node.tagName, [...node.attributes].map(attr => [attr.name, attr.value]).sort(),
    [...node.childNodes].map(tree).filter(Boolean)];
}
function shell(html: string) {
  const container = document.createElement('div'); container.innerHTML = html;
  return tree(container.querySelector('.app-shell')!);
}

test('the typed shell exactly preserves the released DOM, text, SVGs, IDs and default accessibility state', () => {
  const safety = <dialog id="safetyModal" />, context = <section id="gunContext" />, page = <section id="homeView" />;
  const expected = legacy.replace('{{safetyModal}}', renderToStaticMarkup(safety))
    .replace('{{context}}', renderToStaticMarkup(context)).replace('{{pages}}', renderToStaticMarkup(page));
  const actual = renderToStaticMarkup(<AppShell safety={safety} context={context} footerNotice={<p id="previewModeBadge" className="preview-mode-badge" role="status">Private preview · Free mode</p>}>{page}</AppShell>);
  expect(shell(actual)).toEqual(shell(expected));
});
