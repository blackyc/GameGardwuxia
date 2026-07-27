import { evaluateCondition } from './condition_resolver.js';

function mergeContent(base, override) {
  return {
    ...(base || {}),
    ...(override || {}),
    assets: { ...(base?.assets || {}), ...(override?.assets || {}) }
  };
}

export class NarrativeRegistry {
  constructor({ strict = false, onDiagnostic = null } = {}) {
    this.strict = strict;
    this.onDiagnostic = onDiagnostic;
    this.entries = new Map();
    this.diagnostics = [];
  }

  register(entry) {
    if (!entry?.id || !entry?.kind) throw new Error('[NarrativeRegistry] entry.id and entry.kind are required');
    if (this.entries.has(entry.id)) throw new Error('[NarrativeRegistry] duplicate id: ' + entry.id);
    this.entries.set(entry.id, Object.freeze({ revision: 1, content: {}, variants: [], ...entry }));
    return entry.id;
  }

  registerMany(entries = []) {
    entries.forEach(entry => this.register(entry));
    return this;
  }

  get(id) {
    return this.entries.get(id) || null;
  }

  resolve(id, context = {}) {
    const entry = this.get(id);
    if (!entry) return null;
    const matches = (entry.variants || [])
      .filter(variant => evaluateCondition(variant.when, context))
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
    const winner = matches[0] || null;
    if (winner && matches[1] && Number(winner.priority || 0) === Number(matches[1].priority || 0)) {
      this._diagnose({
        code: 'AMBIGUOUS_VARIANT',
        entryId: id,
        variantIds: matches.filter(item => Number(item.priority || 0) === Number(winner.priority || 0)).map(item => item.id)
      });
    }
    return {
      id: entry.id,
      kind: entry.kind,
      revision: entry.revision,
      source: entry.source || '',
      variantId: winner?.id || null,
      content: mergeContent(entry.content, winner?.content)
    };
  }

  _diagnose(diagnostic) {
    this.diagnostics.push(diagnostic);
    this.onDiagnostic?.(diagnostic);
    if (this.strict) throw new Error('[NarrativeRegistry] ' + diagnostic.code + ': ' + diagnostic.entryId);
  }
}

export default NarrativeRegistry;

