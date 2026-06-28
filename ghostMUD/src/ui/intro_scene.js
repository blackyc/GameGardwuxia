/**
 * intro_scene.js — 开幕身世选择 Cinematic 导演（7 幕状态机）
 *
 * 视听流程（对应用户描述）：
 *   幕1 PROLOGUE       身世叙事（打字机+板鼓逐字1:1同步）
 *   幕2 ORIGIN_REVEAL  身世三选一（循环板鼓+呼吸律动）
 *   幕3 ORIGIN_PICKED  涟漪+落锣（板鼓停→大堂鼓大锣）
 *   幕4 FACTION_INTRO  左大旗撤开+门派叙事
 *   幕5 FACTION_REVEAL 门派选择（循环板鼓+呼吸律动）
 *   幕6 FACTION_PICKED 涟漪+落锣+右大旗撤开+板鼓大锣高潮
 *   幕7 WAKEUP         惊堂木→喂喂喂→帷幕拉开→主场景淡入
 *
 * 依赖：AudioManager / Typewriter / identity_data / FACTIONS（来自 game.data）
 * 完成后：写 state.introSeen=true + storage.save()，回调 onStartComplete 让 game 进主循环。
 */

import audio from '../audio/AudioManager.js';
import { Typewriter } from './typewriter.js';
import { rollIdentities, applyIdentity, RARITY_MARK } from '../data/identity_data.js';

// 12 标准宗门名（narrative_design 权威），用于门派选择列表
const FACTION_LIST = [
  '问剑峰', '药王谷', '血禅寺', '焰心教', '傀坊', '逍遥驿',
  '忘尘宗', '紫霞山', '归墟', '镜阁', '肉慈斋', '青囊庐',
];

// 门派一句话哲学（用于选项展示，与 game.js ceremonies 呼应）
const FACTION_PHILOSOPHY = {
  '问剑峰': '剑法/轻功 · 守序善良 · 祖师炼剑，剑灵反噬',
  '药王谷': '毒功/暗器 · 中立善良 · 淬灵入药，菌丝现世',
  '血禅寺': '掌法/硬功 · 守序邪恶 · 以血引灵，方丈站起',
  '焰心教': '掌法/火功 · 混乱邪恶 · 圣火为灵火，焰中跪影',
  '傀坊':   '机关/傀儡 · 中立 · 108具傀儡，一具不记得造了什么',
  '逍遥驿': '轻功/杂学 · 混乱善良 · 不收弟子，只收过客',
  '忘尘宗': '道法/心修 · 守序中立 · 忘我忘尘，连"忘"也忘',
  '紫霞山': '感知/丝音 · 中立邪恶 · 千丝万缕，分不清谁的话',
  '归墟':   '生死/亡灵 · 绝对中立 · 行走生死边界，不全然活着',
  '镜阁':   '反射/映照 · 中立邪恶 · 万镜同照，照久不像自己',
  '肉慈斋': '血肉/异化 · 混乱邪恶 · （少有人敢提它的全名）',
  '青囊庐': '医术/解毒 · 中立善良 · 救回来的人偶尔说"不该醒"',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class IntroScene {
  constructor() {
    this.game = null;
    this.stage = null;
    this.tw = new Typewriter();
    this.rolled = [];        // roll 出的 3 个身世
    this.selectedOrigin = null;
    this.selectedFaction = null;
    this._aborted = false;
  }

  /**
   * 启动开场。返回后在 state.introSeen 置真后由 game 接管。
   * @param {object} game Game 实例
   */
  async start(game) {
    this.game = game;
    this._aborted = false;
    this._buildStage();
    this.stage.classList.add('active');

    // 幕1
    await this.act1Prologue();
    if (this._aborted) return this._cleanup();
    // 幕2
    this.rolled = rollIdentities(3);
    await this.act2OriginReveal();
    if (this._aborted) return this._cleanup();
    // 幕3 在玩家选择后由 _onOriginPicked 触发，再继续幕4
  }

  // ════════════════════════════════════════
  //  幕 1 · PROLOGUE 身世叙事
  // ════════════════════════════════════════
  async act1Prologue() {
    const nar = this._el('intro-narrative');
    nar.classList.remove('small');
    nar.style.display = '';
    const text = '正德年间，世有修行之人。\n吐纳灵气，参悟大道。\n然每破一境，便近祂一分。\n世人未必知晓——这是在敲谁的门。\n你的命数，自今日掷下。';
    await this.tw.typeTo(nar, text, {
      speed: 130,
      onChar: () => audio.playBangu(),
    });
    await sleep(600);
    this.tw.removeCursor();
    nar.style.display = 'none';
  }

  // ════════════════════════════════════════
  //  幕 2 · ORIGIN_REVEAL 身世三选一
  // ════════════════════════════════════════
  async act2OriginReveal() {
    const nar = this._el('intro-narrative');
    nar.classList.add('small');
    nar.style.display = '';
    await this.tw.typeTo(nar, '命运掷出了三枚骰子——', {
      speed: 120,
      onChar: () => audio.playBangu(),
      onComplete: () => this.tw.removeCursor(),
    });
    await sleep(400);
    nar.style.display = 'none';

    // 渲染 3 个身世选项
    const choices = this._el('intro-choices');
    choices.innerHTML = '';
    this.rolled.forEach((origin, idx) => {
      const rarityMark = RARITY_MARK[origin.rarity] || '';
      const dims = ['战斗','修炼','经济','社交','探索']
        .map((d) => `<span class="dim">${d}:${origin.summary[d]}</span>`).join('');
      const btn = document.createElement('div');
      btn.className = 'intro-choice';
      btn.dataset.originId = origin.id;
      btn.innerHTML = `
        <span class="rarity">${origin.rarity}${rarityMark}</span>
        <div class="origin-name">${origin.name}</div>
        <div class="origin-flavor">${origin.flavorText}</div>
        <div class="origin-summary">${dims}</div>`;
      btn.addEventListener('click', () => this._onOriginPicked(btn, origin));
      choices.appendChild(btn);
    });

    // 极稀有/双稀有提示
    const rareCount = this.rolled.filter((o) => o.rarity === '稀有' || o.rarity === '极稀有').length;
    if (rareCount >= 2) {
      this._hint('命运似乎在对你微笑——还是冷笑？');
    } else if (rareCount >= 1) {
      this._hint('✦ 稀有身份出现！');
    }

    // 未选前循环：低沉板鼓 + 呼吸律动
    audio.startBanguLoop(60);
    this._syncBreath(60); // 同步呼吸到 60bpm（1s/拍）
  }

  _onOriginPicked(btn, origin) {
    // 幕3：板鼓停 → 大锣 → 涟漪
    audio.stopBanguLoop();
    this._stopBreath();
    audio.playDaluo();
    this._inkRippleAt(btn);

    // 应用身世
    this.selectedOrigin = origin;
    applyIdentity(this.game, origin.id);

    // 淡出选项
    const choices = this._el('intro-choices');
    choices.querySelectorAll('.intro-choice').forEach((c) => c.style.pointerEvents = 'none');
    btn.style.outline = '2px solid #b82f1e';
    btn.style.outlineOffset = '4px';

    // 涟漪结束（1.2s）后进幕4
    setTimeout(() => {
      this._clearHint();
      choices.innerHTML = '';
      this.act4FactionIntro();
    }, 1300);
  }

  // ════════════════════════════════════════
  //  幕 4 · FACTION_INTRO 左大旗撤开 + 门派叙事
  // ════════════════════════════════════════
  async act4FactionIntro() {
    // 左大旗撤开
    audio.playWind(0.9);
    const flagL = this.stage.querySelector('.flag-left');
    flagL.classList.add('reveal');
    const trail = this.stage.querySelector('.flag-ink-trail.left');
    if (trail) { trail.style.left = '52%'; trail.classList.add('show'); setTimeout(() => trail.classList.remove('show'), 900); }

    await sleep(700);

    const nar = this._el('intro-narrative');
    nar.classList.remove('small');
    nar.style.display = '';
    nar.style.fontSize = '24px';
    const text = `你选了「${this.selectedOrigin.name}」之路。\n在小辈及冠这年，\n忽有一名访客远道而来。\n此人来自——`;
    await this.tw.typeTo(nar, text, {
      speed: 120,
      onChar: () => audio.playBangu(),
      onComplete: () => this.tw.removeCursor(),
    });
    await sleep(500);
    nar.style.display = 'none';
    this.act5FactionReveal();
  }

  // ════════════════════════════════════════
  //  幕 5 · FACTION_REVEAL 门派选择
  // ════════════════════════════════════════
  async act5FactionReveal() {
    const choices = this._el('intro-choices');
    choices.innerHTML = '';
    FACTION_LIST.forEach((fname) => {
      const btn = document.createElement('div');
      btn.className = 'intro-choice faction-choice';
      btn.dataset.faction = fname;
      btn.innerHTML = `
        <div class="origin-name">${fname}</div>
        <div class="origin-flavor">${FACTION_PHILOSOPHY[fname] || ''}</div>`;
      btn.addEventListener('click', () => this._onFactionPicked(btn, fname));
      choices.appendChild(btn);
    });

    audio.startBanguLoop(60);
    this._syncBreath(60);
  }

  _onFactionPicked(btn, fname) {
    audio.stopBanguLoop();
    this._stopBreath();
    audio.playDaluo();
    this._inkRippleAt(btn);

    this.selectedFaction = fname;
    // 复用 game.joinFaction 应用门派（含 ceremony 台词 + 入门技能）
    try { this.game.joinFaction(fname); } catch (e) { console.warn('[Intro] joinFaction error', e); }

    const choices = this._el('intro-choices');
    choices.querySelectorAll('.intro-choice').forEach((c) => c.style.pointerEvents = 'none');
    btn.style.outline = '2px solid #b82f1e';
    btn.style.outlineOffset = '4px';

    setTimeout(() => {
      choices.innerHTML = '';
      this.act6FactionPickedClimax();
    }, 1300);
  }

  // ════════════════════════════════════════
  //  幕 6 · 板鼓大锣高潮（右大旗撤开 + 加速）
  // ════════════════════════════════════════
  async act6FactionPickedClimax() {
    // 右大旗撤开
    audio.playWind(0.9);
    const flagR = this.stage.querySelector('.flag-right');
    flagR.classList.add('reveal');
    const trail = this.stage.querySelector('.flag-ink-trail.right');
    if (trail) { trail.style.right = '52%'; trail.classList.add('show'); setTimeout(() => trail.classList.remove('show'), 900); }

    await sleep(500);

    // 板鼓再起 + 渐快至 90bpm（高潮）
    audio.startBanguLoop(60);
    this._syncBreath(60);
    await sleep(700);
    audio.setBanguLoopBpm(75);
    this._syncBreath(75);
    await sleep(600);
    audio.setBanguLoopBpm(90);
    this._syncBreath(90);
    // 大锣叠加
    audio.playDaluo();
    await sleep(900);

    // 进幕7
    this.act7Wakeup();
  }

  // ════════════════════════════════════════
  //  幕 7 · WAKEUP 惊堂木 + 喂喂喂 + 帷幕拉开
  // ════════════════════════════════════════
  async act7Wakeup() {
    // 一切声音消失
    audio.stopAll();
    audio.playJingtangmu();
    await sleep(300);

    const wake = this._el('wake-box');
    wake.classList.add('active');
    wake.innerHTML = '';

    // 「喂！喂！」逐字 + 方框抖动
    const chars = ['喂！', '喂！'];
    for (const c of chars) {
      const span = document.createElement('span');
      span.textContent = c;
      wake.appendChild(span);
      wake.classList.remove('shake');
      void wake.offsetWidth; // 触发 reflow 重启动画
      wake.classList.add('shake');
      await sleep(450);
    }
    await sleep(300);

    // 「看这里啊喂！」+ 点击「......」
    const prompt = document.createElement('span');
    prompt.className = 'wake-prompt';
    prompt.textContent = '看这里啊喂！  〔......〕';
    wake.appendChild(prompt);

    await new Promise((resolve) => {
      prompt.addEventListener('click', () => {
        wake.classList.remove('active');
        resolve();
      }, { once: true });
    });

    // 帷幕拉开 + 主场景淡入
    const curtain = this._el('intro-curtain');
    const reveal = this._el('intro-scene-reveal');
    reveal.classList.add('show');
    await sleep(200);
    curtain.classList.add('open');
    await sleep(1500);

    // 收尾：写存档 + 通知 game 进主循环
    this._finish();
  }

  // ════════════════════════════════════════
  //  辅助方法
  // ════════════════════════════════════════

  /** 构建 #intro-stage 内部 DOM（首次启动） */
  _buildStage() {
    let stage = document.getElementById('intro-stage');
    if (!stage) {
      stage = document.createElement('div');
      stage.id = 'intro-stage';
      document.body.appendChild(stage);
    }
    stage.innerHTML = `
      <div class="intro-flag flag-left"></div>
      <div class="intro-flag flag-right"></div>
      <div class="flag-ink-trail left"></div>
      <div class="flag-ink-trail right"></div>
      <div class="intro-narrative" id="intro-narrative"></div>
      <div class="intro-choices" id="intro-choices"></div>
      <div class="intro-hint" id="intro-hint"></div>
      <div class="wake-box" id="wake-box"></div>
      <div class="intro-scene-reveal" id="intro-scene-reveal"></div>
      <div class="intro-curtain" id="intro-curtain"></div>
      <button class="intro-skip" id="intro-skip">跳过 ▸</button>
    `;
    this.stage = stage;
    // 跳过按钮
    const skip = stage.querySelector('#intro-skip');
    skip.addEventListener('click', () => this._skip(), { once: true });
  }

  _el(id) {
    return this.stage.querySelector('#' + id) || document.getElementById(id);
  }

  /** 在某元素位置触发水墨涟漪 */
  _inkRippleAt(el) {
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'ink-ripple';
    ripple.style.position = 'fixed';
    ripple.style.left = (rect.left + rect.width / 2) + 'px';
    ripple.style.top = (rect.top + rect.height / 2) + 'px';
    ripple.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1300);
  }

  _hint(text) {
    const h = this._el('intro-hint');
    if (h) h.textContent = text;
  }
  _clearHint() {
    const h = this._el('intro-hint');
    if (h) h.textContent = '';
  }

  /** 同步呼吸律动到板鼓 bpm（注入 animation-duration）*/
  _syncBreath(bpm) {
    const dur = (60 / bpm).toFixed(3) + 's';
    this.stage.querySelectorAll('.intro-choice, .tw-cursor').forEach((el) => {
      el.style.animationDuration = dur;
    });
  }
  _stopBreath() {
    this.stage.querySelectorAll('.intro-choice').forEach((el) => {
      el.style.animation = 'none';
    });
  }

  /** 跳过开场：直接进主游戏（仍写 introSeen） */
  _skip() {
    console.log('[Intro] 用户跳过开场');
    this._aborted = true;
    this.tw.cancel();
    audio.stopAll();
    this._finish();
  }

  /** 收尾：写存档 + 隐藏舞台 + 回调 game */
  _finish() {
    // 兜底应用散修（若用户跳过未选门派）
    if (!this.selectedFaction) {
      this.game.state.faction = this.game.state.faction || '散修';
    }
    if (!this.selectedOrigin) {
      // 跳过未选身世：默认市井孤儿（最常见的中性身世）
      applyIdentity(this.game, 'shijing_guer');
    }
    this.game.state.introSeen = true;
    try { this.game.storage.save(this.game.state); } catch (e) { console.warn('[Intro] 存档失败', e); }

    this._cleanup();
    // 通知 game 进入主循环
    if (typeof this.game.onIntroComplete === 'function') {
      this.game.onIntroComplete();
    } else {
      // 兜底：直接启动散修流程
      this.game.startGameAsRogue();
    }
  }

  _cleanup() {
    if (this.stage) {
      this.stage.classList.remove('active');
      setTimeout(() => { if (this.stage) this.stage.remove(); this.stage = null; }, 300);
    }
    audio.stopAll();
  }
}

export default IntroScene;
