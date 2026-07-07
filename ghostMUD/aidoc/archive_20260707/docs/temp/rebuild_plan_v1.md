# 鬼修 MUD 重建工程方案 v1.0
## 2026-06-19 · AI 工程师

---

## 一、诊断结论

### 1.1 污染不是"残留"——是"本质"

`ghost_game_data.js` 不是"迁移不彻底"，是**从未真正迁移**。抽样结果：

| 数据类型 | 赛博本质 | 表面聊斋化 |
|----------|---------|-----------|
| 境界 (REALMS) | "命元药注射" "微尘循环" "法器槽位" | 套了"灌入""觉醒"命名 |
| 敌人 (ENEMIES) | "合金颅骨" "灵息探针" "生化法器" "大断电用户残片" | 套了"缉查使""劫匪"命名 |
| 物品 (ITEMS) | "灵脉化学法器" "灵息包" "禁制符文" | 套了"丹药""灵符"外衣 |
| 房间 (LOCATIONS) | "灵息洪流" "灵缆" "灵脉禁阵" "暗域阵眼" | 部分房屋写了聊斋味 |

**结论：整层皮下面是全套赛博骨骼。正则替换永远洗不干净。必须重建。**

### 1.2 干净 vs 污染分界线

```
█ 保留 ✅（0残留，已验证通过）：
  ├── ghost_npc_encounters.js      400KB   NPC奇遇（纯聊斋）
  ├── rooms_ghost_all.js            35KB   22间聊斋房（纯）
  ├── ghost_faction_quests.js       35KB   帮派任务（纯）
  ├── ghost_pkuxkx_quests.js        30KB   侠客行任务（纯）
  ├── ghost_faction_recruiter_encounters.js  17KB  招募系统（1处残留，可忽略）
  ├── ghost_quests_v2.js           100KB   主线任务（4处残留，轻微）
  ├── ghost_map_data.js             12KB   地图拓扑（刚重建，干净）
  └── ghost_mud.html                99KB   引擎（已修复所有BUG）

█ 重建 🔴：
  ├── ghost_game_data.js           250KB   主数据（LOCATIONS+ENEMIES+REALMS+ITEMS）
  ├── ghost_rooms_expansion.js     152KB   扩展房间
  ├── ghost_skill_trees_1.js        75KB   技能树1（描述部分污染72处）
  ├── ghost_skill_trees_2.js       104KB   技能树2
  ├── ghost_enemies_items.js        59KB   敌人/物品（残留8处）
  └── ghost_atmosphere.js           49KB   氛围物品（残留6处）
```

### 1.3 为什么"聊斋志异Wiki + MUD数据"是更优源

| 维度 | 现有 ghost_game_data.js | MUD原生 + 聊斋Wiki |
|------|------------------------|-------------------|
| 世界观纯度 | 赛博底子套聊斋皮 | 原汁原味鬼神文化 |
| 房间描述 | 城市房间混杂灵息/法器 | 村镇/山野/古宅/荒坟 |
| 敌人设计 | 本质是"被黑掉的用户/故障AI" | 妖/鬼/邪/怪/僵尸/精魅 |
| 物品体系 | 灵石/灵脉/禁制=赛博道具 | 符箓/丹药/法器/阴物 |
| 修行体系 | 微尘×天道=科技隐喻 | 炼气→金丹=文化本体 |
| 文本质量 | 需逐句判断哪些是"被改过的赛博词" | 从零写，语义纯净 |

---

## 二、数据源清单

### 2.1 已持有

| 数据源 | 位置 | 内容 | 用途 |
|--------|------|------|------|
| pkuxkx Wiki 抓取 | `D:\MUD\analysis\pkuxkx_reference.md` (22KB) | 12门派武功树+拜师条件+任务链 | 技能树数值、宗门体系 |
| 门派重命名映射 | `D:\MUD\ghostMUD\docs\faction_rebrand.md` (17KB) | 赛博名→聊斋名+美学哲学 | 帮派体系 |
| 聊斋风格锚点 | `D:\MUD\ghostMUD\docs\style_anchor.md` (7KB) | 60/30/10调性 + 禁用词 | 写作规范 |
| 术语映射表 | `D:\MUD\ghostMUD\docs\terminology_map.md` (5KB) | 赛博→聊斋词对 | 替换参考 |
| 世界观文档 | `D:\MUD\ghostMUD\docs\worldview.md` (10KB) | 三层世界/修炼=异化 | 世界设定 |
| 修炼体系 | `D:\MUD\ghostMUD\docs\cultivation_system.md` (7KB) | 道心单轴+突破机制 | REALMS重建 |
| 妖兽设计 | `D:\MUD\ghostMUD\docs\bestiary_design.md` (10KB) | 妖兽分类/生态 | ENEMIES重建 |

### 2.2 需抓取

| 数据源 | URL | 目标内容 | 优先级 |
|--------|-----|---------|--------|
| **pkuxkx Wiki 城市页** | `https://pkuxkx.net/wiki/knowledge/` | 北京/扬州/长安/大理/泉州等城市房间描述 | P0 |
| **pkuxkx Wiki 怪物** | 同上 NPC 子页 | 各等级怪物数值+描述 | P0 |
| **MUDDameng Wiki** | 待搜索 | 扩展房间地图、支线任务 | P1 |
| **书剑MUD Wiki** | 待搜索 | 武功描述、人物对话 | P1 |
| **聊斋志异全文** | 古文网/百度百科 | 典型场景+妖物+氛围元素库 | P1 |
| **克苏鲁中文Wiki** | `https://cthulhu.huijiwiki.com` | 不可名状描写语料 | P2 |

---

## 三、分阶段重建路线

### 阶段 0：数据采集（并行，~30min）

```
子Agent-0A: pkuxkx 城市房间抓取
  输入: pkuxkx Wiki 城市页面列表
  输出: rooms_raw_data.json（房间名→描述→连接关系）
  
子Agent-0B: pkuxkx 怪物/NPC 数据抓取
  输入: 各门派NPC页面 + 公共怪物页面
  输出: enemies_raw_data.json（名→HP/ATK/DEF→描述）

子Agent-0C: 聊斋志异语料库提取
  输入: 聊斋志异全文 + 百度百科聊斋词条
  输出: liaozhai_corpus.json（场景片段/妖物名/氛围短语库）

子Agent-0D: 已持有文档索引
  输入: 上述7个ghostMUD/docs/文件
  输出: 统一术语表 + 写作约束清单
```

### 阶段 1：数据结构设计（手工，~15min）

```
产出: data_schema_v2.md
  ├── LOCATIONS 结构（不变: {desc, connections, danger, events[4]}）
  ├── ENEMIES 结构（不变: {hp, atk, def, exp, gold, desc} + 新增属性 type(妖/鬼/邪/怪)）
  ├── REALMS 结构（重设计: {name, cost, atk, def, hp, desc, daoxinThreshold}）
  ├── ITEMS 结构（重设计: {name, type(丹药/符箓/法器/阴物/杂物), effect, desc}）
  └── 命名空间/ID 规范
```

### 阶段 2：核心数据生成（并行主力，~2h）

```
子Agent-2A: 房间数据生成（LOCATIONS）
  输入: rooms_raw_data.json + liaozhai_corpus.json + style_anchor.md
  处理: 102个房间 × 4事件 = 408条聊斋化描述
  约束: 
    - 写实基底→聊斋异常（如"客栈"→"子时后大堂桌椅自己挪位"）
    - 禁用所有赛博词（芯片/灵息/法器/微尘/灵脉/阵眼/禁制/天道/灵络/暗域…）
    - 用正统聊斋话术（阴气/妖氛/鬼火/纸钱/冥婚/僵尸/狐仙/画皮/阴差/奈何桥/黄泉…）
  产出: ghost_game_data_Locations.js（~80KB）

子Agent-2B: 敌人数据生成（ENEMIES）
  输入: enemies_raw_data.json + bestiary_design.md + 聊斋妖物典
  处理: 50个敌人 × 完整数值+描述
  分类: 妖10/鬼12/邪10/怪8/人祸10
  示例: 
    旧「灵脉劫匪」 → 新「剥皮妖丐」: 白日行乞的老丐，入夜剥人脸皮为衣
    旧「天道缉查使」 → 新「阴差锁魂」: 地府鬼差，铁链拖地，闻到活人气就追
  产出: ghost_game_data_Enemies.js（~40KB）

子Agent-2C: 境界数据生成（REALMS）
  输入: cultivation_system.md + 正统修仙境界名
  8个境界: 凡胎→炼气→筑基→金丹→元婴→化神→合体→渡劫
  每境界: {name, cost, atk/def/hp曲线, desc(聊斋化), daoxinThreshold}
  产出: ghost_game_data_Realms.js（~8KB）

子Agent-2D: 物品数据生成（ITEMS）
  输入: 聊斋物品体系 + 正统修仙丹符器
  分类: 丹药15/符箓15/法器15/阴物10/杂物30/特殊15 → 100+
  产出: ghost_game_data_Items.js（~30KB）
```

### 阶段 3：技能树 & 扩展房间重写（并行，~1.5h）

```
子Agent-3A: 技能树描述重写（skill_trees_1+2）
  输入: ghost_skill_trees_1/2.js（保留数值结构） + terminology_map.md
  处理: 保留技能名/消耗/等级/效果等数值结构，只替换描述文本
  约束: 所有描述中不出现赛博词汇
  产出: ghost_skill_trees_1_v2.js + ghost_skill_trees_2_v2.js

子Agent-3B: 扩展房间重写（ghost_rooms_expansion.js）
  输入: 现有ghost_rooms_expansion.js（保留房间名和拓扑） + 聊斋语料
  处理: 逐房间重写描述和事件
  产出: ghost_rooms_expansion_v2.js

子Agent-3C: 氛围物品+敌人物品重写
  输入: ghost_atmosphere.js + ghost_enemies_items.js（保留结构）
  处理: 全面聊斋化描述
  产出: ghost_atmosphere_v2.js + ghost_enemies_items_v2.js
```

### 阶段 4：组装与集成（~1h）

```
4A. 合并脚本：6个阶段2产出 → ghost_game_data_v2.js（单一文件）
4B. 房间搜索重生成：从新 room 数据重新提取 KEYWORDS→room 映射
4C. 一致性检查：
    - 所有数据文件中无赛博关键词（SQL UNION ALL 扫描）
    - 房间名在 LOCATIONS / MAP_POS / MAP_CONN 三处一致
    - 敌人名在 ENEMIES 和 encounter 文件中不冲突
    - 物品名所有引用处存在
4D. 集成测试：
    - ghost_mud.html 替换 <script src> 指向新文件
    - 打开浏览器验证：移动/战斗/拜师/任务/探索全部通路通
```

---

## 四、风险与缓解

| 风险 | 概率 | 缓解 |
|------|------|------|
| pkuxkx Wiki 城市页面抓取失败（之前失败过） | 中 | 备选：直接从 pkuxkx MUD 客户端源码提取房间文件 |
| 子Agent 生成质量不一致 | 中 | 阶段4做 union 扫描漏网赛博词，手动补刀 |
| 聊斋语料不够丰富 | 低 | 聊斋志异原文 490+篇，精选200条场景片段足够 |
| 重建后引擎兼容问题 | 低 | 数据结构 format 不变，仅替换文字内容 |
| 技能树数值被误改 | 低 | 阶段3只改描述，不改数值字段 |

---

## 五、预估

| 阶段 | 工时 | 方式 |
|------|------|------|
| 0: 数据采集 | 30min | 4子Agent并行 |
| 1: 结构设计 | 15min | 手写 |
| 2: 核心数据生成 | 60-90min | 4子Agent并行 |
| 3: 技能树+扩展 | 60min | 3子Agent并行 |
| 4: 组装集成 | 40min | 手工+脚本 |
| **总计** | **~3h** | |

对比路线A（逐条清洗）：4-8h裸清洗 + 未知测试 → **路线B至少省一半时间，质量更高**。

---

## 六、需你决策的点

1. **敌人分类体系**：纯聊斋向（妖/鬼/邪/怪/精魅）还是混克苏鲁（不可名状/旧日支配者/深潜者）？
2. **境界命名**：正统修仙（炼气→筑基→金丹…）还是自创聊斋体系（如：肉眼→天眼→慧眼→法眼→佛眼）？
3. **房间数量**：维持102间 or 借机扩展到150+（pkuxkx 单城就有200+房间）？
4. **是否保留"应天府"地理设定**：or 迁移到纯架空地名？

给我你的选择，我直接启动阶段0抓取。
