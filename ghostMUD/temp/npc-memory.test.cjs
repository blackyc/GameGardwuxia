const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log('  ✗ ' + name);
    console.log('    → ' + e.message);
  }
}

(async () => {
  console.log('\nNPC memory test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const root = path.join(__dirname, '..');
  const mod = await import(pathToFileURL(path.join(root, 'src', 'npc_memory.js')).href);

  test('noteNpcSeen creates persistent NPC memory', () => {
    const state = { location: '问剑峰·山门', npcMemory: {} };
    const enc = { id: 'wenjianfeng_suxiaotang', title: '苏小棠' };
    const memory = mod.noteNpcSeen(state, enc, { room: state.location, gameTime: 3 });
    assert.strictEqual(memory.key, 'wenjianfeng_suxiaotang');
    assert.strictEqual(memory.name, '苏小棠');
    assert.strictEqual(memory.meetings, 1);
    assert.strictEqual(state.npcMemory.wenjianfeng_suxiaotang.lastSeenRoom, '问剑峰·山门');
  });

  test('applyNpcChoiceMemory records choice, affinity, flags and notes', () => {
    const state = { location: '问剑峰·剑坪', npcMemory: {} };
    const enc = { memoryKey: 'wenjianfeng_suxiaotang', title: '苏小棠' };
    mod.noteNpcSeen(state, enc);
    const update = mod.applyNpcChoiceMemory(state, enc, {
      choice: '请她慢些走',
      relationship: { affinity: 2, flags: ['asked_slow'], note: '苏小棠记得你跟不上山路。' }
    }, { room: state.location, gameTime: 5 });
    assert.strictEqual(update.memory.interactions, 1);
    assert.strictEqual(update.memory.affinity, 2);
    assert.strictEqual(update.memory.flags.asked_slow, true);
    assert.strictEqual(update.memory.lastChoice, '请她慢些走');
    assert.strictEqual(update.label, '眼熟');
  });

  test('describeNpcRelation covers positive and negative relation bands', () => {
    assert.strictEqual(mod.describeNpcRelation({ meetings: 1, affinity: 0 }), '见过');
    assert.strictEqual(mod.describeNpcRelation({ meetings: 1, affinity: 4 }), '相熟');
    assert.strictEqual(mod.describeNpcRelation({ meetings: 1, affinity: -6 }), '有嫌隙');
    assert.strictEqual(mod.describeNpcRelation({ meetings: 0, affinity: 8 }), '');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('NPC memory result: ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log('  - ' + f.name + ': ' + f.error);
  }
  process.exit(failed > 0 ? 1 : 0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
