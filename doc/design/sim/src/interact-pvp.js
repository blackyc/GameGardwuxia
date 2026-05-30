// interact-pvp.js — PVP 双人对战模式
// 基于 PVE 引擎，AI 全部转换为人类交互
// 热座模式：屏幕切换清屏，暗盖信息保密
//
// 启动: node interact-pvp.js 血刀 无极道人

var gs = require('./engine/gameState');
var cr = require('./engine/combatResolver');
var er = require('./engine/effectResolver');
var CONST = require('./data/constants.json');
var phFsm = require('./engine/phaseFsm');
var characters = require('./data/characters.json');
var decks = require('./data/decks.json');
var readline = require('readline');
var fs = require('fs');
var path = require('path');

// ═══════════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════════

function pad(s, len) { var str = String(s); while (str.length < len) str += ' '; return str; }

function removeFromHand(player, card) { var i = player.hand.indexOf(card); if (i >= 0) player.hand.splice(i, 1); }
function removeFromArr(a, c) { var i = a.indexOf(c); if (i >= 0) a.splice(i, 1); }
function cloneCard(c) { return { id: c.id, _data: c._data, name: c._data.name, type: c._data.type, element: c._data.element, cost: c._data.cost, power: c._data.power, innerPower: c._data.innerPower || 0, tags: c._data.tags || [], isExtra: true, effectType: c._data.effectType || null }; }

function isModengCard(c) { var d = c._data || c; return d.faction === 'modeng' || (d.tags && d.tags.indexOf('魔教') >= 0); }
function phaseLabel(p) { var m = { preparation:'准备',chooseJudgment:'暗盖',judgment:'判定',action:'出牌',resolution:'结算',nextRound:'回合结束',response:'响应窗口' }; return m[p] || p; }

var elemMap = { domineering: '霸', skillful: '巧', deceptive: '诡', spirit: '灵' };

function describeEffectCompact(d) {
  var et = d.effectType, parts = [];
  if (d.isExtra) return '额外';
  if (et === 'zhengshang') { parts.push('震伤'); if (d.flawPowerBuff) parts.push('破绽P+'+d.flawPowerBuff); }
  else if (et === 'conditionalPower_flaw_plus3') parts.push('敌破绽P+'+(d.flawPowerBonus||3));
  else if (et === 'judgmentDantianPower') parts.push('判定P+丹田卡×'+(d.dantianPowerPerCard||0));
  else if (et === 'innerToPower') parts.push('P=min(内,'+(d.maxInnerToPower||10)+')');
  else if (et === 'innerPowerToPower') parts.push('P=内×'+(d.innerToPowerBoost||1));
  else if (et === 'innerToPowerBuff') parts.push('内P加成');
  else if (et === 'poisonPowerBuff') parts.push('毒P+'+(d.poisonPowerBonus||3));
  else if (et === 'movePowerBuff') parts.push('全场武技P+'+(d.movePowerBuffAmount||0));
  else if (et === 'flawDiscount') { parts.push('破绽打折'); if (d.flawCostReduce) parts.push('费-'+d.flawCostReduce); }
  else if (et === 'flawHeal') parts.push('清除破绽');
  else if (et === 'faceDown_flaw_nerfSelf_drainEnemy') parts.push('盖放 破绽自损P-'+d.flawPowerPenalty);
  else if (et === 'persistInDiscard') parts.push('弃牌有效');
  else if (et === 'selfFlawGivesInner') parts.push('自伤破绽+内');
  else if (et === 'delayedDantian') parts.push('下回合初进丹田');
  else if (et === 'dantianInnerBonus') parts.push('额外产内');
  else if (et === 'altEntryDantianDraw') parts.push('非打出进丹田抽1');
  else if (et === 'discardInnerBonus') parts.push('弃牌产内');
  else if (et === 'drawOnPlay') parts.push('打出抽'+(d.drawOnPlayCount||1));
  else if (et === 'chaizhao_killDantian') parts.push('拆招·毁丹田'+d.dantianKillCount);
  else if (et === 'chaizhao_negateBuff') parts.push('拆招·消增幅');
  else if (et === 'searchExtra') { parts.push('检索'); if (d.exileCount) parts.push('放逐'+d.exileCount); }
  else if (et === 'lowHpSearch') parts.push('低血检索');
  else if (et === 'hitDrawAndPoison') parts.push('命中毒+抽');
  else if (et === 'enterDiscardPoison') parts.push('弃牌毒');
  else if (et === 'judgmentLossPoison') parts.push('判定败毒');
  else if (et === 'absorbPoisonMultiply') parts.push('吸毒P×2');
  else if (et === 'clearAndDirectDamage') parts.push('清毒直伤');
  else if (et === 'forcedResolution') parts.push('强结算');
  else if (et === 'zhengshangDrain') parts.push('震伤吸血');
  else if (et === 'disadvantagedDrawAndReturn') parts.push('劣势抽1退手');
  else if (et === 'discardReturn') parts.push('弃牌回收');
  else if (et === 'moveCostReducer') parts.push('减武技费');
  else parts.push(et);
  return parts.join('|');
}

function cardDetailCompact(c) {
  var d = c._data;
  return '《' + d.name + '》 ' + (d.type === 'xinfa' ? '心' : '武') + '/' + (elemMap[d.element] || d.element) +
    ' 费' + (d.cost || 0) + ' P' + (d.power || 0) +
    (d.innerPower ? ' 内+' + d.innerPower : '') +
    (d.effectType ? ' [' + describeEffectCompact(d) + ']' : '');
}

function showRecap(state, maxShow) {
  var log = state.log || [];
  if (!log.length) return;
  maxShow = maxShow || 8;
  console.log('\n── 战斗回顾 ──');
  var start = Math.max(0, log.length - maxShow);
  for (var i = start; i < log.length; i++) console.log('  ' + log[i]);
  if (start > 0) console.log('  ...(' + start + '条更早记录)');
}

// ═══════════════════════════════════════════
//  显示函数（仅展示指定玩家视角）
// ═══════════════════════════════════════════

function showStateForPlayer(me, state) {
  var opp = me.id === state.players[0].id ? state.players[1] : state.players[0];
  var adv = (me.totalPower > opp.totalPower) ? '优势' : (me.totalPower < opp.totalPower) ? '劣势' : '平局';

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  Round ' + state.round + ' | ' + phaseLabel(state.phase) + ' | 你' + adv + ' ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║      你(' + me.character.name + ') vs 对手(' + opp.character.name + ')    ║');
  console.log('╠══════════════════════╦═══════════════════╣');
  console.log('║ HP:' + me.hp + '/' + me.maxHp + ' 破绽:' + me.flaws + ' 内力:' + me.innerPower +
    ' 战力:' + me.totalPower + pad('', 22 - String('HP:'+me.hp+'/'+me.maxHp+' 破绽:'+me.flaws+' 内力:'+me.innerPower+' 战力:'+me.totalPower).length) +
    '║ HP:' + opp.hp + '/' + opp.maxHp + ' 破绽:' + opp.flaws + ' 内力:' + opp.innerPower + ' 战力:' + opp.totalPower);
  if (me.poisonStacks || me.flawShield || opp.poisonStacks || opp.flawShield) {
    console.log('║ '+(me.flawShield?'[盾:'+me.flawShield+'] ':'')+(me.poisonStacks?'[毒:'+me.poisonStacks+'] ':'')+
      pad('',14)+'║ '+(opp.flawShield?'[盾:'+opp.flawShield+'] ':'')+(opp.poisonStacks?'[毒:'+opp.poisonStacks+']':''));
  }
  console.log('╠══════════════════════╩═══════════════════╣');

  // 判定区（双方明牌 — 判定阶段后已揭示）
  if (me.judgmentZone) console.log('║ 你的判定: ' + pad(cardDetailCompact(me.judgmentZone), 48) + '║');
  if (opp.judgmentZone) console.log('║ 对手判定: ' + pad(cardDetailCompact(opp.judgmentZone), 47) + '║');

  // 出牌区
  console.log('║--- 出牌区(AZ) ---');
  console.log('║ 你(' + me.actionZone.length + '): ' + (me.actionZone.length ? '' : '(空)'));
  for (var ai2 = 0; ai2 < me.actionZone.length; ai2++) console.log('║   ' + cardDetailCompact(me.actionZone[ai2]));
  console.log('║ 对手(' + opp.actionZone.length + '): ' + (opp.actionZone.length ? '' : '(空)'));
  for (var aj = 0; aj < opp.actionZone.length; aj++) console.log('║   ' + cardDetailCompact(opp.actionZone[aj]));

  // 丹田区
  console.log('║--- 丹田(DT) ---');
  console.log('║ 你(' + me.dantian.length + '): ' + (me.dantian.length ? '' : '(空)'));
  for (var di = 0; di < me.dantian.length; di++) console.log('║   ' + cardDetailCompact(me.dantian[di]));
  console.log('║ 对手(' + opp.dantian.length + '): ' + (opp.dantian.length ? '' : '(空)'));
  for (var dj = 0; dj < opp.dantian.length; dj++) console.log('║   ' + cardDetailCompact(opp.dantian[dj]));

  // 手牌区（仅展示当前玩家的手牌）
  console.log('║--- 你的手牌 ---');
  for (var hi = 0; hi < me.hand.length; hi++) {
    console.log('║ [' + hi + '] ' + cardDetailCompact(me.hand[hi]));
  }

  // 底部信息
  console.log('╠══════════════════════════════════════════╣');
  console.log('║ 你的主卡组: ' + me.mainDeck.length + '张 | 弃牌堆: ' + me.discardPile.length + '张 | 额外: ' + me.extraDeck.length + '张');
  console.log('║ 对手主卡组: ' + opp.mainDeck.length + '张 | 弃牌堆: ' + opp.discardPile.length + '张 | 额外: ' + opp.extraDeck.length + '张');
  if (me.exileZone.length || opp.exileZone.length) console.log('║ 你的除外: '+me.exileZone.length+'张 | 对手除外: '+opp.exileZone.length+'张');
  console.log('╚══════════════════════════════════════════╝');
}

// ═══════════════════════════════════════════
//  引擎函数（无AI版本）
// ═══════════════════════════════════════════

function resetRound(player) {
  // 聚气诀延迟入丹田
  for (var i = player.actionZone.length - 1; i >= 0; i--) {
    if (player.actionZone[i].effectType === 'delayedDantian') {
      var card = player.actionZone.splice(i, 1)[0];
      player.dantian.push(card);
      player.baseInnerPower += (card._data.innerPower || 0);
    }
  }
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
  player.baseInnerPower = player.dantian.reduce(function(s, c) {
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
  // 修罗饮血功
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

function endGame(state, winner) { state.isGameOver = true; state.winner = winner.id; }

function checkSunshine(player, state) {
  er.checkSunshine(player, state);
}

function checkXueDiZi(card, opponent, state) {
  er.checkXueDiZi(card, opponent, state);
}

function clearZones(player, state) {
  er.clearZones(player, state);
}

function processDelayedDantian(player, state) {
  for (var i = 0; i < player.dantian.length; i++) {
    if (player.dantian[i]._delayedDantian) { delete player.dantian[i]._delayedDantian; }
  }
}

// ═══════════════════════════════════════════
//  出战阶段效果结算 — 委托统一效果系统
// ═══════════════════════════════════════════

function runPhaseA(p1, p2, state, disadvantaged, advantaged) {
  er.resolvePhaseA(p1, p2, state);
}

// ═══════════════════════════════════════════
//  玩家出牌
// ═══════════════════════════════════════════

function playCard(player, opponent, state, idx) {
  var card = player.hand[idx];
  var effCost = card._effCost !== undefined ? card._effCost : (card._data.cost || 0);

  // 血战到底 costDown
  if (player.tempStats.bloodWarfareUsed && player.tempStats.bloodWarfareMode === 'costDown' && isModengCard(card)) { effCost = Math.max(0, effCost - 2); state.log.push('血战到底：' + card._data.name + ' -2费（当前' + effCost + '）'); player.tempStats.bloodWarfareUsed = false; }
  // 破绽打折
  if (card.effectType === 'flawDiscount' && player.flaws > 0) { effCost = Math.max(0, effCost - (card._data.flawCostReduce || 2)); card._effCost = effCost; state.log.push('破绽打折：' + card._data.name + ' 费用-' + (card._data.flawCostReduce || 2)); }
  // 两仪/妙手discount
  if (card._liangyiDiscount) { effCost = Math.max(0, effCost - 2); card._liangyiDiscount = false; }

  if (player.innerPower < effCost) { state.log.push('⚠ 内力不足！需' + effCost + '，当前' + player.innerPower); return false; }

  player.innerPower = Math.max(0, player.innerPower - effCost);
  player.roundCardsPlayed = (player.roundCardsPlayed || 0) + 1;
  player.tempStats.cardsMoved = true;
  player.hand.splice(idx, 1);

  if (card._data.type === 'xinfa') {
    if (card._data.effectType === 'delayedDantian') {
      if (player.flaws > 0) { player.dantian.push(card); player.baseInnerPower += (card._data.innerPower || 0); player.innerPower += (card._data.innerPower || 0); state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(player, card, state)); state.log.push('P'+player.id+' 打出《'+card._data.name+'》(有破绽→直进丹田)'); }
      else { card._hitResolved = false; card._zsResolved = false; player.actionZone.push(card); card._delayedDantian = true; state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(player, card, state)); state.log.push('P'+player.id+' 打出《'+card._data.name+'》(延迟入丹田)'); }
    } else { player.dantian.push(card); player.baseInnerPower += (card._data.innerPower || 0); player.innerPower += (card._data.innerPower || 0); state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(player, card, state)); state.log.push('P'+player.id+' 心法→丹田(+'+(card._data.innerPower||0)+'内)'); }
    if (card._data.effectType === 'drawOnPlay') gs.drawCards(player, card._data.drawOnPlayCount || 1, state);
  } else {
    player.actionZone.push(card);
    state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(player, card, state));
    state.log.push('P'+player.id+' 打出《'+card._data.name+'》(费'+effCost+')');
    if (card.effectType === 'flawDiscount' && player.flaws > 0 && card._data.flawDraw) gs.drawCards(player, card._data.flawDraw, state);
    if (card._data.effectType === 'discardReturn' && player.discardPile.length > 0) { var best = player.discardPile.reduce(function(a,b){ return (a._data.power||0)>(b._data.power||0)?a:b; }); var bi = player.discardPile.indexOf(best); if (bi>=0) { player.hand.push(player.discardPile.splice(bi,1)[0]); state.log.push('P'+player.id+' 回收'+best._data.name); } }
  }
  return true;
}

// ═══════════════════════════════════════════
//  秘术检索
// ═══════════════════════════════════════════

function hasFaction(card, faction) { if (!card||!card._data) return false; var f=card._data.faction; if (!f) return false; if (Array.isArray(f)) return f.indexOf(faction)>=0; return f===faction; }

function handleSearchExtra(player, opponent, state, card) {
  var data = card._data;
  var needCount = data.exileCount || 2;
  var FACTION_MAP = { '魔教': 'modeng', '武当': 'wudang', '隐堂': 'yintang' };
  var normalizedFaction = FACTION_MAP[data.searchFaction] || data.searchFaction;
  var targets = [];
  if (data.sources) {
    for (var si = 0; si < data.sources.length; si++) {
      var src = data.sources[si], pool = null;
      if (src==='discardPile'||src==='discard') pool=player.discardPile;
      else if (src==='mainDeck') pool=player.mainDeck;
      else if (src==='actionZone') pool=player.actionZone;
      else if (src==='hand') pool=player.hand;
      if (pool) { for (var pi=0; pi<pool.length; pi++) { if (hasFaction(pool[pi], normalizedFaction)) targets.push({card:pool[pi],zone:src,name:pool[pi]._data.name}); } }
    }
  }
  if (targets.length > 0) { state._exileCandidates=targets; state._exileNeedCount=needCount; state._exileSearchData=data; state.log.push('秘术检索：请选择放逐牌（最多'+needCount+'张）'); return 'exile'; }
  var eligible = player.extraDeck.filter(function(ec) { var ef=ec._data.faction; return !normalizedFaction||ef===normalizedFaction||(Array.isArray(ef)&&ef.indexOf(normalizedFaction)>=0); });
  if (eligible.length>0) { state._searchExtra=eligible; state.log.push('秘术检索：选择额外牌入手'); return 'search'; }
  state.log.push('秘术检索：额外卡组无可用牌');
  if (data.bonusDraw) gs.drawCards(player, data.bonusDraw, state);
  return null;
}

// ═══════════════════════════════════════════
//  响应系统
// ═══════════════════════════════════════════

var RESP_TRIGGER = er.RESP_TRIGGER;

var RESPONSE_REGISTRY = er.RESPONSE_REGISTRY;

function scanResponses(player, trigger, ctx) {
  var found = [];
  var zones = [{k:'hand',arr:player.hand},{k:'actionZone',arr:player.actionZone},{k:'dantian',arr:player.dantian}];
  if (player.judgmentZone) zones.push({k:'judgmentZone',arr:[player.judgmentZone]});
  for (var z=0; z<zones.length; z++) { var zone=zones[z]; for (var i=0; i<zone.arr.length; i++) { var card=zone.arr[i]; var d=card._data||card; if (!d.name) continue;
    for (var r=0; r<RESPONSE_REGISTRY.length; r++) { var reg=RESPONSE_REGISTRY[r]; if (reg.name!==d.name||reg.trigger!==trigger) continue; var ctx2=Object.assign({},ctx,{owner:player}); if (reg.condition&&!reg.condition(ctx2)) continue; found.push({player:player,card:card,zone:zone.k,registry:reg}); }
  }}
  return found;
}

function pollResponseWindow(p1, p2, trigger, ctx) {
  var candidates = scanResponses(p1,trigger,ctx).concat(scanResponses(p2,trigger,ctx));
  if (candidates.length===0) return null;
  return candidates;
}

function executeResponsePvp(target, state) {
  var player=target.player, opp=state.players[player.id===1?1:0], card=target.card, zoneKey=target.zone, d=card._data||card;
  if (zoneKey==='judgmentZone') player.judgmentZone=null;
  else { var arr=player[zoneKey]; for (var j=arr.length-1;j>=0;j--) { if ((arr[j].id||(arr[j]._data&&arr[j]._data.id))===(card.id||(card._data&&card._data.id))) { arr.splice(j,1); break; } } }
  var ct=d.type||(d._data&&d._data.type);
  if (ct==='wuji') { player.actionZone.push(card); state.log.push('⚡响应! '+player.character.name+'打出《'+d.name+'》→出牌区'); } else { player.discardPile.push(card); state.log.push('⚡响应! '+player.character.name+'发动《'+d.name+'》'); }
  var reg=null; for (var r=0; r<RESPONSE_REGISTRY.length; r++) { if (RESPONSE_REGISTRY[r].name===d.name) { reg=RESPONSE_REGISTRY[r]; break; } }
  if (reg) {
    if (d.name==='舍身撞') { player.innerPower=Math.max(0,player.innerPower-2); state.log.push('⚡舍身撞！请选择对方丹田中要摧毁的心法牌（最多2张）');
      var dc=opp.dantian; state._dantianSelect={oppId:opp.id,maxSelect:2,xinfaOnly:true,candidates:dc.map(function(c,i){ return {index:i,name:(c._data||c).name,type:(c._data||c).type,faction:(c._data||c).faction}; }),onDone:'shaShenZhuang'}; return; }
    // 梯云纵：扣内+抽牌走 RESPONSE_REGISTRY，拆招入 CommandQueue
    if (d.name==='梯云纵') { reg.effect(player,opp,{},state); var q=state._cmdQueue; var nc=q.createNegateCmd(card,player,opp); q.enqueue(nc); q.resolveChain(state); return; }
    reg.effect(player,opp,{},state);
  }
}

// ═══════════════════════════════════════════
//  响应窗口处理（PVP: 双方均为人类）
// ═══════════════════════════════════════════

function handleResponseWindowPvp(p1, p2, ctx, state, rl) {
  var candidates = pollResponseWindow(p1, p2, ctx.trigger, ctx);
  if (!candidates) return null;

  if (!state._refusedInChain) state._refusedInChain = {};
  candidates = candidates.filter(function(c) { var cid=c.card.id||(c.card._data&&c.card._data.id); return !(cid&&state._refusedInChain[cid]); });
  if (candidates.length===0) return null;

  state._responseWindow = { trigger: ctx.trigger, candidates: candidates };
  return 'response';
}

// ═══════════════════════════════════════════
//  PVP 主循环
// ═══════════════════════════════════════════

function clearScreen() {
  console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
  process.stdout.write('\x1B[2J\x1B[H');
}

function checkGameOver(state) {
  if (state.isGameOver) {
    var w = state.winner === 1 ? state.players[0] : state.players[1];
    console.log('\n========================================');
    console.log('          🏆 游戏结束 🏆');
    console.log('========================================');
    console.log('胜者: ' + w.character.name);
    console.log('P1(' + state.players[0].character.name + ') HP=' + state.players[0].hp + ' | P2(' + state.players[1].character.name + ') HP=' + state.players[1].hp);
    showRecap(state, 20);
    return true;
  }
  return false;
}

function showResponseWindow(rw, state) {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║        ⚡ 响应窗口 ⚡     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║ 对手出牌后，你有牌可以响应！');
  console.log('║--- 可选响应 ---');
  for (var i = 0; i < rw.candidates.length; i++) {
    var c = rw.candidates[i];
    console.log('║ [' + i + '] ' + cardDetailCompact(c.card) + ' (来自' + c.player.character.name + ')');
  }
  console.log('╚══════════════════════════════════════════╝');
  console.log('\n>>> respond <n> | skip');
}

// ═══════ 灵系判定看破：通灵判 ═══
function checkJudgmentReveal(p1, p2, state) {
  // 通灵判：有指定牌在场时，可看破对方暗盖
  for (var i = 0; i < p1.actionZone.length; i++) {
    if (p1.actionZone[i].effectType === 'judgmentReveal') {
      state._judgmentRevealed = true; state._p2JzShown = true;
      state.log.push('P1 通灵判：看破P2暗盖牌'); break;
    }
  }
  for (var j = 0; j < p2.actionZone.length; j++) {
    if (p2.actionZone[j].effectType === 'judgmentReveal') {
      state._judgmentRevealed = true; state._p1JzShown = true;
      state.log.push('P2 通灵判：看破P1暗盖牌'); break;
    }
  }
}

function runPvpGame(char1, char2) {
  // Init
  var factionMap = { '血刀':{deck:'modeng_xuedao',char:'xuedao'}, '无极道人':{deck:'wudang_wuji',char:'wuji'}, '夜修罗':{deck:'yintang_yeshura',char:'yeshura'} };
  var h1=factionMap[char1], h2=factionMap[char2];
  if (!h1||!h2) { console.log('可选角色: 血刀/无极道人/夜修罗'); return; }
  if (char1===char2) { console.log('双方不能选相同角色'); return; }

  var state = gs.createGameState(decks[h1.deck], decks[h2.deck], characters[h1.char], characters[h2.char]);
  state.round = 0; state.log = [];
  state._cmdQueue = new er.CommandQueue();  // CommandQueue 驱动响应链

  var p1 = state.players[0], p2 = state.players[1];

  gs.drawCards(p1, CONST.startingDraw, state);
  gs.drawCards(p2, CONST.startingDraw, state);
  state.log.push('=== PVP 对战开始 ===');
  state.log.push('P1(' + p1.character.name + ') vs P2(' + p2.character.name + ')');
  state.log.push('P1 HP=' + p1.hp + ' | P2 HP=' + p2.hp);

  // Readline setup
  var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt('>>> ');

  // Game state for readline callback
  var gameState = { state: state, p1: p1, p2: p2, rl: rl, swaps: 0, mode: 'idle' };

  function startRound() {
    state.round++;
    state.log.push('\n--- 第' + state.round + '回合 ---');
    state._aiJzShownThisRound = false;
    state._judgmentRevealed = false;
    resetRound(p1); resetRound(p2);
    if (checkGameOver(state)) { rl.close(); return; }

    checkSunshine(p1, state); checkSunshine(p2, state);
    if (checkGameOver(state)) { rl.close(); return; }

    // Preparations
    phFsm.setPhase(state, phFsm.Phase.CHOOSE_JUDGMENT);
    gameState.mode = 'judgment_p1';
    chooseJudgmentP1();
  }

  function chooseJudgmentP1() {
    clearScreen();
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    console.log('══════════════ PVP 第' + state.round + '回合 ══════════════');
    console.log('  P1(' + p1.character.name + ') HP=' + p1.hp + '/' + p1.maxHp + ' | P2(' + p2.character.name + ') HP=' + p2.hp + '/' + p2.maxHp);
    console.log('──────────────────────────────────');
    console.log('  轮到: P1（' + p1.character.name + '）选择暗盖牌');
    console.log('──────────────────────────────────');
    showRecap(state, 5);
    console.log('\n你的手牌:');
    for (var i = 0; i < p1.hand.length; i++) console.log('  [' + i + '] ' + cardDetailCompact(p1.hand[i]));
    console.log('\n>>> choice <n> | pass');
    gameState.mode = 'judgment_p1';
    rl.prompt();
  }

  function chooseJudgmentP2() {
    clearScreen();
    console.log('══════════════ PVP 第' + state.round + '回合 ══════════════');
    console.log('  P2(' + p2.character.name + ') HP=' + p2.hp + '/' + p2.maxHp + ' | P1(' + p1.character.name + ') HP=' + p1.hp + '/' + p1.maxHp);
    console.log('──────────────────────────────────');
    console.log('  轮到: P2（' + p2.character.name + '）选择暗盖牌');
    console.log('──────────────────────────────────');
    showRecap(state, 5);
    console.log('\n你的手牌:');
    for (var i = 0; i < p2.hand.length; i++) console.log('  [' + i + '] ' + cardDetailCompact(p2.hand[i]));
    console.log('\n>>> choice <n> | pass');
    gameState.mode = 'judgment_p2';
    rl.prompt();
  }

  function doJudgment() {
    if (!p1.judgmentZone && !p2.judgmentZone) { state.log.push('双方均未暗盖，无劣势方'); startRound(); return; }
    if (!p1.judgmentZone) { state.log.push('P1 无暗盖，直接为劣势方'); gs.gainFlaw(p1, 1, state); if (checkGameOver(state)) { rl.close(); return; } startActionPhase(); return; }
    if (!p2.judgmentZone) { state.log.push('P2 无暗盖，直接为劣势方'); gs.gainFlaw(p2, 1, state); if (checkGameOver(state)) { rl.close(); return; } startActionPhase(); return; }

    cr.runJudgment(p1, p2, state);
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    state.log.push('判定战力 P1=' + p1.totalPower + ' vs P2=' + p2.totalPower);

    var disadvantaged = cr.determineDisadvantaged(p1, p2);
    state.log.push('劣势方: P' + disadvantaged.id + '(' + disadvantaged.character.name + ')');

    if (!disadvantaged.hasDrawnFirstFlaw) { disadvantaged.hasDrawnFirstFlaw = true; gs.drawCards(disadvantaged, 1, state); state.log.push('P'+disadvantaged.id+' 首次劣势，抽1张'); }

    // Show both judgment reveals
    clearScreen();
    console.log('═════════════ 判定揭晓！═════════════');
    console.log('P1 暗盖: ' + (p1.judgmentZone ? cardDetailCompact(p1.judgmentZone) : '无'));
    console.log('P2 暗盖: ' + (p2.judgmentZone ? cardDetailCompact(p2.judgmentZone) : '无'));
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    console.log('战力: P1=' + p1.totalPower + ' vs P2=' + p2.totalPower);
    console.log('劣势方: P' + disadvantaged.id + '(' + disadvantaged.character.name + ')');
    console.log('=====================================');
    showRecap(state, 3);

    gameState.disadvantaged = disadvantaged;
    gameState.swaps = 0;
    startActionPhase();
  }

  function startActionPhase() {
    phFsm.setPhase(state, phFsm.Phase.ACTION);
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    var disadvantaged = p1.totalPower < p2.totalPower ? p1 : (p2.totalPower < p1.totalPower ? p2 : (p1.flaws===p2.flaws?(Math.random()<0.5?p1:p2):(p1.flaws>p2.flaws?p1:p2)));
    gameState.disadvantaged = disadvantaged;
    gameState.swaps = gameState.swaps || 0;

    if (gameState.swaps >= CONST.maxReversalsPerRound) {
      state.log.push('已达最大反转次数('+CONST.maxReversalsPerRound+')，强制结束出牌');
      doResolution();
      return;
    }

    showActionForPlayer(disadvantaged);
  }

  function showActionForPlayer(player) {
    clearScreen();
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    showStateForPlayer(player, state);
    console.log('\n🔄 出牌权: ' + player.character.name + (player.totalPower < (player===p1?p2:p1).totalPower ? ' [劣势方]' : ' [已追平]'));

    // Show opponent hand count (hidden content)
    var opp = player===p1 ? p2 : p1;
    console.log('对手手牌: ' + opp.hand.length + '张');

    console.log('\n>>> choice <n> | pass | bloodwarfare [cost|discard] | bloodmode 1|2 | status');
    gameState.mode = 'action';
    gameState.activePlayer = player;
    rl.prompt();
  }

  function doPlayerAction(player, cmd, arg) {
    var opp = player === p1 ? p2 : p1;
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);

    if (state._exileCandidates && cmd !== 'exilepick') {
      console.log('⚠ 请先完成秘术放逐选择！');
      showExilePrompt();
      rl.prompt(); return;
    }
    if (state._searchExtra && cmd !== 'searchpick') {
      console.log('⚠ 请先完成秘术检索选择！');
      showSearchExtraPrompt();
      rl.prompt(); return;
    }
    if (state._dantianSelect && cmd !== 'dantian') {
      console.log('⚠ 请先选择要摧毁的丹田牌！');
      showDantianSelect();
      rl.prompt(); return;
    }

    if (cmd === 'choice') {
      var idx = parseInt(arg);
      if (isNaN(idx) || idx < 0 || idx >= player.hand.length) { console.log('无效序号，手牌共'+player.hand.length+'张'); rl.prompt(); return; }

      var played = playCard(player, opp, state, idx);
      if (played === false) { console.log('⚠ 内力不足！当前内力:' + player.innerPower); rl.prompt(); return; }

      // Check searchExtra
      // Check searchExtra & response — use last played card
      var playedCard = player.actionZone.length > 0 ? player.actionZone[player.actionZone.length-1] : (player.dantian.length > 0 ? player.dantian[player.dantian.length-1] : null);
      var searchCard = (playedCard && playedCard._data && playedCard._data.effectType === 'searchExtra') ? playedCard : null;
      if (searchCard) {
        var sr = handleSearchExtra(player, opp, state, searchCard);
        if (sr === 'exile') {
          cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
          clearScreen(); showStateForPlayer(player, state);
          showExilePrompt();
          gameState.mode = 'exilepick';
          rl.prompt(); return;
        }
        if (sr === 'search') {
          cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
          clearScreen(); showStateForPlayer(player, state);
          showSearchExtraPrompt();
          gameState.mode = 'searchpick';
          rl.prompt(); return;
        }
      }

      // Response check — dispatch type-specific triggers
      var pvpXf = playedCard && ((playedCard._data || playedCard).type === 'xinfa');
      var triggers = [RESP_TRIGGER.ON_CARD_PLAYED, pvpXf ? RESP_TRIGGER.ON_XINFA_PLAYED : RESP_TRIGGER.ON_WUJI_PLAYED, RESP_TRIGGER.ON_POWER_CHANGE];
      var pvpResp = null;
      for (var ti = 0; ti < triggers.length && !pvpResp; ti++) {
        pvpResp = handleResponseWindowPvp(p1, p2, {trigger: triggers[ti], sourcePlayer: player}, state, rl);
      }
      if (pvpResp === 'response') {
        cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
        clearScreen();
        var responder = state._responseWindow.candidates[0].player;
        state._responderPerspective = responder;
        showStateForPlayer(responder, state);
        showResponseWindow(state._responseWindow, state);
        gameState.mode = 'response';
        rl.prompt(); return;
      }

      // Check caught up after play
      cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
      if (player.totalPower > opp.totalPower) {
        gameState.swaps++;
        state.log.push('反转! P'+player.id+' 追平/反超（第'+gameState.swaps+'次反转）');
        var newDis = player===p1 ? p2 : p1;
        if (!newDis.hasDrawnFirstFlaw) { newDis.hasDrawnFirstFlaw=true; gs.drawCards(newDis,1,state); state.log.push('P'+newDis.id+' 首次劣势，抽1张'); }
        gameState.disadvantaged = newDis;
        showActionForPlayer(newDis);
        return;
      }
      // Still disadvantaged, continue
      showActionForPlayer(player);

    } else if (cmd === 'pass') {
      state.log.push('P'+player.id+' 宣告放弃出牌');
      cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
      var newDis = cr.determineDisadvantaged(p1, p2);
      if (newDis === player) {
        // Still disadvantaged → get flaw → resolution
        state.log.push('P'+player.id+' 连续劣势，获得1破绽！');
        gs.gainFlaw(player, 1, state);
        if (checkGameOver(state)) { rl.close(); return; }
        doResolution();
      } else {
        // Caught up → switch disadvantaged
        gameState.swaps++;
        state.log.push('反转! P'+player.id+' →P'+newDis.id+' 出牌权移交');
        if (!newDis.hasDrawnFirstFlaw) { newDis.hasDrawnFirstFlaw=true; gs.drawCards(newDis,1,state); state.log.push('P'+newDis.id+' 首次劣势，抽1张'); }
        gameState.disadvantaged = newDis;
        if (gameState.swaps >= CONST.maxReversalsPerRound) {
          state.log.push('已达最大反转次数('+CONST.maxReversalsPerRound+')，强制结束出牌');
          doResolution();
        } else {
          showActionForPlayer(newDis);
        }
      }

    } else if (cmd === 'bloodwarfare') {
      if (player.tempStats.passiveUsed) { console.log('本回合已用过被动'); rl.prompt(); return; }
      if (player.character.id !== 'xuedao') { console.log('只有血刀有血战到底'); rl.prompt(); return; }
      player.tempStats.passiveUsed = true;
      player.selfInflictedFlaws = (player.selfInflictedFlaws||0)+1;
      gs.gainFlaw(player, 1, state);

      var mode = null;
      if (arg === 'cost') mode = 'costDown';
      else if (arg === 'discard') mode = 'discardUp';

      if (mode) {
        player.tempStats.bloodWarfareUsed=true; player.tempStats.bloodWarfareMode=mode;
        state.log.push('P'+player.id+' 血战到底：+1破绽('+player.flaws+')，模式='+(mode==='costDown'?'减2费':'弃牌+1'));
        showActionForPlayer(player);
      } else {
        state._pendingBloodMode = true;
        state._bloodWarfarePlayer = player;
        state.log.push('P'+player.id+' 血战到底：+1破绽('+player.flaws+')，等待选择效果');
        cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
        clearScreen(); showStateForPlayer(player, state);
        console.log('\n🔥 血战到底发动！破绽+1。请选择效果：');
        console.log('  [1] 下一张魔教牌消耗-2费');
        console.log('  [2] 下一次震伤弃牌+1');
        console.log('>>> bloodmode 1|2');
        gameState.mode = 'bloodmode';
        rl.prompt();
      }
    } else if (cmd === 'bloodmode') {
      if (!state._pendingBloodMode) { console.log('当前没有待选的血战效果'); rl.prompt(); return; }
      var m = arg==='2'?'discardUp':'costDown';
      state._bloodWarfarePlayer.tempStats.bloodWarfareUsed=true; state._bloodWarfarePlayer.tempStats.bloodWarfareMode=m;
      state._pendingBloodMode=false;
      state.log.push('P'+state._bloodWarfarePlayer.id+' 血战到底：选择模式='+(m==='costDown'?'减2费':'弃牌+1'));
      showActionForPlayer(state._bloodWarfarePlayer);
    }

  }

  function showExilePrompt() {
    console.log('\n══ 秘术检索：选择放逐牌 ══');
    console.log('需要放逐 ' + state._exileNeedCount + ' 张，候选:');
    for (var i = 0; i < state._exileCandidates.length; i++) {
      var e = state._exileCandidates[i];
      console.log('  [' + i + '] 《' + e.name + '》（来源:' + e.zone + '）');
    }
    console.log('>>> exilepick <idx> [<idx>]');
  }

  function showSearchExtraPrompt() {
    console.log('\n══ 秘术检索：选择额外牌 ══');
    for (var i = 0; i < state._searchExtra.length; i++) {
      console.log('  [' + i + '] ' + cardDetailCompact(state._searchExtra[i]));
    }
    console.log('>>> searchpick <n>');
  }

  function showDantianSelect() {
    console.log('\n⚡ 舍身撞：选择要摧毁的心法牌（最多2张）');
    var sel = state._dantianSelect;
    for (var i = 0; i < sel.candidates.length; i++) {
      var c = sel.candidates[i];
      console.log('  [' + i + '] 《' + c.name + '》' + (c.type==='xinfa'?' [心法]':''));
    }
    console.log('>>> dantian <idx> [<idx>]');
  }

  function doResponse(player, cmd, arg) {
    var rw = state._responseWindow;
    if (!rw) { showActionForPlayer(gameState.activePlayer); return; }

    if (cmd === 'respond') {
      var idx = parseInt(arg);
      if (isNaN(idx)||idx<0||idx>=rw.candidates.length) { console.log('无效序号'); rl.prompt(); return; }
      var target = rw.candidates[idx];
      var cid = target.card.id||(target.card._data&&target.card._data.id);
      if (cid) { if (!state._refusedInChain) state._refusedInChain={}; state._refusedInChain[cid]=true; }
      executeResponsePvp(target, state);

      if (state._dantianSelect) {
        cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
        clearScreen(); showStateForPlayer(player, state);
        showDantianSelect();
        gameState.mode = 'dantian_select';
        rl.prompt(); return;
      }

      delete state._responseWindow;
      // CommandQueue 结算响应链
      state._cmdQueue.resolveChain(state);
      cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
      showActionForPlayer(gameState.activePlayer);

    } else if (cmd === 'skip') {
      // Mark all as refused
      if (!state._refusedInChain) state._refusedInChain = {};
      for (var i=0; i<rw.candidates.length; i++) {
        var c = rw.candidates[i];
        var id = c.card.id||(c.card._data&&c.card._data.id);
        if (id) state._refusedInChain[id] = true;
      }
      delete state._responseWindow;
      // Skip → CommandQueue 结算出牌
      state._cmdQueue.resolveChain(state);
      cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
      showActionForPlayer(gameState.activePlayer);
    }
  }

  function doExilepick(player, arg) {
    var candidates = state._exileCandidates;
    var needCount = state._exileNeedCount || 2;
    var indices = arg.trim().split(/\s+/).map(function(s){return parseInt(s);}).filter(function(v,i,a){return !isNaN(v)&&a.indexOf(v)===i;}).sort(function(a,b){return b-a;});
    if (indices.length===0||indices.length>needCount) { console.log('请选择1-'+needCount+'张，空格分隔'); rl.prompt(); return; }
    for (var ii=0;ii<indices.length;ii++) { if (indices[ii]<0||indices[ii]>=candidates.length) { console.log('序号'+indices[ii]+'超出范围'); rl.prompt(); return; } }

    for (var ei=0;ei<indices.length;ei++) {
      var t=candidates[indices[ei]]; player.exileZone.push(t.card);
      if (t.zone==='discardPile'||t.zone==='discard') removeFromArr(player.discardPile,t.card);
      else if (t.zone==='mainDeck') removeFromArr(player.mainDeck,t.card);
      else if (t.zone==='actionZone') removeFromArr(player.actionZone,t.card);
      else if (t.zone==='hand') removeFromArr(player.hand,t.card);
      state.log.push('P'+player.id+' 放逐《'+t.name+'》（'+t.zone+'）');
    }

    // Now show extra cards to pick
    var data = state._exileSearchData;
    var FACTION_MAP={'魔教':'modeng','武当':'wudang','隐堂':'yintang'};
    var nf = data ? (FACTION_MAP[data.searchFaction]||data.searchFaction) : null;
    var eligible = player.extraDeck.filter(function(ec){var ef=ec._data.faction; return !nf||ef===nf||(Array.isArray(ef)&&ef.indexOf(nf)>=0);});
    if (eligible.length>0) { state._searchExtra=eligible; state._exileCandidates=null; state._exileNeedCount=0; state._exileSearchData=null;
      cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
      clearScreen(); showStateForPlayer(player, state);
      showSearchExtraPrompt(); gameState.mode='searchpick'; rl.prompt();
    } else { state._exileCandidates=null; state._exileNeedCount=0; state._exileSearchData=null; state._searchExtra=null;
      if (data && data.bonusDraw) gs.drawCards(player, data.bonusDraw, state);
      showActionForPlayer(player); }
  }

  function doSearchpick(player, arg) {
    var idx = parseInt(arg);
    if (isNaN(idx)||idx<0||idx>=state._searchExtra.length) { console.log('无效序号'); rl.prompt(); return; }
    var chosen = state._searchExtra[idx];
    if (player.hand.length >= CONST.maxHandSize) { player.discardPile.push(cloneCard(chosen)); state.log.push('P'+player.id+' 手牌已满，'+chosen._data.name+'溢出'); }
    else { player.hand.push(cloneCard(chosen)); state.log.push('P'+player.id+' 秘术检索入手《'+chosen._data.name+'》'); }
    var data = state._exileSearchData;
    if (data && data.bonusDraw) gs.drawCards(player, data.bonusDraw, state);
    state._searchExtra=null;

    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    showActionForPlayer(player);
  }

  function doDantianSelect(targetPlayer, arg) {
    var sel = state._dantianSelect;
    // targetPlayer = the player whose dantian cards are being destroyed
    var destroyer = state.players[sel.oppId === 1 ? 1 : 0]; // the player who activated 舍身撞
    var indices = arg.trim().split(/\s+/).map(function(s){return parseInt(s);}).filter(function(v,i,a){return !isNaN(v)&&a.indexOf(v)===i;}).sort(function(a,b){return b-a;});
    if (indices.length===0||indices.length>sel.maxSelect) { console.log('请选择1-'+sel.maxSelect+'张'); rl.prompt(); return; }

    for (var i=0;i<indices.length;i++) {
      var idx=indices[i];
      if (idx<0||idx>=sel.candidates.length) { console.log('序号'+idx+'超出范围'); rl.prompt(); return; }
      var targetCard = targetPlayer.dantian[idx];
      gs.removeDantianCard(targetPlayer, targetCard, state);
      state.log.push('P'+destroyer.id+' 舍身撞→摧毁《'+sel.candidates[idx].name+'》');
    }

    delete state._dantianSelect;
    // KillDantianCmd 已手动处理 → 出栈
    state._cmdQueue.stack.pop();

    // Resume action for the player who was playing
    if (state.phase === phFsm.Phase.ACTION) {
      cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
      showActionForPlayer(gameState.activePlayer);
    }
  }

  function doResolution() {
    cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
    var advantaged = p1.totalPower > p2.totalPower ? p1 : p2;
    var disadvantaged = advantaged === p1 ? p2 : p1;

    // Phase A: effects
    runPhaseA(p1, p2, state, disadvantaged, advantaged);
    if (checkGameOver(state)) { rl.close(); return; }

    // Phase B: clear zones
    processDelayedDantian(p1, state); processDelayedDantian(p2, state);
    clearZones(p1, state); clearZones(p2, state);
    if (checkGameOver(state)) { rl.close(); return; }

    // Phase C: draw
    gs.drawCards(disadvantaged, 1, state);
    gs.drawCards(advantaged, 2, state);
    state.log.push('结算: P'+disadvantaged.id+'(劣)抽1, P'+advantaged.id+'(优)抽2');

    clearScreen();
    console.log('══════════ 回合结束 ══════════');
    console.log('劣势方 P'+disadvantaged.id+'('+disadvantaged.character.name+') 抽1 | 优势方 P'+advantaged.id+'('+advantaged.character.name+') 抽2');
    console.log('P1 HP='+p1.hp+'/'+p1.maxHp+' | P2 HP='+p2.hp+'/'+p2.maxHp);
    showRecap(state, 6);
    if (checkGameOver(state)) { rl.close(); return; }

    console.log('\n按 Enter 开始下一回合...');
    gameState.mode = 'next_round';
    rl.prompt();
  }

  // ═══ Readline handler ═══
  rl.on('line', function(line) {
    line = line.trim();
    if (!line) {
      if (gameState.mode === 'next_round') { startRound(); }
      else rl.prompt();
      return;
    }

    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(' ');

    if (cmd === 'quit' || cmd === 'exit') { console.log('GG!'); rl.close(); return; }
    if (cmd === 'status') {
      clearScreen();
      var showP = gameState.activePlayer || p1;
      cr.calcTotalPower(p1, state); cr.calcTotalPower(p2, state);
      showStateForPlayer(showP, state);
      console.log('\n当前模式: ' + gameState.mode);
      rl.prompt();
      return;
    }

    if (gameState.mode === 'judgment_p1') {
      if (cmd === 'choice') { var i=parseInt(arg); if (isNaN(i)||i<0||i>=p1.hand.length){console.log('无效');rl.prompt();return;} p1.judgmentZone=p1.hand[i]; removeFromHand(p1,p1.hand[i]); state.log.push('P1 暗盖1张'); chooseJudgmentP2(); }
      else if (cmd === 'pass') { p1.judgmentZone=null; state.log.push('P1 放弃暗盖'); chooseJudgmentP2(); }
      else { console.log('未知命令'); rl.prompt(); }

    } else if (gameState.mode === 'judgment_p2') {
      if (cmd === 'choice') { var i=parseInt(arg); if (isNaN(i)||i<0||i>=p2.hand.length){console.log('无效');rl.prompt();return;} p2.judgmentZone=p2.hand[i]; removeFromHand(p2,p2.hand[i]); state.log.push('P2 暗盖1张'); doJudgment(); }
      else if (cmd === 'pass') { p2.judgmentZone=null; state.log.push('P2 放弃暗盖'); doJudgment(); }
      else { console.log('未知命令'); rl.prompt(); }

    } else if (gameState.mode === 'exilepick') {
      doExilepick(gameState.activePlayer, arg);

    } else if (gameState.mode === 'searchpick') {
      doSearchpick(gameState.activePlayer, arg);

    } else if (gameState.mode === 'dantian_select') {
      var sel = state._dantianSelect;
      var targetPlayer = sel.oppId === 1 ? p1 : p2;
      doDantianSelect(targetPlayer, arg);

    } else if (gameState.mode === 'action' || gameState.mode === 'bloodmode') {
      var player = gameState.mode==='bloodmode'?state._bloodWarfarePlayer:gameState.activePlayer;
      doPlayerAction(player, cmd, arg);

    } else if (gameState.mode === 'response') {
      var responder = state._responderPerspective || gameState.activePlayer;
      doResponse(responder, cmd, arg);

    } else {
      console.log('未知游戏模式: ' + gameState.mode);
      rl.prompt();
    }
  });

  rl.on('close', function() { process.exit(0); });

  // Start!
  console.log('\n═════════════════════════════════════');
  console.log('  ⚔️  江湖对决 PVP 模式 ⚔️');
  console.log('═════════════════════════════════════');
  console.log('  P1: ' + p1.character.name + ' | P2: ' + p2.character.name);
  console.log('═════════════════════════════════════');
  console.log('热座模式 — 回合间清屏保护暗盖信息');
  console.log('命令: choice <n> | pass | bloodwarfare [cost|discard]');
  console.log('      bloodmode 1|2 | respond <n> | skip | status | quit');
  console.log('\n按 Enter 开始游戏...');
  gameState.mode = 'start';
  rl.prompt();

  // Handle start
  var firstLine = true;
  var origOn = rl._onLine;
  // Override to catch first Enter
  var oldListener = rl.listeners('line')[rl.listeners('line').length-1];
  rl.removeListener('line', oldListener);
  rl.on('line', function starter(line) {
    rl.removeListener('line', starter);
    rl.on('line', oldListener);
    startRound();
  });
}

// ═══ Entry ═══
var args = process.argv.slice(2);
var char1 = args[0] || '血刀';
var char2 = args[1] || '无极道人';
runPvpGame(char1, char2);
