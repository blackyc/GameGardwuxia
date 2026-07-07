const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/work/integration_v2.js', 'utf8');
// Find where LOCATIONS is assembled
const idx = c.indexOf('LOCATIONS');
console.log('First LOCATIONS at:', idx);
console.log(c.slice(Math.max(0, idx - 100), idx + 500));
console.log('\n=== Searching for WENJIANFENG merge ===');
const mergeIdx = c.indexOf('WENJIANFENG');
if (mergeIdx >= 0) {
  console.log('Found at:', mergeIdx);
  console.log(c.slice(mergeIdx, mergeIdx + 300));
} else {
  console.log('WENJIANFENG NOT referenced in integration_v2.js');
}
