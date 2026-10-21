/** Move only the trusted build-produced inert catalog nodes into their host.
 * Delegated handlers survive; no user/stored HTML is parsed at runtime. */
export function materializeStaticCatalog(host) {
  const source=host.firstElementChild;
  if(source?.tagName==='TEMPLATE') source.replaceWith(source.content);
}
