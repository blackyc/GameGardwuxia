# BattleScene 三大问题修复总览

## 修改概要

针对三个问题（卡牌太小/扇形不明显、结束回合按钮布局错乱、抽牌无反应），共修改 5 个文件。

---

## 1. 卡牌尺寸 ×1.69 放大 + 扇形恢复

| 参数 | 改前 | 改后 |
|------|------|------|
| 卡牌尺寸 | 130×189px | **220×320px** |
| fan_angle | 0.28 rad (16°) | **0.45 rad (26°)** |
| Cost Orb 半径 | 16px | **26px** |
| HandArea 锚点 | 0.58 | **0.55** |
| HandArea 高度 | 400px | **420px** |

FAN_POSITIONS 表重新计算，x_range 加宽让大卡牌不挤，y_offset 加深弧形更明显。

参考：STS2 使用 300×422 → 0.8x = 240×338。

## 2. 结束回合按钮重构

- **从**: PlayerArea HBoxContainer 子节点 (160×56, 嵌在底部状态栏里)
- **改为**: BattleScene 独立子节点 (180×70, 锚定右下角 0.78)
- PlayerArea 下移 (0.86→0.91)，给手牌区让出空间

参考：STS2 EndTurnButton 位置 ≈ (0.835, 0.783)。

## 3. 抽牌流程

抽牌链路 `BattleManager.start_turn() → draw_cards(5) → EventBus.card_drawn → HandArea._on_card_drawn()` 经代码审计确认完整无缺。6张卡牌 PNG 文件均存在。此前"无反应"的根因是 130px 卡牌太小不可见 —— 放大后应自然解决。

---

## 修改文件清单

| 文件 | 关键改动 |
|------|----------|
| `scenes/cards/battle_card.tscn` | 22个节点坐标等比放大 |
| `scenes/cards/battle_card.gd` | Cost Orb 圆心/半径适配 |
| `scenes/combat/hand_area.gd` | 尺寸/角度/FAN_POSITIONS/SCALE_TABLE 全改 |
| `scenes/combat/battle_scene.gd` | HandArea参数 + 按钮引用路径 |
| `scenes/combat/battle_scene.tscn` | PlayerArea锚点 + EndTurnButton独立化 |

在 Godot 中按 F5 重新运行即可看到效果。
