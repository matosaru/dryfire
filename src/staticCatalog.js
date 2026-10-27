/** Materialize only build-owned inert content; never parse user/stored HTML. */
export function materializeStaticCatalog(host) {
 const source=host.firstElementChild;
 if(source?.tagName==='TEMPLATE') {source.replaceWith(source.content);return;}
 if(source?.tagName!=='SCRIPT'||source.getAttribute('data-static-page')!=='about'||source.getAttribute('type')!=='application/json')return;
 const doc=host.ownerDocument;
 const create=node=>{
  if(typeof node==='string')return doc.createTextNode(node);
  if(!Array.isArray(node)||node.length!==3)throw Error('Invalid static page');
  const [tag,attrs,children]=node;
  if(!/^(link|div|button|h[1-6]|img|p|br|section|ol|ul|li|a|strong|span|em)$/.test(tag)||!Array.isArray(attrs)||!Array.isArray(children))throw Error('Invalid static page');
  const element=doc.createElement(tag);
  for(const pair of attrs){
   if(!Array.isArray(pair)||pair.length!==2)throw Error('Invalid static attribute');
   const [name,value]=pair;
   if(typeof value!=='string'||!/^(rel|as|class|type|id|src|width|height|alt|href|aria-[a-z-]+|data-[a-z-]+)$/.test(name)||((name==='href'||name==='src')&&!/^\/(?!\/)|^#/.test(value)))throw Error('Invalid static attribute');
   element.setAttribute(name,value);
  }
  if(tag==='link'&&(element.getAttribute('rel')!=='preload'||element.getAttribute('as')!=='image'))throw Error('Invalid static resource');
  element.append(...children.map(create));return element;
 };
 const tree=JSON.parse(source.textContent);
 if(!Array.isArray(tree))throw Error('Invalid static page');
 const fragment=doc.createDocumentFragment();fragment.append(...tree.map(create));source.replaceWith(fragment);
}
