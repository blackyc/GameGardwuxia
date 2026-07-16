/**
 * quest_event.js — 任务事件归一化契约
 *
 * 将旧调用 checkQuestProgress('go', roomId) 与新结构化事件统一为同一形状。
 * 纯函数，无 DOM / 存档副作用。
 */

const EVENT_TYPES = new Set([
  'go', 'kill', 'find', 'collect', 'talk', 'dialogue',
  'deliver', 'find_clue', 'choice', 'escort', 'encounter',
  'investigate', 'return',
]);

const STAGE_TYPE_ALIASES = Object.freeze({
  arrive: 'go',
  search: 'find',
  investigate: 'investigate',
  return: 'return',
  encounter: 'encounter',
});

/**
 * @param {string|object|null|undefined} input
 * @param {string|null|undefined} legacyTarget
 * @returns {{
 *   eventId: string|null,
 *   type: string,
 *   targetId: string|null,
 *   roomId: string|null,
 *   npcId: string|null,
 *   itemId: string|null,
 *   choiceId: string|null,
 *   amount: number
 * }}
 */
export function normalizeQuestEvent(input, legacyTarget) {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const type = normalizeType(input.type || input.action || 'go');
    let targetId = pickStr(input.targetId, input.target, null);
    let roomId = pickStr(input.roomId, input.room, input.location, null);
    let npcId = pickStr(input.npcId, input.npc, null);
    let itemId = pickStr(input.itemId, input.item, null);
    let choiceId = pickStr(input.choiceId, input.choice, null);

    // 按类型补全：保证 targetId 与角色字段一致，便于阶段 target 匹配
    if (type === 'go' || type === 'return') {
      roomId = roomId || targetId;
      targetId = targetId || roomId;
    } else if (type === 'talk' || type === 'dialogue' || type === 'deliver' || type === 'escort') {
      npcId = npcId || targetId;
      targetId = targetId || npcId;
    } else if (type === 'find' || type === 'collect' || type === 'find_clue') {
      itemId = itemId || targetId;
      targetId = targetId || itemId;
    } else if (type === 'choice') {
      choiceId = choiceId || targetId;
      targetId = targetId || choiceId;
    } else if (type === 'kill' || type === 'encounter') {
      targetId = targetId || pickStr(input.enemyId, input.enemy, null);
    }

    return {
      eventId: pickStr(input.eventId, input.id, null),
      type,
      targetId,
      roomId,
      npcId,
      itemId,
      choiceId,
      amount: clampAmount(input.amount),
    };
  }

  const type = normalizeType(input == null || input === '' ? 'go' : String(input));
  const target = pickStr(legacyTarget, null);
  const event = {
    eventId: null,
    type,
    targetId: target,
    roomId: null,
    npcId: null,
    itemId: null,
    choiceId: null,
    amount: 1,
  };

  if (type === 'go' || type === 'return') {
    event.roomId = target;
  } else if (type === 'talk' || type === 'dialogue' || type === 'deliver' || type === 'escort') {
    event.npcId = target;
  } else if (type === 'find' || type === 'collect' || type === 'find_clue') {
    event.itemId = target;
  } else if (type === 'choice') {
    event.choiceId = target;
  }

  return event;
}

/**
 * 读取阶段声明的规范类型（兼容 action / type 与 arrive→go 等别名）。
 * @param {object} stage
 * @returns {string|null}
 */
export function resolveStageType(stage) {
  if (!stage || typeof stage !== 'object') return null;
  const raw = stage.type || stage.action;
  if (!raw) return null;
  const key = String(raw);
  if (STAGE_TYPE_ALIASES[key]) return STAGE_TYPE_ALIASES[key];
  return normalizeType(key);
}

/**
 * 事件类型是否可推进给定阶段类型。
 * @param {string} stageType
 * @param {string} eventType
 */
export function isTypeCompatible(stageType, eventType) {
  if (!stageType || !eventType) return false;
  if (stageType === eventType) return true;
  if (stageType === 'encounter' && eventType === 'kill') return true;
  if (stageType === 'collect' && (eventType === 'find' || eventType === 'collect')) return true;
  if (stageType === 'return' && eventType === 'go') return true;
  return false;
}

/**
 * 阶段字段匹配：仅当阶段声明了对应约束时才比较。
 * @param {object} stage
 * @param {ReturnType<typeof normalizeQuestEvent>} event
 */
export function stageMatchesEvent(stage, event) {
  if (!stage || !event) return false;
  const stageType = resolveStageType(stage);
  if (!isTypeCompatible(stageType, event.type)) return false;

  const stageTarget = pickStr(stage.targetId, stage.target, null);
  if (stageTarget != null && stageTarget !== event.targetId) return false;

  const stageRoom = pickStr(stage.roomId, stage.room, stage.location, null);
  if (stageRoom != null) {
    // go/return：room 约束比对 roomId；其它类型若事件未带 roomId 则仅在有值时比对
    if (event.roomId != null) {
      if (stageRoom !== event.roomId) return false;
    } else if (stageType === 'go' || stageType === 'return') {
      // legacy go 应始终带 roomId；缺失则视为不匹配
      return false;
    }
    // talk 等：仅 location 在事件未提供 roomId 时不强制（由 target/npc 约束）
  }

  const stageNpc = pickStr(stage.npcId, stage.npc, null);
  if (stageNpc != null && stageNpc !== event.npcId) return false;

  const stageItem = pickStr(stage.itemId, stage.item, null);
  if (stageItem != null && stageItem !== event.itemId) return false;

  const stageChoice = pickStr(stage.choiceId, stage.choice, null);
  if (stageChoice != null && stageChoice !== event.choiceId) return false;

  return true;
}

function normalizeType(type) {
  const t = STAGE_TYPE_ALIASES[type] || type;
  return EVENT_TYPES.has(t) ? t : String(t || 'go');
}

function pickStr(...values) {
  for (const v of values) {
    if (v === undefined || v === null || v === '') continue;
    return String(v);
  }
  return null;
}

function clampAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.floor(n);
}

export default normalizeQuestEvent;
