/**
 * tabmanager.js — Tab 面板管理器
 * 参考猫国建设者 core.js 的 TabManager 基类
 * 统一管理 5 个 Tab 面板的切换、渲染和状态
 */

export class TabManager {
  constructor() {
    this._tabs = new Map();
    this._currentTab = null;
    this._tabButtons = [];
    this._tabPanels = [];
  }

  /**
   * 注册一个 Tab
   * @param {string} id — Tab 标识（char/bag/wuxue/quest/status）
   * @param {Function} renderFn — 渲染函数，切换到此 Tab 时调用
   */
  register(id, renderFn) {
    this._tabs.set(id, { id, renderFn });
  }

  /** 初始化 DOM 绑定 */
  init() {
    this._tabButtons = document.querySelectorAll('.tab-btn');
    this._tabPanels = document.querySelectorAll('.tab-panel');

    this._tabButtons.forEach(btn => {
      const tabId = btn.dataset.tab;
      btn.addEventListener('click', () => this.switchTo(tabId));
    });
  }

  /** 切换到指定 Tab */
  switchTo(tabId) {
    if (!this._tabs.has(tabId)) return;

    this._currentTab = tabId;

    this._tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    this._tabPanels.forEach(panel => {
      panel.classList.toggle('visible', panel.id === `panel-${tabId}`);
    });

    const tab = this._tabs.get(tabId);
    if (tab && typeof tab.renderFn === 'function') {
      tab.renderFn();
    }
  }

  /** 获取当前 Tab */
  get current() {
    return this._currentTab;
  }

  /** 重新渲染当前 Tab */
  rerender() {
    if (!this._currentTab) return;
    const tab = this._tabs.get(this._currentTab);
    if (tab && typeof tab.renderFn === 'function') {
      tab.renderFn();
    }
  }
}
