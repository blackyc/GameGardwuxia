class_name CardOnTable
extends TextureRect

## 牌桌上的卡牌节点。
## 支持悬停放大、点击选中、拖拽移动。
## 通过信号与 MapScreen 通信。

# ───────────── 信号 ─────────────
signal card_clicked(card: CardOnTable)
signal card_hovered(card: CardOnTable)
signal card_unhovered(card: CardOnTable)

# ───────────── 导出属性 ─────────────
@export var card_id: String = ""
@export var card_name: String = ""

## 默认尺寸
@export var card_width: float = 140.0
@export var card_height: float = 203.0

## 悬停放大比例
@export var hover_scale: float = 1.12

## 悬停时上移像素
@export var hover_lift: float = -24.0

# ───────────── 私有状态 ─────────────
var _is_hovered: bool = false
var _is_selected: bool = false
var _is_dragging: bool = false
var _drag_offset: Vector2 = Vector2.ZERO
var _original_position: Vector2 = Vector2.ZERO
var _original_z_index: int = 0


# ───────────── 生命周期 ─────────────

func _ready() -> void:
    custom_minimum_size = Vector2(card_width, card_height)
    size = Vector2(card_width, card_height)
    expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
    mouse_filter = Control.MOUSE_FILTER_STOP
    mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
    _original_position = position
    _original_z_index = z_index


# ───────────── 公开接口 ─────────────

## 从路径加载卡牌贴图
func load_from_path(path: String) -> void:
    var tex := load(path) as Texture2D
    if tex != null:
        texture = tex
    else:
        push_warning("CardOnTable: 无法加载贴图 " + path)


## 设置选中状态
func set_selected(selected: bool) -> void:
    _is_selected = selected
    if selected:
        modulate = Color(0.85, 0.85, 0.7, 1.0)
        z_index = 100
    else:
        modulate = Color.WHITE
        z_index = _original_z_index


## 放到指定位置
func place_at(pos: Vector2) -> void:
    position = pos
    _original_position = pos


# ───────────── 输入处理 ─────────────

func _gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_LEFT:
            if event.pressed:
                card_clicked.emit(self)
            if event.is_pressed():
                _is_dragging = true
                _drag_offset = get_global_mouse_position() - global_position
            else:
                _is_dragging = false

    if event is InputEventMouseMotion and _is_dragging:
        position = get_global_mouse_position() - _drag_offset - get_parent().global_position


func _on_mouse_entered() -> void:
    _is_hovered = true
    mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND

    var tween := create_tween()
    tween.set_ease(Tween.EASE_OUT)
    tween.set_trans(Tween.TRANS_BACK)
    tween.set_parallel(true)
    tween.tween_property(self, "scale", Vector2(hover_scale, hover_scale), 0.15)
    tween.tween_property(self, "position:y", _original_position.y + hover_lift, 0.15)

    z_index = 50
    card_hovered.emit(self)


func _on_mouse_exited() -> void:
    _is_hovered = false
    mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND

    var tween := create_tween()
    tween.set_ease(Tween.EASE_OUT)
    tween.set_trans(Tween.TRANS_BACK)
    tween.set_parallel(true)
    tween.tween_property(self, "scale", Vector2.ONE, 0.18)
    tween.tween_property(self, "position:y", _original_position.y, 0.18)

    if not _is_selected:
        z_index = _original_z_index

    card_unhovered.emit(self)
