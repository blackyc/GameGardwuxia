// check_missing.cjs — 检查 _entries 中引用但不存在于 LOCATIONS 的房间
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const MANIFEST = [
  'rebuild_enemies_items_realms.js','rebuild_atmosphere.js','rebuild_rooms_city.js',
  'rebuild_rooms_wild.js','rebuild_dungeon_rooms.js','rebuild_skill_descriptions_1.js',
  'rebuild_skill_descriptions_2.js','rebuild_rooms_wenjianfeng.js','wenjianfeng_tutorial_ch1.js',
  'integration_v2.js','rebuild_meridians.js','rebuild_seals.js','rebuild_builds_drops_corruption.js',
  'corruption_system.js','jianghu_events.js','cross_path_quests.js','rebuild_skill_descriptions_ling.js',
  'rebuild_combat_gong.js','rebuild_combat_atb.js','rebuild_combat_hijack.js','combat_skills_v3.js',
  'ghost_faction_recruiter_encounters.js'
];

const sandbox = {};
sandbox.window = sandbox;
sandbox.__DATA_REGISTRY = {};
sandbox.console = { log: () => {}, error: console.error, warn: () => {} };

for (const f of MANIFEST) {
  vm.runInNewContext(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'), sandbox, { filename: f });
}

const L = sandbox.__DATA_REGISTRY.LOCATIONS;

// 检查所有 connections 引用的目标是否存在
const missing = new Set();
for (const [roomId, loc] of Object.entries(L)) {
  if (!loc.connections) continue;
  for (const [dir, target] of Object.entries(loc.connections)) {
    if (typeof target !== 'string') continue;
    if (target.startsWith('yt_')) continue; // 旧 ID，已迁移
    if (!L[target]) {
      missing.add(`${roomId} [${dir}→${target}]`);
    }
  }
}

console.log('=== 不存在的目标房间引用 ===');
missing.forEach(m => console.log('  ' + m));
console.log(`总计: ${missing.size}`);

// 检查 _entries 中的 street 和 target 是否存在
console.log('\n=== _entries 中的问题 ===');
const entriesPattern = /var _entries = \{([\s\S]*?)\};/;
const code = fs.readFileSync(path.join(DATA_DIR, 'integration_v2.js'), 'utf8');
const match = code.match(entriesPattern);
if (match) {
  // 提取所有 street key
  const streetPattern = /'([^']+)':\s*\{/g;
  const streets = [];
  let m2;
  // 需要排除注释行
  const body = match[1].replace(/\/\/[^\n]*/g, '');
  while ((m2 = streetPattern.exec(body)) !== null) {
    streets.push(m2[1]);
  }
  
  // 检查重复
  const counts = {};
  streets.forEach(s => counts[s] = (counts[s] || 0) + 1);
  const dups = Object.entries(counts).filter(([k, v]) => v > 1);
  if (dups.length > 0) {
    console.log('重复的 street key:');
    dups.forEach(([k, v]) => console.log(`  ${k}: ${v}次`));
  } else {
    console.log('无重复 street key');
  }
  
  // 检查不存在的 street
  const missingStreets = streets.filter(s => !L[s]);
  if (missingStreets.length > 0) {
    console.log('\n_entries 中 street 不存在于 LOCATIONS:');
    missingStreets.forEach(s => console.log(`  ${s}`));
  }
  
  // 检查不存在的 target
  const targetPattern = /'([^']+)':\s*'([^']+)'/g;
  const targets = [];
  while ((m2 = targetPattern.exec(body)) !== null) {
    targets.push({ key: m2[1], target: m2[2] });
  }
  const missingTargets = targets.filter(t => !L[t.target] && !t.target.startsWith('yt_'));
  if (missingTargets.length > 0) {
    console.log('\n_entries 中 target 不存在于 LOCATIONS:');
    missingTargets.forEach(t => console.log(`  ${t.key}→${t.target}`));
  }
}
