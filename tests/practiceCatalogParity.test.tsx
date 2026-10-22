/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import { readFileSync } from 'node:fs';
import { PRACTICE_MODES } from '../src/practiceSession.js';
import { renderPracticeCatalog } from '../apps/web/src/app/renderPracticeCatalog.tsx';

test('prerendering exactly preserves the six approved CHG-052 cards and their native button semantics', () => {
  const old = readFileSync(new URL('./fixtures/practice-catalog.html',import.meta.url),'utf8');
  const tree = (html: string) => {
    const container = document.createElement('div'); container.innerHTML = html;
    return [...container.querySelectorAll('*')].map(node=>[node.tagName,
      [...node.attributes].map(attr=>[attr.name,attr.value]).sort(),
      [...node.childNodes].filter(child=>child.nodeType===Node.TEXT_NODE).map(child=>child.textContent)]);
  };
  expect(tree(renderPracticeCatalog(PRACTICE_MODES))).toEqual(tree(old));
});
