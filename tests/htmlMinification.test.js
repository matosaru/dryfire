import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {minifyProductionHtml} from '../tools/minify-html.mjs';
import {renderPageTemplates} from '../tools/page-templates.mjs';
const dom=new JSDOM('');const document=dom.window.document;afterAll(()=>dom.window.close());
const normalized=html=>{const host=document.createElement('template');host.innerHTML=html;return host.innerHTML;};
test('safe boolean-attribute compaction preserves quoted native values, whitespace, SVG and raw script/style text',async()=>{
 const html=`<section id="example" class="one two" aria-label="A > B"><input type="number" value="10" min="1" disabled=""/><svg viewBox="0 0 20 20"><path fill="none" d="M 1 2 L 3 4"/></svg> Text <span>after</span>\n  end<script type="application/json">{"sample":"<div id=\\"raw\\">"}</script><style>.x::after { content: '<tag id="x">'; }</style></section>`;
 const result=await minifyProductionHtml(html);expect(result.length).toBeLessThan(html.length);expect(normalized(result)).toBe(normalized(html));
});
test('complete compiled app retains the same parsed DOM while shipping less HTML',async()=>{
 const html=renderPageTemplates(readFileSync(new URL('../index.html',import.meta.url),'utf8'));
 const result=await minifyProductionHtml(html);expect(Buffer.byteLength(result)).toBeLessThan(Buffer.byteLength(html));expect(normalized(result)).toBe(normalized(html));expect(result).toContain('id="previewTestMode"');
});
test('quoted edge characters and empty values remain unchanged',async()=>{
 const html='<div data-empty="" data-equals="a=b" data-tick="`" title="quote &quot; and &amp;" data-slash="a/b" data-line="a\nb"><input value="a/b"/></div>';
 expect(normalized(await minifyProductionHtml(html))).toBe(normalized(html));
});
