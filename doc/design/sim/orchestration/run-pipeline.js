// 全管道一键运行脚本
// node D:\jianghuCCG\sim\orchestration\run-pipeline.js [--quick] [--games N]
var fs = require('fs');
var path = require('path');
var { execSync } = require('child_process');

var ROOT = __dirname;
var RAW = path.join(ROOT, 'results', 'raw');
var AUDIT = path.join(ROOT, 'results', 'audit');
var SIM = path.resolve(ROOT, '..', 'src', 'index.js');
var RUNNER = path.join(ROOT, 'run-matchup.js');

var args = process.argv.slice(2);
var quick = args.includes('--quick');
var games = quick ? 100 : 500;
games = parseInt(args[args.indexOf('--games') + 1]) || games;

var matchups = [
  { id: 'md_vs_wd', label: '魔教vs武当' },
  { id: 'md_vs_yt', label: '魔教vs隐堂' },
  { id: 'wd_vs_yt', label: '武当vs隐堂' }
];

console.log('═══════════════════════════════');
console.log('  江湖对决 全管道测试 v1');
console.log('  每对阵 ' + games + '局');
console.log('═══════════════════════════════\n');

// Phase 1: Run all matchups in parallel
console.log('>>> Phase 1: 并行战斗测试');
var t0 = Date.now();

// Spawn all 3 in parallel using child_process
var children = [];
matchups.forEach(function(m) {
  var child = require('child_process').fork(RUNNER, [m.id, String(games)], { silent: true });
  child.matchup = m;
  child.on('exit', function(code) {
    child.done = true;
    child.exitCode = code;
  });
  children.push(child);
  console.log('  启动: ' + m.label + ' (' + games + '局)');
});

// Wait for all to finish
var checkInterval = setInterval(function() {
  var allDone = children.every(function(c) { return c.done; });
  if (allDone) {
    clearInterval(checkInterval);
    var elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log('\n  全部完成! 耗时 ' + elapsed + 's\n');

    // Phase 2: Aggregate results
    console.log('>>> Phase 2: 汇总结果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    var totalWins = { modeng: 0, wudang: 0, yintang: 0 };
    var totalGames = 0;

    matchups.forEach(function(m) {
      var f = path.join(RAW, m.id + '.json');
      if (fs.existsSync(f)) {
        var r = JSON.parse(fs.readFileSync(f, 'utf-8'));
        var d1 = r.deck1.split('_')[0];
        var d2 = r.deck2.split('_')[0];
        totalWins[d1] += r.p1Wins;
        totalWins[d2] += r.p2Wins;
        totalGames += r.totalGames;
        console.log('  ' + r.label + ' | ' + r.p1Rate + '% / ' + r.p2Rate + '% | ' + r.avgRounds + 'R');
      }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    var denom = totalGames / 500;
    console.log('  魔教综合: ' + (totalWins.modeng / denom / 500 * 100).toFixed(1) + '%');
    console.log('  武当综合: ' + (totalWins.wudang / denom / 500 * 100).toFixed(1) + '%');
    console.log('  隐堂综合: ' + (totalWins.yintang / denom / 500 * 100).toFixed(1) + '%');
    var rates = [totalWins.modeng, totalWins.wudang, totalWins.yintang].map(function(w) { return w / denom / 500 * 100; });
    console.log('  极差: ' + (Math.max.apply(null, rates) - Math.min.apply(null, rates)).toFixed(1) + '%');
    console.log('\n>>> 结果已保存至: ' + RAW + '\n');
    console.log('>>> Phase 3 (审计): 通过Agent B进行');
    process.exit(0);
  }
}, 200);
