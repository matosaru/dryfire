# Guide media input-equivalence review

The CHG-063 candidate changes setup-only controls, Learn-only profile guidance and the generated cue envelope. The shared controlled guide examples do not play Web Audio. Existing guide frame-model/signature tests pass with the new 190 ms practice cue guard, establishing that every displayed guide state and timeline remains unchanged.

A local system-Chromium export was generated on 2026-11-01 as a diagnostic. Its viewport content had different font metrics and dimensions from the pinned container renderer, so it is not accepted as replacement media. Existing pinned GIF bytes and their reviewed hashes are retained. The manifest adds the new CSS owner and updates source hashes only after this input-equivalence review. Canonical pinned CI remains the final visual gate.
