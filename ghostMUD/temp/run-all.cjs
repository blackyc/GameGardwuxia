/**
 * run-all.cjs — 统一测试运行器
 *
 * 执行所有 temp/*.test.cjs 文件，汇总结果。
 * 任何失败返回非零退出码。
 *
 * 运行方式: node temp/run-all.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_DIR = __dirname;
const nodeExe = process.execPath;

// 发现所有 .test.cjs 文件（排除自身）
const testFiles = fs.readdirSync(TEST_DIR)
  .filter(f => f.endsWith('.test.cjs'))
  .map(f => path.join(TEST_DIR, f));

console.log('═'.repeat(60));
console.log('  ghostMUD H2 测试框架 — 统一运行器');
console.log('═'.repeat(60));
console.log(`\n发现 ${testFiles.length} 个测试文件:\n`);
testFiles.forEach(f => console.log('  • ' + path.basename(f)));
console.log('');

let totalPassed = 0;
let totalFailed = 0;
const allFailures = [];
const results = [];

for (const testFile of testFiles) {
  const testName = path.basename(testFile, '.test.cjs');
  console.log('\n' + '┌' + '─'.repeat(58) + '┐');
  console.log('│ 运行: ' + testName.padEnd(52) + '│');
  console.log('└' + '─'.repeat(58) + '┘');

  try {
    // 在子进程中运行测试文件
    const output = execSync(`"${nodeExe}" "${testFile}"`, {
      encoding: 'utf8',
      cwd: path.join(TEST_DIR, '..'),
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    // 输出子进程的 stdout
    process.stdout.write(output);

    // 尝试从输出中解析结果
    const passMatch = output.match(/(\d+)\s+通过/);
    const failMatch = output.match(/(\d+)\s+失败/);
    
    const p = passMatch ? parseInt(passMatch[1]) : 0;
    const f = failMatch ? parseInt(failMatch[1]) : 0;
    
    totalPassed += p;
    totalFailed += f;
    results.push({ name: testName, passed: p, failed: f, status: 'ok' });
  } catch (e) {
    // 测试进程返回非零退出码或超时
    const output = e.stdout || '';
    const stderr = e.stderr || '';
    process.stdout.write(output);
    if (stderr) process.stderr.write(stderr);

    const passMatch = output.match(/(\d+)\s+通过/);
    const failMatch = output.match(/(\d+)\s+失败/);
    
    const p = passMatch ? parseInt(passMatch[1]) : 0;
    const f = failMatch ? parseInt(failMatch[1]) : 1;
    
    totalPassed += p;
    totalFailed += f;
    results.push({ name: testName, passed: p, failed: f, status: 'error', error: e.message });
  }
}

// 汇总
console.log('\n' + '═'.repeat(60));
console.log('  汇总结果');
console.log('═'.repeat(60));
console.log('');

for (const r of results) {
  const icon = r.failed === 0 ? '✓' : '✗';
  const status = r.failed === 0 ? 'PASS' : 'FAIL';
  console.log(`  ${icon} ${r.name.padEnd(30)} ${String(r.passed).padStart(4)} 通过  ${String(r.failed).padStart(4)} 失败  [${status}]`);
}

console.log('');
console.log(`  总计: ${totalPassed} 通过, ${totalFailed} 失败`);
console.log('');

if (totalFailed > 0) {
  console.log('❌ 测试失败！存在失败的测试用例。');
  process.exit(1);
} else {
  console.log('✅ 所有测试通过！');
  process.exit(0);
}
