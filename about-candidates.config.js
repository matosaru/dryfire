import config from './playwright.config.js';
// Temporary unaccepted candidates; permanent CI never regenerates expected images.
export default { ...config,
 snapshotPathTemplate: '{testDir}/../visual-candidates/{projectName}/{arg}{ext}',
 updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
};
