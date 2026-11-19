/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,screen,cleanup} from '@testing-library/react';
import {SoundCheckPage} from './SoundCheckPage.tsx';
afterEach(cleanup);
test('sound check exposes labelled setup, accessible live state and privacy-safe export controls',()=>{const result=render(<SoundCheckPage/>);expect(result.getByRole('heading',{name:'Sound Check'})).toBeVisible();expect(result.getByLabelText('Sound you will make')).toHaveValue('trigger');expect(result.getByRole('spinbutton',{name:/Attempts/})).toHaveAttribute('max','50');expect(result.getByRole('combobox',{name:'Phone distance'})).toHaveValue('practice');expect(result.container).toHaveTextContent('Close: under 30 cm');expect(result.container).toHaveTextContent('Far: over 1 m');expect(result.getByRole('button',{name:'Start Sound Check'})).toBeDisabled();expect(result.getByRole('meter',{name:'Sound check microphone level'})).toHaveAttribute('aria-valuenow','0');expect(result.getByRole('button',{name:'Export privacy-safe report'})).toBeVisible();expect(result.container).toHaveTextContent('Raw audio is never saved or exported.');});
test('sound check follows the selected measurement system without changing stored distance categories',()=>{
 const {rerender}=render(<SoundCheckPage measurementSystem="metric"/>);expect(screen.getByText(/Close:/).parentElement).toHaveTextContent('Close: under 30 cm');expect(screen.getByText(/Close:/).parentElement).not.toHaveTextContent('1 ft');
 rerender(<SoundCheckPage measurementSystem="imperial"/>);expect(screen.getByText(/Close:/).parentElement).toHaveTextContent('Close: under 1 ft');expect(screen.getByText(/Close:/).parentElement).not.toHaveTextContent('30 cm');expect(screen.getByLabelText('Phone distance')).toHaveValue('practice');
});
