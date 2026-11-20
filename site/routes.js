import {DRILLS} from '../src/drills.js';
import {GUIDE_MANUALS} from '../src/practiceGuideManuals.js';
import {guidePathFor,appTitleFor} from '../src/appPaths.js';
import {publicMessage} from './locales.js';

export const CANONICAL_ORIGIN='https://easydryfire.com';
export const PUBLIC_LOCALES=Object.freeze(['en','de','nl']);
const prefixPath=(path,locale)=>locale==='en'?path:`/${locale}${path==='/'?'/':path}`;
const manual=id=>{const guide=GUIDE_MANUALS.find(row=>row.id===id);return{id,path:guidePathFor(id),title:appTitleFor({view:'practiceGuide',guideId:id}),heading:DRILLS.find(drill=>id==='sequence-'+drill.id)?.title??guide.title,description:guide.purpose,guide,appView:'practiceGuide'};};
const sourceRoutes=[
 {id:'home',path:'/',appView:'home'},
 {id:'practice',path:'/practice-modes/'},
 manual('single'),
 manual('repeated'),
 manual('par'),
 manual('control'),
 manual('sequence-rack-trigger'),
 manual('sequence-mag-trigger'),
 manual('sequence-draw-mag-trigger'),
 {id:'sequence',path:'/sequence-drills-guide/'},
 {id:'calibration',path:'/trigger-click-calibration-guide/'},
 {id:'help',path:'/help/'},
 {id:'about',path:'/about/',appView:'about'},
 {id:'contact',path:'/contact/',appView:'contact'},
];

function translatedRoute(route,locale){
 const key=`routes.${route.id}`;
 const guide=route.guide?{
  ...route.guide,
  title:publicMessage(locale,'practice-guide',`manuals.${route.id}.title`),
  purpose:publicMessage(locale,'practice-guide',`manuals.${route.id}.purpose`),
  measures:publicMessage(locale,'practice-guide',`manuals.${route.id}.measures`),
  steps:publicMessage(locale,'practice-guide',`manuals.${route.id}.steps`).split('\n').filter(Boolean),
  expect:publicMessage(locale,'practice-guide',`manuals.${route.id}.expect`),
  requires:publicMessage(locale,'practice-guide',`manuals.${route.id}.requires`),
 }:undefined;
 return {
  ...route,
  path:prefixPath(route.path,locale),
  title:publicMessage(locale,'public-site',`${key}.title`),
  heading:publicMessage(locale,'public-site',`${key}.heading`),
  description:publicMessage(locale,'public-site',`${key}.description`),
  ...(guide?{guide}:{}),
  locale,
  // Localized canonical pages are standalone server-rendered content, so their
  // initial HTML contains the translated page even before app JavaScript runs.
  ...(locale==='en'?{}:{appView:undefined}),
 };
}

export const PUBLIC_ROUTES=sourceRoutes.map(route=>translatedRoute(route,'en'));
export const ALL_PUBLIC_ROUTES=PUBLIC_LOCALES.flatMap(locale=>sourceRoutes.map(route=>translatedRoute(route,locale)));
export const publicRoute=path=>ALL_PUBLIC_ROUTES.find(route=>route.path===path);
export const publicAssetPath=path=>path==='/'?'/index.html':`/site${path}index.html`;
export const sitemapXML=()=>{
 const alternates=sourceRoutes.map(route=>Object.fromEntries(PUBLIC_LOCALES.map(locale=>[locale,CANONICAL_ORIGIN+prefixPath(route.path,locale)])));
 const entries=sourceRoutes.flatMap((route,index)=>PUBLIC_LOCALES.map(locale=>{
  const path=prefixPath(route.path,locale),urls=alternates[index];
  const links=[...PUBLIC_LOCALES.map(language=>`    <xhtml:link rel="alternate" hreflang="${language}" href="${urls[language]}" />`),`    <xhtml:link rel="alternate" hreflang="x-default" href="${urls.en}" />`].join('\n');
  return `  <url>\n    <loc>${CANONICAL_ORIGIN}${path}</loc>\n${links}\n  </url>`;
 }));
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
};
export const robotsTXT=`User-agent: *\nAllow: /\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`;
