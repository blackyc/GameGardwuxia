/**
 * search_service.js — 搜索系统服务层
 *
 * 从 game.js 拆出的搜索相关方法：
 * - searchArea：在当前房间搜索（随机奖励/物品）
 * - pickItemByType：按类型随机选取物品（searchArea 内部调用）
 *
 * 设计原则：
 * - SearchService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - Game 保留一行代理方法
 */

import { isEligibleForContext } from './world_context.js';

export class SearchService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  /**
   * 在当前房间搜索
   */
  searchArea() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) {
      g.addLog('当前无法搜寻！', 'system');
      return;
    }

    const roomId = g.state.location;
    const context = g.world?.get(roomId);
    const policy = context?.policy || g.world?.getZonePolicy(roomId);
    if (policy && !policy.allowSearch) {
      this._presentNoResult();
      return;
    }

    const special = g.world?.resolveSpecialSearch(roomId);
    if (special) {
      g.world.applySearchEvent(special);
      const itemName = special.item?.name || '';
      const text = special.foundText || special.desc || ('你在此处发现了' + itemName + '。');
      g.addLog(text, 'item');
      g.showMomentFeedback?.(itemName ? '发现 · ' + itemName : '发现异物', 'discovery');
      g.checkQuestProgress('find', special.id || null);
      g.renderer.updateUI(['location', 'bag', 'quest']);
      g.markDirty();
      this._presentFind({
        ...special,
        title: special.title || itemName || '探索所得',
        text
      });
      return;
    }

    const data = g.ROOM_SEARCH[roomId];
    if (!data || Math.random() > data.searchChance) {
      this._presentNoResult();
      return;
    }

    const pool = data.results.filter(result => {
      if (!(result.chance < 1.0 || result.type === 'nothing')) return false;
      if (context && !isEligibleForContext(result, context)) return false;
      // 门派驻地只允许策划显式配置的发现；不从全局随机表偷渡掉落。
      return !policy?.authoredNpcOnly || result.authored === true || result.type === 'nothing';
    });
    if (pool.length === 0) {
      this._presentNoResult();
      return;
    }

    const totalWeight = pool.reduce((sum, result) => sum + (result.chance || 1), 0);
    let randomWeight = Math.random() * totalWeight;
    let picked = pool[pool.length - 1];
    for (const result of pool) {
      randomWeight -= (result.chance || 1);
      if (randomWeight <= 0) {
        picked = result;
        break;
      }
    }

    if (picked.type === 'nothing') {
      this._presentNoResult();
      return;
    }

    const state = g.state;
    if (picked.type === 'money') {
      const [min, max] = picked.amount.split('-').map(Number);
      const amount = min + Math.floor(Math.random() * (max - min + 1));
      g.addMoney(amount);
      g.addLog('💰 ' + picked.desc + '（+' + amount + ' ' + g.getMoneyName() + '）', 'item');
      g.showMomentFeedback?.('获得 ' + amount + ' ' + g.getMoneyName(), 'reward');
    } else if (picked.type === 'spirit') {
      const [min, max] = picked.amount.split('-').map(Number);
      const amount = min + Math.floor(Math.random() * (max - min + 1));
      g.addSpiritStones(amount);
      const spiritName = (state.path === 'ling' || state.knowsSpiritStones) ? '灵石' : '不知名的石头';
      g.addLog('💠 ' + picked.desc + '（+' + amount + ' ' + spiritName + '）', 'item');
      g.showMomentFeedback?.('获得 ' + amount + ' ' + spiritName, 'reward');
    } else if (picked.type === 'daoxin') {
      state.daoxin = Math.min(state.maxDaoXin, state.daoxin + (picked.amount || 10));
      g.addLog('🧘 ' + picked.desc, 'info');
      g.showMomentFeedback?.('道心 +' + (picked.amount || 10), 'reward');
    } else if (picked.type === 'hp') {
      state.hp = Math.min(state.maxHp, state.hp + (picked.amount || 15));
      g.addLog('💊 ' + picked.desc, 'item');
      g.showMomentFeedback?.('气血 +' + (picked.amount || 15), 'reward');
    } else if (picked.type === 'cultivation') {
      state.cultivation += (picked.amount || 10);
      g.addLog('✨ ' + picked.desc, 'info');
      g.showMomentFeedback?.('修为 +' + (picked.amount || 10), 'reward');
    } else if (picked.type === 'find_type') {
      const item = this.pickItemByType(picked.itemType);
      if (item) {
        state.inventory.push({ ...item });
        g.addLog('📦 ' + picked.desc + '：<b>' + item.name + '</b>', 'item');
        g.showMomentFeedback?.('获得 · ' + item.name, 'reward');
      } else {
        g.addLog('🔍 ' + picked.desc, 'system');
      }
    } else {
      g.addLog('🔍 ' + picked.desc, 'system');
    }

    g.checkQuestProgress('find', picked.id || null);
    g.renderer.updateUI(['char', 'status', 'progress', 'bag', 'quest']);
    g.markDirty();
    this._presentFind({
      ...picked,
      title: picked.title || (picked.type === 'nothing' ? '探索' : '探索所得'),
      text: picked.desc || '你寻了一阵，未见所得。'
    });
  }

  _presentNoResult() {
    this.game.sceneInteraction?.close();
    this.game.showMomentFeedback?.('你什么也没发现', 'muted');
    return { open: false, empty: true };
  }

  _presentFind(result) {
    return this.game.sceneInteraction?.openFind(result);
  }

  /**
   * 按类型随机选取物品
   * @param {string} type - 'random' 或物品类型（weapon/technique/consumable 等）
   */
  pickItemByType(type) {
    const g = this.game;
    if (type === 'random') return g.ITEMS[Math.floor(Math.random() * g.ITEMS.length)];
    const pool = g.ITEMS.filter(i => i.type === type);
    if (pool.length === 0) return g.ITEMS[Math.floor(Math.random() * g.ITEMS.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

export default SearchService;
