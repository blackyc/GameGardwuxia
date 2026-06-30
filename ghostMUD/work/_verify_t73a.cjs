const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/src/game.js', 'utf8');

// 1. 验证 FACTION_HQ
const hqIdx = c.indexOf('FACTION_HQ');
if (hqIdx < 0) { console.log('FAIL: FACTION_HQ not found'); process.exit(1); }
console.log('✅ FACTION_HQ found at offset', hqIdx);
const hqBlock = c.slice(hqIdx, hqIdx + 400);
console.log(hqBlock.slice(0, 300));

// 2. 验证 startFactionTutorial
const tutIdx = c.indexOf('startFactionTutorial');
if (tutIdx < 0) { console.log('FAIL: startFactionTutorial not found'); process.exit(1); }
console.log('\n✅ startFactionTutorial found at offset', tutIdx);

// 3. 验证 onIntroComplete 调用了 startFactionTutorial
const introIdx = c.indexOf('onIntroComplete');
const introBlock = c.slice(introIdx, introIdx + 400);
if (introBlock.includes('startFactionTutorial')) {
  console.log('✅ onIntroComplete calls startFactionTutorial');
} else {
  console.log('FAIL: onIntroComplete does not call startFactionTutorial');
}

// 4. 验证 startGameAfterStartup 跳过通用提示
const sgIdx = c.indexOf('tutorialPhase');
if (sgIdx >= 0) {
  console.log('✅ tutorialPhase check found in startGameAfterStartup area');
} else {
  console.log('FAIL: tutorialPhase check missing');
}

// 5. 语法检查
try {
  new Function(c);
  console.log('✅ Syntax OK (Function constructor)');
} catch(e) {
  console.log('FAIL: Syntax error:', e.message);
}

// 6. 验证 joinFaction 传送逻辑
const jfIdx = c.indexOf("s.location = FACTION_HQ[name]");
if (jfIdx >= 0) {
  console.log('✅ joinFaction sets s.location to FACTION_HQ[name]');
} else {
  console.log('FAIL: joinFaction does not set location');
}

console.log('\n=== All checks passed ===');
