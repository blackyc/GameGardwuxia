/**
 * item_service.js — 物品系统服务层
 *
 * 从 game.js 拆出的物品使用逻辑：
 * - useItem：使用/装备/研习/汲取/鉴定物品
 *
 * 设计原则：
 * - ItemService 持有 game 引用，通过 game.state / game.renderer / game.addLog() 访问宿主
 * - Game 保留一行代理方法
 */

export class ItemService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  useItem(index) {
    const g = this.game;
    const s = g.state;
    if (s.combat) { g.addLog('交战中无法使用物品！', 'combat'); return; }
    if (index >= s.inventory.length) return;
    const item = s.inventory[index];

    if (item.type === 'consumable') {
      if (item.effect === 'daoxin') s.daoxin = Math.min(s.maxDaoXin, s.daoxin + (item.value || 20));
      else if (item.effect === 'hp') s.hp = Math.min(s.maxHp, s.hp + (item.value || 30));
      else if (item.effect === 'cultivation') s.cultivation += (item.value || 30);
      else if (item.effect === 'breakthrough') s.cultivation += g.getRealms()[Math.min(s.realm + 1, g.getRealms().length - 1)].cost * 0.4;
      else s.hp = Math.min(s.maxHp, s.hp + 20);
      g.addLog('💊 使用 ' + item.name + '。', 'item');
      s.inventory.splice(index, 1);
    } else if (item.type === 'equip' || item.type === 'equipment') {
      if (item.slot === 'weapon') {
        if (s.equipment.weapon) s.inventory.push(s.equipment.weapon);
        s.equipment.weapon = item;
      } else if (item.slot === 'armor') {
        if (s.equipment.armor) s.inventory.push(s.equipment.armor);
        s.equipment.armor = item;
      }
      s.inventory.splice(index, 1);
      g.addLog('⚡ 装备 ' + item.name + '！', 'special');
    } else if (item.type === 'technique') {
      if (!s.techniques.includes(item.name)) {
        s.techniques.push(item.name);
        g.addLog('📖 研习 ' + item.name + '！', 'special');
      }
      s.inventory.splice(index, 1);
    } else if (item.type === 'stone') {
      if (item.name === '不知名的石头' && !s.knowsSpiritStones) {
        g.addLog('?? 你端详着这块温润的石头……说不上来是什么，但触手生凉。也许该找人鉴定一下。', 'special');
      } else {
        g.addSpiritStones(item.value || 5);
        s.inventory.splice(index, 1);
        g.addLog('?? 汲取 ' + item.name + '，获得 ' + (item.value || 5) + ' 灵石。', 'item');
      }
    } else if (item.type === 'special') {
      g.addLog('?? ' + item.name + '——一件特殊之物，尚不知其用途。', 'special');
    }
    g.renderer.updateUI(['char', 'status', 'progress', 'bag']);
    g.checkBreakthrough();
  }
}

export default ItemService;
