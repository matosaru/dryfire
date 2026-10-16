import config from './playwright.config.js';
// Temporary unaccepted candidates; normal CI never updates accepted references.
export default { ...config, snapshotPathTemplate: '{testDir}/../visual-candidates/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all' };
