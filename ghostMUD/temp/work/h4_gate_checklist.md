# H4 验收门禁检查清单

> 基于 health_recovery_execution_guide.md H4A 验收门禁

## 门禁 1: 真实 version 1 样本可迁移，关键字段逐项比对

- [ ] 模拟 v1 存档数据（包含旧字段名 questProgress 等）
- [ ] 加载后 v1 数据正确迁移到 v2
- [ ] 关键字段逐项比对：location, realm, cultivation, daoxin, hp, faction, path, gameTime, inventory, skills

## 门禁 2: 异常存档处理

- [ ] 缺字段 → 填默认值，不崩溃
- [ ] 错类型 → 纠正为默认值，不崩溃
- [ ] 截断 JSON → 返回 null，不抛异常，原始值保存到 corrupt key
- [ ] 未知版本 → 返回 null 或尝试迁移（取决于策略）

## 门禁 3: 备份机制

- [ ] save 前自动备份到 `ghostmud_save_v2_backup`
- [ ] 备份可读取
- [ ] 写入失败时备份不被覆盖

## 门禁 4: 保存后刷新可恢复

- [ ] 保存后重新加载，所有状态字段完全一致
- [ ] 临时字段（combat, npcEncounter）不存档

## 门禁 5: 测试隔离

- [ ] 测试不使用真实 localStorage key
- [ ] 使用 mock localStorage 或隔离 key

## 门禁 6: UI 无假保存按钮

- [ ] 所有保存按钮有事件处理
- [ ] 散落的 storage.save 调用统一为 saveGame()
