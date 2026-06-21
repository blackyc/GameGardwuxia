const fs = require('fs');
const c = fs.readFileSync('D:/MUD/npc_encounters.js', 'utf8');

// Extract unique encounters by title and desc
const encounterRe = /\{[^}]*"title"\s*:\s*"([^"]+)"\s*,\s*"desc"\s*:\s*"([^"]+)"[^}]*\}/g;
const seen = {};
let m;
while ((m = encounterRe.exec(c)) !== null) {
  const title = m[1];
  const desc = m[2];
  const key = title + '|||' + desc;
  if (!seen[key]) {
    seen[key] = 1;
    console.log('TITLE: ' + title);
    console.log('DESC: ' + desc);
    console.log('---');
  }
}
