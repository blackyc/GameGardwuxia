# PROJECT_STATUS.md

> 最后更新：2026-07-06 H4B
> 状态来源：代码验证 + 构建结果 + 运行时检查
> 不得从设计文档或历史声明复制"已完成"状态

## 1. 运行环境

| 项目 | 值 |
|---|---|
| Node | v24.18.0（本地 `.tools/node-v24.18.0-win-x64`） |
| npm | 11.16.0 |
| 构建工具 | Vite 5.4.21 |
| 构建结果 | 成功，41 模块，JS 143.11 KB (gzip 55.01 KB)，CSS 47.69 KB (gzip 11.05 KB) |
| 构建警告 | 0 条（HR-101 修复） |
| 启动命令 | `npm run dev` |
| 预览命令 | `npm run preview` |
| 测试命令 | `npm test`（72 项全通过） |

## 2. 仓库状态

| 项目 | 值 |
|---|---|
| Git | 已初始化，分支 `ghostmud`，远程 `origin/ghostmud` |
| `.gitignore` | 已配置：`node_modules/`、`.tools/`、`dist/`、`.cdp-profile*/`、`work/_*` 临时文件、`*.bak` |
| 基线 commit | `27a2d43` HR-000 + `068ab16` HR-101/102/103 + `f3610ab` H3 + `fedb32b` H4A + `84c6079` H4B |

## 3. 功能状态（按状态词典定义）

### 已验收
（无）

### 可达待验收
| 功能 | 事实依据 | 缺失项 |
|---|---|---|
| 基础启动 | Vite dev 启动、数据注册、Game 初始化、定时器启动 | 无人验证过完整旅程 |
| 五页 UI | 江湖/武学/行囊/舆图/人物可显示和切换 | 桌面双栏未实现；顶栏按钮无事件 |
| 移动 | 方向移动可更新 location | — |
| 搜索 | `searchArea` 可执行 | — |
| NPC 对话 | `speakToNpc` 可执行 | — |
| 经典回合制战斗 | `CombatFacade` 默认走旧战斗 | 新行功引擎不可达 |
| 存档 | 单槽 localStorage `ghostmud_save_v2` version 2，schema 校验+备份+损坏处理+导入导出 |

### 引擎已存在
| 功能 | 事实依据 | 不可达原因 |
|---|---|---|
| 身份系统 | 14 身份数据 + IntroScene UI | `Game.init()` 自动跳过 Intro，随机代选 |
| 行功战斗 | BattleEngine + HijackEngine + InterveneEngine 共 ~3057 行 | `state.chart=null`，路由查 `XINGGONG[faction]` 无宗门键 |
| 双修体系 | path/术语/道心基础存在 | `switchPath('ling')` 明确拒绝 |
| 装备 v3 | 8 武器/12 饰品/铭文数据在 `work/` | 未进入 manifest/public |
| 肉鸽 Build | 8 经脉/35 刻印/9 Build | 源码除 loader 外零消费 |
| 异常状态 | 7 状态逻辑在新引擎中 | 新战斗不可达 |
| 三层描述 | 分发函数存在 | `desc_vague=0`、`desc_percept=0`、三字段齐全=0 |

### 数据已存在
| 数据 | 数量 | 消费状态 |
|---|---|---|
| 房间 | 203（0 个裸 ID，全部遵守 ADR-0001） | 可加载 |
| NPC 遭遇 | 209 | 可加载 |
| 敌人 | 60 | 可加载 |
| 物品 | 120 | 可加载 |
| 任务 | 15 | 可加载 |
| 宗门 | 11（设计称 12，差 1 = 肉慈斋注册遗漏，ADR-0005 记录） | 可加载 |
| 技能 | 70 | 可加载 |
| 刻印 | 35 | 零消费 |
| Build | 9 | 零消费 |
| 经脉 | 8 | 零消费 |

## 4. 已知 P0/P1 问题

| ID | 问题 | 状态 | 证据 |
|---|---|---|---|
| P0-感知双触发 | `.perc-path` 同时被通用处理器和感知面板消费 | 已修复 | `input.js` 添加 `closest('#perception-panel')` 拦截 |
| P0-武学页报错 | 扁平技能数组未兼容 | 已修复 | `renderer.js` 添加 `.some(Array.isArray)` 兼容 |
| P0-舆图报错 | 4 条 `东郊` 连接无坐标 | **已修复** | H3: 裸 ID 迁移后连接引用全部正常；`renderer.js` 容错保留 |
| P1-教程移动 | `ch1_done` 返回 true 吞移动 | 已修复 | `movement_service.js` 修正 |
| P1-时辰映射 | 寅时(gameTime=2)归入夜，ADR 规定归清晨 | **已修复** | HR-102: `game.js` 寅时从 `desc_night` 移至 `desc_morning` |
| P1-diagnose 404 | `/diagnose.js` 非 module，dist 不含 | **已修复** | HR-101: 从 `index.html` 移除引用，`diagnose.js` 移至 `work/` |

### H3 验收门禁

| 门禁 | 状态 | 证据 |
|---|---|---|
| 数据清单只有一个事实源 | ✅ | `manifest.js` 为唯一权威，`generate-script-tags.cjs` 校验同步 |
| 所有连接目标存在 | ✅ | 测试验证零断裂连接 |
| 裸 ID 数量 = 0 | ✅ | 测试验证 67→0，房间总数 203 不变 |
| 旧 location 存档可迁移 | ✅ | `ROOM_ID_MIGRATION` 67 条映射，`game.js` load 时自动迁移 |
| 三层描述覆盖率报告可生成 | ✅ | `work/h3_desc_coverage.cjs` 命令可执行 |
| 宗门差异决策记录 | ✅ | ADR-0005 记录肉慈斋注册遗漏 |

### 健康度

| 里程碑 | 目标 | 当前 | 状态 |
|---|---:|---:|---|
| H0+H1 | 52+ | 52 | ✅ |
| H2 | 62+ | 62 | ✅ |
| H3 | 72+ | 72 | ✅ |

1. 本文件 + `health_recovery_execution_guide.md`（当前执行指导）
2. `docs/adr/0001-0004-t7-3-decisions.md`（Accepted ADR）
3. `docs/CONTEXT.md`（决策词典）
4. 各领域专项设计文档
5. `docs/refactor_task_tracker.md`（历史任务来源，不作为完成事实源）
6. `overview.md`、旧计划、session 记录（历史材料）
7. 注释、文件名、未验证声明

## 6. 健康度

| 里程碑 | 目标 | 当前 |
|---|---:|---:|
| 基线 | 43 | 43 |
| H0+H1 | 52+ | 52 |
| H2 | 62+ | 62 |
| H3+H4 | 72+ | 75 (H3=72, H4B=75) |
| H5 | 80+ | — |
| H6+H7 | 85+ | — |

### H4B 审计修复明细

| 审计项 | 级别 | 修复内容 | commit |
|---|---|---|---|
| 损坏主档覆盖备份 | P0 | `storage.load()` 损坏 JSON 时先尝试 `_tryLoadBackup()` | `84c6079` |
| 存档触发不完整 | P1-1 | `markDirty()`/`flushSave()` + 10个关键方法 + `beforeunload` + 30s 定时 | `84c6079` |
| 54处重复连接键 | P1-2 | `h3_dup_conn_fix.cjs` 修复 + 测试新增源码级检测 | `84c6079` |
| questProgress迁移失效 | P1-3 | `game.js` load 路径检查 `questStages` | `84c6079` |
| 测试退出码不生效 | P1-4 | 3个测试文件加 `process.exit(failed>0?1:0)` | `84c6079` |
| importSave无校验 | P1-5 | 完整 payload 结构校验 + 版本检查 + 迁移 + schema | `84c6079` |
| manifest双源不检查顺序 | P2-1 | `generate-script-tags.cjs` 顺序检查 + 非零退出 | `84c6079` |
| 未知版本静默兼容 | P2-2 | 未来版本拒绝加载，尝试备份恢复 | `84c6079` |
| index.html顺序不同步 | P2-3 | `--fix` 同步为 manifest 顺序 | `84c6079` |
