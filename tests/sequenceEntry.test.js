import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const choose=source.slice(source.indexOf('async function chooseDrill('),source.indexOf('function renderCustomCatalog('));
function setup(open){const drill={id:'rack-trigger'},error=jest.fn();const context={profileLocked:()=>false,activeGun:{id:'gun-a'},currentDrill:()=>drill,preferencePending:false,renderLiveButton:jest.fn(),renderClassCards:jest.fn(),setGunSetting:jest.fn(async()=>{}),sessionController:{open},showError:error};return{context,drill,run:runInNewContext(choose+'\nchooseDrill;',context)};}
test('a deep-link sequence selection waits for its configuration owner',async()=>{let release;const pending=new Promise(resolve=>{release=resolve;});const s=setup(jest.fn(()=>pending));let done=false;const result=s.run('rack-trigger').then(()=>{done=true;});await new Promise(resolve=>setImmediate(resolve));expect(s.context.sessionController.open).toHaveBeenCalledWith(s.drill);expect(done).toBe(false);release();await result;expect(done).toBe(true);expect(s.context.preferencePending).toBe(false);});
test('a configuration download/read failure is reported for catalog clicks without an unhandled rejection',async()=>{const error=new Error('Configuration unavailable'),s=setup(jest.fn(async()=>{throw error;}));await expect(s.run('rack-trigger')).resolves.toBeUndefined();expect(s.context.showError).toHaveBeenCalledWith(error);expect(s.context.preferencePending).toBe(false);});
