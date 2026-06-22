/**
 * renderer.js — UI 渲染器
 * 参考猫国建设器 game.js 的 render() 方法
 * 负责所有 DOM 更新，从 Game 类中分离
 */

import { getData } from '../data/data_loader.js';


export class Renderer {
  constructor(game) {
    this.game = game;
  }

  /** 主 UI 更新 */
  updateUI() {
    const s = this.game.state;
    const data = getData();
    if (!data.REALMS || data.REALMS.length === 0) {
      console.error('[Renderer] REALMS data not loaded!');
      return;
    }
    const currentRealm = data.REALMS[s.realm] || data.REALMS[0];
    const next = s.realm < data.REALMS.length - 1 ? data.REALMS[s.realm + 1] : null;

    // 人物面板
    this._setText('stat-realm', currentRealm.name);
    this._setText('stat-cultivation', next ? Math.floor(s.cultivation) + ' / ' + next.cost : '已满');
    this._setText('stat-daoxin', s.daoxin + ' / ' + s.maxDaoXin);
    this._setText('stat-lifespan', s.lifespan + ' 年');
    this._setText('stat-stones', s.spiritStones);
    this._setText('stat-techniques', s.techniques.length > 0 ? s.techniques.join('、') : '无');
    this._setText('stat-quests', s.activeQuests.length + ' / ' + (s.activeQuests.length + s.completedQuests.length));

    // 境况面板
    this._setText('s-realm', currentRealm.name);
    this._setText('s-cult', next ? Math.floor(s.cultivation) + ' / ' + next.cost : '已满');
    this._setText('s-daoxin', s.daoxin + ' / ' + s.maxDaoXin);
    this._setText('s-life', s.lifespan + ' 年');
    this._setText('s-hp', s.hp + ' / ' + s.maxHp);
    this._setText('s-stones', s.spiritStones);
    this._setText('s-atk', s.attack + (s.equipment.weapon ? s.equipment.weapon.atk : 0));
    this._setText('s-def', s.defense + (s.equipment.armor ? s.equipment.armor.def : 0));
    this._setText('s-tech', s.techniques.length > 0 ? s.techniques.join('、') : '无');
    this._setText('s-loc', s.location);
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

    // 进度条
    if (next) {
      const pct = Math.min(100, (s.cultivation / next.cost) * 100);
      this._setStyle('cultivation-bar', 'width', pct + '%');
      this._setText('cultivation-text', Math.floor(pct) + '%');
    } else {
      this._setStyle('cultivation-bar', 'width', '100%');
      this._setText('cultivation-text', '圆满');
    }

    this._setStyle('daoxin-bar', 'width', (s.daoxin / s.maxDaoXin * 100) + '%');
    this._setText('daoxin-text', Math.floor(s.daoxin / s.maxDaoXin * 100) + '%');
    this._setStyle('hp-bar', 'width', (s.hp / s.maxHp * 100) + '%');
    this._setText('hp-text', Math.floor(s.hp / s.maxHp * 100) + '%');

    // 道心颜色警告
    const dxEl = document.getElementById('stat-daoxin');
    dxEl.className = 'stat-value' + (s.daoxin < 20 ? ' danger' : s.daoxin < 50 ? ' highlight' : '');

    // 位置信息
    this._setText('location-name', s.location);
    const loc = data.LOCATIONS[s.location];
    this._setText('location-desc', loc ? data.getDesc(loc) : '未知之地');
    document.getElementById('connections').innerHTML = loc && loc.connections
      ? Object.entries(loc.connections).map(([d, l]) => '<span class="conn-tag">' + this.game.dirName(d) + ' → ' + l + '</span>').join('')
      : '';

    // 挂机状态
    const stEl = document.getElementById('idle-status');
    if (s.isResting) {
      stEl.className = 'resting';
      stEl.innerHTML = '<span class="pulse"></span>休憩中 · 气血/道心恢复';
    } else {
      stEl.className = '';
      stEl.innerHTML = '<span class="pulse"></span>挂机修炼中 · 每 3 秒获取修为';
    }

    // Tab 面板条件渲染
    if (this.game.currentTab === 'bag') this.renderInventory();
    if (this.game.currentTab === 'quest') this.renderQuests();
    if (this.game.currentTab === 'wuxue') this.renderWuxue();
    if (this.game.mapOpen) this.renderMap();
    if (s.combat) this.updateCombatUI();
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
        html += '<div class="quest-reward">奖励：' + Object.entries(q.rewards).filter(([k]) => k !== 'faction' && k !== 'access').map(([k, v]) => (k === 'spiritStones' ? v + '灵石' : k === 'cultivation' ? v + '修为' : '获得' + v)).join('、') + '</div></div>';
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
      content.innerHTML = '<div class="inv-empty">该帮派武学数据缺失</div>';
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

    let html = '';
    // 画连线
    if (data.MAP_CONN) {
      for (const conn of data.MAP_CONN) {
        const [a, b] = conn;
        const pa = data.MAP_POS[a];
        const pb = data.MAP_POS[b];
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
      const isCurrent = name === s.location;
      const isExplored = s.explored.includes(name);
      const cls = isCurrent ? 'current' : isExplored ? 'explored' : 'unexplored';
      const label = isExplored || isCurrent ? name : '???';
      html += `<div class="map-node ${cls}" style="left:${pos.x}px;top:${pos.y}px" data-loc="${name}"><div class="dot"></div><div class="label">${label}</div></div>`;
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
