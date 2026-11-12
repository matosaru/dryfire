import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { styleSources, composedStyles, externalStyleOwners, lazyStyleOwners, lazyStyleSources, startupStyleOwners } from '../tools/style-sources.mjs';
import { componentCssOwnerPlugin } from '../tools/startup-css-owner.mjs';
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
  const deletePath = 'packages/ui/src/HistoryDeleteControl/HistoryDeleteControl.css';
  expect(styleSources()).not.toContain(path);
  expect(styleSources()).not.toContain(deletePath);
  expect(lazyStyleSources()).toEqual([path, deletePath]);
  expect(lazyStyleOwners['src/optional/progressView.js']).toEqual([path]);
  expect(lazyStyleOwners['packages/ui/src/HistoryDeleteControl/HistoryDeleteControl.tsx']).toEqual([deletePath]);
  expect(readFileSync(resolve(process.cwd(), 'src/optional/progressView.js'), 'utf8'))
    .toContain("import '../../packages/ui/src/ProgressContent/ProgressContent.css';");
  expect(readFileSync(resolve(process.cwd(), 'packages/ui/src/ProgressContent/ProgressContent.tsx'), 'utf8'))
    .toContain("import './ProgressContent.css';");
  expect(readFileSync(resolve(process.cwd(), 'packages/ui/src/HistoryDeleteControl/HistoryDeleteControl.tsx'), 'utf8'))
    .toContain("import './HistoryDeleteControl.css';");
});

test('component-owned startup CSS is resolved through the single critical stylesheet copy', () => {
  for (const [name, marker] of [['InformationCard', 'about-card'], ['DrillCard', 'preset-card'], ['SoundCard', 'class-card'], ['RecognitionList', 'history-list'], ['PageHeading', 'section-head'], ['PreferenceToggle', 'preference-toggle'], ['GunContext', 'gun-context'], ['InfoFooter', 'copyright'], ['NumberInput', 'numeric-hint'], ['PracticeReview', '#practiceReview'], ['PracticeRun', 'practice-counters'], ['RepetitionResult', 'session-result-card'], ['AppShell', 'app-shell'], ['BrandHeader', 'brand-home'], ['SafetyDisclosure', 'safety-card'], ['BottomNavigation', 'tabs'], ['EvaluationPanel', 'evaluation-panel'], ['GunSwitcher', 'gun-switcher'], ['SavedSessionList', 'saved-session-card'], ['SafetyDialog', 'safety-modal'], ['CustomDrillEditor', 'custom-drill-editor'], ['DrillSetup', 'session-sequence'], ['SequenceRun', 'session-progress'], ['SequenceReview', 'session-review-card'], ['CalibrationCatalog', 'calibration-card']]) {
    const ownerPath = resolve(process.cwd(), `packages/ui/src/${name}/${name}.tsx`);
    const cssPath = `packages/ui/src/${name}/${name}.css`;
    const importPath = `./${name}.css`;
    const id = componentCssOwnerPlugin().resolveId(importPath, ownerPath);
    expect(readFileSync(ownerPath, 'utf8')).toContain(`import '${importPath}';`);
    const ownedStyles = startupStyleOwners[`packages/ui/src/${name}/${name}.tsx`];
    expect(Array.isArray(ownedStyles) ? ownedStyles : [ownedStyles]).toContain(cssPath);
    expect(styleSources()).toContain(cssPath);
    expect(componentCssOwnerPlugin().load(id)).toBe('export {};\n');
    expect(componentCssOwnerPlugin().resolveId(`${importPath}?direct`, `${ownerPath}?used`)).toBe(id);
    expect(componentCssOwnerPlugin().resolveId('./Other.css', ownerPath)).toBeNull();
    expect(readFileSync(resolve(process.cwd(), cssPath), 'utf8')).toContain(marker.startsWith('#') ? marker : `.${marker}`);
    expect(componentCssOwnerPlugin().resolveId(`../${cssPath}`, resolve(process.cwd(), 'src/styles.css'))).toBeNull();
  }
});

test('each page composition declares its existing stylesheet without changing the startup cascade', () => {
  const pages = ['AboutPage', 'ContactPage', 'DrillsPage', 'GunSetupPage', 'GunsPage', 'HistoryPage', 'HomePage', 'LearnPage', 'LiveListenPage', 'PracticeGuidePage', 'PracticePage', 'SequencePage', 'SettingsPage', 'SoundCheckPage'];
  for (const name of pages) {
    const owner = `apps/web/src/pages/${name}/${name}.tsx`;
    const css = `apps/web/src/pages/${name}/${name}.css`;
    const source = readFileSync(resolve(process.cwd(), owner), 'utf8');
    expect(source).toContain(`import './${name}.css';`);
    expect(startupStyleOwners[owner]).toBe(css);
    expect(styleSources()).toContain(css);
    const id = componentCssOwnerPlugin().resolveId(`./${name}.css`, resolve(process.cwd(), owner));
    expect(componentCssOwnerPlugin().load(id)).toBe('export {};\n');
    expect(styleSources().filter(path => path === css)).toHaveLength(1);
  }
});

test('feature and public components declare the correct aggregate or separate CSS delivery', () => {
  for (const [owner, css] of Object.entries(startupStyleOwners).filter(([owner]) => owner.includes('/features/') || owner.includes('/public-site/MarketingOverview/'))) {
    const source = readFileSync(resolve(process.cwd(), owner), 'utf8');
    const relative = `./${css.split('/').at(-1)}`;
    expect(source).toContain(`import '${relative}';`);
    const id = componentCssOwnerPlugin().resolveId(relative, resolve(process.cwd(), owner));
    expect(componentCssOwnerPlugin().load(id)).toBe('export {};\n');
    expect(styleSources().filter(path => path === css)).toHaveLength(1);
  }
  for (const [owner, css] of Object.entries(externalStyleOwners)) {
    const source = readFileSync(resolve(process.cwd(), owner), 'utf8');
    const relative = `./${css.split('/').at(-1)}`;
    expect(source).toContain(`import '${relative}';`);
    const id = componentCssOwnerPlugin().resolveId(relative, resolve(process.cwd(), owner));
    expect(componentCssOwnerPlugin().load(id)).toBe('export {};\n');
    expect(styleSources()).not.toContain(css);
  }
});

test('component owners may resolve multiple colocated files already present in startup CSS',()=>{
  for(const [name,paths] of [
    ['PracticeRun',['PracticeRun.css','PracticeRun.meter.css']],
    ['RepetitionResult',['RepetitionResult.css','RepetitionResult.details.css']]
  ]){
    const ownerPath=resolve(process.cwd(),`packages/ui/src/${name}/${name}.tsx`);
    const expected=paths.map(path=>`packages/ui/src/${name}/${path}`);
    expect(startupStyleOwners[`packages/ui/src/${name}/${name}.tsx`]).toEqual(expected);
    expect(readFileSync(ownerPath,'utf8')).toContain(`import './${paths[0]}';`);
    expect(readFileSync(ownerPath,'utf8')).toContain(`import './${paths[1]}';`);
    for(const path of expected)expect(readFileSync(resolve(process.cwd(),path),'utf8').length).toBeGreaterThan(0);
    for(const path of expected){
      const importPath=`./${path.split('/').at(-1)}`;
      const id=componentCssOwnerPlugin().resolveId(importPath,ownerPath);
      expect(id).toContain(path);
      expect(componentCssOwnerPlugin().load(id)).toBe('export {};\n');
      expect(styleSources()).toContain(path);
    }
  }
});
