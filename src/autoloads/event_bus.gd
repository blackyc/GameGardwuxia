## EventBus — 全局事件总线
## 所有跨场景/跨系统通信都通过这里的信号完成
## 注册为 Autoload，确保始终存在
extends Node

#region 卡牌事件

## 卡牌被抽到手牌
signal card_drawn(card: CardData)

## 卡牌被弃置
signal card_discarded(card: CardData)

## 卡牌被打出（扣费后）
signal card_played(card: CardData)

## 卡牌被消耗（从游戏中永久移除）
signal card_exhausted(card: CardData)

#endregion

#region 回合事件

## 回合开始 — 触发抽牌
signal turn_started()

## 回合结束 — 触发弃牌+洗牌
signal turn_ended()

#endregion

#region 能量事件

## 能量值变化
signal energy_changed(current: int, max_energy: int)

#endregion

#region 战斗结果事件

## 敌人死亡
signal enemy_defeated()

## 玩家死亡
signal player_defeated()

## 战斗胜利
signal battle_won()

## 战斗失败
signal battle_lost()

#endregion

#region 战斗流程

## 初始化牌组完成
signal deck_initialized(deck_size: int)

## 牌堆清空（需要洗牌）
signal draw_pile_empty()

## 手牌数量变化
signal hand_size_changed(count: int)

#endregion
