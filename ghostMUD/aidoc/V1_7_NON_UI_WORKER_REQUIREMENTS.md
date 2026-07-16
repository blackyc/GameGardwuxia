# V1.7 非 UI 基础能力执行需求（Grok Worker 版）

## 0. 唯一工作区

- 唯一允许读写、构建和运行的根目录：`D:\git\GameGardwuxia\ghostMUD`
- 禁止访问、复制或参考 `D:\MUD\ghostMUD`。
- 每次开始工作先执行：`git rev-parse --show-toplevel`。
- 输出不是 `D:\git\GameGardwuxia\ghostMUD` 时立即停止，不得自行猜测路径。
- 当前仓库可能有其他执行者的未提交改动。禁止还原、覆盖或格式化不属于本需求的文件。

## 1. 目标

只完成 UI 所依赖的确定性服务层能力：

1. 任务事件必须按目标推进，并能提供唯一的当前主线摘要。
2. 音频偏好可持久化，序章/战斗不能覆盖玩家选择。
3. 舆图服务提供“世界区域摘要 + 当前区域局部图”数据，不再把已探索房间等同于可瞬移。
4. 天气按区域演化，并根据房间室内外类型返回可见结果。
5. 瞬时反馈按事件 ID 去重，同一奖励不能重复浮出。

本文件不授权 Worker 设计或修改任何 UI。

## 2. 严格禁止修改的文件

以下文件由 Codex 维护，Worker 不得修改：

- `index.html`
- `src/ui/renderer.js`
- `src/ui/input.js`
- `src/ui/page_manager.js`
- `src/ui/intro_scene.js`
- `src/styles/**`
- `public/assets/**`
- `src/npc_service.js`
- `public/data/wenjianfeng_npc_dialogues.js`
- `public/data/wenjianfeng_tutorial_ch1.js`
- `public/data/wenjianfeng_tutorial_ch2.js`
- 所有剧情台词和 `aidoc/archive_20260707/docs/narrative/**`

如果实现需要 UI 文件配合，只在交付报告中写出建议接口，不得自行越界。

## 3. 允许修改的文件

- `src/quest_service.js`
- `src/audio/AudioManager.js`
- `src/core/save_schema.js`
- `src/core/storage.js`（仅必要迁移）
- `src/game.js`（仅服务注册、代理方法和默认状态）
- `src/world_context.js`（仅区域/房间规则读取）
- 可新增：
  - `src/contracts/quest_event.js`
  - `src/audio/audio_preferences.js`
  - `src/map_service.js`
  - `src/weather_service.js`
  - `src/moment_feedback_queue.js`
  - 对应的 `temp/*.test.cjs`

不得借机重命名既有服务、移动目录或统一代码风格。

---

## 4. 工作包 A：目标感知的任务推进

### 4.1 必须新增的事件结构

新增 `normalizeQuestEvent(input, legacyTarget)`，统一返回：

```js
{
  eventId: string | null,
  type: 'go' | 'kill' | 'find' | 'collect' | 'talk' | 'dialogue' | 'deliver' | 'find_clue' | 'choice' | 'escort',
  targetId: string | null,
  roomId: string | null,
  npcId: string | null,
  itemId: string | null,
  choiceId: string | null,
  amount: number
}
```

兼容旧调用：

```js
checkQuestProgress('go', '问剑峰·剑坪')
```

必须被转换为：

```js
{ type: 'go', targetId: '问剑峰·剑坪', roomId: '问剑峰·剑坪', amount: 1 }
```

### 4.2 阶段匹配规则

只允许满足下列条件时推进：

1. `stage.type` 与事件类型一致，或存在明确兼容关系。
2. 阶段声明了 `target/targetId` 时，事件 `targetId` 必须相等。
3. 阶段声明了 `room/roomId` 时，事件 `roomId` 必须相等。
4. 阶段声明了 `npc/npcId` 时，事件 `npcId` 必须相等。
5. 阶段声明了 `item/itemId` 时，事件 `itemId` 必须相等。
6. 阶段声明了 `choice/choiceId` 时，事件 `choiceId` 必须相等。

兼容关系仅允许：

- `encounter` 阶段接受 `kill` 事件。
- `collect` 阶段接受 `find` 或 `collect` 事件，但目标物品仍必须匹配。
- `return` 阶段接受 `go` 事件，但目标房间仍必须匹配。

禁止继续保留以下错误规则：

- 任意 `go` 推进 `talk/dialogue/deliver/find_clue/choice/escort`。
- 只看事件类型、不看目标。

### 4.3 计数阶段

阶段可声明 `count`。进度存到：

```js
state.questProgress[questId] = {
  stageIndex: number,
  current: number,
  seenEventIds: string[]
}
```

- `amount` 默认 1。
- 达到 `count` 才进入下一阶段。
- 同一个非空 `eventId` 重复提交不得重复计数。
- `seenEventIds` 每个任务最多保留最近 64 个，防止存档无限增长。

### 4.4 主线摘要

状态新增：

```js
primaryQuestId: string | null
questProgress: object
```

`startQuest()` 规则：

- 接到第一个未完成任务时，如果 `primaryQuestId` 为空，将其设为该任务。
- 不得在接到支线时自动覆盖已有主线。
- 主线完成后，从剩余活动任务中按接取顺序选择下一项；没有则设为 `null`。

新增纯数据方法：

```js
getPrimaryQuestSummary()
```

返回：

```js
{
  questId,
  name,
  stageIndex,
  stageCount,
  objective,
  knownRegion,
  progressCurrent,
  progressTarget
} | null
```

不得返回 HTML，不得查询 DOM，不得生成 GPS 路线。

### 4.5 存档

- `SAVE_SCHEMA` 增加 `primaryQuestId`、`questProgress`。
- 旧存档缺字段时自动补默认值。
- 不提升版本也可以完成的情况下不要提升 Schema 版本。
- 不得清空旧 `questStages`；迁移时把它作为 `stageIndex` 的来源。

---

## 5. 工作包 B：音频偏好

### 5.1 独立偏好存储

使用独立 localStorage 键：

```text
ghostmud.audio.preferences.v1
```

结构：

```js
{
  masterMuted: false,
  bgmMuted: false,
  sfxMuted: false,
  bgmVolume: 0.4,
  sfxVolume: 0.5
}
```

要求：

- 读取失败或 JSON 损坏时回到默认值，不抛异常。
- 音量强制夹在 0 到 1。
- `AudioManager` 构造时先读取偏好，再创建/启动 BGM。
- `startBgm()` 必须尊重 `masterMuted || bgmMuted`。
- 用户偏好与“序章临时静音”分离。

### 5.2 API

保留既有 API，并新增：

```js
getPreferences()
setMasterMuted(boolean)
setBgmMuted(boolean)
setSfxMuted(boolean)
setBgmVolume(number)
setSfxVolume(number)
pushTemporaryMute(reason)
popTemporaryMute(reason)
```

规则：

- `pushTemporaryMute('intro')` 只能临时压低/关闭音效，不得改 localStorage。
- `popTemporaryMute('intro')` 恢复用户偏好，不得强制开声。
- `setMuted(m)` 为旧 SFX API 的兼容别名，不得连带改变 BGM 偏好。
- 对同一个临时静音 reason 重复 push/pop 必须幂等。

### 5.3 禁止事项

- 不新增按钮。
- 不修改 topbar、HTML 或 CSS。
- 不在 `main.js` 中插入 DOM 事件。
- 不更换 BGM 文件。

---

## 6. 工作包 C：地图数据服务

当前 `Renderer.renderMap()` 一次渲染全世界并允许点击已探索节点瞬移。Worker 只提供数据服务，不改 Renderer。

新增 `MapService`：

```js
getWorldRegions()
getLocalGraph(roomId, options)
setWaypoint(roomId)
getWaypoint()
clearWaypoint()
```

### 6.1 世界区域摘要

`getWorldRegions()` 返回：

```js
[
  {
    id,
    name,
    discovered,
    current,
    discoveredRoomCount,
    totalKnownRoomCount,
    neighbors: string[]
  }
]
```

- 区域从房间 ID 的命名空间或房间数据中的 region/area 字段提取。
- 不暴露未发现区域内部房间。
- 不计算快速旅行权限。

### 6.2 局部房间图

`getLocalGraph()` 默认只返回当前区域、当前房间向外 2 跳范围：

```js
{
  centerRoomId,
  regionId,
  nodes: [{ id, label, current, explored, hidden, locked }],
  edges: [{ from, to, direction, discovered, locked }]
}
```

必须复用已有出口/隐藏路线真值，不得自己推测方向。

- 未发现隐藏出口不得出现。
- 已感知但未揭示的入口只允许返回匿名节点，不得返回真实房间名。
- 锁定入口可见但 `locked: true`。
- 地图服务不得调用 `move()` 或 `quickTravel()`。

### 6.3 路标

- 路标只是 UI 提示目标，不能移动玩家。
- 只能对已探索房间设置路标。
- 路标是否跨区不影响规则；服务不负责寻路。

---

## 7. 工作包 D：区域天气

新增 `WeatherService`，天气按区域存储，不为每个房间各掷一次随机数。

### 7.1 房间暴露类型

服务读取以下值，缺省按 `outdoor`：

```js
weatherExposure: 'outdoor' | 'sheltered' | 'indoor' | 'none'
climateZone: string
```

不得批量重写房间数据。缺字段时通过现有区域/建筑信息作保守推断：

- 明确的殿、室、房、楼内部：`indoor`
- 廊、亭、山门檐下：`sheltered`
- 道、阶、坪、林、池：`outdoor`
- 副本精神空间或禁用天气的房间：`none`

推断函数必须集中在 WeatherService，不得散落到 Renderer。

### 7.2 状态

保存：

```js
state.weather = {
  seed: number,
  regions: {
    [climateZone]: {
      current: string,
      next: string,
      changedAtGameTime: number
    }
  }
}
```

支持天气：`clear`、`cloudy`、`mist`、`drizzle`、`rain`、`storm`、`snow`。

- 同一 `seed + gameTime + climateZone` 必须得到相同结果。
- 不得使用 `Math.random()` 让读档后天气跳变。
- 首版每 2 个游戏时辰最多变化一次。
- 气候转移必须使用表驱动，禁止 `clear -> storm` 直接跳转。

### 7.3 查询 API

```js
getWeatherForRoom(roomId)
advanceTo(gameTime)
```

返回：

```js
{
  type,
  label,
  visible,
  exposure,
  climateZone,
  descriptionVariant,
  perceptionModifier,
  searchModifier
}
```

- `indoor` 可听见雨声，但 `visible: false`。
- `none` 返回中性结果，不产生描述与数值影响。
- 首版 modifier 范围限制在 `-0.15` 到 `0.10`。
- 不修改战斗数值，不实现雷击、冻伤等新玩法。

---

## 8. 工作包 E：瞬时反馈去重队列

新增纯逻辑类 `MomentFeedbackQueue`：

```js
enqueue({ eventId, text, kind, amount, createdAt })
takeNext()
peek()
clear()
```

规则：

- 相同非空 `eventId` 只接受一次。
- 500ms 内相同 `kind + text` 合并，`amount` 累加。
- 一个 active，最多两个 waiting；超过容量时丢弃最旧的非 quest 提示。
- `quest`、`clue` 不得被 reward/info 挤掉。
- 类中不得操作 DOM、定时器或 CSS。

只新增服务和单测。本轮不接入现有 `showMomentFeedback()`，由 Codex 验收后接入 UI。

---

## 9. 轻量测试要求

只添加确定性 Node 测试，不启动浏览器。

至少覆盖：

1. 去错误房间不会推进 `go` 阶段。
2. 和错误 NPC 对话不会推进 `talk` 阶段。
3. 同一 `eventId` 两次提交只计一次。
4. 计数任务达到目标前不完成。
5. 第一个任务成为主线，第二个任务不覆盖。
6. 主线完成后切到下一个活动任务。
7. 损坏的音频偏好 JSON 不阻止启动。
8. 静音偏好刷新后仍然有效。
9. intro 临时静音结束后仍服从用户静音偏好。
10. 地图局部图不包含未发现隐藏房间真实 ID。
11. `setWaypoint` 不能设置未探索房间。
12. 同 seed/time/zone 天气一致。
13. 室内房间不显示雨景，但允许返回“听见雨声”的描述变体。
14. 瞬时反馈同 eventId 去重，重复 reward 合并 amount。

完成后只需运行：

```powershell
npm run build
node temp/v17-non-ui.test.cjs
```

不要为了“测试更全面”改动现有大量测试或生成快照。

## 10. 交付报告格式

提交 `aidoc/V1_7_NON_UI_WORKER_REPORT.md`，必须包含：

1. `git rev-parse --show-toplevel` 输出。
2. 实际修改文件清单。
3. 每个工作包：完成/未完成/偏离。
4. 新增状态字段及默认值。
5. 新增公开 API 的签名。
6. 旧接口兼容说明。
7. 构建与测试命令的真实输出摘要。
8. 尚需 Codex 接入 UI 的接口清单。

禁止在报告中用“基本完成”“大致可用”。只能逐项说明验收条件是否满足。
