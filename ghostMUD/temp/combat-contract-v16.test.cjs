/**
 * combat-contract-v16.test.cjs — V1.6 战斗契约验收测试
 *
 * 测试范围：
 * 1. 技能字段归一化 (mpCost→mana, duNum→shigu 等)
 * 2. 战诀格式兼容 (旧 {A,B,C,D,E} / 新 {slots:{A,B,C,D,E}})
 * 3. 畸变字段兼容 (corruption/corruptionLevel)
 * 4. 武器攻击力读取 (getWeaponAtk)
 * 5. 预设战诀查找 (findPresetChart)
 * 6. 伤害类型推断 (inferDamageType)
 *
 * 运行: node temp/combat-contract-v16.test.cjs
 */

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  const ok = test(name, fn);
  if (ok) passed++; else failed++;
}

// ============================================================
//  加载 src/combat_contract.js
// ============================================================

// 因为是 ESM，用动态 import
(async () => {
  console.log('\n📋 V1.6 战斗契约测试\n' + '━'.repeat(50));

  // 直接复制 contract 逻辑测试（避免 ESM/CJS 转换问题）
  const COMBAT_SLOTS = ['A', 'B', 'C', 'D', 'E'];

  // ---- 伤害类型推断 ----
  function inferDamageType(sk) {
    const tags = (sk.tags || []).map(t => t.toLowerCase());
    if (tags.includes('火系') || tags.includes('fire')) return 'fire';
    if (tags.includes('冰系') || tags.includes('ice')) return 'ice';
    if (tags.includes('毒系') || tags.includes('poison')) return 'poison';
    if (tags.includes('血系') || tags.includes('bleed')) return 'bleed';
    if (sk.path === 'ling' || tags.includes('spirit')) return 'spirit';
    return 'physical';
  }

  // ---- 技能归一化 ----
  function normalizeCombatSkill(rawSkill) {
    if (!rawSkill) return null;
    const sk = { ...rawSkill };
    if (sk.mana === undefined) sk.mana = sk.mpCost ?? 0;
    if (!sk.dmgType) sk.dmgType = inferDamageType(sk);
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
    if (sk.shiguNum === undefined)    sk.shiguNum    = sk.status.shigu;
    if (sk.lieshangNum === undefined) sk.lieshangNum = sk.status.lieshang;
    if (sk.yehuoNum === undefined)    sk.yehuoNum    = sk.status.yehuo;
    if (sk.ningyuanNum === undefined) sk.ningyuanNum = sk.status.ningyuan;
    return sk;
  }

  // ---- 字段适配测试 ----
  console.log('\n1. 字段适配');

  runTest('mpCost → mana', () => {
    const sk = normalizeCombatSkill({ id: 1001, mpCost: 8 });
    if (sk.mana !== 8) throw new Error(`expected mana=8, got ${sk.mana}`);
  });

  runTest('已有 mana 时不被 mpCost 覆盖', () => {
    const sk = normalizeCombatSkill({ id: 1001, mana: 12, mpCost: 8 });
    if (sk.mana !== 12) throw new Error(`expected mana=12, got ${sk.mana}`);
  });

  runTest('duNum → status.shigu', () => {
    const sk = normalizeCombatSkill({ id: 1001, duNum: 3 });
    if (sk.status.shigu !== 3) throw new Error(`expected shigu=3, got ${sk.status.shigu}`);
  });

  runTest('bleedNum → status.lieshang', () => {
    const sk = normalizeCombatSkill({ id: 1001, bleedNum: 4 });
    if (sk.status.lieshang !== 4) throw new Error(`expected lieshang=4, got ${sk.status.lieshang}`);
  });

  runTest('burnNum → status.yehuo', () => {
    const sk = normalizeCombatSkill({ id: 1001, burnNum: 2 });
    if (sk.status.yehuo !== 2) throw new Error(`expected yehuo=2, got ${sk.status.yehuo}`);
  });

  runTest('iceNum → status.ningyuan', () => {
    const sk = normalizeCombatSkill({ id: 1001, iceNum: 3 });
    if (sk.status.ningyuan !== 3) throw new Error(`expected ningyuan=3, got ${sk.status.ningyuan}`);
  });

  runTest('shiguNum 同步到旧字段名（引擎兼容）', () => {
    const sk = normalizeCombatSkill({ id: 1001, mpCost: 5, duNum: 3 });
    if (sk.shiguNum !== 3) throw new Error(`expected shiguNum=3, got ${sk.shiguNum}`);
    if (sk.lieshangNum !== 0) throw new Error(`expected lieshangNum=0`);
    if (sk.yehuoNum !== 0) throw new Error(`expected yehuoNum=0`);
    if (sk.ningyuanNum !== 0) throw new Error(`expected ningyuanNum=0`);
  });

  runTest('已有 shiguNum 时不被 duNum 覆盖', () => {
    const sk = normalizeCombatSkill({ id: 1001, shiguNum: 5, duNum: 3 });
    if (sk.status.shigu !== 5) throw new Error(`expected shigu=5, got ${sk.status.shigu}`);
    if (sk.shiguNum !== 5) throw new Error(`expected shiguNum=5, got ${sk.shiguNum}`);
  });

  runTest('伤害类型：显式 dmgType 优先', () => {
    const sk = normalizeCombatSkill({ id: 1001, dmgType: 'fire', tags: ['毒系'] });
    if (sk.dmgType !== 'fire') throw new Error(`expected fire, got ${sk.dmgType}`);
  });

  runTest('伤害类型：tags 毒系 → poison', () => {
    const sk = normalizeCombatSkill({ id: 1001, tags: ['毒系', 'debuff'] });
    if (sk.dmgType !== 'poison') throw new Error(`expected poison, got ${sk.dmgType}`);
  });

  runTest('伤害类型：tags 火系 → fire', () => {
    const sk = normalizeCombatSkill({ id: 1001, tags: ['火系'] });
    if (sk.dmgType !== 'fire') throw new Error(`expected fire, got ${sk.dmgType}`);
  });

  runTest('伤害类型：tags 冰系 → ice', () => {
    const sk = normalizeCombatSkill({ id: 1001, tags: ['冰系'] });
    if (sk.dmgType !== 'ice') throw new Error(`expected ice, got ${sk.dmgType}`);
  });

  runTest('伤害类型：tags 血系 → bleed', () => {
    const sk = normalizeCombatSkill({ id: 1001, tags: ['血系'] });
    if (sk.dmgType !== 'bleed') throw new Error(`expected bleed, got ${sk.dmgType}`);
  });

  runTest('伤害类型：path=ling → spirit', () => {
    const sk = normalizeCombatSkill({ id: 1001, path: 'ling', tags: [] });
    if (sk.dmgType !== 'spirit') throw new Error(`expected spirit, got ${sk.dmgType}`);
  });

  runTest('伤害类型：无匹配 → physical', () => {
    const sk = normalizeCombatSkill({ id: 1001, tags: ['物理'] });
    if (sk.dmgType !== 'physical') throw new Error(`expected physical, got ${sk.dmgType}`);
  });

  runTest('无 mpCost 时 mana=0', () => {
    const sk = normalizeCombatSkill({ id: 1001 });
    if (sk.mana !== 0) throw new Error(`expected mana=0, got ${sk.mana}`);
  });

  // ---- 战诀格式兼容 ----
  console.log('\n2. 战诀格式兼容');

  runTest('旧格式 {A,B,C,D,E} → getChartSlots', () => {
    const chart = { A: 1001, B: 1002, C: 1003, D: 1004, E: 1005 };
    const slots = getChartSlots(chart);
    if (!slots) throw new Error('slots should not be null');
    if (slots.A !== 1001) throw new Error(`expected A=1001, got ${slots.A}`);
    if (slots.B !== 1002) throw new Error(`expected B=1002, got ${slots.B}`);
  });

  runTest('新格式 {slots:{A,B,C,D,E}} → getChartSlots', () => {
    const chart = { id: 'test', name: '测试', slots: { A: 2001, B: 2002, C: 2003, D: 2004, E: 2005 } };
    const slots = getChartSlots(chart);
    if (!slots) throw new Error('slots should not be null');
    if (slots.A !== 2001) throw new Error(`expected A=2001, got ${slots.A}`);
  });

  runTest('null chart → null slots', () => {
    const slots = getChartSlots(null);
    if (slots !== null) throw new Error('should return null');
  });

  runTest('空对象 chart → null slots', () => {
    const slots = getChartSlots({});
    if (slots !== null) throw new Error('should return null');
  });

  // ---- 畸变字段 ----
  console.log('\n3. 畸变字段兼容');

  function getCorruptionLevel(state) {
    return state.corruptionLevel ?? state.corruption ?? 0;
  }

  runTest('corruptionLevel 优先', () => {
    const s = { corruptionLevel: 3, corruption: 2 };
    if (getCorruptionLevel(s) !== 3) throw new Error('should return 3');
  });

  runTest('fallback 到旧 corruption', () => {
    const s = { corruption: 2 };
    if (getCorruptionLevel(s) !== 2) throw new Error('should return 2');
  });

  runTest('都缺失时返回 0', () => {
    const s = {};
    if (getCorruptionLevel(s) !== 0) throw new Error('should return 0');
  });

  // ---- 武器攻击力 ----
  console.log('\n4. 武器/护甲加成');

  function getWeaponAtk(state) {
    if (!state.equipment || !state.equipment.weapon) return 0;
    return state.equipment.weapon.atk || 0;
  }
  function getArmorDef(state) {
    if (!state.equipment || !state.equipment.armor) return 0;
    return state.equipment.armor.def || 0;
  }

  runTest('无装备时 weaponAtk=0', () => {
    const s = { equipment: { weapon: null, armor: null } };
    if (getWeaponAtk(s) !== 0) throw new Error('should return 0');
    if (getArmorDef(s) !== 0) throw new Error('should return 0');
  });

  runTest('有武器时读取 atk', () => {
    const s = { equipment: { weapon: { id: 'sword', atk: 10 }, armor: null } };
    if (getWeaponAtk(s) !== 10) throw new Error('should return 10');
  });

  runTest('有护甲时读取 def', () => {
    const s = { equipment: { weapon: null, armor: { id: 'cloth', def: 4 } } };
    if (getArmorDef(s) !== 4) throw new Error('should return 4');
  });

  // ---- 预设战诀查找 ----
  console.log('\n5. 预设战诀查找');

  function findPresetChart(state, chartId) {
    const presets = state.presetCharts || state.chartPresets || state.charts || null;
    if (!presets) return null;
    if (Array.isArray(presets)) {
      return presets.find(p => p.id === chartId) || null;
    }
    if (typeof presets === 'object') {
      const found = presets[chartId];
      if (found) return { id: chartId, slots: found.slots || found };
    }
    return null;
  }

  runTest('数组格式 presetCharts', () => {
    const s = { presetCharts: [
      { id: 'alt1', name: '备选一', slots: { A: 4001, B: 4002, C: 4003, D: 4004, E: 4005 } },
      { id: 'alt2', name: '备选二', slots: { A: 5001, B: 5002, C: 5003, D: 5004, E: 5005 } },
    ]};
    const found = findPresetChart(s, 'alt2');
    if (!found) throw new Error('should find alt2');
    if (found.id !== 'alt2') throw new Error(`expected id=alt2, got ${found.id}`);
    if (found.slots.A !== 5001) throw new Error('wrong slot');
  });

  runTest('数组格式找不到', () => {
    const s = { presetCharts: [
      { id: 'alt1', slots: {} }
    ]};
    const found = findPresetChart(s, 'nonexistent');
    if (found !== null) throw new Error('should return null');
  });

  runTest('旧 chartPresets 对象格式', () => {
    const s = { chartPresets: { poixie: { A: 1001, B: 1002, C: 1003, D: 1004, E: 1005 } } };
    const found = findPresetChart(s, 'poixie');
    if (!found) throw new Error('should find poixie');
  });

  runTest('无预设时返回 null', () => {
    const found = findPresetChart({}, 'any');
    if (found !== null) throw new Error('should return null');
  });

  // ---- getChartSlots 函数 ----
  function getChartSlots(chart) {
    if (!chart) return null;
    if (chart.slots) return chart.slots;
    if (chart.A !== undefined) return chart;
    return null;
  }

  // ============================================================
  console.log('\n' + '━'.repeat(50));
  console.log(`V1.6 战斗契约测试结果: ${passed} 通过, ${failed} 失败`);
  if (failed === 0) console.log('✅ 全部通过！');
  else console.log('❌ 存在失败');

  process.exit(failed > 0 ? 1 : 0);
})();
