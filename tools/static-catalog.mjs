/** Only repository-owned typed catalog output may enter this build-only path. */
export function deferStaticCatalog(html) {
  if (!/^<div id="(?:practiceCatalog|calibrationCards)"/.test(html) || !html.endsWith('</div>')) throw new Error('Unknown static catalog root.');
  const start=html.indexOf('>')+1, end=html.lastIndexOf('</div>'), content=html.slice(start,end);
  if (/<\/?script\b/i.test(content)) throw new Error('Static catalogs cannot contain scripts.');
  const escaped=content.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
  return html.slice(0,start-1)+' data-catalog="'+escaped+'">'+html.slice(end);
}
