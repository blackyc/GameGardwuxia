// =============================================================
// ghostMUD · BOSS行功图 + NPC战斗模板 v3.0
// 生成日期: 2026-06-26
// 设计来源: xinggong_combat_design_v3.md 第十章 + combat_numerics_v3.md 第五章
// =============================================================

var COMBAT_BOSS_V3 = {

  // ===========================================================
  // 一、BOSS行功图（6个BOSS）
  // ===========================================================
  bosses: [

    // ---------------------------------------------------------
    // BOSS 1: 血禅寺方丈（直接录入设计文档10.1）
    // ---------------------------------------------------------
    {
      id: `boss_01`,
      name: `血禅寺方丈`,
      faction: `血禅寺`,
      path: `wu`,
      desc: `袈裟染血，面容慈祥。方丈的声音很轻，像在念经，又像在哄你睡觉。`,
      hp: 5000, atk: 200, def: 80, spd: 9.0,
      mp: 600, mpReg: 30,
      physicalImmune: false,
      damageType: `bleed`,
      tier: `boss_shushi`,
      chart: {
        A: {
          name: `血海结界`,
          desc: `全场DOT，持续3圈`,
          cd: 4.0, mpCost: 0,
          effect: { type: `dot_all`, damage: 30, duration: 3 }
        },
        B: {
          name: `血禅掌`,
          desc: `吸血，恢复伤害量50%`,
          cd: 2.5, mpCost: 0,
          effect: { type: `attack_lifesteal`, damageMultiplier: 1.5, lifesteal: 0.5 }
        },
        C: {
          name: `条件分支`,
          desc: `HP<50%金刚伏魔 / HP≥50%血海潮涌`,
          cd: 4.0, mpCost: 0,
          effect: {
            type: `conditional`,
            condition: `hp_below_50`,
            true_branch: { name: `金刚伏魔`, effect: { type: `dispel_player_buffs` } },
            false_branch: { name: `血海潮涌`, effect: { type: `dot_damage_double` } }
          }
        },
        D: {
          name: `血佛降世`,
          desc: `全场大伤害+自身HP减半`,
          cd: 6.0, mpCost: 0,
          effect: { type: `aoe_big`, damage: 500, selfHpCost: 0.5 }
        },
        E: {
          name: `血禅诵经`,
          desc: `恢复自身15%HP+清除自身debuff`,
          cd: 5.0, mpCost: 0,
          effect: { type: `heal_self`, healPercent: 0.15, cleanse: true }
        }
      },
      vulnerableWindow: `合式血佛降世后HP减半→玩家归式或下一圈起式为最佳击杀窗口`,
      foresight: `承式CD最短(2.5s)会频繁吸血；转式有条件分支需观察HP阈值`
    },

    // ---------------------------------------------------------
    // BOSS 2: 焰心教主（直接录入设计文档10.2）
    // ---------------------------------------------------------
    {
      id: `boss_02`,
      name: `焰心教主`,
      faction: `焰心教`,
      path: `ling`,
      desc: `赤袍猎猎，周身业火环燃。教主的眼睛是金色的，像两团烧不尽的余烬。`,
      hp: 5500, atk: 220, def: 70, spd: 10.0,
      mp: 800, mpReg: 40,
      physicalImmune: false,
      damageType: `fire`,
      tier: `boss_shushi`,
      chart: {
        A: {
          name: `业火焚心`,
          desc: `精神力压制，玩家灵台脉失效2圈`,
          cd: 3.5, mpCost: 0,
          effect: { type: `disable_meridian`, target: `lingtai`, duration: 2 }
        },
        B: {
          name: `焰蛇缠身`,
          desc: `单体大伤害 + 业火3层`,
          cd: 3.0, mpCost: 0,
          effect: { type: `attack_debuff`, damageMultiplier: 2.0, debuff: `yehuo`, stacks: 3 }
        },
        C: {
          name: `火海无涯`,
          desc: `AOE + 推开玩家 → 跳过玩家下一式`,
          cd: 4.5, mpCost: 0,
          effect: { type: `aoe_push`, damage: 150, skipPlayerNext: true }
        },
        D: {
          name: `条件分支`,
          desc: `HP<30%自爆AOE全场+濒死逃脱 / HP≥30%焰心·极蓄力1圈下圈起式伤害×3`,
          cd: 6.0, mpCost: 0,
          effect: {
            type: `conditional`,
            condition: `hp_below_30`,
            true_branch: { name: `涅槃自爆`, effect: { type: `aoe_big`, damage: 600, selfFlee: true } },
            false_branch: { name: `焰心·极`, effect: { type: `charge_buff`, chargeTurns: 1, nextDamageMultiplier: 3.0 } }
          }
        },
        E: {
          name: `余烬回光`,
          desc: `清除自身debuff + 恢复20%HP`,
          cd: 5.0, mpCost: 0,
          effect: { type: `heal_self`, healPercent: 0.20, cleanse: true }
        }
      },
      vulnerableWindow: `涅槃自爆是演戏（教主濒死逃脱=不死）；真正需要防的是焰心·极的蓄力`,
      foresight: `起式CD较短(3.5s)会频繁压制灵台脉——需要带备用饰品应对`
    },

    // ---------------------------------------------------------
    // BOSS 3: 镜阁阁主 — 幻术型，镜像分身+真实伤害
    // ---------------------------------------------------------
    {
      id: `boss_03`,
      name: `镜阁阁主`,
      faction: `镜阁`,
      path: `ling`,
      desc: `水银镜面后走出的女子，面容与你有七分相似。她微微一笑，你也微微一笑。`,
      hp: 4800, atk: 180, def: 60, spd: 10.5,
      mp: 900, mpReg: 45,
      physicalImmune: false,
      damageType: `spirit`,
      tier: `boss_shushi`,
      chart: {
        A: {
          name: `镜花水月`,
          desc: `召唤2个镜像分身，分身继承30%属性，持续3圈`,
          cd: 5.0, mpCost: 0,
          effect: { type: `summon_mirrors`, count: 2, inheritPercent: 0.3, duration: 3 }
        },
        B: {
          name: `碎镜刃`,
          desc: `单体真实伤害（无视防御），伤害=atk×1.2`,
          cd: 2.5, mpCost: 0,
          effect: { type: `true_damage`, damageMultiplier: 1.2, ignoreDef: true }
        },
        C: {
          name: `条件分支`,
          desc: `分身存活→镜界折射(反弹玩家伤害50%) / 分身死亡→孤镜悲鸣(全场灵压伤害+迷魂2层)`,
          cd: 4.0, mpCost: 0,
          effect: {
            type: `conditional`,
            condition: `mirrors_alive`,
            true_branch: { name: `镜界折射`, effect: { type: `damage_reflect`, reflectPercent: 0.5, duration: 2 } },
            false_branch: { name: `孤镜悲鸣`, effect: { type: `aoe_spirit`, damage: 200, debuff: `mihun`, stacks: 2 } }
          }
        },
        D: {
          name: `万镜俱灭`,
          desc: `全场大伤害+引爆所有分身(每分身额外200伤害)+自身1圈无法行动`,
          cd: 6.5, mpCost: 0,
          effect: { type: `aoe_big`, damage: 350, detonateMirrors: true, mirrorBonusDamage: 200, selfStunTurns: 1 }
        },
        E: {
          name: `重铸镜身`,
          desc: `恢复自身18%HP + 1圈闪避率+40%`,
          cd: 5.0, mpCost: 0,
          effect: { type: `heal_self`, healPercent: 0.18, buffDodge: 0.4, buffDuration: 1 }
        }
      },
      vulnerableWindow: `万镜俱灭后自身1圈无法行动→玩家全力输出窗口；分身全灭后转式变为孤镜悲鸣(无反弹)`,
      foresight: `起式CD长(5.0s)分身有空窗期；承式碎镜刃无视防御需保持HP；观察分身存活状态判断转式走向`
    },

    // ---------------------------------------------------------
    // BOSS 4: 归墟深渊者 — 深渊触手+凝渊控制
    // ---------------------------------------------------------
    {
      id: `boss_04`,
      name: `归墟深渊者`,
      faction: `归墟`,
      path: `ling`,
      desc: `从海底裂隙中蠕出的黑色形体。没有脸，只有无数触手，每一条都在品尝你。`,
      hp: 6000, atk: 170, def: 100, spd: 8.5,
      mp: 700, mpReg: 35,
      physicalImmune: false,
      damageType: `ice`,
      tier: `boss_shushi`,
      chart: {
        A: {
          name: `深渊触手`,
          desc: `召唤3条触手，触手HP=本体10%，每圈对玩家造成atk×0.8冰伤害`,
          cd: 5.0, mpCost: 0,
          effect: { type: `summon_tentacles`, count: 3, hpPercent: 0.1, damagePerTurn: 0.8, damageType: `ice` }
        },
        B: {
          name: `凝渊之握`,
          desc: `单体冰伤害+凝渊2层(玩家行动延迟1.5s)`,
          cd: 3.0, mpCost: 0,
          effect: { type: `attack_debuff`, damageMultiplier: 1.3, debuff: `ningyuan`, stacks: 2, debuffEffect: `delay_1.5s` }
        },
        C: {
          name: `条件分支`,
          desc: `触手≥2条→深渊吞噬(吞噬1条触手恢复自身8%HP) / 触手<2条→深渊怒啸(AOE+凝渊3层)`,
          cd: 4.0, mpCost: 0,
          effect: {
            type: `conditional`,
            condition: `tentacles_ge_2`,
            true_branch: { name: `深渊吞噬`, effect: { type: `devour_tentacle`, healPercent: 0.08 } },
            false_branch: { name: `深渊怒啸`, effect: { type: `aoe_debuff`, damage: 180, debuff: `ningyuan`, stacks: 3 } }
          }
        },
        D: {
          name: `归墟·潮汐`,
          desc: `全场冰伤害+击退(玩家下式延迟1圈)+击碎所有触手(每条额外100伤害)`,
          cd: 6.0, mpCost: 0,
          effect: { type: `aoe_big`, damage: 400, pushback: true, skipPlayerNext: true, detonateTentacles: true, tentacleBonusDamage: 100 }
        },
        E: {
          name: `深渊再生`,
          desc: `恢复自身12%HP + 凝渊光环(玩家每圈受凝渊1层，持续3圈)`,
          cd: 5.5, mpCost: 0,
          effect: { type: `heal_self`, healPercent: 0.12, aura: { debuff: `ningyuan`, stacksPerTurn: 1, duration: 3 } }
        }
      },
      vulnerableWindow: `归墟·潮汐后触手全灭→转式必定走深渊怒啸(AOE但无吞噬回血)→此时集火本体最佳`,
      foresight: `承式CD短(3.0s)频繁叠凝渊；保持触手<2条可控制转式走向；归式再生有光环需速战`
    },

    // ---------------------------------------------------------
    // BOSS 5: 肉慈斋肉佛 — 肉体增生+逆血爆发
    // ---------------------------------------------------------
    {
      id: `boss_05`,
      name: `肉慈斋肉佛`,
      faction: `肉慈斋`,
      path: `wu`,
      desc: `一堆肉。或者说，一堆肉在试图成为佛。它有六只手，每一只都在合十。`,
      hp: 7000, atk: 160, def: 120, spd: 8.0,
      mp: 400, mpReg: 20,
      physicalImmune: false,
      damageType: `physical`,
      tier: `boss_shushi`,
      chart: {
        A: {
          name: `肉身增生`,
          desc: `恢复自身10%HP + 物理防御+20%(可叠加3层)`,
          cd: 4.0, mpCost: 0,
          effect: { type: `heal_self`, healPercent: 0.10, buffDef: 0.2, buffMaxStacks: 3 }
        },
        B: {
          name: `肉掌拍击`,
          desc: `单体物理伤害+逆血1层(玩家HP回复效果-15%)`,
          cd: 2.5, mpCost: 0,
          effect: { type: `attack_debuff`, damageMultiplier: 1.4, debuff: `nixue`, stacks: 1, debuffEffect: `heal_reduce_15pct` }
        },
        C: {
          name: `条件分支`,
          desc: `HP>70%→千手牢笼(定身1圈+物理伤害) / HP≤70%→血肉献祭(消耗自身15%HP+全场逆血3层+自身atk+30%持续3圈)`,
          cd: 4.0, mpCost: 0,
          effect: {
            type: `conditional`,
            condition: `hp_above_70`,
            true_branch: { name: `千手牢笼`, effect: { type: `stun_attack`, damage: 200, stunTurns: 1 } },
            false_branch: { name: `血肉献祭`, effect: { type: `self_sacrifice`, selfHpCost: 0.15, aoeDebuff: `nixue`, aoeStacks: 3, selfBuffAtk: 0.3, buffDuration: 3 } }
          }
        },
        D: {
          name: `肉佛天降`,
          desc: `全场大物理伤害+地面肉蚀(DOT 50/圈，持续3圈)`,
          cd: 6.0, mpCost: 0,
          effect: { type: `aoe_big`, damage: 450, groundDot: { damage: 50, duration: 3, damageType: `physical` } }
        },
        E: {
          name: `逆血爆发`,
          desc: `引爆玩家身上所有逆血层数(每层150伤害)+恢复自身等于引爆伤害50%的HP`,
          cd: 5.0, mpCost: 0,
          effect: { type: `detonate_debuff`, debuff: `nixue`, damagePerStack: 150, lifesteal: 0.5 }
        }
      },
      vulnerableWindow: `血肉献祭后自身HP降低15%但atk提升——此时是双刃剑：快速击杀可利用其减HP，但拖久会被强化atk碾压；肉佛天降后无防御buff是输出窗口`,
      foresight: `承式频繁叠逆血；归式引爆逆血层数伤害极高——必须定期清除逆血或速杀；起式叠防御buff需用破罡应对`
    },

    // ---------------------------------------------------------
    // BOSS 6: 紫霞山掌教 — 紫雷天劫+阵法封锁
    // ---------------------------------------------------------
    {
      id: `boss_06`,
      name: `紫霞山掌教`,
      faction: `紫霞山`,
      path: `ling`,
      desc: `紫袍道人，足下生雷。他看你的眼神像在看一个劫数——也许他是对的。`,
      hp: 5200, atk: 190, def: 90, spd: 9.5,
      mp: 1000, mpReg: 50,
      physicalImmune: false,
      damageType: `spirit`,
      tier: `boss_shushi`,
      chart: {
        A: {
          name: `紫雷锁阵`,
          desc: `布设雷阵(玩家每圈受50灵压伤害+随机一式CD+1.0s)，持续3圈`,
          cd: 5.0, mpCost: 0,
          effect: { type: `lay_formation`, dotDamage: 50, dotType: `spirit`, cdIncrease: 1.0, duration: 3 }
        },
        B: {
          name: `掌心雷`,
          desc: `单体灵压伤害+破罡2层(玩家防御-15%每层)`,
          cd: 2.5, mpCost: 0,
          effect: { type: `attack_debuff`, damageMultiplier: 1.5, debuff: `pogang`, stacks: 2, debuffEffect: `def_reduce_15pct` }
        },
        C: {
          name: `条件分支`,
          desc: `雷阵存活→雷阵共鸣(全场灵压伤害×2+破罡2层) / 雷阵消散→重布雷阵+紫雷护体(1圈物理免疫)`,
          cd: 4.5, mpCost: 0,
          effect: {
            type: `conditional`,
            condition: `formation_active`,
            true_branch: { name: `雷阵共鸣`, effect: { type: `aoe_debuff`, damage: 250, damageType: `spirit`, debuff: `pogang`, stacks: 2 } },
            false_branch: { name: `重阵护体`, effect: { type: `lay_formation`, dotDamage: 50, dotType: `spirit`, cdIncrease: 1.0, duration: 3, selfPhysicalImmune: 1 } }
          }
        },
        D: {
          name: `紫霞天劫`,
          desc: `蓄力1圈→全场灵压大伤害(800)+驱散玩家所有正面状态+雷阵重置`,
          cd: 7.0, mpCost: 0,
          effect: { type: `charge_aoe`, chargeTurns: 1, damage: 800, damageType: `spirit`, dispelPlayerBuffs: true, resetFormation: true }
        },
        E: {
          name: `紫气东来`,
          desc: `恢复自身15%HP + 清除自身debuff + 破罡光环(玩家每圈受破罡1层，持续2圈)`,
          cd: 5.0, mpCost: 0,
          effect: { type: `heal_self`, healPercent: 0.15, cleanse: true, aura: { debuff: `pogang`, stacksPerTurn: 1, duration: 2 } }
        }
      },
      vulnerableWindow: `紫霞天劫蓄力1圈时是最佳打断/输出窗口——蓄力期间掌教无防御动作；雷阵消散后转式走重阵护体(获得1圈物免)需用属性手段`,
      foresight: `承式CD短(2.5s)频繁叠破罡导致防御崩塌；合式蓄力可预判——看到紫霞天劫即将就绪时留好控制技能；雷阵存活状态决定转式走向`
    }

  ], // end bosses

  // ===========================================================
  // 二、NPC战斗模板（15个）
  // ===========================================================
  npcTemplates: {

    // ---------------------------------------------------------
    // 凡间野兽（4个）— type: simple，无行功图
    // ---------------------------------------------------------
    'wild_wolf': {
      name: `山狼`,
      type: `simple`,
      level: 0,
      hp: 18, atk: 3, def: 0, spd: 7.0, mp: 0, mpReg: 0,
      physicalImmune: false,
      damageType: `physical`,
      skills: [`撕咬`, `扑击`],
      ai: `aggressive`,
      desc: `灰色皮毛的山狼，龇着牙，喉咙里发出低吼。`
    },
    'wild_boar': {
      name: `野猪`,
      type: `simple`,
      level: 0,
      hp: 30, atk: 4, def: 1, spd: 5.0, mp: 0, mpReg: 0,
      physicalImmune: false,
      damageType: `physical`,
      skills: [`冲撞`, `獠牙突刺`],
      ai: `random`,
      desc: `浑身硬毛的野猪，蹄子刨着泥土，低着头准备冲锋。`
    },
    'wild_tiger': {
      name: `猛虎`,
      type: `simple`,
      level: 1,
      hp: 150, atk: 18, def: 3, spd: 9.0, mp: 0, mpReg: 0,
      physicalImmune: false,
      damageType: `physical`,
      skills: [`虎爪裂`, `扑杀`, `虎啸`],
      ai: `aggressive`,
      desc: `吊睛白额大虫，虎尾如鞭，每一爪都带着腥风。`
    },
    'wild_snake': {
      name: `毒蛇`,
      type: `simple`,
      level: 0,
      hp: 12, atk: 5, def: 0, spd: 8.0, mp: 0, mpReg: 0,
      physicalImmune: false,
      damageType: `poison`,
      skills: [`撕咬`, `缠绕`],
      ai: `random`,
      desc: `色彩斑斓的毒蛇，吐着信子，盘在路边石上。`
    },

    // ---------------------------------------------------------
    // 凡间人族（4个）— type: simple，有基础技能
    // ---------------------------------------------------------
    'bandit': {
      name: `山匪`,
      type: `simple`,
      level: 1,
      hp: 60, atk: 8, def: 2, spd: 6.0, mp: 20, mpReg: 2,
      physicalImmune: false,
      damageType: `physical`,
      skills: [`劈砍`, `格挡`],
      ai: `aggressive`,
      desc: `落草为寇的汉子，刀上还挂着前一个行人的血。`
    },
    'bandit_chief': {
      name: `匪首`,
      type: `simple`,
      level: 1,
      hp: 120, atk: 14, def: 4, spd: 7.0, mp: 40, mpReg: 4,
      physicalImmune: false,
      damageType: `physical`,
      skills: [`重劈`, `流血斩`, `呐喊`],
      ai: `aggressive`,
      desc: `匪众的头领，刀法粗犷但力道惊人，身上疤比肉多。`
    },
    'fugitive_soldier': {
      name: `逃兵`,
      type: `simple`,
      level: 1,
      hp: 90, atk: 12, def: 5, spd: 6.5, mp: 30, mpReg: 3,
      physicalImmune: false,
      damageType: `physical`,
      skills: [`军阵枪`, `盾击`, `逃跑`],
      ai: `defensive`,
      desc: `脱了甲胄的逃兵，枪尖还在抖，不知是怕你还是怕追兵。`
    },
    'jianghu_traveler': {
      name: `江湖客`,
      type: `simple`,
      level: 1,
      hp: 80, atk: 10, def: 3, spd: 7.5, mp: 25, mpReg: 3,
      physicalImmune: false,
      damageType: `physical`,
      skills: [`快剑`, `暗器`, `轻功闪避`],
      ai: `random`,
      desc: `独行江湖的剑客，斗笠压得低，手一直按在剑柄上。`
    },

    // ---------------------------------------------------------
    // 灵异敌人（4个）— type: xinggong_3，简化行功图3式
    // ---------------------------------------------------------
    'ghost': {
      name: `游魂`,
      type: `xinggong_3`,
      level: 1,
      hp: 80, atk: 10, def: 3, spd: 8.0, mp: 30, mpReg: 5,
      physicalImmune: true,
      damageType: `spirit`,
      desc: `半透明的影子，飘在半空，面目模糊，只有一双眼睛是实的。`,
      chart: {
        A: {
          name: `灵压侵蚀`,
          desc: `单体灵压伤害+减速0.5s`,
          cd: 2.5, mpCost: 5,
          effect: { type: `attack_debuff`, damageMultiplier: 1.0, debuff: `lingya`, stacks: 1, debuffEffect: `slow_0.5s` }
        },
        B: {
          name: `阴风彻骨`,
          desc: `全场冰伤害(低)+凝渊1层`,
          cd: 4.0, mpCost: 10,
          effect: { type: `aoe_debuff`, damage: 15, damageType: `ice`, debuff: `ningyuan`, stacks: 1 }
        },
        C: {
          name: `条件分支`,
          desc: `HP<40%→魂体崩散(分裂为2个弱游魂) / HP≥40%→怨啸(单体灵压伤害×2)`,
          cd: 5.0, mpCost: 15,
          effect: {
            type: `conditional`,
            condition: `hp_below_40`,
            true_branch: { name: `魂体崩散`, effect: { type: `split`, count: 2, inheritPercent: 0.4 } },
            false_branch: { name: `怨啸`, effect: { type: `attack`, damageMultiplier: 2.0, damageType: `spirit` } }
          }
        }
      }
    },
    'zombie': {
      name: `僵尸`,
      type: `xinggong_3`,
      level: 2,
      hp: 220, atk: 28, def: 8, spd: 6.0, mp: 0, mpReg: 0,
      physicalImmune: true,
      damageType: `poison`,
      desc: `直挺挺站着的尸体，指甲发黑，嘴角挂着尸毒。一动，关节就咔咔响。`,
      chart: {
        A: {
          name: `尸毒爪`,
          desc: `单体毒伤害+毒2层`,
          cd: 3.0, mpCost: 0,
          effect: { type: `attack_debuff`, damageMultiplier: 1.2, debuff: `poison`, stacks: 2 }
        },
        B: {
          name: `尸气弥漫`,
          desc: `全场毒伤害+毒1层`,
          cd: 4.5, mpCost: 0,
          effect: { type: `aoe_debuff`, damage: 20, damageType: `poison`, debuff: `poison`, stacks: 1 }
        },
        C: {
          name: `条件分支`,
          desc: `HP<50%→尸变狂暴(atk×1.5+spd+2.0) / HP≥50%→僵硬扑击(单体大伤害+定身1圈)`,
          cd: 5.0, mpCost: 0,
          effect: {
            type: `conditional`,
            condition: `hp_below_50`,
            true_branch: { name: `尸变狂暴`, effect: { type: `self_buff`, buffAtk: 1.5, buffSpd: 2.0, duration: 3 } },
            false_branch: { name: `僵硬扑击`, effect: { type: `stun_attack`, damage: 60, stunTurns: 1 } }
          }
        }
      }
    },
    'spirit_fox': {
      name: `狐精`,
      type: `xinggong_3`,
      level: 2,
      hp: 180, atk: 25, def: 5, spd: 10.0, mp: 80, mpReg: 12,
      physicalImmune: true,
      damageType: `spirit`,
      desc: `九条尾巴的狐狸，每条尾巴尖都燃着一团狐火。它看你的眼神像在看猎物。`,
      chart: {
        A: {
          name: `狐火`,
          desc: `单体火伤害+灼烧2层`,
          cd: 2.5, mpCost: 8,
          effect: { type: `attack_debuff`, damageMultiplier: 1.3, debuff: `yehuo`, stacks: 2 }
        },
        B: {
          name: `魅惑`,
          desc: `单体迷魂2层(玩家有20%概率跳过当前式)`,
          cd: 4.0, mpCost: 15,
          effect: { type: `debuff`, debuff: `mihun`, stacks: 2, debuffEffect: `skip_chance_20pct` }
        },
        C: {
          name: `条件分支`,
          desc: `HP<35%→九尾天狐(全属性×1.5+清除自身所有debuff) / HP≥35%→幻影分身(召唤1个分身，继承40%属性)`,
          cd: 5.5, mpCost: 20,
          effect: {
            type: `conditional`,
            condition: `hp_below_35`,
            true_branch: { name: `九尾天狐`, effect: { type: `self_buff_all`, multiplier: 1.5, cleanse: true } },
            false_branch: { name: `幻影分身`, effect: { type: `summon_mirrors`, count: 1, inheritPercent: 0.4, duration: 3 } }
          }
        }
      }
    },
    'painted_skin': {
      name: `画皮`,
      type: `xinggong_3`,
      level: 2,
      hp: 250, atk: 30, def: 10, spd: 9.0, mp: 60, mpReg: 8,
      physicalImmune: true,
      damageType: `spirit`,
      desc: `一张人皮在空中飘。它还没找到下一张脸，所以暂时用你的。`,
      chart: {
        A: {
          name: `画皮刀`,
          desc: `单体灵压伤害+裂伤1层(玩家HP每圈-3%)`,
          cd: 2.5, mpCost: 5,
          effect: { type: `attack_debuff`, damageMultiplier: 1.2, debuff: `lieshang`, stacks: 1, debuffEffect: `hp_dot_3pct` }
        },
        B: {
          name: `披皮术`,
          desc: `复制玩家当前式作为自己的下一式(伤害=玩家该式伤害的70%)`,
          cd: 4.5, mpCost: 15,
          effect: { type: `copy_skill`, damagePercent: 0.7 }
        },
        C: {
          name: `条件分支`,
          desc: `HP<45%→画皮剥落(全场灵压伤害+裂伤3层+自身def-30%) / HP≥45%→人皮伪装(隐身1圈，下圈攻击伤害×2)`,
          cd: 5.0, mpCost: 12,
          effect: {
            type: `conditional`,
            condition: `hp_below_45`,
            true_branch: { name: `画皮剥落`, effect: { type: `aoe_debuff`, damage: 100, damageType: `spirit`, debuff: `lieshang`, stacks: 3, selfDefReduction: 0.3 } },
            false_branch: { name: `人皮伪装`, effect: { type: `stealth`, duration: 1, nextDamageMultiplier: 2.0 } }
          }
        }
      }
    },

    // ---------------------------------------------------------
    // 灵修散修（3个）— type: xinggong_5，完整行功图5式
    // ---------------------------------------------------------
    'lingxiu_sword': {
      name: `散修·剑修`,
      type: `xinggong_5`,
      level: 3,
      hp: 450, atk: 55, def: 18, spd: 8.5, mp: 200, mpReg: 18,
      physicalImmune: false,
      damageType: `physical`,
      desc: `背着一把铁剑的散修，剑鞘磨得发亮。他没宗门，但剑比宗门弟子快。`,
      chart: {
        A: {
          name: `起剑式`,
          desc: `单体物理伤害×1.0+自身atk+10%(1圈)`,
          cd: 2.0, mpCost: 25,
          effect: { type: `attack_buff`, damageMultiplier: 1.0, selfBuffAtk: 0.1, buffDuration: 1 }
        },
        B: {
          name: `追风剑`,
          desc: `单体物理伤害×1.5+裂伤1层`,
          cd: 3.0, mpCost: 35,
          effect: { type: `attack_debuff`, damageMultiplier: 1.5, debuff: `lieshang`, stacks: 1 }
        },
        C: {
          name: `条件分支`,
          desc: `HP<50%→剑意护体(1圈物理免疫+恢复10%HP) / HP≥50%→剑气纵横(AOE物理伤害×1.2)`,
          cd: 4.0, mpCost: 50,
          effect: {
            type: `conditional`,
            condition: `hp_below_50`,
            true_branch: { name: `剑意护体`, effect: { type: `self_buff`, physicalImmune: 1, healPercent: 0.10 } },
            false_branch: { name: `剑气纵横`, effect: { type: `aoe_attack`, damage: 80, damageType: `physical`, damageMultiplier: 1.2 } }
          }
        },
        D: {
          name: `万剑归宗`,
          desc: `全场物理大伤害×2.0+裂伤2层`,
          cd: 6.0, mpCost: 80,
          effect: { type: `aoe_debuff`, damage: 120, damageType: `physical`, damageMultiplier: 2.0, debuff: `lieshang`, stacks: 2 }
        },
        E: {
          name: `调息归元`,
          desc: `恢复自身8%HP+清除自身1个debuff`,
          cd: 5.0, mpCost: 30,
          effect: { type: `heal_self`, healPercent: 0.08, cleanse: true, cleanseCount: 1 }
        }
      }
    },
    'lingxiu_shushi': {
      name: `散修·术士`,
      type: `xinggong_5`,
      level: 3,
      hp: 350, atk: 50, def: 12, spd: 9.0, mp: 300, mpReg: 25,
      physicalImmune: false,
      damageType: `fire`,
      desc: `袍袖里藏着一串符纸的术士。没有宗门供丹药，但术法比焰心教徒还刁钻。`,
      chart: {
        A: {
          name: `符纸飞刃`,
          desc: `单体火伤害×1.0+灼烧1层`,
          cd: 2.0, mpCost: 20,
          effect: { type: `attack_debuff`, damageMultiplier: 1.0, debuff: `yehuo`, stacks: 1 }
        },
        B: {
          name: `五雷符`,
          desc: `单体灵压伤害×1.5+破罡1层`,
          cd: 3.0, mpCost: 40,
          effect: { type: `attack_debuff`, damageMultiplier: 1.5, damageType: `spirit`, debuff: `pogang`, stacks: 1 }
        },
        C: {
          name: `条件分支`,
          desc: `MP>50%→火海符(AOE火伤害+灼烧2层) / MP≤50%→聚气回元(恢复30%MP+清除自身debuff)`,
          cd: 4.0, mpCost: 50,
          effect: {
            type: `conditional`,
            condition: `mp_above_50`,
            true_branch: { name: `火海符`, effect: { type: `aoe_debuff`, damage: 60, damageType: `fire`, debuff: `yehuo`, stacks: 2 } },
            false_branch: { name: `聚气回元`, effect: { type: `restore_mp`, restorePercent: 0.30, cleanse: true } }
          }
        },
        D: {
          name: `天雷破`,
          desc: `全场灵压大伤害×2.0+破罡2层+自身MP-30%`,
          cd: 6.0, mpCost: 0,
          effect: { type: `aoe_debuff`, damage: 150, damageType: `spirit`, damageMultiplier: 2.0, debuff: `pogang`, stacks: 2, selfMpCost: 0.3 }
        },
        E: {
          name: `画符养气`,
          desc: `恢复自身5%HP+恢复15%MP`,
          cd: 4.5, mpCost: 0,
          effect: { type: `restore`, healPercent: 0.05, restoreMpPercent: 0.15 }
        }
      }
    },
    'lingxiu_puppeteer': {
      name: `散修·傀师`,
      type: `xinggong_5`,
      level: 3,
      hp: 380, atk: 45, def: 15, spd: 8.0, mp: 250, mpReg: 22,
      physicalImmune: false,
      damageType: `physical`,
      desc: `手指间牵着十根丝线的傀师。她身后跟着一个木偶，木偶的眼珠在转。`,
      chart: {
        A: {
          name: `丝线缠绕`,
          desc: `单体物理伤害+减速1.0s`,
          cd: 2.0, mpCost: 20,
          effect: { type: `attack_debuff`, damageMultiplier: 1.0, debuff: `lingya`, stacks: 1, debuffEffect: `slow_1.0s` }
        },
        B: {
          name: `木偶出击`,
          desc: `木偶代替本体攻击，单体物理伤害×1.5+本体不受反击`,
          cd: 3.0, mpCost: 30,
          effect: { type: `puppet_attack`, damageMultiplier: 1.5, noCounter: true }
        },
        C: {
          name: `条件分支`,
          desc: `木偶存活→人偶合击(双段伤害+裂伤1层) / 木偶被毁→重铸木偶(消耗20%MP召唤新木偶)`,
          cd: 4.0, mpCost: 40,
          effect: {
            type: `conditional`,
            condition: `puppet_alive`,
            true_branch: { name: `人偶合击`, effect: { type: `dual_attack`, damageMultiplier: 1.3, debuff: `lieshang`, stacks: 1 } },
            false_branch: { name: `重铸木偶`, effect: { type: `summon_puppet`, mpCost: 0.2 } }
          }
        },
        D: {
          name: `千丝万缕`,
          desc: `全场物理大伤害×1.8+定身1圈(玩家下式延迟)`,
          cd: 6.0, mpCost: 70,
          effect: { type: `aoe_debuff`, damage: 100, damageType: `physical`, damageMultiplier: 1.8, debuff: `lingya`, stacks: 2, debuffEffect: `stun_1_turn` }
        },
        E: {
          name: `丝线修补`,
          desc: `恢复自身10%HP+木偶恢复50%HP`,
          cd: 5.0, mpCost: 25,
          effect: { type: `heal_self`, healPercent: 0.10, healPuppetPercent: 0.50 }
        }
      }
    }

  }, // end npcTemplates

  // ===========================================================
  // 三、敌人属性基准表（来自 combat_numerics_v3.md 第五章）
  // ===========================================================
  enemyBaselines: {

    // 分级体系
    tiers: [
      { name: `凡间-弱`,     refLevel: 0,     hpRange: [15, 30],    atkRange: [2, 4],     defRange: [0, 1],     intent: `新手教学，轻松击杀` },
      { name: `凡间-普通`,   refLevel: `0-1`, hpRange: [40, 90],    atkRange: [4, 10],    defRange: [1, 3],     intent: `前期挂机刷怪` },
      { name: `凡间-精英`,   refLevel: 1,     hpRange: [80, 150],   atkRange: [10, 18],   defRange: [3, 6],     intent: `凡间区域小头目` },
      { name: `灵异-弱`,     refLevel: 1,     hpRange: [60, 120],   atkRange: [8, 15],    defRange: [2, 5],     intent: `初入灵异区域，物理免疫` },
      { name: `灵异-普通`,   refLevel: `1-2`, hpRange: [120, 280],  atkRange: [15, 35],   defRange: [5, 12],    intent: `灵异区域标准怪，物理免疫` },
      { name: `灵异-精英`,   refLevel: `2-3`, hpRange: [250, 500],  atkRange: [30, 70],   defRange: [10, 25],   intent: `灵异区域精英，物理免疫` },
      { name: `修士-散修`,   refLevel: 3,     hpRange: [350, 600],  atkRange: [50, 90],   defRange: [20, 40],   intent: `对标玩家同境界，全系有效` },
      { name: `修士-宗门`,   refLevel: `3-4`, hpRange: [500, 1200], atkRange: [70, 150],  defRange: [30, 60],   intent: `高级区域敌对修士` },
      { name: `Boss-凡间`,   refLevel: `1-2`, hpRange: [200, 400],  atkRange: [15, 30],   defRange: [5, 15],    intent: `凡间区域Boss，有技能` },
      { name: `Boss-灵异`,   refLevel: 3,     hpRange: [600, 1500], atkRange: [60, 120],  defRange: [30, 60],   intent: `灵异区域Boss，物理免疫，多阶段` },
      { name: `Boss-修士`,   refLevel: 4,     hpRange: [1500, 4000],atkRange: [150, 350], defRange: [80, 150],  intent: `高级区域Boss，全系有效，有功法` },
      { name: `终极Boss`,    refLevel: `4-5`, hpRange: [4000, 12000],atkRange: [300, 800],defRange: [150, 400], intent: `游戏终极挑战，多阶段+特殊机制` }
    ],

    // 凡间敌人详细属性
    mortalEnemies: [
      { name: `山狼`,         level: 0, hp: 18,   atk: 3,   def: 0, spd: 7.0,  mp: 0,  physicalImmune: false, note: `无技能，纯普攻` },
      { name: `野猪`,         level: 0, hp: 30,   atk: 4,   def: 1, spd: 5.0,  mp: 0,  physicalImmune: false, note: `高HP低速度` },
      { name: `山匪`,         level: 1, hp: 60,   atk: 8,   def: 2, spd: 6.0,  mp: 20, physicalImmune: false, note: `有基础轻击技能` },
      { name: `匪首`,         level: 1, hp: 120,  atk: 14,  def: 4, spd: 7.0,  mp: 40, physicalImmune: false, note: `有中击+流血` },
      { name: `猛虎`,         level: 1, hp: 150,  atk: 18,  def: 3, spd: 9.0,  mp: 0,  physicalImmune: false, note: `高速高攻，无技能` },
      { name: `凡间Boss·黑风寨主`, level: `1-2`, hp: 350, atk: 25, def: 8, spd: 8.0, mp: 80, physicalImmune: false, note: `多技能+阶段切换` }
    ],

    // 灵异敌人详细属性
    spiritEnemies: [
      { name: `游魂`,         level: 1,     hp: 80,   atk: 10,  def: 3,  spd: 8.0,  mp: 30,  physicalImmune: true,  note: `灵压攻击，低伤高频` },
      { name: `怨灵`,         level: `1-2`, hp: 150,  atk: 18,  def: 5,  spd: 9.0,  mp: 50,  physicalImmune: true,  note: `附带寒冰层数` },
      { name: `伥鬼`,         level: 2,     hp: 220,  atk: 28,  def: 8,  spd: 10.0, mp: 70,  physicalImmune: true,  note: `附带毒层，DOT型` },
      { name: `凶煞`,         level: `2-3`, hp: 400,  atk: 45,  def: 15, spd: 8.0,  mp: 120, physicalImmune: true,  note: `高伤，附带灼烧` },
      { name: `血煞`,         level: 3,     hp: 550,  atk: 60,  def: 20, spd: 9.0,  mp: 150, physicalImmune: true,  note: `吸血+流血，续航型` },
      { name: `灵异Boss·百年怨魄`, level: 3, hp: 1200, atk: 90, def: 35, spd: 10.0, mp: 300, physicalImmune: true, note: `多阶段，P1物理免疫P2全系` }
    ],

    // 修士敌人详细属性
    cultivatorEnemies: [
      { name: `散修·落魄道人`,     level: 3,     hp: 450,  atk: 55,  def: 18,  spd: 8.0,  mp: 200,  physicalImmune: false, note: `有功法+异常状态` },
      { name: `宗门弟子·焰心教徒`, level: 3,     hp: 500,  atk: 65,  def: 22,  spd: 9.0,  mp: 250,  physicalImmune: false, note: `火系技能+灼烧叠加` },
      { name: `宗门弟子·归墟门人`, level: `3-4`, hp: 700,  atk: 70,  def: 28,  spd: 10.0, mp: 300,  physicalImmune: false, note: `冰系技能+寒冰控制` },
      { name: `长老·血禅师`,       level: 4,     hp: 2500, atk: 200, def: 80,  spd: 11.0, mp: 600,  physicalImmune: false, note: `血系功法+吸血+血爆` },
      { name: `修士Boss·叛宗者`,   level: 4,     hp: 3500, atk: 280, def: 100, spd: 12.0, mp: 800,  physicalImmune: false, note: `多阶段，全系技能，有功法链` },
      { name: `终极Boss·堕天人`,   level: `4-5`, hp: 10000,atk: 600, def: 300, spd: 13.0, mp: 1500, physicalImmune: false, note: `三阶段，P3灵压全场` }
    ],

    // 敌人异常状态使用表
    debuffUsage: [
      { enemyType: `凡间-野兽`,     debuffs: [],                          stacksRange: [],     triggerFreq: `无` },
      { enemyType: `凡间-匪徒`,     debuffs: [`流血`],                    stacksRange: [2, 4], triggerFreq: `中击30%概率` },
      { enemyType: `灵异-游魂`,     debuffs: [`灵压`],                    stacksRange: [1, 2], triggerFreq: `每次` },
      { enemyType: `灵异-怨灵`,     debuffs: [`寒冰`],                    stacksRange: [3, 5], triggerFreq: `中击100%` },
      { enemyType: `灵异-伥鬼`,     debuffs: [`毒`],                      stacksRange: [2, 5], triggerFreq: `轻击50%` },
      { enemyType: `灵异-凶煞`,     debuffs: [`灼烧`],                    stacksRange: [3, 6], triggerFreq: `中击100%` },
      { enemyType: `灵异-血煞`,     debuffs: [`流血`, `吸血`],            stacksRange: [4, 8], triggerFreq: `中击100%` },
      { enemyType: `修士-焰心教徒`, debuffs: [`灼烧`],                    stacksRange: [3, 6], triggerFreq: `中击100%，重击+2层` },
      { enemyType: `修士-归墟门人`, debuffs: [`寒冰`],                    stacksRange: [4, 7], triggerFreq: `中击100%，触发蒸发` },
      { enemyType: `修士-血禅师`,   debuffs: [`流血`, `血爆`],            stacksRange: [5, 10],triggerFreq: `暴击触发血爆` },
      { enemyType: `Boss·百年怨魄`, debuffs: [`寒冰`, `灵压`],            stacksRange: [4, 8], triggerFreq: `P1寒冰，P2灵压` },
      { enemyType: `Boss·叛宗者`,   debuffs: [`全系`],                    stacksRange: [4, 10],triggerFreq: `阶段切换异常类型` },
      { enemyType: `Boss·堕天人`,   debuffs: [`灵压`, `全系`],            stacksRange: [6, 12],triggerFreq: `P3每击附带灵压` }
    ],

    // 敌人掉落基准
    dropTable: [
      { enemyType: `凡间-弱`,     equipQuality: `凡品`,       dropProb: 0.08, extraDrops: `无` },
      { enemyType: `凡间-普通`,   equipQuality: `凡品/良品`,  dropProb: 0.12, extraDrops: `少量铜钱` },
      { enemyType: `凡间-精英`,   equipQuality: `良品`,       dropProb: 0.25, extraDrops: `铜钱+低级丹药` },
      { enemyType: `灵异-弱`,     equipQuality: `良品`,       dropProb: 0.15, extraDrops: `少量灵石` },
      { enemyType: `灵异-普通`,   equipQuality: `良品/上品`,  dropProb: 0.20, extraDrops: `灵石+符纸` },
      { enemyType: `灵异-精英`,   equipQuality: `上品`,       dropProb: 0.30, extraDrops: `灵石+中级丹药` },
      { enemyType: `修士-散修`,   equipQuality: `上品`,       dropProb: 0.35, extraDrops: `灵石+功法残页` },
      { enemyType: `修士-宗门`,   equipQuality: `上品/极品`,  dropProb: 0.40, extraDrops: `灵石+技能书` },
      { enemyType: `Boss-凡间`,   equipQuality: `良品/上品`,  dropProb: 1.00, extraDrops: `铜钱+装备+技能书` },
      { enemyType: `Boss-灵异`,   equipQuality: `上品/极品`,  dropProb: 1.00, extraDrops: `灵石+属性武器+功法` },
      { enemyType: `Boss-修士`,   equipQuality: `极品/仙器`,  dropProb: 1.00, extraDrops: `灵石+极品装备+绝学` },
      { enemyType: `终极Boss`,    equipQuality: `仙器`,       dropProb: 1.00, extraDrops: `大量灵石+仙器+终极绝学` }
    ]
  },

  // ===========================================================
  // 四、7种异常状态定义（来自设计文档）
  // ===========================================================
  debuffTypes: {
    'shigu':   { name: `尸蛊`, desc: `每圈受到毒属性伤害，可叠加`, maxStacks: 10 },
    'lieshang':{ name: `裂伤`, desc: `每圈HP按比例流失，可叠加`, maxStacks: 10 },
    'yehuo':   { name: `业火`, desc: `每圈受到火属性伤害，可叠加，满层引爆`, maxStacks: 10 },
    'ningyuan':{ name: `凝渊`, desc: `行动延迟，减速效果，可叠加`, maxStacks: 10 },
    'pogang':  { name: `破罡`, desc: `防御降低，可叠加`, maxStacks: 10 },
    'mihun':   { name: `迷魂`, desc: `有概率跳过行动，可叠加`, maxStacks: 10 },
    'nixue':   { name: `逆血`, desc: `HP回复效果降低，可叠加`, maxStacks: 10 }
  },

  // ===========================================================
  // 五、元数据
  // ===========================================================
  meta: {
    version: `3.0`,
    date: `2026-06-26`,
    source: `xinggong_combat_design_v3.md §10 + combat_numerics_v3.md §5`,
    bossCount: 6,
    npcTemplateCount: 15,
    notes: [
      `所有BOSS行功图遵循三原则：可预判、有对策窗口、不是背板`,
      `NPC模板分三档：simple(无行功图)、xinggong_3(3式)、xinggong_5(5式)`,
      `敌人属性基准来自combat_numerics_v3.md第五章，含分级/详细/异常/掉落四表`,
      `异常状态共7种：尸蛊/裂伤/业火/凝渊/破罡/迷魂/逆血`
    ]
  }

}; // end COMBAT_BOSS_V3

// 挂载到全局
if (typeof window !== `undefined`) window.COMBAT_BOSS_V3 = COMBAT_BOSS_V3;
if (typeof module !== `undefined` && module.exports) module.exports = COMBAT_BOSS_V3;
