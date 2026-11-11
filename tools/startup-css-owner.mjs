import { dirname, resolve, relative } from 'node:path';
import { externalStyleOwners, startupStyleOwners } from './style-sources.mjs';

const VIRTUAL_PREFIX = '\0dryfire-component-css-owner:';

/** Resolve owner imports to the already-emitted startup style entry. This keeps
 * lazy JS chunks from emitting a second copy of CSS required by native markup. */
export function componentCssOwnerPlugin(root = process.cwd()) {
  const owners = new Map([...Object.entries(startupStyleOwners), ...Object.entries(externalStyleOwners)].map(([owner, css]) => [
    resolve(root, owner), new Set((Array.isArray(css) ? css : [css]).map(path => resolve(root, path)))
  ]));
  return {
    name: 'dryfire-component-css-owner',
    enforce: 'pre',
    resolveId(source, importer) {
      const cleanImporter = importer?.split('?')[0], cleanSource = source.split('?')[0];
      if (!cleanImporter || !/\.[cm]?[jt]sx?$/.test(cleanImporter) || !cleanSource.endsWith('.css')) return null;
      const owner = resolve(cleanImporter), expected = owners.get(owner);
      if (!expected) return null;
      const requested = resolve(dirname(owner), cleanSource);
      return expected.has(requested)
        ? `${VIRTUAL_PREFIX}${relative(root, requested)}.js`
        : null;
    },
    load(id) {
      return id.startsWith(VIRTUAL_PREFIX) ? 'export {};\n' : null;
    }
  };
}
