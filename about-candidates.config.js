import config from './playwright.config.js';
// Collect unaccepted review candidates only; permanent CI never regenerates baselines.
export default { ...config,
 snapshotPathTemplate: '{testDir}/../visual-candidates/{projectName}/{arg}{ext}',
 updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
};
