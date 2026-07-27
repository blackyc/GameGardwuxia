function parseCommand(raw) {
  const text = String(raw || '').trim();
  const space = text.indexOf(' ');
  const name = space < 0 ? text : text.slice(0, space);
  const payloadText = space < 0 ? '{}' : text.slice(space + 1).trim();
  let payload = {};
  try {
    payload = payloadText ? JSON.parse(payloadText) : {};
  } catch (error) {
    throw new Error('[NarrativeCommand] invalid JSON payload for ' + name + ': ' + error.message);
  }
  return { name, payload };
}

export class NarrativeCommandRouter {
  constructor(game) {
    this.game = game;
    this.handlers = new Map();
    this._registerCoreCommands();
  }

  register(name, handler, { mutates = true } = {}) {
    if (!name || typeof handler !== 'function') throw new Error('[NarrativeCommand] invalid handler');
    this.handlers.set(name, { handler, mutates });
    return this;
  }

  execute(rawCommands = [], context = {}) {
    const results = [];
    for (const raw of rawCommands) {
      const command = parseCommand(raw);
      const entry = this.handlers.get(command.name);
      if (!entry) throw new Error('[NarrativeCommand] command is not allowlisted: ' + command.name);
      if (entry.mutates && !command.payload.id) {
        throw new Error('[NarrativeCommand] mutating command requires an id: ' + command.name);
      }
      const ledger = (this.game.state.narrativeCommandLedger ||= {});
      if (command.payload.id && ledger[command.payload.id]) {
        results.push({ ...command, skipped: true, reason: 'already-applied' });
        continue;
      }
      const value = entry.handler(command.payload, context);
      if (command.payload.id) {
        ledger[command.payload.id] = {
          command: command.name,
          storyId: context.storyId || null,
          appliedAt: Date.now()
        };
      }
      results.push({ ...command, skipped: false, value });
    }
    if (results.some(result => !result.skipped)) this.game.markDirty?.();
    return results;
  }

  _registerCoreCommands() {
    this.register('set_flag', payload => {
      if (!payload.key) throw new Error('[NarrativeCommand] set_flag requires key');
      (this.game.state.narrativeFlags ||= {})[payload.key] = payload.value ?? true;
      return payload.value ?? true;
    });
    this.register('set_story', payload => {
      if ('arc' in payload) this.game.state.storyArc = payload.arc;
      if ('chapter' in payload) this.game.state.storyChapter = payload.chapter;
      if ('phase' in payload) this.game.state.storyPhase = payload.phase;
      return true;
    });
    this.register('start_quest', payload => {
      if (!payload.questId) throw new Error('[NarrativeCommand] start_quest requires questId');
      return this.game.startQuest(payload.questId);
    });
    this.register('give_item', payload => {
      if (!payload.item?.id) throw new Error('[NarrativeCommand] give_item requires item.id');
      const inventory = (this.game.state.inventory ||= []);
      if (payload.unique && inventory.some(item => item?.id === payload.item.id)) return false;
      inventory.push({ ...payload.item });
      return true;
    });
    this.register('moment', payload => {
      this.game.showMomentFeedback?.(payload.text || '', payload.tone || 'info');
      return true;
    }, { mutates: false });
    this.register('log', payload => {
      this.game.addLog?.(payload.text || '', payload.kind || 'event');
      return true;
    }, { mutates: false });
  }
}

export { parseCommand };

export default NarrativeCommandRouter;

