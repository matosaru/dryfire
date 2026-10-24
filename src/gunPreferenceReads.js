/** Overlap independent read-only requests for one explicit owner. Consumers
 * still await/validate in their original order. Capture every rejection now so
 * a later failed read cannot become unhandled if an earlier consumer fails. */
export function startGunPreferenceReads(gunId, readSetting, readCalibration) {
  const tasks=[()=>readSetting('maxResults',50,gunId),()=>readSetting('sensitivity','normal',gunId),
    ()=>readSetting('selectedDrill','',gunId),()=>readSetting('audioPreferences',{},gunId),
    ()=>readCalibration(gunId),()=>readSetting('enabledSoundLabels',null,gunId)];
  return tasks.map(task=>{
    const result=Promise.resolve().then(task).then(value=>({ok:true,value}),error=>({ok:false,error}));
    return async()=>{const row=await result;if(!row.ok)throw row.error;return row.value;};
  });
}
