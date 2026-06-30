const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/work/rebuild_rooms_wenjianfeng.js', 'utf8');
// Find all room ID keys (pattern: 'xxx·xxx': {)
const re = /'([^']+·[^']+)'\s*:\s*\{/g;
let m;
const rooms = [];
while ((m = re.exec(c)) !== null) {
  rooms.push(m[1]);
}
console.log('问剑峰房间数:', rooms.length);
rooms.forEach(r => console.log(' ', r));

// Also check what window object it attaches to
const wIdx = c.indexOf('window.');
if (wIdx >= 0) console.log('\nFirst window. at:', c.slice(wIdx, wIdx + 80));

// Check exports
const expIdx = c.indexOf('export');
if (expIdx >= 0) console.log('Export at:', c.slice(expIdx, expIdx + 80));
