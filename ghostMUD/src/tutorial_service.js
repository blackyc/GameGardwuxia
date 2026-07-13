import { BATTLE_MODES, BATTLE_OUTCOMES } from './combat_contract.js';

const ROOMS = Object.freeze({
  quarters: '问剑峰·弟子房',
  practice: '问剑峰·剑坪',
  pool: '问剑峰·洗剑池',
  kitchen: '问剑峰·伙房',
  bamboo: '问剑峰·竹林',
  grave: '问剑峰·剑冢',
});

function freshState() {
  return {
    version: 1,
    campaign: 'wenjianfeng_golden3',
    chapter: 2,
    node: 'ch2_ready',
    checkpoint: 'ch2_ready',
    sequence: [],
    counters: {
      practiceAttempts: 0,
      waterProgress: 0,
      waterBalance: 0,
      waterTaps: 0,
      bambooCount: 0,
      bambooHits: 0,
      bambooTotalHits: 0,
      bambooCombo: 0,
      loadedMoves: 0,
    },
    carry: { waterUnits: 0, choppingKnife: false, boarCarcass: false },
    unlockedSlots: [],
    boarCombatResult: null,
    residualSwordSeen: false,
  };
}

export class TutorialService {
  constructor(game) {
    this.game = game;
  }

  get data() {
    return this.game.data?.WENJIANFENG_TUTORIAL_CH2 || {};
  }

  get state() {
    return this.game.state.tutorialActionState;
  }

  isChapter2Active() {
    const phase = this.game.state.tutorialPhase;
    return phase === 'ch2_ready' || phase === 'ch2_active';
  }

  _ensureState() {
    const current = this.game.state.tutorialActionState;
    if (!current || current.campaign !== 'wenjianfeng_golden3' || current.chapter !== 2) {
      this.game.state.tutorialActionState = freshState();
    } else {
      current.sequence = Array.isArray(current.sequence) ? current.sequence : [];
      current.counters = { ...freshState().counters, ...(current.counters || {}) };
      current.carry = { ...freshState().carry, ...(current.carry || {}) };
      current.unlockedSlots = Array.isArray(current.unlockedSlots) ? current.unlockedSlots : [];
    }
    return this.game.state.tutorialActionState;
  }

  resume() {
    const g = this.game;
    if (g.state.faction !== '问剑峰') return;
    if (g.state.tutorialPhase === 'ch1_done' && !g.state.tutorialActionState) {
      this.startChapter2();
      return;
    }
    if (!this.isChapter2Active()) return;
    const state = this._ensureState();
    if (state.node === 'boar_combat') {
      state.node = 'boar_pending';
      g.addLog('你重新握紧木剑。竹林里的撞击声仍在逼近。', 'system');
    } else if (state.node === 'residual_showcase') {
      state.node = 'anomaly';
      g.addLog('那三道剑路仍停在你眼前。凝神，重新看清残剑师姐的手。', 'system');
    }
    g.renderer?.updateUI?.('location');
  }

  chapterCompleted(chapter) {
    if (chapter === 1) this.startChapter2();
  }

  startChapter2() {
    const g = this.game;
    if (g.state.faction !== '问剑峰') return false;
    const state = this._ensureState();
    state.node = 'ch2_ready';
    state.checkpoint = 'ch2_ready';
    g.state.tutorialPhase = 'ch2_ready';
    g.addLog('第二章·入门：回弟子房歇下。明日清晨，萧远在剑坪授剑。', 'system');
    this._refresh();
    return true;
  }

  beginMorningPractice() {
    const g = this.game;
    const state = this._ensureState();
    if (state.node !== 'ch2_ready') return false;
    if (g.state.location !== ROOMS.quarters) {
      g.addLog('晨课前先回弟子房歇下。', 'system');
      return false;
    }
    state.node = 'morning_practice';
    state.checkpoint = 'morning_practice';
    state.sequence = [];
    g.state.tutorialPhase = 'ch2_active';
    g.state.location = ROOMS.practice;
    if (!g.state.explored.includes(ROOMS.practice)) g.state.explored.push(ROOMS.practice);
    this._emitNode('morningPractice');
    this._refresh();
    return true;
  }

  beforeMove(target) {
    if (!this.isChapter2Active()) return true;
    const state = this._ensureState();
    const lockedNodes = new Set(['morning_practice', 'water_fill', 'water_balance', 'bamboo_cut', 'boar_pending', 'boar_combat', 'anomaly', 'residual_showcase']);
    if (lockedNodes.has(state.node)) {
      this.game.addLog(this.getViewModel()?.blockedMove || '眼前的事还没有做完。', 'system');
      return false;
    }
    if (state.node === 'water_loaded') {
      state.counters.loadedMoves++;
      this.game.state.mp = Math.max(0, this.game.state.mp - 3);
      if (state.counters.loadedMoves === 1 && state.carry.waterUnits > 1) {
        state.carry.waterUnits = 1;
        this._emitNode('zhouQiSpill');
      } else {
        this.game.addLog('扁担压着肩头，脚步慢了半拍。真气 -3。', 'info');
      }
    }
    return true;
  }

  afterMove(target) {
    if (!this.isChapter2Active()) return;
    const state = this._ensureState();
    if (state.node === 'water_to_pool' && target === ROOMS.pool) {
      state.node = 'water_fill';
      state.checkpoint = 'water_fill';
      this._emitNode('waterPool');
    } else if (state.node === 'water_loaded' && target === ROOMS.kitchen) {
      state.node = 'bamboo_to_forest';
      state.checkpoint = 'bamboo_to_forest';
      state.carry.waterUnits = 0;
      this._emitNode('waterDelivered');
    } else if (state.node === 'bamboo_to_forest' && target === ROOMS.bamboo) {
      state.node = 'bamboo_cut';
      state.checkpoint = 'bamboo_cut';
      state.carry.choppingKnife = true;
      this._emitNode('bambooWork');
    } else if (state.node === 'aftermath' && target === ROOMS.kitchen) {
      state.node = 'deliver_to_jianweng';
      state.checkpoint = 'deliver_to_jianweng';
      state.carry.boarCarcass = true;
      this._emitNode('boarFeast');
    } else if (state.node === 'deliver_to_jianweng' && target === ROOMS.grave) {
      this._completeChapter2();
    }
    this._refresh();
  }

  handleAction(action, payload = {}) {
    const state = this._ensureState();
    switch (action) {
      case 'begin_morning': return this.beginMorningPractice();
      case 'lesson_slot': return this._chooseLessonSlot(String(payload.slot || ''));
      case 'lesson_reset': state.sequence = []; this._refresh(); return true;
      case 'fill_water': return this._fillWater();
      case 'balance_water': return this._balanceWater(String(payload.side || ''));
      case 'cut_bamboo': return this._cutBamboo();
      case 'face_anomaly': return this._startShowcase();
      case 'start_boar': return this._startBoarCombat();
      default: return false;
    }
  }

  _chooseLessonSlot(slot) {
    const g = this.game;
    const state = this.state;
    if (state.node !== 'morning_practice' || !['A', 'B'].includes(slot)) return false;
    if (state.sequence.length >= 2) state.sequence = [];
    state.sequence.push(slot);
    if (state.sequence.length < 2) {
      g.addLog(slot === 'A' ? '你先立起式，剑锋从风里开出第一道口。' : '你抢先追出承式，却觉得脚下没有根。', 'info');
      this._refresh();
      return true;
    }
    state.counters.practiceAttempts++;
    if (state.sequence[0] !== 'A' || state.sequence[1] !== 'B') {
      g.addLog('萧远摇头：「无起何来承？重排。」', 'system');
      state.sequence = [];
      this._refresh();
      return false;
    }
    const fullChart = { A: 1001, B: 1002, C: 1003, D: 1004, E: 1005 };
    Object.values(fullChart).forEach(skillId => {
      g.state.skills[skillId] = g.state.skills[skillId] || { level: 1, exp: 0 };
    });
    g.state.chart = fullChart;
    g.state.xiaoyuanFirstLessonCompleted = true;
    state.unlockedSlots = ['A', 'B', 'C', 'D', 'E'];
    g.addLog('萧远将完整的问剑五式战诀交给你。起承转合归，战时会依次自行运转。', 'special');
    state.node = 'water_to_pool';
    state.checkpoint = 'water_to_pool';
    this._emitNode('lessonComplete');
    this._refresh();
    return true;
  }

  _fillWater() {
    const state = this.state;
    if (state.node !== 'water_fill' || this.game.state.location !== ROOMS.pool) return false;
    state.carry.waterUnits = 2;
    state.counters.waterProgress = 0;
    state.counters.waterBalance = 0;
    state.counters.waterTaps = 0;
    state.counters.loadedMoves = 0;
    state.node = 'water_balance';
    state.checkpoint = 'water_fill';
    this.game.addLog('你把两只木桶灌满。扁担一上肩，水面立刻左右晃荡。', 'event');
    this._refresh();
    return true;
  }

  _balanceWater(side) {
    const state = this.state;
    const c = state.counters;
    if (state.node !== 'water_balance' || !['left', 'right'].includes(side)) return false;
    c.waterTaps++;
    c.waterProgress++;
    c.waterBalance += side === 'left' ? 1 : -1;
    const drifting = Math.abs(c.waterBalance) >= 3;
    if (drifting) {
      state.carry.waterUnits = Math.max(0, Number((state.carry.waterUnits - 0.2).toFixed(1)));
      c.waterBalance += c.waterBalance > 0 ? -1 : 1;
      c.waterProgress = Math.max(0, c.waterProgress - 1);
      this.game.addLog('桶沿一斜，冷水泼出一片。换边压住扁担！', 'combat');
    } else if (c.waterTaps % 4 === 0) {
      this.game.addLog('你的肩步渐渐合上水势，扁担不再乱跳。', 'info');
    }
    if (state.carry.waterUnits <= 0.5) {
      state.carry.waterUnits = 2;
      c.waterProgress = 0;
      c.waterBalance = 0;
      this.game.addLog('水已经洒得不够交差。你重新把两桶灌满。', 'system');
    }
    if (c.waterProgress >= 14) {
      state.node = 'water_loaded';
      state.checkpoint = 'water_loaded';
      c.waterBalance = 0;
      this.game.addLog('你压稳两桶水，终于迈上石阶。接下来要把它们亲自挑到伙房。', 'event');
    }
    this._refresh();
    return true;
  }

  _cutBamboo() {
    const state = this.state;
    if (state.node !== 'bamboo_cut' || this.game.state.location !== ROOMS.bamboo) return false;
    const required = 3 + (state.counters.bambooCount % 3);
    state.counters.bambooTotalHits++;
    state.counters.bambooCombo++;
    const flowingHit = state.counters.bambooCombo % 6 === 0;
    state.counters.bambooHits += flowingHit ? 2 : 1;
    const hit = state.counters.bambooHits;
    this.game.addLog(flowingHit ? '刀势借着竹身回弹连进两寸！' : `砍刀咬进竹身，第 ${Math.min(hit, required)}/${required} 下。`, flowingHit ? 'event' : 'info');
    if (hit >= required) {
      state.counters.bambooHits = 0;
      state.counters.bambooCount++;
      this.game.addLog(`竹身喀地倒下。已砍 ${state.counters.bambooCount}/7 根。`, 'event');
      if (state.counters.bambooCount >= 7) {
        state.node = 'boar_pending';
        state.checkpoint = 'boar_pending';
        this._emitNode('boarArrival');
      }
    }
    this._refresh();
    return true;
  }

  _startBoarCombat() {
    const state = this.state;
    if (state.node !== 'boar_pending') return false;
    const boar = this.data.boar || { id: 'wjf_ch2_boar', name: '黑鬃野猪', hp: 850, atk: 16, def: 8, spd: 9, exp: 0, gold: 0 };
    state.node = 'boar_combat';
    state.checkpoint = 'boar_pending';
    this.game.markDirty?.();
    return this.game.startCombat(boar.name, boar, {
      mode: BATTLE_MODES.TUTORIAL,
      encounterId: boar.id,
      battleId: `wjf-ch2-boar-${Date.now()}`,
      playerChart: { ...(this.game.state.chart || { A: 1001, B: 1002, C: 1003, D: 1004, E: 1005 }) },
      grantRewards: false,
      onComplete: result => this._handleBoarResult(result),
    });
  }

  _handleBoarResult(result) {
    const state = this._ensureState();
    const won = result.outcome === BATTLE_OUTCOMES.VICTORY;
    state.boarCombatResult = won ? 'win' : 'lose';
    this.game.state.boarCombatResult = state.boarCombatResult;
    if (won) {
      this._emitNode('boarVictory');
    } else {
      this.game.state.hp = Math.max(25, Math.floor(this.game.state.maxHp * 0.35));
      this._emitNode('boarDefeat');
      this.game.renderer?.updateUI?.(['char', 'status', 'progress', 'location']);
    }
    state.node = 'anomaly';
    state.checkpoint = 'anomaly';
    this._emitNode('anomaly');
    this._refresh();
  }

  _startShowcase() {
    const state = this.state;
    if (state.node !== 'anomaly') return false;
    const showcase = this.data.showcase || {};
    const enemy = showcase.enemy || { id: 'wjf_ch2_unknown', name: '？？？', hp: 100, atk: 0, def: 0, spd: 0, exp: 0, gold: 0 };
    state.node = 'residual_showcase';
    state.checkpoint = 'anomaly';
    this.game.markDirty?.();
    return this.game.startCombat(enemy.name, enemy, {
      mode: BATTLE_MODES.SHOWCASE,
      encounterId: enemy.id,
      battleId: `wjf-ch2-showcase-${Date.now()}`,
      playerChart: showcase.chart || { A: 1091, B: 1092, D: 1094 },
      grantRewards: false,
      manualControl: true,
      enemyPassive: true,
      startReady: true,
      syncPlayerState: false,
      controlledActorId: 'wenjianfeng_canjian',
      playerActorId: 'wenjianfeng_canjian',
      playerName: '残剑师姐',
      hideEnemyHp: true,
      playerOverride: { hp: 100, maxHp: 100, mp: 100, maxMp: 100, atk: 1, def: 999, weaponAtk: 0, critProb: 0, dodge: 1, mpReg: 0 },
      onComplete: result => this._handleShowcaseResult(result),
    });
  }

  _handleShowcaseResult(result) {
    const state = this._ensureState();
    if (result.outcome !== BATTLE_OUTCOMES.VICTORY) {
      state.node = 'anomaly';
      this.game.addLog('那一瞬的剑路断了。凝神，再看一次。', 'system');
      this._refresh();
      return;
    }
    state.residualSwordSeen = true;
    this.game.state.residualSwordSeen = true;
    state.node = 'aftermath';
    state.checkpoint = 'aftermath';
    this._emitNode('aftermath');
    this._refresh();
  }

  _completeChapter2() {
    const state = this.state;
    state.node = 'ch2_done';
    state.checkpoint = 'ch2_done';
    state.carry.boarCarcass = false;
    this.game.state.tutorialPhase = 'ch2_done';
    this._emitNode('jianweng');
    this.game.addLog('第二章·入门 完。残剑师姐的三道剑路，已经留在你的记忆里。', 'system');
    this._refresh();
  }

  _emitNode(key) {
    const lines = this.data.nodes?.[key]?.lines || this.data.nodes?.[key] || [];
    const normalized = Array.isArray(lines) ? lines : [lines];
    normalized.filter(Boolean).forEach(line => {
      const text = typeof line === 'string' ? line : line.text;
      const speaker = typeof line === 'object' ? line.speaker : '';
      this.game.addLog(speaker && speaker !== 'narrator' ? `${speaker}：${text}` : text, 'event');
    });
  }

  getViewModel() {
    if (!this.isChapter2Active()) return null;
    const state = this._ensureState();
    const c = state.counters;
    const models = {
      ch2_ready: { title: '第二章·入门', body: '回弟子房歇下。明日清晨，萧远在剑坪授剑。', objective: '在弟子房点击「休憩」', blockedMove: '先回弟子房歇下。' },
      morning_practice: { title: '萧远的晨课', body: '将两式排成一条能运转的剑路。', objective: `已排：${state.sequence.map(s => s === 'A' ? '起式' : '承式').join(' → ') || '尚未落式'}`, actions: [
        { id: 'lesson_slot', label: '起式·劈风剑', slot: 'A' },
        { id: 'lesson_slot', label: '承式·追影刺', slot: 'B' },
        { id: 'lesson_reset', label: '重排' },
      ], blockedMove: '萧远还在等你排出起、承两式。' },
      water_to_pool: { title: '上午·挑水', body: '萧远收剑，让你去伙房帮忙。', objective: '前往洗剑池' },
      water_fill: { title: '洗剑池', body: '池水很冷，池底的断剑在水纹下发白。', objective: '把两桶水装满', actions: [{ id: 'fill_water', label: '装满木桶' }], blockedMove: '木桶还是空的。' },
      water_balance: {
        title: '挑水·稳住扁担',
        body: '左右交替压住扁担。连续偏向同一侧会洒水，水洒尽便要重装。',
        objective: `山路 ${c.waterProgress}/14 · 桶水 ${state.carry.waterUnits.toFixed(1)}/2.0`,
        meters: [
          { label: '路程', value: c.waterProgress, max: 14 },
          { label: '桶水', value: state.carry.waterUnits, max: 2 },
        ],
        actions: [
          { id: 'balance_water', label: '左肩压稳', side: 'left' },
          { id: 'balance_water', label: '右肩压稳', side: 'right' },
        ],
        blockedMove: '先把晃动的扁担稳住。',
      },
      water_loaded: { title: '负重而行', body: `桶中还剩 ${state.carry.waterUnits}/2 份水。每次移动消耗 3 点真气。`, objective: '把水挑到伙房' },
      bamboo_to_forest: { title: '下午·砍竹', body: '劳叔要十根合手的竹子，先去后山竹林。', objective: '前往竹林' },
      bamboo_cut: {
        title: '砍竹·连刀',
        body: `第 ${Math.min(7, c.bambooCount + 1)} 根。连续落刀会积蓄刀势，每第六刀顺势多进一层。`,
        objective: `已砍 ${c.bambooCount}/7 · 当前 ${c.bambooHits}/${3 + (c.bambooCount % 3)} · 连刀 ${c.bambooCombo}`,
        meters: [
          { label: '竹材', value: c.bambooCount, max: 7 },
          { label: '刀口', value: c.bambooHits, max: 3 + (c.bambooCount % 3) },
        ],
        actions: [{ id: 'cut_bamboo', label: '挥刀砍竹' }],
        blockedMove: '劳叔交代的竹子还没有砍齐。',
      },
      boar_pending: { title: '黑鬃野猪', body: '竹林深处传来闷响。獠牙已经撞开竹叶。', objective: '握紧木剑，进入正式战斗', actions: [{ id: 'start_boar', label: '迎战野猪', danger: true }], blockedMove: '野猪封住了退路。' },
      boar_combat: { title: '战斗中', body: '战斗必须以一方血量归零结束。', objective: '运转起式、承式' },
      anomaly: { title: '风停了', body: '黑暗深处亮起两点红光。你无法行动。', objective: '暂时控制残剑师姐', actions: [{ id: 'face_anomaly', label: '看好这一剑', danger: true }], blockedMove: '你的四肢像被万年风雪冻住。' },
      residual_showcase: { title: '残剑师姐', body: '按起式、承式、合式的次序亲手落剑。', objective: '敌人的数值不可知' },
      aftermath: { title: '沉默的余波', body: '残剑师姐已经往回走了。劳叔让你把野猪拖去伙房。', objective: '前往伙房' },
      deliver_to_jianweng: { title: '野猪加餐', body: '老蔡留了一碗肉，让你送上剑冢。', objective: '前往剑冢交给剑翁' },
    };
    return models[state.node] || null;
  }

  _refresh() {
    this.game.markDirty?.();
    this.game.renderer?.updateUI?.('location');
  }
}

export default TutorialService;
