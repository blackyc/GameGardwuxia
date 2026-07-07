// verify_reachability.cjs — 用 vm 模块完整加载数据，验证 BFS 可达性
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_DIR = path.join(__dirname, '..', '..', 'public', 'data');
const MANIFEST = [
  { file: 'rebuild_enemies_items_realms.js' },
  { file: 'rebuild_atmosphere.js' },
  { file: 'rebuild_rooms_city.js' },
  { file: 'rebuild_rooms_wild.js' },
  { file: 'rebuild_dungeon_rooms.js' },
  { file: 'rebuild_skill_descriptions_1.js' },
  { file: 'rebuild_skill_descriptions_2.js' },
  { file: 'rebuild_rooms_wenjianfeng.js' },
  { file: 'wenjianfeng_tutorial_ch1.js' },
  { file: 'integration_v2.js' },
  { file: 'rebuild_meridians.js' },
  { file: 'rebuild_seals.js' },
  { file: 'rebuild_builds_drops_corruption.js' },
  { file: 'corruption_system.js' },
  { file: 'jianghu_events.js' },
  { file: 'cross_path_quests.js' },
  { file: 'rebuild_skill_descriptions_ling.js' },
  { file: 'rebuild_combat_gong.js' },
  { file: 'rebuild_combat_atb.js' },
  { file: 'rebuild_combat_hijack.js' },
  { file: 'combat_skills_v3.js' },
  { file: 'ghost_faction_recruiter_encounters.js' },
];

// 加载所有数据
const sandbox = {};
sandbox.window = sandbox;
sandbox.__DATA_REGISTRY = {};
sandbox.console = { log: () => {}, error: console.error, warn: () => {} };

for (const entry of MANIFEST) {
  const filePath = path.join(DATA_DIR, entry.file);
  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInNewContext(code, sandbox, { filename: entry.file });
}

const REG = sandbox.__DATA_REGISTRY;
const LOCATIONS = REG.LOCATIONS;

if (!LOCATIONS) {
  console.error('LOCATIONS 未注册！');
  process.exit(1);
}

const allRooms = Object.keys(LOCATIONS);
const roomsWithConnections = allRooms.filter(n => LOCATIONS[n].connections && Object.keys(LOCATIONS[n].connections).length > 0);

// BFS 从十字街口
const visited = new Set();
const queue = ['应天府·十字街口'];
visited.add('应天府·十字街口');
const parent = {};
while (queue.length > 0) {
  const cur = queue.shift();
  const loc = LOCATIONS[cur];
  if (!loc || !loc.connections) continue;
  for (const [dir, target] of Object.entries(loc.connections)) {
    if (typeof target !== 'string') continue;
    if (LOCATIONS[target] && !visited.has(target)) {
      visited.add(target);
      parent[target] = { from: cur, dir };
      queue.push(target);
    }
  }
}

const unreachable = roomsWithConnections.filter(n => !visited.has(n));
const noConnections = allRooms.filter(n => !LOCATIONS[n].connections || Object.keys(LOCATIONS[n].connections).length === 0);

console.log(`总房间: ${allRooms.length}`);
console.log(`有 connections: ${roomsWithConnections.length}`);
console.log(`无 connections: ${noConnections.length}`);
console.log(`BFS 可达: ${visited.size}`);
console.log(`BFS 不可达: ${unreachable.length}`);
console.log(`可达率: ${(visited.size / roomsWithConnections.length * 100).toFixed(1)}%`);

if (unreachable.length > 0) {
  console.log(`\n=== 不可达房间 ===`);
  unreachable.forEach(room => {
    const conns = LOCATIONS[room].connections;
    const outbound = Object.entries(conns).map(([d, t]) => `${d}→${t}`).join(', ');
    console.log(`  ${room}  [出站: ${outbound}]`);
  });
}

if (noConnections.length > 0) {
  console.log(`\n=== 无 connections 的房间 ===`);
  noConnections.forEach(room => console.log(`  ${room}`));
}

// 验证 MAP_POS 覆盖
const MAP_POS = REG.MAP_POS || {};
const roomsWithPos = Object.keys(MAP_POS);
const roomsWithoutPos = allRooms.filter(n => !MAP_POS[n]);
console.log(`\n=== MAP_POS 覆盖 ===`);
console.log(`有坐标: ${roomsWithPos.length}/${allRooms.length}`);
if (roomsWithoutPos.length > 0) {
  console.log(`缺坐标: ${roomsWithoutPos.join(', ')}`);
}
