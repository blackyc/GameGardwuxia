/**
 * save-schema.test.cjs — 存档系统 v2 测试
 *
 * H4A: 测试存档 schema、v1→v2 迁移、损坏处理、备份机制、导入导出。
 * 使用 mock localStorage 隔离，不污染真实存档。
 *
 * 运行方式: node test/save-schema.test.cjs
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ── 配置 ──────────────────────────────────────────
const SRC_DIR = path.join(__dirname, '..', 'src');

// ── Mock localStorage ──────────────────────────────
function createMockLocalStorage() {
  return {
    _data: {},
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; },
  };
}

// ── 加载 ES Module 源码到 CommonJS 上下文 ────────────
// 由于 storage.js 和 save_schema.js 使用 import/export，
// 我们用正则替换将其转为 CommonJS 后在 vm 中执行。
function loadStorageModule(localStorage) {
  const schemaCode = fs.readFileSync(path.join(SRC_DIR, 'core', 'save_schema.js'), 'utf8');
  const storageCode = fs.readFileSync(path.join(SRC_DIR, 'core', 'storage.js'), 'utf8');

  // 将 ES module 语法转为 CommonJS
  const cjsSchema = schemaCode
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+/g, '');

  const cjsStorage = storageCode
    .replace(/import\s*\{[^}]+\}\s*from\s*['"][^'"]+['"];?/g, '')
    .replace(/export\s+class\s+Storage/, 'class Storage');

  // 构建模块沙箱
  const moduleExports = {};
  const sandbox = {
    console,
    localStorage,
    module: { exports: moduleExports },
    exports: moduleExports,
  };

  const combinedCode = `
${cjsSchema}
${cjsStorage}
module.exports = { Storage, SCHEMA_VERSION, SAVE_SCHEMA, V1_MIGRATION_MAP, checkType, getSaveableFields, createDefaultState };
`;
  vm.runInNewContext(combinedCode, sandbox, { filename: 'storage-combined.cjs' });

  return sandbox.module.exports;
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

/**
 * 基于 JSON.stringify 的深度比较
 * 解决 vm.runInNewContext 中 JSON.parse 返回的对象原型链与主上下文不一致问题
 */
function jsonEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    assert.fail(msg || `JSON mismatch: actual=${a}, expected=${e}`);
  }
}

// ── 辅助：构造一个完整的 v1 存档 payload ─────────────
function makeV1Payload(overrides) {
  const baseState = {
    realm: 2,
    cultivation: 500,
    totalCultivation: 1500,
    daoxin: 80,
    maxDaoXin: 120,
    hp: 90,
    maxHp: 120,
    lifespan: 100,
    attack: 25,
    defense: 15,
    mp: 60,
    maxMp: 80,
    location: '\u5e94\u5929\u5e9c\u00b7\u5341\u5b57\u8857\u53e3',
    inventory: [{ name: '\u6d4b\u8bd5\u7269\u54c1', type: 'misc' }],
    equipment: { weapon: null, armor: null },
    techniques: ['\u57fa\u7840\u5251\u6cd5'],
    killCount: 5,
    explored: ['\u5e94\u5929\u5e9c\u00b7\u5341\u5b57\u8857\u53e3', '\u5e94\u5929\u5e9c\u00b7\u57ce\u968d\u5e99'],
    activeQuests: [],
    completedQuests: ['test_quest'],
    questProgress: { q1: { stage: 2 } },
    faction: '\u95ee\u5251\u5cf0',
    skills: { basic_sword: { level: 1, exp: 0 } },
    equippedSkill: null,
    factionRep: 10,
    path: 'wu',
    spiritStones: 0,
    copperCoins: 500,
    knowsSpiritStones: false,
    innate: null,
    innateName: null,
    innateMods: null,
    unlocks: [],
    factionRepMods: {},
    introSeen: true,
    chart: null,
    presetCharts: [],
    corruptionLevel: 0,
    isResting: false,
    isCultivating: false,
    trainCounter: 0,
    daoxinDecayCounter: 0,
    gameStart: 1700000000000,
    gameTime: 3,
    realTimeAccumulator: 60000,
    combat: null,
    npcEncounter: null,
    performCooldowns: {},
    roundCount: 0,
  };
  return {
    version: 1,
    timestamp: Date.now(),
    state: Object.assign(baseState, overrides || {}),
  };
}

// ── 辅助：构造一个完整的 v2 存档 payload ─────────────
function makeV2Payload(overrides) {
  const baseState = {
    path: 'wu',
    realm: 1,
    cultivation: 300,
    totalCultivation: 800,
    daoxin: 90,
    maxDaoXin: 110,
    hp: 100,
    maxHp: 110,
    lifespan: 90,
    attack: 20,
    defense: 10,
    mp: 70,
    maxMp: 80,
    location: '\u5e94\u5929\u5e9c\u00b7\u57ce\u968d\u5e99',
    inventory: [],
    equipment: { weapon: { name: '\u6728\u5251' }, armor: null },
    techniques: ['\u57fa\u7840\u62f3\u6cd5'],
    killCount: 3,
    explored: ['\u5e94\u5929\u5e9c\u00b7\u5341\u5b57\u8857\u53e3'],
    activeQuests: ['q2'],
    completedQuests: [],
    questStages: { q2: { stage: 1 } },
    faction: '\u6563\u4fee',
    skills: {},
    equippedSkill: null,
    factionRep: 0,
    spiritStones: 5,
    copperCoins: 100,
    knowsSpiritStones: true,
    innate: 'guer',
    innateName: '\u5e02\u4e95\u5b64\u513f',
    innateMods: { combat: 1 },
    unlocks: ['skill_x'],
    factionRepMods: {},
    introSeen: true,
    chart: null,
    presetCharts: [],
    corruptionLevel: 0,
    isResting: false,
    isCultivating: true,
    trainCounter: 5,
    daoxinDecayCounter: 2,
    gameStart: 1700000000000,
    gameTime: 5,
    realTimeAccumulator: 120000,
    performCooldowns: {},
    roundCount: 0,
  };
  return {
    version: 2,
    timestamp: Date.now(),
    state: Object.assign(baseState, overrides || {}),
  };
}

// ── 常量：中文字符串 ──────────────────────────────
const LOC_START = '\u5e94\u5929\u5e9c\u00b7\u5341\u5b57\u8857\u53e3';
const LOC_TEMPLE = '\u5e94\u5929\u5e9c\u00b7\u57ce\u968d\u5e99';
const LOC_NORTH = '\u90ca\u5916\u00b7\u5317\u9053';
const FACTION_WJF = '\u95ee\u5251\u5cf0';
const FACTION_SAN = '\u6563\u4fee';
const INNATE_GUER = '\u5e02\u4e95\u5b64\u513f';
const CHART_NAME = '\u6218\u8bc0' + '1';

// ═══════════════════════════════════════════════════════
//  主测试
// ═══════════════════════════════════════════════════════

console.log('\n\u62a5\u5b58\u6863\u7cfb\u7edf\u6d4b\u8bd5 (save-schema)');
console.log('\u2501'.repeat(50));

// ── 1. Schema 基础验证 ────────────────────────────────

test('SCHEMA_VERSION \u4e3a 2', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  assert.strictEqual(mod.SAVE_SCHEMA !== undefined, true, 'SAVE_SCHEMA not exported');
  assert.strictEqual(mod.SCHEMA_VERSION, 2, 'SCHEMA_VERSION should be 2');
});

test('SAVE_SCHEMA \u5305\u542b\u6240\u6709\u5fc5\u8981\u5b57\u6bb5', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const requiredFields = [
    'path', 'realm', 'cultivation', 'totalCultivation',
    'daoxin', 'maxDaoXin', 'hp', 'maxHp', 'lifespan',
    'attack', 'defense', 'mp', 'maxMp',
    'location', 'inventory', 'equipment', 'techniques',
    'killCount', 'explored',
    'activeQuests', 'completedQuests', 'questStages',
    'faction', 'skills', 'equippedSkill', 'factionRep',
    'spiritStones', 'copperCoins', 'knowsSpiritStones',
    'innate', 'innateName', 'innateMods', 'unlocks', 'factionRepMods',
    'introSeen',
    'chart', 'presetCharts', 'corruptionLevel',
    'isResting', 'isCultivating', 'trainCounter', 'daoxinDecayCounter',
    'gameStart', 'gameTime', 'realTimeAccumulator',
    'combat', 'npcEncounter',
    'performCooldowns', 'roundCount',
  ];
  for (const field of requiredFields) {
    assert.ok(mod.SAVE_SCHEMA[field], `SAVE_SCHEMA missing field: ${field}`);
  }
});

test('combat \u548c npcEncounter \u6807\u8bb0\u4e3a transient', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  assert.strictEqual(mod.SAVE_SCHEMA.combat.transient, true, 'combat should be transient');
  assert.strictEqual(mod.SAVE_SCHEMA.npcEncounter.transient, true, 'npcEncounter should be transient');
});

test('createDefaultState() \u8fd4\u56de\u5305\u542b\u6240\u6709\u5b57\u6bb5\u7684\u72b6\u6001\u5bf9\u8c61', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const state = mod.createDefaultState();
  for (const [name] of Object.entries(mod.SAVE_SCHEMA)) {
    assert.ok(name in state, `createDefaultState missing field: ${name}`);
  }
});

test('checkType() \u6b63\u786e\u8bc6\u522b\u7c7b\u578b', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  assert.strictEqual(mod.checkType(42, 'number'), true);
  assert.strictEqual(mod.checkType('hello', 'string'), true);
  assert.strictEqual(mod.checkType(true, 'boolean'), true);
  assert.strictEqual(mod.checkType({}, 'object'), true);
  assert.strictEqual(mod.checkType([], 'array'), true);
  assert.strictEqual(mod.checkType([], 'object'), false, 'array should not match object type');
  assert.strictEqual(mod.checkType({}, 'array'), false, 'object should not match array type');
  assert.strictEqual(mod.checkType(null, 'number'), true, 'null should pass type check (nullable controls)');
  assert.strictEqual(mod.checkType(NaN, 'number'), false, 'NaN should not pass number check');
});

// ── 2. v1 -> v2 migration ─────────────────────────

test('v1 \u5b58\u6863\u53ef\u8fc1\u79fb\u5230 v2\uff08questProgress -> questStages\uff09', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const v1Payload = makeV1Payload();
  ls.setItem('ghostmud_save_v2', JSON.stringify(v1Payload));

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.ok(loaded, 'load v1 should not return null');
  assert.ok(loaded.questStages, 'questStages should exist after migration');
  jsonEqual(loaded.questStages, { q1: { stage: 2 } }, 'questStages should be migrated from questProgress');
  assert.ok(!('questProgress' in loaded), 'questProgress should not exist after migration');
});

test('v1 \u5b58\u6863\u8fc1\u79fb\u540e\u6240\u6709\u6709\u6548\u5b57\u6bb5\u4fdd\u7559', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const v1Payload = makeV1Payload({ realm: 3, cultivation: 999, faction: '\u836f\u738b\u8c37' });
  ls.setItem('ghostmud_save_v2', JSON.stringify(v1Payload));

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.strictEqual(loaded.realm, 3, 'realm should be preserved');
  assert.strictEqual(loaded.cultivation, 999, 'cultivation should be preserved');
  assert.strictEqual(loaded.faction, '\u836f\u738b\u8c37', 'faction should be preserved');
  assert.strictEqual(loaded.killCount, 5, 'killCount should be preserved');
  jsonEqual(loaded.explored, [LOC_START, LOC_TEMPLE], 'explored should be preserved');
});

// ── 3. Missing fields fill defaults ───────────────

test('\u7f3a\u5b57\u6bb5\u7684\u5b58\u6863\u52a0\u8f7d\u540e\u586b\u9ed8\u8ba4\u503c', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const partialPayload = {
    version: 2,
    timestamp: Date.now(),
    state: {
      realm: 2,
      cultivation: 100,
      path: 'wu',
    },
  };
  ls.setItem('ghostmud_save_v2', JSON.stringify(partialPayload));

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.ok(loaded, 'load should not return null');
  assert.strictEqual(loaded.realm, 2, 'realm should be preserved');
  assert.strictEqual(loaded.cultivation, 100, 'cultivation should be preserved');
  assert.strictEqual(loaded.daoxin, 100, 'missing daoxin should be default 100');
  assert.strictEqual(loaded.maxDaoXin, 100, 'missing maxDaoXin should be default');
  assert.strictEqual(loaded.faction, FACTION_SAN, 'missing faction should be default');
  jsonEqual(loaded.inventory, [], 'missing inventory should be empty array');
  jsonEqual(loaded.explored, [LOC_START], 'missing explored should be default');
  assert.strictEqual(loaded.corruptionLevel, 0, 'missing corruptionLevel should be 0');
});

// ── 4. Type mismatch correction ───────────────────

test('\u9519\u7c7b\u578b\u5b57\u6bb5\u88ab\u7ea0\u6b63\u4e3a\u9ed8\u8ba4\u503c', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const badPayload = makeV2Payload({
    realm: 'should be number',
    cultivation: null,
    inventory: 'not an array',
    daoxin: true,
    faction: 123,
    knowsSpiritStones: 'yes',
  });
  ls.setItem('ghostmud_save_v2', JSON.stringify(badPayload));

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.ok(loaded, 'load should not return null');
  assert.strictEqual(loaded.realm, 0, 'wrong-type realm should be default 0');
  assert.strictEqual(loaded.cultivation, 0, 'null cultivation should be default 0');
  jsonEqual(loaded.inventory, [], 'wrong-type inventory should be empty array');
  assert.strictEqual(loaded.daoxin, 100, 'wrong-type daoxin should be default 100');
  assert.strictEqual(loaded.faction, FACTION_SAN, 'wrong-type faction should be default');
  assert.strictEqual(loaded.knowsSpiritStones, false, 'wrong-type knowsSpiritStones should be false');
});

// ── 5. Corrupt save handling ──────────────────────

test('\u622a\u65ad JSON \u4e0d\u5d29\u6e83\uff0c\u8fd4\u56de null\uff0c\u539f\u59cb\u503c\u4fdd\u5b58\u5230 corrupt key', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const truncatedJson = '{"version":2,"timestamp":1700000000000,"state":{"realm":';
  ls.setItem('ghostmud_save_v2', truncatedJson);

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.strictEqual(loaded, null, 'truncated JSON should return null');
  assert.strictEqual(ls.getItem('ghostmud_save_v2_corrupt'), truncatedJson, 'corrupt data should be saved to corrupt key');
});

test('payload \u7ed3\u6784\u65e0\u6548\uff08\u7f3a\u5c11 state\uff09\u4e0d\u5d29\u6e83\uff0c\u8fd4\u56de null', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  ls.setItem('ghostmud_save_v2', JSON.stringify({ version: 2, timestamp: Date.now() }));

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.strictEqual(loaded, null, 'payload missing state should return null');
});

test('payload \u4e3a\u975e\u5bf9\u8c61 JSON \u4e0d\u5d29\u6e83\uff0c\u8fd4\u56de null', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  ls.setItem('ghostmud_save_v2', '"just a string"');

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.strictEqual(loaded, null, 'non-object JSON should return null');
});

// ── 6. Unknown version handling ───────────────────

test('\u672a\u77e5\u7248\u672c\u4e0d\u5d29\u6e83\uff0c\u5c1d\u8bd5\u517c\u5bb9\u52a0\u8f7d', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const futurePayload = {
    version: 99,
    timestamp: Date.now(),
    state: makeV2Payload().state,
  };
  ls.setItem('ghostmud_save_v2', JSON.stringify(futurePayload));

  const storage = new mod.Storage();
  const loaded = storage.load();

  assert.ok(loaded, 'unknown version should attempt compatible load');
  assert.strictEqual(loaded.realm, 1, 'unknown version fields should load normally');
});

// ── 7. Backup mechanism ───────────────────────────

test('save \u540e backup key \u5b58\u5728\u4e14\u4e3a\u4e4b\u524d\u7684\u5b58\u6863', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state1 = mod.createDefaultState();
  state1.realm = 1;
  storage.save(state1);

  assert.strictEqual(ls.getItem('ghostmud_save_v2_backup'), null, 'first save should not have backup');

  const state2 = mod.createDefaultState();
  state2.realm = 5;
  storage.save(state2);

  const backupRaw = ls.getItem('ghostmud_save_v2_backup');
  assert.ok(backupRaw, 'backup should exist after second save');
  const backupPayload = JSON.parse(backupRaw);
  assert.strictEqual(backupPayload.state.realm, 1, 'backup should have previous realm=1');
});

test('save \u5931\u8d25\u65f6\uff08QuotaExceededError\uff09\u8fd4\u56de false \u5e76\u4fdd\u7559\u5907\u4efd', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state1 = mod.createDefaultState();
  storage.save(state1);

  const originalSetItem = ls.setItem;
  ls.setItem = function(k, v) {
    if (k === 'ghostmud_save_v2') {
      const err = new Error('Quota exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    }
    return originalSetItem.call(this, k, v);
  };

  const state2 = mod.createDefaultState();
  state2.realm = 9;
  const result = storage.save(state2);

  ls.setItem = originalSetItem;

  assert.strictEqual(result, false, 'save should return false');
  const mainRaw = ls.getItem('ghostmud_save_v2');
  assert.ok(mainRaw, 'main save should still exist');
  const mainPayload = JSON.parse(mainRaw);
  assert.strictEqual(mainPayload.state.realm, 0, 'main save should keep old value');
});

// ── 8. Save-load consistency ──────────────────────

test('\u4fdd\u5b58\u540e\u52a0\u8f7d\uff0c\u5173\u952e\u5b57\u6bb5\u5b8c\u5168\u4e00\u81f4', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state = mod.createDefaultState();
  state.realm = 3;
  state.cultivation = 750;
  state.totalCultivation = 2000;
  state.daoxin = 85;
  state.maxDaoXin = 140;
  state.hp = 95;
  state.maxHp = 140;
  state.lifespan = 120;
  state.attack = 30;
  state.defense = 20;
  state.mp = 65;
  state.maxMp = 120;
  state.location = LOC_TEMPLE;
  state.inventory = [{ name: '\u6728\u5251', type: 'weapon' }, { name: '\u836f\u4e38', type: 'consumable' }];
  state.equipment = { weapon: { name: '\u94c1\u5251', atk: 5 }, armor: null };
  state.techniques = ['\u57fa\u7840\u5251\u6cd5', '\u5185\u529f\u5fc3\u6cd5'];
  state.killCount = 12;
  state.explored = [LOC_START, LOC_TEMPLE, LOC_NORTH];
  state.activeQuests = ['q1', 'q2'];
  state.completedQuests = ['q0'];
  state.questStages = { q1: { stage: 2 }, q2: { stage: 1 } };
  state.faction = FACTION_WJF;
  state.skills = { basic_sword: { level: 3, exp: 50 } };
  state.equippedSkill = 'basic_sword';
  state.factionRep = 15;
  state.spiritStones = 8;
  state.copperCoins = 350;
  state.knowsSpiritStones = true;
  state.innate = 'shijing_guer';
  state.innateName = INNATE_GUER;
  state.innateMods = { combat: 1, economy: -1 };
  state.unlocks = ['skill_a', 'skill_b'];
  state.factionRepMods = { '\u95ee\u5251\u5cf0': 5 };
  state.introSeen = true;
  state.chart = { name: CHART_NAME };
  state.presetCharts = [{ name: CHART_NAME }, { name: '\u6218\u8bc0' + '2' }];
  state.corruptionLevel = 2;
  state.isResting = false;
  state.isCultivating = true;
  state.trainCounter = 7;
  state.daoxinDecayCounter = 3;
  state.gameStart = 1700000000000;
  state.gameTime = 7;
  state.realTimeAccumulator = 90000;
  state.performCooldowns = { skill1: 2 };
  state.roundCount = 5;
  state.combat = { enemy: 'test' };
  state.npcEncounter = { npcs: [] };

  const saveResult = storage.save(state);
  assert.strictEqual(saveResult, true, 'save should return true');

  const loaded = storage.load();
  assert.ok(loaded, 'load should return non-null');

  assert.strictEqual(loaded.realm, 3, 'realm mismatch');
  assert.strictEqual(loaded.cultivation, 750, 'cultivation mismatch');
  assert.strictEqual(loaded.totalCultivation, 2000, 'totalCultivation mismatch');
  assert.strictEqual(loaded.daoxin, 85, 'daoxin mismatch');
  assert.strictEqual(loaded.maxDaoXin, 140, 'maxDaoXin mismatch');
  assert.strictEqual(loaded.hp, 95, 'hp mismatch');
  assert.strictEqual(loaded.maxHp, 140, 'maxHp mismatch');
  assert.strictEqual(loaded.lifespan, 120, 'lifespan mismatch');
  assert.strictEqual(loaded.attack, 30, 'attack mismatch');
  assert.strictEqual(loaded.defense, 20, 'defense mismatch');
  assert.strictEqual(loaded.mp, 65, 'mp mismatch');
  assert.strictEqual(loaded.maxMp, 120, 'maxMp mismatch');
  assert.strictEqual(loaded.location, LOC_TEMPLE, 'location mismatch');
  jsonEqual(loaded.inventory, [{ name: '\u6728\u5251', type: 'weapon' }, { name: '\u836f\u4e38', type: 'consumable' }], 'inventory mismatch');
  jsonEqual(loaded.equipment, { weapon: { name: '\u94c1\u5251', atk: 5 }, armor: null }, 'equipment mismatch');
  jsonEqual(loaded.techniques, ['\u57fa\u7840\u5251\u6cd5', '\u5185\u529f\u5fc3\u6cd5'], 'techniques mismatch');
  assert.strictEqual(loaded.killCount, 12, 'killCount mismatch');
  jsonEqual(loaded.explored, [LOC_START, LOC_TEMPLE, LOC_NORTH], 'explored mismatch');
  jsonEqual(loaded.activeQuests, ['q1', 'q2'], 'activeQuests mismatch');
  jsonEqual(loaded.completedQuests, ['q0'], 'completedQuests mismatch');
  jsonEqual(loaded.questStages, { q1: { stage: 2 }, q2: { stage: 1 } }, 'questStages mismatch');
  assert.strictEqual(loaded.faction, FACTION_WJF, 'faction mismatch');
  jsonEqual(loaded.skills, { basic_sword: { level: 3, exp: 50 } }, 'skills mismatch');
  assert.strictEqual(loaded.equippedSkill, 'basic_sword', 'equippedSkill mismatch');
  assert.strictEqual(loaded.factionRep, 15, 'factionRep mismatch');
  assert.strictEqual(loaded.spiritStones, 8, 'spiritStones mismatch');
  assert.strictEqual(loaded.copperCoins, 350, 'copperCoins mismatch');
  assert.strictEqual(loaded.knowsSpiritStones, true, 'knowsSpiritStones mismatch');
  assert.strictEqual(loaded.innate, 'shijing_guer', 'innate mismatch');
  assert.strictEqual(loaded.innateName, INNATE_GUER, 'innateName mismatch');
  jsonEqual(loaded.innateMods, { combat: 1, economy: -1 }, 'innateMods mismatch');
  jsonEqual(loaded.unlocks, ['skill_a', 'skill_b'], 'unlocks mismatch');
  jsonEqual(loaded.factionRepMods, { '\u95ee\u5251\u5cf0': 5 }, 'factionRepMods mismatch');
  assert.strictEqual(loaded.introSeen, true, 'introSeen mismatch');
  jsonEqual(loaded.chart, { name: CHART_NAME }, 'chart mismatch');
  jsonEqual(loaded.presetCharts, [{ name: CHART_NAME }, { name: '\u6218\u8bc0' + '2' }], 'presetCharts mismatch');
  assert.strictEqual(loaded.corruptionLevel, 2, 'corruptionLevel mismatch');
  assert.strictEqual(loaded.isResting, false, 'isResting mismatch');
  assert.strictEqual(loaded.isCultivating, true, 'isCultivating mismatch');
  assert.strictEqual(loaded.trainCounter, 7, 'trainCounter mismatch');
  assert.strictEqual(loaded.daoxinDecayCounter, 3, 'daoxinDecayCounter mismatch');
  assert.strictEqual(loaded.gameStart, 1700000000000, 'gameStart mismatch');
  assert.strictEqual(loaded.gameTime, 7, 'gameTime mismatch');
  assert.strictEqual(loaded.realTimeAccumulator, 90000, 'realTimeAccumulator mismatch');
  jsonEqual(loaded.performCooldowns, { skill1: 2 }, 'performCooldowns mismatch');
  assert.strictEqual(loaded.roundCount, 5, 'roundCount mismatch');
  assert.strictEqual(loaded.combat, null, 'combat should be null (transient)');
  assert.strictEqual(loaded.npcEncounter, null, 'npcEncounter should be null (transient)');
});

// ── 9. Import/export ──────────────────────────────

test('exportSave() \u8fd4\u56de JSON \u5b57\u7b26\u4e32', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state = mod.createDefaultState();
  state.realm = 4;
  storage.save(state);

  const exported = storage.exportSave();
  assert.ok(exported, 'exportSave should return non-null');
  assert.strictEqual(typeof exported, 'string', 'exportSave should return string');

  const parsed = JSON.parse(exported);
  assert.strictEqual(parsed.version, 2, 'exported version should be 2');
  assert.strictEqual(parsed.state.realm, 4, 'exported realm should be 4');
});

test('exportSave() \u65e0\u5b58\u6863\u65f6\u8fd4\u56de null', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  assert.strictEqual(storage.exportSave(), null, 'exportSave with no save should return null');
});

test('importSave() \u6210\u529f\u5bfc\u5165\u6709\u6548\u5b58\u6863', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state1 = mod.createDefaultState();
  state1.realm = 1;
  storage.save(state1);

  const newState = mod.createDefaultState();
  newState.realm = 5;
  const newPayload = { version: 2, timestamp: Date.now(), state: newState };
  const result = storage.importSave(JSON.stringify(newPayload));

  assert.strictEqual(result, true, 'importSave should return true');

  const loaded = storage.load();
  assert.strictEqual(loaded.realm, 5, 'imported realm should be 5');

  const backupRaw = ls.getItem('ghostmud_save_v2_backup');
  assert.ok(backupRaw, 'import should backup old save');
  const backupPayload = JSON.parse(backupRaw);
  assert.strictEqual(backupPayload.state.realm, 1, 'backup should have old realm=1');
});

test('importSave() \u65e0\u6548 JSON \u8fd4\u56de false', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  assert.strictEqual(storage.importSave('not valid json'), false, 'invalid JSON should return false');
});

test('importSave() \u7f3a\u5c11 state \u5b57\u6bb5\u8fd4\u56de false', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  assert.strictEqual(storage.importSave(JSON.stringify({ version: 2, timestamp: Date.now() })), false, 'missing state should return false');
});

// ── 10. getBackup() ───────────────────────────────

test('getBackup() \u8fd4\u56de\u5907\u4efd\u5b58\u6863', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  storage.save(Object.assign(mod.createDefaultState(), { realm: 1 }));
  storage.save(Object.assign(mod.createDefaultState(), { realm: 2 }));

  const backup = storage.getBackup();
  assert.ok(backup, 'getBackup should return non-null');
  assert.strictEqual(backup.realm, 1, 'backup realm should be 1');
});

test('getBackup() \u65e0\u5907\u4efd\u65f6\u8fd4\u56de null', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  assert.strictEqual(storage.getBackup(), null, 'getBackup with no backup should return null');
});

// ── 11. Whitelist filtering ───────────────────────

test('schema \u5916\u7684\u5b57\u6bb5\u4e0d\u88ab\u5b58\u6863', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state = mod.createDefaultState();
  state.realm = 2;
  state.hackerField = 'should not be saved';
  state._internalCache = { temp: true };
  storage.save(state);

  const loaded = storage.load();
  assert.ok(loaded, 'load should return non-null');
  assert.ok(!('hackerField' in loaded), 'schema-external field hackerField should not be saved');
  assert.ok(!('_internalCache' in loaded), 'schema-external field _internalCache should not be saved');
});

// ── 12. Empty save ────────────────────────────────

test('\u65e0\u5b58\u6863\u65f6 load() \u8fd4\u56de null', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  assert.strictEqual(storage.load(), null, 'load with no save should return null');
});

test('\u65e0\u5b58\u6863\u65f6 hasSave() \u8fd4\u56de false', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  assert.strictEqual(storage.hasSave(), false, 'hasSave with no save should return false');
});

test('\u6709\u5b58\u6863\u65f6 hasSave() \u8fd4\u56de true', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  storage.save(mod.createDefaultState());
  assert.strictEqual(storage.hasSave(), true, 'hasSave with save should return true');
});

test('clear() \u540e hasSave() \u8fd4\u56de false', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();
  storage.save(mod.createDefaultState());
  storage.clear();
  assert.strictEqual(storage.hasSave(), false, 'hasSave after clear should return false');
});

// ── 13. equippedSkill nullable test ───────────────

test('equippedSkill \u5141\u8bb8 null \u503c', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state = mod.createDefaultState();
  state.equippedSkill = null;
  storage.save(state);

  const loaded = storage.load();
  assert.strictEqual(loaded.equippedSkill, null, 'equippedSkill null should be preserved');
});

test('equippedSkill \u5141\u8bb8\u5b57\u7b26\u4e32\u503c', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const storage = new mod.Storage();

  const state = mod.createDefaultState();
  state.equippedSkill = 'some_skill';
  storage.save(state);

  const loaded = storage.load();
  assert.strictEqual(loaded.equippedSkill, 'some_skill', 'equippedSkill string should be preserved');
});

// ── 14. v1 with both questProgress and questStages ─

test('v1 \u540c\u65f6\u6709 questProgress \u548c questStages \u65f6\u4fdd\u7559 questStages', () => {
  const ls = createMockLocalStorage();
  const mod = loadStorageModule(ls);
  const v1Payload = makeV1Payload();
  v1Payload.state.questStages = { q2: { stage: 3 } };
  v1Payload.state.questProgress = { q1: { stage: 2 } };
  ls.setItem('ghostmud_save_v2', JSON.stringify(v1Payload));

  const storage = new mod.Storage();
  const loaded = storage.load();

  jsonEqual(loaded.questStages, { q2: { stage: 3 } }, 'should keep questStages not questProgress');
  assert.ok(!('questProgress' in loaded), 'questProgress should be deleted');
});

// ── 结果汇总 ──────────────────────────────────────
console.log('\u2501'.repeat(50));
console.log(`\u5b58\u6863\u7cfb\u7edf\u6d4b\u8bd5\u7ed3\u679c: ${passed} \u901a\u8fc7, ${failed} \u5931\u8d25`);
if (failed > 0) {
  console.log('\n\u5931\u8d25\u9879:');
  failures.forEach(f => console.log(`  \u2022 ${f.name}: ${f.error}`));
}

module.exports = { passed, failed, failures };
