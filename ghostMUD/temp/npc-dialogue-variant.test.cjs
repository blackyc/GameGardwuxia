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
  console.log('\nNPC dialogue variant runtime test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const root = path.join(__dirname, '..');
  const mod = await import(pathToFileURL(path.join(root, 'src', 'npc_service.js')).href);
  const service = new mod.NpcService({
    state: { tutorialPhase: 'ch1_free' },
    getDesc: () => 'fallback desc'
  });
  const enc = {
    title: '苏小棠',
    dialogueLines: [{ speaker: '苏小棠', text: '默认台本。' }],
    results: [{ choice: '默认选择', log: '默认日志', nextLines: [{ speaker: '苏小棠', text: '默认后续。' }] }],
    dialogueVariants: [
      {
        id: 'tour',
        when: { tutorialPhase: 'ch1_tour' },
        lines: [{ speaker: '苏小棠', text: '带路中。' }],
        choices: [{ choice: '跟上', log: '你跟上。', nextLines: [{ speaker: '苏小棠', text: '快些。' }] }]
      },
      {
        id: 'free',
        when: { tutorialPhase: 'ch1_free' },
        lines: [{ speaker: '苏小棠', text: '自由活动。' }],
        choices: [{ choice: '问路', log: '你问路。', nextLines: [{ speaker: '苏小棠', text: '剑坪在中间。' }] }]
      }
    ]
  };

  test('selects variant by tutorialPhase', () => {
    service.dialogueVariant = service._selectDialogueVariant(enc);
    assert.strictEqual(service.dialogueVariant.id, 'free');
    assert.strictEqual(service._openingLines(enc)[0].text, '自由活动。');
    assert.strictEqual(service._dialogueResults(enc)[0].choice, '问路');
  });

  test('falls back to base dialogue when no variant matches', () => {
    service.game.state.tutorialPhase = 'unknown_phase';
    service.dialogueVariant = service._selectDialogueVariant(enc);
    assert.strictEqual(service.dialogueVariant, null);
    assert.strictEqual(service._openingLines(enc)[0].text, '默认台本。');
    assert.strictEqual(service._dialogueResults(enc)[0].choice, '默认选择');
  });

  test('supports array and object when clauses', () => {
    const variant = {
      when: {
        tutorialPhase: ['ch1_free', 'ch1_done'],
        gotToken: { exists: false },
        blockedPhase: { not: 'x' }
      }
    };
    service.game.state.tutorialPhase = 'ch1_done';
    delete service.game.state.gotToken;
    service.game.state.blockedPhase = 'y';
    assert.strictEqual(service._matchesDialogueWhen(variant.when), true);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('NPC dialogue variant result: ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log('  - ' + f.name + ': ' + f.error);
  }
  process.exit(failed > 0 ? 1 : 0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
