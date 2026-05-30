// jianghu.js — 江湖对决 统一启动入口
// v2.1: +内嵌命令循环 +LOG文件 +统一渲染

var readline = require('readline');
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

var gs = require('./src/engine/gameState');
var { BaseAI } = require('./src/engine/ai');
var CONST = require('./src/data/constants.json');
var characters = require('./src/data/characters.json');
var decks = require('./src/data/decks.json');
var ui = require('./src/ui/renderer');

var STATE_FILE = path.join(__dirname, 'src', 'interact3-state.json');
var LOG_DIR = path.join(__dirname, 'logs');
var ROLES = ['血刀', '无极道人', '夜修罗'];
var FACTIONS = {
  '血刀': { deck: 'modeng_xuedao', char: 'xuedao', aiFaction: 'modeng' },
  '无极道人': { deck: 'wudang_wuji', char: 'wuji', aiFaction: 'wudang' },
  '夜修罗': { deck: 'yintang_yeshura', char: 'yeshura', aiFaction: 'yintang' }
};

var screen = 'menu';
var config = {};
var gameConfig = {};  // { humanChar, aiChar, diff, startTime }
var rl;

function clear() { process.stdout.write('\x1B[2J\x1B[H'); }
function ts() { return new Date().toISOString().replace(/[:T]/g,'-').substring(0,19); }

// ═══════════════════════════════════════════
//  菜单渲染
// ═══════════════════════════════════════════

var SCREENS = {
  main: function() {
    clear();
    console.log('');
    console.log('  ╔═══════════════════════════════════╗');
    console.log('  ║      ⚔️  江 湖 对 决  ⚔️       ║');
    console.log('  ╠═══════════════════════════════════╣');
    console.log('  ║                                   ║');
    console.log('  ║  [1]  单 人 模 式  (vs AI)       ║');
    console.log('  ║  [2]  多 人 模 式  (PVP)         ║');
    console.log('  ║                                   ║');
    console.log('  ║  [q]  退 出                       ║');
    console.log('  ║                                   ║');
    console.log('  ╚═══════════════════════════════════╝');
    console.log('');
    process.stdout.write('  请选择: ');
  },

  pveDiff: function() {
    clear();
    console.log('');
    console.log('  ╔═══════════════════════════════════╗');
    console.log('  ║      选择难度                    ║');
    console.log('  ╠═══════════════════════════════════╣');
    console.log('  ║  [1]  入门  — 休闲体验           ║');
    console.log('  ║  [2]  普通  — 标准规则           ║');
    console.log('  ╚═══════════════════════════════════╝');
    console.log('');
    process.stdout.write('  请选择 [1/2]: ');
  },

  pveHuman: function() {
    clear();
    console.log('');
    console.log('  ╔═══════════════════════════════════╗');
    console.log('  ║      选择你的宗师                ║');
    console.log('  ╠═══════════════════════════════════╣');
    ROLES.forEach(function(r,i){ console.log('  ║  ['+(i+1)+']  '+r+'                        ║'); });
    console.log('  ╚═══════════════════════════════════╝');
    console.log('');
    process.stdout.write('  请选择 [1/2/3]: ');
  },

  pveAi: function() {
    clear();
    console.log('');
    console.log('  ╔═══════════════════════════════════╗');
    console.log('  ║      选择对手宗师                ║');
    console.log('  ╠═══════════════════════════════════╣');
    ROLES.forEach(function(r,i){
      if (i !== config.humanIdx) console.log('  ║  ['+(i+1)+']  '+r+'                        ║');
    });
    console.log('  ╚═══════════════════════════════════╝');
    console.log('');
    process.stdout.write('  请选择: ');
  },

  pvpP1: function() {
    clear();
    console.log('');
    console.log('  ╔═══════════════════════════════════╗');
    console.log('  ║      选择 P1 的宗师             ║');
    console.log('  ╠═══════════════════════════════════╣');
    ROLES.forEach(function(r,i){ console.log('  ║  ['+(i+1)+']  '+r+'                        ║'); });
    console.log('  ╚═══════════════════════════════════╝');
    console.log('');
    process.stdout.write('  请选择 [1/2/3]: ');
  },

  pvpP2: function() {
    clear();
    console.log('');
    console.log('  ╔═══════════════════════════════════╗');
    console.log('  ║      选择 P2 的宗师             ║');
    console.log('  ╠═══════════════════════════════════╣');
    ROLES.forEach(function(r,i){
      if (i !== config.p1Idx) console.log('  ║  ['+(i+1)+']  '+r+'                        ║');
    });
    console.log('  ╚═══════════════════════════════════╝');
    console.log('');
    process.stdout.write('  请选择: ');
  }
};

// ═══════════════════════════════════════════
//  战斗日志
// ═══════════════════════════════════════════

function writeBattleLog(filename, content) {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(path.join(LOG_DIR, filename), content, 'utf8');
}

function dumpBattleLog() {
  if (!fs.existsSync(STATE_FILE)) return;
  var s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  var log = (s.log || []).join('\n');
  var fn = 'battle-' + gameConfig.startTime + '.log';
  writeBattleLog(fn, log);
  return fn;
}

function appendBattleLog(line) {
  if (!gameConfig.startTime) return;
  var fn = 'battle-' + gameConfig.startTime + '.log';
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, fn), '\n' + line, 'utf8');
}

// ═══════════════════════════════════════════
//  PVE: 初始化 + 命令循环
// ═══════════════════════════════════════════

function startPve(human, ai, diff) {
  clear();
  console.log('');
  console.log('  ╔═══════════════════════════════════╗');
  console.log('  ║   对局配置                       ║');
  console.log('  ╠═══════════════════════════════════╣');
  console.log('  ║  你: ' + human + '   vs   AI: ' + ai);
  console.log('  ║  难度: ' + diff);
  console.log('  ╚═══════════════════════════════════╝');
  console.log('');

  gameConfig = {
    humanChar: human, aiChar: ai, diff: diff,
    startTime: ts()
  };

  var hInfo = FACTIONS[human], aInfo = FACTIONS[ai];
  var state = gs.createGameState(decks[hInfo.deck], decks[aInfo.deck], characters[hInfo.char], characters[aInfo.char]);
  state.round = 0; state.log = [];
  state._difficulty = diff;

  var ai2 = new BaseAI(aInfo.aiFaction, hInfo.aiFaction);
  state.players[1]._ai = ai2;
  var p1 = state.players[0], p2 = state.players[1];

  gs.drawCards(p1, CONST.startingDraw, state);
  gs.drawCards(p2, CONST.startingDraw, state);
  state.log.push('=== 江湖对决 ===');
  state.log.push('对局时间: ' + gameConfig.startTime);
  state.log.push('你(' + human + ') vs AI(' + ai + ')  难度: ' + diff);
  state.log.push('P1('+p1.character.name+') HP='+p1.hp+' | P2('+p2.character.name+') HP='+p2.hp);

  state.round = 1;
  state.log.push('\n--- 第1回合 ---');
  resetRound(p1); resetRound(p2);
  p2.judgmentZone = ai2.chooseJudgmentCard(p2, p1, state);
  if (p2.judgmentZone) { var idx = p2.hand.indexOf(p2.judgmentZone); if (idx >= 0) p2.hand.splice(idx, 1); }
  state.phase = 'chooseJudgment';
  state.log.push('AI 暗盖1张 / 等待你的选择');

  var s = JSON.parse(JSON.stringify(state));
  s.__ai2 = { faction: ai2.faction, opponentFaction: ai2.opponentFaction };
  s.__difficulty = diff;
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));

  // 写初始日志到文件（战斗回顾不在界面显示）
  dumpBattleLog();

  // 显示（无战斗回顾）
  console.log(ui.renderCharacterSkill(characters[hInfo.char].id));
  showGameState(false);
  showPhaseMenu();

  screen = 'pveGame';
}

function showGameState(writeLog) {
  if (!fs.existsSync(STATE_FILE)) { console.log('(无活动对局)'); return; }
  var raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  var state = rebuildState(raw);
  if (!state) { console.log('(状态读取失败)'); return; }
  console.log(ui.render(state, 0, {noRecap: true}));
  if (writeLog !== false) dumpBattleLog();
}

function rebuildState(raw) {
  // 重建临时对象供渲染使用
  var cr = require('./src/engine/cardRegistry');
  function rehydrateCard(c) {
    if (!c || !c.id) return c;
    if (c._data && c._data.name) return c; // already hydrated
    var cd = cr.cardIndex[c.id];
    if (!cd) return c;
    c._data = cd;
    c.name = cd.name; c.type = cd.type; c.element = cd.element;
    c.cost = cd.cost; c.power = cd.power; c.innerPower = cd.innerPower || 0;
    c.tags = cd.tags || []; c.effectType = cd.effectType || null;
    return c;
  }
  function rehydrateZone(arr) {
    if (!arr) return [];
    return arr.map(rehydrateCard);
  }
  for (var pi = 0; pi < 2; pi++) {
    var p = raw.players[pi];
    if (!p) continue;
    p.hand = rehydrateZone(p.hand);
    p.dantian = rehydrateZone(p.dantian);
    p.actionZone = rehydrateZone(p.actionZone);
    p.discardPile = rehydrateZone(p.discardPile);
    p.exileZone = rehydrateZone(p.exileZone);
    p.judgmentZone = rehydrateCard(p.judgmentZone);
    p.extraDeck = rehydrateZone(p.extraDeck);
  }
  return raw;
}

// ═══════════════════════════════════════════
//  游戏命令处理
// ═══════════════════════════════════════════

function execGameCmd(cmdLine) {
  var parts = cmdLine.trim().split(/\s+/);
  var cmd = parts[0].toLowerCase();
  var args = parts.slice(1);

  // ── 本地命令 ──
  if (cmd === 'status') {
    showGameState(false);
    showPhaseMenu();
    return;
  }
  if (cmd === 'help') {
    showGameState(false);
    showPhaseMenu();
    return;
  }
  if (cmd === 'quit' || cmd === 'exit' || cmd === 'q') {
    dumpBattleLog();
    var logName = 'battle-' + gameConfig.startTime + '.log';
    console.log('\n  江湖再见！完整对局记录: logs/' + logName);
    rl.close();
    return;
  }

  // ── 只读命令 (view/discard/extra) — 不推进游戏，直接显示交互输出 ──
  var READ_ONLY = { view: true, discard: true, extra: true };
  if (READ_ONLY[cmd]) {
    var result = child_process.spawnSync(process.execPath,
      ['interact3.js'].concat(parts[0], args),
      { cwd: path.join(__dirname, 'src'), encoding: 'utf8', timeout: 15000 }
    );
    console.log((result.stdout || '') + (result.stderr || ''));
    showPhaseMenu();
    return;
  }

  // ── 判定阶段 pass 预检 ──
  if (cmd === 'pass' && fs.existsSync(STATE_FILE)) {
    var raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    if (raw.phase === 'chooseJudgment') {
      var hand = raw.players[0].hand || [];
      if (hand.length > 0) {
        console.log('\n⚠ 你还有 ' + hand.length + ' 张手牌，必须暗盖一张！使用 choice <n>。');
        showPhaseMenu();
        return;
      }
    }
  }

  // ── 记录当前 log 长度，用于行动报告 ──
  var lastLogLen = 0;
  if (fs.existsSync(STATE_FILE)) {
    var preState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    lastLogLen = (preState.log || []).length;
  }

  // 委托给 interact3.js
  var result = child_process.spawnSync(process.execPath,
    ['interact3.js'].concat(parts[0], args),
    { cwd: path.join(__dirname, 'src'), encoding: 'utf8', timeout: 15000 }
  );

  // ── 刷新面板 + 行动报告 + 命令菜单 ──
  showGameState(true);
  showActionReport(lastLogLen);
  showPhaseMenu();

  // 检查游戏结束
  var output = (result.stdout || '') + (result.stderr || '');
  if (output.indexOf('Game Over') >= 0 || output.indexOf('游戏结束') >= 0) {
    dumpBattleLog();
    var logName = 'battle-' + gameConfig.startTime + '.log';
    console.log('\n  完整对局记录: logs/' + logName);
    screen = 'main';
    SCREENS.main();
    return;
  }
}

function showActionReport(lastLogLen) {
  if (!fs.existsSync(STATE_FILE)) return;
  var raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  var log = raw.log || [];
  var newLines = log.slice(lastLogLen);
  if (newLines.length === 0) return;
  // 过滤 AI 手牌泄露 + FSM 调试信息
  var filtered = newLines.filter(function(l) {
    if (!l) return false;
    if (l.indexOf('🔍') >= 0 && l.indexOf('判定手牌') >= 0) return false;  // AI 判定手牌泄露
    if (l.indexOf('[FSM ERR]') >= 0) return false;  // FSM 调试
    if (l.indexOf('[FSM DEBUG]') >= 0) return false;
    return true;
  });
  if (filtered.length === 0) return;
  console.log('\n══ 行动报告 ══');
  filtered.forEach(function(l) { console.log('  ' + l); });
}

function showPhaseMenu() {
  if (!fs.existsSync(STATE_FILE)) return;
  var raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  var state = rebuildState(raw);
  if (!state) return;
  console.log(ui.renderPhaseCommands(state));
}

// ═══════════════════════════════════════════

function resetRound(player) {
  for (var i = player.actionZone.length - 1; i >= 0; i--) {
    if (player.actionZone[i].effectType === 'delayedDantian') {
      var c = player.actionZone.splice(i, 1)[0];
      player.dantian.push(c); player.baseInnerPower += (c._data.innerPower || 0);
    }
  }
  player.judgmentZone = null; player.actionZone = [];
  player.roundCardsPlayed = 0; player.hasDrawnFirstFlaw = false;
  player.cardsPlayedThisTurn = []; player.cardsMovedThisTurn = false;
  player.roundFlaws = 0; player.hasUsedPassiveThisRound = false;
  player._actionDepth = 0; player._skillfulDiscount = false;
  player.baseInnerPower = player.dantian.reduce(function(s,c){ var ip=c._data.innerPower||0; if(c._innerBoosted) ip+=1; return s+ip; },0);
  for (var di=0;di<player.dantian.length;di++){ var dc=player.dantian[di]; if(dc.effectType==='dantianInnerBonus'&&player.dantian.length>=(dc._data.dantianThreshold||2)){ player.baseInnerPower=Math.max(player.baseInnerPower,dc._data.innerThreshold||6); break; } }
  for (var fi=0;fi<player.dantian.length;fi++){ if(player.dantian[fi].effectType==='discardInnerBonus') player.baseInnerPower+=Math.floor(player.discardPile.length/2); }
  for (var j=0;j<player.dantian.length;j++){ if(player.dantian[j].effectType==='selfFlawGivesInner') player.baseInnerPower+=(player._selfInflictedFlaws||0); }
  for (var k=0;k<player.discardPile.length;k++){ if(player.discardPile[k].effectType==='persistInDiscard') player.baseInnerPower+=(player.discardPile[k]._data.innerPower||0); }
  player.innerPower=Math.max(0,player.baseInnerPower); player.totalPower=0;
}

// ═══════════════════════════════════════════
//  PVP
// ═══════════════════════════════════════════

function startPvp(p1Char, p2Char) {
  clear();
  console.log('');
  console.log('  ╔═══════════════════════════════════╗');
  console.log('  ║  P1: '+p1Char+'  vs  P2: '+p2Char);
  console.log('  ║  启动 PVP 热座模式...            ║');
  console.log('  ╚═══════════════════════════════════╝');
  console.log('');

  rl.close();
  var child = child_process.spawn(process.execPath, [
    path.join(__dirname, 'src', 'interact-pvp.js'), p1Char, p2Char
  ], { stdio: 'inherit', cwd: path.join(__dirname, 'src') });
  child.on('exit', function(code) { process.exit(code); });
}

// ═══════════════════════════════════════════
//  主循环
// ═══════════════════════════════════════════

rl = readline.createInterface({ input: process.stdin, output: process.stdout });
config = {};
screen = 'main';
SCREENS.main();

rl.on('line', function(line) {
  line = line.trim();

  // 全局退出
  if (line.toLowerCase() === 'q' || line.toLowerCase() === 'quit' || line.toLowerCase() === 'exit') {
    if (screen === 'pveGame') { dumpBattleLog(); }
    console.log('  江湖再见！'); rl.close(); return;
  }

  switch (screen) {
    case 'main':
      if (line === '1') { screen = 'pveDiff'; SCREENS.pveDiff(); }
      else if (line === '2') { screen = 'pvpP1'; SCREENS.pvpP1(); }
      else { SCREENS.main(); }
      break;

    case 'pveDiff':
      if (line === '1') { config.diff = '入门'; screen = 'pveHuman'; SCREENS.pveHuman(); }
      else if (line === '2') { config.diff = '普通'; screen = 'pveHuman'; SCREENS.pveHuman(); }
      else { SCREENS.pveDiff(); }
      break;

    case 'pveHuman':
      var hi = parseInt(line) - 1;
      if (hi >= 0 && hi < ROLES.length) { config.human = ROLES[hi]; config.humanIdx = hi; screen = 'pveAi'; SCREENS.pveAi(); }
      else { SCREENS.pveHuman(); }
      break;

    case 'pveAi':
      var ai = parseInt(line) - 1;
      if (ai >= 0 && ai < ROLES.length && ai !== config.humanIdx) {
        startPve(config.human, ROLES[ai], config.diff);
      } else { SCREENS.pveAi(); }
      break;

    // ★ 游戏命令循环 — 直接在窗口输入英文
    case 'pveGame':
      execGameCmd(line);
      break;

    case 'pvpP1':
      var p1i = parseInt(line) - 1;
      if (p1i >= 0 && p1i < ROLES.length) { config.p1 = ROLES[p1i]; config.p1Idx = p1i; screen = 'pvpP2'; SCREENS.pvpP2(); }
      else { SCREENS.pvpP1(); }
      break;

    case 'pvpP2':
      var p2i = parseInt(line) - 1;
      if (p2i >= 0 && p2i < ROLES.length && p2i !== config.p1Idx) {
        startPvp(config.p1, ROLES[p2i]);
      } else { SCREENS.pvpP2(); }
      break;

    default: SCREENS.main(); break;
  }
});

rl.on('close', function() { process.exit(0); });
