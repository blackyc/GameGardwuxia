extends Control

## Card Library Screen - Godot 4.6
## Scans res://AllbackupAssets/card-pngs/ and displays all cards in a scrollable grid.
## NOTE: No class_name to avoid conflict with root node name "CardLibrary".

# -- Node references via dollar-path (no unique_name_in_owner needed)
@onready var grid_container: GridContainer = $MarginContainer/VBox/ScrollContainer/GridContainer
@onready var scroll_container: ScrollContainer = $MarginContainer/VBox/ScrollContainer
@onready var search_field: LineEdit = $MarginContainer/VBox/TopBar/SearchField
@onready var card_count_label: Label = $MarginContainer/VBox/TopBar/CardCountLabel
@onready var title_label: Label = $MarginContainer/VBox/Header/TitleLabel

const CARD_DIR := "res://AllbackupAssets/card-pngs/"
const CARD_WIDTH := 160
const CARD_HEIGHT := 232
const CARD_BORDER_NORMAL := Color(0.25, 0.22, 0.18, 1.0)
const CARD_BORDER_HOVER := Color(0.98, 0.82, 0.35, 1.0)

var _all_card_names: Array[String] = []
var _card_panels: Array[PanelContainer] = []

func _ready() -> void:
    print("[CardLibrary] _ready() entered")
    _scan_cards()
    print("[CardLibrary] found ", _all_card_names.size(), " cards")
    _build_grid()
    print("[CardLibrary] grid children: ", grid_container.get_child_count())
    search_field.text_changed.connect(_on_search_changed)

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("ui_cancel"):
        get_viewport().set_input_as_handled()
        get_tree().quit()

## Scans CARD_DIR for .png files using get_files() (Godot 4.x reliable API).
func _scan_cards() -> void:
    var dir := DirAccess.open(CARD_DIR)
    if dir == null:
        push_error("[CardLibrary] Cannot open " + CARD_DIR + " err=" + str(DirAccess.get_open_error()))
        return
    var files := dir.get_files()
    for file_name: String in files:
        if file_name.ends_with(".png"):
            _all_card_names.append(file_name)
    _all_card_names.sort()

func _build_grid() -> void:
    for child in grid_container.get_children():
        child.queue_free()
    _card_panels.clear()
    for card_file: String in _all_card_names:
        var panel := _make_card_panel(card_file)
        grid_container.add_child(panel)
        _card_panels.append(panel)
    _update_count_label(_all_card_names.size(), _all_card_names.size())

## Builds a single styled card panel: rounded border + TextureRect + name label.
func _make_card_panel(file_name: String) -> PanelContainer:
    var panel := PanelContainer.new()
    panel.custom_minimum_size = Vector2(CARD_WIDTH + 8, CARD_HEIGHT + 36)

    var normal_style := StyleBoxFlat.new()
    normal_style.bg_color = Color(0.12, 0.10, 0.085, 1.0)
    normal_style.border_color = CARD_BORDER_NORMAL
    normal_style.set_border_width_all(2)
    normal_style.corner_radius_top_left = 6
    normal_style.corner_radius_top_right = 6
    normal_style.corner_radius_bottom_left = 6
    normal_style.corner_radius_bottom_right = 6
    panel.add_theme_stylebox_override("panel", normal_style)

    var hover_style := StyleBoxFlat.new()
    hover_style.bg_color = Color(0.18, 0.15, 0.12, 1.0)
    hover_style.border_color = CARD_BORDER_HOVER
    hover_style.set_border_width_all(2)
    hover_style.corner_radius_top_left = 6
    hover_style.corner_radius_top_right = 6
    hover_style.corner_radius_bottom_left = 6
    hover_style.corner_radius_bottom_right = 6

    panel.set_meta("normal_style", normal_style)
    panel.set_meta("hover_style", hover_style)
    panel.mouse_entered.connect(_on_card_hover_enter.bind(panel))
    panel.mouse_exited.connect(_on_card_hover_exit.bind(panel))

    var vbox := VBoxContainer.new()
    vbox.add_theme_constant_override("separation", 4)
    vbox.alignment = BoxContainer.ALIGNMENT_CENTER
    panel.add_child(vbox)

    var tex_rect := TextureRect.new()
    tex_rect.custom_minimum_size = Vector2(CARD_WIDTH, CARD_HEIGHT)
    tex_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    tex_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
    tex_rect.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
    var tex := load(CARD_DIR + file_name) as Texture2D
    if tex != null:
        tex_rect.texture = tex
    else:
        push_error("[CardLibrary] load failed: " + file_name)

    var display_name: String = file_name.get_basename()
    var lbl := Label.new()
    lbl.text = display_name
    lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    lbl.add_theme_font_size_override("font_size", 13)
    lbl.add_theme_color_override("font_color", Color(0.88, 0.82, 0.70, 1.0))
    lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL

    vbox.add_child(tex_rect)
    vbox.add_child(lbl)
    panel.set_meta("display_name", display_name)
    return panel

func _on_card_hover_enter(panel: PanelContainer) -> void:
    panel.add_theme_stylebox_override("panel", panel.get_meta("hover_style") as StyleBoxFlat)

func _on_card_hover_exit(panel: PanelContainer) -> void:
    panel.add_theme_stylebox_override("panel", panel.get_meta("normal_style") as StyleBoxFlat)

func _on_search_changed(query: String) -> void:
    var lower_query := query.to_lower()
    var visible_count: int = 0
    for panel: PanelContainer in _card_panels:
        var name_lower: String = (panel.get_meta("display_name") as String).to_lower()
        var is_match: bool = lower_query.is_empty() or name_lower.contains(lower_query)
        panel.visible = is_match
        if is_match:
            visible_count += 1
    _update_count_label(visible_count, _all_card_names.size())

func _update_count_label(shown: int, total: int) -> void:
    if shown == total:
        card_count_label.text = str(total) + " \u5f20\u5361\u724c"
    else:
        card_count_label.text = str(shown) + " / " + str(total) + " \u5f20\u5361\u724c"
