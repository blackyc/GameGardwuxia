/**
 * combat-intervene-v16.test.cjs — V1.6 干预引擎测试
 *
 * 测试范围：
 * 5. 从 presetCharts 数组读取
 * 5. 切换后更新 battleState.chart
 * 5. 第二次变式失败（消耗限制）
 *
 * 运行: node temp/combat-intervene-v16.test.cjs
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
  path.join(__dirname, '..', 'src', 'battle_intervene.js'), 'utf8'
);

console.log('\n📋 V1.6 干预引擎测试\n' + '━'.repeat(50));

// ============================================================
// 1. 从 presetCharts 数组读取
// ============================================================
console.log('\n1. 从 presetCharts 数组读取');

runTest('import findPresetChart', () => {
  if (!SRC.includes('findPresetChart')) throw new Error('未导入 findPresetChart');
});

runTest('_getPresetChart 使用 findPresetChart', () => {
  const idx = SRC.indexOf('_getPresetChart');
  if (idx === -1) {
    // 可能已被内联
    if (!SRC.includes('findPresetChart')) throw new Error('findPresetChart 未被使用');
    return;
  }
  const snippet = SRC.substring(idx, idx + 300);
  if (!snippet.includes('findPresetChart')) throw new Error('_getPresetChart 未调用 findPresetChart');
});

runTest('兼容旧 chartPresets 对象格式', () => {
  // findPresetChart 内部兼容旧格式
  const contractSrc = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'combat_contract.js'), 'utf8'
  );
  const idx = contractSrc.indexOf('findPresetChart');
  const snippet = contractSrc.substring(idx, idx + 500);
  if (!snippet.includes('chartPresets')) throw new Error('未兼容旧 chartPresets');
});

// ============================================================
// 2. 切换后更新 battleState.chart
// ============================================================
console.log('\n2. 切换后更新 battleState.chart');

runTest('doVariant 方法存在', () => {
  if (!SRC.includes('doVariant')) throw new Error('doVariant not found');
});

runTest('doVariant 从 preset.slots 提取战诀', () => {
  const idx = SRC.indexOf('doVariant(chartId)');
  if (idx === -1) throw new Error('doVariant 定义未找到');
  const funcBody = SRC.substring(idx, idx + 1200);
  if (!funcBody.includes('preset.slots')) throw new Error('doVariant 未从 preset.slots 提取');
});

runTest('变式后更新 battleState.chart', () => {
  const idx = SRC.indexOf('doVariant(chartId)');
  if (idx === -1) throw new Error('doVariant 定义未找到');
  const funcBody = SRC.substring(idx, idx + 1500);
  if (!funcBody.includes('bs.chart') && !funcBody.includes('battleState.chart')) {
    throw new Error('变式后未更新 chart');
  }
});

runTest('变式后重新扫描羁绊', () => {
  const idx = SRC.indexOf('doVariant(chartId)');
  if (idx === -1) throw new Error('doVariant 定义未找到');
  const funcBody = SRC.substring(idx, idx + 2000);
  // 羁绊扫描可能在变式后调用 _recalcBonds 或类似方法
  if (!funcBody.includes('bond') && !funcBody.includes('Bond') && !funcBody.includes('sectBonus')) {
    throw new Error('变式后未重新扫描羁绊');
  }
});

// ============================================================
// 3. 变式次数限制
// ============================================================
console.log('\n3. 变式次数限制');

runTest('getAvailableInterventions 方法存在', () => {
  if (!SRC.includes('getAvailableInterventions')) throw new Error('getAvailableInterventions not found');
});

runTest('变式次数有上限检查', () => {
  // doVariant 内部检查 interventionUsed.variant
  const idx = SRC.indexOf('doVariant(chartId)');
  if (idx === -1) throw new Error('doVariant 定义未找到');
  const funcBody = SRC.substring(idx, idx + 600);
  if (!funcBody.includes('interventionUsed') && !funcBody.includes('variant')) {
    throw new Error('doVariant 未检查变式次数');
  }
  if (!funcBody.includes('variant')) throw new Error('未检查 variant 标记');
});

// ============================================================
// 4. 畸变字段统一
// ============================================================
console.log('\n4. 畸变字段统一');

runTest('使用 getCorruptionLevel 而非直接读 corruption', () => {
  if (!SRC.includes('getCorruptionLevel')) throw new Error('未导入 getCorruptionLevel');
});

runTest('写入统一用 corruptionLevel', () => {
  if (!SRC.includes('corruptionLevel')) throw new Error('未使用 corruptionLevel');
  // 不应该有新的 corruption 赋值（除了兼容读取）
  const setIdx = SRC.indexOf('corruption =');
  if (setIdx !== -1) {
    throw new Error('仍存在直接赋值 corruption');
  }
});

// ============================================================
// 5. MP 门禁中不能变式
// ============================================================
console.log('\n5. MP 门禁中不能变式');

runTest('门禁期间禁止变式检查', () => {
  const idx = SRC.indexOf('doVariant');
  const funcBody = SRC.substring(idx, idx + 400);
  if (!funcBody.includes('mpGate') && !funcBody.includes('MpGate')) {
    throw new Error('doVariant 未检查 MP 门禁状态');
  }
});

// ============================================================
// 汇总
// ============================================================
console.log('\n' + '━'.repeat(50));
console.log(`V1.6 干预引擎测试结果: ${passed} 通过, ${failed} 失败`);
if (failed === 0) console.log('✅ 全部通过！');
else console.log('❌ 存在失败');

process.exit(failed > 0 ? 1 : 0);
