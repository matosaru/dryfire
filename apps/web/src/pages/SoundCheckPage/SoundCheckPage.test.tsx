/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,screen,cleanup,act} from '@testing-library/react';
import {SoundCheckPage} from './SoundCheckPage.tsx';
import {loadLocale} from '../../localization/runtime.ts';
afterEach(async()=>{cleanup();await act(async()=>{await loadLocale('en');});});
test('sound check exposes labelled setup, accessible live state and privacy-safe export controls',()=>{const result=render(<SoundCheckPage/>);expect(result.getByRole('heading',{name:'Sound Check'})).toBeVisible();expect(result.getByLabelText('Sound you will make')).toHaveValue('trigger');expect(result.getByRole('spinbutton',{name:/Attempts/})).toHaveAttribute('max','50');expect(result.getByRole('combobox',{name:'Phone distance'})).toHaveValue('practice');expect(result.container).toHaveTextContent('Close: under 30 cm');expect(result.container).toHaveTextContent('Far: over 1 m');expect(result.getByRole('button',{name:'Start Sound Check'})).toBeDisabled();expect(result.getByRole('meter',{name:'Sound check microphone level'})).toHaveAttribute('aria-valuenow','0');expect(result.getByRole('button',{name:'Export privacy-safe report'})).toBeVisible();expect(result.container).toHaveTextContent('Raw audio is never saved or exported.');});
test('sound check follows the selected measurement system without changing stored distance categories',()=>{
 const {rerender}=render(<SoundCheckPage measurementSystem="metric"/>);expect(screen.getByText(/Close:/).parentElement).toHaveTextContent('Close: under 30 cm');expect(screen.getByText(/Close:/).parentElement).not.toHaveTextContent('1 ft');
 rerender(<SoundCheckPage measurementSystem="imperial"/>);expect(screen.getByText(/Close:/).parentElement).toHaveTextContent('Close: under 1 ft');expect(screen.getByText(/Close:/).parentElement).not.toHaveTextContent('30 cm');expect(screen.getByLabelText('Phone distance')).toHaveValue('practice');
});

test.each([
 ['de','Klangtest','Geräusch, das du erzeugst','Versuche','Raum','Abstand zum Telefon','Abzug betätigen','Nah','unter 30 cm','Klangtest starten','Datenschutzfreundlichen Bericht exportieren'],
 ['nl','Geluidstest','Geluid dat je maakt','Pogingen','Ruimte','Afstand tot de telefoon','Trekker overhalen','Dichtbij','minder dan 30 cm','Geluidstest starten','Privacyvriendelijk rapport exporteren'],
])('all Sound Check labels and distance guidance follow the %s locale',async(locale,title,soundLabel,attemptsLabel,roomLabel,distanceLabel,trigger,close,distance,start,exportLabel)=>{
 await act(async()=>{await loadLocale(locale);});
 const result=render(<SoundCheckPage/>);
 expect(screen.getByRole('heading',{name:title})).toBeVisible();
 expect(screen.getByLabelText(soundLabel)).toHaveValue('trigger');
 expect(screen.getByRole('spinbutton',{name:new RegExp(attemptsLabel)})).toHaveValue(10);
 expect(screen.getByLabelText(roomLabel)).toHaveValue('normal');
 expect(screen.getByLabelText(distanceLabel)).toHaveValue('practice');
 expect(result.container).toHaveTextContent(`${close}: ${distance}`);
 expect(screen.getByRole('button',{name:start})).toBeDisabled();
 expect(result.container).toHaveTextContent(trigger);
 expect(result.container).toHaveTextContent(exportLabel);
});
