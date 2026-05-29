## HandArea — 手牌管理区域
## 类似 STS2 的 NPlayerHand，管理手牌布局和交互
## 弧形排列手牌，响应抽牌/出牌事件
class_name HandArea
extends Control

#region 属性

## 卡牌场景（BattleCard 组件）
@export var card_scene: PackedScene

## 卡牌标准尺寸
@export var card_width: float = 130.0
@export var card_height: float = 189.0

## 扇形弧度（最大弯曲角度，弧度制）
@export var fan_angle: float = 0.35

## 扇形半径（弯曲程度）
@export var fan_radius: float = 750.0

## 手牌间的最小水平间距（负数表示重叠）
@export var min_spacing: float = -12.0

## 最大手牌全展开宽度
@export var max_spread_width: float = 1400.0

#endregion

#region 预定义弧形位置表（借鉴 STS2 HandPosHelper）

## 为 1-10 张手牌预定义的归一化弧形位置 [x_ratio, y_offset]
## x_ratio: 相对于 HandArea 宽度的比例（0=左边界, 1=右边界）
## y_offset: 相对于 base_y 的垂直偏移（负值=上浮 → 靠前, 正值=下沉 → 靠后）
## 斗地主风格: 中间卡牌最高（最靠前），两侧依次下沉形成弧形
static var FAN_POSITIONS := {
    1: [[0.5, -25.0]],
    2: [[0.30, -5.0], [0.70, -5.0]],
    3: [[0.20, 10.0], [0.5, -30.0], [0.80, 10.0]],
    4: [[0.14, 15.0], [0.36, -12.0], [0.64, -12.0], [0.86, 15.0]],
    5: [[0.09, 20.0], [0.28, -5.0], [0.5, -35.0], [0.72, -5.0], [0.91, 20.0]],
    6: [[0.06, 18.0], [0.22, -2.0], [0.38, -18.0], [0.62, -18.0], [0.78, -2.0], [0.94, 18.0]],
    7: [[0.05, 16.0], [0.18, 0.0], [0.32, -16.0], [0.5, -30.0], [0.68, -16.0], [0.82, 0.0], [0.95, 16.0]],
    8: [[0.04, 14.0], [0.16, 2.0], [0.28, -12.0], [0.40, -25.0], [0.60, -25.0], [0.72, -12.0], [0.84, 2.0], [0.96, 14.0]],
    9: [[0.03, 12.0], [0.14, 4.0], [0.25, -8.0], [0.36, -20.0], [0.50, -32.0], [0.64, -20.0], [0.75, -8.0], [0.86, 4.0], [0.97, 12.0]],
    10: [[0.03, 10.0], [0.13, 4.0], [0.22, -5.0], [0.32, -16.0], [0.42, -28.0], [0.58, -28.0], [0.68, -16.0], [0.78, -5.0], [0.87, 4.0], [0.97, 10.0]],
}

## 缩放表（手牌越多越小）
static var SCALE_TABLE := {
    1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0,
    6: 0.98, 7: 0.95, 8: 0.9, 9: 0.85, 10: 0.78,
}

#endregion

#region 内部

var _cards: Array[BattleCard] = []

## 防止堆叠 call_deferred（布局未完成重试用）
var _rearrange_deferred: bool = false
var _rearrange_retry_count: int = 0
const MAX_REARRANGE_RETRIES: int = 5

#endregion

func _ready() -> void:
    # 连接信号（不需要等布局 — 信号连接立即可用）
    EventBus.card_drawn.connect(_on_card_drawn)
    EventBus.card_played.connect(_on_card_played)
    EventBus.card_discarded.connect(_on_card_discarded)
    EventBus.hand_size_changed.connect(_on_hand_size_changed)

    print("[HandArea] _ready: 信号已连接，等待布局完成...")

    # 手牌区域视觉背景
    _setup_hand_zone_visual()

    # 延迟一帧打印布局信息
    await get_tree().process_frame
    print("[HandArea] 布局完成: size=%s, global_position=%s, card_scene=%s" % [size, global_position, card_scene])


## 手牌区域底部发光条 — 提示手牌放置位置
func _setup_hand_zone_visual() -> void:
    var zone_indicator := ColorRect.new()
    zone_indicator.name = "HandZoneIndicator"
    zone_indicator.mouse_filter = Control.MOUSE_FILTER_IGNORE

    # 跨度手牌区域（左右留边）
    zone_indicator.anchor_left = 0.0
    zone_indicator.anchor_right = 1.0
    zone_indicator.anchor_bottom = 1.0
    zone_indicator.offset_left = 0.0
    zone_indicator.offset_right = 0.0
    zone_indicator.offset_top = -6.0
    zone_indicator.offset_bottom = 4.0
    zone_indicator.color = Color(0.25, 0.35, 0.5, 0.12)

    add_child(zone_indicator)


## 卡牌被抽到 → 创建 BattleCard 实例
func _on_card_drawn(card: CardData) -> void:
    if not card_scene:
        push_error("HandArea: card_scene 未设置！")
        return

    print("[HandArea] 抽到卡牌: %s (type=%d, texture=%s)" % [card.card_name, card.card_type, card.texture_path])

    var battle_card: BattleCard = card_scene.instantiate() as BattleCard
    if not battle_card:
        push_error("HandArea: card_scene 不是 BattleCard 类型！")
        return

    battle_card.set_card_data(card)
    battle_card.card_play_requested.connect(_on_card_play_requested)
    # 当 BattleCard 被释放时自动从 _cards 中移除
    battle_card.tree_exiting.connect(_on_battle_card_exiting.bind(battle_card))
    add_child(battle_card)
    _cards.append(battle_card)

    # 验证 BattleCard 确实被添加到正确的父节点
    var actual_parent := battle_card.get_parent()
    print("[HandArea] BattleCard 已添加: name=%s, 父节点=%s(self=%s), visible=%s, pos=%s, 子节点总数=%d, _cards.size=%d" % [
        battle_card.name,
        actual_parent.name if actual_parent else "NULL",
        self.name,
        battle_card.visible, battle_card.position,
        get_child_count(), _cards.size()
    ])

    # 先计算扇形位置 → 再播放入场淡入动画
    _rearrange_cards()

    # 入场动画（仅 modulate.a 淡入，位置/缩放/旋转由 _rearrange_cards 管理）
    battle_card.play_entrance_animation()


## 卡牌被打出 → 播放飞出动画 → 移除
func _on_card_played(card: CardData) -> void:
    _remove_card_by_data(card, true)


## 卡牌被弃置 → 播放下沉动画 → 移除
func _on_card_discarded(card: CardData) -> void:
    _remove_card_by_data(card, false)


func _remove_card_by_data(card_data: CardData, was_played: bool) -> void:
    for i: int in range(_cards.size() - 1, -1, -1):
        var bc: BattleCard = _cards[i]
        if not is_instance_valid(bc):
            _cards.remove_at(i)  # 清理已释放的引用
            continue
        if bc.card_data == card_data:
            _cards.remove_at(i)
            if was_played:
                bc.play_fly_out_animation()
            else:
                bc.play_discard_animation()
            break

    # 即时重排 — 被移除的卡已从数组删除，不会冲突
    _rearrange_cards()


## BattleCard 从场景树移除时的回调 — 清理 _cards 中的无效引用
func _on_battle_card_exiting(card: BattleCard) -> void:
    var idx: int = _cards.find(card)
    if idx >= 0:
        print("[HandArea] BattleCard 即将释放，自动从 _cards 移除: %s" % (card.card_data.card_name if card.card_data else "无数据"))
        _cards.remove_at(idx)


## 手牌数量变化 — 重排已有 _rearrange_cards() 在处理
func _on_hand_size_changed(_count: int) -> void:
    pass


## 请求打出卡牌 → 交给 BattleManager
func _on_card_play_requested(card_data: CardData) -> void:
    BattleManager.play_card(card_data)


## 扇形排列手牌（借鉴 STS2 HandPosHelper 预定义位置表）
func _rearrange_cards() -> void:
    var count: int = _cards.size()
    if count == 0:
        return

    var area_w: float = size.x
    var area_h: float = size.y

    # 布局尚未完成时跳过
    if area_w <= 0.0 or area_h <= 0.0:
        if _rearrange_retry_count < MAX_REARRANGE_RETRIES:
            if not _rearrange_deferred:
                _rearrange_deferred = true
                _rearrange_retry_count += 1
                push_warning("[HandArea] 布局未完成 (w=%f h=%f)，第%d次延迟排列..." % [area_w, area_h, _rearrange_retry_count])
                call_deferred("_rearrange_cards")
            else:
                print("[HandArea] 已有待处理的延迟排列，跳过重复调用")
        else:
            push_error("[HandArea] 布局重试已达上限(%d次)，放弃排列！w=%f h=%f" % [MAX_REARRANGE_RETRIES, area_w, area_h])
        return
    _rearrange_deferred = false
    _rearrange_retry_count = 0

    # 使用预定义表或动态计算
    var positions: Array = FAN_POSITIONS.get(count, _compute_dynamic_positions(count))
    var base_scale: float = SCALE_TABLE.get(count, 0.7)

    # 手牌区域的基准 Y（卡片垂直中心基线，约在 HandArea 65% 高度处）
    var base_y: float = area_h * 0.65

    # 计算每张卡的目标位置和 z_index
    var targets: Array[Dictionary] = []
    for i: int in range(count):
        var bc: BattleCard = _cards[i]
        if not bc or not is_instance_valid(bc):
            continue

        # 跳过正在飞出的卡牌（动画中 modulate.a 接近 0）
        if bc.modulate.a < 0.15:
            continue

        var pos: Array = positions[i]
        var x_ratio: float = pos[0]
        var y_offset: float = pos[1]

        # 计算目标位置（卡片左上角）
        var target_x: float = area_w * x_ratio - card_width / 2.0
        var target_y: float = base_y + y_offset - card_height * 0.5

        # 限制在 HandArea 内
        target_x = clampf(target_x, 0.0, area_w - card_width)

        # 弧度旋转
        var t: float = float(i) / float(maxi(count - 1, 1))
        var rot: float = lerpf(-fan_angle * 0.5, fan_angle * 0.5, t)

        targets.append({
            "card": bc,
            "x": target_x,
            "y": target_y,
            "scale": base_scale,
            "rotation": rot,
            "distance_from_center": absf(x_ratio - 0.5),  # 越靠近中心值越小
        })

    # 按距离中心的远近排序 z_index：中心卡牌在最上层
    var center_first: Array[Dictionary] = []
    center_first.assign(targets)
    center_first.sort_custom(_sort_by_center)

    for idx: int in range(center_first.size()):
        var t: Dictionary = center_first[idx]
        var bc: BattleCard = t["card"]

        bc.position = Vector2(t["x"], t["y"])
        bc.scale = Vector2(t["scale"], t["scale"])
        bc.rotation = t["rotation"]

        # z_index: 后绘制的在上层。中心卡排最后 → z_index 最大
        bc.z_index = idx + 10  # 保证比非手牌元素高
        bc._hand_z_index = bc.z_index

    # 打印首张卡位置用于调试
    if center_first.size() > 0:
        var first := center_first[0]
        print("[HandArea] 排列完成: %d 张卡, 首卡 pos=(%.0f,%.0f) z=%d, HandArea.size=%s" % [
            center_first.size(),
            first["x"], first["y"],
            (first["card"] as BattleCard).z_index,
            size,
        ])


## 按中心距离排序 — 离中心越近，排越后面（z_index 越高）
static func _sort_by_center(a: Dictionary, b: Dictionary) -> bool:
    return a["distance_from_center"] > b["distance_from_center"]


## 动态计算手牌位置（ >=11 张手牌时的后备方案）
func _compute_dynamic_positions(count: int) -> Array:
    var positions: Array = []
    var total_width: float = size.x
    var card_total: float = card_width * count

    # 如果所有卡牌能放下，等距排列
    if card_total <= total_width * 0.9:
        var spacing: float = (total_width - card_total) / float(count + 1)
        var x: float = spacing
        for _i: int in range(count):
            positions.append([(x + card_width / 2.0) / total_width, 0.0])
            x += card_width + spacing
    else:
        # 卡牌重叠排列
        var overlap: float = (total_width * 0.9 - card_width) / float(maxi(count - 1, 1))
        for i: int in range(count):
            var x: float = total_width * 0.05 + i * overlap + card_width / 2.0
            positions.append([x / total_width, 0.0])

    return positions

#endregion
