## CardEffect — 卡牌效果执行器
## 连接到 BattleScene，响应 card_played 信号
## 根据 CardData 的 card_type 执行不同的效果
class_name CardEffect
extends Node

## 对敌人执行攻击伤害
func execute_attack(card: CardData, enemy: Enemy) -> void:
    if card.damage <= 0:
        print("[CardEffect] %s 没有伤害值，跳过" % card.card_name)
        return

    print("[CardEffect] %s 对 %s 造成 %d 点伤害！" % [card.card_name, enemy.enemy_name, card.damage])

    # 伤害动画延迟
    await _wait_seconds(0.15)
    enemy.take_damage(card.damage)

    # 受击反馈延迟
    await _wait_seconds(0.3)


## 对玩家执行格挡
func execute_skill(card: CardData) -> void:
    BattleManager.player_add_block(card.block)


## 执行能力牌（TODO: 需要一个 buff 系统）
func execute_power(card: CardData) -> void:
    print("[CardEffect] 能力牌效果尚未实现: %s" % card.card_name)


## 执行一张卡牌的效果（自动判断类型）
func execute_card(card: CardData, enemy: Enemy) -> void:
    match card.card_type:
        CardData.CardType.ATTACK:
            await execute_attack(card, enemy)
        CardData.CardType.SKILL:
            execute_skill(card)
        CardData.CardType.POWER:
            execute_power(card)


func _wait_seconds(duration: float) -> void:
    await get_tree().create_timer(duration).timeout
