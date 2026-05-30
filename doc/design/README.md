# 江湖对决 — 设计文档索引

> **阅读顺序**：从上到下。每个文件开头标注了「适合谁看」。

## 📚 文档地图

| 你要做什么 | 📄 看这个 |
|---|---|
| 🎮 理解游戏怎么玩、整体规则 | [00-GAME-OVERVIEW.md](./00-GAME-OVERVIEW.md) |
| ⚔️ 实现战斗引擎（回合流程） | [01-COMBAT-FLOW.md](./01-COMBAT-FLOW.md) |
| ✨ 实现卡牌效果系统 | [02-EFFECT-SYSTEM.md](./02-EFFECT-SYSTEM.md) |
| 👤 理解3个角色的属性和被动 | [03-CHARACTERS.md](./03-CHARACTERS.md) |
| 📊 解析 TSV 数据文件格式 | [04-DATA-FORMAT.md](./04-DATA-FORMAT.md) |
| 📖 完整游戏规则（详细参考） | [核心规则.md](./核心规则.md) |
| 🃏 魔教·血刀卡组详解 | [卡组-魔教.md](./卡组-魔教.md) |
| 🃏 武当·无极道人卡组详解 | [卡组-武当.md](./卡组-武当.md) |
| 🃏 隐堂·夜修罗卡组详解 | [卡组-隐堂.md](./卡组-隐堂.md) |

## 📊 数据文件

| 文件 | 内容 | 行数 |
|---|---|---|
| [cards.tsv](./cards.tsv) | 全部39张卡牌（名称/效果/数值/标签） | 39行 |
| [characters.tsv](./characters.tsv) | 3个角色（HP/被动/技能） | 3行 |
| [decks.tsv](./decks.tsv) | 3套初始卡组（主卡组+额外卡组） | 3行 |

## 🔮 规则预言机 — sim/

`sim/` 是一个完整可运行的 Node.js 模拟器。团队用 C#/Godot 开发，但 **Node.js 版作为"规则预言机"**：

- 写新卡牌效果前 → 跑 sim 验证规则行为是否正确
- 遇到规则歧义 → sim 是权威参考，跑一把看结果
- 调平衡数值 → 改 TSV → 跑 sim 批量模拟看胜率
- 效果系统参考 → `sim/src/engine/effectResolver.js`（注册表模式，C# 可直译）

**快速运行**：
```bash
cd sim/
node jianghu.js          # 选 PVE 模式，人类 vs AI 对战
node tests/test-harness.js   # 100局自动化模糊测试
```

**sim/ 目录结构**：
```
sim/
├── src/engine/          ← 核心引擎（effectResolver, ai, engine, combatResolver 等）
├── src/data/            ← JSON 卡牌/角色/卡组数据
├── tests/               ← 自动化测试
├── design/              ← 原始设计文档
└── jianghu.js           ← 入口
```

## ⚡ 快速开始（给 AI vibecoding）

如果你是 AI 辅助开发，按以下顺序喂给 AI：

```
请阅读以下设计文档，然后实现战斗引擎：

1. 先读 00-GAME-OVERVIEW.md 理解全局
2. 再读 01-COMBAT-FLOW.md 理解回合流程（这是你要实现的）
3. 参考 02-EFFECT-SYSTEM.md 了解效果系统
4. 用 cards.tsv + characters.tsv + decks.tsv 作为数据源
5. 参考 sim/src/engine/ 下的 Node.js 规则预言机实现
```

## 📐 架构约束

- **语言**：C#（Godot .NET）
- **架构参考**：`D:\git\slay2remake\`（杀戮尖塔2源码）
- **数据层**：TSV 文件，运行时解析，改数据无需重新编译
- **模块通信**：通过 EventBus 信号，禁止直接跨模块调用
