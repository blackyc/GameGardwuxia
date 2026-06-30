const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');

// Find the move/移动 function
const patterns = ['move(', 'goDir(', 'handleMove(', 'travel(', 'walk('];
for (const p of patterns) {
  const idx = c.indexOf(p);
  if (idx >= 0) {
    console.log(`Found "${p}" at ${idx}:`);
    console.log(c.slice(idx, idx + 200));
    console.log('---');
  }
}

// Search for 北: which is likely in a direction handler
const beiIdx = c.indexOf("'北'");
if (beiIdx >= 0) {
  // Find the enclosing function
  let funcStart = c.lastIndexOf('  ', beiIdx);
  // Go back further to find the function
  let searchBack = beiIdx;
  while (searchBack > 0) {
    searchBack--;
    if (c.slice(searchBack, searchBack + 8) === 'function' || c.slice(searchBack, searchBack + 1) === '(') break;
  }
  console.log('Context around 北:');
  console.log(c.slice(Math.max(0, beiIdx - 300), beiIdx + 300));
}
