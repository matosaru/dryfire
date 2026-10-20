/** @jest-environment jsdom */
import {textElement} from '../src/textElement.js';
test('native presentation keeps literal text and the original explicit class attribute',()=>{
 const element=textElement('p','<script>example</script>');
 expect(element.ownerDocument).toBe(document);expect(element.textContent).toBe('<script>example</script>');expect(element.children).toHaveLength(0);expect(element.getAttribute('class')).toBe('');
});
test('injected guide/progress documents stay isolated from the live document',()=>{
 const other=document.implementation.createHTMLDocument('example');const element=textElement('li','Result','session-result-card',other);
 expect(element.ownerDocument).toBe(other);expect(element.outerHTML).toBe('<li class="session-result-card">Result</li>');expect(document.body.contains(element)).toBe(false);
});
