# Remaining trusted HTML fragments

All13 screen parents now come from typed page packages in `apps/web/src/pages/`, composed with the shared AppShell/header/footer/navigation and contextual safety/gun components. [The compiler](../../tools/page-templates.mjs) uses these same sources for both editions; `index.html` owns metadata and its single app mount.

Only three raw fragments remain active: [view.html](view.html) supplies stable screen wrappers; [history-progress.html](shared/history-progress.html) and [preview-testing.html](shared/preview-testing.html) retain the existing private controls and edition markers. Their native/service lifetimes remain explicit islands during the staged runtime migration.

P7 removed12 superseded layout/chrome/page templates after an import/consumer audit and byte-identical complete compiled HTML comparison. The readiness test now exercises the actual compiled app. Historical baselines and frozen fixtures remain in tests/Git; they are not production owners.

Edit the owning typed component and its CSS/tests to change a screen. Preserve stable [page definitions](../pageDefinitions.js), IDs, configuration drafts, live/example presentation and guide media. Follow the [architecture](../../docs/architecture/page-templates.md), [refactor plan](../../docs/project/react-refactor/plan.md) and requirement/design approval process. Native startup fallback retirement and performance acceptance remain P7.
