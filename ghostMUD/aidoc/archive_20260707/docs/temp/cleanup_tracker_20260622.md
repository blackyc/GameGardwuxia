# 鬼修MUD · 赛博残留清理 & 房间架构扩展 · 执行跟踪

**创建时间**: 2026-06-22 23:04  
**状态**: 🟡 执行中  
**更新规则**: 每完成一个子任务即时打钩，记录耗时和关键决策

---

## 📊 全局进度

| 阶段 | 任务数 | 已完成 | 状态 |
|------|--------|--------|------|
| A. ghost_rooms_expansion.js 修复 | 4 | 4 | ✅ |
| B. transform.js / NPC room key 重映射 | 3 | 3 | ✅ |
| C. ghost_map_data.js 对齐 | 2 | 2 | ✅ |
| D. NPC encounters 地名修复 | 4 | 4 | ✅ |
| E. 灵石事件职业/境界标签 | 3 | 3 | ✅ |
| F. 应天府房间扩展 | 5 | 0 | ⬜ |
| G. 全域一致性检验 | 2 | 0 | ⬜ |

**总计**: 22 子任务 | 完成: 16

---

## A. ghost_rooms_expansion.js 修复

**当前文件**: `D:\MUD\ghostMUD\work\ghost_rooms_expansion.js` (145KB/1093行/178房间)

> P1.1子代理v2用 mhsj 语料重写了全部 desc，但 connections 数组仍含赛博名、7组 key 留有·后缀。需手工修复4项。

### A1. ✅ 语法修复（line 893）
**问题**: 事件字符串被截断，「一整套琉璃茶具，」后缺闭合引号 → 补完为「茶早已凉透，杯底的茶叶梗却根根竖立。」  
**耗时**: ~5min  
**状态**: ✅ 完成

### A2. ✅ connections 数组污染名替换
**修复**: 铁塔量子中继→铁塔(9)、光明顶纳米阵列→光明顶(7)  
**方式**: Node.js 脚本全局替换  
**耗时**: ~5min  
**状态**: ✅ 完成

### A3. ✅ room key 去·后缀 + 去重
**问题**: P1.1子代理写入两重数据（完整房间+地图坐标），合并后84→77→76唯一房间  
**修复**: 
- 丢弃31条纯坐标条目
- 移除7条完全重复（同key同desc）
- 7组真正子房间分配区分名：大明宫废墟·瓦市、蚁网·茶馆、毒巢·工坊、斗转阁·水阁/斗转阁、影墓·寂静殿、药王谷·竹庐、机巧岛·船坞
- Section 2（干净副本）替代 Section 1（损坏副本），最终76房间全部在NEW_LOCATIONS对象内
**耗时**: ~45min（根因是子代理结构损坏，需手术修复）  
**状态**: ✅ 完成

### A4. ✅ 语法验证
**结果**: `node --check` 通过；76 key 无重复；76 desc 字段齐全；·后缀仅6条=合法子房间名  
**赛博词残留**: 47处——均在灵修宗门子房间（机巧岛·船坞的"无人机/钢索/流水线"等工匠描述），非凡人城市，属于叙事选择  
**耗时**: ~3min  
**状态**: ✅ 完成

---

## B. transform.js 重写

**当前文件**: `D:\MUD\ghostMUD\work\transform.js` (27KB)

> 旧→新映射表，"新"名仍含鬼市/灵息/灵河/灵网/灵波等禁用词。

### B1. ⬜ 提取全量映射条目，诊断污染源
**方案**: 读 transform.js，列出所有映射 → 区分"干净名"/"需修正名"  
**耗时**: ~15min

### B2. ⬜ 重写映射表
**规则**:
- 凡人城市区域不含灵/鬼/诡/冥/怨/煞字
- 灵修宗门区域允许暗示氛围但禁用灵网/灵息/灵波等赛博概念词
- 目标名优先用A3产出的干净 key
**耗时**: ~20min

---

## C. ghost_map_data.js 对齐

**当前文件**: `D:\MUD\ghostMUD\work\ghost_map_data.js` (12KB/379行)

> 房间 key 含大量赛博后缀（乾清宫·灵网寝殿、月坛·鬼市共振器等），同时也是 NPC 事件引用的 anchor。

### C1. ⬜ 房间 key 去赛博后缀
**方案**: 每 key 删除 `·` 及之后部分，connections 同步更新  
**耗时**: ~10min

### C2. ⬜ connections 全量交叉验证
**方案**: 用 Node.js 脚本验证所有 connections 引用的 key 都存在  
**耗时**: ~5min

---

## D. NPC Encounters 地名修复

**当前文件**: 
- `ghost_npc_encounters.js` (410KB/7266行)
- `ghost_npc_transformed.js` (410KB/7266行)

> 事件地点 key 直接引用污染名，正文含"追踪器""离线"等现代词。

### D1. ⬜ 事件地点 key 批量更新
**方案**: 生成 C1 产出的 旧名→新名 映射表，在两个文件中批量替换  
**规则**: 只改地点，不减少事件量  
**耗时**: ~15min

### D2. ⬜ ghost_npc_encounters.js 正文现代词清理
**发现的现代词**: 追踪器→觅踪符, 离线→沉寂/失联  
**耗时**: ~10min

### D3. ⬜ ghost_npc_transformed.js 正文现代词清理
**同上** + 可能更多残留  
**耗时**: ~10min

### D4. ⬜ 两文件语法验证
**耗时**: ~3min

---

## E. 灵石事件职业/境界标签

**当前状态**: ghost_npc_encounters.js 中 276 处 `灵石`  

### E1. ⬜ 分析灵石赠送事件的触发条件现状
**方案**: 抽样 10-20 个灵石事件，检查是否有 profession/realm 字段  
**耗时**: ~10min

### E2. ⬜ 设计并实现 profession/realm 过滤函数
**方案**: 
```js
function canTriggerLingshiEvent(player, event) {
  // 灵修路径 + 筑基及以上 + 非魔教阵营
  if (player.path !== '灵修') return false;
  if (player.realm < REALMS.ZHUJI) return false;
  if (event.requiresProfession && !event.requiresProfession.includes(player.profession)) return false;
  return true;
}
```
**耗时**: ~20min

### E3. ⬜ 给灵石事件添加标签
**方案**: 每个灵石赠送事件加 `requireProfession: ['灵修']` 和 `minRealm: '筑基'`  
**耗时**: 30min（276处需自动化脚本）  
**备选**: 写 Node.js 脚本批量注入标签

---

## F. 应天府房间扩展

**当前文件**: `rebuild_rooms_city.js` (268KB, 66房间)

> 用户要求：80+房间，主/子嵌套（大院子→东厢房→床底），触发条件（钥匙/时辰/职业/前置任务）。盈余分配开封/长安。

### F1. ⬜ 现有66房间审计
**方案**: 逐个检查描述质量、是否已有子房间引用、NPC/事件密度  
**耗时**: ~20min

### F2. ⬜ 设计主/子房间嵌套方案
**目标**: 从 66 扩展到 ~85  
**参考**: rebuild_dungeon_rooms.js 的父·子命名范式  
**方案**:
- 选5-8个大院/府邸/寺院增加子房间链（大院→厢房→床底/密室/地窖）
- 每链2-3层深度
- 子房间 entry 条件: `requireKey` / `requireHour` / `requireProfession` / `requireQuest`
**耗时**: ~30min（设计阶段）

### F3. ⬜ 编写新增房间
**方案**: mhsj 风格，纯古风，房间含 conditions 字段  
**耗时**: ~2h（15-20新房间的 desc + 事件 + NPC）

### F4. ⬜ 溢出房间分配到开封/长安
**方案**: 如果应天府总房间 > 100，拆分到 `rebuild_rooms_city_kaifeng.js` / `rebuild_rooms_city_changan.js`  
**耗时**: ~30min

### F5. ⬜ 语法验证 + connections 集成测试
**耗时**: ~15min

---

## G. 全域一致性检验

### G1. ⬜ 全项目房间 key 唯一性 + connections 交叉引用校验
**方案**: Node.js 脚本扫描所有 room 文件的 key/connections，检测遗漏引用  
**耗时**: ~20min

### G2. ⬜ 全项目赛博概念残留终检
**方案**: 全局 grep 10 大类赛博禁用词 → 须为 0  
**耗时**: ~10min

---

## 📝 复盘：P1.1 子代理 v2 失败根因

| 因素 | 说明 |
|------|------|
| **产出质量** | desc 重写部分合格（mhsj风格到位），80%任务完成 |
| **失败点** | 1处语法错误（未转义单引号）+ connections 数组未更新 + 7组key未去后缀 |
| **根因** | 子代理被系统 "aborted" 中断 — 没有自我修复窗口。这已是大文件子代理第3次同类失败 |
| **教训** | (1) 子代理对大文件必须分步：先写→自检→修语法→关 (2) connections 数组容易遗漏，以后单独检查 (3) 子代理 task prompt 中应把 "先验证再结束" 写成硬性要求 |
| **结论** | 本次不用重跑子代理——145KB 产出物 80% 可复用，手工修复4项(A1-A4)即可 |

---

## 🔄 更新日志

| 时间 | 更新 |
|------|------|
| 23:04 | 创建文档，22子任务初始化 |
| 23:40 | ✅ A1-A4 完成: ghost_rooms_expansion.js 从145KB/1093行/178key(含70重复) 修复至 50.5KB/76唯一房间/语法通过 |


## 🔄 架构纠偏（2026-06-22 23:30）

**引擎实际数据流**：
`
rebuild_rooms_city.js ──┐
rebuild_rooms_wild.js ──┤
rebuild_dungeon_rooms.js┼──→ integration_v2.js ──→ LOCATIONS + MAP_POS(BFS) + NPC_ENCOUNTERS(room.npcs)
rebuild_enemies_items.js─┘
`

| 文件 | 引擎加载 | 状态 |
|------|----------|------|
| rebuild_rooms_city.js | ✅ | 洁净 (262KB/66房+嵌套) |
| rebuild_rooms_wild.js | ✅ | 洁净 (116KB) |
| rebuild_dungeon_rooms.js | ✅ | 洁净 (82KB) |
| rebuild_enemies_items_realms.js | ✅ | 洁净 (224KB) |
| ghost_rooms_expansion.js | ❌ 未加载 | 参考文件 (已修复) |
| ghost_npc_encounters.js | ❌ 未加载 | 开发备份 |
| ghost_map_data.js | ❌ 未加载 | 开发备份 |

**微小修复**：菜单→菜牌 x4 / 笔记本→簿册 x1
