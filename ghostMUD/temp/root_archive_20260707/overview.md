# 概览：ghostMUD 存档系统 v3 — 参考猫国建设者全量重写

## 完成内容

参考猫国建设者（Kittens Game）的存档架构，为 ghostMUD 实现了完整的存档系统 v3。原有存档系统存在严重缺陷：15 个状态字段漏存（含 `path`/`copperCoins`/`corruptionLevel` 等关键字段）、仅在 `explore()` 时存档（挂机/战斗/任务进度全部不保存）、无版本迁移、无类型校验、无 UI 操作面板。

### 1. storage.js v3 全量重写
- **35 字段全序列化**：补全 15 个漏存字段（path/copperCoins/mp/maxMp/knowsSpiritStones/chart/presetCharts/corruptionLevel/gameStart/daoxinDecayCounter/trainCounter/isResting/isCultivating/performCooldowns/roundCount）
- **多槽位**：`_auto`（自动）+ `_slot1/2/3`（手动），默认参数兼容旧接口
- **版本迁移链**：v1→v2→v3，旧存档自动补全缺失字段
- **备份恢复**：写入前备份上一份；JSON 解析失败自动从 `_backup` 恢复
- **类型校验**：NaN→0、非数组→[]、越界值钳制（daoxin 0-100、corruption 0-5）
- **导入导出**：base64 存档码（剪贴板复制）+ .json 文件下载/上传

### 2. 23 个存档触发点（game.js）
| 触发点 | 场景 |
|--------|------|
| idleTick (每2 tick) | 挂机修为/道心/HP 变化 |
| checkBreakthrough 成功/失败 | 境界提升/冲关失败 |
| endCombat | 战斗结束（经验/金币/掉落） |
| completeQuest | 任务完成（奖励发放） |
| startQuest | 接受新任务 |
| searchArea | 搜索获得物品/金币 |
| useItem | 使用/装备物品 |
| cultivate / train / rest | 修炼/练功/休憩切换 |
| practiceSkill | 武学修炼/升级 |
| explore / quickTravel | 移动/快速旅行 |
| _autosave (60s 定时) | 定时自动存档 |
| beforeunload / visibilitychange | 页面关闭/切换保护 |

### 3. 存档操作 UI（index.html + main.css + input.js + game.js）
- **📜 存档面板**：自动存档状态 + 3 手动槽位（保存/读取/删除）
- **📤 导出 / 📥 导入**：文件下载 + 存档码复制粘贴
- **🗑 删档**：双重确认（参考猫国建设者 `wipe()` 模式）
- **命令行支持**：输入"存档"/"导出"/"删档"也可操作
- 风格匹配现有暗色聊斋美学（rgba 暗红/暗棕/金棕色板）

## 改动文件
| 文件 | 改动 |
|------|------|
| `src/core/storage.js` | 全量重写 v3（99 行 → ~320 行）|
| `src/game.js` | +23 个 `_save()` 调用 + `_autosave()` 定时器 + `_setupSaveProtection()` + 存档 UI 方法群（~120 行新增）|
| `src/ui/input.js` | +存档按钮事件绑定（openSaveMenu/exportSave/importSave/wipeConfirm + 槽位/导入导出按钮）|
| `index.html` | +存档按钮行 + Save Management Modal HTML |
| `src/styles/main.css` | +存档面板 CSS（~40 行）|
| `docs/refactor_task_tracker.md` | T2.5 状态更新 + 变更日志 |

## 验证
- ✅ `vite build` 通过（17 模块，113.78KB JS）
- ✅ **30 项 E2E 测试全通过**：序列化完整性(10) + v1迁移(6) + 导入导出(5) + 槽位信息(3) + 备份恢复(1) + 清除(1) + 类型校验(4)
- ✅ 修复了 `getAllSlotInfos()` 中 `slot` 未定义 bug
- ✅ 修复了 `save`/`load`/`clear` 方法重复定义导致无限递归 bug

## 参考猫国建设者的设计映射
| 猫国建设者 | ghostMUD v3 |
|-----------|-------------|
| `com.nuclearunicorn.kittengame.savedata` 单 key | `ghostmud_save_auto` + `_slot1/2/3` 多槽位 |
| LZ-String 压缩 | JSON 直存（数据量远不到阈值）|
| 80s 自动存档 (400×200ms) | 60s 定时 + 23 触发点 + 页面离开保护 |
| `IDataStorageAware` mixin | `_serialize()`/`_deserialize()` 白名单 |
| `migrateSave()` v1→v15 | `_migrate()` v1→v2→v3 |
| `wipe()` 双重确认 | `wipeConfirm()` 双重确认 |
| KGNet/Dropbox 云同步 | 文件导出/导入 + base64 存档码（本地分享）|

## 后续建议
- T7.x 新手体验（Roll 点 / 门派页 / 新手引导图）
- T8.6–T8.12 双修深化（UI 双轨 / 转职 / 灵修技能树 / 畸变系统）
- 云存档（未来可接入 Supabase / Firebase）
