## Enemy — 简单敌人组件
## 敌人有 HP、格挡，可以接收伤害
class_name Enemy
extends Control

#region 信号

signal died
signal hp_changed(current_hp: int, max_hp: int)
signal block_changed(block: int)

#endregion

#region 属性

@export var enemy_name: String = "敌人"
@export var max_hp: int = 50
@export var base_damage: int = 5  # 每回合基础伤害

var current_hp: int = 50
var block: int = 0

#endregion

#region 子节点

@onready var _hp_bar: ProgressBar = $EnemyPanel/HBox/VBox/HPBar
@onready var _hp_label: Label = $EnemyPanel/HBox/VBox/HPContainer/HPLabel
@onready var _block_label: Label = $EnemyPanel/HBox/VBox/BlockLabel
@onready var _name_label: Label = $EnemyPanel/HBox/VBox/NameLabel
@onready var _sprite: TextureRect = $EnemyPanel/HBox/EnemySprite

#endregion

func _ready() -> void:
    current_hp = max_hp
    _update_display()
    _setup_styles()


func _setup_styles() -> void:
    # 敌人面板样式
    var panel_style := StyleBoxFlat.new()
    panel_style.bg_color = Color(0.08, 0.06, 0.06, 0.75)
    panel_style.border_width_left = 2
    panel_style.border_width_right = 2
    panel_style.border_width_top = 2
    panel_style.border_width_bottom = 2
    panel_style.border_color = Color(0.6, 0.2, 0.15, 0.7)
    panel_style.corner_radius_top_left = 10
    panel_style.corner_radius_top_right = 10
    panel_style.corner_radius_bottom_left = 10
    panel_style.corner_radius_bottom_right = 10
    var panel := $EnemyPanel as PanelContainer
    if panel:
        panel.add_theme_stylebox_override("panel", panel_style)

    # HP 条样式
    if _hp_bar:
        var hp_bg := StyleBoxFlat.new()
        hp_bg.bg_color = Color(0.3, 0.08, 0.08, 1.0)
        hp_bg.corner_radius_top_left = 4
        hp_bg.corner_radius_top_right = 4
        hp_bg.corner_radius_bottom_left = 4
        hp_bg.corner_radius_bottom_right = 4
        _hp_bar.add_theme_stylebox_override("background", hp_bg)

        var hp_fill := StyleBoxFlat.new()
        hp_fill.bg_color = Color(0.7, 0.15, 0.1, 1.0)
        hp_fill.corner_radius_top_left = 4
        hp_fill.corner_radius_top_right = 4
        hp_fill.corner_radius_bottom_left = 4
        hp_fill.corner_radius_bottom_right = 4
        _hp_bar.add_theme_stylebox_override("fill", hp_fill)


func _update_display() -> void:
    if _hp_bar:
        _hp_bar.max_value = max_hp
        _hp_bar.value = current_hp
        # 根据血量百分比改变颜色
        var ratio: float = float(current_hp) / float(max_hp)
        var fill_color: Color
        if ratio > 0.5:
            fill_color = Color(0.7, 0.15, 0.1, 1.0)
        elif ratio > 0.25:
            fill_color = Color(0.85, 0.45, 0.1, 1.0)
        else:
            fill_color = Color(0.9, 0.15, 0.1, 1.0)

        var hp_fill := StyleBoxFlat.new()
        hp_fill.bg_color = fill_color
        hp_fill.corner_radius_top_left = 4
        hp_fill.corner_radius_top_right = 4
        hp_fill.corner_radius_bottom_left = 4
        hp_fill.corner_radius_bottom_right = 4
        _hp_bar.add_theme_stylebox_override("fill", hp_fill)
    if _hp_label:
        _hp_label.text = "%d / %d" % [current_hp, max_hp]
    if _block_label:
        _block_label.visible = block > 0
        _block_label.text = "格挡: %d" % block
    if _name_label:
        _name_label.text = enemy_name


## 受到伤害（先扣格挡，再扣血）
func take_damage(amount: int) -> void:
    if amount <= 0:
        return

    var remaining: int = amount

    # 先扣格挡
    if block > 0:
        var blocked: int = mini(block, remaining)
        block -= blocked
        remaining -= blocked
        block_changed.emit(block)

    if remaining > 0:
        current_hp = maxi(current_hp - remaining, 0)
        hp_changed.emit(current_hp, max_hp)

        # 受击闪红
        _flash_damage()

    _update_display()

    if current_hp <= 0:
        died.emit()


## 受击闪红动画
func _flash_damage() -> void:
    if not _sprite:
        return
    var tween := create_tween()
    _sprite.modulate = Color(1.5, 0.3, 0.3, 1.0)
    tween.tween_property(_sprite, "modulate", Color(1.0, 1.0, 1.0, 1.0), 0.25)


## 获得格挡
func add_block(amount: int) -> void:
    if amount <= 0:
        return
    block += amount
    block_changed.emit(block)
    _update_display()


## 回合开始时清空格挡（由 BattleScene 调用）
func clear_block() -> void:
    block = 0
    block_changed.emit(0)
    _update_display()
