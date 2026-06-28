/**
 * AudioManager.js — WebAudio 合成占位音系统（京剧打击乐）
 *
 * v3.0 开场 cinematic 基础设施。用 OscillatorNode + GainNode + 噪声 buffer 合成，
 * 0 外部资产。后期可用真实采样替换 playXxx 内的合成逻辑，对外接口不变。
 *
 * 合成音色（均为近似）：
 *   - playBangu()       板鼓「哒」  短促高频敲击 ~800Hz 方波 + 30ms 衰减 + 少量噪声
 *   - playDaluo()       大锣「咚——」低频 110Hz 正弦 + 1.2s 指数衰减 + 金属泛音
 *   - playJingtangmu()  惊堂木       中频 200Hz + 80ms 衰减 + 急促噪声
 *   - playWind()        猎猎风声     白噪声 + 低通滤波 + 调制
 *
 * 循环：
 *   - startBanguLoop(bpm)/stopBanguLoop()  低沉循环板鼓（模拟心跳/时间流逝）
 *
 * 浏览器策略：AudioContext 必须在用户手势后 resume()，故 unlock() 挂到首个点击。
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this._master = null;
    this._banguLoopTimer = null;
    this._banguLoopBpm = 60;
    this._muted = false;
  }

  /** 初始化（懒加载）。首次需在用户手势内调用 unlock()。 */
  _ensureCtx() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      console.warn('[Audio] WebAudio 不可用');
      return null;
    }
    this.ctx = new AC();
    this._master = this.ctx.createGain();
    this._master.gain.value = 0.5;
    this._master.connect(this.ctx.destination);
    return this.ctx;
  }

  /**
   * 在用户手势内调用，解除浏览器自动播放限制。
   * 挂到首个 click 即可。
   */
  unlock() {
    const ctx = this._ensureCtx();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch((e) => console.warn('[Audio] resume 失败', e));
    }
  }

  setMuted(m) { this._muted = m; }

  // ──────────────────────────────────────────────
  //  噪声 buffer 缓存（白噪声，多种音色复用）
  // ──────────────────────────────────────────────
  _noiseBuffer(seconds) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ──────────────────────────────────────────────
  //  板鼓「哒」— 1:1 逐字同步的核心音
  // ──────────────────────────────────────────────
  playBangu() {
    if (this._muted) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;

    // 高频敲击主体：方波 ~800Hz，极短包络
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

    // 少量噪声瞬态（鼓皮的"咝")
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

  // ──────────────────────────────────────────────
  //  大锣「咚——」— 落锣定局，长余音
  // ──────────────────────────────────────────────
  playDaluo() {
    if (this._muted) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;

    // 基音 110Hz + 金属泛音，指数衰减 1.2s
    const partials = [
      { f: 110, g: 0.5 },
      { f: 220, g: 0.25 },
      { f: 330, g: 0.12 },
      { f: 520, g: 0.08 },
    ];
    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, t);
      // 锣的频率微漂（金属振颤感）
      osc.frequency.linearRampToValueAtTime(p.f * 1.003, t + 1.0);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(p.g, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc.connect(g).connect(this._master);
      osc.start(t);
      osc.stop(t + 1.25);
    });

    // 击打瞬态噪声
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

  // ──────────────────────────────────────────────
  //  惊堂木 — 中频重击，急促
  // ──────────────────────────────────────────────
  playJingtangmu() {
    if (this._muted) return;
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

    // 木头碰撞噪声
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

  // ──────────────────────────────────────────────
  //  猎猎风声 — 大旗撤开时
  // ──────────────────────────────────────────────
  playWind(duration = 0.8) {
    if (this._muted) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;

    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(duration);
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass';
    nf.frequency.value = 600;
    // 调制滤波器频率，模拟风的起伏
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

  // ──────────────────────────────────────────────
  //  循环板鼓（心跳/时间流逝感）
  // ──────────────────────────────────────────────
  startBanguLoop(bpm = 60) {
    this.stopBanguLoop();
    this._banguLoopBpm = bpm;
    const interval = 60000 / bpm;
    const tick = () => {
      this.playBangu();
      this._banguLoopTimer = setTimeout(tick, interval);
    };
    tick();
  }

  /** 渐变 bpm（用于幕6高潮加速）。立即生效下一拍。 */
  setBanguLoopBpm(bpm) {
    this._banguLoopBpm = bpm;
    if (this._banguLoopTimer) {
      // 重启循环以应用新间隔
      this.startBanguLoop(bpm);
    }
  }

  stopBanguLoop() {
    if (this._banguLoopTimer) {
      clearTimeout(this._banguLoopTimer);
      this._banguLoopTimer = null;
    }
  }

  /** 静音一切（惊堂木后"一切声音消失"） */
  stopAll() {
    this.stopBanguLoop();
    // 已发声的节点会自然衰减结束；这里不强制断开，避免爆音
  }
}

// 全局单例
export const audio = new AudioManager();
export default audio;
