/**
 * timer.js — 调度器模块
 * 参考猫国建设者 game.js 的 Timer 类
 * 替代裸 setInterval，支持暂停/恢复/精确调度
 */

export class Timer {
  constructor() {
    this._intervals = new Map();
    this._paused = false;
    this._tickCount = 0;
  }

  /**
   * 注册定时回调
   * @param {string} name — 定时器名称
   * @param {Function} callback — 回调函数
   * @param {number} intervalMs — 间隔毫秒
   */
  register(name, callback, intervalMs) {
    this._intervals.set(name, { callback, intervalMs, id: null, lastTick: 0 });
  }

  /** 启动所有定时器 */
  start() {
    for (const [name, timer] of this._intervals) {
      if (timer.id) clearInterval(timer.id);
      timer.id = setInterval(() => {
        if (!this._paused) {
          timer.callback();
          timer.lastTick = Date.now();
          this._tickCount++;
        }
      }, timer.intervalMs);
    }
  }

  /** 暂停所有定时器 */
  pause() {
    this._paused = true;
  }

  /** 恢复所有定时器 */
  resume() {
    this._paused = false;
  }

  /** 停止并清除所有定时器 */
  stop() {
    for (const [name, timer] of this._intervals) {
      if (timer.id) clearInterval(timer.id);
    }
    this._intervals.clear();
  }

  /** 获取 tick 计数 */
  get tickCount() {
    return this._tickCount;
  }
}
