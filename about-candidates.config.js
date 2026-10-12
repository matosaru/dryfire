import config from './playwright.config.js';
// Temporary collector writes unaccepted candidates only; normal CI never updates baselines.
export default { ...config,
  snapshotPathTemplate: '{testDir}/../visual-candidates/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
};
