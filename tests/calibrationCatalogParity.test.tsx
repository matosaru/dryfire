/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {readFileSync} from 'node:fs';
import {renderCalibrationCatalog} from '../apps/web/src/app/renderCalibrationCatalog.tsx';
function tree(node:Node):unknown {
  if(node.nodeType===Node.TEXT_NODE)return node.textContent?.trim()||null;
  if(!(node instanceof Element))return null;
  return [node.tagName,[...node.attributes].filter(attr=>attr.name!=='data-description').map(attr=>[attr.name,attr.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];
}
test('prerendered calibration cards preserve released elements, labels, attributes and limits',()=>{
  const old=document.createElement('div'),next=document.createElement('div');
  old.innerHTML=readFileSync(new URL('./fixtures/legacy-calibration-catalog.html',import.meta.url),'utf8');
  next.innerHTML=renderCalibrationCatalog();
  expect(tree(next)).toEqual(tree(old));
  for(const text of next.querySelectorAll<HTMLElement>('[data-description]'))expect(text.textContent).toBe(text.dataset.description+' 0 / 10 samples.');
});
