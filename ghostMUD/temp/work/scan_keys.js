const fs = require('fs');
const c = fs.readFileSync('D:/MUD/npc_encounters.js', 'utf8');
const keys = [];
const re = /"([^"]+)":\s*\[/g;
let m;
while ((m = re.exec(c)) !== null) {
  keys.push(m[1]);
}
keys.forEach((k, i) => console.log(i + ': ' + k));
console.log('\nTotal keys: ' + keys.length);
