/**
 * quest_service.js — 任务系统服务层
 *
 * 从 game.js 拆出的任务相关方法：
 * - applyReward：奖励字符串解析与发放
 * - startQuest：接受任务
 * - checkQuestProgress：任务进度检测（基于 type 匹配推进阶段）
 * - completeQuest：任务完成结算（奖励发放 + 状态清理）
 *
 * 设计原则：
 * - QuestService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - 不复制 state，直接读写 game.state 的任务相关字段
 * - 对外接口与原 Game 方法完全一致，Game 保留一行代理
 */

export class QuestService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /**
   * 解析奖励字符串并发放奖励
   * 格式："key:val;key:val;..."
   * 支持：gain_gold / gain_cultivation / gain_spirit / daoxin / heal / hp / random_item / random_technique
   */
  applyReward(rewardStr) {
    const g = this.game;
    const s = g.state;
    const parts = rewardStr.split(';');
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
    if (s.activeQuests.includes(questId) || s.completedQuests.includes(questId)) return;
    s.activeQuests.push(questId);
    s.questStages[questId] = 0;
    const q = g.QUESTS.find(q => q.id === questId);
    if (q) {
      g.addLog('📜 接受任务：<b>' + q.name + '</b>', 'quest');
      g.addLog('   ' + q.desc, 'quest');
      g.addLog('   阶段 1/' + q.stages.length + '：' + q.stages[0].desc, 'quest');
    }
    g.renderer.updateUI(['quest', 'char']);
  }

  /**
   * 任务进度检测
   * 注意：当前实现使用 stage.type 与传入的 type 匹配来推进，
   * 大部分 stage type 都在 'go' 事件时推进（investigate/return/talk/dialogue/deliver/find_clue/choice/escort）。
   * 已知问题：checkQuestProgress 使用 type 而非 action，15 个任务推进可能失效（T2 待修复）。
   *
   * @param {string} type - 事件类型：'go' | 'kill' | 'find'
   * @param {string|null} target - 目标名称（当前未使用，预留）
   */
  checkQuestProgress(type, target) {
    const g = this.game;
    const s = g.state;
    for (const qId of s.activeQuests) {
      const q = g.QUESTS.find(q => q.id === qId);
      if (!q) continue;
      const stage = s.questStages[qId] || 0;
      if (stage >= q.stages.length) continue;
      const curStage = q.stages[stage];

      let advance = false;
      if (curStage.type === 'go' && type === 'go') advance = true;
      else if (curStage.type === 'kill' && type === 'kill') advance = true;
      else if (curStage.type === 'encounter' && type === 'kill') advance = true;
      else if (curStage.type === 'find' && type === 'find') advance = true;
      else if (curStage.type === 'collect' && type === 'find') advance = true;
      else if (curStage.type === 'investigate' && type === 'go') advance = true;
      else if (curStage.type === 'return' && type === 'go') advance = true;
      else if (curStage.type === 'talk' && type === 'go') advance = true;
      else if ((curStage.type === 'dialogue' || curStage.type === 'deliver' || curStage.type === 'find_clue') && type === 'go') advance = true;
      else if (curStage.type === 'choice' && type === 'go') advance = true;
      else if (curStage.type === 'escort' && type === 'go') advance = true;

      if (advance || (curStage.repeat && type === 'kill')) {
        s.questStages[qId] = stage + 1;
        if (stage + 1 < q.stages.length) {
          g.addLog('📜 任务「' + q.name + '」更新：' + q.stages[stage + 1].desc, 'quest');
        } else {
          this.completeQuest(qId);
        }
      }
    }
  }

  /**
   * 任务完成结算
   */
  completeQuest(questId) {
    const g = this.game;
    const s = g.state;
    const q = g.QUESTS.find(q => q.id === questId);
    if (!q) return;

    g.addLog('🏆 任务完成：<b>' + q.name + '</b>！', 'breakthrough');
    g.showMomentFeedback?.('任务完成 · ' + q.name, 'quest');

    if (q.rewards.spiritStones) { g.addSpiritStones(q.rewards.spiritStones); g.addLog('   获得 ' + q.rewards.spiritStones + ' 灵石', 'item'); }
    if (q.rewards.copperCoins) { s.copperCoins += q.rewards.copperCoins; g.addLog('   获得 ' + q.rewards.copperCoins + ' 文铜钱', 'item'); }
    if (q.rewards.cultivation) { s.cultivation += q.rewards.cultivation; g.addLog('   获得 ' + q.rewards.cultivation + ' 修为', 'item'); }
    if (q.rewards.technique) { if (!s.techniques.includes(q.rewards.technique)) { s.techniques.push(q.rewards.technique); g.addLog('   习得功法：' + q.rewards.technique, 'special'); } }
    if (q.rewards.equipment) { s.inventory.push({ name: q.rewards.equipment, type: 'equipment', desc: '任务奖励', slot: 'weapon', atk: 10 }); g.addLog('   获得装备：' + q.rewards.equipment, 'special'); }
    if (q.rewards.item) { s.inventory.push({ name: q.rewards.item, type: 'special', desc: '任务奖励' }); g.addLog('   获得：' + q.rewards.item, 'item'); }
    if (q.rewards.faction) g.joinFaction(q.rewards.faction);
    if (q.rewards.factionRep) { s.factionRep += q.rewards.factionRep; g.addLog('   门忠 +' + q.rewards.factionRep, 'info'); }

    s.activeQuests = s.activeQuests.filter(id => id !== questId);
    s.completedQuests.push(questId);
    g.checkBreakthrough();
    g.renderer.updateUI();
  }
}

export default QuestService;
