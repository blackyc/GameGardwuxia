@tool
extends Control
class_name HandCardArea

## Fan-shaped hand card area for card battle UI.
## Positions child card nodes in an arc/fan pattern at bottom-center of screen.
## Algorithm ported from Slay the Spire 2's HandPosHelper.
##
## Usage: Add TextureButton (or any Control) children as cards,
## then call refresh_layout() or it auto-refreshes when children change.

# ── Configuration ──────────────────────────────────────────────
@export_group("Fan Layout")
@export var max_cards: int = 10
@export var base_card_scale: float = 0.8
@export var center_offset_y: float = -50.0
@export var fan_spread_mult: float = 1.0

@export_group("Visual")
@export var debug_show_slots: bool = false
@export var slot_color: Color = Color(1.0, 1.0, 1.0, 0.15)
@export var slot_size: Vector2 = Vector2(120.0, 170.0)

# ── Internal State ─────────────────────────────────────────────
var _card_nodes: Array[Control] = []
var _dirty: bool = true


func _ready() -> void -> void:
    clip_contents = true
    child_entered_tree.connect(_on_child_changed)
    child_exiting_tree.connect(_on_child_changed)
    refresh_layout()


func _process(_delta: float) -> void:
    if _dirty:
        _dirty = false
        refresh_layout()


# ── Public API ─────────────────────────────────────────────────

## Force recalculation of all card positions in fan pattern.
func refresh_layout() -> void:
    _collect_cards()
    var count: int = _card_nodes.size()
    if count == 0:
        return

    for i: int in range(count):
        var card: Control = _card_nodes[i]
        var pos: Vector2 = _get_position(count, i)
        var angle_rad: float = deg_to_rad(_get_angle(count, i))
        var scl: Vector2 = _get_scale(count)

        card.position = pos * fan_spread_mult
        card.rotation = angle_rad
        card.scale = scl * base_card_scale

    update()


func add_card(card_node: Control) -> void:
    add_child(card_node)
    _collect_cards()
    refresh_layout()


func remove_card(card_node: Control) -> void:
    if card_node.get_parent() == self:
        remove_child(card_node)
    _collect_cards()
    refresh_layout()


## Get number of cards currently held.
func get_card_count() -> int -> int:
    return _card_nodes.size()


# ── Fan Position/Angle Data (Slay the Spire 2 reference) ───────
## Pre-computed positions indexed by [hand_size - 1][card_index].
static func _get_fan_position(hand_size: int, card_index: int) -> Vector2:
    match hand_size:
        1:
            return Vector2(0.0, -50.0)
        2:
            match card_index:
                0: return Vector2(-100.0, -50.0)
                1: return Vector2(100.0, -50.0)
        3:
            match card_index:
                0: return Vector2(-180.0, -50.0)
                1: return Vector2(0.0, -59.0)
                2: return Vector2(180.0, -50.0)
        4:
            match card_index:
                0: return Vector2(-240.0, -25.0)
                1: return Vector2(-80.0, -50.0)
                2: return Vector2(80.0, -50.0)
                3: return Vector2(240.0, -25.0)
        5:
            match card_index:
                0: return Vector2(-340.0, 10.0)
                1: return Vector2(-170.0, -30.0)
                2: return Vector2(0.0, -50.0)
                3: return Vector2(170.0, -30.0)
                4: return Vector2(340.0, 10.0)
        6:
            match card_index:
                0: return Vector2(-460.0, 13.0)
                1: return Vector2(-273.0, -25.0)
                2: return Vector2(-90.0, -50.0)
                3: return Vector2(90.0, -50.0)
                4: return Vector2(273.0, -25.0)
                5: return Vector2(460.0, 13.0)
        7:
            match card_index:
                0: return Vector2(-534.0, 18.0)
                1: return Vector2(-365.0, -14.0)
                2: return Vector2(-189.0, -39.0)
                3: return Vector2(0.0, -50.0)
                4: return Vector2(189.0, -39.0)
                5: return Vector2(365.0, -14.0)
                6: return Vector2(534.0, 18.0)
        8:
            match card_index:
                0: return Vector2(-565.0, 28.0)
                1: return Vector2(-400.0, -14.0)
                2: return Vector2(-231.0, -39.0)
                3: return Vector2(-80.0, -50.0)
                4: return Vector2(80.0, -50.0)
                5: return Vector2(231.0, -39.0)
                6: return Vector2(400.0, -14.0)
                7: return Vector2(565.0, 28.0)
        9:
            match card_index:
                0: return Vector2(-600.0, 37.0)
                1: return Vector2(-445.0, -2.0)
                2: return Vector2(-300.0, -29.0)
                3: return Vector2(-150.0, -45.0)
                4: return Vector2(0.0, -50.0)
                5: return Vector2(150.0, -45.0)
                6: return Vector2(300.0, -29.0)
                7: return Vector2(445.0, -2.0)
                8: return Vector2(600.0, 37.0)
        10:
            match card_index:
                0: return Vector2(-610.0, 38.0)
                1: return Vector2(-472.0, 5.0)
                2: return Vector2(-340.0, -21.0)
                3: return Vector2(-200.0, -41.0)
                4: return Vector2(-64.0, -50.0)
                5: return Vector2(64.0, -50.0)
                6: return Vector2(200.0, -41.0)
                7: return Vector2(340.0, -21.0)
                8: return Vector2(472.0, 5.0)
                9: return Vector2(610.0, 38.0)
    _:
            # Fallback: linear spread
            var half: float = float(hand_size - 1) / 2.0
            var x: float = (float(card_index) - half) * 140.0
            return Vector2(x, -50.0)


static func _get_fan_angle(hand_size: int, card_index: int) -> float:
    match hand_size:
        1: return 0.0
        2:
            match card_index: 0: return -2.0; 1: return 2.0
        3:
            match card_index: 0: return -3.0; 1: return 0.0; 2: return 3.0
        4:
            match card_index: 0: return -8.0; 1: return -4.0; 2: return 4.0; 3: return 8.0
        5:
            match card_index: 0: return -8.0; 1: return -4.0; 2: return 0.0; 3: return 4.0; 4: return 8.0
        6:
            match card_index: 0: return -9.0; 1: return -6.0; 2: return -3.0
            match card_index: 3: return 3.0; 4: return 6.0; 5: return 9.0
        7:
            match card_index: 0: return -9.0; 1: return -6.0; 2: return -3.0
            match card_index: 3: return 0.0; 4: return 3.0; 5: return 6.0; 6: return 9.0
        8:
            match card_index: 0: return -12.0; 1: return -9.0; 2: return -6.0; 3: return -3.0
            match card_index: 4: return 3.0; 5: return 6.0; 6: return 9.0; 7: return 12.0
        9:
            match card_index: 0: return -12.0; 1: return -9.0; 2: return -6.0; 3: return -3.0
            match card_index: 4: return 0.0; 5: return 3.0; 6: return 6.0; 7: return 9.0; 8: return 12.0
        10:
            match card_index: 0: return -15.0; 1: return -12.0; 2: return -9.0; 3: return -6.0; 4: return -3.0
            match card_index: 5: return 3.0; 6: return 6.0; 7: return 9.0; 8: return 12.0; 9: return 15.0
    _:
            var half: float = float(hand_size - 1) / 2.0
            return (float(card_index) - half) * 3.0


static func _get_hand_scale(hand_size: int) -> float:
    match hand_size:
        8: return 0.95
        9: return 0.9
        10: return 0.85
        11: return 0.8
        12: return 0.75
        _: return 1.0


# ── Internal Helpers ────────────────────────────────────────────

func _collect_cards() -> void:
    _card_nodes.clear()
    for child: Node in get_children():
        if child is Control and child != self:
            _card_nodes.append(child as Control)


func _get_position(hand_size: int, idx: int) -> Vector2 -> Vector2:
    return _get_fan_position(hand_size, idx)


func _get_angle(hand_size: int, idx: int) -> float -> float:
    return _get_fan_angle(hand_size, idx)


func _get_scale(hand_size: int) -> Vector2 -> Vector2:
    var s: float = _get_hand_scale(hand_size)
    return Vector2(s, s)


func _on_child_changed(_node: Node) -> void:
    _dirty = true


# ── Debug Drawing ───────────────────────────────────────────────

func _draw() -> void:
    if not debug_show_slots:
        return
    var count: int = _card_nodes.size()
    if count == 0:
        return
    for i: int in range(count):
        var pos: Vector2 = _get_position(count, i) * fan_spread_mult
        draw_rect(
            Rect2(pos - slot_size / 2.0, slot_size),
            slot_color,
            true
        )
