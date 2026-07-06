/**
 * perception_service.js — 感知系统服务层
 *
 * 从 game.js 拆出的感知相关方法：
 * - peek：快速窥探当前房间（文本输出）
 * - getRoomPerception：返回交互全景对象（由 renderer.renderPerception 渲染）
 * - openPerception：打开感知面板
 * - closePerception：关闭感知面板
 *
 * 设计原则：
 * - PerceptionService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - Game 保留一行代理方法
 */

import { getData } from './data/data_loader.js';
import { getEntryAccess } from './entry_condition.js';

// 方位键集合：这些 key 归入「方位通路」（方向栏），其余归入「探索入口」（感知面板）
const CARDINAL_DIRS = new Set(['北', '南', '东', '西', '上', '下', '出', 'north', 'south', 'east', 'west', 'up', 'down', 'out']);

export class PerceptionService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /** 快速窥探当前房间（文本输出到日志） */
  peek() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法窥探！', 'combat'); return; }
    const s = g.state;
    const loc = g.LOCATIONS[s.location];
    if (!loc) { g.addLog('眼前一片虚无…', 'system'); return; }

    const obs = [];
    const dangerDesc = loc.danger <= 1 ? '街巷安宁，偶有路人经过。' :
      loc.danger <= 2 ? '隐约有些江湖人在街边低声交谈。' :
      loc.danger <= 3 ? '暗处有几双眼睛在打量你。' :
      loc.danger <= 4 ? '空气凝重，远处传来不寻常的动静。' :
      '此地杀气弥漫，处处危机。';
    obs.push(dangerDesc);

    if (loc.connections) {
      const dirs = Object.entries(loc.connections).filter(([, name]) => {
        return g.LOCATIONS[name] && getEntryAccess(g, name).visible;
      });
      if (dirs.length > 0) obs.push('可见通路：' + dirs.map(d => '<b>' + d[1] + '</b>（' + g.dirName(d[0]) + '）').join('、'));
    }

    if (loc.boss) obs.push('⚠ 远处强大的气息…有一名高手盘踞此地。');
    if (g.ROOM_SEARCH[s.location]) obs.push('搜索此处约有<b>' + Math.floor(g.ROOM_SEARCH[s.location].searchChance * 100) + '%</b>概率有所发现。');
    if (g.NPC_ENCOUNTERS[s.location] && g.NPC_ENCOUNTERS[s.location].length > 0) obs.push('附近有<b>' + g.NPC_ENCOUNTERS[s.location].length + '</b>种可能的奇遇。输入「交谈」试试。');
    if (s.faction && s.faction !== '散修' && g.isAtFactionHQ(s.location, s.faction)) obs.push('🏫 你正在本派据点——可向师傅<b>拜师</b>学习新武学！');

    g.addLog('👀 你凝神观察四周…', 'system');
    obs.forEach(o => g.addLog('   ' + o, 'info'));
  }

  /**
   * 感知系统（T9.2）—— 返回交互全景对象
   * @returns {object} { title, scene, connections[], npcs[], searchPoints[], props[], extras[] }
   */
  getRoomPerception() {
    const g = this.game;
    const s = g.state;
    const loc = g.LOCATIONS[s.location];
    if (!loc) return { title: s.location, connections: [], npcs: [], searchPoints: [], props: [], extras: ['眼前一片虚无…'] };

    // 1. 通路分类：方位通路（方向栏）vs 探索入口（感知面板）
    const allConns = loc.connections
      ? Object.entries(loc.connections)
          .filter(([, name]) => g.LOCATIONS[name])
          .map(([dir, name]) => {
            const access = getEntryAccess(g, name);
            return { dir, dirCn: g.dirName(dir), name, explored: s.explored.includes(name), ...access };
          })
          .filter(connection => connection.visible)
      : [];
    const cardinalExits = allConns.filter(c => CARDINAL_DIRS.has(c.dir));
    const connections = allConns.filter(c => !CARDINAL_DIRS.has(c.dir));

    // 2. 在场人物
    const npcs = [];
    const pool = g.NPC_ENCOUNTERS[s.location];
    if (pool && pool.length > 0) {
      pool.forEach((enc, i) => {
        if (enc.title) npcs.push({ name: enc.title, desc: g.getDesc(enc), type: 'encounter', index: i });
      });
    }
    const dl2 = getData();
    const factionPool = dl2.FACTION_RECRUITER_ENCOUNTERS[s.location] || null;
    if (factionPool && factionPool.length > 0 && s.faction === '散修') {
      factionPool.forEach((enc, i) => {
        if (enc.title) npcs.push({ name: enc.title, desc: '（帮派接引人）', type: 'recruiter', index: i });
      });
    }

    const canAskTeacher = s.faction && s.faction !== '散修' && g.isAtFactionHQ(s.location, s.faction);

    // 3. 可搜索点
    const searchPoints = [];
    if (g.ROOM_SEARCH[s.location]) {
      searchPoints.push({ name: '此地可搜索', desc: '约 ' + Math.floor(g.ROOM_SEARCH[s.location].searchChance * 100) + '% 概率有所发现' });
    }

    // 4. 场景道具
    const props = [];
    if (loc.items && Array.isArray(loc.items)) {
      loc.items.slice(0, 6).forEach((it) => {
        if (it.name) props.push({ name: it.name, desc: g.getDesc(it) });
      });
    }

    // 5. 额外提示
    const extras = [];
    if (loc.boss) extras.push('⚠ 远处强大的气息…有一名高手盘踞此地。');
    if (s.faction && s.faction !== '散修' && g.isAtFactionHQ(s.location, s.faction)) {
      extras.push('🏫 你正在本派据点——可向师傅拜师学习新武学！');
    }
    if (s.path === 'ling') {
      extras.push('🌀 你以神识扫过此地——空气中有一丝微弱的灵气波动，若有若无。');
    }

    return { title: s.location, danger: loc.danger, cardinalExits, connections, npcs, searchPoints, props, extras, canAskTeacher };
  }

  /** 打开感知面板 */
  openPerception() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) {
      g.addLog('当前无法感知！', 'combat');
      return;
    }
    const data = this.getRoomPerception();
    g.renderer.renderPerception(data);
  }

  /** 关闭感知面板 */
  closePerception() {
    const panel = document.getElementById('perception-panel');
    if (panel) panel.classList.remove('open');
  }
}

export default PerceptionService;
