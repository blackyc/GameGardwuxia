import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
import { NARRATIVE_SCHEMAS, ASSET_ENTRY_SCHEMA, NARRATIVE_ENTRY_SCHEMA } from '../src/narrative/schemas.js';
import { CORE_ASSETS } from '../src/narrative/asset_registry.js';
import { INK_STORIES, INK_DIALOGUE_INDEX } from '../src/narrative/generated/ink_registry.js';
import { AUTHORED_NARRATIVE_ENTRIES, AUTHORED_ASSET_ENTRIES } from '../src/narrative/generated/authored_registry.js';

const ajv = new Ajv({ allErrors: true, strict: false });
NARRATIVE_SCHEMAS.forEach(schema => ajv.addSchema(schema));
const validateAsset = ajv.getSchema(ASSET_ENTRY_SCHEMA.$id);
const validateNarrative = ajv.getSchema(NARRATIVE_ENTRY_SCHEMA.$id);
const validateCondition = ajv.getSchema('ghostmud://schema/condition-v1');
const errors = [];

const assetIds = new Set();
const assetAliases = new Map();
for (const asset of [...CORE_ASSETS, ...AUTHORED_ASSET_ENTRIES]) {
  if (!validateAsset(asset)) errors.push({ id: asset.id, errors: validateAsset.errors });
  if (assetIds.has(asset.id)) {
    errors.push({ id: asset.id, errors: [{ message: 'duplicate asset id' }] });
  }
  assetIds.add(asset.id);
  for (const alias of asset.aliases || []) {
    const previous = assetAliases.get(alias);
    if (previous && previous !== asset.id) {
      errors.push({ id: asset.id, errors: [{ message: 'asset alias conflict: ' + alias + ' -> ' + previous }] });
    }
    assetAliases.set(alias, asset.id);
  }
  if (asset.src.startsWith('/') && !asset.src.startsWith('//')) {
    const absolute = path.join(root, 'public', asset.src.slice(1));
    if (!fs.existsSync(absolute)) {
      errors.push({ id: asset.id, errors: [{ message: 'missing local asset: ' + asset.src }] });
    }
  }
}
for (const asset of [...CORE_ASSETS, ...AUTHORED_ASSET_ENTRIES]) {
  if (asset.fallback && !assetIds.has(asset.fallback) && !assetAliases.has(asset.fallback)) {
    errors.push({ id: asset.id, errors: [{ message: 'missing fallback asset: ' + asset.fallback }] });
  }
}

for (const entry of AUTHORED_NARRATIVE_ENTRIES) {
  if (!validateNarrative(entry)) errors.push({ id: entry.id, errors: validateNarrative.errors });
  const variantIds = new Set();
  for (const variant of entry.variants || []) {
    if (variantIds.has(variant.id)) {
      errors.push({ id: entry.id, errors: [{ message: 'duplicate variant id: ' + variant.id }] });
    }
    variantIds.add(variant.id);
  }
  if (entry.bindings?.roomIds?.length && entry.kind !== 'room') {
    errors.push({ id: entry.id, errors: [{ message: 'roomIds binding requires kind=room' }] });
  }
  if (entry.bindings?.characterIds?.length && entry.kind !== 'character') {
    errors.push({ id: entry.id, errors: [{ message: 'characterIds binding requires kind=character' }] });
  }
  if (entry.bindings?.eventIds?.length && entry.kind !== 'event') {
    errors.push({ id: entry.id, errors: [{ message: 'eventIds binding requires kind=event' }] });
  }
}

for (const [id, story] of Object.entries(INK_STORIES)) {
  const entry = {
    id,
    kind: 'conversation',
    revision: 1,
    source: story.source,
    content: { engine: 'ink', storyId: id },
    variants: []
  };
  if (!validateNarrative(entry)) errors.push({ id, errors: validateNarrative.errors });
  try {
    JSON.parse(story.bytecode);
  } catch (error) {
    errors.push({ id, errors: [{ message: 'invalid Ink bytecode JSON: ' + error.message }] });
  }
}

const dialogueKeys = new Set();
for (const entry of INK_DIALOGUE_INDEX) {
  const key = entry.roomId + '::' + entry.encounterId;
  if (dialogueKeys.has(key)) {
    errors.push({ id: key, errors: [{ message: 'duplicate dialogue index entry' }] });
  }
  dialogueKeys.add(key);
  if (!INK_STORIES[entry.defaultStoryId]) {
    errors.push({ id: key, errors: [{ message: 'missing default story: ' + entry.defaultStoryId }] });
  }
  for (const variant of entry.variants || []) {
    if (!INK_STORIES[variant.storyId]) {
      errors.push({ id: key + ':' + variant.id, errors: [{ message: 'missing variant story: ' + variant.storyId }] });
    }
    if (!validateCondition(variant.when)) {
      errors.push({ id: key + ':' + variant.id, errors: validateCondition.errors });
    }
  }
}

if (errors.length > 0) {
  console.error('[NarrativeValidate] failed:', JSON.stringify(errors, null, 2));
  process.exitCode = 1;
} else {
  console.log('[NarrativeValidate] assets=' + (CORE_ASSETS.length + AUTHORED_ASSET_ENTRIES.length) + ', entries=' + AUTHORED_NARRATIVE_ENTRIES.length + ', stories=' + Object.keys(INK_STORIES).length + ', dialogueIndex=' + INK_DIALOGUE_INDEX.length + ', errors=0');
}

