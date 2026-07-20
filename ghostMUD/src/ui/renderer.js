/**
 * renderer.js — UI 渲染器
 * 参考猫国建设器 game.js 的 render() 方法
 * 参考猫国建设器 core.js 的 effectsCachedExisting 模式实现脏标记缓存
 * 负责所有 DOM 更新，从 Game 类中分离
 */

import { getData } from '../data/data_loader.js';
import { setVistaTime } from './vista.js';
import { applyPlaqueMaterial } from './plaque_material.js';

function routePoint(route) {
  const points = {
    N: [50, 16], S: [50, 84], E: [82, 50], W: [18, 50],
    NE: [80, 20], NW: [20, 20], SE: [80, 80], SW: [20, 80],
    ABOVE: [50, 13], BELOW: [50, 87], DEEP: [80, 74], BACK: [20, 74]
  };
  if (route.layout?.anchor === 'AUTO') {
    const automatic = [[18, 20], [50, 14], [82, 20], [18, 50], [82, 50], [18, 80], [50, 86], [82, 80]];
    const [x, y] = automatic[Number(route.layout?.slot || 0) % automatic.length];
    return { x, y };
  }
  const [baseX, baseY] = points[route.layout?.anchor] || points.E;
  const lane = Number(route.layout?.lane || 0);
  return { x: Math.max(10, Math.min(90, baseX + lane * 7)), y: Math.max(10, Math.min(90, baseY + lane * 7)) };
}

function resolveRoutePoints(routes) {
  const resolved = new Map();
  const occupied = [];
  const candidates = [
    [22, 0], [-22, 0], [0, 20], [0, -20],
    [18, 16], [-18, 16], [18, -16], [-18, -16],
  ];
  const collides = (point) => occupied.some((other) => (
    Math.abs(point.x - other.x) < 18 && Math.abs(point.y - other.y) < 14
  ));

  routes.forEach((route) => {
    const base = routePoint(route);
    let point = base;
    if (collides(base)) {
      const shifted = candidates
        .map(([dx, dy]) => ({ x: base.x + dx, y: base.y + dy }))
        .find((candidate) => (
          candidate.x >= 10 && candidate.x <= 90
          && candidate.y >= 10 && candidate.y <= 90
          && !collides(candidate)
        ));
      if (shifted) point = shifted;
    }
    occupied.push(point);
    resolved.set(route.id, point);
  });
  return resolved;
}

// 区域常量：定义所有可独立刷新的 UI 区域
const ZONE_CHAR = 'char';       // 人物面板（境界、修为、道心、寿命、灵石、功法、任务数）
const ZONE_STATUS = 'status';   // 境况面板（含帮派信息、攻防、HP、位置、击杀）
const ZONE_PROGRESS = 'progress'; // 进度条（修为/道心/HP 进度条 + 道心颜色警告 + 挂机状态）
const ZONE_LOCATION = 'location'; // 位置信息（地名、描述、连接道路）
const ZONE_BAG = 'bag';         // 背包 Tab
const ZONE_WUXUE = 'wuxue';     // 武学 Tab
const ZONE_QUEST = 'quest';     // 任务 Tab
const ZONE_MAP = 'map';         // 地图
const ZONE_COMBAT = 'combat';   // 战斗 UI

// 所有区域列表
const ALL_ZONES = [ZONE_CHAR, ZONE_STATUS, ZONE_PROGRESS, ZONE_LOCATION, ZONE_BAG, ZONE_WUXUE, ZONE_QUEST, ZONE_MAP, ZONE_COMBAT];

export class Renderer {
  constructor(game) {
    this.game = game;
    // 脏标记集合：记录哪些区域需要刷新
    // 参考 cat-zh-master core.js 的 effectsCachedExisting 模式：
    // 只在数据变化时更新对应 DOM 节点，避免全量刷新
    this._dirty = new Set();
  }

  /**
   * 标记某个区域为脏（需要刷新）
   * @param {string} zone - 区域名称，取值见 ZONE_* 常量
   */
  markDirty(zone) {
    this._dirty.add(zone);
  }

  /**
   * 主 UI 更新
   * 无参数：全量刷新所有区域（兼容现有调用）
   * 传 zone 字符串：只刷新指定区域
   * 传 zone 数组：刷新数组中的所有区域
   * @param {string|string[]} [zone] - 区域名称或区域数组
   */
  updateUI(zone) {
    const data = getData();
    const hasRealms = data.REALMS && data.REALMS.length > 0;
    if (!hasRealms) {
      console.warn('[Renderer] REALMS data not loaded yet — skipping realm-dependent panels');
    }

    if (zone === undefined) {
      // 无参数：全量刷新（兼容原有行为）
      this._dirty.clear();
      ALL_ZONES.forEach(z => this._dirty.add(z));
    } else if (typeof zone === 'string') {
      // 单个区域：只刷新该区域
      this._dirty.clear();
      this._dirty.add(zone);
    } else if (Array.isArray(zone)) {
      // 数组：刷新多个区域
      this._dirty.clear();
      zone.forEach(z => this._dirty.add(z));
    }

    // 按脏标记选择性刷新
    if (this._dirty.has(ZONE_CHAR) || this._dirty.has(ZONE_STATUS)) this.updateCharPanel();
    if (this._dirty.has(ZONE_PROGRESS)) this.updateProgress();
    if (this._dirty.has(ZONE_LOCATION)) this.updateLocation();
    if (this._dirty.has(ZONE_BAG) && this.game.currentTab === 'bag') this.renderInventory();
    if (this._dirty.has(ZONE_QUEST) && this.game.currentTab === 'quest') this.renderQuests();
    if (this._dirty.has(ZONE_WUXUE) && this.game.currentTab === 'wuxue') this.renderWuxue();
    if (this._dirty.has(ZONE_MAP) && this.game.mapOpen) this.renderMap();
    if (this._dirty.has(ZONE_COMBAT) && this.game.state.combat) this.updateCombatUI();

    // 时辰显示（每次UI更新时刷新）
    this.updateTimeDisplay();

    // 清除脏标记
    this._dirty.clear();
  }

  /** 更新唯一的人物摘要视图。 */
  updateCharPanel() {
    const s = this.game.state;
    const realms = typeof this.game.getRealms === 'function' ? this.game.getRealms() : getData().REALMS;
    if (!realms || realms.length === 0) return;
    const realmIndex = Math.max(0, Math.min(Number(s.realm) || 0, realms.length - 1));
    const currentRealm = realms[realmIndex] || realms[0];
    const next = realmIndex < realms.length - 1 ? realms[realmIndex + 1] : null;
    const pathName = s.path === 'ling' ? '灵修' : '武修';
    const factionName = s.faction || '散修';
    const hpMax = Math.max(0, Number(s.maxHp) || 0);
    const mpMax = Math.max(0, Number(s.maxMp) || 0);
    const attack = Number(s.attack || 0) + Number(s.equipment?.weapon?.atk || 0);
    const defense = Number(s.defense || 0) + Number(s.equipment?.armor?.def || 0);
    const cultivationMax = next ? Math.max(1, Number(next.cost) || 1) : Math.max(1, Number(s.cultivation) || 1);
    const daoxinMax = Math.max(1, Number(s.maxDaoXin) || 1);

    this._setText('stat-realm', currentRealm.name);
    this._setText('stat-cultivation', next ? Math.floor(s.cultivation) + ' / ' + next.cost : '已满');
    this._setText('stat-daoxin', s.daoxin + ' / ' + s.maxDaoXin);
    this._setText('stat-lifespan', s.lifespan + ' 年');
    this._setText('stat-stones', this.game.formatMoney());
    const stonesLabel = document.getElementById('stones-label');
    if (stonesLabel) stonesLabel.textContent = this.game.getMoneyName();

    this._setText('char-path', pathName);
    this._setText('char-name', s.playerName || '无名小辈');
    this._setText('char-origin', s.innateName || '身世未明');
    this._setText('char-faction', factionName);
    this._setText('char-realm', currentRealm.name);
    this._setText('char-portrait-caption', factionName === '散修' ? '江湖未署名' : factionName + '门人');
    this._setText('char-hp', s.hp + ' / ' + hpMax);
    this._setText('char-mp-label', this.game.getMpName());
    this._setText('char-mp', mpMax > 0 ? (s.mp + ' / ' + mpMax) : '-');
    this._setText('char-combat', attack + ' / ' + defense);
    this._setText('char-reputation', factionName === '散修' ? '未入门' : String(s.factionRep || 0));
    this._setText('char-kills', s.killCount || 0);
    this._setStyle('char-hp-bar', 'width', hpMax > 0 ? Math.max(0, Math.min(100, s.hp / hpMax * 100)) + '%' : '0%');
    this._setStyle('char-mp-bar', 'width', mpMax > 0 ? Math.max(0, Math.min(100, s.mp / mpMax * 100)) + '%' : '0%');
    this._setStyle('char-cultivation-bar', 'width', next ? Math.max(0, Math.min(100, s.cultivation / cultivationMax * 100)) + '%' : '100%');
    this._setStyle('char-daoxin-bar', 'width', Math.max(0, Math.min(100, s.daoxin / daoxinMax * 100)) + '%');

    const sheet = document.getElementById('panel-char');
    if (sheet) sheet.dataset.path = s.path === 'ling' ? 'ling' : 'wu';
  }

  // 兼容旧调用；DOM 已不再维护第二份境况面板。
  updateStatusPanel() { this.updateCharPanel(); }

  /**
   * 更新进度条区域
   * 包含：修为进度条、道心进度条、HP进度条、道心颜色警告、挂机状态
   */
  updateProgress() {
    const s = this.game.state;
    const data = getData();
    if (!data.REALMS || data.REALMS.length === 0) return;
    const next = s.realm < data.REALMS.length - 1 ? data.REALMS[s.realm + 1] : null;

    // 修为进度条（已移至人物页，此处安全跳过）
    if (next) {
      this._setStyle('cultivation-bar', 'width', Math.min(100, (s.cultivation / next.cost) * 100) + '%');
      this._setText('cultivation-text', Math.floor((s.cultivation / next.cost) * 100) + '%');
    } else {
      this._setStyle('cultivation-bar', 'width', '100%');
      this._setText('cultivation-text', '圆满');
    }

    // 道心进度条
    this._setStyle('daoxin-bar', 'width', (s.daoxin / s.maxDaoXin * 100) + '%');
    this._setText('daoxin-text', Math.floor(s.daoxin / s.maxDaoXin * 100) + '%');

    // HP 进度条
    this._setStyle('hp-bar', 'width', (s.hp / s.maxHp * 100) + '%');
    this._setText('hp-text', Math.floor(s.hp / s.maxHp * 100) + '%');

    // MP 进度条（真气/灵力）
    if (s.maxMp > 0) {
      this._setStyle('mp-bar', 'width', (s.mp / s.maxMp * 100) + '%');
      this._setText('mp-text', Math.floor(s.mp / s.maxMp * 100) + '%');
      this._setText('mp-label', this.game.getMpName());
    }

    // 道心颜色警告
    const dxEl = document.getElementById('stat-daoxin');
    if (dxEl) dxEl.className = 'stat-value' + (s.daoxin < 20 ? ' danger' : s.daoxin < 50 ? ' highlight' : '');

    // 挂机状态（已从江湖页移除，安全跳过）
    const stEl = document.getElementById('idle-status');
    if (stEl) {
      if (s.isResting) {
        stEl.className = 'resting';
        stEl.innerHTML = '<span class="pulse"></span>休憩中 · 气血/内力/道心恢复';
      } else if (s.isCultivating) {
        stEl.className = 'resting';
        stEl.innerHTML = '<span class="pulse"></span>修炼中 · 修为增长 · 道心减扣';
      } else {
        stEl.className = '';
        stEl.innerHTML = '<span class="pulse"></span>挂机修炼中 · 每 30 秒获取修为';
      }
    }
  }

  /**
   * 更新位置信息区域
   * 包含：地名、描述、连接道路
   */
  /** 从房间ID提取显示名（取·后最后一段，无·则原样返回） */
  displayName(roomId) {
    if (!roomId) return '';
    const parts = roomId.split('\u00b7'); // ·
    return parts.length > 1 ? parts.pop() : roomId;
  }

  /** 从房间ID提取大区名（取·前第一段） */
  regionName(roomId) {
    if (!roomId) return '';
    const parts = roomId.split('\u00b7');
    return parts.length > 1 ? parts[0] : '';
  }

  updateLocation() {
    const s = this.game.state;
    const data = getData();

    // 显示裸名，大区单独显示
    this._setText('location-name', this.displayName(s.location));
    const regionEl = document.getElementById('location-region');
    if (regionEl) this._setText('location-region', this.regionName(s.location));
    applyPlaqueMaterial(s.location, data.LOCATIONS?.[s.location]);
    const tutorial = data.WENJIANFENG_TUTORIAL_CH1;
    const isGuideActive = !!(tutorial && typeof tutorial.isGuideActive === 'function' && tutorial.isGuideActive(this.game, s.location));
    const banner = document.querySelector('.location-banner');
    if (banner) {
      banner.classList.toggle('location-banner--guide', isGuideActive);
      banner.dataset.tutorialPhase = s.tutorialPhase || '';
      banner.dataset.tutorialStep = String(s.tutorialStep || 0);
    }
    const guideStatus = document.getElementById('location-guide-status');
    if (guideStatus) guideStatus.hidden = !isGuideActive;

    // 房间描述：优先使用game.getRoomDesc()（按时辰变体）
    const desc = this.game.getRoomDesc ? this.game.getRoomDesc(s.location) : (data.getDesc(data.LOCATIONS[s.location]) || '未知之地');
    this._setText('location-desc', desc);

    // 在场人物只保留小名牌。描述和操作统一进入水墨言路壳，避免
    // 主场景因 NpcDetailCard 展开而产生布局跳变。
    const npcsEl = document.getElementById('room-npcs');
    const roomCardEl = document.getElementById('room-card');
    if (roomCardEl) roomCardEl.classList.remove('scene-narrative-panel--npc-selected');
    if (npcsEl) {
      const perc = this.game.getRoomPerception ? this.game.getRoomPerception() : null;
      const list = perc && perc.npcs ? perc.npcs : [];
      if (list.length > 0) {
        const interaction = this.game.npc?.interaction || null;
        const focusedIndex = Number.isInteger(interaction?.npcIndex) ? interaction.npcIndex : null;
        const focusedType = interaction?.npcType || null;
        const focused = focusedIndex === null ? null : list.find(n => Number(n.index) === focusedIndex && (n.type || 'encounter') === focusedType);
        if (roomCardEl) roomCardEl.classList.toggle('scene-narrative-panel--npc-selected', false);
        const buttons = list.map((n, order) => {
          const idx = Number(n.index);
          const type = n.type || 'encounter';
          const isSelected = focused && Number(focused.index) === idx && (focused.type || 'encounter') === type;
          const chipState = this._npcChipState(n, isSelected);
          const isLocked = chipState === 'locked';
          const chipBadge = this._npcChipBadge(chipState);
          const tasselSide = Math.floor(order / 3) % 2 === 0 ? 'right' : 'left';
          return '<button type="button" class="room-npc-card npc-chip npc-chip--' + chipState + ' npc-chip--tassel-' + tasselSide + (isSelected ? ' active' : '') + '" data-npc-state="' + chipState + '" data-action="focusNpc" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '"' + (isLocked ? ' disabled aria-disabled="true"' : '') + '>'
            + '<span class="npc-name">' + this._esc(n.name) + '</span>'
            + chipBadge
            + '<span class="npc-rod npc-rod--l" aria-hidden="true"></span><span class="npc-rod npc-rod--r" aria-hidden="true"></span>'
            + '<span class="npc-tassel-anchor" aria-hidden="true"><span class="npc-tassel"><i></i><b></b><u></u></span></span>'
            + '</button>';
        }).join('');
        npcsEl.innerHTML = '<div class="room-npc-list" aria-label="在场人物">' + buttons + '</div>';
      } else {
        npcsEl.innerHTML = '';
      }
    }
    // 方位通路：渲染到方向栏
    this.renderExitBar();
    this.renderTutorialActionPanel();
  }

  renderTutorialActionPanel() {
    const panel = document.getElementById('tutorial-action-panel');
    if (!panel) return;
    const model = this.game.tutorial?.getViewModel?.();
    if (!model) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    panel.hidden = false;
    const actions = (model.actions || []).map(action => {
      const danger = action.danger ? ' tutorial-action--danger' : '';
      const slot = action.slot ? ` data-tutorial-slot="${this._esc(action.slot)}"` : '';
      const side = action.side ? ` data-tutorial-side="${this._esc(action.side)}"` : '';
      return `<button type="button" class="tutorial-action${danger}" data-action="tutorial" data-tutorial-action="${this._esc(action.id)}"${slot}${side}>${this._esc(action.label)}</button>`;
    }).join('');
    const meters = (model.meters || []).map(meter => {
      const max = Math.max(1, Number(meter.max) || 1);
      const value = Math.max(0, Math.min(max, Number(meter.value) || 0));
      const pct = Math.round(value / max * 100);
      return `<div class="tutorial-meter"><span>${this._esc(meter.label)}</span><div class="tutorial-meter-track"><i style="width:${pct}%"></i></div><b>${Math.round(value * 10) / 10}/${max}</b></div>`;
    }).join('');
    panel.innerHTML = `<div class="tutorial-action-head"><span>门中日课</span><strong>${this._esc(model.title)}</strong></div>`
      + `<p class="tutorial-action-body">${this._esc(model.body || '')}</p>`
      + `<div class="tutorial-action-objective"><span>当前</span>${this._esc(model.objective || '')}</div>`
      + (meters ? `<div class="tutorial-meters">${meters}</div>` : '')
      + (actions ? `<div class="tutorial-action-controls">${actions}</div>` : '');
  }

  /**
   * 渲染方位通路方向栏（区域2常驻）
   * 显示东南西北等方位连接，与感知面板的探索入口分层。
   */
  renderExitBar() {
    const bar = document.getElementById('exit-bar');
    if (!bar) return;
    const routes = this.game.routes?.getRoutes() || [];
    const roomLayer = this.game.routes?.getRoomLayer?.() || 'world';
    const isChildLayer = roomLayer === 'dungeon' || roomLayer === 'interior';
    const mapRoutes = isChildLayer ? routes : routes.filter((route) => route.kind !== 'dungeon' && route.kind !== 'interior');
    const visibleRoutes = mapRoutes.filter((route) => route.visible);
    const sensedRoutes = [];
    const revealedRoutes = visibleRoutes.filter((route) => route.state === 'revealed');
    const lockedRoutes = visibleRoutes.filter((route) => route.state === 'revealedLocked');
    if (visibleRoutes.length === 0 && sensedRoutes.length === 0) {
      bar.innerHTML = '';
      bar.style.display = 'none';
      return;
    }
    const routePoints = resolveRoutePoints([...visibleRoutes, ...sensedRoutes]);

    const currentName = this._esc(this.displayName(this.game.state.location));
    const exploredRooms = Array.isArray(this.game.state?.explored) ? this.game.state.explored : [];
    // 芥子园行旅图：640×200 逻辑画布，当前节点居中，resolveRoutePoints 的 % 坐标 ×6.4/×2 映射
    const VB_W = 640, VB_H = 200, CX = 320, CY = 100;
    const px = (pt) => Number(((pt.x / 100) * VB_W).toFixed(1));
    const py = (pt) => Number(((pt.y / 100) * VB_H).toFixed(1));
    // 卡角记号：按房名特征映射芥子园式小符
    const markFor = (label) => {
      if (/山门|牌坊/.test(label)) return '<path d="M-10 6 L-10 -6 M10 6 L10 -6 M-14 -6 L14 -6 M-8 -11 L8 -11"/>'; // 四柱顶
      if (/阶/.test(label)) return '<path d="M-10 6 L10 6 M-7 0 L7 0 M-4 -6 L4 -6"/>'; // 剑阶三横
      if (/松/.test(label)) return '<path d="M0 8 L0 -2 M0 -2 L-7 -10 M0 -2 L7 -10 M0 2 L-5 -4 M0 2 L5 -4"/>'; // 斜松
      if (/门|城|关|楼|阁/.test(label)) return '<path d="M-9 7 L-9 -3 L9 -3 L9 7 M-12 -3 L12 -3 M-5 -8 L5 -8 M0 -8 L0 -12"/>'; // 城楼
      return '<circle cx="0" cy="0" r="2.6"/>'; // 墨点
    };
    // 固定种子的整数折线：呈现清晰的像素偏差，而不是噪声滤镜造成的缺墨感。
    const pixelFramePath = (width, height, key = '') => {
      const hw = Math.round(width / 2);
      const hh = Math.round(height / 2);
      let seed = Array.from(String(key)).reduce((sum, ch) => ((sum * 33) + ch.charCodeAt(0)) >>> 0, 17);
      const jitter = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return (seed % 5) - 2;
      };
      const x1 = -Math.round(hw * .46), x2 = Math.round(hw * .08), x3 = Math.round(hw * .58);
      const y1 = -Math.round(hh * .38), y2 = Math.round(hh * .34);
      return [
        `M ${-hw + jitter()} ${-hh + jitter()}`,
        `L ${x1} ${-hh + jitter()} L ${x2} ${-hh + jitter()} L ${x3} ${-hh + jitter()} L ${hw + jitter()} ${-hh + jitter()}`,
        `L ${hw + jitter()} ${y1} L ${hw + jitter()} ${y2} L ${hw + jitter()} ${hh + jitter()}`,
        `L ${x3} ${hh + jitter()} L ${x2} ${hh + jitter()} L ${x1} ${hh + jitter()} L ${-hw + jitter()} ${hh + jitter()}`,
        `L ${-hw + jitter()} ${y2} L ${-hw + jitter()} ${y1} Z`
      ].join(' ');
    };
    const parts = [];
    let inkrunUsed = false;
    visibleRoutes.forEach((route) => {
      const point = routePoints.get(route.id) || routePoint(route);
      const x = px(point), y = py(point);
      const label = this._esc(route.label);
      const dirWord = this._esc(this.game.dirName ? this.game.dirName(route.direction) : (route.direction || ''));
      const isLocked = route.state === 'revealedLocked' || !route.clickable;
      // 谜面未揭：可去但从未探访 → 淡墨虚框，名号记号一并淡之
      const mystery = route.clickable && route.target && !exploredRooms.includes(route.target);
      let lineCls = 'rs-line';
      if (mystery) lineCls += ' rs-line--mystery';
      else if (isLocked) lineCls += ' rs-line--locked';
      let nodeCls = 'rs-node';
      if (mystery) nodeCls += ' rs-node--mystery';
      if (isLocked) nodeCls += ' rs-node--locked';
      if (route.clickable && !inkrunUsed) {
        lineCls += ' rs-line--inkrun';
        nodeCls += ' rs-node--inkrun';
        inkrunUsed = true;
      }
      parts.push(`<line class="${lineCls}" x1="${CX}" y1="${CY}" x2="${x}" y2="${y}"></line>`);
      // 方向字落在线中段
      if (dirWord) parts.push(`<text class="rs-dir" x="${((CX + x) / 2).toFixed(1)}" y="${((CY + y) / 2 - 5).toFixed(1)}">${dirWord}</text>`);
      // 近缘足迹：横向偏外侧的通路在连线旁点两粒墨
      if (point.x < 42 || point.x > 58) {
        const fx = CX + (x - CX) * 0.62, fy = CY + (y - CY) * 0.62;
        parts.push(`<circle class="rs-foot" cx="${fx.toFixed(1)}" cy="${(fy - 7).toFixed(1)}" r="1.6"/><circle class="rs-foot" cx="${(fx + 5).toFixed(1)}" cy="${(fy + 6).toFixed(1)}" r="1.6"/>`);
      }
      const actionAttrs = route.clickable ? ` data-action="explore" data-dir="${this._esc(route.direction)}"` : '';
      const titleAttr = isLocked ? ` title="${this._esc(route.blockedReason || '此路暂不可通')}"` : '';
      const framePath = pixelFramePath(104, 34, route.id || route.label);
      parts.push(
        `<g class="${nodeCls}" transform="translate(${x},${y})"${actionAttrs}${titleAttr}>`
        + `<path class="rs-frame rs-frame--shadow" d="${framePath}" transform="translate(1 1)"></path>`
        + `<path class="rs-frame rs-frame--pixel" d="${framePath}"></path>`
        + `<text class="rs-name" x="0" y="7">${label}</text>`
        + `<g class="rs-mark" transform="translate(0,-27)">${markFor(route.label)}</g>`
        + (isLocked ? '<text class="rs-seal" x="42" y="-8">封</text>' : '')
        + '</g>'
      );
    });
    // 感知未明的通路：淡墨虚线 + 墨点
    sensedRoutes.forEach((route) => {
      const point = routePoints.get(route.id) || routePoint(route);
      const x = px(point), y = py(point);
      parts.push(`<line class="rs-line rs-line--sensed" x1="${CX}" y1="${CY}" x2="${x}" y2="${y}"></line>`);
      parts.push(`<circle class="rs-sensed-mark" cx="${x}" cy="${y}" r="2.4"></circle>`);
    });
    // 当前节点：居中，「在」字朱砂签探出右缘
    const currentFramePath = pixelFramePath(116, 38, this.game.state.location || currentName);
    parts.push(
      `<g class="rs-node rs-node--current" transform="translate(${CX},${CY})">`
      + `<path class="rs-frame rs-frame--shadow" d="${currentFramePath}" transform="translate(1 1)"></path>`
      + `<path class="rs-frame rs-frame--pixel" d="${currentFramePath}"></path>`
      + `<text class="rs-name rs-name--current" x="0" y="8">${currentName}</text>`
      + '<g class="rs-here" transform="translate(50,-16)"><rect x="-2" y="-9" width="20" height="24"></rect><text x="8" y="8">在</text></g>'
      + '</g>'
    );

    bar.className = 'exit-bar route-sketch';
    bar.style.display = 'block';
    let routeStatus = '';
    if (lockedRoutes.length > 0) {
      const route = lockedRoutes[0];
      routeStatus = `<div class="route-sketch-status route-sketch-status--locked">${this._esc(route.label)}已现：${this._esc(route.blockedReason || '条件不足，暂不可入。')}</div>`;
    } else if (revealedRoutes.length > 0) {
      const route = revealedRoutes[0];
      routeStatus = `<div class="route-sketch-status route-sketch-status--revealed">感知：${this._esc(route.hint || `发现通向${route.label}的入口。`)}</div>`;
    } else if (sensedRoutes.length > 0) {
      const route = sensedRoutes[0];
      routeStatus = `<div class="route-sketch-status">感知：${this._esc(route.hint || '此处似有异样。')}</div>`;
    }
    if (routeStatus) bar.classList.add('route-sketch--has-status');
    bar.innerHTML = '<div class="route-sketch-canvas">'
      + `<svg class="route-sketch-svg" viewBox="0 0 ${VB_W} ${VB_H}" role="group" aria-label="行旅图">${parts.join('')}</svg>`
      + `</div>${routeStatus}`;
    return;
    const s = this.game.state;
    const perc = this.game.getRoomPerception ? this.game.getRoomPerception() : null;
    if (!perc || !perc.cardinalExits || perc.cardinalExits.length === 0) {
      bar.innerHTML = '';
      bar.style.display = 'none';
      return;
    }
    bar.style.display = 'flex';
    bar.innerHTML = '<div class="exit-bar-title">── 此处联通 ──</div>' + perc.cardinalExits.map(c => {
      const marker = c.explored ? '→' : '？';
      const label = c.explored ? this.displayName(c.name) : '？？？';
      const cls = c.explored ? 'exit-btn' : 'exit-btn unexplored';
      return '<button class="' + cls + '" data-action="explore" data-dir="' + c.dir + '">'
        + '<span class="exit-dir">' + c.dirCn + '</span>'
        + '<span class="exit-name">' + label + '</span>'
        + '</button>';
    }).join('');
  }

  /** 渲染背包 */
  renderInventory() {
    const body = document.getElementById('inv-body');
    const s = this.game.state;
    if (s.inventory.length === 0) {
      body.innerHTML = '<div class="inv-empty">空空如也</div>';
      return;
    }
    const data = getData();
    body.innerHTML = s.inventory.map((item, i) => {
      let color = '#a06840';
      if (item.type === 'technique') color = '#7a4a90';
      if (item.type === 'equip' || item.type === 'equipment') color = '#c4b0a0';
      if (item.type === 'special') color = '#c4886a';
      return '<div class="inv-item" data-item-idx="' + i + '" style="color:' + color + '"><span class="inv-icon">📦</span><span class="inv-name">' + item.name + '</span><span class="inv-desc">' + (data.getDesc(item) || '') + '</span></div>';
    }).join('');

    // 绑定点击
    body.querySelectorAll('[data-item-idx]').forEach(el => {
      el.addEventListener('click', () => this.game.useItem(parseInt(el.dataset.itemIdx)));
    });
  }

  /** 渲染任务列表 */
  renderQuests() {
    const body = document.getElementById('quest-body');
    const s = this.game.state;
    const data = getData();
    if (s.activeQuests.length === 0 && s.completedQuests.length === 0) {
      body.innerHTML = '<div class="inv-empty">暂无任务</div>';
      return;
    }
    let html = '';

    if (data.routeClues && data.routeClues.length > 0) {
      html += '<div class="perc-section perc-route-clues"><div class="perc-head">> 感知所得</div>';
      data.routeClues.forEach((clue) => {
        html += '<div class="perc-item perc-route-clue"><span>' + this._esc(clue.hint) + '</span>'
          + '<button class="perc-subbtn" data-perc-action="reveal-route" data-route-id="' + this._esc(clue.id) + '">' + this._esc(clue.revealLabel) + '</button></div>';
      });
      html += '</div>';
    }
    if (s.activeQuests.length > 0) {
      html += '<div style="color:#c49a38;font-size:12px;letter-spacing:2px;margin-bottom:6px;">进行中</div>';
      for (const qId of s.activeQuests) {
        const q = data.QUESTS.find(q => q.id === qId);
        if (!q) continue;
        const stage = s.questStages[qId] || 0;
        html += '<div class="quest-item"><div class="quest-name">' + q.name + '</div>';
        html += '<div class="quest-stage">阶段 ' + (stage + 1) + '/' + q.stages.length + '：' + (q.stages[Math.min(stage, q.stages.length - 1)].desc) + '</div>';
        html += '<div class="quest-reward">奖励：' + Object.entries(q.rewards).filter(([k]) => k !== 'faction' && k !== 'access').map(([k, v]) => (k === 'spiritStones' ? v + this.game.getMoneyName() : k === 'cultivation' ? v + '修为' : '获得' + v)).join('、') + '</div></div>';
      }
    }
    if (s.completedQuests.length > 0) {
      html += '<div style="color:#5a8068;font-size:12px;letter-spacing:2px;margin:8px 0 6px;">已完成</div>';
      for (const qId of s.completedQuests) {
        const q = data.QUESTS.find(q => q.id === qId);
        if (!q) continue;
        html += '<div class="quest-item" style="opacity:0.6"><div class="quest-name" style="color:#5a8068">✓ ' + q.name + '</div></div>';
      }
    }
    body.innerHTML = html;
  }

  /** 渲染武学面板 */
  renderWuxue() {
    const s = this.game.state;
    const data = getData();
    const content = document.getElementById('wuxue-content');
    const badge = document.getElementById('faction-badge');

    if (s.faction && s.faction !== '散修' && data.FACTIONS[s.faction]) {
      const f = data.FACTIONS[s.faction];
      badge.style.display = 'block';
      document.getElementById('fb-name').textContent = f.name || s.faction;
      document.getElementById('fb-desc').textContent = f.desc || '';
    } else {
      badge.style.display = 'none';
    }

    if (!s.faction || s.faction === '散修') {
      content.innerHTML = '<div class="inv-empty">尚未拜入帮派<br><span style="font-size:11px;color:#4a3040">探索不同城区可遇帮派接引人</span></div>';
      return;
    }

    // 渲染技能树
    const factionData = data.FACTIONS[s.faction];
    if (!factionData || !factionData.skills) {
      content.innerHTML = '<div class="inv-empty">该帮派武学卷宗缺失</div>';
      return;
    }

    const skillSections = factionData.skills.some(item => Array.isArray(item.skills))
      ? factionData.skills
      : [{ name: '本门武学', skills: factionData.skills }];

    let html = '';
    for (const section of skillSections) {
      const sectionId = 'skill-section-' + section.name.replace(/\s/g, '');
      const hasLearned = section.skills.some(sk => s.skills[sk.id]);
      html += '<div class="skill-section">';
      html += '<div class="skill-section-header' + (hasLearned ? ' open' : '') + '" data-section="' + sectionId + '">' + section.name + '<span class="arrow">▶</span></div>';
      html += '<div class="skill-list' + (hasLearned ? ' open' : '') + '" id="' + sectionId + '">';
      for (const sk of section.skills) {
        const learned = s.skills[sk.id];
        const cls = learned ? 'learned' : 'unlearned';
        html += '<div class="skill-item ' + cls + '" data-skill="' + sk.id + '">';
        html += '<span class="skill-icon">' + (learned ? '📜' : '🔒') + '</span>';
        html += '<span class="skill-name">' + sk.name + '</span>';
        if (learned) {
          html += '<span class="skill-level">Lv.' + learned.level + '</span>';
        }
        html += '</div>';
      }
      html += '</div></div>';
    }
    content.innerHTML = html;

    // 绑定折叠
    content.querySelectorAll('.skill-section-header').forEach(header => {
      header.addEventListener('click', () => {
        header.classList.toggle('open');
        const list = document.getElementById(header.dataset.section);
        if (list) list.classList.toggle('open');
      });
    });
  }

  /** 渲染地图 */
  renderMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const s = this.game.state;
    const data = getData();

    if (!data.MAP_POS || Object.keys(data.MAP_POS).length === 0) {
      canvas.innerHTML = '<div style="text-align:center;padding:40px;color:#4a3040">舆图尚未绘制</div>';
      return;
    }

    // === 自动缩放：根据节点分布范围计算 scale 和偏移 ===
    const positions = Object.values(data.MAP_POS);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of positions) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const rangeX = Math.max(1, maxX - minX);
    const rangeY = Math.max(1, maxY - minY);
    // 目标画布尺寸：容器可见区域大小
    const container = document.getElementById('map-container');
    const contW = container ? container.clientWidth - 40 : 400;
    const contH = container ? container.clientHeight - 40 : 350;
    // 每个坐标单位对应的像素，保证节点间距至少 70px，且不超过 120px
    const scale = Math.min(120, Math.max(70, Math.min(contW / rangeX, contH / rangeY)));
    const offsetX = (contW - rangeX * scale) / 2 + 20;
    const offsetY = (contH - rangeY * scale) / 2 + 20;

    // 设置 canvas 尺寸为容器大小
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    // 坐标转换函数：将数据坐标转为画布像素坐标
    const toPx = (pos) => ({
      x: offsetX + (pos.x - minX) * scale,
      y: offsetY + (pos.y - minY) * scale
    });

    let html = '';
    // 画连线
    if (data.MAP_CONN) {
      for (const conn of data.MAP_CONN) {
        const [a, b] = conn;
        const posA = data.MAP_POS[a];
        const posB = data.MAP_POS[b];
        if (!posA || !posB) continue;
        const pa = toPx(posA);
        const pb = toPx(posB);
        const explored = s.explored.includes(a) && s.explored.includes(b);
        const dx = pb.x - pa.x;
        const dy = pb.y - pa.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        html += `<div class="map-line ${explored ? 'explored' : 'unexplored'}" style="left:${pa.x}px;top:${pa.y}px;width:${len}px;transform:rotate(${angle}deg)"></div>`;
      }
    }
    // 画节点
    for (const [name, pos] of Object.entries(data.MAP_POS)) {
      const px = toPx(pos);
      const isCurrent = name === s.location;
      const isExplored = s.explored.includes(name);
      const cls = isCurrent ? 'current' : isExplored ? 'explored' : 'unexplored';
      const label = isExplored || isCurrent ? name : '???';
      html += `<div class="map-node ${cls}" style="left:${px.x}px;top:${px.y}px" data-loc="${name}"><div class="dot"></div><div class="label">${label}</div></div>`;
    }
    canvas.innerHTML = html;

    // 点击节点移动
    canvas.querySelectorAll('.map-node').forEach(node => {
      node.addEventListener('click', () => {
        const loc = node.dataset.loc;
        if (loc && loc !== s.location) {
          this.game.quickTravel(loc);
        }
      });
    });

    // 自动居中到当前节点
    const curPos = data.MAP_POS[s.location];
    if (curPos) {
      const curPx = toPx(curPos);
      requestAnimationFrame(() => {
        container.scrollLeft = Math.max(0, curPx.x - container.clientWidth / 2);
        container.scrollTop = Math.max(0, curPx.y - container.clientHeight / 2);
      });
    }
  }

  /** 更新战斗 UI */
  updateCombatUI() {
    const facade = this.game.combat;
    const be = facade.battleEngine;
    if (!be || !be.battleState || !be.battleState.active) {
      // fallback 旧版
      const s = this.game.state;
      if (!s.combat) return;
      const c = s.combat;
      this._setText('combat-player-name', '你');
      this._setText('combat-player-hp-text', Math.max(0, s.hp) + '/' + s.maxHp);
      this._setStyle('combat-player-hp', 'width', Math.max(0, s.hp / s.maxHp * 100) + '%');
      this._setText('combat-enemy-name', c.enemyName || c.name || '?');
      this._setText('combat-enemy-hp-text', Math.max(0, c.enemyData?.hp || c.hp || 0) + '/' + (c.enemyData?.maxHp || c.enemyData?.hp || 100));
      this._setStyle('combat-enemy-hp', 'width', Math.max(0, ((c.enemyData?.hp || c.hp || 0) / (c.enemyData?.maxHp || c.enemyData?.hp || 100)) * 100) + '%');
      return;
    }

    const data = be.getBattleUIData();
    if (!data) return;

    // 玩家
    this._setText('combat-player-name', data.playerName || '你');
    this._setText('combat-mode', ({ spar: '切磋', encounter: '实战', tutorial: '入门试炼', showcase: '暂代其身' })[data.mode] || '实战');
    this._setText('combat-round', `第 ${data.round + 1} 周天`);
    this._setText('combat-time', `${data.battleTime.toFixed(1)}s`);
    const modal = document.getElementById('combat-modal');
    if (modal) modal.dataset.mode = data.mode || 'encounter';
    this._setText('combat-player-hp-text', Math.max(0, Math.floor(data.player.hp)) + '/' + data.player.maxHp);
    this._setStyle('combat-player-hp', 'width', Math.max(0, data.player.hp / data.player.maxHp * 100) + '%');
    this._setText('combat-player-mp-text', Math.max(0, Math.floor(data.player.mp)) + '/' + data.player.maxMp);
    this._setStyle('combat-player-mp', 'width', Math.max(0, data.player.mp / data.player.maxMp * 100) + '%');

    // 敌人
    this._setText('combat-enemy-name', data.enemy.name);
    this._setText('combat-enemy-hp-text', data.hideEnemyHp ? '？？？？' : Math.max(0, Math.floor(data.enemy.hp)) + '/' + data.enemy.maxHp);
    this._setStyle('combat-enemy-hp', 'width', data.hideEnemyHp ? '100%' : Math.max(0, data.enemy.hp / data.enemy.maxHp * 100) + '%');

    // 五槽
    const slotLabels = ['起', '承', '转', '合', '归'];
    const slotEls = document.querySelectorAll('#combat-slots .combat-slot');
    slotEls.forEach((el, idx) => {
      const slot = data.slots[idx];
      el.querySelector('.slot-name').textContent = slot.skill ? slot.skill.name : '—';
      el.querySelector('.slot-label').textContent = slotLabels[idx];
      const cdEl = el.querySelector('.slot-cd');
      const isCooling = Boolean(slot.skill && slot.cdMax > 0 && slot.cd > 0);
      const isPrepared = Boolean(slot.skill && slot.cdMax > 0 && slot.cd <= 0);
      const cdFill = Math.max(0, Math.min(100, Math.round((slot.cdPercent || 0) * 100)));
      el.className = 'combat-slot ' + slot.state + (isCooling ? ' is-cooling' : '') + (isPrepared ? ' is-prepared' : '');
      el.dataset.state = slot.state;
      el.style.setProperty('--cd-fill', `${cdFill}%`);
      el.disabled = !(data.manualControl && idx === data.currentSlot && ['current', 'ready'].includes(slot.state));
      if (slot.state === 'locked') {
        // Later formula slots remain unavailable, but their opening CD is still
        // visible so the player sees the whole chart preparing in parallel.
        cdEl.textContent = isCooling ? slot.cd.toFixed(1) + 's' : (isPrepared ? '待序' : '🔒');
      } else if (slot.state === 'cooldown' || slot.state === 'almost') {
        cdEl.textContent = slot.cd > 0 ? slot.cd.toFixed(1) + 's' : '';
      } else if (slot.state === 'mpwarn') {
        cdEl.textContent = '气不足';
      } else if (slot.state === 'mpgate') {
        cdEl.textContent = '门禁!';
      } else if (slot.state === 'current') {
        cdEl.textContent = data.manualControl ? '落式' : '▶';
      } else {
        cdEl.textContent = '✓';
      }
    });

    // 状态图标
    const pStatus = document.getElementById('combat-player-status');
    const eStatus = document.getElementById('combat-enemy-status');
    if (pStatus) pStatus.innerHTML = (data.player.statusIcons || []).map(s => `<span class="status-icon" title="${this._esc(s.name)}">${s.icon}<small>${s.stacks}</small></span>`).join('');
    if (eStatus) eStatus.innerHTML = (data.enemy.statusIcons || []).map(s => `<span class="status-icon" title="${this._esc(s.name)}">${s.icon}<small>${s.stacks}</small></span>`).join('');

    // 战斗日志
    const logEl = document.getElementById('combat-log');
    if (logEl) {
      logEl.innerHTML = (data.log || []).map(l => `<div class="combat-log-entry ${l.type || ''}">${l.text}</div>`).join('');
      logEl.scrollTop = logEl.scrollHeight;
    }

    // 真气门禁
    const gatePanel = document.getElementById('mpgate-panel');
    if (gatePanel) {
      if (data.mpGate) {
        gatePanel.style.display = 'block';
        this._setText('mpgate-title', `真气不足！${data.mpGate.skill.name}需${data.mpGate.need}气，当前${data.mpGate.have}`);
        this._setText('mpgate-timer', `${Math.max(0, data.mpGate.timer).toFixed(1)} 秒后自动调息`);
        const optsEl = document.getElementById('mpgate-options');
        if (optsEl) {
          optsEl.innerHTML = `
            <button class="mpgate-btn" data-action="mpGate" data-gate="rest">调息 +30气</button>
            <button class="mpgate-btn" data-action="mpGate" data-gate="potion" ${data.potionUsed ? 'disabled' : ''}>服药 +40气</button>
            <button class="mpgate-btn" data-action="mpGate" data-gate="basic">平斩 -10气</button>
            <button class="mpgate-btn" data-action="mpGate" data-gate="force">强行运功</button>
          `;
        }
      } else {
        gatePanel.style.display = 'none';
      }
    }

    const availability = facade.interveneEngine?.getAvailableInterventions?.() || [];
    const byType = Object.fromEntries(availability.map(item => [item.type, item]));
    document.querySelectorAll('#combat-modal [data-combat]').forEach(btn => {
      const type = btn.dataset.combat === 'flee' ? 'retreat' : btn.dataset.combat;
      const tutorialControl = type === 'guard' || type === 'dodge';
      btn.hidden = data.mode === 'showcase' || (data.mode === 'tutorial' ? !tutorialControl : tutorialControl);
      if (tutorialControl) {
        const charges = type === 'guard' ? data.tutorialDefense?.guardCharges : data.tutorialDefense?.dodgeCharges;
        btn.disabled = data.mode !== 'tutorial' || charges > 0;
        btn.textContent = type === 'guard' ? (charges ? '架势已成' : '架势') : (charges ? '待机闪身' : '闪身');
        return;
      }
      const item = byType[type];
      const blockedByMode = data.mode === 'showcase' || (data.mode === 'tutorial' && type === 'retreat');
      btn.disabled = blockedByMode || !item?.available;
      btn.title = type === 'retreat' && item?.successRateText ? `脱战成功率 ${item.successRateText}` : '';
    });
  }

  /** 更新位置图标 */
  updateLocationIcon() {
    const s = this.game.state;
    const data = getData();
    const loc = data.LOCATIONS[s.location];
    const ico = document.getElementById('location-icon');
    if (!ico || !loc) return;
    const name = s.location;
    if (name.includes('寺') || name.includes('庙') || name.includes('观') || name.includes('经')) ico.textContent = '🛕';
    else if (name.includes('市场') || name.includes('街') || name.includes('坊') || name.includes('市')) ico.textContent = '🏪';
    else if (name.includes('山谷') || name.includes('谷') || name.includes('山')) ico.textContent = '⛰';
    else if (name.includes('河') || name.includes('湖') || name.includes('池') || name.includes('渠')) ico.textContent = '🌊';
    else if (name.includes('门') || name.includes('城') || name.includes('关')) ico.textContent = '🏯';
    else if (name.includes('塔') || name.includes('钟') || name.includes('鼓')) ico.textContent = '🗼';
    else if (name.includes('宫') || name.includes('殿')) ico.textContent = '🏛';
    else if (name.includes('陵') || name.includes('墓')) ico.textContent = '⚰';
    else if (name.includes('药') || name.includes('医')) ico.textContent = '💊';
    else if (name.includes('铁') || name.includes('机')) ico.textContent = '⚙';
    else ico.textContent = '📍';
  }

  /** 更新时辰显示 */
  updateTimeDisplay() {
    setVistaTime(Number(this.game.state?.gameTime) || 0);
    const el = document.getElementById('time-display');
    if (!el) return;
    const timeName = this.game.getTimeName ? this.game.getTimeName() : '子时';
    el.textContent = timeName;
  }

  /** 添加日志 */
  addLog(text, type) {
    const area = document.getElementById('log-area');
    if (!area) return;
    const el = document.createElement('div');
    el.className = 'log-entry ' + (type || '');
    const source = String(text || '');
    const plain = source.replace(/<[^>]+>/g, '');
    const isAnnotation = type === 'quest'
      || /继续|下一站|前往|目标|沿.+(?:往|去)|引路|已记入舆图/.test(plain);
    if (isAnnotation) {
      el.classList.add('log-entry--annotation');
      const proof = document.createElement('span');
      proof.className = 'log-proof-mark';
      proof.textContent = '批';
      const body = document.createElement('span');
      body.className = 'log-entry-body';
      body.innerHTML = source;
      el.append(proof, body);
    } else {
      el.innerHTML = source;
    }
    area.appendChild(el);
    area.scrollTop = area.scrollHeight;
    while (area.children.length > 100) area.removeChild(area.firstChild);
  }

  /** Brief, borderless feedback for gains, discoveries and relationship changes. */
  showMomentFeedback(text, type = 'info') {
    const layer = document.getElementById('jianghu-moment-feedback');
    if (!layer || !text) return;
    const item = document.createElement('div');
    item.className = 'jianghu-moment-feedback__item is-' + type;
    item.textContent = String(text);
    layer.appendChild(item);
    while (layer.children.length > 3) layer.removeChild(layer.firstChild);
    window.setTimeout(() => item.remove(), 1900);
  }

  /**
   * 感知系统（T9.2）—— 渲染感知面板。
   * 面板是宣纸贴纸感的 in-page 展开区，叠在江湖页上方。
   * 数据来自 game.getRoomPerception()。
   * @param {object} data — { title, connections, npcs, searchPoints, props, extras }
   */
  renderPerception(data) {
    const panel = document.getElementById('perception-panel');
    if (!panel) return;
    let html = '';

    // Child-space entrances stay in 张望 instead of leaking into the parent map.
    if (data.connections && data.connections.length > 0) {
      html += '<div class="perc-section"><div class="perc-head">> 可入之处</div>';
      data.connections.forEach((c) => {
        const marker = c.explored ? '→' : '？';
        const url = c.explored ? '' : ' style="color:var(--ink-soft);opacity:0.6"';
        html += '<div class="perc-item perc-path" data-action="explore" data-dir="' + c.dir + '">'
          + '<span class="perc-dir">' + c.dirCn + ' ' + marker + '</span>'
          + '<span' + url + '>' + this._esc(c.label || c.name) + '</span></div>';
      });
      html += '</div>';
    }

    // 张望只承载空间线索与可观察物，不再复制人物互动或搜索入口。
    if (data.routeClues && data.routeClues.length > 0) {
      html += '<div class="perc-section"><div class="perc-head">> 隐处可探</div>';
      data.routeClues.forEach((clue) => {
        html += '<div class="perc-item perc-route-clue"><span>' + this._esc(clue.hint || '此处似有异样。') + '</span>'
          + '<button type="button" class="perc-subbtn" data-perc-action="reveal-route" data-route-id="' + this._esc(clue.id) + '">' + this._esc(clue.revealLabel || '循迹细察') + '</button></div>';
      });
      html += '</div>';
    }

    // 场景道具
    if (data.props && data.props.length > 0) {
      html += '<div class="perc-section"><div class="perc-head">> 所观之物</div>';
      data.props.forEach((p) => {
        html += '<div class="perc-item perc-prop"><span>' + p.name + '</span> '
          + '<span style="font-size:11px;color:var(--ink-soft)">— ' + p.desc + '</span></div>';
      });
      html += '</div>';
    }

    // 额外提示
    if (data.extras && data.extras.length > 0) {
      html += '<div class="perc-section" style="border-left:3px solid var(--mint);padding-left:8px">';
      data.extras.forEach((e) => {
        html += '<div class="perc-extra" style="font-size:12px;color:var(--ink-soft);padding:2px 0">' + e + '</div>';
      });
      html += '</div>';
    }

    if (!html) html = '<div class="perc-empty">张望之下，暂未见隐路或异物。</div>';
    panel.querySelector('.perception-inner').innerHTML = html;
    panel.classList.add('open');
    const trigger = document.querySelector('[data-action="perceive"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    // 滚动到顶
    panel.scrollTop = 0;
  }

  // === 内部工具 ===
  _esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  _npcCue(n) {
    if (!n) return '';
    const tier = n.dialogueTier || n.storyTier || n.tier || '';
    if (tier === 'epic' || tier === 'story') return '<span class="npc-cue story" aria-label="重要对话">卷</span>';
    if (tier === 'uncanny') return '<span class="npc-cue uncanny" aria-label="异样对话">墨</span>';
    return '';
  }

  _npcChipState(n, isSelected) {
    if (n?.locked || n?.interactionLocked || n?.canTalk === false) return 'locked';
    if (isSelected) return 'selected';
    if (n?.type === 'guide') return 'guide';
    const tier = n?.dialogueTier || n?.storyTier || n?.tier || '';
    if (tier === 'epic' || tier === 'story') return 'key';
    return 'default';
  }

  _npcChipBadge(state) {
    const badges = {
      guide: { text: '随', label: '引路人' },
      locked: { text: '?', label: '暂不可交谈' }
    };
    const badge = badges[state];
    return badge ? '<span class="npc-chip-badge" aria-label="' + badge.label + '">' + badge.text + '</span>' : '';
  }

  _npcDossierBadge(state) {
    const badges = {
      guide: { text: '随', label: '引路人' },
      key: { text: '卷', label: '关键人物' },
      locked: { text: '未明', label: '暂不可交谈' }
    };
    const badge = badges[state];
    return badge ? '<span class="npc-dossier-state-tag" aria-label="' + badge.label + '">' + badge.text + '</span>' : '';
  }
  _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  _setStyle(id, prop, value) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = value;
  }
}
