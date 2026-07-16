/**
 * moment_feedback_queue.js — 瞬时反馈去重队列（纯逻辑）
 *
 * 不操作 DOM / 定时器 / CSS。由 UI 层在验收后接入。
 */

const MAX_WAITING = 2;
const MERGE_WINDOW_MS = 500;
const PRIORITY_KINDS = new Set(['quest', 'clue']);

export class MomentFeedbackQueue {
  constructor() {
    /** @type {object|null} */
    this._active = null;
    /** @type {object[]} */
    this._waiting = [];
    /** @type {Set<string>} */
    this._seenEventIds = new Set();
  }

  /**
   * @param {{ eventId?: string|null, text?: string, kind?: string, amount?: number, createdAt?: number }} item
   * @returns {boolean} 是否入队（含合并）
   */
  enqueue(item = {}) {
    const eventId = item.eventId == null || item.eventId === '' ? null : String(item.eventId);
    if (eventId != null) {
      if (this._seenEventIds.has(eventId)) return false;
      this._seenEventIds.add(eventId);
    }

    const entry = {
      eventId,
      text: item.text == null ? '' : String(item.text),
      kind: item.kind == null ? 'info' : String(item.kind),
      amount: Number.isFinite(Number(item.amount)) ? Number(item.amount) : 1,
      createdAt: Number.isFinite(Number(item.createdAt)) ? Number(item.createdAt) : Date.now(),
    };

    if (this._tryMerge(entry)) return true;

    if (!this._active) {
      this._active = entry;
      return true;
    }

    this._waiting.push(entry);
    this._enforceCapacity();
    return true;
  }

  takeNext() {
    if (this._active) {
      const current = this._active;
      this._active = this._waiting.shift() || null;
      return current;
    }
    if (this._waiting.length > 0) {
      return this._waiting.shift();
    }
    return null;
  }

  peek() {
    return this._active || this._waiting[0] || null;
  }

  clear() {
    this._active = null;
    this._waiting = [];
    this._seenEventIds.clear();
  }

  /** @private */
  _tryMerge(entry) {
    const candidates = [];
    if (this._active) candidates.push(this._active);
    for (const w of this._waiting) candidates.push(w);

    for (let i = candidates.length - 1; i >= 0; i--) {
      const other = candidates[i];
      if (other.kind !== entry.kind) continue;
      if (other.text !== entry.text) continue;
      if (Math.abs(entry.createdAt - other.createdAt) > MERGE_WINDOW_MS) continue;
      other.amount = (Number(other.amount) || 0) + (Number(entry.amount) || 0);
      other.createdAt = Math.max(other.createdAt, entry.createdAt);
      if (entry.eventId && !other.eventId) other.eventId = entry.eventId;
      return true;
    }
    return false;
  }

  /** @private */
  _enforceCapacity() {
    while (this._waiting.length > MAX_WAITING) {
      let dropIndex = -1;
      for (let i = 0; i < this._waiting.length; i++) {
        if (!PRIORITY_KINDS.has(this._waiting[i].kind)) {
          dropIndex = i;
          break;
        }
      }
      if (dropIndex < 0) {
        // 全是优先项时仍需限容：丢弃最旧 waiting
        dropIndex = 0;
      }
      this._waiting.splice(dropIndex, 1);
    }
  }
}

export default MomentFeedbackQueue;
