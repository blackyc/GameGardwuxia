// ============================================================
// 聊斋仙途 · 帮派招募NPC 遭遇数据
// Faction Recruiter NPC Encounters
// ============================================================
//
// ⚠ 废弃说明 (2026-07-03)
//
// 本文件原包含 12 个帮派的招募 NPC 遭遇数据，分布在 12 个房间中。
// 但这些房间名（鸡鸣寺幽冥观、赤霞峰灵息观、锈剑冢鬼市节点等）
// 从未在任何房间数据文件（CITY_ROOMS / WILD_ROOMS / DUNGEON_ROOMS
// / WENJIANFENG_ROOMS）中定义，因此 game.js 中的
// dl.FACTION_RECRUITER_ENCOUNTERS[room] 永远返回 null，
// 帮派招募功能从未实际生效。
//
// 已将 12 个废弃房间条目清除，仅保留空对象以维持接口兼容。
// game.js 中的两处引用均使用 `|| null` 兜底，空对象不会破坏逻辑。
//
// 如需恢复此功能，需要重新生成房间名，
// 或将招募 NPC 移动到已存在的房间中。
// ============================================================

var FACTION_RECRUITER_ENCOUNTERS = {};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FACTION_RECRUITER_ENCOUNTERS };
}
