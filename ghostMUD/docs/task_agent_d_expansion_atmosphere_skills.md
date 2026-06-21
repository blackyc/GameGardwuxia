# Agent D 任务：扩展房间重写 + 氛围物品 + 技能描述清理

## 输出文件
- `D:\MUD\ghostMUD\work\rebuild_dungeon_rooms.js`（副本/秘境房间）
- `D:\MUD\ghostMUD\work\rebuild_atmosphere.js`（氛围物品，补充C的120件）
- `D:\MUD\ghostMUD\work\rebuild_skill_descriptions_1.js`（技能树1描述清理）
- `D:\MUD\ghostMUD\work\rebuild_skill_descriptions_2.js`（技能树2描述清理）

## 强制前置阅读（MANDATORY）
1. `D:\MUD\ghostMUD\docs\shared_constraint_v3.md` — **全文通读**
2. `D:\MUD\ghostMUD\docs\style_anchor.md`
3. `D:\MUD\ghostMUD\docs\faction_rebrand.md` — 宗派名必须用 rebrand 后的名称
4. `D:\MUD\ghostMUD\docs\terminology_map.md` — 术语映射表

## ⚠️ 与 Agent A/B/C 的分工边界
- **Agent A**: 应天府市井区 66间（街道/商铺/客栈/府衙/渡口/坊巷/宗派联络点）
- **Agent B**: 寺庙道观+荒野 35间（寺庙12+道观6+宗派联络点2+荒野15）
- **Agent C**: 8境界 + 60敌人 + 120物品
- **Agent D（你）**: 副本房间 + 补充氛围物品 + 技能描述清洗

> **禁止**生成与 A/B 重复的城市/街道/商铺/寺庙/荒野房间。你的"扩展房间"是指**副本/秘境/任务专属空间**——被特定条件触发的封闭区域。

---

## Part 1: 副本/秘境房间（rebuild_dungeon_rooms.js）

### 房间来源
从 `D:\MUD\ghostMUD\work\ghost_rooms_expansion.js` 中筛选——取其中**不是常规城市/野外**的房间（如洞窟/地宫/废墟内部/坟冢内部/秘境/幻境等封闭或半封闭空间），重新聊斋化写作。

### 筛选标准
- ✅ 保留：洞窟内部、地宫、墓室、副本、幻境、密室、井下、塔内、废弃建筑内部
- ❌ 丢弃：已在 Agent A/B 101间覆盖的城市街道/商铺/客栈/寺庙/野外路径
- 未确定时对照 `shared_constraint_v3.md` §8 的完整清单

### 数量目标
约 **20-30间** 副本风格房间。每间：
- `desc`：聊斋味中到全开（template 5/7）。封闭空间特有的幽闭感 + 诡异现象。
- `events`：4个 idle 事件（梯度同 Agent A/B）
- `connections`：副本内部连通（副本出入口指向触发该副本的城市/野外房间）
- `danger`：3-5（副本 > 野外 > 城市）
- `observable`：可选，有嵌套的密室/暗道时包含

### 命名
副本房间用"X·内Y"模式，如：
- `紫金山·观星台废墟·地下密室`
- `义庄·乱葬岗·停尸房内`
- `灵谷寺·九层塔·第五层`

### 输出格式
```javascript
// Ghost MUD v2.0 · 副本/秘境房间
const DUNGEON_ROOMS = {
  '紫金山·观星台废墟·地下密室': {
    desc: '...',
    connections: { 上: '紫金山·观星台废墟' },  // 指向 Agent B 的荒野房间
    danger: 4,
    events: [ ... ],
    npcs: [ ... ],
    items: [ ... ]
  }
};
```

---

## Part 2: 氛围物品（rebuild_atmosphere.js）

### 来源
读取 `D:\MUD\ghostMUD\work\ghost_atmosphere.js`，筛选并重写。

### 分工
Agent C 已生成 120 件系统物品（丹药/符箓/法宝/阴物/杂物/特殊）。你的氛围物品专注于：
- **场景装饰品**：香炉、字画、棋盘、屏风、烛台、水缸、石狮子——这些放在房间里供"观察"交互的物品
- **可交互物件**：破损的佛像、松动的砖块、生锈的铜镜、半开的柜子、合不上的抽屉

### 数量目标
约 **60-80件** 氛围物品。每件格式：
```javascript
'铜雀香炉': {
  type: '场景物品',
  desc: '一尊三尺高的铜香炉，炉身铸着云纹仙鹤。香灰积了半炉——但香灰表面有五个指印，像是有人在香灰未冷时按上去的。',
  interaction: '观察',  // 或 翻找 / 搬动 / 点燃 等
  result: '你伸手拨开香灰，底下压着一截烧焦的竹简。字迹只剩一半：……不可直视……子时焚香三柱……'
}
```

如果从旧文件读取，**全部重写描述**（不是查找替换，是重写）。保留数据结构，替换所有文本。

---

## Part 3: 技能描述清理（两个文件）

### 源文件
- `D:\MUD\ghostMUD\work\ghost_skill_trees_1.js`
- `D:\MUD\ghostMUD\work\ghost_skill_trees_2.js`

### 保留
- 所有数值字段：`level`, `cost`, `atk`, `def`, `hp`, `mp`, `cooldown`, `duration`, `reqSkill`, `reqLevel` 等
- 技能名（除非含禁用词）
- 数据结构层级

### 全部重写
- 每个技能的 `desc` 文本
- 每个技能的 `name`（如含科技/赛博/日式/西式残留词）

### 宗派名对齐
使用 `faction_rebrand.md` 中的宗派名称。旧文件可能出现旧名/别名/拼音，全部替换为正式宗派名。

### 重写标准
技能描述遵循聊斋修仙风格，参考倩女幽魂/聊斋志异中对法术/神通的白描写法：
- ✅ "指尖凝出一道青色剑气，离手三寸时化作无形——不是消失，是看不见了。"
- ✅ "掌心浮现一枚暗红符纹，周身的阴气如受了牵引，往符中汇去。"
- ❌ "释放技能造成150%攻击力伤害"（游戏数值由引擎处理，写在 effect 字段，不写在 desc）
- ❌ "剑气纵横/光寒九州/毁天灭地"（过度夸张的武侠/仙侠味）
- ❌ 任何科技/赛博词（"数据/芯片/程序/接口/算法/代码/网络/信号……"）

### 输出格式
两个独立文件，各输出一个对象：
```javascript
// rebuild_skill_descriptions_1.js
const SKILL_TREES_1 = {
  '梵网寺': {
    skills: {
      '大悲掌': {
        name: '大悲掌',
        desc: '看似慈悲的掌法。出掌时掌心微红——不是内劲，是指骨快透出来了。',
        cost: 15,
        atk: 18,
        // ... 保留原数值
      }
      // ...
    }
  }
};

// rebuild_skill_descriptions_2.js
const SKILL_TREES_2 = {
  // ... 另一半宗派
};
```

---

## 自检清单
- □ 副本房间 20-30间，无与 A/B 重复
- □ 所有城市/街道/商铺不在本文件出现
- □ 氛围物品 60-80件，desc 全部重写
- □ 技能描述全部重写（不是查找替换）
- □ 技能名/宗派名已对齐 faction_rebrand.md
- □ 零赛博词、零旧残留词
- □ 禁用词清单（shared_constraint_v3.md §5）扫描通过
- □ 副本出口连接指向 Agent B 的荒野房间 id
- □ 文件路径在 ghostMUD/work/ 下
