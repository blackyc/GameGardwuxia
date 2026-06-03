# MEMORY.md - 江湖对决项目长期记忆

## 项目信息
- **工作区**: `C:\Users\tabe\Desktop\GameFi\GameCard\GameGard\`
- **游戏名**: 江湖对决 (Jianghu Duel)
- **类型**: 1v1 卡牌对战游戏，参考《杀戮尖塔》战斗模式

## MCP配置
- **端口**: `http://localhost:9080/mcp`
- **可用工具**: create_node, delete_node, update_node_property, create_scene, save_scene, 
  create_script, modify_script, read_script, run_project, stop_project, 
  execute_script, get_scene_tree, list_project_scenes, get_runtime_scene_tree 等

## 核心战斗机制
1. **回合四阶段**: 准备→判定→出牌(拔河)→结算
2. **判定区**: 双方暗盖卡牌，翻开判定战力
3. **出招区**: 武技卡打出增加战力
4. **丹田区**: 心法卡常驻，提供内力+战力
5. **破绽系统**: 战力劣势获得破绽，2破绽=掉1血+抽2牌
6. **四象相克**: 灵>诡>巧>霸>灵，克制+6战力

## 三大阵营
| 阵营 | 角色 | HP | 风格 |
|------|------|-----|------|
| 魔教 | 血刀 | 4(+1初始破绽) | 血换资源、中速碾压 |
| 武当 | 无极道人 | 3 | 丹田引擎、资源循环 |
| 隐堂 | 夜修罗 | 2 | 低费连击、玻璃大炮 |

## 资源路径(重要!)
- 地图: `res://AllbackupAssets/mapbackup/map2.png`
- 卡牌素材: `res://AllbackupAssets/card-pngs/*.png`
- 角色: `res://images/characters/player1.png`, `res://images/characters/player2.png`

## 现有脚本资产
- `scripts/card_slot.gd` - 卡槽可视化组件
- `scripts/hand_card_area.gd` - 手牌扇形布局(参考杀戮尖塔)
- `scripts/card_data.gd` - 卡牌数据结构
- `scripts/player_sprite.gd` - 角色精灵组件

## 设计文档
- `doc/design/00-GAME-OVERVIEW.md` - 游戏全景
- `doc/design/01-COMBAT-FLOW.md` - 战斗流程(核心)
- `doc/design/04-DATA-FORMAT.md` - 数据格式规范

## 当前进度(2026-06-02)
- ✅ 参考HTML战斗场景已分析
- ✅ MCP连接正常
- ⏳ 创建Godot战斗场景中
