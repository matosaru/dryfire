import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';

globalThis.__APP_VERSION__ = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version;

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
}
