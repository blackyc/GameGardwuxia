/**
 * save_schema.js — 存档状态 Schema 定义
 *
 * H4A: 定义所有存档字段的类型、默认值、是否可空。
 * 存档版本 2（从 v1 迁移，v1 数据自动补全缺失字段）。
 *
 * 临时字段（combat, npcEncounter 等）不参与存档，
 * 由运行时重新初始化。
 */

export const SCHEMA_VERSION = 3;

/**
 * SAVE_SCHEMA — 每个字段定义：
 * @prop {string} type   — JS 基础类型名：'number'|'string'|'boolean'|'object'|'array'
 * @prop {*}      default — 默认值（与 type 对应）
 * @prop {boolean} nullable — 是否允许 null（默认 false）
 * @prop {boolean} transient — 是否为临时字段（不存档，默认 false）
 */
export const SAVE_SCHEMA = {
  // ═══ 核心属性 ═══
  path:               { type: 'string',  default: 'wu',       nullable: false },
  realm:              { type: 'number',  default: 0,           nullable: false },
  cultivation:        { type: 'number',  default: 0,           nullable: false },
  totalCultivation:   { type: 'number',  default: 0,           nullable: false },

  // ═══ 道心 ═══
  daoxin:             { type: 'number',  default: 100,         nullable: false },
  maxDaoXin:          { type: 'number',  default: 100,         nullable: false },

  // ═══ 生命 ═══
  hp:                 { type: 'number',  default: 100,         nullable: false },
  maxHp:              { type: 'number',  default: 100,         nullable: false },
  lifespan:           { type: 'number',  default: 80,          nullable: false },

  // ═══ 攻防 ═══
  attack:             { type: 'number',  default: 10,          nullable: false },
  defense:            { type: 'number',  default: 5,           nullable: false },

  // ═══ 真气/灵力 ═══
  mp:                 { type: 'number',  default: 80,          nullable: false },
  maxMp:              { type: 'number',  default: 80,          nullable: false },

  // ═══ 位置 ═══
  location:           { type: 'string',  default: '应天府·十字街口', nullable: false },

  // ═══ 背包与装备 ═══
  inventory:          { type: 'array',   default: [],          nullable: false },
  equipment:          { type: 'object',  default: { weapon: null, armor: null }, nullable: false },

  // ═══ 武学 ═══
  techniques:         { type: 'array',   default: [],          nullable: false },

  // ═══ 击杀 ═══
  killCount:          { type: 'number',  default: 0,           nullable: false },

  // ═══ 已探索 ═══
  explored:           { type: 'array',   default: ['应天府·十字街口'], nullable: false },
  routeDiscoveries:   { type: 'object',  default: {},          nullable: false },

  // ═══ 任务 ═══
  activeQuests:       { type: 'array',   default: [],          nullable: false },
  completedQuests:    { type: 'array',   default: [],          nullable: false },
  questStages:        { type: 'object',  default: {},          nullable: false },
  npcMemory:          { type: 'object',  default: {},          nullable: false },

  // ═══ 帮派/技能系统 ═══
  faction:            { type: 'string',  default: '散修',      nullable: false },
  skills:             { type: 'object',  default: {},          nullable: false },
  equippedSkill:      { type: 'string',  default: null,        nullable: true  },
  factionRep:         { type: 'number',  default: 0,           nullable: false },

  // ═══ 经济双轨 ═══
  spiritStones:       { type: 'number',  default: 0,           nullable: false },
  copperCoins:        { type: 'number',  default: 0,           nullable: false },
  knowsSpiritStones:  { type: 'boolean', default: false,       nullable: false },

  // ═══ 身世系统 ═══
  innate:             { type: 'string',  default: null,        nullable: true  },
  innateName:         { type: 'string',  default: null,        nullable: true  },
  innateMods:         { type: 'object',  default: null,        nullable: true  },
  unlocks:            { type: 'array',   default: [],          nullable: false },
  factionRepMods:     { type: 'object',  default: {},          nullable: false },

  // ═══ 开场标记 ═══
  introSeen:          { type: 'boolean', default: false,       nullable: false },

  // ═══ 教程/引路状态 ═══
  tutorialPhase:      { type: 'string',  default: null,        nullable: true  },
  tutorialStep:       { type: 'number',  default: 0,           nullable: false },
  guideCompanion:     { type: 'string',  default: null,        nullable: true  },
  tutorialSeenRooms:  { type: 'object',  default: {},          nullable: false },
  wenjianfengDinnerDone: { type: 'boolean', default: false,    nullable: false },
  xiaoyuanFirstLessonCompleted: { type: 'boolean', default: false, nullable: false },
  boarCombatResult:   { type: 'string',  default: null,        nullable: true  },
  residualSwordSeen:  { type: 'boolean', default: false,       nullable: false },
  tutorialActionState:{ type: 'object',  default: null,        nullable: true  },

  // ═══ 行功战斗系统 v3.0 ═══
  chart:              { type: 'object',  default: null,        nullable: true  },
  presetCharts:       { type: 'array',   default: [],          nullable: false },
  corruptionLevel:    { type: 'number',  default: 0,           nullable: false },

  // ═══ 状态标记 ═══
  isResting:          { type: 'boolean', default: false,       nullable: false },
  isCultivating:      { type: 'boolean', default: false,       nullable: false },
  trainCounter:       { type: 'number',  default: 0,           nullable: false },
  daoxinDecayCounter: { type: 'number',  default: 0,           nullable: false },
  gameStart:          { type: 'number',  default: 0,           nullable: false },

  // ═══ 时间系统 ═══
  gameTime:           { type: 'number',  default: 0,           nullable: false },
  realTimeAccumulator:{ type: 'number',  default: 0,           nullable: false },

  // ═══ 临时字段（不存档） ═══
  combat:             { type: 'object',  default: null,        nullable: true,  transient: true },
  npcEncounter:       { type: 'object',  default: null,        nullable: true,  transient: true },

  // ═══ 战斗辅助（运行时状态，存档可保留但加载时重置） ═══
  performCooldowns:   { type: 'object',  default: {},          nullable: false },
  roundCount:         { type: 'number',  default: 0,           nullable: false },
  lastBattleResult:   { type: 'object',  default: null,        nullable: true  },
};

/**
 * v1 → v2 迁移映射
 * 旧字段名 → 新字段名
 */
export const V1_MIGRATION_MAP = {
  questProgress: 'questStages',  // 旧版 questProgress → 新版 questStages
};

/**
 * 按类型检查值是否匹配
 * @param {*} value — 要检查的值
 * @param {string} type — 期望的 JS 类型
 * @returns {boolean}
 */
export function checkType(value, type) {
  if (value === null) return true; // null 由 nullable 控制
  switch (type) {
    case 'number':  return typeof value === 'number' && !Number.isNaN(value);
    case 'string':  return typeof value === 'string';
    case 'boolean': return typeof value === 'boolean';
    case 'object':  return typeof value === 'object' && !Array.isArray(value);
    case 'array':   return Array.isArray(value);
    default:        return false;
  }
}

/**
 * 获取 schema 中所有非 transient 字段名列表
 * @returns {string[]}
 */
export function getSaveableFields() {
  return Object.entries(SAVE_SCHEMA)
    .filter(([, def]) => !def.transient)
    .map(([name]) => name);
}

/**
 * 生成一个包含所有默认值的状态对象
 * @returns {object}
 */
export function createDefaultState() {
  const state = {};
  for (const [name, def] of Object.entries(SAVE_SCHEMA)) {
    state[name] = def.default;
  }
  return state;
}
