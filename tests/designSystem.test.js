import {readFileSync} from 'node:fs';

const tokens=readFileSync(new URL('../packages/ui/src/tokens.css',import.meta.url),'utf8');
const styles=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const primitives=readFileSync(new URL('../docs/design-system/primitives.md',import.meta.url),'utf8');

test('semantic tokens define the required system roles without adding unused startup bytes',()=>{
 for(const name of ['color-canvas','color-surface','color-surface-raised','color-border','color-text','color-text-muted','color-accent','color-trigger','color-sequence','color-positive','font-sans','space-4','radius-md','control-min-size'])expect(tokens).toContain(`--${name}:`);
 expect(tokens).toContain(':root[data-theme="light"]');
 expect(styles).not.toContain('packages/ui/src/tokens.css');
});

test('primitive catalog identifies shared owners and native form policy',()=>{
 for(const owner of ['AppShell','BrandHeader','BottomNavigation','PageHeading','DrillCard','DrillSetup','NumberInput','SafetyDialog','SavedSessionList','RecognitionList'])expect(primitives).toContain(`\`${owner}\``);
 expect(primitives).toContain('Selects remain native OS/browser controls.');
 expect(primitives).toContain('ComponentName.test.tsx');
});
