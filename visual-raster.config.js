// Temporary rendering investigation; these are candidates, never auto-accepted baselines.
import config from './playwright.config.js';
export default { ...config,
  projects: [{ name: 'chromium', use: { browserName: 'chromium', launchOptions: { args: ['--disable-gpu', '--disable-skia-runtime-opts', '--force-color-profile=srgb'] } } }],
  snapshotPathTemplate: '{testDir}/../visual-raster-candidates/{projectName}/{arg}{ext}',
  updateSnapshots: process.env.VISUAL_CANDIDATES_COMPARE === '1' ? 'none' : 'all',
};
