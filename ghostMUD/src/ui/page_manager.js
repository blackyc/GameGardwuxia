/**
 * page_manager.js — v3.0 页面/场景/帷幕管理器
 *
 * 职责：
 *   1. switchTo(pageId)  切换 5 个全屏页面（江湖/武学/行囊/舆图/人物）
 *      切页时播放祥云帷幕（左云从左滑入、右云从右滑入→中央遮挡→换页→两云退出）
 *   2. setScene(name)    设置 body[data-scene]，触发 CSS 变量组切换（场景动态配色）
 *   3. resolveScene(roomName) 解析房间名"·"前缀为大区场景名
 *
 * 对应 ui_architecture_spec.md v3.0 §4(布局)/§10(祥云帷幕)/§11(场景配色)。
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 已知场景白名单（用于 resolveScene 匹配；房间名"·"前缀命中即用）
const KNOWN_SCENES = [
  '应天府', '顺天府', '开封府',
  '问剑峰', '鸡鸣寺', '灵谷寺', '朝天宫', '紫金山',
  '血禅寺', '药王谷', '焰心教', '逍遥驿',
  '傀坊', '忘尘宗', '紫霞山', '归墟', '镜阁', '肉慈斋', '青囊庐',
];

export class PageManager {
  constructor() {
    this.currentPage = 'jianghu';
    this.currentScene = '应天府';
    this._veilLeft = null;
    this._veilRight = null;
    this._transitioning = false;
    this.onBeforeSwitch = null; // 钩子：换页前回调（game 可注入渲染逻辑）
    this.onAfterSwitch = null;  // 钩子：换页后回调
  }

  /** 初始化：缓存帷幕 DOM，绑定底部导航 */
  init() {
    this._veilLeft = document.getElementById('cloud-veil-left');
    this._veilRight = document.getElementById('cloud-veil-right');
    this._bindNav();
    // 默认显示江湖页
    this._applyPage('jianghu', false);
    console.log('[PageManager] initialized');
  }

  _bindNav() {
    document.querySelectorAll('#bottom-nav .nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page) this.switchTo(page);
      });
    });
  }

  /**
   * 切换页面（带祥云帷幕转场）。
   * 总时长 ~700ms：合 300ms → 停 100ms（换页）→ 开 300ms
   * 若切换中再次调用，忽略（防抖）。
   */
  async switchTo(pageId, opts = {}) {
    if (pageId === this.currentPage) return;
    if (this._transitioning) {
      // 过渡中：等待结束后重试一次（避免点击丢失）
      await sleep(700);
      if (pageId !== this.currentPage) return this.switchTo(pageId, opts);
      return;
    }
    this._transitioning = true;
    const skipVeil = opts.skipVeil || this._prefersReducedMotion();

    if (skipVeil) {
      this._applyPage(pageId, true);
      this._transitioning = false;
      return;
    }

    // 阶段1：两云向中央滑入（闭合遮挡）300ms
    if (this._veilLeft && this._veilRight) {
      this._veilLeft.classList.remove('open');
      this._veilRight.classList.remove('open');
      // force reflow
      void this._veilLeft.offsetWidth;
      this._veilLeft.classList.add('closed');
      this._veilRight.classList.add('closed');
    }
    await sleep(300);

    // 阶段2：遮挡期间切换页面内容 100ms
    if (typeof this.onBeforeSwitch === 'function') {
      try { this.onBeforeSwitch(pageId); } catch (e) { console.warn('[PageManager] onBeforeSwitch error', e); }
    }
    this._applyPage(pageId, true);
    await sleep(100);

    // 阶段3：两云向两侧退出（揭示新页）300ms
    if (this._veilLeft && this._veilRight) {
      this._veilLeft.classList.remove('closed');
      this._veilRight.classList.remove('closed');
      void this._veilLeft.offsetWidth;
      this._veilLeft.classList.add('open');
      this._veilRight.classList.add('open');
    }
    await sleep(300);

    if (typeof this.onAfterSwitch === 'function') {
      try { this.onAfterSwitch(pageId); } catch (e) { console.warn('[PageManager] onAfterSwitch error', e); }
    }

    // 重置帷幕 class，备下次
    if (this._veilLeft && this._veilRight) {
      this._veilLeft.classList.remove('open');
      this._veilRight.classList.remove('open');
    }
    this._transitioning = false;
  }

  /** 实际应用页面切换（更新 .active class），不播动画 */
  _applyPage(pageId, fireEvent) {
    this.currentPage = pageId;
    document.body.dataset.page = pageId;
    document.querySelectorAll('.page').forEach((p) => {
      p.classList.toggle('active', p.dataset.page === pageId);
    });
    document.querySelectorAll('#bottom-nav .nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
    // 滚动到顶
    const active = document.querySelector('.page.active');
    if (active) active.scrollTop = 0;
  }

  /**
   * 设置场景（驱动背景配色变化）。
   * @param {string} sceneName 大区名（应天府/问剑峰/血禅寺 等）
   */
  setScene(sceneName) {
    if (!sceneName || sceneName === this.currentScene) return;
    this.currentScene = sceneName;
    document.body.dataset.scene = sceneName;
    console.log('[PageManager] scene →', sceneName);
  }

  /**
   * 解析房间名为大区场景名。
   * 规则（按 ui_architecture_spec.md §11.1）：
   *   1. 房间名含"·"，取首段前缀
   *   2. 前缀命中 KNOWN_SCENES → 用之
   *   3. 否则用兜底场景（应天府）
   * @param {string} roomName 如 "问剑峰·剑坪"、"鸡鸣寺·钟楼"
   * @returns {string} 场景名
   */
  resolveScene(roomName) {
    if (!roomName) return '应天府';
    const seg = roomName.split('·')[0].trim();
    if (KNOWN_SCENES.includes(seg)) return seg;
    // 凡人城市变体
    if (['应天府', '顺天府', '开封府'].includes(seg)) return seg;
    return '应天府';
  }

  _prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

export default PageManager;
