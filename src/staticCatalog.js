/** Expand only trusted compiler-escaped catalog payloads, never stored/user HTML.
 * The host and delegated actions survive; consumed payloads cannot run twice. */
export function materializeStaticCatalog(host) {
  const markup=host.dataset.catalog;
  if(markup!==undefined) {
    delete host.dataset.catalog;
    host.innerHTML=markup;
  }
}
