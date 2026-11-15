import {materializeStaticCatalog} from '../src/staticCatalog.js';
import {JSDOM} from 'jsdom';
import {DRILLS} from '../src/drills.js';
import {setupForGuide} from '../src/appPaths.js';
import {createPracticeGuideController} from '../src/practiceGuideController.js';
function deferInactiveViews(doc,activeView){
 const pageContent=doc.getElementById('pageContent');
 for(const view of [...pageContent.children].filter(node=>node.classList.contains('view')&&node.id!==activeView)){
  const template=doc.createElement('template');template.dataset.deferredAppView=view.id;view.before(template);template.content.append(view);
 }
}
/** Build-only activation of the same trusted app screens used at runtime. No capture/storage APIs. */
export function prerenderAppScreen(html,route){
 const dom=new JSDOM(html),doc=dom.window.document;
 try{
  const activeView=route.appView+'View';
  for(const view of doc.querySelectorAll('.view'))view.classList.toggle('hidden',view.id!==activeView);
  doc.body.dataset.view=route.appView;
  {
   const brand=doc.querySelector('.brand-name'),heading=doc.createElement(route.appView==='home'?'p':'h1');
   for(const attribute of [...brand.attributes])heading.setAttribute(attribute.name,attribute.value);
   heading.replaceChildren(...brand.childNodes);brand.replaceWith(heading);
  }
  if(route.appView==='about')materializeStaticCatalog(doc.getElementById('aboutView'));
  if(route.appView!=='home'){
   doc.getElementById('gunSwitcherBtn').classList.add('hidden');
   for(const row of doc.querySelectorAll('.gun-context'))row.classList.add('hidden');
  }
  if(route.guide){
   const setup=setupForGuide(route.id);
   const context={type:setup.view==='practice'?'practice':'sequence',mode:setup.mode,drill:DRILLS.find(drill=>drill.id===setup.preset),gunId:'public-guide',routeKey:`public:${route.id}`,publicEntry:true};
   createPracticeGuideController({document:doc,onBack:()=>{}}).open(context);
   const note=doc.createElement('noscript'),link=doc.createElement('a');link.href=`/guide-examples/${route.id}.gif`;link.textContent='View the silent animated example';note.append(link);doc.getElementById('practiceGuideView').append(note);
  }
  deferInactiveViews(doc,activeView);
  return dom.serialize();
 }finally{dom.window.close();}
}
