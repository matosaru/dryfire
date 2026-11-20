/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {act,fireEvent,render,screen} from '@testing-library/react';
import {loadLocale} from '../apps/web/src/localization/runtime.ts';
import {EmailContact} from '../apps/web/src/pages/ContactPage/EmailContact.tsx';

afterEach(async()=>{await act(async()=>{await loadLocale('en');});});

test('contact copy action and feedback use the selected German locale',async()=>{
 await act(async()=>{await loadLocale('de');});
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:jest.fn().mockResolvedValue(undefined)}});
 render(<EmailContact/>);
 expect(screen.getByRole('button',{name:'E-Mail kopieren'})).toBeInTheDocument();
 await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'E-Mail kopieren'}));});
 expect(screen.getByRole('status')).toHaveTextContent('E-Mail kopiert.');
});

test('contact copy fallback uses the selected Dutch locale and includes the address',async()=>{
 await act(async()=>{await loadLocale('nl');});
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:jest.fn().mockRejectedValue(new Error('denied'))}});
 render(<EmailContact/>);
 expect(screen.getByRole('button',{name:'E-mailadres kopiëren'})).toBeInTheDocument();
 await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'E-mailadres kopiëren'}));});
 expect(screen.getByRole('status')).toHaveTextContent('Kopiëren is niet beschikbaar. Selecteer het adres hierboven: easydryfire@gmail.com');
});
