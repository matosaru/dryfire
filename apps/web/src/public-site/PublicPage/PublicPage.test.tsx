/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';import{render,cleanup}from'@testing-library/react';import{PublicPage,type PublicRoute}from'./PublicPage';
// @ts-expect-error Build-only JS route registry.
import{PUBLIC_ROUTES}from'../../../../../site/routes.js';
afterEach(cleanup);
test.each(PUBLIC_ROUTES as PublicRoute[])('public $id has semantic initial content and real navigation without personal context',(route)=>{const v=render(<PublicPage route={route} routes={PUBLIC_ROUTES}/>);expect(v.getByRole('heading',{level:1})).toHaveTextContent(route.heading);expect(v.container.querySelectorAll('h1')).toHaveLength(1);expect(v.container.querySelector('.gun-switcher')).toBeNull();expect(v.getByRole('navigation',{name:'Main navigation'}).querySelectorAll('a')).toHaveLength(5);expect(v.getByRole('link',{name:'Open settings'})).toHaveAttribute('href','/app/settings/');expect(v.container.querySelector('script')).toBeNull();});
