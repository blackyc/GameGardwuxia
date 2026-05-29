class_name MapScreen
extends Control

## 地图场景（牌桌主界面）
## 以 map2.png 为全屏背景牌桌，负责展示游戏地图节点和玩家路径选择。
## 通过信号与外部系统通信，不直接调用父节点。

# ───────────── 信号 ─────────────
## 玩家点击地图节点时发出。[param node_id] 为节点唯一标识。
signal map_node_selected(node_id: String)

## 地图场景准备完毕，可以加载地图数据。
signal map_screen_ready

## 牌桌上的卡牌被点击。[param card] 为被点击的卡牌。
signal card_selected(card: CardOnTable)

# ───────────── 导出属性 ─────────────
## 地图牌桌背景贴图（默认使用 map2.png）
@export var table_texture: Texture2D

## 背景拉伸模式：SCALE = 全屏拉伸铺满，KEEP_ASPECT_COVERED = 保持比例裁剪覆盖，KEEP_ASPECT_CENTERED = 保持比例居中
@export_enum("SCALE", "KEEP_ASPECT_COVERED", "KEEP_ASPECT_CENTERED") \
    var stretch_mode: int = 1

## 镜头缩放级别。1.0 = 默认，越低镜头越远（0.5 = 缩小一半，看到更多桌面）
@export var zoom_level: float = 0.65

# ───────────── 节点引用 ─────────────
@onready var background: TextureRect = $Background
@onready var map_container: Control = $MapContainer
@onready var card_layer: Control = $MapContainer/CardLayer
@onready var overlay: CanvasLayer = $Overlay

# ───────────── 私有状态 ─────────────
var _current_floor: int = 0
var _selected_node_id: String = ""
var _cards: Array[CardOnTable] = []

## 卡牌 PNG 资源目录
const CARD_PNG_DIR := "res://AllbackupAssets/card-pngs/"


# ───────────── 生命周期 ─────────────

func _ready() -> void:
    _setup_background()
    _apply_zoom()
    _spawn_initial_cards()
    map_screen_ready.emit()


func _setup_background() -> void:
    if table_texture == null:
        var default_path: String = "res://images/map/map2.png"
        if ResourceLoader.exists(default_path):
            table_texture = load(default_path) as Texture2D
        else:
            push_warning("MapScreen: 未找到地图背景贴图，请在 Inspector 中指定 table_texture。")
            return

    background.texture = table_texture

    match stretch_mode:
        0:
            background.stretch_mode = TextureRect.STRETCH_SCALE
        1:
            background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
        2:
            background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
        _:
            background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED


## 应用镜头缩放：缩放 MapContainer 使桌面看起来更远（卡牌一起缩放）
func _apply_zoom() -> void:
    map_container.pivot_offset = map_container.size / 2.0
    map_container.scale = Vector2(zoom_level, zoom_level)


## 在地图上生成初始卡牌（示例布局）
func _spawn_initial_cards() -> void:
    # 从 AllbackupAssets 扫描卡牌文件
    var dir := DirAccess.open(CARD_PNG_DIR)
    if dir == null:
        push_warning("MapScreen: 无法打开卡牌资源目录 " + CARD_PNG_DIR)
        return

    var files: Array[String] = []
    for file_name: String in dir.get_files():
        if file_name.ends_with(".png"):
            files.append(file_name)
    files.sort()

    if files.is_empty():
        return

    # 取前 6 张卡牌作为示例，排列在牌桌上
    var max_cards := mini(files.size(), 6)
    var start_x: float = 320.0
    var start_y: float = 200.0
    var spacing_x: float = 220.0

    for i: int in max_cards:
        var card := _create_card(files[i])
        var pos_x := start_x + (i % 3) * spacing_x
        var pos_y := start_y + floorf(float(i) / 3.0) * (card.card_height + 32.0)
        card.place_at(Vector2(pos_x, pos_y))
        card_layer.add_child(card)
        _cards.append(card)


## 创建一张卡牌节点
func _create_card(file_name: String) -> CardOnTable:
    var card := CardOnTable.new()
    card.card_id = file_name.get_basename()
    card.card_name = file_name.get_basename()
    card.load_from_path(CARD_PNG_DIR + file_name)
    card.card_clicked.connect(_on_card_clicked)
    return card


# ───────────── 公开接口 ─────────────

## 加载地图数据并刷新显示。[param floor_data] 为层级数据字典。
func load_map(floor_data: Dictionary) -> void:
    _current_floor = floor_data.get("floor", 0)
    # TODO: 根据 floor_data 动态生成节点按钮（战斗/事件/商人/BOSS）


## 获取当前已选中的节点 ID。
func get_selected_node() -> String:
    return _selected_node_id


## 高亮可选的节点列表。[param node_ids] 为可选节点 ID 数组。
func highlight_available_nodes(node_ids: Array[String]) -> void:
    # TODO: 遍历 map_container 中的节点按钮，设置高亮状态
    pass


## 动态添加一张卡牌到牌桌。[param file_name] 为卡牌文件名。
func add_card(file_name: String) -> CardOnTable:
    var card := _create_card(file_name)
    card.place_at(Vector2(400.0 + randi() % 400, 250.0 + randi() % 300))
    card_layer.add_child(card)
    _cards.append(card)
    return card


## 移除牌桌上所有卡牌
func clear_cards() -> void:
    for card: CardOnTable in _cards:
        card.queue_free()
    _cards.clear()


## 设置镜头缩放。[param zoom] 为缩放值（0.3 ~ 2.0）
func set_zoom(zoom: float) -> void:
    zoom_level = clampf(zoom, 0.3, 2.0)
    _apply_zoom()


# ───────────── 内部信号处理 ─────────────

func _on_map_node_pressed(node_id: String) -> void:
    _selected_node_id = node_id
    map_node_selected.emit(node_id)


func _on_card_clicked(card: CardOnTable) -> void:
    # 单选：取消其他卡牌的选中状态
    for c: CardOnTable in _cards:
        if c != card:
            c.set_selected(false)
    card.set_selected(true)
    card_selected.emit(card)
