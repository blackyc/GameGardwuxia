// ═══════════════════════════════════════════
//  AI 选择策略 (aiSelectors) — 可扩展接口
//
//  设计原则:
//  1. 所有"选择"型效果的AI决策集中于此
//  2. 每个选择器导出: select*(ctx, candidates) → 结果
//  3. 评分函数 score* 可被外部替换（训练/调优）
//  4. Human 路径不经过此模块，仅AI调用
//
//  后续可接入: 神经网络评分、历史数据训练、RL策略
// ═══════════════════════════════════════════

// ═══════ 基础工具 ═══════

function cardData(c) { return c._data || c; }
function cardName(c) { return cardData(c).name || '?'; }
function cardFaction(c) { return cardData(c).faction || ''; }
function cardType(c) { return cardData(c).type || ''; }
function cardEffectType(c) { return cardData(c).effectType || ''; }
function cardPower(c) { return cardData(c).power || 0; }
function cardInnerPower(c) { return cardData(c).innerPower || 0; }
function isXinfa(c) { return cardType(c) === 'xinfa'; }
function isWuji(c) { return cardType(c) === 'wuji'; }

// ═══════ 上下文构建 ═══════

/** 从游戏状态构建完整策略上下文 */
function buildContext(player, opponent, state, extra) {
  return {
    player: player,
    opponent: opponent,
    state: state,
    myHp: player.hp,
    oppHp: opponent.hp,
    myFlaws: player.flaws,
    oppFlaws: opponent.flaws,
    myInner: player.innerPower,
    oppInner: opponent.innerPower,
    myDantianSize: player.dantian.length,
    oppDantianSize: opponent.dantian.length,
    myHandSize: player.hand.length,
    oppHandSize: opponent.hand.length,
    round: state.round || 0,
    isDisadvantaged: state._disadvantagedSide === ('player' + player.id),
    // 额外上下文（牌使用场景）
    extra: extra || {}
  };
}

// ═══════ 舍身撞：选择对方丹田心法 ═══════
//   ctx._dantianSelect 携带候选信息
//   返回: cards[] (按 innerPower 降序，最多 maxSelect 张)

function scoreDantianForDestruction(dc, ctx) {
  var d = cardData(dc);
  var score = 0;

  // 内功产出越高，摧毁价值越大
  score += (d.innerPower || 0) * 10;

  // 门派专属心法价值更高（对手机制核心）
  if (d.faction && d.faction !== 'public') score += 25;

  // Combo 核心标记（effectType 含 combo 特征）
  var et = d.effectType;
  if (et === 'dantianInnerToPowerBuff') score += 20;  // 武当主力
  if (et === 'lowerPoisonThreshold' || et === 'poisonBurstInnerUp') score += 20;  // 隐堂核心
  if (et === 'zhengshangDrain' || et === 'selfFlawGivesInner') score += 20;  // 魔教核心
  if (et === 'persistInDiscard' || et === 'persistInDiscard_inner') score -= 10;  // 弃牌堆还能用的，摧毁价值较低

  // 对方内力越充足，摧毁高内功产出越重要
  if (ctx.oppInner >= 5) score += 15;

  // 对方HP越低，摧毁防御型效果越不重要
  if (ctx.oppHp <= 1 && et === 'flawHeal') score -= 10;

  return score;
}

exports.selectDantianDestruction = function(ctx, candidates, maxSelect) {
  if (!candidates || candidates.length === 0) return [];

  // 评分 + 排序
  var scored = candidates.map(function(c) {
    return { card: c, score: scoreDantianForDestruction(c, ctx) };
  });
  scored.sort(function(a, b) { return b.score - a.score; });

  var result = [];
  for (var i = 0; i < scored.length && result.length < maxSelect; i++) {
    result.push(scored[i].card);
  }
  return result;
};

// ═══════ 秘术放逐：选择献祭哪几张 ═══════
//   targets: [{card, zone, name}, ...]
//   返回: 被选中的 target 对象数组

function scoreExileCard(target, ctx) {
  var d = cardData(target.card);
  var score = 0;

  // 弃牌堆优先（没在手牌的永远不会打出）
  if (target.zone === 'discardPile' || target.zone === 'discard') score += 50;
  // 手牌次之（消费实际资源）
  else if (target.zone === 'hand') score -= 30;
  // actionZone 更差（可能正在使用）
  else if (target.zone === 'actionZone') score -= 40;
  // mainDeck（减少未来抽到）
  else score -= 10;

  // 低价值卡优先放逐
  score -= (d.innerPower || 0) * 5;
  score -= (d.power || 0) * 2;

  // 门派核心不优先放逐
  if (d.faction && d.faction !== 'public') score -= 15;

  // 手牌中有多张同名牌时优先放逐
  // （在调用方统计）

  return score;
}

exports.selectExileCards = function(ctx, targets, needCount) {
  if (!targets || targets.length === 0) return [];
  if (targets.length <= needCount) return targets.slice();

  var scored = targets.map(function(t) {
    return { target: t, score: scoreExileCard(t, ctx) };
  });
  scored.sort(function(a, b) { return b.score - a.score; });

  var result = [];
  for (var i = 0; i < scored.length && result.length < needCount; i++) {
    result.push(scored[i].target);
  }
  return result;
};

// ═══════ 秘术检索：从额外区选择加入手牌 ═══════
//   cards: eligible extra deck cards
//   返回: 选中的 card

function scoreSearchCard(card, ctx) {
  var d = cardData(card);
  var score = 0;

  // 当前内力是否够支付
  if (ctx.myInner >= (d.cost || 99)) score += 10;

  // 战力越高越好
  score += (d.power || 0) * 3;
  score += (d.innerPower || 0) * 2;

  // 心法优先（长期投资）
  if (isXinfa(card)) score += 15;

  // 震伤牌即时价值
  var et = d.effectType;
  if (et === 'zhengshang' || et === 'zhengshang_trigger') score += 20;

  // 破绽优势时克制加成优先
  if (ctx.oppFlaws > 0 && et === 'conditionalPower_flaw_plus3') score += 25;

  return score;
}

exports.selectSearchCard = function(ctx, candidates) {
  if (!candidates || candidates.length === 0) return null;

  var scored = candidates.map(function(c) {
    return { card: c, score: scoreSearchCard(c, ctx) };
  });
  scored.sort(function(a, b) { return b.score - a.score; });

  return scored[0].card;
};

// ═══════ 评分器导出（供外部替换/训练） ═══════

exports.scoreDantianForDestruction = scoreDantianForDestruction;
exports.scoreExileCard = scoreExileCard;
exports.scoreSearchCard = scoreSearchCard;
exports.buildContext = buildContext;
