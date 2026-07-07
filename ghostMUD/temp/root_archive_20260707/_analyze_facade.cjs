// 精确分析 Game 类中 combat facade 的边界
const fs = require('fs');
const content = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');
const lines = content.split('\n');

// Combat facade methods in Game:
// L1017 getSkillName, L1028 getSkillData, L1039 skillDetail, L1056 practiceSkill
// L1083 equipSkill, L1091 unequipSkill
// L1169 startCombat, L1198 combatAction, L1269 _legacyStartCombat, L1280 _legacyCombatAction
// L1351 showPerforms, L1399 hidePerforms, L1404 usePerform
// L1466 _legacyEnemyTurn, L1476 endCombat

// Also: L1160 triggerEncounter (triggers combat)

// Let's find all 'this.' references to combat-related things from OUTSIDE these methods
// to understand the coupling

const combatMethodRanges = [
  [1017, 1091],  // skill methods (getSkillName ~ unequipSkill)
  [1160, 1167],  // triggerEncounter
  [1169, 1280],  // startCombat ~ _legacyCombatAction start
  [1280, 1351],  // _legacyCombatAction body
  [1351, 1404],  // showPerforms ~ hidePerforms
  [1404, 1476],  // usePerform ~ _legacyEnemyTurn
  [1476, 1495],  // endCombat
];

// Find all calls to combat methods from non-combat code
const combatMethodNames = [
  'startCombat', 'combatAction', '_legacyStartCombat', '_legacyCombatAction',
  '_legacyEnemyTurn', 'endCombat', 'showPerforms', 'hidePerforms', 'usePerform',
  'getSkillName', 'getSkillData', 'skillDetail', 'practiceSkill',
  'equipSkill', 'unequipSkill', 'triggerEncounter'
];

console.log('=== Non-combat code calling combat methods ===\n');

for (let i = 0; i < lines.length; i++) {
  // Skip combat method ranges
  let inCombat = false;
  for (const [s, e] of combatMethodRanges) {
    if (i + 1 >= s && i + 1 <= e) { inCombat = true; break; }
  }
  if (inCombat) continue;

  for (const m of combatMethodNames) {
    // Match this.methodName or this['methodName']
    const regex = new RegExp(`this\\.${m}\\b`);
    if (regex.test(lines[i])) {
      // Find which method this line belongs to
      let context = 'global';
      // Simple heuristic: look backwards for a method definition
      for (let j = i - 1; j >= 0; j--) {
        const mm = lines[j].match(/^  (async\s+)?(\w+)\s*\(/);
        if (mm && !['if', 'for', 'while', 'switch', 'catch', 'else', 'do', 'try'].includes(mm[2])) {
          context = mm[2];
          break;
        }
      }
      console.log(`  L${i+1} [${context}]: ${lines[i].trim().substring(0, 80)}`);
    }
  }
}

// Also find references to combat state
console.log('\n=== Non-combat code accessing combat state ===\n');

const combatStatePattern = /this\.state\.(combat|battleEngine|hijackEngine|interveneEngine|roundCount|performCooldowns|equippedSkill)\b/;
for (let i = 0; i < lines.length; i++) {
  let inCombat = false;
  for (const [s, e] of combatMethodRanges) {
    if (i + 1 >= s && i + 1 <= e) { inCombat = true; break; }
  }
  if (inCombat) continue;

  if (combatStatePattern.test(lines[i])) {
    let context = 'global';
    for (let j = i - 1; j >= 0; j--) {
      const mm = lines[j].match(/^  (async\s+)?(\w+)\s*\(/);
      if (mm && !['if', 'for', 'while', 'switch', 'catch', 'else', 'do', 'try'].includes(mm[2])) {
        context = mm[2];
        break;
      }
    }
    console.log(`  L${i+1} [${context}]: ${lines[i].trim().substring(0, 80)}`);
  }
}

// Find references to this.battleEngine / this.hijackEngine / this.interveneEngine
console.log('\n=== All references to battle engine instances ===\n');

const enginePattern = /this\.(battleEngine|hijackEngine|interveneEngine)\b/;
for (let i = 0; i < lines.length; i++) {
  if (enginePattern.test(lines[i])) {
    let context = 'global';
    for (let j = i - 1; j >= 0; j--) {
      const mm = lines[j].match(/^  (async\s+)?(\w+)\s*\(/);
      if (mm && !['if', 'for', 'while', 'switch', 'catch', 'else', 'do', 'try'].includes(mm[2])) {
        context = mm[2];
        break;
      }
    }
    console.log(`  L${i+1} [${context}]: ${lines[i].trim().substring(0, 100)}`);
  }
}

// Line count for combat facade
let combatLines = 0;
for (const [s, e] of combatMethodRanges) {
  combatLines += e - s + 1;
}
console.log(`\n=== Combat facade total: ${combatLines} lines (out of ${lines.length}) ===`);
console.log(`  Skill methods: L1017-1091 (${1091-1017+1} lines)`);
console.log(`  triggerEncounter: L1160-1167 (${1167-1160+1} lines)`);
console.log(`  startCombat + combatAction: L1169-1280 (${1280-1169+1} lines)`);
console.log(`  _legacyCombatAction: L1280-1351 (${1351-1280+1} lines)`);
console.log(`  showPerforms + hidePerforms: L1351-1404 (${1404-1351+1} lines)`);
console.log(`  usePerform + _legacyEnemyTurn: L1404-1476 (${1476-1404+1} lines)`);
console.log(`  endCombat: L1476-1495 (${1495-1476+1} lines)`);
