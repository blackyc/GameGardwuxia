/**
 * npc_service.js — NPC 遭遇系统服务层
 *
 * 从 game.js 拆出的 NPC 相关方法：
 * - triggerNPCEncounter：随机遭遇 NPC（安全区概率触发）
 * - speakToNpc：定向与指定 NPC 交谈（感知面板点击）
 * - _presentEncounter：内部方法，展示 NPC 遭遇模态框
 * - npcChoice：NPC 对话选项处理（效果解析 + 奖励 + 任务触发）
 * - closeNPC：关闭 NPC 模态框
 *
 * 设计原则：
 * - NpcService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - Game 保留一行代理方法
 */

import { getData } from './data/data_loader.js';

export class NpcService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /**
   * 随机遭遇 NPC（安全区概率触发）
   * @param {boolean} active - true=主动交谈触发，false=移动时随机触发
   */
  triggerNPCEncounter(active) {
    const g = this.game;
    const room = g.state.location;
    let pool = g.NPC_ENCOUNTERS[room];

    // 帮派招募NPC
    const dl = getData();
    const factionPool = dl.FACTION_RECRUITER_ENCOUNTERS[room] || null;

    if ((!pool || pool.length === 0) && factionPool && factionPool.length > 0 && g.state.faction === '散修' && Math.random() < 0.4) {
      pool = factionPool;
    } else if (!pool || pool.length === 0) {
      if (active) g.addLog('此处荒无人烟，你环顾四周却不见半个人影。换个热闹的地方试试？', 'system');
      return;
    }

    const enc = pool[Math.floor(Math.random() * pool.length)];
    this._presentEncounter(enc);
  }

  /**
   * 定向与指定 NPC 交谈（感知面板点击特定人物时调用）
   * @param {number} npcIndex - NPC_ENCOUNTERS[room] 中的索引
   */
  speakToNpc(npcIndex) {
    const g = this.game;
    const room = g.state.location;
    const pool = g.NPC_ENCOUNTERS[room];
    if (!pool || npcIndex >= pool.length) {
      g.addLog('此人已经不在此处了…', 'system');
      return;
    }
    this._presentEncounter(pool[npcIndex]);
  }

  /** 内部：展示 NPC 遭遇模态框 */
  _presentEncounter(enc) {
    const g = this.game;
    g.state.npcEncounter = enc;
    document.getElementById('npc-title').textContent = '👥 ' + enc.title;
    document.getElementById('npc-desc').textContent = g.getDesc(enc);
    const choicesDiv = document.getElementById('npc-choices');
    choicesDiv.innerHTML = enc.results.map((r, i) =>
      '<button class="modal-choice" data-npc-choice="' + i + '">' + r.choice + '</button>'
    ).join('');
    choicesDiv.querySelectorAll('[data-npc-choice]').forEach(btn => {
      btn.addEventListener('click', () => this.npcChoice(parseInt(btn.dataset.npcChoice)));
    });
    document.getElementById('npc-modal').classList.add('active');
  }

  /**
   * NPC 对话选项处理
   * @param {number} index - 选项索引
   */
  npcChoice(index) {
    const g = this.game;
    const enc = g.state.npcEncounter;
    if (!enc) return;
    const result = enc.results[index];
    if (!result) return;
    const s = g.state;

    // 帮派招募NPC
    if (enc.npc_type === 'faction_recruiter' && enc.faction) {
      if (result.questStart) g.startQuest(result.questStart);
      if (result.log) g.addLog(result.log, 'npc');
      this.closeNPC();
      return;
    }

    // Process effects
    if (result.effect) {
      const parts = result.effect.split(';');
      for (const part of parts) {
        const [key, val] = part.split(':');
        if (key === 'spend_gold') g.spendMoney(parseInt(val));
        else if (key === 'lose_gold') { const cur = g.getMoney(); g.addMoney(-Math.min(cur, parseInt(val))); }
        else if (key === 'check_atk') {
          if (s.attack >= parseInt(val)) {
            g.addLog(result.successLog || '成功！', 'npc');
            if (result.successReward) g.applyReward(result.successReward);
          } else {
            g.addLog(result.failLog || '失败…', 'npc');
          }
        } else if (key === 'check_agility') {
          if (Math.random() < 0.6) {
            g.addLog(result.successLog || '成功！', 'npc');
            if (result.successReward) g.applyReward(result.successReward);
          } else {
            g.addLog(result.failLog || '失败…', 'npc');
          }
        } else if (['heal','hp','daoxin','gain_gold','gain_cultivation','random_item','random_technique'].indexOf(key) >= 0) {
          g.applyReward(part);
        }
      }
    }

    if (result.reward) g.applyReward(result.reward);
    if (result.failReward) g.applyReward(result.failReward);

    const logText = result.log || result.successLog || '';
    if (logText && !logText.startsWith('成功') && !logText.startsWith('失败')) {
      g.addLog(logText, 'npc');
    }

    if (result.questStart || enc.questTrigger) {
      g.startQuest(result.questStart || enc.questTrigger);
    }

    this.closeNPC();
  }

  /** 关闭 NPC 模态框 */
  closeNPC() {
    const g = this.game;
    g.state.npcEncounter = null;
    document.getElementById('npc-modal').classList.remove('active');
    g.renderer.updateUI();
  }
}

export default NpcService;
