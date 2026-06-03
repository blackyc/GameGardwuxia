@tool
extends TextureButton
class_name CardSlot

## A single card slot for the hand area. Visual placeholder.
## Replace with actual card rendering logic later.

@export var card_name: String = ""
@export var card_cost: int = 0
@export_group("Visual")
@export var card_color: Color = Color(0.15, 0.1, 0.3, 0.9)
@export var border_color: Color = Color(0.8, 0.7, 0.4, 1.0)
@export var card_size: Vector2 = Vector2(120.0, 170.0)


func _ready() -> void:
	custom_minimum_size = card_size
	# Trigger redraw


func _draw() -> void:
	var rect := Rect2(Vector2.ZERO, card_size)

	# Card body (rounded rect approximation with solid fill)
	draw_rect(rect, card_color, true)

	# Border (drawn as inner rect)
	draw_rect(
		Rect2(rect.position + Vector2(2, 2), rect.size - Vector2(4, 4)),
		border_color, false, 2.0
	)

	# Cost circle (top-left)
	var cost_center := Vector2(20.0, 22.0)
	draw_arc(cost_center, 14.0, 0.0, TAU, 24, border_color, 2.0)
	if card_cost >= 0:
		draw_string(
			ThemeDB.default_font,
			cost_center - Vector2(5.0, -4.0),
			str(card_cost),
			HORIZONTAL_ALIGNMENT_CENTER,
			16,
			14,
			Color(1, 1, 1)
		)

	# Card name label
	if card_name != "":
		draw_string(
			ThemeDB.default_font,
			Vector2(10.0, card_size.y - 16.0),
			card_name,
			HORIZONTAL_ALIGNMENT_LEFT,
			card_size.x - 20,
			11,
			Color(0.9, 0.9, 0.85)
		)


func set_card_data(name: String, cost: int) -> void:
	card_name = name
	card_cost = cost
	queue_redraw()
