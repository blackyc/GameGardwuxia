// test_ai_vs_human.js — 对比 AI 与 Human1 的 Round 1 决策差异
var GameEngine = require('./src/engine/engine');
var { BaseAI } = require('./src/engine/ai');
var gs = require('./src/engine/gameState');
var chars = require('./src/data/characters.json');
var decks = require('./src/data/decks.json');
var CONST = require('./src/data/constants.json');

// === Human1 的 Round 1 手牌（从 combat log 反推）===
// P1初始5张 draw → 判定前手牌5张，判定用了1张 → 行动手牌4+拉锯中抽到的
// Human1 行动阶段显示"内2, 手牌8" — 其中4张已知打出，剩余4张未知
// 已知打出: 透骨钉, 血刀大法, 聚气诀×2 = 4张

// 测试1：给AI同样的初始手牌（常见开局），看它怎么打 Round 1
var humanHand = [
  { name:'魔门基础心法', type:'xinfa', element:'domineering', cost:0, power:2,
    innerPower:1, tags:['魔教','心法'], effectType:'persistInDiscard' },
  { name:'透骨钉', type:'wuji', element:'deceptive', cost:1, power:2,
    tags:['公共','暗器','命中'], effectType:'conditionalPower_flaw_plus3', flawPowerBonus:3, hasHit:true },
  { name:'血刀大法', type:'wuji', element:'domineering', cost:2, power:7,
    tags:['魔教','武技','震伤'], effectType:'zhengshang', flawPowerBuff:0,
    counterJudgmentBonus:2, counterJudgmentElements:['skillful','deceptive'] },
  { name:'聚气诀', type:'xinfa', element:'domineering', cost:1, power:1,
    innerPower:3, tags:['公共','心法'], effectType:'delayedDantian' },
  { name:'聚气诀', type:'xinfa', element:'domineering', cost:1, power:1,
    innerPower:3, tags:['公共','心法'], effectType:'delayedDantian' }
];

console.log('=== 测试：AI(血刀) 拿到 Human1 手牌 vs AI(夜修罗) ===\n');

// 创建标准牌组（不变，只替换初始手牌）
var deck1 = JSON.parse(JSON.stringify(decks['modeng_xuedao']));
var deck2 = JSON.parse(JSON.stringify(decks['yintang_yeshura']));
var char1 = JSON.parse(JSON.stringify(chars['xuedao']));
var char2 = JSON.parse(JSON.stringify(chars['yeshura']));

for (var testN = 1; testN <= 3; testN++) {
  var d1 = JSON.parse(JSON.stringify(deck1));
  var d2 = JSON.parse(JSON.stringify(deck2));
  var c1 = JSON.parse(JSON.stringify(char1));
  var c2 = JSON.parse(JSON.stringify(char2));

  var engine = new GameEngine(d1, d2, c1, c2,
    new BaseAI('modeng', 'yintang'),
    new BaseAI('yintang', 'modeng')
  );

  var state = engine.state;
  var p1 = state.players[0];
  var p2 = state.players[1];
  var log = state.log;

  // 替换 p1(血刀) 的初始手牌
  p1.hand = [];
  for (var i = 0; i < humanHand.length; i++) {
    var card = JSON.parse(JSON.stringify(humanHand[i]));
    card._data = card;  // 标准格式：_data 指向自己
    card.id = 'human_' + i;
    card._effCost = card.cost;
    p1.hand.push(card);
  }

  // 强制 p2 的 chooseJudgmentCard 使用其手牌
  state.round = 1;
  resetPlayer(p1); resetPlayer(p2);

  // 初始化 baseInnerPower / innerPower
  p1.baseInnerPower = 0;
  p1.innerPower = 0;
  p2.baseInnerPower = 0;
  p2.innerPower = 0;

  log.length = 0;
  log.push('=== Test ' + testN + ': AI(血刀) with Human1 hand ===');
  log.push('P1 手牌: ' + p1.hand.map(function(c){return c.name;}).join(', '));

  // 手动判定阶段：P1选魔门基础心法
  var jzCard = p1.hand.find(function(c) { return c.name === '魔门基础心法'; });
  if (!jzCard) { console.log('ERROR: 魔门基础心法 not in hand'); continue; }

  p1.judgmentZone = jzCard;
  removeFromHand(p1, jzCard);
  p2.judgmentZone = engine.ai2.chooseJudgmentCard(p2, p1, state);
  if (p2.judgmentZone) removeFromHand(p2, p2.judgmentZone);

  log.push('P1 暗盖《魔门基础心法》心/霸 P2');
  var p2jzName = p2.judgmentZone ? p2.judgmentZone._data.name : 'null';
  log.push('P2 暗盖《' + p2jzName + '》');

  // 计算判定结果
  var cr = require('./src/engine/combatResolver');
  cr.runJudgment(p1, p2, state);

  // 出牌阶段 — 看AI怎么打
  log.push('\n--- 出牌阶段 ---');
  log.push('P1(血刀) 手牌=' + p1.hand.length + ', 内=' + p1.innerPower);
  log.push('P2(夜修罗) 手牌=' + p2.hand.length + ', 内=' + p2.innerPower);
  log.push('P1战力=' + cr.calcFullPower(p1, p2, state) + ' P2战力=' + cr.calcFullPower(p2, p1, state));

  // 打3回合看趋势
  for (var r = 1; r <= 3; r++) {
    if (state.isGameOver) break;

    // 劣势方行动
    var disadvantaged = cr.calcFullPower(p1, p2, state) >= cr.calcFullPower(p2, p1, state) ? p2 : p1;
    var advantaged = disadvantaged === p1 ? p2 : p1;
    var ai = disadvantaged === p1 ? engine.ai1 : engine.ai2;

    log.push('\n--- Round ' + r + ' 行动 ---');
    log.push('劣势方: P' + disadvantaged.id + '(' + disadvantaged.character.name + ')');

    var result;
    var actions = 0;
    while (actions < 8 && !state.isGameOver) {
      result = ai.takeAction(disadvantaged, advantaged, state);
      if (result === 'caught_up' || result === 'surrender' || result === 'no_action') break;
      actions++;
    }

    log.push('P' + disadvantaged.id + ' 结果: ' + result + ', 战力 P1=' +
      cr.calcFullPower(p1, p2, state) + ' P2=' + cr.calcFullPower(p2, p1, state));
    log.push('P1手牌=' + p1.hand.length + ' 内=' + p1.innerPower +
      ' | P2手牌=' + p2.hand.length + ' 内=' + p2.innerPower);

    if (result === 'surrender') {
      // 另一方行动
      var other = disadvantaged === p1 ? p2 : p1;
      var otherAi = disadvantaged === p1 ? engine.ai2 : engine.ai1;
      var otherResult;
      while (true) {
        otherResult = otherAi.takeAction(other, disadvantaged, state);
        if (otherResult !== 'continue') break;
      }
      log.push('P' + other.id + ' 结果: ' + otherResult);
    }
  }

  // 输出完整日志
  console.log('\n' + log.join('\n'));
  console.log('\n=== Test ' + testN + ' 结束 ===\n');
}

// Helper
function resetPlayer(p) {
  p.judgmentZone = null;
  p.actionZone = [];
  p.baseInnerPower = 0;
  p.innerPower = 0;
  p.roundCardsPlayed = 0;
  p.hasDrawnFirstFlaw = false;
  p.cardsPlayedThisTurn = [];
  p.cardsMovedThisTurn = false;
  p.roundFlaws = 0;
  p.hasUsedPassiveThisRound = false;
  p._actionDepth = 0;
  p._skillfulDiscount = false;
}

function removeFromHand(player, card) {
  var idx = player.hand.indexOf(card);
  if (idx >= 0) player.hand.splice(idx, 1);
}
