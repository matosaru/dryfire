import { compileMessageCatalogs } from './catalogs.mjs';

const checkOnly = process.argv.includes('--check');
const requireNonEmpty=process.argv.includes('--require-complete');
await compileMessageCatalogs({ write: !checkOnly,requireNonEmpty });
console.log(`Localization catalogs ${checkOnly ? 'checked' : 'compiled'} for en, de and nl${requireNonEmpty?' with complete namespace coverage':''}.`);
