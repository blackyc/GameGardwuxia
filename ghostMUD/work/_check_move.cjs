const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');

// 找到 move 方法的移动逻辑
const moveIdx = c.indexOf("moveTo(target)");
if (moveIdx < 0) {
  console.log('moveTo not found, searching for move logic...');
}
// 搜索移动方向处理
const northIdx = c.indexOf("'北'");
console.log('北 at:', northIdx);

// 搜索 move 方法
const moveFuncIdx = c.indexOf('move(dir)');
console.log('move(dir) at:', moveFuncIdx);
if (moveFuncIdx >= 0) {
  console.log(c.slice(moveFuncIdx, moveFuncIdx + 800));
}
