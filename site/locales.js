import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';

const directory=fileURLToPath(new URL('../apps/web/src/localization/messages/',import.meta.url));
const namespaces=['common','home','learn','sound-check','settings','drills','practice','sequence','practice-guide','live-listen','history','guns','gun-setup','about','contact','help','public-site'];
const cache=new Map();

function flatten(tree,prefix='',output={}){
 for(const [key,value] of Object.entries(tree??{})){
  const name=prefix?`${prefix}.${key}`:key;
  if(value&&typeof value==='object'&&!Array.isArray(value)){
   const categories=new Set(['zero','one','two','few','many','other']);
   const entries=Object.entries(value);
   if(entries.length&&entries.every(([category,text])=>categories.has(category)&&typeof text==='string'))output[name]=value;
   else flatten(value,name,output);
  }
  else if(typeof value==='string')output[name]=value;
 }
 return output;
}

/** Build-only catalog access for prerendering public SEO documents. */
export function publicLocaleCatalog(locale='en'){
 if(!['en','de','nl'].includes(locale))throw new TypeError(`Unsupported public locale: ${locale}`);
 if(cache.has(locale))return cache.get(locale);
 const catalog={};
 for(const namespace of namespaces){
  const filename=`${directory}${namespace}.messages.${locale}.yaml`;
  catalog[namespace]=flatten(parse(readFileSync(filename,'utf8'),{uniqueKeys:true,version:'1.2'}));
 }
 cache.set(locale,catalog);
 return catalog;
}

export function publicMessage(locale,namespace,key){
 const value=publicLocaleCatalog(locale)[namespace]?.[key];
 if(typeof value!=='string')throw new Error(`Missing public ${locale} message ${namespace}.${key}.`);
 return value;
}
