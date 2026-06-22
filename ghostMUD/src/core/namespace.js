/**
 * namespace.js — GhostMUD 全局命名空间
 * 参考猫国建设者的 window.game 模式，但用 ES6 Module 替代全局变量
 */

// 全局数据命名空间（数据文件通过 import 注入）
export const GHOST = {
  data: {
    REALMS: [],
    ENEMIES: {},
    ITEMS: [],
    LOCATIONS: {},
    ROOM_SEARCH: {},
    NPC_ENCOUNTERS: {},
    FACTIONS: {},
    ROGUE_SKILLS: null,
    QUESTS: [],
    ATMOSPHERE: {},
    SKILLS_BY_FACTION: {},
  },
  engine: {
    game: null,
    tabManager: null,
    timer: null,
    resPool: null,
    storage: null,
  }
};
