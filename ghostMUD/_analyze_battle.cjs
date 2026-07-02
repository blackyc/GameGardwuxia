const fs = require('fs');
const files = ['battle_async.js', 'battle_hijack.js', 'battle_intervene.js'];

for (const f of files) {
  const content = fs.readFileSync('D:/MUD/ghostMUD/src/' + f, 'utf8');
  const lines = content.split('\n');
  console.log(`\n${f}: ${lines.length} lines`);

  // Find class definitions and exports
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^(export\s+)?class\s+/) || lines[i].match(/^export\s+/) || lines[i].match(/^class\s+/)) {
      console.log(`  L${i+1}: ${lines[i].trim()}`);
    }
  }

  // Find all method names
  const methods = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s{2,4}(\w+)\s*\([^)]*\)\s*\{/);
    if (m && !['if', 'for', 'while', 'switch', 'catch', 'else', 'do', 'try'].includes(m[1])) {
      methods.push({ line: i + 1, name: m[1] });
    }
  }
  console.log(`  Methods: ${methods.length}`);
  methods.forEach(m => console.log(`    L${m.line} ${m.name}()`));

  // Find imports
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import\s+/)) {
      console.log(`  Import L${i+1}: ${lines[i].trim()}`);
    }
  }
}
