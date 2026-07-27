import { AssetRegistry, CORE_ASSETS } from './asset_registry.js';
import { NarrativeRegistry } from './content_registry.js';
import { createNarrativeContext } from './context.js';
import { registerLegacyNarrative } from './legacy_adapter.js';
import { InkDialogueSession } from './ink_dialogue_session.js';
import { NarrativeCommandRouter } from './command_router.js';
import { evaluateCondition } from './condition_resolver.js';
import { INK_STORIES, INK_DIALOGUE_INDEX } from './generated/ink_registry.js';
import { AUTHORED_NARRATIVE_ENTRIES, AUTHORED_ASSET_ENTRIES } from './generated/authored_registry.js';

export class NarrativeService {
  constructor(game) {
    this.game = game;
    this.assets = new AssetRegistry([...CORE_ASSETS, ...AUTHORED_ASSET_ENTRIES]);
    this.content = new NarrativeRegistry({
      onDiagnostic: diagnostic => console.warn('[Narrative]', diagnostic)
    });
    this.content.registerMany(AUTHORED_NARRATIVE_ENTRIES);
    this.legacy = registerLegacyNarrative(game.data, this.content);
    this.authoredCharacterBindings = new Map();
    this.authoredEventBindings = new Map();
    AUTHORED_NARRATIVE_ENTRIES.forEach(entry => {
      (entry.bindings?.roomIds || []).forEach(roomId => this.legacy.roomIds.set(roomId, entry.id));
      (entry.bindings?.characterIds || []).forEach(characterId => this.authoredCharacterBindings.set(characterId, entry.id));
      (entry.bindings?.eventIds || []).forEach(eventId => this.authoredEventBindings.set(eventId, entry.id));
    });
    this.stories = INK_STORIES;
    this.commands = new NarrativeCommandRouter(game);
  }

  context(overrides = {}) {
    return createNarrativeContext(this.game, overrides);
  }

  resolveRoom(roomId = this.game.state.location) {
    const entryId = this.legacy.roomIds.get(roomId);
    return entryId ? this.content.resolve(entryId, this.context({ roomId })) : null;
  }

  getRoomDescription(roomId = this.game.state.location) {
    return this.resolveRoom(roomId)?.content?.description || '';
  }

  resolveCharacter(npc) {
    if (!npc || typeof npc !== 'object') return null;
    const key = String(npc.memoryKey || npc.id || npc.encounterId || '');
    let entryId = this.authoredCharacterBindings.get(key) || null;
    if (!entryId) entryId = this.legacy.characterIds.get(npc);
    if (!entryId) entryId = this.legacy.characterKeys.get(key);
    return entryId
      ? this.content.resolve(entryId, this.context({ npcId: npc.memoryKey || npc.id || null }))
      : null;
  }

  getCharacterDescription(npc) {
    return this.resolveCharacter(npc)?.content?.description || '';
  }

  getDescription(entity) {
    if (!entity || typeof entity !== 'object') return '';
    const roomEntryId = this.legacy.roomObjects.get(entity);
    if (roomEntryId) {
      return this.content.resolve(roomEntryId, this.context())?.content?.description || '';
    }
    return this.getCharacterDescription(entity);
  }

  getAsset(artId, overrides = {}) {
    return artId ? this.assets.resolve(artId, this.context(overrides)) : null;
  }

  resolveEvent(event) {
    if (!event || typeof event !== 'object') return null;
    const key = String(event.id || event.eventId || '');
    const entryId = this.authoredEventBindings.get(key) || this.legacy.eventIds.get(event);
    return entryId ? this.content.resolve(entryId, this.context()) : null;
  }

  getPortrait(npc) {
    const context = this.context({ npcId: npc?.memoryKey || npc?.id || null });
    const character = this.resolveCharacter(npc);
    const candidates = [
      character?.content?.assets?.portrait,
      npc?.portraitArtId,
      npc?.id,
      npc?.title,
      npc?.name
    ].filter(Boolean);
    for (const candidate of candidates) {
      const asset = this.assets.resolve(candidate, context);
      if (asset) return asset;
    }
    return null;
  }

  getStoryId(npc) {
    const explicit = npc?.dialogueStoryId || npc?.dialogueGraph?.id;
    if (explicit && this.stories[explicit]) return explicit;

    const encounterIds = [npc?.id, npc?.memoryKey, npc?.encounterId].filter(Boolean);
    const roomId = this.game.state.location;
    const indexEntry = INK_DIALOGUE_INDEX.find(entry => (
      entry.roomId === roomId && encounterIds.includes(entry.encounterId)
    ));
    if (!indexEntry) return explicit || null;

    const context = this.context({ npcId: npc?.memoryKey || npc?.id || null });
    const matches = (indexEntry.variants || [])
      .filter(variant => evaluateCondition(variant.when, context))
      .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0));
    if (matches.length > 1 && Number(matches[0].priority || 0) === Number(matches[1].priority || 0)) {
      console.warn('[Narrative] ambiguous dialogue variants', {
        encounterId: indexEntry.encounterId,
        roomId,
        variants: matches.filter(item => item.priority === matches[0].priority).map(item => item.id)
      });
    }
    return matches[0]?.storyId || indexEntry.defaultStoryId || explicit || null;
  }

  createDialogueSession(npc, snapshot = null) {
    const storyId = this.getStoryId(npc);
    const definition = storyId ? this.stories[storyId] : null;
    return definition ? new InkDialogueSession(definition, {
      snapshot,
      variables: this.dialogueVariables(npc)
    }) : null;
  }

  dialogueVariables(npc = null) {
    const context = this.context({ npcId: npc?.memoryKey || npc?.id || null });
    return {
      player_path: context.player?.path || '',
      player_realm: Number(context.player?.realm || 0),
      story_arc: context.story?.arc || '',
      story_chapter: context.story?.chapter || '',
      story_phase: context.story?.phase || '',
      room_id: context.room?.id || '',
      npc_affinity: Number(context.npc?.affinity || 0)
    };
  }
  executeFrameCommands(frame, context = {}) {
    return this.commands.execute(frame?.tags?.commands || [], context);
  }
}

export default NarrativeService;

