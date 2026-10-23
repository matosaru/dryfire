/** @jest-environment jsdom */
import {selectNode,setNodeText,setNodeDisabled} from '../src/domUpdates.js';
afterEach(()=>{document.body.innerHTML='';});
test('lookups retain CSS semantics and resolve replaced ownership nodes without a stale cache',()=>{
 document.body.innerHTML='<button id="action" class="pick">Old</button><span id="sound:trigger">Sound</span>';
 const original=selectNode('#action');expect(selectNode('button.pick')).toBe(original);expect(selectNode('#sound\\:trigger').textContent).toBe('Sound');
 original.outerHTML='<button id="action">New</button>';expect(selectNode('#action')).not.toBe(original);expect(selectNode('#action').textContent).toBe('New');expect(selectNode('#missing')).toBeNull();
});
test('unchanged native text and lock state cause no mutations; real changes stay observable',async()=>{
 document.body.innerHTML='<button id="action">Ready</button>';const node=selectNode('#action'),records=[],observer=new MutationObserver(rows=>records.push(...rows));observer.observe(node,{attributes:true,childList:true,characterData:true,subtree:true});
 setNodeText(node,'Ready');setNodeDisabled(node,false);await Promise.resolve();expect(records).toHaveLength(0);
 setNodeText(node,10);setNodeDisabled(node,true);await Promise.resolve();expect(node.textContent).toBe('10');expect(node.disabled).toBe(true);expect(records.length).toBeGreaterThan(0);const count=records.length;
 setNodeText(node,'10');setNodeDisabled(node,true);await Promise.resolve();expect(records).toHaveLength(count);setNodeText(node,null);expect(node.textContent).toBe('');observer.disconnect();
});
