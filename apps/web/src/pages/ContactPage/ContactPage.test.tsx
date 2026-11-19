/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { jest } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPage } from './index.ts';
import {loadLocale} from '../../localization/runtime.ts';

test('Contact exposes the approved mailto address and a working Back action', async () => {
  const back = jest.fn(); render(<ContactPage onBack={back} />);
  expect(screen.getByRole('region', { name: 'Get in touch' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'easydryfire@gmail.com' })).toHaveAttribute('href', 'mailto:easydryfire@gmail.com');
  expect(document.querySelector('form')).toBeNull();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Back' })); expect(back).toHaveBeenCalledTimes(1);
});

test('Contact copies the visible email and reports success',async()=>{
  const writeText=jest.fn(async(_text:string)=>{});
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}});
  render(<ContactPage/>);
  await userEvent.click(screen.getByRole('button',{name:'Copy email'}));
  expect(writeText).toHaveBeenCalledWith('easydryfire@gmail.com');
  expect(screen.getByRole('status')).toHaveTextContent('Email copied.');
});

test('Contact keeps the address selectable when clipboard access is unavailable',async()=>{
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});
  render(<ContactPage/>);
  await userEvent.click(screen.getByRole('button',{name:'Copy email'}));
  expect(screen.getByRole('status')).toHaveTextContent('Copy unavailable');
  expect(screen.getByRole('link',{name:'easydryfire@gmail.com'})).toBeVisible();
});

test('Contact labels and clipboard feedback follow Dutch',async()=>{
 await act(async()=>{await loadLocale('nl');});const writeText=jest.fn(async(_text:string)=>{});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}});render(<ContactPage/>);
 expect(screen.getByRole('heading',{name:'Contact'})).toBeVisible();
 await userEvent.click(screen.getByRole('button',{name:'E-mailadres kopiëren'}));
 expect(screen.getByRole('status')).toHaveTextContent('E-mailadres gekopieerd.');
 await act(async()=>{await loadLocale('en');});
});
