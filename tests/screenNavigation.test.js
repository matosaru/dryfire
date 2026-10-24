import { createScreenNavigation } from '../src/screenNavigation.js';
function setup() {
  const events = new EventTarget(), entries = []; let index = -1, blocked = false; const shown = [], errors = [], cleanup = [];
  const history = { get state() { return entries[index]; }, replaceState(state) { if (index < 0) index = 0; entries[index] = state; },
    pushState(state) { entries.splice(index + 1); entries.push(state); index++; },
    go(n) { index += n; const event = new Event('popstate'); event.state = entries[index]; events.dispatchEvent(event); }, back() { this.go(-1); } };
  const nav = createScreenNavigation({ history, events, initial: { view: 'home' }, resolve: route => route.view === 'stale' ? { view: 'drills' } : route,
    show: route => shown.push(route.view), canLeave: () => !blocked, beforeLeave: async () => cleanup.push('capture stopped/saved'), onError: error => errors.push(error.message) });
  return { nav, history, entries, shown, errors, cleanup, block: () => { blocked = true; } };
}
test('Back/Forward visit actual screens and repeated selection creates no duplicate', async () => {
  const s = setup(); await s.nav.navigate({ view: 'learn' }); await s.nav.navigate({ view: 'settings' }); await s.nav.navigate({ view: 'settings' });
  expect(s.entries).toHaveLength(3); s.nav.back({ view: 'home' }); await s.nav.flush(); expect(s.shown.at(-1)).toBe('learn');
  s.history.go(1); await s.nav.flush(); expect(s.shown.at(-1)).toBe('settings'); expect(s.cleanup).toHaveLength(4);
});
test('unsaved/capture guard prevents navigation and restores browser position', async () => {
  const s = setup(); await s.nav.navigate({ view: 'practice' }); s.block(); s.history.back(); await s.nav.flush();
  expect(s.history.state.route.view).toBe('practice'); expect(s.shown).toEqual(['practice']); expect(s.errors).toHaveLength(1);
});
test('stale context is resolved safely and a new route discards obsolete Forward entries', async () => {
  const s = setup(); await s.nav.navigate({ view: 'stale' }); expect(s.shown).toEqual(['drills']);
  await s.nav.navigate({ view: 'history' }); s.history.back(); await s.nav.flush(); await s.nav.navigate({ view: 'learn' });
  expect(s.entries.map(entry => entry.route.view)).toEqual(['home', 'drills', 'learn']);
});

test('URL-aware navigation writes only resolved paths and keeps Back/Forward serialized',async()=>{
 const events=new EventTarget(),entries=[],writes=[];let index=-1;
 const history={get state(){return entries[index];},replaceState(state,_title,url){if(index<0)index=0;entries[index]=state;if(url)writes.push(url);},pushState(state,_title,url){entries.splice(index+1);entries.push(state);index++;writes.push(url);},go(n){index+=n;const event=new Event('popstate');event.state=entries[index];events.dispatchEvent(event);},back(){this.go(-1);}};
 const shown=[],nav=createScreenNavigation({history,events,initial:{view:'home'},resolve:r=>r.view==='stale'?{view:'drills'}:r,show:r=>shown.push(r.view),canLeave:()=>true,beforeLeave:async()=>{},onError:error=>{throw error;},urlFor:r=>'/app/'+r.view+'/'});
 await nav.navigate({view:'history'});await nav.navigate({view:'stale'});expect(writes).toEqual(['/app/history/','/app/drills/']);history.back();await nav.flush();expect(writes.at(-1)).toBe('/app/history/');expect(shown.at(-1)).toBe('history');
});
