// Temporary rendering investigation; these are candidates, never auto-accepted baselines.
import config from './playwright.config.js';
export default { ...config,
  projects: config.projects.filter(project => project.name === 'chromium'),
  snapshotPathTemplate: '{testDir}/../visual-raster-candidates/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
};
