/**
 * respool.js — 资源池模块
 * 参考猫国建设者 js/resources.js 的 resPool 模式
 * 统一管理 气血/真元/道心/灵石/修为 等游戏资源
 */

export class ResourcePool {
  constructor() {
    this._resources = new Map();
  }

  /**
   * 定义一种资源
   * @param {string} id — 资源 ID
   * @param {object} config — { name, min, max, current }
   */
  define(id, config) {
    this._resources.set(id, {
      id,
      name: config.name || id,
      min: config.min ?? 0,
      max: config.max ?? Infinity,
      current: config.current ?? config.min ?? 0,
      _modifiers: [],
    });
  }

  /** 获取资源当前值 */
  get(id) {
    const r = this._resources.get(id);
    return r ? r.current : 0;
  }

  /** 获取资源最大值 */
  getMax(id) {
    const r = this._resources.get(id);
    return r ? r.max : 0;
  }

  /** 设置资源值（自动 clamp） */
  set(id, value) {
    const r = this._resources.get(id);
    if (!r) return;
    r.current = Math.max(r.min, Math.min(r.max, value));
  }

  /** 增减资源（正数增加，负数减少） */
  modify(id, delta) {
    const r = this._resources.get(id);
    if (!r) return;
    r.current = Math.max(r.min, Math.min(r.max, r.current + delta));
  }

  /** 重设最大值 */
  setMax(id, max) {
    const r = this._resources.get(id);
    if (!r) return;
    r.max = max;
    r.current = Math.min(r.current, max);
  }

  /** 添加修饰符 */
  addModifier(id, modifier) {
    const r = this._resources.get(id);
    if (!r) return;
    r._modifiers.push(modifier);
  }

  /** 获取所有资源（用于存档） */
  serialize() {
    const data = {};
    for (const [id, r] of this._resources) {
      data[id] = { current: r.current, max: r.max, min: r.min };
    }
    return data;
  }

  /** 从存档恢复 */
  deserialize(data) {
    for (const [id, val] of Object.entries(data)) {
      const r = this._resources.get(id);
      if (r) {
        r.current = val.current;
        r.max = val.max;
        r.min = val.min ?? 0;
      }
    }
  }

  /** 获取百分比 */
  getPercent(id) {
    const r = this._resources.get(id);
    if (!r || r.max === 0) return 0;
    return (r.current / r.max) * 100;
  }
}
