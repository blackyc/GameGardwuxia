const TIME_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function inventoryCounts(inventory = []) {
  return inventory.reduce((counts, item) => {
    if (!item) return counts;
    const id = item.id || item.item || item.name;
    if (!id) return counts;
    counts[id] = (counts[id] || 0) + Number(item.count || item.quantity || 1);
    return counts;
  }, {});
}

export function createNarrativeContext(game, overrides = {}) {
  const state = game?.state || {};
  const roomId = overrides.roomId || state.location || '';
  const room = game?.LOCATIONS?.[roomId] || {};
  const path = state.path === 'ling' ? 'ling' : 'wu';
  const realms = path === 'ling'
    ? (game?.LING_REALMS || [])
    : (game?.WU_REALMS || game?.REALMS || []);
  const gameTime = ((Number(state.gameTime) || 0) % 12 + 12) % 12;
  const timePeriod = gameTime === 0 || gameTime === 1 || gameTime === 11
    ? 'night'
    : gameTime >= 2 && gameTime <= 4
      ? 'morning'
      : gameTime >= 5 && gameTime <= 7
        ? 'noon'
        : 'dusk';
  const npcId = overrides.npcId || null;

  return {
    state,
    player: {
      path,
      realm: Number(state.realm) || 0,
      realmName: realms[Number(state.realm) || 0]?.name || '',
      faction: state.faction || state.factionId || state.sect || '',
      cultivation: Number(state.cultivation) || 0,
      daoxin: Number(state.daoxin) || 0,
      skills: state.skills || {}
    },
    room: {
      id: roomId,
      region: room.region || roomId.split('·')[0] || '',
      zoneKind: room.zoneKind || (roomId.startsWith('问剑峰·') ? 'faction_hq' : 'world')
    },
    time: {
      index: gameTime,
      name: TIME_NAMES[gameTime] + '时',
      period: timePeriod
    },
    quest: {
      primary: state.primaryQuestId || null,
      active: state.activeQuests || [],
      completed: state.completedQuests || [],
      stages: state.questStages || {}
    },
    inventory: {
      counts: inventoryCounts(state.inventory)
    },
    flags: {
      ...(state.worldEvents || {}),
      ...(state.narrativeFlags || {})
    },
    npc: npcId ? {
      id: npcId,
      memory: state.npcMemory?.[npcId] || {},
      affinity: Number(state.npcMemory?.[npcId]?.affinity || 0)
    } : null,
    story: {
      arc: state.storyArc || null,
      chapter: state.storyChapter || null,
      phase: state.storyPhase || state.tutorialPhase || null
    },
    game,
    ...overrides
  };
}

export { TIME_NAMES };

