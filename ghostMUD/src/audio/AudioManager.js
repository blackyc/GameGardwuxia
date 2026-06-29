/**
 * AudioManager.js — Audio manager with BGM + WebAudio SFX
 *
 * Strategy:
 *   - BGM: HTMLAudioElement loop playback of bgm.mp3 (no WebAudio dependency)
 *     <audio> auto-unlocks after first user gesture; avoids 162x AudioContext warnings
 *   - SFX (bangu/daluo/jingtangmu/wind): WebAudio synthesis (optional, can be muted)
 *   - BGM plays normally during intro; SFX muted during intro, restored after
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this._master = null;
    this._banguLoopTimer = null;
    this._banguLoopBpm = 60;
    this._sfxMuted = true;   // SFX muted by default (for intro)
    this._bgmMuted = false;  // BGM on by default
    this._unlocked = false;
    this._queuedSounds = [];

    // BGM element (HTMLAudioElement, auto-decode)
    this.bgMusic = new Audio('/bgm.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.4;
    this._bgStarted = false;
  }

  /**
   * Start BGM (called from main.js entry, with auto-play retry strategy)
   * Chrome policy: .play() before user gesture fails silently,
   * so try play() first, then wait for first click/key event to retry
   */
  startBgm() {
    if (this._bgStarted) return;
    this._bgStarted = true;
    const tryPlay = () => {
      this.bgMusic.play().then(() => {
        console.log('[Audio] BGM started');
      }).catch(() => {
        // First attempt failed (Chrome autoplay policy),
        // wait for first user gesture to retry
        const onGesture = () => {
          this.bgMusic.play().catch(() => {});
          ['click','touchstart','keydown','mousedown'].forEach(ev =>
            document.removeEventListener(ev, onGesture, true));
        };
        ['click','touchstart','keydown','mousedown'].forEach(ev =>
          document.addEventListener(ev, onGesture, true));
      });
    };
    tryPlay();
  }

  _ensureCtx() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this._master = this.ctx.createGain();
    this._master.gain.value = 0.5;
    this._master.connect(this.ctx.destination);
    if (!this._unlocked) this._autoUnlockOnGesture();
    return this.ctx;
  }

  /** Auto-unlock AudioContext on first user gesture */
  _autoUnlockOnGesture() {
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
    // BGM start is handled by startBgm() (decoupled from unlock)
  }

  setMuted(m) {
    this._sfxMuted = m;
    if (this.bgMusic) this.bgMusic.muted = this._bgmMuted;
  }
  setBgmMuted(m) {
    this._bgmMuted = m;
    if (this.bgMusic) this.bgMusic.muted = m;
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
    // BGM intentionally not stopped (continuous playback)
  }
}

export const audio = new AudioManager();
export default audio;
