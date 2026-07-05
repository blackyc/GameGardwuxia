# 变更记录：江湖页 UI v4 — 图片背景三区布局

> **日期**：2026-07-06  
> **范围**：CSS + HTML 结构 + 渲染器  
> **触发**：基于手机版投放的 UI 背景图重新布局江湖页

---

## 一、变更概述

将江湖页从旧的"灰蓝半透卡 + 暗色底"布局切换为**图片背景三区分层布局**。背景图 `jianghu-mobile-bg.jpg` 部署在 `public/ui/`，通过 `#scene-bg` 层铺满全屏，页面内容按背景图的三段式结构（远山带 / 留白叙事区 / 近景底栏）进行绝对定位分层。

---

## 二、变更文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `public/ui/jianghu-mobile-bg.jpg` | 新增 | 手机版江湖页背景图（90.9KB），水墨山水风，含红色标记 |
| `src/styles/jianghu.css` | **新增** | 江湖页 v4 核心样式，三区绝对定位 + 桌面双栏适配 |
| `index.html` | 修改 | 引入 `jianghu.css`；江湖页 HTML 重构为三区语义结构 |
| `src/ui/renderer.js` | 修改 | `updateLocation()` NPC 渲染改用 `room-npc-card`；新增 `scene-feed` 场景对话流支持 |
| `src/ui/input.js` | 修改 | 感知面板事件委托适配新结构 |
| `src/ui/page_manager.js` | 新增 | v3.0 页面/场景/祥云帷幕管理器 |
| `src/movement_service.js` | 新增 | 移动系统服务层（从 game.js 拆出） |

---

## 三、三区布局结构

```
┌────────────────────────────┐
│  区域 1 · 房间名牌          │  top: 18px, height: ~80px
│  （location-banner）        │  半透宣纸底 + 双线墨边
├────────────────────────────┤
│                            │
│  区域 2 · 叙事/交互主区     │  top: 12.5dvh, height: 60.5dvh
│  （jianghu-main-zone）      │  可滚动，含房间描述、NPC卡、
│  · room-card（场景描述）    │  菱形操作徽章、感知面板
│  · scene-feed（对话流）     │
│  · diamond-row（操作按钮）  │
│  · perception-panel         │
│                            │
├────────────────────────────┤
│  区域 3 · MUD 控制台        │  top: 73dvh, bottom: 0
│  （recent-log）             │  最近日志，最多显示 5 条
└────────────────────────────┘
```

### 关键 CSS 决策

- **绝对定位三区**：区域 1/2/3 用 `position: absolute` + `dvh` 单位定位，适配移动端浏览器地址栏伸缩
- **背景图**：`#scene-bg` 设 `background-image: url('/ui/jianghu-mobile-bg.jpg')` + `background-size: 100% 100%`，铺满全屏
- **顶栏隐藏**：`#top-bar { display: none !important; }`，不占用主画布空间
- **桌面双栏**：≥768px 时江湖页占左 66.6%，功能页占右 33.3%，背景图仅手机端显示
- **输入栏**：手机端隐藏 `#input-wrap`，桌面端显示在左栏底部

---

## 四、HTML 结构变更

### 旧结构（内联 div 堆叠）
```html
<div class="room-card">...</div>
<div class="diamond-row">...</div>
<div class="recent-log">...</div>
```

### 新结构（语义化三区）
```html
<section class="page active" data-page="jianghu">
  <header class="location-banner">...</header>
  <main class="jianghu-main-zone">
    <div class="room-card">...</div>
    <div class="scene-feed" id="scene-feed"></div>
    <div class="diamond-row">...</div>
    <div class="perception-panel">...</div>
  </main>
  <section class="recent-log">...</section>
</section>
```

---

## 五、渲染器变更（renderer.js）

1. **NPC 卡片化**：`updateLocation()` 中 NPC 从纯文字列表改为 `<article class="room-npc-card">` 卡片，含名称+描述双行
2. **场景对话流**：新增 `scene-feed` 容器，`addLog()` 中 `type === 'scene' || type === 'dialogue'` 的日志写入 scene-feed 而非 log-area
3. **日志截断**：江湖页 log-area 仅显示最近 5 条（`.log-entry:nth-last-child(n+6) { display: none; }`）

---

## 六、背景图红色标记说明

**当前状态**：背景图 `jianghu-mobile-bg.jpg` 包含 3 处红色区域标记（左上主峰、左中留白区、左下近景山石），目前透过半透明内容层可见。

**暂不处理**。后续计划：

1. 提交**不带红色标记**的干净背景图
2. 按红色标记处的横线将背景图**分割为三块独立图片**：
   - 块 1：顶部远山带（~15% 高度）
   - 块 2：中部留白区（~65% 高度）
   - 块 3：底部近景带（~20% 高度）
3. 将三块图片分别赋予三个区域（`location-banner` / `jianghu-main-zone` / `recent-log`）做背景，实现**完美分割**——每个区域的背景图恰好对应该区域，无需整图透过半透明层

**过渡方案**：在分割图片就绪前，使用整张带标记的背景图作为 `#scene-bg` 的 `background-image`，红色标记透过半透明内容层可见，不影响功能开发。

---

## 七、响应式行为

| 断点 | 行为 |
|------|------|
| <768px（手机） | 全屏背景图 + 三区垂直分层；顶栏/输入栏隐藏 |
| ≥768px（桌面） | 无背景图；江湖页占左 66.6%，功能页占右 33.3%；输入栏显示 |
| <360px（小屏） | 收缩 padding 和字号（room-desc 14px） |

---

## 八、已知问题与后续

- [ ] 背景图红色标记需替换为干净版 + 三块分割
- [ ] `scene-feed` 目前无数据源写入（需对接 NPC 对话系统）
- [ ] 桌面端右栏功能页样式为占位状态，待后续完善
- [ ] `page_manager.js` 的祥云帷幕动画依赖 `intro.css` 中的 veil 样式，需确认存在
