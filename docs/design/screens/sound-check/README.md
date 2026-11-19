# Sound Check

CHG-063 adds a labelled, gun-owned check reached from the Trigger profile card. Setup records the expected sound, attempt count (1–50), room and stable phone-distance category. CHG-066 displays one selected system: Metric uses Close under 30 cm, Normal 30 cm–1 m and Far over 1 m; Imperial uses Close under 1 ft, Normal 1–3 ft and Far over 3 ft. Changing units does not change the stored `close`, `practice` or `far` category. **Start Sound Check** stays disabled until its lazy controller is attached, preventing an early tap from being lost. It then opens the shared safety confirmation and microphone permission flow. The microphone reaches ambient readiness before **Begin attempt** becomes available. Each attempt arms recognition for two seconds; detection is disarmed between attempts.

Review shows version-two matched triggers, misses, false shots and duplicates for this check only. When at least three newly recorded spectral trigger samples exist, the same captured events also show a version-three shadow comparison. The candidate never changes practice results. Exported JSON contains labels, versioned numeric feature vectors, decisions, timing and the supplied device/session conditions; it contains no PCM, gun name or raw recording.

![Sound Check setup](overview.dark.png)

The shared header, footer, fixed navigation, active-gun context, safety confirmation and acoustic limitations follow [shared layout](../shared/README.md). Behavior is specified by [audio recognition v3](../../../requirements/audio-recognition-v3.md), [core safety and capture](../../../requirements/core.md), and [page layout](../../../requirements/page-layout.md).
