const fs = require('fs');
const p = 'D:/MUD/ghostMUD/src/game.js';
let c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');
let changes = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip comments
  if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
  // Skip the getMoneyName method definition line
  if (line.includes('getMoneyName()')) continue;
  // Replace '灵石' inside string literals with ' + this.getMoneyName() + '
  // But only in addLog() calls and string concatenations
  if (line.includes('灵石') && (line.includes('addLog') || line.includes("' + ") || line.includes('<p>'))) {
    // For simple cases like "' + cost + ' 灵石" → "' + cost + ' " + this.getMoneyName()
    // For "'灵石不足" → "this.getMoneyName() + '不足"  
    // For "' N 灵石" patterns inside addLog
    const newLine = line
      .replace(/'灵石/g, "' + this.getMoneyName() + '")
      .replace(/灵石'/g, "' + this.getMoneyName() + '")
      .replace(/灵石"/g, '" + this.getMoneyName() + "')
      .replace(/灵石（/g, "' + this.getMoneyName() + '（")
      .replace(/灵石，/g, "' + this.getMoneyName() + '，")
      .replace(/灵石。/g, "' + this.getMoneyName() + '。")
      .replace(/灵石</g, "' + this.getMoneyName() + '<")
      .replace(/灵石\)/g, "' + this.getMoneyName() + ')")
      .replace(/灵石 | /g, "' + this.getMoneyName() + ' | ");
    if (newLine !== line) {
      // Clean up double concatenations like + ' + this.getMoneyName() + ' +
      const cleaned = newLine.replace(/\+ ' \+ this\.getMoneyName\(\) \+ ' \+/g, '+ this.getMoneyName() +');
      lines[i] = cleaned;
      changes++;
      console.log('L' + (i+1) + ': ' + line.trim().substring(0, 80));
    }
  }
}
fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
