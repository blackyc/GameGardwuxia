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
import {
  BATTLE_MODES,
  BATTLE_OUTCOMES,
  BASIC_UNARMED_CHART,
  COMBAT_SLOTS,
  normalizeBattleOutcome,
  normalizeChart,
  getChartSlots,
} from './combat_contract.js';

/**
 * Resolve a combat chart without granting skills as a side effect.
 * Explicit tutorial/showcase charts are honored; ordinary fights only use
 * skills that the player has actually learned.
 */
export function resolvePlayerBattleChart(state, options = {}, combatSkills = []) {
  const explicitChart = getChartSlots(options.playerChart);
  if (explicitChart) return { ...explicitChart };

  const learnedIds = new Set(Object.keys(state?.skills || {}));
  const skillsById = new Map((combatSkills || []).map(skill => [String(skill.id), skill]));
  const isLearnedCombatSkill = skillId => {
    const skill = skillsById.get(String(skillId));
    return Boolean(skill && skill.slot && !skill.demoOnly && learnedIds.has(String(skillId)));
  };

  const configured = getChartSlots(state?.chart) || {};
  const configuredChart = {};
  for (const slot of COMBAT_SLOTS) {
    if (isLearnedCombatSkill(configured[slot])) configuredChart[slot] = configured[slot];
  }
  if (Object.keys(configuredChart).length > 0) return configuredChart;

  const learnedChart = {};
  for (const skill of combatSkills || []) {
    if (!skill?.slot || !COMBAT_SLOTS.includes(skill.slot)) continue;
    if (skill.demoOnly || !learnedIds.has(String(skill.id)) || learnedChart[skill.slot]) continue;
    learnedChart[skill.slot] = skill.id;
  }
  if (Object.keys(learnedChart).length > 0) return learnedChart;

  return { ...BASIC_UNARMED_CHART };
}

export class CombatFacade {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
    // 战斗引擎实例（战斗时创建，结束时置 null）
    this.battleEngine = null;
    this.hijackEngine = null;
    this.interveneEngine = null;
    this._battleCompletion = null;
    this._focusBeforeCombat = null;
    this._combatKeydownHandler = null;
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
    const options = arguments[2] || {};
    const g = this.game;
    const dl = g._data || (g._data = getData());
    const battleId = options.battleId || `battle-${Date.now()}-${data.id || name}`;
    const mode = Object.values(BATTLE_MODES).includes(options.mode)
      ? options.mode
      : BATTLE_MODES.ENCOUNTER;
    // 正式战斗不再从宗门技能库自动“授艺”。只有已习得战诀可入图；
    // 尚未习得战诀时，临时使用四个徒手动作。
    const normalizedChart = dl.COMBAT_SKILLS_V3
      ? resolvePlayerBattleChart(g.state, options, dl.COMBAT_SKILLS_V3)
      : getChartSlots(options.playerChart || g.state.chart);
    if (normalizedChart && dl.COMBAT_SKILLS_V3) {
      // 使用新战斗引擎
      this.battleEngine = new BattleEngine(g, {
        ...options,
        battleId,
        mode,
        seed: options.seed ?? battleId,
      });
      this.hijackEngine = new HijackEngine(this.battleEngine);
      this.interveneEngine = new InterveneEngine(this.battleEngine);
      this._battleCompletion = typeof options.onComplete === 'function' ? options.onComplete : null;

      // 设置回调
      this.battleEngine._onLog = (event) => g.addLog(event.text, event.type);
      this.battleEngine._onUpdate = () => g.renderer.updateCombatUI();
      this.battleEngine._onEnd = (result) => this.finishCombat(result);

      // 启动战斗
      g.state.combat = { battleId, mode, enemyName: name, enemyData: data };
      this._activateCombatModal();
      this.battleEngine.startCombat(data, normalizedChart, { ...options, battleId, mode });
      g.renderer?.updateCombatUI?.();
      this._focusCombatControl();
      return true;
    } else {
      // 仅在 V3 技能数据缺失时保留旧引擎兜底，避免缺战诀被静默伪装为可战斗。
      this._legacyStartCombat(name, data);
      return true;
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
      if (action?.startsWith('slot:')) {
        const result = be.castSlot(action.slice(5).toUpperCase());
        if (!result.ok) {
          const messages = {
            'wrong-order': `行功次序未到。当前应走${result.expected || '下一'}式。`,
            cooldown: '此式尚未回气。',
            'mp-gate': '真气不足，先处理行功门禁。',
          };
          g.addLog(messages[result.reason] || '此刻无法催动该式。', 'system');
        }
        return result;
      }
      switch (action) {
        case 'attack': {
          // 战诀自动运转，手动攻击仅作调试入口
          // autoCast 参数必须是 'A'~'E'，不是 0-4
          const SLOTS = ['A', 'B', 'C', 'D', 'E'];
          for (let i = 0; i < 5; i++) {
            if (be.battleState.slotUnlocked[i] && be.battleState.cooldowns[SLOTS[i]] <= 0) {
              be.autoCast(SLOTS[i]);
              return;
            }
          }
          g.addLog('⏳ 战诀运转中，所有招式都在冷却…', 'combat');
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
        case 'guard':
        case 'dodge': {
          be.useTutorialDefense(action);
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
            const intervention = this.interveneEngine.getAvailableInterventions()
              .find(item => item.type === 'variant');
            const chart = intervention?.charts?.find(item => item.available);
            if (chart) this.interveneEngine.doVariant(chart.id);
            else g.addLog('当前没有可用的备用战诀。', 'system');
          }
          break;
        }
        case 'potion': {
          if (this.interveneEngine) {
            const intervention = this.interveneEngine.getAvailableInterventions()
              .find(item => item.type === 'potion');
            const potion = intervention?.items?.find(item => item.available);
            if (potion) this.interveneEngine.doPotion(potion.id);
            else g.addLog('行囊中没有当前可用的战斗药物。', 'system');
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

  resolveMpGate(choice) {
    return this.battleEngine?.resolveMpGate(choice) ?? false;
  }

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
          this.finishCombat(BATTLE_OUTCOMES.RETREAT);
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
      this.finishCombat(BATTLE_OUTCOMES.VICTORY);
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
      this.finishCombat(BATTLE_OUTCOMES.VICTORY);
      return;
    }

    this._legacyEnemyTurn();
    this.hidePerforms();
    g.renderer.updateCombatUI();
  }

  // ============ 战斗结束 ============

  finishCombat(resultOrOutcome) {
    const g = this.game;
    const outcome = normalizeBattleOutcome(
      typeof resultOrOutcome === 'object' ? resultOrOutcome?.outcome : resultOrOutcome
    );

    // External callers ask the active engine to settle; its callback re-enters with a result object.
    if (this.battleEngine?.battleState?.active && typeof resultOrOutcome !== 'object') {
      return this.battleEngine.finishCombat(outcome);
    }

    let result = typeof resultOrOutcome === 'object' && resultOrOutcome
      ? resultOrOutcome
      : {
          battleId: g.state.combat?.battleId || `legacy-${Date.now()}`,
          mode: g.state.combat?.mode || BATTLE_MODES.ENCOUNTER,
          outcome,
          events: [],
        };
    const completion = this._battleCompletion;
    this._battleCompletion = null;

    // 清理新引擎实例（避免重入：BattleEngine.endCombat 会回调此方法）
    if (this.battleEngine) {
      this.battleEngine = null;
      this.hijackEngine = null;
      this.interveneEngine = null;
    }
    g.state.lastBattleResult = {
      battleId: result.battleId,
      encounterId: result.encounterId || null,
      mode: result.mode,
      outcome: result.outcome,
    };
    g.state.combat = null;
    this._deactivateCombatModal();
    // 战斗结束：多种状态可能变化，全量刷新
    g.renderer.updateUI();
    if (outcome === BATTLE_OUTCOMES.VICTORY && result.grantRewards) {
      g.checkQuestProgress?.('kill', result.enemyName);
    }
    if (completion) completion(result);

    if (outcome === BATTLE_OUTCOMES.DEFEAT && result.mode === BATTLE_MODES.ENCOUNTER) {
      g.gameOver('力战不敌，殒命于此');
    }
    return result;
  }

  endCombat(outcome) {
    return this.finishCombat(outcome);
  }

  _activateCombatModal() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('combat-modal');
    if (!modal) return;

    this._focusBeforeCombat = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    modal.classList.add('active');

    this._combatKeydownHandler = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = this._getCombatFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        document.getElementById('combat-title')?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    modal.addEventListener('keydown', this._combatKeydownHandler);
  }

  _getCombatFocusable() {
    if (typeof document === 'undefined') return [];
    const modal = document.getElementById('combat-modal');
    if (!modal) return [];
    return [...modal.querySelectorAll('button:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.closest('[hidden]') && element.getClientRects().length > 0);
  }

  _focusCombatControl() {
    if (typeof document === 'undefined') return;
    const currentSlot = document.querySelector('#combat-modal .combat-slot[data-state="current"]:not([disabled])');
    const firstControl = currentSlot || this._getCombatFocusable()[0];
    (firstControl || document.getElementById('combat-title'))?.focus();
  }

  _deactivateCombatModal() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('combat-modal');
    if (modal && this._combatKeydownHandler) {
      modal.removeEventListener('keydown', this._combatKeydownHandler);
    }
    modal?.classList.remove('active');
    this._combatKeydownHandler = null;

    const previous = this._focusBeforeCombat;
    this._focusBeforeCombat = null;
    if (previous?.isConnected && typeof previous.focus === 'function') previous.focus();
  }
}

export default CombatFacade;
