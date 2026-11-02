/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,cleanup} from '@testing-library/react';
import {SoundCheckPage} from './SoundCheckPage.tsx';
afterEach(cleanup);
test('sound check exposes labelled setup, accessible live state and privacy-safe export controls',()=>{const result=render(<SoundCheckPage/>);expect(result.getByRole('heading',{name:'Sound Check'})).toBeVisible();expect(result.getByLabelText('Sound you will make')).toHaveValue('trigger');expect(result.getByRole('spinbutton',{name:/Attempts/})).toHaveAttribute('max','50');expect(result.getByRole('meter',{name:'Sound check microphone level'})).toHaveAttribute('aria-valuenow','0');expect(result.getByRole('button',{name:'Export privacy-safe report'})).toBeVisible();expect(result.container).toHaveTextContent('Raw audio is never saved or exported.');});
