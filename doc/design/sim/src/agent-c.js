// agent-c.js — AgentC: AI vs AI 自动批量测试
// 调用引擎函数，双方均为AI，随机决定行动
// 用法: node agent-c.js <modeng|wudang|yintang> <modeng|wudang|yintang> [gameIndex]
// 输出: JSON 结果到 data/game_<idx>.json

var gs = require('./engine/gameState');
var cr = require('./engine/combatResolver');
var cardReg = require('./engine/cardRegistry');
var BaseAI = require('./engine/ai').BaseAI;
var fs = require('fs');
var path = require('path');

// ═══ ChaosHumanAI: 最大差异化随机玩家，专门暴露系统BUG ═══
class ChaosHumanAI {
  constructor(faction, oppFaction) {
    this.faction = faction;
    this.oppFaction = oppFaction;
  }
  
  // 随机判定选择（有策略偏向：50%随机 + 30%高战力 + 20%心法）
  chooseJudgmentCard(self, opponent, state) {
    if (self.hand.length === 0) return null;
    var r = Math.random();
    if (r < 0.2 && self.hand.some(function(c){return c._data.type==='xinfa'})) {
      var xf = self.hand.filter(function(c){return c._data.type==='xinfa'});
      return xf[Math.floor(Math.random()*xf.length)];
    }
    if (r < 0.5) {
      var sorted = self.hand.slice().sort(function(a,b){return (b._data.power||0)-(a._data.power||0)});
      return sorted[0];
    }
    return self.hand[Math.floor(Math.random()*self.hand.length)];
  }

  // 行动：随机出牌，覆盖边界情况
  takeAction(self, opponent, state) {
    if (self.hand.length === 0) return 'no_action';
    // 随机决定：出武技 / 出心法 / 触发血战 / pass
    var r = Math.random();
    
    // 10% 概率触发血战（如果可用）
    if (r < 0.1 && !self.hasUsedPassiveThisRound && self.character.id === 'xuedao') {
      self.hasUsedPassiveThisRound = true;
      self._selfInflictedFlaws = (self._selfInflictedFlaws||0)+1;
      gs.gainFlaw(self, 1, state);
      self._bloodWarfareUsed = true;
      self._bloodWarfareMode = Math.random()<0.5 ? 'costDown' : 'discard';
      state.log.push('P'+self.id+' 血战到底(+1破绽,'+(self._bloodWarfareMode==='discard'?'弃牌+1':'减2费')+')');
      return 'caught_up';
    }
    
    // 30% pass
    if (r < 0.3) return 'caught_up';
    
    // 找出能出的牌
    var playable = self.hand.filter(function(c){
      var cost = c._effCost !== undefined ? c._effCost : (c._data.cost||0);
      return cost <= self.innerPower;
    });
    if (playable.length === 0) return 'caught_up';
    
    var card = playable[Math.floor(Math.random()*playable.length)];
    var cost = card._effCost !== undefined ? card._effCost : (card._data.cost||0);
    self.innerPower -= cost;
    // 从手牌移除
    for (var hi = self.hand.length-1; hi >= 0; hi--) {
      if (self.hand[hi] === card) { self.hand.splice(hi, 1); break; }
    }
    if (card._data.type === 'xinfa') {
      self.dantian.push(card);
      self.baseInnerPower += (card._data.innerPower||0);
    } else {
      self.actionZone.push(card);
    }
    self.roundCardsPlayed = (self.roundCardsPlayed||0)+1;
    state.log.push('P'+self.id+' 打出'+card._data.name);
    // 每次只出一张，模拟人类交互节奏
    return 'caught_up';
  }
}

var DATA_DIR = path.join(__dirname, '..', 'data');
var CARDS_DIR = path.join('C:', 'Users', 'LanQH', 'Desktop', 'Game', 'card', '词条');

// ═══ 加载卡牌 ═══
function loadJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) { return null; } }
var CARD_DB = {};
function loadCardDB() {
  var dirs = ['魔教', '武当', '隐堂', '公共'];
  for (var d = 0; d < dirs.length; d++) {
    var dd = path.join(CARDS_DIR, dirs[d]);
    if (!fs.existsSync(dd)) continue;
    fs.readdirSync(dd).forEach(function(f) {
      if (!f.endsWith('.json')) return;
      var card = loadJSON(path.join(dd, f));
      if (card && card.id) CARD_DB[card.id] = card;
    });
  }
}

// ═══ 牌组构建 ═══
function buildDeckConfig(faction) {
  var main = [], extra = [];
  var ids = Object.keys(CARD_DB);
  for (var i = 0; i < ids.length; i++) {
    var c = CARD_DB[ids[i]];
    if (c.faction === faction || c.faction === 'public') {
      var count = c.isExtra ? 1 : (c.maxPerDeck || 3);
      main.push({ cardId: c.id, count: count });
    }
    if (c.faction === faction && (c.isExtra || c.type === 'wuji') && extra.length < 5) {
      extra.push({ cardId: c.id, count: 1 });
    }
  }
  return { mainDeck: main, extraDeck: extra };
}

// ═══ 角色 ═══
var CHARS = {
  modeng: { name: '血刀老祖', hp: 3, faction: 'modeng', passives: [], initialFlaws: 0 },
  wudang: { name: '无极道人', hp: 3, faction: 'wudang', passives: [], initialFlaws: 0 },
  yintang: { name: '影主', hp: 2, faction: 'yintang', passives: [{ type: 'flawShield', count: 1 }], initialFlaws: 0 }
};

// ═══ 全局常量 ═══
var CONST = (function() {
  try { return require('./data/constants.json'); } catch(e) {
    return { maxHandSize: 8, maxDantian: 6, counterBonus: 6, shieldFlawThreshold: 0 };
  }
})();

// ═══ 辅助函数 ═══
function removeFromHand(player, card) {
  for (var i = player.hand.length - 1; i >= 0; i--) {
    if (player.hand[i].id === card.id) { player.hand.splice(i, 1); return; }
  }
}

// ═══ 响应系统（AI vs AI 精简版） ═══
var RESP_TRIGGER = { ON_CARD_PLAYED: 'ON_CARD_PLAYED', ON_POWER_CHANGE: 'ON_POWER_CHANGE' };

var RESPONSE_REGISTRY = [];
function loadResponseRegistry() {
  // 从 interact3.js 的 REGISTRY 提取关键项
  RESPONSE_REGISTRY = [
    { name: '舍身撞', trigger: RESP_TRIGGER.ON_CARD_PLAYED,
      condition: function(ctx) {
        return ctx.sourcePlayer !== ctx.owner &&
          ctx.owner.innerPower >= 2 &&
          ctx.sourcePlayer.dantian.some(function(c) { return (c._data || c).type === 'xinfa'; });
      }
    },
    { name: '含沙射影', trigger: RESP_TRIGGER.ON_CARD_PLAYED,
      condition: function(ctx) {
        return ctx.sourcePlayer !== ctx.owner && ctx.owner.innerPower >= 1;
      }
    },
    { name: '梯云纵', trigger: RESP_TRIGGER.ON_POWER_CHANGE,
      condition: function(ctx) { return ctx.sourcePlayer !== ctx.owner; }
    }
  ];
}

function scanResponses(player, trigger, ctx) {
  var found = [];
  var zones = [
    { k: 'hand', arr: player.hand },
    { k: 'actionZone', arr: player.actionZone },
    { k: 'dantian', arr: player.dantian },
  ];
  if (player.judgmentZone) zones.push({ k: 'judgmentZone', arr: [player.judgmentZone] });
  for (var z = 0; z < zones.length; z++) {
    var zone = zones[z];
    for (var i = 0; i < zone.arr.length; i++) {
      var card = zone.arr[i], d = card._data || card;
      if (!d.name) continue;
      for (var r = 0; r < RESPONSE_REGISTRY.length; r++) {
        var reg = RESPONSE_REGISTRY[r];
        if (reg.name !== d.name || reg.trigger !== trigger) continue;
        var ctx2 = Object.assign({}, ctx, { owner: player });
        if (reg.condition && !reg.condition(ctx2)) continue;
        found.push({ player: player, card: card, zone: zone.k, registry: reg });
      }
    }
  }
  return found;
}

function executeResponseAuto(target, state) {
  var player = target.player, opp = state.players[player.id === 1 ? 1 : 0];
  var card = target.card, zoneKey = target.zone, d = card._data || card;
  var cid = card.id || (card._data && card._data.id);
  if (zoneKey === 'judgmentZone') player.judgmentZone = null;
  else {
    var arr = player[zoneKey];
    for (var j = arr.length - 1; j >= 0; j--) {
      var aid = arr[j].id || (arr[j]._data && arr[j]._data.id);
      if (aid === cid) { arr.splice(j, 1); break; }
    }
  }
  player.discardPile.push(card);
  state.log.push('⚡响应: ' + player.character.name + '→' + d.name);
  if (d.name === '舍身撞') {
    player.innerPower -= 2;
    var cnt = 0;
    for (var di = opp.dantian.length - 1; di >= 0 && cnt < 2; di--) {
      if ((opp.dantian[di]._data || opp.dantian[di]).type === 'xinfa') {
        gs.removeDantianCard(opp, opp.dantian[di], state);
        cnt++;
      }
    }
    gs.drawCards(opp, 1, state);
  } else if (d.name === '含沙射影') {
    player.innerPower -= 1;
    opp.poisonStacks = (opp.poisonStacks || 0) + 1;
    state.log.push('含沙射影: 对手中毒+1');
  }
  // 梯云纵在 Phase A 处理
}

function handleChainResponses(p1, p2, trigger, ctx, state) {
  var all = [];
  all = all.concat(scanResponses(p1, trigger, ctx));
  all = all.concat(scanResponses(p2, trigger, ctx));
  if (all.length === 0) return;
  if (!state._refusedInChain) state._refusedInChain = {};
  all = all.filter(function(c) {
    var cid = c.card.id || (c.card._data && c.card._data.id);
    return !(cid && state._refusedInChain[cid]);
  });
  if (all.length === 0) return;
  all.forEach(function(c) {
    var cid = c.card.id || (c.card._data && c.card._data.id);
    if (cid) state._refusedInChain[cid] = true;
  });
  // LIFO 结算
  var chain = all.slice();
  while (chain.length > 0) {
    var link = chain.pop();
    executeResponseAuto(link, state);
    handleChainResponses(p1, p2, RESP_TRIGGER.ON_CARD_PLAYED,
      { sourcePlayer: link.player, card: link.card }, state);
  }
}

// ═══ 阳光普照 ═══
function checkSunshine(player, state) {
  if (player.hasTriggeredSunshine) return;
  var opp = state.players[player.id === 1 ? 1 : 0];
  if (player.hand.length >= CONST.maxHandSize) return;
  if (player.mainDeck.length + player.discardPile.length === 0) return;
  if (player.hand.length >= opp.hand.length) return;
  var pool = player.mainDeck.concat(player.discardPile);
  var best = null, bestP = -1;
  for (var i = 0; i < pool.length; i++) {
    if ((pool[i]._data || pool[i]).type === 'xinfa' && (pool[i]._data || pool[i]).power > bestP) {
      best = pool[i]; bestP = (pool[i]._data || pool[i]).power;
    }
  }
  if (!best) best = pool[Math.floor(Math.random() * pool.length)];
  player.hasTriggeredSunshine = true;
  if (player.hand.length >= CONST.maxHandSize) { player.discardPile.push(best); return; }
  player.hand.push(best);
}

// ═══ Phase A 效果遍历 ═══
function runPhaseA(p1, p2, state, disadvantaged, advantaged) {
  var changed = true, loopGuard = 0;
  while (changed && loopGuard < 50) {
    changed = false; loopGuard++;
    for (var pi = 0; pi < 2; pi++) {
      var player = state.players[pi], opp = state.players[1 - pi];
      for (var i = player.actionZone.length - 1; i >= 0; i--) {
        var c = player.actionZone[i];
        if (c._hitResolved && c._zsResolved) continue;
        // 命中效果
        if (!c._hitResolved && c._data && (c._data.effectType === 'poisonOnHit' || c._data.triggerHit)) {
          c._hitResolved = true; changed = true;
          if (c._data.effectType === 'poisonOnHit') {
            opp.poisonStacks = (opp.poisonStacks || 0) + 1;
            state.log.push('命中: P' + opp.id + ' 淬毒+1 (' + opp.poisonStacks + ')');
          }
        }
        // 震伤
        if (!c._zsResolved && c._data && c._data.effectType === 'zhengshang') {
          c._zsResolved = true; changed = true;
          if (player === advantaged) {
            gs.gainFlaw(opp, 1, state);
            if (state.isGameOver) return;
          }
        }
      }
    }
  }
  if (loopGuard >= 50) state.log.push('[WARN] Phase A loop limit');
}

// ═══ 清场 ═══
function clearZones(player, state) {
  var opp = state.players[player.id === 1 ? 1 : 0];
  if (player.judgmentZone) player.discardPile.push(player.judgmentZone);
  var kept = [];
  for (var i = 0; i < player.actionZone.length; i++) {
    var c = player.actionZone[i];
    if (c._delayedDantian) {
      delete c._delayedDantian;
      player.dantian.push(c);
      player.baseInnerPower += (c.innerPower || 0);
      player.innerPower += (c.innerPower || 0);
      continue;
    }
    if (c._returnToHand) { kept.push(c); continue; }
    player.discardPile.push(c);
  }
  player.judgmentZone = null; player.actionZone = kept;
}

// ═══ 结算 ═══
function resolutionPhase(p1, p2, state) {
  cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
  var disadvantaged = cr.determineDisadvantaged(p1, p2);
  var advantaged = disadvantaged === p1 ? p2 : p1;
  runPhaseA(p1, p2, state, disadvantaged, advantaged);
  clearZones(p1, state); clearZones(p2, state);
  if (disadvantaged && advantaged) {
    var d1 = Math.min(1, CONST.maxHandSize - disadvantaged.hand.length);
    var d2 = Math.min(2, CONST.maxHandSize - advantaged.hand.length);
    if (d1 > 0) gs.drawCards(disadvantaged, d1, state);
    if (d2 > 0) gs.drawCards(advantaged, d2, state);
  }
}

// ═══ 单方AI出牌循环 ═══
function runOneSideExchange(p1, p2, state, actor, actorAI, opponent) {
  while (!state.isGameOver) {
    var result = actorAI.takeAction(actor, opponent, state);
    if (result === 'no_action' || result === 'caught_up') break;
    // 每张牌后检查响应
    handleChainResponses(p1, p2, RESP_TRIGGER.ON_CARD_PLAYED,
      { sourcePlayer: actor }, state);
  }
}
// ═══ 完整出牌阶段 = ═══
function runFullExchange(p1, p2, state, ai1, ai2) {
  // 劣势方先出
  var actor = state._disadvantagedSide === 'p1' ? p1 : p2;
  var actorAI = state._disadvantagedSide === 'p1' ? ai1 : ai2;
  var opp = state._disadvantagedSide === 'p1' ? p2 : p1;

  if (!actor.hasDrawnFirstFlaw) {
    gs.drawCards(actor, 1, state);
    actor.hasDrawnFirstFlaw = true;
  }

  // 劣势方出牌
  runOneSideExchange(p1, p2, state, actor, actorAI, opp);
  if (state.isGameOver) return 'gameover';
  
  cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
  var disAfterFirst = cr.determineDisadvantaged(p1, p2);
  
  // 仍然劣势 → 回合结束
  if (disAfterFirst === actor) {
    gs.gainFlaw(actor, 1, state);
    return 'round_end';
  }

  // 劣势方切换 → 原优势方出牌
  state._disadvantagedSide = state._disadvantagedSide === 'p1' ? 'p2' : 'p1';
  var newActor = state._disadvantagedSide === 'p1' ? p1 : p2;
  var newActorAI = state._disadvantagedSide === 'p1' ? ai1 : ai2;
  var newOpp = state._disadvantagedSide === 'p1' ? p2 : p1;

  if (!newActor.hasDrawnFirstFlaw) {
    gs.drawCards(newActor, 1, state);
    newActor.hasDrawnFirstFlaw = true;
  }

  runOneSideExchange(p1, p2, state, newActor, newActorAI, newOpp);
  if (state.isGameOver) return 'gameover';

  cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
  disAfterFirst = cr.determineDisadvantaged(p1, p2);
  if (disAfterFirst === newActor) {
    gs.gainFlaw(newActor, 1, state);
  }
  return 'round_end';
}

// ═══ 主游戏 = ═══
function runGame(p1Deck, p2Deck, char1, char2, p1Mode) {
  var state = gs.createGameState(p1Deck, p2Deck, char1, char2);
  var p1 = state.players[0], p2 = state.players[1];
  var ai1 = p1Mode === 'chaos' ? new ChaosHumanAI(char1.faction, char2.faction) : new BaseAI(char1.faction, char2.faction);
  var ai2 = new BaseAI(char2.faction, char1.faction);
  if (char1.faction === 'wudang') ai1.shouldTriggerTaichi = function() { return true; };
  if (char2.faction === 'wudang') ai2.shouldTriggerTaichi = function() { return true; };

  var result = { winner: null, rounds: 0, reason: '', p1Hp: 0, p2Hp: 0, errors: [] };
  var MAX_ROUNDS = 200, round = 0;
  try {
    gs.drawCards(p1, 5, state); gs.drawCards(p2, 5, state);
    state._disadvantagedSide = Math.random() < 0.5 ? 'p1' : 'p2';
    checkSunshine(p1, state); checkSunshine(p2, state);

    // 首轮判定
    p2.judgmentZone = ai2.chooseJudgmentCard(p2, p1, state); if (p2.judgmentZone) removeFromHand(p2, p2.judgmentZone);
    p1.judgmentZone = ai1.chooseJudgmentCard(p1, p2, state); if (p1.judgmentZone) removeFromHand(p1, p1.judgmentZone);
    cr.runJudgment(p1, p2, state);
    var dis = cr.determineDisadvantaged(p1, p2);
    state._disadvantagedSide = dis === p1 ? 'p1' : 'p2';

    while (round < MAX_ROUNDS && !state.isGameOver) {
      round++;
      delete state._refusedInChain;
      state.roundFlaws = 0; p1.roundFlaws = 0; p2.roundFlaws = 0;
      p1.hasUsedPassiveThisRound = false; p2.hasUsedPassiveThisRound = false;

      var r = runFullExchange(p1, p2, state, ai1, ai2);
      if (r === 'gameover') break;
      resolutionPhase(p1, p2, state);
      if (state.isGameOver) break;

      // 新回合判定
      checkSunshine(p1, state); checkSunshine(p2, state);
      p2.judgmentZone = ai2.chooseJudgmentCard(p2, p1, state); if (p2.judgmentZone) removeFromHand(p2, p2.judgmentZone);
      p1.judgmentZone = ai1.chooseJudgmentCard(p1, p2, state); if (p1.judgmentZone) removeFromHand(p1, p1.judgmentZone);
      cr.runJudgment(p1, p2, state);
      dis = cr.determineDisadvantaged(p1, p2);
      state._disadvantagedSide = dis === p1 ? 'p1' : 'p2';
    }
  } catch(e) {
    result.errors.push('EXCEPTION: ' + e.message);
  }
  result.rounds = round; result.p1Hp = p1.hp; result.p2Hp = p2.hp;
  if (state.isGameOver) { result.winner = state.winner; result.reason = 'HP depleted'; }
  else if (round >= MAX_ROUNDS) { result.reason = 'MAX_ROUNDS'; }
  else result.reason = 'unknown';
  return result;
}

// ═══ 主入口 ═══
function main() {
  var args = process.argv.slice(2);
  var p1Fac = args[0] || 'modeng';
  var p2Fac = args[1] || 'wudang';
  var gameIdx = parseInt(args[2] || '1');
  var p1Mode = args[3] || 'ai';  // 'chaos' for ChaosHumanAI, 'ai' for BaseAI
  loadCardDB(); loadResponseRegistry();
  var p1Deck = buildDeckConfig(p1Fac);
  var p2Deck = buildDeckConfig(p2Fac);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  var result = runGame(p1Deck, p2Deck, CHARS[p1Fac], CHARS[p2Fac], p1Mode);
  var out = path.join(DATA_DIR, 'game_' + gameIdx + '.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result));
}

main();
