/**
 * data_loader.js — 卷宗加载器
 * 
 * 原始 work/ 文件使用全局 const 声明，通过 index.html 的 <script> 标签加载到 window 上
 * 本模块负责从 window 收集这些全局变量，整理为统一的卷宗对象
 * 
 * 加载顺序（由 index.html 保证）：
 * 1. rebuild_enemies_items_realms.js → REALMS, ENEMIES, ITEMS, LOOT_TABLES, PREREQ_TYPES
 * 2. rebuild_atmosphere.js → ATMOSPHERE_ITEMS
 * 3. rebuild_rooms_city.js → CITY_ROOMS
 * 4. rebuild_rooms_wild.js → WILD_ROOMS
 * 5. rebuild_dungeon_rooms.js → DUNGEON_ROOMS
 * 6. rebuild_skill_descriptions_1.js → (skill desc data)
 * 7. rebuild_skill_descriptions_2.js → (skill desc data)
 * 8. integration_v2.js → LOCATIONS, ROOM_SEARCH, NPC_ENCOUNTERS, FACTIONS, ROGUE_SKILLS, QUESTS, MAP_POS, MAP_CONN, getDesc
 */

let _data = null;

/**
 * 从 window 收集所有卷宗文件注入的全局变量
 * 必须在所有 <script> 标签加载完成后调用
 * @returns {object} 统一卷宗对象
 */
export function collectData() {
  if (_data) return _data;

  _data = {
    REALMS: window.REALMS || [],
    ENEMIES: window.ENEMIES || {},
    ITEMS: window.ITEMS || [],
    LOOT_TABLES: window.LOOT_TABLES || {},
    PREREQ_TYPES: window.PREREQ_TYPES || {},
    CITY_ROOMS: window.CITY_ROOMS || {},
    WILD_ROOMS: window.WILD_ROOMS || {},
    DUNGEON_ROOMS: window.DUNGEON_ROOMS || {},
    ATMOSPHERE_ITEMS: window.ATMOSPHERE_ITEMS || {},
    LOCATIONS: window.LOCATIONS || {},
    ROOM_SEARCH: window.ROOM_SEARCH || {},
    NPC_ENCOUNTERS: window.NPC_ENCOUNTERS || {},
    FACTION_RECRUITER_ENCOUNTERS: window.FACTION_RECRUITER_ENCOUNTERS || {},
    FACTIONS: window.FACTIONS || {},
    ROGUE_SKILLS: window.ROGUE_SKILLS || { skills: [] },
    QUESTS: window.QUESTS || [],
    MAP_POS: window.MAP_POS || {},
    MAP_CONN: window.MAP_CONN || [],
    GHOST_SKILL_TREES_1: window.GHOST_SKILL_TREES_1 || null,
    GHOST_SKILL_TREES_2: window.GHOST_SKILL_TREES_2 || null,
    // Phase 8 双修体系数据
    MERIDIANS: window.MERIDIANS || [],
    SEALS: window.SEALS || [],
    SEAL_CATEGORIES: window.SEAL_CATEGORIES || [],
    BUILDS: window.BUILDS || [],
    MERIDIAN_DROPS: window.MERIDIAN_DROPS || {},
    CORRUPTION: window.CORRUPTION || {},
    CORRUPTION_TIERS: window.CORRUPTION_TIERS || [],
    CORRUPTION_DATA: window.CORRUPTION_DATA || {},
    JIANGHU_NPCS: window.JIANGHU_NPCS || [],
    JIANGHU_EVENTS: window.JIANGHU_EVENTS || [],
    JIANGHU_SIDELINES: window.JIANGHU_SIDELINES || [],
    CROSS_PATH_QUESTS: window.CROSS_PATH_QUESTS || [],
    LING_SKILL_DATA: window.LING_SKILL_DATA || [],
    // 问剑峰门派HQ
    WENJIANFENG_ROOMS: window.WENJIANFENG_ROOMS || {},
    // 行功战斗系统数据
    XINGGONG: window.XINGGONG || null,
    ATB_SYSTEM: window.ATB_SYSTEM || null,
    COMBAT_HIJACK: window.COMBAT_HIJACK || null,
    getDesc: window.getDesc || ((obj) => obj?.desc || ''),
  };

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
    // Phase 8
    经脉: _data.MERIDIANS.length,
    刻印: _data.SEALS.length,
    流派: _data.BUILDS.length,
    畸变宗门: Object.keys(_data.CORRUPTION_DATA).length,
    江湖NPC: _data.JIANGHU_NPCS.length,
    交集任务: _data.CROSS_PATH_QUESTS.length,
    灵修技能: _data.LING_SKILL_DATA.length,
    // 行功
    行功图: _data.XINGGONG ? '已加载' : '缺失',
    ATB: _data.ATB_SYSTEM ? '已加载' : '缺失',
    畸变篡改: _data.COMBAT_HIJACK ? '已加载' : '缺失',
  });

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
