// compare_ai_human.js — AI vs Human决策对比推演
var { BaseAI } = require('./src/engine/ai');
var cr = require('./src/engine/combatResolver');
var gs = require('./src/engine/gameState');
var chars = require('./src/data/characters.json');
var decks = require('./src/data/decks.json');

// Human1 精确开局手牌
var humanCards = [
  { id:'c01',name:'魔门基础心法',type:'xinfa',element:'domineering',cost:0,power:2,innerPower:1,faction:'modeng',tags:['魔教','心法'],effectType:'persistInDiscard',_effCost:0},
  { id:'c02',name:'透骨钉',type:'wuji',element:'deceptive',cost:1,power:2,faction:'public',tags:['公共','暗器','命中'],effectType:'conditionalPower_flaw_plus3',flawPowerBonus:3,hasHit:true,_effCost:1},
  { id:'c03',name:'血刀大法',type:'wuji',element:'domineering',cost:2,power:7,faction:'modeng',tags:['魔教','武技','震伤'],effectType:'zhengshang',counterJudgmentBonus:2,counterJudgmentElements:['skillful','deceptive'],_effCost:2},
  { id:'c04',name:'聚气诀',type:'xinfa',element:'domineering',cost:1,power:1,innerPower:3,faction:'public',tags:['公共','心法'],effectType:'delayedDantian',_effCost:1},
  { id:'c05',name:'聚气诀',type:'xinfa',element:'domineering',cost:1,power:1,innerPower:3,faction:'public',tags:['公共','心法'],effectType:'delayedDantian',_effCost:1}
];

var d1 = JSON.parse(JSON.stringify(decks['modeng_xuedao']));
var d2 = JSON.parse(JSON.stringify(decks['yintang_yeshura']));
var c1 = JSON.parse(JSON.stringify(chars['xuedao']));
var c2 = JSON.parse(JSON.stringify(chars['yeshura']));

var state = gs.createGameState(d1, d2, c1, c2);
var p1 = state.players[0];
var p2 = state.players[1];

gs.drawCards(p1, 5, state);
gs.drawCards(p2, 5, state);

p1.hand = humanCards.map(function(c){
  var clone = {};
  for (var k in c) clone[k] = c[k];
  clone._data = clone;
  return clone;
});

console.log('=== Human1 开局手牌推演 ===');
console.log('P1手牌: ' + p1.hand.map(function(c){return c.name;}).join(', '));
console.log('P2手牌: ' + p2.hand.map(function(c){return c._data.name;}).join(', '));
console.log();

var ai_modeng = new BaseAI('modeng', 'yintang');
var ai_yintang = new BaseAI('yintang', 'modeng');

// 判定阶段
var jzCard = p1.hand.find(function(c){ return c.name==='魔门基础心法'; });
p1.judgmentZone = jzCard;
var idx = p1.hand.indexOf(jzCard); p1.hand.splice(idx,1);
p1.innerPower = 0; p1.baseInnerPower = 0;

p2.judgmentZone = ai_yintang.chooseJudgmentCard(p2, p1, state);
if (p2.judgmentZone) {
  var idx2 = p2.hand.indexOf(p2.judgmentZone); p2.hand.splice(idx2,1);
}

console.log('--- 判定 ---');
console.log('P1暗盖: ' + p1.judgmentZone.name);
console.log('P2暗盖: ' + (p2.judgmentZone ? p2.judgmentZone._data.name : 'null'));

cr.runJudgment(p1, p2, state);

var p1power = cr.calcTotalPower(p1, state);
var p2power = cr.calcTotalPower(p2, state);
var disadvantaged = p1power >= p2power ? p2 : p1;
var advantaged = disadvantaged === p1 ? p2 : p1;

console.log('战力: P1=' + p1power + ' P2=' + p2power);
console.log('劣势方: P' + disadvantaged.id);

if (!disadvantaged.hasDrawnFirstFlaw) {
  disadvantaged.hasDrawnFirstFlaw = true;
  gs.drawCards(disadvantaged, 1, state);
}

console.log('\n--- AI(血刀) 出牌决策推演 ---');
console.log('P1手牌=' + p1.hand.length + ' 内=' + p1.innerPower);

var self = p1, opponent = p2;
var selfAi = ai_modeng;
var depth = 0, result, actions = [];

while (depth < 10) {
  result = selfAi.takeAction(self, opponent, state);
  // 捕获AI每步操作：检查state.log最新条目
  var latestLogs = state.log.slice(-3);
  actions.push({
    depth: depth, result: result,
    power: cr.calcTotalPower(self, state),
    oppPower: cr.calcTotalPower(opponent, state),
    hand: self.hand.length, inner: self.innerPower,
    dt: self.dantian.length, az: self.actionZone.length,
    flaws: self.flaws, hp: self.hp,
    logs: latestLogs.join(' | ')
  });
  console.log('[' + depth + '] ' + result +
    ' | P1=' + cr.calcTotalPower(self, state) +
    ' P2=' + cr.calcTotalPower(opponent, state) +
    ' 手牌=' + self.hand.length + ' 内=' + self.innerPower +
    ' DT=' + self.dantian.length + ' AZ=' + self.actionZone.length +
    ' 破绽=' + self.flaws);
  console.log('   操作: ' + latestLogs.slice(-2).join(' | '));
  console.log('   P1手牌: ' + self.hand.map(function(c){return c.name;}).join(', '));
  console.log('   P1出招区: ' + self.actionZone.map(function(c){return c.name;}).join(', '));
  console.log('   P1丹田: ' + self.dantian.map(function(c){return c.name;}).join(', '));
  if (result !== 'continue') break;
  depth++;
}

console.log('\n============================');
console.log('=== Human vs AI 对比 ===');
console.log('============================');

console.log('\n[Human决策]');
console.log('  1. 透骨钉→AZ (费1)');
console.log('  2. 血战到底→破绽+1 (透骨钉追认P5, 下张魔教-2费)');
console.log('  3. 血刀大法→AZ (免费 P7)');
console.log('  4. 聚气诀→DT (有破绽直进 +3内)');
console.log('  5. 聚气诀→DT (有破绽直进 +3内)');
console.log('  结果: P1=23 P2=18 内=5 手牌=4');

console.log('\n[AI决策]');
for (var i = 0; i < actions.length; i++) {
  var a = actions[i];
  console.log('  ' + (i+1) + '. ' + a.result +
    ' P1=' + a.power + ' P2=' + a.oppPower +
    ' 手牌=' + a.hand + ' 内=' + a.inner +
    ' DT=' + a.dt + ' AZ=' + a.az);
}

console.log('\n[关键差异]');
console.log('  血战到底: ' + (self.hasUsedPassiveThisRound ? '已用' : '未用'));
console.log('  聚气诀DT直进: ' + self.dantian.filter(function(c){return c.name==='聚气诀';}).length + '张');
console.log('  心法优先: ' + (self.dantian.some(function(c){return c.name==='魔门基础心法';}) ? '是' : '否'));
console.log('  P1战力: ' + cr.calcTotalPower(p1, state));
console.log('  P2战力: ' + cr.calcTotalPower(p2, state));
