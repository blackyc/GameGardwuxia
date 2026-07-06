const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (error) {
    failed++;
    console.log('  ✗ ' + name);
    console.log('    → ' + error.message);
  }
}

function loadRooms() {
  const sandbox = { console: { log() {}, warn() {}, error: console.error } };
  sandbox.window = sandbox;
  sandbox.__DATA_REGISTRY = {};
  const files = [
    'rebuild_enemies_items_realms.js', 'rebuild_atmosphere.js', 'rebuild_rooms_city.js',
    'rebuild_rooms_wild.js', 'rebuild_dungeon_rooms.js', 'rebuild_skill_descriptions_1.js',
    'rebuild_skill_descriptions_2.js', 'rebuild_rooms_wenjianfeng.js', 'wenjianfeng_tutorial_ch1.js',
    'integration_v2.js'
  ];
  for (const file of files) {
    const source = fs.readFileSync(path.join(ROOT, 'public', 'data', file), 'utf8');
    vm.runInNewContext(source, sandbox, { filename: file });
  }
  return sandbox.__DATA_REGISTRY.LOCATIONS;
}

function makeGame(overrides = {}) {
  const game = {
    state: {
      path: 'ling', realm: 0, daoxin: 100, cultivation: 0, gameTime: 1,
      skills: {}, inventory: [], completedQuests: [], activeQuests: [], faction: '散修',
      ...overrides
    },
    LING_REALMS: [
      { name: '凡人' }, { name: '炼气' }, { name: '筑基' }, { name: '金丹' }
    ],
    WU_REALMS: [{ name: '凡人' }, { name: '练家子' }, { name: '武师' }]
  };
  game.getRealms = () => game.state.path === 'ling' ? game.LING_REALMS : game.WU_REALMS;
  return game;
}

(async () => {
  const moduleUrl = pathToFileURL(path.join(ROOT, 'src', 'entry_condition.js')).href;
  const { meetsEntryPrerequisite, getEntryAccess } = await import(moduleUrl);

  console.log('\n房间入口条件测试 (entry-condition)');

  test('道心条件按 shared_constraint_v3 §7.2 使用最低阈值', () => {
    assert.strictEqual(meetsEntryPrerequisite(makeGame({ daoxin: 50 }), { type: 'daoxin', value: 50 }), true);
    assert.strictEqual(meetsEntryPrerequisite(makeGame({ daoxin: 49 }), { type: 'daoxin', value: 50 }), false);
  });

  test('max_daoxin 支持低道心灵异入口', () => {
    assert.strictEqual(meetsEntryPrerequisite(makeGame({ daoxin: 30 }), { type: 'max_daoxin', value: 30 }), true);
    assert.strictEqual(meetsEntryPrerequisite(makeGame({ daoxin: 31 }), { type: 'max_daoxin', value: 30 }), false);
  });

  test('境界、技能、物品、任务、时辰和复合条件均可判定', () => {
    const game = makeGame({
      realm: 2,
      skills: { lightfoot: { level: 55 } },
      inventory: [{ id: 'mirror_key', count: 1 }],
      completedQuests: ['quest_mirror'],
      gameTime: 0
    });
    const rule = { type: 'composite', and: [
      { type: 'realm', value: '筑基' },
      { type: 'skill', skill: 'lightfoot', value: 50 },
      { type: 'item', id: 'mirror_key' },
      { type: 'quest', id: 'quest_mirror' },
      { type: 'time', value: '子时' }
    ] };
    assert.strictEqual(meetsEntryPrerequisite(game, rule), true);
  });

  test('未满足条件的隐藏房间不会出现在感知结果中', () => {
    const game = makeGame({ daoxin: 20 });
    game.LOCATIONS = { 密室: { prereq: { type: 'daoxin', value: 50 }, hiddenUntilEligible: true, fail_msg: '看不见。' } };
    assert.deepStrictEqual(getEntryAccess(game, '密室'), {
      visible: false, allowed: false, message: '看不见。', successMessage: ''
    });
  });

  const rooms = loadRooms();
  test('斗转茶舍副本按大堂和二楼分层且可退出', () => {
    assert.ok(rooms['斗转茶舍·大堂']);
    assert.strictEqual(rooms['斗转茶舍·大堂'].connections['二楼'], '斗转茶舍·二楼');
    assert.strictEqual(rooms['斗转茶舍·二楼'].connections['下'], '斗转茶舍·大堂');
    assert.ok(Object.keys(rooms['斗转茶舍·二楼'].connections).length > 0);
  });

  test('西大街商铺入口使用实际房间 ID', () => {
    const conns = rooms['应天府·西大街'].connections;
    assert.strictEqual(conns['铁铺'], '应天府·神兵铁匠铺');
    assert.strictEqual(conns['当铺'], '应天府·聚宝当铺');
    assert.strictEqual(conns['钱庄'], '应天府·四海钱庄');
  });

  test('聚宝门四个入口均未被对象重复键覆盖', () => {
    const conns = rooms['应天府·聚宝门'].connections;
    for (const key of ['长干里', '雨花台', '码头', '暗格']) assert.ok(conns[key], '缺少入口: ' + key);
  });

  test('扁平化子房间保留进入条件与反馈文案', () => {
    const room = rooms['悦来客栈·地下酒窖'];
    assert.ok(room.prereq);
    assert.ok(room.fail_msg);
    assert.ok(room.success_msg);
    assert.strictEqual(room.hiddenUntilEligible, true);
  });

  console.log('━'.repeat(50));
  console.log(`房间入口条件测试结果: ${passed} 通过, ${failed} 失败`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
