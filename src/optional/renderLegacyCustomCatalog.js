import {formatLocaleNumber,translate} from '../../apps/web/src/localization/runtime.ts';

export function renderLegacyCustomCatalog(doc,drills,{drillCard,titleFor,onChoose,onEdit}){
  const host=doc.getElementById('customDrillCatalog');host.replaceChildren();
  if(!drills.length){const empty=doc.createElement('p');empty.className='empty-state';empty.textContent=translate('drills','custom.empty');host.append(empty);}
  for(const drill of drills){const description=drill.steps.length===1?translate('drills','cards.singleSound'):translate('drills','cards.sequence',{count:formatLocaleNumber(drill.steps.length)});const card=drillCard({drill,titleFor,description,startLabel:translate('drills','cards.start'),onChoose:()=>onChoose(drill.id)}),edit=doc.createElement('button');edit.type='button';edit.className='button secondary';edit.textContent=translate('drills','custom.edit');edit.addEventListener('click',()=>onEdit(drill));card.append(edit);host.append(card);}
}
