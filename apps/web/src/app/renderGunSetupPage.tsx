import {renderToStaticMarkup} from 'react-dom/server';
import {GunSetupPage} from '../pages/GunSetupPage/index.ts';
export const renderGunSetupPage=()=>renderToStaticMarkup(<GunSetupPage/>).replace(/<link rel="preload" as="image" href="\/gun-types\/(?:handgun|rifle|shotgun)\.svg"\/>/g,'');
