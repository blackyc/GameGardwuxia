import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Compiler } from 'inkjs/full';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'public', 'data');
const contentDir = path.join(root, 'src', 'narrative', 'content');
const outputPath = path.join(root, 'src', 'narrative', 'generated', 'ink_registry.js');

function inkEscape(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/([{}\[\]])/g, '\\$1')
    .replace(/^([*+\-])/gm, '\\$1');
}

function knotId(value) {
  const id = String(value || 'node').replace(/[^a-zA-Z0-9_]/g, '_');
  return /^[0-9]/.test(id) ? '_' + id : id;
}

function stableHash(value) {
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 10);
}

function storySafeId(value) {
  return String(value || 'story').toLowerCase().replace(/[^a-z0-9._:-]/g, '_');
}

const CONDITION_FACT_ALIASES = Object.freeze({
  path: 'player.path',
  realm: 'player.realm',
  faction: 'player.faction',
  roomId: 'room.id',
  storyArc: 'story.arc',
  storyChapter: 'story.chapter',
  storyPhase: 'story.phase',
  npcAffinity: 'npc.affinity'
});

function normalizeLegacyWhen(condition) {
  if (condition == null || typeof condition === 'boolean') return condition ?? true;
  if (Array.isArray(condition)) return { all: condition.map(normalizeLegacyWhen) };
  if (condition.fact || condition.all || condition.any || condition.not) return condition;

  const clauses = Object.entries(condition).map(([key, expected]) => {
    const fact = CONDITION_FACT_ALIASES[key] || 'state.' + key;
    if (Array.isArray(expected)) return { fact, op: 'in', value: expected };
    if (expected && typeof expected === 'object') {
      if ('not' in expected) return { fact, op: 'ne', value: expected.not };
      if ('exists' in expected) return { fact, op: 'exists', value: expected.exists };
      if ('equals' in expected) return { fact, op: 'eq', value: expected.equals };
      if ('in' in expected) return { fact, op: 'in', value: expected.in };
    }
    return { fact, op: 'eq', value: expected };
  });
  if (clauses.length === 0) return true;
  return clauses.length === 1 ? clauses[0] : { all: clauses };
}

function graphToInk(graph) {
  const nodes = graph?.nodes || {};
  const metadata = { start: graph.start, nodes: {} };
  const lines = ['-> ' + knotId(graph.start), ''];
  for (const [nodeId, node] of Object.entries(nodes)) {
    const choices = Array.isArray(node.choices) ? node.choices : [];
    metadata.nodes[nodeId] = {
      speaker: node.speaker || '',
      next: node.next || null,
      end: node.end === true || (!node.next && choices.length === 0),
      choices: choices.map(choice => ({
        id: choice.id || '',
        label: choice.label || '',
        playerLine: choice.playerLine || choice.label || '',
        effects: choice.effects || {},
        next: choice.next || null
      }))
    };
    lines.push('=== ' + knotId(nodeId) + ' ===');
    lines.push('# node:' + nodeId);
    lines.push('# speaker:' + inkEscape(node.speaker || ''));
    lines.push(inkEscape(node.text || '??'));
    if (choices.length > 0) {
      choices.forEach(choice => {
        lines.push('+ [' + inkEscape(choice.label || '??') + ']');
        lines.push('    -> ' + (choice.next ? knotId(choice.next) : 'END'));
      });
    } else if (node.next) {
      lines.push('-> ' + knotId(node.next));
    } else {
      lines.push('-> END');
    }
    lines.push('');
  }
  return { source: lines.join('\n'), metadata };
}

function normalizeLine(line, fallbackSpeaker) {
  if (typeof line === 'string') return { speaker: fallbackSpeaker, text: line };
  return {
    speaker: line?.speaker || line?.name || fallbackSpeaker,
    text: line?.text || line?.line || line?.dialogue || ''
  };
}

function legacyChoiceEffects(choice) {
  const relationship = choice?.relationship || choice?.npcMemory || choice?.memory || choice?.relation || {};
  return {
    affinity: Number(relationship.affinityDelta ?? relationship.affinity ?? 0),
    flags: relationship.flags || relationship.flag || null,
    note: relationship.note || relationship.memo || '',
    legacyResult: {
      log: choice?.log || '',
      successLog: choice?.successLog || '',
      failLog: choice?.failLog || '',
      effect: choice?.effect || '',
      reward: choice?.reward || null,
      failReward: choice?.failReward || null,
      successReward: choice?.successReward || null,
      questStart: choice?.questStart || null
    }
  };
}

function linearDialogueToGraph(id, rawLines, rawChoices, fallbackSpeaker) {
  const lines = (Array.isArray(rawLines) ? rawLines : [rawLines]).filter(Boolean).map(line => normalizeLine(line, fallbackSpeaker));
  const choices = Array.isArray(rawChoices) ? rawChoices : [];
  const graph = { id, start: 'opening_0', nodes: {} };
  if (lines.length === 0) lines.push({ speaker: fallbackSpeaker, text: '????????' });
  lines.forEach((line, index) => {
    const nodeId = 'opening_' + index;
    const isLast = index === lines.length - 1;
    graph.nodes[nodeId] = {
      speaker: line.speaker,
      text: line.text,
      next: isLast ? null : 'opening_' + (index + 1),
      end: isLast && choices.length === 0
    };
  });
  if (choices.length > 0) {
    graph.nodes['opening_' + (lines.length - 1)].choices = choices.map((choice, choiceIndex) => {
      const followup = (choice.nextLines || choice.followupLines || choice.lines || choice.script || []).map(line => normalizeLine(line, fallbackSpeaker));
      if (followup.length === 0) followup.push({ speaker: fallbackSpeaker, text: choice.log || '?????????????' });
      followup.forEach((line, lineIndex) => {
        const nodeId = 'choice_' + choiceIndex + '_line_' + lineIndex;
        graph.nodes[nodeId] = {
          speaker: line.speaker,
          text: line.text,
          next: lineIndex < followup.length - 1 ? 'choice_' + choiceIndex + '_line_' + (lineIndex + 1) : null,
          end: lineIndex === followup.length - 1
        };
      });
      return {
        id: choice.id || 'choice_' + choiceIndex,
        label: choice.choice || choice.label || '??',
        playerLine: choice.playerLine || choice.choice || choice.label || '?????',
        effects: legacyChoiceEffects(choice),
        next: 'choice_' + choiceIndex + '_line_0'
      };
    });
  }
  return graph;
}

async function loadAuthoredData() {
  const sandbox = {
    window: {},
    module: { exports: {} },
    console: { log() {}, warn() {}, error() {} }
  };
  vm.createContext(sandbox);
  for (const filename of ['wenjianfeng_npc_dialogues.js', 'wenjianfeng_tutorial_ch1.js']) {
    const filePath = path.join(dataDir, filename);
    const code = await fs.readFile(filePath, 'utf8');
    vm.runInContext(code, sandbox, { filename: filePath });
  }
  return {
    tutorial: sandbox.window.WENJIANFENG_TUTORIAL_CH1,
    npcDialogues: sandbox.window.WENJIANFENG_NPC_DIALOGUES
  };
}

function addDefinition(definitions, definition) {
  if (definitions.has(definition.id)) throw new Error('[NarrativeCompile] duplicate story id: ' + definition.id);
  definitions.set(definition.id, definition);
}

async function collectLegacyStories() {
  const { tutorial, npcDialogues } = await loadAuthoredData();
  const definitions = new Map();
  const dialogueIndex = [];
  for (const [profileId, profile] of Object.entries(tutorial?.companionProfiles || {})) {
    const graph = profile?.dialogueGraph;
    if (!graph?.id || definitions.has(graph.id)) continue;
    const converted = graphToInk(graph);
    addDefinition(definitions, {
      id: graph.id,
      source: 'public/data/wenjianfeng_tutorial_ch1.js#companionProfiles.' + profileId,
      ink: converted.source,
      metadata: converted.metadata,
      legacy: true
    });
  }

  const entries = npcDialogues?.entries || [];
  entries.forEach((entry, entryIndex) => {
    if (!entry?.id || !entry?.room) return;
    const speaker = entry.npcName || entry.name || entry.ensure?.name || entry.id;
    const baseId = 'legacy.' + storySafeId(entry.id) + '.' + stableHash(entry.room);
    const baseGraph = linearDialogueToGraph(baseId, entry.dialogueLines || entry.lines || entry.script, entry.dialogueChoices || entry.choices, speaker);
    const baseConverted = graphToInk(baseGraph);
    addDefinition(definitions, {
      id: baseId,
      source: 'public/data/wenjianfeng_npc_dialogues.js#entries.' + entryIndex,
      ink: baseConverted.source,
      metadata: baseConverted.metadata,
      legacy: true
    });
    const indexEntry = {
      encounterId: entry.id,
      roomId: entry.room,
      defaultStoryId: baseId,
      variants: []
    };
    (entry.dialogueVariants || entry.variants || []).forEach((variant, variantIndex) => {
      const variantId = baseId + '.variant.' + storySafeId(variant.id || String(variantIndex));
      const graph = linearDialogueToGraph(variantId, variant.dialogueLines || variant.lines || variant.script, variant.dialogueChoices || variant.choices, speaker);
      const converted = graphToInk(graph);
      addDefinition(definitions, {
        id: variantId,
        source: 'public/data/wenjianfeng_npc_dialogues.js#entries.' + entryIndex + '.variants.' + variantIndex,
        ink: converted.source,
        metadata: converted.metadata,
        legacy: true
      });
      indexEntry.variants.push({
        id: variant.id || 'variant_' + variantIndex,
        priority: Number(variant.priority || 0),
        when: normalizeLegacyWhen(variant.when || false),
        storyId: variantId
      });
    });
    dialogueIndex.push(indexEntry);
  });
  return { definitions, dialogueIndex };
}

function assertSafeCommandTags(source, sourcePath) {
  String(source || '').split(/\r?\n/).forEach((line, index) => {
    if (!line.includes('# command:')) return;
    const hasUnescapedBrace = /(^|[^\\])[{}]/.test(line);
    if (hasUnescapedBrace) {
      throw new Error(
        '[NarrativeCompile] Ink command JSON braces must be escaped as \\{ and \\}: '
        + sourcePath + ':' + (index + 1)
      );
    }
  });
}

async function collectNativeInk(definitions) {
  const files = await fs.readdir(contentDir, { withFileTypes: true }).catch(() => []);
  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith('.ink')) continue;
    const id = file.name.slice(0, -4);
    const sourcePath = path.relative(root, path.join(contentDir, file.name)).replace(/\\/g, '/');
    const source = await fs.readFile(path.join(contentDir, file.name), 'utf8');
    assertSafeCommandTags(source, sourcePath);
    addDefinition(definitions, {
      id,
      source: sourcePath,
      ink: source,
      metadata: { start: null, nodes: {} },
      legacy: false
    });
  }
}

async function main() {
  const { definitions, dialogueIndex } = await collectLegacyStories();
  await collectNativeInk(definitions);
  const output = {};
  for (const definition of definitions.values()) {
    const story = new Compiler(definition.ink).Compile();
    output[definition.id] = {
      id: definition.id,
      revision: stableHash(definition.ink),
      source: definition.source,
      bytecode: story.ToJson(),
      metadata: definition.metadata,
      legacy: definition.legacy
    };
  }
  const moduleText = '// Generated by scripts/compile-narrative.mjs. Do not edit.\n'
    + 'export const INK_STORIES = Object.freeze(' + JSON.stringify(output, null, 2) + ');\n'
    + 'export const INK_DIALOGUE_INDEX = Object.freeze(' + JSON.stringify(dialogueIndex, null, 2) + ');\n'
    + 'export default INK_STORIES;\n';
  await fs.writeFile(outputPath, moduleText, 'utf8');
  console.log('[NarrativeCompile] compiled ' + Object.keys(output).length + ' Ink stories; indexed ' + dialogueIndex.length + ' NPC dialogue entries.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
