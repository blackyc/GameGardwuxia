// H3: 生成裸 ID 房间映射表 + 引用分析
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const DATA_DIR = 'public/data';
const MANIFEST_FILES = [
  'rebuild_enemies_items_realms.js',
  'rebuild_atmosphere.js',
  'rebuild_rooms_city.js',
  'rebuild_rooms_wild.js',
  'rebuild_dungeon_rooms.js',
  'rebuild_skill_descriptions_1.js',
  'rebuild_skill_descriptions_2.js',
  'rebuild_rooms_wenjianfeng.js',
  'wenjianfeng_tutorial_ch1.js',
  'integration_v2.js',
  'rebuild_meridians.js',
  'rebuild_seals.js',
  'rebuild_builds_drops_corruption.js',
  'corruption_system.js',
  'jianghu_events.js',
  'cross_path_quests.js',
  'rebuild_skill_descriptions_ling.js',
  'rebuild_combat_gong.js',
  'rebuild_combat_atb.js',
  'rebuild_combat_hijack.js',
  'combat_skills_v3.js',
  'ghost_faction_recruiter_encounters.js',
];

const sandbox = { window: {}, console };
sandbox.window = sandbox;
sandbox.__DATA_REGISTRY = {};
sandbox.document = {};
sandbox.localStorage = { _data: {}, getItem(k){return this._data[k]||null;}, setItem(k,v){this._data[k]=String(v);}, removeItem(k){delete this._data[k];} };
vm.createContext(sandbox);

for (const file of MANIFEST_FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) continue;
  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInNewContext(code, sandbox, { filename: file });
}

const REG = sandbox.__DATA_REGISTRY;
const LOCATIONS = REG.LOCATIONS || {};
const MAP_POS = REG.MAP_POS || {};
const MAP_CONN = REG.MAP_CONN || {};
const NPC_ENCOUNTERS = REG.NPC_ENCOUNTERS || {};
const ROOM_SEARCH = REG.ROOM_SEARCH || {};
const QUESTS = REG.QUESTS || {};

const allIds = Object.keys(LOCATIONS);
const bareIds = allIds.filter(id => !id.includes('\u00b7'));
const prefixedIds = allIds.filter(id => id.includes('\u00b7'));

console.log(`总房间数: ${allIds.length}`);
console.log(`裸ID数: ${bareIds.length}`);
console.log(`规范ID数: ${prefixedIds.length}`);
console.log('');

// 为每个裸 ID 猜测大区前缀
console.log('=== 裸 ID 映射表 ===');
console.log('');
console.log('| 旧 ID | name | 推测大区 | 新 ID | 来源文件 | 连接引用 | MAP_POS | NPC | QUEST |');
console.log('|---|---|---|---|---|---|---|---|---|');

// 找到每个裸 ID 的来源文件
const fileMap = {};
for (const file of MANIFEST_FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) continue;
  const code = fs.readFileSync(filePath, 'utf8');
  for (const id of bareIds) {
    if (code.includes(`'${id}'`) || code.includes(`"${id}"`)) {
      if (!fileMap[id]) fileMap[id] = [];
      fileMap[id].push(file);
    }
  }
}

// 收集所有连接引用中指向裸 ID 的情况
const connRefs = {};
for (const [srcId, room] of Object.entries(LOCATIONS)) {
  const conns = room.connections || {};
  for (const [dir, target] of Object.entries(conns)) {
    if (target && bareIds.includes(String(target))) {
      if (!connRefs[String(target)]) connRefs[String(target)] = [];
      connRefs[String(target)].push(`${srcId} (${dir})`);
    }
  }
}

// MAP_POS 中的裸 ID
const posRefs = {};
for (const id of bareIds) {
  if (MAP_POS[id]) posRefs[id] = MAP_POS[id];
}

// NPC_ENCOUNTERS 中的裸 ID
const npcRefs = {};
for (const id of bareIds) {
  if (NPC_ENCOUNTERS[id]) npcRefs[id] = Object.keys(NPC_ENCOUNTERS[id]).length + ' NPCs';
}

// QUESTS 中的裸 ID 引用
const questRefs = {};
for (const [qId, q] of Object.entries(QUESTS)) {
  const qStr = JSON.stringify(q);
  for (const id of bareIds) {
    if (qStr.includes(id)) {
      if (!questRefs[id]) questRefs[id] = [];
      questRefs[id].push(qId);
    }
  }
}

// 推测大区前缀
// 策略：看连接中有哪些带 · 的房间连接到这个裸 ID 附近
function guessPrefix(id) {
  // 城市相关：东大街、南大街等 -> 应天府
  // 郊区：东郊、北郊等 -> 应天府
  // 特殊：根据连接推断
  const room = LOCATIONS[id];
  const conns = room.connections || {};
  
  // 看连接中的带前缀房间
  for (const target of Object.values(conns)) {
    if (target && String(target).includes('\u00b7')) {
      const prefix = String(target).split('\u00b7')[0];
      return prefix;
    }
  }
  
  // 看谁连接到这个裸 ID
  const referrers = connRefs[id] || [];
  for (const ref of referrers) {
    const refId = ref.split(' ')[0];
    if (refId.includes('\u00b7')) {
      return refId.split('\u00b7')[0];
    }
  }
  
  // 默认推测
  if (id.includes('郊')) return '应天府';
  return '???';
}

for (const id of bareIds.sort()) {
  const room = LOCATIONS[id];
  const name = room.name || id;
  const prefix = guessPrefix(id);
  const newId = `${prefix}\u00b7${id}`;
  const sources = (fileMap[id] || []).join('; ');
  const refs = (connRefs[id] || []).join('; ');
  const hasPos = posRefs[id] ? '✓' : '✗';
  const hasNpc = npcRefs[id] || '✗';
  const hasQuest = (questRefs[id] || []).join('; ') || '✗';
  
  console.log(`| ${id} | ${name} | ${prefix} | ${newId} | ${sources} | ${refs} | ${hasPos} | ${hasNpc} | ${hasQuest} |`);
}

console.log('');
console.log('=== 连接引用分析 ===');
console.log('');

// 找所有连接中引用裸 ID 的连接
let totalConnRefs = 0;
console.log('| 源房间 | 方向 | 目标(裸ID) |');
console.log('|---|---|---|');
for (const [srcId, room] of Object.entries(LOCATIONS).sort((a,b) => a[0].localeCompare(b[0]))) {
  const conns = room.connections || {};
  for (const [dir, target] of Object.entries(conns)) {
    if (target && bareIds.includes(String(target))) {
      console.log(`| ${srcId} | ${dir} | ${target} |`);
      totalConnRefs++;
    }
  }
}
console.log(`\n总计: ${totalConnRefs} 条连接引用裸 ID`);

// MAP_CONN 中的裸 ID
console.log('');
console.log('=== MAP_CONN 中的裸 ID ===');
let mcRefs = 0;
for (const [key, val] of Object.entries(MAP_CONN)) {
  const parts = key.split('->');
  if (parts.length === 2) {
    if (bareIds.includes(parts[0].trim()) || bareIds.includes(parts[1].trim())) {
      console.log(`  ${key}: ${JSON.stringify(val)}`);
      mcRefs++;
    }
  }
}
console.log(`总计: ${mcRefs} 条 MAP_CONN 引用裸 ID`);

// 三层描述覆盖率
console.log('');
console.log('=== 三层描述覆盖率 ===');
let hasVague = 0, hasPercept = 0, hasClear = 0;
let totalRooms = 0;
for (const [id, room] of Object.entries(LOCATIONS)) {
  totalRooms++;
  if (room.desc_vague) hasVague++;
  if (room.desc_percept) hasPercept++;
  if (room.desc_clear) hasClear++;
}
console.log(`总房间: ${totalRooms}`);
console.log(`desc_vague: ${hasVague}/${totalRooms} (${(hasVague/totalRooms*100).toFixed(1)}%)`);
console.log(`desc_percept: ${hasPercept}/${totalRooms} (${(hasPercept/totalRooms*100).toFixed(1)}%)`);
console.log(`desc_clear: ${hasClear}/${totalRooms} (${(hasClear/totalRooms*100).toFixed(1)}%)`);

// 宗门数量
console.log('');
console.log('=== 宗门数量 ===');
const FACTIONS = REG.FACTIONS || {};
console.log(`代码中宗门数: ${Object.keys(FACTIONS).length}`);
console.log(`宗门列表: ${Object.keys(FACTIONS).join(', ')}`);
