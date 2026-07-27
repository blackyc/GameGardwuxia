import { evaluateCondition } from './condition_resolver.js';

export class AssetRegistry {
  constructor(entries = []) {
    this.entries = new Map();
    this.aliases = new Map();
    entries.forEach(entry => this.register(entry));
  }

  register(entry) {
    if (!entry?.id || !entry?.src) throw new Error('[AssetRegistry] asset id and src are required');
    if (this.entries.has(entry.id)) throw new Error('[AssetRegistry] duplicate asset id: ' + entry.id);
    this.entries.set(entry.id, Object.freeze({ revision: 1, focalPoint: { x: 0.5, y: 0.5 }, ...entry }));
    (entry.aliases || []).forEach(alias => this.aliases.set(alias, entry.id));
    return entry.id;
  }

  resolve(idOrAlias, context = {}) {
    const id = this.aliases.get(idOrAlias) || idOrAlias;
    const entry = this.entries.get(id);
    if (!entry) return null;
    const variant = (entry.variants || [])
      .filter(item => evaluateCondition(item.when, context))
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))[0];
    return variant ? { ...entry, ...variant.content, id } : entry;
  }

  has(idOrAlias) {
    return Boolean(this.resolve(idOrAlias));
  }
}

export const CORE_ASSETS = [];
export default AssetRegistry;

