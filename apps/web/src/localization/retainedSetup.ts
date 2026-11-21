import {refreshLocalizedNumericHints,subscribeLocale,translate} from './runtime.ts';

type LocaleText=(namespace:string,key:string)=>string;
type SetupKind='practice'|'sequence';

function setText(root:HTMLElement,selector:string,value:string){const node=root.querySelector<HTMLElement>(selector);if(node)node.textContent=value;}
function setPageTitle(root:HTMLElement,selector:string,value:string){const node=root.ownerDocument.querySelector<HTMLElement>(selector);if(node)node.textContent=value;}
function setOption(root:HTMLElement,selector:string,value:string){const option=root.querySelector<HTMLOptionElement>(selector);if(option)option.textContent=value;}

function localizePractice(root:HTMLElement,t:LocaleText,common:LocaleText){
 setText(root,'#practiceConfigFields > legend',t('practice','setup.legend'));
 setText(root,'#practiceCountLabel',t('practice','setup.repetitions'));
 setText(root,'#practiceParRow > span',t('practice','setup.parTime'));
 setText(root,'label[for="practiceStartSource"] > span',t('practice','setup.startSignal'));
 setOption(root,'#practiceStartSource option[value="app"]',t('practice','setup.appSignal'));
 setOption(root,'#practiceStartSource option[value="external"]',t('practice','setup.externalBeep'));
 setText(root,'label[for="practiceDelayMode"] > span',t('practice','setup.delayMode'));
 setOption(root,'#practiceDelayMode option[value="fixed"]',t('practice','setup.fixed'));
 setOption(root,'#practiceDelayMode option[value="random"]',t('practice','setup.random'));
 setText(root,'label[for="practiceFixedDelay"] > span',t('practice','setup.delaySeconds'));
 setText(root,'label[for="practiceMinDelay"] > span',t('practice','setup.minimumSeconds'));
 setText(root,'label[for="practiceMaxDelay"] > span',t('practice','setup.maximumSeconds'));
 setText(root,'label[for="practiceStartSound"] strong',t('practice','setup.soundAtStart'));
 setText(root,'label[for="practiceStartSound"] small',t('practice','setup.practiceBeepDescription'));
 setText(root,'#practiceTestStartSound',t('practice','setup.testStartSound'));
 setText(root,'#practiceStartSoundTest small',t('practice','setup.mediaVolumeHint'));
 setText(root,'#practiceStartBtn',t('practice','setup.start'));
 setText(root,'#practiceLearnBtn',t('practice','learnMissing'));
 for(const item of root.querySelectorAll<HTMLElement>('#practiceSteps [data-sound-id]')){
  const id=item.dataset.soundId!;item.textContent=common('common',`sound.${id}`);
 }
}

function localizeSequence(root:HTMLElement,t:LocaleText,common:LocaleText){
 setPageTitle(root,'#session-title',t('sequence','page.title'));
 setText(root,'#sessionConfigFields > legend',t('sequence','setup.legend'));
 setText(root,'label[for="sessionRepetitions"] > span',t('sequence','setup.repetitions'));
 setText(root,'label[for="sessionDelayMode"] > span',t('sequence','setup.delayMode'));
 setOption(root,'#sessionDelayMode option[value="fixed"]',t('sequence','setup.fixed'));
 setOption(root,'#sessionDelayMode option[value="random"]',t('sequence','setup.random'));
 setText(root,'label[for="sessionFixedDelay"] > span',t('sequence','setup.delaySeconds'));
 setText(root,'label[for="sessionMinDelay"] > span',t('sequence','setup.minimumSeconds'));
 setText(root,'label[for="sessionMaxDelay"] > span',t('sequence','setup.maximumSeconds'));
 setText(root,'#sessionConfigFields .session-delay-card > p',t('sequence','setup.freshDelay'));
 setText(root,'label[for="sessionStartSound"] strong',t('sequence','setup.soundAtStart'));
 setText(root,'label[for="sessionStartSound"] small',t('sequence','setup.sequenceBeepDescription'));
 setText(root,'#sessionTestStartSound',t('sequence','setup.testStartSound'));
 setText(root,'#sessionTestStartSound + small',t('sequence','setup.mediaVolumeHint'));
 setText(root,'#sessionStartBtn',t('sequence','setup.start'));
 setText(root,'#sessionLearnBtn',t('sequence','learnMissing'));
 setText(root,'#sessionCueGuardNote',t('sequence','setup.cueGuardNote'));
 setText(root,'#sessionConfigure .session-timing-note',t('sequence','timingNote'));
 for(const item of root.querySelectorAll<HTMLElement>('#sessionSteps [data-sound-id]')){
  const id=item.dataset.soundId!;item.textContent=common('common',`sound.${id}`);
 }
}

/** Refresh copy on the native setup subtree before or after a React owner mounts. */
export function localizeRetainedSetup(root:HTMLElement,kind:SetupKind){
 const t=(namespace:string,key:string)=>translate(namespace,key),common=(namespace:string,key:string)=>translate(namespace,key);
 if(kind==='practice')localizePractice(root,t,common);else localizeSequence(root,t,common);
 refreshLocalizedNumericHints();
}

/** Keep the legacy form nodes and their native listeners, changing only copy. */
export function registerRetainedSetupLocalization(root:HTMLElement,kind:SetupKind){
 const refresh=()=>localizeRetainedSetup(root,kind);
 refresh();
 const unsubscribe=subscribeLocale(refresh);
 return unsubscribe;
}
