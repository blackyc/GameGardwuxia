/**
 * manifest.js — 数据文件显式清单
 *
 * 声明所有运行时数据文件的加载顺序和导出变量。
 * 数据文件位于 public/data/，通过 <script> 标签经典加载，
 * 每个文件末尾将自身变量注册到 window.__DATA_REGISTRY。
 *
 * 本模块是数据来源的唯一权威清单（Single Source of Truth），
 * data_loader.js 从 window.__DATA_REGISTRY 读取，
 * 不再使用 eval 或逐个 window.xxx 硬编码。
 */

/**
 * 数据文件清单——每项声明文件名和该文件注册的变量列表。
 * 顺序与 index.html 的 <script> 加载顺序一致。
 */
export const DATA_MANIFEST = [
  {
    file: 'rebuild_enemies_items_realms.js',
    vars: ['PREREQ_TYPES', 'WU_REALMS', 'LING_REALMS', 'REALMS', 'ENEMIES',
           'ITEMS', 'LOOT_TABLES', 'FACTION_PATH', 'WU_FACTIONS', 'LING_FACTIONS',
           'FALLEN_ORIGINS', 'CALAMITY_LORE', 'TERM_MAP', 'ENEMY_POOLS'],
  },
  {
    file: 'rebuild_atmosphere.js',
    vars: ['ATMOSPHERE_ITEMS'],
  },
  {
    file: 'rebuild_rooms_city.js',
    vars: ['CITY_ROOMS'],
  },
  {
    file: 'rebuild_rooms_wild.js',
    vars: ['WILD_ROOMS'],
  },
  {
    file: 'rebuild_dungeon_rooms.js',
    vars: ['DUNGEON_ROOMS'],
  },
  {
    file: 'rebuild_skill_descriptions_1.js',
    vars: ['GHOST_SKILL_TREES_1'],
  },
  {
    file: 'rebuild_skill_descriptions_2.js',
    vars: ['GHOST_SKILL_TREES_2'],
  },
  {
    file: 'rebuild_rooms_wenjianfeng.js',
    vars: ['WENJIANFENG_ROOMS'],
  },
  {
    file: 'wenjianfeng_npc_dialogues.js',
    vars: ['WENJIANFENG_NPC_DIALOGUES'],
  },
  {
    file: 'wenjianfeng_tutorial_ch1.js',
    vars: ['WENJIANFENG_TUTORIAL_CH1'],
  },
  {
    file: 'integration_v2.js',
    vars: ['LOCATIONS', 'MAP_POS', 'MAP_CONN', 'ROOM_SEARCH', 'NPC_ENCOUNTERS',
           'FACTIONS', 'ROGUE_SKILLS', 'QUESTS', 'getDesc'],
  },
  {
    file: 'rebuild_meridians.js',
    vars: ['MERIDIANS'],
  },
  {
    file: 'rebuild_seals.js',
    vars: ['SEALS', 'SEAL_CATEGORIES'],
  },
  {
    file: 'rebuild_builds_drops_corruption.js',
    vars: ['BUILDS', 'MERIDIAN_DROPS', 'CORRUPTION'],
  },
  {
    file: 'corruption_system.js',
    vars: ['CORRUPTION_TIERS', 'CORRUPTION_DATA'],
  },
  {
    file: 'jianghu_events.js',
    vars: ['JIANGHU_NPCS', 'JIANGHU_EVENTS', 'JIANGHU_SIDELINES'],
  },
  {
    file: 'cross_path_quests.js',
    vars: ['CROSS_PATH_QUESTS'],
  },
  {
    file: 'rebuild_skill_descriptions_ling.js',
    vars: ['LING_SKILL_DATA'],
  },
  {
    file: 'rebuild_combat_gong.js',
    vars: ['XINGGONG'],
  },
  {
    file: 'rebuild_combat_atb.js',
    vars: ['ATB_SYSTEM'],
  },
  {
    file: 'rebuild_combat_hijack.js',
    vars: ['COMBAT_HIJACK'],
  },
  {
    file: 'combat_skills_v3.js',
    vars: ['COMBAT_SKILLS_V3'],
  },
  {
    file: 'ghost_faction_recruiter_encounters.js',
    vars: ['FACTION_RECRUITER_ENCOUNTERS'],
  },
];

/** 所有期望注册的变量名集合（用于完整性校验） */
export const EXPECTED_VARS = DATA_MANIFEST.flatMap(e => e.vars);

/**
 * 从 window.__DATA_REGISTRY 收集所有已注册数据。
 * 返回 { data, missing, extra } 三部分。
 */
export function collectFromRegistry() {
  const registry = window.__DATA_REGISTRY || {};
  const data = {};
  const missing = [];

  for (const varName of EXPECTED_VARS) {
    if (varName in registry) {
      data[varName] = registry[varName];
    } else {
      missing.push(varName);
    }
  }

  // 检测非预期变量（注册了但不在 manifest 中）
  const expectedSet = new Set(EXPECTED_VARS);
  const extra = Object.keys(registry).filter(k => !expectedSet.has(k));

  return { data, missing, extra };
}
