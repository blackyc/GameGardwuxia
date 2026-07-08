const MIN_AFFINITY = -20;
const MAX_AFFINITY = 20;

function clampAffinity(value) {
  const n = Number(value || 0);
  return Math.max(MIN_AFFINITY, Math.min(MAX_AFFINITY, n));
}

function cloneFlags(flags) {
  return flags && typeof flags === 'object' && !Array.isArray(flags) ? { ...flags } : {};
}

function normalizeKey(value) {
  return String(value || '').trim();
}

export function npcMemoryKey(encOrKey) {
  if (typeof encOrKey === 'string') return normalizeKey(encOrKey);
  const enc = encOrKey || {};
  return normalizeKey(enc.memoryKey || enc.npcMemoryKey || enc.npcId || enc.id || enc.title || enc.name || '');
}

export function ensureNpcMemory(state, encOrKey) {
  if (!state) return null;
  if (!state.npcMemory || typeof state.npcMemory !== 'object' || Array.isArray(state.npcMemory)) {
    state.npcMemory = {};
  }
  const key = npcMemoryKey(encOrKey);
  if (!key) return null;
  const name = typeof encOrKey === 'string' ? key : (encOrKey?.title || encOrKey?.name || key);
  const old = state.npcMemory[key];
  if (!old || typeof old !== 'object' || Array.isArray(old)) {
    state.npcMemory[key] = {
      key,
      name,
      meetings: 0,
      interactions: 0,
      affinity: 0,
      flags: {},
      notes: []
    };
  } else {
    old.key = old.key || key;
    old.name = old.name || name;
    old.meetings = Number(old.meetings || 0);
    old.interactions = Number(old.interactions || 0);
    old.affinity = clampAffinity(old.affinity);
    old.flags = cloneFlags(old.flags);
    old.notes = Array.isArray(old.notes) ? old.notes.slice(-6) : [];
  }
  return state.npcMemory[key];
}

export function getNpcMemory(state, encOrKey) {
  const key = npcMemoryKey(encOrKey);
  if (!state || !state.npcMemory || !key) return null;
  const mem = state.npcMemory[key];
  return mem && typeof mem === 'object' && !Array.isArray(mem) ? mem : null;
}

export function describeNpcRelation(memory) {
  if (!memory || Number(memory.meetings || 0) <= 0) return '';
  const affinity = Number(memory.affinity || 0);
  if (affinity >= 8) return '亲近';
  if (affinity >= 4) return '相熟';
  if (affinity >= 1) return '眼熟';
  if (affinity <= -6) return '有嫌隙';
  if (affinity <= -2) return '不睦';
  return '见过';
}

export function noteNpcSeen(state, enc, context = {}) {
  const memory = ensureNpcMemory(state, enc);
  if (!memory) return null;
  memory.meetings = Number(memory.meetings || 0) + 1;
  memory.lastSeenRoom = context.room || state.location || memory.lastSeenRoom || '';
  if (context.gameTime !== undefined) memory.lastSeenTime = context.gameTime;
  return memory;
}

function addFlags(memory, flags) {
  if (!flags) return;
  if (typeof flags === 'string') {
    memory.flags[flags] = true;
    return;
  }
  if (Array.isArray(flags)) {
    flags.forEach(flag => {
      if (flag) memory.flags[String(flag)] = true;
    });
    return;
  }
  if (typeof flags === 'object') {
    Object.keys(flags).forEach(flag => {
      if (flag) memory.flags[String(flag)] = Boolean(flags[flag]);
    });
  }
}

function addNote(memory, note) {
  const text = String(note || '').trim();
  if (!text) return;
  memory.notes = Array.isArray(memory.notes) ? memory.notes : [];
  memory.notes.push(text);
  memory.notes = memory.notes.slice(-6);
}

function applyMemorySpec(memory, spec) {
  let changed = false;
  if (spec == null) return changed;
  if (Array.isArray(spec)) {
    spec.forEach(item => {
      if (applyMemorySpec(memory, item)) changed = true;
    });
    return changed;
  }
  if (typeof spec === 'number') {
    memory.affinity = clampAffinity(Number(memory.affinity || 0) + spec);
    return true;
  }
  if (typeof spec !== 'object') return changed;
  const beforeAffinity = Number(memory.affinity || 0);
  const delta = Number(spec.affinityDelta ?? spec.affinity ?? 0);
  if (delta) {
    memory.affinity = clampAffinity(beforeAffinity + delta);
    changed = true;
  }
  if (spec.setAffinity !== undefined) {
    memory.affinity = clampAffinity(spec.setAffinity);
    changed = true;
  }
  const beforeFlags = JSON.stringify(memory.flags || {});
  addFlags(memory, spec.flags || spec.flag);
  if (JSON.stringify(memory.flags || {}) !== beforeFlags) changed = true;
  const beforeNotes = Array.isArray(memory.notes) ? memory.notes.length : 0;
  addNote(memory, spec.note || spec.memo);
  if ((memory.notes || []).length !== beforeNotes) changed = true;
  return changed;
}

export function applyNpcChoiceMemory(state, enc, result, context = {}) {
  const memory = ensureNpcMemory(state, enc);
  if (!memory) return { memory: null, changed: false, label: '' };
  memory.interactions = Number(memory.interactions || 0) + 1;
  memory.lastChoice = String(result?.choice || '');
  memory.lastRoom = context.room || state.location || memory.lastRoom || '';
  if (context.gameTime !== undefined) memory.lastTime = context.gameTime;

  const spec = result?.relationship ?? result?.npcMemory ?? result?.memory ?? result?.relation;
  const changed = applyMemorySpec(memory, spec) || true;
  return { memory, changed, label: describeNpcRelation(memory) };
}
