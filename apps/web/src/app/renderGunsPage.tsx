import {renderToStaticMarkup} from 'react-dom/server';
import {GunsPage} from '../pages/GunsPage/index.ts';
export const renderGunsPage=()=>renderToStaticMarkup(<GunsPage/>);
