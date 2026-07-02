# ghostMUD 数据修复报告

**日期**: 2026-07-03  
**项目**: ghostMUD (D:\MUD\ghostMUD)

## 修复内容

### 1. integration_v2.js 语法修复
- L211 郊区 connections 行被之前脚本破坏（重复连接拼接、缺逗号），导致 JS 语法错误
- 恢复为原始 4 条连接（东/北/西/南各一条）

### 2. name 字段补全（203/203 ✓）
- **_flattenSubRooms**: 子房间展开时缺 name 字段 → 添加 `name: subName`
- **郊区循环**: 7 个郊区房间缺 name → 添加 `name: _sn`
- 涉及 32 个子房间（24 城市子房间 + 5 野外子房间 + 3 其他）

### 3. 连接双向性（546 条总，495 双向 91%）
- **integration_v2.js 反向连接逻辑修复**:
  - 去掉 `isSuburb` 跳过限制（之前郊区反向连接不补全）
  - 添加 `回` 方向后备（方向冲突时用 `回` 代替反向方向）
  - 扩展 OPPOSITE 映射（增加 内↔外、深↔出、回岸↔入）
- **源文件反向连接**: 部分源文件被之前脚本追加了反向连接，与运行时自动补全重复但无害
- **剩余 51 条缺反向**: 方向设计冲突（多个房间共用同一方向），`回` 也被占用时的物理限制

### 4. 任务 NPC 修复
- **q007 "乱葬岗之约" stage2**: `location: '义庄·乱葬岗'` → `'义庄·乱葬岗·停尸房内'`（义庄看守在该房间的 npcs 中）
- **q011 "狐仙幻境"**: 3 处 `栖霞野林` → `栖霞·野林`（正确房间名含间隔号）

### 5. _reverse_dirs 标记
- 在 integration_v2.js 末尾添加运行时标记逻辑
- 187 间房间被标记 `_reverse_dirs` 数组，记录哪些方向是自动补全的反向连接
- game.js 可用此标记做条件封锁（如需要道具才能通过）

### 6. 构建验证
- Vite 构建成功：27 模块，132.44 kB JS，257ms
- hash: `index-DH96gLBE.js`（与上次相同，因改动在数据文件不在 src 模块）
- LOCATIONS: 203 间，Registry: 49 变量

## 未修复的已知问题
1. **51 条单向连接**：方向设计冲突，物理空间约束导致无法互逆
2. **COMBAT_SKILLS_V3 未启用**：70 个 V3 技能在数据中定义但代码中零引用
3. **checkQuestProgress 用 type 而非 action**：15 个任务的推进逻辑可能全部失效
4. **郊区共享连接模板**：7 个郊区用同一组 4 条连接，设计上每个郊区应连不同野外区域

## 修改的文件
- `public/data/integration_v2.js` — 语法修复、name 补全、反向连接逻辑、_reverse_dirs、q007/q011 修复
- `public/data/rebuild_rooms_city.js` — connections 行修复（去重）、部分反向连接追加
- `public/data/rebuild_rooms_wild.js` — connections 行修复（去重）、部分反向连接追加
- `public/data/rebuild_dungeon_rooms.js` — connections 行修复（去重）
- `public/data/rebuild_rooms_wenjianfeng.js` — connections 行修复（去重）
- `public/data/ghost_faction_recruiter_encounters.js` — 之前已清空为 {}
