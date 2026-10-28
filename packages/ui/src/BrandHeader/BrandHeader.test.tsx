/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandHeader } from './BrandHeader.tsx';

test('branding, beta disclosure, live status and settings retain their native semantics', async () => {
  const onSettings = jest.fn();
  const { rerender } = render(<BrandHeader onNavigate={onSettings} />);
  expect(screen.getByRole('heading', { name: 'Dry Fire With Ease', level: 1 })).toHaveTextContent('DRY FIREWITH EASE');
  expect(screen.getByLabelText('Beta version')).toHaveTextContent('BETA');
  expect(document.querySelector('.brand-logo')).toHaveAttribute('alt', '');
  expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  const settings = screen.getByRole('button', { name: 'Settings' });
  expect(settings).not.toHaveAttribute('aria-current');
  await userEvent.setup().click(settings); settings.focus();
  expect(onSettings).toHaveBeenCalledTimes(1);
  rerender(<BrandHeader view="settings" status="Microphone connected" onNavigate={onSettings} />);
  expect(settings).toHaveAttribute('aria-current', 'page');
  expect(settings).toHaveClass('active');
  expect(settings).toHaveFocus();
  expect(screen.getByRole('status')).toHaveTextContent('Microphone connected');
  rerender(<BrandHeader view="about" status="Ready" onNavigate={onSettings} />);
  expect(settings).not.toHaveAttribute('aria-current');
  expect(settings).not.toHaveClass('active');
});


test('header information links share named decorative icons and real destinations', async () => {
  const onNavigate=jest.fn();
  const {container,rerender}=render(<BrandHeader onNavigate={onNavigate}/>);
  const links=[screen.getByRole('link',{name:'About'}),screen.getByRole('link',{name:'Contact'}),screen.getByRole('button',{name:'Settings'})];
  expect(links.map(link=>link.getAttribute('aria-label'))).toEqual(['About','Contact','Settings']);
  expect(links.map(link=>link.getAttribute('href'))).toEqual(['/about/','/contact/',null]);expect(links[2]).toHaveAttribute('type','button');
  expect([...container.querySelectorAll('.header-link')].map(link=>link.getAttribute('data-icon'))).toEqual(['about','contact','settings']);
  expect(container.querySelectorAll('.header-link svg,.header-tooltip')).toHaveLength(0);
  await userEvent.setup().click(links[0]);expect(onNavigate).toHaveBeenCalledWith('about');
  rerender(<BrandHeader view="contact" onNavigate={onNavigate}/>);
  expect(links[1]).toHaveAttribute('aria-current','page');expect(links[0]).not.toHaveAttribute('aria-current');
});

test('header keyboard navigation and modified links retain native behavior',async()=>{
 const navigate=jest.fn(),user=userEvent.setup();
 render(<BrandHeader onNavigate={navigate} links={{about:'/about/?source=header',contact:'/contact/',settings:'/settings/'}}/>);
 const about=screen.getByRole('link',{name:'About'}),contact=screen.getByRole('link',{name:'Contact'});
 await user.tab();expect(screen.getByRole('link',{name:'Home — Dry Fire With Ease'})).toHaveFocus();
 await user.tab();expect(about).toHaveFocus();
 await user.tab();expect(contact).toHaveFocus();
 for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]){
  const event=new MouseEvent('click',{bubbles:true,cancelable:true,...options});about.dispatchEvent(event);expect(event.defaultPrevented).toBe(false);
 }
 expect(navigate).not.toHaveBeenCalled();expect(about).toHaveAttribute('href','/about/?source=header');
 await user.keyboard('{Enter}');expect(navigate).toHaveBeenCalledWith('contact');
});

test('the complete brand is an accessible Home link with normal modified-click behavior',async()=>{
 const navigate=jest.fn(),user=userEvent.setup();
 const {rerender}=render(<BrandHeader view="contact" onNavigate={navigate}/>);
 const home=screen.getByRole('link',{name:'Home — Dry Fire With Ease'});
 expect(home).toHaveAttribute('href','/');expect(home).not.toHaveAttribute('aria-current');
 expect(home).toContainElement(document.querySelector('.brand-logo') as HTMLElement);
 expect(home).toContainElement(screen.getByRole('heading',{name:'Dry Fire With Ease'}));
 await user.click(home);expect(navigate).toHaveBeenLastCalledWith('home');
 navigate.mockClear();
 for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]){
  const event=new MouseEvent('click',{bubbles:true,cancelable:true,...options});home.dispatchEvent(event);expect(event.defaultPrevented).toBe(false);
 }
 expect(navigate).not.toHaveBeenCalled();
 rerender(<BrandHeader view="home" links={{home:'/',about:'/about/',contact:'/contact/',settings:'/settings/'}}/>);
 expect(home).toHaveAttribute('aria-current','page');
 const nativeClick=new MouseEvent('click',{bubbles:true,cancelable:true});home.dispatchEvent(nativeClick);expect(nativeClick.defaultPrevented).toBe(false);
});
