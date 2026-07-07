const fs = require('fs');
const c = fs.readFileSync('D:/MUD/npc_encounters.js', 'utf8');

// Extract top-level room keys
let depth = 0;
const results = [];
let prevIdx = 0;
let keyRe = /"([^"]+)"\s*:\s*\[/g;
let m;
while ((m = keyRe.exec(c)) !== null) {
  const before = c.substring(prevIdx, m.index);
  const opens = (before.match(/\{/g) || []).length;
  const closes = (before.match(/\}/g) || []).length;
  depth += opens - closes;
  if (depth === 1) { // top-level object entry
    results.push(m[1]);
  }
  prevIdx = m.index;
}
console.log('Top-level room keys: ' + results.length);
results.forEach((k,i) => console.log(i + ': ' + k));
