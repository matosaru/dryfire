import { minify } from 'html-minifier-terser';

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
