/**
 * typewriter.js — 打字机引擎
 *
 * 通用逐字写入工具。开场 cinematic 用它实现"每吐一字伴随板鼓哒声"的 1:1 同步；
 * 后续 NPC 对话/叙事文本也能复用（补"无打字机"基础设施缺口）。
 *
 * 用法：
 *   const tw = new Typewriter();
 *   await tw.typeTo(el, '黄昏的剑坪被夕阳染成暗金色。', {
 *     speed: 120,                       // 每字间隔 ms
 *     punctuationPause: true,           // 标点后加停顿
 *     onChar: (ch) => audio.playBangu(),// 每字回调（音效同步点）
 *     onComplete: () => { ... },
 *   });
 *   // 中断：
 *   tw.cancel();
 *
 * 设计要点：
 *   - 基于 setTimeout 链而非 setInterval，每字延迟可独立计算（标点停顿）
 *   - cancel() 清除队列，避免回调泄漏
 *   - typeTo 返回 Promise，便于 await 串联幕次
 *   - 写入用 textContent 追加，避免 XSS；可选 html 模式（信任内容时）
 */

export class Typewriter {
  constructor() {
    this._timer = null;
    this._cancelled = false;
    this._cursorEl = null;
  }

  /**
   * 逐字写入目标元素。
   * @param {HTMLElement} el 目标元素（内容会被清空后逐字重写）
   * @param {string} text 待写入文本
   * @param {object} [opts]
   * @param {number} [opts.speed=120] 每字间隔 ms
   * @param {boolean} [opts.punctuationPause=true] 标点后额外停顿
   * @param {function} [opts.onChar] 每字回调 (ch, index) => void
   * @param {function} [opts.onComplete] 完成回调 () => void
   * @param {boolean} [opts.showCursor=true] 末尾显示光标
   * @param {string} [opts.cursorChar='▌'] 光标字符
   * @returns {Promise<void>} 完成时 resolve
   */
  typeTo(el, text, opts = {}) {
    this.cancel();
    this._cancelled = false;
    const {
      speed = 120,
      punctuationPause = true,
      onChar,
      onComplete,
      showCursor = true,
      cursorChar = '▌',
    } = opts;

    el.textContent = '';
    const chars = Array.from(text); // 兼容 emoji/扩展字符
    let i = 0;

    // 光标元素
    if (showCursor) {
      this._cursorEl = document.createElement('span');
      this._cursorEl.className = 'tw-cursor';
      this._cursorEl.textContent = cursorChar;
      el.appendChild(this._cursorEl);
    }

    return new Promise((resolve) => {
      const finish = () => {
        if (this._cancelled) return;
        // 完成后保留光标（由调用方决定何时移除）或交由 CSS 控制
        if (onComplete) onComplete();
        resolve();
      };

      const step = () => {
        if (this._cancelled) return;
        if (i >= chars.length) {
          finish();
          return;
        }
        const ch = chars[i++];
        // 在光标前插入字符
        if (this._cursorEl) {
          el.insertBefore(document.createTextNode(ch), this._cursorEl);
        } else {
          el.appendChild(document.createTextNode(ch));
        }
        if (onChar) {
          try { onChar(ch, i - 1); } catch (e) { console.warn('[Typewriter] onChar error', e); }
        }
        // 计算下一字延迟（标点停顿）
        let delay = speed;
        if (punctuationPause && /[，。！？；：、…—,!?;:.\n]/.test(ch)) {
          delay = speed * 2.5; // 标点后停顿 2.5 倍
        }
        this._timer = setTimeout(step, delay);
      };

      step();
    });
  }

  /** 中断当前写入，清除定时器 */
  cancel() {
    this._cancelled = true;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  /** 移除光标（写入完成后调用） */
  removeCursor() {
    if (this._cursorEl && this._cursorEl.parentNode) {
      this._cursorEl.parentNode.removeChild(this._cursorEl);
    }
    this._cursorEl = null;
  }
}

export default Typewriter;
