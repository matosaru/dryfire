import { readFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';

export const lazyStyleOwners = Object.freeze({
  'src/optional/progressView.js': Object.freeze(['packages/ui/src/ProgressContent/ProgressContent.css'])
});

/** Component-owned styles already present in the startup compatibility sheet.
 * The owner import is an explicit dependency; the aggregate remains their sole
 * emitted source while native prerendered content still needs immediate paint. */
export const startupStyleOwners = Object.freeze({
  'packages/ui/src/InformationCard/InformationCard.tsx': 'packages/ui/src/InformationCard/InformationCard.css',
  'packages/ui/src/DrillCard/DrillCard.tsx': 'packages/ui/src/DrillCard/DrillCard.css',
  'packages/ui/src/SoundCard/SoundCard.tsx': 'packages/ui/src/SoundCard/SoundCard.css',
  'packages/ui/src/RecognitionList/RecognitionList.tsx': 'packages/ui/src/RecognitionList/RecognitionList.css',
  'packages/ui/src/PageHeading/PageHeading.tsx': 'packages/ui/src/PageHeading/PageHeading.css',
  'packages/ui/src/PreferenceToggle/PreferenceToggle.tsx': 'packages/ui/src/PreferenceToggle/PreferenceToggle.css',
  'packages/ui/src/GunContext/GunContext.tsx': 'packages/ui/src/GunContext/GunContext.css',
  'packages/ui/src/InfoFooter/InfoFooter.tsx': 'packages/ui/src/InfoFooter/InfoFooter.css',
  'packages/ui/src/NumberInput/NumberInput.tsx': 'packages/ui/src/NumberInput/NumberInput.css',
  'packages/ui/src/PracticeReview/PracticeReview.tsx': 'packages/ui/src/PracticeReview/PracticeReview.css',
  'packages/ui/src/PracticeRun/PracticeRun.tsx': Object.freeze([
    'packages/ui/src/PracticeRun/PracticeRun.css',
    'packages/ui/src/PracticeRun/PracticeRun.meter.css'
  ]),
  'packages/ui/src/RepetitionResult/RepetitionResult.tsx': Object.freeze([
    'packages/ui/src/RepetitionResult/RepetitionResult.css',
    'packages/ui/src/RepetitionResult/RepetitionResult.details.css'
  ]),
  'packages/ui/src/AppShell/AppShell.tsx': 'packages/ui/src/AppShell/AppShell.css',
  'packages/ui/src/BrandHeader/BrandHeader.tsx': 'packages/ui/src/BrandHeader/BrandHeader.css',
  'packages/ui/src/SafetyDisclosure/SafetyDisclosure.tsx': 'packages/ui/src/SafetyDisclosure/SafetyDisclosure.css',
  'packages/ui/src/BottomNavigation/BottomNavigation.tsx': 'packages/ui/src/BottomNavigation/BottomNavigation.css',
  'packages/ui/src/EvaluationPanel/EvaluationPanel.tsx': 'packages/ui/src/EvaluationPanel/EvaluationPanel.css',
  'packages/ui/src/GunSwitcher/GunSwitcher.tsx': 'packages/ui/src/GunSwitcher/GunSwitcher.css',
  'packages/ui/src/SavedSessionList/SavedSessionList.tsx': 'packages/ui/src/SavedSessionList/SavedSessionList.css',
  'packages/ui/src/SafetyDialog/SafetyDialog.tsx': 'packages/ui/src/SafetyDialog/SafetyDialog.css',
  'packages/ui/src/CustomDrillEditor/CustomDrillEditor.tsx': 'packages/ui/src/CustomDrillEditor/CustomDrillEditor.css',
  'packages/ui/src/DrillSetup/DrillSetup.tsx': 'packages/ui/src/DrillSetup/DrillSetup.css',
  'packages/ui/src/SequenceRun/SequenceRun.tsx': 'packages/ui/src/SequenceRun/SequenceRun.css',
  'packages/ui/src/SequenceReview/SequenceReview.tsx': 'packages/ui/src/SequenceReview/SequenceReview.css',
  'packages/ui/src/CalibrationCatalog/CalibrationCatalog.tsx': 'packages/ui/src/CalibrationCatalog/CalibrationCatalog.css'
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
