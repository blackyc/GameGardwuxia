// 战力结算器 v5
var CONST = require('../data/constants.json');

function isCounter(element1, element2) {
  var chain = CONST.counterChain || { spirit: 'deceptive', deceptive: 'skillful', skillful: 'domineering', domineering: 'spirit' };
  return chain[element1] === element2;
}

function calcTotalPower(player, state) {
  var total = 0;
  var opp = state.players[player.id === 1 ? 1 : 0];

  if (player.judgmentZone) {
    var jz = player.judgmentZone;
    total += jz._effectivePower !== undefined ? jz._effectivePower : (jz.power || 0);
  }

  for (var i = 0; i < player.actionZone.length; i++) {
    var c = player.actionZone[i];
    var pwr = c.power || 0;
    if (c.effectType === 'conditionalPower_flaw_plus3' && player.flaws > 0) pwr += 3;
    if (c.effectType === 'poisonPowerBuff' && opp.poisonStacks > 0) pwr += 3;
    if (c.effectType === 'movePowerBuff' && player.cardsMovedThisTurn) pwr += 3;
    if (c.effectType === 'zhengshang' && c._data.flawPowerBuff && player.flaws > 0) pwr += c._data.flawPowerBuff;
    if (c.effectType === 'flawDiscount' && player.flaws > 0) pwr -= (c._data.flawPowerReduce || 3);
    if (c.effectType === 'innerToPower') pwr = Math.min(player.innerPower, c._data.maxInnerToPower || 10);
    if (c.effectType === 'innerPowerToPower' && c._data.permanentBuff) pwr += player.innerPower * (c._data.innerToPowerBoost || 2);
    if (c.effectType === 'innerToPowerBuff') pwr += player.innerPower;
    total += pwr;
  }

  for (var i = 0; i < player.dantian.length; i++) {
    var dc = player.dantian[i];
    total += dc.power || 0;
    // 九阳神功：丹田中时，有武当武技在场→消耗内力为该武技增伤
    if (dc.effectType === 'innerToPowerBuff' && dc._data.faction === 'wudang') {
      var hasWudangWuji = false;
      for (var k = 0; k < player.actionZone.length; k++) {
        if (player.actionZone[k]._data.faction === 'wudang' && player.actionZone[k]._data.type === 'wuji') {
          hasWudangWuji = true;
          break;
        }
      }
      if (hasWudangWuji) {
        total += player.innerPower;
      }
    }
  }

  // 魔门基础心法：弃牌堆仍提供战力
  for (var j = 0; j < player.discardPile.length; j++) {
    if (player.discardPile[j].effectType === 'persistInDiscard') {
      total += player.discardPile[j]._data.power || 0;
    }
  }

  player.totalPower = total;
  return total;
}

function runJudgment(p1, p2, state) {
  var j1 = p1.judgmentZone;
  var j2 = p2.judgmentZone;
  if (!j1 || !j2) return;

  var e1 = j1._data.element || 'none';
  var e2 = j2._data.element || 'none';

  var p1pwr = j1._data.power || 0;
  var p2pwr = j2._data.power || 0;

  // 透骨钉：有破绽→战力+3
  if (j1._data.effectType === 'conditionalPower_flaw_plus3' && p1.flaws > 0) p1pwr += (j1._data.flawPowerBonus || 3);
  if (j2._data.effectType === 'conditionalPower_flaw_plus3' && p2.flaws > 0) p2pwr += (j2._data.flawPowerBonus || 3);

  // 太极剑·三环套月：判定区战力+丹田心法数×2
  if (j1._data.effectType === 'judgmentDantianPower') {
    var xf1 = p1.dantian.filter(function(c) { return c.tags && c.tags.indexOf('心法') >= 0; }).length;
    p1pwr += xf1 * 2;
  }
  if (j2._data.effectType === 'judgmentDantianPower') {
    var xf2 = p2.dantian.filter(function(c) { return c.tags && c.tags.indexOf('心法') >= 0; }).length;
    p2pwr += xf2 * 2;
  }

  // 血蛭镖：有破绽 → 战力减（从卡牌数据读取）
  if (j1._data.effectType === 'faceDown_flaw_nerfSelf_drainEnemy' && p1.flaws > 0) {
    p1pwr = Math.max(0, p1pwr - (j1._data.flawPowerPenalty || 2));
  }
  if (j2._data.effectType === 'faceDown_flaw_nerfSelf_drainEnemy' && p2.flaws > 0) {
    p2pwr = Math.max(0, p2pwr - (j2._data.flawPowerPenalty || 2));
  }

  // 血刀大法：敌方判定区是巧/诡 → +2（从卡牌数据读取）
  var bonus1 = j1._data.effectType === 'zhengshang' ? j1._data.counterJudgmentBonus || 2 : 0;
  var bonus2 = j2._data.effectType === 'zhengshang' ? j2._data.counterJudgmentBonus || 2 : 0;
  var elem1 = j1._data.counterJudgmentElements || ['skillful', 'deceptive'];
  var elem2 = j2._data.counterJudgmentElements || ['skillful', 'deceptive'];
  if (j1._data.effectType === 'zhengshang' && elem1.indexOf(e2) >= 0) {
    p1pwr += bonus1;
    state.log.push('P1血刀大法：敌方' + e2 + '系，+' + bonus1);
  }
  if (j2._data.effectType === 'zhengshang' && elem2.indexOf(e1) >= 0) {
    p2pwr += bonus2;
    state.log.push('P2血刀大法：敌方' + e1 + '系，+' + bonus2);
  }

  // 心法盖放无属性 → 无法克制他人
  var isXinfa1 = j1._data.type === 'xinfa';
  var isXinfa2 = j2._data.type === 'xinfa';

  if (!isXinfa1 && !isXinfa2 && isCounter(e1, e2)) {
    p1pwr += CONST.counterBonus;
    state.log.push('P1(' + e1 + ')克制P2(' + e2 + ')，+' + CONST.counterBonus);
  } else if (!isXinfa1 && !isXinfa2 && isCounter(e2, e1)) {
    p2pwr += CONST.counterBonus;
    state.log.push('P2(' + e2 + ')克制P1(' + e1 + ')，+' + CONST.counterBonus);
  }

  j1._effectivePower = p1pwr;
  j2._effectivePower = p2pwr;

  // 血蛭镖：有破绽 → 敌人-1内力
  if (j1._data.effectType === 'faceDown_flaw_nerfSelf_drainEnemy' && p1.flaws > 0) {
    p2.innerPower = Math.max(0, p2.innerPower - 1);
    state.log.push('P1血蛭镖：P2失去1内力');
  }
  if (j2._data.effectType === 'faceDown_flaw_nerfSelf_drainEnemy' && p2.flaws > 0) {
    p1.innerPower = Math.max(0, p1.innerPower - 1);
    state.log.push('P2血蛭镖：P1失去1内力');
  }

  calcTotalPower(p1, state);
  calcTotalPower(p2, state);

  // 梯云纵：拆招，抵消敌方战力增幅效果 + 抽1
  for (var ti = 0; ti < p1.actionZone.length; ti++) {
    if (p1.actionZone[ti].effectType === 'chaizhao_negateBuff') {
      stripActionBuffs(p2, state);
      state.log.push('梯云纵: P1 拆招成功，抵消P2战力增幅');
      if (p1.deck.length > 0) { p1.hand.push(p1.deck.pop()); state.log.push('梯云纵: P1 抽1张牌'); }
      break;
    }
  }
  for (var tj = 0; tj < p2.actionZone.length; tj++) {
    if (p2.actionZone[tj].effectType === 'chaizhao_negateBuff') {
      stripActionBuffs(p1, state);
      state.log.push('梯云纵: P2 拆招成功，抵消P1战力增幅');
      if (p2.deck.length > 0) { p2.hand.push(p2.deck.pop()); state.log.push('梯云纵: P2 抽1张牌'); }
      break;
    }
  }

  state.log.push('战力 P1=' + p1.totalPower + ' vs P2=' + p2.totalPower);
}

// 移除玩家所有buff战力（保留基础战力）
function stripActionBuffs(player, state) {
  var baseTotal = 0;
  if (player.judgmentZone) baseTotal += player.judgmentZone._data.power || 0;
  for (var i = 0; i < player.actionZone.length; i++) {
    var c = player.actionZone[i];
    var bpwr = c.power || 0;
    if (c.effectType === 'innerToPower') bpwr = Math.min(player.innerPower, c._data.maxInnerToPower || 10);
    baseTotal += bpwr;
  }
  for (var j = 0; j < player.dantian.length; j++) {
    baseTotal += player.dantian[j].power || 0;
  }
  for (var k = 0; k < player.discardPile.length; k++) {
    if (player.discardPile[k].effectType === 'persistInDiscard') {
      baseTotal += player.discardPile[k]._data.power || 0;
    }
  }
  player.totalPower = baseTotal;
}

function determineDisadvantaged(p1, p2) {
  if (p1.totalPower < p2.totalPower) return p1;
  if (p2.totalPower < p1.totalPower) return p2;
  if (p1.flaws < p2.flaws) return p2;
  if (p2.flaws < p1.flaws) return p1;
  return Math.random() < 0.5 ? p1 : p2;
}

module.exports = { isCounter, calcTotalPower, runJudgment, determineDisadvantaged, stripActionBuffs };
