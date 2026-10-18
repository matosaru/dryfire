import {renderToStaticMarkup} from 'react-dom/server';
import {HomePage} from '../pages/HomePage/index.ts';
export const renderHomePage=()=>renderToStaticMarkup(<HomePage/>);
