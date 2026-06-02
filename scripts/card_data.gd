# card_data.gd - Card Data Resource
# Represents a single card with all its properties
# Reference: Slay the Spire 2 CardModel.cs
# Author: Game Designer (OpenClaw Agent)
# Date: 2026-06-01

extends Resource
class_name CardData

#region Card Properties
@export var card_name: String = "Default Card"
@export var description: String = "A card"
@export var cost: int = 1
@export var card_type: CardType = CardType.ATTACK
@export var power: int = 0
@export var damage: int = 0
@export var block: int = 0
@export var heal: int = 0
@export var draw_cards: int = 0
@export var exhaust: bool = false
@export var texture: Texture2D = null

enum CardType {
	ATTACK,
	SKILL,
	POWER,
	CURSE,
	STATUS
}

# Unique identifier
var card_id: String = ""
# Rarity
var rarity: String = "COMMON"
# Is this card in a pile or hand?
var is_face_down: bool = false
# Additional effects (future)
var effects: Array = []
#endregion

#region Lifecycle
func _init() -> void:
	# Generate unique ID
	if card_id.is_empty():
		card_id = "card_" + str(Time.get_unix_time_from_system())

func _to_string() -> String:
	return "[Card: %s (Cost: %d, Type: %s)]" % [card_name, cost, CardType.keys()[card_type]]
#endregion

#region Card Actions
func can_play(energy: int) -> bool:
	"""Check if this card can be played with given energy"""
	return cost <= energy

func play(target = null) -> void:
	"""Play this card (apply effects)"""
	print("[CardData] Playing: %s" % card_name)
	# Apply effects here
	# This will be expanded in future updates

func draw() -> void:
	"""Called when card is drawn"""
	print("[CardData] Drawn: %s" % card_name)

func discard() -> void:
	"""Called when card is discarded"""
	print("[CardData] Discarded: %s" % card_name)

func exhaust_card() -> void:
	"""Send this card to exhaust pile"""
	print("[CardData] Exhausted: %s" % card_name)
#endregion

#region Serialization
func to_dict() -> Dictionary:
	"""Convert card to dictionary for saving"""
	return {
		"card_id": card_id,
		"card_name": card_name,
		"description": description,
		"cost": cost,
		"card_type": card_type,
		"power": power,
		"damage": damage,
		"block": block,
		"heal": heal,
		"draw_cards": draw_cards,
		"exhaust": exhaust,
		"rarity": rarity
	}

func from_dict(data: Dictionary) -> void:
	"""Load card from dictionary"""
	card_id = data.get("card_id", "")
	card_name = data.get("card_name", "Unknown")
	description = data.get("description", "")
	cost = data.get("cost", 1)
	card_type = data.get("card_type", CardType.ATTACK)
	power = data.get("power", 0)
	damage = data.get("damage", 0)
	block = data.get("block", 0)
	heal = data.get("heal", 0)
	draw_cards = data.get("draw_cards", 0)
	exhaust = data.get("exhaust", false)
	rarity = data.get("rarity", "COMMON")
#endregion
