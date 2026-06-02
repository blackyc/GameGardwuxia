# card_data.gd - Card Data Resource Script
# Card data resource for Jianghu Showdown
# Author: Game Designer (OpenClaw Agent)
# Date: 2026-06-01

extends Resource
class_name CardData

#region Export Properties
@export var card_name: String = "Unknown Card"
@export var cost: int = 0
@export var card_type: CardType = CardType.ATTACK
@export var power: int = 0
@export var description: String = ""
@export var card_texture: Texture2D
@export var rarity: Rarity = Rarity.COMMON
@export var element: Element = Element.NONE
#endregion

#region Enums
enum CardType {
    ATTACK,
    SKILL,
    POWER,
    MARTIAL,  # 武技
    INNER_POWER  # 心法
}

enum Rarity {
    COMMON,
    UNCOMMON,
    RARE,
    EPIC
}

enum Element {
    NONE,
    FIRE,    # 火 (灵)
    WATER,   # 水 (诡)
    WIND,    # 风 (巧)
    EARTH    # 地 (霸)
}
#endregion

#region Lifecycle
func _init() -> void:
    resource_name = card_name if not card_name.is_empty() else "CardData"

func _to_string() -> String:
    return "CardData(%s, cost=%d, type=%s)" % [card_name, cost, CardType.keys()[card_type]]
#endregion

#region Helper Methods
func has_keyword(keyword: String) -> bool:
    # TODO: Implement keyword system
    return false

func get_type_string() -> String:
    return CardType.keys()[card_type]

func get_rarity_string() -> String:
    return Rarity.keys()[rarity]

func get_element_string() -> String:
    return Element.keys()[element]
#endregion
