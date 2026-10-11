import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const environment = JSON.parse(readFileSync(new URL('../visual-tests/environment.json', import.meta.url)));
const args = process.argv.slice(2);
if (args.includes('--update-snapshots=all') && process.env.CI) throw new Error('CI cannot update reviewed baselines.');
const result = spawnSync('docker', ['run', '--rm', '--platform', environment.platform, '--shm-size=1g',
  '--user', `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
  '--mount', `type=bind,src=${resolve('.')},dst=/repo`, '--workdir', '/repo',
  '-e', `VISUAL_IMAGE=${environment.image}`, environment.image, 'npx', '--no-install', 'playwright', 'test', ...args], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
