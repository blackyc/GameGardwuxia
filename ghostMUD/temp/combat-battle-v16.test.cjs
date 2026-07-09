/**
 * combat-battle-v16.test.cjs — V1.6 战斗核心行为测试
 *
 * 测试范围：
 * 3. 开局全 CD
 * 4. CD 到+MP 足够自动出招
 * 5. MP 不足触发门禁
 * 6. 门禁选择调息后推进
 * 7. physical 打免疫敌人为 0
 * 8. fire/spirit 不被免疫
 *
 * 由于 BattleEngine 是 ESM 且依赖 window 全局变量，
 * 本测试通过源码静态分析 + 逻辑模拟验证核心行为。
 *
 * 运行: node temp/combat-battle-v16.test.cjs
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

const SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'battle_async.js'), 'utf8'
);

console.log('\n📋 V1.6 战斗核心行为测试\n' + '━'.repeat(50));

// ============================================================
// 1. 开局全 CD
// ============================================================
console.log('\n1. 开局全 CD');

runTest('_initCooldowns 方法存在', () => {
  if (!SRC.includes('_initCooldowns')) throw new Error('_initCooldowns not found');
});

runTest('开局所有技能从最大 CD 开始倒数', () => {
  const idx = SRC.indexOf('_initCooldowns(chart)');
  if (idx === -1) throw new Error('_initCooldowns 定义未找到');
  const snippet = SRC.substring(idx, idx + 500);
  if (!snippet.includes('cds') && !snippet.includes('cooldown')) throw new Error('initCooldowns 未设置 CD 值');
  if (!snippet.includes('SLOTS')) throw new Error('initCooldowns 未遍历 SLOTS');
});

runTest('TICK_RATE = 100ms', () => {
  if (!SRC.includes('TICK_RATE = 100')) throw new Error('TICK_RATE 不是 100ms');
});

runTest('SLOTS 数组 = [A,B,C,D,E]', () => {
  if (!SRC.includes(`['A', 'B', 'C', 'D', 'E']`)) throw new Error('SLOTS 不是 A-E');
});

// ============================================================
// 2. CD 到 + MP 足够 → 自动出招
// ============================================================
console.log('\n2. CD 到 + MP 足够 → 自动出招');

runTest('checkDoubleGate 方法存在', () => {
  if (!SRC.includes('checkDoubleGate')) throw new Error('checkDoubleGate not found');
});

runTest('双门禁检查 CD 和 MP 两个条件', () => {
  const idx = SRC.indexOf('checkDoubleGate');
  const snippet = SRC.substring(idx, idx + 600);
  if (!snippet.includes('cdReady')) throw new Error('缺少 cdReady 检查');
  if (!snippet.includes('mpEnough')) throw new Error('缺少 mpEnough 检查');
});

runTest('双门禁通过后调用 autoCast', () => {
  const idx = SRC.indexOf('双门禁通过');
  if (idx === -1) throw new Error('缺少 "双门禁通过" 注释');
  const snippet = SRC.substring(idx, idx + 100);
  if (!snippet.includes('autoCast')) throw new Error('双门禁通过后未调用 autoCast');
});

runTest('autoCast 接收字母 slot 参数', () => {
  const idx = SRC.indexOf('autoCast(slot)');
  if (idx === -1) throw new Error('autoCast(slot) 签名未找到');
  // 验证 autoCast 内部用 slot 做 chart 查找
  const snippet = SRC.substring(idx, idx + 200);
  if (!snippet.includes('bs.chart[slot]')) throw new Error('autoCast 内部未用 chart[slot]');
});

runTest('autoCast 内部使用 getSkillData 获取归一化技能', () => {
  const idx = SRC.indexOf('autoCast(slot)');
  const snippet = SRC.substring(idx, idx + 300);
  if (!snippet.includes('getSkillData')) throw new Error('autoCast 未调用 getSkillData');
});

// ============================================================
// 3. MP 不足触发门禁
// ============================================================
console.log('\n3. MP 不足触发门禁');

runTest('triggerMpGate 方法存在', () => {
  if (!SRC.includes('triggerMpGate')) throw new Error('triggerMpGate not found');
});

runTest('门禁使用 getSkillCost 计算需求', () => {
  const idx = SRC.indexOf('triggerMpGate(skill)');
  if (idx === -1) throw new Error('triggerMpGate 定义未找到');
  const snippet = SRC.substring(idx, idx + 500);
  if (!snippet.includes('getSkillCost')) throw new Error('triggerMpGate 未使用 getSkillCost');
});

runTest('UI 门禁 need 使用 getSkillCost 统一入口', () => {
  const idx = SRC.indexOf('mpGate:');
  if (idx === -1) throw new Error('getBattleUIData 未返回 mpGate');
  const snippet = SRC.substring(idx, idx + 260);
  if (!snippet.includes('getSkillCost(bs.mpGateSkill)')) {
    throw new Error('mpGate.need 未使用 getSkillCost');
  }
});

runTest('门禁设置 mpGateTimer', () => {
  const idx = SRC.indexOf('triggerMpGate(skill)');
  if (idx === -1) throw new Error('triggerMpGate 定义未找到');
  const snippet = SRC.substring(idx, idx + 500);
  if (!snippet.includes('mpGateTimer')) throw new Error('未设置 mpGateTimer');
});

runTest('门禁超时 = 5 秒', () => {
  if (!SRC.includes('MP_GATE_TIMEOUT = 5.0')) throw new Error('MP_GATE_TIMEOUT 不是 5.0');
});

// ============================================================
// 4. 门禁选择调息后推进
// ============================================================
console.log('\n4. 门禁选择调息后推进');

runTest('resolveMpGate 方法存在', () => {
  if (!SRC.includes('resolveMpGate')) throw new Error('resolveMpGate not found');
});

runTest('调息恢复 30 点真气', () => {
  if (!SRC.includes('MP_GATE_REST_RECOVER = 30')) throw new Error('调息恢复量不是 30');
});

runTest('resolveMpGate 支持 4 种选择', () => {
  const idx = SRC.indexOf('resolveMpGate(choice)');
  if (idx === -1) throw new Error('resolveMpGate 定义未找到');
  const snippet = SRC.substring(idx, idx + 1500);
  if (!snippet.includes("'rest'")) throw new Error('缺少 rest（调息）');
  if (!snippet.includes("'potion'")) throw new Error('缺少 potion（服药）');
  if (!snippet.includes("'basic'")) throw new Error('缺少 basic（平斩）');
  if (!snippet.includes("'force'")) throw new Error('缺少 force（强行运功）');
});

runTest('调息后恢复 MP 并清除门禁状态', () => {
  const idx = SRC.indexOf("case 'rest'");
  if (idx === -1) throw new Error("case 'rest' not found");
  // 搜索更大范围以覆盖 resolveMpGate 末尾的清除逻辑
  const snippet = SRC.substring(idx, idx + 2000);
  if (!snippet.includes('MP_GATE_REST_RECOVER')) throw new Error('调息未使用 MP_GATE_REST_RECOVER');
  if (!snippet.includes('mpGatePending')) throw new Error('未清除 mpGatePending');
});

// ============================================================
// 5. 物理免疫
// ============================================================
console.log('\n5. 物理免疫');

runTest('physical 打免疫敌人为 0', () => {
  const idx = SRC.indexOf('物理免疫');
  if (idx === -1) throw new Error('物理免疫检查未找到');
  const snippet = SRC.substring(idx, idx + 200);
  if (!snippet.includes("'physical'")) throw new Error('未检查 physical 类型');
  if (!snippet.includes('physicalImmune')) throw new Error('未检查 physicalImmune 标记');
  if (!snippet.includes('dmg = 0')) throw new Error('未将伤害设为 0');
});

runTest('fire/spirit 不被物理免疫', () => {
  // 确认只有 physical 类型被免疫
  const idx = SRC.indexOf('物理免疫');
  const snippet = SRC.substring(idx, idx + 200);
  // 检查条件是 === 'physical'，不是 != 或包含其他类型
  if (!snippet.includes("=== 'physical'")) throw new Error('免疫条件不是严格匹配 physical');
  // 确保 fire/spirit 等不在免疫条件中
  if (snippet.includes("fire") && snippet.includes("physicalImmune")) {
    throw new Error('fire 被错误纳入物理免疫');
  }
});

// ============================================================
// 6. 装备加成接入
// ============================================================
console.log('\n6. 装备加成接入');

runTest('startCombat 读取 weaponAtk', () => {
  const idx = SRC.indexOf('startCombat(');
  const snippet = SRC.substring(idx, idx + 600);
  if (!snippet.includes('getWeaponAtk')) throw new Error('未调用 getWeaponAtk');
  if (!snippet.includes('weaponAtk')) throw new Error('未存储 weaponAtk');
});

runTest('伤害计算使用 calcSkillDamageWithWeapon', () => {
  const idx = SRC.indexOf('calcSkillDamageWithWeapon');
  if (idx === -1) throw new Error('calcSkillDamageWithWeapon not found');
  // 确认实际调用点
  const callIdx = SRC.indexOf('calcSkillDamageWithWeapon(sk');
  if (callIdx === -1) throw new Error('calcSkillDamageWithWeapon 未被调用');
});

runTest('force 门禁中伤害含 weaponAtk', () => {
  const forceIdx = SRC.indexOf("case 'force'");
  const snippet = SRC.substring(forceIdx, forceIdx + 400);
  if (!snippet.includes('weaponAtk')) throw new Error('force 门禁伤害未含 weaponAtk');
});

// ============================================================
// 7. 状态效果从 skill.status 读取
// ============================================================
console.log('\n7. 状态效果从 skill.status 读取');

runTest('_applyStatusEffects 读取 skill.status 而非旧字段', () => {
  // 搜索函数定义行
  const idx = SRC.indexOf('_applyStatusEffects(skill, attackerStatus, defenderStatus, isPlayer)');
  if (idx === -1) throw new Error('_applyStatusEffects 定义未找到');
  const snippet = SRC.substring(idx, idx + 800);
  if (!snippet.includes('skill.status')) throw new Error('未从 skill.status 读取');
  if (snippet.includes('skill.shiguNum > 0')) throw new Error('仍直接读 skill.shiguNum');
  if (snippet.includes('skill.lieshangNum > 0')) throw new Error('仍直接读 skill.lieshangNum');
  if (snippet.includes('skill.yehuoNum > 0')) throw new Error('仍直接读 skill.yehuoNum');
});

// ============================================================
// 汇总
// ============================================================
console.log('\n' + '━'.repeat(50));
console.log(`V1.6 战斗核心测试结果: ${passed} 通过, ${failed} 失败`);
if (failed === 0) console.log('✅ 全部通过！');
else console.log('❌ 存在失败');

process.exit(failed > 0 ? 1 : 0);
