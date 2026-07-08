const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const manifestCode = fs.readFileSync(path.join(ROOT, 'src', 'data', 'manifest.js'), 'utf8');
const manifestFiles = [...manifestCode.matchAll(/file:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

function loadAllData() {
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.__DATA_REGISTRY = {};
  sandbox.console = { log() {}, warn() {}, error: console.error };
  for (const file of manifestFiles) {
    const full = path.join(DATA_DIR, file);
    vm.runInNewContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: file });
  }
  return sandbox.__DATA_REGISTRY;
}

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

console.log('\nNPC dialogue schema test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const REG = loadAllData();
const dialogueData = REG.WENJIANFENG_NPC_DIALOGUES;
const entries = dialogueData && dialogueData.entries;

function textLen(value) {
  return Array.from(String(value || '')).length;
}

function assertLines(lines, pathLabel) {
  assert.ok(Array.isArray(lines) && lines.length > 0, pathLabel + ' must have non-empty lines');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    assert.ok(line && typeof line === 'object', pathLabel + '.lines[' + i + '] must be object');
    assert.ok(typeof line.speaker === 'string' && line.speaker.trim(), pathLabel + '.lines[' + i + '] missing speaker');
    assert.ok(typeof line.text === 'string' && line.text.trim(), pathLabel + '.lines[' + i + '] missing text');
    assert.ok(textLen(line.text) <= 120, pathLabel + '.lines[' + i + '] too long for mobile dialogue');
  }
}

function assertRelationship(choice, pathLabel) {
  const rel = choice.relationship || choice.npcMemory || choice.memory || choice.relation;
  if (!rel) return;
  assert.ok(typeof rel === 'object' && !Array.isArray(rel), pathLabel + ' relationship must be object');
  if ('affinity' in rel) assert.ok(typeof rel.affinity === 'number', pathLabel + ' relationship.affinity must be number');
  if ('affinityDelta' in rel) assert.ok(typeof rel.affinityDelta === 'number', pathLabel + ' relationship.affinityDelta must be number');
  if ('flags' in rel) assert.ok(Array.isArray(rel.flags) || typeof rel.flags === 'object' || typeof rel.flags === 'string', pathLabel + ' relationship.flags invalid');
  if ('note' in rel) assert.ok(typeof rel.note === 'string' && rel.note.length <= 40, pathLabel + ' relationship.note invalid');
}

function assertChoices(choices, pathLabel) {
  assert.ok(Array.isArray(choices), pathLabel + ' choices must be array');
  assert.ok(choices.length > 0 && choices.length <= 3, pathLabel + ' choices must be 1..3');
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    assert.ok(typeof choice.choice === 'string' && choice.choice.trim(), pathLabel + '.choices[' + i + '] missing choice');
    assert.ok(textLen(choice.choice) <= 36, pathLabel + '.choices[' + i + '] choice too long');
    assert.ok(typeof choice.log === 'string' && choice.log.trim(), pathLabel + '.choices[' + i + '] missing log');
    assertLines(choice.nextLines || choice.followupLines || choice.lines || choice.script, pathLabel + '.choices[' + i + ']');
    assertRelationship(choice, pathLabel + '.choices[' + i + ']');
  }
}

function collectVisibleText(entry) {
  const out = [];
  const collectNode = (node) => {
    for (const line of node.lines || node.dialogueLines || []) out.push(line.text);
    for (const item of node.choices || node.dialogueChoices || []) {
      out.push(item.choice || '');
      out.push(item.log || '');
      for (const line of item.nextLines || item.followupLines || item.lines || []) out.push(line.text);
    }
  };
  collectNode(entry);
  for (const variant of entry.variants || entry.dialogueVariants || []) collectNode(variant);
  return out.join('\n');
}

test('dialogue data file is registered', () => {
  assert.ok(dialogueData, 'WENJIANFENG_NPC_DIALOGUES not registered');
  assert.strictEqual(dialogueData.version, 'v1.5');
  assert.ok(Array.isArray(entries), 'entries must be array');
  assert.ok(entries.length >= 8, 'expected at least 8 curated Wenjianfeng NPC entries');
});

test('dialogue source follows V1.3 split', () => {
  const roomSource = fs.readFileSync(path.join(DATA_DIR, 'rebuild_rooms_wenjianfeng.js'), 'utf8');
  assert.ok(!roomSource.includes('V1.2 WENJIANFENG NPC DIALOGUE LINES'), 'old V1.2 room overlay remains');
  assert.ok(!/^\s*dialogue:\s*/m.test(roomSource), 'room file still contains NPC dialogue fields');
  assert.ok(fs.existsSync(path.join(DATA_DIR, 'wenjianfeng_npc_dialogues.js')), 'dialogue file missing');
});

test('curated entries obey dialogue schema', () => {
  const allowedTiers = new Set(['normal', 'story', 'uncanny']);
  for (const entry of entries) {
    const label = entry.room + '/' + (entry.id || entry.npcId || entry.ensure?.id);
    assert.ok(typeof entry.room === 'string' && entry.room.trim(), label + ' missing room');
    assert.ok(entry.id || entry.npcId || entry.ensure?.id, label + ' missing npc id');
    const tier = entry.dialogueTier || entry.storyTier || entry.tier || 'normal';
    assert.ok(allowedTiers.has(tier), label + ' has invalid tier ' + tier);
    assertLines(entry.dialogueLines || entry.lines || entry.script, label);
    assertChoices(entry.dialogueChoices || entry.choices || [], label);
  }
});

test('tutorial phase variants obey dialogue schema', () => {
  const variantEntries = entries.filter(entry => Array.isArray(entry.variants) && entry.variants.length > 0);
  assert.ok(variantEntries.length >= 4, 'expected tutorial variants on several key NPCs');
  const phases = new Set();
  for (const entry of variantEntries) {
    for (const variant of entry.variants) {
      const label = (entry.id || entry.ensure?.id) + '/' + (variant.id || 'variant');
      assert.ok(variant.id, label + ' missing id');
      assert.ok(variant.when && typeof variant.when === 'object', label + ' missing when');
      if (variant.when.tutorialPhase) phases.add(variant.when.tutorialPhase);
      assertLines(variant.dialogueLines || variant.lines || variant.script, label);
      assertChoices(variant.dialogueChoices || variant.choices || [], label);
    }
  }
  assert.ok(phases.has('ch1_tour'), 'missing ch1_tour variant');
  assert.ok(phases.has('ch1_free'), 'missing ch1_free variant');
  assert.ok(phases.has('ch1_done'), 'missing ch1_done variant');
});

test('relationship memory metadata is present on key NPC choices', () => {
  const keyed = entries.filter(entry => ['wenjianfeng_suxiaotang', 'wenjianfeng_zhixing', 'wenjianfeng_laocai'].includes(entry.id));
  assert.ok(keyed.length >= 3, 'expected key NPC dialogue entries');
  for (const entry of keyed) {
    const choices = [];
    choices.push(...(entry.choices || entry.dialogueChoices || []));
    for (const variant of entry.variants || []) choices.push(...(variant.choices || variant.dialogueChoices || []));
    assert.ok(choices.some(choice => choice.relationship || choice.npcMemory || choice.memory || choice.relation), entry.id + ' missing relationship metadata');
  }
});

test('curated dialogue avoids modern mechanism terms', () => {
  const banned = ['WebGL', 'Three.js', 'UI', 'JSON', 'schema', 'commit', 'transaction', '客户端', '服务器', '数据库', '接口', 'bug'];
  const offenders = [];
  for (const entry of entries) {
    const visible = collectVisibleText(entry);
    for (const token of banned) {
      if (visible.includes(token)) offenders.push((entry.id || entry.npcId || entry.ensure?.id) + ': ' + token);
    }
  }
  assert.strictEqual(offenders.length, 0, offenders.join(', '));
});

test('curated entries resolve into NPC_ENCOUNTERS', () => {
  const encounters = REG.NPC_ENCOUNTERS;
  assert.ok(encounters, 'NPC_ENCOUNTERS missing');
  for (const entry of entries) {
    const pool = encounters[entry.room];
    assert.ok(Array.isArray(pool), entry.room + ' encounter pool missing');
    const id = entry.id || entry.npcId || entry.ensure?.id;
    const enc = pool.find(item => item && item.id === id);
    assert.ok(enc, entry.room + '/' + id + ' encounter missing');
    assert.ok(Array.isArray(enc.dialogueLines) && enc.dialogueLines.length > 0, id + ' missing runtime dialogueLines');
    assert.ok(Array.isArray(enc.results) && enc.results.length > 0, id + ' missing runtime choices');
    assert.ok(enc.results.some(r => Array.isArray(r.nextLines) && r.nextLines.length > 0), id + ' missing runtime choice followup');
    if (Array.isArray(entry.variants) && entry.variants.length > 0) {
      assert.ok(Array.isArray(enc.dialogueVariants) && enc.dialogueVariants.length === entry.variants.length, id + ' missing runtime variants');
    }
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('NPC dialogue schema result: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f.name + ': ' + f.error);
}

process.exit(failed > 0 ? 1 : 0);
