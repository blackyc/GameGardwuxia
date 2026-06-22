// ============================================================
// BUG 修复回归测试 · 2026-06-21
// 验证：
//   BUG-1: explore() 方向键中英文归一化后能找到 target
//   BUG-2: NPC 遭遇每个 result 都有 choice/log，title 不为空
// 运行：node work/test_bugfix_verify.js
// ============================================================
'use strict';
const fs = require('fs');
const path = require('path');

// ---- 用 Function 加载全局脚本（HTML 里是裸 <script>） ----
const ROOT = path.resolve(__dirname, '..');
function loadScript(rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  new Function(code).call(global);
}

global.ITEMS = [];
global.ENEMIES = {};
global.ROGUE_SKILLS = {};

['work/rebuild_enemies_items_realms.js',
 'work/rebuild_atmosphere.js',
 'work/rebuild_rooms_city.js',
 'work/rebuild_rooms_wild.js',
 'work/rebuild_dungeon_rooms.js',
 'work/rebuild_skill_descriptions_1.js',
 'work/rebuild_skill_descriptions_2.js',
 'work/integration_v2.js'].forEach(loadScript);

const DIR_CN = { north:'北', south:'南', east:'东', west:'西', up:'上', down:'下', in:'入', out:'出' };
const ALLOWED_DIR = new Set(['北','南','东','西','上','下','入','出']);

let pass = 0, fail = 0;
function ok(name) { pass++; console.log('  ✓ ' + name); }
function bad(name, extra) { fail++; console.log('  ✗ ' + name + (extra ? ' → ' + extra : '')); }

// ============ BUG-1: 方向键归一化 ============
console.log('\n[BUG-1] explore() 方向归一化');
const locNames = Object.keys(LOCATIONS);
let movableCount = 0, totalConn = 0;
const badDirs = [];
for (const rn of locNames) {
  const conns = LOCATIONS[rn].connections;
  if (!conns) continue;
  for (const k of Object.keys(conns)) {
    totalConn++;
    if (!ALLOWED_DIR.has(k)) badDirs.push(rn + '.' + k);
    // 模拟 explore 的查表：英文方向能否映射到中文 key
    const inv = Object.entries(DIR_CN).find(e => e[1] === k);
    if (inv) movableCount++;
  }
}
if (badDirs.length === 0) ok('所有 ' + totalConn + ' 条 connection 的方向键都在允许集合内');
else bad(badDirs.length + ' 处方向键非法', badDirs.slice(0,5).join(', '));

// 实际抽几个房间走一步
function tryMove(room, engDir) {
  const loc = LOCATIONS[room];
  if (!loc || !loc.connections) return null;
  const cn = DIR_CN[engDir] || engDir;
  return loc.connections[cn] || loc.connections[engDir];
}
const sampleRoom = locNames.find(r => LOCATIONS[r].connections && Object.keys(LOCATIONS[r].connections).length >= 2);
if (sampleRoom) {
  const dirCn = Object.keys(LOCATIONS[sampleRoom].connections)[0];
  const dirEng = Object.entries(DIR_CN).find(e => e[1] === dirCn)[0];
  const tgt = tryMove(sampleRoom, dirEng);
  if (tgt) ok('从 <' + sampleRoom + '> 向' + dirEng + '(' + dirCn + ') → ' + tgt);
  else bad('移动失败：' + sampleRoom + ' / ' + dirEng);
}

// ============ BUG-2: NPC 卷宗契约 ============
console.log('\n[BUG-2] NPC 遭遇卷宗契约 (title / results[*].choice)');
let npcRooms = 0, npcTotal = 0, missingTitle = 0, missingChoice = 0, missingLog = 0;
for (const rn of Object.keys(NPC_ENCOUNTERS)) {
  const list = NPC_ENCOUNTERS[rn];
  if (!list || !list.length) continue;
  npcRooms++;
  for (const enc of list) {
    npcTotal++;
    if (!enc.title && !enc.name) missingTitle++;
    for (const r of (enc.results || [])) {
      if (!r.choice) missingChoice++;
      if (!r.log && !r.effect) missingLog++;
    }
  }
}
console.log('  遭遇房间数: ' + npcRooms + ', 遭遇总数: ' + npcTotal);
if (missingTitle === 0) ok('所有 NPC 遭遇都有 title/name');
else bad(missingTitle + ' 个遭遇缺 title');
if (missingChoice === 0) ok('所有 result 都有 choice（按钮不会渲染 undefined）');
else bad(missingChoice + ' 个 result 缺 choice');
if (missingLog === 0) ok('所有 result 都有 log 或 effect（点选项有反馈）');
else bad(missingLog + ' 个 result 无 log/effect');

// ============ 结果 ============
console.log('\n──────────────────────────────');
console.log('PASS: ' + pass + '   F器灵L: ' + fail);
console.log(fail === 0 ? '🎉 全部通过' : '⚠ 存在失败项');
process.exit(fail === 0 ? 0 : 1);
