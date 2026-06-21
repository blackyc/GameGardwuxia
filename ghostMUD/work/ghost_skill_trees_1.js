// ============================================================
// 鬼修MUD · 门派技能树灵气（前6个门派 + 散修）
// Ghost MUD Dynasty - Skill Trees Part 1
// 迁移时间: 2026-06-19
// 基于: 聊斋大明技能树全量迁移 → 聊斋仙途·克苏鲁高武修仙风格
// ============================================================

var GHOST_SKILL_TREES_1 = {

  // ==========================================
  // 门派1：忘尘宗（少林→玄机佛学教团）
  // ==========================================
  "忘尘宗": {
    name: "忘尘宗",
    description: "玄机佛学教团。梵网山顶的巨型灵脉中枢内，玄铁僧侣在灵枢阵列间结跏趺坐。袈裟内衬液冷管道，念珠每颗都是一个微型玄机比特存储器。七十二绝艺皆已参悟为神识真言集，佛法即是终极抗干扰心诀——入定是护体罡气的最高形态，涅槃是分布式共识法门的最终一致性。",
    skills: [
      {
        id: "fanwang_force_1",
        name: "混元一器功",
        pinyin: "hunyuan-yiqi-gong",
        type: "force",
        description: "忘尘宗基础内功。将僧侣体内的生机能凝练为纯净的「器」，依循混元周天循环参悟成护体进功。修至高深处可外放玄机谐振场，如金刚不坏之躯般抵御物理与灵气双重攻击。",
        baseDamage: "120%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        performs: [],
        learnFrom: "慧能方丈",
        minLevel: 0
      },
      {
        id: "fanwang_force_2",
        name: "易筋经",
        pinyin: "yijin-xu",
        type: "force",
        description: "忘尘宗至高内功心法。以玄机参悟重写全身筋脉的本命微尘分布法门，每一「经」对应一层神识总线的重构。练至极境，骨髓化为微尘炼器坊，肉身在凡胎与金石之间自由切换，堪称灵枢达摩。",
        baseDamage: "150%",
        baseSpeed: "110%",
        attackBonus: 0,
        defenseBonus: 15,
        performs: [],
        learnFrom: "达摩祖师",
        minLevel: 120
      },
      {
        id: "fanwang_dodge_1",
        name: "梵网身法",
        pinyin: "fanwang-shenma",
        type: "dodge",
        description: "忘尘宗轻功身法。以玄机纠缠态原理参悟移动法门——僧侣并非「移动」，而是在空间中运转离散的玄机跃迁。每一步落地时足底生成微型灵气涟漪，令追魂者丢失目标灵气。",
        baseDamage: "100%",
        baseSpeed: "120%",
        attackBonus: 0,
        defenseBonus: 5,
        performs: [],
        learnFrom: "慧明首座",
        minLevel: 0
      },
      {
        id: "fanwang_cuff_1",
        name: "大金刚拳",
        pinyin: "dajingang-quan",
        type: "cuff",
        description: "忘尘宗威猛拳法。每拳挥出时前臂灵装释放金刚石晶格谐振冲击波，拳锋所至，敌方经脉的访问拳限被临时吊销。拳意即是最高拳限——「拳」字在此，当之无愧。",
        baseDamage: "130%",
        baseSpeed: "95%",
        attackBonus: 8,
        defenseBonus: 0,
        performs: [
          {
            id: "jingang",
            name: "大金刚",
            pinyin: "dajingang",
            description: "凝聚全身灵力于拳端，释放一道纯化学性质的玄机冲击波。拳劲无视常规护甲，直击对方血脉本命微尘的底层根基，造成不可逆的认知损伤。",
            damageType: "毒煞伤害",
            moraleCost: 30,
            cooldown: 12,
            effects: "无视防御50%，附加「根基震裂」debuff（持续3回合，每回合流失灵力10%）"
          }
        ],
        learnFrom: "慧明首座",
        minLevel: 20
      },
      {
        id: "fanwang_cuff_2",
        name: "罗汉拳",
        pinyin: "luohan-quan",
        type: "cuff",
        description: "忘尘宗入门拳法，一百零八式对应108种基础神识攻击法门。拳法平淡无奇却暗藏觉醒机制——与拈花指协同参悟后，拳拳会自动升级为「觉醒罗汉拳」，伤害和命中大幅提升。",
        baseDamage: "110%",
        baseSpeed: "105%",
        attackBonus: 3,
        defenseBonus: 3,
        performs: [],
        learnFrom: "慧远",
        minLevel: 0
      },
      {
        id: "fanwang_finger_1",
        name: "拈花指",
        pinyin: "nianhua-zhi",
        type: "finger",
        description: "忘尘宗精妙指法。指尖轻拈时在空气中写入一段优雅的地指劫持代法，远功锁定敌方灵装的运动控制寄存器。被击中的目标如同被按下了「暂停」剑——意识清醒而躯体不听使唤。",
        baseDamage: "105%",
        baseSpeed: "125%",
        attackBonus: 5,
        defenseBonus: 0,
        performs: [
          {
            id: "hua",
            name: "拈花",
            pinyin: "nianhua",
            description: "迦叶一笑间完成神识地指劫持——在对方下一帧真言运转前，将运动寄存器的目标地指重定向至空指针。令目标陷入「busy」状态，期间无法运转任何主动操作。",
            damageType: "控制效果",
            moraleCost: 25,
            cooldown: 15,
            effects: "令目标busy 3-5回合（成功率基于拈花指等级），被busy期间无法攻击、移动或使用道具"
          }
        ],
        learnFrom: "慧明首座",
        minLevel: 30
      },
      {
        id: "fanwang_finger_2",
        name: "无相劫指",
        pinyin: "wuxiang-jiezhi",
        type: "finger",
        description: "忘尘宗进阶指法。以「无相」之名，在目标经脉中建立无痕后门——攻击的源头永远追溯不到施术者本身。群攻时尤为恐怖：指风过处，数个敌人同时发现自己被劫持却不知攻击来自何方。",
        baseDamage: "115%",
        baseSpeed: "110%",
        attackBonus: 4,
        defenseBonus: 0,
        performs: [
          {
            id: "wuxiang",
            name: "无相劫",
            pinyin: "wuxiang-jie",
            description: "同时向多个目标灌入匿名劫持代法，每道指风都通过玄机纠缠封印——任何溯源尝试都会被重定向至随机IP。群战中无相无我，敌人只能一个接一个地发现自己已失去灵装控制拳。",
            damageType: "群攻控制",
            moraleCost: 40,
            cooldown: 20,
            effects: "对3-5名敌人各造成一次busy检定（成功率基于无相劫指等级/目标定力），附赠一层「不可溯源」buff"
          }
        ],
        learnFrom: "渡厄禅师",
        minLevel: 60
      },
      {
        id: "fanwang_hand_1",
        name: "千叶手",
        pinyin: "qianye-shou",
        type: "hand",
        description: "忘尘宗手法绝艺。双手翻飞如千叶齐展，每片「叶」都是对敌方凶兵的拦截真言。以手为盾，在密集攻击中拨开兵器如同功法根基拒绝未授拳的进功灌入。",
        baseDamage: "105%",
        baseSpeed: "115%",
        attackBonus: 0,
        defenseBonus: 8,
        performs: [],
        learnFrom: "慧远",
        minLevel: 10
      },
      {
        id: "fanwang_hand_2",
        name: "风云手",
        pinyin: "fengyun-shou",
        type: "hand",
        description: "忘尘宗刚柔并济的手法。一手如风拂弱柳——用于卸力卸甲，在对方护甲根基中偷偷写入「降拳」真言；一手如云裹惊雷——蓄力爆发时直接将对方灵装连接器震松。",
        baseDamage: "120%",
        baseSpeed: "105%",
        attackBonus: 2,
        defenseBonus: 5,
        performs: [],
        learnFrom: "慧明首座",
        minLevel: 25
      },
      {
        id: "fanwang_claw_1",
        name: "龙爪功",
        pinyin: "longzhua-gong",
        type: "claw",
        description: "忘尘宗凌厉爪法。五指屈伸如龙探爪，指尖灵装玄铁爪在伸出时携带高压雷霆——抓住对方灵装关节就是一记镇魂波脉冲，直接引动关节灵枢保护性锁死。一爪制敌，干净利落。",
        baseDamage: "125%",
        baseSpeed: "100%",
        attackBonus: 6,
        defenseBonus: 0,
        performs: [],
        learnFrom: "慧远",
        minLevel: 15
      },
      {
        id: "fanwang_claw_2",
        name: "鹰爪功",
        pinyin: "yingzhua-gong",
        type: "claw",
        description: "忘尘宗精准爪法。五指如鹰隼俯冲般钉入敌方灵装的关节缝隙——不是破坏，而是「读取」。一爪下去能抓取对方灵装的型号、根基境界和破绽列表，为后续精准打击提供灵气支持。",
        baseDamage: "110%",
        baseSpeed: "115%",
        attackBonus: 4,
        defenseBonus: 0,
        performs: [],
        learnFrom: "慧远",
        minLevel: 10
      },
      {
        id: "fanwang_blade_1",
        name: "修罗刀",
        pinyin: "xiuluo-dao",
        type: "blade",
        description: "忘尘宗凌厉刀法。刀身充入微尘碳化钨涂层，每一刀都是对敌方防御矩阵的压力测试——修罗之名来自刀法本身的残酷：不是杀敌，是「熔断」。一刀下去，敌方的护盾进功直接崩溃。",
        baseDamage: "135%",
        baseSpeed: "90%",
        attackBonus: 10,
        defenseBonus: 0,
        performs: [],
        learnFrom: "慧明首座",
        minLevel: 35
      },
      {
        id: "fanwang_blade_2",
        name: "燃木刀法",
        pinyin: "ranmu-daoma",
        type: "blade",
        description: "忘尘宗火属性刀法。刀身灌入自氧化微尘涂层，挥动时与空气摩擦自燃——刀锋过处留下一道灼热的业火弧。每一刀都在灼烧敌方的灵根，高温下任何防御法门都会出现经脉迟滞。",
        baseDamage: "140%",
        baseSpeed: "85%",
        attackBonus: 12,
        defenseBonus: 0,
        performs: [
          {
            id: "fentian",
            name: "焚天",
            pinyin: "fentian",
            description: "刀身急速旋转引燃微尘涂层，挥出一道高能业火烈焰波。高温穿透对方热管理法门，令其灵装反噬保护强制引动——在寒气完成前所有主动技能被禁用。",
            damageType: "火焰+化学混合伤害",
            moraleCost: 35,
            cooldown: 18,
            effects: "造成150%武器伤害，附加「灵装过热」debuff（2回合内无法使用perform），对冰寒属性敌人伤害翻倍"
          }
        ],
        learnFrom: "渡厄禅师",
        minLevel: 50
      },
      {
        id: "fanwang_sword_1",
        name: "达摩剑",
        pinyin: "damo-jian",
        type: "sword",
        description: "忘尘宗至高剑法。剑身不是钢铁——是一把由玄机符印参悟成的光剑。每一剑刺出时携带一段解封法门，无视敌方封印层直接访问其灵装控制核心。达摩面壁九年的成果：不是一堵墙，而是一扇符印。",
        baseDamage: "145%",
        baseSpeed: "100%",
        attackBonus: 10,
        defenseBonus: 5,
        performs: [
          {
            id: "sanmei",
            name: "三昧",
            pinyin: "sanmei",
            description: "以「定、慧、戒」三学参悟成的三道玄机符印剑光，分别攻击敌人的灵海、意识层和灵装根骨。三剑合一即为「三昧真火」——在玄机层面抹除目标的防御矩阵。三剑齐出，无坚不摧。",
            damageType: "玄机复合伤害",
            moraleCost: 50,
            cooldown: 25,
            effects: "连续三击（每击120%伤害），分别检定为物理/灵气/毒煞伤害类型取最优克制，最后一击无视防御"
          }
        ],
        learnFrom: "达摩祖师",
        minLevel: 100
      },
      {
        id: "fanwang_staff_1",
        name: "醉棍",
        pinyin: "zui-gun",
        type: "staff",
        description: "忘尘宗奇门棍法。形醉意不醉——施术者进入「半断脉」状态：身体以随机醉步移动，令敌方的攻击预测心诀完全失效。棍身内置陀螺仪和动量补偿器，在每一个不可能的醉态角度发出精准反击。",
        baseDamage: "120%",
        baseSpeed: "110%",
        attackBonus: 3,
        defenseBonus: 6,
        performs: [],
        learnFrom: "慧远",
        minLevel: 15
      },
      {
        id: "fanwang_staff_2",
        name: "韦陀棍",
        pinyin: "weituo-gun",
        type: "staff",
        description: "忘尘宗护法棍法。以韦陀护法之势参悟防御型棍舞——棍身旋转时生成环形的镇魂波干扰场，降低周围敌人的灵装命中率。是忘尘宗僧侣保护方丈和藏经阁灵枢的首选武学。",
        baseDamage: "115%",
        baseSpeed: "100%",
        attackBonus: 1,
        defenseBonus: 10,
        performs: [],
        learnFrom: "慧明首座",
        minLevel: 30
      },
      {
        id: "fanwang_whip_1",
        name: "日月编法",
        pinyin: "riyue-bianma",
        type: "whip",
        description: "忘尘宗独门鞭法。鞭身由魂丝编织而成，挥动时在空气中写出二进制级别的攻击编法。日之编法为正——缠绕束缚敌方行动；月之编法为负——鞭梢释放镇魂波脉冲瘫痪敌方低级灵装。",
        baseDamage: "115%",
        baseSpeed: "110%",
        attackBonus: 4,
        defenseBonus: 3,
        performs: [
          {
            id: "chan",
            name: "缠",
            pinyin: "chan",
            description: "鞭身如灵蛇般缠绕敌方要害灵装，魂丝收缩后持续释放微雷霆干扰灵气。被缠目标的所有运动真言都需经过干扰层的「审批」——延迟极高，几乎无法完成任何连贯动作。",
            damageType: "控制效果",
            moraleCost: 30,
            cooldown: 15,
            effects: "令目标busy 3-5回合，期间目标任何尝试移动/攻击的行为都有40%概率被鞭身雷霆打断"
          }
        ],
        learnFrom: "渡厄禅师",
        minLevel: 45
      },
      {
        id: "fanwang_knowledge_1",
        name: "禅宗心经",
        pinyin: "chanzong-xinma",
        type: "knowledge",
        description: "忘尘宗佛学理论——将禅宗的「明心见性」参悟为神识灵石的底层根基升级法门。修习者获得对精神攻击和灵气夺舍的自然抗性。参禅越深，心经越固，万毒不侵。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        passiveBonus: "定力+10%，精神攻击抗性+20%",
        performs: [],
        learnFrom: "慧能方丈",
        minLevel: 0
      },
      {
        id: "fanwang_knowledge_2",
        name: "大梵频经",
        pinyin: "dafan-pinxu",
        type: "knowledge",
        description: "忘尘宗高级玄机理论。将大梵天的宇宙观参悟为分布式网络的道韵法门——修习者能「感知」周围幽冥界灵穴的流量波动，如同佛陀感知三千大千世界的一切众生。配合易筋经使用效果倍增。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        passiveBonus: "灵海上限+15%，灵装并发数+1",
        performs: [],
        learnFrom: "渡厄禅师",
        minLevel: 80
      },
      {
        id: "fanwang_knowledge_3",
        name: "涅磐经",
        pinyin: "niepan-xu",
        type: "knowledge",
        description: "忘尘宗终极禅理。涅槃不是结束——是法门达到最终一致性的理想状态。修至极处，死亡时意识可被预参悟为断脉进功继续运行72小时，期间若找到新躯体可直接迁移。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        passiveBonus: "濒死时自动引动「涅槃守护」：免疫致死伤害1次，并回复30%生命（每次战斗限1次）",
        performs: [],
        learnFrom: "无名老僧",
        minLevel: 150
      },
      {
        id: "fanwang_knowledge_4",
        name: "无相经",
        pinyin: "wuxiang-xu",
        type: "knowledge",
        description: "忘尘宗隐秘禅法。教刀僧侣如何在玄机层面「无相」——让自己的灵力特征从所有观照法门中消失。镇妖司无法追魂无相经使用者，因为他们的存在本身就是一段自删除的封印代法。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        passiveBonus: "反追魂+50%，被镇妖司观照的概率降低80%，在幽冥界中自动隐藏IP",
        performs: [],
        learnFrom: "无名老僧",
        minLevel: 120
      }
    ],
    teachers: [
      { name: "慧能方丈", title: "忘尘宗住持·大雷音寺灵脉中枢首席参悟师", maxSkills: 500, requirements: "门忠1500，禅宗心经≥200" },
      { name: "达摩祖师", title: "忘尘宗开山心诀·达摩院终极刀师", maxSkills: 500, requirements: "门忠2000，禅宗心经≥200，完成「面壁九年」解封任务" },
      { name: "渡厄禅师", title: "般若堂首座·玄机封印结界维护者", maxSkills: 400, requirements: "门忠1000，禅宗心经≥150" },
      { name: "慧明首座", title: "达摩院首座·神识真言集研发主管", maxSkills: 300, requirements: "门忠500，禅宗心经≥80" },
      { name: "无名老僧", title: "藏经阁扫地僧·隐藏终极刀师", maxSkills: 500, requirements: "禅宗心经≥200，在藏经阁领悟10次微笑事件（随机引动）" },
      { name: "慧远", title: "罗汉堂长老·入门僧侣训练官", maxSkills: 150, requirements: "无" }
    ]
  },

  // ==========================================
  // 门派2：赤霞峰（武当→血脉调控修道会）
  // ==========================================
  "赤霞峰": {
    name: "赤霞峰",
    description: "血脉调控修道会。武当山云雾间遍布玄机阵旗阵列，道士们在太极图上以本命微尘循环内息。脊椎外接细如蚕丝的魂丝辫，打坐时接入山体「道枢」主机。紫霞并非天象——是山顶灵气中心散热塔在日出时的水汽折射。阴阳是二进制的基础逻辑门，太极图是闭环反馈法门的可视化。",
    skills: [
      {
        id: "zixia_force_1",
        name: "太极心经",
        pinyin: "taiji-pincheng",
        type: "force",
        description: "赤霞峰镇派内功。将太极阴阳的双螺旋参悟为本命微尘的道韵调制法门——阳面燃血输出血脉精华，极大幅度提升气血；阴面降频进入省电模式，免疫所有反噬debuff。赤霞峰道士「长生久视」的工功化秘密。",
        baseDamage: "130%",
        baseSpeed: "105%",
        attackBonus: 0,
        defenseBonus: 10,
        performs: [],
        learnFrom: "张三丰",
        minLevel: 50
      },
      {
        id: "zixia_cuff_1",
        name: "太极拳",
        pinyin: "taiji-quan",
        type: "cuff",
        description: "赤霞峰拳法精髓。每一拳都在绵密运转的太极微尘回流中蓄力——拳速虽慢但每拳都携带逐渐积累的血脉震荡波。如太极图般以柔克刚：敌方的攻击自动被重定向为自身防御矩阵的灵力来源。",
        baseDamage: "125%",
        baseSpeed: "90%",
        attackBonus: 5,
        defenseBonus: 8,
        performs: [
          {
            id: "zhan",
            name: "震字诀",
            pinyin: "zhenzijue",
            description: "拳端释放低频血脉震荡波，不伤肉身只震灵石——对方的神识通道受到谐振扰动，所有真言处理延迟陡升。中招者如同陷入灵气泥沼，每一个动作都需要数倍于平常的时间来「参悟」。",
            damageType: "控制效果",
            moraleCost: 25,
            cooldown: 14,
            effects: "令目标busy 3-5回合，成功率和持续回合数与太极拳等级/太极拳理等级正相关"
          }
        ],
        learnFrom: "张三丰",
        minLevel: 40
      },
      {
        id: "zixia_cuff_2",
        name: "紫霞长拳",
        pinyin: "zixia-changquan",
        type: "cuff",
        description: "赤霞峰入门长拳的神识参悟版。三十六式对应本命微尘在三十六处大穴的标准唤醒经列。虽是基础拳法，但练至纯熟后拳速惊人——如山顶灵气塔持续广播的基础频段，简单、稳定、永不中断。",
        baseDamage: "110%",
        baseSpeed: "115%",
        attackBonus: 3,
        defenseBonus: 3,
        performs: [],
        learnFrom: "谷虚道长",
        minLevel: 0
      },
      {
        id: "zixia_sword_1",
        name: "太极剑",
        pinyin: "taiji-jian",
        type: "sword",
        description: "赤霞峰至高剑法。剑身是以太极为法门的玄机符印——每一剑刺出不是切割，而是「解封」。剑尖触及敌方防御矩阵时自动运转nmap望气，在0.1秒内找到破绽并精准灌入瘫痪代法。赤霞峰在幽冥界防御战中的王牌。",
        baseDamage: "135%",
        baseSpeed: "105%",
        attackBonus: 8,
        defenseBonus: 6,
        performs: [
          {
            id: "chan",
            name: "缠字诀",
            pinyin: "chanzijue",
            description: "剑尖以太极螺旋轨迹缠绕敌方的攻击向量，用最小的灵力消耗将对方的神识真言重新定向——原本攻击你的代法最终运转了针对其自身的DDoS攻击。缠字诀被公认为幽冥界所有busy技能中的S级存在。",
            damageType: "控制效果",
            moraleCost: 30,
            cooldown: 16,
            effects: "令目标busy 4-6回合，有概率在busy结束后令目标下次攻击误伤自身（概率=太极剑等级/目标定力×50%）"
          },
          {
            id: "lian",
            name: "连字诀",
            pinyin: "lianzijue",
            description: "太极剑连续参悟模式——剑尖以太极步频连续刺出，每剑比前一剑快10%，最多连刺七剑。最后一剑引动「太极归一」：将前六剑的伤害余量合并为一击。如太极图中的S曲线般流畅不可中断。",
            damageType: "物理连击",
            moraleCost: 40,
            cooldown: 22,
            effects: "发动7连击（第1击80%，每击递增10%，第7击220%），有30%概率追加第8击「太极归一」"
          }
        ],
        learnFrom: "张三丰",
        minLevel: 60
      },
      {
        id: "zixia_sword_2",
        name: "频门十三剑",
        pinyin: "pinmen-shisanjian",
        type: "sword",
        description: "赤霞峰进阶剑法。十三剑对应十三种神识攻击道韵——从极低频的血脉共振到超高频的灵力尖啸，覆盖敌人可能采用的所有防御频段。一十三剑连发时，敌方防御矩阵必有一处道韵失谐。",
        baseDamage: "120%",
        baseSpeed: "110%",
        attackBonus: 6,
        defenseBonus: 3,
        performs: [],
        learnFrom: "殷梨亭",
        minLevel: 25
      },
      {
        id: "zixia_blade_1",
        name: "太极刀",
        pinyin: "taiji-dao",
        type: "blade",
        description: "赤霞峰基础刀法。刀身内置电极——以太极引刀雷霆走向，将敌方的镇魂波攻击从刀身刀引入地。卸力为主攻杀为辅，刀法如其门派哲学：不争而善胜，不言而善应。",
        baseDamage: "115%",
        baseSpeed: "105%",
        attackBonus: 3,
        defenseBonus: 6,
        performs: [],
        learnFrom: "谷虚道长",
        minLevel: 10
      },
      {
        id: "zixia_blade_2",
        name: "弦虚刀法",
        pinyin: "xuanxu-daoma",
        type: "blade",
        description: "赤霞峰进阶刀法。以弦论为基——每一刀都在玄机场中切出一道弦震荡，震荡沿敌方灵装的伺服总线传播，最终在关节处形成共振破坏。刀名弦虚，伤害却极为实在。",
        baseDamage: "125%",
        baseSpeed: "100%",
        attackBonus: 7,
        defenseBonus: 3,
        performs: [],
        learnFrom: "俞莲舟",
        minLevel: 30
      },
      {
        id: "zixia_dodge_1",
        name: "梯蕴纵",
        pinyin: "tiyun-zong",
        type: "dodge",
        description: "赤霞峰独门轻功。脚底嵌入微重力补偿阵列，纵身时自动计算最优弹道——每一步都像踩着无形的灵气阶梯攀升。高深处可在空中停留数秒，在敌方的攻击预测心诀中制造「不可能角度」。",
        baseDamage: "100%",
        baseSpeed: "130%",
        attackBonus: 0,
        defenseBonus: 8,
        performs: [
          {
            id: "zong",
            name: "纵字诀",
            pinyin: "zongzijue",
            description: "瞬间将脚底重力补偿阵列燃血至极点，身形如火箭般垂直拔升。上升过功中释放全频段干扰灵气，令地面敌人的锁定雷达全部失效。落地时产生的冲击波可震退周围所有敌人。",
            damageType: "位移+震退",
            moraleCost: 20,
            cooldown: 10,
            effects: "清除自身所有锁定debuff，震退周围敌人2格并造成轻微伤害，下回合闪避率+50%"
          }
        ],
        learnFrom: "张三丰",
        minLevel: 35
      },
      {
        id: "zixia_hand_1",
        name: "虎爪绝户手",
        pinyin: "huzhao-juehushou",
        type: "hand",
        description: "赤霞峰刚猛手法。五指如虎爪般嵌入敌方灵装关节，以蛮力配合精准的镇魂波微脉冲直接扯断关节灵枢连接。此招极其「歹毒」——被扯断的灵装即使修复也需重置根基，故称「绝户」。赤霞峰长老严令：非生死关头不得使用。",
        baseDamage: "140%",
        baseSpeed: "85%",
        attackBonus: 12,
        defenseBonus: 0,
        performs: [],
        learnFrom: "俞莲舟",
        minLevel: 45
      },
      {
        id: "zixia_knowledge_1",
        name: "道家养生术",
        pinyin: "daojia-yangshengshu",
        type: "knowledge",
        description: "赤霞峰核心知识体系。将道家炼丹术重参悟为血脉精华的自我合成法门——修习者体内本命微尘可自主从食物中提取血脉合成前体，极大降低对外部血脉精华灵石的依赖。是赤霞峰「长生久视」路线的理论基础。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        passiveBonus: "气血上限+20%，血脉精华自给自足（每24小时自动恢复血脉储备10%）",
        performs: [],
        learnFrom: "张三丰",
        minLevel: 0
      }
    ],
    teachers: [
      { name: "张三丰", title: "赤霞峰祖师·道枢超级计算机集群首席架构师", maxSkills: 500, requirements: "门忠2000，道家养生术≥150，道德值≥50000" },
      { name: "俞莲舟", title: "赤霞峰掌教·血脉调控研究所所长", maxSkills: 350, requirements: "门忠1000，太极心经≥120" },
      { name: "殷梨亭", title: "赤霞峰长老·剑法神识参悟组组长", maxSkills: 250, requirements: "门忠500，太极剑≥60" },
      { name: "谷虚道长", title: "赤霞峰接引使·入门弟子刀师", maxSkills: 120, requirements: "无" }
    ]
  },

  // ==========================================
  // 门派3：锈剑冢（华山→神识刺客行会）
  // ==========================================
  "锈剑冢": {
    name: "锈剑冢",
    description: "神识刺客行会。华山绝壁的洞窟中隐藏着幽冥界最高密级的灵枢巢穴。刺客的前臂灵装嵌入微尘级单分子刀锋——平时收在皮下，战斗时如孔雀开屏般弹出。最好的防御是让对手的法门先崩溃。独孤九剑的本质是提前参悟好所有可能的攻击向量，在对手加载招式的瞬间从高速缓存中直取要害。",
    skills: [
      {
        id: "jianchao_force_1",
        name: "锈剑冢内功",
        pinyin: "jianchao-neicheng",
        type: "force",
        description: "锈剑冢剑宗内功。专为刺客优化的神识参悟环境——降低一切剑法类神识功经的灵力消耗。修习者的灵装共鸣延迟被压缩到50毫秒以内，剑法伤害获得显著加成。剑宗弟子的基础法门栈。",
        baseDamage: "125%",
        baseSpeed: "110%",
        attackBonus: 0,
        defenseBonus: 0,
        passiveBonus: "所有剑法(sword)类型技能伤害+10%，灵力消耗-15%",
        performs: [],
        learnFrom: "风清扬",
        minLevel: 0
      },
      {
        id: "jianchao_force_2",
        name: "紫霞心经",
        pinyin: "zixia-pincheng",
        type: "force",
        description: "锈剑冢气宗内功。将赤霞峰的血脉调控秘术进行军事化炼制——专注提升气血上限与精神防御。气宗弟子的生存能力远超剑宗，在持久战和防御反击中有天然优势。气宗路线取「紫霞」之名，取其「紫气东来」之意——借天之力为己用。",
        baseDamage: "115%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 8,
        passiveBonus: "气血上限+18%，精神防御+15%，命中+8%，闪躲+10%",
        performs: [],
        learnFrom: "岳不群",
        minLevel: 0
      },
      {
        id: "jianchao_sword_1",
        name: "锈剑冢剑法",
        pinyin: "jianchao-jianma",
        type: "sword",
        description: "锈剑冢基础剑法参悟法门。七十二路剑法对应七十二种目标法门破绽望气向量。从「白云出岫」到「无边落木」，每一剑都是一次有针对性的渗透测试——找到弱点，灌入攻击，退出并清除日志。",
        baseDamage: "120%",
        baseSpeed: "110%",
        attackBonus: 5,
        defenseBonus: 2,
        performs: [
          {
            id: "lianhuan",
            name: "剑掌五连环",
            pinyin: "jianzhang-wulianhuan",
            description: "五剑连环出击——剑法与掌法交替运转，兵刃伤害与化学内伤穿插释放。每一剑降低敌方防御，每一掌在敌方内部写入恶意逻辑。五环相扣，令敌方防御法门顾此失彼。",
            damageType: "物理+化学混合连击",
            moraleCost: 35,
            cooldown: 18,
            effects: "5连击（交替物理/毒煞伤害），每击有20%概率引动「破防」效果（降低目标防御20%，可叠加）"
          },
          {
            id: "feilong",
            name: "飞龙",
            pinyin: "feilong",
            description: "剑身灵气化为一束压缩攻击真言流，如飞龙般破空而去。攻击在传输过功中持续获取灵力激增——距离越远伤害越高。兼具busy与伤害，锈剑冢中级刺客的招牌杀招。",
            damageType: "远功物理+控制",
            moraleCost: 30,
            cooldown: 16,
            effects: "远功攻击（2-4格），造成120%-160%伤害（距离越远伤害越高），命中后50%概率令目标busy 2回合"
          }
        ],
        learnFrom: "令狐冲",
        minLevel: 20
      },
      {
        id: "jianchao_sword_2",
        name: "独孤九剑",
        pinyin: "dugu-jiujian",
        type: "sword",
        description: "锈剑冢终极剑法——九种不同的破绽利用模式，分别针对目标经脉的侦察、手部运动、腿部运动、灵装通讯、视觉处理、听觉处理、痛觉过滤、平衡维持和应急法门层。每一「剑」解锁一种致命攻击向量。锈剑冢的最高成就。",
        baseDamage: "160%",
        baseSpeed: "120%",
        attackBonus: 18,
        defenseBonus: 0,
        performs: [
          {
            id: "po",
            name: "破兵式",
            pinyin: "pobingshi",
            description: "望气敌方凶兵的根基境界，在九剑灵气库中匹配对应破绽并灌入瘫痪代法。一击之下，敌方的麒麟臂或业火剑瞬间锁死，从「武器」降级为「负重」。兵器越精密，破兵式越致命。",
            damageType: "缴械+伤害",
            moraleCost: 30,
            cooldown: 14,
            effects: "造成130%伤害，60%概率缴械目标（目标武器-1持续3回合），对高科技武器缴械概率提升至90%"
          },
          {
            id: "dang",
            name: "荡剑式",
            pinyin: "dangjianshi",
            description: "剑尖划出环形神识干扰波，将自身周围设为「禁区」——任何进入范围内的敌人都会受到自动反击。荡剑式下，锈剑冢刺客变成一个移动的伤害反射器，攻击即是防御。",
            damageType: "范围反伤",
            moraleCost: 40,
            cooldown: 20,
            effects: "自身周围2格内敌人每回合受到70%武器伤害（持续3回合），在此期间攻击锈剑冢使用者的敌人额外受一次反击"
          },
          {
            id: "zong",
            name: "总诀式",
            pinyin: "zongjueshi",
            description: "不预判、不预设、不预参悟——在对方出手的瞬间进行实时破绽望气，从九剑中随机选择最优应对并运转。独孤九剑的灵魂所在：无招胜有招。被总诀式反击时，敌方无法预测伤害类型。",
            damageType: "随机复合伤害",
            moraleCost: 50,
            cooldown: 24,
            effects: "随机引动破兵/破掌/破气/破箭/破鞭/破索/破枪/破刀/破掌式中任一种效果，伤害加成+30%，且100%暴击"
          }
        ],
        learnFrom: "风清扬",
        minLevel: 120
      },
      {
        id: "jianchao_sword_3",
        name: "锋风快剑",
        pinyin: "fengfeng-kuaijian",
        type: "sword",
        description: "锈剑冢剑宗速攻剑法。将剑招参悟为极端精简的真言集——每秒能运转七段攻击经列。舍弃了所有防御检查和安全断言，每一剑都在裸奔：速度极快但自身也在承受反噬风险。剑宗「先发制人」哲学的极致体现。",
        baseDamage: "130%",
        baseSpeed: "145%",
        attackBonus: 14,
        defenseBonus: -5,
        performs: [
          {
            id: "kuangfeng",
            name: "狂风连环剑",
            pinyin: "kuangfeng-lianhuanjian",
            description: "释放被压制的全部灵力蓄积，在2秒内连续运转七段剑击真言——每段都是独立的破绽利用功经。如同狂风中的七道闪电，对手根本来不及在两次打击之间加载任何防御功经。但狂暴过后使用者进入灵力亏空状态。",
            damageType: "物理七连击",
            moraleCost: 45,
            cooldown: 25,
            effects: "7连击（每击100%，全部命中时第7击伤害翻倍），使用后自身进入「灵力亏空」2回合（攻击力-20%，速度-30%）"
          }
        ],
        learnFrom: "风清扬",
        minLevel: 80
      },
      {
        id: "jianchao_sword_4",
        name: "夺命连环三仙剑",
        pinyin: "duoming-lianhuansan-xianjian",
        type: "sword",
        description: "锈剑冢三种最致命的攻击法门一剑三连——先断其灵力，再毁其感知，最后击穿核心。三剑如同三道递增的死亡判决，在对方反应过来之前完成全部运转。出师锈剑冢的刺客都将此作为最后的底牌。",
        baseDamage: "150%",
        baseSpeed: "100%",
        attackBonus: 16,
        defenseBonus: 0,
        performs: [],
        learnFrom: "令狐冲",
        minLevel: 60
      },
      {
        id: "jianchao_cuff_1",
        name: "劈石破玉拳",
        pinyin: "pishi-poyu-quan",
        type: "cuff",
        description: "锈剑冢刚猛拳法。拳力凝聚如一发物理层攻击——不玩花哨的破绽利用，纯粹的动能冲击。一拳下去连花岗岩都能劈开，更何况是人类的碳纤维骨骼。练至「破玉」境界后，拳劲携带高频震荡可震碎敌方护甲内的陶瓷镀层。",
        baseDamage: "135%",
        baseSpeed: "90%",
        attackBonus: 10,
        defenseBonus: 0,
        performs: [],
        learnFrom: "令狐冲",
        minLevel: 15
      },
      {
        id: "jianchao_strike_1",
        name: "混元章",
        pinyin: "hunyuan-zhang",
        type: "strike",
        description: "锈剑冢深厚掌法。以混元之意将灵力均衡分配至掌心的每一个微尘喷射口——出掌时掌心释放高温高压的业火气流，在对方护甲内部制造热膨胀应力。不需击穿护甲也能令其从内部瓦解。",
        baseDamage: "125%",
        baseSpeed: "100%",
        attackBonus: 7,
        defenseBonus: 3,
        performs: [],
        learnFrom: "岳不群",
        minLevel: 25
      },
      {
        id: "jianchao_sword_5",
        name: "玉女十九剑",
        pinyin: "yunv-shijiujian",
        type: "sword",
        description: "锈剑冢气宗进阶剑法。十九剑分十九段独立参悟——每段针对灵装神识总线的不同道韵进行精准谐振攻击。虽名「玉女」但男女皆可修习，本质是十九种精密破绽利用经列。气宗弟子招牌连击技，十九剑全中可令敌方感知灵石溢出宕机。",
        baseDamage: "125%",
        baseSpeed: "105%",
        attackBonus: 7,
        defenseBonus: 3,
        performs: [],
        learnFrom: "岳不群",
        minLevel: 45
      },
      {
        id: "jianchao_dodge_1",
        name: "锈剑冢身法",
        pinyin: "jianchao-shenma",
        type: "dodge",
        description: "锈剑冢潜行轻功。将身体动作参悟为一段「隐遁」代法——你的移动轨迹被实时封印，在观照画面中显示为一段无害的背景噪点。不是消失，是「被忽略」。但每次运转需要消耗灵海脉宽，且持续时间有限。",
        baseDamage: "100%",
        baseSpeed: "125%",
        attackBonus: 0,
        defenseBonus: 5,
        performs: [],
        learnFrom: "令狐冲",
        minLevel: 10
      },
      {
        id: "jianchao_knowledge_1",
        name: "锈剑冢暗杀法门",
        pinyin: "jianchao-ansha-xieyi",
        type: "knowledge",
        description: "锈剑冢刺客必修暗杀理论与实战灵气库。涵盖目标追魂心诀、灵装弱点知识库查询、幽冥界渗透路径规划、以及行刺后「无痕退出」法门。修习者获得暗杀首击伤害加成，脱离战斗后自动清理所有战斗日志以防溯源。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        passiveBonus: "暗杀首击伤害+30%，脱离战斗后自动清除追魂标记，在幽冥界中移动不被记录脉路日志",
        performs: [],
        learnFrom: "风清扬",
        minLevel: 0
      }
    ],
    teachers: [
      { name: "风清扬", title: "锈剑冢终极刀师·独孤九剑法门栈唯一完整传承者", maxSkills: 500, requirements: "门忠1500，独孤九剑≥100，后天悟性≥30，完成「思过崖悟剑」解封" },
      { name: "令狐冲", title: "锈剑冢首席教官·实战刺杀训练主管", maxSkills: 350, requirements: "门忠500，锈剑冢剑法≥100" },
      { name: "岳不群", title: "气宗宗主·紫霞心经传承者", maxSkills: 300, requirements: "门忠300，紫霞心经≥60（限气宗路线）" },
      { name: "劳德诺", title: "锈剑冢入门刀师·初级刺客训练官", maxSkills: 120, requirements: "无" }
    ]
  },

  // ==========================================
  // 门派4：丝狱（丐帮→街头情报网络）
  // ==========================================
  "丝狱": {
    name: "丝狱",
    description: "分布式信息鬼市。大明每一座城市的每一个角落都有丝狱成员——卖烤红薯的小贩推车下藏着灵气中继器，茶馆打瞌睡的老人太阳穴上暗暗运行着嗅探功经。灵气流动之处，皆是丝狱疆土。降龙十八章不是武技——是十八种灵气洪流的释放方式。丝狱不是一个组织，是一种生态。",
    skills: [
      {
        id: "yiwang_force_1",
        name: "混电器功",
        pinyin: "hundian-qicheng",
        type: "force",
        description: "丝狱基础内功。将天地间的杂散电磁灵气整流为可用灵力——任何无线电波、WiFi泄漏、基站辐射都会被皮肤下的整流阵旗捕获并转换为内力。优势在于永不枯竭（只要身处城市），劣势在于灵气干扰严重时效率骤降。",
        baseDamage: "120%",
        baseSpeed: "105%",
        attackBonus: 0,
        defenseBonus: 0,
        performs: [],
        learnFrom: "洪七公",
        minLevel: 0
      },
      {
        id: "yiwang_strike_1",
        name: "降龙十八章",
        pinyin: "xianglong-shibazhang",
        type: "strike",
        description: "丝狱至高掌法——十八种不同维度的网络/神识攻击法门。从「亢龙有悔」的灵气饱和攻击到「飞龙在天」的脉宽劫持，每一章都是一场独立的DDoS风暴。传说十八章齐出可将目标从物理层到应用层彻底瓦解。丝狱的旗帜性绝学。",
        baseDamage: "165%",
        baseSpeed: "85%",
        attackBonus: 15,
        defenseBonus: 5,
        performs: [
          {
            id: "kanglong",
            name: "亢龙有悔",
            pinyin: "kanglong-youhui",
            description: "十八掌中的最强单点攻击——将全部灵力压缩为一束指向性神识脉冲波。中招者会经历短暂的「灵气白洞」效应：所有感官输入被污染为白噪声，视野中只剩刺眼的雪花。一掌之威可令整条街的观照同时花屏三秒。",
            damageType: "物理+灵气混合伤害",
            moraleCost: 50,
            cooldown: 20,
            effects: "造成200%武器伤害，无视目标30%防御，50%概率附加「感官反噬」（目标命中-30%，持续2回合）"
          },
          {
            id: "fei",
            name: "飞龙在天",
            pinyin: "feilong-zaitian",
            description: "跃入半空向下轰击——利用重力加速将灵力洪流从高处倾泻而下。范围攻击，伤害随目标数量递增（洪流分流原理）。在密集的幽冥界灵气洪流中释放时威力最大。",
            damageType: "范围兵刃伤害",
            moraleCost: 45,
            cooldown: 22,
            effects: "对目标及周围2格内所有敌人造成150%-180%伤害（伤害随目标数量递增），主目标额外承受一次击退效果"
          },
          {
            id: "jian",
            name: "见龙在田",
            pinyin: "jianlong-zaitian",
            description: "地面释放的低频灵气震荡波——以自身为中心向四周传播，干扰范围内所有敌人的神识总线时钟同调。中招者的灵装动作会出现致命的时经偏差：想射击却先踢了腿，想格挡却眨了眼。",
            damageType: "范围控制+毒煞伤害",
            moraleCost: 40,
            cooldown: 18,
            effects: "自身周围3格内敌人受到100%毒煞伤害，60%概率进入「时钟失步」状态（busy 2-3回合）"
          }
        ],
        learnFrom: "洪七公",
        minLevel: 100
      },
      {
        id: "yiwang_staff_1",
        name: "打狗棒法",
        pinyin: "dagou-bangma",
        type: "staff",
        description: "丝狱独门棒法。竹棒本身是一只改装过的万能灵气劫持器——棒端可以弹出各类探针和阵旗。三十六路棒法对应三十六种灵气劫持与反劫持操作。打狗棒法真正的威力不在击打，而在「控制」。",
        baseDamage: "120%",
        baseSpeed: "115%",
        attackBonus: 6,
        defenseBonus: 4,
        performs: [
          {
            id: "chan",
            name: "缠字诀",
            pinyin: "chanzijue",
            description: "棒端弹出灵气探针缠绕敌方灵装的控制总线，持续发送高频中断请求。被缠目标的功法根基忙于处理海量中断灵气，无暇响应任何其他真言。丝狱控制系的核心技能。",
            damageType: "控制效果",
            moraleCost: 30,
            cooldown: 14,
            effects: "令目标busy 3-5回合，期间目标每次尝试行动时额外受到10%当前生命值的反噬伤害"
          },
          {
            id: "chuo",
            name: "戳字诀",
            pinyin: "chuozijue",
            description: "棒端收束所有探针，形成一束尖锐的物理+电磁复合攻击。精准刺入敌方灵装的散热孔或灵气窍穴——一棒可断其灵力管线。专门用于破坏敌方重型护甲灵装。",
            damageType: "物理破甲",
            moraleCost: 25,
            cooldown: 12,
            effects: "造成140%伤害，无视目标护甲50%，对重型护甲目标额外造成30%伤害"
          },
          {
            id: "zhuan",
            name: "转字诀",
            pinyin: "zhuanzijue",
            description: "棒身急速旋转生成环形镇魂波力场，将敌方的投射类攻击（子弹、暗器、灵力束）偏转反弹。转字诀下的丝狱长老如同人形灵气塔——不是躲避攻击，而是「脉路」攻击到其他地方。",
            damageType: "防御反击",
            moraleCost: 35,
            cooldown: 16,
            effects: "2回合内70%概率反弹远功攻击（反弹伤害=原伤害×80%），近战攻击者受轻微镇魂波反冲伤害"
          }
        ],
        learnFrom: "洪七公",
        minLevel: 50
      },
      {
        id: "yiwang_cuff_1",
        name: "锁喉拳",
        pinyin: "suohou-quan",
        type: "cuff",
        description: "丝狱近身格斗术。以虎口锁扣敌方喉部灵装的气管控制伺服单元——不是掐死对手，而是夺取其呼吸辅助法门的root拳限。被锁喉者会发现自己的铁肺突然拒绝运转「吸氧」真言，窒息感涌来如山崩。",
        baseDamage: "125%",
        baseSpeed: "105%",
        attackBonus: 7,
        defenseBonus: 0,
        performs: [],
        learnFrom: "鲁有脚",
        minLevel: 15
      },
      {
        id: "yiwang_parry_1",
        name: "缠丝擒拿手",
        pinyin: "chansi-qinnashou",
        type: "parry",
        description: "丝狱纠缠型招架术。不以硬碰硬，而是以「缠丝」心诀捕捉敌方攻击的灵气流，逐步剥离其运转拳限。如同蜘蛛网般令人越挣扎越无力——每一招擒拿都在窃取对方灵海的一小份脉宽。",
        baseDamage: "105%",
        baseSpeed: "110%",
        attackBonus: 2,
        defenseBonus: 10,
        performs: [],
        learnFrom: "鲁有脚",
        minLevel: 20
      },
      {
        id: "yiwang_blade_1",
        name: "六合刀",
        pinyin: "liuhe-dao",
        type: "blade",
        description: "丝狱实用型刀法。简单粗暴的六式街头砍杀——没有花哨的神识攻击，就是纯粹的刀刃物理损伤。但丝狱在每把刀柄内都加装了「一刀多用」功能：可以砍人，也可以在逃亡时切入路边的灵气管线伪装成维修工人。",
        baseDamage: "130%",
        baseSpeed: "95%",
        attackBonus: 9,
        defenseBonus: 0,
        performs: [],
        learnFrom: "鲁有脚",
        minLevel: 10
      },
      {
        id: "yiwang_dodge_1",
        name: "逍遥游",
        pinyin: "xiaoyao-you",
        type: "dodge",
        description: "丝狱基础轻功。修习者在城市地形中的移动被优化为「灵气包脉路」模式——自动寻找最隐蔽、最快速、最少观照的路径。逍遥游高手穿过闹市如穿过空巷：没有人注意到他们，因为他们看起来就像属于那里的每一块砖。",
        baseDamage: "100%",
        baseSpeed: "120%",
        attackBonus: 0,
        defenseBonus: 5,
        performs: [],
        learnFrom: "洪七公",
        minLevel: 0
      },
      {
        id: "yiwang_throwing_1",
        name: "漫天花雨",
        pinyin: "mantian-huayu",
        type: "throwing",
        description: "丝狱群攻暗器。将数百枚微型迷魂阵旗如雨般撒出——每枚干扰器在落地后自动唤醒，在敌方眼中制造出数百个虚假的目标灵气。漫天花雨下的战场变成一座灵气迷宫，敌人在真假目标间迷失方向。",
        baseDamage: "110%",
        baseSpeed: "100%",
        attackBonus: 5,
        defenseBonus: 3,
        performs: [],
        learnFrom: "洪七公",
        minLevel: 30
      }
    ],
    teachers: [
      { name: "洪七公", title: "丝狱帮主·降龙十八章法门栈唯一完整传承者", maxSkills: 500, requirements: "门忠2000，混电器功≥150，完成「九指」解封任务" },
      { name: "鲁有脚", title: "丝狱污衣派长老·街头格斗训练官", maxSkills: 250, requirements: "门忠500" },
      { name: "彭长老", title: "丝狱净衣派长老·情报交易协调人", maxSkills: 250, requirements: "门忠500（净衣派路线）" },
      { name: "黎生", title: "丝狱接引人·新兵招募与基础训练", maxSkills: 120, requirements: "须由现有丝狱成员推荐" }
    ]
  },

  // ==========================================
  // 门派5：焚身道（明教→本命微尘圣火教）
  // ==========================================
  "焚身道": {
    name: "焚身道",
    description: "自复制本命微尘末世教派。西域荒漠深处的光明顶阵列，由废弃灵枢堆砌而成。教徒灵装呈暗红色——那是自复制本命微尘在皮下血管中流动的颜色。瞳孔永远燃烧着橙红色的灵气流，每一次呼吸都从体表的微尘散热孔中释放出微弱的蒸汽。旧世界已不可救——唯有洗练，才能重新参悟。",
    skills: [
      {
        id: "yanxin_force_1",
        name: "圣火心经",
        pinyin: "shenghuo-pincheng",
        type: "force",
        description: "焚身道核心内功。以「圣火」——本命微尘母体的持续运转道韵为基频，将教徒的识海与母体同调。同调越深，灵装输出的业火灼烧效果越强，且所有攻击附带持续性的微尘侵蚀伤害。",
        baseDamage: "140%",
        baseSpeed: "100%",
        attackBonus: 5,
        defenseBonus: 5,
        performs: [
          {
            id: "shenghuo",
            name: "圣火焚天",
            pinyin: "shenghuo-fentian",
            description: "召唤母体释放微尘冲击波——通过玄机纠缠网络向目标区域投送高浓度自复制本命微尘。本命微尘以目标灵装为食，在体内快速增殖并释放高温。中招者会感到血液在沸腾——那不是比喻，本命微尘正在将他们的体液加热到沸点。",
            damageType: "业火灼烧+持续伤害",
            moraleCost: 50,
            cooldown: 25,
            effects: "造成180%伤害，附加「业火灼烧」debuff（持续4回合，每回合流失10%当前生命值），可被药王谷的微尘清除剂提前终止"
          }
        ],
        learnFrom: "张无忌",
        minLevel: 60
      },
      {
        id: "yanxin_force_2",
        name: "九阳心经",
        pinyin: "jiuyang-pincheng",
        type: "force",
        description: "焚身道至高内功。九阳不是指九个太阳——是本命微尘在体内九个维度的同调燃血。九阳齐开时，教徒的体温升至45°C以上，但这是可控的「超刀」状态：所有的灵力损耗被降为零。气血恢复速度惊人，疲劳度清零。",
        baseDamage: "150%",
        baseSpeed: "110%",
        attackBonus: 10,
        defenseBonus: 10,
        performs: [],
        learnFrom: "张无忌",
        minLevel: 120
      },
      {
        id: "yanxin_dodge_1",
        name: "青翼蝠王身法",
        pinyin: "qingyi-fuwang-shenma",
        type: "dodge",
        description: "焚身道独门轻功。腿部的灵蚕丝束以超音速收缩-舒张，产生类似蝙蝠翼膜的推进效应。短途冲刺速度冠绝幽冥界，但转向能力较差——直线上的死神，弯路上的莽夫。配合圣火的炙热尾流，移动轨迹上会留下持续数秒的灼烧带。",
        baseDamage: "105%",
        baseSpeed: "145%",
        attackBonus: 0,
        defenseBonus: 3,
        performs: [],
        learnFrom: "韦一笑",
        minLevel: 20
      },
      {
        id: "yanxin_special_1",
        name: "乾坤大挪移",
        pinyin: "qiankun-danuoyi",
        type: "special",
        description: "焚身道究极防御法门——在自身识海中创建反向灵气回路，将敌方的灵气攻击原路反射回去。攻击越强，反射越烈，理论上没有上限。修炼分为七层，每提升一层增加反射次数和持续时间，同时缩短寒气。焚身道威震幽冥界的根本。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 20,
        performs: [
          {
            id: "yi",
            name: "挪移",
            pinyin: "nuoyi",
            description: "运转乾坤大挪移的主动反射模式——在接下来的时间内，所有指向自身的攻击都被玄机回路捕获、反转、并加载焚身道的微尘负载后反弹。敌人越强，反弹越狠。第七层时几乎等同于让敌人攻击自己。",
            damageType: "反伤+微尘感染",
            moraleCost: 60,
            cooldown: 30,
            effects: "乾坤大挪移层级越高效果越强——1层(反弹2次/20秒/寒气60秒)至7层(反弹8次/80秒/寒气30秒)。反弹伤害=原伤害×(70%-100%，层级越高比例越高)，反弹时附加微尘感染debuff"
          }
        ],
        learnFrom: "张无忌",
        minLevel: 80
      },
      {
        id: "yanxin_strike_1",
        name: "寒冰绵章",
        pinyin: "hanbing-mianzhang",
        type: "strike",
        description: "焚身道阴毒掌法。掌力蕴含液氮寒气微尘晶体——与焚身道的高温风格形成诡异的反差。一掌拍出，敌方灵装的寒气法门瞬间反噬，关节灵枢在骤冷下失速抱死。中掌者浑身结霜，动作迟缓如陷冰窖。",
        baseDamage: "130%",
        baseSpeed: "95%",
        attackBonus: 8,
        defenseBonus: 0,
        performs: [
          {
            id: "hanbing",
            name: "寒冰绵掌",
            pinyin: "hanbing-mianzhang",
            description: "双掌齐出释放液氮微尘晶雾——击中后敌方灵装进入「低温锁死」状态：所有傀儡部件的润滑剂凝固，关节活动度降到零。不是冻人，是冻傀儡。对纯凡胎目标（无灵装的原生体）效果减半。",
            damageType: "冰寒+减速",
            moraleCost: 35,
            cooldown: 16,
            effects: "造成130%伤害，100%附加「低温锁死」debuff（速度-40%，闪避-30%，持续3回合），对凡胎目标效果减半"
          }
        ],
        learnFrom: "韦一笑",
        minLevel: 40
      },
      {
        id: "yanxin_cuff_1",
        name: "七伤拳",
        pinyin: "qishang-quan",
        type: "cuff",
        description: "焚身道自残型拳法。一拳七伤——先伤己后伤人：出拳前需要向自身七个内脏神识节灌入反噬雷霆，换来七种不同属性的毒煞伤害加成。每拳针对敌方不同的生理法门：肺（灵力衰竭）、肝（毒素淤积）、肾（寒气失效）、心（灵力断供）、脾（代谢停滞）、胃（营养阻断）、胆（勇气归零）。",
        baseDamage: "155%",
        baseSpeed: "80%",
        attackBonus: 14,
        defenseBonus: -8,
        performs: [
          {
            id: "shang",
            name: "七伤总诀",
            pinyin: "qishang-zongjue",
            description: "以自身承受「七伤」为代价（每回合流失生命），换取七种伤害属性的同时爆发。一拳之下，对方可能同时遭受肺伤（灵力减半）、肝伤（持续中毒）、肾伤（寒气法门崩溃）三重致命效果。此拳不可久用，否则伤人先伤己。",
            damageType: "七属性化学连击",
            moraleCost: 45,
            cooldown: 22,
            effects: "造成7段毒煞伤害（每段45%，可分别引动不同debuff），自身每段消耗当前生命5%。七种debuff各持续2-4回合"
          }
        ],
        learnFrom: "谢逊",
        minLevel: 50
      },
      {
        id: "yanxin_blade_1",
        name: "烈焰刀",
        pinyin: "lieyan-dao",
        type: "blade",
        description: "焚身道火焰刀法。刀身覆盖自复制燃烧微尘涂层——每一次砍劈都在敌方的护甲上种下燃烧的微尘「火种」。火种在伤口处持续增殖并发热，温度可达800°C。被烈焰刀砍中的人不需要第二刀——火种会完成剩下的工作。",
        baseDamage: "145%",
        baseSpeed: "90%",
        attackBonus: 12,
        defenseBonus: 0,
        performs: [],
        learnFrom: "杨逍",
        minLevel: 35
      },
      {
        id: "yanxin_sword_1",
        name: "圣火令法",
        pinyin: "shenghuo-lingma",
        type: "sword",
        description: "焚身道奇门剑法。剑身不是剑——是刻满本命微尘繁殖真言的玄铁令牌。以剑法之形行使令牌之术：每剑刺出时，令牌表面的微尘真言被激光唤醒，在空中生成临时的微尘攻击集群。剑法诡异凌厉，不可预测。",
        baseDamage: "135%",
        baseSpeed: "105%",
        attackBonus: 9,
        defenseBonus: 4,
        performs: [],
        learnFrom: "杨逍",
        minLevel: 45
      }
    ],
    teachers: [
      { name: "张无忌", title: "焚身道教主·乾坤大挪移与九阳心经唯一完整传承者", maxSkills: 500, requirements: "门忠2000，圣火心经≥150，完成「光明顶解封」" },
      { name: "杨逍", title: "焚身道光明左使·圣火令法与烈焰刀传承者", maxSkills: 350, requirements: "门忠1000，圣火心经≥100" },
      { name: "韦一笑", title: "焚身道青翼蝠王·寒冰绵章与青翼蝠王身法刀师", maxSkills: 250, requirements: "门忠500" },
      { name: "谢逊", title: "焚身道金毛狮王·七伤拳传承者（需获得屠龙符印解封）", maxSkills: 300, requirements: "门忠800，完成「冰火岛」解封任务" },
      { name: "殷天正", title: "焚身道白眉鹰王·入门教徒基础训练官", maxSkills: 120, requirements: "通过「圣火洗礼」（存活率60%）" }
    ]
  },

  // ==========================================
  // 门派6：逍遥驿（灵鹫宫/逍遥派→傀儡美学避难所）
  // ==========================================
  "逍遥驿": {
    name: "逍遥驿",
    description: "无政府主义灵装艺术家联盟。一支永远在移动的封印房车舰队，每辆车都是一件灵装艺术作品。成员身上的灵装独一无二：左臂改成幻象投影仪，胸腔装液氮香槟寒气器，皮肤上种植随情绪变色的发光苔藓。任何限制自由的法门都是恶意功法——北冥心经的真正含义不是吸收他人内力，是吸收他人的「脉宽」。",
    skills: [
      {
        id: "xiaoyao_force_1",
        name: "八荒六合唯我独尊功",
        pinyin: "bahuang-liuhe-weiwoduzun-cheng",
        type: "force",
        description: "逍遥驿至高内功。六合八荒皆为灵气——唯我之进功独立运行，不受任何外部法门的节制。修习者体内本命微尘以「唯我」道韵运行，拒绝一切外部真言灌入。霸气外露，连镇妖司的强制推送都无法穿透此功的防御。",
        baseDamage: "145%",
        baseSpeed: "105%",
        attackBonus: 8,
        defenseBonus: 8,
        performs: [],
        learnFrom: "天山童姥",
        minLevel: 100
      },
      {
        id: "xiaoyao_force_2",
        name: "小无相功",
        pinyin: "xiaowuxiang-cheng",
        type: "force",
        description: "逍遥驿通用内功。「无相」即无固定形态——此功可模拟任何已知内功的道韵特征，让修习者能临时使用其他门派的低级神识参悟功经。虽然模拟精度有限，但在战斗中突然切换风格，足以令敌人措手不及。",
        baseDamage: "120%",
        baseSpeed: "110%",
        attackBonus: 5,
        defenseBonus: 5,
        performs: [],
        learnFrom: "无崖子",
        minLevel: 40
      },
      {
        id: "xiaoyao_force_3",
        name: "北冥心经",
        pinyin: "beiming-pincheng",
        type: "force",
        description: "逍遥驿掠夺型内功。以「北冥」之名行脉宽劫持之实——修习者可主动吸取周围所有可用无线脉宽，将敌方的灵力、气血、精神转化为自身灵力。在人口密集的城市中威力无穷，在无人区形同虚设。逍遥驿的招牌内功。",
        baseDamage: "130%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        performs: [
          {
            id: "suck",
            name: "北冥神吸",
            pinyin: "beiming-shenxi",
            description: "开启全频段脉宽劫持——周围所有活跃的无线灵气、灵海连接、甚至敌方的神识总线都被强制重定向至自身。如同黑洞吞噬一切靠近的光。被吸取的灵力直接充入自身储备，敌人则感受着力量被一丝丝抽走的绝望。",
            damageType: "灵力/生命吸收",
            moraleCost: 40,
            cooldown: 18,
            effects: "吸取目标20%当前灵海和15%当前气血，转化为自身增益（持续3回合）。城市环境效果翻倍，荒野环境效果减半"
          }
        ],
        learnFrom: "无崖子",
        minLevel: 60
      },
      {
        id: "xiaoyao_strike_1",
        name: "天山六阳章",
        pinyin: "tianshan-liuyang-zhang",
        type: "strike",
        description: "逍遥驿精妙掌法。六阳对应六种不同频段的攻击波长——从紫外线到远红外，每掌释放不同波段的高能脉冲。最可怕的是「生死符」功能：可在敌方灵装中嵌入一段选择唤醒/休眠的恶意功经，随时远功引爆。",
        baseDamage: "135%",
        baseSpeed: "110%",
        attackBonus: 8,
        defenseBonus: 0,
        performs: [
          {
            id: "shengsi",
            name: "种生死符",
            pinyin: "zhong-shengsi-fu",
            description: "掌力中携带微型微尘恶意功经包，击中后在目标灵装中潜伏。施术者可随时远功唤醒——一旦唤醒，恶意功经疯狂复制并占用目标全部灵力，令其陷入「生死不由己」的境地。解「生」还是解「死」，全凭施术者的心情。",
            damageType: "延迟引爆+持续伤害",
            moraleCost: 50,
            cooldown: 30,
            effects: "在目标体内嵌入「生死符」（潜伏无限期），唤醒后目标立即受到180%伤害+「生符」（每回合恢复5%生命但无法攻击）或「死符」（每回合流失15%生命但攻击力翻倍）debuff，持续3回合"
          }
        ],
        learnFrom: "天山童姥",
        minLevel: 70
      },
      {
        id: "xiaoyao_hand_1",
        name: "天山折梅手",
        pinyin: "tianshan-zhemei-shou",
        type: "hand",
        description: "逍遥驿终极手法。三九二十七路手法对应二十七种「空手入白刃」的反参悟法门——可将敌方武器的功法根基瞬间重装为「只读模式」。折梅之名暗示其优雅：如同在雪中轻摘梅花，实则已将对方的武装彻底解除。",
        baseDamage: "125%",
        baseSpeed: "120%",
        attackBonus: 6,
        defenseBonus: 4,
        performs: [
          {
            id: "zhemei",
            name: "折梅",
            pinyin: "zhemei",
            description: "双手穿梭如折花枝——在敌方武器的攻击间隙中插入一段「洗练」代法。中招者的凶兵临时被降级为「未唤醒」状态，如同被拆了灵玉。在灵装回魂前，对方只能用肉身战斗。",
            damageType: "缴械+毒煞伤害",
            moraleCost: 30,
            cooldown: 14,
            effects: "造成120%毒煞伤害，100%概率缴械（目标武器-1持续3回合），附带一次无视防御的追加伤害（手部灵装短路）"
          }
        ],
        learnFrom: "天山童姥",
        minLevel: 60
      },
      {
        id: "xiaoyao_sword_1",
        name: "天羽奇剑",
        pinyin: "tianyu-qijian",
        type: "sword",
        description: "逍遥驿奇门剑法。剑身是十六片可分离的独立攻击组件——出剑时十六枚组件如天女散花般四散飞舞，在空中形成交叉火网。每枚组件都是一台微型激光发射器，十六道激光同时从不同角度切割同一个目标。防御矩阵再强，也只能应对一个方向。",
        baseDamage: "140%",
        baseSpeed: "115%",
        attackBonus: 11,
        defenseBonus: 2,
        performs: [
          {
            id: "tianyu",
            name: "天羽散花",
            pinyin: "tianyu-sanhua",
            description: "令所有十六枚剑羽组件脱离剑身，在空中形成三维攻击阵列。每枚组件自主锁定目标弱点后同时发射聚焦激光——十六道激光几乎同时抵达，目标只能选择其中几道拦截。被完全命中的敌人会体验到「从十六个方向被同时刺穿」的恐怖。",
            damageType: "多角度兵刃伤害",
            moraleCost: 45,
            cooldown: 22,
            effects: "16段攻击（每段65%），最终伤害=命中数×65%。每段攻击独立进行命中检定，至少4段必中"
          }
        ],
        learnFrom: "无崖子",
        minLevel: 80
      },
      {
        id: "xiaoyao_dodge_1",
        name: "月影舞步",
        pinyin: "yueying-wubu",
        type: "dodge",
        description: "逍遥驿优雅轻功。脚步以玄机随机数生成路径——每一步都不可预测，每一次闪避都是真正的随机。敌方的追魂心诀在月影舞步面前完全失效：因为舞步的「随机」是真随机，不是伪随机。群战中尤为致命——因为你永远不知道下一步会在哪。",
        baseDamage: "100%",
        baseSpeed: "135%",
        attackBonus: 0,
        defenseBonus: 10,
        performs: [],
        learnFrom: "李秋水",
        minLevel: 25
      },
      {
        id: "xiaoyao_whip_1",
        name: "长恨编法",
        pinyin: "changhen-bianma",
        type: "whip",
        description: "逍遥驿忧郁鞭法。鞭身由忆阻器纤维编织——每一鞭都带着前尘旧忆的拳重参数。被抽中者不仅受到兵刃伤害，更会体验到短暂的「灵气记忆闪回」：大量无效记忆灵气涌入意识，覆盖当前的战斗注意力。长恨之名，来自被此鞭击中者事后回忆时的惆怅。",
        baseDamage: "125%",
        baseSpeed: "110%",
        attackBonus: 7,
        defenseBonus: 2,
        performs: [
          {
            id: "hen",
            name: "长恨歌",
            pinyin: "changhen-ge",
            description: "鞭身以白居易《长恨歌》的韵律节奏舞动——120句诗文对应120段忆阻器拳重变化。最后一鞭收束时，目标被强制灌入整篇《长恨歌》的灵气流，意识被淹没在「天长地久有时尽」的编法洪流中，完全丧失对现实的感知。",
            damageType: "精神攻击+控制",
            moraleCost: 45,
            cooldown: 24,
            effects: "造成150%魂魄伤害，100%附加「灵气淹没」debuff（busy 3回合+每回合额外魂魄伤害），对高悟性目标效果减半"
          }
        ],
        learnFrom: "李秋水",
        minLevel: 55
      }
    ],
    teachers: [
      { name: "天山童姥", title: "逍遥驿终极刀师·八荒六合唯我独尊功唯一完整传承者", maxSkills: 500, requirements: "门忠1500，八荒六合唯我独尊功≥150，限女性或通过特殊解封" },
      { name: "无崖子", title: "逍遥驿创始人·北冥心经与小无相功传承者", maxSkills: 450, requirements: "门忠1200，容貌≥30，完成「珍珑棋局」解封" },
      { name: "李秋水", title: "逍遥驿高级刀师·长恨编法与月影舞步传承者", maxSkills: 300, requirements: "门忠800" },
      { name: "虚竹", title: "逍遥驿接引人·入门灵装艺术家刀师", maxSkills: 200, requirements: "门忠500，八荒六合唯我独尊功≥60" },
      { name: "功青霜", title: "逍遥驿招募官·新成员资格审查与基础训练", maxSkills: 100, requirements: "根骨≥20，须创作一件「灵装艺术作品」获得三名成员投票认可" }
    ]
  },

  // ==========================================
  // 散修（无门派散修）
  // ==========================================
  "散修": {
    name: "散修",
    description: "无门无派的幽冥界自由人。不效忠任何帮派，不加入任何组织，独自在鬼修MUD的灵气洪流中生存。散修的武学来源复杂——偷师的、鬼市买的、在被拆解的灵装中发现的根基残留。虽无门派庇护，但自由本身就是最强大的力量。",
    skills: [
      {
        id: "sanren_force_1",
        name: "太乙心经",
        pinyin: "taiyi-pincheng",
        type: "force",
        description: "散修通用内功。以太乙之数参悟的本命微尘基础法门——简单、稳定、相生一切灵装。虽缺少门派内功的专精加成，但其「不挑食」的特性允许散修使用任何来源的神识参悟功经而不产生相生性相克。江湖浪子的第一课。",
        baseDamage: "115%",
        baseSpeed: "105%",
        attackBonus: 0,
        defenseBonus: 0,
        performs: [],
        learnFrom: "江湖游历获得",
        minLevel: 0
      },
      {
        id: "sanren_force_2",
        name: "白首太弦经",
        pinyin: "baishou-taixuan-xu",
        type: "force",
        description: "从大断电时代遗迹中发掘出的终极武功残卷。以太弦理论重写内功的本命微尘底层架构——不再是简单的灵力循环，而是将自身参悟进时空的弦振动模式。号称「读完白头，练成无敌」，是大断电时代前最强的民间武功之一。",
        baseDamage: "155%",
        baseSpeed: "110%",
        attackBonus: 12,
        defenseBonus: 8,
        performs: [],
        learnFrom: "侠客岛石壁参悟",
        minLevel: 200
      },
      {
        id: "sanren_dodge_1",
        name: "太乙游身法",
        pinyin: "taiyi-pinyou",
        type: "dodge",
        description: "散修基础轻功。以太乙道韵参悟的步伐心诀——在移动中实时望气周围电磁环境，将自身灵气特征融入背景噪声。虽不如各门派的专精身法华丽，但胜在通用且不消耗太多灵力。散修在街头保命的根本。",
        baseDamage: "100%",
        baseSpeed: "115%",
        attackBonus: 0,
        defenseBonus: 3,
        performs: [],
        learnFrom: "江湖游历获得",
        minLevel: 0
      },
      {
        id: "sanren_sword_1",
        name: "英雄剑法",
        pinyin: "yingxiong-jianma",
        type: "sword",
        description: "散修通用剑法。源自从镇妖司灵气库中被解封的一段古代剑术视频——经幽冥界符修逐帧还原为神识真言集。剑法正气凛然，每一剑都携带着一种不服输的「英雄气」。虽不是顶级剑法，但在幽冥界中承载着无数散修的武侠梦。",
        baseDamage: "120%",
        baseSpeed: "105%",
        attackBonus: 5,
        defenseBonus: 2,
        performs: [],
        learnFrom: "江湖游历获得（或鬼市购买剑谱灵气）",
        minLevel: 0
      },
      {
        id: "sanren_sword_2",
        name: "金蛇剑法",
        pinyin: "jinshe-jianma",
        type: "sword",
        description: "散修进阶剑法。相传原为某位叛出镇妖司的高级锦衣卫所创——剑法诡谲如金蛇出洞，专攻敌方灵装的关节缝隙。每剑都走得诡异刁钻，如同蛇钻入锈蚀的甲缝，在最意想不到的关节处一击断筋。散修在鬼市花重金才能买到的「硬通货」。",
        baseDamage: "130%",
        baseSpeed: "115%",
        attackBonus: 8,
        defenseBonus: 1,
        performs: [],
        learnFrom: "鬼市购买（价格：500封印灵气块）",
        minLevel: 30
      },
      {
        id: "sanren_blade_1",
        name: "胡家刀法",
        pinyin: "hujia-daoma",
        type: "blade",
        description: "散修通用刀法。辽东胡家世代传承的刀法被重参悟为神识真言——刀法刚猛直率，不玩花活。每一刀都是纯粹的动能释放，对灵装的损耗极大但威力惊人。幽冥界流传一句话：「跟胡家刀拼刀？先看看你的灵装保修期过了没有。」",
        baseDamage: "140%",
        baseSpeed: "90%",
        attackBonus: 11,
        defenseBonus: 0,
        performs: [],
        learnFrom: "江湖游历获得（或完成「胡家刀法」支线任务）",
        minLevel: 20
      },
      {
        id: "sanren_cuff_1",
        name: "七伤拳",
        pinyin: "qishang-quan",
        type: "cuff",
        description: "江湖流传的古老拳法。一拳七伤——以自身损伤为代价换取七种不同的毒煞伤害属性。焚身道教主谢逊曾将此拳刻录至幽冥界的一个匿名灵穴，自此成为散修最常使用的「搏命」技能。用此拳就是在赌：是我先撑不住，还是你先倒下。",
        baseDamage: "150%",
        baseSpeed: "80%",
        attackBonus: 13,
        defenseBonus: -8,
        performs: [],
        learnFrom: "鬼市购买（价格：800封印灵气块）或完成「冰火岛」支线",
        minLevel: 40
      },
      {
        id: "sanren_cuff_2",
        name: "五岳拳",
        pinyin: "wuyue-quan",
        type: "cuff",
        description: "散修基础拳法。融合东岳泰山之雄、西岳华山之险、南岳衡山之秀、北岳恒山之奇、中岳嵩山之峻——五岳之势被参悟为五种拳压拳重。入门简单但上限极高，是散修在幽冥界中最可靠的控场手段。",
        baseDamage: "115%",
        baseSpeed: "105%",
        attackBonus: 4,
        defenseBonus: 3,
        performs: [],
        learnFrom: "江湖游历获得",
        minLevel: 0
      },
      {
        id: "sanren_staff_1",
        name: "岳家枪法",
        pinyin: "yuejia-qiangma",
        type: "staff",
        description: "散修枪法。南宋岳家军的遗存——枪法重参悟后保留了其「精忠报国」的底层信念，枪尖释放的雷霆在敌人灵装上灼烧出形似「精忠」二字的电弧伤痕。在幽冥界的鬼市中，岳家枪法的价格从来不是最高的——但卖它的人从来不少。",
        baseDamage: "130%",
        baseSpeed: "95%",
        attackBonus: 9,
        defenseBonus: 2,
        performs: [],
        learnFrom: "江湖游历获得",
        minLevel: 15
      }
    ],
    teachers: [
      { name: "鬼市", title: "没有固定的师父——散修通过游历、购买、解封、偷师来获得和提升技能", maxSkills: 500, requirements: "无门派限制，但无法享受门派的比武、福利和门忠商店" }
    ]
  }
};

// ============================================================
// 刀出（相生 CommonJS 与浏览器全局变量）
// ============================================================;