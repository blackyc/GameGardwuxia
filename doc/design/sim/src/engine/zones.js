// zones.js — ICardZone 标准化接口
//
// 核心设计:
//   - Zone 包装数组，保持 [index] 兼容
//   - onEnter/onLeave 钩子：溢出检查 + EffectRegistry 自动注册
//   - moveCard(from, to, card) 原子化卡牌转移

function Zone(name, maxSize, player) {
  var self = [];
  self._name = name;
  self._maxSize = maxSize || -1;
  self._player = player;
  self._onEnter = null;  // function(card, zone, player)
  self._onLeave = null;  // function(card, zone, player)
  return self;
}

// 推入卡牌（返回 true/false 表示是否成功）
function zonePush(zone, card) {
  if (zone._maxSize > 0 && zone.length >= zone._maxSize) {
    // 溢出
    var over = card;
    var player = zone._player;
    if (zone._name === 'hand' && player) {
      player.discardPile.push(over);
      if (typeof state !== 'undefined' && typeof state.log !== 'undefined') {
        // Don't use state here - it's passed differently
      }
    }
    return false;
  }
  Array.prototype.push.call(zone, card);
  if (zone._onEnter) zone._onEnter(card, zone, zone._player);
  return true;
}

// 按 ID 移除卡牌
function zoneRemoveById(zone, cardId) {
  for (var i = 0; i < zone.length; i++) {
    var cid = zone[i].id || (zone[i]._data && zone[i]._data.id);
    if (cid === cardId) {
      var card = zone[i];
      Array.prototype.splice.call(zone, i, 1);
      if (zone._onLeave) zone._onLeave(card, zone, zone._player);
      return card;
    }
  }
  return null;
}

// 按引用移除
function zoneRemoveByRef(zone, card) {
  for (var i = 0; i < zone.length; i++) {
    if (zone[i] === card) {
      Array.prototype.splice.call(zone, i, 1);
      if (zone._onLeave) zone._onLeave(card, zone, zone._player);
      return true;
    }
  }
  return false;
}

// 卡牌转移（原子操作）
function moveCard(fromZone, toZone, card) {
  // 尝试推入目标
  if (!zonePush(toZone, card)) return false;
  // 成功后从源移除
  if (!zoneRemoveByRef(fromZone, card)) {
    // Rollback: 目标移除
    zoneRemoveByRef(toZone, card);
    return false;
  }
  return true;
}

// 从牌堆抽牌（mainDeck/extraDeck → hand）
function drawCard(deck, hand, player, state) {
  if (!deck || deck.length === 0) return null;
  var card = deck.pop();
  if (!zonePush(hand, card)) {
    // 手牌满 → 弃牌堆
    player.discardPile.push(card);
    if (state && state.log) state.log.push('P' + player.id + ' 手牌已满，抽牌溢入弃牌堆');
  }
  return card;
}

// 批量抽牌
function drawCards(player, count, state) {
  var drawn = 0;
  for (var i = 0; i < count; i++) {
    if (drawCard(player.mainDeck, player.hand, player, state)) drawn++;
  }
  return drawn;
}

// 创建玩家所有 Zone（含 onEnter/onLeave 钩子 → _activeEffects 索引）
function createPlayerZones(player) {
  if (player._zonesInitialized) return;

  // 共享: effectType → [{card,zone}] 自动索引
  if (!player._activeEffects) player._activeEffects = {};

  var onEnter = function(card, zone, p) {
    var et = (card._data || card).effectType;
    if (!et) return;
    if (!p._activeEffects[et]) p._activeEffects[et] = [];
    // 去重（同一张卡不在同一区的重复注册）
    for (var i = 0; i < p._activeEffects[et].length; i++) {
      if (p._activeEffects[et][i].card === card && p._activeEffects[et][i].zone === zone._name) return;
    }
    p._activeEffects[et].push({ card: card, zone: zone._name });
  };

  var onLeave = function(card, zone, p) {
    var et = (card._data || card).effectType;
    if (!et || !p._activeEffects || !p._activeEffects[et]) return;
    p._activeEffects[et] = p._activeEffects[et].filter(function(e) {
      return e.card !== card || e.zone !== zone._name;
    });
  };

  // Wrap existing arrays as zones with hooks
  if (!player._zonesInitialized) {
    player.hand._name = 'hand';
    player.hand._maxSize = require('../data/constants.json').maxHandSize;
    player.hand._player = player;
    
    player.actionZone._name = 'actionZone';
    player.actionZone._maxSize = -1;
    player.actionZone._player = player;
    player.actionZone._onEnter = onEnter;
    player.actionZone._onLeave = onLeave;
    
    player.dantian._name = 'dantian';
    player.dantian._maxSize = -1;
    player.dantian._player = player;
    player.dantian._onEnter = onEnter;
    player.dantian._onLeave = onLeave;
    
    player.discardPile._name = 'discardPile';
    player.discardPile._maxSize = -1;
    player.discardPile._player = player;
    
    player.mainDeck._name = 'mainDeck';
    player.mainDeck._maxSize = -1;
    player.mainDeck._player = player;
    
    if (player.extraDeck) {
      player.extraDeck._name = 'extraDeck';
      player.extraDeck._maxSize = -1;
      player.extraDeck._player = player;
      player.extraDeck._onEnter = onEnter;
      player.extraDeck._onLeave = onLeave;
    }

    // exileZone — 流放区（移出游戏）
    if (!player.exileZone) player.exileZone = [];
    player.exileZone._name = 'exileZone';
    player.exileZone._maxSize = -1;
    player.exileZone._player = player;
    player.exileZone._onEnter = onEnter;
    player.exileZone._onLeave = onLeave;

    // judgmentZone — is a single card; wrap for onEnter/onLeave triggers
    // (set/clear via assignJudgmentZone → zonePush/zoneRemove)
    if (player.judgmentZone) {
      player.judgmentZone._name = 'judgmentZone';
      player.judgmentZone._player = player;
    }
    
    player._zonesInitialized = true;
  }
}

// 遍历所有 Zone
function forEachZone(player, fn) {
  var zoneNames = ['hand', 'actionZone', 'dantian', 'discardPile', 'mainDeck'];
  if (player.extraDeck) zoneNames.push('extraDeck');
  if (player.exileZone) zoneNames.push('exileZone');
  for (var i = 0; i < zoneNames.length; i++) {
    var z = player[zoneNames[i]];
    if (z) fn(z, zoneNames[i]);
  }
  // judgmentZone is a single card, not an array
  if (player.judgmentZone) fn(player.judgmentZone, 'judgmentZone');
}

// 从所有 Zone 重建 _activeEffects 索引（load/init 时调用）
function buildEffectIndex(player) {
  if (!player._activeEffects) player._activeEffects = {};
  else for (var k in player._activeEffects) delete player._activeEffects[k];

  forEachZone(player, function(zone, zName) {
    if (zName === 'hand' || zName === 'mainDeck' || zName === 'extraDeck' || zName === 'exileZone') return;
    // judgmentZone is a single card, not an array
    if (zName === 'judgmentZone') {
      var et = (zone._data || zone).effectType;
      if (et) {
        if (!player._activeEffects[et]) player._activeEffects[et] = [];
        player._activeEffects[et].push({ card: zone, zone: zName });
      }
      return;
    }
    for (var i = 0; i < zone.length; i++) {
      var card = zone[i];
      var cet = (card._data || card).effectType;
      if (!cet) continue;
      if (!player._activeEffects[cet]) player._activeEffects[cet] = [];
      player._activeEffects[cet].push({ card: card, zone: zName });
    }
  });
}

// 查询活跃效果
function hasActiveEffect(player, effectType) {
  return player._activeEffects && player._activeEffects[effectType] && player._activeEffects[effectType].length > 0;
}

function getActiveEffects(player, effectType) {
  return (player._activeEffects && player._activeEffects[effectType]) || [];
}

module.exports = {
  Zone: Zone,
  zonePush: zonePush,
  zoneRemoveById: zoneRemoveById,
  zoneRemoveByRef: zoneRemoveByRef,
  moveCard: moveCard,
  drawCard: drawCard,
  drawCards: drawCards,
  createPlayerZones: createPlayerZones,
  forEachZone: forEachZone,
  buildEffectIndex: buildEffectIndex,
  hasActiveEffect: hasActiveEffect,
  getActiveEffects: getActiveEffects
};
