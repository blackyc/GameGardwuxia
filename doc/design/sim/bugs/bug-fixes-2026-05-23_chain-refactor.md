# Bug Fixes — 2026-05-23 链锁重构

## Fix 1: ARG 单参数吞噬
- **根因:** `ARG = args[1]` 仅取首个参数 → `dantian 0 1` 的"1"丢失
- **修复:** `ARG = args.slice(1).join(' ')` (interact3.js:20)
- **影响:** dantian/chain_respond 等需要多参数的命令

## Fix 2: saveState 删除 _responseWindow
- **根因:** JSON序列化前 `delete state._responseWindow` → showState无法显示窗口
- **修复:** 仅清洗 `candidates[].registry`（函数引用），保留窗口结构 (interact3.js:268)
- **兜底:** respond命令增加 _responseWindow 缺失时的内存重建逻辑

## Fix 3: executeResponse indexOf 失配
- **根因:** JSON序列化后对象reference丢失 → `arr.indexOf(card)` 返回 -1
- **修复:** 改为按 `card.id` 匹配 (interact3.js:992)

## Fix 4: scanResponses 含弃牌堆
- **根因:** zones 数组包含 `discardPile` → 舍身撞死后被重复发现
- **修复:** 移除 `{ k: 'discardPile', arr: player.discardPile }` (interact3.js:1014)

## Fix 5: 聚气诀 delayedDantian 失效
- **根因:** resolutionPhase 的 clearZones 将AZ全移至弃牌堆 → preparationPhase查AZ为空
- **修复:** clearZones 先分离 `_delayedDantian` 牌进丹田（加内），不推弃牌堆 (interact3.js:749)
- **验证:** 聚气诀打出→回合末入丹田+3内

## Fix 6: 响应链锁YGO化
- **改动点:**
  - `handleResponseWindow` → 增加 `_refusedInChain` 去重 + LIFO结算 (interact3.js:1119)
  - respond/skip 命令 → 标记拒绝牌 (interact3.js:1682)
  - preparationPhase → 清除跨回合 _refusedInChain (interact3.js:471)
- **解决:** 同一牌在同链中只能响应一次，后入先出结算，防无限循环

## Fix 7: 透骨钉 conditionalPower
- **状态:** defer — combatResolver.runJudgment 逻辑正确但需验证引擎所有调用路径
- **测试:** P=2+3(flaw)+6(counter)=11 ✓

## 新文件
- `src/agent-c.js` — AgentC AI vs AI自动对局引擎
- `src/batch-runner.js` — 批量编排器（10000场/组）
- `data/` — 对局结果JSON
- `bugs/` — Bug记录
