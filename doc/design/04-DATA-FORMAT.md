# 04 — 数据格式规范

> 📊 **适合谁**：需要读写 TSV 数据文件的程序员。

## cards.tsv — 卡牌数据

### 字段定义

| 列号 | 字段名 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 1 | `card_id` | string | ✅ | 唯一标识符，snake_case |
| 2 | `card_name` | string | ✅ | 中文卡名 |
| 3 | `description` | string | ✅ | 效果文本（玩家可见） |
| 4 | `flavor_text` | string | ❌ | 风味文字 |
| 5 | `faction` | enum | ✅ | 阵营：`modeng`/`wudang`/`yintang`/`public` |
| 6 | `card_type` | enum | ✅ | 类型：`wuji`/`xinfa`/`mishu` |
| 7 | `element` | enum | ✅ | 四象：`domineering`/`deceptive`/`skillful`/`spirit` |
| 8 | `cost` | int | ✅ | 内力消耗 |
| 9 | `inner_power` | int | ❌ | 提供内力（心法卡） |
| 10 | `power` | int | ✅ | 战力值 |
| 11 | `effect_type` | string | ✅ | 效果类型（见 02-EFFECT-SYSTEM.md） |
| 12 | `tags` | CSV | ❌ | 逗号分隔标签，如 `魔教,刀法,震伤` |
| 13 | `effect_data` | JSON | ❌ | 效果参数，如 `{"flawPowerBonus":3}` |
| 14 | `art_path` | string | ❌ | 卡面插画路径 |
| 15 | `icon_path` | string | ❌ | 图标路径 |
| 16 | `card_color` | RGB CSV | ❌ | 卡框颜色，如 `"1,1,1,1"`（RGBA 0-1） |
| 17 | `font_path` | string | ❌ | 字体路径 |

### 阵营枚举

| 值 | 含义 |
|---|---|
| `modeng` | 魔教 |
| `wudang` | 武当 |
| `yintang` | 隐堂 |
| `public` | 公共（三阵营通用） |

### 四象枚举

| 值 | 中文 | 克制 |
|---|---|---|
| `spirit` | 灵 | 克诡 |
| `deceptive` | 诡 | 克巧 |
| `skillful` | 巧 | 克霸 |
| `domineering` | 霸 | 克灵 |

### 示例行

```
xuedao_dafa	血刀大法	[震伤]。若判断区内敌方盖放[巧]或[诡]，战力额外+2	血刀大法——血刀老祖成...	modeng	wuji	domineering	2	0	7	zhengshang	魔教,刀法,震伤	{"counterJudgmentBonus":2}			1,1,1,1	
```

### effect_data JSON 常用参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `flawPowerBonus` | int | 有破绽时战力加成 |
| `flawCostReduce` | int | 有破绽时费用减免 |
| `flawDraw` | int | 有破绽时额外抽牌 |
| `directDamage` | int | 直接伤害 |
| `isExtra` | bool | 是否为额外卡组牌 |
| `immuneToEffects` | bool | 不受卡效果影响 |
| `searchFaction` | string | 秘术检索的阵营限制 |
| `exileCount` | int | 放逐数量 |
| `sources` | array | 放逐来源区域 |
| `hasHit` | bool | 有命中标签 |
| `discount` | int | 费用减免值 |
| `maxPerRound` | int | 每回合最大次数 |
| `threshold` | int | 触发阈值 |
| `permanentBuff` | bool | 永久加成 |
| `selfDamage` | int | 自伤值 |
| `conditional_bonus` | int | 条件战力加成 |

---

## characters.tsv — 角色数据

### 字段定义

| 字段 | 类型 | 说明 |
|---|---|---|
| `character_id` | string | 唯一ID |
| `character_name` | string | 中文名 |
| `hp` | int | 初始生命值 |
| `initial_flaws` | int | 初始破绽数 |
| `initial_flaw_shield` | int | 初始破绽护盾 |
| `main_system` | enum | 主修武系 |
| `sub_system` | enum | 辅修武系 |
| `max_xinfa` | int | 心法上限 |
| `passives` | JSON array | 被动技能列表 |

### passives JSON 结构

```json
[
  {
    "type": "被动类型标识",
    "name": "中文名",
    "description": "效果描述",
    "maxPerRound": 1,
    // ... 其他类型特定参数
  }
]
```

---

## decks.tsv — 卡组数据

### 字段定义

| 字段 | 类型 | 说明 |
|---|---|---|
| `deck_id` | string | 卡组唯一ID |
| `deck_name` | string | 中文名 |
| `character_id` | string | 关联角色ID |
| `main_deck` | JSON | 主卡组 25 张 |
| `extra_deck` | JSON | 额外卡组 5 张 |

### main_deck / extra_deck JSON 结构

```json
[
  {"cardId": "modeng_base_xinfa", "count": 3},
  {"cardId": "xiuluo_yinxuegong", "count": 3}
]
```

---

## 修改数据流程

```
1. 在 Excel / VS Code 中编辑 TSV
2. 保存文件
3. 游戏运行时自动重新加载（或重启游戏）
4. 无需重新编译项目
```

## ⚠️ 注意事项

- **分隔符**：Tab（`\t`），不是逗号
- **effect_data 列**：用 JSON，不要换行（一行一条记录）
- **JSON 内不用 Tab**：effect_data 的 JSON 内不要包含 Tab 字符
- **编码**：UTF-8（Windows 上用 VS Code 保存注意选择 UTF-8）
- **空值**：用空字符串，不要写 `null`
- **card_id 命名**：`{faction}_{name}` 格式，全小写 + 下划线
