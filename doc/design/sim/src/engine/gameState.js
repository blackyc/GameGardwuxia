// 游戏状态管理器 v5
var CONST = require('../data/constants.json');
var cr = require('./cardRegistry');
var zones = require('./zones');

function createGameState(p1Deck, p2Deck, char1, char2) {
  return {
    players: [
      createPlayerState(p1Deck, char1, 1),
      createPlayerState(p2Deck, char2, 2)
    ],
    round: 0,
    phase: 'preparation',
    isGameOver: false,
    winner: null,
    log: []
  };
}

function createPlayerState(deckConfig, character, id) {
  var shield = 0;
  if (character.passives) {
    for (var pi = 0; pi < character.passives.length; pi++) {
      if (character.passives[pi].type === 'flawShield') {
        shield = character.passives[pi].count || 1;
        break;
      }
    }
  }
  var player = {
    id: id,
    name: character.name,
    character: character,
    hp: character.hp,
    maxHp: character.hp,
    flaws: character.initialFlaws || 0,
    mainDeck: shuffle(buildDeck(deckConfig.mainDeck)),
    extraDeck: deckConfig.extraDeck.map(function(e) {
      var cd = cr.getCard(e.cardId);
      var c = { id: e.cardId, _data: cd, name: cd.name, type: cd.type,
        element: cd.element, cost: cd.cost, power: cd.power,
        innerPower: cd.innerPower || 0, tags: cd.tags || [],
        isExtra: true, effectType: cd.effectType || null };
      return c;
    }),
    hand: [],
    dantian: [],
    judgmentZone: null,
    actionZone: [],
    discardPile: [],
    exileZone: [],
    innerPower: 0,
    baseInnerPower: 0,
    totalPower: 0,
    roundFlaws: 0,
    roundCardsPlayed: 0,
    hasDrawnFirstFlaw: false,
    poisonStacks: 0,
    cardsPlayedThisTurn: [],
    tempStats: {
      cardsMoved: false,
      passiveUsed: false,
      skillfulDiscount: false,
      bloodWarfareUsed: false,
      bloodWarfareMode: null
    },
    freePlayNextTurn: false,
    hasUsedShuffleBack: false,
    hasTriggeredSunshine: false,
    flawShield: shield
  };
  // Initialize Zone system on the player
  zones.createPlayerZones(player);
  zones.buildEffectIndex(player);
  return player;
}

function buildDeck(config) {
  var cards = [];
  for (var i = 0; i < config.length; i++) {
    var entry = config[i];
    for (var j = 0; j < entry.count; j++) {
      var cardData = cr.getCard(entry.cardId);
      cards.push({
        id: entry.cardId,
        _data: cardData,
        name: cardData.name,
        type: cardData.type,
        element: cardData.element,
        cost: cardData.cost,
        power: cardData.power,
        innerPower: cardData.innerPower || 0,
        tags: cardData.tags || [],
        isExtra: cardData.isExtra || false,
        effectType: cardData.effectType || null
      });
    }
  }
  return cards;
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function drawCards(player, count, state) {
  for (var i = 0; i < count; i++) {
    if (player.mainDeck.length === 0) {
      if (player.discardPile.length === 0) break;
      player.mainDeck = shuffle(player.discardPile);
      player.discardPile = [];
      player.discardPile._name = 'discardPile'; player.discardPile._maxSize = -1; player.discardPile._player = player;
      player.flaws++;
      state.log.push('P' + player.id + ' 牌库耗尽，洗切弃牌堆，获得1破绽');
      checkFlawDeath(player, state);
      if (state.isGameOver) return [];
    }
    if (player.mainDeck.length === 0) break;
    var card = player.mainDeck.pop();
    if (!zones.zonePush(player.hand, card)) {
      // 手牌满 → 弃牌堆 + enterDiscardPoison 触发器
      player.discardPile.push(card);
      state.log.push('P' + player.id + ' 手牌已满，溢出进弃牌堆');
      if ((card._data || card).effectType === 'enterDiscardPoison') {
        var opp = (state.players[0] === player) ? state.players[1] : state.players[0];
        opp.poisonStacks += 1;
        state.log.push('血滴子(溢出): P' + opp.id + ' 获得1层[淬毒]（当前' + opp.poisonStacks + '）');
      }
    }
  }
}

function gainFlaw(player, count, state) {
  // 修罗饮血功：自身效果产生破绽时即时+内
  var hasSelfFlawInner = false;
  if (player.dantian) {
    for (var di = 0; di < player.dantian.length; di++) {
      if (player.dantian[di].effectType === 'selfFlawGivesInner') { hasSelfFlawInner = true; break; }
    }
  }
  for (var i = 0; i < count; i++) {
    player.flaws++;
    player.roundFlaws++;
    if (hasSelfFlawInner && player.selfInflictedFlaws !== undefined) {
      player.baseInnerPower = (player.baseInnerPower || 0) + 1;
      player.innerPower = Math.max(0, player.baseInnerPower);
    }
    state.log.push('P' + player.id + ' 获得1破绽（累计' + player.flaws + '，本轮' + player.roundFlaws + '）');
    checkFlawDeath(player, state);
    if (state.isGameOver) return;
  }
}

function checkFlawDeath(player, state) {
  if (player.flaws >= CONST.flawsPerHp) {
  // 破绽护盾：先吸收（每层盾吸1个破绽）
  if (player.flawShield > 0) {
    player.flawShield--;
    player.flaws--;
    player.roundFlaws--;
    state.log.push('P' + player.id + ' 破绽护盾吸收1个破绽！(盾剩余' + player.flawShield + ')');
    // 盾吸完后如果还够2个才扣血
    if (player.flaws < CONST.flawsPerHp) return;
  }
    player.flaws -= CONST.flawsPerHp;
    player.hp--;
    state.log.push('P' + player.id + ' 破绽满2，失去1生命（剩余' + player.hp + 'HP），抽2张');
    drawCards(player, 2, state);
    if (player.hp <= 0) {
      state.isGameOver = true;
      state.winner = player.id === 1 ? 2 : 1;
    }
  }
}

function removeDantianCard(player, card, state) {
  var idx = player.dantian.indexOf(card);
  if (idx < 0) return;
  var cardInner = card.innerPower || 0;
  player.dantian.splice(idx, 1);
  player.discardPile.push(card);

  // 内力减法：先减已消耗上限，再减当前
  var oldBase = player.baseInnerPower;
  var oldCurr = player.innerPower;
  var used = oldBase - oldCurr;
  player.baseInnerPower = Math.max(0, oldBase - cardInner);
  var overhang = Math.max(0, cardInner - used);
  player.innerPower = Math.max(0, oldCurr - overhang);

  state.log.push('P' + player.id + ' 《' + card._data.name + '》离开丹田，失去+' + cardInner + '内力（内=' + player.innerPower + '）');
}

function destroyDantianCards(player, count, state) {
  var destroyed = 0;
  for (var i = 0; i < count && player.dantian.length > 0; i++) {
    var card = player.dantian[player.dantian.length - 1]; // 优先移除最后进入的
    removeDantianCard(player, card, state);
    destroyed++;
  }
  return destroyed;
}

module.exports = { createGameState, drawCards, gainFlaw, checkFlawDeath, shuffle, removeDantianCard, destroyDantianCards };
