/**
 * AudioManager.js — Audio manager with BGM + WebAudio SFX
 *
 * Strategy:
 *   - BGM: HTMLAudioElement loop playback of bgm.mp3 (no WebAudio dependency)
 *   - SFX (bangu/daluo/jingtangmu/wind): WebAudio synthesis (optional, can be muted)
 *   - User preferences persist in ghostmud.audio.preferences.v1
 *   - Intro temporary mute is stack-based and does not rewrite preferences
 */

import {
  loadAudioPreferences,
  saveAudioPreferences,
  normalizeAudioPreferences,
  DEFAULT_AUDIO_PREFERENCES,
} from './audio_preferences.js';

class AudioManager {
  constructor(storage) {
    this._storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.ctx = null;
    this._master = null;
    this._banguLoopTimer = null;
    this._banguLoopBpm = 60;
    this._unlocked = false;
    this._queuedSounds = [];
    this._tempMuteReasons = new Set();
    this._bgStarted = false;

    const prefs = loadAudioPreferences(this._storage);
    this._prefs = { ...prefs };

    // Runtime effective flags (preferences × temporary mute)
    this._sfxMuted = this._computeSfxMuted();
    this._bgmMuted = this._computeBgmMuted();

    // BGM element (HTMLAudioElement). In non-browser tests Audio may be missing.
    this.bgMusic = this._createBgmElement();
    this._applyBgmOutput();
  }

  _createBgmElement() {
    if (typeof Audio === 'undefined') {
      return {
        loop: true,
        volume: this._prefs.bgmVolume,
        muted: false,
        play: () => Promise.resolve(),
        pause() {},
      };
    }
    const el = new Audio('/bgm.mp3');
    el.loop = true;
    el.volume = this._prefs.bgmVolume;
    return el;
  }

  getPreferences() {
    return normalizeAudioPreferences(this._prefs);
  }

  setMasterMuted(m) {
    this._prefs.masterMuted = Boolean(m);
    this._persistAndApply();
  }

  setBgmMuted(m) {
    this._prefs.bgmMuted = Boolean(m);
    this._persistAndApply();
  }

  setSfxMuted(m) {
    this._prefs.sfxMuted = Boolean(m);
    this._persistAndApply();
  }

  setBgmVolume(n) {
    const v = Number(n);
    this._prefs.bgmVolume = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : this._prefs.bgmVolume;
    this._persistAndApply();
  }

  setSfxVolume(n) {
    const v = Number(n);
    this._prefs.sfxVolume = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : this._prefs.sfxVolume;
    this._persistAndApply();
  }

  /**
   * 临时静音（序章等）。不得写入 localStorage。
   * 对同一 reason 重复 push 幂等。
   */
  pushTemporaryMute(reason) {
    const key = reason == null ? 'default' : String(reason);
    this._tempMuteReasons.add(key);
    this._applyEffectiveMute();
  }

  /**
   * 结束临时静音，恢复用户偏好（不得强制开声）。
   * 对同一 reason 重复 pop 幂等。
   */
  popTemporaryMute(reason) {
    const key = reason == null ? 'default' : String(reason);
    this._tempMuteReasons.delete(key);
    this._applyEffectiveMute();
  }

  /**
   * 旧 SFX API 兼容别名：只影响 SFX 偏好，不改 BGM 偏好。
   */
  setMuted(m) {
    this.setSfxMuted(Boolean(m));
  }

  _persistAndApply() {
    this._prefs = normalizeAudioPreferences(this._prefs);
    saveAudioPreferences(this._prefs, this._storage);
    this._applyEffectiveMute();
  }

  _computeSfxMuted() {
    return Boolean(this._prefs.masterMuted || this._prefs.sfxMuted || this._tempMuteReasons.size > 0);
  }

  _computeBgmMuted() {
    return Boolean(this._prefs.masterMuted || this._prefs.bgmMuted || this._tempMuteReasons.size > 0);
  }

  _applyEffectiveMute() {
    this._sfxMuted = this._computeSfxMuted();
    this._bgmMuted = this._computeBgmMuted();
    this._applyBgmOutput();
    if (this._master) {
      const vol = this._sfxMuted ? 0 : this._prefs.sfxVolume;
      try { this._master.gain.value = vol; } catch (_) { /* ignore */ }
    }
  }

  _applyBgmOutput() {
    if (!this.bgMusic) return;
    this.bgMusic.volume = this._prefs.bgmVolume;
    this.bgMusic.muted = this._bgmMuted;
    if (this._bgmMuted && typeof this.bgMusic.pause === 'function') {
      try { this.bgMusic.pause(); } catch (_) { /* ignore */ }
    }
  }

  /**
   * Start BGM — must respect masterMuted || bgmMuted (and temporary mute).
   */
  startBgm() {
    if (this._bgStarted) return;
    this._bgStarted = true;
    this._applyBgmOutput();
    if (this._bgmMuted) return;

    const tryPlay = () => {
      const p = this.bgMusic.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          console.log('[Audio] BGM started');
        }).catch(() => {
          if (typeof document === 'undefined') return;
          const onGesture = () => {
            if (!this._computeBgmMuted()) {
              this.bgMusic.play().catch(() => {});
            }
            ['click', 'touchstart', 'keydown', 'mousedown'].forEach(ev =>
              document.removeEventListener(ev, onGesture, true));
          };
          ['click', 'touchstart', 'keydown', 'mousedown'].forEach(ev =>
            document.addEventListener(ev, onGesture, true));
        });
      }
    };
    tryPlay();
  }

  _ensureCtx() {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this._master = this.ctx.createGain();
    this._master.gain.value = this._sfxMuted ? 0 : this._prefs.sfxVolume;
    this._master.connect(this.ctx.destination);
    if (!this._unlocked) this._autoUnlockOnGesture();
    return this.ctx;
  }

  _autoUnlockOnGesture() {
    if (typeof document === 'undefined') return;
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    const handler = () => {
      events.forEach((ev) => document.removeEventListener(ev, handler, true));
      this.unlock();
    };
    events.forEach((ev) => document.addEventListener(ev, handler, true));
  }

  unlock() {
    this._unlocked = true;
    const ctx = this._ensureCtx();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this._queuedSounds.splice(0).forEach((fn) => { try { fn(); } catch (e) {} });
      }).catch((e) => console.warn('[Audio] resume failed', e));
    }
  }

  _noiseBuffer(seconds) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  playBangu() {
    if (this._sfxMuted) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(820, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.03);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(g).connect(this._master);
    osc.start(t);
    osc.stop(t + 0.05);
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(0.04);
    const nf = ctx.createBiquadFilter();
    nf.type = 'highpass';
    nf.frequency.value = 2000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.15, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    n.connect(nf).connect(ng).connect(this._master);
    n.start(t);
    n.stop(t + 0.04);
  }

  playDaluo() {
    if (this._sfxMuted) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const partials = [
      { f: 110, g: 0.5 }, { f: 220, g: 0.25 },
      { f: 330, g: 0.12 }, { f: 520, g: 0.08 },
    ];
    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, t);
      osc.frequency.linearRampToValueAtTime(p.f * 1.003, t + 1.0);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(p.g, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc.connect(g).connect(this._master);
      osc.start(t);
      osc.stop(t + 1.25);
    });
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(0.12);
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass';
    nf.frequency.value = 800;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    n.connect(nf).connect(ng).connect(this._master);
    n.start(t);
    n.stop(t + 0.12);
  }

  playJingtangmu() {
    if (this._sfxMuted) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(g).connect(this._master);
    osc.start(t);
    osc.stop(t + 0.1);
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(0.06);
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 1500;
    nf.Q.value = 1.2;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.4, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    n.connect(nf).connect(ng).connect(this._master);
    n.start(t);
    n.stop(t + 0.06);
  }

  playWind(duration = 0.8) {
    if (this._sfxMuted) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(duration);
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass';
    nf.frequency.value = 600;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 6;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(nf.frequency);
    lfo.start(t);
    lfo.stop(t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.15);
    g.gain.linearRampToValueAtTime(0.0001, t + duration);
    n.connect(nf).connect(g).connect(this._master);
    n.start(t);
    n.stop(t + duration);
  }

  startBanguLoop(bpm = 60) {
    this.stopBanguLoop();
    this._banguLoopBpm = bpm;
    const interval = 60000 / bpm;
    const tick = () => { this.playBangu(); this._banguLoopTimer = setTimeout(tick, interval); };
    tick();
  }

  setBanguLoopBpm(bpm) {
    this._banguLoopBpm = bpm;
    if (this._banguLoopTimer) this.startBanguLoop(bpm);
  }

  stopBanguLoop() {
    if (this._banguLoopTimer) {
      clearTimeout(this._banguLoopTimer);
      this._banguLoopTimer = null;
    }
  }

  stopAll() {
    this.stopBanguLoop();
  }
}

export const audio = new AudioManager();
export { AudioManager, DEFAULT_AUDIO_PREFERENCES };
export default audio;
