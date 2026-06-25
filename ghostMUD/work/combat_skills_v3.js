/**
 * ghostMUD · 行功战斗系统 v3.0 — 技能数据库
 * 
 * 12宗门(6武修+6灵修) × 5技能/宗门 = 60 + 10散修通用 = 70个技能
 * 
 * 数值基准：武者(1)境界 atk=15(武修)/12(灵修)
 * 字段名遵循 status_effects_v3.md 拼音命名规范
 * 
 * @author  Agent T13.1
 * @date    2026-06-26
 */

var COMBAT_SKILLS_V3 = [

  // ════════════════════════════════════════════════════════════
  //  武修宗门 1/6：问剑峰（剑法·快剑·裂伤+破罡）
  // ════════════════════════════════════════════════════════════
  {
    id: 1001, name: '劈风剑', type: 'light', faction: '问剑峰', path: 'wu',
    desc: '剑出如风，快而不乱。',
    slot: 'A', cd: 1.5, mpCost: 8,
    skillNum: 45, skillNumLvAdd: 4.5, range: 1,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['blade', '快剑'],
    nextLvSk: 1002
  },
  {
    id: 1002, name: '追影刺', type: 'light', faction: '问剑峰', path: 'wu',
    desc: '剑锋三变，影追人魂。',
    slot: 'B', cd: 2.0, mpCost: 10,
    skillNum: 55, skillNumLvAdd: 5.5, range: 1,
    duNum: 0, bleedNum: 3, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.5, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['blade', '快剑'],
    nextLvSk: 1003
  },
  {
    id: 1003, name: '贯云势', type: 'medium', faction: '问剑峰', path: 'wu',
    desc: '一剑贯云，云开见月。',
    slot: 'C', cd: 3.5, mpCost: 25,
    skillNum: 120, skillNumLvAdd: 12, range: 1,
    duNum: 0, bleedNum: 5, burnNum: 0, iceNum: 0,
    pogangNum: 2, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.7, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.3, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['blade'],
    nextLvSk: 1004
  },
  {
    id: 1004, name: '万剑归宗', type: 'heavy', faction: '问剑峰', path: 'wu',
    desc: '剑意盈天，万剑归一，破罡裂甲。',
    slot: 'D', cd: 6.0, mpCost: 50,
    skillNum: 250, skillNumLvAdd: 25, range: 1,
    duNum: 0, bleedNum: 8, burnNum: 0, iceNum: 0,
    pogangNum: 5, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 1.0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.5, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: ['pogang_break'], tags: ['blade', '重剑'],
    nextLvSk: 1005
  },
  {
    id: 1005, name: '剑意凝神', type: 'assist_buff', faction: '问剑峰', path: 'wu',
    desc: '持剑入定，剑意护体，出招更锐。',
    slot: 'E', cd: 4.0, mpCost: 18,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3001, buffProb: 100, buffStack: 1, buffDuration: 10,
    effects: [{ type: 'atk_up', value: 5, duration: 10 }], tags: ['blade', '增益'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  武修宗门 2/6：血禅寺（拳掌·血系·裂伤锚点+逆血）
  // ════════════════════════════════════════════════════════════
  {
    id: 1101, name: '血禅掌', type: 'light', faction: '血禅寺', path: 'wu',
    desc: '掌带血劲，触之皮裂。',
    slot: 'A', cd: 1.8, mpCost: 9,
    skillNum: 40, skillNumLvAdd: 4, range: 1,
    duNum: 0, bleedNum: 3, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.5, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['fist', '血系'],
    nextLvSk: 1102
  },
  {
    id: 1102, name: '金刚碎', type: 'light', faction: '血禅寺', path: 'wu',
    desc: '金刚一怒，碎石裂金。',
    slot: 'B', cd: 2.0, mpCost: 11,
    skillNum: 50, skillNumLvAdd: 5, range: 1,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 2, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.3, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['fist', '破甲'],
    nextLvSk: 1103
  },
  {
    id: 1103, name: '血海潮涌', type: 'medium', faction: '血禅寺', path: 'wu',
    desc: '血海翻涌，浪潮噬人。',
    slot: 'C', cd: 3.5, mpCost: 28,
    skillNum: 110, skillNumLvAdd: 11, range: 1,
    duNum: 0, bleedNum: 6, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 2,
    duAdd: 0, bleedAdd: 0.8, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0.3,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'lifesteal', value: 0.15 }], tags: ['fist', '血系'],
    nextLvSk: 1104
  },
  {
    id: 1104, name: '血佛降世', type: 'heavy', faction: '血禅寺', path: 'wu',
    desc: '血佛现身，以血引灵，万物皆殇。',
    slot: 'D', cd: 6.5, mpCost: 55,
    skillNum: 220, skillNumLvAdd: 22, range: 1,
    duNum: 0, bleedNum: 10, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 3,
    duAdd: 0, bleedAdd: 1.2, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0.5,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'lifesteal', value: 0.3 }, { type: 'self_hp_cost', value: 0.1 }], tags: ['fist', '血系', '重击'],
    nextLvSk: 1105
  },
  {
    id: 1105, name: '血禅诵经', type: 'assist_heal', faction: '血禅寺', path: 'wu',
    desc: '诵经一声，血止伤合。',
    slot: 'E', cd: 5.0, mpCost: 15,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'heal_self', value: 30 }, { type: 'cleanse_debuff', value: 1 }], tags: ['fist', '治疗'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  武修宗门 3/6：傀坊（机关暗器·破罡锚点）
  // ════════════════════════════════════════════════════════════
  {
    id: 1201, name: '连环弩', type: 'light', faction: '傀坊', path: 'wu',
    desc: '机括连响，弩箭如雨。',
    slot: 'A', cd: 1.5, mpCost: 7,
    skillNum: 40, skillNumLvAdd: 4, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 2, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.3, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['hidden_weapon', '破甲'],
    nextLvSk: 1202
  },
  {
    id: 1202, name: '淬毒针', type: 'light', faction: '傀坊', path: 'wu',
    desc: '细针淬毒，不见血而见尸。',
    slot: 'B', cd: 2.0, mpCost: 10,
    skillNum: 35, skillNumLvAdd: 3.5, range: 2,
    duNum: 3, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 1, mihunNum: 0, nixueNum: 0,
    duAdd: 0.5, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.2, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['hidden_weapon', '毒系'],
    nextLvSk: 1203
  },
  {
    id: 1203, name: '破罡锥', type: 'medium', faction: '傀坊', path: 'wu',
    desc: '锥尖一点，罡气尽碎。',
    slot: 'C', cd: 3.0, mpCost: 22,
    skillNum: 90, skillNumLvAdd: 9, range: 1,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 5, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.8, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'reduce_armor_half', duration: 3 }], tags: ['hidden_weapon', '破甲'],
    nextLvSk: 1204
  },
  {
    id: 1204, name: '天罗万机', type: 'heavy', faction: '傀坊', path: 'wu',
    desc: '千机齐发，天罗地网，避无可避。',
    slot: 'D', cd: 5.5, mpCost: 45,
    skillNum: 180, skillNumLvAdd: 18, range: 2,
    duNum: 4, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 5, mihunNum: 0, nixueNum: 0,
    duAdd: 0.5, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.5, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'multi_hit', value: 3 }], tags: ['hidden_weapon', '重击'],
    nextLvSk: 1205
  },
  {
    id: 1205, name: '机关护体', type: 'assist_def', faction: '傀坊', path: 'wu',
    desc: '机括扣合，铜皮铁骨。',
    slot: 'E', cd: 4.0, mpCost: 12,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3002, buffProb: 100, buffStack: 1, buffDuration: 8,
    effects: [{ type: 'def_up', value: 8, duration: 8 }], tags: ['hidden_weapon', '防御'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  武修宗门 4/6：逍遥驿（枪法点穴·裂伤+迷魂+凝渊）
  // ════════════════════════════════════════════════════════════
  {
    id: 1301, name: '穿云枪', type: 'light', faction: '逍遥驿', path: 'wu',
    desc: '枪出一线，穿云破雾。',
    slot: 'A', cd: 1.5, mpCost: 8,
    skillNum: 42, skillNumLvAdd: 4.2, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spear', '快枪'],
    nextLvSk: 1302
  },
  {
    id: 1302, name: '截脉刺', type: 'light', faction: '逍遥驿', path: 'wu',
    desc: '枪尖点穴，截脉断气。',
    slot: 'B', cd: 2.2, mpCost: 12,
    skillNum: 38, skillNumLvAdd: 3.8, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 2, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.3, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spear', '点穴'],
    nextLvSk: 1303
  },
  {
    id: 1303, name: '破阵势', type: 'medium', faction: '逍遥驿', path: 'wu',
    desc: '枪势如龙，破阵而出。',
    slot: 'C', cd: 3.5, mpCost: 26,
    skillNum: 115, skillNumLvAdd: 11.5, range: 2,
    duNum: 0, bleedNum: 4, burnNum: 0, iceNum: 0,
    pogangNum: 3, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.5, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.4, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spear'],
    nextLvSk: 1304
  },
  {
    id: 1304, name: '龙吟破', type: 'heavy', faction: '逍遥驿', path: 'wu',
    desc: '枪化龙形，一击破万法。',
    slot: 'D', cd: 6.0, mpCost: 48,
    skillNum: 240, skillNumLvAdd: 24, range: 2,
    duNum: 0, bleedNum: 6, burnNum: 0, iceNum: 0,
    pogangNum: 4, mihunNum: 3, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.8, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.5, mihunAdd: 0.4, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'cooldown_reduce_adjacent', value: 0.5 }], tags: ['spear', '重击'],
    nextLvSk: 1305
  },
  {
    id: 1305, name: '梦行诀', type: 'assist_buff', faction: '逍遥驿', path: 'wu',
    desc: '神游物外，身随心动。',
    slot: 'E', cd: 4.0, mpCost: 15,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3003, buffProb: 100, buffStack: 1, buffDuration: 10,
    effects: [{ type: 'spd_up', value: 2, duration: 10 }, { type: 'dodge_up', value: 5, duration: 10 }], tags: ['spear', '增益'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  武修宗门 5/6：药王谷（毒术医术·尸蛊锚点）
  // ════════════════════════════════════════════════════════════
  {
    id: 1401, name: '淬蛊掌', type: 'light', faction: '药王谷', path: 'wu',
    desc: '掌心藏蛊，触之即中。',
    slot: 'A', cd: 1.8, mpCost: 9,
    skillNum: 35, skillNumLvAdd: 3.5, range: 1,
    duNum: 4, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0.6, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['fist', '毒系'],
    nextLvSk: 1402
  },
  {
    id: 1402, name: '银针试脉', type: 'light', faction: '药王谷', path: 'wu',
    desc: '银针刺脉，以医入武。',
    slot: 'B', cd: 2.0, mpCost: 8,
    skillNum: 45, skillNumLvAdd: 4.5, range: 1,
    duNum: 2, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0.3, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['hidden_weapon', '毒系'],
    nextLvSk: 1403
  },
  {
    id: 1403, name: '百蛊噬心', type: 'medium', faction: '药王谷', path: 'wu',
    desc: '蛊虫千百，噬骨穿心。',
    slot: 'C', cd: 3.5, mpCost: 24,
    skillNum: 85, skillNumLvAdd: 8.5, range: 1,
    duNum: 6, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0.9, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['fist', '毒系'],
    nextLvSk: 1404
  },
  {
    id: 1404, name: '万蛊噬魂', type: 'heavy', faction: '药王谷', path: 'wu',
    desc: '万蛊齐出，魂飞魄散。',
    slot: 'D', cd: 6.0, mpCost: 50,
    skillNum: 160, skillNumLvAdd: 16, range: 1,
    duNum: 8, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 1.2, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'dot_enhance', target: 'shigu', value: 1.5 }], tags: ['fist', '毒系', '重击'],
    nextLvSk: 1405
  },
  {
    id: 1405, name: '回春妙手', type: 'assist_heal', faction: '药王谷', path: 'wu',
    desc: '妙手回春，生死人肉白骨。',
    slot: 'E', cd: 5.0, mpCost: 18,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'heal_self', value: 50 }, { type: 'cleanse_debuff', value: 2 }, { type: 'mp_regen', value: 10, duration: 5 }], tags: ['fist', '治疗'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  武修宗门 6/6：藏剑阁（剑器·多重剑法·破罡+裂伤）
  // ════════════════════════════════════════════════════════════
  {
    id: 1501, name: '藏锋斩', type: 'light', faction: '藏剑阁', path: 'wu',
    desc: '锋藏于鞘，出则见血。',
    slot: 'A', cd: 1.6, mpCost: 8,
    skillNum: 48, skillNumLvAdd: 4.8, range: 1,
    duNum: 0, bleedNum: 2, burnNum: 0, iceNum: 0,
    pogangNum: 2, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.3, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.3, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['blade', '藏剑'],
    nextLvSk: 1502
  },
  {
    id: 1502, name: '双刃错', type: 'light', faction: '藏剑阁', path: 'wu',
    desc: '双剑交错，左右逢源。',
    slot: 'B', cd: 2.0, mpCost: 11,
    skillNum: 52, skillNumLvAdd: 5.2, range: 1,
    duNum: 0, bleedNum: 4, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.6, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'multi_hit', value: 2 }], tags: ['blade', '双剑'],
    nextLvSk: 1503
  },
  {
    id: 1503, name: '剑阵·困龙', type: 'medium', faction: '藏剑阁', path: 'wu',
    desc: '剑插成阵，困龙于渊。',
    slot: 'C', cd: 4.0, mpCost: 28,
    skillNum: 105, skillNumLvAdd: 10.5, range: 1,
    duNum: 0, bleedNum: 4, burnNum: 0, iceNum: 0,
    pogangNum: 4, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.5, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.6, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'trap', duration: 3 }], tags: ['blade', '剑阵'],
    nextLvSk: 1504
  },
  {
    id: 1504, name: '万剑朝宗', type: 'heavy', faction: '藏剑阁', path: 'wu',
    desc: '阁中万剑，听令朝宗。',
    slot: 'D', cd: 6.5, mpCost: 52,
    skillNum: 230, skillNumLvAdd: 23, range: 2,
    duNum: 0, bleedNum: 7, burnNum: 0, iceNum: 0,
    pogangNum: 5, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0.9, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.5, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'multi_hit', value: 3 }, { type: 'pogang_break' }], tags: ['blade', '重击', '藏剑'],
    nextLvSk: 1505
  },
  {
    id: 1505, name: '剑灵护主', type: 'assist_def', faction: '藏剑阁', path: 'wu',
    desc: '剑灵自鸣，护主不退。',
    slot: 'E', cd: 4.5, mpCost: 14,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3004, buffProb: 100, buffStack: 1, buffDuration: 8,
    effects: [{ type: 'def_up', value: 10, duration: 8 }, { type: 'counter_attack', prob: 20, duration: 8 }], tags: ['blade', '防御'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  灵修宗门 1/6：忘尘宗（面具·迷魂锚点·灵压）
  // ════════════════════════════════════════════════════════════
  {
    id: 2001, name: '忘尘面', type: 'light', faction: '忘尘宗', path: 'ling',
    desc: '面具一覆，前尘尽忘。',
    slot: 'A', cd: 1.8, mpCost: 10,
    skillNum: 35, skillNumLvAdd: 3.5, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 2, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.4, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '迷魂'],
    nextLvSk: 2002
  },
  {
    id: 2002, name: '面壁观', type: 'light', faction: '忘尘宗', path: 'ling',
    desc: '面壁十年，壁上无我。',
    slot: 'B', cd: 2.0, mpCost: 11,
    skillNum: 42, skillNumLvAdd: 4.2, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 3, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.5, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'spirit_damage', value: 0.3 }], tags: ['spirit', '迷魂'],
    nextLvSk: 2003
  },
  {
    id: 2003, name: '三生忘', type: 'medium', faction: '忘尘宗', path: 'ling',
    desc: '三生三世，一念皆忘。',
    slot: 'C', cd: 4.0, mpCost: 28,
    skillNum: 90, skillNumLvAdd: 9, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 5, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.8, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'disable_strongest_skill', prob: 30, duration: 2 }], tags: ['spirit', '迷魂'],
    nextLvSk: 2004
  },
  {
    id: 2004, name: '大梦归', type: 'heavy', faction: '忘尘宗', path: 'ling',
    desc: '大梦一场，归去来兮。',
    slot: 'D', cd: 6.0, mpCost: 48,
    skillNum: 170, skillNumLvAdd: 17, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 8, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 1.2, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'spirit_damage', value: 0.5 }, { type: 'disable_strongest_skill', prob: 50, duration: 3 }], tags: ['spirit', '迷魂', '重击'],
    nextLvSk: 2005
  },
  {
    id: 2005, name: '忘机诀', type: 'assist_buff', faction: '忘尘宗', path: 'ling',
    desc: '忘却机心，道法自然。',
    slot: 'E', cd: 4.5, mpCost: 20,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3005, buffProb: 100, buffStack: 1, buffDuration: 10,
    effects: [{ type: 'mp_regen', value: 8, duration: 10 }, { type: 'hijack_resist', value: 10, duration: 10 }], tags: ['spirit', '增益'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  灵修宗门 2/6：紫霞山（紫气·凝渊+迷魂·多目）
  // ════════════════════════════════════════════════════════════
  {
    id: 2101, name: '紫气东来', type: 'light', faction: '紫霞山', path: 'ling',
    desc: '紫气初升，万物始苏。',
    slot: 'A', cd: 1.7, mpCost: 9,
    skillNum: 38, skillNumLvAdd: 3.8, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 3,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0.4,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '冰系'],
    nextLvSk: 2102
  },
  {
    id: 2102, name: '多目窥', type: 'light', faction: '紫霞山', path: 'ling',
    desc: '千目同窥，无所遁形。',
    slot: 'B', cd: 2.0, mpCost: 10,
    skillNum: 35, skillNumLvAdd: 3.5, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 2, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.4, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'mark_target', duration: 3 }], tags: ['spirit', '迷魂'],
    nextLvSk: 2103
  },
  {
    id: 2103, name: '紫霜凝', type: 'medium', faction: '紫霞山', path: 'ling',
    desc: '紫气凝霜，万物停滞。',
    slot: 'C', cd: 4.0, mpCost: 26,
    skillNum: 85, skillNumLvAdd: 8.5, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 5,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0.7,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '冰系'],
    nextLvSk: 2104
  },
  {
    id: 2104, name: '天门开', type: 'heavy', faction: '紫霞山', path: 'ling',
    desc: '天门一开，紫气如瀑，倾泻人间。',
    slot: 'D', cd: 6.5, mpCost: 52,
    skillNum: 160, skillNumLvAdd: 16, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 6,
    pogangNum: 0, mihunNum: 3, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0.9,
    pogangAdd: 0, mihunAdd: 0.5, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'spirit_damage', value: 0.4 }, { type: 'freeze_chance', prob: 30 }], tags: ['spirit', '冰系', '重击'],
    nextLvSk: 2105
  },
  {
    id: 2105, name: '紫华护灵', type: 'assist_def', faction: '紫霞山', path: 'ling',
    desc: '紫华覆体，灵台清明。',
    slot: 'E', cd: 4.5, mpCost: 16,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3006, buffProb: 100, buffStack: 1, buffDuration: 10,
    effects: [{ type: 'hijack_resist', value: 15, duration: 10 }, { type: 'spirit_def_up', value: 5, duration: 10 }], tags: ['spirit', '防御'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  灵修宗门 3/6：归墟（深海·凝渊锚点·尸蛊+逆血）
  // ════════════════════════════════════════════════════════════
  {
    id: 2201, name: '渊息', type: 'light', faction: '归墟', path: 'ling',
    desc: '深渊一息，寒入骨髓。',
    slot: 'A', cd: 1.8, mpCost: 10,
    skillNum: 36, skillNumLvAdd: 3.6, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 4,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0.5,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '冰系'],
    nextLvSk: 2202
  },
  {
    id: 2202, name: '异鳞刺', type: 'light', faction: '归墟', path: 'ling',
    desc: '鳞片如针，刺入即寒。',
    slot: 'B', cd: 2.0, mpCost: 11,
    skillNum: 40, skillNumLvAdd: 4, range: 2,
    duNum: 3, bleedNum: 0, burnNum: 0, iceNum: 2,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0.4, bleedAdd: 0, burnAdd: 0, iceAdd: 0.3,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '冰系', '毒系'],
    nextLvSk: 2203
  },
  {
    id: 2203, name: '渊冻术', type: 'medium', faction: '归墟', path: 'ling',
    desc: '深渊凝冻，万物止息。',
    slot: 'C', cd: 4.0, mpCost: 25,
    skillNum: 80, skillNumLvAdd: 8, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 6,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0.8,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'freeze_threshold', value: 8 }], tags: ['spirit', '冰系'],
    nextLvSk: 2204
  },
  {
    id: 2204, name: '深渊吞噬', type: 'heavy', faction: '归墟', path: 'ling',
    desc: '深渊张口，吞噬一切光明。',
    slot: 'D', cd: 6.5, mpCost: 55,
    skillNum: 165, skillNumLvAdd: 16.5, range: 2,
    duNum: 2, bleedNum: 0, burnNum: 0, iceNum: 6,
    pogangNum: 0, mihunNum: 0, nixueNum: 2,
    duAdd: 0.3, bleedAdd: 0, burnAdd: 0, iceAdd: 0.9,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0.3,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'freeze_threshold', value: 8 }, { type: 'spirit_damage', value: 0.3 }], tags: ['spirit', '冰系', '重击'],
    nextLvSk: 2205
  },
  {
    id: 2205, name: '渊息回转', type: 'assist_heal', faction: '归墟', path: 'ling',
    desc: '渊气回转，生死轮转。',
    slot: 'E', cd: 5.5, mpCost: 18,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'heal_self', value: 35 }, { type: 'cleanse_debuff', value: 1 }], tags: ['spirit', '治疗'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  灵修宗门 4/6：镜阁（镜象·业火+迷魂·反射）
  // ════════════════════════════════════════════════════════════
  {
    id: 2301, name: '镜花水月', type: 'light', faction: '镜阁', path: 'ling',
    desc: '镜中花，水中月，虚实难辨。',
    slot: 'A', cd: 1.7, mpCost: 9,
    skillNum: 33, skillNumLvAdd: 3.3, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 2, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.4, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'mirror_image', prob: 15 }], tags: ['spirit', '迷魂'],
    nextLvSk: 2302
  },
  {
    id: 2302, name: '虚焰灼', type: 'light', faction: '镜阁', path: 'ling',
    desc: '镜中持火，虚焰灼魂。',
    slot: 'B', cd: 2.0, mpCost: 10,
    skillNum: 38, skillNumLvAdd: 3.8, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 3, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0.4, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'spirit_damage', value: 0.2 }], tags: ['spirit', '火系'],
    nextLvSk: 2303
  },
  {
    id: 2303, name: '镜碎万华', type: 'medium', faction: '镜阁', path: 'ling',
    desc: '镜碎千片，万华乱目。',
    slot: 'C', cd: 3.5, mpCost: 24,
    skillNum: 88, skillNumLvAdd: 8.8, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 2, iceNum: 0,
    pogangNum: 0, mihunNum: 3, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0.3, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.5, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'confusion', prob: 40, duration: 2 }], tags: ['spirit', '迷魂', '火系'],
    nextLvSk: 2304
  },
  {
    id: 2304, name: '镜界·黄衣', type: 'heavy', faction: '镜阁', path: 'ling',
    desc: '镜中黄衣者，走出镜面。',
    slot: 'D', cd: 6.0, mpCost: 50,
    skillNum: 155, skillNumLvAdd: 15.5, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 4, iceNum: 0,
    pogangNum: 0, mihunNum: 5, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0.6, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0.8, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'spirit_damage', value: 0.5 }, { type: 'confusion', prob: 60, duration: 3 }], tags: ['spirit', '火系', '迷魂', '重击'],
    nextLvSk: 2305
  },
  {
    id: 2305, name: '明镜止水', type: 'assist_def', faction: '镜阁', path: 'ling',
    desc: '心如明镜，止水不波。',
    slot: 'E', cd: 4.5, mpCost: 15,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3007, buffProb: 100, buffStack: 1, buffDuration: 8,
    effects: [{ type: 'damage_reflect', value: 30, duration: 8 }, { type: 'mihun_immune', duration: 8 }], tags: ['spirit', '防御'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  灵修宗门 5/6：肉慈斋（血肉异化·逆血锚点·裂伤）
  // ════════════════════════════════════════════════════════════
  {
    id: 2401, name: '肉刺', type: 'light', faction: '肉慈斋', path: 'ling',
    desc: '皮下骨刺，破肤而出。',
    slot: 'A', cd: 1.8, mpCost: 9,
    skillNum: 37, skillNumLvAdd: 3.7, range: 1,
    duNum: 0, bleedNum: 3, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 1,
    duAdd: 0, bleedAdd: 0.4, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0.2,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '血系'],
    nextLvSk: 2402
  },
  {
    id: 2402, name: '增生掌', type: 'light', faction: '肉慈斋', path: 'ling',
    desc: '掌生肉瘤，触之即裂。',
    slot: 'B', cd: 2.0, mpCost: 10,
    skillNum: 40, skillNumLvAdd: 4, range: 1,
    duNum: 0, bleedNum: 4, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 2,
    duAdd: 0, bleedAdd: 0.5, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0.3,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '血系'],
    nextLvSk: 2403
  },
  {
    id: 2403, name: '血肉模糊', type: 'medium', faction: '肉慈斋', path: 'ling',
    desc: '血肉交融，敌我不分。',
    slot: 'C', cd: 3.5, mpCost: 26,
    skillNum: 82, skillNumLvAdd: 8.2, range: 1,
    duNum: 0, bleedNum: 5, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 3,
    duAdd: 0, bleedAdd: 0.7, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0.5,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'lifesteal', value: 0.1 }], tags: ['spirit', '血系'],
    nextLvSk: 2404
  },
  {
    id: 2404, name: '虫母之触', type: 'heavy', faction: '肉慈斋', path: 'ling',
    desc: '虫母伸手，骨白触须探出。',
    slot: 'D', cd: 6.0, mpCost: 50,
    skillNum: 150, skillNumLvAdd: 15, range: 1,
    duNum: 0, bleedNum: 7, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 5,
    duAdd: 0, bleedAdd: 0.9, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0.8,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'spirit_damage', value: 0.4 }, { type: 'lifesteal', value: 0.2 }, { type: 'nixue_half_on_trigger' }], tags: ['spirit', '血系', '重击'],
    nextLvSk: 2405
  },
  {
    id: 2405, name: '血肉再生', type: 'assist_heal', faction: '肉慈斋', path: 'ling',
    desc: '血肉蠕动，伤口自合。',
    slot: 'E', cd: 5.0, mpCost: 16,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3008, buffProb: 100, buffStack: 1, buffDuration: 8,
    effects: [{ type: 'hp_regen', value: 5, duration: 8 }, { type: 'heal_self', value: 25 }], tags: ['spirit', '治疗'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  灵修宗门 6/6：焰心教（圣火·业火锚点·灵压）
  // ════════════════════════════════════════════════════════════
  {
    id: 2501, name: '焰蛇', type: 'light', faction: '焰心教', path: 'ling',
    desc: '焰化蛇形，缠身灼骨。',
    slot: 'A', cd: 1.7, mpCost: 9,
    skillNum: 36, skillNumLvAdd: 3.6, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 3, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0.5, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '火系'],
    nextLvSk: 2502
  },
  {
    id: 2502, name: '余烬', type: 'light', faction: '焰心教', path: 'ling',
    desc: '余烬不灭，星火燎原。',
    slot: 'B', cd: 2.0, mpCost: 11,
    skillNum: 40, skillNumLvAdd: 4, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 4, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0.6, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '火系'],
    nextLvSk: 2503
  },
  {
    id: 2503, name: '焰心掌', type: 'medium', faction: '焰心教', path: 'ling',
    desc: '掌心如焰，焚尽前尘。',
    slot: 'C', cd: 3.5, mpCost: 28,
    skillNum: 85, skillNumLvAdd: 8.5, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 4, iceNum: 0,
    pogangNum: 2, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0.7, iceAdd: 0,
    pogangAdd: 0.3, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'physical_burn_bonus', value: 5 }], tags: ['spirit', '火系'],
    nextLvSk: 2504
  },
  {
    id: 2504, name: '业火焚心', type: 'heavy', faction: '焰心教', path: 'ling',
    desc: '业火燃心，债主来收。',
    slot: 'D', cd: 6.0, mpCost: 50,
    skillNum: 160, skillNumLvAdd: 16, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 4, iceNum: 0,
    pogangNum: 2, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0.9, iceAdd: 0,
    pogangAdd: 0.3, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'physical_burn_bonus', value: 5 }, { type: 'spirit_damage', value: 0.4 }], tags: ['spirit', '火系', '重击'],
    nextLvSk: 2505
  },
  {
    id: 2505, name: '余烬回光', type: 'assist_heal', faction: '焰心教', path: 'ling',
    desc: '余烬回光，清除一身债。',
    slot: 'E', cd: 5.0, mpCost: 18,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'heal_self', value: 30 }, { type: 'cleanse_debuff', value: 2 }], tags: ['spirit', '治疗'],
    nextLvSk: 0
  },

  // ════════════════════════════════════════════════════════════
  //  散修通用技能（10个）— 无宗门归属，任何人均可学习
  // ════════════════════════════════════════════════════════════
  {
    id: 3001, name: '劈柴式', type: 'light', faction: '散修', path: 'wu',
    desc: '砍柴练出来的招式，朴实无华。',
    slot: 'A', cd: 1.5, mpCost: 5,
    skillNum: 30, skillNumLvAdd: 3, range: 1,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['blade', '散修'],
    nextLvSk: 3002
  },
  {
    id: 3002, name: '石子掷', type: 'light', faction: '散修', path: 'wu',
    desc: '捡起石头扔出去，谁都会。',
    slot: 'B', cd: 1.8, mpCost: 6,
    skillNum: 28, skillNumLvAdd: 2.8, range: 3,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['hidden_weapon', '散修'],
    nextLvSk: 3003
  },
  {
    id: 3003, name: '蛮力冲撞', type: 'medium', faction: '散修', path: 'wu',
    desc: '用蛮力撞过去，不讲道理。',
    slot: 'C', cd: 3.0, mpCost: 18,
    skillNum: 80, skillNumLvAdd: 8, range: 1,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 2, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.3, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['fist', '散修'],
    nextLvSk: 3004
  },
  {
    id: 3004, name: '山崩斩', type: 'heavy', faction: '散修', path: 'wu',
    desc: '全力一击，如山崩裂。',
    slot: 'D', cd: 5.0, mpCost: 35,
    skillNum: 150, skillNumLvAdd: 15, range: 1,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 3, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.4, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['blade', '散修', '重击'],
    nextLvSk: 3005
  },
  {
    id: 3005, name: '吐纳术', type: 'assist_buff', faction: '散修', path: 'wu',
    desc: '吐故纳新，调息养气。',
    slot: 'E', cd: 3.5, mpCost: 0,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'mp_regen', value: 30, duration: 1 }], tags: ['散修', '回气'],
    nextLvSk: 0
  },
  {
    id: 3006, name: '灵光闪', type: 'light', faction: '散修', path: 'ling',
    desc: '灵光一闪，出其不意。',
    slot: 'A', cd: 1.6, mpCost: 7,
    skillNum: 32, skillNumLvAdd: 3.2, range: 2,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['spirit', '散修'],
    nextLvSk: 3007
  },
  {
    id: 3007, name: '护身诀', type: 'assist_def', faction: '散修', path: 'ling',
    desc: '最简单的护身法术，聊胜于无。',
    slot: 'B', cd: 3.5, mpCost: 10,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 3009, buffProb: 100, buffStack: 1, buffDuration: 6,
    effects: [{ type: 'def_up', value: 5, duration: 6 }], tags: ['spirit', '散修', '防御'],
    nextLvSk: 0
  },
  {
    id: 3008, name: '回气诀', type: 'assist_heal', faction: '散修', path: 'ling',
    desc: '散修都会的回气小术。',
    slot: 'C', cd: 4.5, mpCost: 0,
    skillNum: 0, skillNumLvAdd: 0, range: 0,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'mp_regen', value: 20, duration: 2 }], tags: ['spirit', '散修', '回气'],
    nextLvSk: 0
  },
  {
    id: 3009, name: '碎石掌', type: 'medium', faction: '散修', path: 'wu',
    desc: '一掌拍下，碎石裂砖。',
    slot: 'D', cd: 3.5, mpCost: 20,
    skillNum: 75, skillNumLvAdd: 7.5, range: 1,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 3, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0.4, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [], tags: ['fist', '散修'],
    nextLvSk: 0
  },
  {
    id: 3010, name: '天雷引', type: 'heavy', faction: '散修', path: 'ling',
    desc: '引天雷一束，劈于敌身。',
    slot: 'E', cd: 5.5, mpCost: 40,
    skillNum: 140, skillNumLvAdd: 14, range: 3,
    duNum: 0, bleedNum: 0, burnNum: 0, iceNum: 0,
    pogangNum: 0, mihunNum: 0, nixueNum: 0,
    duAdd: 0, bleedAdd: 0, burnAdd: 0, iceAdd: 0,
    pogangAdd: 0, mihunAdd: 0, nixueAdd: 0,
    buffId: 0, buffProb: 0, buffStack: 0, buffDuration: 0,
    effects: [{ type: 'spirit_damage', value: 0.3 }], tags: ['spirit', '散修', '重击'],
    nextLvSk: 0
  }

]; // end COMBAT_SKILLS_V3

// 挂载到 window（桥接层用）
if (typeof window !== 'undefined') window.COMBAT_SKILLS_V3 = COMBAT_SKILLS_V3;
