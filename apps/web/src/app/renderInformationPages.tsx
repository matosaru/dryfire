import { renderToStaticMarkup } from 'react-dom/server';
import {parseFragment, type DefaultTreeAdapterMap} from 'parse5';

type BuildNode=DefaultTreeAdapterMap['textNode']|DefaultTreeAdapterMap['element'];
type StaticNode=string|[string,[string,string][],StaticNode[]];
/** Only our typed page's text/elements enter this build-only serializer. */
function serializeStaticPage(html:string) {
  const encode=(node:BuildNode):StaticNode=>'value' in node?node.value:[node.tagName,node.attrs.map(a=>[a.name,a.value]),(node.childNodes as BuildNode[]).map(encode)];
  return JSON.stringify((parseFragment(html).childNodes as BuildNode[]).map(encode)).replaceAll('<','\\u003c');
}
import { AboutPage } from '../pages/AboutPage/index.ts';
import { ContactPage } from '../pages/ContactPage/index.ts';

/** Prerender the same components used by the browser; no parallel HTML copy. */
export function renderInformationPage(id: string, deferred = false) {
  if (id === 'about') {const html=renderToStaticMarkup(<AboutPage />);return deferred?`<script type="application/json" data-static-page="about">${serializeStaticPage(html)}</script>`:html;}
  if (id === 'contact') return renderToStaticMarkup(<ContactPage />);
  throw new Error(`Not an informational page: ${id}`);
}
