import {isAppPath} from '../src/appPaths.js';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
const deny = (status, message) => new Response(message, { status, headers: { ...privateHeaders, 'Content-Type': 'text/plain; charset=utf-8' } });
export function createPrivatePreview({ keySetFor } = {}) {
  const keySets = new Map();
  const remoteKeys = issuer => {
    if (!keySets.has(issuer)) keySets.set(issuer, createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer)));
    return keySets.get(issuer);
  };
  return { async fetch(request, env) {
    const team = env.ACCESS_TEAM_DOMAIN ?? '';
    const audience = env.ACCESS_AUD ?? '';
    const hostname = env.ACCESS_HOSTNAME ?? '';
    const emails = (env.ACCESS_ALLOWED_EMAILS ?? '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
    if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(team) || !audience || !hostname || !emails.length || !env.ASSETS) {
      return deny(503, 'Private preview authentication is not configured.');
    }
    const url = new URL(request.url);
    if (url.hostname !== hostname) return deny(404, 'Not found.');
    if (url.protocol !== 'https:') return new Response(null, { status: 308, headers: { ...privateHeaders, Location: `https://${hostname}${url.pathname}${url.search}` } });
    const token = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!token || token.length > 16384) return deny(401, 'Sign in through Cloudflare Access to use the private preview.');
    try {
      const issuer = `https://${team}`;
      const { payload } = await jwtVerify(token, (keySetFor ?? remoteKeys)(issuer), { issuer, audience, algorithms: ['RS256'] });
      if (typeof payload.exp !== 'number' || typeof payload.email !== 'string' || !emails.includes(payload.email.toLowerCase())) return deny(403, 'This identity is not allowed to use the private preview.');
    } catch { return deny(401, 'Private preview authentication failed.'); }
    let assetRequest=request;if(isAppPath(url.pathname)){const target=new URL(url);target.pathname='/';target.search='';assetRequest=new Request(target,request);}
    const asset = await env.ASSETS.fetch(assetRequest);
    const headers = new Headers(asset.headers);
    for (const [key, value] of Object.entries(privateHeaders)) headers.set(key, value);
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
  } };
}
export default createPrivatePreview();
