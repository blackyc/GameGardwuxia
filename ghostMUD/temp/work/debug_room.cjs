// debug_room.cjs
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
const room = L['斗转茶舍·二楼'];
console.log('exists:', !!room);
if (room) {
  console.log('connections:', JSON.stringify(room.connections));
  console.log('keys:', Object.keys(room.connections || {}));
}

// Also check 蒋山·古道
const jg = L['蒋山·古道'];
console.log('\n蒋山·古道 exists:', !!jg);
if (jg) {
  console.log('connections:', JSON.stringify(jg.connections));
}

// 冶山古道·青石阶
const ys = L['冶山古道·青石阶'];
console.log('\n冶山古道·青石阶 exists:', !!ys);
if (ys) {
  console.log('connections:', JSON.stringify(ys.connections));
}

// 牛首山·采茶径
const ns = L['牛首山·采茶径'];
console.log('\n牛首山·采茶径 exists:', !!ns);
if (ns) {
  console.log('connections:', JSON.stringify(ns.connections));
}
