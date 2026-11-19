import {createContext,createElement,useContext,useSyncExternalStore,type ReactNode} from 'react';
import {normalizeLocale as normalizeSupportedLocale} from '../../../../src/locales.js';
import fallbackEnglish from './generated/catalog.en.ts';

export type AppLocale='en'|'de'|'nl';
type Message=string|Record<string,string>;
export type Catalog=Record<string,Record<string,Message>>;
export type MessageParameters=Record<string,string|number>;
const loaders:Record<AppLocale,()=>Promise<{default:Catalog}>>={
 en:()=>Promise.resolve({default:fallbackEnglish}),
 de:()=>import('./generated/catalog.de.ts'),
 nl:()=>import('./generated/catalog.nl.ts'),
};
const listeners=new Set<()=>void>();
let locale:AppLocale='en';
let catalog:Catalog=fallbackEnglish;
let loading:Partial<Record<AppLocale,Promise<Catalog>>>={};
let generation=0;
const LocalizationContext=createContext<{locale:AppLocale;catalog:Catalog}|null>(null);
const subscribe=(listener:()=>void)=>{listeners.add(listener);return()=>listeners.delete(listener);};
const snapshot=()=>locale;
const publish=()=>listeners.forEach(listener=>listener());
export const normalizeLocale=(value:unknown):AppLocale=>normalizeSupportedLocale(value);

export async function loadLocale(value:unknown):Promise<AppLocale>{
 const next=normalizeLocale(value);
 const request=++generation;
 if(next!==locale||!Object.keys(catalog).length){
  const pending=loading[next]??=loaders[next]().then(module=>module.default);
  const loaded=await pending;delete loading[next];
  if(request===generation){catalog=loaded;locale=next;if(typeof document!=='undefined')document.documentElement.lang=next;publish();}
 }
 return locale;
}

function interpolate(value:string,parameters:MessageParameters,namespace:string,key:string):string{
 return value.replace(/{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g,(_whole,name:string)=>{
  if(!Object.hasOwn(parameters,name))throw new Error(`Missing localization parameter "${name}" for ${namespace}.${key}.`);
  return String(parameters[name]);
 });
}

export function translate(namespace:string,key:string,parameters:MessageParameters={}):string{
 return translated(catalog,locale,namespace,key,parameters);
}

export function translateWithLocale(messages:Catalog,active:AppLocale,namespace:string,key:string,parameters:MessageParameters={}):string{
 return translated(messages,active,namespace,key,parameters);
}

function translated(messages:Catalog,active:AppLocale,namespace:string,key:string,parameters:MessageParameters):string{
 const value=messages[namespace]?.[key];
 if(value===undefined)return `⟦${namespace}.${key}⟧`;
 let text=value;
 if(typeof text!=='string'){
  const count=parameters.count;
  const category=typeof count==='number'?new Intl.PluralRules(active).select(count):'other';
  text=text[category]??text.other;
 }
 return interpolate(text,parameters,namespace,key);
}

export function useLocaleMessages(namespace:string){
 const active=useSyncExternalStore(subscribe,snapshot,snapshot);
 const supplied=useContext(LocalizationContext);
 const selected=supplied?.locale??active,messages=supplied?.catalog??catalog;
 return {locale:selected,t:(key:string,parameters:MessageParameters={})=>translated(messages,selected,namespace,key,parameters)};
}

export function LocalizationProvider({value,children}:{value:{locale:AppLocale;catalog:Catalog};children:ReactNode}){
 return createElement(LocalizationContext.Provider,{value},children);
}

export function formatLocaleNumber(value:number,options?:Intl.NumberFormatOptions):string{return new Intl.NumberFormat(locale,options).format(value);}
export function formatLocaleDate(value:Date|number,options?:Intl.DateTimeFormatOptions):string{return new Intl.DateTimeFormat(locale,options).format(value);}
