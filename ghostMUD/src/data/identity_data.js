/**
 * identity_data.js — 身份（身世）系统数据
 *
 * 数据来源：docs/游戏主要设计.md；历史来源见 aidoc/archive_20260707/docs/identity_system.md
 * 宗门名权威：docs/游戏主要设计.md；历史来源见 aidoc/archive_20260707/docs/narrative_design.md
 *
 * 提供：
 *   - IDENTITIES[]       14 种身世完整定义
 *   - rollIdentities(n)  按权重不重复 roll n 个（默认 3）
 *   - applyIdentity(game, id) 应用身世效果到 game.state
 *
 * 身世影响落地策略（差异化体现，按用户要求）：
 *   - 数值修饰：写入 state.innateMods（战斗/修炼/经济等修饰符，供战斗系统后续读取）
 *   - 起始物品：push 到 state.inventory（军户皮甲+短刀 / 猎户弓箭 / 仵作工具 / 庄周梦蝶玉佩 / 武学世家锈剑）
 *   - 起始铜钱：写入 state.copperCoins
 *   - 解锁标记：写入 state.unlocks（隐藏剧情线 flag，事件系统后续消费）
 *   - 好感修饰：写入 state.factionRepMods（NPC 好感基础偏移，社交系统后续读取）
 *
 * 注：本次只埋数据 + flag，实际战斗/事件/社交消费层由对应系统后续接入。
 */

// ─────────────────────────────────────────────
//  14 种身世定义
// ─────────────────────────────────────────────

export const IDENTITIES = [
  // ═══ 常见 · 权重 15 ═══
  {
    id: 'wuxue_shijia',
    name: '武学世家',
    rarity: '常见',
    weight: 15,
    flavorText: '你家祖上出过一位剑客。没人记得他的名字，但阁楼里还挂着他那把锈剑。',
    summary: { 战斗: '★★★', 修炼: '★★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '自带2基础武学 + 武器熟练度获取+20%',
      cultivate: '武修类功法领悟+10%',
      economy: '初始30铜钱',
      social: '问剑峰NPC好感+15 / 忘尘宗-5',
      explore: '可辨识武器品质（无需鉴定）',
    },
    innateMods: { wuxueMasteryBonus: 0.2, wuxueComprehendBonus: 0.1 },
    startCopper: 30,
    startItems: [{ name: '祖传锈剑', type: 'equip', desc: '阁楼里挂了许多年的剑，刃口已钝。' }],
    factionRepMods: { '问剑峰': 15, '忘尘宗': -5 },
    factionInteractions: { '问剑峰': '剑法伤害+10% + 领祖传锈剑', '忘尘宗': '入门考核简化' },
  },
  {
    id: 'yaonong_houyi',
    name: '药农后裔',
    rarity: '常见',
    weight: 15,
    flavorText: '你爹在山里种了一辈子药草。他常说："根须朝下的治人，根须朝上的——别碰。"',
    summary: { 战斗: '★★', 修炼: '★★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '毒系伤害+1 / 治疗效果+1',
      cultivate: '炼丹成功率+15%',
      economy: '草药售价+10%',
      social: '药王谷、青囊庐NPC好感+15',
      explore: '草药辨识+30% / 可辨常见毒物',
    },
    innateMods: { poisonBonus: 1, healBonus: 1, alchemyBonus: 0.15 },
    startCopper: 0,
    startItems: [],
    factionRepMods: { '药王谷': 15, '青囊庐': 15 },
    factionInteractions: { '药王谷': '解锁隐藏剧情线「谷底血苔」', '青囊庐': '炼丹+10% + 提前学中级药方' },
    unlocks: ['herb_identify', 'poison_identify'],
  },
  {
    id: 'shijing_guer',
    name: '市井孤儿',
    rarity: '常见',
    weight: 15,
    flavorText: '没人知道你爹娘是谁。你在城墙根下长大，学会了从背影判断一个人好不好惹。',
    summary: { 战斗: '★★', 修炼: '★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '闪避+3% / 暴击+2%',
      cultivate: '修炼效率+5%',
      economy: '初始0铜钱 / 乞讨成功率+50%',
      social: '乞丐/游民系NPC好感+20 / 其他-5',
      explore: '情报范围+50% / 可发现暗门',
    },
    innateMods: { dodgeBonus: 3, critBonus: 2, cultivateBonus: 0.05 },
    startCopper: 0,
    startItems: [],
    factionRepMods: { _default: -5 },
    factionInteractions: { '问剑峰': '好感-10 / 入门考核难度+1级' },
    unlocks: ['beggar_network', 'secret_passage'],
  },
  {
    id: 'junhu_zidi',
    name: '军户子弟',
    rarity: '常见',
    weight: 15,
    flavorText: '你爹是边军的一个伍长。他教你用刀、教你结阵、教你怎么在死人堆里装死活到第二天。',
    summary: { 战斗: '★★★', 修炼: '★', 经济: '★★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '初始护甲+2 / 刀法伤害+2 / 体力上限+10%',
      cultivate: '修炼效率-5% / 功法修炼次数+1',
      economy: '初始20铜钱 + 旧皮甲 + 制式短刀',
      social: '官府系+10 / 逍遥驿+10',
      explore: '夜间视野不减 / 可辨识军事遗迹',
    },
    innateMods: { armorBonus: 2, bladeBonus: 2, staminaBonus: 0.1, cultivateBonus: -0.05 },
    startCopper: 20,
    startItems: [
      { name: '旧皮甲', type: 'equip', desc: '边军淘汰的旧甲，缝补过多次，但还能挡一下。' },
      { name: '制式短刀', type: 'equip', desc: '军中制式短刀，刀刃上有划痕。' },
    ],
    factionRepMods: { '逍遥驿': 10 },
    factionInteractions: {},
    unlocks: ['night_vision', 'military_relics'],
  },

  // ═══ 普通 · 权重 10 ═══
  {
    id: 'shuxiang_mendi',
    name: '书香门第',
    rarity: '普通',
    weight: 10,
    flavorText: '你家三代读书。祖父进过学，父亲进过学，你也进过学——然后你开始在书里看见别的东西。',
    summary: { 战斗: '★', 修炼: '★★★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '初始怯战+10% / 战斗经验+10%',
      cultivate: '古籍阅读+30% / 悟性检定+15%',
      economy: '初始50铜钱',
      social: '书院/文人系+15 / 忘尘宗+10',
      explore: '可阅读古碑残卷 / 古墓发现率+20%',
    },
    innateMods: { combatExpBonus: 0.1, witsBonus: 0.15, ancientReadBonus: 0.3, fearCombatBonus: 0.1 },
    startCopper: 50,
    startItems: [],
    factionRepMods: { '忘尘宗': 10 },
    factionInteractions: { '忘尘宗': '悟性检定+10% + 解读宗门古籍隐藏内容' },
    unlocks: ['ancient_text', 'tomb_finder'],
  },
  {
    id: 'shanggu_zhizi',
    name: '商贾之子',
    rarity: '普通',
    weight: 10,
    flavorText: '你爹是跑商的。从小你就知道一个道理：什么都能卖，关键是找到买家——包括那些不该卖的东西。',
    summary: { 战斗: '★', 修炼: '—', 经济: '★★★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '可贿赂敌人（消耗铜钱避免战斗）',
      cultivate: '无加成',
      economy: '初始100铜钱 / 商店折扣10% / 售卖溢价10%',
      social: '商人系+15 / 傀坊+10',
      explore: '可发现隐藏商人 / 黑市访问权',
    },
    innateMods: { shopDiscount: 0.1, sellMarkup: 0.1, bribeEnabled: true },
    startCopper: 100,
    startItems: [],
    factionRepMods: { '傀坊': 10 },
    factionInteractions: {},
    unlocks: ['hidden_merchant', 'black_market'],
  },
  {
    id: 'liehu_chuanren',
    name: '猎户传人',
    rarity: '普通',
    weight: 10,
    flavorText: '你爷爷是山里的猎户。他教你辨足迹、设陷阱、弓弦响之前就知道猎物要往哪跑。',
    summary: { 战斗: '★★', 修炼: '—', 经济: '★★', 社交: '★★', 探索: '★★★' },
    effects: {
      combat: '远程命中+5% / 暴击+3% / 对野兽+20%',
      cultivate: '无加成',
      economy: '初始弓1把 + 箭矢10支 + 15铜钱',
      social: '山民/猎户系+15 / 问剑峰+5',
      explore: '追踪 / 陷阱 / 野外生存+30%',
    },
    innateMods: { rangedHitBonus: 5, critBonus: 3, beastBonus: 0.2 },
    startCopper: 15,
    startItems: [
      { name: '猎弓', type: 'equip', desc: '爷爷留下的猎弓，弓弦换过无数次，但弓身还好。' },
      { name: '箭矢×10', type: 'item', desc: '一组羽箭，箭羽有些磨损。' },
    ],
    factionRepMods: { '问剑峰': 5 },
    factionInteractions: { '问剑峰': '追踪技能契合 / 探索效率+20%' },
    unlocks: ['tracking', 'traps', 'wild_survival'],
  },
  {
    id: 'qiutu',
    name: '囚徒',
    rarity: '普通',
    weight: 10,
    flavorText: '你在牢里待了三年。牢房里不止你一个人——还有一些没有影子的事。它们教会了你一些东西。',
    summary: { 战斗: '★★', 修炼: '★★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '初始道心-10 / HP<30%时伤害+15% / 痛觉抗性+1',
      cultivate: '道心恢复-1/tick / 逆境修炼+10%',
      economy: '初始0铜钱 + 破旧镣铐（卖5铜钱）',
      social: '血禅寺+15 / 忘尘宗-15 / 官府系-20',
      explore: '暗室视野+2格 / 可发现密道 / 恐惧抗性+25%',
    },
    innateMods: { lowHpDamageBonus: 0.15, painResist: 1, adversityCultivate: 0.1, daoxinRegenMod: -1 },
    startCopper: 0,
    startItems: [{ name: '破旧镣铐', type: 'item', desc: '一副锈蚀的镣铐，铁环上还沾着暗色的痕迹。' }],
    factionRepMods: { '血禅寺': 15, '忘尘宗': -15 },
    factionInteractions: { '血禅寺': '解锁隐藏功法「狱中观心术」', '归墟': '死亡窥视功法+20%' },
    unlocks: ['dark_room_vision', 'fear_resist', 'secret_cell'],
  },
  {
    id: 'letianpai',
    name: '乐天派',
    rarity: '普通',
    weight: 10,
    flavorText: '天塌下来当被盖。你娘说你缺心眼，你爹说你是福气深。反正你从来不觉得这世道有什么可怕的。',
    summary: { 战斗: '★★', 修炼: '★★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '暴击+5% / 暴击伤害-10%',
      cultivate: '休息恢复+10% / 道心衰减-1/tick',
      economy: '初始10铜钱',
      social: '所有NPC+5 / 严肃系-5',
      explore: '恐惧检定+30% / 陷阱发现率-10%',
    },
    innateMods: { critBonus: 5, critDamageMod: -0.1, restBonus: 0.1, daoxinDecayMod: -1, fearResist: 0.3 },
    startCopper: 10,
    startItems: [],
    factionRepMods: { _default: 5 },
    factionInteractions: {},
    unlocks: [],
  },

  // ═══ 稀有 · 权重 5 ═══
  {
    id: 'wuzuo',
    name: '仵作',
    rarity: '稀有',
    weight: 5,
    flavorText: '你父亲是镇上的仵作。从小你就在死人堆里帮忙。你见过太多死法，知道哪种最不甘心。',
    summary: { 战斗: '★★★', 修炼: '★★', 经济: '★', 社交: '★★', 探索: '★★★' },
    effects: {
      combat: '火系+2 / 吸血+5% / 对亡灵+25%',
      cultivate: '尸气功法效率+30%',
      economy: '初始20铜钱 + 殓葬工具套',
      social: '归墟+20 / 血禅寺+10 / 普通NPC-10',
      explore: '可辨死因 / 墓地发现率+50% / 感知亡灵',
    },
    innateMods: { fireBonus: 2, lifeSteal: 0.05, undeadBonus: 0.25, corpseQiBonus: 0.3 },
    startCopper: 20,
    startItems: [{ name: '殓葬工具套', type: 'item', desc: '仵作用的全套工具，铜针、验骨尺、朱砂瓶。任务道具。' }],
    factionRepMods: { '归墟': 20, '血禅寺': 10 },
    factionInteractions: { '归墟': '解锁隐藏剧情线「送葬者的最后一程」', '血禅寺': '血系功法+15% + 可参与秘仪' },
    unlocks: ['death_cause', 'grave_finder', 'undead_sense'],
  },
  {
    id: 'tianzi_congying',
    name: '天资聪颖',
    rarity: '稀有',
    weight: 5,
    flavorText: '三岁识字，五岁背诗，七岁那年你在后院看见了一个不该看见的东西——你居然看懂了。',
    summary: { 战斗: '★★', 修炼: '★★★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '战斗经验+15% / 初始HP-5',
      cultivate: '全经验+10% / 功法领悟+20% / 道心上限+10',
      economy: '初始5铜钱',
      social: '忘尘宗+15 / 问剑峰+10 / 逍遥驿-5',
      explore: '可发现隐藏古文符文 / 解谜+25%',
    },
    innateMods: { combatExpBonus: 0.15, allExpBonus: 0.1, comprehendBonus: 0.2, daoxinMaxBonus: 10, hpMod: -5 },
    startCopper: 5,
    startItems: [],
    factionRepMods: { '忘尘宗': 15, '问剑峰': 10, '逍遥驿': -5 },
    factionInteractions: { '问剑峰': '剑法领悟+15% + 可挑战高阶剑阵', '忘尘宗': '道心上限+5 + 接触深层教义' },
    unlocks: ['ancient_rune', 'puzzle_solver'],
  },
  {
    id: 'xiantian_lingti',
    name: '先天灵体',
    rarity: '稀有',
    weight: 5,
    flavorText: '你从小就能看见别人看不见的东西。它们有时候在墙角，有时候在镜子后面，有时候——就在你身后。',
    summary: { 战斗: '★★', 修炼: '★★', 经济: '★', 社交: '★★', 探索: '★★★' },
    effects: {
      combat: '对灵体+20% / 受精神伤+15%',
      cultivate: '灵修功法+25% / 道心波动±10%',
      economy: '初始10铜钱',
      social: '镜阁+20 / 归墟+15 / 焰心教-10',
      explore: '可见隐形灵体 / 暗室+3格 / 感知"祂"',
    },
    innateMods: { spiritBonus: 0.2, spiritVuln: 0.15, lingCultivateBonus: 0.25, daoxinVolatility: 0.1 },
    startCopper: 10,
    startItems: [],
    factionRepMods: { '镜阁': 20, '归墟': 15, '焰心教': -10 },
    factionInteractions: { '镜阁': '解锁隐藏剧情线「看见丝的人」+ 镜中探索+30%', '归墟': '亡灵交互+25% + 感知"祂"' },
    unlocks: ['spirit_sight', 'him_sense'],
  },

  // ═══ 极稀有 · 权重 2 ═══
  {
    id: 'zhuangzhou_mengdie',
    name: '庄周梦蝶',
    rarity: '极稀有',
    weight: 2,
    flavorText: '你做了一个很长很长的梦。梦里你活了无数遍。醒来的时候，你发现自己居然还记得——每一遍是怎么死的。',
    summary: { 战斗: '★★★', 修炼: '★★', 经济: '★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '首次死亡复活（HP恢复30%）/ 复活后伤害+10%',
      cultivate: '初始全功法+1级 / 修炼效率-10%',
      economy: '初始5铜钱 + 残破玉佩',
      social: '归墟+25 / 血禅寺+15 / 忘尘宗-20',
      explore: '可回忆地图隐藏信息 / 古墓遗迹额外发现',
    },
    innateMods: { reviveOnce: true, reviveDamageBonus: 0.1, allSkillLevelBonus: 1, cultivateBonus: -0.1 },
    startCopper: 5,
    startItems: [{ name: '残破玉佩', type: 'item', desc: '前世的遗物。玉佩上有你看不懂的纹路，偶尔发烫。隐藏任务道具。' }],
    factionRepMods: { '归墟': 25, '血禅寺': 15, '忘尘宗': -20 },
    factionInteractions: { '归墟': '解锁隐藏剧情线「庄周梦蝶的归途」', '血禅寺': '血记忆功法+30%' },
    unlocks: ['past_life_memory', 'tomb_bonus'],
  },
  {
    id: 'wonai_tianxuan',
    name: '我乃天选',
    rarity: '极稀有',
    weight: 2,
    flavorText: '你出生那天，天降异象。不是什么好异象——是那种让全村人搬走的异象。',
    summary: { 战斗: '★★', 修炼: '★★', 经济: '★★', 社交: '★★', 探索: '★★' },
    effects: {
      combat: '全属性+3% / 遭遇强敌+15%',
      cultivate: '5%概率顿悟（瞬间大量修为）/ 道心波动+15',
      economy: '初始50铜钱 / 奇遇+30%',
      social: '全宗门+5 / 隐藏势力关注度+20',
      explore: '奇遇发现+30% / 可发现天机地点 / 危险事件+15%',
    },
    innateMods: { allStatBonus: 0.03, strongEnemyBonus: 0.15, epiphanyChance: 0.05, daoxinVolatility: 0.15, adventureBonus: 0.3 },
    startCopper: 50,
    startItems: [],
    factionRepMods: { _default: 5 },
    factionInteractions: { _all: '入门无门槛，但奇遇可能改变宗门态度' },
    unlocks: ['tianji_location', 'hidden_force_watch'],
  },
];

// 稀有度 → 展示标记
export const RARITY_MARK = {
  '常见': '',
  '普通': '',
  '稀有': ' ✦',
  '极稀有': ' ✦✦',
};

// ─────────────────────────────────────────────
//  Roll 三选一（按权重，不重复）
// ─────────────────────────────────────────────

/**
 * 按权重随机 roll n 个不重复身世。
 * @param {number} n 默认 3
 * @returns {object[]} 选中的身世对象数组
 */
export function rollIdentities(n = 3) {
  const pool = IDENTITIES.map((id) => ({ ...id }));
  const result = [];
  for (let k = 0; k < n && pool.length > 0; k++) {
    const totalWeight = pool.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * totalWeight;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) { idx = i; break; }
    }
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// ─────────────────────────────────────────────
//  应用身世效果到 game.state
// ─────────────────────────────────────────────

/**
 * 将身世效果落地到游戏状态。
 * 写入：state.innate（身世id）、state.innateMods、state.copperCoins、
 *       state.inventory、state.unlocks、state.factionRepMods。
 *
 * @param {object} game Game 实例（读取 game.state）
 * @param {string} identityId 身世 id
 * @returns {object} 选中的身世对象（供 UI 展示）
 */
export function applyIdentity(game, identityId) {
  const identity = IDENTITIES.find((x) => x.id === identityId);
  if (!identity) {
    console.warn('[identity] 未知身世 id:', identityId);
    return null;
  }
  const s = game.state;

  // 身世 id 锁定
  s.innate = identity.id;
  s.innateName = identity.name;

  // 数值修饰符（供战斗/修炼/经济系统后续读取）
  s.innateMods = { ...(identity.innateMods || {}) };

  // 起始铜钱（累加到默认值上）
  if (identity.startCopper) {
    s.copperCoins = (s.copperCoins || 0) + identity.startCopper;
  }

  // 起始物品
  if (identity.startItems && identity.startItems.length > 0) {
    identity.startItems.forEach((item) => {
      s.inventory.push({ ...item });
    });
  }

  // 解锁标记（隐藏剧情线/能力 flag）
  if (identity.unlocks && identity.unlocks.length > 0) {
    s.unlocks = Array.from(new Set([...(s.unlocks || []), ...identity.unlocks]));
  }

  // 宗门好感基础偏移（社交系统后续读取）
  if (identity.factionRepMods) {
    s.factionRepMods = { ...(identity.factionRepMods) };
  }

  // 特殊：天资聪颖 HP-5 / 道心上限+10
  if (identity.innateMods && identity.innateMods.hpMod) {
    s.maxHp = Math.max(1, s.maxHp + identity.innateMods.hpMod);
    s.hp = Math.max(1, s.hp + identity.innateMods.hpMod);
  }
  if (identity.innateMods && identity.innateMods.daoxinMaxBonus) {
    s.maxDaoXin += identity.innateMods.daoxinMaxBonus;
    s.daoxin = Math.min(s.maxDaoXin, s.daoxin + identity.innateMods.daoxinMaxBonus);
  }
  // 特殊：囚徒初始道心-10
  if (identity.id === 'qiutu') {
    s.daoxin = Math.max(0, s.daoxin - 10);
  }

  console.log('[identity] 身世已应用:', identity.name, 'mods=', s.innateMods);
  return identity;
}

export default IDENTITIES;
