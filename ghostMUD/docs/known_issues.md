# 已知问题日志

> 记录当前迁移中已识别但暂缓修复的问题，避免遗忘。
> 格式：编号 | 发现时间 | 严重度 | 模块 | 描述 | 计划修复节点

---

## 0001 | 2026-06-19 11:37 | 🟡 中 | T1.2 道心单轴 | 衰减公式仍为旧线性减法

**现状**：变量名 `sanity` → `daoxin` 已 100% 替换，`daoxinTick()` 和 `gameOver()` 文本已聊斋化。但衰减逻辑（`daoxinTick`）仍是旧线性公式：
```js
const d = (loc ? loc.danger : 1) * 2 + (Math.random() > 0.7 ? 1 : 0);
s.daoxin = Math.max(0, s.daoxin - d);
```

**问题**：旧公式与道心单轴世界观不匹配。按 cultivation_system.md v1.1 设计，道心衰减应与修炼境界、宗派心法、当前环境"薄"度联动，而非仅按 danger 线性扣减。

**设计目标**（待实现）：
- 道心基础衰减 = 境界系数 × 环境侵蚀度
- 心法可提供道心保护（被动减缓）
- 低道心段位时衰减加速（恶性循环）
- 特定事件（见祂痕迹、使用禁术）触发道心暴击

**计划**：第2批收尾阶段统一重构 daoxinTick 逻辑。

---

## 0002 | 2026-06-19 12:01 | 🟡 中 | T1.1 CSS主题 | UI色板仍为赛博大明配色

**现状**：HTML 中 CSS 变量名和 UI 文案已迁移，但色板（暗紫/霓虹青）仍是赛博风格，与聊斋仙途的枯色/墨色/血色基调不匹配。

**计划**：与道心单轴重构同批次处理。

---

## 0003 | 2026-06-19 12:01 | 🟢 低 | 第0批前置审计 | 0A/0B/0C/0D 未执行

**现状**：未确认 game_data.js 内嵌哪些模块、npc_encounters 冗余版本未合并、cyber_ming_game_data.js 副本未归档。

**风险**：子 agent 并行迁移时可能重复处理同一内容或遗漏关键模块。

**计划**：当前会话启动子 agent 前先做快速 0C 确认（加载链），0A/0B/0D 在不阻塞并行迁移的前提下逐步补。

---

## 0004 | 2026-06-19 12:19 | 🔴 高→已修复 | T7/Batch2 | JSON全局正则过替换：AI→器灵

**根因**：批2的4个JSON术语迁移脚本中 `AI→器灵` 是全局替换，击中所有含"ai"的英文单词。

**受损**：61处，跨4文件——ghost_world_model.json(18)、combat_systems(23)、equipment_design(17)、systems_design(3)。

**典型破坏**：
- Kaifeng → k器灵feng
- taiji-quan → t器灵ji-quan  
- chain → ch器灵n
- rail → r器灵l
- baishu → b器灵shu
- availability → av器灵lability

**修复**：`([a-zA-Z])器灵([a-zA-Z])` → `$1ai$2`，61处全部还原，JSON合法性验证通过。

**教训**：任何全局中文替换**必须**回避英文代码区。之后所有JSON/JS的术语替换脚本必须加 `[a-z]中文词[a-z]` 后审计扫描。

---

*最后更新：2026-06-19 12:20*

---

## 0005 | 2026-06-21 | 🔴 高→已修复 | 引擎/数据契约 | 方向键中英不匹配 → 全部移动失效

**症状**：`ghost_mud_v2.html` 打开后所有方向按钮只回显「前方的路不见了。也许从来就没有过。」，移动完全不可互动。

**根因**：数据适配层（`work/integration_v2.js` 合并的 `rebuild_rooms_*.js`）的 `connections` 一律使用中文方向键（`北/南/东/西/上/下/入/出`），而引擎 `explore()` 里 `dn = { north:'north', ... }` 是恒等映射，永远查英文 key → `loc.connections['north']` 全部 `undefined`。共 197 条 connection 无一可用。

**修复**：
- `ghost_mud_v2.html` explore()：把 `dn` 改为 `DIR_CN` 英→中归一化，并兼容直接传入中文方向。
- 扩展 `dirName()` 与方向按钮，补 `上/下` 两个方向（地牢/楼阁用到）。
- 见 `work/test_bugfix_verify.py` 回归用例。

---

## 0006 | 2026-06-21 | 🔴 高→已修复 | 引擎/数据契约 | NPC 遭遇字段不匹配 → 「交谈」出现 undefined

**症状**：点「交谈」触发 NPC 遭遇后，模态标题渲染为「👥 undefined」，选项按钮全部显示 `undefined`，点选项无任何效果。

**根因**：引擎 `triggerNPCEncounter()` 读 `enc.title`、`enc.results[*].choice`、`npcChoice()` 读 `result.effect/log/reward`；但适配层 `integration_v2.js` 生成的遭遇用的是 `enc.name`，且 result 仅 `{type, text}`，三个引擎字段全部缺失。

**修复**（改适配层不改引擎数据）：
- `integration_v2.js` 新增 `_toEngineResult(r)`：把旧式 `{type,text}` 翻译为 `{choice, log, effect, reward}`，按 type 映射按钮文案与对应 effect（heal/buff/money/item/skill/info）。
- 遭遇对象补 `title: npcName`（与 name 并存）；results 经 `.map(_toEngineResult)`。
- `ghost_mud_v2.html` applyReward 补 `heal/hp` 分支；npcChoice effect 解析补 `heal/daoxin/gain_*` 通用分支转发 applyReward。
- 见 `work/test_bugfix_verify.py`。

**教训**：适配层（integration_v2.js）与引擎必须共享同一份"数据契约"，否则数量测试通过（LOCATIONS:166 / NPC_ENCOUNTERS:140）但结构全错。后续所有集成测试应包含**结构校验**而非只数 count。

*最后更新：2026-06-21*
