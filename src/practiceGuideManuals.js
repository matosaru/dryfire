// Structural guide identity and sound order only. User-facing manual copy lives in practice-guide YAML catalogs.
export const GUIDE_MANUALS = [
  {
    "id": "single",
    "kind": "practice",
    "sequence": [
      "trigger"
    ]
  },
  {
    "id": "repeated",
    "kind": "practice",
    "sequence": [
      "trigger",
      "trigger",
      "trigger"
    ]
  },
  {
    "id": "par",
    "kind": "practice",
    "sequence": [
      "trigger"
    ]
  },
  {
    "id": "control",
    "kind": "practice",
    "sequence": [
      "trigger",
      "trigger",
      "trigger"
    ]
  },
  {
    "id": "sequence-trigger-only",
    "kind": "sequence",
    "sequence": [
      "trigger"
    ]
  },
  {
    "id": "sequence-rack-trigger",
    "kind": "sequence",
    "sequence": [
      "rack",
      "trigger"
    ]
  },
  {
    "id": "sequence-mag-trigger",
    "kind": "sequence",
    "sequence": [
      "reload",
      "trigger"
    ]
  },
  {
    "id": "sequence-draw-mag-trigger",
    "kind": "sequence",
    "sequence": [
      "draw",
      "reload",
      "trigger"
    ]
  },
  {
    "id": "sequence-custom",
    "kind": "sequence",
    "sequence": [
      "rack",
      "trigger",
      "trigger"
    ]
  }
];
