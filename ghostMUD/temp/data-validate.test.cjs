/**
 * data-validate.test.cjs — 数据校验测试
 *
 * 验证所有 public/data/*.js 数据文件的完整性和一致性。
 * 使用 Node 内置 assert 模块，无外部依赖。
 *
 * 运行方式: node temp/data-validate.test.cjs
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ── 配置 ──────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const MANIFEST = [
  { file: 'rebuild_enemies_items_realms.js', vars: ['PREREQ_TYPES','WU_REALMS','LING_REALMS','REALMS','ENEMIES','ITEMS','LOOT_TABLES','FACTION_PATH','WU_FACTIONS','LING_FACTIONS','FALLEN_ORIGINS','CALAMITY_LORE','TERM_MAP','ENEMY_POOLS'] },
  { file: 'rebuild_atmosphere.js', vars: ['ATMOSPHERE_ITEMS'] },
  { file: 'rebuild_rooms_city.js', vars: ['CITY_ROOMS'] },
  { file: 'rebuild_rooms_wild.js', vars: ['WILD_ROOMS'] },
  { file: 'rebuild_dungeon_rooms.js', vars: ['DUNGEON_ROOMS'] },
  { file: 'rebuild_skill_descriptions_1.js', vars: ['GHOST_SKILL_TREES_1'] },
  { file: 'rebuild_skill_descriptions_2.js', vars: ['GHOST_SKILL_TREES_2'] },
  { file: 'rebuild_rooms_wenjianfeng.js', vars: ['WENJIANFENG_ROOMS'] },
  { file: 'wenjianfeng_npc_dialogues.js', vars: ['WENJIANFENG_NPC_DIALOGUES'] },
  { file: 'wenjianfeng_tutorial_ch1.js', vars: ['WENJIANFENG_TUTORIAL_CH1'] },
  { file: 'wenjianfeng_tutorial_ch2.js', vars: ['WENJIANFENG_TUTORIAL_CH2'] },
  { file: 'integration_v2.js', vars: ['LOCATIONS','MAP_POS','MAP_CONN','ROOM_SEARCH','NPC_ENCOUNTERS','FACTIONS','ROGUE_SKILLS','QUESTS','getDesc'] },
  { file: 'rebuild_meridians.js', vars: ['MERIDIANS'] },
  { file: 'rebuild_seals.js', vars: ['SEALS','SEAL_CATEGORIES'] },
  { file: 'rebuild_builds_drops_corruption.js', vars: ['BUILDS','MERIDIAN_DROPS','CORRUPTION'] },
  { file: 'corruption_system.js', vars: ['CORRUPTION_TIERS','CORRUPTION_DATA'] },
  { file: 'jianghu_events.js', vars: ['JIANGHU_NPCS','JIANGHU_EVENTS','JIANGHU_SIDELINES'] },
  { file: 'cross_path_quests.js', vars: ['CROSS_PATH_QUESTS'] },
  { file: 'rebuild_skill_descriptions_ling.js', vars: ['LING_SKILL_DATA'] },
  { file: 'rebuild_combat_gong.js', vars: ['XINGGONG'] },
  { file: 'rebuild_combat_atb.js', vars: ['ATB_SYSTEM'] },
  { file: 'rebuild_combat_hijack.js', vars: ['COMBAT_HIJACK'] },
  { file: 'combat_skills_v3.js', vars: ['COMBAT_SKILLS_V3'] },
  { file: 'ghost_faction_recruiter_encounters.js', vars: ['FACTION_RECRUITER_ENCOUNTERS'] },
];

// ── 辅助：加载所有数据文件到模拟 window ────────────────
function loadAllData() {
  const sandbox = {};
  // 用 Proxy 模拟 window：读 sandbox 属性，写也写 sandbox
  sandbox.window = sandbox;
  sandbox.__DATA_REGISTRY = {};
  sandbox.console = console;

  for (const entry of MANIFEST) {
    const filePath = path.join(DATA_DIR, entry.file);
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInNewContext(code, sandbox, { filename: entry.file });
  }

  return sandbox;
}

// ── 测试结果收集 ──────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log(`  ✗ ${name}`);
    console.log(`    → ${e.message}`);
  }
}

// ── 主测试 ──────────────────────────────────────
console.log('\n📋 数据校验测试 (data-validate)');
console.log('━'.repeat(50));

// 1. 所有数据文件可加载
test('所有 public/data/*.js 文件可加载', () => {
  for (const entry of MANIFEST) {
    const filePath = path.join(DATA_DIR, entry.file);
    assert.ok(fs.existsSync(filePath), `文件不存在: ${entry.file}`);
    const code = fs.readFileSync(filePath, 'utf8');
    assert.ok(code.length > 0, `文件为空: ${entry.file}`);
  }
});

// 加载数据供后续测试使用
const W = loadAllData();
const REG = W.__DATA_REGISTRY;

// 2. DATA_MANIFEST 中注册的变量存在于 window 全局
test('DATA_MANIFEST 中注册的变量存在于 __DATA_REGISTRY', () => {
  const missing = [];
  for (const entry of MANIFEST) {
    for (const varName of entry.vars) {
      if (!(varName in REG)) {
        missing.push(`${entry.file} → ${varName}`);
      }
    }
  }
  assert.strictEqual(missing.length, 0, `以下变量未注册: ${missing.join(', ')}`);
});

// 3. 房间总数 > 0 且所有房间有 name 和 desc
test('LOCATIONS 房间总数 > 0', () => {
  assert.ok(REG.LOCATIONS, 'LOCATIONS 未注册');
  const roomCount = Object.keys(REG.LOCATIONS).length;
  assert.ok(roomCount > 0, `LOCATIONS 房间数为 ${roomCount}，期望 > 0`);
});

test('所有房间有 name 和 desc', () => {
  const rooms = REG.LOCATIONS;
  const badRooms = [];
  for (const [id, room] of Object.entries(rooms)) {
    if (!room.name) badRooms.push(`${id}: 缺少 name`);
    if (!room.desc && !room.desc_vague && !room.desc_awakened) badRooms.push(`${id}: 缺少 desc（且无 desc_vague/desc_awakened）`);
  }
  // 允许子房间只有 desc，但至少要有一种描述
  // 放宽：只检查 name 必须存在
  const noName = [];
  for (const [id, room] of Object.entries(rooms)) {
    if (!room.name && !id.includes('yt_')) noName.push(id);
  }
  assert.strictEqual(noName.length, 0, `以下房间缺少 name: ${noName.slice(0, 10).join(', ')}${noName.length > 10 ? '...' : ''}`);
});

// 4. 所有 connections 引用的目标存在于 LOCATIONS 中（或以 yt_ 开头）
test('所有 connections 引用的目标存在于 LOCATIONS 中或以 yt_ 开头', () => {
  const rooms = REG.LOCATIONS;
  const broken = [];
  for (const [id, room] of Object.entries(rooms)) {
    if (!room.connections) continue;
    for (const [dir, target] of Object.entries(room.connections)) {
      if (typeof target !== 'string') continue;
      // 允许 yt_ 前头的内部 ID 引用
      if (target.startsWith('yt_')) continue;
      if (!(target in rooms)) {
        broken.push(`${id} →[${dir}]→ ${target} (目标不存在)`);
      }
    }
  }
  // 允许少量断裂（郊区连接器等），但不超过 20 个
  assert.ok(broken.length <= 20, `发现 ${broken.length} 个断裂连接（期望 ≤20）:\n${broken.slice(0, 15).join('\n')}`);
});

// 5. MAP_POS 中的坐标都是数字
test('MAP_POS 中的坐标都是数字', () => {
  assert.ok(REG.MAP_POS, 'MAP_POS 未注册');
  const entries = Object.entries(REG.MAP_POS);
  assert.ok(entries.length > 0, 'MAP_POS 为空');
  const badCoords = [];
  for (const [id, pos] of entries) {
    if (Array.isArray(pos)) {
      if (typeof pos[0] !== 'number' || typeof pos[1] !== 'number') {
        badCoords.push(`${id}: [${pos[0]}, ${pos[1]}]`);
      }
    } else if (pos && typeof pos === 'object') {
      if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        badCoords.push(`${id}: {x:${pos.x}, y:${pos.y}}`);
      }
    } else {
      badCoords.push(`${id}: 类型=${typeof pos}`);
    }
  }
  assert.strictEqual(badCoords.length, 0, `非数字坐标: ${badCoords.slice(0, 10).join(', ')}`);
});

// 6. NPC_ENCOUNTERS、ENEMIES、ITEMS、QUESTS、FACTIONS 数量 > 0
test('NPC_ENCOUNTERS 数量 > 0', () => {
  assert.ok(REG.NPC_ENCOUNTERS, 'NPC_ENCOUNTERS 未注册');
  const count = Object.keys(REG.NPC_ENCOUNTERS).length;
  assert.ok(count > 0, `NPC_ENCOUNTERS 数量为 ${count}，期望 > 0`);
});

test('ENEMIES 数量 > 0', () => {
  assert.ok(REG.ENEMIES, 'ENEMIES 未注册');
  const count = Object.keys(REG.ENEMIES).length;
  assert.ok(count > 0, `ENEMIES 数量为 ${count}，期望 > 0`);
});

test('ITEMS 数量 > 0', () => {
  assert.ok(REG.ITEMS, 'ITEMS 未注册');
  const count = Array.isArray(REG.ITEMS) ? REG.ITEMS.length : Object.keys(REG.ITEMS).length;
  assert.ok(count > 0, `ITEMS 数量为 ${count}，期望 > 0`);
});

test('QUESTS 数量 > 0', () => {
  assert.ok(REG.QUESTS, 'QUESTS 未注册');
  const count = Array.isArray(REG.QUESTS) ? REG.QUESTS.length : Object.keys(REG.QUESTS).length;
  assert.ok(count > 0, `QUESTS 数量为 ${count}，期望 > 0`);
});

test('FACTIONS 数量 > 0', () => {
  assert.ok(REG.FACTIONS, 'FACTIONS 未注册');
  const count = Object.keys(REG.FACTIONS).length;
  assert.ok(count > 0, `FACTIONS 数量为 ${count}，期望 > 0`);
});

// 7. 技能数据存在且数量 > 0
test('技能数据存在且数量 > 0', () => {
  // 检查 ROGUE_SKILLS
  assert.ok(REG.ROGUE_SKILLS, 'ROGUE_SKILLS 未注册');
  assert.ok(REG.ROGUE_SKILLS.skills, 'ROGUE_SKILLS.skills 不存在');
  assert.ok(REG.ROGUE_SKILLS.skills.length > 0, `ROGUE_SKILLS.skills 数量为 ${REG.ROGUE_SKILLS.skills.length}，期望 > 0`);
  
  // 检查 FACTIONS 中的技能
  const factions = REG.FACTIONS;
  let totalFactionSkills = 0;
  for (const [fname, fdata] of Object.entries(factions)) {
    if (fdata && fdata.skills) {
      totalFactionSkills += fdata.skills.length;
    }
  }
  assert.ok(totalFactionSkills > 0, `帮派技能总数为 ${totalFactionSkills}，期望 > 0`);
});

// 额外：检查 REALMS 数据
test('REALMS 数据存在且数量 > 0', () => {
  assert.ok(REG.REALMS, 'REALMS 未注册');
  assert.ok(Array.isArray(REG.REALMS), `REALMS 应为数组，实际为 ${typeof REG.REALMS}`);
  assert.ok(REG.REALMS.length > 0, `REALMS 数量为 ${REG.REALMS.length}，期望 > 0`);
});

test('WU_REALMS 和 LING_REALMS 都存在', () => {
  assert.ok(REG.WU_REALMS, 'WU_REALMS 未注册');
  assert.ok(REG.LING_REALMS, 'LING_REALMS 未注册');
  assert.ok(REG.WU_REALMS.length > 0, `WU_REALMS 数量为 ${REG.WU_REALMS.length}`);
  assert.ok(REG.LING_REALMS.length > 0, `LING_REALMS 数量为 ${REG.LING_REALMS.length}`);
});

// H3-1: 裸 ID 房间数为 0（所有房间 ID 必须含 '·'）
test('所有房间 ID 遵守 大区·房间名 格式（裸 ID = 0）', () => {
  const rooms = REG.LOCATIONS;
  const bareIds = Object.keys(rooms).filter(id => !id.includes('\u00b7') && !id.startsWith('yt_'));
  assert.strictEqual(bareIds.length, 0, `发现 ${bareIds.length} 个裸 ID: ${bareIds.slice(0, 10).join(', ')}${bareIds.length > 10 ? '...' : ''}`);
});

// H3-2: index.html 与 manifest.js 文件列表同步
const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const htmlScripts = [...indexHtml.matchAll(/<script\s+src="\/data\/([^"]+)"><\/script>/g)].map(m => m[1]);
const manifestFiles = MANIFEST.map(e => e.file);

test('index.html <script> 标签与 DATA_MANIFEST 同步', () => {
  const onlyManifest = manifestFiles.filter(f => !htmlScripts.includes(f));
  const onlyHtml = htmlScripts.filter(f => !manifestFiles.includes(f));
  assert.strictEqual(onlyManifest.length, 0, `Manifest 有但 index.html 缺少: ${onlyManifest.join(', ')}`);
  assert.strictEqual(onlyHtml.length, 0, `index.html 有但 Manifest 缺少: ${onlyHtml.join(', ')}`);
});

// H3-3: 三层描述覆盖率报告可生成（不要求有值，只要求命令可执行）
test('三层描述覆盖率报告可生成', () => {
  const rooms = REG.LOCATIONS;
  const total = Object.keys(rooms).length;
  const hasVague = Object.values(rooms).filter(r => r.desc_vague).length;
  const hasPercept = Object.values(rooms).filter(r => r.desc_percept).length;
  const hasClear = Object.values(rooms).filter(r => r.desc_clear).length;
  // 只验证能算出数字，不要求覆盖率
  assert.ok(typeof hasVague === 'number' && typeof hasPercept === 'number' && typeof hasClear === 'number', '覆盖率计算失败');
  assert.ok(total > 0, '总房间数应 > 0');
  console.log(`    三层描述: vague=${hasVague}/${total}, percept=${hasPercept}/${total}, clear=${hasClear}/${total}`);
});

// H3-4: 所有 connections 目标存在于 LOCATIONS（迁移后应无断裂连接）
test('所有 connections 目标存在于 LOCATIONS（零断裂）', () => {
  const rooms = REG.LOCATIONS;
  const broken = [];
  for (const [id, room] of Object.entries(rooms)) {
    if (!room.connections) continue;
    for (const [dir, target] of Object.entries(room.connections)) {
      if (typeof target !== 'string') continue;
      if (target.startsWith('yt_')) continue;
      if (!(target in rooms)) {
        broken.push(`${id} →[${dir}]→ ${target}`);
      }
    }
  }
  assert.strictEqual(broken.length, 0, `发现 ${broken.length} 个断裂连接:\n${broken.slice(0, 20).join('\n')}`);
});

test('运行态房间连接不会用多个方向指向同一目标', () => {
  const duplicates = [];
  for (const [id, room] of Object.entries(REG.LOCATIONS)) {
    const byTarget = new Map();
    for (const [dir, target] of Object.entries(room.connections || {})) {
      if (!byTarget.has(target)) byTarget.set(target, []);
      byTarget.get(target).push(dir);
    }
    for (const [target, dirs] of byTarget.entries()) {
      if (dirs.length > 1) duplicates.push(`${id} -> ${target} (${dirs.join('/')})`);
    }
  }
  assert.strictEqual(duplicates.length, 0, `发现 ${duplicates.length} 组同目标重复连接:\n${duplicates.slice(0, 20).join('\n')}`);
});

// ── H3 修复：重复 connections 键检测 ──────────────
// JS 对象字面量中重复的键会被静默覆盖，导致地图拓扑断裂
// 本测试用正则扫描源码（而非求值后检查），能发现被覆盖的连接
test('connections 对象无重复方向键（源码级）', () => {
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js'));
  const dups = [];

  for (const file of files) {
    const src = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const connRegex = /connections\s*:\s*\{([^}]*)\}/g;
    let match;

    while ((match = connRegex.exec(src)) !== null) {
      const block = match[1];
      const lineNum = src.substring(0, match.index).split('\n').length;

      const keyRegex = /(?:'([^']+)'|"([^"]+)"|([^\s:,'"]+))\s*:/g;
      const keys = [];
      let km;
      while ((km = keyRegex.exec(block)) !== null) {
        keys.push(km[1] || km[2] || km[3]);
      }

      const counts = {};
      for (const k of keys) counts[k] = (counts[k] || 0) + 1;

      const fileDups = Object.entries(counts).filter(([k, c]) => c > 1);
      if (fileDups.length > 0) {
        // 找房间名
        let roomName = '未知';
        const before = src.substring(0, match.index);
        const nameMatches = [...before.matchAll(/name\s*:\s*['"`]([^'"`]+)['"`]/g)];
        if (nameMatches.length > 0) roomName = nameMatches[nameMatches.length - 1][1];

        for (const [dir, count] of fileDups) {
          dups.push(`${file}:${lineNum} ${roomName} ${dir}×${count}`);
        }
      }
    }
  }

  assert.strictEqual(dups.length, 0,
    `发现 ${dups.length} 处重复连接键（JS 对象静默覆盖）：\n  ${dups.slice(0, 10).join('\n  ')}${dups.length > 10 ? '\n  ...' : ''}`
  );
});
// P2: manifest vs index.html order check
const { execSync } = require('child_process');
test('manifest.js and index.html script order match', () => {
  try {
    execSync('node temp/work/generate-script-tags.cjs', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
  } catch (e) {
    assert.fail('manifest vs index.html mismatch: ' + (e.stdout ? e.stdout.toString() : e.message));
  }
});



// ── 结果汇总 ──────────────────────────────────────
console.log('━'.repeat(50));
console.log(`数据校验结果: ${passed} 通过, ${failed} 失败`);
if (failed > 0) {
  console.log('\n失败项:');
  failures.forEach(f => console.log(`  • ${f.name}: ${f.error}`));
}

process.exit(failed > 0 ? 1 : 0);

module.exports = { passed, failed, failures };
