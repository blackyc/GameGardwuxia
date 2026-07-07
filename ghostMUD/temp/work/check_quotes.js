const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/work/rebuild_rooms_city.js', 'utf8');
const l = c.split(/\r?\n/);
let count = 0;
for (let i = 0; i < l.length; i++) {
  if (l[i].includes("\\'")) {
    console.log((i+1) + ': ' + l[i].trim().substring(0, 150));
    count++;
    if (count > 30) break;
  }
}
if (count === 0) console.log('No escaped quotes found');
