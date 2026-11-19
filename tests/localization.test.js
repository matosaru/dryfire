import {loadMessageCatalogs,compileMessageCatalogs} from '../tools/localization/catalogs.mjs';
import {loadLocale,normalizeLocale,translateWithLocale,formatLocaleNumber} from '../apps/web/src/localization/runtime.ts';

test('all registered YAML catalogs parse with matching keys and interpolation contracts',async()=>{
 const catalogs=await loadMessageCatalogs();
 expect(Object.keys(catalogs).sort()).toEqual(['de','en','nl']);
 for(const locale of ['en','de','nl'])expect(Object.keys(catalogs[locale]).length).toBeGreaterThanOrEqual(17);
});

test('the generated catalogs are reproducible from source YAML',async()=>{
 await expect(compileMessageCatalogs({write:false})).resolves.toBeDefined();
});

test('locale normalization defaults safely to English and preserves supported languages',()=>{
 expect(normalizeLocale('de')).toBe('de');expect(normalizeLocale('nl')).toBe('nl');expect(normalizeLocale('fr')).toBe('en');expect(normalizeLocale(null)).toBe('en');
});

test('plain text interpolation and plural selection use the selected locale',async()=>{
 const catalogs=await loadMessageCatalogs();
 expect(translateWithLocale(catalogs.en,'en','common','result.repetitions',{count:1})).toBe('1 repetition complete');
 expect(translateWithLocale(catalogs.en,'en','common','result.repetitions',{count:3})).toBe('3 repetitions complete');
 expect(translateWithLocale(catalogs.de,'de','common','result.repetitions',{count:2})).toBe('2 Wiederholungen abgeschlossen');
 expect(()=>translateWithLocale(catalogs.nl,'nl','common','result.repetitions')).toThrow(/Missing localization parameter/);
 expect(translateWithLocale(catalogs.en,'en','common','missing.key')).toBe('⟦common.missing.key⟧');
 await loadLocale('de');expect(formatLocaleNumber(1234.5)).toBe('1.234,5');await loadLocale('en');
});
