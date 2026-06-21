# Agent A 任务：应天府·市井生活区 66间外层房间生成

## 输出文件
`D:\MUD\ghostMUD\work\rebuild_rooms_city.js`

## 强制前置阅读（MANDATORY）
1. `D:\MUD\ghostMUD\docs\shared_constraint_v3.md` — **全文通读**（§1-§8全部）
2. `D:\MUD\ghostMUD\docs\style_anchor.md` — 风格参考
3. `D:\MUD\ghostMUD\docs\faction_rebrand.md` — 宗派名称映射

## 适用范围
城市核心区。市井烟火气为主，聊斋味极淡——凡人视角下一切正常，只有修士玩家能从不经意的细节里品出寒意。

---

## 二、房间清单（66间外层 + 约17个子房间）

### §2.1 核心十字街区（14间，template 4/1）
| ID | 房间名 | 模板 | 嵌套 |
|----|--------|------|------|
| yt_cross | 应天府·十字街口 | 1 | — |
| yt_east_st | 东大街 | 4 | — |
| yt_west_st | 西大街 | 4 | — |
| yt_south_st | 南大街 | 4 | — |
| yt_north_st | 北大街 | 4 | — |
| yt_east_gate | 正阳门 | 4 | ✅ 城楼密室 |
| yt_west_gate | 石城门 | 4 | — |
| yt_south_gate | 聚宝门 | 4 | ✅ 瓮城暗格 |
| yt_north_gate | 太平门 | 4 | — |
| yt_bell_st | 钟楼街 | 4 | — |
| yt_drum_st | 鼓楼街 | 4 | — |
| yt_imperial_way | 御道街 | 4 | — |
| yt_scholar_st | 成贤街 | 4 | — |
| yt_silk_st | 绫庄巷 | 4 | — |

### §2.2 酒馆/食肆/茶楼（8间，template 2/3）
| ID | 房间名 | 嵌套 |
|----|--------|------|
| yt_hotel | 悦来客栈·大堂 | ✅ 二楼雅间 / 地下酒窖 |
| yt_tavern | 醉仙楼 | ✅ 三楼雅座(机关暗格) |
| yt_tea_house | 清风茶馆 | ✅ 后院茶室 |
| yt_noodle_shop | 老陈面馆 | — |
| yt_wine_shop | 太白遗风·酒肆 | — |
| yt_dumpling | 秦淮饺儿铺 | — |
| yt_porridge | 状元粥铺 | — |
| yt_bbq | 炙肉坊 | — |

### §2.3 商铺/作坊（12间，template 2）
| ID | 房间名 | 嵌套 |
|----|--------|------|
| yt_pawn | 聚宝当铺 | ✅ 后院暗室 |
| yt_weapon | 神兵铁匠铺 | ✅ 后院铸剑房 |
| yt_medicine | 回春堂药铺 | ✅ 后堂丹房 |
| yt_cloth | 锦绣布庄 | — |
| yt_bank | 四海钱庄 | ✅ 地下金库 |
| yt_market | 秦淮集市 | — |
| yt_incense | 檀香阁·香烛铺 | — |
| yt_antique | 鉴古斋·古玩铺 | — |
| yt_carpenter | 鲁班木作坊 | — |
| yt_tailor | 裁云轩·成衣铺 | — |
| yt_rice | 丰裕米行 | — |
| yt_herb_market | 草药市 | — |

### §2.4 府衙与官署（6间，template 1/2/5）
| ID | 房间名 | 嵌套 |
|----|--------|------|
| yt_yamen | 应天府衙·正堂 | ✅ 内堂·档案室 |
| yt_yamen_back | 应天府衙·后堂 | — |
| yt_guard_post | 城隍司·夜巡所 | — |
| yt_prison | 阴司牢·外层 | ✅ 死牢底层(道心≥60) |
| yt_exam_hall | 江南贡院·明远楼 | — |
| yt_imperial_college | 国子监·彝伦堂 | — |

### §2.5 河水/桥梁/渡口（8间，template 4/6）
| ID | 房间名 | 嵌套 |
|----|--------|------|
| yt_qinhuai_north | 秦淮河·北岸 | — |
| yt_qinhuai_south | 秦淮河·南岸 | ✅ 河底暗渠(轻功≥50或避水符) |
| yt_qinhuai_center | 秦淮河·画舫码头 | — |
| yt_qinhuai_east | 秦淮河·东水关 | — |
| yt_zhenhuai_bridge | 镇淮桥 | — |
| yt_wende_bridge | 文德桥 | — |
| yt_xuanwu_lake | 玄武湖·北岸 | ✅ 湖心岛·鬼市入口(子时+道心≥70) |
| yt_wharf_east | 秦淮渡口·东埠 | — |

### §2.6 坊巷/民居（8间，template 4/6）
| ID | 房间名 | 嵌套 |
|----|--------|------|
| yt_alley_ink | 墨香巷 | — |
| yt_alley_flower | 花市巷 | — |
| yt_alley_well | 古井巷 | ✅ 井底密室(轻功≥40) |
| yt_alley_chess | 弈棋巷 | — |
| yt_alley_bamboo | 青竹巷 | — |
| yt_courtyard_xue | 薛家旧宅 | ✅ 后花园地窖 |
| yt_courtyard_li | 李府废园 | ✅ 枯井暗道(道心≥30) |
| yt_inn_common | 通铺客栈 | — |

### §2.7 宗派城中联络点 — 市井侧（10间，各一间）
| ID | 房间名 | 所属宗派 | 嵌套 |
|----|--------|---------|------|
| yt_fac_ziwei | 紫微阁·星象铺 | 紫霞山 | — |
| yt_fac_fanwang | 梵音堂·经书坊 | 梵网寺 | — |
| yt_fac_ant_net | 蚂蚁巷·车马行 | 蚁网 | ✅ 地下暗堂 |
| yt_fac_flame | 赤炎居·香火铺 | 焰心教 | — |
| yt_fac_xiaoyao | 逍遥馆·客栈天字房 | 逍遥驿 | — |
| yt_fac_poison | 百草堂·药铺后院 | 毒巢 | ✅ 炼毒密室 |
| yt_fac_blood_scythe | 染血铁铺·后巷 | 血镰 | — |
| yt_fac_shadow_tomb | 影壁街·纸扎铺 | 影墓 | ✅ 纸人暗房 |
| yt_fac_yaowang | 药王坊·义诊堂 | 药王谷 | — |
| yt_fac_jiqiao | 巧工坊·木匠铺后院 | 机巧岛 | ✅ 机关密室 |

> **Agent A 合计**: 14+8+12+6+8+8+10 = **66间外层房间**，**约17个嵌套子房间**。

---

## 三、核心约束（来自 shared_constraint_v3.md）

### §3.1 地名铁律
城市内房间名 = **绝对正常**。可用字：茶/铺/铁/米/当/布/药/钱/酒/面/粥/饺/饼/汤/香/烛/陶/木/石/桥/河/湖/街/巷/门/楼/堂/庙/寺/院/馆/坊/市/驿/渡/口/衙/监/贡/监/库/仓/井/宅/园/居/轩/斋/阁/台/亭/栏/榭……
**禁用字**：灵/诡/冥/怨/煞/魔/妖/邪/鬼/怪/异/魑/魅/魍/魉。

### §3.2 房间描述：2+1 结构
每种模板详见 shared_constraint_v3.md §2。
- **Template 1（广场类）**: 60-80字, 3句。环境白描 + 人群/商业氛围 + 一个不解释的细节。
- **Template 2（商铺类）**: 50-70字, 1-2长复句, 类似MUD小吃店用逗号连缀8分句。环境 + 正常货品 + 一个不安的细节。
- **Template 3（客栈类）**: 60-80字, 3句。客栈日常 + NPC日常对话 + 一个不对的味道/声音/影子。
- **Template 4（通道类）**: 20-35字。极简。出口引导 + 一句反常。
- **Template 5（官署/寺庙）**: 60-80字, 3句。威严/肃穆 + 其中某物位置不对或颜色不对。
- **Template 6（水域/户外）**: 50-70字, 2-3句。水/风/光 + 不该出现在那里的东西。

句子硬指标：短分句4-12字、中句10-22字、长复句25-54字、每房间40-100字/3-6分句。长短句必须交错。

### §3.3 语言铁律
- ✅ 用"你"作主语：**禁止**。用"此处/这间/这里"。
- ✅ 出口方向：**中文**（北/南/东/西），不要用英文 north/south。
- ✅ NPC名字：纯中文，**不要**英文拼音。
- ✅ 诡异细节：**白描，不解释**。"掌柜拨算盘——有一颗珠子不响。"
- ✅ 凡人对话：**完全日常**，毫无察觉。NPC从不点破奇怪的事。
- ❌ 禁用词全清单见 shared_constraint_v3.md §5。

### §3.4 嵌套子房间写法（新增）
每个有嵌套的父房间必须在 `observable` 字段内定义：

```javascript
observable: {
  inspect_desc: "你仔细观察四周……（3-4句，白描所见）",
  sub_rooms: [
    {
      id: "yt_hotel_upstairs",
      name: "悦来客栈·二楼雅间",
      prereq: {type: "quest", id: "quest_hotel_letter"},
      fail_msg: "楼梯口的伙计拦住了你：\"客官，二楼被人包了。\"",
      success_msg: "你亮出信物，伙计眼神微变，侧身让开了楼梯。",
      desc: "独立的房间描述（遵守§3.2句长规则）",
      exits: {"下": "yt_hotel"},
      danger: 2,
      npcs: [...],
      items: [...],
      events: [...]
    }
  ]
}
```

**8种预设条件类型**（详见 shared_constraint_v3.md §7.2）：
1. `{type:"skill", skill:"lightfoot", value:40}` — 技能检查
2. `{type:"realm", value:"筑基"}` — 修为境界
3. `{type:"daoxin", value:50}` — 道心值
4. `{type:"item", id:"jiazhu_ling"}` — 持有物品
5. `{type:"quest", id:"quest_hotel_owner"}` — 任务完成
6. `{type:"faction", id:"ziwei"}` — 宗派归属
7. `{type:"time", value:"子时"}` — 特定时辰
8. `{type:"composite", and:[...]}` — 组合条件

---

## 四、idle 事件（每房间4个）
4个事件的梯度：
- event[0]：纯日常（行人/商贩/猫狗/炊烟）
- event[1]：日常但有轻微不适（某物数量对不上、颜色变了）
- event[2]：不安明显化（一个不该出现的影子、声音）
- event[3]：修士特有感知（灵气波动、道心微颤——凡人不可见）

---

## 五、输出格式
```javascript
// Ghost MUD v2.0 · 应天府市井区
const CITY_ROOMS = {
  '应天府·十字街口': {
    desc: '...',
    connections: { 北: '北大街', 南: '南大街', 东: '东大街', 西: '西大街' },
    danger: 1,
    events: [ ... ],
    npcs: [ ... ],
    items: [ ... ]
    // observable 字段仅当有嵌套子房间时存在
  },
  // ... 66间
};

// 子房间不单独放在顶层级，嵌在父房间的 observable.sub_rooms 内。
```

## 六、连接关系（MAP_CONN）
- 十字街口 连通 四门四街
- 四门 连通 城外（Agent B的荒野房间，暂用占位符）
- 门内 连通 邻近坊巷/商铺
- 秦淮河沿岸 各点南北对应连通，沿河东西连通
- 桥梁 连接南北两岸
- 宗派联络点 与其所在邻近主街道连通

> **与Agent B的连接**：四门的外方向出口暂用 `'钟山北麓(待建)'` 等占位符，届时合并统一替换。

---

## 七、自检清单（完成后逐条打勾）
- □ 所有66间房间 desc 已写，遵守2+1结构
- □ 所有事件（264个）已写，遵守梯度
- □ 所有有嵌套标记的房间已含 observable 字段
- □ 所有子房间已嵌入，prereq / fail_msg / success_msg 已填
- □ shared_constraint_v3.md §5 禁用词清单逐条扫描通过
- □ 地名零禁用字（灵/诡/冥/怨/煞/魔/妖/邪/鬼/怪/异）
- □ NPC名字纯中文，无英文拼音
- □ 出口方向中文（北/南/东/西）
- □ 房间 desc 未用"你"作主语
- □ 句长符合指标（40-100字/间, 3-6句, 长短交错）
- □ style_anchor.md 中的风格锚点已对照
- □ faction_rebrand.md 中的宗派名已正确使用

---

## 八、Phase 2 预告（本次不实现）
后续多城方案（洛阳/苏州/汴京/长安等）将参考本次应天府的101间+嵌套架构复制扩展。本次只做应天府一城。
