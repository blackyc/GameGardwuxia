# V1.7 非 UI 基础能力 — Worker 交付报告

## 1. 工作区校验

```text
git rev-parse --show-toplevel
→ D:/git/GameGardwuxia
```

说明：本仓库为 monorepo，git 顶层是 `D:/git/GameGardwuxia`，产品根目录为子目录 `ghostMUD`。  
实际读写、构建、测试均在 `D:\git\GameGardwuxia\ghostMUD` 完成，**未访问** `D:\MUD\ghostMUD`。  
未还原/覆盖其他执行者已修改的 UI 与无关文件。

## 2. 实际修改文件清单

### 本 Worker 新增

| 路径 | 说明 |
| --- | --- |
| `src/contracts/quest_event.js` | 任务事件归一化与阶段匹配 |
| `src/audio/audio_preferences.js` | 音频偏好读写（独立 localStorage） |
| `src/map_service.js` | 舆图数据服务 |
| `src/weather_service.js` | 区域天气服务 |
| `src/moment_feedback_queue.js` | 瞬时反馈去重队列 |
| `temp/v17-non-ui.test.cjs` | 确定性 Node 单测 |
| `aidoc/V1_7_NON_UI_WORKER_REPORT.md` | 本报告 |

### 本 Worker 修改

| 路径 | 说明 |
| --- | --- |
| `src/quest_service.js` | 目标感知推进、计数、主线摘要 |
| `src/audio/AudioManager.js` | 偏好持久化、临时静音栈、API 扩展 |
| `src/core/save_schema.js` | 新状态字段默认值（未升 Schema 版本） |
| `src/game.js` | 仅服务注册、默认状态、代理方法 |

### 明确未修改（Codex / 他人负责）

`index.html`、`src/ui/**`、`src/styles/**`、`src/npc_service.js`、剧情数据、`public/assets/**` 等禁止清单文件。

## 3. 工作包完成状态

| 包 | 状态 | 说明 |
| --- | --- | --- |
| A 任务推进 | **完成** | `normalizeQuestEvent`、字段匹配、计数/eventId 去重、primaryQuestId、getPrimaryQuestSummary；已移除 go 推进 talk/dialogue 等错误规则 |
| B 音频偏好 | **完成** | 独立键 `ghostmud.audio.preferences.v1`；损坏回退；临时静音不写盘；`setMuted` 仅 SFX |
| C 地图服务 | **完成** | MapService 世界区域 + 局部图 + 路标；复用 RouteService；不调用 move/quickTravel |
| D 区域天气 | **完成** | WeatherService 按 climateZone；确定性 seed+time+zone；暴露类型推断集中在服务内 |
| E 瞬时反馈队列 | **完成** | MomentFeedbackQueue 纯逻辑；**未**接入 `showMomentFeedback()` |

### 已知边界（非偏离验收，供 Codex 接入）

- 现有卷宗任务多用 `action`/`location`/`target`，服务层已兼容映射到 `type`/`roomId` 等。
- `talk` 阶段若声明了 `location` 且事件**同时**携带 `roomId`，则要求房间一致；仅带 `npcId` 时不因 location 单独否决（避免旧调用无法推进）。
- 天气 `gameTime` 按 0–11 时辰槽（每 2 时辰一变）确定性解析；跨日累计未单独建模。
- 未改 `intro_scene.js`；序章应改用 `pushTemporaryMute('intro')` / `popTemporaryMute('intro')`（见第 8 节）。

## 4. 新增状态字段及默认值

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `primaryQuestId` | `null` | 当前主线任务 id |
| `questProgress` | `{}` | `questId → { stageIndex, current, seenEventIds }` |
| `mapWaypoint` | `null` | 路标房间 id（仅已探索） |
| `weather` | `{ seed: 1, regions: {} }` | 区域天气；seed 在服务首次确保时可用 `gameStart` 覆盖 |

- **保留** `questStages`（数字阶段索引），与 `questProgress.stageIndex` 双写。
- 旧档缺字段由 `SAVE_SCHEMA` / `Storage._validateAndRepair` 补默认；**未提升** `SCHEMA_VERSION`（仍为 4）。
- 音频偏好**不在**游戏存档内，键：`ghostmud.audio.preferences.v1`。

## 5. 新增公开 API 签名

### 任务

```js
normalizeQuestEvent(input, legacyTarget?) → QuestEvent
QuestService.checkQuestProgress(typeOrEvent, legacyTarget?)  // 兼容旧签名
QuestService.getPrimaryQuestSummary() → PrimaryQuestSummary | null
Game.getPrimaryQuestSummary()
```

### 音频

```js
AudioManager.getPreferences() → AudioPreferences
AudioManager.setMasterMuted(boolean)
AudioManager.setBgmMuted(boolean)
AudioManager.setSfxMuted(boolean)
AudioManager.setBgmVolume(number)   // clamp 0..1
AudioManager.setSfxVolume(number)
AudioManager.pushTemporaryMute(reason)
AudioManager.popTemporaryMute(reason)
AudioManager.setMuted(boolean)      // 旧 API：仅 SFX 偏好
```

### 舆图

```js
MapService.getWorldRegions() → RegionSummary[]
MapService.getLocalGraph(roomId?, options?) → LocalGraph
MapService.setWaypoint(roomId) → { ok, reason?, roomId? }
MapService.getWaypoint() → string | null
MapService.clearWaypoint() → true
// Game 同名代理：getWorldRegions / getLocalGraph / setWaypoint / getWaypoint / clearWaypoint
```

### 天气

```js
WeatherService.getWeatherForRoom(roomId) → WeatherView
WeatherService.advanceTo(gameTime) → weatherState
Game.getWeatherForRoom(roomId)
Game.advanceWeatherTo(gameTime)
```

### 瞬时反馈

```js
MomentFeedbackQueue.enqueue({ eventId, text, kind, amount, createdAt }) → boolean
MomentFeedbackQueue.takeNext() → item | null
MomentFeedbackQueue.peek() → item | null
MomentFeedbackQueue.clear()
// Game.momentFeedbackQueue 实例已挂载，未接入 UI
```

## 6. 旧接口兼容说明

| 旧接口 | 行为 |
| --- | --- |
| `checkQuestProgress('go', roomId)` | 归一为 `{ type:'go', targetId, roomId, amount:1 }` |
| `checkQuestProgress('kill', name)` / `('find', id)` | 同上模式 |
| `questStages` | 仍更新；读旧档可作 `questProgress.stageIndex` 来源 |
| V1 字段名 `questProgress`→`questStages` 迁移 | **保持**；新对象字段在校验阶段另补空 `questProgress:{}` |
| `setMuted(m)` | 只改 SFX 偏好并持久化，不改 BGM 偏好 |
| `startBgm()` | 若 `masterMuted \|\| bgmMuted \|\| 临时静音` 则不播放 |
| `showMomentFeedback` | **未改**；队列待 Codex 接入 |

## 7. 构建与测试输出摘要

```powershell
npm run build
# vite v5.4.21 building for production...
# ✓ 54 modules transformed.
# dist/index.html                 17.90 kB │ gzip:  5.00 kB
# dist/assets/index-Bg4OQkJu.css  92.83 kB │ gzip: 19.77 kB
# dist/assets/index-Brk1xzun.js  236.22 kB │ gzip: 87.80 kB
# ✓ built in 340ms

node temp/v17-non-ui.test.cjs
# Result: 24 passed, 0 failed
```

覆盖需求 §9 所列 14 项核心断言（错误房间/NPC、eventId 去重、计数、主线切换、音频损坏与静音、地图隐藏与路标、天气确定性与室内雨声、反馈去重合并）。

## 8. 尚需 Codex 接入 UI 的接口清单

1. **主线摘要**：渲染 `game.getPrimaryQuestSummary()`（纯数据，勿再扫全任务表拼 HTML）。
2. **任务事件**：对话/交付/选择等路径改为结构化  
   `checkQuestProgress({ type, npcId/targetId, roomId, eventId, ... })`，  
   停止依赖「任意 go 推进 talk」。
3. **音频设置 UI**（若做）：调用 `getPreferences` / `set*Muted` / `set*Volume`；  
   序章改为 `pushTemporaryMute('intro')` / `popTemporaryMute('intro')`，勿用 `setMuted` 持久关声。
4. **舆图 UI**：用 `getWorldRegions()` + `getLocalGraph()` 替换「全世界节点 + 已探索瞬移」；路标仅 `setWaypoint` 提示，瞬移权限另议。
5. **天气 UI / 修饰**：房间描述与感知/搜索读取 `getWeatherForRoom`；时辰推进时可 `advanceWeatherTo(gameTime)`。
6. **瞬时反馈**：`showMomentFeedback` 改为先 `momentFeedbackQueue.enqueue(...)` 再 `takeNext` 驱动展示；奖励路径传入稳定 `eventId`。

---

**验收表述**：五个工作包均按需求实现并通过指定构建/测试命令；本 Worker **未**修改任何 UI 文件。
