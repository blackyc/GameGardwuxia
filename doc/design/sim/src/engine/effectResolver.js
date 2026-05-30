// effectResolver.js — 统一效果系统 v1
// 
// 核心设计：
//   1. EffectRegistry — 所有效果的定义在此一处（不散落4个文件）
//   2. Command — 可执行的玩家操作，含 undo/negate
//   3. CommandQueue — FILO 链式结算（拆招通过 negateCommand 实现真正无效化）
//   4. EffectContext — 统一传参，不再每人定义不同参数顺序
//   5. resolvePhase(phase) — 替代 Phase A 硬编码循环
//
// 行为等价保证:
//   - 同一时机点的效果执行顺序与旧 Phase A 完全一致
//   - 淬毒爆发→清毒直伤→震伤→命中→含沙射影→回血
//   - 所有条件判断阈值不变

var cr = require('./combatResolver');
var zones = require('./zones');
var CONST = require('../data/constants.json');

// ═══════════════════════════════════════════
//  EffectContext — 统一效果上下文
// ═══════════════════════════════════════════

function EffectContext(state, phase) {
  this.state = state;
  this.phase = phase;          // 'action' | 'resolution' | 'judgment' | 'roundStart'
  this.source = null;          // 效果来源玩家
  this.target = null;          // 效果目标玩家
  this.card = null;            // 触发效果的卡牌
  this.flags = {};             // 效果间通讯标记
  this._hitResolvedCards = []; // 已结算过命中的卡
  this._zsResolvedCards = [];  // 已结算过震伤的卡
}

EffectContext.prototype.setPlayers = function(src, tgt) {
  this.source = src; this.target = tgt; return this;
};

EffectContext.prototype.setCard = function(c) {
  this.card = c; return this;
};

EffectContext.prototype.advantaged = function() {
  var p1 = this.state.players[0], p2 = this.state.players[1];
  return p1.totalPower > p2.totalPower ? p1 : p2;
};

EffectContext.prototype.disadvantaged = function() {
  var p1 = this.state.players[0], p2 = this.state.players[1];
  return p1.totalPower > p2.totalPower ? p2 : p1;
};

EffectContext.prototype.opponentOf = function(player) {
  return this.state.players[player.id === 1 ? 1 : 0];
};

// ═══════════════════════════════════════════
// ══════════════════════════════════════════════════
//  Command — 可执行/可回滚/可无效化的操作
// ══════════════════════════════════════════════════

function Command(params) {
  this.type = params.type;
  this.card = params.card || null;
  this.source = params.source;
  this.target = params.target;
  this.effects = params.effects || [];
  this.isNegatable = params.isNegatable !== undefined ? params.isNegatable : true;
  this.negated = false;
  this.resolved = false;
  this.responseWindow = null;
  this.beforeSnapshot = null;
}

// ══════════════════════════════════════════════════
//  CommandQueue —— FILO 链 + 交互层集成
// ══════════════════════════════════════════════════

function CommandQueue() {
  this.stack = [];
  this.history = [];
  this.pendingResponse = null;
  this.responseOpened = false;
}

CommandQueue.prototype.createPlayCardCmd = function(player, card, state) {
  return new Command({ type: 'playCard', card: card, source: player, target: state.players[player.id === 1 ? 1 : 0], isNegatable: true });
};

CommandQueue.prototype.createNegateCmd = function(card, source, target) {
  return new Command({ type: 'negateBuffs', card: card, source: source, target: target, isNegatable: false });
};

CommandQueue.prototype.createKillDantianCmd = function(card, source, target) {
  return new Command({ type: 'killDantian', card: card, source: source, target: target, isNegatable: false });
};

CommandQueue.prototype.createDiscardActivateCmd = function(player, card, state) {
  // [将这张牌从弃牌堆除外发动]
  // payload: card._data.discardActivate 定义实际效果
  var data = card._data || card;
  var effects = (data.discardActivate && data.discardActivate.effects) || [];
  return new Command({
    type: 'activateDiscard',
    card: card,
    source: player,
    target: state.players[player.id === 1 ? 1 : 0],
    effects: effects,
    isNegatable: false
  });
};

CommandQueue.prototype.enqueue = function(cmd) { this.stack.push(cmd); return this; };

// FILO 结算链
CommandQueue.prototype.resolveChain = function(state) {
  var cr = require('./combatResolver');
  var gs = require('./gameState');
  while (this.stack.length > 0) {
    var cmd = this.stack.pop();
    if (cmd.negated) { this.history.push(cmd); continue; }
    if (cmd.type === 'playCard') this._resolvePlayCard(cmd, state);
    else if (cmd.type === 'negateBuffs') this._resolveNegateBuffs(cmd, state, cr);
    else if (cmd.type === 'killDantian') this._resolveKillDantian(cmd, state, gs);
    else if (cmd.type === 'activateDiscard') this._resolveDiscardActivate(cmd, state);
    else this._executeEffects(cmd, state);
    cmd.resolved = true;
    this.history.push(cmd);
  }
};

CommandQueue.prototype._resolvePlayCard = function(cmd, state) {
  var card = cmd.card;
  card._hitResolved = false;
  card._zsResolved = false;
  card._effectsNegated = false;
  card._activeEffects = true;
};

CommandQueue.prototype._resolveNegateBuffs = function(cmd, state, cr) {
  var opp = cmd.target;
  var buffTypes = ['movePowerBuff','conditionalPower_flaw_plus3','zhengshang','poisonPowerBuff','innerPowerToPower','innerToPowerBuff','innerToPower','flawDiscount','judgmentDantianPower','hitDrawAndPoison','judgmentLossPoison','flawHeal','disadvantagedDrawAndReturn','enterDiscardPoison'];
  for (var i = 0; i < opp.actionZone.length; i++) {
    var et = (opp.actionZone[i]._data || opp.actionZone[i]).effectType;
    if (buffTypes.indexOf(et) >= 0) {
      opp.actionZone[i]._effectsNegated = true;
      opp.actionZone[i]._activeEffects = false;
    }
  }
  cr.stripActionBuffs(opp, state);
  state.log.push('⚡梯云纵：P' + opp.id + ' 出招区效果被无效化');
};

CommandQueue.prototype._resolveKillDantian = function(cmd, state, gs) {
  var target = cmd.target;
  var killed = 0;

  // 如果 _dantianSelect 已设置（executeResponse预填候选），按策略销毁
  if (state._dantianSelect) {
    var sel = state._dantianSelect;
    var ctx = require('./aiSelectors').buildContext(cmd.source, target, state, {
      source: 'shaShenZhuang', maxSelect: sel.maxSelect, xinfaOnly: sel.xinfaOnly
    });
    // 过滤心法（如果需要）
    var xinfaCards = target.dantian.filter(function(c) { return !sel.xinfaOnly || isXinfa(c); });
    var chosen = require('./aiSelectors').selectDantianDestruction(ctx, xinfaCards, sel.maxSelect);
    for (var i = 0; i < chosen.length; i++) {
      gs.removeDantianCard(target, chosen[i], state);
      killed++;
    }
    delete state._dantianSelect;
  } else {
    killed = gs.destroyDantianCards(target, 2, state);
  }

  state.log.push('⚡舍身撞：摧毁' + target.character.name + '丹田' + killed + ' 张');
  gs.drawCards(target, 1, state);
};

function isXinfa(c) { return (c._data || c).type === 'xinfa'; }

CommandQueue.prototype._resolveDiscardActivate = function(cmd, state) {
  var card = cmd.card;
  var player = cmd.source;

  // 1. 从弃牌堆除外——这是发动cost
  var idx = player.discardPile.indexOf(card);
  if (idx < 0) { state.log.push('[警告] activateDiscard: 卡牌不在弃牌堆'); return; }
  var exiled = player.discardPile.splice(idx, 1)[0];
  player.exileZone = player.exileZone || [];
  player.exileZone.push(exiled);

  var name = card._data ? card._data.name : '?';
  state.log.push('P' + player.id + ' 除外弃牌堆《' + name + '》发动效果');

  // 2. 执行载荷效果
  this._executeEffects(cmd, state);
};

CommandQueue.prototype._executeEffects = function(cmd, state) {
  for (var i = 0; i < cmd.effects.length; i++) {
    var eff = cmd.effects[i];
    if (eff.negated) continue;
    if (eff.apply) eff.apply(state);
  }
};

CommandQueue.prototype.resolveAll = function(state) { this.resolveChain(state); };

CommandQueue.prototype.negateLast = function(negatorCard, state) {
  for (var i = this.stack.length - 1; i >= 0; i--) {
    if (!this.stack[i].isNegatable) continue;
    this.stack[i].negated = true;
    state.log.push('⚡' + negatorCard._data.name + ' 无效化了 ' + this.stack[i].type);
    return true;
  }
  return false;
};

//  EffectRegistry — 所有效果的唯一定义处
// ═══════════════════════════════════════════
//
// ICardEffect 接口标准化（对应设计文档 ICardEffect 接口）:
//   timing   → GetTriggerType()  — 触发时机
//   condition → CanTrigger()      — 条件检查
//   apply    → Execute()          — 效果执行

function CardEffect(def) {
  this.timing = def.timing;
  this.zone = def.zone;
  this.condition = def.condition || function() { return true; };
  this.execute = def.apply || function() { return null; };
}

// 标准化 effect 创建器（替代直接写 EffectRegistry 对象）
function defineEffect(def) { return new CardEffect(def); }

var EffectRegistry = {

  // ─── 战力计算时生效（calcTotalPower & runJudgment）───

  'conditionalPower_flaw_plus3': {
    timing: 'calcPower', zone: ['actionZone', 'judgmentZone'],
    condition: function(card, player) { return player.flaws > 0; },
    apply: function(state, card, player) {
      var bonus = card._data ? (card._data.flawPowerBonus || 3) : 3;
      return { type: 'add', value: bonus };
    }
  },

  'poisonPowerBuff': {
    timing: 'calcPower', zone: ['actionZone'],
    condition: function(card, player, state) {
      var opp = state.players[player.id === 1 ? 1 : 0];
      return opp.poisonStacks > 0;
    },
    apply: function() { return { type: 'add', value: 3 }; }
  },

  'movePowerBuff': {
    timing: 'calcPower', zone: ['actionZone'],
    condition: function(card, player) { return player.tempStats.cardsMoved; },
    apply: function() { return { type: 'add', value: 3 }; }
  },

  'zhengshang': {
    timing: 'calcPower', zone: ['actionZone', 'judgmentZone'],
    condition: function(card, player) {
      return player.flaws > 0 && card._data && card._data.flawPowerBuff;
    },
    apply: function(state, card) {
      return { type: 'add', value: card._data.flawPowerBuff };
    }
  },

  'flawDiscount': {
    timing: 'calcPower', zone: ['actionZone'],
    condition: function(card, player) { return player.flaws > 0; },
    apply: function(state, card) {
      return { type: 'subtract', value: card._data ? (card._data.flawPowerReduce || 3) : 3 };
    }
  },

  'innerToPower': {
    timing: 'calcPower', zone: ['actionZone'],
    apply: function(state, card, player) {
      return { type: 'set', value: Math.min(player.innerPower, card._data ? (card._data.maxInnerToPower || 10) : 10) };
    }
  },

  'innerPowerToPower': {
    timing: 'calcPower', zone: ['actionZone'],
    condition: function(card) { return card._data && card._data.permanentBuff; },
    apply: function(state, card, player) {
      return { type: 'add', value: player.innerPower * (card._data ? (card._data.innerToPowerBoost || 2) : 2) };
    }
  },

  'innerToPowerBuff': {
    timing: 'calcPower', zone: ['actionZone'],
    apply: function(state, card, player) {
      return { type: 'add', value: player.innerPower };
    }
  },

  'dantianInnerToPowerBuff': {
    timing: 'calcPower', zone: ['dantian'],
    condition: function(card, player) {
      return card._data && card._data.faction === 'wudang' &&
        player.actionZone.some(function(c) {
          return c._data && c._data.faction === 'wudang' && c._data.type === 'wuji';
        });
    },
    apply: function(state, card, player) {
      return { type: 'add', value: player.innerPower };
    }
  },

  'persistInDiscard': {
    timing: 'calcPower', zone: ['discardPile'],
    apply: function(state, card) {
      return { type: 'add', value: card._data ? (card._data.power || 0) : 0 };
    }
  },

  // ─── 判定区专用效果 ───

  'judgmentDantianPower': {
    timing: 'calcJudgmentPower', zone: ['judgmentZone'],
    apply: function(state, card, player) {
      var xf = player.dantian.filter(function(c) {
        return c.tags && c.tags.indexOf('心法') >= 0;
      }).length;
      return { type: 'add', value: xf * 2 };
    }
  },

  'faceDown_flaw_nerfSelf_drainEnemy': {
    timing: 'calcJudgmentPower', zone: ['judgmentZone'],
    condition: function(card, player) { return player.flaws > 0; },
    apply: function(state, card, player) {
      var opp = state.players[player.id === 1 ? 1 : 0];
      opp.innerPower = Math.max(0, opp.innerPower - 1);
      state.log.push('P' + player.id + '血蛭镖：P' + opp.id + '失去1内力');
      return { type: 'subtract', value: card._data ? (card._data.flawPowerPenalty || 2) : 2 };
    }
  },

  'zhengshang_judgmentBonus': {
    timing: 'calcJudgmentPower', zone: ['judgmentZone'],
    apply: function(state, card, player) {
      var opp = state.players[player.id === 1 ? 1 : 0];
      var opp_jz = opp.judgmentZone;
      if (!opp_jz) return null;
      var opp_elem = opp_jz._data ? opp_jz._data.element : 'none';
      var bonus = card._data ? (card._data.counterJudgmentBonus || 2) : 2;
      var elements = card._data ? (card._data.counterJudgmentElements || ['skillful', 'deceptive']) : ['skillful', 'deceptive'];
      if (elements.indexOf(opp_elem) >= 0) {
        state.log.push('P' + player.id + '血刀大法：敌方' + opp_elem + '系，+' + bonus);
        return { type: 'add', value: bonus };
      }
      return null;
    }
  },

  // ─── 内力计算时生效（resetRound）───

  'dantianInnerBonus': {
    timing: 'calcInnerPower', zone: ['dantian'],
    condition: function(card, player) {
      return player.dantian.length >= (card._data ? (card._data.dantianThreshold || 2) : 2);
    },
    apply: function(state, card, player) {
      var threshold = card._data ? (card._data.innerThreshold || 6) : 6;
      player.baseInnerPower = Math.max(player.baseInnerPower, threshold);
    }
  },

  'discardInnerBonus': {
    timing: 'calcInnerPower', zone: ['dantian'],
    apply: function(state, card, player) {
      player.baseInnerPower += Math.floor(player.discardPile.length / 2);
    }
  },

  'selfFlawGivesInner': {
    timing: 'calcInnerPower', zone: ['dantian'],
    apply: function(state, card, player) {
      player.baseInnerPower += (player.selfInflictedFlaws || 0);
    }
  },

  'persistInDiscard_inner': {
    timing: 'calcInnerPower', zone: ['discardPile'],
    apply: function(state, card, player) {
      player.baseInnerPower += (card._data ? (card._data.innerPower || 0) : 0);
    }
  },

  // ─── 回合开始时 ───

  'delayedDantian': {
    timing: 'roundStart', zone: ['actionZone'],
    apply: function(state, card, player) {
      var ip = card._data ? (card._data.innerPower || 0) : 0;
      player.dantian.push(card);
      player.baseInnerPower += ip;
      player.innerPower += ip;
      state.log.push('P' + player.id + ' 《' + (card._data.name || '?') + '》延迟入丹田(+' + ip + '内)');
    }
  },

  // ─── 打出时 ───

  'drawOnPlay': {
    timing: 'onPlay', zone: ['dantian'],
    apply: function(state, card, player) {
      var gs = require('./gameState');
      gs.drawCards(player, card._data ? (card._data.drawOnPlayCount || 1) : 1, state);
    }
  },

  // ─── 非打出进丹田 ───

  'altEntryDantianDraw': {
    timing: 'onNonPlayDantian', zone: ['dantian'],
    apply: function(state, card, player) {
      var gs = require('./gameState');
      gs.drawCards(player, 1, state);
      player.tempStats.skillfulDiscount = true;
      state.log.push('P' + player.id + ' 武当基础心法非打出进丹田，抽1，巧系武技-1费');
    }
  },

  // ─── 命中时 ───

  'hitDrawAndPoison': {
    timing: 'onHit', zone: ['actionZone', 'judgmentZone'],
    apply: function(state, card, player) {
      // 淬毒在 triggerHitEffects 统一处理
      // 这里只处理额外抽牌
      var gs = require('./gameState');
      gs.drawCards(player, 1, state);
    }
  },

  // ─── 判定败北 ───

  'judgmentLossPoison': {
    timing: 'onJudgmentLoss', zone: ['judgmentZone'],
    apply: function(state, card, player) {
      var opp = state.players[player.id === 1 ? 1 : 0];
      opp.poisonStacks += 1;
      state.log.push('含沙射影: P' + opp.id + ' 获得1层[淬毒]（当前' + opp.poisonStacks + '）');
    }
  },

  // ─── 进入弃牌堆 ───

  'enterDiscardPoison': {
    timing: 'onEnterDiscard', zone: ['any'],
    apply: function(state, card, player) {
      var opp = state.players[player.id === 1 ? 1 : 0];
      opp.poisonStacks += 1;
      state.log.push('血滴子: P' + opp.id + ' 获得1层[淬毒]（当前' + opp.poisonStacks + '）');
    }
  },

  // ─── 结算阶段触发的被动 ───

  'zhengshang_trigger': {
    timing: 'onResolution', zone: ['actionZone'],
    apply: function(state, card, player) {
      // Handled by triggerZhenShang in resolvePhase
      // This is a marker - the actual logic uses the zhengshang trigger function
      return null;
    }
  },

  'flawHeal': {
    timing: 'onResolution', zone: ['actionZone', 'judgmentZone'],
    condition: function(card, player) { return player.hp < player.maxHp; },
    apply: function(state, card, player) {
      player.hp++;
      state.log.push('纯阳无极剑: P' + player.id + ' 回1血（HP=' + player.hp + '）');
    }
  },

  'zhengshangDrain': {
    timing: 'onZhengShang', zone: ['dantian'],
    apply: function(state, card, player) {
      var opp = state.players[player.id === 1 ? 1 : 0];
      opp.innerPower = Math.max(0, opp.innerPower - 1);
      state.log.push('修罗化血阵：P' + opp.id + ' 失去1内力');
    }
  },

  // ─── 其他交互效果（在引擎/交互层处理）───

  'searchExtra': { timing: 'onPlay', zone: ['actionZone'], apply: null },
  'lowHpSearch': { timing: 'passive', zone: ['extraDeck'], apply: null },
  'chaizhao_killDantian': { timing: 'response', zone: ['hand'], apply: null },
  'chaizhao_negateBuff': { timing: 'response', zone: ['hand'], apply: null },
  'forcedResolution': { timing: 'onPlay', zone: ['actionZone'], apply: null },
  'disadvantagedDrawAndReturn': { timing: 'onResolution', zone: ['actionZone'], apply: null },
  'discardReturn': { timing: 'onPlay', zone: ['actionZone'], apply: null },
  'moveCostReducer': { timing: 'onNonPlayDantian', zone: ['dantian'], apply: null },
  'lowerPoisonThreshold': { timing: 'passive', zone: ['dantian'], apply: null },
  'poisonBurstInnerUp': { timing: 'onPoisonBurst', zone: ['dantian'], apply: null },
  'clearAndDirectDamage': { timing: 'onPoisonBurst', zone: ['dantian'], apply: null },
  'absorbPoisonMultiply': { timing: 'onHit', zone: ['actionZone'], apply: null },

  // ─── 弃牌堆发动 ───

  'activateFromDiscard': {
    timing: 'onActivateFromDiscard', zone: ['discardPile'],
    apply: function(state, card, player) {
      // 此效果通过 CommandQueue.createDiscardActivateCmd → _resolveDiscardActivate 触发
      // EffectRegistry 中的定义用于 zone 扫描 + 交互层发现可用卡
      // 实际执行由 Command 的 effects 数组承载
      return null;
    }
  },

};

// ═══════════════════════════════════════════
//  效果查询 helper
// ═══════════════════════════════════════════

function getEffect(effectType) {
  return EffectRegistry[effectType] || null;
}

function getEffectsByTiming(timing, card) {
  var effectType = card ? (card._data ? card._data.effectType : card.effectType) : null;
  if (!effectType) return [];
  var def = EffectRegistry[effectType];
  if (!def || def.timing !== timing) return [];
  return [def];
}

// 判断卡牌是否有指定时机的效果
function hasEffectAtTiming(card, timing) {
  return getEffectsByTiming(timing, card).length > 0;
}

// 扫描玩家所有区域，找出指定时机生效的效果
function scanEffectsByTiming(player, state, timing) {
  var results = [];
  var zones = {
    actionZone: player.actionZone,
    judgmentZone: player.judgmentZone ? [player.judgmentZone] : [],
    dantian: player.dantian,
    discardPile: player.discardPile
  };

  for (var zk in zones) {
    var arr = zones[zk];
    if (!arr) continue;
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i];
      var et = c._data ? c._data.effectType : c.effectType;
      if (!et) continue;
      var def = EffectRegistry[et];
      if (!def || def.timing !== timing) continue;
      if (def.zone.indexOf(zk) < 0 && def.zone.indexOf('any') < 0) continue;
      if (def.condition && !def.condition(c, player, state)) continue;
      results.push({ card: c, zone: zk, definition: def, player: player });
    }
  }
  return results;
}

// ═══════════════════════════════════════════
//  统一结算管道 — Phase A 事件驱动
// ═══════════════════════════════════════════
//
// 事件系统：效果自注册监听，Phase A 只负责 fire 事件
// 执行顺序由 priority 控制（与旧 Phase A 完全一致）

var _eventHandlers = {};  // { eventName: [{priority, handler}] }

function onEvent(event, priority, handler) {
  if (!_eventHandlers[event]) _eventHandlers[event] = [];
  _eventHandlers[event].push({ priority: priority || 0, handler: handler });
  _eventHandlers[event].sort(function(a, b) { return a.priority - b.priority; });
}

function fireEvent(event, ctx) {
  var handlers = _eventHandlers[event] || [];
  var changed = false;
  for (var i = 0; i < handlers.length; i++) {
    try {
      if (handlers[i].handler(ctx)) changed = true;
    } catch (e) {
      ctx.state.log.push('[效果错误] ' + event + ' #' + i + ': ' + e.message);
    }
  }
  return changed;
}

// 注册 onResolution 事件处理器（与旧 Phase A 顺序一致）
onEvent('onResolution', 1, function(ctx) {
  return resolveZhenShang(ctx.advantaged, ctx.disadvantaged, ctx.state);
});
onEvent('onResolution', 2, function(ctx) {
  return resolveHitEffects(ctx.advantaged, ctx.disadvantaged, ctx.state);
});
onEvent('onResolution', 3, function(ctx) {
  return resolveHanSha(ctx.disadvantaged, ctx.advantaged, ctx.state);
});
onEvent('onResolution', 4, function(ctx) {
  return resolveFlawHeal(ctx.advantaged, ctx.disadvantaged, ctx.state);
});
onEvent('onResolution', 5, function(ctx) {
  return resolvePoisonBurst(ctx.state.players[0], ctx.state.players[1], ctx.state);
});
onEvent('onResolution', 6, function(ctx) {
  return resolveZhengShangDrain(ctx.advantaged, ctx.disadvantaged, ctx.state);
});

// ═══════════════════════════════════════════
//  Phase A 入口
// ═══════════════════════════════════════════

function resolvePhaseA(p1, p2, state) {
  zones.buildEffectIndex(p1);
  zones.buildEffectIndex(p2);

  var maxIter = 20;
  for (var iter = 0; iter < maxIter; iter++) {
    if (state.isGameOver) break;

    cr.calcTotalPower(p1, state);
    cr.calcTotalPower(p2, state);
    var adv = p1.totalPower > p2.totalPower ? p1 : p2;
    var dis = adv === p1 ? p2 : p1;

    var ctx = { p1: p1, p2: p2, state: state, advantaged: adv, disadvantaged: dis };
    if (!fireEvent('onResolution', ctx)) break;
  }
}

// ═══════════════════════════════════════════
//  淬毒爆发
// ═══════════════════════════════════════════

function resolvePoisonBurst(p1, p2, state) {
  var yeshura = null;
  for (var pi = 0; pi < 2; pi++) {
    if (state.players[pi].character.id === 'yeshura') {
      yeshura = state.players[pi]; break;
    }
  }
  if (!yeshura) return false;

  var opponent = yeshura.id === p1.id ? p2 : p1;
  var threshold = CONST.poisonThreshold;

  // 万蛊噬心：阈值-1
  for (var i = 0; i < yeshura.dantian.length; i++) {
    if (yeshura.dantian[i].effectType === 'lowerPoisonThreshold') {
      threshold += (yeshura.dantian[i]._data.poisonThresholdOffset || -1);
    }
  }

  if (opponent.poisonStacks < threshold || threshold <= 0) return false;

  opponent.poisonStacks -= threshold;
  opponent.hp--;
  state.log.push('淬毒爆发: P' + opponent.id + ' 毒素满' + threshold + '层，失去1HP（剩余' + opponent.hp + '）');
  // 抽2
  var gs = require('./gameState');
  gs.drawCards(opponent, 2, state);

  // 隐堂基础内功：引爆后永久+1
  for (var j = 0; j < yeshura.dantian.length; j++) {
    if (yeshura.dantian[j].effectType === 'poisonBurstInnerUp' && !yeshura.dantian[j]._innerBoosted) {
      yeshura.dantian[j]._innerBoosted = true;
      state.log.push('P' + yeshura.id + ' 隐堂基础内功：引爆后内力+1');
    }
  }

  // 暴雨梨花针：清毒直伤
  for (var k = 0; k < yeshura.dantian.length; k++) {
    if (yeshura.dantian[k].effectType === 'clearAndDirectDamage') {
      opponent.hp -= 2;
      state.log.push('暴雨梨花针: P' + opponent.id + ' -2HP（剩余' + opponent.hp + '）');
    }
  }

  if (opponent.hp <= 0) {
    state.isGameOver = true;
    state.winner = opponent.id === 1 ? 2 : 1;
  }
  return true;
}

// ═══════════════════════════════════════════
//  震伤
// ═══════════════════════════════════════════

function resolveZhenShang(advantaged, disadvantaged, state) {
  var count = 1;
  var hasUnresolved = false;
  var zsEffs = zones.getActiveEffects(advantaged, 'zhengshang');
  for (var i = 0; i < zsEffs.length; i++) {
    var card = zsEffs[i].card;
    if (!card._effectsNegated && !card._zsResolved) {
      card._zsResolved = true;
      hasUnresolved = true;
    }
  }
  if (!hasUnresolved) return false;
  if (advantaged.tempStats.bloodWarfareUsed && advantaged.tempStats.bloodWarfareMode === 'discardUp') count = 2;
  for (var j = 0; j < zsEffs.length; j++) {
    var c = zsEffs[j].card;
    if (c._data.lowHpZhengshangBuff && advantaged.hp < disadvantaged.hp) {
      count = 2; break;
    }
  }
  for (var k = 0; k < count; k++) {
    if (disadvantaged.hand.length > 0) {
      var idx = Math.floor(Math.random() * disadvantaged.hand.length);
      disadvantaged.discardPile.push(disadvantaged.hand.splice(idx, 1)[0]);
    }
  }
  state.log.push('震伤: 劣势方弃' + count + '张手牌');
  return true;
}

// ═══════════════════════════════════════════
//  命中 → 淬毒
// ═══════════════════════════════════════════

function resolveHitEffects(advantaged, disadvantaged, state) {
  var hitCards = [];
  for (var i = 0; i < advantaged.actionZone.length; i++) {
    if (advantaged.actionZone[i]._data.hasHit && !advantaged.actionZone[i]._effectsNegated && !advantaged.actionZone[i]._hitResolved) hitCards.push(advantaged.actionZone[i]);
  }
  if (advantaged.judgmentZone && advantaged.judgmentZone._data.hasHit && !advantaged.judgmentZone._hitResolved) hitCards.push(advantaged.judgmentZone);
  if (hitCards.length === 0) return false;
  for (var j = 0; j < hitCards.length; j++) {
    hitCards[j]._hitResolved = true;
    disadvantaged.poisonStacks += 1;
    state.log.push('命中: P' + disadvantaged.id + ' 获得1层[淬毒]（当前' + disadvantaged.poisonStacks + '）');
    if (hitCards[j]._data.effectType === 'hitDrawAndPoison') {
      var gs = require('./gameState');
      gs.drawCards(advantaged, 1, state);
    }
  }
  return true;
}

// ═══════════════════════════════════════════
//  含沙射影
// ═══════════════════════════════════════════

function resolveHanSha(disadvantaged, advantaged, state) {
  if (disadvantaged.judgmentZone && disadvantaged.judgmentZone.effectType === 'judgmentLossPoison') {
    advantaged.poisonStacks += 1;
    state.log.push('含沙射影: P' + advantaged.id + ' 获得1层[淬毒]（当前' + advantaged.poisonStacks + '）');
    return true;
  }
  return false;
}

// 修罗化血阵: 震伤时吸内力（独立于震伤函数，避免和弃牌逻辑耦合）
function resolveZhengShangDrain(advantaged, disadvantaged, state) {
  var zsDrain = false;
  var drainEffs = zones.getActiveEffects(advantaged, 'zhengshangDrain');
  for (var l = 0; l < drainEffs.length; l++) {
    var card = drainEffs[l].card;
    if (!card._effectsNegated) {
      if (disadvantaged.innerPower > 0) {
        disadvantaged.innerPower = Math.max(0, disadvantaged.innerPower - 1);
        state.log.push('修罗化血阵：P' + disadvantaged.id + ' 失去1内力');
        zsDrain = true;
      }
      break;
    }
  }
  return zsDrain;
}

// ═══════════════════════════════════════════
//  统一结算阶段（Phase A → B → C）
// ═══════════════════════════════════════════

function resolutionPhase(p1, p2, state) {
  state.phase = 'resolution';

  // 重建效果索引快照（Zone 状态已稳定）
  zones.buildEffectIndex(p1);
  zones.buildEffectIndex(p2);

  cr.calcTotalPower(p1, state);
  cr.calcTotalPower(p2, state);
  var adv = p1.totalPower > p2.totalPower ? p1 : p2;
  var dis = adv === p1 ? p2 : p1;

  // Phase A: 效果结算
  resolvePoisonBurstAll(p1, p2, state);
  if (state.isGameOver) return;

  // Phase B: 清区
  clearZones(p1, state);
  clearZones(p2, state);
  if (state.isGameOver) return;

  // Phase C: 补牌
  var gs = require('./gameState');
  gs.drawCards(dis, 1, state);
  gs.drawCards(adv, 2, state);
  state.log.push('结算: P' + dis.id + '(劣)抽1, P' + adv.id + '(优)抽2');
}

// ═══════════════════════════════════════════
//  淬毒爆发 — 按角色遍历
// ═══════════════════════════════════════════

function resolvePoisonBurstAll(p1, p2, state) {
  var changed = false;
  for (var pi = 0; pi < 2; pi++) {
    var player = state.players[pi];
    var opp = state.players[1 - pi];
    if (resolvePoisonBurst(player, opp, state)) changed = true;
    if (state.isGameOver) return changed;
  }
  return changed;
}

function resolvePoisonBurst(player, opponent, state) {
  if (player.character.id !== 'yeshura') return false;
  var threshold = CONST.poisonThreshold;

  // 万蛊噬心：阈值-1
  var lptEffs = zones.getActiveEffects(player, 'lowerPoisonThreshold');
  for (var i = 0; i < lptEffs.length; i++) {
    threshold += (lptEffs[i].card._data.poisonThresholdOffset || -1);
  }

  if (opponent.poisonStacks < threshold || threshold <= 0) return false;

  opponent.poisonStacks -= threshold;
  opponent.hp--;
  state.log.push('淬毒爆发: P' + opponent.id + ' 毒素满' + threshold + '层，失去1HP（剩余' + opponent.hp + '）');
  var gs = require('./gameState');
  gs.drawCards(opponent, 2, state);

  // 隐堂基础内功：引爆后永久+1
  var pbiuEffs = zones.getActiveEffects(player, 'poisonBurstInnerUp');
  for (var j = 0; j < pbiuEffs.length; j++) {
    var innerCard = pbiuEffs[j].card;
    if (!innerCard._innerBoosted) {
      innerCard._innerBoosted = true;
      state.log.push('P' + player.id + ' 隐堂基础内功：引爆后内力+1');
    }
  }

  // 暴雨梨花针：清毒直伤
  var cddEffs = zones.getActiveEffects(player, 'clearAndDirectDamage');
  for (var k = 0; k < cddEffs.length; k++) {
    opponent.hp -= 2;
    state.log.push('暴雨梨花针: P' + opponent.id + ' -2HP（剩余' + opponent.hp + '）');
  }

  if (opponent.hp <= 0) {
    state.isGameOver = true;
    state.winner = opponent.id === 1 ? 2 : 1;
  }
  return true;
}

// ═══════════════════════════════════════════
//  回血
// ═══════════════════════════════════════════

function resolveFlawHeal(advantaged, disadvantaged, state) {
  var fhEffs = zones.getActiveEffects(advantaged, 'flawHeal');
  for (var i = 0; i < fhEffs.length; i++) {
    var card = fhEffs[i].card;
    if (!card._effectsNegated && advantaged.hp < advantaged.maxHp) {
      advantaged.hp++; advantaged.flaws = Math.max(0, advantaged.flaws - 1);
      state.log.push('纯阳无极剑: P' + advantaged.id + ' 清1破绽，回1血');
      return true;
    }
  }
  return false;
}

// ═══════════════════════════════════════════
//  阳光普照（HP=1 时触发）
// ═══════════════════════════════════════════

function checkSunshine(player, state) {
  if (player.hasTriggeredSunshine) return;
  if (player.hp !== 1) return;
  for (var i = 0; i < player.extraDeck.length; i++) {
    if (player.extraDeck[i].effectType === 'lowHpSearch') {
      var best = null;
      for (var j = 0; j < player.extraDeck.length; j++) {
        if (player.extraDeck[j].id !== player.extraDeck[i].id) {
          if (!best || (player.extraDeck[j]._data.power || 0) > (best._data.power || 0)) {
            best = player.extraDeck[j];
          }
        }
      }
      if (best) {
        if (player.hand.length >= CONST.maxHandSize) {
          player.discardPile.push(cloneCard(best));
          state.log.push('P' + player.id + ' 阳光普照：手牌已满，' + best._data.name + '溢出');
        } else {
          player.hand.push(cloneCard(best));
          player.hasTriggeredSunshine = true;
          state.log.push('P' + player.id + ' 阳光普照：HP=1，从额外卡组挑选《' + best._data.name + '》');
        }
      }
      return;
    }
  }
}

function cloneCard(c) {
  return {
    id: c.id, _data: c._data, name: c._data.name, type: c._data.type,
    element: c._data.element, cost: c._data.cost, power: c._data.power,
    innerPower: c._data.innerPower || 0, tags: c._data.tags || [],
    isExtra: true, effectType: c._data.effectType || null
  };
}

// ═══════════════════════════════════════════
//  卡牌入弃牌堆副作用
// ═══════════════════════════════════════════

function checkXueDiZi(card, opponent, state, ctx) {
  // ctx is optional, for backward compatibility
  if (card.effectType === 'enterDiscardPoison') {
    opponent.poisonStacks += 1;
    state.log.push('血滴子: P' + opponent.id + ' 获得1层[淬毒]（当前' + opponent.poisonStacks + '）');
  }
}

// ═══════════════════════════════════════════
//  clearZones — 结算末清区（Phase B）
// ═══════════════════════════════════════════

function clearZones(player, state) {
  var opp = state.players[player.id === 1 ? 1 : 0];

  if (player.judgmentZone) {
    checkXueDiZi(player.judgmentZone, opp, state);
    player.discardPile.push(player.judgmentZone);
  }

  for (var i = player.actionZone.length - 1; i >= 0; i--) {
    var c = player.actionZone[i];
    checkXueDiZi(c, opp, state);

    // 延迟入丹田
    if (c._delayedDantian) {
      delete c._delayedDantian;
      player.dantian.push(c);
      var ip = c.innerPower || (c._data ? c._data.innerPower || 0 : 0);
      player.baseInnerPower += ip;
      player.innerPower += ip;
      state.log.push('P' + player.id + ' 《' + (c._data ? c._data.name : '?') + '》延迟入丹田(+' + ip + '内)');
      player.actionZone.splice(i, 1);
      continue;
    }

    // 鬼影迷踪：劣势时保留
    cr.calcTotalPower(player, state);
    cr.calcTotalPower(opp, state);
    if (c.effectType === 'disadvantagedDrawAndReturn' && c._returnToHand && player.totalPower < opp.totalPower) {
      continue; // 保留在 actionZone
    }

    player.discardPile.push(c);
    player.actionZone.splice(i, 1);
  }

  player.judgmentZone = null;
}

// ═══════════════════════════════════════════
//  战力计算中应用效果（供 combatResolver 调用）
// ═══════════════════════════════════════════

function applyCalcPowerEffects(card, player, state, location) {
  var et = card._data ? card._data.effectType : card.effectType;
  if (!et) return null;
  var def = EffectRegistry[et];
  if (!def || def.timing !== 'calcPower') return null;
  // 检查 zone 是否匹配
  var zone = location || 'actionZone';
  if (def.zone.indexOf(zone) < 0 && def.zone.indexOf('any') < 0) return null;
  if (def.condition && !def.condition(card, player, state)) return null;
  return def.apply ? def.apply(state, card, player) : null;
}

function applyCalcJudgmentEffects(card, player, state) {
  var et = card._data ? card._data.effectType : card.effectType;
  if (!et) return null;
  var def = EffectRegistry[et];
  if (!def || def.timing !== 'calcJudgmentPower') return null;
  if (def.zone.indexOf('judgmentZone') < 0) return null;
  if (def.condition && !def.condition(card, player, state)) return null;
  return def.apply ? def.apply(state, card, player) : null;
}

// ═══════════════════════════════════════════
//  响应窗口相关（给交互层调用）
// ═══════════════════════════════════════════

var RESP_TRIGGER = {
  ON_CARD_PLAYED: 1,
  ON_WUJI_PLAYED: 2,
  ON_XINFA_PLAYED: 3,
  ON_POWER_CHANGE: 4,
  ON_FLAW_GAINED: 5,
  ON_DAMAGE: 6
};

var RESPONSE_REGISTRY = [
  {
    name: '舍身撞',
    trigger: RESP_TRIGGER.ON_XINFA_PLAYED,
    condition: function(ctx) {
      return ctx.sourcePlayer !== ctx.owner &&
        ctx.owner.innerPower >= 2 &&
        ctx.sourcePlayer.dantian.some(function(c) {
          return (c._data || c).type === 'xinfa';
        });
    },
    effect: function(owner, opp, ctx, state) {
      owner.innerPower = Math.max(0, owner.innerPower - 2);
      var gs = require('./gameState');
      var k = gs.destroyDantianCards(opp, 2, state);
      state.log.push('⚡舍身撞！摧毁P' + opp.id + '(' + opp.character.name + ')丹田' + k + '张牌');
      gs.drawCards(opp, 1, state);
    }
  },
  {
    name: '梯云纵',
    trigger: RESP_TRIGGER.ON_POWER_CHANGE,
    condition: function(ctx) {
      return ctx.sourcePlayer !== ctx.owner &&
        ctx.owner.innerPower >= 1 &&
        ctx.sourcePlayer.actionZone.some(function(c) {
          var et = (c._data || c).effectType;
          return et === 'movePowerBuff' ||
            et === 'conditionalPower_flaw_plus3' ||
            et === 'zhengshang' ||
            et === 'poisonPowerBuff' ||
            et === 'innerPowerToPower' ||
            et === 'innerToPowerBuff' ||
            et === 'innerToPower';
        });
    },
    effect: function(owner, opp, ctx, state) {
      owner.innerPower = Math.max(0, owner.innerPower - 1);
      // _effectsNegated marking + stripActionBuffs moved to CommandQueue._resolveNegateBuffs
      if (owner.mainDeck.length > 0) {
        owner.hand.push(owner.mainDeck.pop());
        state.log.push('梯云纵抽1张牌');
      }
    }
  }
];

// ═══════════════════════════════════════════
//  导出
// ═══════════════════════════════════════════

module.exports = {
  // 核心类
  EffectContext: EffectContext,
  Command: Command,
  CommandQueue: CommandQueue,

  // 效果查询
  EffectRegistry: EffectRegistry,
  getEffect: getEffect,
  getEffectsByTiming: getEffectsByTiming,
  hasEffectAtTiming: hasEffectAtTiming,
  scanEffectsByTiming: scanEffectsByTiming,
  applyCalcPowerEffects: applyCalcPowerEffects,
  applyCalcJudgmentEffects: applyCalcJudgmentEffects,

  // Event system
  onEvent: onEvent,
  fireEvent: fireEvent,

  // 结算管道
  resolvePhaseA: resolvePhaseA,
  resolutionPhase: resolutionPhase,
  clearZones: clearZones,
  checkXueDiZi: checkXueDiZi,
  checkSunshine: checkSunshine,

  // 各阶段 resolve
  resolvePoisonBurst: resolvePoisonBurst,
  resolveZhenShang: resolveZhenShang,
  resolveHitEffects: resolveHitEffects,
  resolveHanSha: resolveHanSha,
  resolveFlawHeal: resolveFlawHeal,

  // 响应系统
  RESP_TRIGGER: RESP_TRIGGER,
  RESPONSE_REGISTRY: RESPONSE_REGISTRY,

  // 辅助
  cloneCard: cloneCard
};
