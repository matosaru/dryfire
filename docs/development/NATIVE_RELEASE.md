# Release as an iPhone or Android app

**Deferred by CHG-026, 2026-10-11:** the user instructed **“I want to skip native apps for now”**. Keep this guide as future reference; the [active roadmap](../project/web-commercial-plan.md) covers web/PWA only. Do not generate native projects, implement store billing or submit to stores under the current plan.

Prepared 2026-10-11. Recommended route: **Capacitor with the built web app bundled inside its WebView**. Keep the PWA available separately. A WebView shell is a valid technical approach, but packaging alone does not prove microphone/backup reliability or App Store acceptance.

## What the repository already has

- Capacitor core/CLI/iOS/Android dependencies, currently major version 8.
- `capacitor.config.json`: app ID `app.dryfire.soundtrainer`, display name **Dry Fire With Ease**, web directory `dist`.
- `npm run cap:sync`, `npm run cap:ios`, `npm run cap:android` scripts.
- Minified Vite build, icons, same-origin local storage and foreground browser audio.

There are currently **no generated `ios/` or `android/` projects** in this checkout, no configured signing/store account, no native billing/haptics/backup-share plugins, and no observed native build or store submission. The existing Home Screen app is a PWA, not a TestFlight/App Store IPA.

## Common preparation

1. Choose and register the final bundle/application ID before first store release; use the configured ID only if it belongs to your developer accounts. Keep IDs stable across native updates. A future ID/origin change may affect access to stored data.
2. Install Node 22+ and dependencies. On a Mac, install the Xcode version supported by the installed Capacitor release; for Android use its supported Android Studio/JDK/SDK versions. Follow the version-8 official environment requirements rather than guessing older SDK versions.
3. Run the repository checks and production build:

```sh
npm install --no-audit --no-fund
npm run docs:check
npm run test:smoke
npm test
npm run build
npm run verify:dist
```

4. Create each native platform once, from the repository root:

```sh
npx cap add ios
npx cap add android
npm run cap:sync
```

`cap add ios` needs a suitable Mac environment for the full build workflow. Once generated, commit reviewed native projects/configuration while excluding credentials, build output, provisioning files and keystore secrets. Future releases run build/sync rather than adding platforms again.

5. Bundle `dist/`; do not set production `server.url` to an unversioned remote development website. A Cloudflare deployment does not update an already installed bundled native app: ship another signed app release and sync its assets. Remote website-only wrappers also bring connectivity and store minimum-functionality concerns.

## Native adaptation before release

**Microphone:** add a truthful `NSMicrophoneUsageDescription` to the generated iOS Info.plist, for example “Recognize your calibrated dry-fire mechanical clicks during practice.” For Android declare `android.permission.RECORD_AUDIO` in the generated manifest and verify the OS/WebView runtime permission flow. Permission-denied/revoked states must be recoverable. Never assume that a Safari capture test proves WKWebView capture. Check `isSecureContext`, `navigator.mediaDevices`, `getUserMedia`, AudioWorklet and local worklet loading in the actual wrapper; if needed, implement a tested native permission/audio bridge rather than silently failing. Prefer a least-privilege setup; no camera/location permission is needed for current features.

**Version target:** the current web bundle targets Safari 16.4. Choose an iOS deployment minimum consistent with that JavaScript/audio requirement and the installed Capacitor/plugins. For Android follow the generated Capacitor minimum and the current Play target-SDK requirement, verified in the console/docs at release time.

**Foreground lifecycle:** test pause/background/resume, phone interruption, route exit and STOP releasing capture. Native app-state callbacks may require an explicit bridge in addition to page visibility. No background listening service is currently implemented.

**Beep and haptics:** physically test cue timing, microphone exclusion and supported output. Web vibration is absent on iPhone. Native iPhone haptics would require a tested Capacitor Haptics integration and preference/capability handling; adding a wrapper alone does not enable the current web vibration toggle.

**Local data and backups:** Safari/PWA storage and native WebView storage are separate. Export/import to move data; do not promise automatic transfer or cloud recovery. Verify persistence through app refresh/update. Browser download/file input can differ in WebViews; implement/test native Filesystem/Share or document-picker integration where needed so exported backups are actually reachable and restore is reliable. Uninstalling an app can erase its local data.

**PWA service worker:** verify that local native asset caching cannot leave a wrapper on stale HTML/JS after upgrade. Decide and test whether to disable service-worker registration in native builds or version/cache it correctly; do not ship a change without web/native regression checks.

**Presentation:** check safe areas, keyboard, 320 px layout, native Back, Light/Dark, illustrated gun forms, safety modal and saved Review against the [visual-validation workflow](../design/visual-validation.md). Capture actual native screenshots for store listings.

**Paid features:** no native purchase code exists yet. Add store billing/restore only after the [monetization requirements](../business/monetization.md) are selected. Native payment policy applies even when the feature screen is HTML.

## iPhone build and distribution

1. Join the Apple Developer Program using the account that will own the app. The standard US membership fee is typically US$99/year; verify regional pricing and eligibility on the official enrollment page.
2. After generating/syncing the iOS project, run `npm run cap:ios` to open Xcode. Set signing Team, unique Bundle Identifier, version/build number and chosen deployment target. Configure microphone purpose text and correct app icons; don't rely on PWA icons alone becoming native icons automatically.
3. Run on a physical iPhone and complete the microphone/start-beep/storage/backup/reset checks. The simulator cannot establish physical recognition or vibration.
4. Create the app record in App Store Connect. Add accurate screenshots, description, category/age/content answers, privacy-policy and support URLs, app privacy declarations and any paid products. Disclose the actual behavior of any SDKs you add.
5. In Xcode Archive the release, then validate/upload using Organizer. Distribute via TestFlight, resolve failures and test StoreKit sandbox purchases/Restore if applicable.
6. Submit a tested build for review. Explain offline calibrated sound timing, local profiles/history, safety acknowledgement and microphone use. Apple guideline 4.2 expects sufficient app functionality; a minimal website shell can be rejected. Existing app features are a basis for review, not a guarantee. Check other applicable current guidelines and market rules.

Windows/Linux cannot produce the final iOS archive using Xcode. Use a Mac you control or a suitable Mac build service, with signing credentials managed securely. No signing or submission is performed by this guide.

## Android build and distribution

1. Open the generated project with `npm run cap:android`. Configure application ID, version code/name, icons and microphone permission/runtime behavior. Sync the release web assets again before final builds.
2. Test physical Android devices, permissions, background interruption, Back/navigation, local persistence, backups and actual beep/recognized clicks. Web vibration still needs supported hardware/user interaction; API presence is not output proof.
3. Generate a signed **Android App Bundle (.aab)** for Google Play, using Android Studio's signed-bundle workflow. Keep the upload key secure and use Play App Signing. A test/debug APK is for local installation and is not the production store artifact.
4. Create a Play Console developer account. Standard registration is typically US$25 once; verify the current account/identity/country requirements. Newly created personal accounts may need a closed-testing stage before production access; follow the console's current tester/duration requirements rather than assuming an immediate launch.
5. Add the app record, listing/screenshots, privacy-policy URL, content rating, target audience, Data safety answers and applicable billing products. Validate the current target-SDK requirement and permission declarations.
6. Upload to an internal/closed testing track, resolve prelaunch issues, verify purchase/refund/restore where implemented, then request the appropriate production release after account/testing requirements are met.

Direct APK distribution is possible outside Play, but changes installation, updates, trust and payment-channel responsibilities. Plan that separately; don't call an unsigned/debug build a store release.

## Release checklist and evidence

Keep web source/build commit, native project revision, version/build number, signed artifact, device results and store state separately recorded in the [implementation history](../project/implementation-history.md). Store approval, TestFlight/Play availability and Cloudflare deployment are distinct outcomes. Validate before publishing; changing app origin/identity requires a data-preservation plan.

The next actual native implementation step is to generate the platform projects and perform a microphone/AudioWorklet/backup/lifecycle proof on real devices, before spending time on store listings or purchases. These remain **not implemented/not tested** by the current guide.

## Official references

- [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup), [iOS](https://capacitorjs.com/docs/ios) and [Android](https://capacitorjs.com/docs/android)
- [Capacitor configuration](https://capacitorjs.com/docs/config), [Haptics](https://capacitorjs.com/docs/apis/haptics), [Filesystem](https://capacitorjs.com/docs/apis/filesystem) and [Share](https://capacitorjs.com/docs/apis/share)
- [Apple enrollment](https://developer.apple.com/programs/enroll/), [TestFlight](https://developer.apple.com/testflight/) and [App Store review](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Console setup](https://support.google.com/googleplay/android-developer/answer/6112435), [personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465) and [target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
