/**
 * combat_facade.js — 战斗门面层
 *
 * 从 game.js 抽出的战斗相关方法，包括：
 * - 武学查询/修炼/装配
 * - 战斗启动/行动代理（新引擎优先，旧引擎 fallback）
 * - 旧引擎完整实现（_legacy*）
 * - 绝招面板（showPerforms / hidePerforms / usePerform）
 * - 战斗结束清理
 *
 * 设计原则：
 * - CombatFacade 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - 不复制 state，直接读写 game.state 的战斗相关字段
 * - 外部调用方：game.triggerEncounter / game.startCombat / game.combatAction 等
 *   通过 CombatFacade 代理
 */

import { getData, pickEnemy } from './data/data_loader.js';
import { BattleEngine } from './battle_async.js';
import { HijackEngine } from './battle_hijack.js';
import { InterveneEngine } from './battle_intervene.js';

export class CombatFacade {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
    // 战斗引擎实例（战斗时创建，结束时置 null）
    this.battleEngine = null;
    this.hijackEngine = null;
    this.interveneEngine = null;
  }

  // ============ 武学查询 ============

  getSkillName(skillId) {
    const allFactions = { ...this.game.FACTIONS };
    if (this.game.ROGUE_SKILLS) allFactions['散修'] = this.game.ROGUE_SKILLS;
    for (const [fname, fdata] of Object.entries(allFactions)) {
      if (!fdata.skills) continue;
      const sk = fdata.skills.find(s => s.id === skillId);
      if (sk) return sk.name;
    }
    return skillId;
  }

  getSkillData(skillId) {
    const allFactions = { ...this.game.FACTIONS };
    if (this.game.ROGUE_SKILLS) allFactions['散修'] = this.game.ROGUE_SKILLS;
    for (const [fname, fdata] of Object.entries(allFactions)) {
      if (!fdata.skills) continue;
      const sk = fdata.skills.find(s => s.id === skillId);
      if (sk) return sk;
    }
    return null;
  }

  skillDetail(skillId) {
    const sk = this.getSkillData(skillId);
    const s = this.game.state;
    if (!sk) { this.game.addLog('武学典籍缺失。', 'system'); return; }
    const learned = s.skills[skillId];
    this.game.addLog('━━ 「' + sk.name + '」 ━━', 'special');
    this.game.addLog('类型：' + sk.type + ' | ' + (learned ? '已学 Lv.' + learned.level + ' EXP:' + Math.floor(learned.exp) : '未解锁'), 'info');
    if (sk.description) this.game.addLog(sk.description, 'event');
    if (sk.performs && sk.performs.length > 0) {
      this.game.addLog('绝招：', 'special');
      sk.performs.forEach(p => {
        this.game.addLog('  「' + p.name + '」—— ' + (p.description || ''), 'info');
      });
    }
    this.game.switchTab('wuxue');
  }

  // ============ 武学修炼/装配 ============

  practiceSkill(skillId) {
    const g = this.game;
    const s = g.state;
    const sk = this.getSkillData(skillId);
    if (!sk) return;
    if (!s.skills[skillId]) { g.addLog('你尚未习得此武学。', 'system'); return; }
    const cost = 10 + s.skills[skillId].level * 3;
    if (g.getMoney() < cost) { g.addLog(g.getMoneyName() + '不足！修炼需要 ' + cost + ' ' + g.getMoneyName() + '。', 'combat'); return; }
    if (s.daoxin < 5) { g.addLog('道心涣散，无法专注修炼。', 'combat'); return; }
    g.spendMoney(cost);
    s.daoxin = Math.max(0, s.daoxin - 5);
    const expGain = 10 + Math.floor(Math.random() * 20);
    s.skills[skillId].exp += expGain;
    const needExp = s.skills[skillId].level * 50;
    if (s.skills[skillId].exp >= needExp) {
      s.skills[skillId].exp -= needExp;
      s.skills[skillId].level++;
      g.addLog('🌟 「' + sk.name + '」突破至 Lv.' + s.skills[skillId].level + '！', 'breakthrough');
    } else {
      g.addLog('🧘 修炼「' + sk.name + '」EXP+' + expGain + '（' + Math.floor(s.skills[skillId].exp) + '/' + needExp + '）消耗 ' + cost + ' ' + g.getMoneyName(), 'info');
    }
    if (['sword','blade','cuff','strike','finger','staff','whip','claw','spear','hammer'].includes(sk.type)) {
      s.equippedSkill = skillId;
    }
    g.renderer.updateUI(['char', 'status', 'progress', 'wuxue']);
  }

  equipSkill(skillId) {
    const g = this.game;
    if (!g.state.skills[skillId]) { g.addLog('尚未习得此武学。', 'system'); return; }
    g.state.equippedSkill = skillId;
    g.addLog('⚔ 装配「' + this.getSkillName(skillId) + '」为战斗主修武学。', 'info');
    g.renderer.updateUI(['char', 'status']);
  }

  unequipSkill() {
    this.game.state.equippedSkill = null;
    this.game.addLog('卸下装配武学。', 'info');
    this.game.renderer.updateUI(['char', 'status']);
  }

  // ============ 遭遇触发 ============

  triggerEncounter(loc) {
    const g = this.game;
    const name = pickEnemy(loc.danger);
    const data = g.ENEMIES ? g.ENEMIES[name] : getData().ENEMIES[name];
    if (!data) return;
    const dl = data.desc.length > 80 ? data.desc.substring(0, 80) + '…' : data.desc;
    g.addLog('⚔ 遭遇 <b style="color:#c05555;">' + name + '</b> —— ' + dl, 'combat');
    this.startCombat(name, data);
  }

  // ============ 战斗启动 ============

  startCombat(name, data) {
    const g = this.game;
    const dl = g._data || (g._data = getData());
    const chart = g.state.chart || (dl.XINGGONG && dl.XINGGONG[g.state.faction]);
    if (chart && dl.COMBAT_SKILLS_V3) {
      // 使用新战斗引擎
      this.battleEngine = new BattleEngine(g);
      this.hijackEngine = new HijackEngine(this.battleEngine);
      this.interveneEngine = new InterveneEngine(this.battleEngine);

      // 设置回调
      this.battleEngine._onLog = (text, type) => g.addLog(text, type);
      this.battleEngine._onUpdate = () => g.renderer.updateCombatUI();
      this.battleEngine._onEnd = (victory) => this.endCombat(victory);

      // 启动战斗
      g.state.combat = { enemyName: name, enemyData: data };
      document.getElementById('combat-modal').classList.add('active');
      this.battleEngine.startCombat(data, chart);
    } else {
      // fallback 到旧引擎
      this._legacyStartCombat(name, data);
    }
  }

  // ============ 战斗行动代理 ============

  /**
   * action: 'attack'|'skill'|'defend'|'flee'|'variant'|'potion'|'retreat'
   */
  combatAction(action) {
    const g = this.game;
    if (this.battleEngine && this.battleEngine.battleState && this.battleEngine.battleState.active) {
      // 转发到新引擎
      const be = this.battleEngine;
      switch (action) {
        case 'attack': {
          for (let i = 0; i < 5; i++) {
            if (be.battleState.slotUnlocked[i] && be.battleState.cooldowns[i] <= 0) {
              be.autoCast(i);
              return;
            }
          }
          g.addLog('⏳ 所有招式都在冷却中…', 'combat');
          break;
        }
        case 'skill': {
          this.showPerforms();
          return;
        }
        case 'defend': {
          g.addLog('🧘 凝神调息，真气回复。', 'combat');
          break;
        }
        case 'flee': {
          if (this.interveneEngine) {
            this.interveneEngine.doRetreat();
          } else {
            g.addLog('🏃 无法撤退！', 'combat');
          }
          break;
        }
        case 'variant': {
          if (this.interveneEngine) {
            const presets = this.interveneEngine.getAvailableInterventions();
            if (presets && presets.variant) {
              this.interveneEngine.doVariant(presets.variant[0]?.id);
            }
          }
          break;
        }
        case 'potion': {
          if (this.interveneEngine) {
            this.interveneEngine.doPotion(null);
          }
          break;
        }
        case 'retreat': {
          if (this.interveneEngine) {
            this.interveneEngine.doRetreat();
          }
          break;
        }
        default:
          this._legacyCombatAction(action);
          break;
      }
    } else {
      // 旧引擎 fallback
      this._legacyCombatAction(action);
    }
  }

  // ============ 旧引擎 ============

  _legacyStartCombat(name, data) {
    const g = this.game;
    g.state.roundCount = 0;
    g.state.performCooldowns = {};
    g.state.combat = {
      enemyName: name, enemyHp: data.hp, enemyMaxHp: data.hp,
      enemyAtk: data.atk, enemyDef: data.def, enemyData: data
    };
    document.getElementById('combat-modal').classList.add('active');
    g.renderer.updateCombatUI();
  }

  _legacyCombatAction(action) {
    const g = this.game;
    if (!g.state.combat) return;
    const c = g.state.combat, s = g.state;
    switch (action) {
      case 'attack': {
        let skillBonus = 0;
        if (s.equippedSkill && s.skills[s.equippedSkill]) {
          skillBonus = s.skills[s.equippedSkill].level * 2;
        }
        const dmg = Math.max(1, s.attack + (s.equipment.weapon ? s.equipment.weapon.atk : 0) + skillBonus + Math.floor(Math.random() * 10) + s.realm * 2 - c.enemyDef);
        c.enemyHp -= dmg;
        g.addLog('⚔ 你挥出一击，造成 ' + dmg + ' 点伤害！' + (skillBonus > 0 ? '（武学加成+' + skillBonus + '）' : ''), 'combat');
        break;
      }
      case 'skill': {
        this.showPerforms();
        return;
      }
      case 'defend': {
        let defBonus = 0;
        if (s.equippedSkill && s.skills[s.equippedSkill]) {
          const skData = this.getSkillData(s.equippedSkill);
          if (skData && skData.defenseBonus) defBonus = Math.floor(skData.defenseBonus * s.skills[s.equippedSkill].level / 100);
        }
        s.hp = Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * 0.1) + defBonus);
        g.addLog('🛡 凝神守势，稳固体魄，恢复少量生命。' + (defBonus > 0 ? '（武学防御+' + defBonus + '）' : ''), 'combat');
        break;
      }
      case 'flee': {
        let dodgeBonus = 0;
        for (const [skId, skState] of Object.entries(s.skills)) {
          const skData = this.getSkillData(skId);
          if (skData && skData.type === 'dodge') {
            dodgeBonus = Math.max(dodgeBonus, skState.level * 0.03);
          }
        }
        if (Math.random() < 0.4 + s.realm * 0.05 + dodgeBonus) {
          g.addLog('🏃 抓住间隙，成功脱身！' + (dodgeBonus > 0 ? '（轻功+成）' : ''), 'info');
          this.endCombat(false);
          return;
        } else {
          g.addLog('🏃 遁走失败！', 'combat');
        }
        break;
      }
    }
    if (c.enemyHp <= 0) {
      s.roundCount++;
      const exp = c.enemyData.exp + (c.enemyData.boss ? 50 : 0);
      const gold = c.enemyData.gold;
      s.cultivation += exp;
      if (c.enemyData.dropsSpirit) { g.addSpiritStones(gold); }
      else { g.addMoney(gold); }
      g.addLog('💀 <b>' + c.enemyName + '</b> 毙于你手！', 'breakthrough');
      if (!c.enemyData.dropsSpirit) g.addLog('   得 ' + exp + ' 修为，' + gold + ' ' + g.getMoneyName(), 'item');
      else g.addLog('   得 ' + exp + ' 修为，' + gold + ' 灵石', 'item');
      if (c.enemyData.boss && c.enemyData.special) {
        g.addLog('?? ' + c.enemyData.special, 'special');
      }
      g.checkQuestProgress('kill', c.enemyName);
      this.endCombat(true);
      return;
    }
    s.roundCount++;
    const eDmg = Math.max(1, c.enemyAtk + Math.floor(Math.random() * 8) - s.defense - (s.equipment.armor ? s.equipment.armor.def : 0));
    s.hp -= eDmg;
    g.addLog('👊 ' + c.enemyName + ' 反击，造成 ' + eDmg + ' 点伤害！', 'combat');
    if (s.hp <= 0) { s.hp = 0; g.gameOver('力战不敌，殒命于此'); return; }
    g.renderer.updateCombatUI();
  }

  _legacyEnemyTurn() {
    const g = this.game;
    const s = g.state, c = g.state.combat;
    if (!c) return;
    const eDmg = Math.max(1, c.enemyAtk + Math.floor(Math.random() * 8) - s.defense - (s.equipment.armor ? s.equipment.armor.def : 0));
    s.hp -= eDmg;
    s.roundCount++;
    g.addLog('👊 ' + c.enemyName + ' 反击，造成 ' + eDmg + ' 点伤害！', 'combat');
    if (s.hp <= 0) { s.hp = 0; g.gameOver('力战不敌，殒命于此'); return; }
  }

  // ============ 绝招面板 ============

  showPerforms() {
    const g = this.game;
    const s = g.state;
    const c = s.combat;
    if (!c) return;
    const list = document.getElementById('perform-list');
    if (!list) return;

    const available = [];
    const allFactions = { ...g.FACTIONS };
    if (g.ROGUE_SKILLS) allFactions['散修'] = g.ROGUE_SKILLS;

    for (const [skillId, skillState] of Object.entries(s.skills)) {
      const sk = this.getSkillData(skillId);
      if (!sk || !sk.performs) continue;
      sk.performs.forEach(p => {
        const minLvl = p.requirements ? parseInt((String(p.requirements).match(/(\d+)/) || ['0'])[0]) || 0 : 0;
        if (skillState.level >= minLvl) {
          available.push({ perform: p, skillName: sk.name, skillId, level: skillState.level });
        }
      });
    }

    if (available.length === 0) {
      list.innerHTML = '<div style="color:#6e5c50;text-align:center;padding:8px">尚无可用绝招。修炼武学以解锁绝招。</div>';
    } else {
      const morale = Math.floor(s.daoxin / 2);
      let html = '<div style="font-size:10px;color:#6e5c50;margin-bottom:4px">气势：' + morale + '（道心）| 回合：' + (s.roundCount || 1) + '</div>';
      available.forEach(({perform, skillName, skillId, level}) => {
        const cd = s.performCooldowns[perform.id];
        const cdLeft = cd ? Math.max(0, perform.cooldown - (s.roundCount - cd)) : 0;
        const onCd = cdLeft > 0;
        const moraleCost = perform.moraleCost || perform.qiCost || 25;
        html += '<div class="perform-item' + (onCd ? ' on-cd' : '') + '" data-perform="' + perform.id + '"><div class="pname">' + perform.name + ' <span style="font-size:10px;color:#5a4a68">(' + skillName + ' Lv.' + level + ')</span></div><div class="pdesc">' + (perform.description || '').substring(0, 60) + '</div><div class="pcost">气势 ' + moraleCost + ' | CD ' + perform.cooldown + '回合' + (onCd ? ' | ⏳冷却中(' + cdLeft + '回合)' : '') + '</div></div>';
      });
      list.innerHTML = html;

      // 绑定点击
      list.querySelectorAll('[data-perform]').forEach(el => {
        if (!el.classList.contains('on-cd')) {
          el.addEventListener('click', () => this.usePerform(el.dataset.perform));
        }
      });
    }

    document.getElementById('perform-area').style.display = 'block';
    document.querySelector('#combat-modal .combat-actions').style.display = 'none';
  }

  hidePerforms() {
    document.getElementById('perform-area').style.display = 'none';
    document.querySelector('#combat-modal .combat-actions').style.display = 'grid';
  }

  usePerform(performId) {
    const g = this.game;
    if (!g.state.combat) return;
    const s = g.state, c = g.state.combat;

    const allFactions = { ...g.FACTIONS };
    if (g.ROGUE_SKILLS) allFactions['散修'] = g.ROGUE_SKILLS;
    let performData = null, skillData = null;
    for (const [fname, fdata] of Object.entries(allFactions)) {
      if (!fdata.skills) continue;
      for (const sk of fdata.skills) {
        if (!sk.performs) continue;
        const p = sk.performs.find(p => p.id === performId);
        if (p) { performData = p; skillData = sk; break; }
      }
      if (performData) break;
    }
    if (!performData) return;

    const moraleCost = performData.moraleCost || performData.qiCost || 25;
    const morale = Math.floor(s.daoxin / 2);
    if (morale < moraleCost) {
      g.addLog('气势不足！（需要 ' + moraleCost + '，当前 ' + morale + '）', 'combat');
      return;
    }

    const lastUsed = s.performCooldowns[performId];
    if (lastUsed && s.roundCount - lastUsed < (performData.cooldown || 4)) {
      g.addLog('绝招冷却中…', 'combat');
      return;
    }

    s.performCooldowns[performId] = s.roundCount;
    s.daoxin = Math.max(0, s.daoxin - Math.floor(moraleCost / 2));

    const skillLvl = s.skills[skillData.id] ? s.skills[skillData.id].level : 1;
    const baseDmg = s.attack + (s.equipment.weapon ? s.equipment.weapon.atk : 0) + skillLvl * 2;
    const dmgMultiplier = 1.2 + skillLvl * 0.02;
    const dmg = Math.max(1, Math.floor(baseDmg * dmgMultiplier) + Math.floor(Math.random() * 20) + s.realm * 3 - c.enemyDef);
    c.enemyHp -= dmg;

    g.addLog('🔥 施展「' + performData.name + '」！造成 ' + dmg + ' 点伤害！', 'combat');
    if (performData.effects) g.addLog('   ' + performData.effects, 'event');

    if (c.enemyHp <= 0) {
      s.roundCount++;
      const exp = c.enemyData.exp + (c.enemyData.boss ? 50 : 0);
      const gold = c.enemyData.gold;
      s.cultivation += exp;
      if (c.enemyData.dropsSpirit) { g.addSpiritStones(gold); }
      else { g.addMoney(gold); }
      g.addLog('💀 <b>' + c.enemyName + '</b> 毙于你手！', 'breakthrough');
      if (!c.enemyData.dropsSpirit) g.addLog('   得 ' + exp + ' 修为，' + gold + ' ' + g.getMoneyName(), 'item');
      else g.addLog('   得 ' + exp + ' 修为，' + gold + ' 灵石', 'item');
      this.endCombat(true);
      return;
    }

    this._legacyEnemyTurn();
    this.hidePerforms();
    g.renderer.updateCombatUI();
  }

  // ============ 战斗结束 ============

  endCombat(victory) {
    const g = this.game;
    // 清理新引擎实例（避免重入：BattleEngine.endCombat 会回调此方法）
    if (this.battleEngine) {
      const be = this.battleEngine;
      this.battleEngine = null;
      this.hijackEngine = null;
      this.interveneEngine = null;
      // 如果 BattleEngine 尚未停止，停止它
      if (be.battleState && be.battleState.active) {
        be.endCombat(victory);
      }
    }
    g.state.combat = null;
    document.getElementById('combat-modal').classList.remove('active');
    // 战斗结束：多种状态可能变化，全量刷新
    g.renderer.updateUI();
    if (victory) g.checkBreakthrough();
  }
}

export default CombatFacade;
