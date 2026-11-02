import {distancePresentation} from '../../apps/web/src/features/live-listen/presentation.ts';

export function renderLegacyDistances(doc,labels,distances,titleFor,renderDOM){
  const rows=distancePresentation(labels,distances,titleFor);
  if(!renderDOM)return rows;
  const host=doc.getElementById('distanceBars');host.replaceChildren();
  for(const item of rows){const row=doc.createElement('div'),line=doc.createElement('div'),name=doc.createElement('span'),value=doc.createElement('span'),bar=doc.createElement('div'),fill=doc.createElement('span');row.className='distance-row';line.className='distance-label';name.textContent=item.title;value.textContent=item.value;bar.className='bar';fill.style.width=item.width;bar.append(fill);line.append(name,value);row.append(line,bar);host.append(row);}
  return rows;
}
