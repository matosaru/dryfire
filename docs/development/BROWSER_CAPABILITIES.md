# Browser capabilities for audio processing and vibration

2026-10-11 · user target: iPhone Safari / Home Screen app. This is compatibility guidance, not observed physical-device acceptance.

| Browser/device | Noise Filter / Auto Gain | Web vibration |
| --- | --- | --- |
| Chrome or Edge on Android | Generally supports the capture constraints; actual track settings and device output still need confirmation | Generally available with user activation and supported hardware |
| Chrome or Edge desktop | Generally supports capture constraints; audio device/processing may vary | API presence does not mean the computer has usable vibration hardware |
| Firefox desktop/Android | Generally supports audio constraints; verify actual capture settings | Current Firefox desktop removed the API; Android can expose it without producing vibration |
| Safari macOS/iPhone, or iPhone Home Screen app | Depends on the exact Safari/OS constraints it reports; unsupported controls stay disabled and capture still works | Safari does not expose the standard web Vibration API |
| Other browsers on iPhone | A browser-name change does not guarantee different media capabilities; test the exact browser/engine | Standard iPhone web vibration is not a supported substitute for native haptics |

The app uses `navigator.mediaDevices.getSupportedConstraints()` to enable Noise Filter (`noiseSuppression`) and Auto Gain (`autoGainControl`), then checks acquired-track settings. Supported, unconfirmed and not-applied are different states. A browser may also apply its own processing without exposing control of it. Unsupported optional settings do not block microphone recording or practice.

For all three web controls, try Chrome/Edge on an Android phone with microphone permission. Switching to Chrome on an iPhone generally does not add vibration. Appearance works independently of these device capabilities. Native iPhone haptics would need a separate approved native implementation, not an always-on web toggle.

Do not enable audio processing merely for its availability: changing it can alter click recognition, so verify or recalibrate with the chosen setting. A `vibrate()` return value/API presence is not proof of physical vibration; current status intentionally discloses unverified output.

References: [MediaDevices supported constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints), [Noise suppression](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/noiseSuppression), [Automatic gain](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/autoGainControl), [Vibration compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate#browser_compatibility). MDN browser-compatibility data for vibration was checked on 2026-10-11; real iPhone capture/recognition remains in the [release checklist](IPHONE_RELEASE_CHECKS.md).
