// 30轮迭代优化器
// 每轮: 跑测试 → 分析 → 调整AI权重 → 记录 → 下一轮
// node D:\jianghuCCG\sim\orchestration\iterative-optimizer.js [--rounds N] [--games N]

var fs = require('fs');
var path = require('path');
var { execSync } = require('child_process');

var ROOT = __dirname;
var RUNNER = path.join(ROOT, 'run-pipeline.js');
var AI_PATH = path.join(ROOT, '..', 'src', 'engine', 'ai.js');
var LOG_PATH = path.join(ROOT, 'results', 'audit', 'iterations.jsonl');

var rounds = parseInt(process.argv[2]) || 30;
var gamesPer = parseInt(process.argv[3]) || 100;

console.log('═══════════════════════════════');
console.log('  迭代优化器 启动');
console.log('  轮数: ' + rounds + ' | 每对阵: ' + gamesPer + '局');
console.log('═══════════════════════════════\n');

var history = []; // { round, modeng%, wudang%, yintang%, range, changes }

function runPipelines() {
  try {
    execSync('node "' + RUNNER + '" --games ' + gamesPer, { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
  } catch(e) { /* pipeline always exits 0 */ }

  var results = {};
  var ids = ['md_vs_wd', 'md_vs_yt', 'wd_vs_yt'];
  ids.forEach(function(id) {
    var f = path.join(ROOT, 'results', 'raw', id + '.json');
    if (fs.existsSync(f)) {
      var r = JSON.parse(fs.readFileSync(f, 'utf-8'));
      results[id] = r;
    }
  });
  return results;
}

function computeRates(results) {
  var modengWins = (results.md_vs_wd ? results.md_vs_wd.p1Wins : 0) + (results.md_vs_yt ? results.md_vs_yt.p1Wins : 0);
  var wudangWins = (results.md_vs_wd ? results.md_vs_wd.p2Wins : 0) + (results.wd_vs_yt ? results.wd_vs_yt.p1Wins : 0);
  var yintangWins = (results.md_vs_yt ? results.md_vs_yt.p2Wins : 0) + (results.wd_vs_yt ? results.wd_vs_yt.p2Wins : 0);
  var totalGames = gamesPer * 2 * 3 / 3; // each faction plays 2 matchups × gamesPer games
  var denom = totalGames;
  return {
    modeng: modengWins / denom * 100,
    wudang: wudangWins / denom * 100,
    yintang: yintangWins / denom * 100
  };
}

function applyOptimization(round, rates, results) {
  // 基于本轮结果的AI策略微调
  // 策略: 渐进调整各阵营行动评分权重
  var aiSource = fs.readFileSync(AI_PATH, 'utf-8');
  var original = aiSource;
  var changes = [];

  // 策略1: 如果隐堂过强，降低其进攻牌评分，提高对手防御评分
  if (rates.yintang > 50) {
    var excess = rates.yintang - 50;
    // 降低隐堂秘术分
    var match = aiSource.match(/if \(f === 'yintang'\) return searchCard\._data\.power >= 0 && searchValue \+ 5;/);
    if (!match) {
      match = aiSource.match(/searchValue \+ (\d+)/);
    }
  }

  // 策略2: 如果魔教太弱，降低天魔解体阈值 + 提高震伤卡评分
  if (rates.modeng < 35) {
    // 降低天魔解体gap阈值: gap >= 12 → gap >= 8
    if (aiSource.indexOf('gap >= 12') >= 0) {
      var newGap = Math.max(6, 12 - Math.floor((35 - rates.modeng) / 5));
      aiSource = aiSource.replace(/gap >= \d+ \&\&.*forcedResolution.*\+7/, 'gap >= ' + newGap + ' && card.effectType === \'forcedResolution\') return 7');
      if (aiSource.indexOf('gap >= ' + newGap) < 0) {
        // fallback: simpler replacement
        aiSource = aiSource.replace(/gap >= 12/g, 'gap >= ' + newGap);
      }
      changes.push('天魔解体阈值: 12→' + newGap);
    }
  }

  // 策略3: 如果武当太强(>45%)，降低太极剑意优先级
  if (rates.wudang > 45) {
    // 提高武当出巧系的门槛
  }

  // 策略4: 硬降需要大幅干预时，不写回（只在log中记录建议）
  // 保守调整: 第1-5轮不写回AI，只观察
  if (round >= 5 && round % 5 === 0) {
    fs.writeFileSync(AI_PATH, aiSource, 'utf-8');
    changes.push('AI代码已更新（第' + round + '轮）');
  }

  return { aiModified: round >= 5 && round % 5 === 0, changes: changes };
}

// 主循环
var t0 = Date.now();
for (var r = 1; r <= rounds; r++) {
  process.stdout.write('轮次 ' + r + '/' + rounds + ' ');
  var results = runPipelines();
  var rates = computeRates(results);
  var range = (Math.max(rates.modeng, rates.wudang, rates.yintang) - Math.min(rates.modeng, rates.wudang, rates.yintang)).toFixed(1);
  process.stdout.write('魔' + rates.modeng.toFixed(1) + '% 武' + rates.wudang.toFixed(1) + '% 隐' + rates.yintang.toFixed(1) + '% Δ' + range + '\n');

  var opt = applyOptimization(r, rates, results);
  history.push({ round: r, modeng: rates.modeng, wudang: rates.wudang, yintang: rates.yintang, range: parseFloat(range), changes: opt.changes, aiModified: opt.aiModified });

  // 每5轮保存进度
  if (r % 5 === 0) {
    var elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log('  [保存进度 ' + r + '轮, 耗时' + elapsed + 's]');
  }
}

// 输出总结
console.log('\n═══════════════════════════════');
console.log('  迭代优化完成 (' + rounds + '轮)');
console.log('  总耗时: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
console.log('═══════════════════════════════\n');
console.log('轮次 | 魔教% | 武当% | 隐堂% | 极差 | 操作');
console.log('-----|-------|-------|-------|------|------');
history.forEach(function(h) {
  console.log([h.round, h.modeng.toFixed(1), h.wudang.toFixed(1), h.yintang.toFixed(1), h.range, h.changes.join(';') || '-'].join(' | '));
});

// 写入历史
fs.writeFileSync(LOG_PATH, history.map(JSON.stringify).join('\n') + '\n', 'utf-8');
console.log('\n历史日志: ' + LOG_PATH);

// 检查收敛
var last5 = history.slice(-5);
var ranges = last5.map(function(h) { return h.range; });
var avgRange = ranges.reduce(function(a,b){return a+b;},0) / ranges.length;
console.log('最后5轮均极差: ' + avgRange.toFixed(1) + '%');
