/**
 * battle_hijack.js — 畸变·行功失控引擎 v3.0
 *
 * 独立ES6模块，通过引用 BattleEngine 实例操作战斗状态。
 * 不修改 battle_async.js，由 BattleEngine 在 _checkHijack 中委托调用。
 *
 * 数据依赖：
 *   COMBAT_HIJACK — 畸变概率表、叙事模板、功法替换映射、祂的战诀
 *   CORRUPTION_DATA — 六宗门×5级畸变链
 *
 *   通过 data_loader.getData() 从卷宗获取。
 *
 * 使用方式：
 *   import { HijackEngine } from './battle_hijack.js';
 *   const hijack = new HijackEngine(battleEngine);
 *   const result = hijack.checkHijack(corruptionLevel, currentSlot, skillData);
 *
 * 叙事风格：冷静、疏离、像在写解剖报告。越冷越恐怖。
 */

import { getData } from './data/data_loader.js';

// ============================================================
//  常量
// ============================================================

const SLOTS = ['A', 'B', 'C', 'D', 'E'];
const SLOT_NAMES = { A: '起式', B: '承式', C: '转式', D: '合式', E: '归式' };

/** 畸变等级 → 篡改概率（与 battle_async.js HIJACK_BASE_RATE 一致） */
const HIJACK_RATES = [0, 0.03, 0.08, 0.15, 0.25, 0.40];

/** Tier 4 跳位概率（30%概率跳过承/转式） */
const SLOT_JUMP_CHANCE = 0.30;

/** Tier 2 伤害浮动范围 ±20% */
const DAMAGE_VARIANCE = 0.20;

/** 灵修异化战诀：每次完整循环道心消耗 */
const LINGXIU_CYCLE_DAOXIN_COST = 2;

/** 脉位 → bodyPart 映射（用于叙事模板选取） */
const MERIDIAN_TO_BODY = {
  '龙象脉': 'arm',
  '天眼脉': 'eye',
  '金刚脉': 'torso',
  '追风脉': 'leg',
  '命源脉': 'heart',
  '灵台脉': 'brain',
  '百骸脉': 'arm',
  '丹田异核': 'skin',
};

/** 祂的战诀实体键 → 宗门映射（反向查找） */
const SECT_TO_ENTITY = {
  '肉慈斋': 'shub',
  '忘尘宗': 'nyar',
  '归墟': 'cthulhu',
  '镜阁': 'hastur',
  '紫霞山': 'yog',
  '青囊庐': 'mord',
};

// ============================================================
//  HijackEngine 主类
// ============================================================

export class HijackEngine {
  /**
   * @param {BattleEngine} battleEngine - BattleEngine 实例引用
   */
  constructor(battleEngine) {
    this.be = battleEngine;
    this.game = battleEngine.game;
    /** @type {COMBAT_HIJACK} 畸变数据引用 */
    this.HIJACK = null;
    /** @type {CORRUPTION_DATA} 灵修畸变链引用 */
    this.CORRUPTION = null;
    try {
      const dl = getData();
      this.HIJACK = dl.COMBAT_HIJACK || null;
      this.CORRUPTION = dl.CORRUPTION_DATA || null;
    } catch(e) {
      console.warn('[HijackEngine] 卷宗数据未就绪:', e.message);
    }
    /** 当前战斗中战诀覆写状态 */
    this._chartOverrideActive = false;
    this._entityChartKey = null;
    this._entitySlotIndex = 0;
    /** 灵修异化战诀激活状态 */
    this._lingxiuChartActive = false;
    this._lingxiuChartKey = null;
    this._lingxiuCycleCount = 0;
  }

  // ----------------------------------------------------------
  //  核心入口：每次出招前检查是否触发畸变篡改
  // ----------------------------------------------------------

  /**
   * 检查是否触发畸变篡改
   * @param {number} corruptionLevel - 玩家当前畸变等级 (0-5)
   * @param {string} currentSlot - 当前式位 'A'|'B'|'C'|'D'|'E'
   * @param {object} skillData - 当前招式数据
   * @returns {{ triggered: boolean, type: string|null, modifiedSkill: object|null, log: string, extraEffects: object|null }}
   */
  checkHijack(corruptionLevel, currentSlot, skillData) {
    const level = Math.max(0, Math.min(5, corruptionLevel | 0));
    const rate = HIJACK_RATES[level] || 0;

    // 等级0：无篡改
    if (rate <= 0) {
      return { triggered: false, type: null, modifiedSkill: null, log: '', extraEffects: null };
    }

    // 灵修异化战诀激活时，篡改率翻倍
    let effectiveRate = rate;
    if (this._lingxiuChartActive) {
      effectiveRate = Math.min(0.95, effectiveRate * 2);
    }

    // 掷骰
    if (this.be.random() >= effectiveRate) {
      return { triggered: false, type: null, modifiedSkill: null, log: '', extraEffects: null };
    }

    // 篡改触发 — 根据等级决定类型
    const hijackType = this._determineHijackType(level);

    let result;
    switch (hijackType) {
      case 'text':
        result = this.doTextVariant(skillData);
        break;
      case 'stat':
        result = this.doStatVariance(skillData);
        break;
      case 'skill_replace':
        result = this.doSkillReplace(currentSlot, skillData);
        break;
      case 'slot_jump':
        result = this.doSlotJump(currentSlot);
        break;
      case 'chart_override':
        result = this.doChartOverride(this._getPlayerChart());
        break;
      default:
        return { triggered: false, type: null, modifiedSkill: null, log: '', extraEffects: null };
    }

    // 补充公共信息
    result.triggered = true;
    result.type = hijackType;
    if (!result.modifiedSkill) result.modifiedSkill = null;
    if (!result.extraEffects) result.extraEffects = null;

    // 道心扣除
    const daoxinLoss = this._getDaoxinLoss(hijackType);
    if (daoxinLoss > 0) {
      const currentDaoxin = this.game.state.daoxin ?? 100;
      this.game.state.daoxin = Math.max(0, currentDaoxin - daoxinLoss);
      result.log += `\n[道心判定] ${this._getDaoxinNarrative(hijackType)} 道心-${daoxinLoss}（当前: ${this.game.state.daoxin}/100）`;
      result.extraEffects = { ...(result.extraEffects || {}), daoxinLoss };
    }

    return result;
  }

  // ----------------------------------------------------------
  //  Tier 1：文本变异（招式名不变，描述被微妙替换）
  // ----------------------------------------------------------

  /**
   * 文本变异 — 招式名不变，描述被微妙替换
   * @param {object} skillData - 原始招式
   * @returns {{ modifiedSkill: object, log: string }}
   */
  doTextVariant(skillData) {
    const bodyPart = this._inferBodyPart(skillData);
    const templates = this._getNarrativeTemplates(bodyPart);
    const template = templates[Math.floor(this.be.random() * templates.length)];

    const narrativeText = template.template.replace('{technique}', skillData.name);

    const modifiedSkill = {
      ...skillData,
      _hijackDesc: narrativeText,
      _hijackTags: template.tags,
      _hijackTone: template.tone,
    };

    const tierInfo = this._getTierInfo(1);
    const log = `${tierInfo.combatLogOnCheck}\n${narrativeText}`;

    return { modifiedSkill, log };
  }

  // ----------------------------------------------------------
  //  Tier 2：数值浮动（文本变异 + 伤害±20%）
  // ----------------------------------------------------------

  /**
   * 数值浮动 — 文本变异 + 伤害在正常值±20%范围内随机浮动
   * @param {object} skillData - 原始招式（含 skillNum）
   * @returns {{ modifiedSkill: object, log: string, extraEffects: { damageMultiplier: number } }}
   */
  doStatVariance(skillData) {
    // 先做文本变异
    const textResult = this.doTextVariant(skillData);

    // 计算伤害浮动
    const variance = (this.be.random() * 2 - 1) * DAMAGE_VARIANCE; // [-0.20, +0.20]
    const damageMultiplier = 1 + variance;
    const originalSkillNum = skillData.skillNum || 20;
    const modifiedSkillNum = Math.max(1, Math.floor(originalSkillNum * damageMultiplier));

    const modifiedSkill = {
      ...textResult.modifiedSkill,
      skillNum: modifiedSkillNum,
      _hijackDamageVariance: variance,
    };

    const direction = variance > 0 ? '重了' : '轻了';
    const percent = Math.abs(Math.round(variance * 100));
    const tierInfo = this._getTierInfo(2);

    const log = `${textResult.log}\n但力道不太对——${direction}${percent}分。你也不知道为什么。`;

    return {
      modifiedSkill,
      log,
      extraEffects: { damageMultiplier },
    };
  }

  // ----------------------------------------------------------
  //  Tier 3：功法替换（当前脉位的武修功法→同脉灵修异化功法）
  // ----------------------------------------------------------

  /**
   * 功法替换 — 当前脉位的武修功法被替换为同脉的灵修异化功法
   * @param {string} currentSlot - 当前式位
   * @param {object} skillData - 原始招式
   * @returns {{ modifiedSkill: object, log: string, extraEffects: { originalSkillId: number, replacedTechnique: string } }}
   */
  doSkillReplace(currentSlot, skillData) {
    const meridian = this._findSkillMeridian(skillData);
    const tierInfo = this._getTierInfo(3);

    // 查找替换功法
    const replacement = this._findReplacement(meridian, skillData);

    if (!replacement) {
      // 无替换数据 — 退化为文本变异
      const fallback = this.doTextVariant(skillData);
      return {
        modifiedSkill: fallback.modifiedSkill,
        log: `${tierInfo.combatLogOnCheck}\n${fallback.log}`,
        extraEffects: { originalSkillId: skillData.id, replacedTechnique: null },
      };
    }

    // 构造异化招式
    const modifiedSkill = {
      ...skillData,
      name: replacement.replaceWith,
      _hijackReplaced: true,
      _hijackOriginalName: skillData.name,
      _hijackMeridian: meridian,
      _hijackTier: replacement.tier,
      dmgType: 'spirit',
      // 伤害系数提升：异化功法更凶险
      skillNum: Math.floor((skillData.skillNum || 20) * (1.0 + replacement.tier * 0.15)),
    };

    const bodyPartDesc = this._getMeridianBodyPart(meridian);
    const log = `${tierInfo.combatLogOnCheck}\n` +
      `[功法替换] 你的${skillData.name}在出招前被篡改——${bodyPartDesc}自行选择了${replacement.replaceWith}。\n` +
      `${tierInfo.narrative}`;

    return {
      modifiedSkill,
      log,
      extraEffects: {
        originalSkillId: skillData.id,
        replacedTechnique: replacement.replaceWith,
        corruptionRisk: replacement.corruptionRisk,
      },
    };
  }

  // ----------------------------------------------------------
  //  Tier 4：跳位（跳过下一个式位，直接进入更后的式位）
  // ----------------------------------------------------------

  /**
   * 跳位 — 跳过下一个式位，直接进入更后的式位
   * @param {string} currentSlot - 当前式位
   * @returns {{ log: string, extraEffects: { jumpFrom: string, jumpTo: string, skippedSlots: string[] } }}
   */
  doSlotJump(currentSlot) {
    const currentIndex = SLOTS.indexOf(currentSlot);
    const tierInfo = this._getTierInfo(4);

    // 30%概率跳过承/转式直接进入合式或更后
    let jumpDistance;
    if (this.be.random() < SLOT_JUMP_CHANCE) {
      // 跳过1-2个式位
      jumpDistance = Math.min(2, SLOTS.length - 1 - currentIndex);
    } else {
      jumpDistance = 1; // 正常前进（但篡改仍然触发了文本层面的警告）
    }

    const targetIndex = Math.min(SLOTS.length - 1, currentIndex + jumpDistance);
    const targetSlot = SLOTS[targetIndex];
    const skippedSlots = SLOTS.slice(currentIndex + 1, targetIndex);

    // 被跳过的式位CD强制重置为就绪
    for (const skipped of skippedSlots) {
      this.be.battleState.cooldowns[skipped] = 0;
      this.be.battleState.slotUnlocked[SLOTS.indexOf(skipped)] = true;
    }

    // 更新当前式位
    this.be.battleState.currentSlot = targetIndex;
    this.be.battleState.slotUnlocked[targetIndex] = true;

    const skipText = skippedSlots.length > 0
      ? `跳过${skippedSlots.map(s => SLOT_NAMES[s]).join('、')}`
      : `身形一顿——但脚步没有乱`;

    const log = `${tierInfo.combatLogOnCheck}\n` +
      `[跳位] ${skipText}——${SLOT_NAMES[targetSlot]}抢在了意识之前。\n` +
      `${tierInfo.narrative}`;

    return {
      log,
      extraEffects: {
        jumpFrom: currentSlot,
        jumpTo: targetSlot,
        skippedSlots,
      },
    };
  }

  // ----------------------------------------------------------
  //  Tier 5：战诀覆写（整张战诀被「祂」覆盖）
  // ----------------------------------------------------------

  /**
   * 战诀覆写 — 整张战诀被「祂」覆盖，所有式位变为异化招式
   * @param {object} chart - 当前战诀 { A: skillId, B: skillId, ... }
   * @returns {{ log: string, extraEffects: { entityChart: string, entityName: string, slots: object[] } }}
   */
  doChartOverride(chart) {
    const tierInfo = this._getTierInfo(5);

    // 确定外神
    const entityKey = this._determineEntity();
    const entityChart = this._getEntityChart(entityKey);

    if (!entityChart) {
      // 无数据 — 退化为不可名状通用效果
      const fallbackLog = `${tierInfo.combatLogOnCheck}\n` +
        `[战诀覆写] 你低头一看——战诀上的笔迹不是你写的。五式全部变成了不可名状之招。\n` +
        `${tierInfo.narrative}`;
      return {
        log: fallbackLog,
        extraEffects: { entityChart: 'unknown', entityName: '不可名状', slots: [] },
      };
    }

    // 激活覆写状态
    this._chartOverrideActive = true;
    this._entityChartKey = entityKey;
    this._entitySlotIndex = 0;

    // 构造五式异化招式
    const slots = entityChart.slots.map((slotData, idx) => ({
      slot: slotData.slot,
      name: slotData.name,
      desc: slotData.desc,
      desc_awakened: slotData.desc_awakened,
      effects: slotData.effects,
      // 构造可执行技能对象
      skill: {
        id: -1000 - idx,
        name: slotData.name,
        type: 'melee',
        dmgType: 'spirit',
        skillNum: this._parseEntityDamage(slotData.effects),
        skillNumLvAdd: 0,
        cd: 0, // 祂的战诀忽略CD
        mana: 0,
        target: 'enemy',
        targetNum: 1,
        tags: ['unnameable', entityKey],
      },
    }));

    const log = `${tierInfo.combatLogOnCheck}\n` +
      `[战诀覆写] 你低头一看——战诀上的笔迹不是你写的。五式全部变成了${entityChart.name}。\n` +
      `${entityChart.chartDesc}\n` +
      `${tierInfo.narrative}`;

    return {
      log,
      extraEffects: {
        entityChart: entityChart.name,
        entityName: entityChart.entity,
        entityKey,
        slots,
      },
    };
  }

  /**
   * 获取当前覆写的实体战诀下一式
   * @returns {{ skill: object, slotData: object, isLast: boolean } | null}
   */
  getNextEntitySlot() {
    if (!this._chartOverrideActive || !this._entityChartKey) return null;
    const entityChart = this._getEntityChart(this._entityChartKey);
    if (!entityChart) return null;

    const idx = this._entitySlotIndex;
    if (idx >= entityChart.slots.length) {
      // 战诀循环完一圈 — 重置
      this._entitySlotIndex = 0;
      return null;
    }

    const slotData = entityChart.slots[idx];
    this._entitySlotIndex++;

    return {
      skill: {
        id: -1000 - idx,
        name: slotData.name,
        type: 'melee',
        dmgType: 'spirit',
        skillNum: this._parseEntityDamage(slotData.effects),
        cd: 0,
        mana: 0,
        target: 'enemy',
        targetNum: 1,
        tags: ['unnameable', this._entityChartKey],
      },
      slotData,
      isLast: idx === entityChart.slots.length - 1,
    };
  }

  /**
   * 退出战诀覆写状态
   */
  clearChartOverride() {
    this._chartOverrideActive = false;
    this._entityChartKey = null;
    this._entitySlotIndex = 0;
  }

  // ----------------------------------------------------------
  //  畸变篡改与CD的交互规则
  // ----------------------------------------------------------

  /**
   * 应用CD交互规则
   * @param {string} hijackType - 篡改类型 'text'|'stat'|'skill_replace'|'slot_jump'|'chart_override'
   * @param {object} battleState - 战斗状态（this.be.battleState）
   * @param {string} slot - 当前式位
   * @param {object} originalSkill - 原始招式（含cd字段）
   * @returns {{ cdChange: string, log: string }}
   */
  applyCdInteraction(hijackType, battleState, slot, originalSkill) {
    switch (hijackType) {
      case 'text':
      case 'stat': {
        // 1-2级：CD正常
        return { cdChange: 'normal', log: '' };
      }

      case 'skill_replace': {
        // 3级：异化招式使用原招式CD
        const cd = (originalSkill.cd || 2.0);
        if (battleState && battleState.cooldowns) {
          battleState.cooldowns[slot] = cd;
        }
        return {
          cdChange: 'original',
          log: `[CD] 异化招式沿用原招式CD（${cd}s）——替换的是招式内容，不是节奏。`,
        };
      }

      case 'slot_jump': {
        // 4级：被跳过的式位CD减半，当前式位正常CD
        if (battleState && battleState.cooldowns) {
          const currentIdx = SLOTS.indexOf(slot);
          // 被跳过的式位CD减半
          for (let i = 0; i < currentIdx; i++) {
            const s = SLOTS[i];
            if (battleState.cooldowns[s] > 0) {
              battleState.cooldowns[s] *= 0.5;
            }
          }
          // 当前式位正常CD
          battleState.cooldowns[slot] = originalSkill.cd || 2.0;
        }
        return {
          cdChange: 'halved_skipped',
          log: `[CD] 被跳过的式位CD减半——跳过的招式没出但CD被刷新，下一轮可更快使用。`,
        };
      }

      case 'chart_override': {
        // 5级：所有式位CD归零，但出招后立即重置为最大CD
        if (battleState && battleState.cooldowns) {
          for (const s of SLOTS) {
            battleState.cooldowns[s] = 0;
          }
          // 当前式位出招后设为最大CD（用原始CD的最大值）
          const maxCd = Math.max(...SLOTS.map(s => {
            const skId = battleState.chart?.[s];
            if (skId && typeof skId === 'object') return skId.cd || 3.0;
            return 3.0;
          }));
          battleState.cooldowns[slot] = maxCd;
        }
        return {
          cdChange: 'zeroed_then_max',
          log: `[CD] 祂的战诀忽略一切CD——出招后，所有式位立即重置为最大CD。规则碎了。`,
        };
      }

      default:
        return { cdChange: 'normal', log: '' };
    }
  }

  // ----------------------------------------------------------
  //  灵修异化战诀管理
  // ----------------------------------------------------------

  /**
   * 激活灵修异化战诀
   * @param {string} chartKey - 异化战诀键名 'chongchao'|'xuerou'|'xukong'
   * @returns {{ success: boolean, log: string }}
   */
  activateLingxiuChart(chartKey) {
    if (!this.HIJACK || !this.HIJACK.lingxiuCharts) {
      return { success: false, log: `异化战诀数据不可用` };
    }

    const chart = this.HIJACK.lingxiuCharts[chartKey];
    if (!chart) {
      return { success: false, log: `未找到异化战诀: ${chartKey}` };
    }

    this._lingxiuChartActive = true;
    this._lingxiuChartKey = chartKey;
    this._lingxiuCycleCount = 0;

    const log = `[异化行功] 你放开了对${chart.name}的压制——它一直埋在你灵台深处，现在它浮上来了。\n${chart.chartDesc}`;

    return { success: true, log };
  }

  /**
   * 灵修异化战诀完成一圈循环时的处理
   * @returns {{ daoxinLoss: number, hijackDoubled: boolean, log: string }}
   */
  onLingxiuCycleComplete() {
    if (!this._lingxiuChartActive) {
      return { daoxinLoss: 0, hijackDoubled: false, log: '' };
    }

    this._lingxiuCycleCount++;
    const currentDaoxin = this.game.state.daoxin ?? 100;
    this.game.state.daoxin = Math.max(0, currentDaoxin - LINGXIU_CYCLE_DAOXIN_COST);

    const log = `[异化循环] 第${this._lingxiuCycleCount}圈周天完成——道心-${LINGXIU_CYCLE_DAOXIN_COST}（当前: ${this.game.state.daoxin}/100）。\n` +
      `失控概率翻倍——你在主动邀请祂。`;

    return {
      daoxinLoss: LINGXIU_CYCLE_DAOXIN_COST,
      hijackDoubled: true,
      log,
    };
  }

  /**
   * 退出灵修异化战诀（需回宗门「镇压」）
   */
  deactivateLingxiuChart() {
    this._lingxiuChartActive = false;
    this._lingxiuChartKey = null;
    return `[镇压] 你回到宗门，完成了镇压仪式——异化战诀被重新封入灵台深处。精元全复。`;
  }

  /** 灵修异化战诀是否激活 */
  get isLingxiuChartActive() {
    return this._lingxiuChartActive;
  }

  /** 战诀覆写是否激活 */
  get isChartOverrideActive() {
    return this._chartOverrideActive;
  }

  // ----------------------------------------------------------
  //  内部辅助方法
  // ----------------------------------------------------------

  /**
   * 根据畸变等级决定篡改类型
   * @private
   */
  _determineHijackType(level) {
    if (level <= 0) return null;
    if (level === 1) return 'text';
    if (level === 2) {
      // 2级：文本变异 + 伤害浮动（随机选一个，或两个都触发）
      return this.be.random() < 0.5 ? 'text' : 'stat';
    }
    if (level === 3) return 'skill_replace';
    if (level === 4) {
      // 4级：功法替换 + 跳位（50%概率各选其一）
      return this.be.random() < 0.5 ? 'skill_replace' : 'slot_jump';
    }
    // 5级：60%战诀覆写，25%跳位，15%功法替换
    const roll = this.be.random();
    if (roll < 0.60) return 'chart_override';
    if (roll < 0.85) return 'slot_jump';
    return 'skill_replace';
  }

  /**
   * 获取Tier信息
   * @private
   */
  _getTierInfo(level) {
    if (this.HIJACK && this.HIJACK.tiers && this.HIJACK.tiers[level]) {
      return this.HIJACK.tiers[level];
    }
    // fallback
    const fallback = {
      1: { name: '初显', combatLogOnCheck: `……似乎有一股不属于你的力道在指尖流窜`, narrative: `有些不对——招式还在正轨，但你感觉到出招时的力道多了一分不容商量的自主。` },
      2: { name: '外显', combatLogOnCheck: `……你的身体似乎比你的意识快了一瞬`, narrative: `你的四肢开始「先行一步」。拳未出，臂已挥；目未定，眼已转。` },
      3: { name: '半人', combatLogOnCheck: `……这不是你会的招式。但你的身体在出。`, narrative: `出招的瞬间你认出了这个姿势——不是你在武学里学到的任何一招。是身体里的那个东西替你想的。` },
      4: { name: '人皮', combatLogOnCheck: `……你的身体想提前结束这场战斗`, narrative: `你的人皮在伪装成一个人。底下的东西已经等不及了——它要跳过中盘，直接收尾。` },
      5: { name: '不可名状', combatLogOnCheck: `……战诀上浮出一层不属于你的笔迹`, narrative: `你的战诀已经不是你的了。每一招都出自另一个意志——祂的手法。` },
    };
    return fallback[level] || fallback[1];
  }

  /**
   * 从招式数据推断bodyPart
   * @private
   */
  _inferBodyPart(skillData) {
    // 尝试从技能标签推断
    if (skillData.tags) {
      if (skillData.tags.includes('blade') || skillData.tags.includes('fist')) return 'arm';
      if (skillData.tags.includes('eye') || skillData.tags.includes('perception')) return 'eye';
      if (skillData.tags.includes('leg') || skillData.tags.includes('movement')) return 'leg';
      if (skillData.tags.includes('defense')) return 'torso';
      if (skillData.tags.includes('heal') || skillData.tags.includes('mana')) return 'heart';
      if (skillData.tags.includes('spirit')) return 'brain';
    }
    // 从技能类型推断
    if (skillData.type === 'auxiliary') {
      if (skillData.dmgType === 'spirit') return 'brain';
      return 'heart';
    }
    // 默认：arm（最常出问题的部位）
    return 'arm';
  }

  /**
   * 获取叙事模板
   * @private
   */
  _getNarrativeTemplates(bodyPart) {
    if (this.HIJACK && this.HIJACK.narrativeMutations && this.HIJACK.narrativeMutations[bodyPart]) {
      return this.HIJACK.narrativeMutations[bodyPart];
    }
    // fallback 通用模板
    return [
      {
        id: 'fallback_01',
        template: `你的{technique}——或者说，你的身体对它自己的理解——抢先了一步。`,
        tags: ['自主行动'],
        tone: '冷静疏离',
      },
      {
        id: 'fallback_02',
        template: `{technique}的起手刚摆到一半，你的骨节自己多弯了一折——于是这一招的落点偏了半寸。偏得正好。`,
        tags: ['关节反折', '意外精准'],
        tone: '恐惧中的精确',
      },
      {
        id: 'fallback_03',
        template: `这一记{technique}根本没经过你的灵台——你的身体自己完成了从蓄力到命中的全过程。你只是一个目击者。`,
        tags: ['绕过意识', '旁观'],
        tone: '解离感',
      },
    ];
  }

  /**
   * 查找技能所属脉位
   * @private
   */
  _findSkillMeridian(skillData) {
    // 如果技能本身带脉位信息
    if (skillData.meridian) return skillData.meridian;
    if (skillData.belong && typeof skillData.belong === 'string') return skillData.belong;

    // 尝试从 COMBAT_HIJACK.techniqueReplacements 反向查找
    if (this.HIJACK && this.HIJACK.techniqueReplacements) {
      for (const [meridian, data] of Object.entries(this.HIJACK.techniqueReplacements)) {
        if (data.replacements && data.replacements[skillData.name]) {
          return meridian;
        }
      }
    }

    // fallback：根据技能类型猜测
    if (skillData.type === 'auxiliary') {
      if (skillData.dmgType === 'spirit') return '灵台脉';
      return '命源脉';
    }
    if (skillData.tags && skillData.tags.includes('blade')) return '百骸脉';
    return '龙象脉'; // 默认
  }

  /**
   * 获取脉位对应的身体部位描述
   * @private
   */
  _getMeridianBodyPart(meridian) {
    if (this.HIJACK && this.HIJACK.techniqueReplacements && this.HIJACK.techniqueReplacements[meridian]) {
      return this.HIJACK.techniqueReplacements[meridian].bodyPart || '身体';
    }
    const map = {
      '龙象脉': '臂',
      '天眼脉': '目',
      '金刚脉': '躯',
      '追风脉': '腿',
      '命源脉': '心',
      '灵台脉': '脑',
      '百骸脉': '臂',
      '丹田异核': '丹田',
    };
    return map[meridian] || '身体';
  }

  /**
   * 查找功法替换
   * @private
   */
  _findReplacement(meridian, skillData) {
    if (!this.HIJACK || !this.HIJACK.techniqueReplacements) return null;

    const meridianData = this.HIJACK.techniqueReplacements[meridian];
    if (!meridianData || !meridianData.replacements) return null;

    // 精确匹配技能名
    if (meridianData.replacements[skillData.name]) {
      return meridianData.replacements[skillData.name];
    }

    // 按tier匹配 — 取最低可用tier
    const candidates = Object.entries(meridianData.replacements)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, val]) => ({ originalName: key, ...val }))
      .sort((a, b) => (a.tier || 1) - (b.tier || 1));

    return candidates[0] || null;
  }

  /**
   * 确定外神实体
   * @private
   */
  _determineEntity() {
    // 从玩家宗门查找
    const sect = this.game.state.sect || this.game.state.faction || null;
    if (sect && SECT_TO_ENTITY[sect]) {
      return SECT_TO_ENTITY[sect];
    }

    // 无宗门 → 随机
    const keys = Object.keys(SECT_TO_ENTITY).map(k => SECT_TO_ENTITY[k]);
    return keys[Math.floor(this.be.random() * keys.length)];
  }

  /**
   * 获取实体战诀数据
   * @private
   */
  _getEntityChart(entityKey) {
    if (this.HIJACK && this.HIJACK.entityCharts && this.HIJACK.entityCharts[entityKey]) {
      return this.HIJACK.entityCharts[entityKey];
    }
    return null;
  }

  /**
   * 从实体战诀的effects描述中解析伤害数值
   * @private
   */
  _parseEntityDamage(effects) {
    if (!effects || !effects.damage) return 40;
    const dmgStr = String(effects.damage);
    // 尝试提取数字
    const match = dmgStr.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    // 根据描述关键词估算
    if (dmgStr.includes('致死') || dmgStr.includes('即死')) return 80;
    if (dmgStr.includes('极高') || dmgStr.includes('全体')) return 50;
    if (dmgStr.includes('高')) return 40;
    if (dmgStr.includes('中高')) return 30;
    if (dmgStr.includes('中等')) return 25;
    if (dmgStr.includes('低')) return 15;
    return 35; // 默认
  }

  /**
   * 获取玩家当前战诀
   * @private
   */
  _getPlayerChart() {
    if (this.be && this.be.battleState && this.be.battleState.chart) {
      return this.be.battleState.chart;
    }
    return {};
  }

  /**
   * 获取道心扣除量
   * @private
   */
  _getDaoxinLoss(hijackType) {
    switch (hijackType) {
      case 'text': return 0;       // 1级：不扣道心
      case 'stat': return 0;       // 2级：不扣道心
      case 'skill_replace': return 1; // 3级：-1
      case 'slot_jump': return 2;    // 4级：-2
      case 'chart_override': return 3; // 5级：-3
      default: return 0;
    }
  }

  /**
   * 获取道心扣除的叙事文本
   * @private
   */
  _getDaoxinNarrative(hijackType) {
    const narratives = {
      skill_replace: `你的手刚刚做了你没有让它做的事。`,
      slot_jump: `你的身体替你做了决定——你只是事后被告知。`,
      chart_override: `祂替你做了决定。你只是提线。`,
    };
    return narratives[hijackType] || ``;
  }

  // ----------------------------------------------------------
  //  不可名状技随机后果（Tier 5 战诀覆写后使用）
  // ----------------------------------------------------------

  /**
   * 从不可名状技后果池中随机抽取一个效果
   * @returns {{ id: string, name: string, desc: string, probability: number } | null}
   */
  rollUnnameableConsequence() {
    if (this.HIJACK && this.HIJACK.engine && this.HIJACK.engine.unnameableConsequences) {
      const pool = this.HIJACK.engine.unnameableConsequences;
      // 按概率加权随机
      const totalWeight = pool.reduce((sum, c) => sum + c.probability, 0);
      let roll = this.be.random() * totalWeight;
      for (const consequence of pool) {
        roll -= consequence.probability;
        if (roll <= 0) return consequence;
      }
      return pool[pool.length - 1];
    }
    // fallback
    const fallback = [
      { id: 'kill', name: '殺', desc: `秒殺當前目標（無視HP/防禦）`, probability: 10 },
      { id: 'backfire', name: '反', desc: `招式反噬自身——承受與目標等量的傷害`, probability: 25 },
      { id: 'void_vision', name: '虛', desc: `目標被虛空凝視——下回合無法行動`, probability: 25 },
      { id: 'corruption_accel', name: '畸', desc: `自身畸變+5，但招式傷害打滿`, probability: 25 },
      { id: 'energy_drain', name: '噬', desc: `吸取目標精元——自身回復+目標精元上限永久-1`, probability: 15 },
    ];
    const totalWeight = fallback.reduce((sum, c) => sum + c.probability, 0);
    let roll = this.be.random() * totalWeight;
    for (const consequence of fallback) {
      roll -= consequence.probability;
      if (roll <= 0) return consequence;
    }
    return fallback[fallback.length - 1];
  }

  /**
   * 应用不可名状技后果
   * @param {string} consequenceId - 后果ID
   * @param {object} target - 目标数据（敌方）
   * @param {object} player - 玩家数据
   * @returns {{ damage: number, selfDamage: number, log: string, extraEffects: object }}
   */
  applyUnnameableConsequence(consequenceId, target, player) {
    const consequence = this.rollUnnameableConsequence();
    if (!consequence) {
      return { damage: 30, selfDamage: 0, log: `不可名状的力量涌动——但什么也没有发生。`, extraEffects: {} };
    }

    let damage = 0;
    let selfDamage = 0;
    let log = '';
    const extraEffects = {};

    switch (consequence.id) {
      case 'kill': {
        // 秒杀
        damage = target.hp;
        log = `[不可名狀·殺] ${consequence.desc}\n你的身體做了一個切割的動作——很輕，像剪斷一根線。對手倒下了。`;
        break;
      }
      case 'backfire': {
        // 反噬
        damage = 40 + this.be.random() * 20;
        selfDamage = damage;
        log = `[不可名狀·反] ${consequence.desc}\n招式出去的瞬間——力量倒灌。你和對手同時悶哼。`;
        break;
      }
      case 'void_vision': {
        // 虚空凝视
        damage = 15;
        extraEffects.stunTarget = true;
        extraEffects.stunDuration = 1;
        log = `[不可名狀·虛] ${consequence.desc}\n對手的瞳孔中映出了不屬於此界的景象——它僵住了。`;
        break;
      }
      case 'corruption_accel': {
        // 畸变加速
        damage = 60; // 最大伤害
        extraEffects.corruptionGain = 5;
        this.game.state.corruption = Math.min(5, (this.game.state.corruption || 0) + 5);
        log = `[不可名狀·畸] ${consequence.desc}\n你感覺到身體裡又有什麼東西醒了一層。傷害打滿——代價是你的。`;
        break;
      }
      case 'energy_drain': {
        // 精元吞噬
        damage = 25;
        const heal = Math.min(player.maxHp - player.hp, damage);
        extraEffects.healSelf = heal;
        extraEffects.targetMaxMpReduce = 1;
        log = `[不可名狀·噬] ${consequence.desc}\n對手的精元被抽出一縷——你感到一陣滿足。像餓了很久之後的第一口飯。`;
        break;
      }
      default: {
        damage = 30;
        log = `[不可名狀] ${consequence.desc}`;
      }
    }

    return { damage, selfDamage, log, extraEffects };
  }

  // ----------------------------------------------------------
  //  诊断 / 查询方法
  // ----------------------------------------------------------

  /**
   * 获取当前畸变状态摘要（供UI/日志使用）
   * @returns {{ level: number, tierName: string, hijackRate: number, chartOverride: boolean, lingxiuChart: boolean }}
   */
  getStatusSummary() {
    const level = this.game.state.corruption || 0;
    const tierInfo = this._getTierInfo(level);
    let rate = HIJACK_RATES[level] || 0;
    if (this._lingxiuChartActive) rate = Math.min(0.95, rate * 2);

    return {
      level,
      tierName: tierInfo.name || '未知',
      hijackRate: rate,
      chartOverride: this._chartOverrideActive,
      lingxiuChart: this._lingxiuChartActive,
      lingxiuChartName: this._lingxiuChartKey
        ? (this.HIJACK?.lingxiuCharts?.[this._lingxiuChartKey]?.name || '未知')
        : null,
    };
  }

  /**
   * 获取Tier 5不可名状后果池（供UI预览）
   * @returns {array}
   */
  getUnnameableConsequences() {
    if (this.HIJACK?.engine?.unnameableConsequences) {
      return this.HIJACK.engine.unnameableConsequences;
    }
    return [
      { id: 'kill', name: '殺', desc: `秒殺當前目標`, probability: 10 },
      { id: 'backfire', name: '反', desc: `招式反噬自身`, probability: 25 },
      { id: 'void_vision', name: '虛', desc: `虛空凝視`, probability: 25 },
      { id: 'corruption_accel', name: '畸', desc: `自身畸變+5`, probability: 25 },
      { id: 'energy_drain', name: '噬', desc: `吸取目標精元`, probability: 15 },
    ];
  }
}

// ============================================================
//  模块导出
// ============================================================

export default HijackEngine;
