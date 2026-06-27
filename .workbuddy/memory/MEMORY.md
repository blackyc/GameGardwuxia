# ghostMUD 项目长期备忘

## 关键架构事实

### QUESTS 引擎契约（2026-06-27 确立）
- 引擎 `src/game.js`：`checkQuestProgress(type,target)` + `completeQuest` + `renderQuests`（renderer.js）
- **数据契约**：`{id,name,desc,startLocation?,autoStart?,stages:[{desc,type,location?,target?,repeat?}],rewards:{}}`
- **stage.type 词汇表**：go/kill/encounter/find/collect/investigate/return/talk/dialogue/deliver/find_clue/choice/escort
  - talk/investigate/return/escort/deliver/dialogue/choice 都由 'go' 事件（移动）触发
  - find/collect 由 'find' 事件（搜索）触发，引擎传 target=null，按 `s.location` 判定
  - kill/encounter 由 'kill' 事件（战斗）触发
- **rewards 顶层字段**：cultivation(修为)/copperCoins(武修钱)/spiritStones(灵修钱,addSpiritStones双轨)/technique/equipment/item/faction/factionRep
- **autoStart 铁律**：stage0 不得是「抵达 startLocation」的 go 阶段（否则与 autoStart 同一到达事件冲突卡死）
- **禁止**：同地点连续 go 触发阶段（如 go@X 后接 talk@X，第二个无法触发）

### 数据加载链（index.html 串行 `<script>`）
rebuild_*.js(8) → integration_v2.js(桥接→LOCATIONS/QUESTS/NPC_ENCOUNTERS…) → Phase8/行功数据 → combat_v3 → main.js(ES module)
- integration_v2.js 用 `var` 挂全局；rebuild 文件用 `window.`/`const` 混用
- 文件为 CRLF 换行

### 状态
- state.path 默认 'wu'（武修）；'ling' 灵修未开放（switchPath stub）
- 境界上限化神（WU_REALMS 5 级 / LING_REALMS 6 级）
- 权威追踪：`docs/refactor_task_tracker.md`（唯一活文档）

### 存档系统 v3（2026-06-27 完成）
- `src/core/storage.js` v3：35 字段全序列化（白名单）、多槽位(_auto+_slot1/2/3)、版本迁移 v1→v2→v3、备份恢复、类型校验、导入导出(base64+文件)
- `save(state, slot=AUTO_SLOT)` / `load(slot=AUTO_SLOT)` / `clear(slot=AUTO_SLOT)` — 默认参数兼容旧接口
- game.js 23 个 `_save()` 触发点 + 60s 定时 + beforeunload/visibilitychange 保护
- 存档 UI：📜存档面板(自动+3手动槽) / 📤导出 / 📥导入 / 🗑删档(双重确认)
- 参考：猫国建设者 cat-zh-master（LZ-String压缩/80s自动存档/wipe双确认/migrateSave链）

## 待办优先级（截至 2026-06-27）
- ✅ T6.3 QUESTS 修复+迁移（22条）
- ✅ T2.5 存档系统 v3（多槽位+35字段+迁移+UI）
- ⏳ T7.x 新手体验（Roll点/门派/新手图）— 第一体验关键
- ⏳ T8.6-T8.12 双修深化 / T13.1-T13.6 行功战斗
