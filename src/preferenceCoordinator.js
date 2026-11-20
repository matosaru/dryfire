import {normalizeAudioPreferences} from './audioPreferences.js';
import {normalizeMeasurementSystem} from './measurementUnits.js';
import {normalizeLocale} from './locales.js';
/** One record shared by preference actions, profile loading and capture snapshots. */
export function createPreferenceState(){return {audio:normalizeAudioPreferences(),theme:'dark',measurementSystem:'metric',language:'en',vibration:false,rejected:false,processing:null,pending:false};}
export function createPreferenceActions(state,ports){
 async function appearance(){const value=ports.read('appearance').value;if(!['dark','light','system'].includes(value))return;try{await ports.saveDevice('appearance',value);state.theme=value;ports.applyTheme();}catch(error){ports.error(error);ports.render();}}
 async function measurementSystem(){const input=ports.read('measurementSystem').value;if(!['metric','imperial'].includes(input))return;const previous=state.measurementSystem;try{const value=normalizeMeasurementSystem(input);await ports.saveDevice('measurementSystem',value);state.measurementSystem=value;ports.applyMeasurements();ports.render();}catch(error){state.measurementSystem=previous;ports.error(error);ports.render();}}
 async function language(){const input=ports.read('language').value,value=normalizeLocale(input);if(value!==input)return;const previous=state.language;try{await ports.saveDevice('language',value);state.language=value;await ports.applyLocale(value);ports.render();}catch(error){state.language=previous;try{await ports.saveDevice('language',previous);await ports.applyLocale(previous);}catch{}ports.error(error);ports.render();}}
 async function vibration(){if(ports.locked()){ports.render();return;}try{state.vibration=ports.read('vibrationFeedback').checked;await ports.saveDevice('vibrationFeedback',state.vibration);ports.render();}catch(error){ports.error(error);await ports.reload();ports.render();}}
 async function audio(id,key){
  if(ports.locked()){ports.render();return;}
  const previous=state.audio;
  try{const gunId=ports.owner();const next=normalizeAudioPreferences({...state.audio,[key]:ports.read(id).checked});state.pending=true;state.audio=next;ports.refresh();await ports.saveGun('audioPreferences',next,gunId);if(gunId!==ports.activeOwner())return;state.audio=next;state.processing=null;ports.render();ports.message('audio.savedNotice');}
  catch(error){state.audio=previous;ports.error(error);}
  finally{state.pending=false;ports.refresh();}
 }
 return{appearance,measurementSystem,language,vibration,audio};
}
