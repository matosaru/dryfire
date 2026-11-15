import { readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const environment = JSON.parse(readFileSync(new URL('../visual-tests/environment.json', import.meta.url)));
const args = process.argv.slice(2);
if (args.includes('--update-snapshots=all') && process.env.CI) throw new Error('CI cannot update reviewed baselines.');
const gitPointer = statSync(resolve('.git')).isFile();
const gitMetadata = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' });
const commonDir = gitMetadata.status === 0 ? gitMetadata.stdout.trim() : '';
const result = spawnSync('docker', ['run', '--rm', '--platform', environment.platform, '--shm-size=1g',
  '--user', `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
  '--mount', `type=bind,src=${resolve('.')},dst=/repo`, '--workdir', '/repo',
  ...(gitPointer && commonDir ? ['--mount', `type=bind,src=${commonDir},dst=${commonDir},readonly`] : []),
  ...(process.env.APP_EDITION ? ['-e', `APP_EDITION=${process.env.APP_EDITION}`] : []),
  ...(process.env.VISUAL_EDITION ? ['-e', `VISUAL_EDITION=${process.env.VISUAL_EDITION}`] : []),
  '-e', `VISUAL_IMAGE=${environment.image}`, environment.image, 'npx', '--no-install', 'playwright', 'test', ...args], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
