export async function resolve(specifier,context,nextResolve){
 if(!/\.css(?:\?[^/]*)?$/.test(specifier))return nextResolve(specifier,context);
 const source=specifier.split('?')[0];
 return{url:new URL(`${source}?dryfire-node-css`,context.parentURL).href,shortCircuit:true};
}

export async function load(url,context,nextLoad){
 if(new URL(url).searchParams.has('dryfire-node-css'))return{format:'module',source:'export default "";',shortCircuit:true};
 return nextLoad(url,context);
}
