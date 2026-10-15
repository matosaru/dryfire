// Stable screen identifiers; shared by the build-time wrappers and navigation.
export const PAGE_DEFINITIONS = Object.freeze([
  {
    "id": "gunSetup",
    "titleId": "gunSetupTitle"
  },
  {
    "id": "guns",
    "titleId": "gunsTitle"
  },
  {
    "id": "home",
    "titleId": "home-title"
  },
  {
    "id": "learn",
    "titleId": "learn-title"
  },
  {
    "id": "drills",
    "titleId": "drills-title"
  },
  {
    "id": "practice",
    "titleId": "practice-title"
  },
  {
    "id": "session",
    "titleId": "session-title"
  },
  {
    "id": "practiceGuide",
    "titleId": "practiceGuide-title"
  },
  {
    "id": "recognize",
    "titleId": "recognize-title"
  },
  {
    "id": "history",
    "titleId": "history-title"
  },
  {
    "id": "settings",
    "titleId": "settings-title"
  },
  {
    "id": "about",
    "titleId": "about-title"
  },
  {
    "id": "contact",
    "titleId": "contact-title"
  }
]);
export const PAGE_IDS = Object.freeze(PAGE_DEFINITIONS.map(page => page.id));
