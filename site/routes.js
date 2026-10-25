import {DRILLS} from '../src/drills.js';
import {GUIDE_MANUALS} from '../src/practiceGuideManuals.js';
import {guidePathFor,appTitleFor} from '../src/appPaths.js';
export const CANONICAL_ORIGIN='https://easydryfire.com';
const manual=id=>{const guide=GUIDE_MANUALS.find(row=>row.id===id);return{id,path:guidePathFor(id),title:appTitleFor({view:'practiceGuide',guideId:id}),heading:DRILLS.find(drill=>id==='sequence-'+drill.id)?.title??guide.title,description:guide.purpose,guide,appView:'practiceGuide'};};
export const PUBLIC_ROUTES=[
 {id:'home',path:'/',appView:'home',title:'Dry Fire With Ease — Free Dry-Fire Practice App',heading:'Dry Fire With Ease',description:'Learn your trigger click, choose a dry-fire practice mode and review timed repetitions. A free, microphone-based Beta app with local browser storage.'},
 {id:'practice',path:'/practice-modes/',title:'Dry-Fire Practice Modes — Dry Fire With Ease',heading:'Choose your practice.',description:'Compare Single trigger press, Repeated trigger press, Par-time practice and Trigger control. Learn what each mode measures before you begin.'},
 manual('single'),
 manual('repeated'),
 manual('par'),
 manual('control'),
 manual('sequence-rack-trigger'),
 manual('sequence-mag-trigger'),
 manual('sequence-draw-mag-trigger'),
 {id:'sequence',path:'/sequence-drills-guide/',title:'Sequence Drills Guide — Dry Fire With Ease',heading:'Practice a sound sequence.',description:'Understand built-in sequence drills, the sounds they need and how the app times recognized events in order.'},
 {id:'calibration',path:'/trigger-click-calibration-guide/',title:'Trigger-Click Calibration — Dry Fire With Ease',heading:'Learn your trigger click.',description:'Calibrate microphone recognition for your selected gun, test separate trigger clicks and reduce confusion with reset and handling sounds.'},
 {id:'help',path:'/help/',title:'Help and Browser Setup — Dry Fire With Ease',heading:'Set up your practice.',description:'Get help with microphone permissions, Safari Home Screen installation, recognition, start beeps and local backup recovery.'},
 {id:'about',path:'/about/',appView:'about',title:'About — Dry Fire With Ease',heading:'About',description:'Dry Fire With Ease is a Beta sound trainer for trigger-click practice and timed sequences. Learn how it works, explore the four practice modes and send feedback.'},
 {id:'contact',path:'/contact/',appView:'contact',title:'Contact — Dry Fire With Ease',heading:'Contact',description:'Contact Dry Fire With Ease with feedback, suggestions or a bug report. Email easydryfire@gmail.com.'},
];
export const publicRoute=path=>PUBLIC_ROUTES.find(route=>route.path===path);
export const publicAssetPath=path=>path==='/'?'/index.html':`/site${path}index.html`;
export const sitemapXML=()=>`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_ROUTES.map(route=>`  <url><loc>${CANONICAL_ORIGIN}${route.path}</loc></url>`).join('\n')}\n</urlset>\n`;
export const robotsTXT=`User-agent: *\nAllow: /\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`;
