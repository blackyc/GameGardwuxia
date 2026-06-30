# ghostMUD 已知 BUG 记录

## BUG-001: 门派默认跳转问剑峰后江湖页面不显示任何内容

| 字段 | 内容 |
|------|------|
| **状态** | 🔴 未解决 |
| **发现时间** | 2026-07-01 |
| **复现步骤** | 选择门派后默认跳转至问剑峰，进入江湖页面 |
| **表现** | 江湖页面无任何内容渲染，空白 |
| **疑似原因** | 数据加载或渲染条件判断问题，未定位根因 |
| **影响范围** | 新手流程核心路径，阻断游戏体验 |
| **相关文件** | `src/game.js`、`src/ui/renderer.js`、`src/data/data_loader.js`（待排查） |
| **调试脚本** | `work/_cdp_check_jianghu.cjs`、`work/_check_dataloader.cjs`、`work/_verify_jianghu_http.cjs` |

### 排查方向

1. **数据加载链路**：门派选择后 `data_loader.js` 是否正确加载问剑峰房间数据
2. **渲染条件**：`renderer.js` 中江湖页面渲染是否有前置条件未满足
3. **状态机**：`game.js` 中门派跳转后的游戏状态是否正确切换
4. **房间数据完整性**：问剑峰房间数据是否完整（`work/rebuild_rooms_wenjianfeng.js` 生成）

### 历史调试尝试

- 已创建多个 CDP 验证脚本（`work/_cdp_check_jianghu.cjs` 等）尝试通过浏览器自动化复现并捕获控制台错误
- 已检查 data_loader 加载逻辑
- 截至提交时仍未定位根因
