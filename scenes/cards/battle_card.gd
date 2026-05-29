## BattleCard — 手中可打出的卡牌组件
## 类似 STS2 中的 NHandCardHolder + NCard 简化版
class_name BattleCard
extends Control

#region 信号

signal card_play_requested(card_data: CardData)

#endregion

#region 属性

@export var card_data: CardData

var _is_hovered: bool = false
var _is_dragging: bool = false
var _drag_start: Vector2 = Vector2.ZERO
var _original_position: Vector2 = Vector2.ZERO

# 记录悬停前的位置，鼠标离开时恢复到这个值
var _pre_hover_y: float = 0.0

# 记录手牌排列分配的 z_index（由 HandArea 管理）
var _hand_z_index: int = 0

const HOVER_LIFT: float = 18.0
const HOVER_SCALE: float = 1.2

#endregion

#region 子节点引用

@onready var _card_body: TextureRect = $CardFrame/CardBody
@onready var _card_frame: PanelContainer = $CardFrame
@onready var _cost_label: Label = $CostLabel
@onready var _cost_bg: ColorRect = $CostBG
@onready var _name_label: Label = $NameLabel
@onready var _name_bg: ColorRect = $NameBG
@onready var _type_bar: ColorRect = $TypeBar
@onready var _type_label: Label = $TypeLabel
@onready var _desc_label: RichTextLabel = $DescLabel
@onready var _desc_bg: ColorRect = $DescBG
@onready var _shadow: ColorRect = $Shadow

#endregion

#region 初始化

func _ready() -> void:
    # layout_mode=0 时 offset_* 已生效，size 有值
    pivot_offset = size / 2.0

    # 诊断：打印父节点路径（排查 BattleCard 错误嵌套到敌人节点的问题）
    var parent_path := "NULL"
    if get_parent():
        parent_path = str(get_parent().get_path())
    print("[BattleCard] _ready: parent=%s, card_data=%s" % [parent_path, card_data.card_name if card_data else "null"])

    mouse_entered.connect(_on_mouse_entered)
    mouse_exited.connect(_on_mouse_exited)
    gui_input.connect(_on_gui_input)

    if card_data:
        _apply_card_data()

    _update_playability()


func set_card_data(data: CardData) -> void:
    card_data = data
    if is_inside_tree():
        _apply_card_data()
        _update_playability()


func _apply_card_data() -> void:
    if not card_data:
        return

    # 贴图 - 尝试加载，失败时用颜色占位
    var texture_loaded: bool = false
    if _card_body:
        if not card_data.texture_path.is_empty():
            var tex_path: String = card_data.texture_path
            print("[BattleCard] 尝试加载贴图: %s" % tex_path)
            if ResourceLoader.exists(tex_path):
                print("[BattleCard] ResourceLoader.exists() = true")
                var tex := load(tex_path) as Texture2D
                if tex:
                    _card_body.texture = tex
                    _card_body.self_modulate = Color(1.0, 1.0, 1.0, 1.0)
                    texture_loaded = true
                    print("[BattleCard] 贴图加载成功: %s (%dx%d)" % [tex_path, tex.get_width(), tex.get_height()])
                else:
                    push_warning("[BattleCard] load() returned null for: " + tex_path)
            else:
                push_warning("[BattleCard] ResourceLoader.exists() false for: " + tex_path)
        else:
            print("[BattleCard] texture_path 为空，使用占位颜色")

    # 贴图未加载时：用颜色区分卡牌类型
    if not texture_loaded and _card_body:
        match card_data.card_type:
            CardData.CardType.ATTACK:
                _card_body.self_modulate = Color(0.55, 0.15, 0.12, 1.0)  # 红色调
            CardData.CardType.SKILL:
                _card_body.self_modulate = Color(0.12, 0.25, 0.55, 1.0)  # 蓝色调
            CardData.CardType.POWER:
                _card_body.self_modulate = Color(0.40, 0.15, 0.55, 1.0)  # 紫色调

    # 卡片边框颜色
    if _card_frame:
        var card_style := StyleBoxFlat.new()
        card_style.bg_color = Color(0.1, 0.09, 0.07, 1.0)
        card_style.border_width_left = 2
        card_style.border_width_right = 2
        card_style.border_width_top = 2
        card_style.border_width_bottom = 2
        card_style.corner_radius_top_left = 6
        card_style.corner_radius_top_right = 6
        card_style.corner_radius_bottom_left = 6
        card_style.corner_radius_bottom_right = 6
        match card_data.card_type:
            CardData.CardType.ATTACK:
                card_style.border_color = Color(0.85, 0.2, 0.15, 1.0)
            CardData.CardType.SKILL:
                card_style.border_color = Color(0.15, 0.45, 0.85, 1.0)
            CardData.CardType.POWER:
                card_style.border_color = Color(0.65, 0.3, 0.8, 1.0)
        _card_frame.add_theme_stylebox_override("panel", card_style)

    # 费用
    if _cost_label:
        _cost_label.text = str(card_data.cost)

    # 名称
    if _name_label:
        _name_label.text = card_data.card_name

    # 类型颜色
    if _type_bar and _type_label:
        match card_data.card_type:
            CardData.CardType.ATTACK:
                _type_bar.color = Color(0.9, 0.25, 0.2, 0.9)
                _type_label.text = "攻击"
                _type_label.add_theme_color_override("font_color", Color(1, 0.85, 0.8, 1))
            CardData.CardType.SKILL:
                _type_bar.color = Color(0.2, 0.5, 0.9, 0.9)
                _type_label.text = "技能"
                _type_label.add_theme_color_override("font_color", Color(0.8, 0.85, 1, 1))
            CardData.CardType.POWER:
                _type_bar.color = Color(0.7, 0.3, 0.85, 0.9)
                _type_label.text = "能力"
                _type_label.add_theme_color_override("font_color", Color(0.9, 0.8, 1, 1))

    # 描述
    if _desc_label:
        var desc: String = card_data.get_formatted_description()
        if not desc.is_empty():
            _desc_label.text = "[center][color=#ccbbaa]%s[/color][/center]" % desc
        else:
            match card_data.card_type:
                CardData.CardType.ATTACK:
                    if card_data.damage > 0:
                        _desc_label.text = "[center][color=#ccbbaa]造成 %d 点伤害[/color][/center]" % card_data.damage
                CardData.CardType.SKILL:
                    if card_data.block > 0:
                        _desc_label.text = "[center][color=#aaccee]获得 %d 点格挡[/color][/center]" % card_data.block

#endregion

#region 交互

func _on_mouse_entered() -> void:
    if _is_dragging:
        return

    _is_hovered = true
    _pre_hover_y = position.y

    _update_playability()

    # 悬停放大 + 上浮 — 用完整 Vector2 避免 position:y 路径问题
    var target_pos := Vector2(position.x, _pre_hover_y - HOVER_LIFT)
    var target_scale := Vector2(HOVER_SCALE, HOVER_SCALE)

    var tween := create_tween()
    tween.set_parallel(true)
    tween.set_ease(Tween.EASE_OUT)
    tween.set_trans(Tween.TRANS_BACK)
    tween.tween_property(self, "position", target_pos, 0.15)
    tween.tween_property(self, "scale", target_scale, 0.15)
    _hand_z_index = z_index
    z_index = 50

    # 显示描述
    if _desc_label and _desc_bg:
        _desc_label.visible = true
        _desc_bg.visible = true


func _on_mouse_exited() -> void:
    if _is_dragging:
        return

    _is_hovered = false
    _update_playability()

    # 恢复到悬停前的位置（精确值，不会漂移）
    var target_pos := Vector2(position.x, _pre_hover_y)
    var target_scale := Vector2(1.0, 1.0)

    var tween := create_tween()
    tween.set_parallel(true)
    tween.set_ease(Tween.EASE_OUT)
    tween.set_trans(Tween.TRANS_BACK)
    tween.tween_property(self, "position", target_pos, 0.15)
    tween.tween_property(self, "scale", target_scale, 0.15)
    z_index = _hand_z_index

    # 隐藏描述
    if _desc_label and _desc_bg:
        _desc_label.visible = false
        _desc_bg.visible = false


func _on_gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        var mb := event as InputEventMouseButton
        if mb.button_index == MOUSE_BUTTON_LEFT:
            if mb.pressed:
                _start_drag()
            else:
                _end_drag()

    elif event is InputEventMouseMotion and _is_dragging:
        var new_pos: Vector2 = position + (event as InputEventMouseMotion).relative
        position = new_pos


func _start_drag() -> void:
    if not _can_play():
        return
    _is_dragging = true
    _original_position = position
    _hand_z_index = z_index
    z_index = 100
    modulate = Color(1.0, 1.0, 1.0, 0.75)

    # 拖拽时隐藏描述
    if _desc_label:
        _desc_label.visible = false
    if _desc_bg:
        _desc_bg.visible = false


func _end_drag() -> void:
    if not _is_dragging:
        return
    _is_dragging = false

    # 拖得够远 或 向上拖到屏幕上部 → 视为打出
    var drag_distance: float = position.distance_to(_original_position)
    var dragged_upward: bool = position.y < _original_position.y - 40.0

    if drag_distance > 70.0 or dragged_upward:
        card_play_requested.emit(card_data)
    else:
        # 弹回原位
        var tween := create_tween()
        tween.set_ease(Tween.EASE_OUT)
        tween.set_trans(Tween.TRANS_BACK)
        tween.tween_property(self, "position", _original_position, 0.25)

    modulate = Color(1.0, 1.0, 1.0, 1.0)
    z_index = _hand_z_index

#endregion

#region 可玩性

func _can_play() -> bool:
    return card_data != null and BattleManager.can_play_card(card_data)


func _update_playability() -> void:
    if not card_data:
        return

    var playable: bool = BattleManager.can_play_card(card_data)

    # 费用文字颜色
    if _cost_label:
        if playable:
            _cost_label.add_theme_color_override("font_color", Color(0.35, 0.95, 0.4, 1))
        else:
            _cost_label.add_theme_color_override("font_color", Color(0.95, 0.25, 0.2, 1))

    # 费用背景色
    if _cost_bg:
        if playable:
            _cost_bg.color = Color(0.06, 0.18, 0.1, 0.95)
        else:
            _cost_bg.color = Color(0.18, 0.06, 0.06, 0.95)

    # 不可打出时的整体暗色提示（只在悬停时）
    if _is_hovered and not playable and not _is_dragging:
        modulate = Color(0.9, 0.7, 0.7, 1.0)
    elif not _is_dragging:
        modulate = Color(1.0, 1.0, 1.0, 1.0)

#endregion

#region 动画

func play_entrance_animation() -> void:
    # 入场：纯淡入。
    # 位置/缩放/旋转/z_index 全由 HandArea._rearrange_cards() 管理。
    # 不做 position/scale tween 以避免和扇形排列互相覆盖。
    modulate.a = 0.0

    var tween := create_tween()
    tween.set_ease(Tween.EASE_OUT)
    tween.tween_property(self, "modulate:a", 1.0, 0.35)


func play_fly_out_animation() -> void:
    var target_pos := Vector2(position.x, position.y - 40.0)
    var target_scale := Vector2(0.2, 0.2)

    var tween := create_tween()
    tween.set_parallel(true)
    tween.tween_property(self, "position", target_pos, 0.2)
    tween.tween_property(self, "scale", target_scale, 0.2)
    tween.tween_property(self, "modulate:a", 0.0, 0.2)
    tween.tween_callback(queue_free)


func play_discard_animation() -> void:
    var target_pos := Vector2(position.x, position.y + 80.0)
    var target_scale := Vector2(0.8, 0.8)

    var tween := create_tween()
    tween.set_parallel(true)
    tween.tween_property(self, "position", target_pos, 0.2)
    tween.tween_property(self, "scale", target_scale, 0.2)
    tween.tween_property(self, "modulate:a", 0.0, 0.2)
    tween.tween_callback(queue_free)

#endregion
