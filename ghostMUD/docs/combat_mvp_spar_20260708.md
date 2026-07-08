# ghostMUD 战斗 MVP — 切磋值星弟子 + 战斗 UI 重写

## 日期
2026-07-09

## 目标
让玩家在问剑峰·山门与值星弟子切磋，直观看到行功战斗系统的文字效果。

## 修改文件清单

### 1. `src/faction_service.js` — 加入宗门时设置 state.chart
- 添加 `import { getData } from './data/data_loader.js'`
- 在 `joinFaction()` 中，入门技能获取之后，从 `COMBAT_SKILLS_V3` 中按 slot A-E 组装 chart 对象写入 `s.chart`
- 散修情况：从无 faction 的通用技能中取 slot A-E
- 日志提示"行功图已展开：XX·五式战诀"

### 2. `index.html` — 重写战斗 modal
- 替换旧版 Combat Modal div 为新版 `combat-arena` 结构
- 新增：MP 条、行功五槽（起承转合归）、状态图标区、战斗日志区、真气门禁面板
- 干预按钮改为：脱战/变式/服药

### 3. `src/ui/renderer.js` — 重写 updateCombatUI()
- 使用 `getBattleUIData()` 的新版本，支持：
  - 玩家 HP/MP 条
  - 敌人 HP 条
  - 五槽状态（locked/cooldown/almost/ready/current/mpwarn/mpgate）
  - 状态图标渲染
  - 战斗日志滚动
  - 真气门禁面板（调息/服药/平斩/强行运功）
- 保留旧版 fallback 逻辑

### 4. `src/ui/renderer.js` — 感知面板 NPC 添加"切磋"按钮
- 在 `renderPerception()` 中，当 `n.canSpar` 为 true 时添加切磋按钮

### 5. `src/styles/main.css` — 添加战斗 UI 新样式
- 在 `/* Combat Performs */` 之前插入 Combat Arena v2 样式
- 包含：MP 条、五槽、状态图标、战斗日志、真气门禁面板的完整样式
- 保持陈墨黑底/老宣纸面板/朱砂红强调的设计风格

### 6. `src/perception_service.js` — 感知面板添加房间 NPC
- 在 `getRoomPerception()` 中，NPC_ENCOUNTERS 遍历之后，添加 LOCATIONS 数据中的固定 NPC
- 房间 NPC 标记 `canSpar: true`，支持切磋

### 7. `src/ui/input.js` — 添加切磋按钮路由
- 在感知面板 NPC 子选项处理中，添加 `spar` action 路由到 `game.sparNpc()`

### 8. `src/game.js` — 添加 sparNpc 代理方法
- 在 NPC 代理区域添加 `sparNpc(npcIndex, npcType)` 代理方法

### 9. `src/npc_service.js` — 实现 sparNpc 方法
- 添加 `sparNpc(npcIndex, npcType)` 方法：
  - 根据 npcType 获取 NPC 数据（支持 encounter 池和 room 固定 NPC）
  - 检查玩家行功图
  - 构造切磋用敌人数据
  - 调用 `g.combat.startCombat()` 启动战斗
- 添加 `_buildSparEnemy(npc)` 方法：
  - 值星弟子：60HP/6ATK/2DEF，使用问剑峰技能 chart
  - 默认弱敌：50HP/5ATK/1DEF

### 10. `src/combat_facade.js` — 修复 chart fallback
- 将简单的 `dl.XINGGONG` 查找改为从 `COMBAT_SKILLS_V3` 自动构造 chart
- 缓存到 `g.state.chart` 避免重复构造

## 构建验证
- `npx vite build`: 0 errors, 0 warnings
- JS bundle: 164.09 kB (gzip: 61.72 kB)
- CSS: 57.72 kB (gzip: 13.22 kB)

## 测试验证
- `node temp/run-all.cjs`: 99 通过, 0 失败
- 所有 8 个测试套件全部 PASS

## 关键约束遵守
- ✅ 保留了旧版战斗 fallback 代码（`_legacyStartCombat` / `_legacyCombatAction`）
- ✅ 未修改 `battle_async.js` 引擎核心逻辑
- ✅ 保持现有 CSS 变量和设计风格
- ✅ 文件编码 UTF-8 无 BOM
