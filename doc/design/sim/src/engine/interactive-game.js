// 浜や簰寮忓鎴樿剼鏈?鈥斺€?榄旀暀(浜? vs 姝﹀綋(AI)
var fs = require('fs');
var path = require('path');
var BASE = path.dirname(fs.realpathSync(__filename));
var DATA_DIR = path.join(BASE, '../data');
var STATE_PATH = path.join(BASE, '../interactive-state.json');
var gs = require(DATA_DIR + '/../engine/gameState.js');
var cr = require(DATA_DIR + '/../engine/combatResolver.js');
var CONST = require('../data/constants.json');
var { BaseAI } = require(DATA_DIR + '/../engine/ai.js');

var STATE_PATH = '../interactive-state.json';
var CMD = process.argv[2];
var ARG = process.argv[3];

// 鈹€鈹€ 宸ュ叿 鈹€鈹€
function cloneCard(c) {
  return JSON.parse(JSON.stringify(c));
}
function loadCards(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
function loadDeck(path) {
  var d = JSON.parse(fs.readFileSync(path, 'utf8'));
  return d;
}
function buildDeck(deckDef, cardsData) {
  var list = [];
  deckDef.mainDeck.forEach(function(entry) {
    var data = cardsData.find(function(c) { return c.id === entry.cardId; });
    for (var i = 0; i < entry.count; i++) list.push(cloneCard(data));
  });
  return list;
}
function cardSummary(c) {
  var cost = (c._data.cost !== undefined) ? '璐? + c._data.cost : '';
  var pwr = (c._data.power !== undefined) ? '鎴樺姏' + c._data.power : '';
  var ip = (c._data.innerPower !== undefined) ? '鍐? + c._data.innerPower : '';
  var el = c._data.element || '';
  var tp = c._data.type === 'xinfa' ? '蹇冩硶' : '姝︽妧';
  var ef = c.effectType ? ' [' + c.effectType + ']' : '';
  return c._data.name + ' ' + tp + '/' + el + ' ' + cost + ' ' + pwr + ' ' + ip + ef;
}

function showState(state, humanP) {
  var aiP = humanP === state.players[0] ? state.players[1] : state.players[0];
  console.log('\n鈺愨晲鈺?绗? + state.round + '鍥炲悎 鈺愨晲鈺?);
  console.log('闃舵: ' + state.phase);
  console.log('浣?' + humanP.name + ') HP=' + humanP.hp + ' 鍐呭姏=' + humanP.innerPower + ' 鐮寸唤=' + humanP.flaws + (humanP._flawShield>0?' 鐩?'+humanP._flawShield:'') + ' 娣瘨=' + (humanP.poisonStacks||0));
  console.log('AI(' + aiP.name + ') HP=' + aiP.hp + ' 鍐呭姏=' + aiP.innerPower + ' 鐮寸唤=' + aiP.flaws + (aiP._flawShield>0?' 鐩?'+aiP._flawShield:'') + ' 娣瘨=' + (aiP.poisonStacks||0));

  if (humanP.judgmentZone) console.log('浣犵殑鍒ゅ畾鍖? ' + cardSummary(humanP.judgmentZone));
  if (aiP.judgmentZone) console.log('AI鍒ゅ畾鍖? ' + cardSummary(aiP.judgmentZone));

  console.log('浣犵殑鍑虹墝鍖? ' + (humanP.actionZone.length ? humanP.actionZone.map(cardSummary).join(' | ') : '(绌?'));
  console.log('AI鍑虹墝鍖? ' + (aiP.actionZone.length ? aiP.actionZone.map(cardSummary).join(' | ') : '(绌?'));

  console.log('\n浣犵殑涓圭敯(' + humanP.dantian.length + '): ' + (humanP.dantian.length ? humanP.dantian.map(cardSummary).join(' | ') : '(绌?'));
  console.log('AI涓圭敯(' + aiP.dantian.length + '): ' + (aiP.dantian.length ? aiP.dantian.map(cardSummary).join(' | ') : '(绌?'));

  console.log('浣犵殑寮冪墝鍫?' + humanP.discardPile.length + '): ' + (humanP.discardPile.length ? humanP.discardPile.map(function(c){return c._data.name}).join(', ') : '(绌?'));
  console.log('AI寮冪墝鍫?' + aiP.discardPile.length + '): ' + (aiP.discardPile.length ? aiP.discardPile.map(function(c){return c._data.name}).join(', ') : '(绌?'));

  console.log('\n鈹€鈹€ 浣犵殑鎵嬬墝 (' + humanP.hand.length + '寮? 鈹€鈹€');
  humanP.hand.forEach(function(c, i) {
    console.log('  [' + i + '] ' + cardSummary(c));
  });
  console.log('鈹€鈹€');
}

// 鈹€鈹€ 灏佽娓告垙閫昏緫 鈹€鈹€
var GameState = {
  engine: null,
  state: null,
  humanP: null,
  aiP: null,
  pendingDecision: null,  // 'chooseJudgment' | 'takeAction' | null

  init: function() {
    var chars = loadCards(DATA_DIR + '/characters.json');
    var deckData = loadDeck(DATA_DIR + '/decks.json');
    var modengCards = loadCards(DATA_DIR + '/cards_modeng.json');
    var wudangCards = loadCards(DATA_DIR + '/cards_wudang.json');

    var humanDeck = buildDeck(deckData.modeng_xuedao, modengCards);
    var aiDeck = buildDeck(deckData.wudang_wuji, wudangCards);

    this.state = gs.createGameState(humanDeck, aiDeck, chars.xuedao, chars.wuji);
    var p1 = this.state.players[0];
    var p2 = this.state.players[1];
    p1._ai = new BaseAI('modeng', 'wudang');
    p2._ai = new BaseAI('wudang', 'modeng');
    this.humanP = p1;
    this.aiP = p2;

    gs.drawCards(this.humanP, CONST.startingDraw, this.state);
    gs.drawCards(this.aiP, CONST.startingDraw, this.state);
    this.state.log = [];
    this.state.log.push('=== 娓告垙寮€濮?===');
    this.state.log.push('P1(' + p1.name + ') HP=' + p1.hp + ' | P2(' + p2.name + ') HP=' + p2.hp);
    this.state.round = 0;
    this.state.phase = 'init';
    this.pendingDecision = null;

    this.save();
    this.startRound();
    showState(this.state, this.humanP);
  },

  save: function() {
    // 鍙繚瀛樺熀鏈姸鎬侊紝AI瀵硅薄涓嶄繚瀛?    var s = this.state;
    var p1 = s.players[0];
    var p2 = s.players[1];
    var snap = {
      round: s.round,
      phase: s.phase,
      isGameOver: s.isGameOver || false,
      winner: s.winner || null,
      log: s.log,
      p1: {
        hp: p1.hp, innerPower: p1.innerPower, baseInnerPower: p1.baseInnerPower,
        flaws: p1.flaws, _flawShield: p1._flawShield || 0,
        poisonStacks: p1.poisonStacks || 0,
        hasDrawnFirstFlaw: p1.hasDrawnFirstFlaw || false,
        roundCardsPlayed: p1.roundCardsPlayed || 0,
        hasUsedPassiveThisRound: p1.hasUsedPassiveThisRound || false,
        _bloodWarfareUsed: p1._bloodWarfareUsed || false,
        _bloodWarfareMode: p1._bloodWarfareMode || null,
        hasTriggeredSunshine: p1.hasTriggeredSunshine || false,
        _skillfulDiscount: p1._skillfulDiscount || false,
        roundFlaws: p1.roundFlaws || 0,
        _actionDepth: p1._actionDepth || 0,
        cardsMovedThisTurn: p1.cardsMovedThisTurn || false,
        hand: p1.hand,
        dantian: p1.dantian,
        discardPile: p1.discardPile,
        extraDeck: p1.extraDeck,
        actionZone: p1.actionZone || [],
        judgmentZone: p1.judgmentZone || null,
        freePlayDiscount: p1.freePlayDiscount || 0,
        freePlayNextTurn: p1.freePlayNextTurn || false,
        _moveDiscountUsed: p1._moveDiscountUsed || false,
        totalPower: p1.totalPower || 0,
        character: { id: p1.character.id, name: p1.character.name },
        _deck: p1._deck,
        _cardsPlayedThisTurn: p1.cardsPlayedThisTurn || [],
      },
      p2: {
        hp: p2.hp, innerPower: p2.innerPower, baseInnerPower: p2.baseInnerPower,
        flaws: p2.flaws, _flawShield: p2._flawShield || 0,
        poisonStacks: p2.poisonStacks || 0,
        hasDrawnFirstFlaw: p2.hasDrawnFirstFlaw || false,
        roundCardsPlayed: p2.roundCardsPlayed || 0,
        hasUsedPassiveThisRound: p2.hasUsedPassiveThisRound || false,
        hasTriggeredSunshine: p2.hasTriggeredSunshine || false,
        _skillfulDiscount: p2._skillfulDiscount || false,
        roundFlaws: p2.roundFlaws || 0,
        _actionDepth: p2._actionDepth || 0,
        cardsMovedThisTurn: p2.cardsMovedThisTurn || false,
        hand: p2.hand,
        dantian: p2.dantian,
        discardPile: p2.discardPile,
        extraDeck: p2.extraDeck,
        actionZone: p2.actionZone || [],
        judgmentZone: p2.judgmentZone || null,
        freePlayDiscount: p2.freePlayDiscount || 0,
        freePlayNextTurn: p2.freePlayNextTurn || false,
        _moveDiscountUsed: p2._moveDiscountUsed || false,
        totalPower: p2.totalPower || 0,
        character: { id: p2.character.id, name: p2.character.name },
        _deck: p2._deck,
        _cardsPlayedThisTurn: p2.cardsPlayedThisTurn || [],
      }
    };
    fs.writeFileSync(STATE_PATH, JSON.stringify(snap, null, 2), 'utf8');
  },

  restore: function() {
    var snap = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));

    var chars = loadCards(DATA_DIR + '/characters.json');
    var deckData = loadDeck(DATA_DIR + '/decks.json');
    var modengCards = loadCards(DATA_DIR + '/cards_modeng.json');
    var wudangCards = loadCards(DATA_DIR + '/cards_wudang.json');
    var humanDeck = buildDeck(deckData.modeng_xuedao, modengCards);
    var aiDeck = buildDeck(deckData.wudang_wuji, wudangCards);

    this.state = gs.createGameState(humanDeck, aiDeck, chars.xuedao, chars.wuji);
    var p1 = this.state.players[0];
    var p2 = this.state.players[1];
    p1._ai = new BaseAI('modeng', 'wudang');
    p2._ai = new BaseAI('wudang', 'modeng');
    this.humanP = p1;
    this.aiP = p2;

    // restore state
    this.state.round = snap.round;
    this.state.phase = snap.phase;
    this.state.isGameOver = snap.isGameOver;
    this.state.winner = snap.winner;
    this.state.log = snap.log;

    function restorePlayer(p, snapP, id) {
      p.id = id;
      p.hp = snapP.hp;
      p.innerPower = snapP.innerPower;
      p.baseInnerPower = snapP.baseInnerPower;
      p.flaws = snapP.flaws;
      p._flawShield = snapP._flawShield;
      p.poisonStacks = snapP.poisonStacks;
      p.hasDrawnFirstFlaw = snapP.hasDrawnFirstFlaw;
      p.roundCardsPlayed = snapP.roundCardsPlayed;
      p.hasUsedPassiveThisRound = snapP.hasUsedPassiveThisRound;
      p._bloodWarfareUsed = snapP._bloodWarfareUsed;
      p._bloodWarfareMode = snapP._bloodWarfareMode;
      p.hasTriggeredSunshine = snapP.hasTriggeredSunshine;
      p._skillfulDiscount = snapP._skillfulDiscount;
      p.roundFlaws = snapP.roundFlaws;
      p._actionDepth = snapP._actionDepth;
      p.cardsMovedThisTurn = snapP.cardsMovedThisTurn;
      p.hand = snapP.hand;
      p.dantian = snapP.dantian;
      p.discardPile = snapP.discardPile;
      p.extraDeck = snapP.extraDeck;
      p.actionZone = snapP.actionZone;
      p.judgmentZone = snapP.judgmentZone;
      p.freePlayDiscount = snapP.freePlayDiscount;
      p.freePlayNextTurn = snapP.freePlayNextTurn;
      p._moveDiscountUsed = snapP._moveDiscountUsed;
      p.totalPower = snapP.totalPower;
      p._deck = snapP._deck;
      p._cardsPlayedThisTurn = snapP._cardsPlayedThisTurn;
      p.name = snapP.character.id === 'xuedao' ? '琛€鍒€' : '鏃犳瀬閬撲汉';
    }
    restorePlayer(p1, snap.p1, 1);
    restorePlayer(p2, snap.p2, 2);

    this.save();
  },

  startRound: function() {
    var hp = this.humanP;
    var ap = this.aiP;
    var s = this.state;
    s.round++;
    s.log.push('\n--- 绗? + s.round + '鍥炲悎 ---');

    // 閲嶇疆鍥炲悎
    this.resetRound(hp);
    this.resetRound(ap);

    // 妫€鏌ユ父鎴忕粨鏉?    if (hp.hp <= 0) { this.endGame(ap); return; }
    if (ap.hp <= 0) { this.endGame(hp); return; }

    // 缁樺埗闃舵
    gs.drawCards(hp, CONST.drawPerRound, s);
    gs.drawCards(ap, CONST.drawPerRound, s);
    s.log.push('鍙屾柟鍚勬娊' + CONST.drawPerRound + '寮?);

    // 鍒ゅ畾鍖洪樁娈碉細鍙屾柟鍚勬殫鐩?寮?    this.pendingDecision = 'chooseJudgment';
    s.phase = 'chooseJudgment';
    // AI鑷姩閫?    ap.judgmentZone = ap._ai.chooseJudgmentCard(ap, hp, s);
    if (ap.judgmentZone) this.removeFromHand(ap, ap.judgmentZone);
    s.log.push('AI 鏆楃洊1寮?);

    // 绛夊緟浜虹被閫夋嫨
    this.save();
    showState(s, hp);
    console.log('\n璇烽€夋嫨鏆楃洊鍒板垽瀹氬尯鐨勭墝 [0-' + (hp.hand.length-1) + '] 鎴?"pass":');
    console.log('鐢ㄦ硶: node interactive.js judge <index> 鎴?pass');
  },

  humanChooseJudgment: function(idx) {
    var hp = this.humanP;
    var ap = this.aiP;
    var s = this.state;

    if (hp.hand.length === 0) {
      s.log.push('鏃犵墝鍙洊鏀?);
    } else {
      var card = hp.hand[idx];
      hp.judgmentZone = card;
      this.removeFromHand(hp, card);
      s.log.push('浣犳殫鐩?寮犮€? + card._data.name + '銆?);
    }
    this.pendingDecision = null;
    this.runJudgment();
  },

  humanPass: function() {
    // 浠€涔堥兘涓嶅仛
    this.pendingDecision = null;
    this.runJudgment();
  },

  removeFromHand: function(player, card) {
    for (var i = 0; i < player.hand.length; i++) {
      if (player.hand[i]._data.id === card._data.id && player.hand[i] === card) {
        player.hand.splice(i, 1);
        return;
      }
    }
    // 娣卞害鍖归厤涓嶈锛屾寜ID绉婚櫎
    var idx = -1;
    for (var j = 0; j < player.hand.length; j++) {
      if (player.hand[j]._data.id === card._data.id) {
        idx = j;
        break;
      }
    }
    if (idx >= 0) player.hand.splice(idx, 1);
  },

  runJudgment: function() {
    var hp = this.humanP;
    var ap = this.aiP;
    var s = this.state;
    s.phase = 'judgment';

    if (!hp.judgmentZone || !ap.judgmentZone) {
      if (!hp.judgmentZone && !ap.judgmentZone) {
        s.log.push('鍙屾柟鍧囨棤鍒ゅ畾鍖虹墝');
      } else {
        var def = !hp.judgmentZone ? hp : ap;
        s.log.push('P' + def.id + ' 鏃犵墝鏆楃洊锛岀洿鎺ュ姡鍔?);
        gs.gainFlaw(def, 1, s);
      }
    } else {
      cr.runJudgment(hp, ap, s);

      // 姝﹀綋澶瀬鍓戞剰 - AI 鍐崇瓥
      if (!ap.hasUsedPassiveThisRound && ap.judgmentZone && ap.judgmentZone._data.type === 'xinfa') {
        if (ap._ai.shouldTriggerTaichi(ap, hp, s)) {
          var myPwr = ap.judgmentZone._effectivePower !== undefined ? ap.judgmentZone._effectivePower : (ap.judgmentZone._data.power || 0);
          var oppPwr = hp.judgmentZone._effectivePower !== undefined ? hp.judgmentZone._effectivePower : (hp.judgmentZone._data.power || 0);
          if (myPwr < oppPwr) {
            ap.hasUsedPassiveThisRound = true;
            s.log.push('澶瀬鍓戞剰瑙﹀彂锛丄I鎶婂績娉曠Щ鍏ヤ腹鐢?);
            var xinfa = ap.judgmentZone;
            ap.dantian.push(xinfa);
            ap.baseInnerPower += (xinfa._data.innerPower || 0);
            ap.innerPower += (xinfa._data.innerPower || 0);
            ap.judgmentZone = null;
            onXinfaNonPlayEntry(ap, xinfa, s);
            // 鎵撳嚭姝︽妧
            var wujiHand = ap.hand.filter(function(c) { return c._data.type === 'wuji'; });
            if (wujiHand.length > 0) {
              var chosen = wujiHand.reduce(function(a, b) { return (a._data.cost||0) < (b._data.cost||0) ? a : b; });
              ap.judgmentZone = chosen;
              this.removeFromHand(ap, chosen);
              ap.innerPower = Math.max(0, ap.innerPower - (chosen._data.cost || 0));
              s.log.push('AI鎵撳嚭姝︽妧銆? + chosen._data.name + '銆嬩唬鏇胯繘鍒ゅ畾鍖猴紝閲嶆柊鍒ゅ畾');
              cr.runJudgment(hp, ap, s);
            }
          }
        }
      }
    }

    cr.calcTotalPower(hp, s);
    cr.calcTotalPower(ap, s);
    var disadvantaged = cr.determineDisadvantaged(hp, ap);
    s.log.push('鍔ｅ娍鏂? ' + (disadvantaged === hp ? '浣? : 'AI'));
    if (!disadvantaged.hasDrawnFirstFlaw) {
      disadvantaged.hasDrawnFirstFlaw = true;
      gs.drawCards(disadvantaged, 1, s);
    }

    // 杩涘叆琛屽姩闃舵
    this.runActionLoop();
  },

  runActionLoop: function() {
    var hp = this.humanP;
    var ap = this.aiP;
    var s = this.state;

    while (!s.isGameOver) {
      s.phase = 'action';
      cr.calcTotalPower(hp, s);
      cr.calcTotalPower(ap, s);
      var dis = hp.totalPower < ap.totalPower ? hp : ap.totalPower < hp.totalPower ? ap : (Math.random()<0.5?hp:ap);

      if (dis === hp) {
        // 浜虹被鍔ｅ娍 鈫?璇㈤棶鍑虹墝
        this.pendingDecision = 'takeAction';
        this.save();
        showState(s, hp);
        console.log('\n浣犲浜庡姡鍔?鎴樺姏' + hp.totalPower + '<' + ap.totalPower + ')銆傞€夋嫨鍑虹墝 [0-' + (hp.hand.length-1) + '] 鎴?"pass":');
        console.log('鐢ㄦ硶: node interactive.js play <index> 鎴?node interactive.js pass');
        return;
      } else {
        // AI鍔ｅ娍
        var result = ap._ai.takeAction(ap, hp, s);
        if (result === 'surrender' || result === 'no_action') {
          s.log.push('AI 瀹ｅ憡鏀惧純鍑虹墝');
          triggerZhenShang(hp, ap, s);
          triggerHitEffects(hp, ap, s);
          triggerFlawHeal(hp, ap, s);
          gs.gainFlaw(ap, 1, s);
          break;
        } else if (result === 'caught_up') {
          s.log.push('鍙嶈浆! AI杩藉钩');
          continue;
        } else {
          continue;
        }
      }
    }

    this.finishRound();
  },

  humanTakeAction: function(idx) {
    var hp = this.humanP;
    var ap = this.aiP;
    var s = this.state;
    this.pendingDecision = null;

    // 浜虹被鍑虹墝閫昏緫锛堢畝鍖栫増锛?    var card = hp.hand[idx];
    var cost = card._data.cost || 0;
    // 澶滆鎶樻墸
    if (card._data.element === 'deceptive' && hp.roundCardsPlayed === 0) cost = Math.max(0, cost - 2);

    if (cost > hp.innerPower) {
      console.log('鍐呭姏涓嶈冻锛侀渶' + cost + '锛岀幇鏈? + hp.innerPower);
      this.save();
      showState(s, hp);
      return;
    }

    hp.innerPower -= cost;
    this.removeFromHand(hp, card);
    if (card._data.type === 'xinfa') {
      // 蹇冩硶杩涘叆鍒ゅ畾鍖?      hp.actionZone.push(card);
      s.log.push('浣犳墦鍑哄績娉曘€? + card._data.name + '銆?);
    } else {
      // 姝︽妧
      hp.actionZone.push(card);
      s.log.push('浣犳墦鍑烘鎶€銆? + card._data.name + '銆?);
    }
    hp.roundCardsPlayed++;

    // 姣掔槾鍔熸娊鐗?    if (card.effectType === 'drawOnPlay') {
      gs.drawCards(hp, card.drawOnPlayCount || 1, s);
    }
    // 琛€娴烽瓟褰?鍗冩満鍥捐氨绛夋绱?    if (card.effectType === 'searchExtra') {
      var extra = hp.extraDeck.find(function(x) { return x._data.element === card._data.element && x._data.power > 0; });
      if (extra) {
        s.log.push('妫€绱㈤澶栧崱缁勶紝鑾峰緱銆? + extra._data.name + '銆?);
        hp.extraDeck = hp.extraDeck.filter(function(x) { return x !== extra; });
        hp.discardPile.push(extra);
      }
    }

    cr.calcTotalPower(hp, s);
    cr.calcTotalPower(ap, s);

    // 妫€鏌ユ槸鍚﹁拷骞?鍙嶈秴
    if (hp.totalPower >= ap.totalPower) {
      s.log.push('鍙嶈浆! 浣犺拷骞?鍙嶈秴!');
      if (!ap.hasDrawnFirstFlaw) { ap.hasDrawnFirstFlaw = true; gs.drawCards(ap, 1, s); }
    }

    this.save();
    // 缁х画琛屽姩寰幆
    this.runActionLoop();
  },

  finishRound: function() {
    var hp = this.humanP;
    var ap = this.aiP;
    var s = this.state;
    s.phase = 'resolution';

    // 姣掔礌缁撶畻
    if (hp.poisonStacks >= hp.character._poisonBurst_threshold) {
      var threshold = hp.character._poisonBurst_threshold || 3;
      while (hp.poisonStacks >= threshold) {
        hp.poisonStacks -= threshold;
        hp.hp--;
        s.log.push('姣掑彂: 浣犳崯澶?HP (姣? + hp.poisonStacks + ')');
      }
    }
    if (ap.poisonStacks >= ap.character._poisonBurst_threshold) {
      var t2 = ap.character._poisonBurst_threshold || 3;
      while (ap.poisonStacks >= t2) {
        ap.poisonStacks -= t2;
        ap.hp--;
        s.log.push('姣掑彂: AI鎹熷け1HP (姣? + ap.poisonStacks + ')');
      }
    }

    // 娓呯悊
    [hp, ap].forEach(function(p) {
      while (p.actionZone.length > 0) {
        var c = p.actionZone.shift();
        // 鏁堟灉鏁堟灉
        if (c.effectType === 'selfFlawGivesInner') { /* 宸插湪涓圭敯闃舵澶勭悊 */ }
        if (c.effectType === 'persistInDiscard') { /* 寮冪墝鍫嗕粛鐢熸晥 */ }
        p.discardPile.push(c);
      }
      // 鍒ゅ畾鍖轰篃鍏ュ純鐗屽爢
      if (p.judgmentZone) {
        p.discardPile.push(p.judgmentZone);
        p.judgmentZone = null;
      }
      p.totalPower = 0;
    });

    // 琛€婊村瓙锛氬叆寮冪墝鍫嗘椂缁欐瘨
    [hp, ap].forEach(function(src, si) {
      var tgt = si === 0 ? ap : hp;
      for (var di = 0; di < src.discardPile.length; di++) {
        if (src.discardPile[di].effectType === 'enterDiscardPoison') {
          tgt.poisonStacks = (tgt.poisonStacks || 0) + 1;
          s.log.push('琛€婊村瓙: ' + (tgt===hp?'浣?:'AI') + '鑾峰緱1灞傛番姣掞紙褰撳墠' + tgt.poisonStacks + '锛?);
        }
      }
    });

    if (hp.hp <= 0) { this.endGame(ap); return; }
    if (ap.hp <= 0) { this.endGame(hp); return; }

    this.save();
    showState(s, hp);
    this.startRound();
  },

  resetRound: function(p) {
    for (var i = p.actionZone.length-1; i >= 0; i--) {
      if (p.actionZone[i].effectType === 'delayedDantian') {
        var card = p.actionZone.splice(i, 1)[0];
        p.dantian.push(card);
        p.baseInnerPower += (card._data.innerPower || 0);
      }
    }
    p.judgmentZone = null;
    p.actionZone = [];
    p.roundCardsPlayed = 0;
    p.hasDrawnFirstFlaw = false;
    p._cardsPlayedThisTurn = [];
    p.cardsMovedThisTurn = false;
    p.roundFlaws = 0;
    p.hasUsedPassiveThisRound = false;
    p._actionDepth = 0;
    p._skillfulDiscount = false;

    p.baseInnerPower = p.dantian.reduce(function(s, c) { return s + (c._innerBoosted ? 1 : 0) + (c._data.innerPower||0); }, 0);

    // 鍚勭蹇冩硶鏁堟灉绱鍐呭姏
    for (var i = 0; i < p.dantian.length; i++) {
      var dc = p.dantian[i];
      if (dc.effectType === 'dantianInnerBonus' && p.dantian.length >= (dc._data.dantianThreshold || 2))
        p.baseInnerPower = Math.max(p.baseInnerPower, dc._data.innerThreshold || 6);
    }
    for (var i = 0; i < p.dantian.length; i++)
      if (p.dantian[i].effectType === 'discardInnerBonus') p.baseInnerPower += Math.floor(p.discardPile.length / 2);
    for (var i = 0; i < p.dantian.length; i++)
      if (p.dantian[i].effectType === 'selfFlawGivesInner') p.baseInnerPower += p.flaws;
    for (var i = 0; i < p.discardPile.length; i++)
      if (p.discardPile[i].effectType === 'persistInDiscard') p.baseInnerPower += (p.discardPile[i]._data.innerPower||0);

    p.innerPower = p.baseInnerPower;
    p.totalPower = 0;
  },

  endGame: function(winner) {
    var hp = this.humanP;
    this.state.isGameOver = true;
    this.state.winner = winner === hp ? 'P1(浣?' : 'P2(AI)';
    this.state.log.push('\n=== 娓告垙缁撴潫 ===');
    this.state.log.push('鑳滆€? ' + this.state.winner);
    showState(this.state, hp);
    console.log('\n馃弳 ' + this.state.winner + ' 鑾疯儨锛?);
    process.exit(0);
  }
};

// 鈹€鈹€ 绠€鍖栫殑鏁堟灉澶勭悊锛堝鐢ㄥ紩鎿庨€昏緫锛?鈹€鈹€
function onXinfaNonPlayEntry(player, card, state) {
  // 姝﹀綋鍩虹蹇冩硶锛氭娊1
  if (card.effectType === 'altEntryDantianDraw') {
    gs.drawCards(player, 1, state);
    state.log.push('姝﹀綋鍩虹蹇冩硶锛氳繘涓圭敯鏃舵娊1');
  }
}

function triggerZhenShang(advantaged, disadvantaged, state) {
  var has = advantaged.actionZone.some(function(c) { return c.effectType === 'zhengshang'; });
  if (!has) return;
  var n = 1;
  if (disadvantaged.hand.length > 0) {
    var idx = Math.floor(Math.random() * disadvantaged.hand.length);
    var d = disadvantaged.hand.splice(idx, 1)[0];
    disadvantaged.discardPile.push(d);
    state.log.push('闇囦激: 瀵规柟寮?鎵嬬墝');
  }
}

function triggerHitEffects(advantaged, disadvantaged, state) {
  advantaged.actionZone.forEach(function(c) {
    if (c._data.hasHit) {
      disadvantaged.poisonStacks += 1;
      state.log.push('鍛戒腑: 瀵规柟+1娣瘨');
    }
  });
}

function triggerFlawHeal(adv, dis, state) {
  if (adv.actionZone.some(function(c) { return c.effectType === 'triggerFlawHeal'; })) {
    if (adv.hp < 5) { adv.hp++; state.log.push('绾槼鏃犳瀬鍓? 鍥?琛€'); }
  }
}

// 鈹€鈹€ 涓诲叆鍙?鈹€鈹€
if (CMD === 'init') {
  GameState.init();
} else if (CMD === 'status') {
  GameState.restore();
  showState(GameState.state, GameState.humanP);
} else if (CMD === 'judge') {
  GameState.restore();
  var idx = parseInt(ARG);
  if (idx >= 0 && idx < GameState.humanP.hand.length) {
    GameState.humanChooseJudgment(idx);
  } else {
    console.log('鐗屽彿' + idx + '鏃犳晥锛屾墜鐗屽叡' + GameState.humanP.hand.length + '寮?);
  }
} else if (CMD === 'play') {
  GameState.restore();
  var idx = parseInt(ARG);
  if (idx >= 0 && idx < GameState.humanP.hand.length) {
    GameState.humanTakeAction(idx);
    // humanTakeAction 浼氳嚜宸卞喅瀹氭槸鍚︾户缁?  } else {
    console.log('鐗屽彿' + idx + '鏃犳晥锛屾墜鐗屽叡' + GameState.humanP.hand.length + '寮?);
  }
} else if (CMD === 'pass') {
  GameState.restore();
  if (GameState.pendingDecision === 'chooseJudgment') {
    GameState.humanPass();
  } else if (GameState.pendingDecision === 'takeAction') {
    // 鏀惧純 鈫?AI缁х画
    GameState.pendingDecision = null;
    // 鎵嬪姩瑙﹀彂缁撶畻
    var hp = GameState.humanP, ap = GameState.aiP, s = GameState.state;
    s.log.push('浣犲鍛婃斁寮冨嚭鐗?);
    triggerZhenShang(ap, hp, s);
    triggerHitEffects(ap, hp, s);
    triggerFlawHeal(ap, hp, s);
    gs.gainFlaw(hp, 1, s);
    GameState.finishRound();
  } else {
    console.log('褰撳墠鏃犻渶鎿嶄綔');
  }
} else {
  console.log('鐢ㄦ硶: node interactive.js init|status|judge <n>|play <n>|pass');
}


