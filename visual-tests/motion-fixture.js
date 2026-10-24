import {readFileSync} from 'node:fs';
const sources=new Map(['draw','rack','trigger','reload'].map(name=>[
  `/motions/${name}.svg`,readFileSync(new URL(`../dist/motions/${name}.svg`,import.meta.url),'utf8'),
]));
/** Freeze the existing artwork's external document clocks at the released initial frame. */
export async function freezeMotionArtwork(page){
  await page.route('**/motions/*.svg',async route=>{
    const path=new URL(route.request().url()).pathname,source=sources.get(path);
    if(source===undefined)throw new Error(`Unknown built motion asset: ${path}`);
    const svg=source.replace(/<animate\b[^>]*\/>/g,'').replace('animation:cue 2s ease-in-out infinite','animation:none');
    await route.fulfill({status:200,body:svg,contentType:'image/svg+xml'});
  });
}
