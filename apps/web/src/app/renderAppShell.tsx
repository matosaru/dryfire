import { renderToStaticMarkup } from 'react-dom/server';
import { AppShell } from '@dryfire/ui/AppShell';
import { GunSwitcher } from '@dryfire/ui/GunSwitcher';
import { SafetyDisclosure } from '@dryfire/ui/SafetyDisclosure';
import { SafetyDialog } from '@dryfire/ui/SafetyDialog';
import {LocalizationProvider,type AppLocale,type Catalog} from '../localization/runtime.ts';
import english from '../localization/generated/catalog.en.ts';
import german from '../localization/generated/catalog.de.ts';
import dutch from '../localization/generated/catalog.nl.ts';

const catalogs:Record<AppLocale,Catalog>={en:english,de:german,nl:dutch};
const labelsFor=(catalog:Catalog)=>{const text=(key:string)=>{const value=catalog.common[key];if(typeof value!=='string')throw new Error(`Missing shared shell message: ${key}`);return value;};return{
 header:{home:text('header.home'),about:text('header.about'),contact:text('header.contact'),settings:text('header.settings'),information:text('header.information'),beta:text('header.beta')},
 navigation:{home:text('navigation.home'),learn:text('navigation.learn'),drills:text('navigation.drills'),history:text('navigation.history')},
 navigationLabel:text('navigation.label'),
};};

/** Trusted page/footer slots preserve mounted native section/draft nodes.
 * Safety and gun-context behavior stay with their existing native owners. */
export function renderAppShell(locale:AppLocale='en') {
  const context = <>
    <SafetyDisclosure />
    <p id="appMessage" className="app-message hidden" role="alert" />
    <p className="startup-message" role="status">Opening your saved gun profiles…</p>
    <GunSwitcher />
  </>;
  const catalog=catalogs[locale];
  const html = renderToStaticMarkup(<LocalizationProvider value={{locale,catalog}}><AppShell labels={labelsFor(catalog)} safety={<SafetyDialog />} context={context} footerNotice="{{footerNotice}}">{'{{pages}}'}</AppShell></LocalizationProvider>);
  // Omit React's automatic image hints to retain the released request graph.
  return html.replace('<link rel="preload" as="image" href="/logo.svg"/>', '')
    .replace('<link rel="preload" as="image" href="/gun-types/unknown.svg"/>', '');
}
