# 抽卡系统实现 — 完成报告

## 架构参考
从 STS2 的 C# 架构翻译为 GDScript 简化版，保留核心回路。

## STS2 → GameGard 映射

| STS2 组件 | GameGard 实现 | 说明 |
|-----------|--------------|------|
| `CardModel` (C#) | `CardData` (Resource) | 卡牌静态数据 |
| `NPlayerHand` + `NHandCardHolder` | `HandArea` + `BattleCard` | 手牌管理+卡牌渲染 |
| `CardPileCmd` + `CombatManager` | `BattleManager` (Autoload) | 牌堆/能量/回合管理 |
| `Hook` 系统 | `EventBus` (Autoload) | 信号驱动的事件总线 |
| `NCombatUi` | `BattleScene` | 战斗主场景 |
| `NCard` | `BattleCard` (TextureRect) | 手中可打出卡牌 |

## 数据流（完整回路）

```
回合开始 → 抽牌堆为空？→ 弃牌堆洗入（Fisher-Yates洗牌）
    ↓
抽 5 张牌 → EventBus.card_drawn → HandArea 创建 BattleCard（扇形布局）
    ↓
玩家拖拽/点击 BattleCard → 扣能量 → EventBus.card_played → CardEffect 执行效果
    ↓
卡牌进弃牌堆 → 检查敌人是否死亡 → 检查玩家是否死亡
    ↓
[结束回合] → 弃掉所有手牌 → 敌人行动（固定伤害）→ 清空格挡 → 重新抽牌
```

## 新增文件（10 个）

### 核心层
- `src/resources/card_data.gd` — CardData Resource（费用/类型/伤害/格挡/描述）
- `src/autoloads/event_bus.gd` — 全局事件总线（16 个信号）
- `src/autoloads/battle_manager.gd` — 战斗状态核心（牌堆/能量/回合/HP）
- `src/systems/card_effect.gd` — 卡牌效果执行器

### UI 组件
- `scenes/cards/battle_card.gd` — 手中可打出卡牌（悬停放大/拖拽/费用颜色）
- `scenes/cards/battle_card.tscn` — 卡牌场景（130×189，费用角标+名称+类型条）
- `scenes/combat/hand_area.gd` — 手牌管理（STS2 弧形排列/入场动画/飞出动画）
- `scenes/combat/enemy.gd` — 敌人组件（HP条/格挡/受击闪红）
- `scenes/combat/battle_scene.gd` — 战斗主场景（回合循环/日志/胜负判定）
- `scenes/combat/battle_scene.tscn` — 战斗 UI 布局

### 修改文件
- `project.godot` — 注册 EventBus + BattleManager autoload，主场景切 BattleScene

## 敌人配置
- 名称：幽冥刀客
- HP：40
- 每回合攻击：5 点伤害

## 测试牌组（6 张武学卡牌）
| 卡牌 | 类型 | 费用 | 效果 |
|------|------|------|------|
| 万蛊噬心 | 攻击 | 1 | 8 伤害 |
| 九阳神功 | 攻击 | 2 | 15 伤害 |
| 修罗化血阵 | 攻击 | 1 | 6 伤害 |
| 两仪桩功 | 技能 | 1 | 6 格挡 |
| 佛怒唐莲 | 技能 | 2 | 12 格挡 |
| 聚气诀 | 技能 | 1 | 4 格挡 |

## 如何测试
直接 F5 运行项目 → 自动进入 BattleScene → 第一回合开始自动抽 5 张到手中
→ 拖拽卡牌向上打出 / 能量不够显示红色
→ 点击【结束回合】完成循环

## 后续扩展
- [ ] 多个敌人
- [ ] 能力牌（Power）与 Buff 系统
- [ ] 消耗（Exhaust）效果
- [ ] 升级系统
- [ ] 遗物系统
- [ ] 地图节点 → 进入战斗
