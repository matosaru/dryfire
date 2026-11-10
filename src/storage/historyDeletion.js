import {EVENTS,SESSIONS} from './database.js';
import {resolveGunId,withOwnedTransaction} from './library.js';

export async function deleteEvent(id,gunId){
 if(typeof id!=='string'||!id)throw new TypeError('Invalid recognition event ID.');
 const owner=await resolveGunId(gunId,true);
 return withOwnedTransaction(owner,EVENTS,(tx,context)=>{const store=tx.objectStore(EVENTS),request=store.get(id);request.onsuccess=()=>{if(!request.result||request.result.gunId!==owner){context.fail(new Error('Recognition event not found for this gun.'));return;}store.delete(id);};});
}

export async function deleteSession(id,gunId){
 if(typeof id!=='string'||!id)throw new TypeError('Invalid saved session ID.');
 const owner=await resolveGunId(gunId,true);
 return withOwnedTransaction(owner,SESSIONS,(tx,context)=>{const store=tx.objectStore(SESSIONS),request=store.get(id);request.onsuccess=()=>{if(!request.result||request.result.gunId!==owner){context.fail(new Error('Saved session not found for this gun.'));return;}store.delete(id);};});
}
