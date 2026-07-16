/**
 * battle_async.js — 异步CD+双门禁+顺序出招 战斗引擎 v3.0
 *
 * 核心机制：
 * 1. 异步CD：每招独立冷却计时器，100ms tick 速率
 * 2. 双门禁：CD就绪 AND 真气充足 → 自动出招
 * 3. 顺序出招：A→B→C→D→E 固定序列，不可跳槽，连打机制
 * 4. 开局全CD：所有技能同时开始读CD
 * 5. 真气门禁4选1：真气不足时触发，5秒未选默认调息
 * 6. 异常状态7种 + 8种交互规则
 * 7. 羁绊概率三档制
 * 8. 敌人AI：BOSS用战诀，普通敌人用简单AI
 *
 * 依赖：window.COMBAT_SKILLS_V3, window.COMBAT_BOSS_V3, window.COMBAT_EQUIPMENT_V3
 * 不修改 game.js，通过引用 game 实例操作
 */

import { getData } from './data/data_loader.js';
import {
  BATTLE_MODES,
  BATTLE_OUTCOMES,
  normalizeBattleOutcome,
  normalizeCombatSkill,
  getSkillCost,
  getCorruptionLevel,
  getWeaponAtk,
  getArmorDef,
} from './combat_contract.js';
import { createBattleRng } from './battle_rng.js';

// ============================================================
//  常量 & 查表
// ============================================================

const TICK_RATE = 100;            // 100ms / tick = 0.1s
const TICK_SECONDS = TICK_RATE / 1000; // 0.1s
const MP_REG_INTERVAL = 0.5;      // 真气恢复间隔（秒）
const MP_GATE_TIMEOUT = 5.0;      // 真气门禁超时（秒）
const MP_GATE_REST_RECOVER = 30;  // 调息恢复量
const MP_GATE_BASIC_COST = 10;    // 平斩真气消耗
const SLOTS = ['A', 'B', 'C', 'D', 'E'];
const SLOT_NAMES = { A: '起式', B: '承式', C: '转式', D: '合式', E: '归式' };
// 完整动作句模板。只润色战报，不参与命中、伤害、CD 或胜负计算。
const COMBAT_NARRATION = {
  player: [
    ({ skill, dmg }) => `你先发制人，${skill}猛然递出，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你招式如流，${skill}直取中门，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你虚实相生，${skill}倏忽而至，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你一招羚羊挂角，${skill}无迹可寻，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你剑走偏锋，${skill}斜掠而入，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你后发先至，${skill}截住来势，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你踏中宫而进，${skill}迎面逼上，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你觑准破绽，${skill}骤然发难，造成伤害 ${dmg}！`,
  ],
  combo: [
    ({ skill, dmg }) => `你一气呵成，${skill}紧随前式，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你连环递进，${skill}不给喘息，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你行云流水，${skill}顺势而出，造成伤害 ${dmg}！`,
    ({ skill, dmg }) => `你进退有据，${skill}再迫一步，造成伤害 ${dmg}！`,
  ],
  enemy: [
    ({ actor, skill, dmg }) => `${actor}抢步欺近，${skill}直袭而来，你受到伤害 ${dmg}！`,
    ({ actor, skill, dmg }) => `${actor}后发先至，${skill}截住你的去势，你受到伤害 ${dmg}！`,
    ({ actor, skill, dmg }) => `${actor}步步紧逼，${skill}骤然递出，你受到伤害 ${dmg}！`,
    ({ actor, skill, dmg }) => `${actor}虚晃一招，${skill}旋即攻至，你受到伤害 ${dmg}！`,
    ({ actor, skill, dmg }) => `${actor}攻守相济，${skill}乘隙而入，你受到伤害 ${dmg}！`,
    ({ actor, skill, dmg }) => `${actor}骤然发难，${skill}来势甚急，你受到伤害 ${dmg}！`,
  ],
};

function formatCombatNarration(templates, eventSeq, context) {
  const template = templates[Math.abs(Number(eventSeq) || 0) % templates.length];
  return template ? template(context) : `${context.skill}命中，造成伤害 ${context.dmg}！`;
}

function getCombatSkillName(name) {
  return String(name || '一式').replace(/^(?:起式|承式|转式|合式|归式)[·・:：\s-]*/, '') || '一式';
}

// 异常状态配置
const STATUS_CONFIG = {
  shigu:   { name: `尸蛊`, maxStacks: 99,  icon: `🐛` },
  lieshang:{ name: `裂伤`, maxStacks: 99,  icon: `🩸` },
  yehuo:   { name: `业火`, maxStacks: 20,  icon: `🔥` },
  ningyuan:{ name: `凝渊`, maxStacks: 30,  icon: `❄️` },
  pogang:  { name: `破罡`, maxStacks: 20,  icon: `💔` },
  mihun:   { name: `迷魂`, maxStacks: 10,  icon: `🌫️` },
  nixue:   { name: `逆血`, maxStacks: 10,  icon: `🫀` },
};

// 凝渊渊冻阈值
const NINGYUAN_FREEZE_THRESHOLD = 10;

// 状态交互优先级（数字越小越先结算）
const INTERACTION_PRIORITY = {
  zhengfa:  1,  // 蒸发（业火+凝渊）
  donggu:   2,  // 冻蛊（尸蛊+凝渊）
  binglie:  3,  // 冰裂（裂伤+凝渊）
  fengu:    4,  // 焚蛊（尸蛊+业火）
  fenjia:   5,  // 焚甲（破罡+业火）
  xueyong:  6,  // 血涌（裂伤+逆血）
  suihun:   7,  // 碎魂（迷魂+破罡）
  xinmo:    8,  // 心魔（迷魂+逆血）
};

// 畸变篡改基础概率表
const HIJACK_BASE_RATE = [0, 0.03, 0.08, 0.15, 0.25, 0.40];

// ============================================================
//  辅助函数
// ============================================================

/** 从卷宗数据中查找技能，归一化后返回 */
function getSkillData(skillId) {
  const data = getData();
  if (data.COMBAT_SKILLS_V3) {
    const found = data.COMBAT_SKILLS_V3.find(s => s.id === skillId);
    if (found) return normalizeCombatSkill(found);
  }
  // fallback：构造一个最小可用技能
  return normalizeCombatSkill({
    id: skillId || 0,
    name: `未知招式`,
    type: 'melee',
    dmgType: 'physical',
    skillNum: 20,
    skillNumLvAdd: 0,
    cd: 2.0,
    mpCost: 10,
    target: 'enemy',
    targetNum: 1,
    duNum: 0, bleedNum: 0, burnNum: 0,
    iceNum: 0, pogangNum: 0, mihunNum: 0, nixueNum: 0,
    tags: [],
    belong: 0,
  });
}

/** 计算技能伤害 */
function calcSkillDamage(skill, atk, def, realm) {
  const skillNum = skill.skillNum + (skill.skillNumLvAdd || 0) * realm;
  let dmg = skillNum * atk - def;
  return Math.max(1, Math.floor(dmg));
}

/** 计算技能伤害（含武器加成） */
function calcSkillDamageWithWeapon(skill, atk, weaponAtk, def, realm) {
  const skillNum = skill.skillNum + (skill.skillNumLvAdd || 0) * realm;
  let dmg = skillNum * (atk + weaponAtk) - def;
  return Math.max(1, Math.floor(dmg));
}

/** 计算暴击 */
function rollCrit(critProb, critRate, random) {
  if (random() < critProb) {
    return critRate; // 暴击倍率
  }
  return 1.0;
}

/** 获取敌人数据 */
function getEnemyData(enemyData) {
  const hp = enemyData.hp ?? 50;
  return {
    name: enemyData.name || `敌人`,
    hp,
    maxHp: hp,
    atk: enemyData.atk ?? 5,
    def: enemyData.def ?? 1,
    spd: enemyData.spd ?? 6,
    data: enemyData,
    physicalImmune: enemyData.physicalImmune || false,
    boss: enemyData.boss || false,
    enemyChart: enemyData.chart || null,
  };
}

// ============================================================
//  BattleEngine 主类
// ============================================================

export class BattleEngine {
  /**
   * @param {Game} game - Game 实例引用
   */
  constructor(game, options = {}) {
    this.game = game;
    this.state = game.state;
    this.options = options;
    this.rng = options.rng || createBattleRng(options.seed ?? Date.now(), options.rngState);
    this.random = () => this.rng.next();
    this.tickRate = TICK_RATE;
    this.battleState = null;
    this.timerId = null;
    this._mpRegAccumulator = 0;
    this._onUpdate = null; // UI 更新回调
    this._onLog = null;    // 日志回调
    this._onMpGate = null; // 门禁弹窗回调
    this._onEnd = null;    // 战斗结束回调
  }

  // ----------------------------------------------------------
  //  战斗启动 / 停止
  // ----------------------------------------------------------

  /**
   * 启动战斗
   * @param {object} enemyData - 敌人数据
   * @param {object} playerChart - 战诀 { A: skillId, B: skillId, C: skillId, D: skillId, E: skillId }
   */
  startCombat(enemyData, playerChart, options = {}) {
    const s = this.state;
    const enemy = getEnemyData(enemyData);
    const config = { ...this.options, ...options };
    const battleId = config.battleId || `battle-${Date.now()}-${enemy.name}`;
    const mode = Object.values(BATTLE_MODES).includes(config.mode)
      ? config.mode
      : BATTLE_MODES.ENCOUNTER;

    // 计算玩家属性
    const realm = s.realm || 0;
    const weaponAtk = getWeaponAtk(s);
    const armorDef = getArmorDef(s);
    const atk = (s.attack || 10);
    const def = (s.defense || 1) + armorDef;
    const maxHp = s.maxHp || 100;
    const maxMp = s.maxMp || 80;
    const spd = 6.0 + realm;

    // 获取真气恢复速率
    const mpReg = this._getPlayerMpReg();

    const chart = { ...playerChart };
    const firstSlot = Math.max(0, SLOTS.findIndex(slot => chart[slot]));
    const playerOverride = config.playerOverride || {};
    const player = {
      hp: s.hp ?? maxHp,
      maxHp,
      mp: s.mp ?? maxMp,
      maxMp,
      atk,
      def,
      weaponAtk,
      spd,
      critProb: this._getPlayerCritProb(),
      critRate: this._getPlayerCritRate(),
      mpReg,
      dodge: this._getPlayerDodge(),
      ...playerOverride,
    };
    player.maxHp = Number(player.maxHp || player.hp || 1);
    player.hp = Math.min(player.maxHp, Number(player.hp ?? player.maxHp));
    player.maxMp = Number(player.maxMp ?? player.mp ?? 0);
    player.mp = Math.min(player.maxMp, Number(player.mp ?? player.maxMp));

    this.battleState = {
      active: true,
      paused: false,
      battleId,
      mode,
      encounterId: config.encounterId || enemyData.id || enemy.name,
      playerActorId: config.playerActorId || 'player',
      controlledActorId: config.controlledActorId || config.playerActorId || 'player',
      playerName: config.playerName || (config.controlledActorId && config.controlledActorId !== 'player' ? config.controlledActorId : '你'),
      syncPlayerState: config.syncPlayerState !== false,
      manualControl: config.manualControl === true,
      enemyPassive: config.enemyPassive === true,
      hideEnemyHp: config.hideEnemyHp === true,
      outcome: null,
      rewardSettled: false,
      grantRewards: config.grantRewards !== false && mode !== BATTLE_MODES.SHOWCASE,
      enemy,
      player,
      chart,
      currentSlot: firstSlot,
      slotUnlocked: SLOTS.map((slot, idx) => idx === firstSlot && Boolean(chart[slot])),
      round: 0,
      // CD 系统：开局所有技能同时开始读CD（从最大值开始倒数）
      cooldowns: this._initCooldowns(playerChart),
      // 异常状态
      playerStatus: this._freshStatus(),
      enemyStatus: this._freshStatus(),
      // 干预
      interventionUsed: { variant: false, potion: false, retreat: false },
      potionUsedThisCombat: false,
      tutorialDefense: { guardCharges: 0, dodgeCharges: 0, guardUsed: 0, dodgeUsed: 0 },
      // 敌人
      enemyChart: enemy.enemyChart || null,
      enemySlot: 0,
      enemyCooldowns: null,
      enemyAiCooldown: 0,
      // 门禁
      mpGatePending: false,
      mpGateSkill: null,
      mpGateTimer: 0,
      // 日志
      log: [],
      events: [],
      eventSeq: 0,
      // 连击
      comboCount: 0,
      // 畸变
      hijackPending: false,
      // 羁绊
      bonds: this._scanBonds(chart),
      // 计时
      battleTime: 0,
      // 连续命中计数（用于叙事触发）
      consecutiveHits: 0,
      // 武器放大器连击计数
      weaponHitCount: 0,
    };

    if (config.startReady === true) {
      for (const slot of SLOTS) this.battleState.cooldowns[slot] = 0;
    }

    // 初始化敌人战诀CD
    if (this.battleState.enemyChart) {
      this.battleState.enemyCooldowns = {};
      for (const slot of SLOTS) {
        const skId = this.battleState.enemyChart[slot];
        if (skId) {
          const sk = getSkillData(skId);
          this.battleState.enemyCooldowns[slot] = sk.cd || 3.0;
        } else {
          this.battleState.enemyCooldowns[slot] = 0;
        }
      }
    }

    this._mpRegAccumulator = 0;

    // 记录战斗开始
    this._addLog(`遭遇 ${enemy.name}！战诀展开——`, 'event');
    this._addLog(`双方各守门户，静候对方露出破绽。`, 'event');
    this._addLog(`${Object.keys(chart).length}式同时开始读CD，等待就绪……`, 'info');

    // 启动 tick 定时器
    if (config.autoStart !== false) {
      this.timerId = setInterval(() => this.tick(), this.tickRate);
    }

    return this.battleState;
  }

  /**
   * 核心 tick 循环（每 100ms 调用）
   */
  tick() {
    if (!this.battleState || !this.battleState.active || this.battleState.paused) return;

    const dt = TICK_SECONDS;
    this.battleState.battleTime += dt;

    // 1. CD 倒数
    this._tickCooldowns(dt);

    // 2. 真气恢复（每0.5s结算一次）
    this._mpRegAccumulator += dt;
    if (this._mpRegAccumulator >= MP_REG_INTERVAL) {
      this._mpRegAccumulator -= MP_REG_INTERVAL;
      this._regenMp();
    }

    // 3. 异常状态结算
    this.processStatusEffects();
    if (this._settleIfTerminal()) return;

    // 4. 检查门禁倒计时
    if (this.battleState.mpGatePending) {
      this.battleState.mpGateTimer -= dt;
      if (this.battleState.mpGateTimer <= 0) {
        // 超时默认调息
        this.resolveMpGate('rest');
      }
    } else {
      // 5. 自动出招检查
      if (!this.battleState.manualControl) this._autoCastCheck();
      if (this._settleIfTerminal()) return;
    }

    // 6. 敌人行动
    if (!this.battleState.enemyPassive) this.enemyTick();

    // 7. 检查战斗结束
    if (this._settleIfTerminal()) return;

    // 8. Keep the persistent combat snapshot in sync for the HUD and recovery.
    this._syncLiveVitals();

    // 9. 触发UI更新
    this._notifyUpdate();
  }

  // ----------------------------------------------------------
  //  CD 系统
  // ----------------------------------------------------------

  /** 开局初始化所有槽位CD（从最大值开始） */
  _initCooldowns(chart) {
    const cds = {};
    for (const slot of SLOTS) {
      const skId = chart[slot];
      if (skId) {
        const sk = getSkillData(skId);
        cds[slot] = sk.cd || 2.0;
      } else {
        cds[slot] = 0;
      }
    }
    return cds;
  }

  /** 每 tick CD 倒数 */
  _tickCooldowns(dt) {
    // 玩家
    for (const slot of SLOTS) {
      if (this.battleState.cooldowns[slot] > 0) {
        this.battleState.cooldowns[slot] = Math.max(0, this.battleState.cooldowns[slot] - dt);
      }
    }
    // 敌人
    if (this.battleState.enemyCooldowns) {
      for (const slot of SLOTS) {
        if (this.battleState.enemyCooldowns[slot] > 0) {
          this.battleState.enemyCooldowns[slot] = Math.max(0, this.battleState.enemyCooldowns[slot] - dt);
        }
      }
    }
  }

  // ----------------------------------------------------------
  //  双门禁检查
  // ----------------------------------------------------------

  /**
   * 检查双门禁：CD就绪 AND 真气足够
   * @param {string} slot - 槽位 'A'~'E'
   * @returns {object} { cdReady: bool, mpEnough: bool, skill: object }
   */
  checkDoubleGate(slot) {
    const bs = this.battleState;
    const skId = bs.chart[slot];
    if (!skId) return { cdReady: false, mpEnough: false, skill: null };

    const sk = getSkillData(skId);
    const cdReady = bs.cooldowns[slot] <= 0;
    const mpEnough = bs.player.mp >= getSkillCost(sk);

    return { cdReady, mpEnough, skill: sk };
  }

  // ----------------------------------------------------------
  //  自动出招
  // ----------------------------------------------------------

  /** 检查当前槽位是否可以自动出招 */
  _autoCastCheck() {
    const bs = this.battleState;
    if (bs.mpGatePending) return; // 门禁等待中，暂停自动出招

    const currentSlot = SLOTS[bs.currentSlot];
    if (!bs.chart[currentSlot]) {
      const next = this._nextConfiguredSlotIndex(bs.currentSlot);
      if (next < 0) return;
      bs.currentSlot = next;
      bs.slotUnlocked[next] = true;
    }
    if (!bs.slotUnlocked[bs.currentSlot]) return; // 当前槽未解锁

    const gate = this.checkDoubleGate(SLOTS[bs.currentSlot]);
    if (!gate.cdReady) return; // CD未就绪

    if (!gate.mpEnough) {
      // 真气不足 → 触发门禁
      this.triggerMpGate(gate.skill);
      return;
    }

    // 双门禁通过 → 自动出招
    this.autoCast(SLOTS[bs.currentSlot]);
  }

  /**
   * 自动出招
   * @param {string} slot - 槽位 'A'~'E'
   */
  autoCast(slot) {
    const bs = this.battleState;
    const skId = bs.chart[slot];
    if (!skId) return false;

    const sk = getSkillData(skId);

    // 畸变篡改检查
    if (this._checkHijack(slot, sk)) {
      return true; // 篡改触发，已处理
    }

    // 执行出招
    this._executeSkill(slot, sk, 'player');

    // 出招后该式进入CD
    bs.cooldowns[slot] = sk.cd || 2.0;

    const slotIdx = SLOTS.indexOf(slot);
    this._advancePlayerSlot(slotIdx);
    this._settleIfTerminal();
    return true;
  }

  /** Execute the current configured slot in tutorial/showcase manual-control battles. */
  castSlot(slot) {
    const bs = this.battleState;
    const slotIdx = SLOTS.indexOf(slot);
    if (!bs?.active || !bs.manualControl) return { ok: false, reason: 'not-manual' };
    if (slotIdx < 0 || !bs.chart[slot]) return { ok: false, reason: 'empty-slot' };
    if (slotIdx !== bs.currentSlot) return { ok: false, reason: 'wrong-order', expected: SLOTS[bs.currentSlot] };
    const gate = this.checkDoubleGate(slot);
    if (!gate.cdReady) return { ok: false, reason: 'cooldown' };
    if (!gate.mpEnough) {
      this.triggerMpGate(gate.skill);
      return { ok: false, reason: 'mp-gate' };
    }
    this.autoCast(slot);
    this._notifyUpdate();
    return { ok: true, outcome: bs.outcome };
  }

  useTutorialDefense(action) {
    const bs = this.battleState;
    if (!bs?.active || bs.mode !== BATTLE_MODES.TUTORIAL) return false;
    if (action === 'guard') {
      bs.tutorialDefense.guardCharges = 1;
      bs.tutorialDefense.guardUsed++;
      this._addLog('你横剑收肘，预备架住下一次冲撞。', 'event');
    } else if (action === 'dodge') {
      bs.tutorialDefense.dodgeCharges = 1;
      bs.tutorialDefense.dodgeUsed++;
      this._addLog('你压低重心，盯住野猪肩背的发力方向。', 'event');
    } else {
      return false;
    }
    this._notifyUpdate();
    return true;
  }

  _nextConfiguredSlotIndex(fromIndex) {
    const bs = this.battleState;
    if (!bs) return -1;
    for (let step = 1; step <= SLOTS.length; step++) {
      const idx = (fromIndex + step) % SLOTS.length;
      if (bs.chart[SLOTS[idx]]) return idx;
    }
    return -1;
  }

  _advancePlayerSlot(slotIdx) {
    const bs = this.battleState;
    const next = this._nextConfiguredSlotIndex(slotIdx);
    if (next < 0) return;
    bs.slotUnlocked[next] = true;
    bs.currentSlot = next;
    if (next <= slotIdx) {
      bs.round++;
      this._onZhouTianComplete();
    }
  }

  _settleIfTerminal() {
    const bs = this.battleState;
    if (!bs?.active) return Boolean(bs?.outcome);
    // A simultaneous zero is a defeat: the controlled actor did not survive the exchange.
    if (bs.player.hp <= 0) {
      this.finishCombat(BATTLE_OUTCOMES.DEFEAT);
      return true;
    }
    if (bs.enemy.hp <= 0) {
      this.finishCombat(BATTLE_OUTCOMES.VICTORY);
      return true;
    }
    return false;
  }

  /** Sync live combat vitals without mutating shared enemy definitions. */
  _syncLiveVitals() {
    const bs = this.battleState;
    if (!bs || !bs.syncPlayerState) return;

    this.state.hp = Math.max(0, Math.floor(bs.player.hp));
    this.state.mp = Math.max(0, Math.floor(bs.player.mp));

    const combat = this.state.combat;
    if (!combat || combat.battleId !== bs.battleId) return;
    combat.enemyHp = Math.max(0, Math.floor(bs.enemy.hp));
    combat.enemyMaxHp = bs.enemy.maxHp;
    if (combat.enemyData) {
      combat.enemyData.hp = combat.enemyHp;
      combat.enemyData.maxHp = combat.enemyMaxHp;
    }
  }

  /**
   * 执行技能（通用，player/enemy 共用）
   * @private
   */
  _executeSkill(slot, sk, attacker) {
    const bs = this.battleState;
    const isPlayer = attacker === 'player';
    const attackerData = isPlayer ? bs.player : bs.enemy;
    const defenderData = isPlayer ? bs.enemy : bs.player;
    const attackerStatus = isPlayer ? bs.playerStatus : bs.enemyStatus;
    const defenderStatus = isPlayer ? bs.enemyStatus : bs.playerStatus;

    // 扣除真气
    if (isPlayer) {
      const manaCost = getSkillCost(sk);
      bs.player.mp = Math.max(0, bs.player.mp - manaCost);
    }

    // 计算伤害
    let dmg = calcSkillDamageWithWeapon(sk, attackerData.atk, attackerData.weaponAtk || 0, defenderData.def, this.state.realm || 0);

    // 伤害类型检查（物理免疫）
    if (sk.dmgType === 'physical' && defenderData.physicalImmune) {
      dmg = 0;
    }

    // 业火增伤（火系伤害加成）
    const yehuoStacks = defenderStatus.yehuo || 0;
    if (yehuoStacks > 0 && sk.dmgType === 'fire') {
      dmg = Math.floor(dmg * (1 + yehuoStacks * 0.1));
    }

    // 焚甲交互：破罡+业火 → 业火对所有伤害增伤
    if (yehuoStacks > 0 && (defenderStatus.pogang || 0) > 0) {
      dmg = Math.floor(dmg * (1 + yehuoStacks * 0.1));
    }

    // 破罡增伤（每层+1固定值）
    const pogangStacks = defenderStatus.pogang || 0;
    if (pogangStacks > 0) {
      dmg += pogangStacks;
    }

    // 碎魂交互：迷魂+破罡 → 破罡效果翻倍
    if ((defenderStatus.mihun || 0) > 0 && pogangStacks > 0) {
      dmg += pogangStacks; // 额外加一次
    }

    // 暴击
    const critMult = rollCrit(attackerData.critProb || 0, attackerData.critRate || 1.5, this.random);
    const wasCritical = critMult > 1.0;
    if (wasCritical) {
      dmg = Math.floor(dmg * critMult);

      // 逆血暴击触发
      if ((attackerStatus.nixue || 0) > 0) {
        const nixueDmg = Math.floor(attackerData.atk * 0.2 * attackerStatus.nixue);
        dmg += nixueDmg;

        // 血涌交互：裂伤+逆血
        if ((attackerStatus.lieshang || 0) > 0) {
          const extraLieshang = attackerStatus.lieshang;
          dmg += extraLieshang;
          // 心魔交互：迷魂+逆血 → 自身受30%逆血伤害
          if ((attackerStatus.mihun || 0) > 0) {
            const backlash = Math.floor(nixueDmg * 0.3);
            if (isPlayer) {
              bs.player.hp -= backlash;
            } else {
              bs.enemy.hp -= backlash;
            }
          }
        }

        // 逆血触发后清零（肉慈斋锚点减半）
        attackerStatus.nixue = Math.floor(attackerStatus.nixue / 2);
      }
    }

    // 闪避检查
    const defenderDodge = defenderData.dodge || 0;
    if (this.random() < defenderDodge) {
      const targetName = isPlayer ? bs.enemy.name : `你`;
      this._addLog(`${targetName}身随意转，恰如羚羊挂角，避开了这一招。`, 'combat');
      bs.consecutiveHits = 0;
      return;
    }

    if (wasCritical) {
      this._addLog(`这一招剑走偏锋，劲力骤然贯穿对方守势！`, 'combat');
    }

    // 迷魂减速效果：延迟出招（增加CD）
    if ((attackerStatus.mihun || 0) > 0) {
      const slowAmount = (attackerStatus.mihun || 0) * 0.5;
      if (isPlayer) {
        bs.cooldowns[slot] = (bs.cooldowns[slot] || 0) + slowAmount;
      }
    }

    // 造成的伤害
    defenderData.hp -= dmg;
    if (!isPlayer) {
      bs.player.hp = Math.max(0, bs.player.hp);
    } else {
      bs.enemy.hp = Math.max(0, bs.enemy.hp);
    }

    // 叙事文本
    const skillName = getCombatSkillName(sk.name);
    const templates = isPlayer
      ? (bs.consecutiveHits >= 1 ? COMBAT_NARRATION.combo : COMBAT_NARRATION.player)
      : COMBAT_NARRATION.enemy;
    this._addLog(formatCombatNarration(templates, bs.eventSeq, {
      actor: bs.enemy.name,
      skill: skillName,
      dmg,
    }), 'combat');

    // 连续命中计数
    bs.consecutiveHits++;

    // 叙事追加：连续3式命中
    if (bs.consecutiveHits === 3) {
      this._addLog(`三式连贯，行功如一！`, 'event');
    }
    // 叙事追加：连续5式命中（归式后）
    if (bs.consecutiveHits === 5) {
      this._addLog(`行功圆满，一气呵成！`, 'event');
    }

    // 叙事追加：连打
    if (bs.consecutiveHits >= 2) {
      bs.comboCount++;
      if (bs.comboCount === 2) {
        this._addLog(`连打！行功如风！`, 'event');
      }
    }

    // 叙事追加：敌方HP<20%
    if (isPlayer && bs.enemy.hp < bs.enemy.maxHp * 0.2) {
      this._addLog(`${bs.enemy.name}身形摇晃，已是强弩之末`, 'event');
    }

    // 叙事追加：真气枯竭
    if (isPlayer && bs.player.mp < 10) {
      this._addLog(`真气枯竭，经脉如焚`, 'event');
    }

    // 施加异常状态
    this._applyStatusEffects(sk, attackerStatus, defenderStatus, isPlayer);

    // 武器放大器命中计数
    if (isPlayer) {
      bs.weaponHitCount++;
    }

    // 裂伤出招结算（攻击者出招时结算自身裂伤）
    this._processLieshangOnCast(attackerStatus, attackerData, isPlayer);

    // HP 恢复（归式特殊效果）
    if (sk.target === 'self' && sk.healAmount) {
      const heal = sk.healAmount;
      attackerData.hp = Math.min(attackerData.maxHp, attackerData.hp + heal);
      this._addLog(`恢复 ${heal} 生命`, 'combat');
    }

    // 真气回复（归式回气效果）
    if (sk.mpRecover) {
      if (isPlayer) {
        bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + sk.mpRecover);
        this._addLog(`回气 +${sk.mpRecover}`, 'combat');
      }
    }
  }

  // ----------------------------------------------------------
  //  真气门禁（4选1）
  // ----------------------------------------------------------

  /**
   * 触发真气门禁
   * @param {object} skill - 技能数据
   */
  triggerMpGate(skill) {
    const bs = this.battleState;
    bs.mpGatePending = true;
    bs.mpGateSkill = skill;
    bs.mpGateTimer = MP_GATE_TIMEOUT;

    const need = getSkillCost(skill);
    const have = Math.floor(bs.player.mp);
    this._addLog(`真气不足！${skill.name}需要${need}气，当前真气：${have}`, 'event');

    // 通知UI弹窗
    if (this._onMpGate) {
      this._onMpGate({
        skillName: skill.name,
        need,
        have,
        options: [
          { key: 'rest',   label: `调息`, desc: `跳过该式，+${MP_GATE_REST_RECOVER}真气` },
          { key: 'potion', label: `服药`, desc: `服用回气丹，+40真气`, disabled: bs.potionUsedThisCombat },
          { key: 'basic',  label: `平斩`, desc: `消耗${MP_GATE_BASIC_COST}气，低伤害` },
          { key: 'force',  label: `强行`, desc: `消耗全部${have}气，伤害按比例打折` },
        ],
        timeout: MP_GATE_TIMEOUT,
      });
    }
  }

  /**
   * 玩家选择门禁选项
   * @param {string} choice - 'rest'|'potion'|'basic'|'force'
   */
  resolveMpGate(choice) {
    const bs = this.battleState;
    if (!bs.mpGatePending) return;

    const skill = bs.mpGateSkill;
    const slot = SLOTS[bs.currentSlot];

    switch (choice) {
      case 'rest': {
        bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + MP_GATE_REST_RECOVER);
        this._addLog(`调息……真气+${MP_GATE_REST_RECOVER}`, 'combat');
        break;
      }
      case 'potion': {
        if (bs.potionUsedThisCombat) {
          this._addLog(`本场已服药，无法再服`, 'info');
          return; // 不消耗门禁
        }
        bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + 40);
        bs.potionUsedThisCombat = true;
        this._addLog(`服用回气丹，真气+40`, 'combat');
        break;
      }
      case 'basic': {
        if (bs.player.mp >= MP_GATE_BASIC_COST) {
          bs.player.mp -= MP_GATE_BASIC_COST;
          const basicDmg = Math.max(1, Math.floor(bs.player.atk * 0.5));
          bs.enemy.hp = Math.max(0, bs.enemy.hp - basicDmg);
          this._addLog(`你趁隙平斩，朴实一击落在实处，造成伤害 ${basicDmg}！`, 'combat');
        } else {
          this._addLog(`真气不足10，自动转为调息`, 'info');
          bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + MP_GATE_REST_RECOVER);
        }
        break;
      }
      case 'force': {
        const allMp = bs.player.mp;
        const need = getSkillCost(skill) || 1;
        const ratio = Math.min(1, allMp / need);
        bs.player.mp = 0;
        if (ratio > 0) {
          const skillNum = skill.skillNum + (skill.skillNumLvAdd || 0) * (this.state.realm || 0);
          let dmg = Math.max(1, Math.floor(skillNum * (bs.player.atk + (bs.player.weaponAtk || 0)) * ratio - bs.enemy.def));
          if (skill.dmgType === 'physical' && bs.enemy.physicalImmune) dmg = 0;
          bs.enemy.hp = Math.max(0, bs.enemy.hp - dmg);
          this._addLog(`你强提真气，${getCombatSkillName(skill.name)}勉强递出，造成伤害 ${dmg}（威力${Math.floor(ratio * 100)}%）！`, 'combat');

          // 异常状态仍照常施加
          this._applyStatusEffects(skill, bs.playerStatus, bs.enemyStatus, true);
        }
        break;
      }
    }

    // 门禁解决，推进槽位
    bs.mpGatePending = false;
    bs.mpGateSkill = null;
    bs.mpGateTimer = 0;

    // 出招后该式进入CD（平斩/强行出招也进CD，调息/服药不进CD但跳过该式）
    if (choice === 'basic' || choice === 'force') {
      bs.cooldowns[slot] = skill.cd || 2.0;
    }

    const slotIdx = SLOTS.indexOf(slot);
    this._advancePlayerSlot(slotIdx);

    bs.consecutiveHits = 0; // 门禁打断连击
    if (this._settleIfTerminal()) return true;
    this._notifyUpdate();
    return true;
  }

  // ----------------------------------------------------------
  //  玩家干预
  // ----------------------------------------------------------

  /**
   * 变式：切换战诀
   * @param {object} newChart - 新战诀 { A: skillId, ... }
   */
  interveneVariant(newChart) {
    const bs = this.battleState;
    if (bs.interventionUsed.variant) {
      this._addLog(`本场已用过变式`, 'info');
      return false;
    }
    if (bs.mpGatePending) {
      this._addLog(`门禁中无法变式`, 'info');
      return false;
    }

    bs.interventionUsed.variant = true;
    bs.chart = { ...newChart };

    // 变式代价：真气-20
    bs.player.mp = Math.max(0, bs.player.mp - 20);

    // 所有CD减半
    for (const slot of SLOTS) {
      bs.cooldowns[slot] = Math.floor(bs.cooldowns[slot] / 2 * 10) / 10;
    }

    // 从起式重新开始
    const firstSlot = Math.max(0, SLOTS.findIndex(slot => newChart[slot]));
    bs.currentSlot = firstSlot;
    bs.slotUnlocked = SLOTS.map((slot, idx) => idx === firstSlot && Boolean(newChart[slot]));
    bs.consecutiveHits = 0;

    // 重新扫描羁绊
    bs.bonds = this._scanBonds(newChart);

    this._addLog(`[变式] 战诀切换！真气-20，CD减半，从起式重新开始`, 'event');
    this._notifyUpdate();
    return true;
  }

  /**
   * 服药：使用丹药
   * @param {string} itemId - 物品ID
   */
  intervenePotion(itemId) {
    const bs = this.battleState;
    if (bs.interventionUsed.potion) {
      this._addLog(`本场已用过服药干预`, 'info');
      return false;
    }

    bs.interventionUsed.potion = true;

    // 简化处理：根据itemId决定效果
    let effect = null;
    if (itemId === 'huiqi_dan' || itemId === '回气丹') {
      bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + 40);
      effect = `真气+40`;
    } else if (itemId === 'huxin_dan' || itemId === '护脉丹') {
      bs.player.hp = Math.min(bs.player.maxHp, bs.player.hp + 50);
      effect = `生命+50`;
    } else if (itemId === 'zhenji_dan' || itemId === '镇畸丹') {
      effect = `畸变暂时压制（10式）`;
      // TODO: 实现10式内篡改率降低
    } else {
      // 通用丹药
      bs.player.hp = Math.min(bs.player.maxHp, bs.player.hp + 30);
      effect = `生命+30`;
    }

    this._addLog(`[服药] ${itemId}，${effect}`, 'event');
    this._notifyUpdate();
    return true;
  }

  /**
   * 脱战：逃跑
   */
  interveneRetreat() {
    const bs = this.battleState;
    if (bs.interventionUsed.retreat) {
      this._addLog(`本场已用过脱战`, 'info');
      return false;
    }

    bs.interventionUsed.retreat = true;

    // 脱战成功率 = 基础30% + 追风脉品阶×5%
    const baseRate = 0.30;
    const zhuifengBonus = this._getZhuifengBonus();
    const successRate = baseRate + zhuifengBonus;

    if (this.random() < successRate) {
      this._addLog(`[脱战] 你后撤脱离，${bs.enemy.name}追之不及`, 'event');
      this.finishCombat(BATTLE_OUTCOMES.RETREAT);
      return true;
    } else {
      this._addLog(`[脱战] 脱战失败！${bs.enemy.name}截住了你的退路`, 'combat');
      // 敌人获得一次自由攻击
      this._enemyFreeAttack();
      return false;
    }
  }

  // ----------------------------------------------------------
  //  异常状态结算
  // ----------------------------------------------------------

  /** 每tick结算异常状态 */
  processStatusEffects() {
    const bs = this.battleState;
    const dt = TICK_SECONDS;

    // 玩家状态结算
    this._statusTick(bs.playerStatus, bs.player, true);
    // 敌人状态结算
    this._statusTick(bs.enemyStatus, bs.enemy, false);

    // 状态交互检查（每tick检查一次，但同一状态每tick只参与一次交互）
    this._checkStatusInteractions(bs.playerStatus, bs.player, true);
    this._checkStatusInteractions(bs.enemyStatus, bs.enemy, false);
  }

  /**
   * 单个目标的状态tick结算
   * @private
   */
  _statusTick(status, charData, isPlayer) {
    // 尸蛊：每tick结算层数伤害（每0.5s一次），每次-1层
    if (status.shigu > 0 && !status._shiguFrozen) {
      // 每0.5s结算一次，简化为每5tick结算一次
      if (!status._shiguAcc) status._shiguAcc = 0;
      status._shiguAcc += TICK_SECONDS;
      if (status._shiguAcc >= 0.5) {
        status._shiguAcc -= 0.5;
        const dmg = status.shigu;
        charData.hp -= dmg;
        status.shigu = Math.max(0, status.shigu - 1);
        if (isPlayer) {
          this.battleState.player.hp = Math.max(0, this.battleState.player.hp);
        }
      }
    }

    // 裂伤：回合结束结算（简化为每3s结算一次）
    if (status.lieshang > 0 && !status._lieshangFrozen) {
      if (!status._lieshangAcc) status._lieshangAcc = 0;
      status._lieshangAcc += TICK_SECONDS;
      if (status._lieshangAcc >= 3.0) {
        status._lieshangAcc = 0;
        const dmg = status.lieshang;
        charData.hp -= dmg;
        status.lieshang = Math.floor(status.lieshang / 2);
        if (isPlayer) {
          this.battleState.player.hp = Math.max(0, this.battleState.player.hp);
        }
      }
    }

    // 业火：不独立伤害，不衰减（增伤标记）
    // 无tick结算需要

    // 凝渊：累计达阈值触发蒸发→冻结+冰伤，清除层数
    if (status.ningyuan >= NINGYUAN_FREEZE_THRESHOLD) {
      const iceDmg = status.ningyuan * 2;
      charData.hp -= iceDmg;
      this._addLog(`凝渊·渊冻！冰伤 ${iceDmg}，冻结1秒`, 'combat');
      status.ningyuan = 0;
      if (isPlayer) {
        this.battleState.player.hp = Math.max(0, this.battleState.player.hp);
      }
    }

    // 破罡：持续3回合后消除（简化为15s后消除）
    if (status.pogang > 0) {
      if (!status._pogangAcc) status._pogangAcc = 0;
      status._pogangAcc += TICK_SECONDS;
      if (status._pogangAcc >= 15.0) {
        status._pogangAcc = 0;
        status.pogang = 0;
      }
    }

    // 迷魂：持续2回合后消除（简化为10s后消除）
    if (status.mihun > 0) {
      if (!status._mihunAcc) status._mihunAcc = 0;
      status._mihunAcc += TICK_SECONDS;
      if (status._mihunAcc >= 10.0) {
        status._mihunAcc = 0;
        status.mihun = 0;
      }
    }

    // 逆血：不自然衰减，仅暴击触发清除
    // 无tick结算需要
  }

  /**
   * 裂伤出招结算（攻击者出招时）
   * @private
   */
  _processLieshangOnCast(status, charData, isPlayer) {
    if (status.lieshang > 0 && !status._lieshangFrozen) {
      const dmg = status.lieshang;
      charData.hp -= dmg;
      status.lieshang = Math.floor(status.lieshang / 2);
      if (isPlayer) {
        this.battleState.player.hp = Math.max(0, this.battleState.player.hp);
      }
    }
  }

  /**
   * 检查状态交互
   * @private
   */
  _checkStatusInteractions(status, charData, isPlayer) {
    // 按优先级检查
    // 1. 蒸发（业火+凝渊）
    if (status.yehuo > 0 && status.ningyuan > 0 && !status._interactionUsed) {
      const dmg = (status.ningyuan + status.yehuo) * 3;
      charData.hp -= dmg;
      status.ningyuan = 0;
      status.yehuo = Math.floor(status.yehuo / 2);
      status.pogang = (status.pogang || 0) + 2;
      this._addLog(`蒸发！渊水遇业火，伤害 ${dmg}，破罡+2`, 'combat');
      status._interactionUsed = true;
      if (isPlayer) this.battleState.player.hp = Math.max(0, this.battleState.player.hp);
      return;
    }

    // 2. 冻蛊（尸蛊+凝渊）
    if (status.shigu > 0 && status.ningyuan > 0 && !status._interactionUsed) {
      status._shiguFrozen = true;
      this._addLog(`冻蛊！蛊虫被冻结，尸蛊暂停结算`, 'event');
      status._interactionUsed = true;
      return;
    }

    // 3. 冰裂（裂伤+凝渊）
    if (status.lieshang > 0 && status.ningyuan > 0 && !status._interactionUsed) {
      status._lieshangFrozen = true;
      this._addLog(`冰裂！裂伤被冻结，等待渊冻爆发`, 'event');
      status._interactionUsed = true;
      return;
    }

    // 4. 焚蛊（尸蛊+业火）
    if (status.shigu > 0 && status.yehuo > 0 && !status._interactionUsed) {
      const reduced = Math.floor(status.shigu / 2);
      const dmg = reduced * 2;
      charData.hp -= dmg;
      status.shigu = status.shigu - reduced;
      status.yehuo = Math.min(20, status.yehuo + 3);
      this._addLog(`焚蛊！蛊虫引燃，伤害 ${dmg}，业火+3`, 'combat');
      status._interactionUsed = true;
      if (isPlayer) this.battleState.player.hp = Math.max(0, this.battleState.player.hp);
      return;
    }

    // 重置交互标记（每tick重置）
    status._interactionUsed = false;
  }

  /**
   * 施加异常状态
   * @private
   */
  _applyStatusEffects(skill, attackerStatus, defenderStatus, isPlayer) {
    // 统一从 skill.status 读取，不直接读旧字段名
    const status = skill.status || {};
    const shigu = status.shigu || 0;
    const lieshang = status.lieshang || 0;
    const yehuo = status.yehuo || 0;
    const ningyuan = status.ningyuan || 0;
    const pogang = status.pogang || 0;
    const mihun = status.mihun || 0;
    const nixue = status.nixue || 0;

    // 尸蛊
    if (shigu > 0) {
      const stacks = Math.min(STATUS_CONFIG.shigu.maxStacks,
        (defenderStatus.shigu || 0) + shigu);
      defenderStatus.shigu = stacks;
      if (stacks >= STATUS_CONFIG.shigu.maxStacks * 0.8) {
        this._addLog(`尸蛊已满——毒发在即！`, 'event');
      }
    }
    // 裂伤
    if (lieshang > 0) {
      const stacks = Math.min(STATUS_CONFIG.lieshang.maxStacks,
        (defenderStatus.lieshang || 0) + lieshang);
      defenderStatus.lieshang = stacks;
    }
    // 业火
    if (yehuo > 0) {
      const stacks = Math.min(STATUS_CONFIG.yehuo.maxStacks,
        (defenderStatus.yehuo || 0) + yehuo);
      defenderStatus.yehuo = stacks;
    }
    // 凝渊
    if (ningyuan > 0) {
      const stacks = Math.min(STATUS_CONFIG.ningyuan.maxStacks,
        (defenderStatus.ningyuan || 0) + ningyuan);
      defenderStatus.ningyuan = stacks;
    }
    // 破罡
    if (pogang > 0) {
      const stacks = Math.min(STATUS_CONFIG.pogang.maxStacks,
        (defenderStatus.pogang || 0) + pogang);
      defenderStatus.pogang = stacks;
    }
    // 迷魂
    if (mihun > 0) {
      const stacks = Math.min(STATUS_CONFIG.mihun.maxStacks,
        (defenderStatus.mihun || 0) + mihun);
      defenderStatus.mihun = stacks;
    }
    // 逆血
    if (nixue > 0) {
      const stacks = Math.min(STATUS_CONFIG.nixue.maxStacks,
        (defenderStatus.nixue || 0) + nixue);
      defenderStatus.nixue = stacks;
    }

    // 羁绊概率加成：同宗标签额外施加
    if (isPlayer && this.battleState.bonds) {
      const bondBonus = this._getBondBonus(skill);
      if (bondBonus > 0) {
        if (shigu > 0 && this.random() < bondBonus) defenderStatus.shigu++;
        if (lieshang > 0 && this.random() < bondBonus) defenderStatus.lieshang++;
        if (yehuo > 0 && this.random() < bondBonus) defenderStatus.yehuo++;
        if (ningyuan > 0 && this.random() < bondBonus) defenderStatus.ningyuan++;
        if (pogang > 0 && this.random() < bondBonus) defenderStatus.pogang++;
        if (mihun > 0 && this.random() < bondBonus) defenderStatus.mihun++;
        if (nixue > 0 && this.random() < bondBonus) defenderStatus.nixue++;
      }
    }
  }

  // ----------------------------------------------------------
  //  羁绊系统
  // ----------------------------------------------------------

  /**
   * 扫描战诀标签，计算羁绊三档
   * @param {object} chart - 战诀
   * @returns {object} { tag: { count, tier, prob } }
   */
  checkBonds(chart) {
    return this._scanBonds(chart);
  }

  /** @private */
  _scanBonds(chart) {
    const tagCount = {};
    for (const slot of SLOTS) {
      const skId = chart[slot];
      if (!skId) continue;
      const sk = getSkillData(skId);
      if (sk.tags) {
        for (const tag of sk.tags) {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        }
      }
    }

    const bonds = {};
    for (const [tag, count] of Object.entries(tagCount)) {
      let tier = 0;
      let prob = 0;
      if (count >= 5) {
        tier = 3;
        prob = 0.60;
      } else if (count >= 3) {
        tier = 2;
        prob = 0.40;
      } else if (count >= 2) {
        tier = 1;
        prob = 0.20;
      }
      if (tier > 0) {
        bonds[tag] = { count, tier, prob };
      }
    }
    return bonds;
  }

  /** 获取技能的羁绊概率加成 @private */
  _getBondBonus(skill) {
    if (!skill.tags || !this.battleState.bonds) return 0;
    let maxProb = 0;
    for (const tag of skill.tags) {
      const bond = this.battleState.bonds[tag];
      if (bond && bond.prob > maxProb) maxProb = bond.prob;
    }
    return maxProb;
  }

  // ----------------------------------------------------------
  //  敌人 AI
  // ----------------------------------------------------------

  enemyTick() {
    const bs = this.battleState;
    if (!bs.enemy || bs.enemy.hp <= 0) return;

    if (bs.enemyChart) {
      // BOSS战诀AI
      this._bossAiTick();
    } else {
      // 简单AI
      bs.enemyAiCooldown -= TICK_SECONDS;
      if (bs.enemyAiCooldown <= 0) {
        this._enemySimpleAttack();
        bs.enemyAiCooldown = 2.0 + this.random() * 1.5; // 2-3.5s间隔
      }
    }
  }

  /** BOSS战诀AI @private */
  _bossAiTick() {
    const bs = this.battleState;
    const slot = SLOTS[bs.enemySlot];
    if (!slot) return;

    const skId = bs.enemyChart[slot];
    if (!skId) return;

    // 检查CD
    if (bs.enemyCooldowns[slot] > 0) return;

    const sk = getSkillData(skId);

    // 条件分支（HP阈值）
    let actualSkill = sk;
    if (sk.conditional) {
      const hpRatio = bs.enemy.hp / bs.enemy.maxHp;
      if (sk.conditional.threshold && hpRatio < sk.conditional.threshold) {
        actualSkill = getSkillData(sk.conditional.altSkillId);
      }
    }

    // 执行敌人技能
    this._executeSkill(slot, actualSkill, 'enemy');

    // 进入CD
    bs.enemyCooldowns[slot] = actualSkill.cd || 3.0;

    // 推进槽位
    bs.enemySlot = (bs.enemySlot + 1) % 5;
  }

  /** 简单敌人攻击 @private */
  _enemySimpleAttack() {
    const bs = this.battleState;
    const enemy = bs.enemy;

    // 简单随机攻击
    let dmg = Math.max(1, enemy.atk - bs.player.def);
    dmg += Math.floor(this.random() * 5);

    if (bs.tutorialDefense?.dodgeCharges > 0) {
      bs.tutorialDefense.dodgeCharges--;
      this._addLog(`${enemy.name}猛冲而过——你在獠牙擦身前让开半步`, 'event');
      return;
    }

    if (bs.tutorialDefense?.guardCharges > 0) {
      bs.tutorialDefense.guardCharges--;
      const before = dmg;
      dmg = Math.max(1, Math.floor(dmg * 0.45));
      this._addLog(`你以剑脊架住冲势，伤害由 ${before} 降至 ${dmg}`, 'event');
    }

    // 闪避
    if (this.random() < (bs.player.dodge || 0)) {
      this._addLog(`${enemy.name}骤然攻来，你身随意转，恰好避开锋芒。`, 'combat');
      return;
    }

    bs.player.hp -= dmg;
    this._addLog(formatCombatNarration(COMBAT_NARRATION.enemy, bs.eventSeq, {
      actor: enemy.name,
      skill: '一击',
      dmg,
    }), 'combat');
    if (this._settleIfTerminal()) return;

    // 敌人施加异常状态（部分敌人）
    if (enemy.data && enemy.data.statusAttack) {
      const sa = enemy.data.statusAttack;
      if (sa.type && sa.chance && this.random() < sa.chance) {
        const stacks = sa.stacks || 2;
        bs.playerStatus[sa.type] = (bs.playerStatus[sa.type] || 0) + stacks;
        this._addLog(`${STATUS_CONFIG[sa.type]?.name || sa.type}+${stacks}`, 'combat');
      }
    }
  }

  /** 敌人自由攻击（脱战失败惩罚）@private */
  _enemyFreeAttack() {
    const bs = this.battleState;
    let dmg = Math.max(1, bs.enemy.atk * 1.5 - bs.player.def);
    bs.player.hp -= dmg;
    this._addLog(`${bs.enemy.name}趁机追击！伤害 ${dmg}`, 'combat');
    this._settleIfTerminal();
  }

  // ----------------------------------------------------------
  //  畸变篡改
  // ----------------------------------------------------------

  /**
   * 检查畸变篡改
   * @returns {bool} true=篡改触发
   * @private
   */
  _checkHijack(slot, skill) {
    const bs = this.battleState;
    const corruptionLevel = getCorruptionLevel(this.state);
    const baseRate = HIJACK_BASE_RATE[corruptionLevel] || 0;

    if (baseRate <= 0) return false;
    if (this.random() >= baseRate) return false;

    // 篡改触发
    const hijackType = this._getHijackType(corruptionLevel);

    switch (hijackType) {
      case 'text': {
        // 1-2级：文本变异
        this._addLog(`你催动${getCombatSkillName(skill.name)}，却觉招式似乎有些不对。`, 'event');
        this._executeSkill(slot, skill, 'player');
        bs.cooldowns[slot] = skill.cd || 2.0;
        return true;
      }
      case 'replace': {
        // 3级：行功位替换为异化招式
        const mutantSkill = this._generateMutantSkill(skill);
        this._addLog(`你的身体不受控制——`, 'event');
        this._addLog(`[畸变·异化] ${mutantSkill.name}！`, 'combat');
        // 使用原招式CD
        this._executeSkill(slot, mutantSkill, 'player');
        bs.cooldowns[slot] = skill.cd || 2.0;
        // 道心-1
        this.state.daoxin = Math.max(0, (this.state.daoxin || 100) - 1);
        this._addLog(`[道心判定] 道心-1（当前: ${this.state.daoxin}/100）`, 'event');
        return true;
      }
      case 'jump': {
        // 4级：跳位
        const skipTo = Math.min(4, SLOTS.indexOf(slot) + 1 + Math.floor(this.random() * 2));
        this._addLog(`行功失控——跳过${SLOTS.slice(SLOTS.indexOf(slot) + 1, skipTo + 1).join('、')}式！`, 'event');
        // 被跳过的式位CD强制重置
        for (let i = SLOTS.indexOf(slot) + 1; i <= skipTo; i++) {
          bs.cooldowns[SLOTS[i]] = 0;
        }
        bs.cooldowns[slot] = skill.cd || 2.0;
        bs.currentSlot = skipTo;
        bs.slotUnlocked[skipTo] = true;
        this._executeSkill(slot, skill, 'player');
        this.state.daoxin = Math.max(0, (this.state.daoxin || 100) - 2);
        this._addLog(`[道心判定] 道心-2（当前: ${this.state.daoxin}/100）`, 'event');
        return true;
      }
      case 'override': {
        // 5级：整体覆盖
        this._addLog(`「祂」接管了你的行功——`, 'event');
        const namelessSkill = this._generateNamelessSkill();
        this._executeSkill(slot, namelessSkill, 'player');
        // 祂的战诀忽略CD
        bs.cooldowns[slot] = 0;
        this.state.daoxin = Math.max(0, (this.state.daoxin || 100) - 3);
        this._addLog(`[道心判定] 道心-3（当前: ${this.state.daoxin}/100）`, 'event');
        return true;
      }
    }
    return false;
  }

  /** 根据畸变等级决定篡改类型 @private */
  _getHijackType(level) {
    if (level <= 0) return null;
    if (level <= 2) return 'text';
    if (level === 3) return 'replace';
    if (level === 4) return this.random() < 0.5 ? 'replace' : 'jump';
    return this.random() < 0.4 ? 'jump' : 'override';
  }

  /** 生成异化招式 @private */
  _generateMutantSkill(original) {
    return {
      ...original,
      name: `异化·${original.name}`,
      skillNum: Math.floor(original.skillNum * (0.8 + this.random() * 0.6)),
      dmgType: 'spirit',
    };
  }

  /** 生成不可名状技 @private */
  _generateNamelessSkill() {
    return {
      id: -1,
      name: `不可名状之招`,
      type: 'melee',
      dmgType: 'spirit',
      skillNum: 50 + this.random() * 100,
      skillNumLvAdd: 0,
      cd: 0,
      mana: 0,
      target: 'enemy',
      dmgType: 'spirit',
      tags: [],
    };
  }

  // ----------------------------------------------------------
  //  小周天完成
  // ----------------------------------------------------------

  /** @private */
  _onZhouTianComplete() {
    const bs = this.battleState;
    this._addLog(`小周天完成（第${bs.round}圈）`, 'event');

    // 精元回复（小周天完成时少量回复）
    bs.player.hp = Math.min(bs.player.maxHp, bs.player.hp + (this.state.hpReg || 1));

    // 铭文回春：每圈周天结束恢复N点真气
    const mpRegenBonus = this._getMpRegenFromEquipment();
    if (mpRegenBonus > 0) {
      bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + mpRegenBonus);
    }
  }

  // ----------------------------------------------------------
  //  真气恢复
  // ----------------------------------------------------------

  /** @private */
  _regenMp() {
    const bs = this.battleState;
    const mpReg = bs.player.mpReg || 0;
    bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + mpReg);
  }

  // ----------------------------------------------------------
  //  结束战斗
  // ----------------------------------------------------------

  /**
   * End a combat with an explicit outcome.
   * The engine never infers retreat from defeat or a wall-clock timeout.
   */
  finishCombat(rawOutcome) {
    const bs = this.battleState;
    if (!bs || bs.outcome) return null;

    const outcome = normalizeBattleOutcome(rawOutcome);
    bs.outcome = outcome;

    bs.active = false;

    // 停止定时器
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    // Showcase actors are isolated from the persistent player state.
    this._syncLiveVitals();

    if (outcome === BATTLE_OUTCOMES.VICTORY && bs.mode === BATTLE_MODES.SPAR) {
      this._addLog(`切磋已分胜负，你胜过了${bs.enemy.name}`, 'breakthrough');
    } else if (outcome === BATTLE_OUTCOMES.VICTORY && bs.grantRewards && !bs.rewardSettled) {
      const exp = (bs.enemy.data.exp || 10) + (bs.enemy.data.boss ? 50 : 0);
      const gold = bs.enemy.data.gold || 5;
      this.state.cultivation += exp;

      this._addLog(`${bs.enemy.name} 毙于你手！`, 'breakthrough');
      this._addLog(`得 ${exp} 修为，${gold} ${this._getMoneyName()}`, 'info');

      this.state.killCount = (this.state.killCount || 0) + 1;
      if (gold > 0) {
        if (bs.enemy.data.dropsSpirit) this.game.addSpiritStones?.(gold);
        else this.game.addMoney?.(gold);
      }

      // 装备掉落
      if (bs.enemy.data.boss || this.random() < 0.15) {
        this._addLog(`获得装备一件（待鉴定）`, 'info');
        // TODO: 调用 loot_gen 生成装备
      }

      bs.rewardSettled = true;

      // 检查突破
      this.game.checkBreakthrough?.();
    } else if (outcome === BATTLE_OUTCOMES.DEFEAT && bs.mode === BATTLE_MODES.SPAR) {
      // HP did reach zero in the real battle; non-lethal settlement happens afterwards.
      if (bs.syncPlayerState) this.state.hp = Math.max(1, Number(bs.enemy.data.sparRecoveryHp || 1));
      this._addLog(`切磋落败。对方及时收招，你只是精疲力竭`, 'event');
    } else if (outcome === BATTLE_OUTCOMES.DEFEAT) {
      this._addLog(`你已无力再战`, 'event');
    } else if (outcome === BATTLE_OUTCOMES.RETREAT) {
      this._addLog(`你脱离了战斗`, 'event');
    } else if (outcome === BATTLE_OUTCOMES.ABORTED) {
      this._addLog(`战斗因异常中止，未进行任何胜负结算`, 'system');
    }

    const winnerId = outcome === BATTLE_OUTCOMES.VICTORY
      ? bs.playerActorId
      : (outcome === BATTLE_OUTCOMES.DEFEAT ? bs.encounterId : null);
    const loserId = outcome === BATTLE_OUTCOMES.VICTORY
      ? bs.encounterId
      : (outcome === BATTLE_OUTCOMES.DEFEAT ? bs.playerActorId : null);
    const result = {
      battleId: bs.battleId,
      encounterId: bs.encounterId,
      mode: bs.mode,
      outcome,
      winnerId,
      loserId,
      enemyName: bs.enemy.name,
      grantRewards: bs.grantRewards,
      finalSnapshot: this.createSnapshot(),
      events: bs.events.map(event => ({ ...event })),
    };

    // 通知战斗结束
    if (this._onEnd) {
      this._onEnd(result, bs);
    }

    this._notifyUpdate();
    return result;
  }

  /** Transitional alias for legacy callers. New code must pass an outcome string. */
  endCombat(outcome) {
    return this.finishCombat(outcome);
  }

  pause() {
    if (this.battleState?.active) this.battleState.paused = true;
  }

  resume() {
    if (this.battleState?.active) this.battleState.paused = false;
  }

  createSnapshot() {
    const bs = this.battleState;
    if (!bs) return null;
    return {
      version: 1,
      battleId: bs.battleId,
      mode: bs.mode,
      encounterId: bs.encounterId,
      controlledActorId: bs.controlledActorId,
      playerName: bs.playerName,
      syncPlayerState: bs.syncPlayerState,
      manualControl: bs.manualControl,
      enemyPassive: bs.enemyPassive,
      hideEnemyHp: bs.hideEnemyHp,
      active: bs.active,
      paused: bs.paused,
      outcome: bs.outcome,
      battleTime: bs.battleTime,
      round: bs.round,
      currentSlot: bs.currentSlot,
      player: { ...bs.player },
      enemy: { ...bs.enemy, data: { ...bs.enemy.data } },
      chart: { ...bs.chart },
      cooldowns: { ...bs.cooldowns },
      playerStatus: { ...bs.playerStatus },
      enemyStatus: { ...bs.enemyStatus },
      interventionUsed: { ...bs.interventionUsed },
      tutorialDefense: { ...bs.tutorialDefense },
      rngState: this.rng.snapshot(),
      events: bs.events.map(event => ({ ...event })),
    };
  }

  // ----------------------------------------------------------
  //  UI 数据接口
  // ----------------------------------------------------------

  /**
   * 获取战斗UI数据（供renderer渲染）
   * @returns {object} 完整渲染所需数据
   */
  getBattleUIData() {
    const bs = this.battleState;
    if (!bs) return null;

    // 五槽状态
    const slots = SLOTS.map((slot, idx) => {
      const skId = bs.chart[slot];
      const sk = skId ? getSkillData(skId) : null;
      const cd = bs.cooldowns[slot] || 0;
      const cdMax = sk?.cd || 0;
      const cdReady = cd <= 0;
      const isCurrent = idx === bs.currentSlot;
      const isUnlocked = bs.slotUnlocked[idx];
      const mpEnough = sk ? bs.player.mp >= getSkillCost(sk) : false;

      let state = 'locked';
      if (isUnlocked) {
        if (bs.mpGatePending && isCurrent) {
          state = 'mpgate';
        } else if (!cdReady) {
          state = cd < 1.0 ? 'almost' : 'cooldown';
        } else if (!mpEnough) {
          state = 'mpwarn';
        } else if (isCurrent) {
          state = 'current';
        } else {
          state = 'ready';
        }
      }

      return {
        slot,
        slotName: SLOT_NAMES[slot],
        skill: sk,
        cd,
        cdMax,
        cdReady,
        cdPercent: cdMax > 0 ? (1 - cd / cdMax) : 1,
        isCurrent,
        isUnlocked,
        mpEnough,
        state, // locked | cooldown | almost | ready | current | mpgate | mpwarn
      };
    });

    // 真气条颜色
    const mpRatio = bs.player.maxMp > 0 ? bs.player.mp / bs.player.maxMp : 0;
    const mpColor = mpRatio > 0.5 ? 'blue' : (mpRatio > 0.3 ? 'purple' : 'red');

    // 敌人状态图标
    const enemyStatusIcons = this._buildStatusIcons(bs.enemyStatus);
    const playerStatusIcons = this._buildStatusIcons(bs.playerStatus);

    return {
      active: bs.active,
      paused: bs.paused,
      battleId: bs.battleId,
      mode: bs.mode,
      outcome: bs.outcome,
      controlledActorId: bs.controlledActorId,
      playerName: bs.playerName,
      manualControl: bs.manualControl,
      hideEnemyHp: bs.hideEnemyHp,
      battleTime: bs.battleTime,
      round: bs.round,
      // 玩家
      player: {
        ...bs.player,
        mpColor,
        statusIcons: playerStatusIcons,
        allStatus: { ...bs.playerStatus },
      },
      // 敌人
      enemy: {
        ...bs.enemy,
        statusIcons: enemyStatusIcons,
        allStatus: { ...bs.enemyStatus },
      },
      // 行功五槽
      slots,
      currentSlot: bs.currentSlot,
      // 门禁
      mpGate: bs.mpGatePending ? {
        skill: bs.mpGateSkill,
        timer: bs.mpGateTimer,
        need: getSkillCost(bs.mpGateSkill),
        have: Math.floor(bs.player.mp),
      } : null,
      // 干预
      intervention: { ...bs.interventionUsed },
      potionUsed: bs.potionUsedThisCombat,
      tutorialDefense: { ...bs.tutorialDefense },
      // 羁绊
      bonds: bs.bonds,
      // 连击
      comboCount: bs.comboCount,
      consecutiveHits: bs.consecutiveHits,
      // 日志（最近20条）
      log: bs.log.slice(-20),
    };
  }

  /** @private */
  _buildStatusIcons(status) {
    const icons = [];
    for (const [key, cfg] of Object.entries(STATUS_CONFIG)) {
      const stacks = status[key] || 0;
      if (stacks > 0) {
        icons.push({
          key,
          name: cfg.name,
          icon: cfg.icon,
          stacks,
          maxStacks: cfg.maxStacks,
        });
      }
    }
    return icons;
  }

  // ----------------------------------------------------------
  //  辅助方法
  // ----------------------------------------------------------

  /** @private */
  _freshStatus() {
    return {
      shigu: 0, lieshang: 0, yehuo: 0, ningyuan: 0,
      pogang: 0, mihun: 0, nixue: 0,
      _shiguFrozen: false,
      _lieshangFrozen: false,
    };
  }

  /** @private */
  _addLog(text, type = 'combat') {
    const bs = this.battleState;
    if (!bs) return;
    const event = {
      id: `${bs.battleId}:${++bs.eventSeq}`,
      seq: bs.eventSeq,
      type,
      text: String(text),
      time: Number(bs.battleTime.toFixed(3)),
      round: bs.round,
      actorId: bs.controlledActorId,
    };
    bs.log.push(event);
    bs.events.push(event);
    // 限制日志长度
    if (bs.log.length > 200) {
      bs.log = bs.log.slice(-100);
    }
    if (this._onLog) {
      this._onLog(event);
    }
  }

  /** @private */
  _notifyUpdate() {
    if (this._onUpdate) {
      this._onUpdate(this.getBattleUIData());
    }
  }

  /** 获取玩家MP恢复速率 @private */
  _getPlayerMpReg() {
    const realm = this.state.realm || 0;
    const path = this.state.path || 'wu';
    // 武修/灵修MP恢复表
    const wuMpReg = [2, 5, 10, 18, 35, 80];
    const lingMpReg = [3, 7, 14, 25, 50, 110];
    return path === 'ling' ? (lingMpReg[realm] || 2) : (wuMpReg[realm] || 2);
  }

  /** 获取玩家暴击概率 @private */
  _getPlayerCritProb() {
    const realm = this.state.realm || 0;
    const path = this.state.path || 'wu';
    const wuCrit = [0.02, 0.05, 0.08, 0.12, 0.18, 0.25];
    const lingCrit = [0.03, 0.06, 0.10, 0.15, 0.22, 0.30];
    return path === 'ling' ? (lingCrit[realm] || 0.02) : (wuCrit[realm] || 0.02);
  }

  /** 获取玩家暴击倍率 @private */
  _getPlayerCritRate() {
    const realm = this.state.realm || 0;
    const path = this.state.path || 'wu';
    const wuRate = [1.5, 1.55, 1.6, 1.7, 1.85, 2.0];
    const lingRate = [1.5, 1.55, 1.65, 1.75, 1.9, 2.1];
    return path === 'ling' ? (lingRate[realm] || 1.5) : (wuRate[realm] || 1.5);
  }

  /** 获取玩家闪避 @private */
  _getPlayerDodge() {
    const realm = this.state.realm || 0;
    const path = this.state.path || 'wu';
    const wuDodge = [0.03, 0.05, 0.07, 0.10, 0.15, 0.22];
    const lingDodge = [0.04, 0.07, 0.10, 0.14, 0.20, 0.28];
    return path === 'ling' ? (lingDodge[realm] || 0.03) : (wuDodge[realm] || 0.03);
  }

  /** 获取追风脉脱战加成 @private */
  _getZhuifengBonus() {
    // TODO: 从八脉系统读取追风脉品阶
    return 0;
  }

  /** 获取装备铭文回春真气 @private */
  _getMpRegenFromEquipment() {
    // TODO: 从装备系统读取回春铭文
    return 0;
  }

  /** @private */
  _getMoneyName() {
    return this.game.getMoneyName?.() || `铜钱`;
  }
}

// ============================================================
//  导出
// ============================================================

export default BattleEngine;
