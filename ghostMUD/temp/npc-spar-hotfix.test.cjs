const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const perception = fs.readFileSync(path.join(ROOT, 'src', 'perception_service.js'), 'utf8');
const npcService = fs.readFileSync(path.join(ROOT, 'src', 'npc_service.js'), 'utf8');

console.log('\nNPC spar hotfix test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

assert.strictEqual((perception.match(/const dl2 = getData\(\);/g) || []).length, 1, 'perception must not redeclare dl2');
assert.ok(perception.includes('canSpar: enc.canSpar !== false'), 'encounter NPCs must expose canSpar by default');
assert.ok(npcService.includes("if (npcType === 'room')"), 'room NPC talk support missing');
assert.ok(npcService.includes('const npcName = this._title(npc);'), 'spar must support title/name fallback');
assert.ok(/g\.combat\.startCombat\(npcName,\s*enemyData,?/.test(npcService), 'spar combat must use resolved npcName');

console.log('  ✓ encounter spar flag and NPC title fallback are wired');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
