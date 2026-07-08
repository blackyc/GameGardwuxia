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
    if (!data.REALMS || data.REALMS.length === 0) return;
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
    if (!data.REALMS || data.REALMS.length === 0) return;
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

    // 房间描述：优先使用game.getRoomDesc()（按时辰变体）
    const desc = this.game.getRoomDesc ? this.game.getRoomDesc(s.location) : (data.getDesc(data.LOCATIONS[s.location]) || '未知之地');
    this._setText('location-desc', desc);

    // 在场 NPC 以人物卡呈现，交互入口收在感知全景内。
    const npcsEl = document.getElementById('room-npcs');
    if (npcsEl) {
      const perc = this.game.getRoomPerception ? this.game.getRoomPerception() : null;
      const list = perc && perc.npcs ? perc.npcs : [];
      if (list.length > 0) {
        const focusedIndex = Number.isInteger(this.game.focusedNpcIndex) ? this.game.focusedNpcIndex : null;
        const focusedType = this.game.focusedNpcType || null;
        const focused = focusedIndex === null ? null : list.find(n => {
          const sameIndex = Number(n.index) === focusedIndex;
          return sameIndex && (!focusedType || !n.type || n.type === focusedType);
        });
        if (focusedIndex !== null && !focused) {
          this.game.focusedNpcIndex = null;
          this.game.focusedNpcType = null;
        }
        const buttons = list.map(n => {
          const idx = Number(n.index);
          const type = n.type || 'encounter';
          const selected = focused && Number(focused.index) === idx && (focused.type || 'encounter') === type ? ' active' : '';
          return '<button type="button" class="room-npc-card' + selected + '" data-action="focusNpc" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">'
            + '<span class="npc-name">' + this._esc(n.name) + '</span>'
            + this._npcCue(n)
            + '</button>';
        }).join('');
        let dossier = '';
        if (focused) {
          const idx = Number(focused.index);
          const type = focused.type || 'encounter';
          const relationLine = focused.relationLabel ? '<div class="npc-dossier-memory">印象：' + this._esc(focused.relationLabel) + '</div>' : '';
          dossier = '<section class="npc-dossier" id="npc-dossier">'
            + '<div class="npc-dossier-head"><span class="npc-dossier-title">' + this._esc(focused.name) + '</span>'
            + '<button type="button" class="npc-dossier-close" data-action="closeNpcFocus">收起</button></div>'
            + relationLine
            + '<p class="npc-dossier-desc">' + this._esc(focused.desc || '此人正留意着周遭。') + '</p>'
            + '<div class="npc-dossier-actions">'
            + '<button type="button" data-action="talkNpc" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">交谈</button>'
            + '<button type="button" data-action="npcObserve" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">观察</button>'
            + '<button type="button" class="muted" data-action="npcDisabled" data-label="送礼">送礼</button>'
            + '<button type="button" class="muted" data-action="npcDisabled" data-label="切磋">切磋</button>'
            + '</div></section>';
        }
        npcsEl.innerHTML = '<div class="room-npc-list" aria-label="在场人物">' + buttons + '</div>' + dossier;
      } else {
        this.game.focusedNpcIndex = null;
        this.game.focusedNpcType = null;
        npcsEl.innerHTML = '';
      }
    }
    // 方位通路：渲染到方向栏
    this.renderExitBar();
  }

  /**
   * 渲染方位通路方向栏（区域2常驻）
   * 显示东南西北等方位连接，与感知面板的探索入口分层。
   */
  renderExitBar() {
    const bar = document.getElementById('exit-bar');
    if (!bar) return;
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
    this._setText('combat-player-name', '你');
    this._setText('combat-player-hp-text', Math.max(0, Math.floor(data.player.hp)) + '/' + data.player.maxHp);
    this._setStyle('combat-player-hp', 'width', Math.max(0, data.player.hp / data.player.maxHp * 100) + '%');
    this._setText('combat-player-mp-text', Math.max(0, Math.floor(data.player.mp)) + '/' + data.player.maxMp);
    this._setStyle('combat-player-mp', 'width', Math.max(0, data.player.mp / data.player.maxMp * 100) + '%');

    // 敌人
    this._setText('combat-enemy-name', data.enemy.name);
    this._setText('combat-enemy-hp-text', Math.max(0, Math.floor(data.enemy.hp)) + '/' + data.enemy.maxHp);
    this._setStyle('combat-enemy-hp', 'width', Math.max(0, data.enemy.hp / data.enemy.maxHp * 100) + '%');

    // 五槽
    const slotLabels = ['起', '承', '转', '合', '归'];
    const slotEls = document.querySelectorAll('.combat-slot');
    slotEls.forEach((el, idx) => {
      const slot = data.slots[idx];
      el.querySelector('.slot-name').textContent = slot.skill ? slot.skill.name : '—';
      el.querySelector('.slot-label').textContent = slotLabels[idx];
      const cdEl = el.querySelector('.slot-cd');
      if (slot.state === 'locked') {
        el.className = 'combat-slot locked';
        cdEl.textContent = '🔒';
      } else if (slot.state === 'cooldown' || slot.state === 'almost') {
        el.className = 'combat-slot ' + slot.state;
        cdEl.textContent = slot.cd > 0 ? slot.cd.toFixed(1) + 's' : '';
      } else if (slot.state === 'mpwarn') {
        el.className = 'combat-slot mpwarn';
        cdEl.textContent = '气不足';
      } else if (slot.state === 'mpgate') {
        el.className = 'combat-slot mpgate';
        cdEl.textContent = '门禁!';
      } else if (slot.state === 'current') {
        el.className = 'combat-slot current';
        cdEl.textContent = '▶';
      } else {
        el.className = 'combat-slot ready';
        cdEl.textContent = '✓';
      }
    });

    // 状态图标
    const pStatus = document.getElementById('combat-player-status');
    const eStatus = document.getElementById('combat-enemy-status');
    if (pStatus) pStatus.innerHTML = (data.player.statusIcons || []).map(s => `<span class="status-icon">${s.icon}</span>`).join('');
    if (eStatus) eStatus.innerHTML = (data.enemy.statusIcons || []).map(s => `<span class="status-icon">${s.icon}</span>`).join('');

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
        const optsEl = document.getElementById('mpgate-options');
        if (optsEl && !optsEl.dataset.bound) {
          optsEl.dataset.bound = '1';
          optsEl.innerHTML = `
            <button class="mpgate-btn" data-gate="rest">调息 +30气</button>
            <button class="mpgate-btn" data-gate="potion">服药 +40气</button>
            <button class="mpgate-btn" data-gate="basic">平斩 -10气</button>
            <button class="mpgate-btn" data-gate="force">强行运功</button>
          `;
          optsEl.querySelectorAll('.mpgate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              be.resolveMpGate(btn.dataset.gate);
              gatePanel.style.display = 'none';
            });
          });
        }
      } else {
        gatePanel.style.display = 'none';
        const optsEl = document.getElementById('mpgate-options');
        if (optsEl) delete optsEl.dataset.bound;
      }
    }
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
    if (type === 'scene' || type === 'dialogue') {
      const feed = document.getElementById('scene-feed');
      if (!feed) return;
      const sceneEntry = document.createElement('div');
      sceneEntry.className = 'scene-entry ' + type;
      sceneEntry.innerHTML = text;
      feed.appendChild(sceneEntry);
      while (feed.children.length > 8) feed.removeChild(feed.firstChild);
      feed.scrollTop = feed.scrollHeight;
      return;
    }
    const area = document.getElementById('log-area');
    const el = document.createElement('div');
    el.className = 'log-entry ' + (type || '');
    el.innerHTML = text;
    area.appendChild(el);
    area.scrollTop = area.scrollHeight;
    while (area.children.length > 100) area.removeChild(area.firstChild);
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

    // 探索入口（非方位通路）
    if (data.connections && data.connections.length > 0) {
      html += '<div class="perc-section"><div class="perc-head">> 隐处可探</div>';
      data.connections.forEach((c) => {
        const marker = c.explored ? '→' : '？';
        const url = c.explored ? '' : ' style="color:var(--ink-soft);opacity:0.6"';
        html += '<div class="perc-item perc-path" data-action="explore" data-dir="' + c.dir + '">'
          + '<span class="perc-dir">' + c.dirCn + ' ' + marker + '</span>'
          + '<span' + url + '>' + c.name + '</span></div>';
      });
      html += '</div>';
    }

    // 在场人物（交谈/交易/拜师 针对各 NPC，打听 独立为搜索项）
    if (data.npcs && data.npcs.length > 0) {
      html += '<div class="perc-section"><div class="perc-head">> 在场人物</div>';
      data.npcs.forEach((n, i) => {
        const idx = Number.isInteger(n.index) ? n.index : i;
        const type = n.type || 'encounter';
        let subBtns = '<button class="perc-subbtn" data-npc-action="talk" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">交谈</button>'
          + '<button class="perc-subbtn" data-npc-action="trade" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">交易</button>';
        if (n.canSpar) {
          subBtns += '<button class="perc-subbtn" data-npc-action="spar" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">切磋</button>';
        }
        // 拜师按钮仅在宗门HQ且已有帮派时显示
        if (data.canAskTeacher) {
          subBtns += '<button class="perc-subbtn" data-npc-action="askTeacher" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">拜师</button>';
        }
        html += '<div class="perc-item perc-npc" data-npc-idx="' + idx + '" data-npc-type="' + this._esc(type) + '">'
          + '<span class="perc-npc-name">' + this._esc(n.name) + '</span>'
          + this._npcCue(n)
          + '<span class="perc-npc-actions">' + subBtns + '</span></div>';
      });
      html += '</div>';
    }

    // 可打听（房间级流言，不针对单个NPC）
    html += '<div class="perc-section"><div class="perc-head">> 可打听</div>';
    html += '<div class="perc-item perc-rumor" data-perc-action="rumor">'
      + '<span>向周围路人打听消息……</span></div>';
    html += '</div>';

    // 可搜索
    if (data.searchPoints && data.searchPoints.length > 0) {
      html += '<div class="perc-section"><div class="perc-head">> 可探索</div>';
      data.searchPoints.forEach((sp) => {
        html += '<div class="perc-item perc-search" data-action="searchArea">'
          + '<span>' + sp.name + '</span> '
          + '<span style="font-size:11px;color:var(--ink-soft)">（' + sp.desc + '）</span></div>';
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

    html += '<div class="perc-close-wrap"><button class="perc-close" id="perc-close-btn">收起 ▲</button></div>';
    panel.querySelector('.perception-inner').innerHTML = html;
    panel.classList.add('open');
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
  _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  _setStyle(id, prop, value) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = value;
  }
}
