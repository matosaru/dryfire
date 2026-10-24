import { listeningReadiness, type ListeningReadinessInput, type ListeningReason } from './readiness';
const ready = { gunAvailable: true, count: 3, minimum: 3 };

test.each<[string,Partial<ListeningReadinessInput>,ListeningReason,boolean]>([
  ['no gun', { gunAvailable: false }, 'gun', true],
  ['loading an otherwise trained gun', { loading: true }, 'loading', true],
  ['recording', { busy: true }, 'busy', true],
  ['saving preferences', { saving: true }, 'saving', true],
  ['microphone permission pending', { connecting: true }, 'connecting', false],
  ['unsaved results', { unsaved: true }, 'unsaved', true],
  ['active timed practice', { timed: true }, 'session', false],
  ['no trigger examples', { count: 0 }, 'training', false],
  ['two trigger examples', { count: 2 }, 'training', false],
  ['exact training minimum', {}, '', false],
  ['additional examples', { count: 10 }, '', false],
  ['caller-owned minimum', { minimum: 4 }, 'training', false],
])('%s reports the capture reason separately from navigation availability', (_name, change, reason, entryDisabled) => {
  expect(listeningReadiness({ ...ready, ...change })).toEqual({ reason, entryDisabled });
});

test('in-flight work takes priority over stale profile counts, and failed saves give recovery guidance', () => {
  expect(listeningReadiness({ ...ready, loading: true, count: 0 }).reason).toBe('loading');
  expect(listeningReadiness({ ...ready, timed: true, unsaved: true }).reason).toBe('unsaved');
});

test('invalid or insufficient sample counts fail closed',()=>{
 for(const count of [NaN,Infinity,-1])expect(listeningReadiness({...ready,count}).reason).toBe('training');
});
