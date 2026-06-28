/**
 * storage.js — 存档系统
 * 参考猫国建设者 game.js 的 save/load + IDataStorageAware
 * 使用 localStorage 序列化/反序列化游戏状态
 */

const STORAGE_KEY = 'ghostmud_save_v2';
const STORAGE_VERSION = 1;

export class Storage {
  constructor() {
    this._version = STORAGE_VERSION;
  }

  /**
   * 保存游戏状态
   * @param {object} state — 游戏状态对象
   * @returns {boolean} 是否保存成功
   */
  save(state) {
    try {
      const payload = {
        version: this._version,
        timestamp: Date.now(),
        state: this._serialize(state),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('[Storage] 存档失败:', e);
      return false;
    }
  }

  /**
   * 加载游戏状态
   * @returns {object|null} 游戏状态，或 null（无存档）
   */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (payload.version !== this._version) {
        console.warn('[Storage] 存档版本不匹配，可能需要迁移');
      }
      return this._deserialize(payload.state);
    } catch (e) {
      console.error('[Storage] 读档失败:', e);
      return null;
    }
  }

  /** 是否有存档 */
  hasSave() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /** 清除存档 */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** 序列化状态（只存核心卷宗） */
  _serialize(state) {
    return {
      // 核心属性
      realm: state.realm,
      cultivation: state.cultivation,
      totalCultivation: state.totalCultivation,
      daoxin: state.daoxin,
      maxDaoXin: state.maxDaoXin,
      hp: state.hp,
      maxHp: state.maxHp,
      lifespan: state.lifespan,
      attack: state.attack,
      defense: state.defense,
      location: state.location,
      inventory: state.inventory,
      equipment: state.equipment,
      techniques: state.techniques,
      killCount: state.killCount,
      explored: state.explored,
      activeQuests: state.activeQuests,
      completedQuests: state.completedQuests,
      questStages: state.questStages,
      // 帮派/技能
      faction: state.faction,
      skills: state.skills,
      equippedSkill: state.equippedSkill,
      factionRep: state.factionRep,
      // 双修体系
      path: state.path,
      mp: state.mp,
      maxMp: state.maxMp,
      // 经济双轨
      spiritStones: state.spiritStones,
      copperCoins: state.copperCoins,
      knowsSpiritStones: state.knowsSpiritStones,
      // 身世系统
      innate: state.innate,
      innateName: state.innateName,
      innateMods: state.innateMods,
      unlocks: state.unlocks,
      factionRepMods: state.factionRepMods,
      // 开场标记
      introSeen: state.introSeen,
      // 行功战斗 v3.0
      chart: state.chart,
      presetCharts: state.presetCharts,
      corruptionLevel: state.corruptionLevel,
      // 状态标记
      isResting: state.isResting,
      isCultivating: state.isCultivating,
      trainCounter: state.trainCounter,
      daoxinDecayCounter: state.daoxinDecayCounter,
      gameStart: state.gameStart,
      // 时间系统
      gameTime: state.gameTime,
      realTimeAccumulator: state.realTimeAccumulator,
    };
  }

  /** 反序列化状态 */
  _deserialize(data) {
    return { ...data };
  }
}
