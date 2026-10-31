import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { styleSources, composedStyles } from '../tools/style-sources.mjs';
let root;
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'dryfire-css-contract-')); mkdirSync(join(root, 'components')); });
afterEach(() => rmSync(root, { recursive: true, force: true }));

test('nested colocated CSS retains the original cascade and exposes every media dependency', () => {
  writeFileSync(join(root, 'entry.css'), '@import "./base.css";\n@import "./components/card.css";\n.card{color:blue}\n');
  writeFileSync(join(root, 'base.css'), '.card{color:red}\n');
  writeFileSync(join(root, 'components/card.css'), '@import "./spacing.css";\n.card{color:green}\n');
  writeFileSync(join(root, 'components/spacing.css'), '.card{padding:12px}\n');
  const result = composedStyles('entry.css', root);
  expect(result.css).toBe('.card{color:red}\n.card{padding:12px}\n.card{color:green}\n.card{color:blue}\n');
  expect(result.sources).toEqual(['entry.css', 'base.css', 'components/card.css', 'components/spacing.css']);
});

test('a circular import fails before recursive composition can loop', () => {
  writeFileSync(join(root, 'entry.css'), '@import "./components/card.css";\n');
  writeFileSync(join(root, 'components/card.css'), '@import "../entry.css";\n');
  expect(() => composedStyles('entry.css', root)).toThrow('Repeated/circular CSS import');
});

test('imports cannot escape the repository boundary', () => {
  writeFileSync(join(root, 'entry.css'), '@import "../outside.css";\n');
  expect(() => styleSources('entry.css', root)).toThrow('CSS import leaves repository');
});

test('the shipping stylesheet does not restore retired component selectors', () => {
  const { css } = composedStyles();
  const retired = [
    'subhead', 'class-symbol', 'home-kicker', 'stat-icon', 'home-steps',
    'gun-card-chevron', 'custom-step-number', 'session-record-header',
    'session-record-meta', 'session-summary-stats', 'practice-mode-tag'
  ];
  for (const token of retired) expect(css).not.toContain(`.${token}`);
});
