import { dirname, resolve, relative } from 'node:path';
import { startupStyleOwners } from './style-sources.mjs';

const VIRTUAL_PREFIX = '\0dryfire-startup-css-owner:';

/** Resolve owner imports to the already-emitted startup style entry. This keeps
 * lazy JS chunks from emitting a second copy of CSS required by native markup. */
export function startupCssOwnerPlugin(root = process.cwd()) {
  const owners = new Map(Object.entries(startupStyleOwners).map(([owner, css]) => [
    resolve(root, owner), resolve(root, css)
  ]));
  return {
    name: 'dryfire-startup-css-owner',
    enforce: 'pre',
    resolveId(source, importer) {
      const cleanImporter = importer?.split('?')[0], cleanSource = source.split('?')[0];
      if (!cleanImporter || !/\.[cm]?[jt]sx?$/.test(cleanImporter) || !cleanSource.endsWith('.css')) return null;
      const owner = resolve(cleanImporter), expected = owners.get(owner);
      if (!expected) return null;
      const requested = resolve(dirname(owner), cleanSource);
      return requested === expected
        ? `${VIRTUAL_PREFIX}${relative(root, expected)}.js`
        : null;
    },
    load(id) {
      return id.startsWith(VIRTUAL_PREFIX) ? 'export {};\n' : null;
    }
  };
}
