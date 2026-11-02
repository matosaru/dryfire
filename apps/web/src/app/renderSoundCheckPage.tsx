import {renderToStaticMarkup} from 'react-dom/server';
import {SoundCheckPage} from '../pages/SoundCheckPage/index.ts';
export const renderSoundCheckPage=()=>renderToStaticMarkup(<SoundCheckPage/>);
