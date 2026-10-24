import { readFileSync } from 'node:fs';
import { resolve, relative, dirname, extname, isAbsolute } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { SourceTextModule } from 'node:vm';

export function measureArtifact(directory) {
  const root = resolve(directory), metadata = JSON.parse(readFileSync(resolve(root, 'edition.json')));
  const html = readFileSync(resolve(root,'index.html'),'utf8');
  const owned = path => {
    const full = resolve(root,path.replace(/^\//,''));
    if (relative(root,full).startsWith('..') || isAbsolute(relative(root,full))) throw new Error(`Asset escapes artifact: ${path}`);
    return full;
  };
  const totals = paths => {
    let raw = 0, gzip = 0;
    for (const path of paths) { const bytes = readFileSync(owned(path)); raw += bytes.length; gzip += gzipSync(bytes).length; }
    return { raw, gzip, files: [...paths].sort() };
  };
  const scripts = new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match=>match[1]));
  for(const match of html.matchAll(/<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+)"/g)) scripts.add(match[1]);
  const styles = new Set([...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)].map(match=>match[1]));
  for (const path of scripts) {
    const code = readFileSync(owned(path),'utf8');
    // Parse, never execute, optimized modules. Include static transitive imports
    // so splitting a mandatory entry chunk cannot evade the transfer budget.
    for (const dependency of new SourceTextModule(code).dependencySpecifiers) {
      if (!dependency.startsWith('./') && !dependency.startsWith('../') && !dependency.startsWith('/')) throw new Error(`External critical dependency: ${dependency}`);
      const target = dependency.startsWith('/') ? dependency : '/'+relative(root,resolve(dirname(owned(path)),dependency));
      if (extname(target) === '.css') styles.add(target); else scripts.add(target);
    }
  }
  if (!scripts.size || !styles.size) throw new Error('Missing critical scripts or stylesheet.');
  const assets = [...new Set([...metadata.assets, ...scripts, ...styles])];
  const hashes = Object.fromEntries(['index.html', ...assets].sort().map(path=>[path,createHash('sha256').update(readFileSync(owned(path))).digest('hex')]));
  return { version: 1, edition: metadata.edition, sourceRevision: metadata.sourceRevision,
    critical: { js: totals(scripts), css: totals(styles), html: totals(['index.html']) },
    total: { js: totals(assets.filter(path=>path.endsWith('.js'))), css: totals(assets.filter(path=>path.endsWith('.css'))), html: totals(['index.html']) }, hashes };
}

export function payloadViolations(actual, baseline) {
  if (actual.edition !== baseline.edition) return ['Artifact editions do not match.'];
  const errors = [];
  for (const kind of ['js','css']) for (const encoding of ['raw','gzip']) {
    if (actual.critical[kind][encoding] > baseline.critical[kind][encoding]) errors.push(`Critical ${kind} ${encoding}: ${actual.critical[kind][encoding]} exceeds ${baseline.critical[kind][encoding]}.`);
  }
  return errors;
}
