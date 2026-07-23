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

export function resolveTimePeriod(gameTime = 0) {
  const time = ((Number(gameTime) || 0) % 12 + 12) % 12;
  if (time === 0 || time === 1 || time === 11) return 'night';
  if (time >= 2 && time <= 4) return 'morning';
  if (time >= 5 && time <= 7) return 'noon';
  return 'dusk';
}

export function isEligibleForContext(entry, context) {
  if (!entry || !context) return false;
  const requirements = entry.conditions || entry;
  const inventory = context.state?.inventory || [];
  if (requirements.paths && !requirements.paths.includes(context.path)) return false;
  if (requirements.zoneKinds && !requirements.zoneKinds.includes(context.policy.zoneKind)) return false;
  if (requirements.roomIds && !requirements.roomIds.includes(context.roomId)) return false;
  if (requirements.excludeRoomIds && requirements.excludeRoomIds.includes(context.roomId)) return false;
  if (requirements.regions && !requirements.regions.some(prefix => context.roomId.startsWith(prefix))) return false;
  if (Number.isFinite(requirements.realmMin) && context.realm < requirements.realmMin) return false;
  if (Number.isFinite(requirements.realmMax) && context.realm > requirements.realmMax) return false;
  if (requirements.gameTimes && !requirements.gameTimes.includes(context.gameTime)) return false;
  if (requirements.timePeriods && !requirements.timePeriods.includes(context.timePeriod)) return false;
  if (requirements.excludeTimePeriods?.includes(context.timePeriod)) return false;
  if (requirements.requiresCompanion && context.state.guideCompanion !== requirements.requiresCompanion) return false;
  if (requirements.requiresFlag && !context.state[requirements.requiresFlag]) return false;
  if (requirements.excludesFlag && context.state[requirements.excludesFlag]) return false;
  if (requirements.requiresItem && !inventory.some(item => item?.id === requirements.requiresItem)) return false;
  if (requirements.excludesItem && inventory.some(item => item?.id === requirements.excludesItem)) return false;
  // Multi-character scenes are opt-in at night; this blocks obviously implausible
  // legacy/random events without trying to infer cast from prose.
  const castSize = Number(entry.castSize ?? requirements.castSize ?? 1);
  const multiActor = entry.multiActor === true || requirements.multiActor === true || castSize > 1;
  if (context.timePeriod === 'night' && multiActor && requirements.allowAtNight !== true) return false;
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
    const gameTime = Number(this.game.state.gameTime) || 0;
    return { ...perspective, roomId, room, policy, gameTime, timePeriod: resolveTimePeriod(gameTime), state: this.game.state };
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
    const state = this.game.state;
    state.worldEvents ||= {};
    state.searchEventAttempts ||= {};
    for (const event of events) {
      if (!event || !isEligibleForContext(event, context)) continue;
      const isUnique = event.once === true || event.unique === true;
      if (isUnique && (!event.id || state.worldEvents[event.id])) continue;
      if (event.item?.id && (state.inventory || []).some(item => item?.id === event.item.id)) {
        if (isUnique && event.id) {
          state.worldEvents[event.id] = true;
          this.game.markDirty?.();
        }
        continue;
      }
      const attempts = Number(state.searchEventAttempts[event.id] || 0);
      const nextAttempt = attempts + 1;
      const guaranteed = Number.isFinite(event.pityAfter) && nextAttempt >= event.pityAfter;
      if (guaranteed || Math.random() <= (event.chance ?? 1)) return event;
      if (event.id) {
        state.searchEventAttempts[event.id] = nextAttempt;
        this.game.markDirty?.();
      }
    }
    return null;
  }
  applySearchEvent(event) {
    if (!event) return false;
    const state = this.game.state;
    state.worldEvents ||= {};
    state.searchEventAttempts ||= {};
    if ((event.once === true || event.unique === true) && event.id) state.worldEvents[event.id] = true;
    if (event.id) delete state.searchEventAttempts[event.id];
    if (event.item && !(state.inventory || []).some(item => item?.id === event.item.id)) {
      state.inventory.push({ ...event.item });
    }
    return true;
  }
}

export default WorldContextService;
