import {normalizeAudioPreferences} from './audioPreferences.js';
/** One record shared by preference actions, profile loading and capture snapshots. */
export function createPreferenceState(){return {audio:normalizeAudioPreferences(),theme:'dark',vibration:false,rejected:false,processing:null,pending:false};}
export function createPreferenceActions(state,ports){
 async function appearance(){const value=ports.read('appearance').value;if(!['dark','light','system'].includes(value))return;try{await ports.saveDevice('appearance',value);state.theme=value;ports.applyTheme();}catch(error){ports.error(error);ports.render();}}
 async function vibration(){if(ports.locked()){ports.render();return;}try{state.vibration=ports.read('vibrationFeedback').checked;await ports.saveDevice('vibrationFeedback',state.vibration);ports.render();}catch(error){ports.error(error);await ports.reload();ports.render();}}
 async function audio(id,key){
  if(ports.locked()){ports.render();return;}
  const previous=state.audio;
  try{const gunId=ports.owner();const next=normalizeAudioPreferences({...state.audio,[key]:ports.read(id).checked});state.pending=true;state.audio=next;ports.refresh();await ports.saveGun('audioPreferences',next,gunId);if(gunId!==ports.activeOwner())return;state.audio=next;state.processing=null;ports.render();ports.message('Saved for the next capture. Audio processing can affect recognition; collect fresh examples if needed. Existing samples were kept.');}
  catch(error){state.audio=previous;ports.error(error);}
  finally{state.pending=false;ports.refresh();}
 }
 return{appearance,vibration,audio};
}
