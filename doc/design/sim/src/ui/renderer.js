// ui/renderer.js — 表现层（纯渲染，零游戏逻辑）
// v2 — 2026-05-25: +AI手牌数, +卡牌效果文本, +角色技能, -入门泄露暗盖
var ELEM_MAP = { domineering: '霸', skillful: '巧', deceptive: '诡', spirit: '灵' };
var TYPE_ICON = { xinfa: '心法', wuji: '武技' };
var FACTION_NAME = { modeng: '魔教', wudang: '武当', yintang: '隐堂', public: '公共' };

function cardStr(c) {
  if (!c) return '(none)';
  var d = c._data;
  return d.name + ' ' + (d.type === 'xinfa' ? 'X' : 'W') + '/' + (d.element || '') +
    ' C' + (d.cost || 0) + ' P' + (d.power || 0) +
    (d.innerPower ? ' I' + d.innerPower : '') +
    (d.effectType ? ' [' + d.effectType + ']' : '');
}

function cardDetail(c, indent) {
  if (!c) return '(none)';
  var d = c._data;
  return cardDetailCompact(c) + '\n' + (indent || '') + '  效果: ' + describeEffect(d);
}

function describeEffect(d) {
  var et = d.effectType, parts = [];
  if (d.isExtra) parts.push('额外卡池牌');
  if (d.immuneToEffects) parts.push('免疫效果');
  if (d.immuneToChaiZhao) parts.push('免疫拆招');
  if (et === 'conditionalPower_flaw_plus3' && d.flawPowerBonus) parts.push('对手有破绽时战力+' + d.flawPowerBonus);
  if (et === 'zhengshang') { parts.push('震伤'); if (d.lowHpZhengshangBuff) parts.push('己方低血时震伤Buff'); if (d.flawPowerBuff) parts.push('己方有破绽+战力' + d.flawPowerBuff); }
  if (et === 'judgmentDantianPower' && d.dantianPowerPerCard) parts.push('判定P=基础+丹田每卡+' + d.dantianPowerPerCard);
  if (et === 'innerToPower' && d.maxInnerToPower) parts.push('战力=min(内力,' + d.maxInnerToPower + ')');
  if (et === 'innerPowerToPower' && d.innerToPowerBoost) parts.push('战力=内力×' + d.innerToPowerBoost);
  if (et === 'innerToPowerBuff' && d.innerThreshold) parts.push('内力≥' + d.innerThreshold + '时战力翻倍');
  if (et === 'poisonPowerBuff' && d.poisonPowerBonus) parts.push('对手每层毒+战力' + d.poisonPowerBonus);
  if (et === 'movePowerBuff' && d.movePowerBuffAmount) parts.push('全场武技战力+' + d.movePowerBuffAmount);
  if (et === 'flawDiscount') { parts.push('破绽打折'); if (d.flawCostReduce) parts.push('费-'+d.flawCostReduce); if (d.flawPowerReduce) parts.push('战力-'+d.flawPowerReduce); if (d.flawDraw) parts.push('抽'+d.flawDraw); }
  if (et === 'faceDown_flaw_nerfSelf_drainEnemy') { parts.push('盖放判定'); if (d.flawPowerPenalty) parts.push('己方破绽-P' + d.flawPowerPenalty); }
  if (d.counterJudgmentBonus) parts.push('反制判定+战力' + d.counterJudgmentBonus);
  if (d.counterJudgmentElements && d.counterJudgmentElements.length) parts.push('可反制元素:' + d.counterJudgmentElements.join(','));
  if (et === 'persistInDiscard') parts.push('弃牌堆中仍提供战力');
  if (et === 'selfFlawGivesInner') parts.push('己方自身效果产生破绽时内力+1');
  if (et === 'discardInnerBonus' && d.discardCostPower) parts.push('从弃牌回收时+P'+d.discardCostPower);
  if (et === 'dantianInnerBonus' && d.dantianThreshold) parts.push('丹田≥'+d.dantianThreshold+'牌时额外产内');
  if (et === 'altEntryDantianDraw') parts.push('非打出方式进丹田时抽1');
  if (et === 'delayedDantian') parts.push('下回合开始时进丹田+产内');
  if (et === 'lowerPoisonThreshold' && d.poisonThresholdOffset) parts.push('中毒爆发阈值-'+d.poisonThresholdOffset);
  if (et === 'poisonBurstInnerUp') parts.push('对手中毒爆发时+2内力');
  if (et === 'drawOnPlay' && d.drawOnPlayCount) parts.push('打出后抽'+d.drawOnPlayCount+'牌');
  if (et === 'chaizhao_killDantian' && d.dantianKillCount) parts.push('拆招·摧毁对手丹田' + d.dantianKillCount + '张牌');
  if (et === 'chaizhao_negateBuff') parts.push('拆招·抵消对手战力增幅 抽1');
  if (et === 'searchExtra') { parts.push('检索额外卡池'); if (d.searchFaction) parts.push('势力:' + d.searchFaction); if (d.exileCount) parts.push('放逐'+d.exileCount+'张'); if (d.sources) parts.push('来源:'+d.sources.join(',')); }
  if (et === 'lowHpSearch') parts.push('低血时检索引擎');
  if (et === 'hitDrawAndPoison') { parts.push('命中'); if (d.hasHit) parts.push('附带1毒+抽'+(d.hitDrawCount||1)); }
  if (et === 'enterDiscardPoison') parts.push('进弃牌堆时对手+1毒');
  if (et === 'judgmentLossPoison') parts.push('判定失利时对方+1毒');
  if (et === 'discardDrawPoison') parts.push('从弃牌回收时对手+1毒');
  if (et === 'absorbPoisonMultiply') parts.push('吸收对手毒×2转战力');
  if (et === 'clearAndDirectDamage' && d.directDamage) parts.push('清除毒并造成' + d.directDamage + '直伤');
  if (et === 'forcedResolution') parts.push('强行结算(自残1HP)');
  if (d.nextTurnFreePlay) parts.push('下回合免费出牌');
  if (d.permanentBuff) parts.push('永久buff');
  if (et === 'flawHeal') parts.push('清除破绽');
  if (et === 'zhengshangDrain') parts.push('震伤吸血(回内)');
  if (et === 'disadvantagedDrawAndReturn') parts.push('劣势时抽1并退回手牌');
  if (et === 'discardReturn') parts.push('弃牌回收');
  if (et === 'moveCostReducer') parts.push('降低武技费用');
  if (d.bonusDraw) parts.push('额外抽' + d.bonusDraw);
  if (d.canSacrificeForDraw) parts.push('可牺牲(卖回合换抽2)');
  if (et === 'discardCostPower') parts.push('从弃牌回收+P'+d.discardCostPower);
  return parts.length ? parts.join(' | ') : '—';
}

function cardDetailCompact(c, showEffect) {
  var d = c._data;
  var base = '《' + d.name + '》 ' + (d.type === 'xinfa' ? '心' : '武') + '/' + (ELEM_MAP[d.element] || '') +
    ' 费' + (d.cost || 0) + ' P' + (d.power || 0) +
    (d.innerPower ? ' 内+' + d.innerPower : '');
  if (showEffect && d.effectType) base += ' | ' + describeEffectCompact(d);
  else if (!showEffect && d.effectType) base += ' [' + describeEffectCompact(d) + ']';
  return base;
}

function describeEffectCompact(d) {
  var et = d.effectType, parts = [];
  if (d.isExtra) return '额外';
  if (et === 'zhengshang') { parts.push('震伤'); if (d.flawPowerBuff) parts.push('破绽P+'+d.flawPowerBuff); }
  else if (et === 'conditionalPower_flaw_plus3' && d.flawPowerBonus) parts.push('敌破绽P+'+d.flawPowerBonus);
  else if (et === 'judgmentDantianPower') parts.push('判定P+丹田卡×'+(d.dantianPowerPerCard||0));
  else if (et === 'innerToPower' && d.maxInnerToPower) parts.push('P=min(内,'+d.maxInnerToPower+')');
  else if (et === 'innerPowerToPower') parts.push('P=内×'+(d.innerToPowerBoost||1));
  else if (et === 'innerToPowerBuff') parts.push('内≥'+d.innerThreshold+' P×2');
  else if (et === 'poisonPowerBuff' && d.poisonPowerBonus) parts.push('毒P+'+d.poisonPowerBonus);
  else if (et === 'movePowerBuff') parts.push('全场武技P+'+(d.movePowerBuffAmount||0));
  else if (et === 'flawDiscount') { parts.push('破绽打折'); if (d.flawCostReduce) parts.push('费-'+d.flawCostReduce); }
  else if (et === 'flawHeal') parts.push('清除破绽');
  else if (et === 'faceDown_flaw_nerfSelf_drainEnemy') parts.push('盖放 破绽自损P-'+d.flawPowerPenalty);
  else if (et === 'persistInDiscard') parts.push('弃牌有效');
  else if (et === 'selfFlawGivesInner') parts.push('自伤破绽+内');
  else if (et === 'delayedDantian') parts.push('下回合初进丹田');
  else if (et === 'dantianInnerBonus') parts.push('额外产内');
  else if (et === 'altEntryDantianDraw') parts.push('非打出进丹田抽1');
  else if (et === 'discardInnerBonus' && d.discardCostPower) parts.push('回收P+'+d.discardCostPower);
  else if (et === 'discardCostPower') parts.push('回收P+'+d.discardCostPower);
  else if (et === 'drawOnPlay') parts.push('打出抽'+(d.drawOnPlayCount||1));
  else if (et === 'chaizhao_killDantian') parts.push('拆招·毁丹田'+d.dantianKillCount);
  else if (et === 'chaizhao_negateBuff') parts.push('拆招·消增幅');
  else if (et === 'searchExtra') { parts.push('检索'+(d.searchFaction||'额外')); if (d.exileCount) parts.push('放逐'+d.exileCount); }
  else if (et === 'lowHpSearch') parts.push('低血检索');
  else if (et === 'hitDrawAndPoison') parts.push('命中毒+抽'+d.hitDrawCount);
  else if (et === 'enterDiscardPoison') parts.push('弃牌毒');
  else if (et === 'judgmentLossPoison') parts.push('判定败毒');
  else if (et === 'discardDrawPoison') parts.push('回收毒');
  else if (et === 'absorbPoisonMultiply') parts.push('吸毒P×2');
  else if (et === 'clearAndDirectDamage') parts.push('清毒直伤'+d.directDamage);
  else if (et === 'forcedResolution') parts.push('强结算');
  else if (et === 'zhengshangDrain') parts.push('震伤吸血');
  else if (et === 'disadvantagedDrawAndReturn') parts.push('劣势抽1退手');
  else if (et === 'discardReturn') parts.push('弃牌回收');
  else if (et === 'moveCostReducer') parts.push('减武技费');
  else if (et === 'lowerPoisonThreshold') parts.push('毒爆阈-'+d.poisonThresholdOffset);
  else if (et === 'poisonBurstInnerUp') parts.push('对方毒爆+2内');
  else parts.push(et);
  if (d.immuneToEffects) parts.push('免疫');
  if (d.immuneToChaiZhao) parts.push('免疫拆招');
  if (d.canSacrificeForDraw) parts.push('可牺牲');
  if (d.bonusDraw) parts.push('抽'+d.bonusDraw);
  if (d.counterJudgmentBonus) parts.push('反制+'+d.counterJudgmentBonus);
  return parts.join('|');
}

function pad(s, len) { var str = String(s); while (str.length < len) str += ' '; return str; }

function phaseLabel(phase) {
  var m = { chooseJudgment: '判定出牌', action: '行动', judgment: '判定结算',
    response: '响应窗口', newRound: '新回合', nextRound: '回合结束', endPhase: '结束' };
  return m[phase] || phase;
}

// ── 角色技能描述 ──
var CHARACTER_SKILLS = {
  'xuedao': [
    '【血战到底】出牌阶段，可主动获1破绽，选择:',
    '  ① 本回合震伤触发后弃牌数+1',
    '  ② 本回合下一张魔教牌消耗-2',
    '  (每回合限1次)'
  ],
  'wuji': [
    '【太极剑意】判定阶段，若盖放心法战力低于对手:',
    '  心法入丹田生效→必须打出武技代替→重新判定',
    '  (每回合限1次 / 主卡组最多15心法)'
  ],
  'yeshura': [
    '【夜袭】回合首张诡系卡内力消耗-2',
    '【毒发】敌方累计3层淬毒→清零→失去1HP',
    '  (每回合可触发多次)'
  ]
};

function renderCharacterSkill(charId) {
  var lines = CHARACTER_SKILLS[charId];
  if (!lines || !lines.length) return '';
  var out = ['\n══ 宗师技能 ══'];
  for (var i = 0; i < lines.length; i++) out.push('  ' + lines[i]);
  out.push('');
  return out.join('\n');
}

// ── 对局面板 ──

function render(state, hpIdx, opts) {
  opts = opts || {};
  var hp = state.players[hpIdx || 0], ap = state.players[1 - (hpIdx || 0)];
  var adv = (hp.totalPower > ap.totalPower) ? '你优势' : (hp.totalPower < ap.totalPower) ? '你劣势' : '平局';
  var out = [], L = function(s) { out.push(s); };

  L('\n╔══════════════════════════════════════════╗');
  L('║  Round ' + state.round + ' | ' + phaseLabel(state.phase) + ' | ' + adv +
    ' | ' + (state._difficulty || '普通') + '难度 ║');
  L('╠══════════════════════════════════════════╣');
  L('║         你(' + hp.character.name + ') vs AI(' + ap.character.name + ')          ║');

  // ── 基础状态 ──
  L('╠══════════════════════╦═══════════════════╣');
  var p1Line = '║ HP:' + hp.hp + '/' + hp.maxHp + ' 破绽:' + hp.flaws + ' 内力:' + hp.innerPower +
    ' 战力:' + hp.totalPower;
  L(p1Line + pad('', 51 - p1Line.length) + '║ HP:' + ap.hp + '/' + ap.maxHp + ' 破绽:' + ap.flaws +
    ' 内力:' + ap.innerPower + ' 战力:' + ap.totalPower);
  if (hp.poisonStacks || hp.flawShield || ap.poisonStacks || ap.flawShield) {
    var p1x = '║ ' + (hp.flawShield ? '盾:' + hp.flawShield + ' ' : '') + (hp.poisonStacks ? '毒:' + hp.poisonStacks : '');
    var p2x = (ap.flawShield ? '盾:' + ap.flawShield + ' ' : '') + (ap.poisonStacks ? '毒:' + ap.poisonStacks : '');
    L(p1x + pad('', 19) + '║ ' + p2x);
  }
  L('╠══════════════════════╩═══════════════════╣');

  // ── 判定区 ──
  if (hp.judgmentZone) L('║ 你的判定: ' + pad(cardDetailCompact(hp.judgmentZone), 48) + '║');
  // ⚠ 永远不泄露AI暗盖牌内容
  if (ap.judgmentZone) L('║ AI 判定: [暗盖·1张]');

  // ── 出牌区 ──
  L('║--- 出牌区(AZ) ---');
  L('║ 你(' + hp.actionZone.length + '): ' + (hp.actionZone.length ? '' : '(空)'));
  for (var ai = 0; ai < hp.actionZone.length; ai++) L('║   ' + cardDetailCompact(hp.actionZone[ai]));
  L('║ AI(' + ap.actionZone.length + '): ' + (ap.actionZone.length ? '' : '(空)'));
  for (var aj = 0; aj < ap.actionZone.length; aj++) L('║   ' + cardDetailCompact(ap.actionZone[aj]));

  // ── 丹田区 ──
  L('║--- 丹田(DT) ---');
  L('║ 你(' + hp.dantian.length + '): ' + (hp.dantian.length ? '' : '(空)'));
  for (var di = 0; di < hp.dantian.length; di++) L('║   ' + cardDetailCompact(hp.dantian[di]));
  L('║ AI(' + ap.dantian.length + '): ' + (ap.dantian.length ? '' : '(空)'));
  for (var dj = 0; dj < ap.dantian.length; dj++) L('║   ' + cardDetailCompact(ap.dantian[dj]));

  // ── 手牌（含效果文本） ──
  L('║--- 手牌 (你:' + hp.hand.length + '张 | AI:' + ap.hand.length + '张) ---');
  for (var hi = 0; hi < hp.hand.length; hi++) {
    L('║ [' + hi + '] ' + cardDetailCompact(hp.hand[hi], true));
  }

  // ── 卡组 ──
  L('╠══════════════════════════════════════════╣');
  L('║ 主卡组: 你' + hp.mainDeck.length + '张 | AI' + ap.mainDeck.length + '张');
  L('║ 额外卡组: 你' + hp.extraDeck.length + '张 | AI' + ap.extraDeck.length + '张');
  L('║ 弃牌堆: 你' + hp.discardPile.length + '张 | AI' + ap.discardPile.length + '张');
  if (hp.exileZone.length || ap.exileZone.length) L('║ 除外区: 你' + hp.exileZone.length + '张 | AI' + ap.exileZone.length + '张');
  L('╚══════════════════════════════════════════╝');

  if (!opts.noRecap) { out.push(''); out = out.concat(renderRecap(state)); }
  return out.join('\n');
}

function renderRecap(state) {
  var log = state.log || [];
  if (!log.length) return [];
  var out = ['\n── 战斗回顾 ──'];
  var maxShow = Math.min(log.length, 10);
  for (var i = Math.max(0, log.length - maxShow); i < log.length; i++) out.push('  ' + log[i]);
  if (log.length > maxShow) out.push('  ...(' + (log.length - maxShow) + '条更早记录)');
  return out;
}

// ── 区查看器渲染 ──

function renderDiscardPile(player, isHuman) {
  var dp = player.discardPile;
  var label = isHuman ? '你的' : 'AI的';
  if (!dp.length) return '\n══ ' + label + '弃牌堆 ══\n  (空)';
  var out = ['\n══ ' + label + '弃牌堆 (' + dp.length + '张) ══'];
  for (var i = 0; i < dp.length; i++) {
    out.push('  [' + i + '] ' + cardDetailCompact(dp[i], true));
  }
  out.push('  (按进入顺序排列: 判定区→出牌区→回合结束)');
  return out.join('\n');
}

function renderExtraDeck(player, isHuman) {
  var ed = player.extraDeck;
  var label = isHuman ? '你的' : 'AI的';
  if (!ed.length) return '\n══ ' + label + '额外卡组 ══\n  (空)';
  var out = ['\n══ ' + label + '额外卡组 (' + ed.length + '张) ══'];
  for (var i = 0; i < ed.length; i++) {
    out.push('  ● ' + cardDetailCompact(ed[i], true));
  }
  out.push('  (未显示牌序)');
  return out.join('\n');
}

// ── 交互窗口 ──

function renderResponseWindow(state) {
  var rw = state._responseWindow;
  if (!rw || !rw.candidates || !rw.candidates.length) return null;
  var out = ['\n══ 响应窗口 ══'];
  for (var i = 0; i < rw.candidates.length; i++) {
    out.push('  [' + i + '] 《' + rw.candidates[i].name + '》');
  }
  out.push('\n>>> node interact3.js respond <n> | skip');
  return out.join('\n');
}

function renderDantianSelect(state) {
  var sel = state._dantianSelect;
  if (!sel) return null;
  var opp = state.players[sel.oppId || 1];
  var out = ['\n══ 舍身撞·丹田选择 ══'];
  out.push('选出' + sel.maxSelect + '张心法从' + opp.character.name + '丹田摧毁:');
  for (var i = 0; i < opp.dantian.length; i++) {
    var cd = opp.dantian[i];
    if (!cd) continue;
    out.push('  [' + i + '] 《' + (cd._data || cd).name + '》');
  }
  out.push('\n>>> node interact3.js dantian <idx> [<idx>]');
  return out.join('\n');
}

// ── 阶段可用命令 ──

var PHASE_COMMANDS = {
  chooseJudgment: [
    ['choice <n>', '选择手牌[n]为判定牌 (暗盖)'],
    ['pass',      '跳过暗盖 (无手牌时自动劣势)'],
    ['view <n>',  '检视手牌[n]的详细信息'],
    ['discard',   '检视弃牌堆'],
    ['extra',     '检视额外卡组'],
    ['status',    '刷新对局面板'],
    ['help',      '显示帮助'],
    ['quit',      '退出游戏']
  ],
  action: [
    ['play <n>',      '从手牌打出[n]号牌'],
    ['pass',          '结束出牌 移交出牌权'],
    ['bloodwarfare',  '激活血战到底 (仅血刀，损失1破绽)'],
    ['discard',       '检视弃牌堆'],
    ['extra',         '检视额外卡组'],
    ['view <n>',      '检视手牌[n]的详细信息'],
    ['status',        '刷新对局面板'],
    ['help',          '显示帮助'],
    ['quit',          '退出游戏']
  ],
  actionBloodMode: [
    ['bloodmode 1', '血战模式① 震伤弃牌+1'],
    ['bloodmode 2', '血战模式② 魔教牌消耗-2']
  ],
  actionAIPriority: [
    ['continue', '推进：AI 出牌']
  ],
  response: [
    ['respond <n>', '响应窗口选择[n]号牌'],
    ['skip',        '跳过响应'],
    ['help',        '显示帮助']
  ],
  judgment: [],
  newRound: [],
  nextRound: [],
  endPhase: [],
  _default: [
    ['status', '刷新对局面板'],
    ['help',   '显示帮助'],
    ['quit',   '退出游戏']
  ]
};

function renderPhaseCommands(state) {
  var cmds = (PHASE_COMMANDS[state.phase] || PHASE_COMMANDS._default).slice();
  // bloodmode: only show when player has activated bloodwarfare and waiting to choose mode
  if (state.phase === 'action' && (state.players[0].tempStats || {}).bloodWarfareUsed &&
      !(state.players[0].tempStats || {}).bloodWarfareMode) {
    cmds = cmds.concat(PHASE_COMMANDS.actionBloodMode);
  }
  // continue: show when AI has priority (human waiting for AI turn)
  if (state.phase === 'action' && state._disadvantagedSide === 'ai') {
    cmds = PHASE_COMMANDS.actionAIPriority.concat(cmds);
  }
  if (!cmds.length) return '';
  var out = ['\n══ 可用命令 ══'];
  for (var i = 0; i < cmds.length; i++) {
    out.push('  ' + pad(cmds[i][0], 24) + '— ' + cmds[i][1]);
  }
  return out.join('\n');
}

module.exports = {
  cardStr: cardStr,
  cardDetail: cardDetail,
  describeEffect: describeEffect,
  cardDetailCompact: cardDetailCompact,
  describeEffectCompact: describeEffectCompact,
  pad: pad,
  phaseLabel: phaseLabel,
  render: render,
  renderRecap: renderRecap,
  renderDiscardPile: renderDiscardPile,
  renderExtraDeck: renderExtraDeck,
  renderResponseWindow: renderResponseWindow,
  renderDantianSelect: renderDantianSelect,
  renderCharacterSkill: renderCharacterSkill,
  renderPhaseCommands: renderPhaseCommands
};
