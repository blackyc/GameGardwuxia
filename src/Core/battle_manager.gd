# BattleManager.gd - Battle Manager (Migrated from Slay the Spire 2)
# Features: Deck management, card drawing, hand limit, energy management
# Reference: Slay the Spire 2 (CombatManager.cs, CardPile.cs, PlayerCombatState.cs)
# Adapted for: Jianghu Showdown (江湖对决)
# Author: Game Designer (OpenClaw Agent)
# Date: 2026-05-30

extends Node
class_name BattleManager

# Signals
signal card_drawn(card: CardData)           # Card drawn
signal card_played(card: CardData)          # Card played
signal card_discarded(card: CardData)       # Card discarded
signal hand_full(card: CardData)            # Hand full (overflow to discard)
signal deck_empty()                         # Deck empty
signal turn_started()                       # Turn started
signal turn_ended()                         # Turn ended
signal energy_changed(current: int, max: int) # Energy changed
signal player_hp_changed(hp: int, max_hp: int) # HP changed
signal player_block_changed(block: int)     # Block changed

#region Constants (Jianghu Showdown Rules)

# Hand limit (Design Doc: 01-COMBAT-FLOW.md)
const MAX_HAND_SIZE: int = 8

# Initial draw count (cards drawn at turn start)
const BASE_HAND_DRAW: int = 5

# Max energy (can be modified by relics/powers)
var max_energy: int = 3

#endregion

#region State Variables

# Card piles (migrated from Slay the Spire 2 CardPile)
var draw_pile: Array[CardData] = []        # Draw pile (deck)
var hand: Array[CardData] = []             # Hand
var discard_pile: Array[CardData] = []     # Discard pile
var exhaust_pile: Array[CardData] = []     # Exhaust pile
var play_pile: Array[CardData] = []        # Play pile (powers stay here)

# Player state
var player_current_hp: int = 72
var player_max_hp: int = 72
var player_block: int = 0
var player_energy: int = 3

# Battle state
var is_player_turn: bool = false
var turn_count: int = 0

#endregion

#region Initialization

# Initialize deck
func init_deck(deck: Array[CardData]) -> void:
    draw_pile.clear()
    hand.clear()
    discard_pile.clear()
    exhaust_pile.clear()
    play_pile.clear()
    
    # Copy deck to draw pile
    for card in deck:
        draw_pile.append(card)
    
    # Shuffle
    shuffle_draw_pile()
    
    print("[BattleManager] Deck initialized: %d cards" % draw_pile.size())

# Shuffle draw pile
func shuffle_draw_pile() -> void:
    if draw_pile.is_empty():
        return
    
    var rng = RandomNumberGenerator.new()
    rng.randomize()
    
    for i in range(draw_pile.size() - 1, 0, -1):
        var j = rng.randi() % (i + 1)
        var temp = draw_pile[i]
        draw_pile[i] = draw_pile[j]
        draw_pile[j] = temp
    
    print("[BattleManager] Draw pile shuffled")

#endregion

#region Card Draw Logic (Core! Migrated from Slay the Spire 2)

# Draw one card
func draw_card() -> bool:
    # Check hand limit
    if hand.size() >= MAX_HAND_SIZE:
        print("[BattleManager] Hand full (%d/%d), cannot draw" % [hand.size(), MAX_HAND_SIZE])
        return false
    
    # Check if draw pile is empty
    if draw_pile.is_empty():
        # Try to reshuffle discard pile into draw pile
        if not reshuffle_discard_into_draw():
            print("[BattleManager] Draw pile and discard pile empty, cannot draw")
            deck_empty.emit()
            return false
    
    # Draw top card from draw pile
    var card = draw_pile.pop_front()
    hand.append(card)
    
    print("[BattleManager] Drew: %s (Hand: %d/%d)" % [card.card_name, hand.size(), MAX_HAND_SIZE])
    
    # Emit signal
    card_drawn.emit(card)
    
    # Check if hand is now full (next draw will fail)
    if hand.size() >= MAX_HAND_SIZE:
        print("[BattleManager] WARNING: Hand near full (%d/%d)" % [hand.size(), MAX_HAND_SIZE])
    
    return true

# Draw multiple cards
func draw_cards(count: int) -> int:
    var drawn = 0
    for i in range(count):
        if draw_card():
            drawn += 1
        else:
            break
    return drawn

# Start turn (draw BASE_HAND_DRAW cards)
func start_turn() -> void:
    turn_count += 1
    is_player_turn = true
    player_energy = max_energy
    energy_changed.emit(player_energy, max_energy)
    
    print("[BattleManager] === Turn %d Start ===" % turn_count)
    print("[BattleManager] Energy reset: %d/%d" % [player_energy, max_energy])
    
    # Draw cards (default 5, can be modified by powers/relics)
    var draw_count = get_modified_draw_count(BASE_HAND_DRAW)
    var drawn = draw_cards(draw_count)
    
    print("[BattleManager] Turn start draw: %d cards" % drawn)
    
    turn_started.emit()

# End turn
func end_turn() -> void:
    is_player_turn = false
    
    # Discard hand (non-Retain cards go to discard pile)
    discard_hand_at_end_of_turn()
    
    # Reset energy
    player_energy = 0
    energy_changed.emit(player_energy, max_energy)
    
    print("[BattleManager] Turn ended")
    turn_ended.emit()

#endregion

#region Deck Management (Migrated from Slay the Spire 2 CardPile)

# Reshuffle discard pile into draw pile
func reshuffle_discard_into_draw() -> bool:
    if discard_pile.is_empty():
        return false
    
    print("[BattleManager] Reshuffling discard pile into draw pile: %d cards" % discard_pile.size())
    
    # Move all cards from discard pile to draw pile
    for card in discard_pile:
        draw_pile.append(card)
    discard_pile.clear()
    
    # Shuffle
    shuffle_draw_pile()
    
    return true

# Play card from hand
func play_card(card: CardData, target = null) -> bool:
    # Check if player turn
    if not is_player_turn:
        print("[BattleManager] Not player turn, cannot play card")
        return false
    
    # Check if card is in hand
    if not hand.has(card):
        print("[BattleManager] Card not in hand: %s" % card.card_name)
        return false
    
    # Check if enough energy
    if player_energy < card.cost:
        print("[BattleManager] Not enough energy: need %d, have %d" % [card.cost, player_energy])
        return false
    
    # Spend energy
    player_energy -= card.cost
    energy_changed.emit(player_energy, max_energy)
    
    # Remove from hand
    hand.erase(card)
    
    # Determine where the card goes based on type
    match card.card_type:
        CardData.CardType.ATTACK, CardData.CardType.SKILL:
            # Attack/Skill -> discard pile
            discard_pile.append(card)
        CardData.CardType.POWER:
            # Power -> play pile (stays in play)
            play_pile.append(card)
        _:
            # Default -> discard pile
            discard_pile.append(card)
    
    print("[BattleManager] Played: %s (Remaining energy: %d/%d)" % [card.card_name, player_energy, max_energy])
    
    card_played.emit(card)
    
    # Execute card effect (handled by CardEffect node)
    return true

# Discard hand at end of turn
func discard_hand_at_end_of_turn() -> void:
    var cards_to_discard = hand.duplicate()
    for card in cards_to_discard:
        # Check for Retain keyword (if implemented)
        var should_retain = false
        if card.has_method("has_keyword"):
            should_retain = card.has_keyword("Retain")
        
        if should_retain:
            print("[BattleManager] Retaining card: %s (Retain)" % card.card_name)
            continue
        
        # Move to discard pile
        hand.erase(card)
        discard_pile.append(card)
        card_discarded.emit(card)
    
    if not hand.is_empty():
        print("[BattleManager] Cards retained: %d" % hand.size())

#endregion

#region Query Methods

func get_draw_pile_count() -> int:
    return draw_pile.size()

func get_hand_count() -> int:
    return hand.size()

func get_discard_pile_count() -> int:
    return discard_pile.size()

func get_hand() -> Array[CardData]:
    return hand.duplicate()

func is_hand_full() -> bool:
    return hand.size() >= MAX_HAND_SIZE

# Get modified draw count (can be modified by powers/relics)
func get_modified_draw_count(base_count: int) -> int:
    # TODO: Add Hook system support
    # return Hook.ModifyHandDraw(base_count)
    return base_count

#endregion

#region Player State Management

func player_take_damage(amount: int) -> void:
    var remaining_damage = amount
    
    # Absorb with block first
    if player_block > 0:
        var block_absorbed = min(player_block, remaining_damage)
        player_block -= block_absorbed
        remaining_damage -= block_absorbed
        print("[BattleManager] Block absorbed: %d, remaining block: %d" % [block_absorbed, player_block])
        player_block_changed.emit(player_block)
    
    # Then reduce HP
    if remaining_damage > 0:
        player_current_hp -= remaining_damage
        player_current_hp = max(0, player_current_hp)
        print("[BattleManager] Took damage: %d, remaining HP: %d/%d" % [remaining_damage, player_current_hp, player_max_hp])
        player_hp_changed.emit(player_current_hp, player_max_hp)
        
        if player_current_hp <= 0:
            print("[BattleManager] Player defeated!")

func player_gain_block(amount: int) -> void:
    player_block += amount
    print("[BattleManager] Gained block: +%d (current: %d)" % [amount, player_block])
    player_block_changed.emit(player_block)

func clear_player_block() -> void:
    if player_block > 0:
        print("[BattleManager] Block cleared: %d -> 0" % player_block)
        player_block = 0
        player_block_changed.emit(player_block)

func gain_energy(amount: int) -> void:
    player_energy += amount
    print("[BattleManager] Gained energy: +%d (current: %d/%d)" % [amount, player_energy, max_energy])
    energy_changed.emit(player_energy, max_energy)

#endregion
