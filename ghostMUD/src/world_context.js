/**
 * World-context policy.
 *
 * Keeps region rules out of renderer code: authored faction spaces do not
 * inherit city encounters or rumours, while dungeon spaces can opt into them.
 */
export function resolvePlayerPerspective(state = {}, data = {}) {
  const path = state.path === 'ling' ? 'ling' : 'wu';
  const realms = path === 'ling' ? (data.LING_REALMS || []) : (data.WU_REALMS || data.REALMS || []);
  const realm = Math.max(0, Math.min(Number(state.realm) || 0, Math.max(0, realms.length - 1)));
  return { path, realm, realmName: realms[realm]?.name || '' };
}

export function resolveZonePolicy(roomId = '', room = {}) {
  const zoneKind = room.zoneKind || (roomId.startsWith('问剑峰·') ? 'faction_hq' : 'world');
  if (zoneKind === 'faction_hq') {
    return {
      zoneKind,
      allowAmbientNpc: false,
      allowRandomCombat: false,
      allowRoomRumors: false,
      allowSearch: true,
      authoredNpcOnly: true
    };
  }
  if (zoneKind === 'dungeon') {
    return {
      zoneKind,
      allowAmbientNpc: false,
      allowRandomCombat: true,
      allowRoomRumors: false,
      allowSearch: true,
      authoredNpcOnly: true
    };
  }
  return {
    zoneKind,
    allowAmbientNpc: true,
    allowRandomCombat: true,
    allowRoomRumors: true,
    allowSearch: true,
    authoredNpcOnly: false
  };
}

export function isEligibleForContext(entry, context) {
  if (!entry) return false;
  const requirements = entry.conditions || entry;
  if (requirements.paths && !requirements.paths.includes(context.path)) return false;
  if (requirements.zoneKinds && !requirements.zoneKinds.includes(context.policy.zoneKind)) return false;
  if (requirements.regions && !requirements.regions.some(prefix => context.roomId.startsWith(prefix))) return false;
  if (Number.isFinite(requirements.realmMin) && context.realm < requirements.realmMin) return false;
  if (Number.isFinite(requirements.realmMax) && context.realm > requirements.realmMax) return false;
  if (requirements.requiresCompanion && context.state.guideCompanion !== requirements.requiresCompanion) return false;
  if (requirements.requiresFlag && !context.state[requirements.requiresFlag]) return false;
  if (requirements.requiresItem && !(context.state.inventory || []).some(item => item?.id === requirements.requiresItem)) return false;
  return true;
}

export class WorldContextService {
  constructor(game) {
    this.game = game;
  }

  get(roomId = this.game.state.location) {
    const room = this.game.LOCATIONS[roomId] || {};
    const perspective = resolvePlayerPerspective(this.game.state, this.game.data);
    const policy = resolveZonePolicy(roomId, room);
    return { ...perspective, roomId, room, policy, state: this.game.state };
  }

  getZonePolicy(roomId) {
    return this.get(roomId).policy;
  }

  canTriggerArrivalNpc(roomId) {
    return this.get(roomId).policy.allowAmbientNpc;
  }

  canTriggerRandomCombat(roomId) {
    return this.get(roomId).policy.allowRandomCombat;
  }

  getNpcPool(roomId = this.game.state.location) {
    const context = this.get(roomId);
    const pool = this.game.NPC_ENCOUNTERS[roomId] || [];
    return pool.filter((entry) => {
      if (!isEligibleForContext(entry, context)) return false;
      if (!context.policy.authoredNpcOnly) return true;
      return entry.source === 'authored' || entry.authored === true || entry.zoneScoped === true;
    });
  }

  getRumors(roomId = this.game.state.location) {
    const context = this.get(roomId);
    if (!context.policy.allowRoomRumors) return [];
    const roomRumors = context.room.rumors || context.room.gossip || [];
    return (Array.isArray(roomRumors) ? roomRumors : [roomRumors])
      .filter(Boolean)
      .filter(entry => typeof entry === 'string' || isEligibleForContext(entry, context))
      .map(entry => typeof entry === 'string' ? entry : entry.text)
      .filter(Boolean);
  }

  getNpcRumor(npc, roomId = this.game.state.location) {
    const context = this.get(roomId);
    if (!isEligibleForContext(npc, context)) return '';
    const source = npc?.askLines || npc?.rumors || npc?.rumor || npc?.gossip || npc?.hint;
    const lines = Array.isArray(source) ? source : (source ? [source] : []);
    const valid = lines
      .filter(entry => typeof entry === 'string' || isEligibleForContext(entry, context))
      .map(entry => typeof entry === 'string' ? entry : entry.text)
      .filter(Boolean);
    return valid.length ? valid[Math.floor(Math.random() * valid.length)] : '';
  }

  resolveSpecialSearch(roomId = this.game.state.location) {
    const context = this.get(roomId);
    const events = context.room.searchEvents || [];
    for (const event of events) {
      if (!event || !isEligibleForContext(event, context)) continue;
      if (event.once && this.game.state.worldEvents?.[event.id]) continue;
      if (event.requiresItem && (this.game.state.inventory || []).some(item => item?.id === event.requiresItem)) continue;
      if (Math.random() <= (event.chance ?? 1)) return event;
    }
    return null;
  }

  applySearchEvent(event) {
    if (!event) return false;
    const state = this.game.state;
    state.worldEvents ||= {};
    if (event.once) state.worldEvents[event.id] = true;
    if (event.item && !(state.inventory || []).some(item => item?.id === event.item.id)) {
      state.inventory.push({ ...event.item });
    }
    return true;
  }
}

export default WorldContextService;
