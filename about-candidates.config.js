// Temporary candidate-only renderer; accepted paths are never updated here.
import config from './playwright.config.js';
export default { ...config,
  snapshotPathTemplate: '{testDir}/../visual-candidates/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
};
