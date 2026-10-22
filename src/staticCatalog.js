/** Expand only repository-owned build output on entry to its hidden page.
 * This is never stored/user HTML; typed renderers escape all interpolated text. */
export function materializeStaticCatalog(host) {
  const source=host.firstElementChild;
  if(source?.tagName==='SCRIPT' && source.type==='text/plain') {
    const template=host.ownerDocument.createElement('template');
    template.innerHTML=source.textContent;
    source.replaceWith(template.content);
  }
}
