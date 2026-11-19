import {useState} from 'react';

export const CONTACT_EMAIL='easydryfire@gmail.com';

export function EmailContact({labels=EMAIL_LABELS}:{labels?:typeof EMAIL_LABELS}){
  const [message,setMessage]=useState('');
  async function copy(){
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setMessage(labels.copied);
    }catch{setMessage(labels.unavailable);}
  }
  return <div className="email-contact">
    <a className="about-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    <button className="button secondary copy-email" type="button" onClick={copy} aria-describedby="copyEmailStatus">{labels.copy}</button>
    <p id="copyEmailStatus" className="copy-email-status muted small" role="status" aria-live="polite">{message||labels.hint}</p>
  </div>;
}

const EMAIL_LABELS={copy:'Copy email',copied:'Email copied.',unavailable:`Copy unavailable. Select the address above: {{email}}`,hint:'Use Copy email if no email app opens.'};
