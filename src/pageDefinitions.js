// Stable identifiers are the runtime contract. Heading metadata is used only
// when composing templates; a pure derivation keeps it out of the app bundle.
export const PAGE_IDS = Object.freeze(["gunSetup", "guns", "home", "learn", "drills", "practice", "session", "practiceGuide", "recognize", "history", "settings", "about", "contact"]);
export const PAGE_DEFINITIONS = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ PAGE_IDS.map(id => ({ id, titleId: ({ gunSetup: 'gunSetupTitle', guns: 'gunsTitle' })[id] ?? `${id}-title` }))
);
