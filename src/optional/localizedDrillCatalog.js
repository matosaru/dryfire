export function renderLegacyPracticeCatalog(doc,{practiceModes,translate}){
 const catalog=doc.getElementById('practiceCatalog');
 if(!catalog)return;
 for(const mode of practiceModes){
  const card=catalog.querySelector(`[data-practice-mode="${mode.id}"]`)?.closest('.preset-card');
  if(!card)continue;
  const title=card.querySelector('h3');if(title)title.textContent=translate('practice-guide',`manuals.${mode.id}.title`);
  const description=card.querySelector('p');if(description)description.textContent=translate('drills',`modes.${mode.id}Description`);
  const button=card.querySelector('button');if(button)button.textContent=translate('drills','cards.start');
 }
}
