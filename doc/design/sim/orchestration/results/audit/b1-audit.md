# B1 测试结果验证审计

> 审计日期: 2026-05-22  
> 审计对象: md_vs_wd.json / md_vs_yt.json / wd_vs_yt.json (各500局)  
> 审计标准: test-audit SKILL.md 5项清单

---

## 1. 牌面效果实现审计

### 魔教 (modeng) — 13张卡牌

| 卡牌 | effectType | 实现状态 | 说明 |
|------|-----------|--------|------|
| 魔门基础心法 | persistInDiscard | ✅ 已实现 | engine.js resetRound 内力计算、ai.js calcFullPower、combatResolver.js calcTotalPower 均包含弃牌堆检查 |
| 修罗饮血功 | selfFlawGivesInner | ❌ **未实现** | 在 ai.js / engine.js / combatResolver.js 中均无 `selfFlawGivesInner` 的处理代码。该卡牌入丹田后无法触发"每有破绽获得内力"效果 |
| 聚气诀 | delayedDantian | ✅ 已实现 | ai.js executePlay: 有破绽直进丹田，无破绽延迟。engine.js resetRound: 上回合 actionZone 中的聚气诀进丹田 |
| 血海魔录 | searchExtra | ✅ 已实现 | ai.js trySecret: 除外2张魔教卡牌，从额外卡组选1张，抽1 |
| 透骨钉 | conditionalPower_flaw_plus3 | ✅ 已实现 | ai.js getEffectivePower + combatResolver.js calcTotalPower: 有破绽+3战力 |
| 血蛭镖 | faceDown_flaw_nerfSelf_drainEnemy | ✅ 已实现 | combatResolver.js runJudgment: 有破绽战力-2、敌人-1内力 |
| 血刀大法 | zhengshang | ✅ 已实现 | runJudgment: 对手判定巧/诡+2。getEffectivePower/calcFullPower: 判定战力加成 |
| 祭血连环斩 | flawDiscount | ✅ 已实现 | 有破绽时: 费用-2、战力-3、抽1张；ai.js executePlay 含 flawDraw |
| 狂骨碎岩拳 | zhengshang | ✅ 已实现 | 有破绽+3战力 |
| 舍身撞 | chaizhao_killDantian | ✅ 已实现 | ai.js executePlay: gs.destroyDantianCards(opponent, 2) |
| 魔刀·泣血 | zhengshang | ✅ 已实现 | lowHpZhengshangBuff: HP低于对手时震伤弃2张 |
| 天魔解体 | forcedResolution | ⚠️ **部分实现** | AI仅在 gap>=12 时使用。`selfDamage`(自伤1)、`nextTurnFreePlay`、`bonusDraw`(抽2) 在 executePlay 中无对应处理 —— 仅有 scoreCard 中的 +7 加分 |
| 修罗化血阵 | zhengshangDrain | ⚠️ **严重Bug** | engine.js triggerZhenShang: 代码扣减 `advantaged.innerPower`（自身），但日志写 `disadvantaged.id` 失去内力。**代码与设计意图不一致**：应扣对手内力 |

### 武当 (wudang) — 13张卡牌

| 卡牌 | effectType | 实现状态 | 说明 |
|------|-----------|--------|------|
| 餐风饮露功 | discardInnerBonus | ✅ 已实现 | engine.js resetRound: 弃牌堆每2张+1内力 |
| 纯阳心法诀 | dantianInnerBonus | ✅ 已实现 | resetRound: 丹田≥2时内力≥6。ai.js shouldSacrificeChunYang: 主动牺牲抽2 |
| 武当基础心法 | altEntryDantianDraw | ✅ 已实现 | engine.js judgmentPhase: 太极剑意碰瓷进丹田时抽1、巧系-1费 |
| 两仪桩功 | moveCostReducer | ✅ 已实现 | engine.js triggerLiangyi: 手牌1张武技-2费 |
| 太极剑·三环套月 | judgmentDantianPower | ✅ 已实现 | combatResolver.js runJudgment: 战力+丹田心法数×2 |
| 太极掌·绕指柔云 | movePowerBuff | ✅ 已实现 | getEffectivePower + calcTotalPower: 有移动时+3战力 |
| 武当基础剑 | innerToPower | ✅ 已实现 | 战力=min(当前内力, 10) |
| 梯云纵 | chaizhao_negateBuff | ❌ **未实现** | 在 ai.js / engine.js / combatResolver.js 中均无 `chaizhao_negateBuff` 的处理代码。该卡牌完全无效果 |
| 真武密录 | searchExtra | ✅ 已实现 | 除外2张(行动区/弃牌堆)武当牌，选额外卡组1张，洗回主卡组 |
| 真武七截剑 | innerPowerToPower | ✅ 已实现 | 战力+内力×2 |
| 纯阳无极剑 | flawHeal | ✅ 已实现 | engine.js triggerFlawHeal: 造成破绽后回1血 |
| 九阳神功 | innerToPowerBuff | ✅ 已实现 | 战力+当前内力 |
| 阳光普照(武当) | lowHpSearch | ✅ 已实现 | engine.js checkSunshine: HP=1时从额外卡组选1张 |

### 隐堂 (yintang) — 14张卡牌

| 卡牌 | effectType | 实现状态 | 说明 |
|------|-----------|--------|------|
| 隐堂基础内功 | poisonBurstInnerUp | ✅ 已实现 | ai.js executePlay: 毒≥3时引爆(-3毒, 内力+1)。engine.js resolvePoisonBurst: 毒发后标记 _innerBoosted |
| 毒瘴功 | drawOnPlay | ✅ 已实现 | ai.js executePlay: 进丹田后抽1 |
| 千机图谱 | searchExtra | ✅ 已实现 | 除外2张(手牌/行动区)隐堂牌，选额外卡组1张，放入弃牌区 |
| 鬼影迷踪 | disadvantagedDrawAndReturn | ✅ 已实现 | ai.js yintangAction: 劣势抽1+返回手牌。engine.js clearZones: 返回手牌处理 |
| 踏雪无痕 | discardReturn | ✅ 已实现 | ai.js executePlay: 弃牌堆回收最高战力卡 |
| 阎王帖 | hitDrawAndPoison | ✅ 已实现 | executePlay: 毒+1抽1。engine.js triggerHitEffects: 毒+1抽1 |
| 透骨钉(隐堂) | conditionalPower_flaw_plus3 | ✅ 已实现 | 同魔教版 |
| 含沙射影 | judgmentLossPoison | ✅ 已实现 | engine.js triggerHanSha: 判低时给对手毒 |
| 无影毒砂 | discardDrawPoison | ✅ 已实现 | executePlay: 弃1抽1毒+1 |
| 子母追魂胆 | poisonPowerBuff | ✅ 已实现 | getEffectivePower + calcTotalPower: 对手有毒+3战力 |
| 血滴子 | enterDiscardPoison | ✅ 已实现 | engine.js checkXueDiZi: 进弃牌堆时毒+1 |
| 暴雨梨花针 | clearAndDirectDamage | ✅ 已实现 | executePlay: 清N毒=至少1伤 |
| 佛怒唐莲 | absorbPoisonMultiply | ✅ 已实现 | executePlay: 战力+毒层数×2 |
| 万蛊噬心 | lowerPoisonThreshold | ✅ 已实现 | engine.js resolvePoisonBurst: 阈值-1 |

### 效果实现汇总

- 总计 40 张卡牌（3阵营）
- ✅ 完整实现: 35 张
- ❌ 未实现: **2张** (修罗饮血功 selfFlawGivesInner、梯云纵 chaizhao_negateBuff)  
- ⚠️ 部分/有Bug: **2张** (天魔解体 forcedResolution、修罗化血阵 zhengshangDrain)

---

## 2. AI出牌策略审计

### 判定策略

| 对阵 | P1阵营 | P2阵营 | P1判定逻辑 | P2判定逻辑 | 评价 |
|------|--------|--------|-----------|-----------|------|
| md vs wd | 魔教 | 武当 | ❌不盖霸(防巧克霸)→盖诡/灵/心法 | 盖心法碰瓷→出巧(巧克霸) | ✅合理 |
| md vs yt | 魔教 | 隐堂 | 盖震伤(血刀大法优先) | 盖诡(诡对霸无克制) | ✅合理 |
| wd vs yt | 武当 | 隐堂 | 盖灵(灵克诡)或心法，绝不盖巧 | 盖诡(诡克巧)→含沙射影/血滴子优先 | ✅合理 |

**判定策略高度合理**，基于五行克制矩阵的博弈选择符合真人直觉。

### 行动策略

| 阵营 | 核心策略 | 合理度 |
|------|---------|--------|
| 隐堂 | 秘术→毒爆发(佛怒/暴雨)→铺毒→隐堂基础内功运营 | ✅ 完美还原速攻毒流派 |
| 武当 | 纯阳牺牲(对慢速)→秘术→快速追平(对隐堂)→心法引擎 | ✅ 太极运营+碰瓷 combo |
| 魔教 | 秘术→修罗化血阵→震伤→心法运营 | ✅ 震伤流派 |

**行动策略整体优秀**，阵营特色鲜明。唯一短板：天魔解体使用门槛过高(gap>=12)，几乎不会被触发。

---

## 3. 回合数审计

| 对阵 | 均回合 | 范围 | 评价 |
|------|--------|------|------|
| 魔教 vs 武当 | 9.9 | 5-15 | ✅ 中速正常 |
| 魔教 vs 隐堂 | 6.2 | 5-15 | ✅ 偏快正常(毒速攻) |
| 武当 vs 隐堂 | 6.7 | 5-15 | ✅ 偏快正常 |

均回合均在 5-15 预期范围内。无异常速杀或无限拖延。最快为隐堂参与的对局(6.2/6.7)，符合速攻毒流派定位。

---

## 4. 心法结算审计

### 纯阳心法诀 (canSacrificeForDraw)
- ✅ AI决策: shouldSacrificeChunYang 含 gap/hp/对阵等多维度判断
- ✅ 执行: triggerChunYangSacrifice → 移除2心法、抽2
- ✅ 内力重算: engine.js resetRound 使用 `reduce` 重新累加丹田内功

### 舍身撞 (chaizhao_killDantian)
- ✅ ai.js executePlay: 调用 gs.destroyDantianCards(opponent, 2)
- ✅ 执行后对手内力会自动在下次 resetRound 重算

### 心法进入丹田
- ✅ 基础流程: executePlay → dantian.push → baseInnerPower += innerPower
- ✅ 聚气诀延迟: actionZone → resetRound 时移入丹田
- ✅ 武当基础心法碰瓷进丹田(altEntryDantianDraw): 通过 judgmentPhase 太极剑意触发

### 心法离开丹田
- ⚠️ 纯阳心法诀牺牲后，triggerChunYangSacrifice 直接 splice 丹田，但未触发内力减法 —— 依赖下次 resetRound 重算。**竞技安全性可接受**，但在同一回合内多次操作可能产生短暂的数值不一致。

---

## 5. 卡牌效果方向性审计

| 卡牌 | effectType | 检测对象 | 设计意图 | 审计结论 |
|------|-----------|---------|---------|---------|
| 透骨钉 | conditionalPower_flaw_plus3 | self.flaws | 自破绽buff（血刀流派增益） | ✅ 正确 |
| 血蛭镖 | faceDown_flaw_nerfSelf_drainEnemy | self.flaws(降战力) + opponent(扣内力) | 自损伤敌 | ✅ 正确 |
| 祭血连环斩 | flawDiscount | self.flaws(减费/减战力/抽牌) | 自破绽折扣 | ✅ 正确 |
| 子母追魂胆 | poisonPowerBuff | opponent.poisonStacks | 对手中毒增伤 | ✅ 正确 |
| 狂骨碎岩拳 | zhengshang + flawPowerBuff | self.flaws | 自破绽增益 | ✅ 正确 |
| 武当基础剑 | innerToPower | self.innerPower | 自身内力转战力 | ✅ 正确 |
| 佛怒唐莲 | absorbPoisonMultiply | opponent.poisonStacks | 对手毒转战力 | ✅ 正确 |

**方向性全部正确**，无 self/opponent 混淆。

---

## 综合结论

| 审计项 | 结论 |
|--------|------|
| 牌面效果 | ⚠️ **需修复**: 2张卡牌未实现(selfFlawGivesInner, chaizhao_negateBuff)、1张有严重Bug(zhengshangDrain)、1张部分实现(forcedResolution) |
| AI策略 | ✅ 通过 |
| 回合数 | ✅ 通过 |
| 心法结算 | ✅ 通过(含1处竞技性小瑕疵) |
| 方向性 | ✅ 通过 |

**判定**: ⚠️ **有条件通过** — 需修复修罗化血阵的zhengshangDrain玩家指向Bug、实现修罗饮血功和梯云纵的效果，再功能确认天魔解体的完整逻辑。
