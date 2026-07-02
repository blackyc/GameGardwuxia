/**
 * data_loader.js — 卷宗加载器
 *
 * 数据文件位于 public/data/，通过 <script> 标签经典加载。
 * 每个文件末尾将自身变量注册到 window.__DATA_REGISTRY。
 * 本模块从 manifest 定义的清单读取 registry，整理为统一的卷宗对象。
 *
 * 加载顺序由 index.html 的 <script> 标签保证。
 * manifest.js 是数据来源的唯一权威清单。
 */

import { collectFromRegistry, EXPECTED_VARS } from './manifest.js';

let _data = null;

/**
 * 从 window.__DATA_REGISTRY 收集所有卷宗数据。
 * 必须在所有 <script> 标签加载完成后调用。
 * @returns {object} 统一卷宗对象
 */
export function collectData() {
  if (_data) return _data;

  const { data, missing, extra } = collectFromRegistry();

  if (missing.length > 0) {
    console.warn('[DataLoader] 以下数据变量未注册:', missing.join(', '));
  }
  if (extra.length > 0) {
    console.warn('[DataLoader] 注册了非 manifest 变量:', extra.join(', '));
  }

  _data = {
    // 基础数据
    PREREQ_TYPES: data.PREREQ_TYPES || {},
    WU_REALMS: data.WU_REALMS || [],
    LING_REALMS: data.LING_REALMS || [],
    REALMS: data.REALMS || [],
    ENEMIES: data.ENEMIES || {},
    ITEMS: data.ITEMS || [],
    LOOT_TABLES: data.LOOT_TABLES || {},
    TERM_MAP: data.TERM_MAP || {},
    // 氛围
    ATMOSPHERE_ITEMS: data.ATMOSPHERE_ITEMS || {},
    // 房间
    CITY_ROOMS: data.CITY_ROOMS || {},
    WILD_ROOMS: data.WILD_ROOMS || {},
    DUNGEON_ROOMS: data.DUNGEON_ROOMS || {},
    WENJIANFENG_ROOMS: data.WENJIANFENG_ROOMS || {},
    // 集成层
    LOCATIONS: data.LOCATIONS || {},
    ROOM_SEARCH: data.ROOM_SEARCH || {},
    NPC_ENCOUNTERS: data.NPC_ENCOUNTERS || {},
    FACTION_RECRUITER_ENCOUNTERS: data.FACTION_RECRUITER_ENCOUNTERS || {},
    FACTIONS: data.FACTIONS || {},
    ROGUE_SKILLS: data.ROGUE_SKILLS || { skills: [] },
    QUESTS: data.QUESTS || [],
    MAP_POS: data.MAP_POS || {},
    MAP_CONN: data.MAP_CONN || [],
    // 技能树
    GHOST_SKILL_TREES_1: data.GHOST_SKILL_TREES_1 || null,
    GHOST_SKILL_TREES_2: data.GHOST_SKILL_TREES_2 || null,
    // Phase 8 双修体系
    MERIDIANS: data.MERIDIANS || [],
    SEALS: data.SEALS || [],
    SEAL_CATEGORIES: data.SEAL_CATEGORIES || [],
    BUILDS: data.BUILDS || [],
    MERIDIAN_DROPS: data.MERIDIAN_DROPS || {},
    CORRUPTION: data.CORRUPTION || {},
    CORRUPTION_TIERS: data.CORRUPTION_TIERS || [],
    CORRUPTION_DATA: data.CORRUPTION_DATA || {},
    JIANGHU_NPCS: data.JIANGHU_NPCS || [],
    JIANGHU_EVENTS: data.JIANGHU_EVENTS || [],
    JIANGHU_SIDELINES: data.JIANGHU_SIDELINES || [],
    CROSS_PATH_QUESTS: data.CROSS_PATH_QUESTS || [],
    LING_SKILL_DATA: data.LING_SKILL_DATA || [],
    // 问剑峰引导
    WENJIANFENG_TUTORIAL_CH1: data.WENJIANFENG_TUTORIAL_CH1 || null,
    // 行功战斗系统
    XINGGONG: data.XINGGONG || null,
    ATB_SYSTEM: data.ATB_SYSTEM || null,
    COMBAT_HIJACK: data.COMBAT_HIJACK || null,
    COMBAT_SKILLS_V3: data.COMBAT_SKILLS_V3 || null,
    // 描述函数
    getDesc: data.getDesc || ((obj) => obj?.desc || ''),
  };

  // 同时挂到 window.game 可访问的位置（过渡期兼容，后续移除）
  // 消费者应通过 getData() 获取数据，不直接读 window.__DATA_REGISTRY

  // 构建敌人分层索引
  _data.enemyNames = Object.keys(_data.ENEMIES);
  _data.enemyTiers = {};
  _data.enemyNames.forEach(name => {
    const e = _data.ENEMIES[name];
    const tier = e.boss ? 5 : (e.exp > 40 ? 4 : e.exp > 25 ? 3 : e.exp > 15 ? 2 : 1);
    if (!_data.enemyTiers[tier]) _data.enemyTiers[tier] = [];
    _data.enemyTiers[tier].push(name);
  });

  console.log('[DataLoader] 卷宗加载完成:', {
    境界: _data.REALMS.length,
    敌人: _data.enemyNames.length,
    物品: _data.ITEMS.length,
    房间: Object.keys(_data.LOCATIONS).length,
    NPC遭遇: Object.keys(_data.NPC_ENCOUNTERS).length,
    帮派: Object.keys(_data.FACTIONS).length,
    任务: _data.QUESTS.length,
    经脉: _data.MERIDIANS.length,
    刻印: _data.SEALS.length,
    流派: _data.BUILDS.length,
    畸变宗门: Object.keys(_data.CORRUPTION_DATA).length,
    江湖NPC: _data.JIANGHU_NPCS.length,
    交集任务: _data.CROSS_PATH_QUESTS.length,
    灵修技能: _data.LING_SKILL_DATA.length,
    行功图: _data.XINGGONG ? '已加载' : '缺失',
    ATB: _data.ATB_SYSTEM ? '已加载' : '缺失',
    畸变篡改: _data.COMBAT_HIJACK ? '已加载' : '缺失',
    战诀V3: _data.COMBAT_SKILLS_V3 ? '已加载' : '缺失',
  });

  if (missing.length > 0) {
    console.warn('[DataLoader] 缺失变量数:', missing.length);
  }

  return _data;
}

/** 获取已加载的卷宗 */
export function getData() {
  if (!_data) {
    throw new Error('[DataLoader] 卷宗尚未加载，请先调用 collectData()');
  }
  return _data;
}

/** 按危险等级选择敌人 */
export function pickEnemy(danger) {
  const data = getData();
  let pool = [];
  for (let tier = danger; tier >= 0; tier--) {
    if (data.enemyTiers[tier] && data.enemyTiers[tier].length > 0) {
      pool = pool.concat(data.enemyTiers[tier]);
      if (pool.length >= 5) break;
    }
  }
  if (pool.length === 0) pool = data.enemyNames.slice(0, 5);
  return pool[Math.floor(Math.random() * pool.length)];
}
