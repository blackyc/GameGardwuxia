/**
 * storage.js — 存档系统 v2
 *
 * H4A: 基于 save_schema.js 的白名单序列化 + schema 校验 + 备份 + 损坏处理。
 *
 * 存档格式：{ version: 2, timestamp: <ms>, state: { ...fields } }
 * localStorage key: 'ghostmud_save_v2'
 * 备份 key: 'ghostmud_save_v2_backup'
 * 损坏存档保存到: 'ghostmud_save_v2_corrupt'
 */

import {
  SCHEMA_VERSION,
  SAVE_SCHEMA,
  V1_MIGRATION_MAP,
  checkType,
  getSaveableFields,
  createDefaultState,
} from './save_schema.js';

const STORAGE_KEY = 'ghostmud_save_v2';
const BACKUP_KEY = 'ghostmud_save_v2_backup';
const CORRUPT_KEY = 'ghostmud_save_v2_corrupt';

export class Storage {
  constructor() {
    this._version = SCHEMA_VERSION;
    this._warnings = [];
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

      // 写入前先备份当前值
      try {
        const current = localStorage.getItem(STORAGE_KEY);
        if (current !== null) {
          localStorage.setItem(BACKUP_KEY, current);
        }
      } catch (backupErr) {
        // 备份失败不阻止保存，但记录警告
        console.warn('[Storage] 备份失败:', backupErr);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
        console.error('[Storage] 存储空间不足，存档失败，备份已保留');
      } else {
        console.error('[Storage] 存档失败:', e);
      }
      return false;
    }
  }

  /**
   * 加载游戏状态
   * @returns {object|null} 游戏状态，或 null（无存档/损坏）
   */
  load() {
    this._warnings = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (parseErr) {
        // JSON 解析失败：保存损坏数据，返回 null
        console.error('[Storage] JSON 解析失败，存档损坏:', parseErr.message);
        try {
          localStorage.setItem(CORRUPT_KEY, raw);
        } catch (e) { /* 忽略 */ }
        return null;
      }

      // 检查 payload 结构
      if (!payload || typeof payload !== 'object' || !payload.state) {
        console.error('[Storage] 存档结构无效');
        try {
          localStorage.setItem(CORRUPT_KEY, raw);
        } catch (e) { /* 忽略 */ }
        return null;
      }

      const fileVersion = payload.version;
      let state = payload.state;

      // 版本迁移
      if (fileVersion === 1) {
        state = this._migrateV1ToV2(state);
      } else if (fileVersion !== this._version) {
        // 未知版本：尝试兼容加载，记录警告
        this._warnings.push(`未知存档版本 ${fileVersion}，尝试兼容加载`);
        console.warn(`[Storage] 未知存档版本 ${fileVersion}，尝试兼容加载`);
      }

      // schema 校验与修复
      state = this._validateAndRepair(state);

      if (this._warnings.length > 0) {
        console.warn('[Storage] 加载警告:', this._warnings);
      }

      return state;
    } catch (e) {
      console.error('[Storage] 读档失败:', e);
      return null;
    }
  }

  /** 是否有存档 */
  hasSave() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /** 清除存档（仅主存档，不清除备份和损坏记录） */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** 读取备份存档 */
  getBackup() {
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (!payload || !payload.state) return null;
      return this._validateAndRepair(this._migrateIfNeeded(payload));
    } catch (e) {
      console.error('[Storage] 读取备份失败:', e);
      return null;
    }
  }

  /** 导出存档为 JSON 字符串 */
  exportSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      // 验证可解析
      JSON.parse(raw);
      return raw;
    } catch (e) {
      console.error('[Storage] 导出失败:', e);
      return null;
    }
  }

  /**
   * 导入存档（从 JSON 字符串）
   * @param {string} jsonString — 存档 JSON 字符串
   * @returns {boolean} 是否导入成功
   */
  importSave(jsonString) {
    try {
      const payload = JSON.parse(jsonString);
      if (!payload || typeof payload !== 'object' || !payload.state) {
        console.error('[Storage] 导入失败：无效的存档结构');
        return false;
      }
      // 先备份当前存档
      const current = localStorage.getItem(STORAGE_KEY);
      if (current !== null) {
        localStorage.setItem(BACKUP_KEY, current);
      }
      // 写入新存档
      localStorage.setItem(STORAGE_KEY, jsonString);
      return true;
    } catch (e) {
      console.error('[Storage] 导入失败:', e);
      return false;
    }
  }

  // ════════════════════════════════════════
  //  内部方法
  // ════════════════════════════════════════

  /**
   * 按 schema 白名单序列化状态（忽略 transient 和 schema 外的字段）
   */
  _serialize(state) {
    const saveable = getSaveableFields();
    const data = {};
    for (const field of saveable) {
      if (state && state[field] !== undefined) {
        data[field] = state[field];
      } else {
        // 字段不存在时使用默认值
        data[field] = SAVE_SCHEMA[field].default;
      }
    }
    return data;
  }

  /**
   * v1 → v2 迁移
   */
  _migrateV1ToV2(state) {
    const migrated = { ...state };

    // 字段重命名：questProgress → questStages
    for (const [oldName, newName] of Object.entries(V1_MIGRATION_MAP)) {
      if (oldName in migrated && !(newName in migrated)) {
        migrated[newName] = migrated[oldName];
        delete migrated[oldName];
        console.log(`[Storage] 迁移字段: ${oldName} → ${newName}`);
      } else if (oldName in migrated && newName in migrated) {
        // 两边都有，删除旧的
        delete migrated[oldName];
        console.log(`[Storage] 迁移：${oldName} 和 ${newName} 同时存在，保留 ${newName}`);
      }
    }

    return migrated;
  }

  /**
   * 如果需要，迁移 payload
   */
  _migrateIfNeeded(payload) {
    if (!payload || !payload.state) return payload.state || null;
    let state = payload.state;
    if (payload.version === 1) {
      state = this._migrateV1ToV2(state);
    }
    return state;
  }

  /**
   * schema 校验与修复
   * - 缺失字段 → 填默认值
   * - 类型不匹配 → 用默认值覆盖，记录 warning
   * - null 值 → 检查 nullable，不允许 null 则用默认值
   * - 移除 schema 外的字段
   */
  _validateAndRepair(state) {
    const repaired = {};

    for (const [name, def] of Object.entries(SAVE_SCHEMA)) {
      // 临时字段跳过存档校验（加载时重置为默认值）
      if (def.transient) {
        repaired[name] = def.default;
        continue;
      }

      const value = state[name];

      if (value === undefined) {
        // 缺失字段 → 填默认值
        repaired[name] = def.default;
        this._warnings.push(`字段 "${name}" 缺失，使用默认值`);
        continue;
      }

      if (value === null) {
        if (def.nullable) {
          repaired[name] = null;
        } else {
          repaired[name] = def.default;
          this._warnings.push(`字段 "${name}" 不允许 null，使用默认值`);
        }
        continue;
      }

      // 类型检查
      if (!checkType(value, def.type)) {
        repaired[name] = def.default;
        this._warnings.push(`字段 "${name}" 类型不匹配（期望 ${def.type}），使用默认值`);
        continue;
      }

      // 类型匹配，深拷贝以防引用
      try {
        repaired[name] = JSON.parse(JSON.stringify(value));
      } catch (e) {
        repaired[name] = def.default;
        this._warnings.push(`字段 "${name}" 深拷贝失败，使用默认值`);
      }
    }

    return repaired;
  }
}
