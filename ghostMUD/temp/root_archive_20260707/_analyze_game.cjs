const fs = require('fs');
const content = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

// Find class start
let classStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/class\s+Game/)) {
    classStart = i;
    console.log(`class Game at L${i+1}`);
    break;
  }
}

// Find all methods - look for patterns like:
//   methodName(...) {
//   async methodName(...) {
const methods = [];
for (let i = classStart >= 0 ? classStart : 0; i < lines.length; i++) {
  const line = lines[i];
  // Match 2-space indent + optional async + name + ( + params + ) + {
  const m = line.match(/^  (async\s+)?(\w+)\s*\([^)]*\)\s*\{/);
  if (m) {
    // Exclude control flow keywords
    if (!['if', 'for', 'while', 'switch', 'catch', 'else', 'do', 'try'].includes(m[2])) {
      methods.push({ line: i + 1, name: m[2], isAsync: !!m[1], sig: line.trim().replace(/\s*\{$/, '') });
    }
  }
}

console.log('\nMethods count:', methods.length);

// Group by category
const categories = {
  combat: [],
  ui: [],
  data: [],
  movement: [],
  quest: [],
  inventory: [],
  npc: [],
  save: [],
  init: [],
  other: []
};

const combatKeywords = ['battle', 'combat', 'fight', 'attack', 'damage', 'skill', 'enemy', 'turn', 'flee', 'defend', 'cast', 'hp', 'mp', 'death', 'die', 'kill', 'loot', 'victory', 'defeat', 'intervene', 'hijack', 'xinggong', 'atb'];
const uiKeywords = ['render', 'display', 'show', 'hide', 'update', 'refresh', 'draw', 'panel', 'screen', 'log', 'message', 'notify', 'prompt'];
const dataKeywords = ['load', 'save', 'data', 'init', 'setup', 'register', 'config'];
const moveKeywords = ['move', 'go', 'travel', 'enter', 'exit', 'room', 'location', 'path', 'direction'];
const questKeywords = ['quest', 'task', 'mission', 'stage', 'progress', 'complete'];
const invKeywords = ['item', 'inventory', 'pickup', 'drop', 'use', 'equip', 'unequip', 'buy', 'sell', 'shop'];
const npcKeywords = ['npc', 'talk', 'dialogue', 'interact', 'encounter'];
const saveKeywords = ['save', 'load', 'serialize', 'deserialize', 'state'];

for (const m of methods) {
  const lower = m.name.toLowerCase();
  let placed = false;
  if (combatKeywords.some(k => lower.includes(k))) { categories.combat.push(m); placed = true; }
  if (!placed && moveKeywords.some(k => lower.includes(k))) { categories.movement.push(m); placed = true; }
  if (!placed && questKeywords.some(k => lower.includes(k))) { categories.quest.push(m); placed = true; }
  if (!placed && invKeywords.some(k => lower.includes(k))) { categories.inventory.push(m); placed = true; }
  if (!placed && npcKeywords.some(k => lower.includes(k))) { categories.npc.push(m); placed = true; }
  if (!placed && uiKeywords.some(k => lower.includes(k))) { categories.ui.push(m); placed = true; }
  if (!placed && saveKeywords.some(k => lower.includes(k))) { categories.save.push(m); placed = true; }
  if (!placed && dataKeywords.some(k => lower.includes(k))) { categories.init.push(m); placed = true; }
  if (!placed) categories.other.push(m);
}

for (const [cat, list] of Object.entries(categories)) {
  if (list.length === 0) continue;
  console.log(`\n=== ${cat} (${list.length}) ===`);
  list.forEach(m => console.log(`  L${m.line} ${m.isAsync ? 'async ' : ''}${m.sig}`));
}
