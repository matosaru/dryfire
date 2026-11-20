import {useState} from 'react';
import {useLocaleMessages} from '../../localization/runtime.ts';

export const CONTACT_EMAIL='easydryfire@gmail.com';

export function EmailContact(){
  const {t}=useLocaleMessages('contact');
  const [message,setMessage]=useState('');
  async function copy(){
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setMessage(t('email.copied'));
    }catch{setMessage(t('email.unavailable',{email:CONTACT_EMAIL}));}
  }
  return <div className="email-contact">
    <a className="about-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    <button className="button secondary copy-email" type="button" onClick={copy} aria-describedby="copyEmailStatus">{t('email.copy')}</button>
    <p id="copyEmailStatus" className="copy-email-status muted small" role="status" aria-live="polite">{message||t('email.hint')}</p>
  </div>;
}
