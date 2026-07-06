# H4B 房间可达性修复 — 状态记录

> 文档时间：2026-07-07 01:32  
> 阶段：H4B 审计修复 → 数据层入口注入  
> 前置：H4A（存档契约）已完成，H2 测试框架已完成（72项全通过）

---

## 一、已完成工作

### 1. UI 层两级导航分层（✅ 已完成）

**设计目标**：方位通路（东南西北）放 exit-bar 常驻显示；副本入口（酒肆/古井/铁铺等）收在感知面板"隐处可探"区。

**代码修改**：

| 文件 | 修改内容 |
|------|----------|
| `perception_service.js` | 拆分 connections 为 `cardinalExits`（方位）+ `connections`（探索入口）两个数组返回 |
| `renderer.js` | 新增 `renderExitBar()` 函数渲染方位按钮；`updateLocation()` 中调用；感知面板标题改为 `> 隐处可探`；exit-bar 标题行 `── 此处联通 ──` |
| `index.html` | `room-card` 与 `diamond-row` 间添加 `#exit-bar` 元素 |
| `jianghu.css` | `.exit-bar` 横排按钮样式，间距/标题行/悬浮效果 |

**构建结果**：零警告，CSS 48.71KB，JS 144.80KB，72项测试全通过。

### 2. P1 MAP_POS 坐标缺失修复（✅ 已完成）

为 `应天府·西北郊`、`应天府·北郊`、`应天府·南郊` 添加独立 connections，修复郊区拓扑：
- 北郊→太平门/栖霞道院/幕府山
- 西北郊→石城门/清凉山/幕府山
- 南郊→聚宝门

**MAP_POS 覆盖率**：203/203（100%）

### 3. P2 自动化测试门禁（✅ 已完成）

新增 13 项测试（dirty-save、房间可达性、坐标覆盖）。

### 4. P0 备份链修复（✅ 已在 H4A 完成）

`storage.js` 中 `save()` 的 `isValidForBackup` 完整校验已就位，坏主档不会覆盖有效 backup。

### 5. P1 dirty 标记 / 保存失败处理 / 问剑峰拓扑（✅ 已在 commit 84c6079 修复）

第二轮审计误报的 3 个 P1 问题，实际在 `84c6079` 中已修复：
- `idleTick`/`daoxinTick`/`triggerIdleEvent`/`checkBreakthrough` 及 `action_service.js` 中 `cultivate`/`train`/`rest` 均已包含 `markDirty()` 调用
- `markDirty()` 和 `flushSave()` 脏标记仅在保存成功后清除
- BFS 从问剑峰·山门可达全部 18 间问剑峰房间

---

## 二、数据层入口注入（⚠️ 部分完成，有 BUG 待修）

### 修复成果

通过在 `integration_v2.js` 第4b节（约第298行起）添加 `_entries` 商铺入口注入代码块，**BFS 可达率从 ~47%（95/203）提升到 99%（200/202）**。

注入逻辑位于 `integration_v2.js` 第 298-528 行，结构为：

```js
(function() {
  var _entries = {
    '应天府·东大街': { '酒肆': '太白遗风·酒肆', ... },
    '应天府·西大街': { '铁铺': '应天府·铁匠铺', ... },
    // ... 共约 48 条街道→商铺映射
  };

  var _added = 0;
  for (var street in _entries) {
    if (!LOCATIONS[street]) continue;
    if (!LOCATIONS[street].connections) LOCATIONS[street].connections = {};
    var entries = _entries[street];
    for (var key in entries) {
      var target = entries[key];
      if (LOCATIONS[target] && !LOCATIONS[street].connections[key]) {
        LOCATIONS[street].connections[key] = target;
        _added++;
        // 同时给目标房间添加 '出' 方向返回入口街道
        if (!LOCATIONS[target].connections) LOCATIONS[target].connections = {};
        if (!LOCATIONS[target].connections['出']) {
          LOCATIONS[target].connections['出'] = street;
          _added++;
        }
      }
    }
  }
})();
```

### 当前 BFS 验证结果

```
总房间: 203
有 connections: 202
无 connections: 1
BFS 可达: 200
BFS 不可达: 2
可达率: 99.0%

不可达房间:
  冶山古道·青石阶  [出站: 东→废弃矿道, 回→废弃矿道]
  冶山古道·青石阶·废弃矿道  [出站: 西→青石阶, 回→青石阶]

无 connections 的房间:
  斗转茶舍·二楼

MAP_POS 覆盖: 203/203
```

---

## 三、待修复 BUG 清单

### BUG-1：`应天府·聚宝门` 在 `_entries` 中重复 3 次（P0）

**文件**：`integration_v2.js`  
**行号**：约 363、463、483

**问题**：`_entries` 是一个 JS 对象字面量，同一个 key 出现 3 次，后者覆盖前者：

```js
var _entries = {
  // ...
  '应天府·聚宝门': {           // 第1次 (约363行)
    '长干里': '应天府·长干里',
    '雨花台': '雨花台·碎石坡'
  },
  // ...
  '应天府·聚宝门': {           // 第2次 (约463行) — 覆盖第1次！
    '码头': '应天码头·货栈'
  },
  // ...
  '应天府·聚宝门': {           // 第3次 (约483行) — 覆盖第2次！
    '暗格': '应天府·聚宝门·瓮城暗格'
  },
  // ...
};
```

**结果**：只有最后一个生效（`暗格→瓮城暗格`），前两个（`长干里`、`雨花台`、`码头`）全部丢失。

**修复方案**：合并为一条：
```js
'应天府·聚宝门': {
  '长干里': '应天府·长干里',
  '雨花台': '雨花台·碎石坡',
  '码头': '应天码头·货栈',
  '暗格': '应天府·聚宝门·瓮城暗格'
},
```

---

### BUG-2：`斗转茶舍·大堂` 不存在于 LOCATIONS（P0）

**文件**：`integration_v2.js` 第 450 行 + `rebuild_rooms_wild.js` 第 532 行

**问题**：`_entries` 中引用了 `斗转茶舍·大堂` 作为 street 和 target，但该房间**从未在任何数据文件中定义**。

- `rebuild_rooms_wild.js` 第 532 行只定义了 `斗转茶舍·二楼`（name/desc/connections 均有）
- `斗转茶舍·大堂` 没有对应的 LOCATIONS 条目

`_entries` 中的引用：
```js
// 第 450 行 — 作为 street
'斗转茶舍·大堂': {
  '二楼': '斗转茶舍·二楼'
},
// 第 503 行 — 作为 target
'斗转茶舍·二楼': {
  '出': '斗转茶舍·大堂'   // ← 目标不存在！
}
```

**影响**：
1. 循环处理 `斗转茶舍·大堂` 时 `if (!LOCATIONS[street]) continue;` → **跳过**，二楼的入口连接未添加
2. 循环处理 `斗转茶舍·二楼` 时 `LOCATIONS['斗转茶舍·大堂']` 为 false → **跳过**，`出→大堂` 未添加
3. 二楼原始 connections `{ 南: 'yt_drum_st' }` 中 `yt_drum_st` 未在 `_ID_MAP` 中注册 → 被 `_resolve()` 清空
4. 最终二楼 connections = `{}`（空对象），完全孤立

**修复方案**（二选一）：

**方案 A**（推荐）：在 `rebuild_rooms_wild.js` 中新增 `斗转茶舍·大堂` 房间定义：
```js
'斗转茶舍·大堂': {
  name: '斗转茶舍·大堂',
  desc: '鼓楼街尽头的茶舍，一楼是寻常茶铺，柜台后的伙计总在打瞌睡。墙上有面铜镜，镜面朝下扣着。',
  connections: {},
  npcs: [],
  events: []
},
```

**方案 B**：删除 `_entries` 中对 `斗转茶舍·大堂` 的引用，改为从 `应天府·西大街` 直接连接到 `斗转茶舍·二楼`：
```js
// 在 _entries 中删除斗转茶舍·大堂相关条目，改为：
'应天府·西大街': {
  // ... 其他商铺 ...
  '茶舍': '斗转茶舍·二楼'   // 直接连到二楼
},
```

---

### BUG-3：`_entries` 中引用了不存在的 target 房间（P1）

**文件**：`integration_v2.js`

以下 target 在 LOCATIONS 中不存在，循环会跳过这些条目（`LOCATIONS[target]` 为 false）：

| street | key | target | 状态 |
|--------|-----|--------|------|
| `应天府·西大街` | `铁铺` | `应天府·铁匠铺` | ❌ 不存在 |
| `应天府·西大街` | `当铺` | `聚宝当铺·大堂` | ❌ 不存在 |
| `应天府·西大街` | `钱庄` | `四海钱庄·大堂` | ❌ 不存在 |
| `应天府·西大街` | `斗转` | `斗转茶舍·大堂` | ❌ 不存在（同 BUG-2） |
| `斗转茶舍·二楼` | `出` | `斗转茶舍·大堂` | ❌ 不存在（同 BUG-2） |

**影响**：这 5 条入口连接未被注入，相关房间可能仍不可达（被其他路径覆盖则不影响）。

**修复方案**：
1. 检查这些房间是否在 `rebuild_rooms_city.js` 或其他数据文件中存在但 ID 不同
2. 如果确实不存在，需要在数据文件中新增房间定义，或从 `_entries` 中删除

---

### BUG-4：`冶山古道·青石阶` 仍不可达（P1）

**文件**：`integration_v2.js` + `rebuild_rooms_wild.js`

**问题**：`蒋山·古道` 的 `冶山→冶山古道·青石阶` 入口已添加（在合并后的 _entries 中），循环应同时给 `冶山古道·青石阶` 添加 `出→蒋山·古道`。

验证脚本显示 `冶山古道·青石阶` 的 connections 为：
```json
{"东":"冶山古道·青石阶·废弃矿道","回":"冶山古道·青石阶·废弃矿道","出":"蒋山·古道"}
```

`出→蒋山·古道` 确实已添加。`蒋山·古道` 的 connections 中也有 `冶山→冶山古道·青石阶`。

但 BFS 仍显示不可达——**需要验证 `蒋山·古道` 本身是否可达**。如果 `蒋山·古道` 不可达，那 `冶山古道·青石阶` 自然也不可达。

**排查方向**：
1. 确认 `蒋山·古道` 是否在 BFS 可达集合中
2. 如果 `蒋山·古道` 不可达，检查 `应天府·正阳门` 的 `蒋山→蒋山·古道` 连接是否生效
3. 确认 `应天府·正阳门` 是否可达

---

### BUG-5：`yt_drum_st` 旧 ID 未在 `_ID_MAP` 中注册（P2）

**文件**：`integration_v2.js` 的 `_ID_MAP` 定义

**问题**：`斗转茶舍·二楼` 原始数据中 `connections: { 南: 'yt_drum_st' }`，但 `yt_drum_st` 未在 `_ID_MAP` 中映射到新 ID，导致 `_resolve()` 返回 null，connections 被清空。

**修复方案**：在 `_ID_MAP` 中添加：
```js
'yt_drum_st': '应天府·鼓楼街'
```

---

## 四、关键文件路径

| 文件 | 用途 |
|------|------|
| `public/data/integration_v2.js` | _entries 商铺入口注入（第298-528行）、_ID_MAP（约第100-150行）、自动反向连接（约第276-293行） |
| `public/data/rebuild_rooms_wild.js` | 斗转茶舍·二楼定义（第532行）、郊区/景点房间定义 |
| `public/data/rebuild_rooms_city.js` | 城市房间定义 |
| `public/data/rebuild_rooms_wenjianfeng.js` | 问剑峰18间房定义 |
| `src/perception_service.js` | 方位/探索入口分类逻辑 |
| `src/renderer.js` | renderExitBar() 渲染 |
| `index.html` | #exit-bar 元素 |
| `src/jianghu.css` | .exit-bar 样式 |
| `test/` | 72项测试（smoke + data-validate + save-schema） |
| `work/verify_reachability.cjs` | BFS 可达性验证脚本 |
| `work/check_missing.cjs` | _entries 引用完整性检查脚本 |

## 五、验证命令

```powershell
# 构建
cd D:\git\GameGardwuxia\ghostMUD
npx vite build

# 运行测试
node test/run-all.cjs

# BFS 可达性验证
node work/verify_reachability.cjs

# _entries 引用完整性检查
node work/check_missing.cjs
```

## 六、提交记录

| commit | 内容 |
|--------|------|
| `27a2d43` | H0 基线 |
| `068ab16` | HR-101/102/103 修复 |
| `22aa70c` | H2 测试框架 |
| `02537f5` | 测试退出码修复 |
| `70d6ef9` | H1+H2 验收 |
| `f3610ab` | H3 数据契约 |
| `2fb51a7` | H3 命名迁移 |
| `84c6079` | H4A 存档契约 |
| `92815d5` | H4A 审计修复 |
| (未提交) | H4B MAP_POS + 测试 + UI两级导航 + _entries入口注入 |

---

## 七、2026-07-07 修复验收

### BUG 清单关闭情况

- BUG-1：合并 `应天府·聚宝门` 的长干里、雨花台、码头、暗格四个入口，`_entries` 无重复 street key。
- BUG-2：新增 `斗转茶舍·大堂`，形成“西大街 → 大堂 → 二楼 → 大堂”的副本层级。
- BUG-3：铁铺、当铺、钱庄入口改为实际存在的房间 ID。
- BUG-4：`蒋山·古道 → 冶山古道·青石阶` 已纳入主图，BFS 全量可达。
- BUG-5：补充 `yt_drum_st → 应天府·鼓楼街` 兼容映射。

### 条件入口执行链

原数据中的 `observable.sub_rooms[].prereq` 此前只被保存，未参与 UI 和移动判定。本次按 `docs/shared_constraint_v3.md` §7.2“8种预设条件”落地：

1. 子房间扁平化时保留 `prereq`、`fail_msg`、`success_msg`。
2. 感知层隐藏未满足条件的入口。
3. 移动和快速旅行再次执行硬校验，防止绕过 UI 进入。
4. 支持 skill、realm、daoxin、max_daoxin、item、quest、active_quest、faction、path、time、cultivation 和 composite 条件。

### 验证结果

- `npm test`：80 通过，0 失败。
- `npm run build`：通过。
- `node work/verify_reachability.cjs`：204/204 房间有连接，204/204 BFS 可达，MAP_POS 204/204。
- `node work/check_missing.cjs`：0 个不存在目标，`_entries` 无重复 street key。
- 浏览器：桌面与 390×844 手机视口通过；方向栏、感知入口正常；无横向溢出；控制台 0 error/warning。
