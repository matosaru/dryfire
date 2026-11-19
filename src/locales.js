export const SUPPORTED_LOCALES=Object.freeze(['en','de','nl']);
export const DEFAULT_LOCALE='en';
export const normalizeLocale=value=>value==='en'||value==='de'||value==='nl'?value:DEFAULT_LOCALE;
