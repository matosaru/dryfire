// Temporary initial collection: these images are candidates, never accepted baselines.
// Removed after the two browser sets are inspected and promoted with a review manifest.
import config from './playwright.config.js';
export default {
  ...config,
  snapshotPathTemplate: '{testDir}/../visual-candidates/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
};
