import {jest} from '@jest/globals';
import {retryGuideModule} from './retryGuideModule';
const digest='a'.repeat(64),path='/assets/practiceGuideController-abc_123.js';
function setup(value:unknown={sourceDigest:digest,assets:[path]},ok=true){
 const imported=jest.fn<(url:string)=>Promise<unknown>>().mockResolvedValue({controller:true});
 const fetchManifest=jest.fn<()=>Promise<{ok:boolean;json:()=>Promise<unknown>}>>().mockResolvedValue({ok,json:async()=>value});
 return{imported,fetchManifest,options:{expectedDigest:digest,fetchManifest,importModule:imported,nonce:()=> 'fresh & safe'}};
}
test('recovery imports only the matching build asset with a fresh encoded query',async()=>{
 const {options,imported,fetchManifest}=setup();
 await expect(retryGuideModule(options)).resolves.toEqual({controller:true});
 expect(fetchManifest).toHaveBeenCalledTimes(1);expect(imported).toHaveBeenCalledWith(path+'?retry=fresh%20%26%20safe');
});
test.each([null,{}, {sourceDigest:'b'.repeat(64),assets:[path]}, {sourceDigest:digest,assets:null}, {sourceDigest:digest,assets:[]},
 {sourceDigest:digest,assets:['https://other.example/assets/practiceGuideController-x.js']},
 {sourceDigest:digest,assets:['/assets/../practiceGuideController-x.js']},
 {sourceDigest:digest,assets:[path,'/assets/practiceGuideController-second.js']},
 {sourceDigest:digest,assets:[null,42,'/assets/index.js']}])('invalid/stale/foreign manifest cannot supply executable code: %j',async value=>{
 const {options,imported}=setup(value);await expect(retryGuideModule(options)).rejects.toThrow();expect(imported).not.toHaveBeenCalled();
});
test('missing build identity and failed requests never import code',async()=>{
 const {options,imported,fetchManifest}=setup();await expect(retryGuideModule({...options,expectedDigest:''})).rejects.toThrow('Reload');expect(fetchManifest).not.toHaveBeenCalled();
 const denied=setup(undefined,false);await expect(retryGuideModule(denied.options)).rejects.toThrow('unavailable');expect(denied.imported).not.toHaveBeenCalled();
 fetchManifest.mockRejectedValueOnce(new Error('offline'));await expect(retryGuideModule(options)).rejects.toThrow('offline');expect(imported).not.toHaveBeenCalled();
});
test('module download errors remain actionable and do not produce a false success',async()=>{
 const {options,imported}=setup();imported.mockRejectedValueOnce(new Error('download failed'));await expect(retryGuideModule(options)).rejects.toThrow('download failed');
});

test('default request bypasses a stale manifest cache and creates fresh retry URLs',async()=>{
 const originalFetch=globalThis.fetch;
 const fetchMock=jest.fn<typeof fetch>().mockResolvedValue({ok:true,json:async()=>({sourceDigest:digest,assets:[path]})} as Response);
 globalThis.fetch=fetchMock;
 try {
  const imported=jest.fn<(url:string)=>Promise<unknown>>().mockResolvedValue({});
  await retryGuideModule({expectedDigest:digest,importModule:imported});
  await retryGuideModule({expectedDigest:digest,importModule:imported});
  expect(fetchMock).toHaveBeenCalledWith('/edition.json',{cache:'no-store'});
  expect(imported.mock.calls[0][0]).toMatch(/^\/assets\/practiceGuideController-abc_123\.js\?retry=\d+-[a-z0-9]+$/);
  expect(imported.mock.calls[0][0]).not.toBe(imported.mock.calls[1][0]);
 } finally {globalThis.fetch=originalFetch;}
});

test('the native importer rejects an unavailable manifest-listed asset',async()=>{
 const {options}=setup();
 await expect(retryGuideModule({expectedDigest:digest,fetchManifest:options.fetchManifest,nonce:options.nonce})).rejects.toThrow();
});
