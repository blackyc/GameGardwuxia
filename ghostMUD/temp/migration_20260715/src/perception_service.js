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
const CARDINAL_DIRS = new Set(['北', '南', '东', '西', '上', '下', '出', '回', 'north', 'south', 'east', 'west', 'up', 'down', 'out', 'back']);

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
    const normalizedRoutes = g.routes?.getRoutes() || [];
    const allConns = normalizedRoutes.length > 0
      ? normalizedRoutes
          .map((route) => ({
            dir: route.direction,
            dirCn: g.dirName(route.direction),
            name: route.target,
            explored: s.explored.includes(route.target),
            visible: route.visible,
            allowed: route.clickable,
            message: route.blockedReason
          }))
          .filter(connection => connection.visible)
      : (loc.connections
          ? Object.entries(loc.connections)
              .filter(([, name]) => g.LOCATIONS[name])
              .map(([dir, name]) => ({ dir, dirCn: g.dirName(dir), name, explored: s.explored.includes(name), ...getEntryAccess(g, name) }))
              .filter(connection => connection.visible)
          : []);
    const cardinalExits = allConns.filter(c => CARDINAL_DIRS.has(c.dir));
    const connections = allConns.filter(c => !CARDINAL_DIRS.has(c.dir));

    // 2. 在场人物
    const npcs = [];
    const dl2 = getData();
    const tutorial = dl2.WENJIANFENG_TUTORIAL_CH1;
    const guide = tutorial && typeof tutorial.getGuideEncounter === 'function'
      ? tutorial.getGuideEncounter(g, s.location)
      : null;
    if (guide && guide.title) {
      npcs.push({
        name: guide.title,
        desc: g.getDesc(guide),
        type: 'guide',
        index: 0,
        memoryKey: guide.memoryKey || guide.id || guide.title,
        relationLabel: g.describeNpcRelation ? g.describeNpcRelation(guide) : '',
        dialogueTier: 'story',
        canSpar: false
      });
    }
    const pool = g.NPC_ENCOUNTERS[s.location];
    if (pool && pool.length > 0) {
      pool.forEach((enc, i) => {
        if (enc.title && !npcs.some(n => n.name === enc.title)) npcs.push({
          name: enc.title,
          desc: g.getDesc(enc),
          type: 'encounter',
          index: i,
          memoryKey: enc.memoryKey || enc.id || enc.title,
          relationLabel: g.describeNpcRelation ? g.describeNpcRelation(enc) : '',
          dialogueTier: this._npcDialogueTier(enc),
          canSpar: enc.canSpar !== false
        });
      });
    }
    const factionPool = dl2.FACTION_RECRUITER_ENCOUNTERS[s.location] || null;
    if (factionPool && factionPool.length > 0 && s.faction === '散修') {
      factionPool.forEach((enc, i) => {
        if (enc.title) npcs.push({ name: enc.title, desc: '（帮派接引人）', type: 'recruiter', index: i, dialogueTier: 'story' });
      });
    }

    // 房间内固定 NPC（来自 LOCATIONS 数据）
    const locData = dl2.LOCATIONS[s.location];
    if (locData && locData.npcs && Array.isArray(locData.npcs)) {
      locData.npcs.forEach((npc, i) => {
        // 跳过已在 NPC_ENCOUNTERS 中的
        if (npcs.some(n => n.name === npc.name)) return;
        npcs.push({
          name: npc.name,
          desc: npc.desc || '',
          type: 'room',
          index: i,
          memoryKey: npc.memoryKey || npc.id || npc.name,
          relationLabel: g.describeNpcRelation ? g.describeNpcRelation(npc) : '',
          dialogueTier: this._npcDialogueTier(npc),
          canSpar: npc.canSpar !== false
        });
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

    const routeClues = g.routes?.getPerceptionClues() || [];
    return { title: s.location, danger: loc.danger, cardinalExits, connections, npcs, searchPoints, props, extras, canAskTeacher, routeClues };
  }

  /** 打开感知面板 */
  _npcDialogueTier(enc) {
    const explicit = enc?.dialogueTier || enc?.storyTier || enc?.tier;
    if (explicit) return explicit;
    const results = Array.isArray(enc?.results) ? enc.results : [];
    if (enc?.questTrigger || results.some(r => r.questStart)) return 'story';
    const text = [enc?.title, enc?.name, this.game.getDesc(enc), enc?.dialogue].filter(Boolean).join(' ');
    return /鬼|诡|魇|灵|血|梦|影|妖|魔/.test(text) ? 'uncanny' : '';
  }

  openPerception() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) {
      g.addLog('当前无法感知！', 'combat');
      return;
    }
    const panel = document.getElementById('perception-panel');
    if (panel?.classList.contains('open')) {
      this.closePerception();
      return { open: false };
    }
    const sensed = g.routes?.senseCurrentRoom() || [];
    if (sensed.length > 0) {
      sensed.forEach((route) => g.addLog(route.discovery.hint, 'event'));
      g.showMomentFeedback?.('察见异处', 'discovery');
      g.renderer.updateLocation();
    }
    const data = this.getRoomPerception();
    g.renderer.renderPerception(data);
    return { open: true };
  }

  revealRoute(routeId) {
    const g = this.game;
    const result = g.routes?.revealRoute(routeId) || { ok: false, message: '此处没有可循的痕迹。' };
    g.addLog(result.message, result.ok ? 'special' : 'system');
    if (result.ok) {
      g.showMomentFeedback?.('发现 · ' + (result.route?.label || '隐路'), 'discovery');
      g.renderer.updateLocation();
    }
    g.renderer.renderPerception(this.getRoomPerception());
    return result;
  }

  /** 关闭感知面板 */
  closePerception() {
    const panel = document.getElementById('perception-panel');
    if (panel) panel.classList.remove('open');
    const trigger = document.querySelector('[data-action="perceive"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }
}

export default PerceptionService;
