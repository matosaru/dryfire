# Public .app → .com permanent redirect

Owner explicitly resumed this change on 2026-10-24: “lets do then permanent redirect first”. **Owner reports the redirect created; independent live verification is blocked by this workspace network.** Cloud environment readiness reports no configured Cloudflare credentials/identity; `wrangler whoami` confirms “You are not authenticated”. The assistant made no live zone, DNS, Worker, rule or application-source change; the owner subsequently reports creating the rule. Development hosts are outside this rule.

## Exact rule

In Cloudflare, open the **easydryfire.app** zone, then **Rules → Redirect Rules → Create rule** (Single Redirect).

| Field | Value |
| --- | --- |
| Rule name | Public .app to .com |
| Match | Custom filter expression |
| Filter expression | `(http.host eq "easydryfire.app")` |
| URL redirect type | Dynamic |
| Target expression | `concat("https://easydryfire.com", http.request.uri.path)` |
| Status code | **301** |
| Preserve query string | **On** |

Before enabling, confirm https://easydryfire.com already serves the app over valid HTTPS. The .app hostname must reach Cloudflare through its active proxied/managed DNS and TLS configuration for the rule to execute. Check other enabled rules for conflicting earlier redirects; send directly to the canonical host rather than introducing a chain.

A machine-readable single-rule object is in [public-app-redirect.rule.json](cloudflare/public-app-redirect.rule.json). It is a rule definition, **not an instruction to replace an entire existing zone ruleset**. If later using an API/Terraform workflow, append/manage it within the zone's `http_request_dynamic_redirect` phase while preserving existing unrelated rules. Do not paste credentials into the repository or chat.

This intentionally matches only `easydryfire.app`, not arbitrary `.app` suffixes, development subdomains, Workers hosts, `easydryfire.com` or www variants. Additional aliases need their own explicitly configured DNS/TLS/rules. Paths and query strings are preserved; no new route is created by the redirect. An unimplemented path on .com must still be handled correctly there; SEO/public routes are a separate next change.

## Expected examples

| Request | Expected Location |
| --- | --- |
| `https://easydryfire.app/` | `https://easydryfire.com/` |
| `https://easydryfire.app/help/` | `https://easydryfire.com/help/` |
| `https://easydryfire.app/practice/single-trigger-press/?source=share` | `https://easydryfire.com/practice/single-trigger-press/?source=share` |

A redirect may point to a path not implemented yet; that is not proof the destination page exists. The known current application public route is `/`.

## Saved libraries and installed/cached app

The owner has been informed and still chose the permanent redirect. It does not copy or delete IndexedDB libraries. Export/import any old library that needs to be retained before enabling. .com cannot read .app or Workers-origin storage. Existing .com data stays on .com; the old Workers-origin app is not affected by this rule.

The current public service worker is cache-first. A previously installed/open .app client can render cached content without contacting Cloudflare, even while online; a 301 applies only when a request reaches the edge. Do not claim every installed client has migrated from a successful network test. Existing users can export from the open old app, open .com explicitly and restore there. Avoid clearing website data before exporting. No service-worker retirement/data-transfer mechanism is implemented by this rule.

## Verification after the owner enables it

Use a fresh/private browser session and check the actual network response, not only client-rendered content:

```bash
curl -sS -D - -o /dev/null 'https://easydryfire.app/'
curl -sS -D - -o /dev/null 'https://easydryfire.app/help/?source=redirect-check'
curl -sS -D - -o /dev/null 'https://easydryfire.com/'
```

Confirm:

- .app responds with301 and the exact matching HTTPS .com Location, with the query intact.
- .com root serves the application successfully, without a redirect back to .app or a loop.
- Real implemented destination paths work; unknown destination paths have the intended status. The redirect does not implement public route/SEO work.
- Test a representative already-installed/cached client separately; confirm any retained data was exported/imported deliberately.
- Development hosts are unchanged; this host-specific rule contains no match for them.

Permanent redirects can be cached. Disable the rule in Cloudflare to roll back its edge behavior; previously cached browser/search responses may persist. No UI deployment is necessary for this edge-only change.

## Current verification

The prepared JSON parses and its fixed match,301 status, fixed .com target expression and query preservation are locally checked. Representative intended URL mappings and nonmatching hosts are checked as configuration examples, not execution by Cloudflare. Documentation/link checks pass. The owner subsequently reports creating the redirect. Attempts to request both public hosts and a query-bearing .app path were blocked before reaching the sites: workspace proxy returned403 CONNECT tunnel failures. Those are environment-policy denials, not observed Cloudflare/site errors. Actual301 status/Location/query preservation, destination/domain behavior and crawler indexing remain independently unverified. Do not bypass the proxy or claim verification from the owner report alone.

[Deployment guide](DEPLOY.md) · [SEO routes and metadata plan](../seo/indexable-routes-plan.md)
