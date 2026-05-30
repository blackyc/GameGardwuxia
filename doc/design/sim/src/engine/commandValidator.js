// commandValidator.js — 命令合法性验证（设计文档: 命令执行器）
//
// 设计意图:
//   验证命令的合法性（例如：当前玩家是否有足够内力打出此卡？此卡是否在手牌中？）。
//   验证通过后修改执行战斗状态。
//
// 所有 CLI 命令在 execute 之前必须先 validate。
// validate 返回 { valid: boolean, error: string }

var fsm = require('./phaseFsm');

// ─── 验证入口 ───

function validateCommand(state, cmd, params, playerIndex) {
  // params: { index, indices, phase, ... }
  // playerIndex: 0 = P1 (human), 1 = P2 (AI) — 用于验证出牌权

  switch (cmd) {

    // ── 暗盖选择 ──
    case 'judgment':
      return validateJudgment(state, params, playerIndex);

    // ── 出牌 ──
    case 'playCard':
      return validatePlayCard(state, params, playerIndex);

    // ── 跳过出牌 ──
    case 'pass':
      return validatePass(state, params, playerIndex);

    // ── 血战到底 ──
    case 'bloodwarfare':
      return validateBloodWarfare(state, params, playerIndex);

    // ── 血战模式选择 ──
    case 'bloodmode':
      return validateBloodMode(state);

    // ── 弃牌堆发动 ──
    case 'discard':
      return validateDiscardActivate(state, params, playerIndex);

    // ── 秘术放逐 ──
    case 'exilepick':
      return validateExilePick(state, params);

    // ── 秘术检索 ──
    case 'searchpick':
      return validateSearchPick(state, params);

    // ── 舍身撞丹田选择 ──
    case 'dantian':
      return validateDantianSelect(state, params);

    // ── 响应窗口 ──
    case 'respond':
      return validateRespond(state, params);

    default:
      return { valid: false, error: '未知命令: ' + cmd };
  }
}

// ─── 各命令具体验证 ───

function validateJudgment(state, params, playerIndex) {
  if (state.phase !== fsm.Phase.CHOOSE_JUDGMENT)
    return { valid: false, error: '当前不是暗盖阶段' };
  var player = state.players[playerIndex || 0];
  var idx = params.index;
  if (idx === undefined || idx === null) return { valid: true }; // pass JZ
  if (isNaN(idx) || idx < 0 || idx >= player.hand.length)
    return { valid: false, error: '无效序号 (手牌' + player.hand.length + '张)' };
  return { valid: true };
}

function validatePlayCard(state, params, playerIndex) {
  if (state.phase !== fsm.Phase.ACTION)
    return { valid: false, error: '当前不是出牌阶段' };
  var player = state.players[playerIndex || 0];
  var idx = params.index;
  if (isNaN(idx) || idx < 0 || idx >= player.hand.length)
    return { valid: false, error: '无效序号 (手牌' + player.hand.length + '张)' };
  var card = player.hand[idx];
  var cost = card._effCost !== undefined ? card._effCost : ((card._data || card).cost || 0);
  if (cost > player.innerPower)
    return { valid: false, error: '内力不足 (需要' + cost + '，当前' + player.innerPower + ')' };
  return { valid: true };
}

function validatePass(state, params, playerIndex) {
  // pass always valid — just means "nothing to do, advance"
  return { valid: true };
}

function validateBloodWarfare(state, params, playerIndex) {
  if (state.phase !== fsm.Phase.ACTION)
    return { valid: false, error: '只有出牌阶段才能发动' };
  var player = state.players[playerIndex || 0];
  if (!player.character || player.character.id !== 'xuedao')
    return { valid: false, error: '只有血刀有此被动' };
  if (player.tempStats && player.tempStats.passiveUsed)
    return { valid: false, error: '本回合已用过被动' };
  return { valid: true };
}

function validateBloodMode(state) {
  if (!state._pendingBloodMode)
    return { valid: false, error: '没有待选的血战效果' };
  return { valid: true };
}

function validateDiscardActivate(state, params, playerIndex) {
  if (state.phase !== fsm.Phase.ACTION)
    return { valid: false, error: '只有出牌阶段才能使用' };
  var player = state.players[playerIndex || 0];
  if (!player.discardPile || player.discardPile.length === 0)
    return { valid: false, error: '弃牌堆为空' };
  if (params.index === undefined) return { valid: true }; // list mode
  var options = [];
  for (var i = 0; i < player.discardPile.length; i++) {
    var et = (player.discardPile[i]._data || player.discardPile[i]).effectType;
    if (et === 'activateFromDiscard') options.push(i);
  }
  if (options.length === 0)
    return { valid: false, error: '弃牌堆中无可发动卡牌' };
  var idx = params.index;
  if (isNaN(idx) || idx < 0 || idx >= options.length)
    return { valid: false, error: '无效序号 (可选0-' + (options.length - 1) + ')' };
  return { valid: true };
}

function validateExilePick(state, params) {
  if (!state._exileCandidates)
    return { valid: false, error: '不在放逐选择阶段' };
  var indices = params.indices || [];
  var need = state._exileNeedCount || 2;
  if (indices.length !== need)
    return { valid: false, error: '需要选' + need + '张' };
  for (var i = 0; i < indices.length; i++) {
    if (isNaN(indices[i]) || indices[i] < 0 || indices[i] >= state._exileCandidates.length)
      return { valid: false, error: '无效序号 ' + indices[i] };
  }
  return { valid: true };
}

function validateSearchPick(state, params) {
  if (!state._searchExtra)
    return { valid: false, error: '不在秘术检索阶段' };
  var idx = params.index;
  if (isNaN(idx) || idx < 0 || idx >= state._searchExtra.length)
    return { valid: false, error: '无效序号 (可选0-' + (state._searchExtra.length - 1) + ')' };
  return { valid: true };
}

function validateDantianSelect(state, params) {
  if (!state._dantianSelect)
    return { valid: false, error: '无待选择目标' };
  var indices = params.indices || [];
  var max = state._dantianSelect.maxSelect || 2;
  if (indices.length === 0 || indices.length > max)
    return { valid: false, error: '需要选1-' + max + '张' };
  var oppId = state._dantianSelect.oppId;
  var opp = state.players[oppId || 1];
  for (var i = 0; i < indices.length; i++) {
    if (isNaN(indices[i]) || indices[i] < 0 || indices[i] >= opp.dantian.length)
      return { valid: false, error: '无效序号 ' + indices[i] };
  }
  return { valid: true };
}

function validateRespond(state, params) {
  if (state.phase !== fsm.Phase.RESPONSE)
    return { valid: false, error: '当前无响应窗口' };
  if (!state._responseWindow || !state._responseWindow.candidates)
    return { valid: false, error: '无可选响应' };
  var idx = params.index;
  if (isNaN(idx) || idx < 0 || idx >= state._responseWindow.candidates.length)
    return { valid: false, error: '无效序号 (可选0-' + (state._responseWindow.candidates.length - 1) + ')' };
  return { valid: true };
}

module.exports = {
  validateCommand: validateCommand
};
