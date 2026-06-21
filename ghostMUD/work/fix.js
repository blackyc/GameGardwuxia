// Fix over-replacement issues
const fs = require('fs');

const fixes = [
  // Critical: restore code keys
  ['大妖: true', 'boss: true'],
  ['大妖:true', 'boss:true'],
  
  // Fix Samurai breakage
  ['Samur器灵', 'Samurai'],
  
  // Fix 端粒 → 命元
  ['端粒酶', '命元酶'],
  ['端粒纳米', '命元微粒'],
  ['端粒微粒', '命元微粒'],
  ['端粒深度', '命元深度'],
  ['端粒链', '命元链'],
  ['端粒调控', '命元调控'],
  ['端粒修复', '命元修复'],
  ['端粒融合', '命元融合'],
  ['端粒矿脉', '命元矿脉'],
  ['端粒期货', '命元期约'],
  ['端粒期约', '命元期约'],
  ['端粒', '命元'],

  // Fix atmosphere header
  ['Cyberpunk 2077 氛围物品分布', '鬼修大明 · 聊斋氛围物品分布'],

  // Fix broken item names
  ['微粒牙', '碎骨牙'],
  ['微粒磨刃浆', '碎刃磨浆'],
  ['微粒群', '微尘群'],
  ['微粒修复', '微尘回春'],

  // Fix over-replaced names
  ['军用术法', '军中标配'],
  ['夜氏殿', '夜氏殿'],  // This was 夜氏集团→夜氏殿, seems OK
  ['蚂丝狱', '丝狱'],
  
  // Fix biosensor naming
  ['生物监测器灵石', '生灵感应石'],

  // Fix "鬼修大明 · Cyberpunk" in comments
  ['// 鬼修大明 · Cyberpunk', '// 鬼修大明 · 聊斋仙途'],
  
  // Fix the atmosphere item name that had 玄冥 remnants
  ['微粒修复', '微尘回春'],
  
  // Fix "端粒掠夺者" → "命元掠夺者"
  // already done above
  
  // Fix "电路板佛经" (shouldn't exist now but just in case)
  ['电路板佛经', '灵路板经文'],
];

function fixFile(filePath) {
  console.log(`Fixing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  for (const [from, to] of fixes) {
    content = content.split(from).join(to);
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  Done: ${content.length} chars`);
}

const workDir = 'D:\\MUD\\ghostMUD\\work';
fixFile(workDir + '\\ghost_game_data.js');
fixFile(workDir + '\\ghost_atmosphere.js');
fixFile(workDir + '\\ghost_enemies_items.js');

console.log('\n=== Critical fixes done! ===');

// Verify syntax
const { execSync } = require('child_process');
for (const f of ['ghost_game_data.js', 'ghost_atmosphere.js', 'ghost_enemies_items.js']) {
  try {
    execSync(`node --check "${workDir}\\${f}"`, { stdio: 'pipe' });
    console.log(`  ${f}: Syntax OK`);
  } catch (e) {
    console.log(`  ${f}: SYNTAX ERROR - ${e.stderr?.toString()}`);
  }
}
