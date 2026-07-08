const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.argv[2] || 'D:\\git\\GameGardwuxia\\ghostMUD';
const p = {
  packageJson: path.join(root, 'package.json'),
  dialogue: path.join(root, 'public', 'data', 'wenjianfeng_npc_dialogues.js'),
  integration: path.join(root, 'public', 'data', 'integration_v2.js'),
  game: path.join(root, 'src', 'game.js'),
  npcService: path.join(root, 'src', 'npc_service.js'),
  npcMemory: path.join(root, 'src', 'npc_memory.js'),
  perception: path.join(root, 'src', 'perception_service.js'),
  renderer: path.join(root, 'src', 'ui', 'renderer.js'),
  saveSchema: path.join(root, 'src', 'core', 'save_schema.js'),
  jianghuCss: path.join(root, 'src', 'styles', 'jianghu.css'),
  saveTest: path.join(root, 'temp', 'save-schema.test.cjs'),
  dialogueSchemaTest: path.join(root, 'temp', 'npc-dialogue-schema.test.cjs'),
  npcMemoryTest: path.join(root, 'temp', 'npc-memory.test.cjs'),
  uiContractTest: path.join(root, 'temp', 'ui-contract.test.cjs'),
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, text) {
  const old = fs.existsSync(file) ? read(file) : null;
  if (old === text) {
    console.log('[skip]', path.relative(root, file));
    return;
  }
  fs.writeFileSync(file, text, 'utf8');
  console.log('[write]', path.relative(root, file));
}

function mustReplace(text, needle, replacement, label) {
  // Try exact match first, then CRLF→LF normalized match
  if (text.includes(needle)) return text.replace(needle, replacement);
  const lfText = text.replace(/\r\n/g, '\n');
  const lfNeedle = needle.replace(/\r\n/g, '\n');
  if (lfText.includes(lfNeedle)) {
    // Find position in normalized text, then map back to original
    const normIdx = lfText.indexOf(lfNeedle);
    // Rebuild: original before + replacement (with LF) + original after
    // Convert replacement to use \r\n to match file convention
    const crlfReplacement = replacement.replace(/\n/g, '\r\n');
    // Find the corresponding range in original text
    let origStart = 0;
    let normPos = 0;
    while (normPos < normIdx) {
      if (text[origStart] === '\r' && text[origStart + 1] === '\n') {
        normPos += 1; // \r\n counts as one in normalized
        origStart += 2;
      } else {
        normPos += 1;
        origStart += 1;
      }
    }
    let origEnd = origStart;
    let normEndPos = normIdx + lfNeedle.length;
    while (normPos < normEndPos) {
      if (text[origEnd] === '\r' && text[origEnd + 1] === '\n') {
        normPos += 1;
        origEnd += 2;
      } else {
        normPos += 1;
        origEnd += 1;
      }
    }
    return text.slice(0, origStart) + crlfReplacement + text.slice(origEnd);
  }
  throw new Error('Missing anchor: ' + label);
}

function mustReplaceRegex(text, regex, replacement, label) {
  if (!regex.test(text)) throw new Error('Missing regex anchor: ' + label);
  return text.replace(regex, replacement);
}

function loadDialogueData() {
  const sandbox = { console, module: { exports: {} } };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.__DATA_REGISTRY = {};
  vm.runInNewContext(read(p.dialogue), sandbox, { filename: 'wenjianfeng_npc_dialogues.js' });
  return sandbox.WENJIANFENG_NPC_DIALOGUES || sandbox.module.exports;
}

function writeDialogueData(data) {
  const text = `// Wenjianfeng curated NPC dialogue data.
// V1.5 adds NPC relationship memory effects:
// - choices may carry relationship/npcMemory metadata.
// - visible prose follows aidoc/archive_20260707/docs/narrative_writing_rules.md.

var WENJIANFENG_NPC_DIALOGUES = ${JSON.stringify(data, null, 2)};

if (typeof window !== 'undefined') window.WENJIANFENG_NPC_DIALOGUES = WENJIANFENG_NPC_DIALOGUES;
if (typeof module !== 'undefined') module.exports = WENJIANFENG_NPC_DIALOGUES;

window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof WENJIANFENG_NPC_DIALOGUES !== 'undefined') window.__DATA_REGISTRY['WENJIANFENG_NPC_DIALOGUES'] = WENJIANFENG_NPC_DIALOGUES; } catch(e) { console.warn('[Registry] WENJIANFENG_NPC_DIALOGUES not registered:', e.message); }
`;
  writeIfChanged(p.dialogue, text);
}

function addRelationshipMemoryToDialogueData() {
  const data = loadDialogueData();
  data.schemaVersion = 2;
  data.version = 'v1.5';
  data.variantRule = 'First matching variants[].when wins; base lines/choices remain fallback.';
  data.memoryRule = 'Choices may carry relationship metadata; runtime stores it in state.npcMemory.';

  const profiles = {
    wenjianfeng_suxiaotang: { affinity: 1, flags: ['suxiaotang_guided'], note: '苏小棠记得你认真听她说路。' },
    wenjianfeng_zhixing: { affinity: 0, flags: ['shanmen_greeted'], note: '值星弟子记得你守过山门规矩。' },
    wenjianfeng_laocai: { affinity: 1, flags: ['laocai_spoke'], note: '老蔡记得你肯听他念叨饭菜。' },
    wenjianfeng_laoyu: { affinity: 0, flags: ['laoyu_spoke'], note: '盲眼老妪记下你问过池底断剑。' },
    wenjianfeng_laoshu: { affinity: 1, flags: ['laoshu_spoke'], note: '老舒记得你问过剑鞘竹丝。' },
    wenjianfeng_jianweng: { affinity: 0, flags: ['jianweng_seen'], note: '残剑翁记下你来过剑冢。' },
  };

  function applyToNode(node, profile) {
    const choices = node && (node.choices || node.dialogueChoices);
    if (!Array.isArray(choices)) return;
    choices.forEach((choice, index) => {
      if (!choice || choice.relationship || choice.npcMemory || choice.memory || choice.relation) return;
      choice.relationship = {
        affinity: profile.affinity,
        flags: profile.flags.concat('choice_' + index),
        note: profile.note
      };
    });
  }

  for (const entry of data.entries || []) {
    if (!entry || !entry.id) continue;
    entry.memoryKey = entry.memoryKey || entry.id;
    const profile = profiles[entry.id];
    if (!profile) continue;
    applyToNode(entry, profile);
    for (const variant of entry.variants || entry.dialogueVariants || []) applyToNode(variant, profile);
  }

  writeDialogueData(data);
}

function writeNpcMemoryModule() {
  const text = `const MIN_AFFINITY = -20;
const MAX_AFFINITY = 20;

function clampAffinity(value) {
  const n = Number(value || 0);
  return Math.max(MIN_AFFINITY, Math.min(MAX_AFFINITY, n));
}

function cloneFlags(flags) {
  return flags && typeof flags === 'object' && !Array.isArray(flags) ? { ...flags } : {};
}

function normalizeKey(value) {
  return String(value || '').trim();
}

export function npcMemoryKey(encOrKey) {
  if (typeof encOrKey === 'string') return normalizeKey(encOrKey);
  const enc = encOrKey || {};
  return normalizeKey(enc.memoryKey || enc.npcMemoryKey || enc.npcId || enc.id || enc.title || enc.name || '');
}

export function ensureNpcMemory(state, encOrKey) {
  if (!state) return null;
  if (!state.npcMemory || typeof state.npcMemory !== 'object' || Array.isArray(state.npcMemory)) {
    state.npcMemory = {};
  }
  const key = npcMemoryKey(encOrKey);
  if (!key) return null;
  const name = typeof encOrKey === 'string' ? key : (encOrKey?.title || encOrKey?.name || key);
  const old = state.npcMemory[key];
  if (!old || typeof old !== 'object' || Array.isArray(old)) {
    state.npcMemory[key] = {
      key,
      name,
      meetings: 0,
      interactions: 0,
      affinity: 0,
      flags: {},
      notes: []
    };
  } else {
    old.key = old.key || key;
    old.name = old.name || name;
    old.meetings = Number(old.meetings || 0);
    old.interactions = Number(old.interactions || 0);
    old.affinity = clampAffinity(old.affinity);
    old.flags = cloneFlags(old.flags);
    old.notes = Array.isArray(old.notes) ? old.notes.slice(-6) : [];
  }
  return state.npcMemory[key];
}

export function getNpcMemory(state, encOrKey) {
  const key = npcMemoryKey(encOrKey);
  if (!state || !state.npcMemory || !key) return null;
  const mem = state.npcMemory[key];
  return mem && typeof mem === 'object' && !Array.isArray(mem) ? mem : null;
}

export function describeNpcRelation(memory) {
  if (!memory || Number(memory.meetings || 0) <= 0) return '';
  const affinity = Number(memory.affinity || 0);
  if (affinity >= 8) return '亲近';
  if (affinity >= 4) return '相熟';
  if (affinity >= 1) return '眼熟';
  if (affinity <= -6) return '有嫌隙';
  if (affinity <= -2) return '不睦';
  return '见过';
}

export function noteNpcSeen(state, enc, context = {}) {
  const memory = ensureNpcMemory(state, enc);
  if (!memory) return null;
  memory.meetings = Number(memory.meetings || 0) + 1;
  memory.lastSeenRoom = context.room || state.location || memory.lastSeenRoom || '';
  if (context.gameTime !== undefined) memory.lastSeenTime = context.gameTime;
  return memory;
}

function addFlags(memory, flags) {
  if (!flags) return;
  if (typeof flags === 'string') {
    memory.flags[flags] = true;
    return;
  }
  if (Array.isArray(flags)) {
    flags.forEach(flag => {
      if (flag) memory.flags[String(flag)] = true;
    });
    return;
  }
  if (typeof flags === 'object') {
    Object.keys(flags).forEach(flag => {
      if (flag) memory.flags[String(flag)] = Boolean(flags[flag]);
    });
  }
}

function addNote(memory, note) {
  const text = String(note || '').trim();
  if (!text) return;
  memory.notes = Array.isArray(memory.notes) ? memory.notes : [];
  memory.notes.push(text);
  memory.notes = memory.notes.slice(-6);
}

function applyMemorySpec(memory, spec) {
  let changed = false;
  if (spec == null) return changed;
  if (Array.isArray(spec)) {
    spec.forEach(item => {
      if (applyMemorySpec(memory, item)) changed = true;
    });
    return changed;
  }
  if (typeof spec === 'number') {
    memory.affinity = clampAffinity(Number(memory.affinity || 0) + spec);
    return true;
  }
  if (typeof spec !== 'object') return changed;
  const beforeAffinity = Number(memory.affinity || 0);
  const delta = Number(spec.affinityDelta ?? spec.affinity ?? 0);
  if (delta) {
    memory.affinity = clampAffinity(beforeAffinity + delta);
    changed = true;
  }
  if (spec.setAffinity !== undefined) {
    memory.affinity = clampAffinity(spec.setAffinity);
    changed = true;
  }
  const beforeFlags = JSON.stringify(memory.flags || {});
  addFlags(memory, spec.flags || spec.flag);
  if (JSON.stringify(memory.flags || {}) !== beforeFlags) changed = true;
  const beforeNotes = Array.isArray(memory.notes) ? memory.notes.length : 0;
  addNote(memory, spec.note || spec.memo);
  if ((memory.notes || []).length !== beforeNotes) changed = true;
  return changed;
}

export function applyNpcChoiceMemory(state, enc, result, context = {}) {
  const memory = ensureNpcMemory(state, enc);
  if (!memory) return { memory: null, changed: false, label: '' };
  memory.interactions = Number(memory.interactions || 0) + 1;
  memory.lastChoice = String(result?.choice || '');
  memory.lastRoom = context.room || state.location || memory.lastRoom || '';
  if (context.gameTime !== undefined) memory.lastTime = context.gameTime;

  const spec = result?.relationship ?? result?.npcMemory ?? result?.memory ?? result?.relation;
  const changed = applyMemorySpec(memory, spec) || true;
  return { memory, changed, label: describeNpcRelation(memory) };
}
`;
  writeIfChanged(p.npcMemory, text);
}

function patchSaveSchema() {
  let s = read(p.saveSchema);
  if (!s.includes('npcMemory:')) {
    s = mustReplace(s,
      "  questStages:        { type: 'object',  default: {},          nullable: false },",
      "  questStages:        { type: 'object',  default: {},          nullable: false },\n  npcMemory:          { type: 'object',  default: {},          nullable: false },",
      'SAVE_SCHEMA questStages');
  }
  writeIfChanged(p.saveSchema, s);
}

function patchGame() {
  let s = read(p.game);
  if (!s.includes("from './npc_memory.js'")) {
    s = mustReplace(s,
      "import audio from './audio/AudioManager.js';",
      "import audio from './audio/AudioManager.js';\nimport { getNpcMemory, describeNpcRelation } from './npc_memory.js';",
      'game imports');
  }
  if (!s.includes('npcMemory: {},')) {
    s = mustReplace(s,
      "      questStages: {},",
      "      questStages: {},\n      npcMemory: {},",
      'initial npcMemory');
  }
  if (!s.includes('getNpcMemory(encOrKey)')) {
    s = mustReplace(s,
      "  closeNPC() { return this.npc.closeNPC(); }\n",
      "  closeNPC() { return this.npc.closeNPC(); }\n  getNpcMemory(encOrKey) { return getNpcMemory(this.state, encOrKey); }\n  describeNpcRelation(encOrKey) { return describeNpcRelation(this.getNpcMemory(encOrKey)); }\n",
      'NPC proxy methods');
  }
  writeIfChanged(p.game, s);
}

function patchNpcService() {
  let s = read(p.npcService);
  if (!s.includes("from './npc_memory.js'")) {
    s = "import { noteNpcSeen, applyNpcChoiceMemory } from './npc_memory.js';\n\n" + s;
  }
  if (!s.includes('noteNpcSeen(g.state, enc')) {
    s = mustReplace(s,
      "    g.state.npcEncounter = enc;",
      "    g.state.npcEncounter = enc;\n    noteNpcSeen(g.state, enc, { room: g.state.location, gameTime: g.state.gameTime });",
      'note npc seen');
  }
  if (!s.includes('applyNpcChoiceMemory(s, enc, result')) {
    s = mustReplace(s,
      "    const s = g.state;\n    const title = this._title(enc);",
      "    const s = g.state;\n    applyNpcChoiceMemory(s, enc, result, { room: s.location, gameTime: s.gameTime });\n    const title = this._title(enc);",
      'apply npc memory');
  }
  writeIfChanged(p.npcService, s);
}

function patchIntegration() {
  let s = read(p.integration);
  if (!s.includes('npc.memoryKey = entry.memoryKey')) {
    s = mustReplace(s,
      "      npc.dialogueChoices = entry.dialogueChoices || entry.choices || npc.dialogueChoices || [];\n      npc.dialogueVariants = entry.dialogueVariants || entry.variants || npc.dialogueVariants || [];",
      "      npc.dialogueChoices = entry.dialogueChoices || entry.choices || npc.dialogueChoices || [];\n      npc.dialogueVariants = entry.dialogueVariants || entry.variants || npc.dialogueVariants || [];\n      npc.memoryKey = entry.memoryKey || entry.npcMemoryKey || entry.id || npc.memoryKey || npc.id || npc.name;",
      'apply npc memory key');
  }
  if (!s.includes('if (r.relationship) normalized.relationship = r.relationship;')) {
    s = mustReplace(s,
      "      if (r.failReward) normalized.failReward = r.failReward;\n      return normalized;",
      "      if (r.failReward) normalized.failReward = r.failReward;\n      if (r.relationship) normalized.relationship = r.relationship;\n      if (r.npcMemory) normalized.npcMemory = r.npcMemory;\n      if (r.memory) normalized.memory = r.memory;\n      if (r.relation) normalized.relation = r.relation;\n      return normalized;",
      'normalize relationship fields');
  }
  if (!s.includes('memoryKey: npc.memoryKey')) {
    s = mustReplace(s,
      "          title: npcName,\n          desc: npc.desc || '',",
      "          title: npcName,\n          memoryKey: npc.memoryKey || npc.id || npcName,\n          desc: npc.desc || '',",
      'encounter memory key');
  }
  writeIfChanged(p.integration, s);
}

function patchPerception() {
  let s = read(p.perception);
  if (!s.includes('relationLabel: g.describeNpcRelation ? g.describeNpcRelation(enc) :')) {
    s = mustReplace(s,
      "        if (enc.title) npcs.push({ name: enc.title, desc: g.getDesc(enc), type: 'encounter', index: i, dialogueTier: this._npcDialogueTier(enc) });",
      "        if (enc.title) npcs.push({\n          name: enc.title,\n          desc: g.getDesc(enc),\n          type: 'encounter',\n          index: i,\n          memoryKey: enc.memoryKey || enc.id || enc.title,\n          relationLabel: g.describeNpcRelation ? g.describeNpcRelation(enc) : '',\n          dialogueTier: this._npcDialogueTier(enc)\n        });",
      'perception encounter npc');
  }
  if (!s.includes('relationLabel: g.describeNpcRelation ? g.describeNpcRelation(enc) :')) {
    throw new Error('Perception relationship patch did not apply');
  }
  writeIfChanged(p.perception, s);
}

function patchRenderer() {
  let s = read(p.renderer);
  if (!s.includes('const relationLine = focused.relationLabel')) {
    s = mustReplace(s,
      "          const idx = Number(focused.index);\n          const type = focused.type || 'encounter';\n          dossier = '<section class=\"npc-dossier\" id=\"npc-dossier\">'",
      "          const idx = Number(focused.index);\n          const type = focused.type || 'encounter';\n          const relationLine = focused.relationLabel ? '<div class=\"npc-dossier-memory\">印象：' + this._esc(focused.relationLabel) + '</div>' : '';\n          dossier = '<section class=\"npc-dossier\" id=\"npc-dossier\">'",
      'renderer relation line var');
    s = mustReplace(s,
      "            + '<div class=\"npc-dossier-head\"><span class=\"npc-dossier-title\">' + this._esc(focused.name) + '</span>'\n            + '<button type=\"button\" class=\"npc-dossier-close\" data-action=\"closeNpcFocus\">",
      "            + '<div class=\"npc-dossier-head\"><span class=\"npc-dossier-title\">' + this._esc(focused.name) + '</span>'\n            + '<button type=\"button\" class=\"npc-dossier-close\" data-action=\"closeNpcFocus\">",
      'noop relation insertion anchor');
    s = mustReplace(s,
      "            + '<button type=\"button\" class=\"npc-dossier-close\" data-action=\"closeNpcFocus\">收起</button></div>'\n            + '<p class=\"npc-dossier-desc\">'",
      "            + '<button type=\"button\" class=\"npc-dossier-close\" data-action=\"closeNpcFocus\">收起</button></div>'\n            + relationLine\n            + '<p class=\"npc-dossier-desc\">'",
      'renderer relation line html');
  }
  writeIfChanged(p.renderer, s);
}

function patchCss() {
  let s = read(p.jianghuCss);
  if (!s.includes('.npc-dossier-memory')) {
    s += `

.npc-dossier-memory {
  margin: 0 0 7px;
  color: #775539;
  font: 700 12px/1.3 'STKaiti', 'KaiTi', serif;
  letter-spacing: 1px;
}
`;
  }
  writeIfChanged(p.jianghuCss, s);
}

function patchPackageJson() {
  const pkg = JSON.parse(read(p.packageJson));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['test:ui'] = pkg.scripts['test:ui'] || 'node temp/ui-contract.test.cjs';
  pkg.scripts['test:npc-memory'] = pkg.scripts['test:npc-memory'] || 'node temp/npc-memory.test.cjs';
  writeIfChanged(p.packageJson, JSON.stringify(pkg, null, 2) + '\n');
}

function patchSaveTest() {
  let s = read(p.saveTest);
  if (!s.includes("'npcMemory'")) {
    s = mustReplace(s,
      "    'activeQuests', 'completedQuests', 'questStages',",
      "    'activeQuests', 'completedQuests', 'questStages', 'npcMemory',",
      'save test required fields');
  }
  if (!s.includes('state.npcMemory = {')) {
    s = mustReplace(s,
      "  state.questStages = { q1: { stage: 2 }, q2: { stage: 1 } };",
      "  state.questStages = { q1: { stage: 2 }, q2: { stage: 1 } };\n  state.npcMemory = { wenjianfeng_suxiaotang: { meetings: 2, interactions: 1, affinity: 3, flags: { guided: true }, notes: ['带路'] } };",
      'save test set npcMemory');
  }
  if (!s.includes("jsonEqual(loaded.npcMemory")) {
    s = mustReplace(s,
      "  jsonEqual(loaded.questStages, { q1: { stage: 2 }, q2: { stage: 1 } }, 'questStages mismatch');",
      "  jsonEqual(loaded.questStages, { q1: { stage: 2 }, q2: { stage: 1 } }, 'questStages mismatch');\n  jsonEqual(loaded.npcMemory, { wenjianfeng_suxiaotang: { meetings: 2, interactions: 1, affinity: 3, flags: { guided: true }, notes: ['带路'] } }, 'npcMemory mismatch');",
      'save test assert npcMemory');
  }
  writeIfChanged(p.saveTest, s);
}

function patchDialogueSchemaTest() {
  let s = read(p.dialogueSchemaTest);
  s = s.replace("assert.strictEqual(dialogueData.version, 'v1.4');", "assert.strictEqual(dialogueData.version, 'v1.5');");
  if (!s.includes('function assertRelationship')) {
    s = mustReplace(s,
      "function assertChoices(choices, pathLabel) {",
      "function assertRelationship(choice, pathLabel) {\n  const rel = choice.relationship || choice.npcMemory || choice.memory || choice.relation;\n  if (!rel) return;\n  assert.ok(typeof rel === 'object' && !Array.isArray(rel), pathLabel + ' relationship must be object');\n  if ('affinity' in rel) assert.ok(typeof rel.affinity === 'number', pathLabel + ' relationship.affinity must be number');\n  if ('affinityDelta' in rel) assert.ok(typeof rel.affinityDelta === 'number', pathLabel + ' relationship.affinityDelta must be number');\n  if ('flags' in rel) assert.ok(Array.isArray(rel.flags) || typeof rel.flags === 'object' || typeof rel.flags === 'string', pathLabel + ' relationship.flags invalid');\n  if ('note' in rel) assert.ok(typeof rel.note === 'string' && rel.note.length <= 40, pathLabel + ' relationship.note invalid');\n}\n\nfunction assertChoices(choices, pathLabel) {",
      'relationship schema helper');
    s = mustReplace(s,
      "    assertLines(choice.nextLines || choice.followupLines || choice.lines || choice.script, pathLabel + '.choices[' + i + ']');",
      "    assertLines(choice.nextLines || choice.followupLines || choice.lines || choice.script, pathLabel + '.choices[' + i + ']');\n    assertRelationship(choice, pathLabel + '.choices[' + i + ']');",
      'relationship schema call');
  }
  if (!s.includes("test('relationship memory metadata")) {
    s = mustReplace(s,
      "test('curated dialogue avoids modern mechanism terms', () => {",
      "test('relationship memory metadata is present on key NPC choices', () => {\n  const keyed = entries.filter(entry => ['wenjianfeng_suxiaotang', 'wenjianfeng_zhixing', 'wenjianfeng_laocai'].includes(entry.id));\n  assert.ok(keyed.length >= 3, 'expected key NPC dialogue entries');\n  for (const entry of keyed) {\n    const choices = [];\n    choices.push(...(entry.choices || entry.dialogueChoices || []));\n    for (const variant of entry.variants || []) choices.push(...(variant.choices || variant.dialogueChoices || []));\n    assert.ok(choices.some(choice => choice.relationship || choice.npcMemory || choice.memory || choice.relation), entry.id + ' missing relationship metadata');\n  }\n});\n\ntest('curated dialogue avoids modern mechanism terms', () => {",
      'relationship metadata test');
  }
  writeIfChanged(p.dialogueSchemaTest, s);
}

function writeNpcMemoryTest() {
  const text = `const assert = require('assert');
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
  console.log('\\nNPC memory test');
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
    console.log('\\nFailures:');
    for (const f of failures) console.log('  - ' + f.name + ': ' + f.error);
  }
  process.exit(failed > 0 ? 1 : 0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
`;
  writeIfChanged(p.npcMemoryTest, text);
}

function writeUiContractTest() {
  const text = `const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const jianghuCss = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'jianghu.css'), 'utf8');
const renderer = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'renderer.js'), 'utf8');

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

function pos(token) {
  const index = html.indexOf(token);
  assert.ok(index >= 0, 'missing HTML token: ' + token);
  return index;
}

function assertCss(regex, label) {
  assert.ok(regex.test(jianghuCss), 'missing CSS contract: ' + label);
}

console.log('\\nUI contract test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

test('jianghu page keeps the three fixed visual zones in order', () => {
  const z1 = pos('class="location-banner"');
  const z2 = pos('class="jianghu-main-zone"');
  const z3 = pos('class="recent-log"');
  assert.ok(z1 < z2 && z2 < z3, 'zones must be banner -> main -> log');
  assert.ok(pos('id="location-name"') < z2, 'room name must stay in zone 1');
  assert.ok(pos('id="location-desc"') > z2 && pos('id="location-desc"') < z3, 'scene prose must stay in zone 2');
  assert.ok(pos('id="room-npcs"') > z2 && pos('id="room-npcs"') < z3, 'NPC cards must stay in zone 2');
  assert.ok(pos('id="log-area"') > z3, 'recent log must stay in zone 3');
});

test('jianghu CSS preserves mobile background segmentation contract', () => {
  assertCss(/body\\[data-page="jianghu"\\]\\s+#scene-bg[\\s\\S]*background-image:\\s*url\\('\\/ui\\/jianghu-mobile-bg\\.jpg'\\)/, 'scene background image');
  assertCss(/\\.location-banner\\s*\\{[\\s\\S]*position:\\s*absolute[\\s\\S]*top:\\s*18px/, 'zone 1 absolute banner');
  assertCss(/\\.jianghu-main-zone\\s*\\{[\\s\\S]*top:\\s*12\\.5dvh[\\s\\S]*height:\\s*60\\.5dvh/, 'zone 2 main proportions');
  assertCss(/\\.page\\[data-page="jianghu"\\]\\s+\\.recent-log\\s*\\{[\\s\\S]*top:\\s*73dvh/, 'zone 3 log anchor');
});

test('NPC cards expose only names until focused', () => {
  const buttonsStart = renderer.indexOf('const buttons = list.map');
  const dossierStart = renderer.indexOf(\"let dossier = ''\", buttonsStart);
  assert.ok(buttonsStart >= 0 && dossierStart > buttonsStart, 'NPC button renderer block missing');
  const buttonBlock = renderer.slice(buttonsStart, dossierStart);
  assert.ok(buttonBlock.includes('room-npc-card'), 'NPC buttons missing room-npc-card');
  assert.ok(!buttonBlock.includes('focused.desc'), 'NPC card button must not render focused description');
  assert.ok(renderer.includes('npc-dossier-desc'), 'focused dossier description missing');
  assert.ok(renderer.includes('npc-dossier-memory'), 'focused dossier memory line missing');
});

test('ink dialogue layer keeps history and choices inside one shell', () => {
  ['id="npc-modal"', 'id="npc-title"', 'id="npc-desc"', 'id="npc-choices"', 'id="dialogue-history-drawer"'].forEach(token => pos(token));
  assertCss(/\\.dialogue-layer\\s*\\{[\\s\\S]*position:\\s*fixed/, 'dialogue layer fixed overlay');
  assertCss(/\\.dialogue-scroll\\s*\\{[\\s\\S]*max-height:\\s*min\\(78vh,\\s*690px\\)/, 'dialogue shell bounded height');
  assertCss(/\\.dialogue-choices\\s*\\{[\\s\\S]*grid-template-columns:\\s*1fr/, 'choices vertical stack');
});

test('scene feed and recent log stay separated', () => {
  assert.ok(renderer.includes(\"type === 'scene' || type === 'dialogue'\"), 'scene/dialogue should route to scene feed');
  assert.ok(renderer.includes(\"document.getElementById('log-area')\"), 'recent log target missing');
  assertCss(/\\.page\\[data-page="jianghu"\\]\\s+#log-area\\s+\\.log-entry:nth-last-child\\(n \\+ 6\\)/, 'recent log caps visible entries');
});

test('diamond action buttons keep circular inner lining', () => {
  assertCss(/\\.page\\[data-page="jianghu"\\]\\s+\\.diamond-badge::before\\s*\\{[\\s\\S]*border-radius:\\s*50%/, 'diamond inner circular lining');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('UI contract result: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.log('\\nFailures:');
  for (const f of failures) console.log('  - ' + f.name + ': ' + f.error);
}
process.exit(failed > 0 ? 1 : 0);
`;
  writeIfChanged(p.uiContractTest, text);
}

addRelationshipMemoryToDialogueData();
writeNpcMemoryModule();
patchSaveSchema();
patchGame();
patchNpcService();
patchIntegration();
patchPerception();
patchRenderer();
patchCss();
patchPackageJson();
patchSaveTest();
patchDialogueSchemaTest();
writeNpcMemoryTest();
writeUiContractTest();
