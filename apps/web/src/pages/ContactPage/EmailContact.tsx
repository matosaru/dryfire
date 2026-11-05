import {useState} from 'react';

export const CONTACT_EMAIL='easydryfire@gmail.com';

export function EmailContact(){
  const [message,setMessage]=useState('');
  async function copy(){
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setMessage('Email copied.');
    }catch{setMessage(`Copy unavailable. Select the address above: ${CONTACT_EMAIL}`);}
  }
  return <div className="email-contact">
    <a className="about-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    <button className="button secondary copy-email" type="button" onClick={copy} aria-describedby="copyEmailStatus">Copy email</button>
    <p id="copyEmailStatus" className="copy-email-status muted small" role="status" aria-live="polite">{message||'Use Copy email if no email app opens.'}</p>
  </div>;
}
