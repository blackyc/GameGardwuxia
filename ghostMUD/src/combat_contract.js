/**
 * combat_contract.js — 战斗契约适配层
 *
 * 统一技能字段映射、战诀格式兼容、畸变字段兼容。
 * 所有战斗模块应通过此模块访问技能/战诀/畸变数据，
 * 不要在各文件中各自猜字段名。
 *
 * V1.6 契约修复
 */

export const COMBAT_SLOTS = ['A', 'B', 'C', 'D', 'E'];

/**
 * 归一化技能数据字段。
 * 技能源 (combat_skills_v3.js) 使用旧字段名 mpCost/duNum/bleedNum 等，
 * 引擎统一使用 mana/shigu/lieshang 等新字段名。
 *
 * @param {object} raw - 原始技能数据
 * @returns {object} 归一化后的技能（含原始字段+兼容字段）
 */
export function normalizeCombatSkill(rawSkill) {
  if (!rawSkill) return null;
  const sk = { ...rawSkill };

  // 真气消耗：mpCost -> mana
  if (sk.mana === undefined) {
    sk.mana = sk.mpCost ?? 0;
  }

  // 伤害类型推断
  if (!sk.dmgType) {
    sk.dmgType = inferDamageType(sk);
  }

  // 状态效果字段映射：旧 -> 新
  if (sk.status === undefined) {
    sk.status = {
      shigu:    sk.shiguNum    ?? sk.duNum    ?? 0,
      lieshang: sk.lieshangNum ?? sk.bleedNum ?? 0,
      yehuo:    sk.yehuoNum    ?? sk.burnNum  ?? 0,
      ningyuan: sk.ningyuanNum ?? sk.iceNum   ?? 0,
      pogang:   sk.pogangNum   ?? 0,
      mihun:    sk.mihunNum    ?? 0,
      nixue:    sk.nixueNum    ?? 0,
    };
  }

  // 同步旧字段名到新字段名（让引擎直接读 sk.shiguNum 也能工作）
  if (sk.shiguNum === undefined)    sk.shiguNum    = sk.status.shigu;
  if (sk.lieshangNum === undefined) sk.lieshangNum = sk.status.lieshang;
  if (sk.yehuoNum === undefined)    sk.yehuoNum    = sk.status.yehuo;
  if (sk.ningyuanNum === undefined) sk.ningyuanNum = sk.status.ningyuan;

  return sk;
}

/**
 * 推断伤害类型
 */
function inferDamageType(sk) {
  const tags = (sk.tags || []).map(t => t.toLowerCase());
  if (tags.includes('火系') || tags.includes('fire')) return 'fire';
  if (tags.includes('冰系') || tags.includes('ice')) return 'ice';
  if (tags.includes('毒系') || tags.includes('poison')) return 'poison';
  if (tags.includes('血系') || tags.includes('bleed')) return 'bleed';
  if (sk.path === 'ling' || tags.includes('spirit')) return 'spirit';
  return 'physical';
}

/**
 * 获取技能真气消耗
 */
export function getSkillCost(skill) {
  if (!skill) return 0;
  return skill.mana ?? skill.mpCost ?? 0;
}

/**
 * 获取技能伤害类型
 */
export function getSkillDamageType(skill) {
  if (!skill) return 'physical';
  return skill.dmgType || inferDamageType(skill);
}

/**
 * 获取技能的状态效果 payload
 */
export function getSkillStatusPayload(skill) {
  if (!skill) return { shigu: 0, lieshang: 0, yehuo: 0, ningyuan: 0, pogang: 0, mihun: 0, nixue: 0 };
  if (skill.status) return skill.status;
  return {
    shigu:    skill.shiguNum    ?? skill.duNum    ?? 0,
    lieshang: skill.lieshangNum ?? skill.bleedNum ?? 0,
    yehuo:    skill.yehuoNum    ?? skill.burnNum  ?? 0,
    ningyuan: skill.ningyuanNum ?? skill.iceNum   ?? 0,
    pogang:   skill.pogangNum   ?? 0,
    mihun:    skill.mihunNum    ?? 0,
    nixue:    skill.nixueNum    ?? 0,
  };
}

/**
 * 从 chart 中提取 slots，兼容两种格式：
 *   旧格式: { A: 1001, B: 1002, C: 1003, D: 1004, E: 1005 }
 *   新格式: { id: 'xxx', name: 'xxx', slots: { A: 1001, ... } }
 */
export function getChartSlots(chart) {
  if (!chart) return null;
  if (chart.slots) return chart.slots;
  // 旧格式：直接是 { A: id, B: id, ... }
  if (chart.A !== undefined) return chart;
  return null;
}

/**
 * 归一化 chart 为标准格式
 */
export function normalizeChart(chart) {
  if (!chart) return null;
  const slots = getChartSlots(chart);
  if (!slots) return null;
  return {
    id: chart.id || null,
    name: chart.name || null,
    slots: { ...slots },
  };
}

/**
 * 从 state.presetCharts 数组中查找预设战诀
 * 兼容旧对象格式 { id: { slots } }
 */
export function findPresetChart(state, chartId) {
  const presets = state.presetCharts || state.chartPresets || state.charts || null;
  if (!presets) return null;

  // 数组格式
  if (Array.isArray(presets)) {
    return presets.find(p => p.id === chartId) || null;
  }

  // 旧对象格式
  if (typeof presets === 'object') {
    const found = presets[chartId];
    if (found) return normalizeChart(found);
  }

  return null;
}

/**
 * 获取畸变等级，兼容旧字段
 */
export function getCorruptionLevel(state) {
  return state.corruptionLevel ?? state.corruption ?? 0;
}

/**
 * 设置畸变等级，统一写入 corruptionLevel
 */
export function setCorruptionLevel(state, value) {
  state.corruptionLevel = value;
}

/**
 * 获取玩家武器攻击力加成
 */
export function getWeaponAtk(state) {
  if (!state.equipment || !state.equipment.weapon) return 0;
  return state.equipment.weapon.atk || 0;
}

/**
 * 获取玩家护甲防御力加成
 */
export function getArmorDef(state) {
  if (!state.equipment || !state.equipment.armor) return 0;
  return state.equipment.armor.def || 0;
}
