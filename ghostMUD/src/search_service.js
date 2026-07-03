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
    if (g.state.combat || g.state.npcEncounter) { g.addLog('当前无法搜寻！', 'system'); return; }
    const room = g.state.location;
    const data = g.ROOM_SEARCH[room];
    if (!data) { g.addLog('🔍 四下搜寻了一番，未发现特别之物。', 'system'); return; }

    if (Math.random() > data.searchChance) {
      g.addLog('🔍 四下搜寻了一番，未发现特别之物。', 'system');
      return;
    }

    const pool = data.results.filter(r => r.chance < 1.0 || r.type === 'nothing');
    const totalWeight = pool.reduce((sum, r) => sum + (r.chance || 1), 0);
    let rand = Math.random() * totalWeight;
    let picked = pool[pool.length - 1];

    for (const r of pool) {
      rand -= (r.chance || 1);
      if (rand <= 0) { picked = r; break; }
    }

    const s = g.state;

    if (picked.type === 'money') {
      const [min, max] = picked.amount.split('-').map(Number);
      const amt = min + Math.floor(Math.random() * (max - min + 1));
      g.addMoney(amt);
      g.addLog('💰 ' + picked.desc + '（+' + amt + ' ' + g.getMoneyName() + '）', 'item');
    } else if (picked.type === 'spirit') {
      const [min, max] = picked.amount.split('-').map(Number);
      const amt = min + Math.floor(Math.random() * (max - min + 1));
      g.addSpiritStones(amt);
      const spiritName = (s.path === 'ling' || s.knowsSpiritStones) ? '灵石' : '不知名的石头';
      g.addLog('?? ' + picked.desc + '（+' + amt + ' ' + spiritName + '）', 'item');
    } else if (picked.type === 'daoxin') {
      s.daoxin = Math.min(s.maxDaoXin, s.daoxin + (picked.amount || 10));
      g.addLog('🧘 ' + picked.desc, 'info');
    } else if (picked.type === 'hp') {
      s.hp = Math.min(s.maxHp, s.hp + (picked.amount || 15));
      g.addLog('💊 ' + picked.desc, 'item');
    } else if (picked.type === 'cultivation') {
      s.cultivation += (picked.amount || 10);
      g.addLog('✨ ' + picked.desc, 'info');
    } else if (picked.type === 'find_type') {
      const it = this.pickItemByType(picked.itemType);
      if (it) {
        s.inventory.push({ ...it });
        g.addLog('📦 ' + picked.desc.replace('了点东西', '：<b>' + it.name + '</b>').replace('了', '了：<b>' + it.name + '</b>'), 'item');
      } else {
        g.addLog('🔍 ' + picked.desc, 'system');
      }
    } else {
      g.addLog('🔍 ' + picked.desc, 'system');
    }

    g.checkQuestProgress('find', null);
    g.renderer.updateUI(['char', 'status', 'progress', 'bag', 'quest']);
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
