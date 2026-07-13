/**
 * action_service.js — 日常动作服务层
 *
 * 从 game.js 拆出的日常动作方法：
 * - switchTab：切换/关闭 tab 面板
 * - cultivate：修炼 toggle（灵修/武修不同文案）
 * - train：练功（修为+，每10次扣道心）
 * - rest：休憩 toggle
 * - talk：交谈（触发 NPC 遭遇）
 * - askAround：打听（随机谣言/任务提示/方向指引）
 * - practiceMenu：练武菜单（列出已学武学）
 *
 * 设计原则：
 * - ActionService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - Game 保留一行代理方法
 */

export class ActionService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  switchTab(tab) {
    const g = this.game;
    // toggle 模式：点击当前已打开的 tab 则关闭
    if (g.currentTab === tab) {
      g.currentTab = null;
      g.tabManager._currentTab = null;
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('visible'));
      return;
    }
    g.currentTab = tab;
    g.tabManager.switchTo(tab);
    setTimeout(() => {
      const panel = document.getElementById('panel-' + tab);
      if (panel && panel.classList.contains('visible')) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  cultivate() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法修炼！', 'combat'); return; }
    if (g.state.isResting) { g.addLog('休憩中无法修炼。先结束休憩吧。', 'system'); return; }
    const s = g.state;
    s.isCultivating = !s.isCultivating;
    if (s.isCultivating) {
      g.addLog(s.path === 'ling'
        ? '🧘 你盘膝而坐，神识沉入丹田。灵力开始在经脉中自行周天——在此期间无法移动。再输入「修炼」可结束。'
        : '💪 你摆开架势，拳招行云流水般打将出来。汗水浸湿衣襟，丹田却愈发火热——练功无法同时移动。再输入「修炼」可收功。', 'info');
    } else {
      g.addLog('✅ 你收了架势。风从远处吹来，带走一身热意。', 'info');
    }
    g.renderer.updateUI(['progress', 'char', 'status']);
    g.markDirty();
  }

  train() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法练功！', 'combat'); return; }
    if (g.state.isCultivating || g.state.isResting) { g.addLog('你已在修炼/休憩中，先结束当前状态再练功。', 'system'); return; }
    const s = g.state;
    s.cultivation += (s.path === 'ling' ? 3 : 2);
    s.trainCounter++;
    if (s.trainCounter % 10 === 0) {
      const daoLoss = s.path === 'ling' ? 3 : 1;
      s.daoxin = Math.max(0, s.daoxin - daoLoss);
      g.addLog(s.path === 'ling'
        ? '🌀 灵力运转过剧，经脉灼痛——什么东西在窥视。修为+3（道心-' + daoLoss + '）'
        : '💪 连练十趟，筋骨愈发扎实，但你有些疲惫。修为+2（道心-' + daoLoss + '）', 'info');
    } else {
      g.addLog(s.path === 'ling'
        ? '🌀 你凝神运功，灵力在经脉中流转一周。修为+3'
        : '💪 你原地打了一套拳，筋骨微热。修为+2', 'info');
    }
    g.renderer.updateUI(['progress', 'char', 'status']);
    g.markDirty();
  }

  rest() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法休憩！', 'combat'); return; }
    if (g.state.isCultivating) { g.addLog('修炼中无法休憩。先结束修炼吧。', 'system'); return; }
    if (g.state.tutorialPhase === 'ch2_ready') {
      g.tutorial?.beginMorningPractice?.();
      return;
    }
    const s = g.state;
    s.isResting = !s.isResting;
    g.addLog(s.isResting ? '💤 你寻了一处角落蜷起身子…' : '🔔 休憩结束，继续前行。', 'info');
    g.renderer.updateUI(['progress', 'char', 'status']);
    g.markDirty();
  }

  talk() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法与人交谈！', 'combat'); return; }
    const s = g.state;
    const loc = g.LOCATIONS[s.location];
    if (loc.danger >= 5) { g.addLog('此地凶险万分，不是闲谈之所。趁未被发觉，速离为妙。', 'system'); return; }
    g.addLog('💬 你环顾四周，上前搭话…', 'info');
    g.triggerNPCEncounter(true);
  }

  askAround() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法打听！', 'combat'); return; }
    const s = g.state;
    const loc = g.LOCATIONS[s.location];
    if (!loc) return;
    if (loc.danger >= 5) { g.addLog('此地无人可问，唯有寂寞如雪。', 'system'); return; }

    const nearby = loc.connections ? Object.entries(loc.connections).filter(e => g.LOCATIONS[e[1]]).map(e => ({dir: e[0], name: e[1], loc: g.LOCATIONS[e[1]]})) : [];
    const rumors = [];

    if (nearby.length > 0) {
      const n1 = nearby[Math.floor(Math.random() * nearby.length)];
      rumors.push('「往' + g.dirName(n1.dir) + '走，能到<b>' + n1.name + '</b>。」一个路人给你指了指路。');
      if (n1.loc.danger >= 5) rumors.push('「' + n1.name + '那边最近不太平，听说了没？好几个江湖客进去就没回来。」路人压低声音说道。');
    }

    if (s.activeQuests.length > 0) {
      const q = g.QUESTS.find(q => q.id === s.activeQuests[0]);
      if (q) {
        const stage = s.questStages[q.id] || 0;
        if (stage < q.stages.length) rumors.push('你在打听中想起了手头的任务：<b>' + q.name + '</b>——' + q.stages[Math.min(stage, q.stages.length - 1)].desc);
      }
    }

    rumors.push('「听说顺天府有个卦师，什么消息都能算出来——只要出得起价。」');
    rumors.push('「城中有处秘地，藏有黄金万两。但没人找得到——据说要道心足够稳才能看见。」');
    rumors.push('「最近城里的灵脉波动很不对劲。路边的野猫都跑了。晚上别走小巷。」');
    rumors.push('「城外废墟里埋着不少好东西。但也在那些东西的视线里。别独自去。」');
    rumors.push('「最近夜里不安生，暗街一带最好绕道走——那不是给人走的路。」');

    const encPool = g.NPC_ENCOUNTERS[s.location];
    if (encPool && encPool.length > 0) {
      const questEnc = encPool.filter(e => e.questTrigger || (e.results && e.results.some(r => r.questStart)));
      if (questEnc.length > 0) rumors.push('「此地似乎有人能给你些活计。跟人<b>交谈</b>看看？」');
    }

    g.addLog('👂 ' + rumors[Math.floor(Math.random() * rumors.length)], 'info');
  }

  practiceMenu() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法练武！', 'combat'); return; }
    const s = g.state;
    const learned = Object.keys(s.skills);
    if (learned.length === 0) { g.addLog('你尚未掌握任何武学。先拜入帮派习得入门武学吧。', 'system'); return; }
    g.addLog('📖 可修炼武学：', 'info');
    learned.forEach(sid => {
      const sn = g.getSkillName(sid);
      const lv = s.skills[sid].level;
      const exp = s.skills[sid].exp;
      const need = lv * 50;
      const cost = 10 + lv * 3;
      g.addLog('  「' + sn + '」Lv.' + lv + ' EXP:' + Math.floor(exp) + '/' + need + ' 修炼消耗:' + cost + ' ' + g.getMoneyName(), 'info');
    });
    g.addLog('💡 在「武学」面板中点击技能进行修炼。', 'system');
  }
}

export default ActionService;
