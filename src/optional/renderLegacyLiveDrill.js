import {liveDrillPresentation} from '../../apps/web/src/features/live-listen/presentation.ts';

export function renderLegacyLiveDrill(doc,drill,state,titleFor,renderDOM){
  const view=liveDrillPresentation(drill,state,titleFor);
  if(!renderDOM)return view;
  for(const[id,text]of Object.entries(view.texts))doc.getElementById(id).textContent=text;
  for(const[id,hidden]of Object.entries(view.hidden))doc.getElementById(id).classList.toggle('hidden',hidden);
  const steps=doc.getElementById('drillSteps');steps.replaceChildren();
  for(const step of view.steps){const item=doc.createElement('li'),number=doc.createElement('span'),name=doc.createElement('span');item.className=step.className;number.className='step-number';number.textContent=step.number;name.textContent=step.title;item.append(number,name);steps.append(item);}
  return view;
}
