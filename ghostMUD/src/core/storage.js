/**
 * storage.js — 存档系统 v3
 * 参考猫国建设者 game.js 的 save/load/wipe/export/import 模式
 * 多槽位 + 字段完整性 + 版本迁移 + 导入导出 + 自动备份
 */

const STORAGE_KEY_PREFIX = 'ghostmud_save';
const STORAGE_VERSION = 3;
const AUTO_SLOT = '_auto';
const MANUAL_SLOTS = ['_slot1', '_slot2', '_slot3'];
const MAX_SAVE_SIZE = 4000000; // localStorage 单 key 约 5MB 限制

export class Storage {
  constructor() {
    this._version = STORAGE_VERSION;
  }

  // ---- 槽位键名 ----
  _key(slot) {
    return STORAGE_KEY_PREFIX + (slot || AUTO_SLOT);
  }

  // ---- 默认状态（用于合并缺失字段 / 校验类型） ----
  _defaults() {
    return {
      path: 'wu',
      realm: 0,
      cultivation: 0,
      totalCultivation: 0,
      daoxin: 100, maxDaoXin: 100,
      hp: 120, maxHp: 120,
      lifespan: 80,
      spiritStones: 0,
      copperCoins: 0,
      knowsSpiritStones: false,
      attack: 6, defense: 3,
      mp: 80, maxMp: 80,
      location: '应天府·十字街口',
      inventory: [],
      equipment: { weapon: null, armor: null },
      techniques: [],
      killCount: 0,
      isResting: false,
      isCultivating: false,
      trainCounter: 0,
      daoxinDecayCounter: 0,
      gameStart: Date.now(),
      combat: null,
      npcEncounter: null,
      explored: ['应天府·街口'],
      activeQuests: [],
      completedQuests: [],
      questStages: {},
      faction: '散修',
      skills: {},
      equippedSkill: null,
      factionRep: 0,
      performCooldowns: {},
      roundCount: 0,
      chart: null,
      presetCharts: [],
      corruptionLevel: 0,
    };
  }

  // ---- 序列化（白名单全字段） ----
  _serialize(state) {
    return {
      path: state.path,
      realm: state.realm,
      cultivation: state.cultivation,
      totalCultivation: state.totalCultivation,
      daoxin: state.daoxin,
      maxDaoXin: state.maxDaoXin,
      hp: state.hp,
      maxHp: state.maxHp,
      lifespan: state.lifespan,
      spiritStones: state.spiritStones,
      copperCoins: state.copperCoins,
      knowsSpiritStones: state.knowsSpiritStones,
      attack: state.attack,
      defense: state.defense,
      mp: state.mp,
      maxMp: state.maxMp,
      location: state.location,
      inventory: state.inventory,
      equipment: state.equipment,
      techniques: state.techniques,
      killCount: state.killCount,
      isResting: state.isResting,
      isCultivating: state.isCultivating,
      trainCounter: state.trainCounter,
      daoxinDecayCounter: state.daoxinDecayCounter,
      gameStart: state.gameStart,
      explored: state.explored,
      activeQuests: state.activeQuests,
      completedQuests: state.completedQuests,
      questStages: state.questStages,
      faction: state.faction,
      skills: state.skills,
      equippedSkill: state.equippedSkill,
      factionRep: state.factionRep,
      performCooldowns: state.performCooldowns,
      roundCount: state.roundCount,
      chart: state.chart,
      presetCharts: state.presetCharts,
      corruptionLevel: state.corruptionLevel,
    };
  }

  // ---- 反序列化（默认值合并 + 类型校验） ----
  _deserialize(data) {
    if (!data || typeof data !== 'object') return this._defaults();
    const d = this._defaults();
    // 浅合并：存档有值用存档的，缺失/undefined 用默认值补全
    for (const k of Object.keys(d)) {
      if (data[k] !== undefined && data[k] !== null) {
        d[k] = data[k];
      }
    }
    // 类型修复
    if (typeof d.realm !== 'number' || isNaN(d.realm)) d.realm = 0;
    if (!Array.isArray(d.inventory)) d.inventory = [];
    if (!Array.isArray(d.techniques)) d.techniques = [];
    if (!Array.isArray(d.explored)) d.explored = [];
    if (!Array.isArray(d.activeQuests)) d.activeQuests = [];
    if (!Array.isArray(d.completedQuests)) d.completedQuests = [];
    if (typeof d.questStages !== 'object' || d.questStages === null) d.questStages = {};
    if (typeof d.skills !== 'object' || d.skills === null) d.skills = {};
    if (d.copperCoins < 0) d.copperCoins = 0;
    if (d.spiritStones < 0) d.spiritStones = 0;
    if (d.daoxin > 100) d.daoxin = 100;
    if (d.daoxin < 0) d.daoxin = 0;
    if (d.corruptionLevel < 0) d.corruptionLevel = 0;
    if (d.corruptionLevel > 5) d.corruptionLevel = 5;
    return d;
  }

  // ---- 版本迁移 ----
  _migrate(payload) {
    const v = payload.version || 1;
    const s = payload.state;
    if (v >= STORAGE_VERSION) return s;   // 无需迁移

    // v1→v2: 补充漏存的 path/copperCoins/mp/maxMp 等字段（旧存档无这些字段，用 defaults 补）
    if (v <= 1) {
      console.log('[Storage] v1→v2 迁移：补充 path/copperCoins/mp/corruptionLevel 等字段');
      // _deserialize 会自动补全缺失字段，无需手动处理
    }
    // v2→v3: 结构不变，仅版本号升级
    if (v <= 2) {
      console.log('[Storage] v2→v3 迁移：版本号升级');
    }
    return s;
  }

  // ---- 核心：保存到指定槽位（无 slot = 自动槽） ----
  save(state, slot = AUTO_SLOT) {
    try {
      const key = this._key(slot);
      // 写入前备份上一份（用于损坏恢复）
      const prev = localStorage.getItem(key);
      if (prev) {
        localStorage.setItem(key + '_backup', prev);
      }
      const payload = {
        version: this._version,
        timestamp: Date.now(),
        state: this._serialize(state),
      };
      let json = JSON.stringify(payload);
      // 超大存档预警（ghostMUD 数据量远不到阈值；若未来需要可加 LZString）
      if (json.length > MAX_SAVE_SIZE) {
        console.warn(`[Storage] 存档数据过大 (${json.length}B)，建议清理背包或导出后清档重开`);
      }
      localStorage.setItem(key, json);
      return true;
    } catch (e) {
      console.error('[Storage] 存档失败:', e);
      return false;
    }
  }

  // ---- 核心：从指定槽位加载（无 slot = 自动槽） ----
  load(slot = AUTO_SLOT) {
    try {
      const key = this._key(slot);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (parseErr) {
        console.error('[Storage] 存档 JSON 解析失败，尝试备份恢复:', parseErr);
        const backup = localStorage.getItem(key + '_backup');
        if (backup) {
          localStorage.setItem(key, backup);
          payload = JSON.parse(backup);
          console.log('[Storage] ✓ 已从备份恢复存档');
        } else {
          return null; // 彻底无法恢复
        }
      }
      if (payload.version !== this._version) {
        payload.state = this._migrate(payload);
      }
      return this._deserialize(payload.state);
    } catch (e) {
      console.error('[Storage] 读档失败:', e);
      return null;
    }
  }

  // ---- 槽位信息 ----
  hasSave(slot) {
    return localStorage.getItem(this._key(slot)) !== null;
  }
  hasAutoSave() { return this.hasSave(AUTO_SLOT); }

  getSlotInfo(slot) {
    const raw = localStorage.getItem(this._key(slot));
    if (!raw) return null;
    try {
      const p = JSON.parse(raw);
      return {
        version: p.version,
        timestamp: p.timestamp,
        location: p.state?.location || '未知',
        realm: p.state?.realm ?? 0,
        cultivation: p.state?.cultivation ?? 0,
        daoxin: p.state?.daoxin ?? 100,
        size: raw.length,
      };
    } catch { return null; }
  }

  getAllSlotInfos() {
    const slots = [AUTO_SLOT, ...MANUAL_SLOTS].map(s => ({ slot: s, info: this.getSlotInfo(s) }));
    return slots.map(s => ({ ...s, hasData: s.info !== null }));
  }

  // ---- 删除指定槽位（无 slot = 自动槽） ----
  clear(slot = AUTO_SLOT) {
    const key = this._key(slot);
    localStorage.removeItem(key);
    localStorage.removeItem(key + '_backup');
  }

  /** 清除所有槽位（含手动槽和自动槽） */
  clearAll() {
    for (const s of [AUTO_SLOT, ...MANUAL_SLOTS]) {
      this.clear(s);
    }
  }

  // ---- 导出存档为 base64 字符串（用于复制分享） ----
  exportToString(state) {
    const payload = {
      version: this._version,
      timestamp: Date.now(),
      exportedAt: new Date().toLocaleString('zh-CN'),
      state: this._serialize(state),
    };
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)));
  }

  // ---- 从 base64 字符串导入存档 ----
  importFromString(str) {
    try {
      const json = decodeURIComponent(escape(atob(str.trim())));
      const payload = JSON.parse(json);
      if (!payload || !payload.state) {
        throw new Error('无效的存档数据格式');
      }
      if (payload.version !== this._version) {
        payload.state = this._migrate(payload);
      }
      const restored = this._deserialize(payload.state);
      // 写入自动槽位
      this.save(restored, AUTO_SLOT);
      return restored;
    } catch (e) {
      console.error('[Storage] 导入存档失败:', e);
      return null;
    }
  }

  // ---- 导出为 .json 文件下载 ----
  exportToFile(state) {
    const payload = {
      version: this._version,
      timestamp: Date.now(),
      exportedAt: new Date().toLocaleString('zh-CN'),
      state: this._serialize(state),
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghostMUD_${new Date().toISOString().slice(0, 10)}_save.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // ---- 从文件读取导入（通过 FileReader） ----
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const restored = this.importFromString(reader.result);
          resolve(restored);
        } catch (e) { reject(e); }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }
}
