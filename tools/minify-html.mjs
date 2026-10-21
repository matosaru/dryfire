import { minify } from 'html-minifier-terser';

/** Build-only syntax compression. Keep the asset-bearing head intact; body
 * text, SVG case, structure and raw script/style content retain their values. */
export async function minifyProductionHtml(html) {
  const body = html.match(/(<body\b[^>]*>)([\s\S]*)(<\/body\s*>)/i);
  const options = { removeAttributeQuotes: true, caseSensitive: true,
    keepClosingSlash: true, collapseWhitespace: false, removeComments: false,
    ignoreCustomFragments: [/\bclass="[^"]*"/, /\bid="previewTestMode"/] };
  if (!body) return minify(html, options);
  const start = body.index + body[1].length;
  return html.slice(0, start) + await minify(body[2], options) + html.slice(start + body[2].length);
}
