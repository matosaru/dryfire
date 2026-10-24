/** Move only trusted build-produced inert nodes; no stored/user HTML is parsed.
 * The host and delegated actions survive; consumed templates cannot run twice. */
export function materializeStaticCatalog(host) {
  const source=host.firstElementChild;
  if(source?.tagName==='TEMPLATE') source.replaceWith(source.content);
}
