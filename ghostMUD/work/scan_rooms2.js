const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/work/ghost_npc_transformed.js', 'utf8');

// Extract room keys at depth 1
let depth = 0;
let prevIdx = 0;
const rooms = [];
const re = /"([^"]+)"\s*:\s*\[/g;
let m;
while ((m = re.exec(c)) !== null) {
  const before = c.substring(prevIdx, m.index);
  const opens = (before.match(/\{/g) || []).length;
  const closes = (before.match(/\}/g) || []).length;
  depth += opens - closes;
  if (depth === 1 && m[1] !== 'results') {
    rooms.push(m[1]);
  }
  prevIdx = m.index;
}

console.log('Room count: ' + rooms.length);
rooms.forEach((r, i) => console.log(i + ': ' + r));
