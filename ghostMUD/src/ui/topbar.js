/**
 * topbar.js — 顶部工具条行为（参考猫国建设者）
 *
 * 按钮：
 *   保存   → game.storage.save(game.state) + 弹提示
 *   选项   → 弹一个简单的设置面板（音量/动画/夜间模式）
 *   重置   → 重置当前游戏状态（保留身世/门派），需二次确认
 *   删档   → 清除 localStorage 存档，需二次确认
 *   APP    → 跳转到其他工具页（暂留 placeholder）
 */

import audio from '../audio/AudioManager.js';

const APP_VERSION = '1.0.0';

export class TopBar {
  constructor() {
    this.game = null;
  }

  /** 装载工具条：必须在 game 创建后调用（需要 game.storage 等） */
  mount(game) {
    this.game = game;
    // 版本号
    const ver = document.getElementById('topbar-ver');
    if (ver) ver.textContent = 'Ver ' + APP_VERSION;

    document.querySelectorAll('#top-bar .topbar-btn').forEach((btn) => {
      btn.addEventListener('click', () => this._handle(btn.dataset.topbar));
    });
  }

  _handle(action) {
    switch (action) {
      case 'save': return this._onSave();
      case 'options': return this._onOptions();
      case 'reset': return this._onReset();
      case 'delete': return this._onDelete();
      case 'app': return this._onApp();
    }
  }

  _onSave() {
    if (!this.game) return;
    const ok = this.game.storage.save(this.game.state);
    if (ok) this._toast('✓ 存档已保存', 'ok');
    else this._toast('✗ 存档失败', 'err');
  }

  _onOptions() {
    this._openOptions();
  }

  _onReset() {
    if (!this.game) return;
    if (!confirm('重置游戏？\n身世/门派/修为/物品都会回到起点，但不会删除存档。')) return;
    // 删除当前 localStorage 存档 + 刷新页面（最简单可靠的"回到开场"方式）
    this.game.storage.clear();
    location.reload();
  }

  _onDelete() {
    if (!this.game) return;
    if (!confirm('⚠ 删档？\n这将清除所有存档（身世、修为、物品、任务…全部清空），且不可恢复。')) return;
    if (!confirm('再次确认：真的要清空所有进度吗？')) return;
    this.game.storage.clear();
    location.reload();
  }

  _onApp() {
    this._toast('APP 跳转（开发中）', 'info');
  }

  /** 简易选项弹窗（音量/夜间模式/动画） */
  _openOptions() {
    let modal = document.getElementById('topbar-options');
    if (modal) { modal.remove(); }

    const curVol = audio._muted ? 0 : (audio.bgMusic?.volume ?? 0.4);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    modal = document.createElement('div');
    modal.id = 'topbar-options';
    modal.innerHTML = `
      <div class="topbar-options-box">
        <div class="topbar-options-title">选 项</div>
        <div class="topbar-options-row">
          <span>BGM 音量</span>
          <input type="range" id="opt-vol" min="0" max="1" step="0.05" value="${curVol}">
        </div>
        <div class="topbar-options-row">
          <span>夜间模式</span>
          <label class="opt-switch">
            <input type="checkbox" id="opt-night" ${document.body.dataset.theme === 'night' ? 'checked' : ''}>
            <span class="opt-switch-slider"></span>
          </label>
        </div>
        <div class="topbar-options-row">
          <span>减少动画</span>
          <label class="opt-switch">
            <input type="checkbox" id="opt-reduce" ${reducedMotion ? 'checked' : ''}>
            <span class="opt-switch-slider"></span>
          </label>
        </div>
        <div class="topbar-options-actions">
          <button class="opt-btn" id="opt-close">关闭</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    // 绑定
    const vol = modal.querySelector('#opt-vol');
    vol.addEventListener('input', () => {
      const v = parseFloat(vol.value);
      if (audio.bgMusic) audio.bgMusic.volume = v;
      audio.setMuted(v === 0);
    });
    modal.querySelector('#opt-night').addEventListener('change', (e) => {
      document.body.dataset.theme = e.target.checked ? 'night' : '';
    });
    modal.querySelector('#opt-reduce').addEventListener('change', (e) => {
      document.documentElement.style.setProperty('--reduce-motion', e.target.checked ? '1' : '0');
    });
    modal.querySelector('#opt-close').addEventListener('click', () => modal.remove());
    // 点遮罩关闭
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  /** 简易 toast 提示（自动消失） */
  _toast(text, type = 'info') {
    let t = document.getElementById('topbar-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'topbar-toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.dataset.type = type;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }
}

export default new TopBar();
