// A failed module URL can remain rejected in WebKit across reloads. Recover only
// from the current build's same-origin manifest; never import an arbitrary URL.
type ManifestResponse = {ok:boolean;json:()=>Promise<unknown>};
type Options = {
 expectedDigest:string;
 fetchManifest?:()=>Promise<ManifestResponse>;
 importModule?:(url:string)=>Promise<unknown>;
 nonce?:()=>string;
};
export async function retryGuideModule({expectedDigest,
 fetchManifest=()=>fetch('/edition.json',{cache:'no-store'}),
 importModule=url=>import(/* @vite-ignore */ url),
 nonce=()=>`${Date.now()}-${Math.random().toString(36).slice(2)}`}:Options){
 // A 128-bit SHA-256 prefix is enough to identify the build while reducing
 // the digest bytes carried by the startup module. The manifest retains full SHA-256.
 if(!/^[a-f0-9]{32}$/.test(expectedDigest))throw new Error('Reload the app before retrying this guide.');
 const response=await fetchManifest();
 if(!response.ok)throw new Error('The current guide manifest is unavailable.');
 const value:unknown=await response.json();
 const manifest=value as {sourceDigest?:unknown;assets?:unknown}|null;
 if(!manifest||typeof manifest.sourceDigest!=='string'||!/^[a-f0-9]{64}$/.test(manifest.sourceDigest)||!manifest.sourceDigest.startsWith(expectedDigest)||!Array.isArray(manifest.assets))throw new Error('The app was updated. Reload before opening this guide.');
 const assets=manifest.assets.filter((path:unknown):path is string=>typeof path==='string'&&/^\/assets\/practiceGuideController-[A-Za-z0-9_-]+\.js$/.test(path));
 if(assets.length!==1)throw new Error('The current guide module is unavailable.');
 return importModule(`${assets[0]}?retry=${encodeURIComponent(nonce())}`);
}
