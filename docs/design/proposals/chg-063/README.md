# CHG-063 audio learning and recognition UX

Status: implementation direction on `feature/audio-recognition-v3`; current production screens remain authoritative until reviewed captures replace this proposal.

## Learn screen

The trigger card remains first and required. Directly below its recordings, show one compact **Trigger profile** status card:

- **Needs samples** — “Record at least three natural trigger presses.”
- **Variable** — “The examples differ. Keep one room and phone position; reset and rerecord if this stays variable.”
- **Stable** — “Examples are consistent. Run Sound check before practice.”

Primary action: **Run sound check**. Secondary disclosure: **Improve recognition**, containing optional negative/calibration categories. The status uses text plus an icon; color is supplemental.

## Sound check

Use the shared page shell and active-gun context. The content follows a short sequence:

1. **Prepare** — representative phone position, quiet prompt and media-volume reminder.
2. **Ready** — live microphone meter and explicit room status.
3. **Test** — the user chooses an expected trigger count, then performs presses after clear prompts.
4. **Review** — expected, matched, missed, false and duplicate counts; one recommended next action.

The review must say that the result measures this check only. It does not prove safe handling or universal accuracy.

## Practice and sequence setup

Beside **Sound at start**, add an outlined **Test start sound** button using the existing secondary-control style. Supporting text: “Uses your phone's media volume.” The same shared component appears for trigger practices and sequence drills.

## Run readiness

Replace ambiguous waiting copy with one of:

- “Preparing microphone…”
- “Microphone ready · Listening before the signal”
- “Room is noisy · Move closer or reduce background sound”
- “Microphone unavailable · Check Safari permission”

The microphone meter remains visible. A noisy state does not disable Stop or trap navigation.

## Accessibility and responsive behavior

- Status changes use the existing polite live region and do not repeat continuously with meter updates.
- Buttons have explicit names; status icons are decorative.
- Copy remains readable at 320 px, 200% zoom and both themes.
- Motion is not required to understand profile or readiness status.

