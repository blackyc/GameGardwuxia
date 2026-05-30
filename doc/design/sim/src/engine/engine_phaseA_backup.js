// 游戏引擎 v5 —— 纯V1 + 秘术 + 震伤触发修正
var gs = require('./gameState');
var cr = require('./combatResolver');
var aiModule = require('./ai');
var CONST = require('../data/constants.json');

function GameEngine(p1Deck, p2Deck, charData1, charData2, ai1, ai2) {
  this.ai1 = ai1;
  this.ai2 = ai2;
  this.state = gs.createGameState(p1Deck, p2Deck, charData1, charData2);
}

GameEngine.prototype.run = function() {
  var state = this.state;
  var p1 = state.players[0];
  var p2 = state.players[1];
  p1._ai = this.ai1;
  p2._ai = this.ai2;

  gs.drawCards(p1, CONST.startingDraw, state);
  gs.drawCards(p2, CONST.startingDraw, state);
  state.log.push('=== 游戏开始 ===');
  state.log.push('P1(' + p1.name + ') HP=' + p1.hp + ' | P2(' + p2.name + ') HP=' + p2.hp);

  while (!state.isGameOver && state.round < CONST.maxRounds) {
    state.round++;
    state.log.push('\n--- 第' + state.round + '回合 ---');
    resetRound(p1);
    resetRound(p2);
    if (state.isGameOver) break;

    // 准备阶段
    preparationPhase(p1, p2, state, this);
    if (p1.hp <= 0) { endGame(state, p2); break; }
    if (p2.hp <= 0) { endGame(state, p1); break; }

    // 判定阶段
    judgmentPhase(p1, p2, state, this);
    if (state.isGameOver) break;

    // 出牌阶段（拉锯）
    actionPhase(p1, p2, state, this);
    if (state.isGameOver) break;

    // 结算阶段
    resolutionPhase(p1, p2, state);
  }

  state.log.push('\n=== 游戏结束 ===');
  state.log.push('胜者: ' + (state.winner ? 'P' + state.winner : '平局'));
  return {
    winner: state.winner,
    rounds: state.round,
    p1FinalHP: p1.hp,
    p2FinalHP: p2.hp,
    log: state.log
  };
};

function resetRound(player) {
  // 聚气诀：上回合出招区 → 本回合进丹田
  for (var i = player.actionZone.length - 1; i >= 0; i--) {
    if (player.actionZone[i].effectType === 'delayedDantian') {
      var card = player.actionZone.splice(i, 1)[0];
      player.dantian.push(card);
      player.baseInnerPower += (card._data.innerPower || 0);
    }
  }
  player.judgmentZone = null;
  player.actionZone = [];
  // freePlayNextTurn persists across rounds (consumed in resolveHandCost)
  // player.freePlayNextTurn = false;  ← 不移除，由天魔解体设置并在下一回合首卡消耗
  player.roundCardsPlayed = 0;
  player.hasDrawnFirstFlaw = false;
  player.cardsPlayedThisTurn = [];
  player.cardsMovedThisTurn = false;
  player.roundFlaws = 0;
  player.hasUsedPassiveThisRound = false;
  player._actionDepth = 0;
  player._skillfulDiscount = false;

  // 重算内力
  player.baseInnerPower = player.dantian.reduce(function(s, c) {
    var ip = c._data.innerPower || 0;
    // 隐堂基础内功：引爆后+1
    if (c._innerBoosted) ip += 1;
    return s + ip;
  }, 0);

  // 纯阳心法诀：丹田≥2时内力≥6
  for (var di = 0; di < player.dantian.length; di++) {
    var dc = player.dantian[di];
    if (dc.effectType === 'dantianInnerBonus' && player.dantian.length >= (dc._data.dantianThreshold || 2)) {
      player.baseInnerPower = Math.max(player.baseInnerPower, dc._data.innerThreshold || 6);
      break;
    }
  }

  // 餐风饮露功：丹田中每有1张，弃牌堆每2张+1内力（多副本各自触发）
  for (var fi = 0; fi < player.dantian.length; fi++) {
    if (player.dantian[fi].effectType === 'discardInnerBonus') {
      player.baseInnerPower += Math.floor(player.discardPile.length / 2);
    }
  }

  // 修罗饮血功：自身因技能效果获得破绽时，每张牌提供的内力永久+1
  for (var j = 0; j < player.dantian.length; j++) {
    if (player.dantian[j].effectType === 'selfFlawGivesInner') {
      player.baseInnerPower += (player._selfInflictedFlaws || 0);
    }
  }

  // 魔门基础心法在弃牌堆仍提供内力
  for (var j = 0; j < player.discardPile.length; j++) {
    if (player.discardPile[j].effectType === 'persistInDiscard') {
      player.baseInnerPower += (player.discardPile[j]._data.innerPower || 0);
    }
  }
  player.innerPower = Math.max(0, player.baseInnerPower);
  player.totalPower = 0;
}

function preparationPhase(p1, p2, state, engine) {
  state.phase = 'preparation';
  // 剧毒功：回合开始毒素不清除（已移除，不再保留）
  // 毒素自然保留到下次结算

  // 阳光普照：HP=1 时触发
  checkSunshine(p1, state);
  checkSunshine(p2, state);

  p1.judgmentZone = engine.ai1.chooseJudgmentCard(p1, p2, state);
  p2.judgmentZone = engine.ai2.chooseJudgmentCard(p2, p1, state);
  if (p1.judgmentZone) removeFromHand(p1, p1.judgmentZone);
  if (p2.judgmentZone) removeFromHand(p2, p2.judgmentZone);
  state.log.push('P1 暗盖1张 / P2 暗盖1张');
}

function checkSunshine(player, state) {
  if (player.hasTriggeredSunshine) return;
  if (player.hp !== 1) return;
  for (var i = 0; i < player.extraDeck.length; i++) {
    if (player.extraDeck[i].effectType === 'lowHpSearch') {
      // Pick the best card from remaining extra deck
      var best = null;
      for (var j = 0; j < player.extraDeck.length; j++) {
        if (player.extraDeck[j].id !== player.extraDeck[i].id) {
          if (!best || (player.extraDeck[j]._data.power || 0) > (best._data.power || 0)) {
            best = player.extraDeck[j];
          }
        }
      }
      if (best) {
        player.hand.push(cloneCard(best));
        player.hasTriggeredSunshine = true;
        state.log.push('P' + player.id + ' 阳光普照：HP=1，从额外卡组挑选《' + best._data.name + '》');
      }
      return;
    }
  }
}

function judgmentPhase(p1, p2, state, engine) {
  state.phase = 'judgment';
  if (!p1.judgmentZone || !p2.judgmentZone) {
    if (!p1.judgmentZone && !p2.judgmentZone) return;
    var def = !p1.judgmentZone ? p1 : p2;
    state.log.push('P' + def.id + ' 无牌暗盖，直接劣势');
    gs.gainFlaw(def, 1, state);
    return;
  }

  cr.runJudgment(p1, p2, state);

  // 武当太极剑意：AI决策是否碰瓷（非自动触发）
  for (var side = 0; side < 2; side++) {
    var wdPlayer = side === 0 ? p1 : p2;
    var oppPlayer = side === 0 ? p2 : p1;
    if (wdPlayer.character.passives &&
        wdPlayer.character.passives.some(function(p) { return p.type === 'taichiSwordIntent'; }) &&
        !wdPlayer.hasUsedPassiveThisRound &&
        wdPlayer._ai && wdPlayer._ai.shouldTriggerTaichi &&
        wdPlayer.judgmentZone && wdPlayer.judgmentZone._data.type === 'xinfa') {

      if (!wdPlayer._ai.shouldTriggerTaichi(wdPlayer, oppPlayer, state)) {
        continue;
      }

      var myJzPower = wdPlayer.judgmentZone._effectivePower !== undefined ?
                      wdPlayer.judgmentZone._effectivePower :
                      (wdPlayer.judgmentZone._data.power || 0);
      var oppJzPower = oppPlayer.judgmentZone._effectivePower !== undefined ?
                       oppPlayer.judgmentZone._effectivePower :
                       (oppPlayer.judgmentZone._data.power || 0);

      if (myJzPower < oppJzPower) {
        wdPlayer.hasUsedPassiveThisRound = true;
        state.log.push('P' + wdPlayer.id + ' 太极剑意：心法碰瓷(' + myJzPower + '<' + oppJzPower + ')，心法进丹田');

        // 心法进丹田（不消耗内力，因为是暗盖阶段被移入）
        var xinfaCard = wdPlayer.judgmentZone;
        wdPlayer.dantian.push(xinfaCard);
        var ip = xinfaCard._data.innerPower || 0;
        wdPlayer.baseInnerPower += ip;
        wdPlayer.innerPower += ip;
        wdPlayer.judgmentZone = null;

        // 两仪桩功 → 触发移动效果
        if (xinfaCard.effectType === 'moveCostReducer' && !wdPlayer.cardsMovedThisTurn) {
          triggerLiangyi(wdPlayer, state);
        }
        // 通用：心法非打出进丹田事件（未来太极剑意/卡牌转移等均走此路径）
        onXinfaNonPlayEntry(wdPlayer, xinfaCard, state);

        // 必须消耗内力打一张武技代替
        var wujiHand = wdPlayer.hand.filter(function(c) { return c._data.type === 'wuji'; });
        if (wujiHand.length > 0) {
          var skillfulCards = wujiHand.filter(function(c) { return c._data.element === 'skillful'; });
          var pool = (skillfulCards.length > 0 && wdPlayer._skillfulDiscount) ? skillfulCards : wujiHand;
          var chosen = pool.reduce(function(a, b) {
            var costA = a._data.cost || 0;
            var costB = b._data.cost || 0;
            if (wdPlayer._skillfulDiscount && a._data.element === 'skillful') costA--;
            if (wdPlayer._skillfulDiscount && b._data.element === 'skillful') costB--;
            return Math.max(0, costA) < Math.max(0, costB) ? a : b;
          });
          wdPlayer.judgmentZone = chosen;
          removeFromHand(wdPlayer, chosen);
          var cost = chosen._data.cost || 0;
          if (wdPlayer._skillfulDiscount && chosen._data.element === 'skillful') {
            cost = Math.max(0, cost - 1);
            wdPlayer._skillfulDiscount = false;
          }
          wdPlayer.innerPower = Math.max(0, wdPlayer.innerPower - cost);
          state.log.push('P' + wdPlayer.id + ' 打出武技《' + chosen._data.name + '》代替进判定区，重新判定');

          cr.runJudgment(p1, p2, state);
        }
        break; // 只触发一次（太极剑意每回合1次）
      }
    }
  }

  // 确定劣势方（不再免破绽，正常流程）
  cr.calcTotalPower(p1, state);
  cr.calcTotalPower(p2, state);
  var disadvantaged = cr.determineDisadvantaged(p1, p2);
  state.log.push('劣势方: P' + disadvantaged.id);

  // 首次成为劣势方抽1
  if (!disadvantaged.hasDrawnFirstFlaw) {
    disadvantaged.hasDrawnFirstFlaw = true;
    gs.drawCards(disadvantaged, 1, state);
    state.log.push('P' + disadvantaged.id + ' 首次劣势，抽1张');
  }
}

function actionPhase(p1, p2, state, engine) {
  var swaps = 0;

  while (!state.isGameOver && swaps < CONST.maxReversalsPerRound) {
    state.phase = 'action';
    cr.calcTotalPower(p1, state);
    cr.calcTotalPower(p2, state);

    var disadvantaged = p1.totalPower < p2.totalPower ? p1 :
                        p2.totalPower < p1.totalPower ? p2 :
                        p1.flaws === p2.flaws ? (Math.random() < 0.5 ? p1 : p2) :
                        p1.flaws > p2.flaws ? p1 : p2;
    var advantaged = disadvantaged === p1 ? p2 : p1;
    var ai = disadvantaged === p1 ? engine.ai1 : engine.ai2;

    var result = ai.takeAction(disadvantaged, advantaged, state);

    if (result === 'surrender' || result === 'no_action') {
      state.log.push('P' + disadvantaged.id + ' 宣告放弃出牌');

      // ═══ 震伤：对手因战力低获破绽 → 有震伤牌的一方弃对方1张 ═══
      triggerZhenShang(advantaged, disadvantaged, state);

      // 命中效果
      triggerHitEffects(advantaged, disadvantaged, state);

      // 含沙射影
      triggerHanSha(disadvantaged, advantaged, state);

      // 纯阳无极剑：因本卡造成破绽 → 回血
      triggerFlawHeal(advantaged, disadvantaged, state);

      gs.gainFlaw(disadvantaged, 1, state);
      break;
    }

    if (result === 'caught_up') {
      swaps++;
      state.log.push('反转! P' + disadvantaged.id + ' 追平/反超（第' + swaps + '次反转）');
      var newDisadvantaged = disadvantaged === p1 ? p2 : p1;
      if (!newDisadvantaged.hasDrawnFirstFlaw) {
        newDisadvantaged.hasDrawnFirstFlaw = true;
        gs.drawCards(newDisadvantaged, 1, state);
      }
      continue;
    }

    // 继续出牌（同劣势方，不切换）
    continue;
  }
}

// ═══ 震伤：对手因战力低获破绽瞬间触发 ═══
function triggerZhenShang(advantaged, disadvantaged, state) {
  var hasZhengShang = false;
  for (var i = 0; i < advantaged.actionZone.length; i++) {
    if (advantaged.actionZone[i].effectType === 'zhengshang') {
      hasZhengShang = true;
      break;
    }
  }
  if (!hasZhengShang) return;

  var discardCount = 1;

  // 血战到底：主动拿破绽升级
  if (advantaged._bloodWarfareUsed && advantaged._bloodWarfareMode === 'discardUp') {
    discardCount = 2;
  }
  // 魔刀·泣血：HP低于敌方 → 弃2
  for (var j = 0; j < advantaged.actionZone.length; j++) {
    var c = advantaged.actionZone[j];
    if (c.effectType === 'zhengshang' && c._data.lowHpZhengshangBuff && advantaged.hp < disadvantaged.hp) {
      discardCount = 2;
      break;
    }
  }

  for (var k = 0; k < discardCount; k++) {
    if (disadvantaged.hand.length > 0) {
      var idx = Math.floor(Math.random() * disadvantaged.hand.length);
      var discarded = disadvantaged.hand.splice(idx, 1)[0];
      disadvantaged.discardPile.push(discarded);
      state.log.push('震伤: P' + disadvantaged.id + ' 被迫弃1张手牌');
    }
  }

  // 修罗化血阵：打出震伤牌 → 对方-1内力
  for (var l = 0; l < advantaged.dantian.length; l++) {
    if (advantaged.dantian[l].effectType === 'zhengshangDrain') {
      disadvantaged.innerPower = Math.max(0, disadvantaged.innerPower - 1);
      state.log.push('修罗化血阵：P' + disadvantaged.id + ' 失去1内力');
      break;
    }
  }
}

function triggerHitEffects(advantaged, disadvantaged, state) {
  var hitCards = [];
  for (var i = 0; i < advantaged.actionZone.length; i++) {
    if (advantaged.actionZone[i]._data.hasHit) hitCards.push(advantaged.actionZone[i]);
  }
  if (advantaged.judgmentZone && advantaged.judgmentZone._data.hasHit) {
    hitCards.push(advantaged.judgmentZone);
  }

  for (var j = 0; j < hitCards.length; j++) {
    disadvantaged.poisonStacks += 1;
    state.log.push('命中: P' + disadvantaged.id + ' 获得1层[淬毒]（当前' + disadvantaged.poisonStacks + '）');

    // 阎王帖：抽1
    if (hitCards[j]._data.effectType === 'hitDrawAndPoison') {
      gs.drawCards(advantaged, 1, state);
    }
  }
}

function triggerHanSha(disadvantaged, advantaged, state) {
  // 劣势方的含沙射影判定区 → 判低时给毒
  if (disadvantaged.judgmentZone && disadvantaged.judgmentZone.effectType === 'judgmentLossPoison') {
    advantaged.poisonStacks += 1;
    state.log.push('含沙射影: P' + advantaged.id + ' 获得1层[淬毒]（当前' + advantaged.poisonStacks + '）');
  }
}

function triggerFlawHeal(advantaged, disadvantaged, state) {
  for (var i = 0; i < advantaged.actionZone.length; i++) {
    if (advantaged.actionZone[i].effectType === 'flawHeal' && advantaged.hp < advantaged.maxHp) {
      advantaged.hp++;
      state.log.push('纯阳无极剑: P' + advantaged.id + ' 回1血（HP=' + advantaged.hp + '）');
      break;
    }
  }
  if (advantaged.judgmentZone && advantaged.judgmentZone.effectType === 'flawHeal' && advantaged.hp < advantaged.maxHp) {
    advantaged.hp++;
    state.log.push('纯阳无极剑: P' + advantaged.id + ' 回1血（HP=' + advantaged.hp + '）');
  }
}

function triggerLiangyi(player, state) {
  // 两仪桩功：移动时手牌中随机1张武技-2费（标记，下回合生效）
  var wujiHand = player.hand.filter(function(c) { return c._data.type === 'wuji'; });
  if (wujiHand.length > 0) {
    var target = wujiHand[Math.floor(Math.random() * wujiHand.length)];
    target._liangyiDiscount = true;
    state.log.push('P' + player.id + ' 两仪桩功：手牌1张武技-2费');
  }
}

// 心法非打出进丹田通用事件（太极剑意碰瓷 / 未来各种转移手段均走此路径）
function onXinfaNonPlayEntry(player, xinfaCard, state) {
  if (xinfaCard.effectType === 'altEntryDantianDraw') {
    gs.drawCards(player, 1, state);
    player._skillfulDiscount = true;
    state.log.push('P' + player.id + ' 武当基础心法非打出进丹田，抽1，巧系武技-1费');
  }
  // 未来扩展: 其他非打出进丹田效果在此添加
}

function resolutionPhase(p1, p2, state) {
  state.phase = 'resolution';

  cr.calcTotalPower(p1, state);
  cr.calcTotalPower(p2, state);
  var advantaged = p1.totalPower > p2.totalPower ? p1 : p2;
  var disadvantaged = advantaged === p1 ? p2 : p1;

  // 淬毒爆发
  resolvePoisonBurst(p1, p2, state);

  if (state.isGameOver) return;

  // 清空区域（血滴子进弃牌堆给毒）
  clearZones(p1, state);
  clearZones(p2, state);

  if (state.isGameOver) return;

  // 弃牌抽牌
  gs.drawCards(disadvantaged, 1, state);
  gs.drawCards(advantaged, 2, state);
  state.log.push('结算: P' + disadvantaged.id + '(劣)抽1, P' + advantaged.id + '(优)抽2');
}

function resolvePoisonBurst(p1, p2, state) {
  // 夜修罗被动：毒发
  var yeshura = p1.character.id === 'yeshura' ? p1 : p2.character.id === 'yeshura' ? p2 : null;
  if (!yeshura) return;

  var opponent = yeshura.id === p1.id ? p2 : p1;
  var threshold = CONST.poisonThreshold;

  // 万蛊噬心：阈值-1
  for (var i = 0; i < yeshura.dantian.length; i++) {
    if (yeshura.dantian[i].effectType === 'lowerPoisonThreshold') {
      threshold += (yeshura.dantian[i]._data.poisonThresholdOffset || -1);
    }
  }

  // 每回合最多1次
  if (opponent.poisonStacks >= threshold && threshold > 0) {
    opponent.poisonStacks -= threshold;
    opponent.hp--;
    state.log.push('淬毒爆发: P' + opponent.id + ' 毒素满' + threshold + '层，失去1HP（剩余' + opponent.hp + '）');
    gs.drawCards(opponent, 2, state);

    // 毒发后：隐堂基础内功永久+1
    for (var j = 0; j < yeshura.dantian.length; j++) {
      if (yeshura.dantian[j].effectType === 'poisonBurstInnerUp' && !yeshura.dantian[j]._innerBoosted) {
        yeshura.dantian[j]._innerBoosted = true;
        state.log.push('P' + yeshura.id + ' 隐堂基础内功：引爆后内力+1');
      }
    }

    if (opponent.hp <= 0) {
      state.isGameOver = true;
      state.winner = opponent.id === 1 ? 2 : 1;
      return;
    }
  }
}

function clearZones(player, state) {
  var opponent = player.id === 1 ? state.players[1] : state.players[0];

  if (player.judgmentZone) {
    checkXueDiZi(player.judgmentZone, opponent, state);
    player.discardPile.push(player.judgmentZone);
  }

  for (var i = 0; i < player.actionZone.length; i++) {
    checkXueDiZi(player.actionZone[i], opponent, state);
    // 鬼影迷踪：劣势时打出，返回手牌（引擎独立校验劣势状态）
    if (player.actionZone[i].effectType === 'disadvantagedDrawAndReturn') {
      cr.calcTotalPower(player, state);
      cr.calcTotalPower(opponent, state);
      if (player.actionZone[i]._returnToHand && player.totalPower < opponent.totalPower) {
        player.hand.push(player.actionZone[i]);
        continue;
      }
    }
    player.discardPile.push(player.actionZone[i]);
  }

  player.judgmentZone = null;
  player.actionZone = [];
}

function checkXueDiZi(card, opponent, state) {
  if (card.effectType === 'enterDiscardPoison') {
    opponent.poisonStacks += 1;
    state.log.push('血滴子: P' + opponent.id + ' 获得1层[淬毒]（当前' + opponent.poisonStacks + '）');
  }
}

function removeFromHand(player, card) {
  var idx = player.hand.indexOf(card);
  if (idx >= 0) player.hand.splice(idx, 1);
}

function endGame(state, winner) {
  state.isGameOver = true;
  state.winner = winner.id;
}

function cloneCard(card) {
  return {
    id: card.id, _data: card._data, name: card._data.name,
    type: card._data.type, element: card._data.element,
    cost: card._data.cost, power: card._data.power,
    innerPower: card._data.innerPower || 0,
    tags: card._data.tags || [],
    isExtra: true, effectType: card._data.effectType || null
  };
}

module.exports = GameEngine;
