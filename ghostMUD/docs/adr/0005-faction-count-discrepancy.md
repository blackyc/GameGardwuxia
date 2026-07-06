# ADR-0005: 12 宗门差异分析——肉慈斋 FACTIONS 注册遗漏

**Status**: Accepted  
**Date**: 2026-07-06  

## Context

H3 审计发现代码中 FACTIONS 只有 11 个宗门，而设计文档（MEMORY.md）称"6 武修 + 6 灵修 = 12 宗门"。

### 现状

**代码中 11 个 FACTIONS**：
- 武修 6：问剑峰、药王谷、血禅寺、焰心教、傀坊、逍遥驿
- 灵修 5：忘尘宗、紫霞山、归墟、镜阁、青囊庐

**设计 12 个宗门**（6 武修 + 6 灵修）：
- 武修 6：问剑峰、药王谷、血禅寺、焰心教、傀坊、逍遥驿
- 灵修 6：忘尘宗、紫霞山、归墟、镜阁、**肉慈斋**、青囊庐

### 根因

肉慈斋的数据**已存在**于以下文件中：
- `combat_skills_v3.js`：5 个技能（肉刺/增生掌/血肉模糊/虫母之触/血肉再生）
- `corruption_system.js`：畸变系统定义（莎布·尼古拉丝映射）
- `jianghu_events.js`：江湖事件
- `rebuild_enemies_items_realms.js`：`LING_FACTIONS` 数组中包含肉慈斋

但 `GHOST_SKILL_TREES_1` 和 `GHOST_SKILL_TREES_2`（在 `rebuild_skill_descriptions_1.js` 和 `rebuild_skill_descriptions_2.js` 中定义）**未包含肉慈斋的技能树**。

`integration_v2.js` 的 `FACTIONS` 是从这两个 SKILL_TREES 对象构建的，因此肉慈斋不会进入 FACTIONS。

## Decision

1. **不补空宗门凑数**——遵循 H3 指导约束
2. **根因是注册遗漏，不是设计变更**——肉慈斋在技能/畸变/事件层面都有完整数据，只是技能树描述文件漏了它
3. **H3 阶段记录此决策，H5 或后续阶段补注册**——当前优先级是房间 ID 迁移和数据契约，补全肉慈斋技能树描述需要叙事文本编写，不属于 H3 范围
4. **临时措施**：在 `LING_FACTIONS` 中保留肉慈斋（已有），FACTIONS 缺少它不会导致崩溃（`game.js` 有 `if (faction)` 守卫），但玩家无法选择肉慈斋作为门派

## Consequences

- FACTIONS 数量 11 ≠ 设计 12，已知偏差，记录在案
- 肉慈斋相关技能/畸变/事件数据存在但不可通过正常门派选择触达
- 后续需在 `rebuild_skill_descriptions_1.js` 或新建 `rebuild_skill_descriptions_3.js` 中补全肉慈斋技能树描述
- 补全后 FACTIONS 自动变为 12（integration_v2.js 会自动收集）
