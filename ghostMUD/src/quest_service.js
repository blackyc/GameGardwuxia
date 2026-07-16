/**
 * quest_service.js — 任务系统服务层
 *
 * - applyReward：奖励字符串解析与发放
 * - startQuest：接受任务 + primaryQuestId 规则
 * - checkQuestProgress：目标感知推进（事件归一化 + 阶段字段匹配 + 计数）
 * - completeQuest：任务完成结算
 * - getPrimaryQuestSummary：主线摘要纯数据
 */

import {
  normalizeQuestEvent,
  resolveStageType,
  stageMatchesEvent,
} from './contracts/quest_event.js';

const SEEN_EVENT_LIMIT = 64;

export class QuestService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /**
   * 解析奖励字符串并发放奖励
   * 格式："key:val;key:val;..."
   */
  applyReward(rewardStr) {
    const g = this.game;
    const s = g.state;
    const parts = String(rewardStr || '').split(';');
    const feedback = [];
    for (const part of parts) {
      const [key, val] = part.split(':');
      if (key === 'gain_gold') { g.addMoney(parseInt(val)); feedback.push(g.getMoneyName() + ' +' + parseInt(val)); }
      else if (key === 'gain_cultivation') { s.cultivation += parseInt(val); feedback.push('修为 +' + parseInt(val)); }
      else if (key === 'gain_spirit') { g.addSpiritStones(parseInt(val)); feedback.push('灵石 +' + parseInt(val)); }
      else if (key === 'daoxin') { s.daoxin = Math.min(s.maxDaoXin, s.daoxin + parseInt(val)); feedback.push('道心 +' + parseInt(val)); }
      else if (key === 'heal' || key === 'hp') { s.hp = Math.min(s.maxHp, s.hp + (parseInt(val) || 30)); feedback.push('气血 +' + (parseInt(val) || 30)); }
      else if (key === 'random_item') {
        const it = g.ITEMS[Math.floor(Math.random() * g.ITEMS.length)];
        s.inventory.push({ ...it });
        g.addLog('📦 获得：<b>' + it.name + '</b>', 'item');
        feedback.push('获得 · ' + it.name);
      } else if (key === 'random_technique') {
        const techItems = g.ITEMS.filter(it => it.type === 'technique');
        if (techItems.length > 0) {
          const ti = techItems[Math.floor(Math.random() * techItems.length)];
          s.inventory.push({ ...ti });
          g.addLog('📖 获得功法：<b>' + ti.name + '</b>', 'special');
          feedback.push('习得 · ' + ti.name);
        }
      }
    }
    if (feedback.length > 0) g.showMomentFeedback?.(feedback.join(' · '), 'reward');
  }

  /**
   * 接受任务
   */
  startQuest(questId) {
    const g = this.game;
    const s = g.state;
    this._ensureQuestState();
    if (s.activeQuests.includes(questId) || s.completedQuests.includes(questId)) return;
    s.activeQuests.push(questId);
    s.questStages[questId] = 0;
    s.questProgress[questId] = {
      stageIndex: 0,
      current: 0,
      seenEventIds: [],
    };

    // 第一个未完成任务成为主线；不得覆盖已有主线
    if (s.primaryQuestId == null || s.primaryQuestId === '') {
      s.primaryQuestId = questId;
    }

    const q = g.QUESTS.find(q => q.id === questId);
    if (q) {
      g.addLog('📜 接受任务：<b>' + q.name + '</b>', 'quest');
      g.addLog('   ' + q.desc, 'quest');
      g.addLog('   阶段 1/' + q.stages.length + '：' + q.stages[0].desc, 'quest');
    }
    g.renderer?.updateUI?.(['quest', 'char']);
  }

  /**
   * 任务进度检测（兼容旧签名与结构化事件）
   * @param {string|object} typeOrEvent
   * @param {string|null} [legacyTarget]
   */
  checkQuestProgress(typeOrEvent, legacyTarget) {
    const g = this.game;
    const s = g.state;
    this._ensureQuestState();
    const event = normalizeQuestEvent(typeOrEvent, legacyTarget);

    for (const qId of [...s.activeQuests]) {
      const q = g.QUESTS.find(q => q.id === qId);
      if (!q) continue;

      const progress = this._progressFor(qId);
      const stageIndex = progress.stageIndex;
      if (stageIndex >= q.stages.length) continue;
      const curStage = q.stages[stageIndex];

      if (!stageMatchesEvent(curStage, event)) continue;

      // 同一非空 eventId 不得重复计数
      if (event.eventId) {
        if (progress.seenEventIds.includes(event.eventId)) continue;
        progress.seenEventIds.push(event.eventId);
        if (progress.seenEventIds.length > SEEN_EVENT_LIMIT) {
          progress.seenEventIds = progress.seenEventIds.slice(-SEEN_EVENT_LIMIT);
        }
      }

      const need = Number(curStage.count) > 0 ? Number(curStage.count) : 1;
      progress.current += event.amount || 1;

      if (progress.current < need) {
        s.questProgress[qId] = progress;
        s.questStages[qId] = stageIndex;
        continue;
      }

      // 进入下一阶段
      const nextIndex = stageIndex + 1;
      progress.stageIndex = nextIndex;
      progress.current = 0;
      s.questProgress[qId] = progress;
      s.questStages[qId] = nextIndex;

      if (nextIndex < q.stages.length) {
        g.addLog('📜 任务「' + q.name + '」更新：' + q.stages[nextIndex].desc, 'quest');
      } else {
        this.completeQuest(qId);
      }
    }
  }

  /**
   * 主线摘要（纯数据，无 HTML / DOM / 路线）
   * @returns {object|null}
   */
  getPrimaryQuestSummary() {
    const g = this.game;
    const s = g.state;
    this._ensureQuestState();
    const questId = s.primaryQuestId;
    if (!questId) return null;
    if (!s.activeQuests.includes(questId)) return null;

    const q = g.QUESTS.find(item => item.id === questId);
    if (!q) return null;

    const progress = this._progressFor(questId);
    const stageIndex = progress.stageIndex;
    if (stageIndex >= q.stages.length) return null;
    const stage = q.stages[stageIndex] || {};
    const progressTarget = Number(stage.count) > 0 ? Number(stage.count) : 1;
    const roomHint = stage.location || stage.roomId || stage.room || stage.target || null;
    const knownRegion = roomHint ? String(roomHint).split('·')[0] : null;

    return {
      questId,
      name: q.name,
      stageIndex,
      stageCount: q.stages.length,
      objective: stage.desc || q.desc || '',
      knownRegion,
      progressCurrent: progress.current || 0,
      progressTarget,
    };
  }

  /**
   * 任务完成结算
   */
  completeQuest(questId) {
    const g = this.game;
    const s = g.state;
    this._ensureQuestState();
    const q = g.QUESTS.find(q => q.id === questId);
    if (!q) return;

    g.addLog('🏆 任务完成：<b>' + q.name + '</b>！', 'breakthrough');
    g.showMomentFeedback?.('任务完成 · ' + q.name, 'quest');

    if (q.rewards?.spiritStones) { g.addSpiritStones(q.rewards.spiritStones); g.addLog('   获得 ' + q.rewards.spiritStones + ' 灵石', 'item'); }
    if (q.rewards?.copperCoins) { s.copperCoins += q.rewards.copperCoins; g.addLog('   获得 ' + q.rewards.copperCoins + ' 文铜钱', 'item'); }
    if (q.rewards?.cultivation) { s.cultivation += q.rewards.cultivation; g.addLog('   获得 ' + q.rewards.cultivation + ' 修为', 'item'); }
    if (q.rewards?.technique) { if (!s.techniques.includes(q.rewards.technique)) { s.techniques.push(q.rewards.technique); g.addLog('   习得功法：' + q.rewards.technique, 'special'); } }
    if (q.rewards?.equipment) { s.inventory.push({ name: q.rewards.equipment, type: 'equipment', desc: '任务奖励', slot: 'weapon', atk: 10 }); g.addLog('   获得装备：' + q.rewards.equipment, 'special'); }
    if (q.rewards?.item) { s.inventory.push({ name: q.rewards.item, type: 'special', desc: '任务奖励' }); g.addLog('   获得：' + q.rewards.item, 'item'); }
    if (q.rewards?.faction) g.joinFaction(q.rewards.faction);
    if (q.rewards?.factionRep) { s.factionRep += q.rewards.factionRep; g.addLog('   门忠 +' + q.rewards.factionRep, 'info'); }

    s.activeQuests = s.activeQuests.filter(id => id !== questId);
    s.completedQuests.push(questId);
    delete s.questProgress[questId];
    // 保留 questStages 终值以兼容旧读档逻辑
    s.questStages[questId] = q.stages.length;

    if (s.primaryQuestId === questId) {
      s.primaryQuestId = s.activeQuests.length > 0 ? s.activeQuests[0] : null;
    }

    g.checkBreakthrough?.();
    g.renderer?.updateUI?.();
  }

  /** @private */
  _ensureQuestState() {
    const s = this.game.state;
    if (!Array.isArray(s.activeQuests)) s.activeQuests = [];
    if (!Array.isArray(s.completedQuests)) s.completedQuests = [];
    if (!s.questStages || typeof s.questStages !== 'object') s.questStages = {};
    if (!s.questProgress || typeof s.questProgress !== 'object') s.questProgress = {};
    if (s.primaryQuestId === undefined) s.primaryQuestId = null;

    // 从旧 questStages 补 questProgress.stageIndex
    for (const qId of s.activeQuests) {
      if (!s.questProgress[qId]) {
        const stageIndex = Number(s.questStages[qId]) || 0;
        s.questProgress[qId] = {
          stageIndex,
          current: 0,
          seenEventIds: [],
        };
      } else {
        const p = s.questProgress[qId];
        if (!Number.isFinite(Number(p.stageIndex))) {
          p.stageIndex = Number(s.questStages[qId]) || 0;
        }
        if (!Number.isFinite(Number(p.current))) p.current = 0;
        if (!Array.isArray(p.seenEventIds)) p.seenEventIds = [];
        s.questStages[qId] = p.stageIndex;
      }
    }

    if ((s.primaryQuestId == null || s.primaryQuestId === '') && s.activeQuests.length > 0) {
      s.primaryQuestId = s.activeQuests[0];
    }
    if (s.primaryQuestId && !s.activeQuests.includes(s.primaryQuestId)) {
      s.primaryQuestId = s.activeQuests.length > 0 ? s.activeQuests[0] : null;
    }
  }

  /** @private */
  _progressFor(questId) {
    const s = this.game.state;
    if (!s.questProgress[questId]) {
      s.questProgress[questId] = {
        stageIndex: Number(s.questStages[questId]) || 0,
        current: 0,
        seenEventIds: [],
      };
    }
    return s.questProgress[questId];
  }
}

export { normalizeQuestEvent, resolveStageType, stageMatchesEvent };
export default QuestService;
