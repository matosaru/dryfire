import { jest, describe, test, expect } from '@jest/globals';
import { actionButton, soundCard, drillCard } from '../src/uiComponents.js';

function fakeDocument() {
  return {
    createElement(tag) {
      return {
        tag, children: [], attributes: {}, style: {}, handlers: {}, textContent: '',
        append(...nodes) { this.children.push(...nodes); },
        setAttribute(k,v) { this.attributes[k] = v; },
        addEventListener(name, fn) { this.handlers[name] = fn; }
      };
    }
  };
}
function flatten(root) {
  return [root, ...root.children.flatMap(flatten)];
}
describe('reusable UI factories', () => {
  test('learning card retains progress, accessibility and independent reset action', () => {
    const record = jest.fn(), reset = jest.fn();
    const card = soundCard({
      label:'rack', meta:{title:'Rack slide',description:'Slide movement',tone:'blue'}, count:3,
      maxExamples:50, minExamples:3, recommendedExamples:10, locked:false,
      onRecord:record, onReset:reset
    },fakeDocument());
    const nodes = flatten(card);
    const buttons = nodes.filter(node => node.tag === 'button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].attributes['aria-label']).toBe('Record Rack slide sample');
    expect(buttons[1].attributes['aria-label']).toBe('Reset learned Rack slide sounds');
    expect(buttons[0].disabled).toBe(false);
    buttons[0].handlers.click();
    buttons[1].handlers.click();
    expect(record).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(nodes.some(node => node.textContent.includes('ready to recognize'))).toBe(true);
  });
  test('empty profiles cannot reset and locked training cannot record', () => {
    const card=soundCard({
      label:'draw', meta:{title:'Draw',description:'Draw',tone:'orange'},count:0,
      maxExamples:50,minExamples:3,recommendedExamples:10,locked:true,
      onRecord:()=>{},onReset:()=>{}
    },fakeDocument());
    expect(flatten(card).filter(node => node.tag === 'button').every(button => button.disabled)).toBe(true);
  });
  test('drill card preserves sequence and choose callback', () => {
    const choose=jest.fn();
    const card=drillCard({
      drill:{id:'mag-trigger',title:'Mag then trigger',steps:['reload','trigger']},
      index:2,titleFor:l=>({reload:'Change magazine',trigger:'Trigger pull'})[l],
      onChoose:choose
    },fakeDocument());
    const nodes=flatten(card);
    expect(nodes.filter(node=>node.className==='preset-chip').map(node=>node.textContent)).toEqual(['Change magazine','Trigger pull']);
    nodes.find(node=>node.tag==='button').handlers.click();
    expect(choose).toHaveBeenCalledTimes(1);
  });
  test('generic action buttons preserve user supplied label and disabled state',()=>{
    const cb=jest.fn();
    const b=actionButton({label:'Record',disabled:true,ariaLabel:'Record sample',onClick:cb},fakeDocument());
    expect(b.type).toBe('button');
    expect(b.textContent).toBe('Record');
    expect(b.disabled).toBe(true);
    expect(b.attributes['aria-label']).toBe('Record sample');
  });
});

test('reference design cards retain real actions and label-colored sequences', () => {
  const doc = fakeDocument();
  const sound = soundCard({label:'draw',meta:{title:'Draw',description:'Draw',tone:'blue'},count:4,maxExamples:50,minExamples:3,recommendedExamples:10,locked:false,onRecord:()=>{},onReset:()=>{}},doc);
  expect(flatten(sound).find(n=>n.tag==='button').textContent).toBe('▶ Train');
  const drill = drillCard({drill:{title:'Draw then trigger',steps:['draw','trigger']},index:0,titleFor:l=>l,onChoose:()=>{}},doc);
  expect(flatten(drill).find(n=>n.tag==='button').textContent).toBe('▶ Start Drill');
  expect(flatten(drill).filter(n=>n.className==='preset-chip').map(n=>n.attributes['data-sound'])).toEqual(['draw','trigger']);
});

test('learning GIFs have a reduced-motion SVG fallback', () => {
  const card = soundCard({label:'rack',meta:{title:'Rack',description:'Rack',tone:'green'},count:0,maxExamples:50,minExamples:3,recommendedExamples:10,locked:false,onRecord:()=>{},onReset:()=>{}},fakeDocument());
  const nodes = flatten(card);
  expect(nodes.find(n=>n.tag==='source').srcset).toBe('/motions/rack.gif');
  expect(nodes.find(n=>n.tag==='source').media).toBe('(prefers-reduced-motion: no-preference)');
  expect(nodes.find(n=>n.tag==='img').src).toBe('/motions/rack.svg');
});
