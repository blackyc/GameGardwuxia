/**
 * battle_intervene.js — 玩家干预系统引擎 v3.0
 *
 * 三类干预（每类每场战斗限1次）：
 * 1. 变招：切换战诀，CD减半，真气-20
 * 2. 服药：使用丹药恢复真气/HP/解状态/降畸变
 * 3. 脱战：速度检定，成功脱离战斗，失败受罚
 *
 * 设计原则：
 * - 不修改 battle_async.js，通过引用 BattleEngine 实例操作
 * - ES6 模块导出
 * - 干预状态从 battleEngine.battleState.interventionUsed 读写
 * - 药品数据从 game.state.inventory 读取
 * - 战诀从 battleEngine.battleState.chart 或玩家预设读取
 *
 * 依赖：BattleEngine (battle_async.js)
 */

import { findPresetChart, getChartSlots } from './combat_contract.js';

// ============================================================
//  常量
// ============================================================

/** 战诀预设ID → 名称映射 */
const CHART_PRESETS = {
  poixie:  { name: `破邪谱`, desc: `攻伐为先，招招毙命` },
  shouxin: { name: `守心谱`, desc: `守中带攻，以静制动` },
  boming:  { name: `搏命谱`, desc: `以命搏命，殊死一击` },
};

/** 药品配置表 */
const POTION_CONFIG = {
  huiqi_dan: {
    id: `huiqi_dan`,
    name: `回气丹`,
    desc: `恢复40点真气`,
    effect: { mp: 40 },
  },
  liaoshang_dan: {
    id: `liaoshang_dan`,
    name: `疗伤丹`,
    desc: `恢复20%最大生命`,
    effect: { hpPercent: 0.20 },
  },
  jiegu_dan: {
    id: `jiegu_dan`,
    name: `解蛊丹`,
    desc: `清除尸蛊与裂伤状态`,
    effect: { clearStatus: [`shigu`, `lieshang`] },
  },
  zhenji_dan: {
    id: `zhenji_dan`,
    name: `镇畸丹`,
    desc: `降低1级畸变等级（灵修专用，10%概率被替换为提升1级）`,
    effect: { corruptionLevel: -1 },
    lingOnly: true,
  },
};

/** 干预冷却叙事文本 */
const NARRATIVE = {
  variant: `你抓住机会，临阵变招。`,
  potion: `你摸出药丸塞入口中，短暂地压制了体内异样。`,
  retreatSuccess: `你欺身佯攻，趁敌人回防之际你抽身而退——身后气息渐渐远去。`,
  retreatFail: `你的意图被敌人识破，敌人攻势更加猛烈。`,
  alreadyUsed: `此法本场已用过，不可再用。`,
  noPotion: `行囊中没有此药。`,
  notLing: `镇畸丹唯有灵修可服。`,
  noChart: `暂未预设其他变招。`,
  mpGateBlocking: `真气不足，无法干预。`,
};

// ============================================================
//  InterveneEngine 主类
// ============================================================

export class InterveneEngine {
  /**
   * @param {BattleEngine} battleEngine - BattleEngine 实例
   */
  constructor(battleEngine) {
    this.be = battleEngine;
    this.game = battleEngine.game;
  }

  // ----------------------------------------------------------
  //  内部辅助
  // ----------------------------------------------------------

  /** @private 获取当前战斗状态 */
  _bs() {
    const bs = this.be.battleState;
    if (!bs || !bs.active) return null;
    return bs;
  }

  /** @private 检查是否处于门禁锁定 */
  _isMpGatePending() {
    const bs = this._bs();
    return bs && bs.mpGatePending;
  }

  /** @private 记录日志（通过BattleEngine的_addLog） */
  _log(text, type = `event`) {
    this.be._addLog(text, type);
  }

  /** @private 通知UI更新 */
  _notify() {
    this.be._notifyUpdate();
  }

  /** @private 从背包查找药品
   *  药品在 inventory 中的结构：{ name: '回气丹', type: 'potion', id: 'huiqi_dan', qty: 1 }
   *  或简单结构：{ name: '回气丹', type: 'consumable' }
   *  兼容直接以药品ID查找
   */
  _findPotionInInventory(itemId) {
    const inv = this.game.state.inventory || [];
    // 优先按 id 匹配
    let idx = inv.findIndex(it => it.id === itemId);
    if (idx >= 0) return { item: inv[idx], index: idx };
    // 次选按 name 匹配（POTION_CONFIG中的name）
    const cfg = POTION_CONFIG[itemId];
    if (cfg) {
      idx = inv.findIndex(it => it.name === cfg.name);
      if (idx >= 0) return { item: inv[idx], index: idx };
    }
    return null;
  }

  /** @private 消耗背包药品（数量减1，为0则移除） */
  _consumePotion(index) {
    const inv = this.game.state.inventory;
    const item = inv[index];
    if (!item) return;
    if (item.qty && item.qty > 1) {
      item.qty -= 1;
    } else {
      inv.splice(index, 1);
    }
  }

  /** @private 获取玩家预设战诀
   *  从 game.state.presetCharts 数组读取，兼容旧对象格式
   */
  _getPresetChart(chartId) {
    return findPresetChart(this.game.state, chartId);
  }

  /** @private 获取玩家当前畸变等级 */
  _getCorruptionLevel() {
    return this.game.state.corruptionLevel ?? this.game.state.corruption ?? 0;
  }

  /** @private 设置畸变等级 */
  _setCorruptionLevel(level) {
    const clamped = Math.max(0, Math.min(5, level));
    this.game.state.corruptionLevel = clamped;
  }

  /** @private 获取玩家速度 */
  _getPlayerSpd() {
    const bs = this._bs();
    return bs ? bs.player.spd : (this.game.state.spd || 6);
  }

  /** @private 获取敌人速度 */
  _getEnemySpd() {
    const bs = this._bs();
    return bs ? (bs.enemy.spd || 6) : 6;
  }

  // ----------------------------------------------------------
  //  1. 变招：切换战诀
  // ----------------------------------------------------------

  /**
   * 变招：切换到指定战诀预设
   * @param {string} chartId - 战诀预设ID: 'poixie' | 'shouxin' | 'boming'
   * @returns {{ success: boolean, log: string, newChart: object|null }}
   */
  doVariant(chartId) {
    const bs = this._bs();
    if (!bs) return { success: false, log: `战斗未进行中`, newChart: null };

    // 检查：门禁中无法干预
    if (this._isMpGatePending()) {
      this._log(NARRATIVE.mpGateBlocking, `info`);
      return { success: false, log: NARRATIVE.mpGateBlocking, newChart: null };
    }

    // 检查：是否已用过变招
    if (bs.interventionUsed.variant) {
      this._log(NARRATIVE.alreadyUsed, `info`);
      return { success: false, log: NARRATIVE.alreadyUsed, newChart: null };
    }

    // 检查：目标战诀是否存在
    const preset = this._getPresetChart(chartId);
    const newChart = preset ? (preset.slots || preset) : null;
    if (!newChart) {
      this._log(NARRATIVE.noChart, `info`);
      return { success: false, log: NARRATIVE.noChart, newChart: null };
    }

    // 检查：战诀是否与当前相同
    const currentChart = bs.chart;
    const isSame = Object.keys(newChart).every(
      k => newChart[k] === currentChart[k]
    );
    if (isSame) {
      this._log(`当前已是该战诀，无需变换。`, `info`);
      return { success: false, log: `当前已是该战诀`, newChart: null };
    }

    // ===== 执行变招 =====

    bs.interventionUsed.variant = true;

    // 切换战诀
    bs.chart = { ...newChart };

    // 变招代价：真气-20
    bs.player.mp = Math.max(0, bs.player.mp - 20);

    // 所有式位CD减半（向下取一位小数）
    const SLOTS = [`A`, `B`, `C`, `D`, `E`];
    for (const slot of SLOTS) {
      if (bs.cooldowns[slot] > 0) {
        bs.cooldowns[slot] = Math.floor(bs.cooldowns[slot] / 2 * 10) / 10;
      }
    }

    // 从起式重新开始
    bs.currentSlot = 0;
    bs.slotUnlocked = [true, false, false, false, false];
    bs.consecutiveHits = 0;

    // 重新扫描羁绊
    bs.bonds = this.be._scanBonds(newChart);

    // 叙事
    this._log(NARRATIVE.variant, `event`);
    const presetName = CHART_PRESETS[chartId]?.name || `新战诀`;
    this._log(`[变招] 切换至${presetName}，真气-20，所有CD减半`, `combat`);

    this._notify();

    return {
      success: true,
      log: NARRATIVE.variant,
      newChart: { ...newChart },
    };
  }

  // ----------------------------------------------------------
  //  2. 服药
  // ----------------------------------------------------------

  /**
   * 服药：使用丹药
   * @param {string} itemId - 药品ID（POTION_CONFIG中的key）
   * @returns {{ success: boolean, log: string, effects: string[] }}
   */
  doPotion(itemId) {
    const bs = this._bs();
    if (!bs) return { success: false, log: `战斗未进行中`, effects: [] };

    // 检查：门禁中无法干预
    if (this._isMpGatePending()) {
      this._log(NARRATIVE.mpGateBlocking, `info`);
      return { success: false, log: NARRATIVE.mpGateBlocking, effects: [] };
    }

    // 检查：是否已用过服药
    if (bs.interventionUsed.potion) {
      this._log(NARRATIVE.alreadyUsed, `info`);
      return { success: false, log: NARRATIVE.alreadyUsed, effects: [] };
    }

    // 检查：背包是否有该药品
    const found = this._findPotionInInventory(itemId);
    if (!found) {
      this._log(NARRATIVE.noPotion, `info`);
      return { success: false, log: NARRATIVE.noPotion, effects: [] };
    }

    // 检查：镇畸丹仅灵修可用
    const cfg = POTION_CONFIG[itemId];
    if (cfg && cfg.lingOnly && this.game.state.path !== `ling`) {
      this._log(NARRATIVE.notLing, `info`);
      return { success: false, log: NARRATIVE.notLing, effects: [] };
    }

    // ===== 执行服药 =====

    bs.interventionUsed.potion = true;

    // 消耗药品
    this._consumePotion(found.index);

    // 叙事
    this._log(NARRATIVE.potion, `event`);

    // 应用效果
    const effects = [];

    if (cfg) {
      const eff = cfg.effect;

      // 恢复真气
      if (eff.mp) {
        const before = bs.player.mp;
        bs.player.mp = Math.min(bs.player.maxMp, bs.player.mp + eff.mp);
        const actual = Math.floor(bs.player.mp - before);
        effects.push(`真气+${actual}`);
        this._log(`真气恢复 ${actual}（${Math.floor(bs.player.mp)}/${bs.player.maxMp}）`, `combat`);
      }

      // 恢复HP（百分比）
      if (eff.hpPercent) {
        const heal = Math.floor(bs.player.maxHp * eff.hpPercent);
        const before = bs.player.hp;
        bs.player.hp = Math.min(bs.player.maxHp, bs.player.hp + heal);
        const actual = Math.floor(bs.player.hp - before);
        effects.push(`HP+${actual}`);
        this._log(`伤口愈合 ${actual}（${Math.floor(bs.player.hp)}/${bs.player.maxHp}）`, `combat`);
      }

      // 清除状态
      if (eff.clearStatus) {
        const cleared = [];
        for (const st of eff.clearStatus) {
          if (bs.playerStatus[st] > 0) {
            bs.playerStatus[st] = 0;
            cleared.push(st);
          }
        }
        if (cleared.length > 0) {
          const names = cleared.map(s => this._statusName(s)).join(`、`);
          effects.push(`清除${names}`);
          this._log(`状态清除：${names}`, `combat`);
        } else {
          effects.push(`无状态可清`);
        }
      }

      // 畸变等级变化
      if (eff.corruptionLevel) {
        const isLing = this.game.state.path === `ling`;
        // 灵修10%概率被替换为提升1级
        if (isLing && this.be.random() < 0.10) {
          const oldLevel = this._getCorruptionLevel();
          this._setCorruptionLevel(oldLevel + 1);
          effects.push(`畸变+1（丹药被篡改！）`);
          this._log(`……不对！药力反噬——畸变等级提升！`, `event`);
        } else {
          const oldLevel = this._getCorruptionLevel();
          this._setCorruptionLevel(oldLevel + eff.corruptionLevel);
          effects.push(`畸变${eff.corruptionLevel > 0 ? `+` : ``}${eff.corruptionLevel}`);
          this._log(`畸变等级降低至 ${this._getCorruptionLevel()}`, `combat`);
        }
      }
    } else {
      // 未知药品：通用效果
      bs.player.hp = Math.min(bs.player.maxHp, bs.player.hp + 30);
      effects.push(`HP+30`);
      this._log(`未知丹药……HP+30`, `combat`);
    }

    const potionName = cfg?.name || found.item.name || `丹药`;
    this._log(`[服药] ${potionName}：${effects.join(`，`)}`, `event`);

    this._notify();

    return {
      success: true,
      log: NARRATIVE.potion,
      effects,
    };
  }

  /** @private 状态名称转换 */
  _statusName(key) {
    const names = {
      shigu: `尸蛊`,
      lieshang: `裂伤`,
      yehuo: `业火`,
      ningyuan: `凝渊`,
      pogang: `破罡`,
      mihun: `迷魂`,
      nixue: `逆血`,
    };
    return names[key] || key;
  }

  // ----------------------------------------------------------
  //  3. 脱战
  // ----------------------------------------------------------

  /**
   * 脱战：尝试脱离战斗
   * 成功概率 = 30% + (玩家spd - 敌人spd) × 5%
   * 灵修畸变≥4：20%概率脚不听使唤（自动失败）
   * @returns {{ success: boolean, log: string, enemyFreeHit: boolean }}
   */
  doRetreat() {
    const bs = this._bs();
    if (!bs) return { success: false, log: `战斗未进行中`, enemyFreeHit: false };

    // 检查：门禁中无法干预
    if (this._isMpGatePending()) {
      this._log(NARRATIVE.mpGateBlocking, `info`);
      return { success: false, log: NARRATIVE.mpGateBlocking, enemyFreeHit: false };
    }

    // 检查：是否已用过脱战
    if (bs.interventionUsed.retreat) {
      this._log(NARRATIVE.alreadyUsed, `info`);
      return { success: false, log: NARRATIVE.alreadyUsed, enemyFreeHit: false };
    }

    // ===== 标记已使用 =====
    bs.interventionUsed.retreat = true;

    // ===== 灵修畸变≥4：20%概率脚不听使唤 =====
    const corruptionLevel = this._getCorruptionLevel();
    const isLing = this.game.state.path === `ling`;
    if (isLing && corruptionLevel >= 4) {
      if (this.be.random() < 0.20) {
        this._log(`你的脚……不听使唤了。身体被某种力量钉在原地。`, `event`);
        this._log(NARRATIVE.retreatFail, `event`);
        // 敌人获得一次自由攻击
        this._log(`[脱战失败] ${bs.enemy.name}趁机追击！`, `combat`);
        this.be._enemyFreeAttack();
        if (!bs.active) {
          return { success: false, log: NARRATIVE.retreatFail, enemyFreeHit: true, outcome: bs.outcome };
        }
        this._notify();
        return {
          success: false,
          log: NARRATIVE.retreatFail,
          enemyFreeHit: true,
        };
      }
    }

    // ===== 速度检定 =====
    const playerSpd = this._getPlayerSpd();
    const enemySpd = this._getEnemySpd();
    const baseRate = 0.30;
    const spdDiff = playerSpd - enemySpd;
    const successRate = Math.max(0.05, Math.min(0.95, baseRate + spdDiff * 0.05));

    this._log(
      `[脱战判定] 速度 ${playerSpd} vs ${enemySpd}，成功率 ${Math.round(successRate * 100)}%`,
      `combat`
    );

    if (this.be.random() < successRate) {
      // ===== 成功脱战 =====
      this._log(NARRATIVE.retreatSuccess, `event`);
      this._log(`你脱离了战斗。`, `info`);
      this.be.finishCombat('retreat');
      return {
        success: true,
        log: NARRATIVE.retreatSuccess,
        enemyFreeHit: false,
      };
    } else {
      // ===== 失败：敌人自由攻击 =====
      this._log(NARRATIVE.retreatFail, `event`);
      this._log(`[脱战失败] ${bs.enemy.name}截住了你的退路！`, `combat`);
      this.be._enemyFreeAttack();
      if (!bs.active) {
        return { success: false, log: NARRATIVE.retreatFail, enemyFreeHit: true, outcome: bs.outcome };
      }
      this._notify();
      return {
        success: false,
        log: NARRATIVE.retreatFail,
        enemyFreeHit: true,
      };
    }
  }

  // ----------------------------------------------------------
  //  4. UI 数据接口
  // ----------------------------------------------------------

  /**
   * 获取可用干预列表（供UI渲染）
   * @returns {Array<object>}
   */
  getAvailableInterventions() {
    const bs = this._bs();
    if (!bs) return [];

    const used = bs.interventionUsed;
    const mpGateBlocking = this._isMpGatePending();

    // --- 变招 ---
    const presetCharts = [];
    const presets = this.game.state.presetCharts || this.game.state.chartPresets || this.game.state.charts || null;
    for (const [id, cfg] of Object.entries(CHART_PRESETS)) {
      // presetCharts 现在是数组格式 [{id, name, slots}]
      let exists = false;
      if (Array.isArray(presets)) {
        exists = presets.some(p => p.id === id);
      } else if (presets && typeof presets === 'object') {
        exists = !!presets[id];
      }
      const isCurrent = this._isCurrentChart(id, presets);
      presetCharts.push({
        id,
        name: cfg.name,
        desc: cfg.desc,
        available: exists && !isCurrent,
        isCurrent,
      });
    }

    // --- 服药 ---
    const potions = [];
    const inv = this.game.state.inventory || [];
    for (const [id, cfg] of Object.entries(POTION_CONFIG)) {
      const found = inv.find(it => it.id === id || it.name === cfg.name);
      const isLingOnly = cfg.lingOnly;
      const lingBlocked = isLingOnly && this.game.state.path !== `ling`;
      potions.push({
        id,
        name: cfg.name,
        desc: cfg.desc,
        available: !!found && !lingBlocked,
        qty: found?.qty || (found ? 1 : 0),
        lingOnly: isLingOnly,
        blocked: lingBlocked,
      });
    }

    // --- 脱战 ---
    const playerSpd = this._getPlayerSpd();
    const enemySpd = this._getEnemySpd();
    const spdDiff = playerSpd - enemySpd;
    let successRate = Math.max(0.05, Math.min(0.95, 0.30 + spdDiff * 0.05));

    // 灵修畸变≥4时显示修正后的实际成功率
    const corruptionLevel = this._getCorruptionLevel();
    const isLing = this.game.state.path === `ling`;
    let retreatNote = ``;
    if (isLing && corruptionLevel >= 4) {
      retreatNote = `畸变${corruptionLevel}级：20%概率被钉住`;
      // 期望成功率 = successRate * (1 - 0.20)
      successRate = successRate * 0.80;
    }

    return [
      {
        type: `variant`,
        label: `变招`,
        available: !used.variant && !mpGateBlocking,
        used: used.variant,
        charts: presetCharts,
      },
      {
        type: `potion`,
        label: `服药`,
        available: !used.potion && !mpGateBlocking,
        used: used.potion,
        items: potions,
      },
      {
        type: `retreat`,
        label: `脱战`,
        available: !used.retreat && !mpGateBlocking,
        used: used.retreat,
        successRate: Math.round(successRate * 100) / 100,
        successRateText: `${Math.round(successRate * 100)}%`,
        note: retreatNote,
      },
    ];
  }

  /** @private 判断当前战诀是否匹配某预设 */
  _isCurrentChart(chartId, presets) {
    const bs = this._bs();
    if (!bs || !presets) return false;
    // 兼容数组和对象两种格式
    let preset = null;
    if (Array.isArray(presets)) {
      preset = presets.find(p => p.id === chartId);
    } else {
      preset = presets[chartId];
    }
    if (!preset) return false;
    // 提取slots
    const presetSlots = preset.slots || preset;
    const current = bs.chart;
    return Object.keys(presetSlots).every(k => presetSlots[k] === current[k]);
  }

  // ----------------------------------------------------------
  //  5. 重置（新战斗时调用）
  // ----------------------------------------------------------

  /**
   * 重置干预状态（由 BattleEngine 在 startCombat 时自动完成，
   * 此方法提供给外部手动重置的场景）
   */
  reset() {
    const bs = this._bs();
    if (!bs) return;
    bs.interventionUsed = { variant: false, potion: false, retreat: false };
  }
}

// ============================================================
//  导出
// ============================================================

export default InterveneEngine;
