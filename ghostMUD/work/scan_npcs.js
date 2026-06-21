const fs = require('fs');
const c = fs.readFileSync('D:/MUD/npc_encounters.js', 'utf8');

// Extract all NPC titles and types
const titleRe = /"title":\s*"([^"]+)"/g;
const typeRe = /"type":\s*"([^"]+)"/g;
const titles = {};
let m;
while ((m = titleRe.exec(c)) !== null) {
  titles[m[1]] = (titles[m[1]] || 0) + 1;
}
const types = {};
while ((m2 = typeRe.exec(c)) !== null) {
  types[m2[1]] = (types[m2[1]] || 0) + 1;
}

console.log('=== NPC TITLES ===');
Object.entries(titles).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(v+'x: '+k));
console.log('\n=== ENCOUNTER TYPES ===');
Object.entries(types).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(v+'x: '+k));
console.log('\nUnique titles: ' + Object.keys(titles).length);
console.log('Unique types: ' + Object.keys(types).length);
