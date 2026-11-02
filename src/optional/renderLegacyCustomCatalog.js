export function renderLegacyCustomCatalog(doc,drills,{drillCard,titleFor,onChoose,onEdit}){
  const host=doc.getElementById('customDrillCatalog');host.replaceChildren();
  if(!drills.length){const empty=doc.createElement('p');empty.className='empty-state';empty.textContent='No custom drills for this gun yet. Choose Create Custom Drill to add a sequence.';host.append(empty);}
  for(const drill of drills){const card=drillCard({drill,titleFor,onChoose:()=>onChoose(drill.id)}),edit=doc.createElement('button');edit.type='button';edit.className='button secondary';edit.textContent='Edit sequence';edit.addEventListener('click',()=>onEdit(drill));card.append(edit);host.append(card);}
}
