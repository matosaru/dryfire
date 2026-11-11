import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { styleSources, composedStyles, lazyStyleOwners, lazyStyleSources, startupStyleOwners } from '../tools/style-sources.mjs';
import { startupCssOwnerPlugin } from '../tools/startup-css-owner.mjs';
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

test('private progress presentation styles load with their only runtime owner', () => {
  const path = 'packages/ui/src/ProgressContent/ProgressContent.css';
  expect(styleSources()).not.toContain(path);
  expect(lazyStyleSources()).toEqual([path]);
  expect(lazyStyleOwners['src/optional/progressView.js']).toEqual([path]);
  expect(readFileSync(resolve(process.cwd(), 'src/optional/progressView.js'), 'utf8'))
    .toContain("import '../../packages/ui/src/ProgressContent/ProgressContent.css';");
  expect(readFileSync(resolve(process.cwd(), 'packages/ui/src/ProgressContent/ProgressContent.tsx'), 'utf8'))
    .toContain("import './ProgressContent.css';");
});

test('component-owned startup CSS is resolved through the single critical stylesheet copy', () => {
  for (const [name, marker] of [['InformationCard', 'about-card'], ['DrillCard', 'preset-card'], ['SoundCard', 'class-card'], ['RecognitionList', 'history-list'], ['PageHeading', 'section-head'], ['PreferenceToggle', 'preference-toggle'], ['GunContext', 'gun-context'], ['InfoFooter', 'copyright'], ['NumberInput', 'numeric-hint'], ['PracticeReview', '#practiceReview'], ['PracticeRun', 'practice-counters'], ['RepetitionResult', 'session-result-card'], ['AppShell', 'app-shell'], ['BrandHeader', 'brand-home'], ['SafetyDisclosure', 'safety-card'], ['BottomNavigation', 'tabs'], ['EvaluationPanel', 'evaluation-panel'], ['GunSwitcher', 'gun-switcher'], ['SavedSessionList', 'saved-session-card'], ['SafetyDialog', 'safety-modal'], ['CustomDrillEditor', 'custom-drill-editor'], ['DrillSetup', 'session-sequence'], ['SequenceRun', 'session-progress'], ['SequenceReview', 'session-review-card'], ['CalibrationCatalog', 'calibration-card']]) {
    const ownerPath = resolve(process.cwd(), `packages/ui/src/${name}/${name}.tsx`);
    const cssPath = `packages/ui/src/${name}/${name}.css`;
    const importPath = `./${name}.css`;
    const id = startupCssOwnerPlugin().resolveId(importPath, ownerPath);
    expect(readFileSync(ownerPath, 'utf8')).toContain(`import '${importPath}';`);
    expect(startupStyleOwners[`packages/ui/src/${name}/${name}.tsx`]).toBe(cssPath);
    expect(styleSources()).toContain(cssPath);
    expect(startupCssOwnerPlugin().load(id)).toBe('export {};\n');
    expect(startupCssOwnerPlugin().resolveId(`${importPath}?direct`, `${ownerPath}?used`)).toBe(id);
    expect(startupCssOwnerPlugin().resolveId('./Other.css', ownerPath)).toBeNull();
    expect(readFileSync(resolve(process.cwd(), cssPath), 'utf8')).toContain(marker.startsWith('#') ? marker : `.${marker}`);
    expect(startupCssOwnerPlugin().resolveId(`../${cssPath}`, resolve(process.cwd(), 'src/styles.css'))).toBeNull();
  }
});
