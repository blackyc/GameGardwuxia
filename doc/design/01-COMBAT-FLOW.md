# 01 — 战斗流程

> ⚔️ **适合谁**：实现战斗引擎的开发者。这是程序逻辑的核心文档。

## 回合四阶段

```
准备阶段 → 判定阶段 → 出牌阶段（拔河循环）→ 结算阶段 → 下一回合
```

---

## Phase 1：准备阶段（Preparation）

**触发时机**：每回合开始。

**操作**：
1. 触发角色回合开始被动（如果有）
2. 双方从手牌中各选 1 张卡，**暗盖（背面朝上）**放入判定区
   - 不消耗内力
   - 可以是武技或心法

---

## Phase 2：判定阶段（Judgment）

**触发时机**：双方都暗盖完毕。

### 步骤

1. **翻牌**：双方判定区卡牌同时翻开
2. **计算总战力**：

```
总战力 = 判定区战力 + 出招区战力 + 丹田心法战力 + 被动/效果修正
```

3. **应用克制加成**：如果翻开的武技存在克制关系，克制方战力 **+6**（心法无克制）
4. **判定劣势方**：总战力较低者 = **劣势方**
   - 劣势方在当前回合**首次**成为劣势方时 → 抽 1 张牌
5. **平局处理**：
   - 先比较当前破绽数，破绽**少**者成为劣势方
   - 完全相等 → 猜拳决定

### 关键规则

- 心法盖放：无属性，永远不被克制（不会触发对手+6）
- 判定区战力包括条件加成（如透骨钉「有破绽时+3」）

---

## Phase 3：出牌阶段（Action）— 拔河循环

**行动权**：当前**劣势方**拥有行动权。

### 劣势方可选操作

| 操作 | 说明 | 消耗 |
|---|---|---|
| 打武技 | 进【出招区】，结算效果，增加战力 | 内力 |
| 打心法 | 进【丹田区】，提供内力上限+战力 | 内力（通常0-1费） |
| 使用角色技能 | 如「血战到底」主动获破绽 | 无 |
| 放弃 | 宣告不再出牌 | — |

### 拔河循环逻辑

```
劣势方出牌
  ↓
出牌方宣告结束
  ↓
重新计算总战力
  ↓
┌─ 反超了 → 原优势方变劣势方 → 新劣势方出牌（循环）
└─ 没反超 → 劣势方选择继续出牌 或 放弃
              ↓
           放弃 → 再得1破绽 → 进结算阶段
```

### 关键规则

- ⚠️ 心法进入丹田后**立即**提供内力，回合内可用
- ⚠️ 心法离开丹田 → 立即失去对应内力
- ⚠️ 手牌上限 8 张，超出直接弃入弃牌堆
- ⚠️ 任何时候都不能跳过「宣告结束→重新判定」这一步

---

## Phase 4：结算阶段（Resolution）

**触发条件**：劣势方宣告放弃（获得破绽后）。

### 步骤

1. **清场**：双方【判定区】+【出招区】的卡牌 → 弃牌堆
2. **补牌**：
   - 劣势方抽 1 张
   - 优势方抽 2 张
3. **返回**准备阶段，开始下一轮

### 注意

- 丹田区卡牌不进入弃牌堆（常驻）
- 手牌保留，不丢弃
- 特效（淬毒、震伤等）已在出牌阶段即时触发，结算阶段不做额外处理

---

## 特殊规则

### 掉血补牌

当任意玩家失去 1 点生命值时 → **立即抽 2 张牌**。

> ⚠️ 破绽→掉血是连锁事件：获得第2个破绽 → 掉1血 → 抽2牌 → 破绽清零。注意抽的2张是破绽清零**之后**抽的。

### 牌库耗尽

当需要抽牌但主卡组为空时：
1. 弃牌堆洗切 → 新主卡组
2. **惩罚**：该玩家立刻获得 1 个破绽

---

## 状态机伪代码（供 C# 实现参考）

```csharp
enum Phase { Preparation, Judgment, Action, Resolution }

void RunTurn() {
    while (game.Active) {
        // Phase 1
        SetPhase(Phase.Preparation);
        TriggerRoundStartPassives();
        BothPlayersPlaceFaceDownCard();

        // Phase 2
        SetPhase(Phase.Judgment);
        RevealJudgmentCards();
        ApplyElementCounterBonus(+6);
        var disadvantaged = DetermineDisadvantaged();
        if (disadvantaged.FirstTimeThisTurn)
            disadvantaged.DrawCards(1);

        // Phase 3 (tug-of-war loop)
        SetPhase(Phase.Action);
        while (true) {
            disadvantaged.TakeAction(); // play cards or pass
            if (disadvantaged.DeclaredPass) {
                disadvantaged.GainFlaw(1);
                break;
            }
            RecalculateTotalPower();
            if (disadvantaged.NowHasMorePower()) {
                disadvantaged = SwapDisadvantaged();
                disadvantaged.DrawCards(1); // first time per turn only
            }
        }

        // Phase 4
        SetPhase(Phase.Resolution);
        ClearJudgmentAndActionZones();
        disadvantaged.DrawCards(1);
        advantaged.DrawCards(2);
    }
}
```

##Node.js 模拟器作为"规则预言机"
sim里的 Node.js 引擎虽然和团队的技术栈不同，但它是一个可以实际运行的参考实现。在实现某个卡牌效果时，可以：
1. 在 sim 里跑一局对战，看该效果怎么触发的
2. 对照 effectResolver.js 理解效果结算逻辑
3. 在 C# 里实现等价行为
参考实现：sim\src\engine\effectResolver.js
运行方式：node jianghu.js → 选择 PVE 模式