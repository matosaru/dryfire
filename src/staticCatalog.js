/** Materialize only the trusted build-produced catalog data block. Host-level
 * delegated handlers survive; no user/stored HTML enters this function. */
export function materializeStaticCatalog(host) {
  const source=host.firstElementChild;
  if(source?.type==='text/html') host.innerHTML=source.textContent;
}
