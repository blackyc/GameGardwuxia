const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/rooms_ghost_all.js', 'utf8');

// Count rooms
const matches = [...c.matchAll(/'([^']+)':\s*\{/g)];
const rooms = matches.map(m => m[1]);
console.log('房间数:', rooms.length);
rooms.forEach((r, i) => console.log((i+1) + '. ' + r));

// Count events
let totalEv = 0;
const evArrayMatches = c.match(/events:\s*\[/g);
console.log('\nEvents 声明数:', evArrayMatches ? evArrayMatches.length : 0);

// Approximate event count: count single-quoted strings within each events array
const blockRegex = /events:\s*\[([\s\S]*?)\]/g;
let block;
while ((block = blockRegex.exec(c)) !== null) {
  const inner = block[1];
  const evMatches = inner.match(/'([^'\\]|\\[\s\S])*?'/g);
  if (evMatches) totalEv += evMatches.length;
}
console.log('总 event 条目:', totalEv);

// Chinese char count
const cn = (c.match(/[\u4e00-\u9fff]/g) || []).length;
console.log('中文字数:', cn);
console.log('总字节:', c.length);

// Desc char count
let totalDesc = 0;
const descRegex = /desc:'([\s\S]*?)',\s*\n\s*connections:/g;
let dm;
while ((dm = descRegex.exec(c)) !== null) {
  totalDesc += dm[1].length;
}
console.log('描述总字数:', totalDesc);
