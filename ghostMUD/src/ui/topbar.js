import audio from '../audio/AudioManager.js';

/** 顶部工具条：本轮仅承载可靠存档入口与音频偏好。 */
const topbar = {
  mount(game) {
    document.querySelectorAll('[data-topbar]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.topbar;
        if (action === 'save') {
          this._toast(game.saveGame() ? '进度已保存' : '保存失败', game.saveGame ? 'ok' : 'err');
        } else if (action === 'options') {
          this._openOptions();
        } else if (action === 'app') {
          this._toast('当前为网页版本', 'info');
        } else if (action === 'reset' || action === 'delete') {
          this._toast('为避免误触，重置与删档请使用存档管理流程', 'info');
        }
      });
    });
  },

  _openOptions() {
    document.getElementById('topbar-options')?.remove();
    const prefs = audio.getPreferences();
    const overlay = document.createElement('div');
    overlay.id = 'topbar-options';
    overlay.innerHTML = `
      <div class="topbar-options-box" role="dialog" aria-modal="true" aria-labelledby="audio-options-title">
        <div class="topbar-options-title" id="audio-options-title">声 音</div>
        ${this._switchRow('全部静音', 'master-muted', prefs.masterMuted)}
        ${this._switchRow('背景音乐', 'bgm-muted', !prefs.bgmMuted)}
        <label class="topbar-options-row"><span>音乐音量</span><input id="bgm-volume" type="range" min="0" max="1" step="0.05" value="${prefs.bgmVolume}"></label>
        ${this._switchRow('环境音效', 'sfx-muted', !prefs.sfxMuted)}
        <label class="topbar-options-row"><span>音效音量</span><input id="sfx-volume" type="range" min="0" max="1" step="0.05" value="${prefs.sfxVolume}"></label>
        <div class="topbar-options-actions"><button type="button" class="opt-btn" data-audio-close>收起</button></div>
      </div>`;
    document.body.appendChild(overlay);

    const master = overlay.querySelector('#master-muted');
    const bgm = overlay.querySelector('#bgm-muted');
    const sfx = overlay.querySelector('#sfx-muted');
    master.addEventListener('change', () => audio.setMasterMuted(master.checked));
    bgm.addEventListener('change', () => audio.setBgmMuted(!bgm.checked));
    sfx.addEventListener('change', () => audio.setSfxMuted(!sfx.checked));
    overlay.querySelector('#bgm-volume').addEventListener('input', (event) => audio.setBgmVolume(event.target.value));
    overlay.querySelector('#sfx-volume').addEventListener('input', (event) => audio.setSfxVolume(event.target.value));
    overlay.querySelector('[data-audio-close]').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
  },

  _switchRow(label, id, checked) {
    return `<label class="topbar-options-row"><span>${label}</span><span class="opt-switch"><input id="${id}" type="checkbox" ${checked ? 'checked' : ''}><span class="opt-switch-slider"></span></span></label>`;
  },

  _toast(message, type = 'info') {
    let toast = document.getElementById('topbar-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'topbar-toast';
      document.body.appendChild(toast);
    }
    toast.dataset.type = type;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1800);
  },
};
export default topbar;
