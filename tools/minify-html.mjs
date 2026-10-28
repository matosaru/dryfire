import { minify } from 'html-minifier-terser';
import { parseFragment, serializeOuter } from 'parse5';

/** Build-only syntax compression. Keep the asset-bearing head intact; normal layout
 * whitespace compacts while native values, SVG and preformatted/raw text stay intact. */
export async function minifyProductionHtml(html) {
  const body = html.match(/(<body\b[^>]*>)([\s\S]*)(<\/body\s*>)/i);
  const options = { removeAttributeQuotes: true, removeOptionalTags: true, collapseBooleanAttributes: true, caseSensitive: true,
    keepClosingSlash: true, collapseWhitespace: true, conservativeCollapse: true, removeComments: false,
    ignoreCustomFragments: [/\bclass="[^"]*"/, /\bid="previewTestMode"/] };
  if (!body) return minify(html, options);
  const start = body.index + body[1].length;
  return html.slice(0, start) + await minify(body[2], options) + html.slice(start + body[2].length);
}

/** Fetch critical CSS early without moving blocking styles ahead of the module.
 * Cached WebKit styles can otherwise delay module discovery. Preserve the actual
 * stylesheet order and request attributes; hints do not change the cascade. */
export function prioritizeAppStyles(html) {
  return html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, head => {
    if (!/<script\b[^>]*\btype=["']module["']/i.test(head)) return head;
    const stylesheet = /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/gi;
    const styles = head.match(stylesheet);
    if (!styles?.length) return head;
    const attribute = (node, name) => node.attrs.find(row => row.name === name)?.value;
    const requestKey = node => JSON.stringify(['href', 'crossorigin', 'integrity', 'referrerpolicy', 'media'].map(name => attribute(node, name) ?? null));
    const existing = new Set((head.match(/<link\b[^>]*>/gi) || []).map(tag => parseFragment(tag).childNodes[0])
      .filter(node => attribute(node, 'rel') === 'preload' && attribute(node, 'as') === 'style').map(requestKey));
    const hints = [];
    for (const tag of styles) {
      const node = parseFragment(tag).childNodes[0];
      const key = requestKey(node);
      if (existing.has(key)) continue;
      existing.add(key);
      node.attrs = node.attrs.filter(row => ['rel', 'href', 'crossorigin', 'integrity', 'referrerpolicy', 'media', 'type', 'fetchpriority'].includes(row.name));
      node.attrs.find(row => row.name === 'rel').value = 'preload';
      node.attrs.push({name: 'as', value: 'style'});
      hints.push(serializeOuter(node));
    }
    if (!hints.length) return head;
    const anchor = /<meta\b[^>]*\bname=["']viewport["'][^>]*>/i;
    return anchor.test(head)
      ? head.replace(anchor, tag => tag + '\n' + hints.join('\n'))
      : head.replace(/<head\b[^>]*>/i, tag => tag + '\n' + hints.join('\n'));
  });
}
