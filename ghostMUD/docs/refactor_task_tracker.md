# GhostMUD 重构任务追踪与执行表

> **创建时间**：2026-06-22  
> **目标**：参考猫国建设者（cat-zh-master）架构，对 ghostMUD 进行最小改动原则的重构  
> **风格约束**：聊斋 60% + 认知侵蚀 30% + 不可名状 10%  
> **平台目标**：同时适配手机端和桌面端

---

## 一、现状分析

### 1.1 当前 ghostMUD 架构

| 层 | 文件 | 大小 | 职责 |
|----|------|------|------|
| **引擎+UI** | `ghost_mud_v2.html` | 104KB | 单文件包含全部 CSS + HTML + JS Game 类 |
| **数据适配层** | `work/integration_v2.js` | 40KB | 合并 7 个 rebuild_*.js 数据文件 |
| **数据层** | `work/rebuild_*.js` × 7 | ~840KB | 城市/野外/地牢房间、敌人、物品、境界、氛围、技能描述 |
| **设计文档** | `docs/*.md` × 12 | ~140KB | 世界观、修炼体系、敌人类型学、术语映射、风格锚点、房间约束 |
| **辅助工具** | `work/*.js` + `*.py` | ~2MB | 扫描/审计/验证/转换脚本 |
| **旧版本** | `daogui_mud.html` | 48KB | 初版原型 |

**核心问题**：
1. **单文件巨石架构**：`ghost_mud_v2.html` 104KB 包含 CSS（300行）+ HTML（200行）+ JS Game 类（1200行），不可维护
2. **数据层臃肿**：7 个 rebuild_*.js 文件通过 `<script>` 标签串行加载，总体积 ~840KB，无懒加载
3. **无模块化**：全局变量满天飞（`ENEMIES`、`LOCATIONS`、`NPC_ENCOUNTERS`、`FACTIONS` 等），无命名空间
4. **CSS 硬编码**：所有样式内联在 HTML `<style>` 中，无主题切换能力
5. **无存档系统**：状态全部在内存，刷新即丢失
6. **已知 Bug**：道心衰减公式过简（known_issues 0001）、CSS 色板仍残留赛博风（0002）

### 1.2 猫国建设者架构参考

| 层 | 文件 | 职责 |
|----|------|------|
| **核心框架** | `core.js` (61KB) | TabManager 基类、Timer、数据存储感知、效果缓存系统 |
| **主游戏** | `game.js` (148KB) | GamePage 主类、Server、Telemetry、存档/读档 |
| **模块层** | `js/*.js` × 17 | buildings/village/science/religion/diplomacy/space/time/workshop/prestige/achievements/calendar/challenges/stats/ui/toolbar/math/void |
| **UI 层** | `js/jsx/*.jsx.js` × 5 | React 组件：left/mid/right/toolbar/map 面板 |
| **资源系统** | `js/resources.js` | 资源池管理（catnip/wood/minerals/...） |
| **主题** | 多主题 CSS | 深色/浅色/赛博等多主题切换 |

**可借鉴的关键模式**：
1. **TabManager 分页管理**：每个功能模块继承 TabManager，统一 registerMeta/updateEffectCached 接口
2. **效果缓存系统**：effectsCachedExisting + globalEffectsCached，避免每帧重算
3. **资源池模式**：resPool 统一管理所有资源，addBarnWarehouseRatio 等修饰符
4. **存档/读档**：IDataStorageAware mixin，dojo.subscribe("server/save") 事件驱动
5. **模块化加载**：Dojo Toolkit 的 declare + require 模式（可迁移为 ES6 Module）
6. **UI 组件化**：jsx 文件分离 UI 渲染逻辑

---

## 二、重构原则

1. **最小改动**：不重写游戏逻辑，只拆分架构和修复已知问题
2. **数据不动**：rebuild_*.js 数据文件保持不变，只改加载方式
3. **渐进迁移**：分阶段拆分，每步可运行可测试
4. **风格不变**：保持聊斋志怪风格，修复 CSS 色板但不改变视觉基调
5. **双端适配**：CSS 响应式，移动端优先（当前已是 max-width:440px）

---

## 三、任务分解与执行表

### 阶段 1：架构拆分（P1 - 核心）

| 任务 ID | 任务名 | 输入 | 输出 | 依赖 | 状态 |
|---------|--------|------|------|------|------|
| **T1.1** | 拆分 CSS 到独立文件 | `ghost_mud_v2.html` 的 `<style>` 块 | `src/styles/main.css` + `src/styles/themes/night.css` + `src/styles/responsive.css` | 无 | ✅ 已完成 |
| **T1.2** | 拆分 HTML 结构到模板 | `ghost_mud_v2.html` 的 `<body>` | `index.html`（12KB，含数据 script 标签 + module 入口） | T1.1 | ✅ 已完成 |
| **T1.3** | 拆分 Game 类到 `src/game.js` | `ghost_mud_v2.html` 的 `<script>` Game 类 | `src/game.js`（58KB，完整迁移含战斗/任务/拜师/物品等全系统） | T1.2 | ✅ 已完成 |
| **T1.4** | 拆分数据加载层 | `work/integration_v2.js` 及 7 个 rebuild | `src/data/data_loader.js`（从 window 收集全局变量，保留原始 work/ 文件） | T1.3 | ✅ 已完成 |
| **T1.5** | 建立命名空间 | 全局变量 `ENEMIES`/`LOCATIONS` 等 | `src/core/namespace.js`（GhostEngine 命名空间） | T1.4 | ✅ 已完成 |

### 阶段 2：猫国建设者模式引入（P2 - 架构改进）

| 任务 ID | 任务名 | 说明 | 参考源 | 依赖 | 状态 |
|---------|--------|------|--------|------|------|
| **T2.1** | 引入 TabManager 基类 | 统一管理 5 个 Tab 面板（人物/包裹/武学/任务/境况） | `src/core/tabmanager.js`（1.7KB） | T1.5 | ✅ 已完成 |
| **T2.2** | 引入效果缓存系统 | 替代当前散落的 updateUI 全量刷新 | `core.js` updateEffectCached | T2.1 | ⏳ 待执行 |
| **T2.3** | 引入资源池模式 | 统一管理 气血/真元/道心/灵石/修为 | `src/core/respool.js`（2.3KB，ResourcePool 类） | T2.1 | ✅ 已完成 |
| **T2.4** | 引入 Timer 调度器 | 替代当前 setInterval 挂机逻辑 | `src/core/timer.js`（1.4KB，含 start/stop/暂停恢复） | T2.1 | ✅ 已完成 |
| **T2.5** | 引入存档系统 | localStorage 序列化/反序列化 + IDataStorageAware | `src/core/storage.js`（2.6KB，含 save/load/hasSave/clear） | T2.3 | ✅ 已完成 |

### 阶段 3：已知问题修复（P3 - 质量改进）

| 任务 ID | 任务名 | 说明 | 来源 | 依赖 | 状态 |
|---------|--------|------|------|------|------|
| **T3.0** | 修复 input.js 语法错误 | `_bindActionButtons()` 中 forEach 回调未正确闭合 + 重复事件绑定，导致 Vite import analysis 失败 | 构建报错 | T1.3 | ✅ 已完成 |
| **T3.0b** | 修复 vite.config.js manualChunks | Vite 8 (rolldown) 不支持对象格式 manualChunks，且引用的 6 个 src/data/*.js 文件不存在 | 构建报错 | T1.1 | ✅ 已完成 |
| **T3.1** | 修复道心衰减公式 | 按境界×环境侵蚀度联动，非简单线性 | known_issues 0001 | T2.2 | ⏳ 待执行 |
| **T3.2** | 修复 CSS 色板 | 替换赛博暗紫/霓虹为枯色/墨色/血色基调 | known_issues 0002 | T1.1 | ⏳ 待执行 |
| **T3.3** | 修复 HQ 判断 | `isAtFactionHQ` 中残留旧术语映射 | 代码审查 | T1.5 | ⏳ 待执行 |
| **T3.4** | 统一方向键映射 | 确保全链路使用中文方向键或建立完整双向映射 | known_issues 0005 | T1.5 | ⏳ 待执行 |

### 阶段 4：双端适配增强（P4 - 体验改进）

| 任务 ID | 任务名 | 说明 | 依赖 | 状态 |
|---------|--------|------|------|------|
| **T4.1** | 响应式断点 | 桌面端 >768px 展开双栏布局，移动端保持单栏 | T1.1 | ⏳ 待执行 |
| **T4.2** | 触控优化 | 按钮热区 ≥44px，滑动手势支持地图滚动 | T1.1 | ⏳ 待执行 |
| **T4.3** | 键盘快捷键 | 桌面端数字键切 Tab、方向键移动、空格打坐 | T1.3 | ⏳ 待执行 |
| **T4.4** | 字体响应 | 桌面端 16px，移动端 15px，支持系统字体缩放 | T1.1 | ⏳ 待执行 |

### 阶段 5：数据层优化（P5 - 性能改进）

| 任务 ID | 任务名 | 说明 | 依赖 | 状态 |
|---------|--------|------|------|------|
| **T5.1** | 数据懒加载 | 按区域动态加载房间数据，非首屏全量加载 | T1.4 | ⏳ 待执行 |
| **T5.2** | 数据压缩 | NPC_ENCOUNTERS 410KB → 按区域拆分为多个 JSON | T5.1 | ⏳ 待执行 |
| **T5.3** | 缓存优化 | 已探索房间描述缓存，避免重复渲染 | T2.2 | ⏳ 待执行 |

---

## 四、执行顺序与依赖图

```
T1.1 (CSS拆分) ──┬── T1.2 (HTML模板) ── T1.3 (Game类) ── T1.4 (数据加载) ── T1.5 (命名空间)
                 │                                                          │
T3.2 (色板修复) ─┘                                                          ├── T2.1 (TabManager) ──┬── T2.2 (效果缓存) ── T3.1 (道心公式)
                                                                            │                        ├── T2.3 (资源池) ─── T2.5 (存档系统)
                                                                            │                        └── T2.4 (Timer)
                                                                            ├── T3.3 (HQ判断)
                                                                            ├── T3.4 (方向键)
                                                                            └── T4.x (双端适配)
                                                                                                      └── T5.x (数据优化)
```

**推荐执行批次**：
- **批次 A**（T1.1 → T1.2 → T1.3 → T1.4 → T1.5）：架构拆分，一次性完成
- **批次 B**（T3.2 + T3.3 + T3.4）：快速修复，与批次 A 交叉进行
- **批次 C**（T2.1 → T2.2 → T2.3 → T2.4 → T2.5）：架构改进，批次 A 完成后
- **批次 D**（T3.1 + T4.1~T4.4）：体验改进，批次 C 完成后
- **批次 E**（T5.1~T5.3）：性能优化，最后进行

---

## 五、文件结构规划

```
ghostMUD/
├── index.html                    # 入口 HTML（精简，仅引用）
├── css/
│   ├── ghost.css                 # 主样式（从 v2.html 拆出）
│   ├── themes/
│   │   └── night.css             # 夜间主题（枯色/墨色/血色）
│   └── responsive.css            # 双端响应式
├── js/
│   ├── core/
│   │   ├── tabmanager.js         # TabManager 基类（参考 core.js）
│   │   ├── timer.js              # 调度器（参考 game.js Timer）
│   │   ├── respool.js            # 资源池（参考 resources.js）
│   │   └── storage.js            # 存档系统（参考 IDataStorageAware）
│   ├── game.js                   # Game 主类（从 v2.html 拆出）
│   ├── ui/
│   │   ├── panels.js             # 面板渲染（人物/包裹/武学/任务/境况）
│   │   ├── modals.js             # 模态框（NPC/战斗/事件）
│   │   └── map.js                # 地图渲染
│   └── data/
│       ├── loader.js             # 数据加载器
│       └── namespace.js          # window.GHOST 命名空间
├── data/                         # 数据文件（从 work/ 迁移）
│   ├── rooms_city.js
│   ├── rooms_wild.js
│   ├── rooms_dungeon.js
│   ├── enemies_items_realms.js
│   ├── atmosphere.js
│   ├── skills_1.js
│   ├── skills_2.js
│   ├── npc_encounters.js         # 按区域拆分（原 410KB）
│   └── factions.js
├── docs/                         # 设计文档（保持不变）
│   ├── worldview.md
│   ├── cultivation_system.md
│   ├── bestiary_design.md
│   ├── terminology_map.md
│   ├── style_anchor.md
│   ├── shared_constraint_v3.md
│   ├── faction_rebrand.md
│   ├── known_issues.md
│   └── ...
└── work/                         # 旧工具脚本（归档保留）
```

---

## 六、验收标准

### 6.1 架构拆分验收
- [ ] `index.html` < 5KB，仅含 `<link>` 和 `<script>` 引用
- [ ] CSS 全部外链，HTML 中无 `<style>` 块
- [ ] JS 全部外链，HTML 中无 `<script>` 内联逻辑
- [ ] 全局变量减少 80%+（通过 `window.GHOST` 命名空间收拢）
- [ ] 首屏加载不阻塞（数据懒加载）

### 6.2 猫国建设者模式验收
- [ ] Tab 5 个面板均通过 TabManager 统一管理
- [ ] 效果计算走 effectsCachedExisting 缓存
- [ ] 资源（气血/真元/道心/灵石/修为）通过 resPool 管理
- [ ] 挂机逻辑通过 Timer 调度，非裸 setInterval
- [ ] 刷新页面后状态可恢复（存档系统）

### 6.3 已知问题修复验收
- [ ] 道心衰减公式与 cultivation_system.md v1.1 匹配
- [ ] CSS 色板无赛博残留（暗紫/霓虹青）
- [ ] 方向键全链路一致（UI → explore → connections → LOCATIONS）
- [ ] `isAtFactionHQ` 使用新术语映射

### 6.4 双端适配验收
- [ ] 手机端（375px）：单栏布局，按钮可触控
- [ ] 平板端（768px）：单栏布局，间距加大
- [ ] 桌面端（1024px+）：双栏布局，左侧主面板+右侧日志/地图
- [ ] 键盘快捷键在桌面端可用

### 6.5 风格一致性验收
- [ ] 聊斋感 60%：日常场景中暗藏诡异
- [ ] 认知侵蚀 30%：道心降低时的文本异常
- [ ] 不可名状 10%：极罕见的"不对"事件
- [ ] 禁用词扫描通过（无赛博/科技残留）
- [ ] 房间描述符合 shared_constraint_v3.md 句式规范

---

## 七、风险与缓解

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 数据层迁移导致游戏不可用 | 🔴 高 | 数据文件保持原格式，只改加载方式；每步可运行测试 |
| CSS 拆分后样式丢失 | 🟡 中 | 先完整复制再拆分，逐个视觉对比 |
| 存档系统与现有状态不兼容 | 🟡 中 | 首版只存核心状态（realm/cultivation/daoxin/location），渐进扩展 |
| 双端布局冲突 | 🟢 低 | 移动优先策略，桌面端用 media query 增强 |
| NPC 遭遇数据拆分后丢失 | 🟡 中 | 拆分前后做 count 校验（当前 140 条 NPC + 12 帮派招募） |

---

## 八、变更日志

| 日期 | 变更 | 操作人 |
|------|------|--------|
| 2026-06-22 | 创建任务追踪与执行表 | 游戏设计师 |
| 2026-06-22 | P1 架构拆分全部完成（T1.1-T1.5），P2 猫国模式核心模块完成（T2.1/T2.3/T2.4/T2.5），Vite 项目初始化完成，开发服务器启动成功 | 游戏设计师 |
| 2026-06-22 | T3.0 修复 `src/ui/input.js` 语法错误：`_bindActionButtons()` 中 forEach 回调括号未闭合导致 Vite import analysis 失败，同时修复了重复事件绑定问题（每按钮绑定了两个 click listener） | AI |
| 2026-06-22 | T3.0b 修复 `vite.config.js`：移除无效的 `manualChunks` 对象配置（Vite 8/rolldown 不支持对象格式，且引用的 6 个 `src/data/*.js` 文件不存在）。`vite build` 验证通过（15 modules transformed, built in 76ms） | AI |

---

*本文档为活文档，每批次完成后更新状态。*
