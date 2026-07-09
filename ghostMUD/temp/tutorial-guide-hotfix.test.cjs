const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'public', 'data', 'wenjianfeng_tutorial_ch1.js'), 'utf8');
const sandbox = { window: {}, console, module: { exports: {} } };
sandbox.window.__DATA_REGISTRY = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const tutorial = sandbox.window.WENJIANFENG_TUTORIAL_CH1 || sandbox.module.exports;

function makeGame() {
  const logs = [];
  return {
    state: { location: '', explored: [] },
    logs,
    addLog(text, type) { logs.push({ text: String(text), type }); },
    renderer: { updateUI() {} },
    getDesc(enc) { return enc.desc || enc.title || ''; }
  };
}

console.log('\nTutorial guide hotfix test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

assert.strictEqual(typeof tutorial.getGuideEncounter, 'function', 'guide encounter API missing');

const game = makeGame();
tutorial.start(game);
assert.strictEqual(game.state.location, '问剑峰·山门');
assert.strictEqual(game.state.guideCompanion, 'wenjianfeng_suxiaotang');
assert.ok(game.state.explored.includes('问剑峰·山门'), 'first tutorial room should be explored');
assert.ok(!game.logs.some(l => l.type === 'scene' || l.type === 'dialogue'), 'tutorial start must not dump full台本 to scene feed');

const guide = tutorial.getGuideEncounter(game, '问剑峰·山门');
assert.ok(guide, '苏小棠 guide should exist at 山门');
assert.strictEqual(guide.title, '苏小棠');
assert.strictEqual(guide.canSpar, false);
assert.ok(Array.isArray(guide.dialogueLines) && guide.dialogueLines.length > 0, 'guide dialogue lines missing');

tutorial.enterScene(game, tutorial.tourRoute.length - 1);
assert.strictEqual(game.state.location, '问剑峰·弟子房');
assert.strictEqual(game.state.tutorialPhase, 'ch1_free');
assert.strictEqual(game.state.guideCompanion, null);
assert.ok(game.logs.some(l => l.text.includes('走累了')), 'guide leaving line missing');
assert.strictEqual(tutorial.getGuideEncounter(game, '问剑峰·弟子房'), null, 'guide should leave after tour');

console.log('  ✓ 苏小棠 appears as a guide NPC and leaves after tour');
console.log('  ✓ tutorial no longer writes full NPC台本 into scene feed');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
