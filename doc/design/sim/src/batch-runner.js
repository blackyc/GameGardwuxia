// batch-runner.js — AgentC批量编排器
// 三组对决各10000场: 魔教vs武当, 武当vs隐堂, 隐堂vs魔教
// 用法: node batch-runner.js <matchup> <startIdx> <endIdx>
//   matchup: 1=魔教vs武当, 2=武当vs隐堂, 3=隐堂vs魔教
// 输出: data/game_N.json (每场), data/summary_M.json (汇总)

var fs = require('fs');
var path = require('path');
var { spawn } = require('child_process');

var SCRIPT = path.join(__dirname, 'agent-c.js');
var DATA_DIR = path.join(__dirname, '..', 'data');
var BUG_DIR = path.join(__dirname, '..', 'bugs');

var MATCHUPS = [
  null,
  { name: 'modeng_vs_wudang', p1: 'modeng', p2: 'wudang' },
  { name: 'wudang_vs_yintang', p1: 'wudang', p2: 'yintang' },
  { name: 'yintang_vs_modeng', p1: 'yintang', p2: 'modeng' }
];

function runGame(matchup, idx) {
  return new Promise(function(resolve) {
    var start = Date.now();
    var child = spawn(process.execPath, [SCRIPT, matchup.p1, matchup.p2, String(idx)], {
      cwd: __dirname,
      timeout: 120000, // 2 min timeout
      stdio: ['ignore', 'pipe', 'pipe']
    });
    var stdout = '', stderr = '';
    child.stdout.on('data', function(d) { stdout += d; });
    child.stderr.on('data', function(d) { stderr += d; });
    child.on('close', function(code) {
      var elapsed = Date.now() - start;
      var result = null;
      try { result = JSON.parse(stdout.trim()); } catch(e) {}
      resolve({
        idx: idx, matchup: matchup.name, code: code, elapsedMs: elapsed,
        result: result, stderr: stderr.slice(0, 500)
      });
    });
    child.on('error', function(e) {
      resolve({ idx: idx, matchup: matchup.name, code: -1, elapsedMs: Date.now() - start, error: e.message });
    });
  });
}

function logBug(idx, matchup, info) {
  if (!fs.existsSync(BUG_DIR)) fs.mkdirSync(BUG_DIR, { recursive: true });
  var ts = new Date().toISOString().replace(/[:.]/g, '-');
  var file = path.join(BUG_DIR, 'bug_game' + idx + '_' + ts + '.md');
  fs.writeFileSync(file, '# Bug: Game ' + idx + ' (' + matchup + ')\n\n' +
    '**Time:** ' + new Date().toISOString() + '\n\n' +
    '**Details:**\n' + info + '\n');
  return file;
}

async function runBatch(matchupNum, startIdx, endIdx, maxConcurrent) {
  var matchup = MATCHUPS[matchupNum];
  if (!matchup) { console.error('Invalid matchup'); return; }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  var total = endIdx - startIdx + 1;
  var results = { matchup: matchup.name, total: total, wins: { p1: 0, p2: 0 }, errors: 0, completed: 0, bugs: [] };
  var summaryFile = path.join(DATA_DIR, 'summary_' + matchup.name + '.json');

  // 断点续传
  if (fs.existsSync(summaryFile)) {
    var prev = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    if (prev.completed > 0) {
      console.log('Resuming from ' + prev.completed + ' completed');
      results = prev;
      startIdx = startIdx + prev.completed;
    }
  }

  maxConcurrent = maxConcurrent || 1;  // 默认串行，避免并发stdout混淆
  var active = [];
  var idx = startIdx;

  function saveSummary() {
    fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2), 'utf8');
  }

  while (idx <= endIdx || active.length > 0) {
    while (active.length < maxConcurrent && idx <= endIdx) {
      var p = runGame(matchup, idx).then(function(r) {
        active = active.filter(function(x) { return x !== p; });
        results.completed++;

        if (r.code === 0 && r.result) {
          if (r.result.winner === 1) results.wins.p1++;
          else if (r.result.winner === 2) results.wins.p2++;
          if (r.result.errors && r.result.errors.length > 0) results.errors++;
        } else {
          results.errors++;
          var bugInfo = 'Exit code: ' + r.code + '\nError: ' + (r.error || r.stderr || 'unknown');
          var bf = logBug(r.idx, matchup.name, bugInfo);
          results.bugs.push({ game: r.idx, file: bf, info: bugInfo.slice(0, 200) });
          console.log('  ⚠ Game ' + r.idx + ' needed fix, bug logged');
        }

        if (results.completed % 100 === 0) {
          var pct = (results.completed / total * 100).toFixed(1);
          console.log('[' + matchup.name + '] ' + results.completed + '/' + total + ' (' + pct + '%)' +
            ' P1 wins:' + results.wins.p1 + ' P2:' + results.wins.p2 + ' ERR:' + results.errors);
          saveSummary();
        }
      });
      active.push(p);
      idx++;
    }
    if (active.length > 0) {
      await new Promise(function(r) { setTimeout(r, 100); });
    }
  }

  saveSummary();
  console.log('\n=== ' + matchup.name + ' COMPLETE ===');
  console.log('Total: ' + results.completed + ' | P1 wins: ' + results.wins.p1 + ' | P2 wins: ' + results.wins.p2 + ' | Errors: ' + results.errors);
}

// ═══ Main ═══
var args = process.argv.slice(2);
var matchupNum = parseInt(args[0] || '1');
var startIdx = parseInt(args[1] || '1');
var endIdx = parseInt(args[2] || '10000');
var concurrent = parseInt(args[3] || '4');

runBatch(matchupNum, startIdx, endIdx, concurrent).then(function() {
  console.log('Done.');
}).catch(function(e) {
  console.error('Fatal:', e.message);
  process.exit(1);
});
