## CardData Resource — 卡牌数据定义
## 每张卡牌的静态数据：费用、类型、伤害、格挡、效果描述等
class_name CardData
extends Resource

enum CardType {
    ATTACK,  ## 攻击牌 — 对敌人造成伤害
    SKILL,   ## 技能牌 — 获得格挡/增益
    POWER,   ## 能力牌 — 永久效果（TODO）
}

@export var id: String = ""
@export var card_name: String = ""

@export var cost: int = 1
@export var card_type: CardType = CardType.ATTACK

@export var damage: int = 0
@export var block: int = 0
@export var power: int = 0  ## 战力值（江湖对决特有）

## 描述文本，支持 {d} = damage, {b} = block 占位符
@export_multiline var description: String = ""

## 卡牌贴图路径（相对于 res://）
@export_file("*.png") var texture_path: String = ""


## 渲染后的描述文本（替换占位符）
func get_formatted_description() -> String:
    var result: String = description
    result = result.replace("{d}", str(damage))
    result = result.replace("{b}", str(block))
    return result


func get_type_name() -> String:
    match card_type:
        CardType.ATTACK:
            return "攻击"
        CardType.SKILL:
            return "技能"
        CardType.POWER:
            return "能力"
        _:
            return "未知"
