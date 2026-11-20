import {translate} from '../../apps/web/src/localization/runtime.ts';

export function renderLegacyCustomCatalog(doc,drills,{drillCard,titleFor,onChoose,onEdit}){
  const host=doc.getElementById('customDrillCatalog');host.replaceChildren();
  if(!drills.length){const empty=doc.createElement('p');empty.className='empty-state';empty.textContent=translate('drills','custom.empty');host.append(empty);}
  for(const drill of drills){const card=drillCard({drill,titleFor,onChoose:()=>onChoose(drill.id)}),edit=doc.createElement('button');edit.type='button';edit.className='button secondary';edit.textContent=translate('drills','custom.edit');edit.addEventListener('click',()=>onEdit(drill));card.append(edit);host.append(card);}
}
