// 随机玩家自动测试 — 以随机出牌遍历各种交互逻辑
// 用法: node test-auto.js [局数默认12]

var cp = require('child_process');
var fs = require('fs');
var path = require('path');

var SRC = path.join(__dirname, '..', 'src');
var STATE_FILE = path.join(SRC, 'interact3-state.json');
var TOTAL = parseInt(process.argv[2]) || 12;
var MAX_TURNS = 40;

var factions = ['血刀', '无极道人', '血刀'];
var aiFactions = ['无极道人', '夜修罗', '夜修罗'];

function log(msg) { console.log('[' + new Date().toISOString().substr(11,8) + '] ' + msg); }

function runCmd(cmd, args) {
  try {
    var r = cp.spawnSync(process.execPath, ['interact3.js', cmd].concat(args || []), {
      cwd: SRC, encoding: 'utf8', timeout: 10000
    });
    return { out: (r.stdout || '') + (r.stderr || ''), code: r.status || 0 };
  } catch (e) {
    return { out: e.message, code: -1 };
  }
}

function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch(e) { return null; }
}

function runGame(f, af) {
  log('开始: ' + f + ' vs ' + af);
  
  // Clean state from previous games
  try { fs.unlinkSync(STATE_FILE); } catch(e) {}
  
  var r = runCmd('init', ['入门', f, af]);
  if (r.code !== 0) { 
    log('INIT FAIL: ' + r.out.substring(0, 200)); 
    return { result: 'INIT_FAIL', issues: ['INIT_FAIL'], turns: 0 }; 
  }
  
  var issues = [];
  var consecutiveNoAction = 0;
  var lastRound = 0;
  var turn = 0;
  var gameOver = false;

  while (turn < MAX_TURNS && !gameOver) {
    turn++;
    var state = readState();
    if (!state) { issues.push('STATE_MISSING at turn ' + turn); break; }

    var phase = state.phase;
    var dis = state._disadvantagedSide;
    var p1 = state.players[0];
    var handLen = (p1.hand || []).length;

    // 选择操作
    var cmd = '', args = [];
    if (phase === 'chooseJudgment') {
      if (handLen > 0) {
        var jIdx = Math.floor(Math.random() * handLen);
        cmd = 'choice'; args = [String(jIdx)];
      } else {
        cmd = 'pass'; args = [];
      }
    } else if (phase === 'action' && dis === 'human') {
      var dice = Math.random();
      if (handLen === 0 || dice < 0.3) {
        cmd = 'pass'; args = [];
      } else if (dice < 0.5 && f === '血刀') {
        if (Math.random() < 0.5) {
          cmd = 'bloodwarfare'; args = ['cost'];
        } else {
          cmd = 'bloodwarfare'; args = ['discard'];
        }
      } else {
        cmd = 'choice'; args = [String(Math.floor(Math.random() * handLen))];
      }
    } else if (phase === 'action' && dis === 'ai') {
      cmd = 'continue'; args = [];
    } else if (phase === 'response') {
      if (Math.random() < 0.5) {
        cmd = 'skip'; args = [];
      } else {
        cmd = 'respond'; args = ['0'];
      }
    } else {
      issues.push('UNKNOWN_PHASE: ' + phase + ' at turn ' + turn);
      break;
    }

    // 执行
    r = runCmd(cmd, args);
    var out = r.out;

    // 检测问题
    if (r.code === -1 || r.code === 1) {
      // Check for expected soft errors
      if (out.indexOf('passive already used') >= 0 || out.indexOf('not action phase') >= 0) {
        consecutiveNoAction++;
        if (consecutiveNoAction > 5) { issues.push('STUCK at turn ' + turn); break; }
        continue;
      }
      if (out.indexOf('Invalid index') >= 0) {
        consecutiveNoAction++;
        if (consecutiveNoAction > 5) { issues.push('STUCK_INVALID_INDEX at turn ' + turn); break; }
        continue;
      }
      issues.push('CMD_FAIL at turn ' + turn + ' cmd=' + cmd + ' ' + args.join(' '));
      break;
    }
    consecutiveNoAction = 0;

    if (out.indexOf('游戏结束') >= 0 || out.indexOf('Game Over') >= 0) {
      gameOver = true;
      log('对局结束: winner=' + (out.indexOf('胜者: 你') >= 0 ? 'human' : 'AI') + ' turns=' + turn);
      break;
    }
    if (out.indexOf('Unexpected phase') >= 0) {
      issues.push('UNEXPECTED_PHASE at turn ' + turn + ' cmd=' + cmd);
      break;
    }
    // Check state invariants
    state = readState();
    if (state) {
      if (state.players[0].hp < 0 || state.players[1].hp < 0) {
        issues.push('NEGATIVE_HP at turn ' + turn);
      }
    }
  }
  if (turn >= MAX_TURNS && !gameOver) {
    issues.push('TIMEOUT at turn ' + turn);
  }
  return { result: issues.length === 0 ? 'OK' : 'ISSUES', issues: issues, turns: turn };
}

// 主循环
log('随机玩家自动测试：' + TOTAL + '局');
var results = { OK: 0, ISSUES: 0, INIT_FAIL: 0, TIMEOUT: 0 };
var allIssues = [];

for (var g = 0; g < TOTAL; g++) {
  var fi = g % 3;
  var r = runGame(factions[fi], aiFactions[fi]);
  results[r.result] = (results[r.result] || 0) + 1;
  if (r.issues && r.issues.length > 0) {
    allIssues.push('Game ' + (g+1) + ' [' + factions[fi] + ' vs ' + aiFactions[fi] + ']: ' + r.issues.join(' | '));
  }
}

console.log('\n═══════════════════════════════════');
console.log('结果: OK=' + (results.OK||0) + ' ISSUES=' + (results.ISSUES||0) + ' INIT_FAIL=' + (results.INIT_FAIL||0) + ' 合计=' + TOTAL);
if (allIssues.length > 0) {
  console.log('\n问题详情:');
  allIssues.forEach(function(i) { console.log('  ' + i); });
}
console.log('═══════════════════════════════════');
