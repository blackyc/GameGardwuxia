# HandArea.gd - Hand Area (Fixed Godot 4.4+ Loading Bug)
# Features: Display hand cards, card layout, mouse interaction
# Fix: Godot 4.4+ TSCN hierarchy bug causing HandArea load failure
# Author: Game Designer (OpenClaw Agent)
# Date: 2026-05-30

class_name HandArea
extends Control

# Signals
signal card_clicked(card: CardData)          # Card clicked
signal card_hover_started(card: CardData)    # Card hover started
signal card_hover_ended(card: CardData)      # Card hover ended

#region Exported Variables

# Card scene (BattleCard scene)
@export var card_scene: PackedScene

# Fan spread angle (radians)
@export var fan_angle: float = 0.45

# Fan radius
@export var fan_radius: float = 950.0

# Minimum card spacing (negative = overlap)
@export var min_spacing: float = -20.0

# Maximum spread width
@export var max_spread_width: float = 1600.0

# Card scale when hovering
@export var hover_scale: float = 1.15

# Card Y offset when hovering (float upward)
@export var hover_offset_y: float = -80.0

#endregion

#region Private Variables

var _hand_cards: Array[Node] = []    # Current hand card nodes
var _selected_card: Node = null        # Currently selected card
var _hovered_card: Node = null        # Currently hovered card

# Card data -> node mapping
var _card_to_node_map: Dictionary = {}

#endregion

#region Lifecycle

func _ready() -> void:
    # Ensure Control properties are correct
    mouse_filter = Control.MOUSE_FILTER_IGNORE
    
    # Wait one frame to ensure parent layout is complete
    await get_tree().process_frame
    
    # Validate anchor layout
    _validate_layout()
    
    print("[HandArea] Initialized: size=%s, position=%s" % [size, position])

func _validate_layout() -> void:
    # Check if anchors are set correctly
    if anchor_left > anchor_right or anchor_top > anchor_bottom:
        push_warning("[HandArea] Anchor setting abnormal! left=%f, right=%f, top=%f, bottom=%f" % [
            anchor_left, anchor_right, anchor_top, anchor_bottom
        ])
    
    # Check if size is valid
    if size.x <= 0 or size.y <= 0:
        push_warning("[HandArea] Size invalid! size=%s" % size)
        # Try to force layout update
        _force_layout_update()

func _force_layout_update() -> void:
    # Force Godot to recalculate layout
    await get_tree().process_frame
    await get_tree().process_frame
    
    print("[HandArea] Forced layout update: size=%s, position=%s" % [size, position])

#endregion

#region Public Methods (Hand Management)

# Update hand display (sync from BattleManager)
func update_hand(cards: Array[CardData]) -> void:
    print("[HandArea] Updating hand: %d cards" % cards.size())
    
    # Clear old cards
    _clear_hand_display()
    
    # Create new card nodes
    for card_data in cards:
        _add_card_to_hand(card_data)
    
    # Layout cards
    _layout_cards()
    
    print("[HandArea] Hand update complete: %d nodes" % _hand_cards.size())

# Add single card to hand
func _add_card_to_hand(card_data: CardData) -> void:
    if not card_scene:
        push_error("[HandArea] card_scene not set!")
        return
    
    # Instantiate card node
    var card_node = card_scene.instantiate()
    if not card_node:
        push_error("[HandArea] Cannot instantiate card scene")
        return
    
    # Set card data
    if card_node.has_method("set_card_data"):
        card_node.set_card_data(card_data)
    elif "card_data" in card_node:
        card_node.card_data = card_data
    
    # Add to scene
    add_child(card_node)
    _hand_cards.append(card_node)
    _card_to_node_map[card_data] = card_node
    
    # Connect signals
    if card_node.has_signal("gui_input"):
        card_node.gui_input.connect(_on_card_gui_input.bind(card_node))
    
    print("[HandArea] Added card: %s" % card_data.card_name)

# Clear hand display
func _clear_hand_display() -> void:
    for card_node in _hand_cards:
        if is_instance_valid(card_node):
            card_node.queue_free()
    
    _hand_cards.clear()
    _card_to_node_map.clear()
    _selected_card = null
    _hovered_card = null

# Layout cards (fan spread)
func _layout_cards() -> void:
    var card_count = _hand_cards.size()
    if card_count == 0:
        return
    
    # Calculate card width
    var card_width: float = 200.0  # Default card width
    if _hand_cards.size() > 0:
        var first_card = _hand_cards[0]
        if first_card and first_card.has_method("get_combined_minimum_size"):
            card_width = first_card.get_combined_minimum_size().x
    
    # Calculate total width
    var total_width: float = min(
        card_count * (card_width + min_spacing),
        max_spread_width
    )
    
    # Start X position (centered)
    var start_x: float = (size.x - total_width) / 2.0
    
    # Layout each card
    for i in range(card_count):
        var card_node = _hand_cards[i]
        if not is_instance_valid(card_node):
            continue
        
        # Calculate position
        var x_pos: float = start_x + i * (card_width + min_spacing)
        var y_pos: float = size.y - 280.0  # 280px from bottom
        
        # Set position
        card_node.position = Vector2(x_pos, y_pos)
        
        # Set Z-Index (last card on top)
        card_node.z_index = i
        
        # Animate to new position (if already has position)
        if card_node.has_method("animate_to_position"):
            card_node.animate_to_position(Vector2(x_pos, y_pos), 0.3)
    
    print("[HandArea] Layout complete: %d cards, total_width=%.1f" % [card_count, total_width])

#endregion

#region Card Interaction

func _on_card_gui_input(event: InputEvent, card_node: Node) -> void:
    if event is InputEventMouseButton:
        var mb := event as InputEventMouseButton
        if mb.button_index == MOUSE_BUTTON_LEFT and mb.pressed:
            _on_card_clicked(card_node)
    
    elif event is InputEventMouseMotion:
        _on_card_hover(card_node)

func _on_card_clicked(card_node: Node) -> void:
    print("[HandArea] Card clicked: %s" % card_node.name)
    
    # Get card data
    var card_data = null
    if card_node.has_method("get_card_data"):
        card_data = card_node.get_card_data()
    elif "card_data" in card_node:
        card_data = card_node.card_data
    
    if card_data:
        _selected_card = card_node
        card_clicked.emit(card_data)
        
        # Notify BattleScene to try playing card
        # Note: is_player_turn removed - using phase system instead
        if get_parent().has_method("try_play_card"):
            get_parent().try_play_card(card_data)

func _on_card_hover(card_node: Node) -> void:
    if _hovered_card == card_node:
        return
    
    # Cancel old hover
    if _hovered_card and is_instance_valid(_hovered_card):
        _on_card_hover_exited(_hovered_card)
    
    # Set new hover
    _hovered_card = card_node
    _on_card_hover_entered(card_node)

func _on_card_hover_entered(card_node: Node) -> void:
    print("[HandArea] Card hover enter: %s" % card_node.name)
    
    # Scale up effect
    var tween := create_tween()
    tween.tween_property(card_node, "scale", Vector2.ONE * hover_scale, 0.15)
    tween.parallel().tween_property(card_node, "position:y", card_node.position.y + hover_offset_y, 0.15)
    
    # Bring to top
    card_node.z_index = 1000
    
    # Get card data and emit signal
    var card_data = null
    if card_node.has_method("get_card_data"):
        card_data = card_node.get_card_data()
    elif "card_data" in card_node:
        card_data = card_node.card_data
    
    if card_data:
        card_hover_started.emit(card_data)

func _on_card_hover_exited(card_node: Node) -> void:
    print("[HandArea] Card hover exit: %s" % card_node.name)
    
    # Restore scale
    var tween := create_tween()
    tween.tween_property(card_node, "scale", Vector2.ONE, 0.15)
    tween.parallel().tween_property(card_node, "position:y", card_node.position.y - hover_offset_y, 0.15)
    
    # Restore Z-Index
    var index = _hand_cards.find(card_node)
    if index >= 0:
        card_node.z_index = index
    
    # Get card data and emit signal
    var card_data = null
    if card_node.has_method("get_card_data"):
        card_data = card_node.get_card_data()
    elif "card_data" in card_node:
        card_data = card_node.card_data
    
    if card_data:
        card_hover_ended.emit(card_data)

#endregion

#region Query Methods

func get_card_count() -> int:
    return _hand_cards.size()

func get_card_nodes() -> Array[Node]:
    return _hand_cards.duplicate()

func get_selected_card() -> Node:
    return _selected_card

func get_hovered_card() -> Node:
    return _hovered_card

#endregion

#region Debug Methods

func _get_debug_info() -> String:
    return "HandArea: %d cards, size=%s, position=%s" % [
        _hand_cards.size(),
        size,
        position
    ]

#endregion
