import {localizedNoScriptFallback,renderNotFoundHTML} from '../site/fallbacks.js';
import {prerenderAppScreen} from '../tools/app-document.mjs';

test.each([
 ['en','Enable JavaScript to use the trainer. Visit','About','Help','for features and instructions.','Page not found'],
 ['de','Aktiviere JavaScript, um den Trainer zu verwenden. Besuche','Über uns','Hilfe','für Funktionen und Anleitungen.','Seite nicht gefunden'],
 ['nl','Schakel JavaScript in om de trainer te gebruiken. Bezoek','Over de app','Hulp','voor functies en instructies.','Pagina niet gevonden'],
])('%s no-script and 404 fallbacks use localized catalog copy', (locale,intro,about,help,ending,notFound)=>{
 const noScript=localizedNoScriptFallback(locale);
 expect(noScript).toContain(intro);
 expect(noScript).toContain(`>${about}</a>`);
 expect(noScript).toContain(`>${help}</a>`);
 expect(noScript).toContain(ending);
 expect(noScript).toContain(`href="/${locale==='en'?'':`${locale}/`}about/"`);
 expect(noScript).toContain(`href="/${locale==='en'?'':`${locale}/`}help/"`);

 const html=renderNotFoundHTML(locale);
 expect(html).toContain(`<html lang="${locale}">`);
 expect(html).toContain('<meta name="robots" content="noindex">');
 expect(html).toContain(`<h1>${notFound}</h1>`);
 expect(html).toContain(`<title>${notFound} — Dry Fire With Ease</title>`);
 expect(html).toContain(`>${locale==='en'?'Open app':locale==='de'?'App öffnen':'App openen'}</a>`);
});

test('the built app document replaces its no-script placeholder with catalog text',()=>{
 const document='<!doctype html><html><body><noscript data-localized-fallback></noscript></body></html>';
 const output=prerenderAppScreen(document,{locale:'en',appView:'home'});
 expect(output).toContain('<noscript>Enable JavaScript to use the trainer. Visit');
 expect(output).toContain('href="/about/">About</a>');
 expect(output).toContain('href="/help/">Help</a>');
 expect(output).not.toContain('data-localized-fallback');
});
