## BattleScene — 战斗主场景
## 聚合所有战斗子系统：手牌区、敌人、玩家状态、牌堆信息
## 管理回合流程：抽牌 → 等待操作 → 结束回合 → 弃牌
class_name BattleScene
extends Control

#region 子节点引用

@onready var _hand_area: HandArea = null  # 在 _ready() 中延迟修复
@onready var _enemy: Enemy = null  # 在 _ready() 中延迟查找
@onready var _card_effect: CardEffect = $CardEffect
@onready var _draw_pile_panel: PanelContainer = $DrawPilePanel
@onready var _draw_pile_label: Label = $DrawPilePanel/DrawPileVBox/DrawPileCount
@onready var _draw_pile_title: Label = $DrawPilePanel/DrawPileVBox/DrawPileTitle
@onready var _discard_pile_panel: PanelContainer = $DiscardPilePanel
@onready var _discard_pile_label: Label = $DiscardPilePanel/DiscardPileVBox/DiscardPileCount
@onready var _discard_pile_title: Label = $DiscardPilePanel/DiscardPileVBox/DiscardPileTitle
@onready var _energy_label: Label = $PlayerArea/EnergyContainer/EnergyLabel
@onready var _player_hp_label: Label = $PlayerArea/HPContainer/HPLabel
@onready var _player_block_label: Label = $PlayerArea/BlockLabel
@onready var _end_turn_button: Button = $EndTurnButton
@onready var _turn_label: Label = $TurnLabel
@onready var _battle_log: RichTextLabel = $BattleLog/Margin/LogText

#endregion

#region 节点查找与修复

## 在树中递归查找节点（按可选条件）
func _find_node_by_condition(parent: Node, condition: Callable) -> Node:
    if condition.call(parent):
        return parent
    for child: Node in parent.get_children():
        var found: Node = _find_node_by_condition(child, condition)
        if found:
            return found
    return null


## 确保 HandArea 存在于正确位置（解决 Godot 4.4+ TSCN 加载层级错乱 BUG）
func _ensure_hand_area() -> void:
    # 策略 1：已在正常位置
    var ha: HandArea = $HandArea as HandArea
    if is_instance_valid(ha):
        _hand_area = ha
        print("[BattleScene] HandArea 在正常路径找到")
        return

    # 策略 2：在整棵树中搜索 HandArea 实例（可能被错误加载到别处）
    var is_hand_area := func(node: Node) -> bool: return is_instance_of(node, HandArea)
    var misplaced: Node = _find_node_by_condition(self, is_hand_area)
    if is_instance_valid(misplaced):
        ha = misplaced as HandArea
        var current_parent: Node = ha.get_parent()
        print("[BattleScene] HandArea 在错误位置找到: %s (父=%s)，正在重新挂载..." % [ha.get_path(), current_parent.name if current_parent else "null"])

        if current_parent:
            current_parent.remove_child(ha)
        add_child(ha)

        # 恢复锚点和布局（为更大卡牌留足空间）
        ha.anchor_left = 0.05
        ha.anchor_top = 0.55
        ha.anchor_right = 0.90
        ha.anchor_bottom = 0.55
        ha.offset_bottom = 420.0
        ha.grow_horizontal = Control.GROW_DIRECTION_BOTH
        ha.mouse_filter = Control.MOUSE_FILTER_IGNORE

        _hand_area = ha
        print("[BattleScene] HandArea 已重新挂载: path=%s" % ha.get_path())
        return

    # 策略 3：完全编程式创建
    push_warning("[BattleScene] 未找到 HandArea，编程式创建...")
    ha = HandArea.new()
    ha.name = "HandArea"
    ha.anchor_left = 0.05
    ha.anchor_top = 0.55
    ha.anchor_right = 0.90
    ha.anchor_bottom = 0.55
    ha.offset_bottom = 420.0
    ha.grow_horizontal = Control.GROW_DIRECTION_BOTH
    ha.mouse_filter = Control.MOUSE_FILTER_IGNORE

    var card_scene: PackedScene = load("res://scenes/cards/battle_card.tscn") as PackedScene
    if card_scene:
        ha.card_scene = card_scene
    ha.fan_angle = 0.45
    ha.fan_radius = 950.0
    ha.min_spacing = -20.0
    ha.max_spread_width = 1600.0

    add_child(ha)
    _hand_area = ha
    print("[BattleScene] 已编程式创建 HandArea: path=%s" % ha.get_path())


## 确保 Enemy 引用正确
func _ensure_enemy() -> void:
    var enemy: Node = get_node_or_null("EnemyArea/Enemy")
    if is_instance_valid(enemy):
        _enemy = enemy as Enemy
        return

    # 扁平化路径查找
    enemy = get_node_or_null("EnemyArea_Enemy")
    if is_instance_valid(enemy):
        _enemy = enemy as Enemy
        print("[BattleScene] Enemy 通过扁平名称找到")
        return

    # 按类搜索
    var is_enemy := func(node: Node) -> bool: return is_instance_of(node, Enemy)
    enemy = _find_node_by_condition(self, is_enemy)
    if is_instance_valid(enemy):
        _enemy = enemy as Enemy
        print("[BattleScene] Enemy 通过 class 搜索找到: %s" % enemy.get_path())
        return

    push_error("[BattleScene] 无法找到 Enemy 节点！")

#endregion

#region 状态

var _turn_count: int = 0
var _battle_over: bool = false

## 试玩用牌组定义（后续可从 MapScreen 传入）
var _test_deck: Array[CardData] = []

#endregion

func _ready() -> void:
    # 必须最先执行：修复 HandArea 和 Enemy 引用（解决 TSCN 加载 BUG）
    _ensure_hand_area()
    _ensure_enemy()

    # 诊断：检查关键节点是否正常
    print("[BattleScene] _ready 开始")
    print("[BattleScene] _hand_area=%s, _enemy=%s" % [_hand_area, _enemy])

    if not _enemy:
        push_error("BattleScene: _enemy 为 null！路径 EnemyArea/Enemy 解析失败。")
    else:
        _enemy.died.connect(_on_enemy_died_locally)
        print("[BattleScene] _enemy 连接成功")

    if not _card_effect:
        push_warning("BattleScene: _card_effect 为 null！")
    if not _hand_area:
        push_error("BattleScene: _hand_area 为 null！")
    else:
        print("[BattleScene] _hand_area 引用正常")

    # 诊断抽牌堆面板
    if _draw_pile_panel:
        print("[BattleScene] _draw_pile_panel 正常: pos=%s, size=%s" % [_draw_pile_panel.position, _draw_pile_panel.size])
    else:
        push_error("BattleScene: _draw_pile_panel 为 null！")

    # 连接 EventBus 信号
    _connect_event_signals()
    print("[BattleScene] EventBus 信号已连接")

    # 结束回合按钮
    if _end_turn_button:
        _end_turn_button.pressed.connect(_on_end_turn_pressed)

    # 抽牌堆点击交互
    if _draw_pile_panel:
        _draw_pile_panel.gui_input.connect(_on_draw_pile_gui_input)
        print("[BattleScene] _draw_pile_panel.gui_input 信号已连接")

    # UI 样式
    _setup_ui_styles()

    # 初始化牌组
    _init_test_deck()
    print("[BattleScene] 测试牌组: %d 张" % _test_deck.size())
    BattleManager.init_deck(_test_deck)

    # 等 HandArea 完成其 await process_frame 后再开始，避免竞态
    await get_tree().process_frame
    print("[BattleScene] process_frame #1 完成, size=%s" % _hand_area.size if _hand_area else "null")
    # 额外再等一帧，确保 Control 锚点布局计算完毕
    await get_tree().process_frame
    print("[BattleScene] process_frame #2 完成, size=%s" % _hand_area.size if _hand_area else "null")
    # 开始战斗前强制刷新布局
    if _hand_area and (_hand_area.size.x <= 0 or _hand_area.size.y <= 0):
        push_error("[BattleScene] HandArea 尺寸仍未就绪: %s！但仍继续战斗..." % _hand_area.size)
    print("[BattleScene] 所有布局完成，开始战斗...")
    _start_battle()


func _connect_event_signals() -> void:
    EventBus.energy_changed.connect(_on_energy_changed)
    EventBus.card_drawn.connect(_on_card_drawn)
    EventBus.card_played.connect(_on_card_played)
    EventBus.card_discarded.connect(_on_card_discarded)
    EventBus.turn_started.connect(_on_turn_started)
    EventBus.turn_ended.connect(_on_turn_ended)
    EventBus.enemy_defeated.connect(_on_enemy_defeated)
    EventBus.player_defeated.connect(_on_player_defeated)
    EventBus.battle_won.connect(_on_battle_won)
    EventBus.battle_lost.connect(_on_battle_lost)


func _setup_ui_styles() -> void:
    # BattleLog 面板样式
    var log_style := StyleBoxFlat.new()
    log_style.bg_color = Color(0.06, 0.07, 0.06, 0.85)
    log_style.border_width_left = 1
    log_style.border_width_right = 1
    log_style.border_width_top = 1
    log_style.border_width_bottom = 1
    log_style.border_color = Color(0.3, 0.3, 0.25, 0.6)
    log_style.corner_radius_top_left = 6
    log_style.corner_radius_top_right = 6
    log_style.corner_radius_bottom_left = 6
    log_style.corner_radius_bottom_right = 6
    var battle_log_panel := $BattleLog as PanelContainer
    if battle_log_panel:
        battle_log_panel.add_theme_stylebox_override("panel", log_style)

    # 结束回合按钮样式（独立大按钮，右下角）
    if _end_turn_button:
        _end_turn_button.add_theme_color_override("font_color", Color(0.95, 0.92, 0.85, 1))
        _end_turn_button.add_theme_font_size_override("font_size", 26)
        _end_turn_button.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.5))
        _end_turn_button.add_theme_constant_override("outline_size", 2)

        var btn_normal := StyleBoxFlat.new()
        btn_normal.bg_color = Color(0.15, 0.12, 0.08, 0.95)
        btn_normal.border_width_left = 2
        btn_normal.border_width_right = 2
        btn_normal.border_width_top = 2
        btn_normal.border_width_bottom = 2
        btn_normal.border_color = Color(0.7, 0.5, 0.2, 0.9)
        btn_normal.corner_radius_top_left = 10
        btn_normal.corner_radius_top_right = 10
        btn_normal.corner_radius_bottom_left = 10
        btn_normal.corner_radius_bottom_right = 10

        var btn_hover := btn_normal.duplicate() as StyleBoxFlat
        btn_hover.bg_color = Color(0.25, 0.18, 0.1, 0.95)
        btn_hover.border_color = Color(0.9, 0.65, 0.25, 1.0)

        var btn_pressed := btn_normal.duplicate() as StyleBoxFlat
        btn_pressed.bg_color = Color(0.08, 0.06, 0.04, 0.95)

        _end_turn_button.add_theme_stylebox_override("normal", btn_normal)
        _end_turn_button.add_theme_stylebox_override("hover", btn_hover)
        _end_turn_button.add_theme_stylebox_override("pressed", btn_pressed)

    # LogText 文字颜色
    if _battle_log:
        _battle_log.add_theme_color_override("default_color", Color(0.85, 0.82, 0.75, 1))
        _battle_log.add_theme_font_size_override("normal_font_size", 14)

    # 抽牌堆面板样式 — 右下角可点击
    if _draw_pile_panel:
        var draw_style := StyleBoxFlat.new()
        draw_style.bg_color = Color(0.06, 0.10, 0.18, 0.92)
        draw_style.border_width_left = 2
        draw_style.border_width_right = 2
        draw_style.border_width_top = 2
        draw_style.border_width_bottom = 2
        draw_style.border_color = Color(0.3, 0.55, 0.85, 0.85)
        draw_style.corner_radius_top_left = 8
        draw_style.corner_radius_top_right = 8
        draw_style.corner_radius_bottom_left = 8
        draw_style.corner_radius_bottom_right = 8
        _draw_pile_panel.add_theme_stylebox_override("panel", draw_style)

        # 鼠标悬停光标提示
        _draw_pile_panel.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND

    # 弃牌堆面板样式
    if _discard_pile_panel:
        var discard_style := StyleBoxFlat.new()
        discard_style.bg_color = Color(0.14, 0.10, 0.06, 0.9)
        discard_style.border_width_left = 1
        discard_style.border_width_right = 1
        discard_style.border_width_top = 1
        discard_style.border_width_bottom = 1
        discard_style.border_color = Color(0.65, 0.50, 0.25, 0.7)
        discard_style.corner_radius_top_left = 8
        discard_style.corner_radius_top_right = 8
        discard_style.corner_radius_bottom_left = 8
        discard_style.corner_radius_bottom_right = 8
        _discard_pile_panel.add_theme_stylebox_override("panel", discard_style)


#region 牌组初始化

func _init_test_deck() -> void:
    # 用已有的卡牌 PNG 创建测试牌组
    # 先加载已有的 CardData .tres（如果有），否则现场构造
    var card_dir := "res://src/resources/cards/"

    if _load_or_create_cards(card_dir):
        return

    # fallback: 硬编码构造 5 张卡牌
    _create_hardcoded_cards()


func _load_or_create_cards(dir: String) -> bool:
    # 尝试从资源目录加载
    var files_to_try := [
        "万蛊噬心.tres",
        "两仪桩功.tres",
        "九阳神功.tres",
        "佛怒唐莲.tres",
        "修罗化血阵.tres",
        "聚气诀.tres",
    ]
    var loaded_count: int = 0
    for file_name in files_to_try:
        var path: String = dir + file_name
        if ResourceLoader.exists(path):
            var card := load(path) as CardData
            if card:
                _test_deck.append(card)
                loaded_count += 1

    return loaded_count >= 3


func _create_hardcoded_cards() -> void:
    # 硬编码 6 张测试卡牌
    _test_deck = [_make_card("万蛊噬心", "攻击", 1, 8, 0),
        _make_card("两仪桩功", "技能", 1, 0, 6),
        _make_card("九阳神功", "攻击", 2, 15, 0),
        _make_card("佛怒唐莲", "技能", 2, 0, 12),
        _make_card("修罗化血阵", "攻击", 1, 6, 0),
        _make_card("聚气诀", "技能", 1, 0, 4),
    ]


func _make_card(cname: String, ctype: String, cost: int, dmg: int, blk: int) -> CardData:
    var cd := CardData.new()
    cd.id = cname
    cd.card_name = cname
    cd.cost = cost
    match ctype:
        "攻击":
            cd.card_type = CardData.CardType.ATTACK
        "技能":
            cd.card_type = CardData.CardType.SKILL
    cd.damage = dmg
    cd.block = blk
    cd.texture_path = "res://AllbackupAssets/card-pngs/" + cname + ".png"
    cd.description = _make_description(ctype, dmg, blk)
    return cd


func _make_description(ctype: String, dmg: int, blk: int) -> String:
    match ctype:
        "攻击":
            return "造成 {d} 点伤害。"
        "技能":
            return "获得 {b} 点格挡。"
    return ""


## 允许外部设置牌组数据（从 MapScreen 传入）
func set_deck(deck: Array[CardData]) -> void:
    _test_deck = deck.duplicate()

#endregion

#region 回合流程

func _start_battle() -> void:
    _log("=== 战斗开始 ===")
    _turn_count = 0
    BattleManager.player_current_hp = BattleManager.player_max_hp
    BattleManager.player_block = 0
    _update_player_display()

    # 诊断牌组状态
    var draw_count := BattleManager.get_draw_pile_count()
    var hand_count := BattleManager.get_hand_count()
    var discard_count := BattleManager.get_discard_pile_count()
    print("[BattleScene] === 初始牌组状态: 抽牌堆=%d, 手牌=%d, 弃牌堆=%d ===" % [draw_count, hand_count, discard_count])
    if draw_count == 0:
        push_error("[BattleScene] 抽牌堆为空！牌组初始化可能失败")

    _start_next_turn()


func _start_next_turn() -> void:
    if _battle_over:
        return

    _turn_count += 1
    _log("--- 第 %d 回合 ---" % _turn_count)

    # 清空格挡
    if _enemy:
        _enemy.clear_block()
    BattleManager.clear_player_block()
    _update_player_display()

    BattleManager.start_turn()
    _update_pile_display()


func _on_end_turn_pressed() -> void:
    if _battle_over:
        return

    _log("玩家结束回合")

    # 敌人行动（简单版：固定伤害）
    await _enemy_action()

    if _battle_over:
        return

    BattleManager.end_turn()
    _start_next_turn()


func _enemy_action() -> void:
    if not _enemy:
        return
    var intent_damage: int = _enemy.base_damage
    _log("%s 发动攻击！造成 %d 点伤害" % [_enemy.enemy_name, intent_damage])

    # 短暂延迟
    await get_tree().create_timer(0.6).timeout
    BattleManager.player_take_damage(intent_damage)
    _update_player_display()

#endregion

#region 事件响应

func _on_draw_pile_gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        var mb := event as InputEventMouseButton
        if mb.button_index == MOUSE_BUTTON_LEFT and mb.pressed:
            print("[BattleScene] 抽牌堆被点击！_battle_over=%s" % _battle_over)
            if _battle_over:
                print("[BattleScene] 战斗已结束，忽略点击")
                return
            print("[BattleScene] 调用 BattleManager.draw_card()，当前抽牌堆: %d 张，手牌: %d 张" % [
                BattleManager.get_draw_pile_count(),
                BattleManager.get_hand_count(),
            ])
            var success: bool = BattleManager.draw_card()
            if success:
                _log("手动抽牌")
                print("[BattleScene] draw_card() 成功")
                # 点击动画：短暂闪烁
                var tween := _draw_pile_panel.create_tween()
                tween.tween_property(_draw_pile_panel, "modulate", Color(1.3, 1.3, 1.3, 1.0), 0.08)
                tween.tween_property(_draw_pile_panel, "modulate", Color(1.0, 1.0, 1.0, 1.0), 0.12)
            else:
                _log("抽牌堆已空！")
                print("[BattleScene] draw_card() 失败！抽牌堆: %d, 手牌: %d/%d" % [
                    BattleManager.get_draw_pile_count(),
                    BattleManager.get_hand_count(),
                    BattleManager.max_hand_size,
                ])


func _on_card_played(card: CardData) -> void:
    _log("打出: %s（费用 %d）" % [card.card_name, card.cost])
    _update_pile_display()

    # 执行卡牌效果（攻击有动画延迟，需要 await）
    if _enemy and _card_effect:
        await _card_effect.execute_card(card, _enemy)

    if _battle_over:
        return


func _on_card_drawn(_card: CardData) -> void:
    _update_pile_display()


func _on_card_discarded(_card: CardData) -> void:
    _update_pile_display()


func _on_turn_started() -> void:
    _update_pile_display()
    if _turn_label:
        _turn_label.text = "第 %d 回合" % _turn_count


func _on_turn_ended() -> void:
    _update_pile_display()


func _on_energy_changed(current: int, max_val: int) -> void:
    if _energy_label:
        _energy_label.text = "%d / %d" % [current, max_val]
        if current <= 0:
            _energy_label.add_theme_color_override("font_color", Color(0.95, 0.3, 0.25))
        else:
            _energy_label.add_theme_color_override("font_color", Color(0.3, 0.9, 0.35))


#endregion

#region 战斗结果

func _on_enemy_died_locally() -> void:
    EventBus.enemy_defeated.emit()


func _on_enemy_defeated() -> void:
    _battle_over = true
    _log("### 敌人被打败了！###")
    EventBus.battle_won.emit()


func _on_player_defeated() -> void:
    _battle_over = true
    _log("### 玩家倒下了... ###")
    EventBus.battle_lost.emit()


func _on_battle_won() -> void:
    if _end_turn_button:
        _end_turn_button.disabled = true
        _end_turn_button.text = "胜利！"
    _show_battle_result("战斗胜利！", Color(0.3, 0.9, 0.35))


func _on_battle_lost() -> void:
    if _end_turn_button:
        _end_turn_button.disabled = true
        _end_turn_button.text = "失败..."
    _show_battle_result("战斗失败...", Color(0.95, 0.3, 0.25))


func _show_battle_result(text: String, color: Color) -> void:
    var label := Label.new()
    label.text = text
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    label.add_theme_font_size_override("font_size", 48)
    label.add_theme_color_override("font_color", color)
    label.anchors_preset = Control.PRESET_FULL_RECT
    label.z_index = 200
    add_child(label)

    var tween := create_tween()
    label.modulate.a = 0.0
    tween.tween_property(label, "modulate:a", 1.0, 0.5)

#endregion

#region UI 更新

func _update_pile_display() -> void:
    var draw_count: int = BattleManager.get_draw_pile_count()
    var discard_count: int = BattleManager.get_discard_pile_count()

    if _draw_pile_label:
        _draw_pile_label.text = str(draw_count)

    if _discard_pile_label:
        _discard_pile_label.text = str(discard_count)

    # 空牌堆时视觉变灰
    _update_pile_empty_style(draw_count, discard_count)


func _update_pile_empty_style(draw_count: int, discard_count: int) -> void:
    # 抽牌堆：空的时降低不透明度
    if _draw_pile_panel:
        var draw_alpha: float = 0.4 if draw_count <= 0 else 1.0
        _draw_pile_panel.modulate = Color(1.0, 1.0, 1.0, draw_alpha)
        _draw_pile_panel.mouse_default_cursor_shape = Control.CURSOR_ARROW if draw_count <= 0 else Control.CURSOR_POINTING_HAND
    if _draw_pile_title:
        _draw_pile_title.modulate = Color(1.0, 1.0, 1.0, 0.5 if draw_count <= 0 else 1.0)

    # 弃牌堆：空的时降低不透明度
    if _discard_pile_panel:
        var disc_alpha: float = 0.35 if discard_count <= 0 else 1.0
        _discard_pile_panel.modulate = Color(1.0, 1.0, 1.0, disc_alpha)
    if _discard_pile_title:
        _discard_pile_title.modulate = Color(1.0, 1.0, 1.0, 0.5 if discard_count <= 0 else 1.0)


func _update_player_display() -> void:
    if _player_hp_label:
        _player_hp_label.text = "%d / %d" % [BattleManager.player_current_hp, BattleManager.player_max_hp]
        var hp_ratio: float = float(BattleManager.player_current_hp) / float(BattleManager.player_max_hp)
        if hp_ratio > 0.5:
            _player_hp_label.add_theme_color_override("font_color", Color(0.3, 0.9, 0.35))
        elif hp_ratio > 0.25:
            _player_hp_label.add_theme_color_override("font_color", Color(0.9, 0.7, 0.2))
        else:
            _player_hp_label.add_theme_color_override("font_color", Color(0.95, 0.3, 0.25))

    if _player_block_label:
        if BattleManager.player_block > 0:
            _player_block_label.visible = true
            _player_block_label.text = "格挡: %d" % BattleManager.player_block
        else:
            _player_block_label.visible = false


func _log(msg: String) -> void:
    if _battle_log:
        _battle_log.append_text("[color=#aaa]%s[/color]\n" % msg)
    print("[Battle] %s" % msg)

#endregion
