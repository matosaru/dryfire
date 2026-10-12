import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { edition } from './catalog.js';
export default async function metadata(config) {
  const env = JSON.parse(readFileSync('visual-tests/environment.json'));
  const build = JSON.parse(readFileSync('dist/edition.json'));
  if (build.edition !== edition) throw new Error('Visual-test edition does not match the built artifact.');
  const version = JSON.parse(readFileSync('node_modules/@playwright/test/package.json')).version;
  if (version !== env.playwrightVersion) throw new Error(`Expected Playwright ${env.playwrightVersion}, got ${version}`);
  if (process.env.CI && process.env.VISUAL_IMAGE !== env.image) throw new Error('CI rendering image differs from reviewed baselines.');
  const sources = ['index.html', 'src/styles.css', 'src/main.js', 'package-lock.json', 'visual-tests/fixtures/library.json'];
  let commit = process.env.GITHUB_SHA ?? null;
  if (!commit) { try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {} }
  const hashes = Object.fromEntries(sources.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
  const assets = readdirSync('dist', { recursive: true }).filter(path => !path.endsWith('/') && /\.(js|css|html)$/.test(path));
  const assetHashes = Object.fromEntries(assets.map(file => [file, createHash('sha256').update(readFileSync(`dist/${file}`)).digest('hex')]));
  const output = config.projects[0].outputDir;
  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, 'build-manifest.json'), JSON.stringify({ commit, edition, build, environment: env, platform: process.platform, architecture: process.arch, node: process.version, hashes, assetHashes }, null, 2) + '\n');
}
