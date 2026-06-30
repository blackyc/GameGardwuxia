const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');

// Find the move function - search backwards from the 北 context
const beiIdx = c.indexOf("DIR_CN");
if (beiIdx >= 0) {
  // Find the function start
  let start = beiIdx;
  while (start > 0) {
    start--;
    // Look for function signature
    if (c.slice(start, start + 20).match(/\w+\s*\([^)]*\)\s*\{/)) {
      // Check if this looks like the move function
      const snippet = c.slice(start, start + 50);
      if (snippet.includes('dir)') || snippet.includes('move')) {
        break;
      }
    }
  }
  // Just find a reasonable start
  let funcStart = c.lastIndexOf('\n  ', beiIdx);
  funcStart = c.lastIndexOf('\n  ', funcStart - 1);
  console.log('Move function context:');
  console.log(c.slice(funcStart, beiIdx + 800));
}
