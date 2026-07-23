# 张望 / 探索交互权威规范 V1

> 状态：**生效（Authoritative）**
>
> 生效日期：2026-07-22
>
> 适用范围：江湖页、房间系统、路线发现、主/子地图、探索事件、任务事件与随机事件池。

## 1. 权威与冲突裁决

本文件对 `look/find` 的产品语义、数据契约和 UI 行为拥有最高优先级。旧文档、旧代码、历史截图与本文件冲突时，以本文件为准；视觉材质仍服从 `aidoc/UI_ART_DIRECTION_V1.md`。

| 玩家动作 | MUD 语义 | 改变什么 | 不得承担 |
| --- | --- | --- | --- |
| 张望 | `look` | 查看房间画面、发现或使用跨地图门户、揭示同层隐藏路线 | 不抽随机事件，不直接发奖励，不在主页面展开面板 |
| 探索 | `find/search` | 结算唯一事件、任务事件或合规随机事件，并展示事件画面与叙述 | 不承担普通移动，不展示 NPC 清单，不直接改变路线图 |

两个动作都使用独立的“场景交互画卷”浮层。禁止在江湖主页面插入可变高度面板，禁止挤压路线图、NPC 名帖、行动按钮或最近日志。

## 2. 张望（look）

### 2.1 有内容的房间

点击张望后打开居中、略偏上的场景交互画卷：

1. 上方约 3/4：当前 room 立绘。
2. 下方：固定引导文案“你观此处有”。
3. 引导文案下：当前房间可见的跨地图门户选项。
4. 点击门户后关闭画卷并执行跨层移动。

进入子地图后必须一次性刷新顶部房间木匾、房间描述、在场 NPC、route-sketch 数据源与当前空间层级。子地图 route-sketch 只显示子地图内部连接，不显示进入前的主地图连接；返回主地图同理。视觉上是“换了一张地图”，不是把子房间节点追加在主地图旁边。

### 2.2 无内容的房间

room 没有子地图门户，也没有专属立绘时，不打开空画卷。在屏幕中部略偏上显示无边框浮字：

```text
未有特别之处
```

浮字不得写入最近日志，不要求玩家关闭。

### 2.3 隐藏房间与跨层门户

- **同层隐藏房间**：属于当前主地图或当前子地图。满足条件并经张望发现后，直接在当前 route-sketch 中显现与上一 room 的连接；当前 room 与地图层级不刷新。
- **跨层门户**：从主地图进入子地图，或从子地图返回主地图。入口只允许配置在指定 room，并且只允许通过张望浮层交互进入。
- route-sketch 不得直接渲染跨层门户；方向命令和快速旅行不得绕过张望进入另一空间层。

## 3. 探索（find）

点击探索后先由 `SearchService` 结算，再打开同一视觉外壳的场景交互画卷：

1. 上方约 3/4：探索事件立绘。
2. 下方：事件文字描述。
3. 没有玩家决策时不额外生成假选项。
4. 奖励、任务推进和唯一性必须由服务层完成，UI 只呈现结果。

### 3.1 唯一事件

唯一事件必须有稳定 `id`，使用 `unique: true` 或兼容字段 `once: true`。成功触发后写入 `state.worldEvents[id]`，永久不再抽取。可使用 `pityAfter` 指定第 N 次合规探索必定触发。白芷花环属于此类。

### 3.2 任务事件

任务事件也是唯一事件，可由 `trigger: 'find'` 探索触发，也可由 `trigger: 'dialogue'` 对话分支触发。任务状态变更必须经任务服务或结构化任务事件接口结算，禁止在 UI 点击处理器直接修改任务字段。

### 3.3 可重复随机事件

随机事件必须先通过世界上下文过滤，再参与权重抽取。结构化条件至少支持：

- `roomIds` / `excludeRoomIds`
- `regions`、`zoneKinds`、`paths`
- `realmMin` / `realmMax`
- `gameTimes` 或 `timePeriods`
- `requiresCompanion`
- `requiresFlag` / `excludesFlag`
- `requiresItem` / `excludesItem`
- `castSize` / `multiActor`

夜间多人事件默认禁止，只有显式 `allowAtNight: true` 才可进入夜间池。门派驻地默认只允许策划明确标记的本地事件，不得从城市或全局池抽取乞丐、商贩或应天府专属事件。

## 4. 数据契约

### 4.1 Room 与门户

```js
{
  sceneIllustration: '/ui/rooms/wenjianfeng-dorm-court.webp',
  connections: { 内: '问剑峰·弟子房' },
  routeSketch: {
    内: {
      id: 'wjf_dorm_to_room',
      label: '你的房间',
      kind: 'interior',
      layout: { anchor: 'DEEP', lane: 0 },
      discovery: {
        hint: '门后似有一间静室。',
        revealLabel: '推门细看',
        revealMessage: '你认出这是分给自己的房间。',
        hintPrereq: {}
      }
    }
  }
}
```

`kind: 'interior' | 'dungeon'` 表示跨地图边界；`world | faction | maze` 表示同层路线。复杂区域应优先给 room 显式设置 `spaceLayer`，不要长期依赖运行时反向推断。

### 4.2 探索事件

```js
{
  id: 'wjf_baizhi_wreath',
  trigger: 'find',
  unique: true,
  chance: 0.35,
  pityAfter: 3,
  illustration: '/ui/events/baizhi-wreath.webp',
  foundText: '你在斜松根下找到了一个白芷花环。',
  conditions: {
    roomIds: ['问剑峰·剑阶·中段'],
    requiresCompanion: 'wenjianfeng_suxiaotang',
    timePeriods: ['morning', 'noon', 'dusk']
  },
  item: { id: 'wjf_baizhi_wreath', name: '白芷花环', type: 'special' }
}
```

## 5. 服务与接口所有权

| 层 | 权威职责 | 当前接口 |
| --- | --- | --- |
| `RouteService` | 空间层、同层路线、跨层门户、发现状态 | `getMapRoutes()`、`getLookEntrances()`、`senseCurrentRoom()`、`revealRoute()` |
| `SceneInteractionService` | 张望/探索共享浮层与门户点击编排 | `openLook()`、`openFind()`、`enter()`、`reveal()`、`close()` |
| `SearchService` | 探索抽取、奖励、任务推进 | `searchArea()` |
| `WorldContextService` | 地域/时辰/人物规模过滤、唯一事件和保底 | `get()`、`resolveSpecialSearch()`、`applySearchEvent()` |
| `MovementService` | 实际移动与跨层门禁 | `explore(dir, { viaLook })`、`quickTravel()` |
| `PerceptionService` | 旧接口兼容层 | `openPerception()` 仅代理 `openLook()` |
| `Renderer` | route-sketch 只消费同层路线 | `renderExitBar()` |

## 6. 禁止事项

1. 禁止恢复 `#perception-panel` 或在主页面直接展开张望/探索内容。
2. 禁止把子地图节点混入主地图 route-sketch。
3. 禁止 UI 层直接发道具、改任务、标记唯一事件。
4. 禁止依据文案关键词猜测地域、时辰或人物数量；事件必须提供结构化条件。
5. 禁止随机池在缺少地域条件时进入门派驻地。
6. 禁止用整张页面截图代替 room/event 立绘。

## 7. 验收标准

- 普通无内容 room 张望只出现“未有特别之处”。
- 有子地图入口的 room 张望显示画卷与入口，route-sketch 不显示该入口。
- 进入子地图后木匾、描述、NPC 与路线图同步切换。
- 直接输入方向或快速旅行不能跨层。
- 同层隐藏路线发现后出现在当前路线图，room 不切换。
- 唯一探索事件成功一次后永不重复，`pityAfter` 生效。
- 夜间多人随机事件、跨区域人物事件、门派驻地城市事件均被上下文过滤。
- 张望/探索浮层在手机端不改变江湖主页面各区域高度。