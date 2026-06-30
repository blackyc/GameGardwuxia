const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');

// 找到 "s.location = target;" 在移动函数中的位置
const targetLine = "s.location = target;";
let pos = 0;
let occurrences = [];
while (true) {
  const i = c.indexOf(targetLine, pos);
  if (i < 0) break;
  occurrences.push(i);
  pos = i + 1;
}
console.log('Occurrences of "s.location = target;":', occurrences.length);
occurrences.forEach((idx, i) => {
  console.log(`\n--- Occurrence ${i+1} at ${idx} ---`);
  console.log(c.slice(Math.max(0, idx - 200), idx + 200));
});
