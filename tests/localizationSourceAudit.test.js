import { inspectLocalizedSource } from '../tools/localization/audit-source.mjs';

test('localization source audit detects visible text and user-facing labels', () => {
  const source = 'export const Action = () => <button aria-label="Delete saved drill">Delete</button>;';
  expect(inspectLocalizedSource('/repo/apps/web/src/Action.tsx', source, '/repo').map(({ key }) => key)).toEqual([
    'apps/web/src/Action.tsx|jsx-aria-label|Delete saved drill',
    'apps/web/src/Action.tsx|jsx-text|Delete',
  ]);
});

test('localization source audit ignores route-template tokens and translated expressions', () => {
  const source = 'export const Page = () => <main>{t("page.title")}{"{{content}}"}</main>;';
  expect(inspectLocalizedSource('/repo/apps/web/src/Page.tsx', source, '/repo')).toEqual([]);
});

test('localization source audit also catches literal strings sent to legacy DOM helpers', () => {
  const source = "element.textContent = 'Remove record'; node('p', 'Record removed', 'status');";
  expect(inspectLocalizedSource('/repo/src/view.js', source, '/repo').map(({ key }) => key)).toEqual([
    'src/view.js|dom-textContent|Remove record',
    'src/view.js|dom-node-text|Record removed',
  ]);
});

test('localization source audit catches English fallback copy in app JSX expressions', () => {
  const source = 'export const Summary = () => <p>{message ?? "Missing user-facing copy"}</p>;';
  expect(inspectLocalizedSource('/repo/apps/web/src/Summary.tsx', source, '/repo').map(({ key }) => key)).toEqual([
    'apps/web/src/Summary.tsx|jsx-fallback|Missing user-facing copy',
  ]);
});
