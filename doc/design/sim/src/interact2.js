#!/usr/bin/env node
// 交互式对战 v2 —— 使用引擎函数精确复刻游戏循环
// 用法: node interact2.js init | choice <n> | pass | status
var fs = require('fs');
var path = require('path');
var gs = require('./engine/gameState');
var cr = require('./engine/combatResolver');
var aiModule = require('./engine/ai');
var CONST = require('./data/constants.json');

var ST = path.join(__dirname, 'interact2-state.json');
var DC = path.join(__dirname, 'interact2-decision.json');
var HP_IDX = 0;

// ── helper ──
function cardStr(c) {
  if (!c) return '(none)';
  var d = c._data;
  return d.name + ' ' + (d.type==='xinfa'?'X':'W') + '/' + (d.element||'') +
    ' C' + (d.cost||0) + ' P' + (d.power||0) + (d.innerPower?' I'+d.innerPower:'') +
    (d.effectType?' ['+d.effectType+']':'');
}
function show(s) {
  var hp = s.players[HP_IDX], ap = s.players[1-HP_IDX];
  console.log('\n== Round ' + s.round + ' | ' + s.phase + ' ==');
  console.log('You('+hp.character.name+') HP='+hp.hp+' Inner='+hp.innerPower+' Flaw='+hp.flaws+ (hp._flawShield>0?' Sh:'+hp._flawShield:'') +' Poison='+(hp.poisonStacks||0)+' Hand='+hp.hand.length);
  console.log('AI('+ap.character.name+') HP='+ap.hp+' Inner='+ap.innerPower+' Flaw='+ap.flaws+ (ap._flawShield>0?' Sh:'+ap._flawShield:'') +' Poison='+(ap.poisonStacks||0)+' Hand='+ap.hand.length);
  if (hp.judgmentZone) console.log('Your JZ: ' + cardStr(hp.judgmentZone));
  if (ap.judgmentZone) console.log('AI JZ: ' + cardStr(ap.judgmentZone));
  console.log('Your AZ: ' + (hp.actionZone.length?hp.actionZone.map(cardStr).join(' | '):'(empty)'));
  console.log('AI AZ: ' + (ap.actionZone.length?ap.actionZone.map(cardStr).join(' | '):'(empty)'));
  console.log('Your DT('+hp.dantian.length+'): '+(hp.dantian.length?hp.dantian.map(cardStr).join(' | '):'(empty)'));
  console.log('AI DT('+ap.dantian.length+'): '+(ap.dantian.length?ap.dantian.map(cardStr).join(' | '):'(empty)'));
  console.log('Your DP('+hp.discardPile.length+'): '+(hp.discardPile.length?hp.discardPile.map(function(c){return c._data.name}).join(', '):'(empty)'));
  console.log('AI DP('+ap.discardPile.length+'): '+(ap.discardPile.length?ap.discardPile.map(function(c){return c._data.name}).join(', '):'(empty)'));
  console.log('\n-- Your Hand ('+hp.hand.length+') --');
  hp.hand.forEach(function(c,i){ console.log('  ['+i+'] '+cardStr(c)); });
  console.log('--');
}

// ── 状态 ──
function saveState(state) {
  var s = {};
  ['round','phase','isGameOver','winner','log'].forEach(function(k){s[k]=state[k];});
  s.p1 = snapP(state.players[0]); s.p2 = snapP(state.players[1]);
  fs.writeFileSync(ST, JSON.stringify(s,null,2), 'utf8');
}
function snapP(p) {
  return {
    hp:p.hp,innerPower:p.innerPower,baseInnerPower:p.baseInnerPower,
    flaws:p.flaws,_flawShield:p._flawShield||0,poisonStacks:p.poisonStacks||0,
    hasDrawnFirstFlaw:p.hasDrawnFirstFlaw||false,roundCardsPlayed:p.roundCardsPlayed||0,
    hasUsedPassiveThisRound:p.hasUsedPassiveThisRound||false,
    _bloodWarfareUsed:p._bloodWarfareUsed||false,_bloodWarfareMode:p._bloodWarfareMode||null,
    hasTriggeredSunshine:p.hasTriggeredSunshine||false,_skillfulDiscount:p._skillfulDiscount||false,
    roundFlaws:p.roundFlaws||0,_actionDepth:p._actionDepth||0,cardsMovedThisTurn:p.cardsMovedThisTurn||false,
    hand:p.hand,dantian:p.dantian,discardPile:p.discardPile,extraDeck:p.extraDeck,
    actionZone:p.actionZone||[],judgmentZone:p.judgmentZone||null,
    freePlayDiscount:p.freePlayDiscount||0,freePlayNextTurn:p.freePlayNextTurn||false,
    _moveDiscountUsed:p._moveDiscountUsed||false,totalPower:p.totalPower||0,
    _deck:p._deck,_cardsPlayedThisTurn:p._cardsPlayedThisTurn||[]
  };
}
function restorePlayer(p, s) {
  ['hp','innerPower','baseInnerPower','flaws','_flawShield','poisonStacks',
   'hasDrawnFirstFlaw','roundCardsPlayed','hasUsedPassiveThisRound',
   '_bloodWarfareUsed','_bloodWarfareMode','hasTriggeredSunshine',
   '_skillfulDiscount','roundFlaws','_actionDepth','cardsMovedThisTurn',
   'hand','dantian','discardPile','extraDeck','actionZone','judgmentZone',
   'freePlayDiscount','freePlayNextTurn','_moveDiscountUsed','totalPower',
   '_deck','_cardsPlayedThisTurn'
  ].forEach(function(k){p[k]=s[k];});
}

function loadState() {
  var snap = JSON.parse(fs.readFileSync(ST,'utf8'));
  var chars = JSON.parse(fs.readFileSync(path.join(__dirname,'data','characters.json'),'utf8'));
  var decks = JSON.parse(fs.readFileSync(path.join(__dirname,'data','decks.json'),'utf8'));
  var ai1 = new aiModule.BaseAI('modeng','wudang');
  var ai2 = new aiModule.BaseAI('wudang','modeng');
  var state = gs.createGameState(decks.modeng_xuedao, decks.wudang_wuji, chars.xuedao, chars.wuji);
  state.players[0]._ai = ai1; state.players[1]._ai = ai2;
  state.round = snap.round; state.phase = snap.phase;
  state.isGameOver = snap.isGameOver; state.winner = snap.winner; state.log = snap.log;
  restorePlayer(state.players[0], snap.p1); restorePlayer(state.players[1], snap.p2);
  return state;
}

// ── 游戏循环 (手动版, 和引擎完全一致) ──
function resetRound(p) {
  // 聚气诀-delayedDantian
  for (var i=p.actionZone.length-1; i>=0; i--) {
    if (p.actionZone[i].effectType === 'delayedDantian') {
      var card = p.actionZone.splice(i,1)[0];
      p.dantian.push(card); p.baseInnerPower+=(card._data.innerPower||0);
    }
  }
  p.judgmentZone=null; p.actionZone=[]; p.roundCardsPlayed=0;
  p.hasDrawnFirstFlaw=false; p._cardsPlayedThisTurn=[]; p.cardsMovedThisTurn=false;
  p.roundFlaws=0; p.hasUsedPassiveThisRound=false; p._actionDepth=0; p._skillfulDiscount=false;

  // 内力重算
  p.baseInnerPower = p.dantian.reduce(function(s,c){return s+(c._innerBoosted?1:0)+(c._data.innerPower||0);},0);
  for (var i=0;i<p.dantian.length;i++) {
    var dc=p.dantian[i];
    if (dc.effectType==='dantianInnerBonus' && p.dantian.length>=(dc._data.dantianThreshold||2))
      p.baseInnerPower = Math.max(p.baseInnerPower, dc._data.innerThreshold||6);
  }
  for (var i=0;i<p.dantian.length;i++)
    if(p.dantian[i].effectType==='discardInnerBonus') p.baseInnerPower+=Math.floor(p.discardPile.length/2);
  for (var i=0;i<p.dantian.length;i++)
    if(p.dantian[i].effectType==='selfFlawGivesInner') p.baseInnerPower+=p.flaws;
  for (var i=0;i<p.discardPile.length;i++)
    if(p.discardPile[i].effectType==='persistInDiscard') p.baseInnerPower+=(p.discardPile[i]._data.innerPower||0);
  p.innerPower=p.baseInnerPower; p.totalPower=0;
}

function checkSunshine(p, state) {
  if (p.hasTriggeredSunshine || p.hp!==1) return;
  for (var i=0;i<p.extraDeck.length;i++) {
    if (p.extraDeck[i].effectType==='lowHpSearch') {
      var best=null;
      for (var j=0;j<p.extraDeck.length;j++) {
        if (p.extraDeck[j]!==p.extraDeck[i])
          if(!best||(p.extraDeck[j]._data.power||0)>(best._data.power||0)) best=p.extraDeck[j];
      }
      if(best){p.hand.push(best);p.hasTriggeredSunshine=true;
        state.log.push('P'+p.id+' Sunshine: HP=1, fetch '+best._data.name);}
      return;
    }
  }
}

function removeFromHand(p, card) {
  var idx = p.hand.indexOf(card);
  if (idx>=0) p.hand.splice(idx,1);
}

// ═══ 判定阶段（含太极剑意） ═══
function judgmentPhase(hp, ap, state) {
  state.phase = 'judgment';
  if (!hp.judgmentZone || !ap.judgmentZone) {
    var def = !hp.judgmentZone ? hp : ap;
    if (hp.judgmentZone || ap.judgmentZone) {
      state.log.push('P'+def.id+' no JZ card, directly disadvantaged');
      gs.gainFlaw(def, 1, state);
    }
    return;
  }
  cr.runJudgment(hp, ap, state);

  // 太极剑意
  if (!ap.hasUsedPassiveThisRound && ap.judgmentZone && ap.judgmentZone._data.type==='xinfa') {
    if (ap._ai.shouldTriggerTaichi(ap, hp, state)) {
      var myP = ap.judgmentZone._effectivePower!==undefined?ap.judgmentZone._effectivePower:(ap.judgmentZone._data.power||0);
      var opP = hp.judgmentZone._effectivePower!==undefined?hp.judgmentZone._effectivePower:(hp.judgmentZone._data.power||0);
      if (myP < opP) {
        ap.hasUsedPassiveThisRound=true;
        var xinfa = ap.judgmentZone;
        ap.dantian.push(xinfa);
        ap.baseInnerPower+=(xinfa._data.innerPower||0);
        ap.innerPower+=(xinfa._data.innerPower||0);
        ap.judgmentZone=null;
        state.log.push('Taichi Intent: AI moves xinfa to dantian');
        // 武当基础心法
        if (xinfa.effectType==='altEntryDantianDraw') gs.drawCards(ap,1,state);
        // 打出武技
        var wH = ap.hand.filter(function(c){return c._data.type==='wuji';});
        if (wH.length>0) {
          var ch = wH.reduce(function(a,b){return (a._data.cost||0)<(b._data.cost||0)?a:b;});
          ap.judgmentZone=ch; removeFromHand(ap,ch);
          ap.innerPower=Math.max(0,ap.innerPower-(ch._data.cost||0));
          state.log.push('AI plays '+ch._data.name+' as replacement');
          cr.runJudgment(hp, ap, state);
        }
      }
    }
  }
  cr.calcTotalPower(hp, state);
  cr.calcTotalPower(ap, state);
  var dis = cr.determineDisadvantaged(hp, ap);
  state.log.push('Disadvantaged: '+(dis===hp?'You':'AI'));
  if (!dis.hasDrawnFirstFlaw) {
    dis.hasDrawnFirstFlaw=true;
    gs.drawCards(dis,1,state);
  }
}

// ═══ 行动阶段（人类/AI交替出牌） ═══
function actionPhase(hp, ap, state) {
  state.phase = 'action';
  cr.calcTotalPower(hp, state);
  cr.calcTotalPower(ap, state);
  var dis = cr.determineDisadvantaged(hp, ap);

  if (dis === hp) {
    // 人类劣势 → 暂停
    saveState(state);
    show(state);
    console.log('\nYou are DISADVANTAGED. Play [0-'+(hp.hand.length-1)+'] or pass:');
    console.log('>>> node interact2.js choice <n> | pass');
    return 'pause';
  } else {
    // AI劣势
    var result = ap._ai.takeAction(ap, hp, state);
    if (result==='surrender'||result==='no_action') {
      state.log.push('AI stops playing');
      // 震伤（血战到底discardUp → 弃2）
      if (hp.actionZone.some(function(c){return c.effectType==='zhengshang';})) {
        var dCount = 1;
        if (hp._bloodWarfareUsed && hp._bloodWarfareMode === 'discardUp') { dCount = 2; hp._bloodWarfareUsed = false; state.log.push('BloodWarfare: discard 2 instead of 1'); }
        if (ap.hand.length>0) {
          for (var di = 0; di < dCount && ap.hand.length > 0; di++) {
            var idx=Math.floor(Math.random()*ap.hand.length);
            var d=ap.hand.splice(idx,1)[0]; ap.discardPile.push(d);
          }
          state.log.push('Zhengshang: AI discards '+dCount);
        }
      }
      gs.gainFlaw(ap,1,state);
      return 'surrender';
    } else if (result==='caught_up') {
      state.log.push('Reversal! AI caught up');
      return 'continue';
    }
    return 'continue';
  }
}

// ── 人类出牌（使用AI的executePlay，保证心法进丹田+全部效果） ──
function humanPlayCard(hp, ap, state, idx) {
  var card = hp.hand[idx];
  var effCost = card._effCost !== undefined ? card._effCost : (card._data.cost || 0);

  // 血战到底 costDown: next zhengshang card cost -2
  if (hp._bloodWarfareUsed && hp._bloodWarfareMode === 'costDown' && card.effectType === 'zhengshang') {
    effCost = Math.max(0, effCost - 2);
    state.log.push('BloodWarfare: zhengshang cost '+effCost+' (was '+(card._data.cost||0)+')');
    hp._bloodWarfareUsed = false;
  }
  hp.innerPower -= effCost;
  hp.roundCardsPlayed = (hp.roundCardsPlayed || 0) + 1;
  hp.hand.splice(idx, 1);

  if (card._data.type === 'xinfa') {
    if (card._data.effectType === 'delayedDantian') {
      if (hp.flaws > 0) {
        hp.dantian.push(card);
        hp.baseInnerPower += (card._data.innerPower || 0);
        hp.innerPower += (card._data.innerPower || 0);
        state.log.push('You play '+card._data.name+' (has flaw -> inner +'+card._data.innerPower+')');
      } else {
        hp.actionZone.push(card);
        card._delayedDantian = true;
        state.log.push('You play '+card._data.name+' (delayed dantian next round)');
      }
    } else {
      hp.dantian.push(card);
      hp.baseInnerPower += (card._data.innerPower || 0);
      hp.innerPower += (card._data.innerPower || 0);
      state.log.push('You play xinfa '+card._data.name+' -> dantian (+'+card._data.innerPower+' inner)');
    }
    if (card._data.effectType === 'drawOnPlay') {
      gs.drawCards(hp, card._data.drawOnPlayCount || 1, state);
    }
  } else {
    hp.actionZone.push(card);
    state.log.push('You play wuji '+card._data.name+' (cost '+effCost+')');
    // wuji effects
    if (card._data.effectType === 'discardReturn' && hp.discardPile.length > 0) {
      var best = hp.discardPile.reduce(function(a,b){return (a._data.power||0)>(b._data.power||0)?a:b;});
      var bIdx = hp.discardPile.indexOf(best);
      if (bIdx >= 0) { hp.hand.push(hp.discardPile.splice(bIdx,1)[0]); state.log.push('Recall '+best._data.name); }
    }
    if (card._data.effectType === 'chaizhao_killDantian') {
      var kc = card._data.dantianKillCount || 2;
      var killed = gs.destroyDantianCards(ap, kc, state);
      state.log.push('Destroy '+killed+' dantian cards of AI');
    }
    if (card._data.effectType === 'flawDiscount' && card._data.flawDraw && hp.flaws > 0) {
      gs.drawCards(hp, card._data.flawDraw, state);
    }
  }
}

// ── 结算阶段 ──
function resolutionPhase(hp, ap, state) {
  state.phase = 'resolution';

  // 1. Recalculate to determine advantaged/disadvantaged
  cr.calcTotalPower(hp, state);
  cr.calcTotalPower(ap, state);
  var adv = hp.totalPower > ap.totalPower ? hp : ap;
  var dis = adv === hp ? ap : hp;

  // 2. Toxin burst (only for characters with poison mechanics, currently inactive)
  if (hp.poisonStacks >= 3) {
    var t = Math.floor(hp.poisonStacks / 3);
    hp.poisonStacks -= t * 3; hp.hp -= t;
    state.log.push('Toxin burst: You lose '+t+' HP');
    if (hp.hp <= 0) { state.isGameOver = true; state.winner = ap.id; return; }
  }
  if (ap.poisonStacks >= 3) {
    var t2 = Math.floor(ap.poisonStacks / 3);
    ap.poisonStacks -= t2 * 3; ap.hp -= t2;
    state.log.push('Toxin burst: AI loses '+t2+' HP');
    if (ap.hp <= 0) { state.isGameOver = true; state.winner = hp.id; return; }
  }

  // 3. Clear zones (血滴子 check + discard)
  [hp, ap].forEach(function(p, pi) {
    var opp = pi === 0 ? ap : hp;
    if (p.judgmentZone) {
      checkXueDiZi(p.judgmentZone, opp, state);
      p.discardPile.push(p.judgmentZone);
    }
    for (var i = 0; i < p.actionZone.length; i++) {
      checkXueDiZi(p.actionZone[i], opp, state);
      p.discardPile.push(p.actionZone[i]);
    }
    p.judgmentZone = null;
    p.actionZone = [];
    p.totalPower = 0;
  });

  if (state.isGameOver) return;

  // 4. End of round draw: disadvantaged 1, advantaged 2
  gs.drawCards(dis, 1, state);
  gs.drawCards(adv, 2, state);
  state.log.push('结算抽牌: ' + (dis===hp?'你(劣)':'AI(劣)') + '抽1, ' + (adv===hp?'你(优)':'AI(优)') + '抽2');
}

function checkXueDiZi(card, opponent, state) {
  if (card.effectType === 'enterDiscardPoison') {
    opponent.poisonStacks = (opponent.poisonStacks || 0) + 1;
    state.log.push('Blood Dripper: ' + (opponent.id===1?'You':'AI') + ' +1 Poison('+opponent.poisonStacks+')');
  }
}

// ── 主函数 ──
function runRound(state) {
  var hp = state.players[HP_IDX], ap = state.players[1-HP_IDX];
  state.round++;
  state.log.push('\n--- Round '+state.round+' ---');
  resetRound(hp); resetRound(ap);
  if (hp.hp<=0||ap.hp<=0) { endGame(state); return; }

  // 准备阶段
  state.phase='preparation';
  checkSunshine(hp,state); checkSunshine(ap,state);

  // 判定：AI先选
  ap.judgmentZone = ap._ai.chooseJudgmentCard(ap, hp, state);
  if (ap.judgmentZone) removeFromHand(ap, ap.judgmentZone);
  state.log.push('AI places 1 JZ card');

  // 暂停等待人类选判定牌
  state.phase = 'chooseJudgment';
  saveState(state);
  show(state);
  console.log('\nChoose judgment card [0-'+(hp.hand.length-1)+'] or pass:');
  console.log('>>> node interact2.js choice <n> | pass');
  return 'pause_judgment';
}

function continueRound(state, nextAction) {
  var hp = state.players[HP_IDX], ap = state.players[1-HP_IDX];

  if (state.phase === 'chooseJudgment') {
    // 人类判定牌
    if (nextAction >= 0 && nextAction < hp.hand.length) {
      var jc = hp.hand[nextAction];
      hp.judgmentZone = jc;
      removeFromHand(hp, jc);
      state.log.push('You place '+jc._data.name);
    }
    state.phase = 'judgment';
    judgmentPhase(hp, ap, state);
    if (state.isGameOver) { endGame(state); return; }

    // 行动阶段
    state.phase = 'action';
    saveState(state);
    var actResult = actionPhase(hp, ap, state);
    if (actResult === 'pause') return 'pause';
    // AI surrendered → resolve & next round
    resolutionPhase(hp, ap, state);
    if (hp.hp<=0||ap.hp<=0) { endGame(state); return; }
    saveState(state);
    return runRound(state);

  } else if (state.phase === 'action') {
    if (nextAction === -1) {
      // pass
      state.log.push('You pass');
      var hp2 = state.players[HP_IDX], ap2 = state.players[1-HP_IDX];
      if (ap2.actionZone.some(function(c){return c.effectType==='zhengshang';})) {
        if (hp2.hand.length>0) {
          var idx=Math.floor(Math.random()*hp2.hand.length);
          var d=hp2.hand.splice(idx,1)[0]; hp2.discardPile.push(d);
          state.log.push('Zhengshang: You discard 1');
        }
      }
      gs.gainFlaw(hp2, 1, state);
      // 结算
      resolutionPhase(hp2, ap2, state);
      if (hp2.hp<=0||ap2.hp<=0) { endGame(state); return; }
      saveState(state);
      return runRound(state);
    } else {
      // 出牌
      var hp2 = state.players[HP_IDX], ap2 = state.players[1-HP_IDX];
      humanPlayCard(hp2, ap2, state, nextAction);

      cr.calcTotalPower(hp2, state);
      cr.calcTotalPower(ap2, state);
      var dis2 = cr.determineDisadvantaged(hp2, ap2);

      if (hp2.totalPower >= ap2.totalPower) {
        state.log.push('Reversal! You caught up!');
        if (!ap2.hasDrawnFirstFlaw) { ap2.hasDrawnFirstFlaw=true; gs.drawCards(ap2,1,state); }
      }

      // 继续行动循环
      var result = actionPhase(hp2, ap2, state);
      if (result === 'surrender') {
        resolutionPhase(hp2, ap2, state);
        if (hp2.hp<=0||ap2.hp<=0) { endGame(state); return; }
        saveState(state);
        return runRound(state);
      }
      return result; // 'pause' or 'continue'
    }
  }
}

function endGame(state) {
  var hp = state.players[HP_IDX], ap = state.players[1-HP_IDX];
  state.isGameOver = true;
  state.winner = hp.hp>0 ? 1 : 2;
  state.log.push('\n=== Game Over ===');
  state.log.push('Winner: P'+state.winner);
  show(state);
  console.log('\n*** '+(state.winner===1?'YOU WIN!':'AI WINS!')+' ***');
}

// ── CLI ──
var CMD = process.argv[2];
var ARG = process.argv[3];

if (CMD === 'init') {
  var chars = JSON.parse(fs.readFileSync(path.join(__dirname,'data','characters.json'),'utf8'));
  var decks = JSON.parse(fs.readFileSync(path.join(__dirname,'data','decks.json'),'utf8'));
  var state = gs.createGameState(decks.modeng_xuedao, decks.wudang_wuji, chars.xuedao, chars.wuji);
  state.players[0]._ai = new aiModule.BaseAI('modeng','wudang');
  state.players[1]._ai = new aiModule.BaseAI('wudang','modeng');
  HP_IDX = 0;
  state.round = 0; state.log = [];
  state.log.push('=== Game Start ===');
  gs.drawCards(state.players[0], CONST.startingDraw, state);
  gs.drawCards(state.players[1], CONST.startingDraw, state);
  state.log.push('P1('+state.players[0].character.name+') HP='+state.players[0].hp+' | P2('+state.players[1].character.name+') HP='+state.players[1].hp);
  saveState(state);
  runRound(state);
} else if (CMD === 'status') {
  show(loadState());
} else if (CMD === 'choice') {
  var idx = parseInt(ARG);
  if (isNaN(idx) || idx < -1) { console.log('Bad index'); process.exit(1); }
  var state = loadState();
  var result = continueRound(state, idx);
  if (state.isGameOver) return;
  if (result === 'pause' || result === 'pause_judgment') {
    // 等待人类下一步 - 已 show
  } else {
    // 回合自动继续到下一阶段，re-display
    state = loadState();
    show(state);
    if (state.phase === 'action') {
      var hp = state.players[HP_IDX];
      console.log('\nYou are DISADVANTAGED. Play [0-'+(hp.hand.length-1)+'] or pass:');
      console.log('>>> node interact2.js choice <n> | pass');
    } else if (state.phase === 'chooseJudgment') {
      var hp = state.players[HP_IDX];
      console.log('\nChoose judgment card [0-'+(hp.hand.length-1)+'] or pass:');
      console.log('>>> node interact2.js choice <n> | pass');
    }
  }
} else if (CMD === 'pass') {
  var state = loadState();
  continueRound(state, -1);
} else if (CMD === 'bloodwarfare') {
  var state = loadState();
  var hp = state.players[HP_IDX];
  if (state.phase !== 'action') { console.log('BloodWarfare only in action phase'); process.exit(1); }
  if (hp.hasUsedPassiveThisRound) { console.log('Already used passive this round'); process.exit(1); }
  var mode = ARG === 'discard' ? 'discardUp' : 'costDown';
  hp.hasUsedPassiveThisRound = true;
  hp._bloodWarfareUsed = true;
  hp._bloodWarfareMode = mode;
  gs.gainFlaw(hp, 1, state);
  state.log.push('BloodWarfare: +1 flaw ('+hp.flaws+' total), mode=' + (mode==='costDown'?'cost-2':'discard+1'));
  saveState(state);
  show(state);
  console.log('\nBloodWarfare activated (' + (mode==='costDown'?'next zhengshang -2 cost':'next zhengshang discard +1') + '). Play [0-'+(hp.hand.length-1)+'] or pass:');
  console.log('>>> node interact2.js choice <n> | pass');
} else {
  console.log('Usage: node interact2.js init|choice <n>|pass|status|bloodwarfare [cost|discard]');
}
