## BattleManager — 战斗状态核心 Autoload
## 管理牌堆（抽牌堆/手牌/弃牌堆/消耗牌堆）、能量、回合流程
extends Node

#region 牌堆状态

## 抽牌堆 — 从这里抽卡
var draw_pile: Array[CardData] = []

## 手牌 — 当前可打出的卡牌
var hand: Array[CardData] = []

## 弃牌堆 — 打出的卡牌和回合结束弃掉的卡牌
var discard_pile: Array[CardData] = []

## 消耗牌堆 — 永久移出本场战斗的卡牌
var exhaust_pile: Array[CardData] = []

#endregion

#region 能量状态

var current_energy: int = 3
var max_energy: int = 3
var max_hand_size: int = 99  # 无限制抽牌
var draw_per_turn: int = 5

#endregion

#region 玩家状态

var player_max_hp: int = 70
var player_current_hp: int = 70
var player_block: int = 0

#endregion

#region 初始化

## 用卡牌数据列表初始化牌组
func init_deck(deck_data: Array[CardData]) -> void:
    draw_pile.clear()
    hand.clear()
    discard_pile.clear()
    exhaust_pile.clear()

    for card: CardData in deck_data:
        draw_pile.append(card)

    shuffle_draw_pile()
    EventBus.deck_initialized.emit(draw_pile.size())


## 洗牌 — Fisher-Yates 洗牌算法
func shuffle_draw_pile() -> void:
    if draw_pile.is_empty():
        return

    var rng := RandomNumberGenerator.new()
    rng.randomize()
    var n: int = draw_pile.size()
    for i: int in range(n - 1, 0, -1):
        var j: int = rng.randi_range(0, i)
        var temp: CardData = draw_pile[i]
        draw_pile[i] = draw_pile[j]
        draw_pile[j] = temp


## 将弃牌堆洗入抽牌堆（抽牌堆空时调用）
func reshuffle_discard_into_draw() -> void:
    if discard_pile.is_empty():
        push_warning("BattleManager: 弃牌堆为空，无法洗入抽牌堆")
        return

    print("[BattleManager] 弃牌堆(%d张) → 洗入抽牌堆" % discard_pile.size())
    draw_pile = discard_pile.duplicate()
    discard_pile.clear()
    shuffle_draw_pile()

#endregion

#region 抽牌

## 从抽牌堆抽 N 张卡到手牌
func draw_cards(count: int) -> void:
    for _i: int in range(count):
        if not draw_card():
            break


## 抽一张卡到手牌。返回是否成功
func draw_card() -> bool:
    if hand.size() >= max_hand_size:
        push_warning("BattleManager: 手牌已满(%d/%d)" % [hand.size(), max_hand_size])
        return false

    # 抽牌堆空了 → 尝试洗回弃牌堆
    if draw_pile.is_empty():
        if discard_pile.is_empty():
            # 真的没牌了
            print("[BattleManager] 无牌可抽")
            return false
        reshuffle_discard_into_draw()

    var card: CardData = draw_pile.pop_back()
    hand.append(card)
    EventBus.card_drawn.emit(card)
    EventBus.hand_size_changed.emit(hand.size())
    print("[BattleManager] 抽到: %s（手牌 %d 张，抽牌堆剩 %d 张）" % [card.card_name, hand.size(), draw_pile.size()])
    return true

#endregion

#region 出牌

## 尝试打出手牌中的某张卡牌
## 返回是否成功（费用够不够）
func play_card(card: CardData) -> bool:
    if not hand.has(card):
        push_error("BattleManager: 试图打出不在手牌中的卡牌: %s" % card.card_name)
        return false

    if current_energy < card.cost:
        print("[BattleManager] 能量不足！需要 %d，当前 %d" % [card.cost, current_energy])
        return false

    # 扣费
    current_energy -= card.cost
    EventBus.energy_changed.emit(current_energy, max_energy)

    # 移出手牌
    hand.erase(card)
    EventBus.hand_size_changed.emit(hand.size())

    # 发送打出事件（由效果系统处理具体效果）
    EventBus.card_played.emit(card)

    # 放入弃牌堆
    _send_to_discard(card)

    print("[BattleManager] 打出: %s（剩余能量 %d）" % [card.card_name, current_energy])
    return true


## 弃掉手牌中的一张卡（不移入弃牌堆，只是不打了 — 实际游戏中很少用到）
func discard_single_card(card: CardData) -> void:
    if not hand.has(card):
        return
    hand.erase(card)
    EventBus.hand_size_changed.emit(hand.size())
    _send_to_discard(card)


#endregion

#region 弃牌堆操作

## 卡牌进入弃牌堆
func _send_to_discard(card: CardData) -> void:
    discard_pile.append(card)
    EventBus.card_discarded.emit(card)


## 弃掉所有手牌（回合结束时）
func discard_hand() -> void:
    var cards_to_discard: Array[CardData] = hand.duplicate()
    for card: CardData in cards_to_discard:
        hand.erase(card)
        discard_pile.append(card)
        EventBus.card_discarded.emit(card)

    if not cards_to_discard.is_empty():
        print("[BattleManager] 弃掉 %d 张手牌" % cards_to_discard.size())

    EventBus.hand_size_changed.emit(hand.size())

#endregion

#region 消耗

## 消耗一张卡牌（永久移出本场战斗）
func exhaust_card(card: CardData) -> void:
    if hand.has(card):
        hand.erase(card)
        EventBus.hand_size_changed.emit(hand.size())
    elif discard_pile.has(card):
        discard_pile.erase(card)
    elif draw_pile.has(card):
        draw_pile.erase(card)

    exhaust_pile.append(card)
    EventBus.card_exhausted.emit(card)
    print("[BattleManager] 消耗: %s" % card.card_name)

#endregion

#region 回合管理

## 开始新回合：回满能量 → 抽牌
func start_turn() -> void:
    # 清空敌人的格挡（如果有）
    EventBus.turn_started.emit()

    current_energy = max_energy
    EventBus.energy_changed.emit(current_energy, max_energy)

    draw_cards(draw_per_turn)


## 结束回合：弃掉所有手牌
func end_turn() -> void:
    discard_hand()
    EventBus.turn_ended.emit()

#endregion

#region 玩家状态

## 玩家受到伤害（先扣格挡，再扣血）
func player_take_damage(amount: int) -> void:
    if amount <= 0:
        return

    var remaining: int = amount

    # 先扣格挡
    if player_block > 0:
        var blocked: int = mini(player_block, remaining)
        player_block -= blocked
        remaining -= blocked
        print("[BattleManager] 格挡吸收了 %d 点伤害" % blocked)

    if remaining > 0:
        player_current_hp = maxi(player_current_hp - remaining, 0)
        print("[BattleManager] 玩家受到 %d 点伤害，剩余 HP: %d" % [remaining, player_current_hp])

    if player_current_hp <= 0:
        EventBus.player_defeated.emit()
        EventBus.battle_lost.emit()


## 玩家获得格挡
func player_add_block(amount: int) -> void:
    if amount <= 0:
        return
    player_block += amount
    print("[BattleManager] 获得 %d 点格挡（当前: %d）" % [amount, player_block])


## 玩家回合开始时清空格挡（由 BattleScene 调用）
func clear_player_block() -> void:
    player_block = 0

#endregion

#region 查询

func can_play_card(card: CardData) -> bool:
    return hand.has(card) and current_energy >= card.cost


func get_draw_pile_count() -> int:
    return draw_pile.size()


func get_discard_pile_count() -> int:
    return discard_pile.size()


func get_hand_count() -> int:
    return hand.size()

#endregion
