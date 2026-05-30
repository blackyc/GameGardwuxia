// interact3.js — 基于引擎函数的交互模拟器
// 所有游戏逻辑复制自 engine.js，只在人类决策处暂停
// AI自测与人类交互使用同一套游戏逻辑

var gs = require('./engine/gameState');
var cr = require('./engine/combatResolver');
var er = require('./engine/effectResolver');
var zones = require('./engine/zones');
var { BaseAI } = require('./engine/ai');
var CONST = require('./data/constants.json');
var fsm = require('./engine/phaseFsm');
var cv = require('./engine/commandValidator');
var characters = require('./data/characters.json');
var decks = require('./data/decks.json');
var fs = require('fs');
var path = require('path');
var ui = require('./ui/renderer');

var STATE_FILE = path.join(__dirname, 'interact3-state.json');
var HP_IDX = 0; // human = P1 = 血刀

// ── CLI ──
var args = process.argv.slice(2);
var CMD = args[0];
var ARG = args.slice(1).join(' ');

// ═══════════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════════

function removeFromHand(player, card) {
  var idx = player.hand.indexOf(card);
  if (idx >= 0) player.hand.splice(idx, 1);
}

function removeFromArr(arr, card) {
  var idx = arr.indexOf(card);
  if (idx >= 0) arr.splice(idx, 1);
}

function cloneCard(card) {
  return { id: card.id, _data: card._data, name: card._data.name,
    type: card._data.type, element: card._data.element,
    cost: card._data.cost, power: card._data.power,
    innerPower: card._data.innerPower || 0, tags: card._data.tags || [],
    isExtra: true, effectType: card._data.effectType || null };
}

// ═══════════════════════════════════════════
//  状态保存/恢复
// ═══════════════════════════════════════════

function saveState(state, ai2) {
  // 清洗响应窗口的registry（函数不可序列化）
  if (state._responseWindow && state._responseWindow.candidates) {
    for (var ci = 0; ci < state._responseWindow.candidates.length; ci++) {
      delete state._responseWindow.candidates[ci].registry;
    }
  }

  // ── 强制手牌上限检查（P1 + P2） ──
  [state.players[0], state.players[1]].forEach(function(p) {
    while (p.hand.length > CONST.maxHandSize) {
      var over = p.hand.pop();
      p.discardPile.push(over);
      state.log.push('P' + p.id + ' 手牌已满，溢出进弃牌堆');
    }
  });

  // Serialize state for JSON. Clone + strip non-serializable props
  var s = JSON.parse(JSON.stringify(state, function(k, v) {
    // Strip functions and CommandQueue
    if (typeof v === 'function') return undefined;
    if (k === '_cmdQueue') return undefined;
    return v;
  }));
  // Store AI2 reference and difficulty
  s.__ai2 = { faction: ai2.faction, opponentFaction: ai2.opponentFaction };
  s.__difficulty = state._difficulty;
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function loadGame() {
  if (!fs.existsSync(STATE_FILE)) return null;
  var raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  var state = raw;
  var ai2ref = raw.__ai2;
  var diff = raw.__difficulty || '普通';
  delete state.__ai2;
  delete state.__difficulty;

  state._difficulty = diff;
  state._cmdQueue = new er.CommandQueue();  // Recreate after deserialization
  rebuildPlayer(state.players[0], 'modeng');
  rebuildPlayer(state.players[1], 'wudang');
  // Rebuild zone metadata + effect index
  [state.players[0], state.players[1]].forEach(function(p) {
    zones.createPlayerZones(p);
    zones.buildEffectIndex(p);
  });

  var ai2 = new BaseAI(ai2ref.faction, ai2ref.opponentFaction);
  return { state: state, ai2: ai2 };
}

function rebuildPlayer(p, faction) {
  var cardPool = loadFactionCards(faction);
  // Rebuild hand
  for (var i = 0; i < p.hand.length; i++) {
    p.hand[i]._data = cardPool[p.hand[i].id];
    if (!p.hand[i]._data) p.hand[i]._data = { name: p.hand[i].name || '?', cost: p.hand[i].cost || 0, power: p.hand[i].power || 0, type: 'wuji', element: 'domineering', effectType: null };
  }
  // Rebuild dantian
  for (var j = 0; j < p.dantian.length; j++) {
    p.dantian[j]._data = cardPool[p.dantian[j].id] || p.dantian[j]._data || { name: '?', cost: 0, power: 0, type: 'xinfa', effectType: null };
  }
  // Rebuild discardPile
  for (var k = 0; k < p.discardPile.length; k++) {
    var d = p.discardPile[k];
    d._data = cardPool[d.id] || d._data || { name: d.id || '?', cost: 0, power: 0, type: 'wuji', effectType: null };
  }
  // Rebuild judgmentZone
  if (p.judgmentZone) {
    p.judgmentZone._data = cardPool[p.judgmentZone.id] || p.judgmentZone._data || { name: '?', cost: 0, power: 0, type: 'wuji', effectType: null };
  }
  // Rebuild actionZone
  for (var a = 0; a < p.actionZone.length; a++) {
    p.actionZone[a]._data = cardPool[p.actionZone[a].id] || p.actionZone[a]._data || { name: '?', cost: 0, power: 0, type: 'wuji', effectType: null };
  }
  // Rebuild extraDeck
  if (p.extraDeck) {
    for (var e = 0; e < p.extraDeck.length; e++) {
      p.extraDeck[e]._data = cardPool[p.extraDeck[e].id] || p.extraDeck[e]._data || { name: '?', cost: 0, power: 0, type: 'wuji', effectType: null };
    }
  }
  // Rebuild _deck
  if (p._deck) {
    for (var dk = 0; dk < p._deck.length; dk++) {
      var c = p._deck[dk];
      if (c._data) continue;
      c._data = cardPool[c.id] || { name: c.id || '?', cost: 0, power: 0, type: 'wuji', effectType: null };
    }
  }
  // Restore character reference
  p.character = characters[p.character && p.character.id ? p.character.id : (faction === 'modeng' ? 'xuedao' : 'wuji')];
}

function loadFactionCards(faction) {
  var pool = {};
  var cardsFile = faction === 'modeng' ? './data/cards_modeng.json' : './data/cards_wudang.json';
  try {
    var cards = require(cardsFile);
    for (var i = 0; i < cards.length; i++) {
      pool[cards[i].id] = cards[i];
    }
  } catch (e) {}
  return pool;
}

// ═══════════════════════════════════════════
//  辅助函数
// ═══════════════════════════════════════════

function isModengCard(card) {
  return card._data.faction === 'modeng' ||
    (card._data.tags && card._data.tags.indexOf('魔教') >= 0);
}

// ═══════════════════════════════════════════
//  引擎函数 (复制自 engine.js)
// ═══════════════════════════════════════════

function processDelayedDantian(player, state) {
  for (var i = player.actionZone.length - 1; i >= 0; i--) {
    if (player.actionZone[i].effectType === 'delayedDantian') {
      var card = player.actionZone.splice(i, 1)[0];
      player.dantian.push(card);
      player.baseInnerPower += (card._data.innerPower || 0);
    }
  }
}

function resetRound(player) {
  // 聚气诀已在 resolutionPhase 中通过 processDelayedDantian 处理
  player.judgmentZone = null;
  player.actionZone = [];
  player.roundCardsPlayed = 0;
  player.hasDrawnFirstFlaw = false;
  player.cardsPlayedThisTurn = [];
  player.roundFlaws = 0;
  player._actionDepth = 0;
  // reset tempStats
  player.tempStats = {
    cardsMoved: false,
    passiveUsed: false,
    skillfulDiscount: false,
    bloodWarfareUsed: false,
    bloodWarfareMode: null
  };

  // 重算内力
  player.baseInnerPower = player.dantian.reduce(function (s, c) {
    var ip = c._data.innerPower || 0;
    if (c._innerBoosted) ip += 1;
    return s + ip;
  }, 0);

  // 纯阳心法诀
  for (var di = 0; di < player.dantian.length; di++) {
    var dc = player.dantian[di];
    if (dc.effectType === 'dantianInnerBonus' && player.dantian.length >= (dc._data.dantianThreshold || 2)) {
      player.baseInnerPower = Math.max(player.baseInnerPower, dc._data.innerThreshold || 6);
      break;
    }
  }

  // 餐风饮露功
  for (var fi = 0; fi < player.dantian.length; fi++) {
    if (player.dantian[fi].effectType === 'discardInnerBonus') {
      player.baseInnerPower += Math.floor(player.discardPile.length / 2);
    }
  }

  // 修罗饮血功：自身因技能效果获得破绽时，每张牌提供的内力永久+1
  for (var j = 0; j < player.dantian.length; j++) {
    if (player.dantian[j].effectType === 'selfFlawGivesInner') {
      player.baseInnerPower += (player.selfInflictedFlaws || 0);
    }
  }

  // 魔门基础心法弃牌堆
  for (var k = 0; k < player.discardPile.length; k++) {
    if (player.discardPile[k].effectType === 'persistInDiscard') {
      player.baseInnerPower += (player.discardPile[k]._data.innerPower || 0);
    }
  }
  player.innerPower = Math.max(0, player.baseInnerPower);
  player.totalPower = 0;
}

function checkSunshine(player, state) {
  er.checkSunshine(player, state);
}

function preparationPhase(p1, p2, state, ai2) {
  fsm.setPhase(state, fsm.Phase.PREPARATION);
  state._judgmentRevealed = false;
  // 清除上回合链锁标记
  delete state._refusedInChain;
  checkSunshine(p1, state);
  checkSunshine(p2, state);

  // P2 (AI) chooses JZ
  p2.judgmentZone = ai2.chooseJudgmentCard(p2, p1, state);
  if (p2.judgmentZone) removeFromHand(p2, p2.judgmentZone);

  // P1 (human) — done externally
  state.log.push('P2 暗盖1张 / P1 待选');
  fsm.setPhase(state, fsm.Phase.CHOOSE_JUDGMENT);
}

function judgmentPhase(p1, p2, state) {
  fsm.setPhase(state, fsm.Phase.JUDGMENT);
  if (!p1.judgmentZone || !p2.judgmentZone) {
    if (!p1.judgmentZone && !p2.judgmentZone) return;
    var def = !p1.judgmentZone ? p1 : p2;
    state.log.push('P' + def.id + ' 无牌暗盖，直接劣势');
    gs.gainFlaw(def, 1, state);
    return;
  }

  cr.runJudgment(p1, p2, state);
  state._judgmentRevealed = true;

  // 太极剑意 (AI = P2 only, P1 is human and never triggers this automatically)
  for (var side = 1; side < 2; side++) {
    var wdPlayer = p2;
    var oppPlayer = p1;
    if (wdPlayer.character.passives &&
        wdPlayer.character.passives.some(function (p) { return p.type === 'taichiSwordIntent'; }) &&
        !wdPlayer.tempStats.passiveUsed &&
        wdPlayer._ai && wdPlayer._ai.shouldTriggerTaichi &&
        wdPlayer.judgmentZone && wdPlayer.judgmentZone._data.type === 'xinfa') {

      if (!wdPlayer._ai.shouldTriggerTaichi(wdPlayer, oppPlayer, state)) continue;

      var myJzPower = wdPlayer.judgmentZone._effectivePower !== undefined ?
        wdPlayer.judgmentZone._effectivePower : (wdPlayer.judgmentZone._data.power || 0);
      var oppJzPower = oppPlayer.judgmentZone._effectivePower !== undefined ?
        oppPlayer.judgmentZone._effectivePower : (oppPlayer.judgmentZone._data.power || 0);

      if (myJzPower < oppJzPower) {
        wdPlayer.tempStats.passiveUsed = true;
        state.log.push('P' + wdPlayer.id + ' 太极剑意：心法碰瓷，进丹田');
        var xinfaCard = wdPlayer.judgmentZone;
        wdPlayer.dantian.push(xinfaCard);
        var ip = xinfaCard._data.innerPower || 0;
        wdPlayer.baseInnerPower += ip;
        wdPlayer.innerPower += ip;
        wdPlayer.judgmentZone = null;

        if (xinfaCard.effectType === 'moveCostReducer' && !wdPlayer.tempStats.cardsMoved) {
          triggerLiangyi(wdPlayer, state);
        }
        onXinfaNonPlayEntry(wdPlayer, xinfaCard, state);

        var wujiHand = wdPlayer.hand.filter(function (c) { return c._data.type === 'wuji'; });
        if (wujiHand.length > 0) {
          var skillfulCards = wujiHand.filter(function (c) { return c._data.element === 'skillful'; });
          var pool = (skillfulCards.length > 0 && wdPlayer.tempStats.skillfulDiscount) ? skillfulCards : wujiHand;
          var chosen = pool.reduce(function (a, b) {
            var costA = a._data.cost || 0;
            var costB = b._data.cost || 0;
            if (wdPlayer.tempStats.skillfulDiscount && a._data.element === 'skillful') costA--;
            if (wdPlayer.tempStats.skillfulDiscount && b._data.element === 'skillful') costB--;
            return Math.max(0, costA) < Math.max(0, costB) ? a : b;
          });
          wdPlayer.judgmentZone = chosen;
          removeFromHand(wdPlayer, chosen);
          var cost = chosen._data.cost || 0;
          if (wdPlayer.tempStats.skillfulDiscount && chosen._data.element === 'skillful') {
            cost = Math.max(0, cost - 1);
            wdPlayer.tempStats.skillfulDiscount = false;
          }
          wdPlayer.innerPower = Math.max(0, wdPlayer.innerPower - cost);
          state.log.push('P' + wdPlayer.id + ' 打出武技《' + chosen._data.name + '》代替进判定区，重新判定');
          cr.runJudgment(p1, p2, state);
        }
        break;
      }
    }
  }

  cr.calcTotalPower(p1, state);
  cr.calcTotalPower(p2, state);
  var disadvantaged = cr.determineDisadvantaged(p1, p2);
  state.log.push('劣势方: P' + disadvantaged.id);

  if (!disadvantaged.hasDrawnFirstFlaw) {
    disadvantaged.hasDrawnFirstFlaw = true;
    gs.drawCards(disadvantaged, 1, state);
    state.log.push('P' + disadvantaged.id + ' 首次劣势，抽1张');
  }
}

function triggerLiangyi(player, state) {
  var wujiHand = player.hand.filter(function (c) { return c._data.type === 'wuji'; });
  if (wujiHand.length > 0) {
    var target = wujiHand[Math.floor(Math.random() * wujiHand.length)];
    target._liangyiDiscount = true;
    state.log.push('P' + player.id + ' 两仪桩功：手牌1张武技-2费');
  }
}

function onXinfaNonPlayEntry(player, xinfaCard, state) {
  if (xinfaCard.effectType === 'altEntryDantianDraw') {
    gs.drawCards(player, 1, state);
    player.tempStats.skillfulDiscount = true;
    state.log.push('P' + player.id + ' 武当基础心法非打出进丹田，抽1，巧系武技-1费');
  }
}

function checkXueDiZi(card, opponent, state) {
  er.checkXueDiZi(card, opponent, state);
}

// ═══════════════════════════════════════════
//  结束阶段 Phase A —— 委托至统一效果系统
// ═══════════════════════════════════════════
function runPhaseA(p1, p2, state, disadvantaged, advantaged) {
  fsm.setPhase(state, fsm.Phase.PHASE_A);
  er.resolvePhaseA(p1, p2, state);
  fsm.setPhase(state, fsm.Phase.PHASE_A_DONE);
}

function resolveZhenShang(advantaged, disadvantaged, state) { return er.resolveZhenShang(advantaged, disadvantaged, state); }
function resolveHitEffects(advantaged, disadvantaged, state) { return er.resolveHitEffects(advantaged, disadvantaged, state); }
function resolveHanSha(disadvantaged, advantaged, state) { return er.resolveHanSha(disadvantaged, advantaged, state); }
function resolveFlawHeal(advantaged, disadvantaged, state) { return er.resolveFlawHeal(advantaged, disadvantaged, state); }
function resolvePoisonBurstAll(p1, p2, state) { return er.resolvePoisonBurstAll(p1, p2, state); }
function resolveZhengShangDrain(advantaged, disadvantaged, state) { return er.resolveZhengShangDrain(advantaged, disadvantaged, state); }

function clearZones(player, state) {
  er.clearZones(player, state);
}

function resolutionPhase(p1, p2, state) {
  fsm.setPhase(state, fsm.Phase.RESOLUTION);
  state.log.push('── 结算 ──');

  // 委托至统一效果系统
  er.resolutionPhase(p1, p2, state);
}

function endGame(state, winner) {
  state.isGameOver = true; state.winner = winner.id;
}

// ═══════════════════════════════════════════
//  人类出牌 (使用引擎代价计算)
// ═══════════════════════════════════════════

function humanPlayCard(player, opponent, state, idx) {
  var card = player.hand[idx];
  var effCost = card._effCost !== undefined ? card._effCost : (card._data.cost || 0);

  // 夜袭：每回合首张诡系牌消耗-2（仅夜修罗；注意：判断阶段盖放不计入打出）
  if (player.character && player.character.passives) {
    for (var pi = 0; pi < player.character.passives.length; pi++) {
      var passive = player.character.passives[pi];
      if (passive.type === 'nightRaid' && card._data.element === passive.system &&
          (!player.roundCardsPlayed || player.roundCardsPlayed === 0)) {
        effCost = Math.max(0, effCost - passive.discount);
        state.log.push('夜袭发动：' + card._data.name + ' -' + passive.discount + '费（首张诡系）');
      }
    }
  }

  // 血战到底 costDown（设计：下一张[魔教]牌的消耗-2）
  if (player.tempStats.bloodWarfareUsed && player.tempStats.bloodWarfareMode === 'costDown' && isModengCard(card)) {
    effCost = Math.max(0, effCost - 2);
    state.log.push('血战到底：' + card._data.name + ' -' + 2 + '费（当前' + effCost + '）');
    player.tempStats.bloodWarfareUsed = false;
  }

  // flawDiscount
  if (card.effectType === 'flawDiscount' && player.flaws > 0) {
    effCost = Math.max(0, effCost - (card._data.flawCostReduce || 2));
    card._effCost = effCost;
    state.log.push('破绽打折：' + card._data.name + ' 费用-' + (card._data.flawCostReduce || 2));
  }

  // 两仪/妙手discount
  if (card._liangyiDiscount) { effCost = Math.max(0, effCost - 2); card._liangyiDiscount = false; }

  // ── 负债内力检查 ──
  if (player.innerPower < effCost) {
    state.log.push('⚠ 内力不足！需要' + effCost + '，当前' + player.innerPower);
    return false;
  }

  player.innerPower = Math.max(0, player.innerPower - effCost);
  player.roundCardsPlayed = (player.roundCardsPlayed || 0) + 1;
  player.hand.splice(idx, 1);

  if (card._data.type === 'xinfa') {
    if (card._data.effectType === 'delayedDantian') {
      if (player.flaws > 0) {
        player.dantian.push(card);
        player.baseInnerPower += (card._data.innerPower || 0);
        player.innerPower += (card._data.innerPower || 0);
        state.log.push('你打出' + card._data.name + ' (有破绽→直接入丹田)');
      } else {
        card._hitResolved = false; card._zsResolved = false;
        player.actionZone.push(card);
        card._delayedDantian = true;
        state.log.push('你打出' + card._data.name + ' (延迟入丹田)');
      }
    } else {
      player.dantian.push(card);
      player.baseInnerPower += (card._data.innerPower || 0);
      player.innerPower += (card._data.innerPower || 0);
      state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(player, card, state));
      state.log.push('你打出心法' + card._data.name + '→丹田(+' + (card._data.innerPower || 0) + '内)');
    }
    if (card._data.effectType === 'drawOnPlay') gs.drawCards(player, card._data.drawOnPlayCount || 1, state);
    // 其他心法打出效果...
  } else {
    player.actionZone.push(card);
    state.log.push('你打出武技' + card._data.name + '（费' + effCost + '）');
    // Create PlayCardCmd — will be resolved after response window closes
    var cmd = state._cmdQueue.createPlayCardCmd(player, card, state);
    state._cmdQueue.enqueue(cmd);
    // flawDraw
    if (card.effectType === 'flawDiscount' && player.flaws > 0 && card._data.flawDraw) {
      gs.drawCards(player, card._data.flawDraw, state);
    }
    // discardReturn
    if (card._data.effectType === 'discardReturn' && player.discardPile.length > 0) {
      var best = player.discardPile.reduce(function (a, b) {
        return (a._data.power || 0) > (b._data.power || 0) ? a : b;
      });
      var bIdx = player.discardPile.indexOf(best);
      if (bIdx >= 0) { player.hand.push(player.discardPile.splice(bIdx, 1)[0]); state.log.push('回收' + best._data.name); }
    }
    // searchExtra 秘术检索（人类玩家）
    if (card._data.effectType === 'searchExtra') {
      handleSearchExtra(player, opponent, state, card);
    }
  }

  // 清理 tempStats.bloodWarfareUsed (discard mode handled in triggerZhenShang)
  // costDown already cleaned above
}

// ═══════════════════ 秘术检索（人类玩家） ═══════════════════

function handleSearchExtra(player, opponent, state, card) {
  var data = card._data;
  var faction = data.searchFaction;
  // 中文→拼音映射（searchFaction用中文，card._data.faction用拼音）
  var FACTION_MAP = { '\u9b54\u6559': 'modeng', '\u6b66\u5f53': 'wudang', '\u9690\u5802': 'yintang' };
  var normalizedFaction = FACTION_MAP[faction] || faction;
  var needCount = data.exileCount || 2;
  var targets = [];

  // 收集放逐候选
  if (data.sources) {
    for (var si = 0; si < data.sources.length; si++) {
      var src = data.sources[si];
      var pool = null;
      if (src === 'discardPile' || src === 'discard') pool = player.discardPile;
      else if (src === 'mainDeck') pool = player.mainDeck;
      else if (src === 'actionZone') pool = player.actionZone;
      else if (src === 'hand') pool = player.hand;
      if (pool) {
        for (var pi = 0; pi < pool.length; pi++) {
          if (hasFaction(pool[pi], normalizedFaction)) {
            targets.push({ card: pool[pi], zone: src, name: pool[pi]._data.name });
          }
        }
      }
    }
  }

  // 交互式放逐：暂停让人类选择（AI自动放逐）
  if (targets.length > 0 && !player._ai) {
    state._exileCandidates = targets;
    state._exileNeedCount = needCount;
    state.log.push('秘术检索：请选择放逐牌（最多' + needCount + '张）');
    return;  // 暂停，等 exilepick 命令
  }

  // AI 自动放逐（或人类在exilepick后由调用方处理）
  autoExile(player, opponent, state, targets, needCount, data);

  // 展示额外卡组让玩家选择
  var eligible = player.extraDeck.filter(function(ec) {
    var ef = ec._data.faction;
    return !normalizedFaction || ef === normalizedFaction || (Array.isArray(ef) && ef.indexOf(normalizedFaction) >= 0);
  });

  if (eligible.length > 0) {
    state._searchExtra = eligible;
    return;  // 标记需要玩家选择
  } else {
    state.log.push('秘术检索：额外卡组无可用牌');
  }

  // bonusDraw
  if (data.bonusDraw) gs.drawCards(player, data.bonusDraw, state);
}

// 自动放逐
function autoExile(player, opponent, state, targets, needCount, data) {
  var selectors = require('./engine/aiSelectors');
  var ctx = selectors.buildContext(player, opponent, state, { source: 'searchExtra' });
  var chosen = selectors.selectExileCards(ctx, targets, needCount);

  var exiled = 0;
  for (var t = 0; t < chosen.length; t++) {
    var target = chosen[t];
    if (target.zone === 'discardPile' || target.zone === 'discard') removeFromArr(player.discardPile, target.card);
    else if (target.zone === 'mainDeck') removeFromArr(player.mainDeck, target.card);
    else if (target.zone === 'actionZone') removeFromArr(player.actionZone, target.card);
    else if (target.zone === 'hand') removeFromArr(player.hand, target.card);
    player.exileZone = player.exileZone || [];
    player.exileZone.push(target.card);
    exiled++;
    state.log.push('放逐《' + target.name + '》（' + target.zone + '）');
  }
}

function hasFaction(card, faction) {
  if (!card || !card._data) return false;
  var f = card._data.faction;
  if (!f) return false;
  if (Array.isArray(f)) return f.indexOf(faction) >= 0;
  return f === faction;
}

// ═══════════════════════════════════════════
//  响应系统（2速，不限出牌权）
// ═══════════════════════════════════════════

// 触发类型枚举
var RESP_TRIGGER = er.RESP_TRIGGER;
var RESPONSE_REGISTRY = er.RESPONSE_REGISTRY;

// 扫描单方所有区域找响应牌
function scanResponses(player, trigger, ctx) {
  var found = [];
  var zones = [
    { k: 'hand',  arr: player.hand },
    { k: 'actionZone', arr: player.actionZone },
    { k: 'dantian',    arr: player.dantian },
  ];
  // 判定区单牌
  if (player.judgmentZone) {
    zones.push({ k: 'judgmentZone', arr: [player.judgmentZone] });
  }

  for (var z = 0; z < zones.length; z++) {
    var zone = zones[z];
    for (var i = 0; i < zone.arr.length; i++) {
      var card = zone.arr[i];
      var d = card._data || card;
      if (!d.name) continue;

      // 查找注册响应
      for (var r = 0; r < RESPONSE_REGISTRY.length; r++) {
        var reg = RESPONSE_REGISTRY[r];
        if (reg.name !== d.name) continue;
        if (reg.trigger !== trigger) continue;
        var ctx2 = Object.assign({}, ctx, { owner: player });
        if (reg.condition && !reg.condition(ctx2)) continue;
        found.push({ player: player, card: card, zone: zone.k, registry: reg });
      }
    }
  }
  return found;
}

// 全场轮询响应窗口
// 返回响应列表(按优先级排序) 或 null
function pollResponseWindow(p1, p2, trigger, ctx, state) {
  var candidates = [];
  candidates = candidates.concat(scanResponses(p1, trigger, ctx));
  candidates = candidates.concat(scanResponses(p2, trigger, ctx));
  if (candidates.length === 0) return null;
  // 未来可加优先级排序
  return candidates;
}

// 强制执行响应（从响应窗口选一个执行）
function executeResponse(target, state) {
  var player = target.player;
  var opp = state.players[player.id === 1 ? 1 : 0];
  var card = target.card;
  var zoneKey = target.zone;
  var d = card._data || card;

  // 从原区域移除（按id匹配，避免JSON序列化后reference丢失）
  var cid = card.id || (card._data && card._data.id);
  if (zoneKey === 'judgmentZone') {
    player.judgmentZone = null;
  } else {
    var arr = player[zoneKey];
    for (var j = arr.length - 1; j >= 0; j--) {
      var aid = arr[j].id || (arr[j]._data && arr[j]._data.id);
      if (aid === cid) { arr.splice(j, 1); break; }
    }
  }

  // 响应牌打出：武技→出牌区，心法/其他→弃牌堆
  var cardType = d.type || (d._data && d._data.type);
  if (cardType === 'wuji') {
    player.actionZone.push(card);
    state.log.push('⚡响应! ' + player.character.name + '打出' + d.name + '→出牌区');
  } else {
    player.discardPile.push(card);
    state.log.push('⚡响应! ' + player.character.name + '发动' + d.name);
  }

  // 执行注册的效果函数（重查registry，避免saveState序列化丢失函数）
  var reg = null;
  for (var r = 0; r < RESPONSE_REGISTRY.length; r++) {
    if (RESPONSE_REGISTRY[r].name === d.name) { reg = RESPONSE_REGISTRY[r]; break; }
  }
  if (reg) {
    // 舍身撞：交互选择目标
    if (d.name === '舍身撞') {
      player.innerPower = Math.max(0, player.innerPower - 2);
      state.log.push('⚡舍身撞！请选择对方丹田中要摧毁的心法牌（最多2张）');
      // Create KillDantianCmd → enqueue → wait for dantian selection
      var q = state._cmdQueue;
      q.enqueue(q.createKillDantianCmd(card, player, opp));
      var dantianCards = opp.dantian;
      state._dantianSelect = {
        oppId: opp.id,
        maxSelect: 2,
        xinfaOnly: true,
        candidates: dantianCards.map(function(dc, i) {
          return { index: i, name: (dc._data || dc).name, type: (dc._data || dc).type, faction: (dc._data || dc).faction };
        }),
        onDone: 'shaShenZhuang'
      };
      return;
    }
    // 梯云纵：扣内+抽牌走 RESPONSE_REGISTRY，拆招效果走 CommandQueue
    if (d.name === '梯云纵') {
      reg.effect(player, opp, {}, state);
      // CommandQueue 接管：标记对手AZ效果为已拆
      var q = state._cmdQueue;
      var negCmd = q.createNegateCmd(card, player, opp);
      q.enqueue(negCmd);
      q.resolveChain(state);
      return;
    }
    reg.effect(player, opp, {}, state);
  }
}

// ── 响应入口：每次出牌后调用 ──
// ctx: { trigger, sourcePlayer, card }
// 返回: 'human_response' | 'ai_responded' | null
// 链锁规则（YGO式）：
//   1. 全场扫描 → 过滤已拒绝牌 → 人类优先暂停
//   2. AI全自动：所有候选牌先标记"本轮已拒绝" → push入链
//   3. LIFO结算（后入先出）→ 每结算1张立刻检查新链
//   4. 拒绝过的牌在本轮链中不再响应（防止无限循环）
function handleResponseWindow(p1, p2, ctx, state, ai2) {
  var candidates = pollResponseWindow(p1, p2, ctx.trigger, ctx, state);
  if (!candidates) return null;

  // 过滤已在本轮链中拒绝过的牌
  if (!state._refusedInChain) state._refusedInChain = {};
  candidates = candidates.filter(function(c) {
    var cid = c.card.id || (c.card._data && c.card._data.id);
    return !(cid && state._refusedInChain[cid]);
  });
  if (candidates.length === 0) return null;

  var humanCandidates = candidates.filter(function(c) { return c.player.id === 1; });
  var aiCandidates = candidates.filter(function(c) { return c.player.id === 2; });

  // 如果人类有响应机会 → 暂停
  if (humanCandidates.length > 0) {
    state._responseWindow = { trigger: ctx.trigger, candidates: humanCandidates };
    return 'human_response';
  }

  // 仅AI有响应 → 自动链锁（CommandQueue 驱动）
  if (aiCandidates.length > 0) {
    // 标记所有候选为"本轮已响应"
    aiCandidates.forEach(function(c) {
      var cid = c.card.id || (c.card._data && c.card._data.id);
      if (cid) state._refusedInChain[cid] = true;
    });

    // LIFO链：入队 → resolveChain
    var q = state._cmdQueue || new er.CommandQueue();
    for (var ci = aiCandidates.length - 1; ci >= 0; ci--) {
      var link = aiCandidates[ci];
      executeResponse(link, state);
    }
    q.resolveChain(state);  // FILO: 响应先结算

    // 结算完毕后检查是否有子链
    var sub = handleResponseWindow(p1, p2, {
      trigger: RESP_TRIGGER.ON_CARD_PLAYED,
      sourcePlayer: aiCandidates[aiCandidates.length - 1].player,
      card: aiCandidates[aiCandidates.length - 1].card
    }, state, ai2);
    if (sub === 'human_response') return 'human_response';
    return 'ai_responded';
  }
  return null;
}

// ═══════════════════════════════════════════
//  行动阶段 (含人类暂停)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
//  行动阶段（按出牌权/劣势方规则）
// ═══════════════════════════════════════════

// AI劣势方出牌循环：AI出牌→每次检查响应→直到AI声明pass
function runAIExchange(p1, p2, state, ai2) {
  while (!state.isGameOver) {
    var prevAZ = p2.actionZone.length;  // 追踪出牌
    var result = ai2.takeAction(p2, p1, state);
    if (result === 'surrender' || result === 'no_action' || result === 'caught_up') {
      state.log.push('AI(' + p2.character.name + ') 声明pass');
      break;
    }
    // AI出牌后 → 检查全场[响应]窗口
    var playedCard = p2.actionZone.length > prevAZ ? p2.actionZone[p2.actionZone.length - 1] : null;
    var isXf = playedCard && ((playedCard._data || playedCard).type === 'xinfa');
    var triggers = [
      RESP_TRIGGER.ON_CARD_PLAYED,
      isXf ? RESP_TRIGGER.ON_XINFA_PLAYED : RESP_TRIGGER.ON_WUJI_PLAYED,
      RESP_TRIGGER.ON_POWER_CHANGE
    ];
    var humanResp = null;
    for (var t = 0; t < triggers.length && !humanResp; t++) {
      var resp = handleResponseWindow(p1, p2, {
        trigger: triggers[t], sourcePlayer: p2
      }, state, ai2);
      if (resp === 'human_response') humanResp = true;
    }
    // 响应窗口关闭 → CommandQueue 结算
    state._cmdQueue.resolveChain(state);
    if (humanResp) return 'human_response';
    // Continue (takeAction returns 'continue' or 'caught_up')
  }

  // AI pass → 重新比较战力
  cr.calcTotalPower(p1, state);
  cr.calcTotalPower(p2, state);
  var newDis = cr.determineDisadvantaged(p1, p2);

  if (newDis === p2) {
    // 同一方连续劣势 → 获得[破绽] → 结束阶段
    state.log.push('AI(' + p2.character.name + ') 声明pass → 连续劣势，获得1破绽！');
    gs.gainFlaw(p2, 1, state);
    if (state.isGameOver) return 'victory';
    return 'round_end';
  }
  // 劣势方切换（平局且双方有破绽时猜拳定胜负）
  if (newDis === null && p1.flaws > 0 && p2.flaws > 0) {
    var coin = Math.random() < 0.5 ? 'human' : 'ai';
    state.log.push('双方平局且有破绽，猜拳定劣势方：' + (coin === 'human' ? 'P1' : 'P2') + '劣势');
    state._disadvantagedSide = coin;
    return 'pause_action';
  }
  state._disadvantagedSide = 'human';
  if (!p1.hasDrawnFirstFlaw) {
    p1.hasDrawnFirstFlaw = true;
    gs.drawCards(p1, 1, state);
    state.log.push('P' + p1.id + ' 首次劣势，抽1张');
  }
  return 'pause_action';
}

// 行动阶段入口：由advanceToNextPause调用
// 返回: 'pause_action'=人类劣势暂停, 'round_end'=回合结束, 'victory'=游戏结束
function actionPhase(p1, p2, state, ai2) {
  // 判定后初次确定劣势方
  cr.calcTotalPower(p1, state);
  cr.calcTotalPower(p2, state);
  var disadvantaged = cr.determineDisadvantaged(p1, p2);
  state._disadvantagedSide = disadvantaged === p1 ? 'human' : 'ai';

  if (disadvantaged === p1) {
    return 'pause_action'; // 人类是劣势方 → CLI暂停
  }
  // AI是劣势方 → AI获得出牌权，出牌直到pass
  return runAIExchange(p1, p2, state, ai2);
}

//  主循环 (推进到下一个人类暂停或回合结束)
// ═══════════════════════════════════════════

// ── 出牌后触发所有相关响应窗口 ──
function postCardPlayChecks(p1, p2, sourcePlayer, card, state, ai2) {
  var isXf = card && (card._data || card).type === 'xinfa';
  var triggers = [
    RESP_TRIGGER.ON_CARD_PLAYED,
    isXf ? RESP_TRIGGER.ON_XINFA_PLAYED : RESP_TRIGGER.ON_WUJI_PLAYED,
    RESP_TRIGGER.ON_POWER_CHANGE
  ];
  for (var t = 0; t < triggers.length; t++) {
    var resp = handleResponseWindow(p1, p2, {
      trigger: triggers[t], sourcePlayer: sourcePlayer, card: card
    }, state, ai2);
    if (resp === 'human_response') return true;
  }
  return false;
}

// ── 响应窗口显示 ──
function showResponseWindow(state) {
  var out = ui.renderResponseWindow(state);
  if (out) console.log(out);
}

function showDantianSelect(state) {
  var out = ui.renderDantianSelect(state);
  if (out) console.log(out);
}

function advanceToNextPause(state, ai2) {
  var p1 = state.players[0], p2 = state.players[1];

  while (!state.isGameOver && state.round < (CONST.maxRounds || 99)) {

    if (state.phase === fsm.Phase.CHOOSE_JUDGMENT || !state.phase) {
      return 'pause';

    } else if (state.phase === fsm.Phase.ACTION) {
      var actResult = actionPhase(p1, p2, state, ai2);
      if (actResult === 'pause_action') { fsm.setPhase(state, fsm.Phase.ACTION); return 'pause'; }
      if (actResult === 'round_end') { fsm.setPhase(state, fsm.Phase.NEXT_ROUND); continue; }
      if (actResult === 'victory') return 'victory';
      if (actResult === 'human_response') { fsm.setPhase(state, fsm.Phase.RESPONSE); return 'pause'; }
      fsm.setPhase(state, fsm.Phase.ACTION);
      return 'pause';

    } else if (state.phase === fsm.Phase.JUDGMENT) {
      judgmentPhase(p1, p2, state);
      if (state.isGameOver) return 'victory';
      fsm.setPhase(state, fsm.Phase.ACTION);
      continue;

    } else if ((state.phase === fsm.Phase.PREPARATION || state.phase === fsm.Phase.NEW_ROUND) || state.phase === fsm.Phase.NEXT_ROUND) {
      if (state.phase === fsm.Phase.NEXT_ROUND) {
        resolutionPhase(p1, p2, state);
        if (state.isGameOver) return 'victory';
      }
      state.round++;
      state._aiJzShownThisRound = false;
      state.log.push('\n--- 第' + state.round + '回合 ---');
      resetRound(p1); resetRound(p2);
      if (state.isGameOver) return 'victory';
      preparationPhase(p1, p2, state, ai2);
      if (p1.hp <= 0) { endGame(state, p2); return 'victory'; }
      if (p2.hp <= 0) { endGame(state, p1); return 'victory'; }
      fsm.setPhase(state, fsm.Phase.CHOOSE_JUDGMENT);
      return 'pause';
    } else {
      fsm.setPhase(state, fsm.Phase.NEW_ROUND);
    }
  }
  return 'victory';
}// ═══════════════════════════════════════════
//  CLI 命令
// ═══════════════════════════════════════════

if (CMD === 'init') {
  // 难度检查
  var difficulties = ['入门', '普通'];
  var diff = args[1];
  if (!diff || difficulties.indexOf(diff) === -1) {
    console.log('请声明难度：入门 或 普通');
    console.log('Usage: node interact3.js init 入门|普通 [playerFaction] [aiFaction]');
    process.exit(1);
  }

  // 身份映射
  var factionMap = {
    '血刀': { deck: 'modeng_xuedao', char: 'xuedao', aiFaction: 'modeng' },
    '无极道人': { deck: 'wudang_wuji', char: 'wuji', aiFaction: 'wudang' },
    '夜修罗': { deck: 'yintang_yeshura', char: 'yeshura', aiFaction: 'yintang' }
  };
  var humanChoice = args[2] || '血刀';
  var aiChoice = args[3] || '无极道人';
  var hInfo = factionMap[humanChoice];
  var aInfo = factionMap[aiChoice];
  if (!hInfo) { console.log('未知身份: ' + humanChoice + '，可选: 血刀/无极道人/夜修罗'); process.exit(1); }
  if (!aInfo) { console.log('未知身份: ' + aiChoice + '，可选: 血刀/无极道人/夜修罗'); process.exit(1); }
  if (humanChoice === aiChoice) { console.log('双方不能选择相同身份'); process.exit(1); }
  if (!decks[hInfo.deck]) { console.log('卡组数据缺失: ' + hInfo.deck); process.exit(1); }
  if (!decks[aInfo.deck]) { console.log('卡组数据缺失: ' + aInfo.deck); process.exit(1); }

  var deck1 = decks[hInfo.deck], deck2 = decks[aInfo.deck];
  var char1 = characters[hInfo.char], char2 = characters[aInfo.char];

  var state = gs.createGameState(deck1, deck2, char1, char2);
  state.round = 0; state.log = [];
  state._difficulty = diff;
  state._aiJzShownThisRound = false;
  state._humanFaction = humanChoice;
  state._aiFaction = aiChoice;
  state._cmdQueue = new er.CommandQueue();  // CommandQueue 驱动响应链

  var ai2 = new BaseAI(aInfo.aiFaction, hInfo.aiFaction);
  state.players[1]._ai = ai2;

  // Initial draw
  gs.drawCards(state.players[0], CONST.startingDraw, state);
  gs.drawCards(state.players[1], CONST.startingDraw, state);
  state.log.push('=== 游戏开始 ===');
  state.log.push('P1(' + state.players[0].character.name + ') HP=' + state.players[0].hp + ' | P2(' + state.players[1].character.name + ') HP=' + state.players[1].hp);
  console.log(ui.renderCharacterSkill(state.players[0].character.id));

  // Round 1
  state.round = 1;
  state.log.push('\n--- 第1回合 ---');
  resetRound(state.players[0]); resetRound(state.players[1]);
  preparationPhase(state.players[0], state.players[1], state, ai2);

  saveState(state, ai2);
  console.log(ui.render(state, 0));
  console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass');
  process.exit(0);

} else if (CMD === 'choice' || CMD === 'pass') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game. Run "node interact3.js init 入门|普通" first.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0], p2 = state.players[1];
  p2._ai = ai2;

  if (state.phase === fsm.Phase.CHOOSE_JUDGMENT) {
    if (CMD === 'choice') {
      var idx = parseInt(ARG);
      if (isNaN(idx) || idx < 0 || idx >= p1.hand.length) { console.log('Invalid index'); process.exit(1); }
      var jzCard = p1.hand[idx];
      p1.judgmentZone = jzCard;
      removeFromHand(p1, jzCard);
      state.log.push('你暗盖《' + jzCard._data.name + '》');
    } else {
      // pass JZ
      if (p1.hand.length > 0) {
        console.log('\n⚠ 你还有手牌，必须暗盖一张！');
        saveState(state, ai2);
        showGamePrompt(state);
        process.exit(0);
      }
      // 无手牌 → 自动劣势
      p1.judgmentZone = null;
      state.log.push('你无手牌可暗盖，自动判定为劣势方');
      console.log('\n⚠ 你没有手牌，自动判定为劣势方。');
    }
    fsm.setPhase(state, fsm.Phase.JUDGMENT);

    // ── 仅解判定，不自动推进 ──
    judgmentPhase(p1, p2, state);
    if (state.isGameOver) {
      var w = state.winner === 1 ? p1 : p2;
      endGame(state, w);
      console.log(ui.render(state, 0));
      saveState(state, ai2);
      console.log('\n=== 游戏结束 ===');
      console.log('胜者: ' + (state.winner === 1 ? '你' : 'AI'));
      process.exit(0);
    }
    fsm.setPhase(state, fsm.Phase.ACTION);

    // 判定优劣方 → 决定谁先出牌
    cr.calcTotalPower(p1, state);
    cr.calcTotalPower(p2, state);
    var disadvantaged = cr.determineDisadvantaged(p1, p2);
    state._disadvantagedSide = disadvantaged === p1 ? 'human' : 'ai';

    if (disadvantaged === p1) {
      // 人类劣势 → 暂停，等待出牌
      saveState(state, ai2);
      console.log(ui.render(state, 0));
      if (p1.hand.length > 0) {
        console.log('\n[劣势方] 内' + p1.innerPower + ' 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
      } else {
        console.log('\n[劣势方] 你无手牌，只能声明pass');
      }
      console.log(ui.renderPhaseCommands(state));
      console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
      process.exit(0);
    }
    // AI劣势 → 暂停，等人类输入 continue 推进
    state.log.push('AI(' + p2.character.name + ') 获得出牌权，输入 continue 推进');
    saveState(state, ai2);
    console.log(ui.render(state, 0));
    console.log(ui.renderPhaseCommands(state));
    console.log('\n>>> node interact3.js continue');
    process.exit(0);

  } else if (state.phase === fsm.Phase.ACTION) {
    if (CMD === 'choice') {
      var idx2 = parseInt(ARG);
      if (isNaN(idx2) || idx2 < 0 || idx2 >= p1.hand.length) {
        console.log('Invalid index. Your hand has ' + p1.hand.length + ' cards.');
        process.exit(1);
      }
      var played = humanPlayCard(p1, p2, state, idx2);
      if (played === false) {
        console.log(ui.render(state, 0));
        console.log('\n⚠ 内力不足，无法打出此牌！');
        console.log('[劣势方] 内' + p1.innerPower + ' 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
        console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
        process.exit(0);
      }
      // 秘术检索-放逐：暂停等待玩家选择放逐牌
      if (state._exileCandidates) {
        saveState(state, ai2);
        console.log(ui.render(state, 0));
        console.log('\n══ 秘术检索：选择放逐牌 ══');
        console.log('需要放逐 ' + state._exileNeedCount + ' 张，候选:');
        var cands = state._exileCandidates;
        for (var ei = 0; ei < cands.length; ei++) {
          console.log('  [' + ei + '] 《' + cands[ei].name + '》 ' +
            (cands[ei].zone === 'discardPile' ? '弃牌堆' : cands[ei].zone === 'actionZone' ? '出牌区' : cands[ei].zone === 'hand' ? '手牌' : cands[ei].zone === 'mainDeck' ? '主卡组' : cands[ei].zone));
        }
        console.log('\n>>> node interact3.js exilepick <idx> [<idx>]');
        process.exit(0);
      }
      // 秘术检索：暂停等待玩家选择额外牌
      if (state._searchExtra) {
        saveState(state, ai2);
        console.log(ui.render(state, 0));
        console.log('\n══ 秘术检索 ══');
        console.log('放逐完成，从额外卡组选择:');
        for (var e = 0; e < state._searchExtra.length; e++) {
          console.log('  [' + e + '] ' + ui.cardDetailCompact(state._searchExtra[e]));
        }
        console.log('\n>>> node interact3.js searchpick <n>');
        process.exit(0);
      }
      // 人类出牌后 → 根据牌类型触发相应响应窗口
      var lastCard = p1.actionZone.length > 0 ? p1.actionZone[p1.actionZone.length - 1] :
        (p1.dantian.length > 0 ? p1.dantian[p1.dantian.length - 1] : null);
      if (postCardPlayChecks(p1, p2, p1, lastCard, state, ai2)) {
        // 有响应 → 暂停给人类决定
        saveState(state, ai2);
        showResponseWindow(state);
        process.exit(0);
      }
      // 响应窗口关闭 → CommandQueue 结算出牌链
      state._cmdQueue.resolveChain(state);
      // 人类出牌后保持出牌权——必须人类显式pass才移交
      cr.calcTotalPower(p1, state);
      cr.calcTotalPower(p2, state);
      saveState(state, ai2);
      console.log(ui.render(state, 0));
      if (p1.totalPower < p2.totalPower) {
        console.log('\n[劣势方] 内' + p1.innerPower + ' 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
      } else {
        console.log('\n[有出牌权] 内' + p1.innerPower + ' 可继续出牌/血战，或 pass:');
      }
      console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
      process.exit(0);
    } else {
      // ── 人类声明pass：重新判定劣势方 ──
      state.log.push('你声明pass');
      cr.calcTotalPower(p1, state);
      cr.calcTotalPower(p2, state);
      var newDis = cr.determineDisadvantaged(p1, p2);

      if (newDis === p1) {
        // 同一方连续劣势 → [破绽] → 结束阶段
        state.log.push('你连续劣势，获得1破绽！');
        gs.gainFlaw(p1, 1, state);
        if (state.isGameOver) {
          var w = state.winner === 1 ? p1 : p2;
          endGame(state, w);
          console.log(ui.render(state, 0));
          saveState(state, ai2);
          console.log('\n=== 游戏结束 ===');
          console.log('胜者: ' + (state.winner === 1 ? '你' : 'AI'));
          process.exit(0);
        }
        // Phase A 效果移入 resolutionPhase 统一结算
        fsm.setPhase(state, fsm.Phase.NEXT_ROUND);
      } else if (newDis === null && p1.flaws > 0 && p2.flaws > 0) {
        // 平局且双方有破绽 → 猜拳定劣势方
        var coin = Math.random() < 0.5 ? 'human' : 'ai';
        state.log.push('双方平局且有破绽，猜拳定劣势方：' + (coin === 'human' ? '你' : 'AI') + '劣势');
        state._disadvantagedSide = coin;
      } else {
        // 劣势方切换：AI获得出牌权
        state._disadvantagedSide = 'ai';
        state.log.push('出牌权移交AI(' + p2.character.name + ')');
      }
    }
  } else {
    console.log('Unexpected phase: ' + state.phase);
    process.exit(1);
  }

  // Advance game until next human pause
  var adv = advanceToNextPause(state, ai2);

  if (state.isGameOver) {
    console.log(ui.render(state, 0));
    saveState(state, ai2);
    console.log('\n=== 游戏结束 ===');
    console.log('胜者: ' + (state.winner === 1 ? '你' : 'AI'));
    // Clean up state file
    try { fs.unlinkSync(STATE_FILE); } catch (e) { }
    process.exit(0);
  }

  if (adv === 'victory' && state.isGameOver) {
    console.log(ui.render(state, 0));
    console.log('\n=== 游戏结束 ===');
    console.log('胜者: ' + (state.winner === 1 ? '你' : 'AI'));
    try { fs.unlinkSync(STATE_FILE); } catch (e) { }
    process.exit(0);
  }

  saveState(state, ai2);
  console.log(ui.render(state, 0));

  if (state.phase === fsm.Phase.CHOOSE_JUDGMENT) {
    console.log(ui.renderPhaseCommands(state));
          console.log('\n>>> node interact3.js choice <n> | pass');
  } else if (state.phase === fsm.Phase.ACTION) {
    console.log('\n[劣势方] 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
    console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
  } else if (state.phase === fsm.Phase.RESPONSE) {
    showResponseWindow(state);
  }

} else if (CMD === 'bloodwarfare') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0];
  if (state.phase !== fsm.Phase.ACTION) { console.log('not action phase'); process.exit(1); }
  if (p1.tempStats.passiveUsed) { console.log('passive already used'); process.exit(1); }
  if (p1.character.id !== 'xuedao') { console.log('not xuedao'); process.exit(1); }

  // 激活血战代价（破绽+1）
  p1.tempStats.passiveUsed = true;
  p1.selfInflictedFlaws = (p1.selfInflictedFlaws || 0) + 1;
  gs.gainFlaw(p1, 1, state);

  // 如果用户指定了模式用指定模式，否则提示选择
  var mode = null;
  if (ARG === 'cost') { mode = 'costDown'; }
  else if (ARG === 'discard') { mode = 'discardUp'; }

  if (mode) {
    p1.tempStats.bloodWarfareUsed = true;
    p1.tempStats.bloodWarfareMode = mode;
    state.log.push('血战到底：+1破绽(' + p1.flaws + ')，模式=' + (mode === 'costDown' ? '减2费' : '弃牌+1'));
    saveState(state, ai2);
    console.log(ui.render(state, 0));
    console.log('\n🔥 血战到底(' + (mode === 'costDown' ? '下一魔教牌-2费' : '下一次震伤弃牌+1') + ')已激活。');
    console.log('Play [0-' + (p1.hand.length - 1) + '] or pass:');
    console.log('>>> node interact3.js choice <n> | pass');
  } else {
    // 未指定模式：暂停等待选择
    state._pendingBloodMode = true;
    state.log.push('血战到底：+1破绽(' + p1.flaws + ')，等待选择效果');
    saveState(state, ai2);
    console.log(ui.render(state, 0));
    console.log('\n🔥 血战到底发动！破绽+1。请选择效果：');
    console.log('  [1] 下一张魔教牌消耗-2费');
    console.log('  [2] 下一次震伤弃牌+1');
    console.log('>>> node interact3.js bloodmode 1|2');
  }

} else if (CMD === 'bloodmode') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0];
  if (!state._pendingBloodMode) { console.log('当前没有待选的血战效果'); process.exit(1); }

  var mode = ARG === '2' ? 'discardUp' : 'costDown';
  p1.tempStats.bloodWarfareUsed = true;
  p1.tempStats.bloodWarfareMode = mode;
  state._pendingBloodMode = false;
  state.log.push('血战到底：选择模式=' + (mode === 'costDown' ? '减2费' : '弃牌+1'));

  saveState(state, ai2);
  console.log(ui.render(state, 0));
  console.log('\n🔥 血战到底(' + (mode === 'costDown' ? '下一魔教牌-2费' : '下一次震伤弃牌+1') + ')已激活。');
  console.log('Play [0-' + (p1.hand.length - 1) + '] or pass:');
  console.log('>>> node interact3.js choice <n> | pass');

} else if (CMD === 'continue' || CMD === 'c') {
  // 推进游戏到下一个人类暂停点（AI出牌/回合结束/新回合）
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0], p2 = state.players[1];
  p2._ai = ai2;

  var adv = advanceToNextPause(state, ai2);
  if (state.isGameOver) {
    console.log(ui.render(state, 0));
    saveState(state, ai2);
    console.log('\n=== 游戏结束 ===');
    console.log('胜者: ' + (state.winner === 1 ? '你' : 'AI'));
    try { fs.unlinkSync(STATE_FILE); } catch (e) { }
    process.exit(0);
  }
  saveState(state, ai2);
  console.log(ui.render(state, 0));
  if (state.phase === fsm.Phase.CHOOSE_JUDGMENT) {
    console.log(ui.renderPhaseCommands(state));
    console.log('\n>>> node interact3.js choice <n> | pass');
  } else if (state.phase === fsm.Phase.ACTION) {
    if (state._disadvantagedSide === 'human') {
      if (p1.hand.length > 0) {
        console.log('\n[劣势方] 内' + p1.innerPower + ' 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
      } else {
        console.log('\n[劣势方] 你无手牌，只能声明pass');
      }
      console.log(ui.renderPhaseCommands(state));
      console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
    }
  } else if (state.phase === fsm.Phase.RESPONSE) {
    showResponseWindow(state);
  }

} else if (CMD === 'discard') {
  // [弃牌堆发动] — 选择弃牌堆中有 activateFromDiscard 效果的牌发动
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0];
  if (state.phase !== fsm.Phase.ACTION) { console.log('only during action phase'); process.exit(1); }

  var options = [];
  for (var di = 0; di < p1.discardPile.length; di++) {
    var dc = p1.discardPile[di];
    var et = dc._data ? dc._data.effectType : dc.effectType;
    if (et === 'activateFromDiscard') options.push({ card: dc, index: di });
  }
  if (options.length === 0) { console.log('no activatable cards in discard'); process.exit(1); }

  if (!ARG) {
    console.log(ui.render(state, 0));
    console.log('\n====== discard activate ======');
    for (var oi = 0; oi < options.length; oi++) {
      console.log('  [' + oi + '] ' + (options[oi].card._data.name));
    }
    console.log('>>> node interact3.js discard <n>');
    process.exit(0);
  }

  var pick = parseInt(ARG);
  if (isNaN(pick) || pick < 0 || pick >= options.length) { console.log('invalid: 0-' + (options.length - 1)); process.exit(1); }

  var chosen = options[pick].card;
  var cmd = state._cmdQueue.createDiscardActivateCmd(p1, chosen, state);
  state._cmdQueue.enqueue(cmd);
  state._cmdQueue.resolveChain(state);
  state.log.push('P1 activate discard: ' + (chosen._data.name));

  saveState(state, ai2);
  console.log(ui.render(state, 0));
  console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | discard | bloodwarfare');

} else if (CMD === 'exilepick') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0];

  var indices = ARG.trim().split(/\s+/).map(function(s) { return parseInt(s); });
  indices = indices.filter(function(v, i, arr) { return !isNaN(v) && arr.indexOf(v) === i; });
  indices.sort(function(a, b) { return b - a; });
  var needCount = state._exileNeedCount || 2;

  if (indices.length === 0 || indices.length > needCount) {
    console.log('请选择1-' + needCount + '张牌，用空格分隔。例: exilepick 0 2');
    process.exit(1);
  }
  if (!state._exileCandidates) { console.log('不在放逐选择阶段'); process.exit(1); }
  for (var ii = 0; ii < indices.length; ii++) {
    if (indices[ii] < 0 || indices[ii] >= state._exileCandidates.length) {
      console.log('序号' + indices[ii] + '超出范围 0-' + (state._exileCandidates.length - 1));
      process.exit(1);
    }
  }

  var exiledNames = [];
  var candidates = state._exileCandidates;
  for (var ei = 0; ei < indices.length; ei++) {
    var target = candidates[indices[ei]];
    var zone = target.zone;
    if (zone === 'discardPile' || zone === 'discard') removeFromArr(p1.discardPile, target.card);
    else if (zone === 'mainDeck') removeFromArr(p1.mainDeck, target.card);
    else if (zone === 'actionZone') removeFromArr(p1.actionZone, target.card);
    else if (zone === 'hand') removeFromArr(p1.hand, target.card);
    p1.exileZone = p1.exileZone || [];
    p1.exileZone.push(target.card);
    exiledNames.push(target.name + '(' + target.zone + ')');
    state.log.push('放逐《' + target.name + '》（' + target.zone + '）');
  }

  delete state._exileCandidates;
  delete state._exileNeedCount;

  // 继续到额外卡组选择
  var seCard = null;
  for (var i = 0; i < p1.actionZone.length; i++) {
    if (p1.actionZone[i]._data.effectType === 'searchExtra') { seCard = p1.actionZone[i]; break; }
  }
  if (seCard) {
    var data = seCard._data;
    var FACTMAP = { '\u9b54\u6559': 'modeng', '\u6b66\u5f53': 'wudang', '\u9690\u5802': 'yintang' };
    var nf = FACTMAP[data.searchFaction] || data.searchFaction;
    var eligible = p1.extraDeck.filter(function(ec) {
      var ef = ec._data.faction;
      return !nf || ef === nf || (Array.isArray(ef) && ef.indexOf(nf) >= 0);
    });
    if (eligible.length > 0) {
      state._searchExtra = eligible;
    }
  }

  if (state._searchExtra) {
    saveState(state, ai2);
    console.log(ui.render(state, 0));
    console.log('\n══ 秘术检索 ══');
    console.log('已放逐: ' + exiledNames.join(', '));
    console.log('从额外卡组选择:');
    for (var e2 = 0; e2 < state._searchExtra.length; e2++) {
      console.log('  [' + e2 + '] ' + ui.cardDetailCompact(state._searchExtra[e2]));
    }
    console.log('\n>>> node interact3.js searchpick <n>');
    process.exit(0);
  } else {
    // 没有可用额外牌，直接继续
    saveState(state, ai2);
    console.log(ui.render(state, 0));
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    if (state.phase === fsm.Phase.ACTION) {
      console.log('\n[有出牌权] 内' + p1.innerPower + ' 可继续出牌/血战，或 pass:');
      console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
    }
    process.exit(0);
  }

} else if (CMD === 'searchpick') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0], p2 = state.players[1];

  var idx = parseInt(ARG);
  if (!state._searchExtra) { console.log('not search phase'); process.exit(1); }
  if (isNaN(idx) || idx < 0 || idx >= state._searchExtra.length) { console.log('invalid index'); process.exit(1); }
  var eligible = state._searchExtra;

  var chosen = eligible.splice(idx, 1)[0];
  // 从extraDeck中移除
  var edIdx = p1.extraDeck.indexOf(chosen);
  if (edIdx >= 0) p1.extraDeck.splice(edIdx, 1);
  p1.hand.push(cloneCard(chosen));
  state.log.push('秘术检索：选《' + chosen._data.name + '》');

  delete state._searchExtra;
  saveState(state, ai2);

  // bonusDraw (如果卡牌有bonusDraw属性)
  var seCard = null;
  for (var i = 0; i < p1.actionZone.length; i++) {
    if (p1.actionZone[i]._data.effectType === 'searchExtra') { seCard = p1.actionZone[i]; break; }
  }
  if (seCard && seCard._data.bonusDraw) gs.drawCards(p1, seCard._data.bonusDraw, state);

  // 手牌溢出检查
  while (p1.hand.length > CONST.maxHandSize) {
    var overflow1 = p1.hand.pop();
    p1.discardPile.push(overflow1);
    state.log.push('P1 手牌已满，溢出进弃牌堆');
  }
  while (p2.hand.length > CONST.maxHandSize) {
    var overflow2 = p2.hand.pop();
    p2.discardPile.push(overflow2);
    state.log.push('P2 手牌已满，溢出进弃牌堆');
  }

  console.log(ui.render(state, 0));

  if (state.phase === fsm.Phase.ACTION) {
    console.log('\n[有出牌权] 内' + p1.innerPower + ' 可继续出牌/血战，或 pass:');
    console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
  }

} else if (CMD === 'respond' || CMD === 'skip') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0], p2 = state.players[1];
  if (state.phase !== fsm.Phase.RESPONSE) { console.log('no response window'); process.exit(1); }
  // 若 _responseWindow 被旧saveState清除，从内存重建
  // 若 _responseWindow 被旧saveState清除，从内存重建
  if (!state._responseWindow) {
    state._responseWindow = { trigger: RESP_TRIGGER.ON_CARD_PLAYED };
    var resPoll = pollResponseWindow(p1, p2, RESP_TRIGGER.ON_CARD_PLAYED, { sourcePlayer: p2 }, state);
    if (resPoll) {
      state._responseWindow = { trigger: RESP_TRIGGER.ON_CARD_PLAYED, candidates: resPoll.filter(function(c) { return c.player.id === 1; }) };
    }
    if (!state._responseWindow.candidates || state._responseWindow.candidates.length === 0) {
      state._responseWindow = null;
      fsm.setPhase(state, fsm.Phase.ACTION);
      saveState(state, ai2);
      console.log(ui.render(state, 0));
      if (state.phase === fsm.Phase.ACTION) {
        console.log('\n[劣势方] 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
        console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
      }
      process.exit(0);
    }
  }

  if (CMD === 'skip') {
    state.log.push('你跳过响应');
    var rwSkip = state._responseWindow;
    if (rwSkip && rwSkip.candidates) {
      if (!state._refusedInChain) state._refusedInChain = {};
      rwSkip.candidates.forEach(function(c) {
        var cid = c.card.id || (c.card._data && c.card._data.id);
        if (cid) state._refusedInChain[cid] = true;
      });
    }
    delete state._responseWindow;
    fsm.setPhase(state, fsm.Phase.ACTION);
    // 响应窗口关闭 → CommandQueue 结算出牌链
    state._cmdQueue.resolveChain(state);
  } else {
    var rIdx = parseInt(ARG);
    var rw = state._responseWindow;
    if (isNaN(rIdx) || rIdx < 0 || !rw || rIdx >= rw.candidates.length) {
      console.log('Invalid respond index. Available: 0-' + ((rw && rw.candidates.length - 1) || 0));
      process.exit(1);
    }
    var target = rw.candidates[rIdx];
    // 标记该牌为"本轮已响应"
    if (!state._refusedInChain) state._refusedInChain = {};
    var cid = target.card.id || (target.card._data && target.card._data.id);
    if (cid) state._refusedInChain[cid] = true;

    executeResponse(target, state);
    // 如果进入选择状态（如舍身撞），不继续推进
    if (state._dantianSelect) {
      delete state._responseWindow;
      fsm.setPhase(state, fsm.Phase.DANTIAN_SELECT);
      saveState(state, ai2);
      console.log(ui.render(state, 0));
      showDantianSelect(state);
      process.exit(0);
    }
    // 响应结算后，可继续连锁
    delete state._responseWindow;
    fsm.setPhase(state, fsm.Phase.ACTION);
    // 非梯云纵/舍身撞的响应也需要结算队列
    if (state._cmdQueue.stack.length > 0) {
      state._cmdQueue.resolveChain(state);
    }
  }

  // 链结束（无更多候选），清除拒绝标记
  delete state._refusedInChain;

  // 继续推进游戏
  var adv = advanceToNextPause(state, ai2);
  if (state.isGameOver) {
    console.log(ui.render(state, 0));
    saveState(state, ai2);
    console.log('\n=== 游戏结束 ===');
    console.log('胜者: ' + (state.winner === 1 ? '你' : 'AI'));
    try { fs.unlinkSync(STATE_FILE); } catch (e) { }
    process.exit(0);
  }
  saveState(state, ai2);
  console.log(ui.render(state, 0));
  if (state.phase === fsm.Phase.RESPONSE) {
    showResponseWindow(state);
  } else if (state.phase === fsm.Phase.ACTION) {
    console.log('\n[劣势方] 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
    console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
  } else if (state.phase === fsm.Phase.CHOOSE_JUDGMENT) {
    console.log(ui.renderPhaseCommands(state));
          console.log('\n>>> node interact3.js choice <n> | pass');
  }

} else if (CMD === 'discard') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  console.log(ui.renderDiscardPile(loaded.state.players[0], true));
  console.log(ui.renderDiscardPile(loaded.state.players[1], false));
} else if (CMD === 'extra') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  console.log(ui.renderExtraDeck(loaded.state.players[0], true));
  console.log(ui.renderExtraDeck(loaded.state.players[1], false));
} else if (CMD === 'view') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var n = parseInt(ARG);
  if (isNaN(n) || n < 0 || n >= loaded.state.players[0].hand.length) { console.log('无效手牌序号'); process.exit(1); }
  console.log(ui.cardDetail(loaded.state.players[0].hand[n], ''));
} else if (CMD === 'status') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  console.log(ui.render(loaded.state, 0));

} else if (CMD === 'dantian') {
  var loaded = loadGame();
  if (!loaded) { console.log('No active game.'); process.exit(1); }
  var state = loaded.state, ai2 = loaded.ai2;
  var p1 = state.players[0], p2 = state.players[1];
  var indices = ARG.split(/\s+/).filter(function(x) { return x !== ''; }).map(function(s) { return parseInt(s); });
  if (!state._dantianSelect) { console.log('no dantian select'); process.exit(1); }
  var sel = state._dantianSelect;
  var opp = state.players[sel.oppId === 1 ? 0 : 1];
  indices.sort(function(a, b) { return b - a; });
  var destroyed = 0;
  for (var i = 0; i < indices.length && destroyed < sel.maxSelect; i++) {
    var idx = indices[i];
    if (idx >= 0 && idx < opp.dantian.length) {
      var dcard = opp.dantian[idx];
      var dd = dcard._data || dcard;
      if (!sel.xinfaOnly || dd.type === 'xinfa') {
        gs.removeDantianCard(opp, dcard, state);
        state.log.push('  P' + opp.id + ' ' + dd.name + ' 被摧毁');
        destroyed++;
      }
    }
  }
  state.log.push('⚡舍身撞！摧毁' + opp.character.name + '丹田' + destroyed + '张牌');
  gs.drawCards(opp, 1, state);
  // KillDantianCmd 已手动处理 → 出栈标记为已解析（避免 _resolveKillDantian 二次摧毁）
  state._cmdQueue.stack.pop();
  delete state._dantianSelect;
  fsm.setPhase(state, fsm.Phase.ACTION);

  var adv = advanceToNextPause(state, ai2);
  if (state.isGameOver) {
    console.log(ui.render(state, 0));
    saveState(state, ai2);
    console.log('\n=== 游戏结束 ===');
    console.log('胜者: ' + (state.winner === 1 ? '你' : 'AI'));
    try { fs.unlinkSync(STATE_FILE); } catch (e) { }
    process.exit(0);
  }
  saveState(state, ai2);
  console.log(ui.render(state, 0));
  if (state.phase === fsm.Phase.RESPONSE) {
    showResponseWindow(state);
  } else if (state.phase === fsm.Phase.ACTION) {
    console.log('\n[劣势方] 出牌 [0-' + (p1.hand.length - 1) + '] 或 pass/血战:');
    console.log(ui.renderPhaseCommands(state));
  console.log('\n>>> node interact3.js choice <n> | pass | bloodwarfare');
  } else if (state.phase === fsm.Phase.CHOOSE_JUDGMENT) {
    console.log(ui.renderPhaseCommands(state));
          console.log('\n>>> node interact3.js choice <n> | pass');
  }

} else {
  console.log('Usage: node interact3.js init 入门|普通 [playerFaction] [aiFaction] | choice <n> | pass | bloodwarfare [cost|discard] | bloodmode 1|2 | status | respond <n> | skip | dantian <idx> [<idx>]');
}
