/** Restore the inactive screens stored as inert templates in public HTML. */
export function restoreDeferredAppViews(root=document){
 const templates=[...root.querySelectorAll('template[data-deferred-app-view]')];
 for(const template of templates){
  const view=template.content.firstElementChild;
  if(!view?.classList.contains('view')||view.id!==template.dataset.deferredAppView){
   throw new Error(`Invalid deferred app view template: ${template.dataset.deferredAppView||'(missing id)'}`);
  }
  template.replaceWith(template.content);
 }
 return templates.length;
}
