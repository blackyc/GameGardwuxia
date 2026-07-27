import { Story } from 'inkjs';

function parseTags(tags = []) {
  return tags.reduce((result, rawTag) => {
    const tag = String(rawTag || '').trim();
    const separator = tag.indexOf(':');
    if (separator < 0) {
      (result.tags ||= []).push(tag);
      return result;
    }
    const key = tag.slice(0, separator).trim();
    const value = tag.slice(separator + 1).trim();
    if (key === 'command') (result.commands ||= []).push(value);
    else if (key) result[key] = value;
    return result;
  }, {});
}

export class InkDialogueSession {
  constructor(definition, { snapshot = null, variables = {} } = {}) {
    if (!definition?.bytecode) throw new Error('[InkDialogueSession] story bytecode is required');
    this.definition = definition;
    this.id = definition.id;
    this.story = new Story(definition.bytecode);
    this.frame = null;
    this.lastChoice = null;
    const compatibleSnapshot = snapshot?.storyRevision === definition.revision ? snapshot : null;
    if (compatibleSnapshot?.storyState) this.story.state.LoadJson(compatibleSnapshot.storyState);
    else this._applyVariables(variables);
    if (compatibleSnapshot?.frame) this.frame = compatibleSnapshot.frame;
    if (!this.frame) this.frame = this._readFrame();
  }

  _applyVariables(variables) {
    Object.entries(variables || {}).forEach(([name, value]) => {
      if (!this.story.variablesState.GlobalVariableExistsWithName(name)) return;
      this.story.variablesState.$(name, value);
    });
  }

  getView() {
    return this.frame;
  }

  continue() {
    if (this.frame?.choices?.length) return this.frame;
    this.frame = this._readFrame();
    return this.frame;
  }

  choose(index) {
    const choiceIndex = Number(index);
    const choices = this.story.currentChoices || [];
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= choices.length) return null;
    const nodeId = this.frame?.nodeId || '';
    const metadata = this.definition.metadata?.nodes?.[nodeId]?.choices?.[choiceIndex] || {};
    const selected = {
      id: metadata.id || String(choiceIndex),
      label: metadata.label || choices[choiceIndex].text || '',
      playerLine: metadata.playerLine || metadata.label || choices[choiceIndex].text || '',
      effects: metadata.effects || {},
      next: metadata.next || null
    };
    this.story.ChooseChoiceIndex(choiceIndex);
    this.lastChoice = selected;
    this.frame = this._readFrame();
    return { selected, frame: this.frame };
  }

  snapshot() {
    return {
      engine: 'ink',
      storyId: this.id,
      storyRevision: this.definition.revision,
      storyState: this.story.state.ToJson(),
      frame: this.frame,
      lastChoice: this.lastChoice
    };
  }

  _readFrame() {
    let guard = 0;
    while (this.story.canContinue && guard < 50) {
      guard += 1;
      const text = String(this.story.Continue() || '').trim();
      const tags = parseTags(this.story.currentTags || []);
      if (!text) continue;
      const nodeId = tags.node || '';
      const nodeMetadata = this.definition.metadata?.nodes?.[nodeId] || null;
      const choices = (this.story.currentChoices || []).map((choice, index) => ({ index, label: choice.text }));
      const canContinue = this.definition.legacy && nodeMetadata
        ? Boolean(nodeMetadata.next)
        : this.story.canContinue;
      return {
        speaker: tags.speaker || '',
        text,
        nodeId,
        tags,
        choices,
        canContinue,
        ended: choices.length === 0 && !canContinue
      };
    }
    return {
      speaker: '',
      text: '',
      nodeId: '',
      tags: {},
      choices: (this.story.currentChoices || []).map((choice, index) => ({ index, label: choice.text })),
      canContinue: this.story.canContinue,
      ended: !this.story.canContinue && (this.story.currentChoices || []).length === 0
    };
  }
}

export default InkDialogueSession;

