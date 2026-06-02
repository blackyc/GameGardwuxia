# card_display.gd - Card Display Script
# Visual representation of a card in hand/draw pile/discard pile
# Author: Game Designer (OpenClaw Agent)
# Date: 2026-06-01

extends Panel
class_name CardDisplay

#region Exported Variables
@export var card_data: CardData : set = set_card_data
@export var card_texture: Texture2D

# Visual nodes
@onready var cost_label: Label = $VBox/TopHBox/CostLabel
@onready var name_label: Label = $VBox/NameLabel
@onready var type_label: Label = $VBox/TypeLabel
@onready var power_label: Label = $VBox/PowerLabel
@onready var desc_label: Label = $VBox/DescLabel
@onready var card_texture_rect: TextureRect = $CardTextureRect
#endregion

#region Lifecycle
func _ready() -> void:
    # Set mouse filter to allow interaction
    mouse_filter = Control.MOUSE_FILTER_STOP
    
    # Connect gui input for click/hover
    gui_input.connect(_on_gui_input)
    
    # Update display if card_data is already set
    if card_data:
        _update_display()

func set_card_data(value: CardData) -> void:
    card_data = value
    if is_inside_tree():
        _update_display()

func _update_display() -> void:
    if not card_data:
        push_warning("[CardDisplay] card_data is null!")
        return
    
    # Update labels
    if cost_label:
        cost_label.text = str(card_data.cost)
    
    if name_label:
        name_label.text = card_data.card_name
    
    if type_label:
        type_label.text = _get_type_string(card_data.card_type)
    
    if power_label:
        power_label.text = str(card_data.power)
    
    if desc_label:
        desc_label.text = card_data.description
    
    # Update texture
    if card_texture_rect and card_data.card_texture:
        card_texture_rect.texture = card_data.card_texture
    elif card_texture_rect and card_texture:
        card_texture_rect.texture = card_texture

func _get_type_string(type: CardData.CardType) -> String:
    match type:
        CardData.CardType.ATTACK, CardData.CardType.MARTIAL:
            return "武技"
        CardData.CardType.SKILL, CardData.CardType.INNER_POWER:
            return "心法"
        CardData.CardType.POWER:
            return "能力"
        _:
            return "未知"
#endregion

#region Interaction
func _on_gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        var mb := event as InputEventMouseButton
        if mb.button_index == MOUSE_BUTTON_LEFT and mb.pressed:
            _on_card_clicked()
    
    elif event is InputEventMouseMotion:
        _on_card_hover()

func _on_card_clicked() -> void:
    print("[CardDisplay] Card clicked: %s" % (card_data.card_name if card_data else "null"))
    
    # Notify parent (HandArea) that this card was clicked
    if get_parent() and get_parent().has_method("_on_card_clicked"):
        get_parent()._on_card_clicked(self)

func _on_card_hover() -> void:
    # Scale up effect on hover
    var tween := create_tween()
    tween.tween_property(self, "scale", Vector2.ONE * 1.1, 0.15)
    
    # Notify parent
    if get_parent() and get_parent().has_method("_on_card_hover"):
        get_parent()._on_card_hover(self)

func _on_mouse_exited() -> void:
    # Restore scale on hover exit
    var tween := create_tween()
    tween.tween_property(self, "scale", Vector2.ONE, 0.15)
#endregion

#region Public Methods
func get_card_data() -> CardData:
    return card_data

func animate_to_position(target_pos: Vector2, duration: float) -> void:
    var tween := create_tween()
    tween.tween_property(self, "position", target_pos, duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
#endregion
