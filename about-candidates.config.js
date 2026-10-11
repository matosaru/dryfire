// Temporary: collect changed About/Settings images for human review only.
// Never write accepted baseline paths from the collection job.
import config from './playwright.config.js';
export default { ...config,
  snapshotPathTemplate: '{testDir}/../visual-candidates/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
  grep: /settings\/|about\/|About /,
};
