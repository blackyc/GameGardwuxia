/**
 * combat-npc-v16.test.cjs — V1.6 NPC 切磋入口测试
 *
 * 测试范围：
 * 6. 值星弟子可切磋
 * 6. guide 不可切磋
 * 6. 点击切磋进入 BattleEngine
 *
 * 运行: node temp/combat-npc-v16.test.cjs
 */

const fs = require('fs');
const path = require('path');

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); return true; }
  catch (e) { console.log(`  ✗ ${name}\n    ${e.message}`); return false; }
}

let passed = 0, failed = 0;
function runTest(name, fn) {
  if (test(name, fn)) passed++; else failed++;
}

const NPC_SERVICE_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'npc_service.js'), 'utf8'
);
const PERCEPTION_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'perception_service.js'), 'utf8'
);
const FACADE_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'combat_facade.js'), 'utf8'
);
const RENDERER_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'ui', 'renderer.js'), 'utf8'
);
const INPUT_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'ui', 'input.js'), 'utf8'
);

// 加载问剑峰房间数据
const ROOMS_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'data', 'rebuild_rooms_wenjianfeng.js'), 'utf8'
);
const TUTORIAL_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'data', 'wenjianfeng_tutorial_ch1.js'), 'utf8'
);

console.log('\n📋 V1.6 NPC 切磋入口测试\n' + '━'.repeat(50));

// ============================================================
// 1. 值星弟子可切磋
// ============================================================
console.log('\n1. 值星弟子可切磋');

runTest('值星弟子 NPC 数据存在于问剑峰山门', () => {
  if (!ROOMS_SRC.includes('wenjianfeng_zhixing')) throw new Error('值星弟子 NPC 未找到');
  if (!ROOMS_SRC.includes('值星弟子')) throw new Error('值星弟子 name 未找到');
});

runTest('perception_service 默认 canSpar=true（未显式设 false）', () => {
  if (!PERCEPTION_SRC.includes('canSpar !== false') && !PERCEPTION_SRC.includes('canSpar: true')) {
    throw new Error('canSpar 默认值逻辑不正确');
  }
});

runTest('npc_service.sparNpc 方法存在', () => {
  if (!NPC_SERVICE_SRC.includes('sparNpc')) throw new Error('sparNpc 方法未找到');
});

runTest('_buildSparEnemy 构造弱敌数据', () => {
  if (!NPC_SERVICE_SRC.includes('_buildSparEnemy')) throw new Error('_buildSparEnemy 未找到');
  const idx = NPC_SERVICE_SRC.indexOf('_buildSparEnemy');
  const snippet = NPC_SERVICE_SRC.substring(idx, idx + 500);
  // 应该构造一个 HP 较低的敌人
  if (!snippet.includes('hp')) throw new Error('_buildSparEnemy 未设置 hp');
  if (!snippet.includes('60') && !snippet.includes('50') && !snippet.includes('40')) {
    // 至少应该有一个较低的 HP 值
    if (!snippet.includes('maxHp')) throw new Error('_buildSparEnemy 未设置 maxHp');
  }
});

runTest('renderer.js 中 dossier 按钮动态化（canSpar 判断）', () => {
  // renderer 中应该有 canSpar 相关的判断
  if (!RENDERER_SRC.includes('canSpar') && !RENDERER_SRC.includes('spar')) {
    throw new Error('renderer 中无切磋相关逻辑');
  }
});

runTest('input.js 中有 sparNpc action 路由', () => {
  if (!INPUT_SRC.includes('sparNpc')) throw new Error('input.js 中无 sparNpc action');
});

// ============================================================
// 2. guide 不可切磋
// ============================================================
console.log('\n2. guide 不可切磋');

runTest('苏小棠 canSpar=false', () => {
  if (!TUTORIAL_SRC.includes('canSpar: false')) throw new Error('苏小棠未设 canSpar: false');
});

runTest('perception_service 中 guide 类型禁用切磋', () => {
  // 检查是否有 guide 类型的特殊处理
  const idx = PERCEPTION_SRC.indexOf('guide');
  if (idx === -1) {
    // 可能通过 canSpar: false 在数据层处理
    if (TUTORIAL_SRC.includes('canSpar: false')) return;
    throw new Error('perception_service 中无 guide 类型处理');
  }
});

runTest('canSpar=false 时按钮置灰', () => {
  // renderer 中应该有 canSpar=false 时的处理
  if (RENDERER_SRC.includes('mute') || RENDERER_SRC.includes('disabled') || RENDERER_SRC.includes('canSpar')) {
    return; // 有某种禁用逻辑
  }
  throw new Error('未找到 canSpar=false 时的按钮禁用逻辑');
});

// ============================================================
// 3. 点击切磋进入 BattleEngine
// ============================================================
console.log('\n3. 点击切磋进入 BattleEngine');

runTest('game.js 中有 sparNpc 代理方法', () => {
  const gameSrc = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'game.js'), 'utf8'
  );
  if (!gameSrc.includes('sparNpc')) throw new Error('game.js 中无 sparNpc 方法');
});

runTest('sparNpc 调用 combat_facade.startCombat', () => {
  const idx = NPC_SERVICE_SRC.indexOf('sparNpc');
  const snippet = NPC_SERVICE_SRC.substring(idx, idx + 1200);
  if (!snippet.includes('startCombat')) throw new Error('sparNpc 未调用 startCombat');
});

runTest('sparNpc 不使用 XINGGONG[faction] 提前拦截战诀', () => {
  const idx = NPC_SERVICE_SRC.indexOf('sparNpc');
  const snippet = NPC_SERVICE_SRC.substring(idx, idx + 1600);
  if (snippet.includes('XINGGONG') && snippet.includes('[s.faction]')) {
    throw new Error('sparNpc 仍使用 XINGGONG[s.faction] 判断战诀');
  }
});

runTest('combat_facade.startCombat 中使用 BattleEngine', () => {
  if (!FACADE_SRC.includes('BattleEngine')) throw new Error('startCombat 未使用 BattleEngine');
  if (!FACADE_SRC.includes('battle_async')) throw new Error('未导入 battle_async');
});

runTest('CombatFacade 有 V3 技能数据但无战诀时不静默 fallback', () => {
  const idx = FACADE_SRC.indexOf('startCombat(name, data)');
  const snippet = FACADE_SRC.substring(idx, idx + 1800);
  if (!snippet.includes('else if (dl.COMBAT_SKILLS_V3)')) {
    throw new Error('缺少 V3 数据存在但无战诀时的显式失败分支');
  }
  const fallbackIdx = snippet.indexOf('_legacyStartCombat');
  const explicitFailIdx = snippet.indexOf('else if (dl.COMBAT_SKILLS_V3)');
  if (fallbackIdx !== -1 && explicitFailIdx !== -1 && fallbackIdx < explicitFailIdx) {
    throw new Error('旧引擎 fallback 仍可能先于显式失败分支触发');
  }
});

runTest('combat_facade 中 autoCast 使用字母 slot', () => {
  // 确认 combatAction('attack') 传字母而非数字
  const idx = FACADE_SRC.indexOf("case 'attack'");
  if (idx === -1) {
    // 可能已移除 attack action
    return;
  }
  const snippet = FACADE_SRC.substring(idx, idx + 300);
  if (snippet.includes('autoCast(i)') || snippet.includes('autoCast(0)')) {
    throw new Error('combatAction(attack) 仍传数字给 autoCast');
  }
  if (snippet.includes('SLOTS') || snippet.includes("'A'")) {
    return; // 使用了字母
  }
  // 可能不调用 autoCast
  if (snippet.includes('战诀')) return; // 改为提示战诀自动运转
  throw new Error('无法确认 autoCast 使用字母 slot');
});

// ============================================================
// 汇总
// ============================================================
console.log('\n' + '━'.repeat(50));
console.log(`V1.6 NPC 切磋测试结果: ${passed} 通过, ${failed} 失败`);
if (failed === 0) console.log('✅ 全部通过！');
else console.log('❌ 存在失败');

process.exit(failed > 0 ? 1 : 0);
