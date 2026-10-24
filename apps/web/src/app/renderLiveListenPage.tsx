import {renderToStaticMarkup} from 'react-dom/server';
import {LiveListenPage} from '../pages/LiveListenPage/index.ts';
export const renderLiveListenPage=()=>renderToStaticMarkup(<LiveListenPage/>);
