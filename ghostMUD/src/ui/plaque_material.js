// Room plaque material contract.
//
// Room data may declare `plaqueMaterial` with one of the catalog keys below.
// Keep the semantic distinction: materials communicate place identity, not rarity.
// Unknown or missing values intentionally fall back to `wood`.
export const PLAQUE_MATERIAL_CATALOG = Object.freeze({
  wood: Object.freeze({
    status: 'active',
    use: 'Default for roads, villages, sect paths, courtyards and ordinary rooms.'
  }),
  'cyan-gold': Object.freeze({
    status: 'reserved',
    use: 'Reserved for imperial offices, major halls, ancient institutions and spirit ruins.'
  }),
  cinnabar: Object.freeze({
    status: 'reserved',
    use: 'Reserved for forbidden grounds, battle arenas and rooms with explicit danger.'
  })
});

// Long-lived explicit exceptions belong here when changing source room data is undesirable.
// Prefer a room's own `plaqueMaterial` field for new content so narrative data stays self-describing.
export const ROOM_PLAQUE_MATERIAL_OVERRIDES = Object.freeze({
  // Example only: 'yingtian_imperial_office': 'cyan-gold'
  // Example only: 'forbidden_sword_tomb': 'cinnabar'
});

export function resolvePlaqueMaterial(locationId, roomData) {
  const requested = roomData?.plaqueMaterial || ROOM_PLAQUE_MATERIAL_OVERRIDES[locationId] || 'wood';
  return Object.prototype.hasOwnProperty.call(PLAQUE_MATERIAL_CATALOG, requested) ? requested : 'wood';
}

export function applyPlaqueMaterial(locationId, roomData) {
  const plaque = document.querySelector('.location-plaque');
  if (!plaque) return 'wood';
  const material = resolvePlaqueMaterial(locationId, roomData);
  plaque.dataset.plaqueMaterial = material;
  return material;
}
