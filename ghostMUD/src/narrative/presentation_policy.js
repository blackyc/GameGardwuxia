export const PRESENTATION_POLICY = Object.freeze({
  roomDescription: { surface: 'scene', archive: false },
  npcDossier: { surface: 'conversation', archive: false },
  conversation: { surface: 'conversation', archive: 'summary' },
  proactiveLine: { surface: 'ribbon', archive: false },
  bark: { surface: 'moment', archive: false },
  discovery: { surface: 'moment', archive: 'detail' },
  relationChange: { surface: 'moment', archive: 'detail' },
  searchEvent: { surface: 'find', archive: 'summary' },
  lookResult: { surface: 'look', archive: false },
  system: { surface: 'log', archive: true },
  action: { surface: 'log', archive: true },
  narrator: { surface: 'log', archive: true }
});

export function getPresentationPolicy(kind) {
  return PRESENTATION_POLICY[kind] || PRESENTATION_POLICY.system;
}

