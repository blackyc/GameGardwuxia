const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');

// 找到 startFactionTutorial 方法
const idx = c.indexOf('startFactionTutorial');
if (idx < 0) { console.log('Not found'); process.exit(1); }
console.log('startFactionTutorial at offset:', idx);
console.log(c.slice(idx, idx + 800));
