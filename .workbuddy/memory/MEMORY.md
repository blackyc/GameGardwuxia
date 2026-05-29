# GameGard 项目长期记录

## 项目概况
- 名称：杀戮尖塔 2 风格卡牌 Roguelike（GameGard / Slay the Spire 2）
- 引擎：Godot 4.6 + .NET（GDScript + C# 混合）
- 视口：1920×1080，拉伸模式 canvas_items / expand
- 当前主场景：`res://scenes/combat/battle_scene.tscn`（战斗场景，可直接 F5 测试）

## 资源规范
- 地图背景图放在 `images/map/`
- 卡牌图片放在 `AllbackupAssets/card-pngs/`（备份），正式资源待整理
- 背景牌桌 map2.png：2560×1440，res://images/map/map2.png

## 已完成场景
| 场景 | 路径 | 状态 |
|---|---|---|
| 卡牌图鉴 | scenes/screens/card_library/card_library.tscn | 已完成 |
| 地图牌桌 | scenes/screens/map/map_screen.tscn | 基础框架完成，待接入地图逻辑 |
| 战斗主场景 | scenes/combat/battle_scene.tscn | 核心回路完成（抽牌/出牌/敌人/回合），UI 持续完善中 |

## 架构原则
- 三层分离：逻辑层（纯C#）/ 节点层（C# Godot Node）/ 场景层（.tscn）
- EventBus Autoload 跨场景通信
- GDScript 全静态类型，信号 snake_case，组件化节点设计
- Autoload：SentryInit / FmodManager / MCPRuntimeProbe / EventBus / BattleManager

## Godot 4.4+ 关键规则
- **禁止手动创建 `.gd.uid` 文件** — 让 Godot 编辑器自己生成。手动创建的 UID 与 Godot 内部数据库不匹配会导致场景树塌缩
- **禁止在 TSCN 中手动写 `uid` 值** — ext_resource 只用 `path` 属性，Godot 自动关联 UID
- **`.tmp` 文件威胁** — Godot 编辑器崩溃时可能残留 `.tscnXXXXXXXXXX.tmp`，旧节点结构会导致全部 @onready 路径失效
- **`await get_tree().process_frame`** — Control 节点使用 anchor 布局时，`_ready()` 中 `size` 尚未计算，需等一帧

## 战斗系统架构（参考 STS2 C# → GDScript）
| STS2 参考 | 本实现 | 说明 |
|---|---|---|
| CardModel (C#) | CardData (GDScript Resource) | 卡牌数据定义 |
| NPlayerHand + NHandCardHolder | HandArea + BattleCard | 手牌管理+渲染 |
| CardPileCmd + CombatManager | BattleManager Autoload | 牌堆+回合+玩家状态 |
| Hook 系统 | EventBus Autoload | 16 个信号跨系统通信 |
| NCombatUi | BattleScene | 战斗 UI 聚合 |
| HandPosHelper | FAN_POSITIONS 预定义表 | 1-10 张手牌弧形位置
