# GhostMUD 叙事管线权威规范 V1

> 状态：权威（Authority）  
> 唯一项目根目录：`D:\git\GameGardwuxia\ghostMUD`  
> 适用范围：房间、人物、事件、线索、场景、完整水墨言路、主动短笺、瞬时浮字、最近日志及其美术资源。  
> 冲突规则：本文件约束叙事数据管线；张望/探索交互以 `aidoc/LOOK_FIND_INTERACTION_AUTHORITY_V1.md` 为最高权威；视觉布局以 `aidoc/UI_ART_DIRECTION_V1.md` 为最高权威。

## 1. 目标与非目标

本管线服务于“有主线剧情轴的半开放箱庭文字冒险”：

1. 主线由 `storyArc / storyChapter / storyPhase` 推进。
2. 箱庭允许玩家错序探索、遗漏支线、改变关系并保留后果。
3. 同一 room、NPC、事件和对话可因武修/灵修、境界、道心、任务、世界旗标、时辰与关系变化而呈现不同文本。
4. 完整水墨言路的分支执行统一交给 Ink/inkjs。
5. 游戏存档、奖励、任务、地图和 UI 状态仍归 GhostMUD 服务层所有，Ink 只负责叙事流。
6. 美术资源只通过稳定 `artId` 引用，剧情正文不得硬编码文件路径。

本轮不做以下事情：

- 不用 Ink 替换房间系统、任务系统、搜索抽取或战斗系统。
- 不把主动短笺、瞬时浮字、最近日志、张望和探索塞入 Ink。
- 不引入第二套可与 GhostMUD 状态直接竞争的“叙事存档”。
- 不把 Narrat、Yarn Spinner 或其他引擎整体嵌入项目。

## 2. 既有设计依据

实现与内容必须同时遵守以下现有文档：

| 文档 | 约束段落 | 本管线落实 |
|---|---|---|
| `aidoc/archive_20260707/docs/narrative_design.md` | 1.1 三层世界、1.2 世界观约束、2.1 叙事层与境界、5.1 双版本叙事原则、8.1 双循环 | path/realm/daoxin/story 条件变体；武修/灵修文本分流 |
| `aidoc/archive_20260707/docs/phase8_unification_design.md` | 2.3 引擎层实现、2.4 行为约束、6.2 信息差五原则、7 术语双轨字典 | 同一稳定实体 ID 下选择内容变体；禁止跨路径术语污染 |
| `aidoc/archive_20260707/docs/dual_desc_constraint.md` | R2 主观不确定化、R3 `desc_awakened`、R5 不可变项、R7 禁止项 | 内容变体只替换文本/资产，不改 room、item、NPC 的稳定 ID |
| `aidoc/archive_20260707/docs/style_anchor.md` | 1 调性比例、4 叙事距离、5 对话风格、意象黑白名单 | 所有 authored 文本仍需人工文风审校 |
| `aidoc/archive_20260707/docs/narrative_writing_rules.md` | 1 文风总纲、2 对白铁则、3 叙事描写、4 禁用表达、6 两步法 | 编剧先写骨架再填正文；编译器只验结构，不替代文风审校 |
| `aidoc/LOOK_FIND_INTERACTION_AUTHORITY_V1.md` | 1 冲突裁决、2 张望、3 探索、5 服务所有权、6 禁止事项 | look/find 继续由 `SceneInteractionService` 和 `SearchService` 结算 |
| `aidoc/UI_ART_DIRECTION_V1.md` | 6.1 三层语义、6.4 NPC 呈现、6.5 引路 NPC、6.6 最近日志、10.4 水墨言路 | 每种文本只能进入合适的展示面；短笺台词不得重复写日志 |

如果历史文档宣称某 Phase “已实现”，但代码与本文件的验收命令不能证明，按“尚未实现”处理。

## 3. 单一事实来源

### 3.1 可人工编辑

- 语义内容：`src/narrative/content/**/*.narrative.json`
- 美术清单：`src/narrative/content/**/*.assets.json`
- 原生分支脚本：`src/narrative/content/**/*.ink`
- 兼容期问剑峰文本：
  - `public/data/wenjianfeng_tutorial_ch1.js`
  - `public/data/wenjianfeng_npc_dialogues.js`

### 3.2 生成文件，禁止人工编辑

- `src/narrative/generated/authored_registry.js`
- `src/narrative/generated/ink_registry.js`
- `dist/**`

`public/**` 是运行时静态源；`dist/**` 是 `npm run build` 的输出。任何人工文本改动只能落在源文件或 `src/narrative/content`，不得改 `dist`。

### 3.3 编译顺序

```text
*.narrative.json + *.assets.json
  -> scripts/compile-content.mjs
  -> generated/authored_registry.js

*.ink + 问剑峰兼容数据
  -> scripts/compile-narrative.mjs
  -> generated/ink_registry.js

generated registries
  -> scripts/validate-narrative.mjs
  -> Vite build
```

开发和构建均先编译叙事：

- `npm run dev`
- `npm run build`
- `npm run narrative:validate`

## 4. 稳定身份与绑定

每个语义实体必须有稳定、小写、可读、不可复用的 ID：

```text
room.wenjianfeng.jianjie.lower
character.wenjianfeng.suxiaotang
event.wenjianfeng.find.baizhi_wreath
conversation.wenjianfeng.suxiaotang.guide
asset: portrait.npc.suxiaotang.default
```

规则：

1. 改名、改文案、换图不得改稳定 ID。
2. 删除过的 ID 永不复用给另一实体。
3. `revision` 表示内容契约修订，不等于剧情进度。
4. 老代码 ID 通过 `bindings` 接入：
   - room 只用 `bindings.roomIds`
   - character 只用 `bindings.characterIds`
   - event 只用 `bindings.eventIds`
5. 同一 legacy ID 最多绑定一个 authored entry；编译/校验遇到冲突必须失败。
6. 文件名只用于组织，不承担运行时身份。

## 5. 自有 Narrative Schema

### 5.1 Entry

```json
{
  "id": "room.wenjianfeng.example",
  "kind": "room",
  "revision": 1,
  "bindings": {
    "roomIds": ["wenjianfeng_example"]
  },
  "content": {
    "description": "通用房间描述。",
    "assets": {
      "room": "room.wenjianfeng.example.day"
    }
  },
  "variants": [
    {
      "id": "destroyed",
      "priority": 300,
      "when": {
        "fact": "state.worldFlags.wenjianfengDestroyed",
        "op": "eq",
        "value": true
      },
      "content": {
        "description": "剧情节点后的替换描述。",
        "assets": {
          "room": "room.wenjianfeng.example.destroyed"
        }
      }
    }
  ]
}
```

合法 `kind`：

- `room`
- `character`
- `event`
- `conversation`
- `scene`
- `clue`

`content` 只放该实体的语义内容与 artId；选择条件一律放 `variants[].when`。

### 5.2 变体裁决

1. 先过滤所有 `when=true` 的变体。
2. 按 `priority` 降序。
3. 只合并第一名变体与基础 `content`。
4. 不叠加多个文本变体。
5. 第一、第二名同优先级时产生 `AMBIGUOUS_VARIANT`；生产内容必须消除歧义。
6. 变体优先级建议：
   - 500：结局/世界毁灭等不可逆世界态
   - 400：主线阶段
   - 300：职业/境界真相层
   - 200：任务与关系
   - 100：时辰、天气等氛围
   - 0：通用文本

高优先级变体必须完整表达其意图，不能依赖另一个低优先级变体被同时应用。

## 6. 统一条件解析器

新内容只允许使用标准条件 AST：

```json
{
  "all": [
    { "fact": "player.path", "op": "eq", "value": "wu" },
    { "fact": "story.phase", "op": "gte", "value": 3 },
    {
      "any": [
        { "fact": "npc.affinity", "op": "gte", "value": 20 },
        { "fact": "flags.saved_suxiaotang", "op": "eq", "value": true }
      ]
    }
  ]
}
```

操作符：

- `eq`, `ne`
- `gt`, `gte`, `lt`, `lte`
- `in`, `nin`
- `contains`
- `exists`

上下文事实根：

- `player.*`：path、realm、faction
- `story.*`：arc、chapter、phase
- `room.*`：id、zoneKind、spaceLayer
- `npc.*`：id、affinity
- `quest.*`：active、completed
- `inventory.*`
- `time.*`：index、name、period
- `weather.*`
- `flags.*`
- `state.*`：兼容既有存档字段

禁止：

- 在 UI 里复制一份条件判断。
- 在内容中写可执行 JavaScript。
- 新内容使用 `{ tutorialPhase: "..." }` 一类浅对象。
- 用条件隐藏世界规则错误，例如让乞丐在问剑峰生成后再由 UI 隐藏。

浅对象、`type: realm/item/quest` 等格式只为 legacy adapter 保留，新增内容不得使用。

## 7. 文本所有权与展示面

### 7.1 房间主描述

归属：`kind=room` 的 `content.description`。

允许：

- 玩家进入 room 时持续可见的场景事实。
- 时辰、天气、职业、境界、主线节点后的动态变体。
- 罗生门信息差。

禁止：

- NPC 连续对白。
- 玩家选择项。
- “你获得了……”等结算反馈。
- 控制台操作流水。

### 7.2 NPC 被动互动与完整水墨言路

归属：

- 人物小记：`kind=character` 的 `content.shortDescription`
- 对话分支：`kind=conversation` 对应的 `.ink`
- 送礼与邀战回应：同一 conversation 下的明确 knot/story，或独立 conversation entry

完整水墨言路只用于：

- 玩家主动交谈。
- 有玩家分支的主动剧情。
- 送礼选择与结果回应。
- 邀战确认。
- 会改变任务、关系、物品或世界状态的选择。

选项文本不硬性限制 15 字，但移动端规则是：单项优先一行，最多两行；通常 2-3 项；复杂语境写在台词区，不把说明塞入按钮。

### 7.3 主动短笺

归属：`kind=scene` 或 character 的结构化 `bark/callout` 内容，不进入 Ink 分支。

只承载：

- 无选择的线性过场台词。
- NPC 主动叫住玩家。
- 苏小棠同行引路。
- 需要逐句播放但不产生分支的剧情。

硬规则：

1. 不显示回应/收回按钮。
2. 玩家点击画面推进，末句关闭。
3. 已由短笺展示的完整台词不得再写入最近日志。
4. 一旦需要玩家选择，从第一句开始使用完整水墨言路，禁止短笺中途“升级”。
5. 短笺不执行奖励、任务、地图迁移等事务；事务由场景/任务服务在明确节点执行。

### 7.4 主页面瞬时浮字

归属：`kind=scene/event` 的 `moment` 语义或服务结算反馈。

适用：

- 获得物品。
- 发现隐路。
- 关系变化。
- 突破、失败、警觉等瞬时状态。

硬规则：

- 无边框、短句、自动浮入浮出。
- 不承载必须阅读的关键线索。
- 可把“结算摘要”同步写最近日志，但不得把相同演出句原样复制两遍。

### 7.5 最近日志

归属：行为与世界回应的摘要，不是剧情正文库。

允许：

- 移动、查看、探索、战斗、物品与任务结算。
- 第三视角行为摘要。
- 未在短笺/完整言路中展示过的短环境回声。
- 关键事务的可回溯结果。

禁止：

- 完整正式对话。
- 已由主动短笺展示的逐句台词。
- 房间主描述全文。
- `MovementService` 的抵达记录只允许写目的地名称或行为摘要，不得拼接 `getRoomDesc()`、`room.desc` 或时辰变体描述。
- 长篇人物小记。
- 用日志代替任务/线索数据库。

### 7.6 张望与探索

完全遵守 `LOOK_FIND_INTERACTION_AUTHORITY_V1.md`：

- 张望是 look、门户与地图层切换。
- 探索是 find、唯一/任务/合规随机事件结算。
- 两者共享视觉外壳但数据源和职责不同。
- 两者不在江湖主页面展开可变高面板。
- 探索事件可引用 `kind=event` 与 `assets.illustration`，抽取和唯一性仍归 `SearchService`。

## 8. 可复数展示与不可复数展示

允许复数链接：

- 稳定 character ID 可同时被 NPC 名帖、人物页、完整言路引用。
- 同一 artId 可被人物页和水墨言路引用。
- 任务“结果摘要”可进入瞬时浮字和最近日志，但文案字段应区分 `momentText` 与 `logText`。
- room 稳定 ID 可同时绑定木匾、route-sketch、描述和背景资产。
- 关键线索可同时有“原台词引用”和结构化 clue 记录，但二者是不同字段。

禁止复数展示：

- 短笺完整台词同时进入最近日志。
- 完整水墨言路台本同时进入房间描述或最近日志。
- 玩家选项标签直接当作玩家实际说出的台词；使用 Ink 的 choice text 与 output/player line 分离。
- 资产路径散落在多个业务文件中。
- 同一事务由 Ink command、UI 点击器和服务层各执行一次。

## 9. Ink/inkjs 边界

### 9.1 Ink 负责

- 台词顺序。
- 玩家分支。
- 分支汇流。
- 只属于当前 conversation 的局部变量。
- 对话可见选项。
- 通过 tags 发出结构化命令意图。

### 9.2 Ink 不负责

- 直接改 `game.state`。
- 直接发物品、扣钱或推进任务。
- 生成随机房间/NPC。
- 渲染 UI。
- 保存全局玩家状态。
- 决定 look/find 事件抽取。
- 决定移动日志应显示房间描述还是摘要；该输出通道由移动服务与 Narrative Schema 约束。

### 9.3 变量注入

会话创建时注入只读上下文快照：

- `player_path`
- `player_realm`
- `story_arc`
- `story_chapter`
- `story_phase`
- `room_id`
- `npc_affinity`

只有 Ink 中已声明的全局变量才接收注入。恢复兼容快照时，以快照内变量为准，不覆盖玩家已经走出的会话状态。

### 9.4 命令

当前 allowlist：

- `set_flag`
- `set_story`
- `start_quest`
- `give_item`
- `moment`
- `log`

所有会改变游戏状态的命令必须带全局唯一 `payload.id`：

```ink
# node:receive_token
# speaker:旁白
# command:give_item \{"id":"cmd.wjf.ch1.token.001","item":\{"id":"quest_token","name":"信物"\},"unique":true\}
你接过那件东西。
```

独立 tag 必须写在它所修饰的文本之前；写在文本之后会落入下一次 Continue，当前 frame 无法执行该命令。JSON 的每个花括号还必须写成 `\\{` 与 `\\}`，否则 Ink 会把它当作自身语法并从 tag 中移除；编译器会拒绝未转义的 command JSON。

命令由 `NarrativeCommandRouter` 执行。未知命令直接报错；重复 ID 由 `state.narrativeCommandLedger` 跳过。禁止让 Ink 直接调用任意 JS 函数。

### 9.5 恢复

会话快照必须包含：

- story ID
- story revision
- Ink story state
- 当前 frame
- 已选分支元数据

revision 不匹配时不盲目载入旧 Ink state；由调用方回到安全节点或安全结束。奖励与任务依赖命令幂等账本，不依赖 UI nodeId 推断是否已结算。

## 10. 资产注册表

资产只写入 `*.assets.json`：

```json
{
  "id": "portrait.npc.example.default",
  "type": "portrait",
  "src": "/assets/portraits/example.webp",
  "alt": "示例人物立绘",
  "aspect": "portrait",
  "focalPoint": { "x": 0.5, "y": 0.28 },
  "fallback": "portrait.npc.generic",
  "aliases": ["legacy_example_npc"],
  "revision": 1
}
```

规则：

1. `src` 以 `/` 开头时，文件必须真实存在于 `public` 下。
2. 业务内容只引用 `id` 或受控 alias。
3. `focalPoint` 是 0-1 坐标，供圆形头像、方形卡和事件页统一裁切。
4. `fallback` 必须指向已注册资产。
5. 同一 alias 不得属于两个资产。
6. 路径/剧情美术差异使用资产 `variants`，条件规则与文本相同。
7. 美术替换只改 registry，不修改 room/NPC/event 业务代码。
8. 资源删除前先通过全库引用扫描和 `npm run narrative:validate`。

## 11. 主线轴与箱庭状态

主线轴：

```text
storyArc -> storyChapter -> storyPhase
```

箱庭状态：

- quests
- worldFlags / narrativeFlags
- discovered rooms/routes
- inventory
- NPC affinity/memory
- unique search events
- player path/realm/daoxin
- time/weather

文本解析时两者组成同一 Context，但职责不同：

- 主线轴决定“世界进行到哪里”。
- 箱庭状态决定“玩家以什么身份、带着什么后果看见它”。

不要把所有剧情进度压成一个巨型 `tutorialPhase`。新内容应使用 story axis 表示章回，用 flags/quests 表示局部后果。兼容字段可由 context adapter 暂时映射。

典型动态房间优先级：

1. 世界毁灭/重建状态。
2. 主线章回状态。
3. 武修/灵修与境界视角。
4. 任务/选择后果。
5. 时辰/天气气氛。
6. 通用描述。

## 12. 编剧工作流

1. 先确定稳定实体 ID 与所属 kind。
2. 列出该内容会出现在哪个展示面。
3. 写基础内容。
4. 按“世界态 > 主线 > 路径 > 任务/关系 > 时辰”写必要变体。
5. 有分支的完整对话写 `.ink`。
6. 需要改变世界状态时只发 allowlisted command，并提供唯一 command ID。
7. 所有图像写 artId，不写路径。
8. 运行 `npm run narrative:validate`。
9. 用最小可达存档预览每个高优先级变体。
10. 由人工按 narrative writing rules 审稿。

禁止自动摘要或自动截断关键线索。选择前语境需要压缩时，由编剧提供专用 prompt/recap 字段。

## 13. Legacy 迁移顺序

当前适配：

- WJF `companionProfiles.*.dialogueGraph` 已编译为 Ink。
- `WENJIANFENG_NPC_DIALOGUES.entries` 的线性台词、选择与变体已编译为 Ink。
- room、NPC、ROOM_SEARCH 由 `legacy_adapter.js` 注册为动态 entry。
- 原有 `type: realm/item/quest` 等条件由统一 resolver 兼容。
- 原有奖励字段通过 `legacyResult` 暂时交回 `NpcService`。

迁移优先级：

1. 会改变任务/物品/关系的 legacy 对话。
2. 主线关键 NPC。
3. 路径/境界双版本房间和 NPC。
4. 唯一探索事件。
5. 普通支线 NPC。
6. 无状态随机闲聊。

兼容层只允许缩小，不允许新增依赖。新 authored 内容不得写入 `legacyResult`。旧随机 NPC 的运行时随机台词暂不强制编译成 Ink；它们不是关键完整言路，迁移前继续走 fallback。

## 14. 从 Ink、Yarn Spinner、Narrat 借鉴什么

### Ink/inkjs

借鉴：

- choices、knots/stitches、diverts 与分支汇流。
- choice text 与实际输出文本分离。
- tags 作为“脚本向宿主发意图”的通道。
- 对重写友好的纯文本流程。

不照搬：

- 不让 Ink 全局变量成为 GhostMUD 世界状态的第二事实源。

### Yarn Spinner

借鉴：

- Dialogue Runner 把 lines/options/commands 交给宿主，而不是自行渲染和落库。
- Variable Storage 由游戏提供。
- custom commands 需要受控注册。

不照搬：

- 不再引入一套并行语言与运行时；本项目已有 inkjs。
- 不允许任意 custom command 暴露游戏内部方法。

### Narrat

借鉴：

- label/function 级内容组织。
- command reference、config、characters/portraits、localization 分层。
- 热编译与快速预览对大体量文本生产很重要。

不照搬：

- 不用 Narrat 自带 quests/items/stats 替换 GhostMUD 已有服务。
- 不让脚本随意直接修改 quests/items 等内部对象。

参考：

- Ink Writing with Ink: https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md
- inkjs: https://github.com/y-lohse/inkjs
- Yarn Spinner Commands: https://docs.yarnspinner.dev/write-yarn-scripts/scripting-fundamentals/commands
- Yarn Spinner Variables: https://docs.yarnspinner.dev/3.1/write-yarn-scripts/scripting-fundamentals/logic-and-variables
- Narrat Language Syntax: https://docs.narrat.dev/scripting/language-syntax.html
- Narrat Documentation: https://docs.narrat.dev/

## 15. Worker 边界

Worker 可以：

- 新增符合 Schema 的 `*.narrative.json`、`*.assets.json`、`*.ink`。
- 为已有稳定 ID 写新变体。
- 运行 compile/validate/build。
- 在报告中列出新增 ID、conditions、commands 和 assets。

Worker 不可以：

- 修改 `src/narrative/generated/**` 或 `dist/**`。
- 在 UI 点击器中直接发奖励、改任务、改关系。
- 新增未 allowlist 的 narrative command。
- 绕过 `NarrativeService` 从业务代码直接找资产路径。
- 用同优先级变体赌数组顺序。
- 把短笺完整台词重复写入最近日志。
- 把 Ink 用到张望、探索抽取或战斗结算。
- 修改稳定 ID 来“解决”旧存档兼容问题。
- 在 `D:\MUD\ghostMUD` 开发、构建或验收。

Worker 报告必须列明：

1. 源文件。
2. 生成文件（只列，不手改）。
3. 新增/修改的稳定 ID。
4. 每个变体的 priority 与 when。
5. 每个 command 的唯一 ID。
6. 每个 artId 对应文件。
7. 运行的校验命令与原始结果。
8. 未迁移 legacy 边界。

## 16. 验收门

结构验收：

- Schema 全通过。
- ID、variant ID、alias 无重复。
- 本地资产存在，fallback 可解析。
- Ink 全部编译，索引 story 存在。
- 同优先级歧义为 0。

行为验收：

- 相同 context 得到确定的同一变体。
- story phase 改变时 room/NPC 文本可替换。
- 武修/灵修看见不同文本且术语不串线。
- NPC 关系可改变人物小记和对话。
- 对话恢复不重复执行事务。
- 张望/探索仍遵守各自权威，不被 Ink 接管。
- 主动短笺不重复写最近日志。
- 旧存档经 save schema 默认值后能继续运行。

发布门：

```powershell
npm run narrative:validate
npm run build
```

任一命令失败，禁止声称“叙事管线已验收”。

## 17. 当前实现覆盖与已知迁移债

已落地：

- Narrative/Condition/Asset Schema。
- 统一 condition resolver。
- NarrativeRegistry 的优先级变体解析。
- AssetRegistry 的 alias、focal point、fallback 与条件变体。
- Ink/inkjs 会话、选择、快照与版本兼容。
- 命令 allowlist 与 command ledger 幂等。
- 问剑峰已 authored 对话向 Ink 的兼容编译。
- room/NPC/search event 的 legacy adapter。
- authored content 与 asset compiler。
- build 前 compile/validate。
- 存档 story axis 与 narrative ledger 默认字段。

迁移债：

1. `legacyResult` 仍由 `NpcService` 兼容执行；新内容必须改为唯一 ID 命令。
2. 大多数 room/NPC/event 仍来自 JS legacy 数据；应逐区迁入 authored JSON。
3. 原生 `.ink` 内容数量尚少；当前 29 个故事主要由问剑峰 legacy 数据生成。
4. content preview/可视化剧情图编辑器尚未实现。
5. 本地化 string key 尚未拆出；未来不得使用字符 index 绑定线索，应使用稳定 span/segment ID。
6. 资产 registry 已建立，但历史业务文件中仍有直接图片路径待逐步消除。

这六项不是推翻现架构的理由，而是后续版本的明确迁移队列。
