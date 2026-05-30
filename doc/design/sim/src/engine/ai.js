// AI 策略模块 v7 —— 概率最优 + 阵营克制博弈 + 真人策略模拟
var gs = require('./gameState');
var cr = require('./cardRegistry');
var CONST = require('../data/constants.json');

// 克制矩阵: element → 被它克的元素
var COUNTERS = { domineering: 'spirit', spirit: 'skillful', skillful: 'domineering', deceptive: 'skillful' };
// 被谁克: element → 克它的元素
var WEAK_TO = { spirit: 'domineering', skillful: 'spirit', domineering: 'skillful', deceptive: 'spirit' };

// 阵营主属性
var MAIN_SYSTEM = { modeng: 'domineering', wudang: 'skillful', yintang: 'deceptive' };

class BaseAI {
  constructor(faction, oppFaction) {
    this.faction = faction;
    this.oppFaction = oppFaction || 'generic';
  }

  chooseJudgmentCard(self, opponent, state) {
    resolveHandData(self);
    if (self.hand.length === 0) return null;
    
    // ── Debug: AI 判定手牌日志 ──
    var handDesc = self.hand.map(function(c) {
      var d = c._data || {};
      return d.name + '(' + (d.type||'?') + '/' + (d.element||'?') + ' P' + (d.power||0) + ' 费' + (d.cost||0) + (d.innerPower?' 内+'+d.innerPower:'') + ')';
    }).join(' | ');
    state.log.push('🔍 AI(' + self.character.name + ')判定手牌: ' + handDesc);

    var oppMain = MAIN_SYSTEM[this.oppFaction];
    // 对方大概率出的属性 = 对方主属性（真人倾向）
    // 找我们手中克制对方的卡
    var antiOpp = WEAK_TO[oppMain]; // 克对方主属性的元素

    if (this.faction === 'yintang') return yintangJudgment(self, opponent, state, oppMain, antiOpp);
    if (this.faction === 'wudang') return wudangJudgment(self, opponent, state, oppMain, antiOpp);
    if (this.faction === 'modeng') return modengJudgment(self, opponent, state, oppMain, antiOpp);
    return genericJudgment(self, opponent, state);
  }

  takeAction(self, opponent, state) {
    resolveHandData(self);
    calcEffectiveCosts(self, state);
    var myPower = calcFullPower(self, opponent, state);
    var oppPower = calcFullPower(opponent, self, state);
    if (myPower > oppPower && self.totalPower > 0 && self.totalPower >= oppPower) return 'caught_up';
    if (self.hand.length === 0) return 'no_action';
    var gap = oppPower - myPower;
    self.totalPower = myPower;

    if (this.faction === 'yintang') return yintangAction.call(this, self, opponent, state, gap);
    if (this.faction === 'wudang') return wudangAction.call(this, self, opponent, state, gap);
    if (this.faction === 'modeng') return modengAction.call(this, self, opponent, state, gap);
    return genericAction.call(this, self, opponent, state, gap);
  }

  // 纯阳心法诀：主动牺牲决策（卖回合赚卡差）
  shouldSacrificeChunYang(self, opponent, state) {
    if (self.dantian.length < 2 || self.innerPower < 8) return false;
    var hasCY = self.dantian.some(function(c) { return c._data && c._data.canSacrificeForDraw; });
    if (!hasCY) return false;
    var myPow = calcFullPower(self, opponent, state);
    var oppPow = calcFullPower(opponent, self, state);
    var gap = Math.max(0, oppPow - myPow);
    if (gap >= 6) return false;         // 大劣优先追平
    if (self.hp <= 1) return false;     // 残血不自杀
    if (self.hand.length <= 2) return true; // 缺牌补牌
    if (this.oppFaction === 'yintang') {    // 对速攻只在优势时牺牲
      if (gap <= 0 && self.hp >= 2) return true;
      return false;
    }
    if (gap <= 3 && self.innerPower >= 10) return true;
    if (self.innerPower >= 12) return true;
    return false;
  }

  triggerChunYangSacrifice(self, opponent, state) {
    if (!this.shouldSacrificeChunYang(self, opponent, state)) return false;
    var cyIdx = -1;
    for (var i = self.dantian.length - 1; i >= 0; i--) {
      if (self.dantian[i]._data && self.dantian[i]._data.canSacrificeForDraw) { cyIdx = i; break; }
    }
    if (cyIdx < 0) return false;
    var otherIdx = -1;
    for (var j = 0; j < self.dantian.length; j++) {
      if (j === cyIdx) continue;
      if (otherIdx < 0 || (self.dantian[j]._data.power || 0) < (self.dantian[otherIdx]._data.power || 0))
        otherIdx = j;
    }
    if (otherIdx < 0) return false;
    gs.removeDantianCard(self, self.dantian[cyIdx], state);
    gs.removeDantianCard(self, self.dantian[otherIdx], state);
    gs.drawCards(self, 2, state);
    state.log.push('P' + self.id + ' 纯阳心法诀主动牺牲丹田2心法，抽2');
    return true;
  }

  // 太极剑意决策：只在有收益时触发
  shouldTriggerTaichi(self, opponent, state) {
    // 满血→安全
    if (self.hp >= self.maxHp) return true;
    // 能触发武当基础心法(altEntryDantianDraw)→白抽1张→值
    if (self.hand.some(function(c) { return c._data.effectType === 'altEntryDantianDraw'; })) return true;
    // 能触发太极掌·绕指柔云(movePowerBuff)→+3战力
    if (self.hand.some(function(c) { return c._data.effectType === 'movePowerBuff'; })) return true;
    // HP低且无combo→不触发，省内力留给防御
    if (self.hp <= 1) return false;
    // 内力富裕→值得试
    if (self.innerPower >= 6) return true;
    return false;
  }

  // 通用卡牌效用评分（0-20分）
  scoreCard(card, self, opponent, state) {
    var score = 0;
    var effPower = getEffectivePower(card, self, opponent);
    var cost = card._effCost !== undefined ? card._effCost : (card._data.cost || 0);
    var gap = calcFullPower(opponent, self, state) - calcFullPower(self, opponent, state);

    // 战力效率(0-6): payback越快越好
    var efficiency = cost > 0 ? Math.min(effPower / cost, 3) : Math.min(effPower, 3);
    score += efficiency * 2;

    // 追平价值(0-6): 越接近追平分越高
    if (gap > 0 && effPower > 0) {
      var closure = Math.min(effPower / Math.max(gap, 1), 1);
      score += closure * 6;
    }

    // 内力价值(0-5): 每点内功=未来战力潜力
    var ip = card._data.innerPower || 0;
    score += Math.min(ip * 1.5, 5);

    // Combo收益(0-6)
    var et = card._data.effectType;
    if (et === 'chaizhao_killDantian') score += 7; // 摧毁丹田=巨大战略价值(+7)
    if (et === 'flawDiscount' && self.flaws > 0 && card._data.flawDraw) score += 4;
    if (et === 'drawOnPlay') score += 3;
    if (et === 'discardDrawPoison') score += 4;
    if (et === 'hitDrawAndPoison') score += 4;
    if (et === 'zhengshang' && self.flaws > 0) score += 3;
    if (et === 'poisonPowerBuff' && opponent.poisonStacks >= 2) score += 5;
    if (et === 'innerPowerToPower' || et === 'innerToPowerBuff') score += 3;
    if (et === 'clearAndDirectDamage') score += 3; // 暴雨梨花针收割
    if (et === 'absorbPoisonMultiply' && opponent.poisonStacks >= 2) score += 4;
    // Human策略4：有破绽时聚气诀直进丹田价值大幅提升
    if (et === 'delayedDantian' && self.flaws > 0) score += 4;

    // 对阵速攻(隐堂): 低费高频+追平优先，贬慢速心法
    if (this.oppFaction === 'yintang') {
      if (cost <= 2 && effPower >= 3) score += 2; // 低费高效
      if (card._data.type === 'xinfa' && card._data.innerPower <= 1 && et === '') score -= 3; // 纯战力心法慢
      if (et === 'zhengshang' || et === 'innerToPower') score += 2; // 震伤/内力转战=快速威胁
    }

    // 对阵运营(武当/魔教): 慢速心法价值高
    if (this.oppFaction === 'wudang' || this.oppFaction === 'modeng') {
      if (card._data.type === 'xinfa' && ip >= 2) score += 2;
    }

    // 风险惩罚(0-4): HP低时高费牌扣分
    if (self.hp <= 1 && cost >= 3) score -= 4;
    if (self.hp <= 2 && cost >= 5) score -= 2;

    // 丹田溢出惩罚: 心法过多扣分
    if (card._data.type === 'xinfa' && self.dantian.length >= 4) score -= 2;

    return Math.max(0, score);
  }
}

// ═══════════════════ 隐堂 AI (诡系主力，灵系副) ═══════════════════
// 对武当(巧): 出诡(克巧) 或灵(克诡...但灵对巧无克制)
//   关键：对方武当盖心法=无属性但碰瓷后出巧→诡克巧自动反制
//   如果武当学会出灵→我们出诡会被灵克，所以也要留灵牌盖
// 对魔教(霸): 霸克灵→别出灵，出诡(无克制关系)
function yintangJudgment(self, opponent, state, oppMain, antiOpp) {
  // 盖放生效的卡 → 必盖（输了也赚）
  var hssy = findCards(self, 'judgmentLossPoison');
  if (hssy.length > 0) return hssy[0];

  // 血滴子 → 必盖（进弃牌堆就给毒）
  var xdz = findCards(self, 'enterDiscardPoison');
  if (xdz.length > 0) return xdz[0];

  // 面对武当(巧系)：最佳盖诡系武技(诡克巧)，最差盖灵系(灵克诡反杀)
  if (this.oppFaction === 'wudang') {
    // 诡系武技优先（诡克巧，含沙射影/血滴子已在前两步）
    var guiWuji = self.hand.filter(function(c) { return c._data.type === 'wuji' && c._data.element === 'deceptive'; });
    if (guiWuji.length > 0) return bestPower(guiWuji);

    // 巧系武技也行（巧对巧无克制，公平比战力）
    var qiaoWuji = self.hand.filter(function(c) { return c._data.type === 'wuji' && c._data.element === 'skillful'; });
    if (qiaoWuji.length > 0) return bestPower(qiaoWuji);

    // 灵系绝对不盖（灵克诡，会被武当反克制）
    // 盖心法（无属性，碰瓷后出巧→我们诡克巧仍反制）
    return genericJudgmentNoSpirit(self, opponent, state);
  }

  // 面对魔教(霸系)：诡对霸无克制，霸克灵→别出灵
  if (this.oppFaction === 'modeng') {
    var guiWuji = self.hand.filter(function(c) { return c._data.type === 'wuji' && c._data.element === 'deceptive'; });
    if (guiWuji.length > 0) return bestPower(guiWuji);
    var qiaoWuji = self.hand.filter(function(c) { return c._data.type === 'wuji' && c._data.element === 'skillful'; });
    if (qiaoWuji.length > 0) return bestPower(qiaoWuji);
    // 别出灵(霸克灵) → 用心法
    return genericJudgmentNoSpirit(self, opponent, state);
  }

  return genericJudgment(self, opponent, state);
}

function genericJudgmentNoSpirit(self, opponent, state) {
  var candidates = self.hand.filter(function(c) { return c._data.element !== 'spirit'; });
  if (candidates.length > 0) {
    // 用cost-aware逻辑选（而非简单bestPower，避免盲选心法消耗内力产出）
    var cWuji = candidates.filter(function(c) { return c._data.type === 'wuji'; });
    var cXinfa = candidates.filter(function(c) { return c._data.type === 'xinfa'; });
    if (state.round <= 2 && cWuji.length > 0 && cXinfa.some(function(x){ return (x._data.innerPower||0) >= 2; }) && self.innerPower < 4) {
      return bestPowerMin(cWuji);
    }
    return bestPower(candidates);
  }
  return genericJudgment(self, opponent, state);
}

function yintangAction(self, opponent, state, gap) {
  // ──── 策略1横展：心法优先 ────
  if (gap < 8) {
    var zeroXf = self.hand.filter(function(c) {
      return c._data.type === 'xinfa' && (c._effCost || c._data.cost || 0) === 0;
    });
    if (zeroXf.length > 0) return doPlay(self, opponent, state, bestPower(zeroXf));
  }

  // ──── 策略5横展：秘术——内充裕时触发 ────
  if (self.innerPower >= 5 && trySecret(self, opponent, state)) return afterPlay(self, opponent, state);

  // 踏雪无痕回收（隙差小时用）
  if (self.discardPile.length >= 1 && gap <= 6) {
    var txwh = findInHand(self, 'discardReturn');
    if (txwh && txwh._effCost <= self.innerPower) {
      return doPlay(self, opponent, state, txwh);
    }
  }

  // 鬼影迷踪（劣势抽1+退回手）
  if (gap > 0 && gap <= 6) {
    var gymz = findInHand(self, 'disadvantagedDrawAndReturn');
    if (gymz && gymz._effCost <= self.innerPower) {
      gymz._returnToHand = true;
      doPlay(self, opponent, state, gymz);
      gs.drawCards(self, 1, state);
      return afterPlay(self, opponent, state);
    }
  }

  // 差距大→毒爆发
  if (gap >= 5) {
    var fntl = findInHand(self, 'absorbPoisonMultiply');
    if (fntl && fntl._effCost <= self.innerPower && opponent.poisonStacks >= 2) {
      return doPlay(self, opponent, state, fntl);
    }
    var bylhz = findInHand(self, 'clearAndDirectDamage');
    if (bylhz && bylhz._effCost <= self.innerPower && opponent.poisonStacks >= 3) {
      return doPlay(self, opponent, state, bylhz);
    }
    var wgsx = findInHand(self, 'lowerPoisonThreshold');
    if (wgsx && wgsx._effCost <= self.innerPower) {
      return doPlay(self, opponent, state, wgsx);
    }
  }

  // 差距适中→铺毒积累or追平
  if (gap >= 2) {
    var playable = bestPlayable(self, state);
    if (playable.length > 0) {
      for (var p = 0; p < playable.length; p++) {
        var ep = getEffectivePower(playable[p], self, opponent);
        if (ep >= gap) return doPlay(self, opponent, state, playable[p]);
      }
      // 追不平→铺毒
      var poisonGivers = playable.filter(function(c) {
        return c._data.effectType === 'discardDrawPoison' || c._data.effectType === 'hitDrawAndPoison';
      });
      if (poisonGivers.length > 0) return doPlay(self, opponent, state, poisonGivers[0]);
      // 佛怒唐莲/暴雨哪怕不够也打
      if (fntl && fntl._effCost <= self.innerPower) return doPlay(self, opponent, state, fntl);
      // 战略放弃：毒牌/爆发打完了还追不上 → 保手牌吃破绽
      if (shouldStrategicPass(self, opponent, gap, playable)) {
        state.log.push('P' + self.id + ' 战略放弃(隐堂)：追不上，保毒牌等爆发');
        return 'surrender';
      }
      // ──── 策略2横展：费效比排序 ────
      playable.sort(function(a, b) {
        var reA = getEffectivePower(a, self, opponent) / Math.max(1, (a._effCost || a._data.cost || 1));
        var reB = getEffectivePower(b, self, opponent) / Math.max(1, (b._effCost || b._data.cost || 1));
        return reB - reA;
      });
      return doPlay(self, opponent, state, playable[0]);
    }
  }

  // 差距小→隐堂基础内功（引爆后内力+1）
  var ytnq = findInHand(self, 'poisonBurstInnerUp');
  if (ytnq && ytnq._effCost <= self.innerPower && self.dantian.length < 4) {
    return doPlay(self, opponent, state, ytnq);
  }

  return genericAction(self, opponent, state, gap);
}

// ═══════════════════ 武当 AI (巧系主力，灵系副) ═══════════════════
// 对隐堂(诡): 诡克巧→避免出巧。最佳盖灵(灵克诡)，次优盖心法(无属性)
//   心法碰瓷后出灵武技→灵克诡=反克制→碰瓷变赚
//   但如果手牌无灵→盖心法碰瓷后出非巧武技也可
// 对魔教(霸): 巧克霸→可以盖巧。心法碰瓷后出巧=巧克霸→稳赢
function wudangJudgment(self, opponent, state, oppMain, antiOpp) {
  // 对隐堂(诡)：优先级：灵武技 > 心法(碰瓷后出灵) > 非巧武技
  if (this.oppFaction === 'yintang') {
    // 灵系武技优先（灵克诡，即使对方是诡+6也能反制）
    var lingWuji = self.hand.filter(function(c) { return c._data.type === 'wuji' && c._data.element === 'spirit'; });
    if (lingWuji.length > 0) return bestPower(lingWuji);

    // 非巧非灵武技其次（避免被诡克）
    var neutral = self.hand.filter(function(c) {
      return c._data.type === 'wuji' && c._data.element !== 'skillful' && c._data.element !== 'spirit';
    });

    // 心法盖放代价：早期内力不足时，优先非巧武技而非心法碰瓷
    var xinfa = self.hand.filter(function(c) { return c._data.type === 'xinfa'; });
    if (state.round <= 2 && self.innerPower < 4 && neutral.length > 0 && xinfa.some(function(x){ return (x._data.innerPower||0) >= 2; })) {
      return bestPower(neutral);
    }

    if (neutral.length > 0) return bestPower(neutral);
    if (xinfa.length > 0) return bestPowerMin(xinfa);

    return genericJudgment(self, opponent, state);
  }

  // 对魔教(霸)：巧克霸→可以盖心法碰瓷
  if (this.oppFaction === 'modeng') {
    var xinfa = self.hand.filter(function(c) { return c._data.type === 'xinfa'; });
    // 巧系武技含战力（排除检索/功能牌）
    var qiaoWuji = self.hand.filter(function(c) {
      return c._data.type === 'wuji' && c._data.element === 'skillful' && (c._data.power || 0) > 0;
    });
    // 心法盖放代价：早期内力不足时，宁可盖巧武技也要保心法内力
    if (state.round <= 2 && self.innerPower < 4 && qiaoWuji.length > 0 && xinfa.some(function(x){ return (x._data.innerPower||0) >= 2; })) {
      return bestPower(qiaoWuji);
    }
    if (xinfa.length > 0) return bestPowerMin(xinfa);
    if (qiaoWuji.length > 0) return bestPower(qiaoWuji);
    // ── 无心法无巧武技 → 避开灵系(被霸克+6)，选霸/诡武技或通用逻辑 ──
    var safeWuji = self.hand.filter(function(c) { return c._data.type === 'wuji' && c._data.element !== 'spirit'; });
    if (safeWuji.length > 0) return bestPower(safeWuji);
    return genericJudgmentNoSpirit(self, opponent, state);
  }

  return genericJudgment(self, opponent, state);
}

function wudangAction(self, opponent, state, gap) {
  // 纯阳心法诀：主动牺牲（卖回合换2牌，对战慢速时可用）
  if (this.oppFaction !== 'yintang' && this.triggerChunYangSacrifice(self, opponent, state))
    return afterPlay(self, opponent, state);

  // ──── 策略1横展：心法优先 ────
  if (gap < 8) {
    var zeroXf = self.hand.filter(function(c) {
      return c._data.type === 'xinfa' && (c._effCost || c._data.cost || 0) === 0;
    });
    if (zeroXf.length > 0) return doPlay(self, opponent, state, bestPower(zeroXf));
  }

  // ──── 策略5横展：秘术——内充裕时触发 ────
  if (self.innerPower >= 5 && trySecret(self, opponent, state)) return afterPlay(self, opponent, state);

  // 面对隐堂→警惕被毒+诡克，打快速追平，差距小也打伤害
  if (this.oppFaction === 'yintang') {
    if (gap >= 2) {
      var playable = bestPlayable(self, state);
      if (playable.length > 0) {
        // ──── 策略2横展：费效比排序 ────
        playable.sort(function(a, b) {
          var reA = getEffectivePower(a, self, opponent) / Math.max(1, (a._effCost || a._data.cost || 1));
          var reB = getEffectivePower(b, self, opponent) / Math.max(1, (b._effCost || b._data.cost || 1));
          return reB - reA;
        });
        return doPlay(self, opponent, state, playable[0]);
      }
    }
    // 差距0也压一波内力/铺场防止被逆转
    var xinfa = self.hand.filter(function(c) { return c._data.type === 'xinfa' && c._effCost <= self.innerPower; });
    if (xinfa.length > 0) return doPlay(self, opponent, state, bestPower(xinfa));
    var playable3 = bestPlayable(self, state);
    if (shouldStrategicPass(self, opponent, gap, playable3)) {
      state.log.push('P' + self.id + ' 战略放弃：追不上，保手牌');
      return 'surrender';
    }
    return 'surrender';
  }

  // 差距小→铺心法引擎
  if (gap < 3) {
    var xinfa = self.hand.filter(function(c) {
      return c._data.type === 'xinfa' && c._effCost <= self.innerPower;
    });
    if (xinfa.length > 0) return doPlay(self, opponent, state, bestPower(xinfa));
  }

  return genericAction(self, opponent, state, gap);
}

// ═══════════════════ 魔教 AI (霸系主力，灵/诡副) ═══════════════════
// 对武当(巧): 巧克霸→避免出霸。最佳盖诡(诡克巧)或灵
// 对隐堂(诡): 霸对诡无克制→出霸战力压制即可
function modengJudgment(self, opponent, state, oppMain, antiOpp) {
  // 对武当(巧)：绝对不盖霸(被灵克+6)！优先诡(诡克巧) > 灵 > 心法
  if (this.oppFaction === 'wudang') {
    var guiCards = self.hand.filter(function(c) { return c._data.element === 'deceptive' && c._data.type === 'wuji'; });
    if (guiCards.length > 0) return bestPower(guiCards);
    var lingCards = self.hand.filter(function(c) { return c._data.element === 'spirit' && c._data.type === 'wuji'; });
    if (lingCards.length > 0) return bestPower(lingCards);
    // 心法盖放代价：早期内力不足时，宁可盖霸武技(被克)也要保心法内力
    var xinfa = self.hand.filter(function(c) { return c._data.type === 'xinfa'; });
    var baWuji = self.hand.filter(function(c) { return c._data.type === 'wuji' && c._data.element === 'domineering'; });
    if (state.round <= 2 && self.innerPower < 4 && baWuji.length > 0 && xinfa.some(function(x){ return (x._data.innerPower||0) >= 2; })) {
      return bestPowerMin(baWuji);
    }
    if (xinfa.length > 0) return bestPowerMin(xinfa);
    return genericJudgment(self, opponent, state);
  }

  // 血刀大法优先——但仅在对隐堂(诡)或用不到克制的对局
  // 对隐堂(诡)：霸对诡无敌意，可以盖霸
  if (this.oppFaction === 'yintang') {
    var xdd = findCards(self, 'zhengshang');
    if (xdd.length > 0) return xdd[0];
    return genericJudgment(self, opponent, state);
  }

  return genericJudgment(self, opponent, state);
}

function modengAction(self, opponent, state, gap) {
  // ──── Human策略8：满手牌时优先清手牌保资源 ────
  if (self.hand.length >= CONST.maxHandSize && gap > 0) {
    var cheapPlayable = self.hand.filter(function(c) {
      return (c._effCost || c._data.cost || 0) <= self.innerPower &&
             (c._data.effectType === 'delayedDantian' || c._data.type === 'xinfa' || c._data.effectType === 'zhengshang');
    });
    // 按费效比排序：先打低费高价值的（心法>聚气>震伤）
    cheapPlayable.sort(function(a, b) {
      return (a._effCost || a._data.cost || 0) - (b._effCost || b._data.cost || 0);
    });
    if (cheapPlayable.length > 0) {
      var card = cheapPlayable[0];
      state.log.push('P' + self.id + ' 手牌已满(' + self.hand.length + '/' + CONST.maxHandSize + ')，优先打出' + card._data.name);
      return doPlay(self, opponent, state, card);
    }
    // 无低费牌 → 强制打1张防溢出
    var forcePlayable = self.hand.filter(function(c) {
      return (c._effCost || c._data.cost || 0) <= self.innerPower;
    });
    if (forcePlayable.length > 0) {
      return doPlay(self, opponent, state, forcePlayable.sort(function(a,b) {
        return (a._effCost || a._data.cost || 0) - (b._effCost || b._data.cost || 0);
      })[0]);
    }
  }

  // ──── Human策略3+：血战到底 (增强) ────
  // 条件：未用过被动 + 手上有震伤牌 + 血战能让震伤牌免费
  if (!self.tempStats.passiveUsed && self.character.id === 'xuedao') {
    var zsCards = self.hand.filter(function(c) {
      return c._data.effectType === 'zhengshang' && (c._effCost || c._data.cost || 0) <= self.innerPower + 2;
    });
    if (zsCards.length > 0) {
      var hasFlawSynergy = self.hand.some(function(c) {
        return c._data.effectType === 'conditionalPower_flaw_plus3' ||
               (c._data.effectType === 'flawDiscount' && c._data.flawDraw);
      });
      var bestZs = zsCards.reduce(function(a, b) {
        return ((b._data.power || 0) / Math.max(1, (b._effCost || b._data.cost || 1))) >
               ((a._data.power || 0) / Math.max(1, (a._effCost || a._data.cost || 1))) ? b : a;
      });
      var rawCost = bestZs._data.cost || 0;
      // 增强条件：手中至少2张可受益牌（combo保留）或手牌不溢
      var benefitCount = self.hand.filter(function(c) {
        return c._data.faction === 'modeng' || (c._data.tags && c._data.tags.indexOf('魔教') >= 0);
      }).length;
      // ── 模式选择（人类策略注入） ──
      var mode = 'costDown';
      var oppHasHand = opponent.hand.length > 0;
      if (oppHasHand && (opponent.hp <= 1 || gap > 0)) {
        if (opponent.hand.length >= 3 || opponent.hp <= 1) {
          mode = 'discard';
        } else if (gap > 0 && rawCost <= self.innerPower) {
          mode = 'discard';
        }
      }
      var shouldBloodWar = (rawCost >= 2 || hasFlawSynergy || self.hand.length >= CONST.maxHandSize - 1)
        && (mode === 'costDown' ? (bestZs._effCost || rawCost) - 2 <= self.innerPower : true)
        && self.hand.length < CONST.maxHandSize
        && benefitCount >= 1;
      if (shouldBloodWar) {
        self.tempStats.passiveUsed = true;
        self.selfInflictedFlaws = (self.selfInflictedFlaws || 0) + 1;
        gs.gainFlaw(self, 1, state);
        self.tempStats.bloodWarfareUsed = true;
        self.tempStats.bloodWarfareMode = mode;
        var modeLabel = mode === 'discard' ? '弃牌+1模式' : '减2费';
        state.log.push('P' + self.id + ' 血战到底(+1破绽,' + modeLabel + ', 受益牌' + benefitCount + '张)');
        return afterPlay(self, opponent, state);
      }
    }
  }

  // ──── Human策略1：心法优先 ────
  // 0费心法白赚内力 → 先铺再打武技
  if (gap < 8) {
    var zeroXf = self.hand.filter(function(c) {
      return c._data.type === 'xinfa' && (c._effCost || c._data.cost || 0) === 0 &&
             c._data.effectType !== 'zhengshangDrain';
    });
    if (zeroXf.length > 0) {
      // 优先修罗饮血功（selfFlawGivesInner=持续成长）
      var xlyxg = zeroXf.filter(function(c) { return c._data.effectType === 'selfFlawGivesInner'; });
      var pick = xlyxg.length > 0 ? xlyxg[0] : bestPower(zeroXf);
      return doPlay(self, opponent, state, pick);
    }
  }

  // ──── Human策略4：有破绽时优先聚气诀（直进丹田） ────
  if (self.flaws > 0) {
    var jqj = self.hand.filter(function(c) {
      return c._data.effectType === 'delayedDantian' && (c._effCost || c._data.cost || 0) <= self.innerPower;
    });
    if (jqj.length > 0) return doPlay(self, opponent, state, bestPower(jqj));
  }

  // ──── Human策略5：秘术——内充裕 (>cost+2) 时触发 ────
  if (self.innerPower >= 5 && trySecret(self, opponent, state)) return afterPlay(self, opponent, state);

  // 对隐堂快速猛攻（防毒积累）
  if (this.oppFaction === 'yintang' && gap >= 1) {
    var playable = bestPlayable(self, state);
    if (playable.length > 0) return doPlay(self, opponent, state, bestPower(playable));
  }

  // 修罗化血阵→铺震伤引擎
  var xlhz = findInHand(self, 'zhengshangDrain');
  if (xlhz && xlhz._effCost <= self.innerPower && self.dantian.length <= 3) {
    return doPlay(self, opponent, state, xlhz);
  }

  // 差距大→找震伤卡
  if (gap >= 4) {
    var zhengshangCards = self.hand.filter(function(c) {
      return c._data.effectType === 'zhengshang' && c._effCost <= self.innerPower;
    });
    if (zhengshangCards.length > 0) {
      return doPlay(self, opponent, state, bestPower(zhengshangCards));
    }
    var tmjt = findInHand(self, 'forcedResolution');
    if (tmjt && tmjt._effCost <= self.innerPower && gap >= 11) {
      return doPlay(self, opponent, state, tmjt);
    }
  }

  // ──── Human策略2：追平时用费效比选牌（低费优先） ────
  if (gap > 0) {
    var playable2 = bestPlayable(self, state);
    if (playable2.length > 0) {
      // Human策略7：追不上 → 战略放弃保手牌
      if (shouldStrategicPass(self, opponent, gap, playable2)) {
        state.log.push('P' + self.id + ' 战略放弃：追不上(' + gap + ')，保手牌吃破绽');
        return 'surrender';
      }
      for (var p = 0; p < playable2.length; p++) {
        if (getEffectivePower(playable2[p], self, opponent) >= gap)
          return doPlay(self, opponent, state, playable2[p]);
      }
      // 选费效比最高的（战力/费用 > 纯粹高战力）
      playable2.sort(function(a, b) {
        var reA = getEffectivePower(a, self, opponent) / Math.max(1, (a._effCost || a._data.cost || 1));
        var reB = getEffectivePower(b, self, opponent) / Math.max(1, (b._effCost || b._data.cost || 1));
        return reB - reA;
      });
      return doPlay(self, opponent, state, playable2[0]);
    }
  }

  // 差距小→心法运营
  if (gap < 2) {
    var xinfa = self.hand.filter(function(c) {
      return c._data.type === 'xinfa' && c._effCost <= self.innerPower &&
             c._data.effectType !== 'zhengshangDrain';
    });
    if (xinfa.length > 0) {
      var xlyxg2 = xinfa.filter(function(c) { return c._data.effectType === 'selfFlawGivesInner'; });
      var pick = xlyxg2.length > 0 ? xlyxg2[0] : bestPower(xinfa);
      return doPlay(self, opponent, state, pick);
    }
  }

  return 'surrender';
}

// ═══════════════════ 通用逻辑 ═══════════════════

// Human策略7：战略放弃回合 — 追不上时保手牌吃破绽
function shouldStrategicPass(self, opponent, gap, playable) {
  if (gap <= 0 || playable.length === 0) return false;
  if (self.roundFlaws >= 1) return false;
  if (self.hp <= 1) return false;
  if (self.hand.length < 3) return false;

  var bestReachable = 0;
  for (var i = 0; i < playable.length; i++) {
    var p = getEffectivePower(playable[i], self, opponent);
    if (p > bestReachable) bestReachable = p;
  }
  if (bestReachable < gap) {
    // 检查手牌combo链：有高价值组合时不放弃
    var comboValue = evaluateComboValue(self.hand, self);
    if (comboValue >= 2) return false; // 手上有combo → 不放弃

    var savedValue = self.hand.length - 1;
    var avgPower = self.hand.reduce(function(s, c) { return s + (c._data.power || 0); }, 0) / Math.max(1, self.hand.length);
    var futureValue = savedValue * Math.max(avgPower, 2);
    var passCost = self.flaws >= 1 ? 999 : 3;
    return futureValue > passCost;
  }
  return false;
}

// 评估手牌combo价值（血战+震伤、聚气+高费、秘术+额外等）
function evaluateComboValue(hand, self) {
  var score = 0;
  var hasZhengShang = hand.some(function(c) { return c._data.effectType === 'zhengshang'; });
  var hasBloodWarfare = !self.tempStats.passiveUsed && self.character && self.character.passives &&
    self.character.passives.some(function(p) { return p.type === 'bloodWarfare'; });
  if (hasZhengShang && hasBloodWarfare) score += 2; // 血战+震伤 combo
  var hasJuqi = hand.some(function(c) { return c._data.effectType === 'delayedDantian'; });
  var hasHighCost = hand.some(function(c) { return (c._data.cost || 0) >= 4; });
  if (hasJuqi && hasHighCost) score += 1; // 聚气+高费 combo
  var hasSecret = hand.some(function(c) { return c._data.effectType === 'searchExtra'; });
  var hasFullHand = hand.length >= CONST.maxHandSize - 1;
  if (hasSecret && !hasFullHand) score += 1; // 秘术+有手牌空间
  return score;
}

// ═══════════════════ 通用逻辑 ═══════════════════

function genericJudgment(self, opponent, state) {
  var wuji = self.hand.filter(function(c) { return c._data.type === 'wuji'; });
  var xinfa = self.hand.filter(function(c) { return c._data.type === 'xinfa'; });

  // 心法盖放代价感知：早期回合内力紧张时，宁可盖低战力武技也要保留心法的内力产出
  if (state.round <= 2 && xinfa.length > 0 && wuji.length > 0) {
    var minWujiCost = Infinity;
    for (var i = 0; i < self.hand.length; i++) {
      if (self.hand[i]._data.type === 'wuji') {
        minWujiCost = Math.min(minWujiCost, self.hand[i]._data.cost || 0);
      }
    }
    if (self.innerPower < Math.max(1, minWujiCost)) {
      return bestPowerMin(wuji);  // 盖最低战力武技，保留心法内力产出
    }
  }

  if (wuji.length > 0) return bestPower(wuji);
  if (xinfa.length > 0) return bestPower(xinfa);
  return self.hand[0];
}

function genericAction(self, opponent, state, gap) {
  var playable = bestPlayable(self, state);
  if (playable.length === 0) {
    return self.hand.length === 0 ? 'no_action' : 'surrender';
  }
  if (gap > 8 && self.hand.length <= 2) return 'surrender';

  // 手牌溢出防护：满手牌时优先低费清牌
  if (self.hand.length >= CONST.maxHandSize && gap > 0) {
    playable.sort(function(a, b) {
      return (a._effCost || a._data.cost || 0) - (b._effCost || b._data.cost || 0);
    });
    state.log.push('P' + self.id + ' 手牌已满(' + self.hand.length + '/' + CONST.maxHandSize + ')，防溢出');
    return doPlay(self, opponent, state, playable[0]);
  }

  // Human策略7：追不上 → 战略放弃保手牌（满手时例外）
  if (shouldStrategicPass(self, opponent, gap, playable) && self.hand.length < CONST.maxHandSize) {
    state.log.push('P' + self.id + ' 战略放弃：追不上(' + gap + ')，保手牌吃破绽');
    return 'surrender';
  }

  if (gap < 3) {
    var xinfa = playable.filter(function(c) { return c._data.type === 'xinfa'; });
    if (xinfa.length > 0) return doPlay(self, opponent, state, bestPower(xinfa));
  }

  if (gap > 0) {
    for (var p = 0; p < playable.length; p++) {
      if (getEffectivePower(playable[p], self, opponent) >= gap)
        return doPlay(self, opponent, state, playable[p]);
    }
    // 策略2横展：追不平时按费效比排序
    playable.sort(function(a, b) {
      var reA = getEffectivePower(a, self, opponent) / Math.max(1, (a._effCost || a._data.cost || 1));
      var reB = getEffectivePower(b, self, opponent) / Math.max(1, (b._effCost || b._data.cost || 1));
      return reB - reA;
    });
    return doPlay(self, opponent, state, playable[0]);
  }

  return 'surrender';
}

function doPlay(self, opponent, state, card) {
  executePlay(self, opponent, state, card);
  return afterPlay(self, opponent, state);
}

// ═══════════════════ 执行引擎 ═══════════════════

function executePlay(self, opponent, state, card) {
  // 血战到底 costDown → 下一张魔教武技减2费
  if (self.tempStats.bloodWarfareUsed && self.tempStats.bloodWarfareMode === 'costDown') {
    if (card._data.faction === 'modeng' && card._data.type === 'wuji') {
      card._effCost = Math.max(0, (card._data.cost || 0) - 2);
      delete self.tempStats.bloodWarfareUsed;
    }
  }
  var effCost = card._effCost !== undefined ? card._effCost : (card._data.cost || 0);
  // ── 负债内力检查 ──
  if (self.innerPower < effCost) {
    state.log.push('⚠ AI P' + self.id + ' 内力不足！需' + effCost + '，当前' + self.innerPower);
    return false;
  }
  self.innerPower = Math.max(0, self.innerPower - effCost);
  self.roundCardsPlayed = (self.roundCardsPlayed || 0) + 1;
  removeFromArr(self.hand, card);

  if (card._data.type === 'xinfa') {
    if (card._data.effectType === 'delayedDantian') {
      if (self.flaws > 0) {
        self.dantian.push(card);
        self.baseInnerPower += (card._data.innerPower || 0);
        self.innerPower += (card._data.innerPower || 0);
        if (state._cmdQueue) state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(self, card, state));
        self.innerPower += (card._data.innerPower || 0);
        state.log.push('P' + self.id + ' 《' + card._data.name + '》(有破绽直进丹田 +' + card._data.innerPower + '内)');
      } else {
        self.actionZone.push(card);
        card._delayedDantian = true;
        card._hitResolved = false; card._zsResolved = false;
        if (state._cmdQueue) state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(self, card, state));
        state.log.push('P' + self.id + ' 《' + card._data.name + '》(延迟下回合进丹田)');
      }
    } else {
      self.dantian.push(card);
      self.baseInnerPower += (card._data.innerPower || 0);
      self.innerPower += (card._data.innerPower || 0);
      if (state._cmdQueue) state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(self, card, state));
      state.log.push('P' + self.id + ' 心法《' + card._data.name + '》进丹田(+' + card._data.innerPower + '内)');
    }
    if (card._data.effectType === 'drawOnPlay') {
      gs.drawCards(self, card._data.drawOnPlayCount || 1, state);
    }
    // 纯阳心法诀：不再自动牺牲，由AI主动决策（shouldSacrificeChunYang）
    // 隐堂基础内功：淬毒引爆后内力永久+1
    if (card._data.effectType === 'poisonBurstInnerUp') {
      if (opponent.poisonStacks >= 3) {
        self.baseInnerPower += 1;
        opponent.poisonStacks -= 3;
        state.log.push('P' + self.id + ' 引爆淬毒！(-3毒,永久内力+1)');
      }
    }
  } else if (card._data.type === 'wuji') {
    self.actionZone.push(card);
    card._hitResolved = false; card._zsResolved = false;
    if (state._cmdQueue) state._cmdQueue.enqueue(state._cmdQueue.createPlayCardCmd(self, card, state));
    var pwr = getEffectivePower(card, self, opponent);
    state.log.push('P' + self.id + ' 武技《' + card._data.name + '》(战力' + pwr + ',费' + effCost + ')');
    if (card._data.effectType === 'discardDrawPoison') {
      if (self.hand.length > 0) self.discardPile.push(self.hand.shift());
      gs.drawCards(self, 1, state);
      opponent.poisonStacks += 1;
      state.log.push('P' + self.id + ' 弃1抽1给1淬毒(敌毒' + opponent.poisonStacks + ')');
    }
    if (card._data.effectType === 'hitDrawAndPoison') {
      opponent.poisonStacks += 1;
      gs.drawCards(self, 1, state);
      state.log.push('P' + self.id + ' 阎王帖命中：毒+1(敌毒' + opponent.poisonStacks + ')，抽1');
    }
    if (card._data.effectType === 'discardReturn' && self.discardPile.length > 0) {
      var bestD = self.discardPile.reduce(function(a, b) { return (a._data.power || 0) > (b._data.power || 0) ? a : b; });
      self.hand.push(bestD);
      removeFromArr(self.discardPile, bestD);
      state.log.push('P' + self.id + ' 踏雪无痕回收《' + bestD._data.name + '》');
    }
    if (card._data.effectType === 'absorbPoisonMultiply') {
      var n = opponent.poisonStacks;
      self.totalPower += n * 2;
      state.log.push('P' + self.id + ' 佛怒唐莲吸收' + n + '毒，+(' + (n*2) + ')战力');
    }
    if (card._data.effectType === 'chaizhao_killDantian') {
      var killCount = card._data.dantianKillCount || 2;
      var killed = gs.destroyDantianCards(opponent, killCount, state);
      state.log.push('P' + self.id + ' 舍身撞：摧毁P' + opponent.id + '丹田' + killed + '张牌');
    }
    if (card._data.effectType === 'clearAndDirectDamage') {
      var n2 = opponent.poisonStacks;
      opponent.poisonStacks = 0;
      if (n2 > 0) {
        var dmg = Math.max(1, n2); // 清N毒=至少1伤
        opponent.hp -= dmg;
        state.log.push('P' + self.id + ' 暴雨梨花针清' + n2 + '毒，直接伤害' + dmg + 'HP（敌HP=' + opponent.hp + '）');
        if (opponent.hp <= 0) {
          state.isGameOver = true;
          state.winner = self.id;
          state.log.push('=== 游戏结束 ===');
          state.log.push('胜者: P' + self.id);
        }
      } else {
        state.log.push('P' + self.id + ' 暴雨梨花针无毒素可清');
      }
    }
    // 天魔解体：自伤1、下回合免费行动、抽2
    if (card._data.effectType === 'forcedResolution') {
      self.hp -= 1;
      self.freePlayNextTurn = true;
      gs.drawCards(self, card._data.bonusDraw || 2, state);
      state.log.push('P' + self.id + ' 天魔解体：自伤1HP(HP=' + self.hp + ')，下回合免费，抽' + (card._data.bonusDraw || 2) + '张');
      if (self.hp <= 0) {
        state.isGameOver = true;
        state.winner = opponent.id;
        state.log.push('=== 游戏结束 ===');
        state.log.push('胜者: P' + opponent.id);
        return 'game_over';
      }
    }
    // 祭血连环斩：打出时若有破绽→抽1
    if (card._data.effectType === 'flawDiscount' && card._data.flawDraw && self.flaws > 0) {
      gs.drawCards(self, card._data.flawDraw, state);
    }
  }
}

function afterPlay(self, opponent, state) {
  var minCost = 99;
  for (var i = 0; i < self.hand.length; i++) {
    var c = self.hand[i]; if ((c._effCost || c._data.cost || 0) < minCost) minCost = (c._effCost || c._data.cost || 0);
  }
  var myPower = calcFullPower(self, opponent, state);
  self.totalPower = myPower;
  var op = calcFullPower(opponent, self, state);
  // Human策略6：穷尽原则——内未空时有可打牌不投降
  if (self.innerPower >= minCost && self.hand.length > 0 && self.roundCardsPlayed < 3) {
    return 'continue';
  }
  // 已达到上限 / 无法再出 → 判断
  if (self.roundCardsPlayed >= 3 || self.innerPower < minCost || self.hand.length === 0) {
    return myPower > op ? 'caught_up' : 'surrender';
  }
  if (myPower > op) return 'caught_up';
  if (self.hand.length === 0) return 'no_action';
  return 'continue';
}

// ═══════════════════ 秘术系统 ═══════════════════

function trySecret(self, opponent, state) {
  var secretCards = self.hand.filter(function(c) {
    return c._data.tags && c._data.tags.indexOf('秘术') >= 0;
  });
  for (var s = 0; s < secretCards.length; s++) {
    var sc = secretCards[s];
    var cost = sc._effCost !== undefined ? sc._effCost : (sc._data.cost || 0);
    if (cost > self.innerPower) continue;
    if (self.extraDeck.length === 0) continue;
    var data = sc._data;
    var faction = data.searchFaction;
    // 中文→拼音映射（searchFaction用中文，card._data.faction用拼音）
    var FACTION_MAP = { '\u9b54\u6559': 'modeng', '\u6b66\u5f53': 'wudang', '\u9690\u5802': 'yintang' };
    var normalizedFaction = FACTION_MAP[faction] || faction;
    var needCount = data.exileCount || 2;
    var targets = [];

    if (data.sources) {
      for (var si = 0; si < data.sources.length; si++) {
        var src = data.sources[si];
        var pool = [];
        if (src === 'actionZone') pool = self.actionZone;
        else if (src === 'discardPile') pool = self.discardPile;
        else if (src === 'hand') pool = self.hand;
        for (var pi = 0; pi < pool.length; pi++) {
          if (hasFaction(pool[pi], normalizedFaction) && pool[pi] !== sc) {
            targets.push({ card: pool[pi], zone: src });
          }
        }
      }
    }
    if (targets.length < needCount) continue;

    self.innerPower = Math.max(0, self.innerPower - cost);
    self.roundCardsPlayed = (self.roundCardsPlayed || 0) + 1;
    removeFromArr(self.hand, sc);

    // ── AI选择：放逐目标 + 检索目标 ──
    var selectors = require('./aiSelectors');
    var sctx = selectors.buildContext(self, opponent, state, { source: 'searchExtra' });
    var chosenExile = selectors.selectExileCards(sctx, targets, needCount);

    var exiled = 0;
    for (var t = 0; t < chosenExile.length && exiled < needCount; t++) {
      var target = chosenExile[t];
      if (target.zone === 'hand') removeFromArr(self.hand, target.card);
      else if (target.zone === 'actionZone') removeFromArr(self.actionZone, target.card);
      else if (target.zone === 'discardPile') removeFromArr(self.discardPile, target.card);
      // 千机图谱：放入弃牌区而非除外区
      if (data.sendToDiscard) {
        self.discardPile.push(target.card);
      } else {
        self.exileZone.push(target.card);
      }
      exiled++;
    }

    if (self.extraDeck.length > 0) {
      var sctx2 = selectors.buildContext(self, opponent, state, { source: 'searchExtra' });
      var bestExt = selectors.selectSearchCard(sctx2, self.extraDeck);
      var bestIdx = self.extraDeck.indexOf(bestExt);
      if (!bestExt) bestExt = bestPower(self.extraDeck); // 兜底
      if (bestIdx >= 0) self.extraDeck.splice(bestIdx, 1);
      self.hand.push(cloneCard(bestExt));
      state.log.push('P' + self.id + ' 秘术《' + data.name + '》：除外' + exiled + '张，选《' + bestExt._data.name + '》');
    }
    if (data.bonusDraw) gs.drawCards(self, data.bonusDraw, state);
    if (data.shuffleBack && !self.hasUsedShuffleBack) {
      self.hasUsedShuffleBack = true;
      self.mainDeck.push(sc);
      self.mainDeck = gs.shuffle(self.mainDeck);
      state.log.push('P' + self.id + ' 真武密录洗回主卡组');
    }
    if (sc._data.type === 'xinfa') {
      self.dantian.push(sc);
      self.baseInnerPower += (sc._data.innerPower || 0);
      self.innerPower += (sc._data.innerPower || 0);
    } else {
      self.discardPile.push(sc);
    }
    return true;
  }
  return false;
}

function pickBestExtra(self, opponent, data) {
  // 武当额外选择
  if (self.faction === 'wudang' || (self.character && self.character.id === 'wuji')) {
    // HP=1时优先纯阳无极剑（回血）
    if (self.hp <= 1) {
      for (var i = 0; i < self.extraDeck.length; i++) {
        if (self.extraDeck[i]._data.effectType === 'flawHeal') return self.extraDeck[i];
      }
    }
    // HP充足时选高战力
    return bestPower(self.extraDeck);
  }
  // 隐堂额外选择
  if (self.faction === 'yintang' || (self.character && self.character.id === 'yeshura')) {
    if (opponent.poisonStacks >= 3) {
      for (var j = 0; j < self.extraDeck.length; j++) {
        if (self.extraDeck[j]._data.effectType === 'absorbPoisonMultiply') return self.extraDeck[j];
      }
    }
    return bestPower(self.extraDeck);
  }
  // 魔教额外选择
  return bestPower(self.extraDeck);
}

// ═══════════════════ 辅助函数 ═══════════════════

function findCards(self, effectType) {
  return self.hand.filter(function(c) { return c._data.effectType === effectType; });
}
function findInHand(self, effectType) {
  for (var i = 0; i < self.hand.length; i++)
    if (self.hand[i]._data.effectType === effectType) return self.hand[i];
  return null;
}
function hasFaction(card, faction) {
  return card._data.tags && card._data.tags.indexOf(faction) >= 0;
}
function bestPlayable(self, state) {
  return self.hand.filter(function(c) { return (c._effCost || 0) <= self.innerPower; });
}

function pickBestScored(ai, cards, self, opponent, state) {
  if (cards.length === 0) return 'surrender';
  var best = cards[0];
  var bestScore = ai.scoreCard(best, self, opponent, state);
  for (var i = 1; i < cards.length; i++) {
    var sc = ai.scoreCard(cards[i], self, opponent, state);
    if (sc > bestScore) { bestScore = sc; best = cards[i]; }
  }
  return doPlay(self, opponent, state, best);
}

function getEffectivePower(card, self, opponent) {
  var power = card._data.power || 0;
  var et = card._data.effectType;
  if (et === 'flawDiscount' && self.flaws > 0) power -= (card._data.flawPowerReduce || 3);
  if (et === 'conditionalPower_flaw_plus3' && self.flaws > 0) power += (card._data.flawPowerBonus || 3);
  if (et === 'poisonPowerBuff' && opponent.poisonStacks > 0) power += (card._data.poisonPowerBonus || 3);
  if (et === 'zhengshang' && card._data.flawPowerBuff && self.flaws > 0) power += card._data.flawPowerBuff;
  if (et === 'movePowerBuff' && self.tempStats.cardsMoved) power += (card._data.movePowerBuffAmount || 3);
  if (card._data.judgmentBonus && self.judgmentZone === card) power += card._data.judgmentBonus;
  // 武当基础剑：战力=内力值（最高10）
  if (et === 'innerToPower') power = Math.min(self.innerPower, card._data.maxInnerToPower || 10);
  // 真武七截剑：内力×2加成
  if (et === 'innerPowerToPower' && card._data.permanentBuff) power += self.innerPower * (card._data.innerToPowerBoost || 2);
  // 九阳神功：内力越高战力越大
  if (et === 'innerToPowerBuff') power += self.innerPower;
  return power;
}

function calcFullPower(player, opponent, state) {
  var total = 0;
  if (player.judgmentZone) {
    total += player.judgmentZone._effectivePower !== undefined ?
             player.judgmentZone._effectivePower : (player.judgmentZone._data.power || 0);
    // 血刀大法：对手判定区是巧/诡 → +2
    if (player.judgmentZone._data.effectType === 'zhengshang' && opponent.judgmentZone) {
      var oppElem = opponent.judgmentZone._data.element;
      var bonusElems = player.judgmentZone._data.counterJudgmentElements || [];
      if (bonusElems.indexOf(oppElem) >= 0) {
        total += (player.judgmentZone._data.counterJudgmentBonus || 2);
      }
    }
    // 血刀大法/狂骨碎岩拳：有破绽时才加判定战力
    if (player.judgmentZone._data.effectType === 'zhengshang' && player.judgmentZone._data.flawPowerBuff && player.flaws > 0) {
      total += player.judgmentZone._data.flawPowerBuff;
    }
  }
  for (var i = 0; i < player.actionZone.length; i++) {
    total += getEffectivePower(player.actionZone[i], player, opponent);
  }
  for (var j = 0; j < player.dantian.length; j++) total += player.dantian[j]._data.power || 0;
  for (var k = 0; k < player.discardPile.length; k++) {
    if (player.discardPile[k].effectType === 'persistInDiscard') total += player.discardPile[k]._data.power || 0;
  }
  return total;
}

function calcEffectiveCosts(self, state) {
  for (var i = 0; i < self.hand.length; i++) {
    var card = self.hand[i];
    var cost = card._data.cost || 0;
    if (self.character.passives) {
      for (var j = 0; j < self.character.passives.length; j++) {
        var p = self.character.passives[j];
        if (p.type === 'nightRaid' && card._data.element === p.system && (!self.roundCardsPlayed || self.roundCardsPlayed === 0)) {
          cost = Math.max(0, cost - p.discount);
        }
      }
    }
    if (card._data.effectType === 'flawDiscount' && self.flaws > 0) cost = Math.max(0, cost - (card._data.flawCostReduce || 2));
    if (card._liangyiDiscount) cost = Math.max(0, cost - 2);
    // 天魔解体：下回合首张卡免费
    if (self.freePlayNextTurn && (!self.roundCardsPlayed || self.roundCardsPlayed === 0) && cost > 0) {
      cost = 0;
      self.freePlayNextTurn = false;
      self._freePlayUsed = true;
    }
    card._effCost = cost;
  }
}

function resolveHandData(self) {
  for (var i = 0; i < self.hand.length; i++) {
    if (!self.hand[i]._data) self.hand[i]._data = cr.getCard(self.hand[i].id);
  }
}

function removeFromArr(arr, card) {
  var idx = arr.indexOf(card);
  if (idx >= 0) arr.splice(idx, 1);
}

function bestPower(cards) { return cards.reduce(function(a, b) { return (a._data.power || 0) > (b._data.power || 0) ? a : b; }); }
function bestPowerMin(cards) { return cards.reduce(function(a, b) { return (a._data.power || 0) < (b._data.power || 0) ? a : b; }); }

function cloneCard(card) {
  return {
    id: card.id, _data: card._data,
    name: card._data.name, type: card._data.type, element: card._data.element,
    cost: card._data.cost, power: card._data.power,
    innerPower: card._data.innerPower || 0,
    tags: card._data.tags || [], isExtra: true, effectType: card._data.effectType || null
  };
}

module.exports = { BaseAI };
