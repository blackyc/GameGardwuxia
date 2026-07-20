# 江湖页 V2 终稿接入 CHANGELOG

- 日期：2026-01-07
- 工作区：`MUD test/MUD game`（本文件所在仓库目录，非 ghostMUD）
- 设计来源：`aidoc/UI_REDESIGN_DEBATE_V1.md` 定论 + `public/design/jianghu-v3-mockup.html`（V3.2 终稿样张）
- 测试结果：全套 205 通过 / 15 失败，与改动前基线完全一致，无新增失败

---

## 1. 变更总览

将 V3.2 终稿样张的三大视觉系统接入真实游戏代码：

| 样张模块 | 落地位置 | 说明 |
| --- | --- | --- |
| vista 时辰页头（十二时辰天色 + 视差远山 + 深木匾额） | `index.html` 区域 1 + `src/styles/vista.css` + `src/ui/vista.js` | 由游戏内 `state.gameTime`（0-11）驱动，1.6s 色彩过渡 |
| 行旅图芥子园化（单 SVG、卡角记号、「在」字朱砂签、走墨） | `src/ui/renderer.js` `renderExitBar()` | 复用既有 `resolveRoutePoints` 布点，% 坐标 ×6.4/×2 映射到 640×200 画布 |
| NPC 名帖卷轴化 + 朱砂流苏拖拽 | `renderer.js` NPC chip + `src/ui/tassel.js` + `jianghu.css` V2 层 | 流苏可拖拽，松手阻尼单摆；不触发 NPC 选中 |

配套：三区布局从绝对定位改为 flex 列（vista 150px / 主区内滚 / 日志吃余量）、白垩底、赭石文武线 room-card、深冷域对话缎带、bottom-nav 联珠纹、feTurbulence 纸纹。

**契约安全**：`ui-contract.test.cjs` 仍 7 过 5 败，失败项与基线完全相同（业主确认的旧契约移除项：canSpar、`let dossier`、scene feed 路由、`察看` 文案、`#scene-feed`）。三个 route-sketch 契约字符串（`resolveRoutePoints`、`resolveRoutePoints([...visibleRoutes, ...sensedRoutes])`、`routePoints.get(route.id) || routePoint(route)`）原样保留。`jianghu.css` 只追加不删改。

---

## 2. 逐文件变更清单

### `index.html`（手术修改，混合行尾保持）
- 头部新增 `<link rel="stylesheet" href="/src/styles/vista.css">`。
- body 开头新增 SVG 滤镜 defs：`#rough` / `#rough2`（行旅图毛边框）。
- 区域 1 `.location-banner` 整块替换为 `<header class="location-banner" id="vista">`：
  - 图层：`.vista-sky`、`#vista-stars`（含 `#vista-stars-svg`）、`#vista-clouds`（两朵如意云）、`#vista-far`、`#vista-sun`（`#vista-sun-disc`）、`#vista-birds`（两只）、`#vista-near`、`#vista-ff`；
  - `.location-plaque` 匾额保留 `id="location-region"` / `id="location-name"`（JS 填名不动）；
  - 保留 `id="location-weather"`、`id="location-guide-status"`；新增 `.vtime`（`#vista-time-label` / `#vista-time-name`）。
- **风险点**：`class="location-banner"` 必须原样保留（ui-contract 硬性 token），vista 样式一律经 `#vista` id 锚定，切勿再把 `vista` 加回 class。

### `src/styles/vista.css`（新增，142 行）
- `--dv-` 前缀矿物色变量（避让 `app_v3.css` 的 `--gold` 等）；`@property` 注册 `--skyT/--skyB/--cFar/--cMid/--cNear/--cCloud/--cSun` 使颜色可过渡。
- vista 150px 层样式、真素材 mask 裁山（`/ui/vista-far.png`、`/ui/vista-near.png`）、星辰/流星/萤火/飞鸟动画、深木匾额（#2A241E 底 + 金楷 + bottom:12px 居中）、竖排时辰签、reduced-motion 关动画。
- **风险点**：`@property` 需 Chromium 系；不支持的浏览器退化为瞬切颜色，无功能损失。

### `src/ui/vista.js`（新增，ESM）
- `SHICHEN` 十二时辰色板（从样张原样抄录：天色/山色/云/日/星/萤/鸟 14 字段）。
- `setVistaTime(i)`：序号或中文名均可，越界钳制；写 7 个色变量、日位/透明度、星萤鸟透明度、vtime 文本与昼夜色。
- `initVista(game)`：生成 26 星（SVG circle）+ 7 萤火 + 流星；鼠标视差（lerp 0.06，reduced-motion 降级不挂 rAF）；60s 兜底刷时辰。
- **风险点**：星辰用 `Math.random()` 布点，每次加载位置不同（与样张一致）；视差 rAF 循环常驻，低端机待实测。

### `src/ui/tassel.js`（新增，ESM）
- `initTassels()`：document 级 pointerdown 委托抓 `.npc-tassel`（stopPropagation + preventDefault，capture 阶段吞 click 防触发 `focusNpc`）；atan2 摆角 ±1.1rad 钳制；松手阻尼单摆（`-0.0022·sinθ`、`×0.96`、|θ|<0.5° 停）；`window.__tasselBound` 幂等。
- **风险点**：NPC chip 重渲染后流苏 DOM 重建，拖拽中若 chip 重绘会中断当次摆动（`isConnected` 检查安全退出，不报错）。

### `src/ui/renderer.js`（手术修改 4 处）
1. 顶部 `import { setVistaTime } from './vista.js';`
2. `updateTimeDisplay()` 开头加 `setVistaTime(Number(this.game.state?.gameTime) || 0);`（在 `time-display` 早期 return 之前，确保无该元素也刷 vista）。
3. NPC chip HTML 追加 `.npc-rod--l/r` 木轴头与 `.npc-tassel-anchor > .npc-tassel(i,b,u)`（`aria-hidden`）。
4. `renderExitBar()` 重写为单 SVG 行旅图：640×200 viewBox、当前节点居中 (320,100)、双层叠影毛边框（filter #rough/#rough2）、楷书 16px 房名、卡角记号映射（山门|牌坊→四柱顶、阶→三横、松→斜松、门城关楼阁→城楼、默认墨点）、「在」字朱砂签探出当前节点右缘、方向字在线中段（`game.dirName`）、横向偏外通路连线旁足迹、首个可点通路 `rs-line--inkrun` 走墨动画、谜面未揭（`!state.explored.includes(route.target)`）淡墨虚框 + 名号 opacity .45、locked 淡框 + 「封」小字；可点节点 `<g data-action="explore" data-dir="...">`（沿用 input.js 既有委托）；`routeStatus` 逻辑原样保留。
- **风险点**：`filter="url(#rough)"` 依赖 index.html 的 defs，二者须成对迁移；jsdom 测试不渲染滤镜，无影响。

### `src/styles/jianghu.css`（只追加，+约 270 行 V2 覆盖层）
- §0 `#scene-bg` 去 jpg 改白垩 `#F2E9D2`；§1 三区改 flex 列（`.page.active{display:flex!important}`、main-zone relative/内滚、recent-log flex:1 + 笺纸竖线 + `#log-area` 内滚）；§2 room-card 赭石文武线 + 卷草角 data-uri + 「此地」石绿挂牌 rotate(-2deg)；§3 NPC chip 卷轴化（暖纸 #F6EFDD、20px 楷名、木轴头、流苏 i/b/u 件）；§4 dialogue-ribbon 深冷域（#26505F→#1B3A48 + 金线 + 米白字）；§5 bottom-nav 联珠纹 + 赭石顶边 + active 朱砂；§6 noise-overlay 换 feTurbulence 纸纹 opacity .5；§7 行旅图 rs-* 全部样式 + `rs-inkrun` keyframes；§8 桌面 ≥768px 覆盖旧 `display:block!important` 回 flex 列；§9 reduced-motion 走墨直接成稿。
- **风险点**：V2 层全部依赖"后置同/高优先级覆盖"，迁移时必须整文件拷贝，不可摘段重排；§8 的 flex!important 与旧桌面双栏规则互斥，若未来要恢复桌面双栏需删 §8。

### `src/main.js`（2 处小改）
- import `initVista` / `initTassels`；`boot()` 内 `new Game()` 后调用 `initVista(window.game)`、`initTassels()`。

### `public/design/jianghu-v3-mockup.html`
- 此前已完成：匾额 bottom:12px 靠下 + V3.2 说明条（本次接入的基准样张）。

### `temp/smoke-vista-tassel.mjs`（新增，临时验证）
- 最小 DOM 桩冒烟：SHICHEN 字段齐、setVistaTime 全时辰/中文名/越界、星萤流星生成、tassel 幂等，11 项全过。非长期测试，可删。

---

## 3. 新增资产清单

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `public/ui/vista-far.png` | 1440×277 | 远山剪影（mask 填色 + multiply 叠笔触） |
| `public/ui/vista-near.png` | 1080×382 | 近山剪影（无斜松版，左对齐底对齐） |

---

## 4. 并入 ghostMUD 迁移指引

### 4.0 先处理 ghostMUD 既有未提交改动（与本变更无关）
仓库根 `git status` 显示 `ghostMUD/public/data/wenjianfeng_tutorial_ch1.js` 有未提交修改（疑似误删「声音又快起来」文案；HEAD 版本是完整版）。本 UI 变更不涉及该文件。建议先 `git -C <repo根> diff ghostMUD/public/data/wenjianfeng_tutorial_ch1.js` 确认，若系误删则 `git checkout -- <该路径>` 恢复，或 `git stash` 暂存，避免被一并提交。

### 4.1 拷贝清单（MUD test/MUD game → ghostMUD，路径一一对应）
```
index.html
src/main.js
src/ui/renderer.js
src/ui/vista.js            （新）
src/ui/tassel.js           （新）
src/styles/vista.css       （新）
src/styles/jianghu.css     （整文件，含 V2 追加层）
public/ui/vista-far.png    （新）
public/ui/vista-near.png   （新）
aidoc/UI_V2_JIANGHU_CHANGELOG.md
public/design/jianghu-v3-mockup.html  （若 ghostMUD 尚无 V3.2 版）
```
注意：ghostMUD 的 `index.html` / `renderer.js` / `jianghu.css` 若在本工作区改动之后又另有演进，需人工合并而非直接覆盖——本变更在 ghostMUD 当前 HEAD 基础上做diff时，以本 CHANGELOG §2 的逐文件说明为准。

### 4.2 建议 git 顺序
```bash
git checkout -b feat/jianghu-ui-v2
# 恢复或 stash wenjianfeng_tutorial_ch1.js 的无关改动
# 按 4.1 拷贝
node temp/run-all.cjs        # 期望 205 过 / 15 败（含 ui-contract 旧契约 5 项）
git add -A
git commit -m "feat(ui): 江湖页 V2 终稿——vista 时辰页头+芥子园行旅图+卷轴名帖"
```

### 4.3 迁移后验证清单
- [ ] `node temp/run-all.cjs` 与基线一致（无新增失败）
- [ ] `npm run dev` 过 5 页（江湖/武学/行囊/舆图/人物）无 JS 报错
- [ ] 江湖页目视：vista 天色随时辰变、匾额居中靠下、行旅图可点击移动、流苏可拖拽
- [ ] 375px 与 540px 宽各目视一次；桌面宽屏确认 flex 列生效
- [ ] 夜晚时辰（子/丑/亥）星萤可见、飞鸟隐；白昼反之

---

## 5. 回滚方法

- 整体回退：`git checkout -- index.html src/main.js src/ui/renderer.js src/styles/jianghu.css`，删除 `src/ui/vista.js`、`src/ui/tassel.js`、`src/styles/vista.css`、`public/ui/vista-*.png`。
- 快速瘫痪 vista（保留代码）：仅删 `index.html` 中 vista.css 的 `<link>`，并把 `<header ... id="vista">` 块还原为原 `.location-banner` 结构即可；`vista.js`/`tassel.js` 找不到 `#vista`/`.npc-tassel` 会安全空转。

---

## 6. 已知遗留

1. ui-contract 5 项旧契约（业主确认移除）仍在失败名单，待业主更新测试或补回契约描述。
2. 桌面宽屏下 vista 为 150px 固定高通栏，超宽屏山图延展未做专门视觉验证。
3. 流苏拖拽在低端机上的性能未实测（rAF 单循环 + 单变换，理论开销极小）。
4. 未做真实浏览器运行时目视验证（本工作区未起 dev server）；已用 vite build（57 模块打包通过）+ 最小 DOM 桩冒烟（11 项全过）替代，迁移后按 §4.3 补目视。
5. 流苏仅在 NPC chip 存在时挂载；chip 重绘会重置流苏静止位（符合预期）。

---

## 7. 运行态纠偏与浏览器验收（2026-07-20）

### 7.1 根因

1. V2 样式直接追加在旧 `jianghu.css` 后，但部分选择器权重仍低于旧组件规则，导致灰色房间底、尺寸和边框继续由旧层控制。
2. `#bottom-nav` 在 V2 末层被误设为 `position: relative`，导航落到视口之外；固定命令输入层因此成为页面底部可见元素。
3. `rough` / `rough2` 的 `feDisplacementMap` 未指定颜色通道，噪声 Alpha 恒定，视觉上几乎没有位移。
4. NPC 只补了木轴与流苏 DOM，没有完成运行态宽度、粗糙边框、状态印章和 hover 墨色填充契约。

### 7.2 修复边界

- 新增 `src/styles/jianghu_v3_runtime.css`，作为最后加载的隔离运行态皮肤；不再继续向旧样式文件尾部堆覆盖。
- `index.html` 修复 SVG 位移通道，并将底部 emoji 导航替换为五枚内联手绘 SVG 图标和朱砂笔触下划线。
- `renderer.js` 的 NPC 圆印只承载真实运行态：随行角色显示“随”，锁定角色显示“?”；`key/story` 仅是内容层级，不得生成虚构人物状态。指引日志生成“批”字签。

### 7.3 已验证尺寸

- 540×844：vista `138px`，木匾 `180×54px`，江湖主区 `430px`，日志 `187px`，底部导航固定 `62px`，页面无整体滚动。
- 390×844：vista `130px`，木匾 `170×50px`，NPC 名帖按三列紧凑排布，日志 `195px`，页面无整体滚动。
- `rough` 与 `rough2` 均使用 `R/G` 位移通道；路线大框与小记号滤镜分配正确。
- NPC 名帖 hover 已验证由底向上完成暖金填色；流苏拖拽后按阻尼逻辑回到静止位。
- `npm run build` 通过（58 modules）。

### 7.5 NPC 名帖与行旅图纠偏（2026-07-20）

- NPC 名帖改为每行三张；按行号交替放置流苏，第一行在右、第二行在左，后续循环。
- 木轴和流苏使用高于通用直属子节点规则的选择器，强制脱离 flex 文本流；避免轴体显示成短横或遮住姓名。
- 木轴采用试验稿 `6×42px` 比例；流苏采用绳 `6px`、珠 `8px`、穗 `12px` 的短比例，并保持可拖拽。
- 时辰题字在 vista 右缘纵向居中，不再贴顶。
- 行旅图节点由固定种子的整数坐标折线路径绘制，移除节点框和角记号的噪声位移滤镜；重绘不会闪动，边缘表现为清晰的像素偏差。

### 7.6 房间匾额材质契约（2026-07-20）

- 默认 `wood` 改为深漆木底、暗金字、内侧细金线；低对比回纹点阵只在匾额边缘显现，中央文字区保持干净。
- 新增 `src/ui/plaque_material.js`，集中维护材质语义、状态和解析回退规则。房间数据通过 `plaqueMaterial` 声明材质。
- `cyan-gold` 预留给官署、主殿、古制机构与灵修遗迹；`cinnabar` 预留给禁地、战斗场和明确危险房间。二者是地点语义，不是稀有度皮肤。
- 未声明或填写未知材质时强制回落到 `wood`；少量不宜修改源数据的旧房间可登记在 `ROOM_PLAQUE_MATERIAL_OVERRIDES`。
## NPC 人物镜窗与动作语义（V2 补充）

- 人物交互卡保留正圆头像。圆形不是社交头像，而是“铜镜／月洞窗”视觉母题，用来打破页面大量矩形结构。
- 头像底层统一为宣纸／旧绢衬底；人物图仅在外缘水墨羽化，面部与主体保持清晰。
- 镜窗使用双层不规则墨线和西北／东南两段局部窗花，禁止整圈堆满装饰。
- 关系状态来自 `describeNpcRelation` 或 NPC 真实 `relationLabel`，显示为头像右下的暗朱空心小印；禁止生成数据中不存在的状态字。
- 动作色是语义而不是装饰：`primary=交谈`、`secondary=观察`、`relational=送礼`、`danger=切磋`。石青只表达当前态，灰墨表达禁用态。
- 切磋默认仅使用朱砂边记；只有悬停、确认邀战或战斗结果阶段才升格为实朱红，避免常态警报感。
