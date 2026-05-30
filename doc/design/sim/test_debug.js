var GameEngine = require('./src/engine/engine');
var { BaseAI } = require('./src/engine/ai');
var chars = require('./src/data/characters.json');
var decks = require('./src/data/decks.json');

// 武当 vs 隐堂
var d1 = JSON.parse(JSON.stringify(decks.wudang_wuji));
var d2 = JSON.parse(JSON.stringify(decks.yintang_yeshura));
var c1 = JSON.parse(JSON.stringify(chars[decks.wudang_wuji.character]));
var c2 = JSON.parse(JSON.stringify(chars[decks.yintang_yeshura.character]));
var engine = new GameEngine(d1, d2, c1, c2, new BaseAI('wudang', 'yintang'), new BaseAI('yintang', 'wudang'));
var r = engine.run();

console.log('=== 武当(P1) vs 隐堂(P2) ' + r.rounds + 'R | 胜者: P' + r.winner + ' ===');
console.log('=== 游戏开始 ===');
console.log('P1(无极道人) HP=3 | P2(夜修罗) HP=3');
r.log.forEach(function(l) { console.log('  ' + l.trim()); });
