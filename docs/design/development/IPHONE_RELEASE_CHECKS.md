# iPhone release checks — trigger-first practice

Updated: 2026-10-11. Target confirmed by the user: **iPhone Safari and the Home Screen app**. This verifies CHG-015 and the retained CHG-014 sequences/settings; it adds no product scope. The user authorized automatic implementation and will review the final app, so no per-step confirmation is pending.

Application: `https://dryfire.matosaru.workers.dev`. Use the latest CHG-015 implementation commit in [implementation history](../implementation-history.md). The older `6119b8f` contains sequences/settings but predates the six practice modes. Package version **0.8.0** alone does not identify the current update.

## Current evidence

| Check | Observed result |
| --- | --- |
| Source/build acceptance | 222 Jest tests across 17 suites, 16 smoke checks, production build and `verify:dist` passed |
| Browser acceptance | Nine suites / 40 checks covering modes, actual Learn-to-live compatibility, learning, lifecycle/storage failure, legacy sequences, settings, migration and layouts; see [validation record](PRACTICE_VALIDATION.md) |
| GitHub publication | Implementation [`8b8aec9`](https://github.com/matosaru/dryfire/commit/8b8aec9) pushed to `main`; remote full hash `8b8aec987bacc6be3f9cb76f883d8432ecabdbfb` observed |
| Production app/build-status access | Workspace CONNECT requests to the app and GitHub API failed with gateway 403 before destination content arrived on 2026-10-11; Git transport remains usable |
| Cloudflare production deployment | Unverified |
| Physical iPhone microphone, beep and feedback | Not run; device/browser choice confirmed |

## Confirm production

1. Cloudflare → Workers & Pages → **dryfire** → Deployments: record the latest successful **production** deployment's commit and ID. It must include the latest CHG-015 implementation commit or a descendant. A preview is separate.
2. Production branch `main`, build `npm run build`, deploy `npx wrangler deploy`, assets `dist/`. Branch preview uses `npx wrangler preview`. See [deployment guide](DEPLOY.md).
3. On **Learn**, Trigger is the primary card; Optional sounds and Improve recognition are expandable. On **Drills**, six practice cards appear above the preserved sequence presets/custom editor. These visible features distinguish this update from CHG-014.
4. Reload or close/reopen the Home Screen app after the updated service worker activates. Expected cache: **dryfire-sound-trainer-v13**. Do not clear site data to fetch the update.
5. The validated build uses `index-Dzm7VxiF.js`, `index-Hc2oJHTM.css` and cache v13. Rebuilds may produce other hashes; a successful production deployment commit is the source evidence.

Direct workspace verification remains blocked by the network gateway. Required additive destinations are `dryfire.matosaru.workers.dev` and `api.github.com`; retain existing allowlist entries. Unknown environment settings were not overwritten. Git authentication already works; no replacement GitHub token is needed for repository operations.

## Run on iPhone

Export a whole-library backup first. Use a selected gun with compatible Trigger examples, then complete the in-app safety acknowledgement. Only referenced events are needed for optional reload/sequence modes. Record the iPhone model, iOS, app context, deployed commit and time. Check Safari and Home Screen separately; storage contexts can differ.

Use **Pass**, **Fail**, **Unavailable** or **Not run**, plus a short observation. An API reporting support does not prove physical output.

| Check | Expected result | Safari | Home Screen |
| --- | --- | --- | --- |
| Existing data/reload | Gun names/types, selection, examples, presets, preferences and old/new results remain | Not run | Not run |
| Trigger-only readiness | Single/Repeated/Par/Control/Free start with 3 Trigger examples; optional untrained sounds do not block them | Not run | Not run |
| Calibration/rejection | Reset/noise examples save only for this gun; isolated reset/handling/speech/clap/cue trials add no shots. Separately record false counts and missed intended clicks | Not run | Not run |
| Single | 2 repetitions; each signal gives one signal-to-click result; Next starts a fresh ready delay | Not run | Not run |
| Repeated/Control | One signal, distinct accepted clicks, count target and consecutive interval statistics; microphone alone does not grade movement | Not run | Not run |
| Par-time | In-time onset counts; absent/late click is a miss without an in-time shot. Finishing status allows captured audio to finish segmenting | Not run | Not run |
| Reload | Only two chosen endpoint calibrations required; order and between-event split saved; handling is never a shot | Not run | Not run |
| Free | Accepted click total and active duration; limit/End saves review; paused time excluded | Not run | Not run |
| App cue On/Off | On emits one audible beep per signal; cue alone adds no shot. Off is silent with visual GO. Record placement/latency and very fast clicks | Not run | Not run |
| External cue | 3 cue examples required; waits for the calibrated beep; cue starts acoustic timing without an app beep/shot | Not run | Not run |
| Pause/Resume/End/background | Capture releases; partial results retained; fresh signal on Resume; reopening never automatically reacquires the microphone | Not run | Not run |
| Random/fixed timing | Saved choices honored; each discrete repetition gets a fresh bounded ready delay | Not run | Not run |
| Saved review/gun isolation | History reopens correct gun's mode/configuration/hits/misses/partials/timings after refresh | Not run | Not run |
| Legacy built-in/custom sequences | Original order/custom presets remain; only referenced sounds required; existing results readable | Not run | Not run |
| Audio settings | Supported Noise Filter/Auto Gain saved per gun and applied next capture with truthful track reports; unavailable controls do not block capture | Not run | Not run |
| Appearance/feedback | Dark/Light/System persist; physical vibration checked separately where available; Safari may lack vibration API | Not run | Not run |
| Permission denial | Editable configuration and clear error, no invented result or stuck gun lock; retry after permission restoration | Not run | Not run |
| Whole-library backup | Version 4 includes all guns, legacy/practice results, calibration and preferences; file retained in Files | Not run | Not run |

New beep mode excludes the first **80 ms** after scheduled GO; legacy sequences retain **300 ms**. Acoustic onset, output latency and segmentation precision limit reaction timing. Similar press/reset sounds can remain ambiguous and conservative rejection can miss an intended press. No acoustic detection verifies unloaded status, aim or safe movement. The [accuracy protocol](ACCURACY_TESTING.md) separates false shot counts and missed clicks from software behavior.

## Record results

```text
Date/time:
iPhone model / iOS:
Context: Safari / Home Screen
Cloudflare production status / commit / deployment ID:
Passed / failed checks and exact messages:
Unavailable / not-run checks:
False shot counts / missed intended clicks / test conditions:
Microphone / speaker / vibration observations:
Data retained after refresh:
```

Add observed results to [implementation history](../implementation-history.md). Until observations arrive, production and physical-device results remain unverified; completed source/browser evidence stays recorded.
