# Retained optional features

CHG-032 keeps this internal source package for full development and later monetization; it is not a separately published npm package.

- `progressView.js`: advanced chart/range/group/table presentation. Imported only by the compiled full-preview branch and excluded from public output.
- `customDrillEditor.js`: retained sequence editor. Public users can edit only an existing preset owned by the current gun; new creation is disabled. It remains in the public bundle for legacy editing.
- Gun creation/storage stays shared so existing profiles and compatible multi-gun backups remain usable. CHG-034 public creation accepts at most two guns; preview retains five.

Nothing is deleted from IndexedDB. Preset execution, basic modes, text session summaries, metadata editing, backup and safety stay shared. No payment/account/billing code exists to remove. See [edition requirements](../../docs/requirements/build-editions.md) and [testing guide](../../docs/development/free-preview-testing.md). Build flags control published availability; they do not prove payment or protect a public hosted preview.
