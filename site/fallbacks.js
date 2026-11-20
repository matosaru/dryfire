import {publicMessage} from './locales.js';

const escapeHTML=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export function localizedNoScriptFallback(locale='en'){
 const message=key=>escapeHTML(publicMessage(locale,'public-site',`fallback.noScript.${key}`));
 return `${message('intro')} <a href="/${locale==='en'?'':`${locale}/`}about/">${message('about')}</a> ${message('connector')} <a href="/${locale==='en'?'':`${locale}/`}help/">${message('help')}</a> ${message('ending')}`;
}

export function renderNotFoundHTML(locale='en'){
 const message=key=>escapeHTML(publicMessage(locale,'public-site',`fallback.notFound.${key}`));
 return `<!doctype html><html lang="${escapeHTML(locale)}"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>${message('title')}</title></head><body><main><h1>${message('heading')}</h1><p><a href="/${locale==='en'?'':`${locale}/`}">${message('home')}</a> · <a href="/${locale==='en'?'':`${locale}/`}">${message('openApp')}</a></p></main></body></html>`;
}
