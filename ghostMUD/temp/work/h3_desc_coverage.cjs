// H3: 三层描述覆盖率报告生成器
// 用法: node work/h3_desc_coverage.cjs
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const DATA_DIR = 'public/data';
const MANIFEST_FILES = [
  'rebuild_enemies_items_realms.js','rebuild_atmosphere.js','rebuild_rooms_city.js','rebuild_rooms_wild.js',
  'rebuild_dungeon_rooms.js','rebuild_skill_descriptions_1.js','rebuild_skill_descriptions_2.js',
  'rebuild_rooms_wenjianfeng.js','wenjianfeng_tutorial_ch1.js','integration_v2.js','rebuild_meridians.js',
  'rebuild_seals.js','rebuild_builds_drops_corruption.js','corruption_system.js','jianghu_events.js',
  'cross_path_quests.js','rebuild_skill_descriptions_ling.js','rebuild_combat_gong.js','rebuild_combat_atb.js',
  'rebuild_combat_hijack.js','combat_skills_v3.js','ghost_faction_recruiter_encounters.js',
];

const sandbox = { window: {}, console };
sandbox.window = sandbox; sandbox.__DATA_REGISTRY = {}; sandbox.document = {};
sandbox.localStorage = { _data:{}, getItem(k){return this._data[k]||null;}, setItem(k,v){this._data[k]=String(v);}, removeItem(k){delete this._data[k];} };
vm.createContext(sandbox);

for (const file of MANIFEST_FILES) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) continue;
  vm.runInNewContext(fs.readFileSync(fp,'utf8'), sandbox, { filename: file });
}

const REG = sandbox.__DATA_REGISTRY;
const LOCATIONS = REG.LOCATIONS || {};

const total = Object.keys(LOCATIONS).length;
let hasVague = 0, hasPercept = 0, hasClear = 0;
let hasDesc = 0;
const missing = { vague: [], percept: [], clear: [], desc: [] };

for (const [id, room] of Object.entries(LOCATIONS)) {
  if (room.desc_vague) hasVague++; else missing.vague.push(id);
  if (room.desc_percept) hasPercept++; else missing.percept.push(id);
  if (room.desc_clear) hasClear++; else missing.clear.push(id);
  if (room.desc) hasDesc++; else missing.desc.push(id);
}

console.log('═══════════════════════════════════════════════════');
console.log('  三层描述覆盖率报告');
console.log('═══════════════════════════════════════════════════');
console.log(`总房间数: ${total}`);
console.log('');
console.log('字段覆盖率:');
console.log(`  desc (基础描述):     ${hasDesc}/${total} (${(hasDesc/total*100).toFixed(1)}%)`);
console.log(`  desc_vague (模糊层): ${hasVague}/${total} (${(hasVague/total*100).toFixed(1)}%)`);
console.log(`  desc_percept (感知层): ${hasPercept}/${total} (${(hasPercept/total*100).toFixed(1)}%)`);
console.log(`  desc_clear (清晰层): ${hasClear}/${total} (${(hasClear/total*100).toFixed(1)}%)`);
console.log('');

// 优先队列：先有 desc 的房间优先，没有 desc 的最优先补
const noDesc = missing.desc;
const hasDescNoVague = Object.entries(LOCATIONS).filter(([id,r]) => r.desc && !r.desc_vague).map(([id]) => id);
const hasDescNoPercept = Object.entries(LOCATIONS).filter(([id,r]) => r.desc && !r.desc_percept).map(([id]) => id);
const hasDescNoClear = Object.entries(LOCATIONS).filter(([id,r]) => r.desc && !r.desc_clear).map(([id]) => id);

console.log('优先队列 (按急需程度排序):');
console.log(`  P0: 无 desc 的房间 (${noDesc.length} 间) — 最优先`);
if (noDesc.length > 0 && noDesc.length <= 20) {
  noDesc.forEach(id => console.log(`    - ${id}`));
} else if (noDesc.length > 20) {
  noDesc.slice(0,20).forEach(id => console.log(`    - ${id}`));
  console.log(`    ... 等共 ${noDesc.length} 间`);
}
console.log(`  P1: 有 desc 无 desc_vague (${hasDescNoVague.length} 间)`);
console.log(`  P2: 有 desc 无 desc_percept (${hasDescNoPercept.length} 间)`);
console.log(`  P3: 有 desc 无 desc_clear (${hasDescNoClear.length} 间)`);
console.log('');
console.log('说明: 本阶段只建立契约和优先队列，不要求立刻批量生成全部文本。');
