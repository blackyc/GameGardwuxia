function hashKey(value) {
  let hash = 2166136261;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function withRoom(roomId, condition = true) {
  const roomCondition = { fact: 'room.id', value: roomId };
  return condition === true ? roomCondition : { all: [roomCondition, condition] };
}

function pathVariants(source, roomId = null, prefix = 'path', priority = 20) {
  const variants = [];
  const scope = condition => roomId ? withRoom(roomId, condition) : condition;
  if (source.desc_vague) variants.push({
    id: prefix + '.wu.vague',
    priority,
    when: scope({ all: [
      { fact: 'player.path', value: 'wu' },
      { fact: 'player.realm', op: 'lte', value: 1 }
    ] }),
    content: { description: source.desc_vague }
  });
  if (source.desc_percept) variants.push({
    id: prefix + '.wu.percept',
    priority,
    when: scope({ all: [
      { fact: 'player.path', value: 'wu' },
      { fact: 'player.realm', op: 'gte', value: 2 }
    ] }),
    content: { description: source.desc_percept }
  });
  if (source.desc_awakened) variants.push({
    id: prefix + '.ling.awakened',
    priority,
    when: scope({ fact: 'player.path', value: 'ling' }),
    content: { description: source.desc_awakened }
  });
  return variants;
}

function timeVariants(source, roomId = null, prefix = 'time', priority = 10) {
  const variants = [];
  const fields = [
    ['morning', 'desc_morning'],
    ['noon', 'desc_noon'],
    ['dusk', 'desc_dusk'],
    ['night', 'desc_night']
  ];
  fields.forEach(([period, field]) => {
    if (!source[field]) return;
    const condition = { fact: 'time.period', value: period };
    variants.push({
      id: prefix + '.' + period,
      priority,
      when: roomId ? withRoom(roomId, condition) : condition,
      content: { description: source[field] }
    });
  });
  return variants;
}

function roomVariants(room) {
  return [
    ...timeVariants(room),
    ...pathVariants(room),
    ...(room.narrativeVariants || [])
  ];
}

function npcKey(npc, roomId, index) {
  return String(npc?.memoryKey || npc?.id || npc?.encounterId || (roomId + ':' + (npc?.title || npc?.name || index)));
}

function collectNpcOccurrences(data) {
  const occurrences = [];
  const seenObjects = new WeakSet();
  const add = (roomId, npc, index, source) => {
    if (!npc || typeof npc !== 'object') return;
    if (seenObjects.has(npc)) return;
    seenObjects.add(npc);
    occurrences.push({ roomId, npc, index, source });
  };

  for (const [roomId, room] of Object.entries(data?.LOCATIONS || {})) {
    const lists = [room?.npcs, room?.characters, room?.encounters];
    lists.forEach((list, listIndex) => {
      if (!Array.isArray(list)) return;
      list.forEach((npc, index) => add(roomId, npc, index, 'legacy:LOCATIONS.list.' + listIndex));
    });
  }
  for (const [roomId, list] of Object.entries(data?.NPC_ENCOUNTERS || {})) {
    if (!Array.isArray(list)) continue;
    list.forEach((npc, index) => add(roomId, npc, index, 'legacy:NPC_ENCOUNTERS'));
  }
  return occurrences;
}

export function registerLegacyNarrative(data, registry) {
  const roomIds = new Map();
  const roomObjects = new WeakMap();
  for (const [roomId, room] of Object.entries(data?.LOCATIONS || {})) {
    const id = room.narrativeId || 'legacy.room.' + hashKey(roomId);
    roomIds.set(roomId, id);
    roomObjects.set(room, id);
    if (!registry.get(id)) registry.register({
      id,
      kind: 'room',
      source: room.source || 'legacy:LOCATIONS',
      content: {
        legacyKey: roomId,
        name: room.displayName || room.name || roomId,
        description: room.desc || '',
        assets: room.assets || {}
      },
      variants: roomVariants(room)
    });
  }

  const characterIds = new WeakMap();
  const characterKeys = new Map();
  const grouped = new Map();
  collectNpcOccurrences(data).forEach(occurrence => {
    const key = npcKey(occurrence.npc, occurrence.roomId, occurrence.index);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(occurrence);
  });

  for (const [key, occurrences] of grouped.entries()) {
    const first = occurrences[0];
    const id = first.npc.narrativeId || 'legacy.character.' + hashKey(key);
    characterKeys.set(key, id);
    const variants = [];
    occurrences.forEach((occurrence, occurrenceIndex) => {
      const npc = occurrence.npc;
      characterIds.set(npc, id);
      const roomSuffix = hashKey(occurrence.roomId + ':' + occurrenceIndex);
      variants.push({
        id: 'room.' + roomSuffix,
        priority: 5,
        when: withRoom(occurrence.roomId),
        content: {
          description: npc.desc || '',
          observeDescription: npc.observeDesc || npc.inspectDesc || '',
          assets: npc.assets || {}
        }
      });
      variants.push(...timeVariants(npc, occurrence.roomId, 'room.' + roomSuffix + '.time', 15));
      variants.push(...pathVariants(npc, occurrence.roomId, 'room.' + roomSuffix + '.path', 25));
      (npc.narrativeVariants || []).forEach((variant, variantIndex) => {
        variants.push({
          ...variant,
          id: 'room.' + roomSuffix + '.authored.' + (variant.id || variantIndex),
          priority: Number(variant.priority || 30),
          when: withRoom(occurrence.roomId, variant.when ?? true)
        });
      });
    });

    if (!registry.get(id)) registry.register({
      id,
      kind: 'character',
      source: first.source,
      content: {
        legacyKey: key,
        name: first.npc.title || first.npc.name || key,
        description: first.npc.desc || '',
        observeDescription: first.npc.observeDesc || first.npc.inspectDesc || '',
        assets: first.npc.assets || {}
      },
      variants
    });
  }

  const eventIds = new WeakMap();
  for (const [roomId, searchTable] of Object.entries(data?.ROOM_SEARCH || {})) {
    const results = Array.isArray(searchTable?.results) ? searchTable.results : [];
    results.forEach((result, index) => {
      if (!result || typeof result !== 'object') return;
      const id = result.narrativeId || 'legacy.event.' + hashKey(roomId + ':' + (result.id || index) + ':' + (result.desc || ''));
      eventIds.set(result, id);
      if (!registry.get(id)) registry.register({
        id,
        kind: 'event',
        source: result.source || 'legacy:ROOM_SEARCH',
        content: {
          legacyKey: result.id || null,
          roomId,
          title: result.title || '',
          description: result.text || result.desc || '',
          assets: {
            illustration: result.artId || result.illustration || result.art || result.image || ''
          }
        },
        variants: result.narrativeVariants || []
      });
    });
  }

  return { roomIds, roomObjects, characterIds, characterKeys, eventIds };
}