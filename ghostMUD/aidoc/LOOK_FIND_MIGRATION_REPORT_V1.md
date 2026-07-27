# 张望 / 探索规范化迁移报告 V1

> 日期：2026-07-22
>
> 唯一根目录：`D:gitGameGardwuxiaghostMUD`

## 1. 已迁移

1. 新增共享场景浮层服务 `src/scene_interaction_service.js`。
2. 张望从内嵌 `#perception-panel` 改为独立画卷浮层；旧方法只保留兼容代理。
3. 探索由 `SearchService` 先结算，再调用共享画卷展示事件结果。
4. `RouteService` 新增 `getMapRoutes()` 与 `getLookEntrances()`。
5. route-sketch 改为只消费同层路线。
6. 新增跨层移动门禁：只有张望画卷传入 `viaLook` 才可跨层，快速旅行不可跨层。
7. 新增 `state.searchEventAttempts` 并纳入存档 schema。
8. 唯一事件兼容 `unique` / `once`，支持 `pityAfter`。
9. 世界上下文增加房间、地域、时辰、时段、旗标、道具和人物规模约束。
10. 夜间多人随机事件默认被过滤，除非显式声明 `allowAtNight: true`。

## 2. 接口变化

| 类型 | 数量 | 说明 |
| --- | ---: | --- |
| 新服务 | 1 | `SceneInteractionService` |
| 新路线查询接口 | 2 | `getMapRoutes`、`getLookEntrances` |
| 移动接口签名变化 | 1 | `explore(dir, options)`，旧调用仍兼容 |
| 新持久状态 | 1 | `searchEventAttempts` |
| 新输入动作 | 3 | `sceneClose`、`sceneEnter`、`sceneReveal` |
| 兼容代理 | 2 | `openPerception`、`closePerception` |
| 删除的运行时 UI | 1 | 内嵌 `#perception-panel` DOM |

## 3. 已有范例

- `问剑峰·弟子居东 -> 我的住处 / 苏小棠的住处 / 周碛的住处 / 阿满的住处` 已使用 `kind: 'interior'`。
- `问剑峰·竹林 -> 问剑峰·竹林深处` 已使用 `kind: 'dungeon'` 与 `discovery`。
- `wjf_baizhi_wreath` 已具备唯一性、概率、三次保底、随行条件、道具和结果文案。

## 4. 尚未完成的数据工作

1. 大部分 room 尚未提供 `sceneIllustration`，当前重要 room 暂用江湖背景作过渡图。
2. 旧 `ROOM_SEARCH` 多数没有显式 `conditions`、`castSize`、`timePeriods`，必须逐池补标才能完整保证“不违和”。
3. 复杂副本应逐步补 `spaceLayer`，取代运行时反向推断。
4. 任务事件目前通过 `checkQuestProgress('find', eventId)` 桥接，后续应统一到结构化 quest event contract。
5. 探索事件插图建议存入 `public/ui/events/`，room 立绘建议存入 `public/ui/rooms/`。

## 5. 兼容与风险

- 旧 `data-action="perceive"` 保留，旧按钮和命令不需要批量重命名。
- 旧 `PerceptionService.getRoomPerception()` 暂保留，但不得再用于主页面渲染。
- `kind` 标错会导致路线进入错误地图层，这是数据迁移最高风险项。
- 多人随机事件必须补 `castSize > 1` 或 `multiActor: true`。
- `sceneIllustration` 缺失不会阻塞功能，但使用过渡图不能视为美术验收完成。

## 6. 后续 worker 顺序

1. 补全主/子地图边界的 `kind` 与双向一致性。
2. 为复杂区域补 `spaceLayer` 并做层内连通性检查。
3. 逐个旧随机事件池补 `conditions` 和人物规模元数据。
4. 将任务探索事件迁入 room `searchEvents` 或结构化任务事件注册表。
5. 生产并挂接首批 room/event 插图。
6. 按权威规范第 7 节验收，不得以“弹窗能打开”替代地图层切换验收。
## 7. 本轮验证

- `node --check`：相关 JavaScript 文件语法通过。
- 轻量契约测试：主/子地图分层、跨层门户归属、同层隐藏路线揭示、时辰过滤、唯一事件三次保底均通过。
- 契约测试发现并修复：子房间返回父房间的 `interior` 边曾会把父房间反向误判为子层；现改为 `spaceLayer > zoneKind > 入边推断` 的优先级。
- `npm run build`：Vite 生产构建通过，60 个模块完成转换。
- 本轮没有建立临时测试文件；契约测试通过标准输入执行。
