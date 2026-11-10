import {preferencePresentation} from '../../apps/web/src/features/settings/preferencePresentation.ts';
import {setNodeDisabled,setNodeText} from '../domUpdates.js';

/** Lightweight Settings-only DOM presentation, loaded when Settings first opens. */
export function renderNativeSettingsPreferences({doc,capabilities,audioPreferences,processingReport,appearance,measurementSystem,gunAvailable,locked,deviceLocked,vibrationFeedback,vibrationSupported,vibrationRejected}){
 const view=preferencePresentation({capabilities,audioPreferences,processingReport,appearance,measurementSystem,gunAvailable,locked,deviceLocked,vibrationFeedback,vibrationSupported,vibrationRejected});
 for(const item of view.audio){const input=doc.getElementById(item.inputId);if(input.checked!==item.checked)input.checked=item.checked;setNodeDisabled(input,item.disabled);setNodeText(doc.getElementById(item.statusId),item.status);}
 const theme=doc.getElementById('appearance'),units=doc.getElementById('measurementSystem'),vibration=doc.getElementById('vibrationFeedback');
 if(theme.value!==view.appearance.value)theme.value=view.appearance.value;setNodeDisabled(theme,view.appearance.disabled);
 if(units.value!==view.measurementSystem.value)units.value=view.measurementSystem.value;setNodeDisabled(units,view.measurementSystem.disabled);
 if(vibration.checked!==view.vibration.checked)vibration.checked=view.vibration.checked;setNodeDisabled(vibration,view.vibration.disabled);setNodeText(doc.getElementById('vibrationStatus'),view.vibration.status);
}
