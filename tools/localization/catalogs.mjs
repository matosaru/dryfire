import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { parse } from 'yaml';

export const SUPPORTED_LOCALES = Object.freeze(['en', 'de', 'nl']);
export const PAGE_NAMESPACES = Object.freeze([
  'common', 'home', 'learn', 'sound-check', 'settings', 'drills', 'practice', 'sequence',
  'practice-guide', 'live-listen', 'history', 'guns', 'gun-setup', 'about', 'contact', 'help', 'public-site',
]);

const root = resolve(import.meta.dirname, '../../apps/web/src/localization');
const messagesDir = resolve(root, 'messages');
const generatedDir = resolve(root, 'generated');
const htmlTag = /<\/?[a-z][^>]*>/i;
const placeholder = /{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function flatten(value, prefix = '', output = new Map()) {
  if (!isRecord(value)) throw new TypeError(`Expected a message object at ${prefix || '<root>'}.`);
  for (const [key, child] of Object.entries(value)) {
    if (!key || key.includes('.') || key.trim() !== key) throw new TypeError(`Use nested YAML keys instead of dotted/trimmed key "${key}".`);
    const full = prefix ? `${prefix}.${key}` : key;
    if (isRecord(child)) {
      const values = Object.values(child);
      const pluralKeys = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
      if (values.length && values.every(item => typeof item === 'string') && Object.keys(child).every(category => pluralKeys.has(category))) output.set(full, child);
      else flatten(child, full, output);
    } else if (typeof child === 'string') output.set(full, child);
    else throw new TypeError(`Message "${full}" must contain plain text.`);
  }
  return output;
}

function variables(value) {
  const result = new Set();
  for (const text of typeof value === 'string' ? [value] : Object.values(value)) {
    for (const match of text.matchAll(placeholder)) result.add(match[1]);
    if (htmlTag.test(text)) throw new TypeError('Message values must be plain text, not HTML.');
  }
  return [...result].sort();
}

function validateMessage(namespace, key, value, locale) {
  const values = typeof value === 'string' ? null : value;
  if (values && (!Object.hasOwn(values, 'other') || Object.keys(values).some(category => !['zero', 'one', 'two', 'few', 'many', 'other'].includes(category)))) {
    throw new TypeError(`${namespace}.${key} (${locale}) has an invalid plural form; provide supported categories and "other".`);
  }
  const texts = values ? Object.values(values) : [value];
  if (texts.some(text => !text.trim())) throw new TypeError(`${namespace}.${key} (${locale}) contains empty message text.`);
  if (values && !variables(values).includes('count')) throw new TypeError(`${namespace}.${key} (${locale}) plural text must interpolate {{count}}.`);
}

export async function loadMessageCatalogs({ requireNonEmpty = false } = {}) {
  const filenames = await readdir(messagesDir);
  const catalogs = Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, {}]));
  const files = new Set(filenames);
  for (const namespace of PAGE_NAMESPACES) {
    const parsed = {};
    for (const locale of SUPPORTED_LOCALES) {
      const filename = `${namespace}.messages.${locale}.yaml`;
      if (!files.has(filename)) throw new Error(`Missing localization resource: ${filename}`);
      const source = await readFile(resolve(messagesDir, filename), 'utf8');
      let tree;
      try { tree = parse(source, { uniqueKeys: true, version: '1.2' }); }
      catch (error) { throw new Error(`${filename}: ${error.message}`, { cause: error }); }
      if (!isRecord(tree)) throw new TypeError(`${filename} must contain a YAML mapping.`);
      parsed[locale] = flatten(tree);
      if (requireNonEmpty && !parsed[locale].size) throw new Error(`${filename} has no messages; published locale namespaces must not be empty.`);
      catalogs[locale][namespace] = Object.fromEntries(parsed[locale]);
      for (const [key, value] of parsed[locale]) validateMessage(namespace, key, value, locale);
    }
    const englishKeys = [...parsed.en.keys()].sort();
    for (const locale of SUPPORTED_LOCALES.slice(1)) {
      const localeKeys = [...parsed[locale].keys()].sort();
      if (JSON.stringify(englishKeys) !== JSON.stringify(localeKeys)) {
        throw new Error(`${namespace} catalog keys differ for en and ${locale}: ${JSON.stringify({ missing: englishKeys.filter(key => !localeKeys.includes(key)), extra: localeKeys.filter(key => !englishKeys.includes(key)) })}`);
      }
      for (const key of englishKeys) {
        if (JSON.stringify(variables(parsed.en.get(key))) !== JSON.stringify(variables(parsed[locale].get(key)))) {
          throw new Error(`${namespace}.${key} interpolation parameters differ between en and ${locale}.`);
        }
      }
    }
  }
  const expected = new Set(PAGE_NAMESPACES.flatMap(namespace => SUPPORTED_LOCALES.map(locale => `${namespace}.messages.${locale}.yaml`)));
  const unexpected = filenames.filter(filename => !expected.has(basename(filename)));
  if (unexpected.length) throw new Error(`Unregistered localization resources: ${unexpected.join(', ')}`);
  return catalogs;
}

export async function compileMessageCatalogs({ write = true, requireNonEmpty = false } = {}) {
  const catalogs = await loadMessageCatalogs({ requireNonEmpty });
  if (write) await mkdir(generatedDir, { recursive: true });
  for (const locale of SUPPORTED_LOCALES) {
    const output = `// Generated from YAML by tools/localization/catalogs.mjs. Do not edit.\nconst catalog = ${JSON.stringify(catalogs[locale])} as const;\nexport default catalog;\n`;
    const filename=resolve(generatedDir, `catalog.${locale}.ts`);
    if(write) await writeFile(filename, output);
    else {
      let actual;
      try{actual=await readFile(filename,'utf8');}catch{throw new Error(`Generated ${locale} catalog is missing; run npm run localization:compile.`);}
      if(actual!==output)throw new Error(`Generated ${locale} catalog is stale; run npm run localization:compile.`);
    }
  }
  return catalogs;
}
