#!/usr/bin/env node
// 交互式对战 —— 人类魔教 vs AI武当
// 用法 (在 sim/src/ 下): node interact.js init | choice <cardIdx> | pass | status
var fs = require('fs');
var path = require('path');
var GameEngine = require('./engine/engine');
var aiModule = require('./engine/ai');
var CONST = require('./data/constants.json');
var gs = require('./engine/gameState');

var ENGINE_DIR = path.join(__dirname, 'engine');
var STATE_PATH = path.join(__dirname, 'interact-state.json');
var DECISION_PATH = path.join(__dirname, 'interact-decision.txt');

// ── 卡牌显示 ──
function cardInfo(c) {
  if (!c) return '(none)';
  var d = c._data;
  var cost = d.cost !== undefined ? 'C' + d.cost : '';
  var pwr = d.power !== undefined ? 'P' + d.power : '';
  var ip = d.innerPower ? 'I' + d.innerPower : '';
  var el = d.element || '';
  var tp = d.type === 'xinfa' ? 'Xinfa' : 'Wuji';
  var ef = d.effectType ? ' [' + d.effectType + ']' : '';
  return d.name + ' ' + tp + '/' + el + ' ' + cost + ' ' + pwr + ' ' + ip + ef;
}

function showGame(state, humanIdx) {
  var hp = state.players[humanIdx];
  var ap = state.players[1 - humanIdx];
  console.log('\n=== Round ' + state.round + ' | Phase: ' + (state.phase || '?') + ' ===');
  console.log('You(' + hp.character.name + ') HP=' + hp.hp + ' Inner=' + hp.innerPower + ' Flaw=' + hp.flaws + (hp._flawShield>0?' Shield:'+hp._flawShield:'') + ' Poison=' + (hp.poisonStacks||0) + ' Power=' + (hp.totalPower||0));
  console.log('AI(' + ap.character.name + ') HP=' + ap.hp + ' Inner=' + ap.innerPower + ' Flaw=' + ap.flaws + (ap._flawShield>0?' Shield:'+ap._flawShield:'') + ' Poison=' + (ap.poisonStacks||0) + ' Power=' + (ap.totalPower||0));

  if (hp.judgmentZone) console.log('Your Judgment: ' + cardInfo(hp.judgmentZone));
  if (ap.judgmentZone) console.log('AI Judgment: ' + cardInfo(ap.judgmentZone));

  console.log('Your ActionZone: ' + (hp.actionZone.length ? hp.actionZone.map(cardInfo).join(' | ') : '(empty)'));
  console.log('AI ActionZone: ' + (ap.actionZone.length ? ap.actionZone.map(cardInfo).join(' | ') : '(empty)'));

  console.log('\nYour Dantian(' + hp.dantian.length + '): ' + (hp.dantian.length ? hp.dantian.map(cardInfo).join(' | ') : '(empty)'));
  console.log('AI Dantian(' + ap.dantian.length + '): ' + (ap.dantian.length ? ap.dantian.map(cardInfo).join(' | ') : '(empty)'));

  console.log('Your Discard(' + hp.discardPile.length + '): ' + (hp.discardPile.length ? hp.discardPile.map(function(c){return c._data.name}).join(', ') : '(empty)'));
  console.log('AI Discard(' + ap.discardPile.length + '): ' + (ap.discardPile.length ? ap.discardPile.map(function(c){return c._data.name}).join(', ') : '(empty)'));

  console.log('\n-- Your Hand (' + hp.hand.length + ') --');
  hp.hand.forEach(function(c, i) {
    console.log('  [' + i + '] ' + cardInfo(c));
  });
  console.log('--');
}

// ── 人类AI包装 ──
var _humanDecision = null;
var _humanDecisionType = null;
var _waitingForHuman = false;
var _humanPlayerIdx = 0;

function HumanAI(playerFaction, oppFaction) {
  // 继承 BaseAI 的辅助功能
  this.playerFaction = playerFaction;
  this.oppFaction = oppFaction;
  this.opponentHandCount = 5;
}

// 从 BaseAI 借用所有方法
HumanAI.prototype = new aiModule.BaseAI('modeng', 'wudang');

// 覆盖决策方法
HumanAI.prototype.takeAction = function(self, opponent, state) {
  if (_waitingForHuman) {
    // 等待中，反复询问（不应该出现）
    console.log('[WARN] Already waiting for human decision');
    return 'surrender';
  }

  if (self.id - 1 !== _humanPlayerIdx) {
    // 不是人类玩家，不应该调用到这里
    console.log('[WARN] HumanAI called for non-human player');
    return 'surrender';
  }

  // 保存状态
  saveState(state);

  _waitingForHuman = true;
  _humanDecisionType = 'action';

  showGame(state, _humanPlayerIdx);
  console.log('\nYou are DISADVANTAGED. Play card [0-' + (self.hand.length-1) + '] or pass:');
  console.log('>>> node interact.js choice <index>  or  node interact.js pass');

  // 暂停 —— 通过 process.exit 退出等待
  process.exit(0);
};

HumanAI.prototype.chooseJudgmentCard = function(self, opponent, state) {
  if (_waitingForHuman) {
    console.log('[WARN] Already waiting');
    return null;
  }

  saveState(state);

  _waitingForHuman = true;
  _humanDecisionType = 'judgment';

  showGame(state, _humanPlayerIdx);
  console.log('\nChoose judgment card [0-' + (self.hand.length-1) + '] or pass:');
  console.log('>>> node interact.js choice <index>  or  node interact.js pass');

  process.exit(0);
};

HumanAI.prototype.shouldTriggerTaichi = function(self, opponent, state) {
  // 太极剑意仍由原AI决策（复用）
  var ai = new aiModule.BaseAI('wudang', 'modeng');
  return ai.shouldTriggerTaichi(self, opponent, state);
};

// ── 状态持久化 ──
function saveState(state) {
  var snap = {
    round: state.round,
    phase: state.phase,
    isGameOver: state.isGameOver,
    winner: state.winner,
    log: state.log,
    p1: snapPlayer(state.players[0]),
    p2: snapPlayer(state.players[1])
  };
  fs.writeFileSync(STATE_PATH, JSON.stringify(snap, null, 2), 'utf8');
}

function snapPlayer(p) {
  return {
    id: p.id, _aiType: p.id === 1 ? 'human' : 'ai',
    hp: p.hp, innerPower: p.innerPower, baseInnerPower: p.baseInnerPower,
    flaws: p.flaws, _flawShield: p._flawShield || 0,
    poisonStacks: p.poisonStacks || 0,
    hasDrawnFirstFlaw: p.hasDrawnFirstFlaw || false,
    roundCardsPlayed: p.roundCardsPlayed || 0,
    hasUsedPassiveThisRound: p.hasUsedPassiveThisRound || false,
    _bloodWarfareUsed: p._bloodWarfareUsed || false,
    _bloodWarfareMode: p._bloodWarfareMode || null,
    hasTriggeredSunshine: p.hasTriggeredSunshine || false,
    _skillfulDiscount: p._skillfulDiscount || false,
    roundFlaws: p.roundFlaws || 0,
    _actionDepth: p._actionDepth || 0,
    cardsMovedThisTurn: p.cardsMovedThisTurn || false,
    hand: p.hand, dantian: p.dantian, discardPile: p.discardPile,
    extraDeck: p.extraDeck,
    actionZone: p.actionZone || [],
    judgmentZone: p.judgmentZone || null,
    freePlayDiscount: p.freePlayDiscount || 0,
    freePlayNextTurn: p.freePlayNextTurn || false,
    _moveDiscountUsed: p._moveDiscountUsed || false,
    totalPower: p.totalPower || 0,
    _deck: p._deck,
    _cardsPlayedThisTurn: p._cardsPlayedThisTurn || [],
    characterId: p.character ? p.character.id : null
  };
}

function loadState() {
  var snap = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  
  // 加载卡牌数据
  var chars = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'characters.json'), 'utf8'));
  var deckData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'decks.json'), 'utf8'));
  
  var humanChar = chars[snap.p1.characterId];
  var aiChar = chars[snap.p2.characterId];
  
  var humanAi = new HumanAI('modeng', 'wudang');
  var aiAi = new aiModule.BaseAI('wudang', 'modeng');
  
  var engine = new GameEngine(deckData.modeng_xuedao, deckData.wudang_wuji, humanChar, aiChar, humanAi, aiAi);
  var state = engine.state;
  
  state.round = snap.round;
  state.phase = snap.phase;
  state.isGameOver = snap.isGameOver;
  state.winner = snap.winner;
  state.log = snap.log;
  
  restorePlayer(state.players[0], snap.p1);
  restorePlayer(state.players[1], snap.p2);
  
  state.players[0]._ai = humanAi;
  state.players[1]._ai = aiAi;
  
  _humanPlayerIdx = 0;
  
  return { engine: engine, state: state };
}

function restorePlayer(p, snapP) {
  var keys = ['hp','innerPower','baseInnerPower','flaws','_flawShield','poisonStacks',
    'hasDrawnFirstFlaw','roundCardsPlayed','hasUsedPassiveThisRound',
    '_bloodWarfareUsed','_bloodWarfareMode','hasTriggeredSunshine',
    '_skillfulDiscount','roundFlaws','_actionDepth','cardsMovedThisTurn',
    'hand','dantian','discardPile','extraDeck','actionZone','judgmentZone',
    'freePlayDiscount','freePlayNextTurn','_moveDiscountUsed','totalPower',
    '_deck','_cardsPlayedThisTurn'];
  keys.forEach(function(k) { p[k] = snapP[k]; });
}

// ── 注入决策并继续 ──
function injectChoice(cardIdx) {
  _humanDecision = cardIdx;
  _humanDecisionType = _humanDecisionType || 'judgment'; // 默认判定阶段
  _waitingForHuman = false;
}

// 重写 executePlay 以注入人类决策
var _originalExecutePlay = aiModule.BaseAI.prototype.takeAction;

// ── 主入口 ──
var CMD = process.argv[2];
var ARG = process.argv[3];

if (CMD === 'init') {
  // 创建新游戏
  var chars = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'characters.json'), 'utf8'));
  var deckData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'decks.json'), 'utf8'));
  
  var humanAi = new HumanAI('modeng', 'wudang');
  var aiAi = new aiModule.BaseAI('wudang', 'modeng');
  
  var engine = new GameEngine(deckData.modeng_xuedao, deckData.wudang_wuji, chars.xuedao, chars.wuji, humanAi, aiAi);
  var state = engine.state;
  _humanPlayerIdx = 0;
  
  // 运行游戏直到第一个人类决策点
  runUntilHuman(engine, state);
  
} else if (CMD === 'choice') {
  var idx = parseInt(ARG);
  if (isNaN(idx) || idx < -1) {
    console.log('Invalid choice: ' + ARG);
    process.exit(1);
  }
  
  _humanDecision = idx; // -1 means pass
  
  var loaded = loadState();
  var engine = loaded.engine;
  var state = loaded.state;
  
  // 恢复决策上下文
  if (_humanDecisionType === 'judgment' || fs.existsSync(DECISION_PATH)) {
    _humanDecisionType = fs.existsSync(DECISION_PATH) ? 
      fs.readFileSync(DECISION_PATH, 'utf8').trim() : 'judgment';
  }
  
  // 从暂停点继续运行
  runUntilHuman(engine, state);
  
} else if (CMD === 'pass') {
  _humanDecision = -1;
  
  var loaded = loadState();
  var engine = loaded.engine;
  var state = loaded.state;
  
  runUntilHuman(engine, state);
  
} else if (CMD === 'status') {
  var loaded = loadState();
  showGame(loaded.state, _humanPlayerIdx);
  
} else {
  console.log('Usage:');
  console.log('  node interact.js init            - Start new game');
  console.log('  node interact.js choice <idx>    - Play card at index');
  console.log('  node interact.js pass            - Pass/surrender');
  console.log('  node interact.js status          - Show current state');
}

// ── 运行引擎直到人类决策点 ──
function runUntilHuman(engine, state) {
  var p1 = state.players[0];
  var p2 = state.players[1];
  
  if (state.round === 0) {
    // 初始抽牌
    gs.drawCards(p1, CONST.startingDraw, state);
    gs.drawCards(p2, CONST.startingDraw, state);
    state.log = state.log || [];
    state.log.push('=== Game Start ===');
    state.log.push('P1(' + p1.character.name + ') HP=' + p1.hp + ' | P2(' + p2.character.name + ') HP=' + p2.hp);
  }
  
  while (!state.isGameOver && state.round < CONST.maxRounds) {
    state.round++;
    state.log.push('\n--- Round ' + state.round + ' ---');
    engine._resetRound(p1);
    engine._resetRound(p2);
    if (state.isGameOver) break;
    
    // 准备阶段（阳光普照等）
    engine._preparationPhase(p1, p2, state);
    if (p1.hp <= 0) { engine._endGame(state, p2); break; }
    if (p2.hp <= 0) { engine._endGame(state, p1); break; }
    
    // 判定阶段：人类AI在 chooseJudgmentCard 中暂停
    _humanDecisionType = 'judgment';
    fs.writeFileSync(DECISION_PATH, 'judgment', 'utf8');
    
    if (_humanDecision === null || _humanDecision === undefined) {
      // 未注入决策 → AI决定
      engine._judgmentPhase(p1, p2, state);
    } else {
      // 有人类决策 → 手动执行判定区选择
      if (_humanDecision >= 0) {
        var card = p1.hand[_humanDecision];
        if (card) {
          p1.judgmentZone = card;
          // Remove from hand
          p1.hand.splice(_humanDecision, 1);
          state.log.push('You place ' + card._data.name + ' as judgment');
        }
      }
      _humanDecision = null;
      _humanDecisionType = null;
      
      // AI选择
      p2.judgmentZone = p2._ai.chooseJudgmentCard(p2, p1, state);
      if (p2.judgmentZone) {
        var p2idx = p2.hand.indexOf(p2.judgmentZone);
        if (p2idx >= 0) p2.hand.splice(p2idx, 1);
      }
      
      // 继续判定阶段
      engine._judgmentPhase(p1, p2, state);
    }
    
    if (state.isGameOver) break;
    
    // 行动阶段：人类AI在 takeAction 中暂停
    engine._actionPhase(p1, p2, state);
    if (state.isGameOver) break;
    
    // 结算阶段
    engine._resolutionPhase(p1, p2, state);
    
    saveState(state);
  }
  
  // 游戏结束
  if (state.isGameOver) {
    state.log.push('\n=== Game Over ===');
    state.log.push('Winner: ' + (state.winner ? 'P' + state.winner : 'Draw'));
    showGame(state, _humanPlayerIdx);
    console.log('\n*** ' + (state.winner === 1 ? 'YOU WIN!' : state.winner === 2 ? 'AI WINS!' : 'DRAW!') + ' ***');
  }
}
