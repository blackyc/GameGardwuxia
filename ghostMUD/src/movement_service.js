/**
 * movement_service.js — 移动系统服务层
 *
 * 从 game.js 拆出的移动相关方法：
 * - explore：方向移动核心逻辑（遭遇判定、任务推进、自动存档）
 * - dirName：方向代号 → 中文名映射
 * - quickTravel：地图点击快速旅行
 *
 * 设计原则：
 * - MovementService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - 不复制 state，直接读写 game.state
 * - Game 保留一行代理方法
 */

import { getData } from './data/data_loader.js';
import { getEntryAccess } from './entry_condition.js';

export class MovementService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /**
   * 方向移动核心逻辑
   * @param {string} dir - 方向：'north'|'south'|'east'|'west'|'up'|'down'|'in'|'out' 或中文
   */
  explore(dir) {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法移动！请先结束当前互动。', 'combat'); return; }
    if (g.state.isCultivating) { g.addLog('你正在修炼，无法移动。输入「修炼」结束再行。', 'system'); return; }
    const s = g.state;
    // 移动打断修炼/休憩
    let interrupted = '';
    if (s.isResting) { s.isResting = false; interrupted = '休憩'; }
    if (s.isCultivating) { s.isCultivating = false; interrupted = interrupted ? '修炼和休憩' : '修炼'; }
    if (interrupted) g.addLog('🚶 你站起身，结束了' + interrupted + '。', 'info');
    const loc = g.LOCATIONS[s.location];
    if (!loc) { g.addLog('此处地脉紊乱，感知不到方位…', 'system'); return; }

    const DIR_CN = { north:'北', south:'南', east:'东', west:'西', up:'上', down:'下', in:'入', out:'出' };
    const cnDir = DIR_CN[dir] || dir;
    const target = loc.connections?.[cnDir] || loc.connections?.[dir];
    if (!target) { g.addLog('前方的路不见了。也许从来就没有过。', 'system'); return; }
    if (!g.LOCATIONS[target]) { g.addLog('那个地方……你记不起是哪里了。明明刚刚还记得。', 'system'); return; }
    const access = getEntryAccess(g, target);
    if (!access.allowed) {
      g.addLog(access.message, 'system');
      return;
    }

    // 竹林深处子时判定：非子时不得进入竹林深处
    if (target.includes('竹林深处') && !g.isZiHour()) {
      g.addLog('竹林深处此刻不通。', 'system');
      return;
    }

    // 新手引导移动拦截：巡礼阶段由教程脚本控制移动
    if (s.tutorialPhase) {
      const dl = getData();
      if (dl.WENJIANFENG_TUTORIAL_CH1) {
        const locationBeforeTutorial = s.location;
        const allowed = dl.WENJIANFENG_TUTORIAL_CH1.onMove(g, target);
        // false = 教程明确拦截；位置已改变 = 教程状态机已完成这次移动。
        if (allowed === false) return;
        if (s.location !== locationBeforeTutorial) return;
      }
    }

    if (access.successMessage) g.addLog(access.successMessage, 'special');
    s.location = target;
    if (!s.explored.includes(target)) s.explored.push(target);
    const nl = g.LOCATIONS[target];
    // 更新场景配色
    if (g._pageManager) {
      const scene = g._pageManager.resolveScene(target);
      g._pageManager.setScene(scene);
    }
    g.addLog('🚶 向' + this.dirName(dir) + '方行去…', 'info');
    g.addLog('📍 抵达 <b>' + target + '</b> —— ' + g.getRoomDesc(target), 'info');

    // Room events
    if (nl.events && nl.events.length > 0 && Math.random() < 0.5) {
      g.addLog(nl.events[Math.floor(Math.random() * nl.events.length)], 'event');
    }

    // Encounter system
    if (nl.danger <= 2) {
      if (Math.random() < 0.35) g.triggerNPCEncounter(false);
    } else if (nl.danger >= 5) {
      if (Math.random() < nl.danger * 0.15) g.triggerEncounter(nl);
    } else {
      if (Math.random() < 0.2) {
        Math.random() < 0.5 ? g.triggerNPCEncounter(false) : g.triggerEncounter(nl);
      }
    }

    if (nl.boss && Math.random() < 0.3) g.addLog('⚠ 此地弥漫着危险的气息——强敌就在附近…', 'combat');

    g.renderer.updateLocationIcon();
    g.renderer.renderMap();
    g.checkQuestProgress('go', target);
    g.renderer.updateUI();

    // P1-1 修复：移动后标记脏状态（延迟批量保存）
    g.markDirty();
  }

  /**
   * 方向代号 → 中文名
   */
  dirName(d) {
    return { north:'北', south:'南', east:'东', west:'西', up:'上', down:'下', in:'入', out:'出',
             '北':'北', '南':'南', '东':'东', '西':'西', '上':'上', '下':'下', '入':'入', '出':'出' }[d] || d;
  }

  /**
   * 地图点击快速旅行
   */
  quickTravel(loc) {
    const g = this.game;
    const s = g.state;
    if (s.combat || s.npcEncounter) return;
    if (!s.explored.includes(loc)) return;
    const access = getEntryAccess(g, loc);
    if (!access.allowed) {
      g.addLog(access.message, 'system');
      return;
    }
    s.location = loc;
    g.addLog('🗺 快速前往 <b>' + loc + '</b>', 'info');
    g.renderer.renderMap();
    g.renderer.updateUI(['location', 'status']);
  }
}

export default MovementService;
