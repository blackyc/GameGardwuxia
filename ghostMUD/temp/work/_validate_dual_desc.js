const fs = require('fs');

function countFields(text, pattern) {
  return (text.match(new RegExp(pattern, 'g')) || []).length;
}

function checkFile(label, path) {
  const text = fs.readFileSync(path, 'utf8');
  const descCount = countFields(text, '\\bdesc\\s*:');
  const awakenedCount = countFields(text, 'desc_awakened\\s*:');
  const lines = text.split('\n').length;
  const chars = text.length;
  
  console.log(`\n=== ${label} ===`);
  console.log(`  Lines: ${lines}, Chars: ${chars}`);
  console.log(`  desc fields: ${descCount}`);
  console.log(`  desc_awakened fields: ${awakenedCount}`);
  console.log(`  Match: ${descCount === awakenedCount ? 'YES ✓' : 'NO ✗ MISMATCH!'}`);
  
  // Forbidden words
  const forbidden = ['九幽','虚空','禁忌','不可名状','禁忌之物','深渊','混沌','异次元','维度','诅咒','恶魔','邪神','亵渎','祭品','血祭','献祭','契约','合同','利息','文档'];
  const found = [];
  forbidden.forEach(w => {
    if (text.includes(w)) found.push(w);
  });
  console.log(`  Forbidden words found: ${found.length > 0 ? found.join(', ') : 'NONE ✓'}`);
  
  return { lines, chars, descCount, awakenedCount };
}

const d = checkFile('DUNGEON ROOMS', 'D:/MUD/ghostMUD/work/rebuild_dungeon_rooms.js');
const a = checkFile('ATMOSPHERE', 'D:/MUD/ghostMUD/work/rebuild_atmosphere.js');
console.log('\n=== SUMMARY ===');
console.log(`Total: desc=${d.descCount + a.descCount}, awakened=${d.awakenedCount + a.awakenedCount}`);
