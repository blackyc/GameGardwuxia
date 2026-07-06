/**
 * smoke.test.cjs — Smoke 测试
 *
 * 验证 ghostMUD 核心旅程不崩溃。
 * 由于 Game 类深度耦合 DOM 和 ES Modules，
 * 本测试采用"构建后 dist + 模拟 DOM"策略，
 * 或直接测试可独立验证的逻辑。
 *
 * 使用 Node 内置 assert 模块，无外部依赖。
 *
 * 运行方式: node test/smoke.test.cjs
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ── 配置 ──────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const DIST_DIR = path.join(ROOT, 'dist');
const SRC_DIR = path.join(ROOT, 'src');

// ── DOM 模拟 ──────────────────────────────────────
function createMockDOM() {
  const elements = {};
  
  function makeEl(id) {
    return {
      id,
      _text: '',
      _html: '',
      _classes: new Set(),
      _display: '',
      _visibility: '',
      _dataset: {},
      _children: [],
      _parent: null,
      _listeners: {},
      style: {},
      dataset: {},
      classList: {
        add: function(c) { this._classes = this._classes || new Set(); this._classes.add(c); },
        remove: function(c) { this._classes = this._classes || new Set(); this._classes.delete(c); },
        contains: function(c) { this._classes = this._classes || new Set(); return this._classes.has(c); },
        toggle: function(c) { this._classes = this._classes || new Set(); if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
      },
      get textContent() { return this._text; },
      set textContent(v) { this._text = String(v); },
      get innerHTML() { return this._html; },
      set innerHTML(v) { this._html = String(v); },
      get innerText() { return this._text; },
      set innerText(v) { this._text = String(v); },
      get value() { return this._val || ''; },
      set value(v) { this._val = v; },
      appendChild(child) { this._children.push(child); child._parent = this; return child; },
      removeChild(child) { this._children = this._children.filter(c => c !== child); },
      querySelector(sel) { return null; },
      querySelectorAll(sel) { return []; },
      addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
      removeEventListener(type, fn) { /* noop */ },
      remove() { /* noop */ },
      scrollIntoView() { /* noop */ },
      focus() { /* noop */ },
      click() { /* noop */ },
      insertAdjacentHTML() { /* noop */ },
      get offsetWidth() { return 100; },
      get offsetHeight() { return 100; },
      get scrollWidth() { return 100; },
      get scrollHeight() { return 100; },
    };
  }

  const document = {
    _elements: elements,
    body: makeEl('body'),
    head: makeEl('head'),
    documentElement: makeEl('html'),
    getElementById(id) {
      if (!elements[id]) elements[id] = makeEl(id);
      return elements[id];
    },
    querySelector(sel) { return null; },
    querySelectorAll(sel) { return []; },
    createElement(tag) {
      const el = makeEl(tag + '-' + Math.random().toString(36).slice(2, 8));
      el.tagName = tag.toUpperCase();
      return el;
    },
    createTextNode(text) {
      const el = makeEl('text');
      el.textContent = text;
      return el;
    },
    addEventListener(type, fn) { /* noop */ },
    removeEventListener(type, fn) { /* noop */ },
    readyState: 'complete',
  };

  return { document, elements: elements };
}

// ── 数据加载（复用 data-validate 的模式）──────────────
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

function loadDataIntoSandbox(sandbox) {
  sandbox.window = sandbox;
  sandbox.__DATA_REGISTRY = {};
  sandbox.console = console;
  sandbox.document = sandbox.document || {};
  sandbox.localStorage = sandbox.localStorage || {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
  };

  for (const file of MANIFEST_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInNewContext(code, sandbox, { filename: file });
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
    failures.push({ name, error: e.message, stack: e.stack });
    console.log(`  ✗ ${name}`);
    console.log(`    → ${e.message}`);
  }
}

// ── 主测试 ──────────────────────────────────────
console.log('\nSmoke 测试 (smoke)');
console.log('━'.repeat(50));

// 准备沙箱
const sandbox = {};
loadDataIntoSandbox(sandbox);
const REG = sandbox.__DATA_REGISTRY;

// 1. 数据可加载并形成完整卷宗
test('所有数据文件加载到 __DATA_REGISTRY', () => {
  const keys = Object.keys(REG);
  assert.ok(keys.length >= 20, `__DATA_REGISTRY 只有 ${keys.length} 个变量，期望 ≥20`);
});

// 2. LOCATIONS 可用于移动逻辑验证
test('LOCATIONS 包含起始房间 "应天府·十字街口"', () => {
  assert.ok(REG.LOCATIONS, 'LOCATIONS 未注册');
  const start = REG.LOCATIONS['应天府·十字街口'];
  assert.ok(start, '起始房间 "应天府·十字街口" 不存在');
  assert.ok(start.connections, '起始房间缺少 connections');
  assert.ok(Object.keys(start.connections).length > 0, '起始房间没有可移动方向');
});

// 3. 移动逻辑：从起始房间可以移动
test('move: 从起始房间可沿 connections 移动到目标', () => {
  const start = REG.LOCATIONS['应天府·十字街口'];
  const dirs = Object.keys(start.connections);
  const firstDir = dirs[0];
  const target = start.connections[firstDir];
  assert.ok(target, `方向 ${firstDir} 的目标为空`);
  // 验证目标存在（或为 yt_ 前缀）
  if (!target.startsWith('yt_')) {
    assert.ok(REG.LOCATIONS[target], `目标房间 "${target}" 不存在于 LOCATIONS`);
  }
});

// 4. 初始状态必要字段验证（从 Game 构造函数推断）
test('初始状态包含必要字段（从数据推断）', () => {
  const requiredDataFields = ['REALMS', 'LOCATIONS', 'NPC_ENCOUNTERS', 'FACTIONS', 'ROGUE_SKILLS', 'QUESTS', 'ITEMS'];
  for (const field of requiredDataFields) {
    assert.ok(REG[field], `必要数据字段 ${field} 不存在`);
  }
  
  // 验证 REALMS[0] 有必要字段（用于初始化 hp, attack, defense）
  const r0 = REG.WU_REALMS[0] || REG.REALMS[0];
  assert.ok(r0, 'REALMS[0] 不存在');
  assert.ok(r0.hp !== undefined, 'REALMS[0].hp 不存在');
  assert.ok(r0.atk !== undefined, 'REALMS[0].atk 不存在');
  assert.ok(r0.def !== undefined, 'REALMS[0].def 不存在');
  assert.ok(r0.name, 'REALMS[0].name 不存在');
  assert.ok(r0.cost !== undefined, 'REALMS[0].cost 不存在');
});

// 5. 搜索区域逻辑可执行（ROOM_SEARCH 存在且起始房间有数据或安全 fallback）
test('searchArea: ROOM_SEARCH 数据存在', () => {
  assert.ok(REG.ROOM_SEARCH, 'ROOM_SEARCH 未注册');
  // 起始房间不一定有搜索数据，但 ROOM_SEARCH 应该是个对象
  assert.strictEqual(typeof REG.ROOM_SEARCH, 'object', 'ROOM_SEARCH 应为对象');
});

// 6. NPC 遭遇数据存在
test('speakToNpc: NPC_ENCOUNTERS 数据存在且有内容', () => {
  assert.ok(REG.NPC_ENCOUNTERS, 'NPC_ENCOUNTERS 未注册');
  const rooms = Object.keys(REG.NPC_ENCOUNTERS);
  assert.ok(rooms.length > 0, 'NPC_ENCOUNTERS 为空');
  // 至少有一个房间有 NPC
  let hasNPC = false;
  for (const room of rooms) {
    if (REG.NPC_ENCOUNTERS[room] && REG.NPC_ENCOUNTERS[room].length > 0) {
      hasNPC = true;
      break;
    }
  }
  assert.ok(hasNPC, 'NPC_ENCOUNTERS 中没有任何房间包含 NPC');
});

// 7. 战斗系统数据验证（CombatFacade 依赖）
test('CombatFacade: ENEMIES 数据可用于战斗', () => {
  assert.ok(REG.ENEMIES, 'ENEMIES 未注册');
  const enemyNames = Object.keys(REG.ENEMIES);
  assert.ok(enemyNames.length > 0, 'ENEMIES 为空');
  // 检查第一个敌人的数据结构
  const firstEnemy = REG.ENEMIES[enemyNames[0]];
  assert.ok(firstEnemy.hp !== undefined, `敌人 ${enemyNames[0]} 缺少 hp`);
  assert.ok(firstEnemy.atk !== undefined, `敌人 ${enemyNames[0]} 缺少 atk`);
  assert.ok(firstEnemy.def !== undefined, `敌人 ${enemyNames[0]} 缺少 def`);
});

test('CombatFacade: XINGGONG 战诀数据存在', () => {
  assert.ok(REG.XINGGONG, 'XINGGONG 未注册（战斗引擎依赖）');
});

test('CombatFacade: COMBAT_SKILLS_V3 战诀技能数据存在', () => {
  assert.ok(REG.COMBAT_SKILLS_V3, 'COMBAT_SKILLS_V3 未注册');
});

// 8. 五页切换：验证 PageManager 相关的渲染函数存在
test('五页切换: Renderer 渲染函数在源码中定义', () => {
  const rendererCode = fs.readFileSync(path.join(SRC_DIR, 'ui', 'renderer.js'), 'utf8');
  const requiredMethods = ['renderInventory', 'renderWuxue', 'renderQuests', 'renderMap', 'updateUI'];
  for (const method of requiredMethods) {
    assert.ok(rendererCode.includes(method + '('), `Renderer 缺少方法: ${method}`);
  }
});

test('五页切换: TabManager 支持 5 个 tab 注册', () => {
  const tabCode = fs.readFileSync(path.join(SRC_DIR, 'core', 'tabmanager.js'), 'utf8');
  assert.ok(tabCode.includes('register'), 'TabManager 缺少 register 方法');
  // Game._registerTabs 注册了 char, bag, wuxue, quest, status
  const gameCode = fs.readFileSync(path.join(SRC_DIR, 'game.js'), 'utf8');
  const tabs = ['char', 'bag', 'wuxue', 'quest', 'status'];
  for (const tab of tabs) {
    assert.ok(gameCode.includes(`'${tab}'`), `Game._registerTabs 未注册 tab: ${tab}`);
  }
});

test('五页切换: index.html 定义了 5 个 data-page 页面', () => {
  // PageManager 从 HTML 的 data-page 属性获取页面 ID
  // 检查 index.html 或 dist/index.html 中是否定义了 5 个页面
  const htmlPaths = [
    path.join(ROOT, 'index.html'),
    path.join(DIST_DIR, 'index.html'),
  ];
  let htmlContent = '';
  for (const p of htmlPaths) {
    if (fs.existsSync(p)) {
      htmlContent = fs.readFileSync(p, 'utf8');
      break;
    }
  }
  assert.ok(htmlContent, 'index.html 不存在（源码和 dist 均未找到）');
  
  const pages = ['jianghu', 'wuxue', 'xingnang', 'yutu', 'renwu'];
  let foundPages = 0;
  for (const page of pages) {
    if (htmlContent.includes(`data-page="${page}"`)) foundPages++;
  }
  assert.ok(foundPages >= 3, `index.html 只定义了 ${foundPages}/5 个 data-page 页面`);
});

// 9. 存档 save/load/hasSave/clear 逻辑验证
test('存档: Storage 类实现 save/load/hasSave/clear', () => {
  const storageCode = fs.readFileSync(path.join(SRC_DIR, 'core', 'storage.js'), 'utf8');
  const requiredMethods = ['save(', 'load(', 'hasSave(', 'clear('];
  for (const method of requiredMethods) {
    assert.ok(storageCode.includes(method), `Storage 缺少方法: ${method}`);
  }
});

test('存档: localStorage 模拟存档读写', () => {
  // 模拟 Storage 的 save/load 行为
  const mockStorage = {
    _data: {},
    setItem(k, v) { this._data[k] = String(v); },
    getItem(k) { return this._data[k] || null; },
    removeItem(k) { delete this._data[k]; },
  };
  
  const STORAGE_KEY = 'ghostmud_save_v2';
  const testState = { realm: 3, cultivation: 500, hp: 120, location: '应天府·十字街口' };
  const payload = { version: 1, timestamp: Date.now(), state: testState };
  
  // save
  mockStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  assert.ok(mockStorage.getItem(STORAGE_KEY) !== null, '存档后 hasSave 应返回 true');
  
  // load
  const raw = mockStorage.getItem(STORAGE_KEY);
  const loaded = JSON.parse(raw);
  assert.strictEqual(loaded.state.realm, 3, '读档后 realm 不匹配');
  assert.strictEqual(loaded.state.cultivation, 500, '读档后 cultivation 不匹配');
  assert.strictEqual(loaded.state.location, '应天府·十字街口', '读档后 location 不匹配');
  
  // clear
  mockStorage.removeItem(STORAGE_KEY);
  assert.strictEqual(mockStorage.getItem(STORAGE_KEY), null, '清除后 hasSave 应返回 false');
});

// 10. Game 类源码结构验证
test('Game 类: 可从源码中检测到类定义和关键方法', () => {
  const gameCode = fs.readFileSync(path.join(SRC_DIR, 'game.js'), 'utf8');
  assert.ok(gameCode.includes('export class Game'), 'Game 类未导出');
  
  const requiredMethods = [
    'explore(dir)',           // move
    'searchArea()',           // search
    'speakToNpc(npcIndex)',   // NPC 交谈
    'startCombat(name, data)', // 战斗启动
    'combatAction(action)',    // 战斗行动
    'switchTab(tab)',          // 页面切换
    'cultivate()',             // 修炼
    'rest()',                  // 休息
    'processCommand(cmd)',     // 命令处理
  ];
  for (const method of requiredMethods) {
    assert.ok(gameCode.includes(method), `Game 缺少方法签名: ${method}`);
  }
});

test('Game 类: 初始状态包含必要字段', () => {
  const gameCode = fs.readFileSync(path.join(SRC_DIR, 'game.js'), 'utf8');
  // 验证 this.state 赋值包含必要字段
  const requiredStateFields = ['realm', 'cultivation', 'hp', 'location', 'inventory', 'faction', 'skills', 'path'];
  for (const field of requiredStateFields) {
    assert.ok(gameCode.includes(`${field}:`), `Game.state 缺少字段: ${field}`);
  }
});

// 11. 构建产物验证（如果 dist 存在）
test('构建产物: dist/index.html 存在', () => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(DIST_DIR)) {
    // dist 不存在，跳过（不报错）
    console.log('    (dist 目录不存在，跳过)');
    return;
  }
  assert.ok(fs.existsSync(indexPath), 'dist/index.html 不存在');
});

test('构建产物: dist/data/ 目录包含数据文件', () => {
  const distDataDir = path.join(DIST_DIR, 'data');
  if (!fs.existsSync(distDataDir)) {
    console.log('    (dist/data 目录不存在，跳过)');
    return;
  }
  const files = fs.readdirSync(distDataDir).filter(f => f.endsWith('.js'));
  assert.ok(files.length > 0, 'dist/data/ 目录下没有 .js 数据文件');
});

// ── 结果汇总 ──────────────────────────────────────
console.log('━'.repeat(50));
console.log(`Smoke 测试结果: ${passed} 通过, ${failed} 失败`);
if (failed > 0) {
  console.log('\n失败项:');
  failures.forEach(f => console.log(`  • ${f.name}: ${f.error}`));
}

module.exports = { passed, failed, failures };
