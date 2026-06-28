/**
 * renderer.js — UI 渲染器
 * 参考猫国建设器 game.js 的 render() 方法
 * 参考猫国建设器 core.js 的 effectsCachedExisting 模式实现脏标记缓存
 * 负责所有 DOM 更新，从 Game 类中分离
 */

import { getData } from '../data/data_loader.js';

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
    if (!data.REALMS || data.REALMS.length === 0) {
      console.error('[Renderer] REALMS data not loaded!');
      return;
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
    if (this._dirty.has(ZONE_CHAR)) this.updateCharPanel();
    if (this._dirty.has(ZONE_STATUS)) this.updateStatusPanel();
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

  /**
   * 更新人物面板（stat-* 元素）
   * 包含：境界、修为、道心、寿命、灵石、功法、任务数
   */
  updateCharPanel() {
    const s = this.game.state;
    const data = getData();
    const currentRealm = data.REALMS[s.realm] || data.REALMS[0];
    const next = s.realm < data.REALMS.length - 1 ? data.REALMS[s.realm + 1] : null;

    this._setText('stat-realm', currentRealm.name);
    this._setText('stat-cultivation', next ? Math.floor(s.cultivation) + ' / ' + next.cost : '已满');
    this._setText('stat-daoxin', s.daoxin + ' / ' + s.maxDaoXin);
    this._setText('stat-lifespan', s.lifespan + ' 年');
    this._setText('stat-mp', s.maxMp > 0 ? (s.mp + ' / ' + s.maxMp) : '-');
    // 更新 MP 标签
    const mpLabel = document.querySelector('#stat-mp');
    const mpLabelEl = mpLabel ? mpLabel.previousElementSibling : null;
    if (mpLabelEl) mpLabelEl.textContent = this.game.getMpName();
    this._setText('stat-stones', this.game.formatMoney());
    // 更新灵石/铜钱标签
    const stonesLabel = document.getElementById('stones-label');
    if (stonesLabel) stonesLabel.textContent = this.game.getMoneyName();
    this._setText('stat-techniques', s.techniques.length > 0 ? s.techniques.join('、') : '无');
    this._setText('stat-quests', s.activeQuests.length + ' / ' + (s.activeQuests.length + s.completedQuests.length));
  }

  /**
   * 更新境况面板（s-* 元素）
   * 包含：境界、修为、道心、寿命、HP、灵石、攻防、功法、位置、击杀、帮派信息
   */
  updateStatusPanel() {
    const s = this.game.state;
    const data = getData();
    const currentRealm = data.REALMS[s.realm] || data.REALMS[0];
    const next = s.realm < data.REALMS.length - 1 ? data.REALMS[s.realm + 1] : null;

    this._setText('s-realm', currentRealm.name);
    this._setText('s-cult', next ? Math.floor(s.cultivation) + ' / ' + next.cost : '已满');
    this._setText('s-daoxin', s.daoxin + ' / ' + s.maxDaoXin);
    this._setText('s-life', s.lifespan + ' 年');
    this._setText('s-hp', s.hp + ' / ' + s.maxHp);
    this._setText('s-mp', s.maxMp > 0 ? (s.mp + ' / ' + s.maxMp) : '-');
    // 更新 MP 标签
    const sMpEl = document.getElementById('s-mp');
    const sMpLabel = sMpEl ? sMpEl.previousElementSibling : null;
    if (sMpLabel) sMpLabel.textContent = this.game.getMpName();
    this._setText('s-stones', this.game.formatMoney());
    // 更新灵石/铜钱标签
    const sStonesLabel = document.getElementById('s-stones-label');
    if (sStonesLabel) sStonesLabel.textContent = this.game.getMoneyName();
    this._setText('s-atk', s.attack + (s.equipment.weapon ? s.equipment.weapon.atk : 0));
    this._setText('s-def', s.defense + (s.equipment.armor ? s.equipment.armor.def : 0));
    this._setText('s-tech', s.techniques.length > 0 ? s.techniques.join('、') : '无');
    this._setText('s-loc', this.displayName(s.location));
    this._setText('s-kill', s.killCount);

    // 帮派信息
    if (s.faction && s.faction !== '散修') {
      document.getElementById('s-faction-row').style.display = 'flex';
      this._setText('s-faction', s.faction);
      document.getElementById('s-skills-row').style.display = 'flex';
      const learnedCount = Object.keys(s.skills).length;
      this._setText('s-skills', learnedCount + '项');
      document.getElementById('s-rep-row').style.display = 'flex';
      this._setText('s-rep', s.factionRep);
    } else {
      document.getElementById('s-faction-row').style.display = 'none';
      document.getElementById('s-skills-row').style.display = 'none';
      document.getElementById('s-rep-row').style.display = 'none';
    }
  }

  /**
   * 更新进度条区域
   * 包含：修为进度条、道心进度条、HP进度条、道心颜色警告、挂机状态
   */
  updateProgress() {
    const s = this.game.state;
    const data = getData();
    const next = s.realm < data.REALMS.length - 1 ? data.REALMS[s.realm + 1] : null;

    // 修为进度条
    if (next) {
      const pct = Math.min(100, (s.cultivation / next.cost) * 100);
      this._setStyle('cultivation-bar', 'width', pct + '%');
      this._setText('cultivation-text', Math.floor(pct) + '%');
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
    dxEl.className = 'stat-value' + (s.daoxin < 20 ? ' danger' : s.daoxin < 50 ? ' highlight' : '');

    // 挂机状态
    const stEl = document.getElementById('idle-status');
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

    // 房间描述：优先使用game.getRoomDesc()（按时辰变体）
    const desc = this.game.getRoomDesc ? this.game.getRoomDesc(s.location) : (data.getDesc(data.LOCATIONS[s.location]) || '未知之地');
    this._setText('location-desc', desc);

    // 连接通路显示裸名
    const loc = data.LOCATIONS[s.location];
    document.getElementById('connections').innerHTML = loc && loc.connections
      ? Object.entries(loc.connections).map(([d, l]) => '<span class="conn-tag">' + this.game.dirName(d) + ' → ' + this.displayName(l) + '</span>').join('')
      : '';
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

    let html = '';
    for (const section of factionData.skills) {
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
        const pa = toPx(data.MAP_POS[a]);
        const pb = toPx(data.MAP_POS[b]);
        if (!pa || !pb) continue;
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
    const s = this.game.state;
    if (!s.combat) return;
    const c = s.combat;
    this._setText('combat-player-name', '你');
    this._setText('combat-player-hp-text', Math.max(0, s.hp) + '/' + s.maxHp);
    this._setStyle('combat-player-hp', 'width', Math.max(0, s.hp / s.maxHp * 100) + '%');
    this._setText('combat-enemy-name', c.name);
    this._setText('combat-enemy-type', c.type || '');
    this._setText('combat-enemy-hp-text', Math.max(0, c.hp) + '/' + c.maxHp);
    this._setStyle('combat-enemy-hp', 'width', Math.max(0, c.hp / c.maxHp * 100) + '%');
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
    const el = document.getElementById('time-display');
    if (!el) return;
    const timeName = this.game.getTimeName ? this.game.getTimeName() : '子时';
    el.textContent = timeName;
  }

  /** 添加日志 */
  addLog(text, type) {
    const area = document.getElementById('log-area');
    const el = document.createElement('div');
    el.className = 'log-entry ' + (type || '');
    el.innerHTML = text;
    area.appendChild(el);
    area.scrollTop = area.scrollHeight;
    while (area.children.length > 100) area.removeChild(area.firstChild);
  }

  // === 内部工具 ===
  _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  _setStyle(id, prop, value) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = value;
  }
}
