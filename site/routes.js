import {GUIDE_MANUALS} from '../src/practiceGuideManuals.js';
export const CANONICAL_ORIGIN='https://easydryfire.com';
const manual=(id,path,title)=>({id,path,title,heading:GUIDE_MANUALS.find(row=>row.id===id).title,description:GUIDE_MANUALS.find(row=>row.id===id).purpose,guide:GUIDE_MANUALS.find(row=>row.id===id)});
export const PUBLIC_ROUTES=[
 {id:'home',path:'/',title:'Dry Fire With Ease — Free Dry-Fire Practice App',heading:'Dry-fire practice, made simple.',description:'Learn your trigger click, choose a dry-fire practice mode and review timed repetitions. A free, microphone-based Beta app with local browser storage.'},
 {id:'practice',path:'/practice/',title:'Dry-Fire Practice Modes — Dry Fire With Ease',heading:'Choose your practice.',description:'Compare Single trigger press, Repeated trigger press, Par-time practice and Trigger control. Learn what each mode measures before you begin.'},
 manual('single','/practice/single-trigger-press/','Single Trigger Press Practice — Dry Fire With Ease'),
 manual('repeated','/practice/repeated-trigger-press/','Repeated Trigger Press Practice — Dry Fire With Ease'),
 manual('par','/practice/par-time/','Par-Time Practice — Dry Fire With Ease'),
 manual('control','/practice/trigger-control/','Trigger Control Practice — Dry Fire With Ease'),
 {id:'sequence',path:'/guides/sequence-drills/',title:'Sequence Drills Guide — Dry Fire With Ease',heading:'Practice a sound sequence.',description:'Understand built-in sequence drills, the sounds they need and how the app times recognized events in order.'},
 {id:'calibration',path:'/guides/trigger-click-calibration/',title:'Trigger-Click Calibration — Dry Fire With Ease',heading:'Learn your trigger click.',description:'Calibrate microphone recognition for your selected gun, test separate trigger clicks and reduce confusion with reset and handling sounds.'},
 {id:'help',path:'/help/',title:'Help and Browser Setup — Dry Fire With Ease',heading:'Set up your practice.',description:'Get help with microphone permissions, Safari Home Screen installation, recognition, start beeps and local backup recovery.'},
 {id:'about',path:'/about/',title:'About — Dry Fire With Ease',heading:'About Dry Fire With Ease',description:'A Beta dry-fire sound trainer for timing recognized trigger clicks and sequences. Learn its current features, local storage and limitations.'},
 {id:'contact',path:'/contact/',title:'Contact — Dry Fire With Ease',heading:'Get in touch.',description:'Contact Dry Fire With Ease with feedback, suggestions or a bug report. Email easydryfire@gmail.com.'},
];
export const publicRoute=path=>PUBLIC_ROUTES.find(route=>route.path===path);
export const publicAssetPath=path=>`/site${path==='/'?'/':path}index.html`;
export function sitemapXML(){return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+PUBLIC_ROUTES.map(route=>`  <url><loc>${CANONICAL_ORIGIN}${route.path}</loc></url>`).join('\n')+'\n</urlset>\n';}
export const robotsTXT=`User-agent: *\nAllow: /\n\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`;
