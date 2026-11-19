/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';import{render,cleanup}from'@testing-library/react';import{PublicPage,type PublicRoute}from'./PublicPage';import{loadLocale}from'../../localization/runtime.ts';
// @ts-expect-error Build-only JS route registry.
import{PUBLIC_ROUTES}from'../../../../../site/routes.js';
afterEach(async()=>{cleanup();await loadLocale('en');});
test.each(PUBLIC_ROUTES as PublicRoute[])('public $id has semantic initial content and real navigation without personal context',(route)=>{const v=render(<PublicPage route={route} routes={PUBLIC_ROUTES}/>);expect(v.getByRole('heading',{level:1})).toHaveTextContent(route.heading);expect(v.container.querySelectorAll('h1')).toHaveLength(1);expect(v.container.querySelector('.gun-switcher')).toBeNull();expect(v.getByRole('navigation',{name:'Main navigation'}).querySelectorAll('a')).toHaveLength(4);expect(v.getByRole('link',{name:'Settings'})).toHaveAttribute('href','/settings/');expect(v.container.querySelector('script')).toBeNull();});
test.each([['de','Mikrofon und Erkennung','Kalibrierungsanleitung lesen','Klangtest'],['nl','Microfoon en herkenning','Kalibratiehandleiding lezen','Geluidstest']])('public Help content follows the %s locale',async(locale,microphone,guide,check)=>{await loadLocale(locale);const route=(PUBLIC_ROUTES as PublicRoute[]).find(row=>row.id==='help')!;const v=render(<PublicPage route={route} routes={PUBLIC_ROUTES as PublicRoute[]}/>);expect(v.getByRole('heading',{name:microphone})).toBeVisible();expect(v.getByRole('link',{name:guide})).toBeVisible();expect(v.getByRole('heading',{name:check})).toBeVisible();expect(v.getByRole('heading',{name:locale==='de'?'Sicherungskopie behalten':'Bewaar een reservekopie'})).toBeVisible();});
