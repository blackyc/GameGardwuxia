# 诡仙录 · 文字 MUD（ghostMUD v2.0.0）

> 「真假难辩 · 本心如烛」
>
> 一款以聊斋志异为表、不可名状为里的文字 MUD 修仙游戏。表层是凡人世界的炊烟集市，夹层是修炼者才能看见的诡影，深层是「祂」所在的终焉频率。

---

## 一、技术栈

| 项目 | 说明 |
|------|------|
| 构建工具 | **Vite 5.x** |
| 语言 | 原生 JavaScript（ES Module） |
| 模块系统 | `index.html` 通过 `<script>` 加载全局数据 + ES6 模块入口 `src/main.js` |
| 持久化 | 浏览器 `localStorage`（存档） |
| 依赖 | 仅 `vite` 一个 devDependency，无运行时三方依赖 |

---

## 二、环境要求

- **Node.js** ≥ 18（推荐 20 LTS 及以上）
- **npm** ≥ 9（或 pnpm / yarn 均可）
- 现代浏览器（Chrome / Edge / Firefox 最新版，需支持 ES Module）

---

## 三、快速启动

### 1. 安装依赖

```bash
cd C:\Users\tabe\Desktop\GameFi\GameCard\GameGard\ghostMUD
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后 Vite 会自动打开浏览器。

### 3. 访问地址（端口）

| 模式 | 命令 | 默认端口 | 访问地址 |
|------|------|---------|---------|
| 开发模式 | `npm run dev` | **5173** | http://localhost:5173 |
| 预览构建产物 | `npm run preview` | **4173** | http://localhost:4173 |
| 生产构建 | `npm run build` | — | 产物输出至 `dist/` |

> ⚠️ 端口配置见 `vite.config.js` 的 `server.port` 字段。若 5173 被占用，Vite 会自动顺延到 5174 / 5175，请以终端实际输出为准。

### 4. 修改端口（可选）

编辑 `vite.config.js`：

```js
server: {
  port: 5173,   // ← 改成你想要的端口
  open: true
}
```

---

## 四、目录结构

```
ghostMUD/
├── index.html                # 应用入口（加载全局数据脚本 + ES 模块入口）
├── vite.config.js            # Vite 配置（端口、分包策略）
├── package.json
├── diagnose.js               # 诊断脚本：检查数据加载与核心模块状态
│
├── src/                      # 重构后的模块化源码
│   ├── main.js               # ES 模块入口 → 实例化 Game
│   ├── game.js               # 主游戏类（状态、循环、战斗、任务等）
│   ├── core/                 # 核心引擎
│   │   ├── namespace.js
│   │   ├── respool.js        # 资源池
│   │   ├── storage.js        # 存档读写（localStorage）
│   │   ├── tabmanager.js     # 标签页管理
│   │   └── timer.js          # 游戏循环定时器
│   ├── data/                 # 数据加载层
│   │   └── data_loader.js    # 统一收集/桥接全局数据
│   ├── ui/                   # UI 层
│   │   ├── input.js          # 输入/命令处理
│   │   └── renderer.js       # 渲染层
│   └── styles/               # 样式
│       ├── main.css
│       ├── responsive.css
│       └── themes/night.css  # 夜间主题
│
├── public/data/             # 运行时数据文件（由 index.html <script> 加载）
│   ├── rebuild_*.js          # 重建后的数据文件（境界/敌人/房间/技能等）
│   ├── integration_v2.js     # 数据适配层（统一数据契约）
│   ├── combat_skills_v3.js   # 行功战斗系统 v3.0 技能数据
│   └── corruption_system.js  # 灵修畸变系统
│
├── work/                     # 临时工具脚本（不参与运行时加载）
│   ├── ghost_*.js/json       # 原始世界观/系统设计数据
│   ├── scan_*.js             # 数据扫描/验证脚本
│   ├── test_*.js             # 集成与回归测试
│   └── transform.js          # 数据转换工具
│
├── docs/                     # 设计文档
│   ├── worldview.md          # 核心世界观
│   ├── terminology_map.md    # 术语映射字典
│   ├── cultivation_system.md # 修炼系统设计
│   ├── faction_rebrand.md    # 宗派重塑
│   ├── bestiary_design.md    # 妖物图鉴
│   ├── known_issues.md       # 已知问题日志
│   ├── migration_master_plan.md
│   └── ...
│
├── ghost_mud_v2.html         # 旧版单体 HTML（迁移来源，已弃用）
├── daogui_mud.html           # 参考原型
├── rooms_ghost_*.js          # 房间数据（旧版，保留作参考）
└── 迁移办法.txt               # 迁移说明
```

---

## 五、数据加载架构

本项目采用**双层加载**机制，理解它对调试至关重要：

### 第 1 层：全局数据脚本（`index.html` 内）

通过普通 `<script>` 标签顺序加载 `public/data/*.js`，这些文件用 `const` / `var` 声明全局变量：

```html
<script src="/data/rebuild_enemies_items_realms.js"></script>
<script src="/data/rebuild_rooms_city.js"></script>
<!-- ... -->
```

### 第 2 层：桥接层（`index.html` 内联脚本）

由于 `const` 声明的变量不会自动挂到 `window`，需手动桥接，供 ES6 模块读取：

```js
['REALMS', 'ENEMIES', 'ITEMS', 'CITY_ROOMS', /* ... */].forEach(name => {
  if (eval('typeof ' + name) !== 'undefined') window[name] = eval(name);
});
```

### 第 3 层：ES 模块入口（`src/main.js`）

`main.js` 等待 DOM 就绪后实例化 `Game`，`Game` 通过 `data_loader.js` 的 `collectData()` 把散落的 `window.*` 收拢成统一数据对象。

> 排查数据加载问题时，打开浏览器控制台查看 `diagnose.js` 输出的诊断日志（`=== ghostMUD Diagnostic ===`），可快速定位哪个全局变量缺失。

---

## 六、游戏玩法

### 核心循环

挂机修炼（每 3 秒获取修为）→ 修为满后突破境界 → 探索地图触发事件 → 战斗 / NPC 遭遇 / 奇遇 → 积累资源、拜入宗派、习得武学。

### 行动按钮（UI）

| 按钮 | 动作 | 说明 |
|------|------|------|
| ⬆⬇➡⬅🔼🔽 北南东西上下 | `explore` | 朝指定方向移动/探索 |
| 🧘 打坐 | `meditate` | 打坐修炼，加速修为 |
| 💤 休憩 | `rest` | 休息恢复气血 |
| 🔍 搜索 | `searchArea` | 搜寻当前地点物品 |
| 💬 交谈 | `talk` | 触发 NPC 遭遇 |
| 👂 打听 | `askAround` | 打听情报 |
| 💪 练功 | `pushup` | 锻炼属性 |
| 👀 窥探 | `peek` | 窥探周遭 |
| 📖 练武 | `practiceMenu` | 修炼已学武学 |
| 🗺 地图 | `toggleMap` | 展开/收起天下舆图 |
| 🏯 武学 | `switchTab:wuxue` | 切到武学面板 |
| 📋 境况 | `switchTab:status` | 切到状态面板 |
| 🙇 拜师 | `askTeacher` | 拜入宗派 |

### 标签页

- **人物**：境界、修为、道心、寿元、灵石等总览
- **包裹**：背包物品
- **武学**：宗派徽记、已习武学
- **任务**：进行中 / 已完成任务
- **境况**：详细战斗属性与当前位置

### 战斗指令

| 按钮 | 动作 |
|------|------|
| ⚔ 攻击 | `combat:attack` |
| 🔥 绝招 | `combat:skill`（弹出绝招列表） |
| 🛡 守势 | `combat:defend` |
| 🏃 遁走 | `combat:flee` |

### 命令行输入

页面底部有命令输入框，支持键入命令（由 `src/ui/input.js` 解析）。

---

## 七、世界观速览

- **三层世界**：表层（凡人市井）→ 夹层（修炼者窥见诡影）→ 深层（「祂」所在）
- **道心**：替代传统「理智值」，修炼越深越易被「祂」发现
- **境界**：练气初/中/后期 → ……（见 `docs/cultivation_system.md`）
- **宗派**：忘尘宗、赤霞峰、锈剑冢、丝狱、焚身道、逍遥驿、药王谷、血禅寺、镜阁、归墟、青囊庐等
- **术语**：详见 `docs/terminology_map.md`（科技/赛博词为禁用词）

> 完整世界观见 [`docs/worldview.md`](docs/worldview.md)。

---

## 八、调试与诊断

### 诊断脚本

`diagnose.js` 会在页面加载 1 秒后向控制台输出核心数据状态：

```
=== ghostMUD Diagnostic ===
window.LOCATIONS: object 166
window.REALMS: object 8
window.ENEMIES: object 90
...
```

若某项为 `undefined` 或数量为 0，说明对应数据文件未正确加载，检查 `index.html` 的 `<script>` 顺序与 `work/rebuild_*.js` 是否存在。

### 常见问题

| 现象 | 排查方向 |
|------|---------|
| 页面空白 / 日志区显示「⚠ 数据加载失败」 | 检查 `work/rebuild_*.js` 是否齐全，浏览器 Network 看是否有 404 |
| 方向键无反应 | 数据 `connections` 方向键中英文不匹配（见 `docs/known_issues.md` #0005） |
| NPC 交谈显示 `undefined` | 适配层数据契约不匹配（见 `docs/known_issues.md` #0006） |
| 端口被占用 | 修改 `vite.config.js` 的 `server.port` |
| 存档丢失 | 清浏览器 localStorage 会清除存档（`src/core/storage.js`） |

---

## 九、构建与部署

```bash
# 生产构建
npm run build

# 本地预览构建产物（端口 4173）
npm run preview
```

构建产物输出至 `dist/`。数据文件（`work/rebuild_*.js`）通过 `<script>` 标签加载，不会被 Vite 打包为 ES module，这是预期行为——它们在运行时会挂载全局变量供 `data_loader.js` 收集。

> `dist/` 为纯静态站点，可直接部署到任意静态服务器（Nginx / Cloudflare Pages / Vercel / GitHub Pages 等）。

---

## 十、相关文档

| 文档 | 内容 |
|------|------|
| [docs/worldview.md](docs/worldview.md) | 核心世界观（三层世界、祂、宗派） |
| [docs/terminology_map.md](docs/terminology_map.md) | 术语映射字典与禁用词库 |
| [docs/cultivation_system.md](docs/cultivation_system.md) | 修炼系统设计 |
| [docs/faction_rebrand.md](docs/faction_rebrand.md) | 宗派重塑说明 |
| [docs/bestiary_design.md](docs/bestiary_design.md) | 妖物图鉴设计 |
| [docs/known_issues.md](docs/known_issues.md) | 已知问题与修复记录 |
| [docs/migration_master_plan.md](docs/migration_master_plan.md) | 迁移总规划 |
| [docs/refactor_task_tracker.md](docs/refactor_task_tracker.md) | 重构任务追踪 |

---

## 十一、许可证

ISC（见 `package.json`）。

---

*ghostMUD v2.0.0 · 2026-06-22*
