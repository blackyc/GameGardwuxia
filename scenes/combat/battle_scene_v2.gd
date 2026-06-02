## BattleSceneV2 — 江湖对决四阶段战斗场景
## 架构: BattleManager (autoload) 管理牌堆, HandArea 显示手牌, EventBus 驱动 UI 更新
## 四阶段: PREPARATION(准备) → JUDGMENT(判定) → ACTION(出牌拔河) → RESOLUTION(结算)
extends Control

#region Autoload 引用（解决 Godot 解析器无法识别 Autoload 的问题）
var BM: Node ## BattleManager 单例引用
var EB: Node ## EventBus 单例引用
#endregion

#region 信号（与旧 API 兼容）
signal phase_changed(new_phase: String)
signal turn_ended
signal battle_ended
#endregion

#region 节点引用（对应 battle_scene_v2.tscn 中的现有节点）
@onready var background: TextureRect = $Background
@onready var turn_label: Label = $TurnLabel

# 玩家区域
@onready var player_hp_label: Label = $PlayerArea/PlayerHP
@onready var player_block_label: Label = $PlayerArea/PlayerBlock
@onready var player_energy_label: Label = $PlayerArea/PlayerEnergy
@onready var player_portrait: TextureRect = $PlayerArea/PlayerPortrait

# 敌人区域
@onready var enemy_hp_label: Label = $EnemyArea/EnemyHP
@onready var enemy_block_label: Label = $EnemyArea/EnemyBlock
@onready var enemy_portrait: TextureRect = $EnemyArea/EnemyPortrait

# 手牌区（已修复: 脚本指向 hand_area.gd, card_scene 设为 battle_card.tscn）
@onready var hand_area: HandArea = $HandArea

# 抽牌堆/弃牌堆按钮
@onready var draw_pile_button: Button = $DrawPilePanel/DrawPileButton
@onready var discard_pile_button: Button = $DiscardPilePanel/DiscardPileButton

# 结束回合按钮
@onready var end_turn_button: Button = $EndTurnButton

# 战斗日志
@onready var battle_log: RichTextLabel = $BattleLog/LogText

#endregion

#region 战斗阶段枚举
enum CombatPhase {
    PREPARATION,  ## 准备：放置暗盖判定卡
    JUDGMENT,      ## 判定：翻牌计算总战力，确定劣势方
    ACTION,        ## 出牌：劣势方出牌，优势方回应（拔河循环）
    RESOLUTION     ## 结算：宣告放弃获得破绽，清场补牌
}

const PHASE_NAMES := {
    CombatPhase.PREPARATION: "准备阶段",
    CombatPhase.JUDGMENT: "判定阶段",
    CombatPhase.ACTION: "出牌阶段",
    CombatPhase.RESOLUTION: "结算阶段"
}
#endregion

#region 核心状态
var current_phase: CombatPhase = CombatPhase.PREPARATION
var turn_count: int = 0
var is_combat_active: bool = false

## 玩家状态（从 BattleManager 读取，也用于本地显示）
var player_hp: int = 70
var player_max_hp: int = 70
var player_block: int = 0
var player_energy: int = 3
var player_max_energy: int = 3
var player_flaws: int = 0

## 敌人状态（简化）
var enemy_hp: int = 70
var enemy_max_hp: int = 70
var enemy_block: int = 0
var enemy_energy: int = 3
var enemy_flaws: int = 0

## 判定区
var player_judgment_card: CardData = null  ## 玩家放入判定区的卡
var enemy_judgment_card: CardData = null   ## 对手放入判定区的卡

## 当前出牌方（劣势方先出）
var is_player_disadvantaged: bool = false
var is_first_disadvantage_this_turn: bool = true

## 出牌循环计数（防止死循环）
var action_play_count: int = 0
const MAX_ACTION_PLAYS: int = 20

## 对手已出牌记录
var enemy_has_acted_this_action: bool = false

## 拖拽到判定区的卡
var _pending_judgment_card: CardData = null
var _judgment_card_node: Control = null

## 对手出牌队列（模拟用）
var _enemy_action_queue: Array[Dictionary] = []

## 本地牌组管理（BattleManager 不存在时的降级处理）
var _local_deck: Array[CardData] = []
var _local_draw_pile: Array[CardData] = []
var _local_hand: Array[CardData] = []
var _local_discard_pile: Array[CardData] = []
var _local_exhaust_pile: Array[CardData] = []

#endregion

#region 资源路径
const MAP_PATH := "res://AllbackupAssets/mapbackup/map2.png"
const PLAYER_TEX_PATH := "res://images/characters/player1.png"
const ENEMY_TEX_PATH := "res://images/characters/player2.png"
#endregion

#region 测试卡组配置（正式版从外部加载）
const TEST_DECK_CONFIG: Array[Dictionary] = [
    {"name": "万蛊噬心", "cost": 1, "power": 8, "type": CardData.CardType.ATTACK, "tex": "res://AllbackupAssets/card-pngs/万蛊噬心.png"},
    {"name": "两仪桩功", "cost": 0, "power": 2, "type": CardData.CardType.SKILL, "tex": "res://AllbackupAssets/card-pngs/两仪桩功.png"},
    {"name": "九阳神功", "cost": 2, "power": 12, "type": CardData.CardType.ATTACK, "tex": "res://AllbackupAssets/card-pngs/九阳神功.png"},
    {"name": "佛怒唐莲", "cost": 1, "power": 6, "type": CardData.CardType.ATTACK, "tex": "res://AllbackupAssets/card-pngs/佛怒唐莲.png"},
    {"name": "修罗化血阵", "cost": 2, "power": 10, "type": CardData.CardType.SKILL, "tex": "res://AllbackupAssets/card-pngs/修罗化血阵.png"},
    {"name": "聚气诀", "cost": 0, "power": 1, "type": CardData.CardType.SKILL, "tex": "res://AllbackupAssets/card-pngs/聚气诀.png"},
    {"name": "毒掌", "cost": 1, "power": 5, "type": CardData.CardType.ATTACK, "tex": "res://AllbackupAssets/card-pngs/毒掌.png"},
    {"name": "寒冰绵掌", "cost": 1, "power": 4, "type": CardData.CardType.ATTACK, "tex": "res://AllbackupAssets/card-pngs/寒冰绵掌.png"},
]
#endregion

#region 生命周期

func _ready() -> void:
    print("[BattleSceneV2] 初始化中...")

    # 初始化 Autoload 引用
    BM = get_node_or_null("/root/BattleManager")
    EB = get_node_or_null("/root/EventBus")
    if not BM:
        push_error("[BattleSceneV2] 无法找到 BattleManager Autoload")
        return

    # 加载资源
    _load_resources()

    # 连接 UI 按钮信号
    _connect_ui_signals()

    # 订阅 EventBus 信号（驱动 UI 更新）
    _subscribe_event_bus()

    # 连接 HandArea 卡牌点击信号
    _connect_hand_area_signals()

    # 启动战斗
    _start_combat()

    print("[BattleSceneV2] 初始化完成")


func _load_resources() -> void:
    # 地图背景已在 .tscn 中直接设置 (map2.png)
    # 角色立绘已在 .tscn 中直接设置 (player1.png / player2.png)
    print("[BattleSceneV2] 资源已通过 .tscn 加载")
    _update_energy_ui()


func _connect_ui_signals() -> void:
    if draw_pile_button:
        draw_pile_button.pressed.connect(_on_draw_pile_pressed)
    if discard_pile_button:
        discard_pile_button.pressed.connect(_on_discard_pile_pressed)
    if end_turn_button:
        end_turn_button.pressed.connect(_on_end_turn_pressed)


func _connect_hand_area_signals() -> void:
    if hand_area and hand_area.has_signal("card_clicked"):
        hand_area.card_clicked.connect(_on_hand_card_clicked)
    else:
        push_warning("[BattleSceneV2] HandArea 未正确初始化或无 card_clicked 信号")


func _subscribe_event_bus() -> void:
    if EB:
        EB.card_drawn.connect(_on_event_card_drawn)
        EB.card_played.connect(_on_event_card_played)
        EB.card_discarded.connect(_on_event_card_discarded)
        EB.energy_changed.connect(_on_event_energy_changed)
        EB.hand_size_changed.connect(_on_event_hand_size_changed)
        EB.turn_started.connect(_on_event_turn_started)
        EB.turn_ended.connect(_on_event_turn_ended)
        EB.player_defeated.connect(_on_event_player_defeated)

#endregion

#region 战斗流程

func _start_combat() -> void:
    print("[BattleSceneV2] === 战斗开始 ===")
    is_combat_active = true
    turn_count = 0

    # 重置状态
    player_hp = player_max_hp
    player_block = 0
    player_energy = player_max_energy
    player_flaws = 0

    enemy_hp = enemy_max_hp
    enemy_block = 0
    enemy_energy = player_max_energy
    enemy_flaws = 0

    # 用 BattleManager 初始化牌组（如果存在）
    var test_deck: Array[CardData] = _build_test_deck()
    if BM and BM.has_method("init_deck"):
        BM.init_deck(test_deck)
    else:
        # BattleManager 不存在时的降级处理：本地管理牌组
        _init_local_deck(test_deck)

    _add_log("战斗开始！构建 %d 张牌组" % test_deck.size())
    _update_all_ui()

    # 开始第一回合
    _start_new_turn()


func _start_new_turn() -> void:
    turn_count += 1
    is_first_disadvantage_this_turn = true
    action_play_count = 0
    enemy_has_acted_this_action = false

    # 清空判定区
    player_judgment_card = null
    enemy_judgment_card = null
    _clear_judgment_card_node()
    _clear_action_cards()

    # BattleManager 开始回合：回满能量 + 抽5张
    if BM and BM.has_method("start_turn"):
        BM.start_turn()
    else:
        # 本地回合处理
        _start_local_turn()

    # 更新手牌显示
    _refresh_hand_display()

    # 更新所有 UI
    _update_all_ui()

    # 构建对手出牌队列（简单AI）
    _build_enemy_actions()

    _add_log("━━━ 第 %d 回合 ━━━" % turn_count)

    # 进入准备阶段
    _set_phase(CombatPhase.PREPARATION)


func _set_phase(new_phase: CombatPhase) -> void:
    current_phase = new_phase
    var phase_name: String = PHASE_NAMES[new_phase]
    print("[BattleSceneV2] 阶段: %s" % phase_name)

    if turn_label:
        turn_label.text = "第 %d 回合 — %s" % [turn_count, phase_name]

    phase_changed.emit(phase_name)

    match new_phase:
        CombatPhase.PREPARATION:
            _enter_preparation_phase()

        CombatPhase.JUDGMENT:
            _enter_judgment_phase()

        CombatPhase.ACTION:
            _enter_action_phase()

        CombatPhase.RESOLUTION:
            _enter_resolution_phase()


## 准备阶段：等待玩家点击手牌放入判定区
func _enter_preparation_phase() -> void:
    _add_log("准备阶段：请点击一张手牌放入判定区")
    _set_button_states(true)


## 判定阶段：自动翻牌、计算、确定劣势方
func _enter_judgment_phase() -> void:
    _add_log("判定阶段：双方翻牌...")

    # 加载对手判定卡（从对手出牌队列取第一张）
    if _enemy_action_queue.size() > 0:
        enemy_judgment_card = _enemy_action_queue[0]["card"]

    if player_judgment_card and enemy_judgment_card:
        var p1_power: int = _get_card_power(player_judgment_card)
        var p2_power: int = _get_card_power(enemy_judgment_card)
        _add_log("你的 %s (战力 %d) vs 敌方 %s (战力 %d)" % [player_judgment_card.card_name, p1_power, enemy_judgment_card.card_name, p2_power])

        # 劣势判断：战力低者劣势；平局时破绽多者劣势
        if p1_power < p2_power:
            is_player_disadvantaged = true
            _add_log("【你处于劣势】")
        elif p1_power > p2_power:
            is_player_disadvantaged = false
            _add_log("【敌方处于劣势】")
        else:
            # 平局：破绽多者劣势
            is_player_disadvantaged = player_flaws >= enemy_flaws
            _add_log("战力持平！")

        # 首次劣势补偿抽牌
        if is_first_disadvantage_this_turn:
            BM.draw_cards(1)
            _add_log("劣势方抽 1 张补偿牌")
            is_first_disadvantage_this_turn = false
    else:
        # 某方没有判定卡，直接判定玩家劣势（给机会出牌）
        is_player_disadvantaged = true
        _add_log("（对手无判定卡）默认你为劣势方")

    _update_all_ui()

    # 延迟进入出牌阶段
    await get_tree().create_timer(1.2).timeout
    _set_phase(CombatPhase.ACTION)


## 出牌阶段：劣势方出牌，优势方回应，循环
func _enter_action_phase() -> void:
    _add_log("出牌阶段：" + ("你" if is_player_disadvantaged else "敌方") + "先出牌")
    _set_button_states(true)
    action_play_count += 1

    if action_play_count > MAX_ACTION_PLAYS:
        _add_log("出牌次数上限，强制结算")
        await get_tree().create_timer(0.5).timeout
        _set_phase(CombatPhase.RESOLUTION)
        return

    # 根据当前出牌方执行
    if is_player_disadvantaged:
        _add_log("你的回合（劣势方）— 点击手牌出牌，或点击「放弃出牌」")
    else:
        _add_log("敌方回合...")
        await get_tree().create_timer(0.8).timeout
        _enemy_play_action_card()


## 结算阶段：宣告放弃、获得破绽、清场、下回合
func _enter_resolution_phase() -> void:
    _add_log("结算阶段")

    if is_player_disadvantaged:
        player_flaws += 1
        _add_log("你放弃出牌，获得 1 破绽（%d/4）" % player_flaws)
    else:
        enemy_flaws += 1
        _add_log("敌方放弃出牌，获得 1 破绽（%d/4）" % enemy_flaws)

    # 清空判定区
    player_judgment_card = null
    enemy_judgment_card = null
    _clear_judgment_card_node()
    _clear_action_cards()

    # 补牌：劣势 1 张，优势 2 张
    if is_player_disadvantaged:
        BM.draw_cards(1)
    else:
        BM.draw_cards(2)

    _refresh_hand_display()

    # 胜负判定
    if player_flaws >= 4:
        await get_tree().create_timer(1.0).timeout
        _on_battle_lost()
        return
    if enemy_flaws >= 4:
        await get_tree().create_timer(1.0).timeout
        _on_battle_won()
        return

    _update_all_ui()

    # 下一回合
    await get_tree().create_timer(1.5).timeout
    _start_new_turn()

#endregion

#region 手牌交互

## HandArea 点击卡牌回调
func _on_hand_card_clicked(card: CardData) -> void:
    if not is_combat_active:
        return

    print("[BattleSceneV2] 卡牌点击: %s，阶段: %s" % [card.card_name, PHASE_NAMES[current_phase]])

    match current_phase:
        CombatPhase.PREPARATION:
            # 放入判定区
            _place_judgment_card(card)

        CombatPhase.ACTION:
            if is_player_disadvantaged:
                _player_play_action_card(card)
            else:
                _add_log("当前是敌方回合，请等待...")

        _:
            _add_log("当前阶段不能出牌")


## 准备阶段：将卡牌放入判定区
func _place_judgment_card(card: CardData) -> void:
    if not BM.hand.has(card):
        _add_log("该卡不在手牌中")
        return

    # 从手牌移到判定区
    BM.hand.erase(card)
    player_judgment_card = card

    _add_log("放入判定区: %s" % card.card_name)

    # 更新手牌显示
    _refresh_hand_display()

    # 更新判定区显示（可后续扩展为实际 UI 节点）
    # TODO: 在 JudgmentZone 节点显示暗盖卡

    # 延迟进入判定阶段
    await get_tree().create_timer(0.5).timeout
    _set_phase(CombatPhase.JUDGMENT)


## 玩家出牌（ACTION 阶段，劣势方）
func _player_play_action_card(card: CardData) -> void:
    if not BM.can_play_card(card):
        _add_log("能量不足，无法打出 %s" % card.card_name)
        return

    # 从手牌移除（由 BattleManager 处理）
    BM.hand.erase(card)

    # 扣能量（BattleManager 已处理）
    _add_log("你打出: %s（战力 +%d，内力 -%d）" % [card.card_name, _get_card_power(card), card.cost])

    # 更新战力显示（这里简化处理，完整版需要累计行动区总战力）
    _spawn_action_card_effect(card, true)

    # 检查是否反超（简化版：直接切换主动权）
    is_player_disadvantaged = false
    enemy_has_acted_this_action = false
    _update_all_ui()

    _refresh_hand_display()

    # 继续出牌阶段
    await get_tree().create_timer(0.6).timeout
    _set_phase(CombatPhase.ACTION)


## 对手 AI 出牌
func _enemy_play_action_card() -> void:
    # 从对手队列取出一张
    if _enemy_action_queue.size() > 1:
        var action_card: CardData = _enemy_action_queue[1]["card"]
        _enemy_action_queue.remove_at(1)

        _add_log("敌方打出: %s" % action_card.card_name)
        _spawn_action_card_effect(action_card, false)

        # 反超，劣势方变为玩家
        is_player_disadvantaged = true
        _update_all_ui()

        await get_tree().create_timer(0.6).timeout
        _set_phase(CombatPhase.ACTION)
    else:
        # 对方无牌可出，放弃
        _add_log("敌方无牌可出")
        await get_tree().create_timer(0.4).timeout
        _set_phase(CombatPhase.RESOLUTION)


## 放弃出牌按钮
func _on_pass_pressed() -> void:
    if current_phase == CombatPhase.ACTION and is_player_disadvantaged:
        _add_log("你放弃出牌")
        await get_tree().create_timer(0.3).timeout
        _set_phase(CombatPhase.RESOLUTION)


func _build_enemy_actions() -> void:
    _enemy_action_queue.clear()
    var rng: RandomNumberGenerator = RandomNumberGenerator.new()
    rng.randomize()
    # 随机选 1~2 张作为判定+出牌
    var count: int = rng.randi_range(1, mini(2, TEST_DECK_CONFIG.size()))
    for i in range(count):
        var cfg: Dictionary = TEST_DECK_CONFIG[i % TEST_DECK_CONFIG.size()]
        var card: CardData = _make_card_data(cfg)
        _enemy_action_queue.append({"card": card, "power": cfg.power})

    print("[BattleSceneV2] 对手出牌队列构建: %d 张" % _enemy_action_queue.size())


func _build_test_deck() -> Array[CardData]:
    var deck: Array[CardData] = []
    for cfg: Dictionary in TEST_DECK_CONFIG:
        var card: CardData = _make_card_data(cfg)
        deck.append(card)
    # 两倍牌组
    for cfg: Dictionary in TEST_DECK_CONFIG:
        var card2: CardData = _make_card_data(cfg)
        deck.append(card2)
    return deck


func _make_card_data(cfg: Dictionary) -> CardData:
    var card: CardData = CardData.new()
    card.id = cfg.name
    card.card_name = cfg.name
    card.cost = cfg.cost
    card.card_type = cfg.type
    card.power = cfg.power
    if cfg.tex:
        card.texture_path = cfg.tex
    return card

#endregion

#region UI 更新

func _update_all_ui() -> void:
    _update_stats_ui()
    _update_energy_ui()
    _update_pile_buttons()
    _update_turn_label()


func _update_stats_ui() -> void:
    if player_hp_label:
        player_hp_label.text = "HP: %d/%d" % [player_hp, player_max_hp]
    if player_block_label:
        player_block_label.text = "格挡: %d" % player_block
    if player_energy_label:
        player_energy_label.text = "内力: %d/%d" % [BM.current_energy, BM.max_energy]

    if enemy_hp_label:
        enemy_hp_label.text = "HP: %d/%d" % [enemy_hp, enemy_max_hp]
    if enemy_block_label:
        enemy_block_label.text = "格挡: %d" % enemy_block


func _update_energy_ui() -> void:
    if player_energy_label:
        player_energy_label.text = "内力: %d/%d" % [BM.current_energy, BM.max_energy]


func _update_pile_buttons() -> void:
    if draw_pile_button:
        draw_pile_button.text = "抽牌堆\n(%d)" % BM.get_draw_pile_count()
    if discard_pile_button:
        discard_pile_button.text = "弃牌堆\n(%d)" % BM.get_discard_pile_count()


func _update_turn_label() -> void:
    if turn_label:
        turn_label.text = "第 %d 回合 — %s" % [turn_count, PHASE_NAMES[current_phase]]


func _set_button_states(enabled: bool) -> void:
    if end_turn_button:
        end_turn_button.disabled = not enabled


func _refresh_hand_display() -> void:
    if not hand_area:
        push_warning("[BattleSceneV2] HandArea 未初始化")
        return
    
    # 优先使用 BattleManager 的手牌，否则使用本地手牌
    var hand_to_show: Array[CardData] = []
    if BM and BM.get("hand") != null:
        hand_to_show = BM.hand
    else:
        hand_to_show = _local_hand
    
    hand_area.update_hand(hand_to_show)


func _add_log(msg: String) -> void:
    if battle_log:
        battle_log.append_text("[color=#e8dcc8]%s[/color]\n" % msg)
    print("[BattleSceneV2] " + msg)


func _get_card_power(card: CardData) -> int:
    return card.power if card else 0

#endregion

#region 视觉效果（简化版）

func _spawn_action_card_effect(card: CardData, is_player: bool) -> void:
    # 后续可扩展为粒子特效或动画
    var who: String = "你" if is_player else "敌方"
    print("[BattleSceneV2] 出牌特效: %s打出 %s" % [who, card.card_name])


func _clear_judgment_card_node() -> void:
    if _judgment_card_node and is_instance_valid(_judgment_card_node):
        _judgment_card_node.queue_free()
        _judgment_card_node = null


func _clear_action_cards() -> void:
    # 清除行动区卡牌节点（后续扩展）
    pass

#endregion

#region EventBus 信号处理

func _on_event_card_drawn(card: CardData) -> void:
    _add_log("抽到: %s" % card.card_name)
    _refresh_hand_display()


func _on_event_card_played(card: CardData) -> void:
    _add_log("打出: %s" % card.card_name)
    _update_energy_ui()


func _on_event_card_discarded(card: CardData) -> void:
    _update_pile_buttons()


func _on_event_energy_changed(current: int, max_energy: int) -> void:
    if player_energy_label:
        player_energy_label.text = "内力: %d/%d" % [current, max_energy]


func _on_event_hand_size_changed(size: int) -> void:
    _refresh_hand_display()


func _on_event_turn_started() -> void:
    _add_log("━━━ 回合开始 ━━━")


func _on_event_turn_ended() -> void:
    _add_log("回合结束")
    turn_ended.emit()


func _on_event_player_defeated() -> void:
    _on_battle_lost()

#endregion

#region 胜负

func _on_battle_won() -> void:
    is_combat_active = false
    _add_log("═══ 【胜利】 ═══")
    if turn_label:
        turn_label.text = "胜 利"
    battle_ended.emit()
    print("[BattleSceneV2] 玩家获胜！")


func _on_battle_lost() -> void:
    is_combat_active = false
    _add_log("═══ 【失败】 ═══")
    if turn_label:
        turn_label.text = "失 败"
    battle_ended.emit()
    print("[BattleSceneV2] 玩家失败！")

#endregion

#region UI 按钮回调

func _on_draw_pile_pressed() -> void:
    var count: int = 0
    if BM and BM.has_method("get_draw_pile_count"):
        count = BM.get_draw_pile_count()
    else:
        count = _local_draw_pile.size()
    _add_log("抽牌堆: %d 张" % count)


func _on_discard_pile_pressed() -> void:
    var count: int = 0
    if BM and BM.has_method("get_discard_pile_count"):
        count = BM.get_discard_pile_count()
    else:
        count = _local_discard_pile.size()
    _add_log("弃牌堆: %d 张" % count)


func _on_end_turn_pressed() -> void:
    if current_phase == CombatPhase.ACTION:
        _add_log("结束出牌")
        # 优势方结束 → 劣势方获得破绽
        if not is_player_disadvantaged:
            _set_phase(CombatPhase.RESOLUTION)
        else:
            _add_log("你是劣势方，请先出牌或放弃")

#endregion

#region 本地牌组管理（BattleManager 不存在时的降级处理）

func _init_local_deck(cards: Array[CardData]) -> void:
    """初始化本地牌组（当 BattleManager 不存在时使用）"""
    _local_deck = cards.duplicate()
    _local_draw_pile = cards.duplicate()
    _local_hand.clear()
    _local_discard_pile.clear()
    _local_exhaust_pile.clear()
    _shuffle_local_draw_pile()
    print("[BattleSceneV2] 本地牌组初始化: %d 张" % _local_deck.size())


func _shuffle_local_draw_pile() -> void:
    """洗牌"""
    var n: int = _local_draw_pile.size()
    for i in range(n - 1, 0, -1):
        var j: int = randi() % (i + 1)
        var temp: CardData = _local_draw_pile[i]
        _local_draw_pile[i] = _local_draw_pile[j]
        _local_draw_pile[j] = temp


func _start_local_turn() -> void:
    """本地回合开始处理"""
    player_energy = player_max_energy
    _local_draw_cards(5)
    print("[BattleSceneV2] 本地回合开始: 能量回满，抽5张牌")


func _local_draw_cards(count: int) -> void:
    """从抽牌堆抽牌"""
    for i in range(count):
        if _local_draw_pile.is_empty():
            # 抽牌堆空了，洗弃牌堆
            if _local_discard_pile.is_empty():
                break  # 完全没牌了
            _local_draw_pile = _local_discard_pile.duplicate()
            _local_discard_pile.clear()
            _shuffle_local_draw_pile()
            _add_log("弃牌堆洗入抽牌堆")
        
        if not _local_draw_pile.is_empty():
            var card: CardData = _local_draw_pile.pop_back()
            _local_hand.append(card)
            if EB and EB.has_signal("card_drawn"):
                EB.card_drawn.emit(card)


func _local_play_card(card: CardData) -> bool:
    """打出一张牌"""
    var idx: int = _local_hand.find(card)
    if idx < 0:
        return false
    
    # 检查能量
    if card.cost > player_energy:
        return false
    
    # 消耗能量
    player_energy -= card.cost
    
    # 从手牌移除
    _local_hand.remove_at(idx)
    
    # 根据卡牌类型处理
    match card.card_type:
        CardData.CardType.ATTACK, CardData.CardType.SKILL:
            _local_discard_pile.append(card)
        CardData.CardType.POWER:
            _local_exhaust_pile.append(card)
    
    if EB and EB.has_signal("card_played"):
        EB.card_played.emit(card)
    
    return true

#endregion
