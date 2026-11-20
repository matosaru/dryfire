import { textElement } from '../textElement.js';
import {progressPresentation} from '../../apps/web/src/features/history/progressPresentation.ts';
import { progressGroups, progressSummary } from '../practiceProgress.js';
import progressStyles from '../../packages/ui/src/ProgressContent/ProgressContent.css?inline';
import {translate} from '../../apps/web/src/localization/runtime.ts';
const element = (doc, tag, text, className = '') => textElement(tag, text, className, doc);
const builtInSequenceTitles={'trigger-only':'sound.trigger','rack-trigger':'cards.builtInTitles.rack','mag-trigger':'cards.builtInTitles.magazine','draw-mag-trigger':'cards.builtInTitles.drawMagazine'};
function groupTitle(group){
  if(group.mode!=='sequence')return translate('practice-guide',`manuals.${group.mode}.title`);
  const key=builtInSequenceTitles[group.drillId];
  return key?translate(key.startsWith('sound.')?'common':'drills',key):group.title;
}
export function createProgressView(doc, { enabled = () => true, onError = () => {}, message, locale = () => 'en' } = {}) {
  if(typeof message!=='function')throw new TypeError('A History message resolver is required to render progress.');
  if(!doc.querySelector('style[data-progress-styles]')){const style=doc.createElement('style');style.dataset.progressStyles='';style.textContent=progressStyles;doc.head.append(style);}
  const $ = id => doc.getElementById(id), select = $('progressGroup'), range = $('progressRange'), host = $('progressContent');
  let groups = [], owner = null, view, module, pending;
  function selectedModel(){if(!enabled())return{};const group=groups.find(row=>row.key===select.value),data=group?progressSummary(group,{days:Number(range.value)}):undefined;return progressPresentation(group,data,message,locale());}
  function renderSelected() {
    const model=selectedModel();
    if(view){view.update(model);return;}
    host.replaceChildren();
    if (!enabled()) return;
    if (model.timing===undefined) { if(model.empty)host.append(element(doc,'p',model.empty,'empty-state'));return; }
    host.append(element(doc,'p',model.timing,'muted small'));
    const stats=element(doc,'div','','progress-stats');
    for(const card of model.cards??[]){const node=element(doc,'div');node.append(element(doc,'span',card.label),element(doc,'strong',card.value));stats.append(node);}
    host.append(stats);
    if(model.trend!==undefined)host.append(element(doc,'p',model.trend,'progress-trend'));
    if(model.metric!==undefined)host.append(element(doc,'h4',model.metric));
    const chart=model.chart;
    if(!chart){if(model.empty)host.append(element(doc,'p',model.empty,'empty-state'));return;}
    const svgNode=(tag,attrs,text)=>{const node=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const[key,value]of Object.entries(attrs))node.setAttribute(key,value);if(text!==undefined)node.textContent=text;return node;};
    const svg=svgNode('svg',{viewBox:'0 0 600 230',role:'img','aria-label':chart.label,class:'progress-chart'});
    for(const row of chart.grid)svg.append(svgNode('line',{x1:72,x2:576,y1:row.y,y2:row.y,class:'progress-gridline'}),svgNode('text',{x:64,y:row.y+4,'text-anchor':'end'},row.label));
    svg.append(svgNode('polyline',{points:chart.line,fill:'none',class:'progress-line'}));
    for(const dotModel of chart.dots){const dot=svgNode('circle',{cx:dotModel.x,cy:dotModel.y,r:5,class:'progress-dot'});dot.append(svgNode('title',{},dotModel.title));svg.append(dot);}
    for(const date of chart.dates)svg.append(svgNode('text',{x:date.x,y:209,'text-anchor':date.anchor},date.text));
    host.append(svg,element(doc,'p',chart.note,'muted small'));
    const details=element(doc,'details','','progress-data');details.append(element(doc,'summary',model.tableSummary??''));
    const table=element(doc,'table'),head=element(doc,'tr');
    for(const title of model.tableHeaders??[]){const th=element(doc,'th',title);th.scope='col';head.append(th);}
    const thead=element(doc,'thead');thead.append(head);table.append(thead);
    const body=element(doc,'tbody');for(const values of chart.rows){const row=element(doc,'tr');for(const value of values)row.append(element(doc,'td',value));body.append(row);}
    table.append(body);details.append(table);host.append(details);
  }
  select.addEventListener('change', renderSelected); range.addEventListener('change', renderSelected);
  return {
    prepare(){
      if(!enabled()||view)return;
      if(module){view=module.mountProgressContent(host,selectedModel());return;}
      if(!pending)pending=import('../../apps/web/src/app/progressContent.tsx').then(loaded=>{module=loaded;}).catch(onError).finally(()=>{pending=null;});
      return pending;
    },
    clear(){if(view)view.update({});else host.replaceChildren();},
    render(records, gunId) {
      const previous=owner===gunId?select.value:null;owner=gunId;groups=progressGroups(records,gunId);
      select.replaceChildren(...groups.map(group=>{const presentation=progressPresentation(group,progressSummary(group,{days:Number(range.value)}),message,locale());const option=element(doc,'option',`${groupTitle(group)} · ${presentation.timing??''}`);option.value=group.key;return option;}));
      select.disabled=!groups.length;
      if(groups.some(group=>group.key===previous))select.value=previous;
      else if(groups.some(group=>group.mode==='single'))select.value=groups.find(group=>group.mode==='single').key;
      renderSelected();
    }
  };
}
