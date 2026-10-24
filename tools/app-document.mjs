import {materializeStaticCatalog} from '../src/staticCatalog.js';
import {JSDOM} from 'jsdom';
import {DRILLS} from '../src/drills.js';
import {setupForGuide} from '../src/appPaths.js';
import {createPracticeGuideController} from '../src/practiceGuideController.js';
/** Build-only activation of the same trusted app screens used at runtime. No capture/storage APIs. */
export function prerenderAppScreen(html,route){
 if(route.appView==='home')return html;
 const dom=new JSDOM(html),doc=dom.window.document;
 try{
  for(const view of doc.querySelectorAll('.view'))view.classList.toggle('hidden',view.id!==route.appView+'View');
  doc.body.dataset.view=route.appView;
  if(route.appView==='about')materializeStaticCatalog(doc.getElementById('aboutView'));
  doc.getElementById('gunSwitcherBtn').classList.add('hidden');
  for(const row of doc.querySelectorAll('.gun-context'))row.classList.add('hidden');
  if(route.guide){
   const setup=setupForGuide(route.id);
   const context={type:setup.view==='practice'?'practice':'sequence',mode:setup.mode,drill:DRILLS.find(drill=>drill.id===setup.preset),gunId:'public-guide',routeKey:`public:${route.id}`,publicEntry:true};
   createPracticeGuideController({document:doc,onBack:()=>{}}).open(context);
   const note=doc.createElement('noscript'),link=doc.createElement('a');link.href=`/guide-examples/${route.id}.gif`;link.textContent='View the silent animated example';note.append(link);doc.getElementById('practiceGuideView').append(note);
  }
  return dom.serialize();
 }finally{dom.window.close();}
}
