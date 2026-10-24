import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } from 'jose';
import { createPrivatePreview } from '../workers/privatePreview.js';

const issuer = 'https://test-team.cloudflareaccess.com';
const hostname = 'dev-dryfire.matosaru.workers.dev';
let privateKey, keys;
beforeAll(async () => {
  const pair = await generateKeyPair('RS256'); privateKey = pair.privateKey;
  keys = createLocalJWKSet({ keys: [{ ...await exportJWK(pair.publicKey), kid: 'test', alg: 'RS256' }] });
});
function environment() {
  let reads = 0;
  return { ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com', ACCESS_AUD: 'test-audience', ACCESS_HOSTNAME: hostname,
    ACCESS_ALLOWED_EMAILS: 'matosaru@gmail.com', ASSETS: { fetch: async () => { reads++; return new Response('<html>private</html>'); } }, get reads() { return reads; } };
}
const gate = () => createPrivatePreview({ keySetFor: () => keys });
const request = (token, path = '/assets/app.js', host = hostname) => new Request(`https://${host}${path}`, { headers: token ? { 'Cf-Access-Jwt-Assertion': token } : {} });
async function token({ email = 'matosaru@gmail.com', audience = 'test-audience', tokenIssuer = issuer, expiry = '5m' } = {}) {
  return new SignJWT({ email }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuer(tokenIssuer).setAudience(audience)
    .setIssuedAt().setExpirationTime(expiry).sign(privateKey);
}
test('anonymous asset requests never reach the asset binding', async () => {
  const env = environment();
  for (const path of ['/', '/assets/app.js', '/sw.js', '/edition.json', '/pcm-capture.worklet.js']) expect((await gate().fetch(request(null, path), env)).status).toBe(401);
  expect(env.reads).toBe(0);
});
test('missing Access configuration fails closed before any assets are served', async () => {
  for (const key of ['ACCESS_TEAM_DOMAIN', 'ACCESS_AUD', 'ACCESS_HOSTNAME', 'ACCESS_ALLOWED_EMAILS']) {
    const env = environment(); env[key] = ''; expect((await gate().fetch(request(await token()), env)).status).toBe(503); expect(env.reads).toBe(0);
  }
});
test('forged, expired, wrong-audience and wrong-issuer tokens cannot serve private assets', async () => {
  for (const value of ['forged.header.signature', await token({ expiry: '-1s' }), await token({ audience: 'other-audience' }), await token({ tokenIssuer: 'https://other-team.cloudflareaccess.com' })]) {
    const env = environment(); expect((await gate().fetch(request(value), env)).status).toBe(401); expect(env.reads).toBe(0);
  }
});
test('a signed token for another email is still denied', async () => {
  const env = environment(); expect((await gate().fetch(request(await token({ email: 'other@example.com' })), env)).status).toBe(403); expect(env.reads).toBe(0);
});
test('even an authorized token cannot expose an alternate hostname', async () => {
  const env = environment(); expect((await gate().fetch(request(await token(), '/', 'alternate.workers.dev'), env)).status).toBe(404); expect(env.reads).toBe(0);
});
test('valid allowed identity serves assets with private cache and indexing boundaries', async () => {
  const env = environment(); const response = await gate().fetch(request(await token()), env);
  expect(response.status).toBe(200); expect(await response.text()).toContain('private'); expect(env.reads).toBe(1);
  expect(response.headers.get('cache-control')).toBe('private, no-store'); expect(response.headers.get('x-robots-tag')).toContain('noindex');
});
test('a signed identity without expiry cannot create indefinite access', async () => {
  const value = await new SignJWT({ email: 'matosaru@gmail.com' }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuer(issuer).setAudience('test-audience').sign(privateKey);
  const env = environment(); expect((await gate().fetch(request(value), env)).status).toBe(403); expect(env.reads).toBe(0);
});

test('authenticated app deep links resolve assets only after authorization, with private headers',async()=>{
 const allowed=await token({}),env=environment();let location;env.ASSETS.fetch=async request=>{location=new URL(request.url);return new Response('app');};
 const response=await gate().fetch(request(allowed,'/app/history/?private=ignored'),env);expect(response.status).toBe(200);expect(location.pathname).toBe('/');expect(location.search).toBe('');expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
 const denied=environment();expect((await gate().fetch(request(null,'/app/history/'),denied)).status).toBe(401);expect(denied.reads).toBe(0);
});
