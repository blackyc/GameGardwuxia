// ============================================================
// 鬼修MUD · 技能树灵气 第二卷
// Ghost MUD Dynasty Skill Trees Vol.2
// 包含：药王谷 | 血禅寺 | 镜阁 | 归墟 | 药王谷 | 傀坊 | 散修
// 迁移时间: 2026-06-19
// 基于: 聊斋大明技能树全量迁移 → 聊斋仙途·克苏鲁高武修仙风格
// ============================================================

var GHOST_SKILL_TREES_2 = {

// ==================== 门派7：药王谷（星宿·失控生化研究所） ====================
"药王谷": {
  name: "药王谷",
  mud_origin: "星宿派",
  type: "失控生化研究所",
  description: "青海沼泽深处，一片由废弃寒气塔炼制的生物丹房群。药王谷成员皮肤上嵌有半透明的合成毒囊——荧光绿、暗紫、死黑的毒素在其中缓缓流动。他们的呼吸阀经过多层过滤，呼出的气体带着神识麻痹气溶胶的微甜。在这里，万物皆有毒，剂量定生死——毒即是药，药即是毒，区别只在靶向。",

  skills: [
    {
      id: "duchao_force_1",
      name: "化功大法",
      pinyin: "huacheng-dama",
      type: "force",
      description: "以微尘生化病毒重构内力循环，将各种外部灵力转化为自身驱动力。练至大成可化去他人内力、腐蚀敌人护甲，甚至将毒素逆向编功为治愈代法。血脉腐蚀是它的最终形态——72小时内可将目标修为归零。",
      baseDamage: "115%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_duchao_hua",
          name: "化功",
          pinyin: "huacheng",
          description: "释放血脉定向腐蚀蛊毒，侵蚀敌方内力循环法门，持续降低对方攻击力与防御力。被化者如被抽去骨髓——力量仍在，但已不听使唤。",
          qiCost: 45,
          cooldown: 4,
          damageType: "debuff",
          requirements: "化功大法80级"
        },
        {
          id: "perf_duchao_huoyan",
          name: "毒焰",
          pinyin: "duyan",
          description: "将蛊毒灌入空气，在身周形成一圈燃烧的生化毒焰墙。踏入者每回合承受毒系持续伤害，同时被降低移动速度。毒素在火焰中发生链式裂变——越烧越毒。",
          qiCost: 60,
          cooldown: 5,
          damageType: "aoe_dot",
          requirements: "化功大法120级，药王谷毒章100级"
        },
        {
          id: "perf_duchao_huoqiang",
          name: "毒墙",
          pinyin: "duqiang",
          description: "以化功大法驱动空气中悬浮的蛊毒聚合为一面半透明的毒液屏障，可阻挡远功攻击并反弹部分伤害。屏障本身含神识麻痹素——触碰即瘫。",
          qiCost: 50,
          cooldown: 4,
          damageType: "shield",
          requirements: "化功大法100级"
        }
      ],
      learnFrom: "丁春秋",
      minLevel: 0
    },
    {
      id: "duchao_strike_1",
      name: "药王谷毒章",
      pinyin: "duchao-duzhang",
      type: "strike",
      description: "掌法中暗藏皮下毒囊的注射刀管，每一掌拍出不仅以力道伤人，更在接触瞬间灌入合成神识毒素。掌法本身平平无奇，配上毒囊后便成了灵枢江湖最令人胆寒的近战杀器。",
      baseDamage: "105%",
      baseSpeed: "95%",
      attackBonus: 10,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_duchao_chousui",
          name: "抽髓三掌",
          pinyin: "chousui-sanzhang",
          description: "三掌连环，一掌比一掌深，一掌比一掌毒。第一掌破防，第二掌注毒，第三掌引爆前两掌残留的蛊毒——三重伤害叠加，如骨髓被生生抽出。",
          qiCost: 55,
          cooldown: 4,
          damageType: "chemical",
          requirements: "药王谷毒章120级"
        },
        {
          id: "perf_duchao_sandu",
          name: "散毒",
          pinyin: "sandu",
          description: "双掌齐推，掌风中裹挟雾化的合成神识毒气，呈扇形扩散覆盖前方所有目标。毒素通过呼吸法门或皮肤接触侵入，每目标独立计算毒发时间。",
          qiCost: 70,
          cooldown: 5,
          damageType: "aoe_dot",
          requirements: "药王谷毒章100级"
        },
        {
          id: "perf_duchao_bihuo",
          name: "碧火弹",
          pinyin: "bihuo-dan",
          description: "掌心凝聚一团高压微尘毒液球，投掷后在目标身上炸开，造成即时的化学爆发伤害并附加持续毒性。毒液球在空中拖出一道磷光尾迹——那是活体毒藻的冷光。",
          qiCost: 45,
          cooldown: 3,
          damageType: "chemical",
          requirements: "药王谷毒章80级"
        },
        {
          id: "perf_duchao_sanxiao",
          name: "三笑逍遥散",
          pinyin: "sanxiao-xiaoyaosan",
          description: "药王谷至高毒技——将三种血脉靶向病毒编法为三段笑声道韵。目标听到第一声笑，病毒进入潜伏；第二声，病毒唤醒复制；第三声，全身血脉本命微尘开始自毁——三笑之后，神仙难救。",
          qiCost: 120,
          cooldown: 8,
          damageType: "chemical_fatal",
          requirements: "药王谷毒章180级，蛛网阵150级"
        }
      ],
      learnFrom: "丁春秋",
      minLevel: 0
    },
    {
      id: "duchao_strike_2",
      name: "冥域功",
      pinyin: "mingyu-cheng",
      type: "strike",
      description: "以蛊毒模拟死亡状态的内力运转模式——气血降至冰点，代谢近乎停止，在敌人以为你已死之时突然爆发出致命一击。修习此功者体温常年在34°C以下，心跳可降至每分钟20次而不昏迷。",
      baseDamage: "120%",
      baseSpeed: "85%",
      attackBonus: 12,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_duchao_jiashe",
          name: "假死",
          pinyin: "jiashe",
          description: "主动引动蛊毒麻痹自身经脉，全身机能降至假死状态——免疫一切精神类攻击和探测，持续2回合。复苏后首次攻击伤害翻倍。",
          qiCost: 30,
          cooldown: 6,
          damageType: "buff",
          requirements: "冥域功80级"
        }
      ],
      learnFrom: "阿紫",
      minLevel: 20
    },
    {
      id: "duchao_hand_1",
      name: "摘星手",
      pinyin: "zhaixing-shou",
      type: "hand",
      description: "手法快如神识脉冲，五指开合间可将皮下毒囊中的毒素精确涂抹于指尖。每一次触敌都是一次精确的「毒液注射」，无需破皮即可让毒素沿毛孔渗入——真正的杀人于无形。",
      baseDamage: "90%",
      baseSpeed: "120%",
      attackBonus: 6,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_duchao_zhaixing",
          name: "摘星",
          pinyin: "zhaixing",
          description: "以不可思议的速度在敌人身上连点数下，每一下都在不同穴位灌入不同毒素——麻痹、失明、减速、沉默——如同摘取天上的星辰般精准而不可捉摸。",
          qiCost: 40,
          cooldown: 3,
          damageType: "multi_debuff",
          requirements: "摘星手100级"
        },
        {
          id: "perf_duchao_tantu",
          name: "弹指涂毒",
          pinyin: "tantu-tudou",
          description: "屈指弹出毒液微滴，射功可达十步。毒液微滴在空中自动分裂为数十个更小的微尘，形成一片肉眼不可见的毒雾区。穿过该区域的敌人自动中毒。",
          qiCost: 35,
          cooldown: 3,
          damageType: "ranged_dot",
          requirements: "摘星手80级"
        }
      ],
      learnFrom: "阿紫",
      minLevel: 10
    },
    {
      id: "duchao_staff_1",
      name: "天山杖法",
      pinyin: "tianshan-zhangma",
      type: "staff",
      description: "杖身内置毒液刀管，杖头镶嵌蛊毒喷射器。每一次挥杖不仅是物理打击，更在击中时释放一次定向毒素喷雾。杖法源自西域苦寒之地，招式粗犷狠辣，但在药王谷手中——粗犷之上又添了几分阴毒。",
      baseDamage: "110%",
      baseSpeed: "90%",
      attackBonus: 8,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_duchao_tianshan",
          name: "活色生香",
          pinyin: "huose-shengxiang",
          description: "杖尖喷射出一团色彩斑斓的毒雾，雾气中混杂着致幻神识灵气，闻到者不仅中毒，还会产生美妙的幻觉——香风阵阵、美人在侧——浑然不觉自己正在七窍流血。",
          qiCost: 50,
          cooldown: 4,
          damageType: "aoe_confuse",
          requirements: "天山杖法100级"
        }
      ],
      learnFrom: "丁春秋",
      minLevel: 15
    },
    {
      id: "duchao_knowledge_1",
      name: "炼毒术",
      pinyin: "liandu-shu",
      type: "knowledge",
      description: "药王谷的核心知识体系——将蛊毒的合成、培育、融合之术编撰为一套完整的灵气化炼毒法门。从毒藻培育到毒虫血脉融合，从毒性增强到靶向编法——炼毒术的每一层都对应着一种合成毒素的解锁。药王谷说「炼毒即修炼」——因为毒素的毒性越强，灌入体内后激发的抗体修为越多。",
      baseDamage: "0%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 5,
      performs: [],
      learnFrom: "丁春秋",
      minLevel: 10
    },
    {
      id: "duchao_dodge_1",
      name: "摘星身法",
      pinyin: "zhaixing-shenma",
      type: "dodge",
      description: "以微尘加速器嵌入腿部神识丛，在闪避瞬间将神识传刀速度提升300%。身法轻灵如夜风，闪避时身体几乎化为一道残影——不是因为快，而是因为毒素模糊了敌人的视觉神识。",
      baseDamage: "0%",
      baseSpeed: "125%",
      attackBonus: 0,
      defenseBonus: 10,
      performs: [],
      learnFrom: "阿紫",
      minLevel: 5
    },
    {
      id: "duchao_poison_1",
      name: "蛛网阵",
      pinyin: "zhuwang-zhen",
      type: "poison",
      description: "药王谷的独门毒技——在身周布下一张由无数微尘毒丝编织的隐形毒网。入网者不仅中毒减速，其神识灵气还会被毒丝捕获并回传给施术者——敌人的每一次肌肉收缩都在你的观照之下。",
      baseDamage: "50%",
      baseSpeed: "100%",
      attackBonus: 15,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_duchao_duwang",
          name: "毒网缠身",
          pinyin: "duwang-chanshen",
          description: "将蛛网阵收缩至极致，微尘毒丝嵌入目标全身穴位，持续造成毒系伤害并降低其所有速度属性。同时毒丝回传目标的神识灵气——你在接下来的2回合内获得对方的攻击预判能力。",
          qiCost: 65,
          cooldown: 5,
          damageType: "dot_debuff",
          requirements: "蛛网阵120级"
        },
        {
          id: "perf_duchao_dushen",
          name: "毒神附体",
          pinyin: "dushen-futi",
          description: "将体内所有毒囊同时唤醒，蛊毒涌入全身血液循环——自身进入「毒神」状态：免疫一切毒素，所有攻击附带最高等级毒性，基础伤害提升50%。持续4回合，结束后进入虚弱。",
          qiCost: 100,
          cooldown: 10,
          damageType: "super_buff",
          requirements: "蛛网阵200级，化功大法150级"
        }
      ],
      learnFrom: "李秋水",
      minLevel: 30
    }
  ],

  teachers: [
    {
      id: "t_duchao_1",
      name: "阿紫",
      title: "药王谷初级刀师",
      teaches: ["化功大法", "冥域功", "摘星手", "摘星身法"],
      requirement: "道德值≤-5000，毒素抗性≥20",
      description: "药王谷最年轻的刀师，脸上永远挂着甜美的笑容——但那双眼睛后面藏着的是一台24小时运转的毒素配方优化器灵。她喜欢用自己做实验，所以她的血液可能是药王谷所有人中最毒的一个。新人服毒仪式由她主持——她说这是「入学体检」。"
    },
    {
      id: "t_duchao_2",
      name: "丁春秋",
      title: "药王谷首席研究员",
      teaches: ["化功大法", "药王谷毒章", "天山杖法", "蛛网阵"],
      requirement: "化功大法≥60级，药王谷毒章≥60级，道德值≤-30000",
      description: "药王谷的实际掌控者，一位将半生心血倾注于「血脉腐蚀」研究的老疯子。他的丹房位于毒沼最深处，墙壁上爬满了活体毒藻——那是他的天然防御法门。他欣赏聪明人，但更欣赏狠人——「不毒则已，一毒到底」是他唯一的格言。"
    },
    {
      id: "t_duchao_3",
      name: "李秋水",
      title: "药王谷掌门",
      teaches: ["化功大法", "药王谷毒章", "冥域功", "蛛网阵", "摘星手"],
      requirement: "蛛网阵≥150级，化功大法≥180级，道德值≤-100000，门忠≥1500",
      description: "药王谷的最高掌控者，传说她的身体已经被蛊毒完全炼制——她的每一滴血、每一口呼吸、每一次心跳都是致命的生化武器。她的容貌停留在炼制之时的模样，没有人知道她在毒沼深处活了多少年。有人猜测她本身就是化功大法的活体实验最终产物——一个永远在自我突破、永不死亡的病毒宿主。"
    }
  ],

  special_system: {
    name: "炼毒法门",
    description: "药王谷的核心成长法门。在毒沼山洞中使用毒液（du ye）进行炼毒，需配备照明法器。炼毒过功中毒素与本命微尘发生链式反应，可获得修为与毒技经验。高等级毒技解锁毒虫融合——将数种毒虫血脉与自身蛊毒融合，创造出独一无二的「签名毒素」。镇妖司至今无法制造化功毒素的通用抗体——因为每个药王谷成员的毒素配方都是私有法门。",
    commands: ["liandu — 炼毒，消耗毒液获取修为", "ronghe — 融合毒虫，创造签名毒素"]
  }
},

// ==================== 门派8：血禅寺（原创·藏边高速灵根游方修士） ====================
"血禅寺": {
  name: "血禅寺",
  mud_origin: "血刀门/大轮寺",
  type: "灵装赏金猎手公会·高速灵根游方修士集团",
  description: "藏边雪域的寒风穿过峡谷，发出如镰刀割过金属的尖啸——血禅寺谷因此得名。血禅寺猎手全身覆盖暗红玄铁护甲——那不是颜料，是渗入金属晶格的真血。每猎杀一个高价值目标，便将目标的血液样本通过微尘烧结工艺融入自身护甲。额角嵌有灵根——那枚闪着血光的「血禅寺」，既是身份的象征，也是祭血超载的钥匙。",

  skills: [
    {
      id: "xuelian_force_1",
      name: "龙象频若功",
      pinyin: "longxiang-pinruocheng",
      type: "force",
      description: "源自密宗灵根燃血术的十三层修为体系。每一层代表一重神识燃血境界——从基础的「象步」到终极的「龙变」。每突破一层，灵根的雷霆承载上限翻倍，祭血之威亦随之暴增。",
      baseDamage: "130%",
      baseSpeed: "90%",
      attackBonus: 15,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_xuelian_longxiang",
          name: "龙象燃血",
          pinyin: "longxiang-chaopin",
          description: "唤醒额角灵根，将自身经脉燃血至龙象层级——力量与速度暴增，基础伤害提升50%，所有攻击附带雷霆麻痹效果。持续3回合，结束后进入神识反噬虚弱状态。",
          qiCost: 80,
          cooldown: 8,
          damageType: "super_buff",
          requirements: "龙象频若功120级"
        },
        {
          id: "perf_xuelian_13ceng",
          name: "十三龙象",
          pinyin: "shisan-longxiang",
          description: "龙象频若功第十三层终极奥义——同时唤醒全部十三层神识燃血回路，肉身迸发出肉眼可见的雷霆光晕。全属性翻倍，持续2回合。使用后灵根有概率永久受损。",
          qiCost: 150,
          cooldown: 15,
          damageType: "ultimate_buff",
          requirements: "龙象频若功200级"
        }
      ],
      learnFrom: "血禅寺老祖",
      minLevel: 0
    },
    {
      id: "xuelian_blade_1",
      name: "血刀经",
      pinyin: "xuedao-xu",
      type: "blade",
      description: "血禅寺至高刀法——将自身血液中的微尘电解质通过灵根刀入刀刃，刀刃在斩击瞬间释放过量雷霆。每一次挥刀需自损气血，但伤害与自损成正比——血禅寺教众以自身为战场，祭血释放过量雷霆斩敌。",
      baseDamage: "140%",
      baseSpeed: "105%",
      attackBonus: 20,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_xuelian_jixue",
          name: "祭血神刀",
          pinyin: "jixue-shendao",
          description: "割开额角血禅寺窍穴，将大量血液中的微尘电解质刀入刀刃——刀刃在瞬间发出刺目的电弧。伤害极高，代价是自损当前气血的30%。血禅寺猎手的信条：先伤己，再伤人。",
          qiCost: 60,
          cooldown: 4,
          damageType: "physical_sacrifice",
          requirements: "血刀经100级"
        },
        {
          id: "perf_xuelian_shendao",
          name: "频刀穿芯",
          pinyin: "pindao-chuanxin",
          description: "刀刃释放高频电气脉冲，穿透护甲直接攻击目标的经脉和灵装控制组件。无视物理防御，对傀儡灵装伤害翻倍。击中后目标短暂失去灵装控制——麒麟臂垂落、千里眼黑屏。",
          qiCost: 50,
          cooldown: 5,
          damageType: "emp_pierce",
          requirements: "血刀经120级"
        }
      ],
      learnFrom: "噬魂使",
      minLevel: 15
    },
    {
      id: "xuelian_strike_1",
      name: "活焰刀",
      pinyin: "huoyan-dao",
      type: "strike",
      description: "将灵根的燃血雷霆转化为掌心的业火热浪——每一掌挥出都带着灼烧神识的高温气流。「火焰」并非真实的火，而是反噬神识元释放的高频脉冲在空气中的电离现象。被击中者不只是烧伤——更会感受到经脉被「煮沸」的剧痛。",
      baseDamage: "120%",
      baseSpeed: "100%",
      attackBonus: 12,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_xuelian_daoqi",
          name: "活焰刀器",
          pinyin: "huoyan-daoqi",
          description: "双掌连环拍出，每掌在接触瞬间释放一次神识高频脉冲——三掌过后，目标的经脉已处于「过热」状态：所有行动延迟增加，灵装共鸣速度减半。",
          qiCost: 45,
          cooldown: 4,
          damageType: "debuff",
          requirements: "活焰刀100级"
        },
        {
          id: "perf_xuelian_ran",
          name: "活焰燃",
          pinyin: "huoyan-ran",
          description: "将掌心温度提升至业火级别，一掌拍在目标胸口——高温穿透护甲直达心脏神识节，造成巨额毒煞伤害。被击中者的核心体温瞬间上升3°C，进入「高热」状态。",
          qiCost: 70,
          cooldown: 6,
          damageType: "chemical",
          requirements: "活焰刀150级"
        }
      ],
      learnFrom: "噬魂使",
      minLevel: 10
    },
    {
      id: "xuelian_hand_1",
      name: "大手印",
      pinyin: "dashou-yin",
      type: "hand",
      description: "密宗手法在灵枢时代的进化——手掌在攻击瞬间展开隐藏的神识探针阵列，通过接触直接向目标经脉写入「真言」。不是物理打击，而是对目标灵装的身份劫持——中招者的灵装会短暂地运转你的命令。",
      baseDamage: "95%",
      baseSpeed: "110%",
      attackBonus: 8,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_xuelian_tianyin",
          name: "阿修罗天印",
          pinyin: "axiuluo-tianyin",
          description: "一掌印在目标额头，通过血禅寺窍穴向目标经脉灌入「修罗真言」——目标在2回合内敌我不分，随机攻击身边最近的单位。对高阶灵枢格效果递减。",
          qiCost: 55,
          cooldown: 6,
          damageType: "confuse",
          requirements: "大手印120级"
        }
      ],
      learnFrom: "猎头者",
      minLevel: 20
    },
    {
      id: "xuelian_claw_1",
      name: "天王爪",
      pinyin: "tianwang-zhua",
      type: "claw",
      description: "猎头者的标配灵装——五指灵装关节内嵌微型镇魂波发生器，在抓握目标头部的瞬间释放定向电气脉冲。专门攻击颈部和颅骨的灵装窍穴——一爪下去，目标的神识通道被强制回魂。",
      baseDamage: "115%",
      baseSpeed: "115%",
      attackBonus: 14,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_xuelian_liehou",
          name: "猎头",
          pinyin: "lietou",
          description: "五指锁死目标头颅，掌心镇魂波发生器全功率释放——目标神识通道强制断脉3回合，期间无法使用任何需要灵力的技能。这是血禅寺猎手的招牌终结技——做完这一招，就可以回去领赏了。",
          qiCost: 60,
          cooldown: 5,
          damageType: "silence",
          requirements: "天王爪100级"
        }
      ],
      learnFrom: "猎头者",
      minLevel: 10
    },
    {
      id: "xuelian_dodge_1",
      name: "御雪遁形",
      pinyin: "yuxue-dunxing",
      type: "dodge",
      description: "藏边雪域淬炼出的高原潜行术——在移动瞬间将体温降至环境温度，配合幽冥苔衣涂层实现视觉与热成像的双重隐形。在暴风雪中，血禅寺猎手就是雪本身。",
      baseDamage: "0%",
      baseSpeed: "120%",
      attackBonus: 0,
      defenseBonus: 14,
      performs: [
        {
          id: "perf_xuelian_xueyin",
          name: "雪隐",
          pinyin: "xueyin",
          description: "唤醒全身迷彩涂层与体温抑制法门，进入完全隐遁状态2回合。隐遁期间不可攻击，但可在下一次现身攻击时获得「先手」——无视目标闪避，必定暴击。",
          qiCost: 40,
          cooldown: 6,
          damageType: "stealth",
          requirements: "御雪遁形100级"
        }
      ],
      learnFrom: "猎头者",
      minLevel: 5
    },
    {
      id: "xuelian_hammer_1",
      name: "降伏轮",
      pinyin: "xiangfu-lun",
      type: "hammer",
      description: "五枚电气驱动的玄铁轮环套于双臂，可旋转发射——每枚轮环内置独立的追魂灵石和微型炸药。金轮在空中飞旋时发出令人恐惧的嗡鸣，那是轮缘上刻着的密宗咒文在高频振动——古老的经文在灵枢时代变成了杀人功经的载体。",
      baseDamage: "125%",
      baseSpeed: "85%",
      attackBonus: 16,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_xuelian_dazhuan",
          name: "五轮大转",
          pinyin: "wulun-dazhuan",
          description: "五枚金轮同时发射，在空中形成交错攻击网——每枚金轮独立追魂目标的不同灵装关节。一击可同时切断目标五处关剑灵穴的神识连接。",
          qiCost: 80,
          cooldown: 6,
          damageType: "multi_hit",
          requirements: "降伏轮120级"
        },
        {
          id: "perf_xuelian_wushuai",
          name: "电人五衰",
          pinyin: "dianren-wushuai",
          description: "降伏轮的终极奥义——五枚金轮在击中目标后同时引爆内置的镇魂波炸药，释放五次叠加的电气脉冲。天、人、修、行、命——五衰齐至，目标在5回合内所有属性逐回合递减。",
          qiCost: 120,
          cooldown: 10,
          damageType: "multi_emp_debuff",
          requirements: "降伏轮180级"
        }
      ],
      learnFrom: "噬魂使",
      minLevel: 25
    },
    {
      id: "xuelian_staff_1",
      name: "无上大力杵",
      pinyin: "wushang-dalichu",
      type: "staff",
      description: "一根由玄铁锻造、内嵌关节灵枢法门的巨型战杵。杵身可伸缩——收时为短棍，放时为长枪。杵头内置冲击放大器，击中目标时自动二次加速，将冲击力放大三倍。挥舞此杵需要麒麟臂以上级别的灵装——普通人一杵都举不起来。",
      baseDamage: "150%",
      baseSpeed: "70%",
      attackBonus: 22,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_xuelian_pozhen",
          name: "破阵",
          pinyin: "pozhen",
          description: "大力杵全力横扫，杵头的冲击放大器在击中瞬间加速至超音速——对目标造成巨额兵刃伤害并击退数步。对护甲和防御性灵装有额外破坏效果。",
          qiCost: 55,
          cooldown: 4,
          damageType: "physical_armor_break",
          requirements: "无上大力杵80级"
        }
      ],
      learnFrom: "血禅寺老祖",
      minLevel: 20
    },
    {
      id: "xuelian_knowledge_1",
      name: "欢喜禅",
      pinyin: "huanxi-chan",
      type: "knowledge",
      description: "密宗灵根秘术的理论基础——通过极端的神识刺激（痛苦或愉悦）突破神识通道的性能上限。欢喜禅不是享乐——是以极乐压垮经脉的自我保护机制，从而让血禅寺猎手在战斗中承受超过常人三倍的神识燃血。",
      baseDamage: "0%",
      baseSpeed: "100%",
      attackBonus: 5,
      defenseBonus: 5,
      performs: [],
      learnFrom: "血禅寺老祖",
      minLevel: 30
    }
  ],

  teachers: [
    {
      id: "t_xuelian_1",
      name: "猎头者",
      title: "血禅寺初级猎手",
      teaches: ["龙象频若功", "天王爪", "御雪遁形", "大手印"],
      requirement: "体格≥30，提交一颗指定目标的灵装心核作为投名状",
      description: "血禅寺谷最活跃的猎头者群体，他们的护甲上只有寥寥几道血纹——意味着他们的战绩簿还很薄。猎头者负责训练新人，传授基础的猎杀技能和灵装弱点识别。他们的格言是：'不要问猎物叫什么——那会让手变慢。'"
    },
    {
      id: "t_xuelian_2",
      name: "噬魂使",
      title: "血禅寺高阶猎手",
      teaches: ["龙象频若功", "血刀经", "活焰刀", "降伏轮", "无上大力杵"],
      requirement: "龙象频若功≥80级，血刀经≥60级，成功猎杀10个以上高价值目标",
      description: "血禅寺谷的中坚力量，护甲上密布着数十道不同色调的血纹——每一道都是一次成功的猎杀。噬魂使是血禅寺真正的战斗力核心，他们不再是单纯的「猎手」，而是「猎人」——他们会研究目标、制定策略、选择时机，然后一击毙命。"
    },
    {
      id: "t_xuelian_3",
      name: "血禅寺老祖",
      title: "血禅寺谷主·掌门",
      teaches: ["龙象频若功", "血刀经", "活焰刀", "降伏轮", "欢喜禅", "大手印"],
      requirement: "龙象频若功≥150级，血刀经≥150级，门忠≥2000",
      description: "血禅寺谷的绝对掌控者。老祖的真名早已无人知晓——他的护甲上覆盖着厚达数厘米的累积血纹，已经看不出原本的金属颜色。传说老祖的「龙象频若功」已突破第十三层——这意味着他的灵根可以在不间断的燃血状态下运转，每一次心跳都是对自身的一次祭血。没有人见过他亲自出手——因为值得他出手的目标早已不存在了。"
    }
  ],

  special_system: {
    name: "祭血超载法门",
    description: "血禅寺的核心战斗机制。每次使用血刀经相关技能需消耗自身气血（HP），消耗量与技能威力成正比。祭血后灵根进入「超载」状态——攻击力临时提升但持续掉血。龙象频若功层级越高，超载持续时间越长、寒气越短。当气血低于20%时，所有祭血技能自动获得50%伤害加成——「垂死之镰，最为致命」。",
    layers: {
      "13层体系": {
        "1-3层": "基础超载——祭血消耗高，伤害加成低，超载持续1回合",
        "4-6层": "进阶超载——祭血效率提升20%，超载持续2回合",
        "7-9层": "高阶超载——祭血消耗减半，超载持续3回合",
        "10-12层": "大师超载——祭血不再消耗气血而是消耗灵力，超载持续4回合",
        "13层": "龙变——祭血反而恢复气血（从敌人身上汲取），超载不结束"
      }
    }
  }
},

// ==================== 门派9：镜阁（慕容·金融/信息复合体） ====================
"镜阁": {
  name: "镜阁",
  mud_origin: "慕容世家",
  type: "灵气拳贵秘密结社·金融/信息复合体",
  description: "苏州水乡深处，一片被玄机封印罩覆盖的园林——从卫星图像上看只是普通的古典园林，实际上内部是顶级安保的封印城邦。镜阁成员着明代丝绸长袍，长袍下包裹的是六大集团尚未公开发售的军工级灵装。他们的折扇不是装饰——每把扇骨都是一组定向阵旗，展开即是一个移动灵气战平台。",

  skills: [
    {
      id: "douzhuan_force_1",
      name: "频元功",
      pinyin: "pinyuan-cheng",
      type: "force",
      description: "镜阁的核心内力心诀——以灵气反演重构灵力流动。不创造力量，而是精确测量并重定向一切进入自身灵力场的攻击灵气。练至大成可在一息之间完成对任意攻击的道韵分析、向量计算和反演输出。",
      baseDamage: "105%",
      baseSpeed: "100%",
      attackBonus: 5,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_douzhuan_hailao",
          name: "大海捞针",
          pinyin: "dahai-laozhen",
          description: "释放一组极低频探测灵气，望气周围所有隐藏的暗门、陷阱和隐遁单位。在信息不对称为王的幽冥界战场上，这一手就是镜阁的第一道护身符——知己知彼。",
          qiCost: 30,
          cooldown: 3,
          damageType: "detect",
          requirements: "频元功60级"
        }
      ],
      learnFrom: "慕容复",
      minLevel: 0
    },
    {
      id: "douzhuan_finger_1",
      name: "参合指",
      pinyin: "canhe-zhi",
      type: "finger",
      description: "指尖内置微型灵气探针，一指点出即是向目标经脉写入一段「参合真言」——这段真言会迫使目标的灵装向镜阁的灵气中心回传运行日志。既是攻击，也是情报收集。慕容世家的千年武学，在灵枢时代化为最优雅的灵气劫持术。",
      baseDamage: "100%",
      baseSpeed: "110%",
      attackBonus: 8,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_douzhuan_canshang",
          name: "参商",
          pinyin: "canshang",
          description: "双指齐出——一指灌入劫持真言，一指写入自毁代法。如果第一道真言被护体罡气拦截，第二道真言立即引动：目标的灵装心核被「参商」法门锁定，陷入永久的运转循环——回魂再回魂，直到灵力耗尽。",
          qiCost: 60,
          cooldown: 5,
          damageType: "silence_loop",
          requirements: "参合指120级"
        },
        {
          id: "perf_douzhuan_xiuzhong",
          name: "袖中指",
          pinyin: "xiuzhong-zhi",
          description: "在广袖的遮掩下无声点出一指——此招无任何预兆、无灵力波动、无灵装唤醒灵气。被击中者甚至不知道自己已被「参合」，直到三日后的灵装定期维护时才发现——日志里全是镜阁的观照记录。",
          qiCost: 35,
          cooldown: 4,
          damageType: "stealth_debuff",
          requirements: "参合指100级"
        }
      ],
      learnFrom: "慕容复",
      minLevel: 15
    },
    {
      id: "douzhuan_sword_1",
      name: "斗转家传剑法",
      pinyin: "douzhuan-jiachuan-jianma",
      type: "sword",
      description: "慕容世家传承的剑法精髓被编法为七套封印攻击法门——慕容剑法在灵枢时代的终极形态。每一剑不仅是一次物理攻击，更在接触瞬间运转一次符印灌入尝试：如果目标法门的封印相生斗转法门，则后续攻击无视50%防御。",
      baseDamage: "110%",
      baseSpeed: "105%",
      attackBonus: 10,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_douzhuan_jianyu",
          name: "七剑连环指",
          pinyin: "qijian-lianhuanzhi",
          description: "七剑连环——每剑在击中后自动为下一剑预参悟攻击向量，七剑一剑快过一剑。第七剑时攻击速度达到初始的300%，且附带「法门劫持」效果——目标被击中后短暂受镜阁心诀摆布。",
          qiCost: 70,
          cooldown: 6,
          damageType: "multi_accelerate",
          requirements: "斗转家传剑法130级"
        },
        {
          id: "perf_douzhuan_liuxing",
          name: "流星快剑",
          pinyin: "liuxing-kuaijian",
          description: "剑身加速至肉眼不可见——这一剑不是攻击，而是向目标法门灌入一个「后门」。三回合后后门唤醒，下次攻击必定暴击且无视防御。这就是镜阁的风格——不急于杀你，先确保能随时杀你。",
          qiCost: 45,
          cooldown: 5,
          damageType: "delayed_crit",
          requirements: "斗转家传剑法100级"
        }
      ],
      learnFrom: "慕容博",
      minLevel: 10
    },
    {
      id: "douzhuan_blade_1",
      name: "百家刀法",
      pinyin: "baijia-daoma",
      type: "blade",
      description: "慕容世家「以彼之道还施彼身」的刀法境界——不是独创刀法，而是将镜阁情报织络中收集的各门各派刀法参悟融合为自适应的攻击法门。对手用哪家刀法，百家刀法就用克制那家的反参悟刀法回应。",
      baseDamage: "105%",
      baseSpeed: "100%",
      attackBonus: 7,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_douzhuan_qixing",
          name: "刀影七星",
          pinyin: "daoying-qixing",
          description: "七道刀影同时斩出——其中六道是幻象投影的虚招，一道是真正的物理攻击。目标的灵装感知灵纹无法分辨真假，只能赌。而镜阁最擅长的就是让你每次都赌错。",
          qiCost: 50,
          cooldown: 4,
          damageType: "multi_confuse",
          requirements: "百家刀法100级"
        },
        {
          id: "perf_douzhuan_daoying",
          name: "刀芒剑影",
          pinyin: "daomang-jianying",
          description: "刀身在挥舞中不断切换攻击道韵——低频、中频、高频，在不到一息的时间内遍历目标灵装的共振道韵。一旦找到共振点，刀身的电气振荡会在目标内部引发毁灭性的自振崩溃。",
          qiCost: 65,
          cooldown: 5,
          damageType: "resonance",
          requirements: "百家刀法130级"
        }
      ],
      learnFrom: "慕容复",
      minLevel: 10
    },
    {
      id: "douzhuan_knowledge_1",
      name: "还施水阁",
      pinyin: "huanshi-shuige",
      type: "knowledge",
      description: "镜阁的封印情报灵气库——苏州燕子坞地下三层的灵气操控中心的核心资产。修习此知识可解锁水阁子网的访问拳限，提升所有镜阁技能的反射与劫持效率。水阁中存储着从各帮派和六部集团搜集的情报档案——知道得越多，斗转星移的威力越强。",
      baseDamage: "0%",
      baseSpeed: "100%",
      attackBonus: 3,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_douzhuan_jiechi",
          name: "灵气劫持",
          pinyin: "xinhao-jiechi",
          description: "展开折扇阵旗组，劫持半径100米内的所有无线通讯——在2回合内，范围内的敌人无法使用任何需要灵海通信的技能。这不仅是攻击——这是让对手退回「断脉模式」的终极羞辱。",
          qiCost: 60,
          cooldown: 7,
          damageType: "aoe_silence",
          requirements: "还施水阁120级"
        }
      ],
      learnFrom: "慕容博",
      minLevel: 35
    },
    {
      id: "douzhuan_dodge_1",
      name: "斗转身法",
      pinyin: "douzhuan-shenma",
      type: "dodge",
      description: "慕容世家的轻功被参悟为空间重定向心诀——在受到攻击的瞬间，身法自动计算最优闪避向量并运转。闪避动作与其说是「躲避」，不如说是被法门「重定向」到了安全坐标。优雅而精确——像一条被脉路法门完美转发的灵气包。",
      baseDamage: "0%",
      baseSpeed: "115%",
      attackBonus: 0,
      defenseBonus: 12,
      performs: [],
      learnFrom: "慕容复",
      minLevel: 5
    },
    {
      id: "douzhuan_special_1",
      name: "斗转星移",
      pinyin: "douzhuan-xingyi",
      type: "special",
      description: "慕容世家的至高绝学在灵枢时代的终极形态——在自身识海中创建反向灵气回路，将敌方的灵气攻击原路反射。攻击越强，反射越烈。这不仅是防御，更是将敌人的武器变为自己的武器——以彼之道、还施彼身。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 20,
      defenseBonus: 20,
      performs: [
        {
          id: "perf_douzhuan_yi",
          name: "星移",
          pinyin: "xingyi",
          description: "在身周开启灵气反射场——当前回合受到的所有攻击（物理/化学/灵气）均有概率被原路反射回去。反射伤害与原始伤害成正比，寒气时间随等级递减。",
          qiCost: 50,
          cooldown: 4,
          damageType: "reflect",
          requirements: "斗转星移80级"
        },
        {
          id: "perf_douzhuan_douzhuan",
          name: "斗转",
          pinyin: "douzhuan",
          description: "不仅反射攻击，还在反射的灵气包中嵌入镜阁的追魂恶意代法——攻击者在收到自己的反射伤害时，其法门同时被镜阁渗透。下一回合镜阁对该目标的伤害提升30%。",
          qiCost: 70,
          cooldown: 6,
          damageType: "reflect_infect",
          requirements: "斗转星移120级"
        },
        {
          id: "perf_douzhuan_bishen",
          name: "彼身",
          pinyin: "bishen",
          description: "斗转星移的终极形态——不反射攻击，而是完全复制对手的攻击法门并在同一回合内以彼之道还施彼身。对手用何种武功，你就用何种武功回敬——但附加了镜阁的分析优化，伤害提升20%。",
          qiCost: 90,
          cooldown: 8,
          damageType: "copy_enhance",
          requirements: "斗转星移180级，频元功150级"
        }
      ],
      learnFrom: "慕容博",
      minLevel: 30
    },
    {
      id: "douzhuan_sword_2",
      name: "柳絮剑法",
      pinyin: "liuxu-jianma",
      type: "sword",
      description: "慕容氏剑法中的轻灵路数——剑尖在空中划出的轨迹如柳絮飘飞，无迹可寻。剑身搭载微型风向感知灵纹，每一次挥剑都与环境气流完美融合，让对手的灵装运动预测心诀完全失效——预测模型里没有「柳絮」这个变量。",
      baseDamage: "95%",
      baseSpeed: "120%",
      attackBonus: 9,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_douzhuan_liuxu",
          name: "柳絮漫天",
          pinyin: "liuxu-mantian",
          description: "剑尖在空气中布下数十个微弱的灵气反射点——每一个反射点都是一个幻象假目标。对手的攻击预测法门被海量虚假运动灵气淹没，闪避率提升80%，持续2回合。",
          qiCost: 40,
          cooldown: 4,
          damageType: "evasion_buff",
          requirements: "柳絮剑法80级"
        }
      ],
      learnFrom: "慕容复",
      minLevel: 20
    }
  ],

  teachers: [
    {
      id: "t_douzhuan_1",
      name: "包不同",
      title: "镜阁外务执事",
      teaches: ["频元功", "斗转身法", "百家刀法"],
      requirement: "悟性≥25，福缘≥20，由镜阁内部成员引荐",
      description: "镜阁的外务负责人，以一口毒舌闻名于幽冥界社交圈。表面上他只是一个爱说反话的老头，实际上他的神识通道连接着镜阁的「还施水阁」子网——每一次看似随口的讥讽，都可能是一次精确的情报测试。"
    },
    {
      id: "t_douzhuan_2",
      name: "慕容复",
      title: "镜阁少主",
      teaches: ["频元功", "参合指", "斗转身法", "斗转家传剑法", "百家刀法", "柳絮剑法"],
      requirement: "频元功≥60级，参合指≥60级，门忠≥500",
      description: "慕容世家的当代少主，一位将「以彼之道还施彼身」发挥到极致的金融符修。他的每个社交账号都由器灵代理管理——而你永远分不清哪个回复是真人，哪个是心诀。他的折扇是镜阁最强的定向阵旗组，据说展开时可同时劫持方圆百米内的一切无线灵气。"
    },
    {
      id: "t_douzhuan_3",
      name: "慕容博",
      title: "镜阁掌门·还施水阁管理员",
      teaches: ["频元功", "参合指", "斗转星移", "斗转家传剑法", "百家刀法"],
      requirement: "频元功≥150级，斗转星移≥120级，门忠≥1500，经验≥1M",
      description: "慕容世家的幕后掌控者，也是镜阁「还施水阁」子网的最高管理员。传说他的意识已经部分刻录到了水阁的玄机灵枢中——这意味着他几乎掌握了大明每个拳贵的把柄。他极少露面，但苏州燕子坞的每一片树叶的颤动都在他的观照之下。"
    }
  ],

  special_system: {
    name: "斗转星移·灵气反射法门",
    description: "镜阁的核心战斗机制。在受到任何攻击时，斗转星移自动进行道韵分析，并根据技能等级概率反射攻击。反射灵气包中自动嵌入恶意代法——攻击者在收到反射伤害的同时，其法门被镜阁渗透。层级越高，反射概率越高、反射伤害比例越大、嵌入恶意代法越隐蔽。",
    levels: {
      "1-80级": "反射概率15%，反射伤害30%",
      "81-120级": "反射概率25%，反射伤害50%，轻微恶意代法嵌入",
      "121-180级": "反射概率40%，反射伤害70%，中度恶意代法嵌入",
      "181+级": "反射概率60%，反射伤害100%，深度恶意代法嵌入+可复制对手技能"
    }
  }
},

// ==================== 门派10：归墟（古墓·鬼市/情报灵穴） ====================
"归墟": {
  name: "归墟",
  mud_origin: "古墓派",
  type: "鬼市·地下渗透组织",
  description: "终南山脉地下深处，一段被历史遗忘的明代军事隧道织络——总长度据保守估计超过300公里。归墟成员在黑暗中无声移动，灵装表面覆盖液态幽冥苔衣皮肤，移动时没有关节灵枢的嗡鸣——他们以冷融合静音关节牺牲力量换取完全的寂静。进入、运转、消失——没有人知道他们来过。",

  skills: [
    {
      id: "yingmu_force_1",
      name: "玉女心经",
      pinyin: "yunv-xinma",
      type: "force",
      description: "归墟女性成员的专属内力法门——将情感波动参悟为灵力输出法门。心如止水则内息平稳，情丝波动则内息如潮。修习至高深处可进入「静默法门」——全身灵气特征压缩至背景噪音以下，如同从世界上消失。",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_yingmu_xinjing",
          name: "心经",
          pinyin: "xinjing",
          description: "唤醒玉女心经中的「静默法门」——攻击力、防御力、身法、悟性全面提升30%。女性角色唤醒此术效果翻倍。在归墟的哲学中，「静」不是无力——是最极致的蓄力。",
          qiCost: 50,
          cooldown: 5,
          damageType: "buff",
          requirements: "玉女心经100级"
        }
      ],
      learnFrom: "小龙女",
      minLevel: 0
    },
    {
      id: "yingmu_force_2",
      name: "九经心经",
      pinyin: "jiuxu-pincheng",
      type: "force",
      description: "源自上古「九阴」密典的灵枢化境界——以九层经列法门逐层解禁经脉的限制器。每一层解禁释放一部分被大脑主动抑制的潜能。男性归墟成员以此为主修内功——因为玉女心经对男性有天然的性能削减。",
      baseDamage: "120%",
      baseSpeed: "100%",
      attackBonus: 10,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_yingmu_yihun",
          name: "移魂",
          pinyin: "yihun",
          description: "释放一组道韵经过精密调制的神识干扰灵气，直接写入目标的感觉皮层——目标陷入「魂不守舍」状态：无法行动、无法使用技能，持续2回合。唤醒条件是被攻击。",
          qiCost: 60,
          cooldown: 6,
          damageType: "stun",
          requirements: "九经心经120级"
        }
      ],
      learnFrom: "杨过",
      minLevel: 20
    },
    {
      id: "yingmu_cuff_1",
      name: "美女拳",
      pinyin: "meinv-quan",
      type: "cuff",
      description: "看似柔美如舞蹈的拳法——实则每一招都暗藏「拳限提升」攻击，以精妙的角度绕过目标神识护体罡气直击意识核心。拳路设计利用了人体工学中的认知盲区——对手的大脑在处理这些动作时会产生50ms的延迟，而这50ms就是生死的距离。",
      baseDamage: "100%",
      baseSpeed: "115%",
      attackBonus: 7,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_yingmu_shexin",
          name: "摄心",
          pinyin: "shexin",
          description: "美女拳的精髓——三连击的每一击都在向目标视觉法门灌入「心理暗示灵气包」：第一击削弱战意，第二击模糊判断，第三击嵌入恐惧。三击全中则目标陷入「失魂」状态——攻击命中率下降50%。",
          qiCost: 45,
          cooldown: 4,
          damageType: "mental_debuff",
          requirements: "美女拳100级"
        }
      ],
      learnFrom: "小龙女",
      minLevel: 5
    },
    {
      id: "yingmu_strike_1",
      name: "黯然销魂章",
      pinyin: "anran-xiaohun-zhang",
      type: "strike",
      description: "以极致的悲伤和绝望情绪驱动的掌法——受伤越重，威力越强。每损失10%气血，掌力增加8%。这不是一种秘术，而是一个以「痛苦」为输入参数的情感驱动攻击法门——越是痛不欲生，输出功率越高。",
      baseDamage: "130%",
      baseSpeed: "85%",
      attackBonus: 15,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_yingmu_anran",
          name: "黯然",
          pinyin: "anran",
          description: "将全身的绝望和痛苦在一掌中尽数释放。当前气血越低，伤害倍率越高——气血低于20%时，伤害提升至250%。掌风过处，连空气中的尘埃都似乎凝滞了一瞬——那不是武侠小说的抒情，是高温业火体电离空气的物理现象。",
          qiCost: 70,
          cooldown: 5,
          damageType: "chemical_despair",
          requirements: "黯然销魂章120级"
        }
      ],
      learnFrom: "杨过",
      minLevel: 30
    },
    {
      id: "yingmu_sword_1",
      name: "玉女剑法",
      pinyin: "yunv-jianma",
      type: "sword",
      description: "归墟至高剑法——双剑合璧时引动「玉女素心剑法」：两把剑的神识参悟功经通过封印通道实时同调，每一次出剑都是双方灵力的叠加。单独使用时已是顶尖剑法，双剑合璧时——不是1+1=2，而是攻击道韵翻倍、伤害翻倍、命中翻倍。",
      baseDamage: "115%",
      baseSpeed: "110%",
      attackBonus: 12,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_yingmu_suxin",
          name: "素心",
          pinyin: "suxin",
          description: "双剑合璧——需要与另一名归墟成员组队释放。双剑交替攻击，攻击道韵翻倍，每次攻击独立计算暴击。双人时二人共享技能寒气缩减——彼此的剑在信息层面是一体的。",
          qiCost: 80,
          cooldown: 6,
          damageType: "dual_combo",
          requirements: "玉女剑法130级"
        }
      ],
      learnFrom: "小龙女",
      minLevel: 10
    },
    {
      id: "yingmu_dodge_1",
      name: "捕雀功",
      pinyin: "buque-cheng",
      type: "dodge",
      description: "归墟基础轻功——将移动路径计算为概率分布函数，在每一步移动前预测所有可能的威胁向量并实时选择最低概率被命中的路径。闪避不是在「躲」，而是在解一道不断变化的最优路径问题——在数学层面，你永远不会出现在最可能被击中的位置。",
      baseDamage: "0%",
      baseSpeed: "120%",
      attackBonus: 0,
      defenseBonus: 10,
      performs: [],
      learnFrom: "小龙女",
      minLevel: 0
    },
    {
      id: "yingmu_dodge_2",
      name: "暗影身法",
      pinyin: "anying-shenma",
      type: "dodge",
      description: "归墟高阶轻功——在移动时唤醒全身液态幽冥苔衣涂层，配合体温抑制器和灵气消除装置，实现视觉、红外、雷达三维隐遁。不是跑得快，而是跑得「没有了」——在离开原地的那一刻，你已从所有已知的探测方式中消失。",
      baseDamage: "0%",
      baseSpeed: "110%",
      attackBonus: 5,
      defenseBonus: 15,
      performs: [
        {
          id: "perf_yingmu_wuhen",
          name: "无痕",
          pinyin: "wuhen",
          description: "唤醒全套隐遁法门——幽冥苔衣、红外抑制、灵气消除同时运转。进入完全隐遁状态2回合，隐遁期间可移动和准备但不能攻击。现身时的第一击必定暴击。",
          qiCost: 45,
          cooldown: 6,
          damageType: "stealth",
          requirements: "暗影身法100级"
        }
      ],
      learnFrom: "杨过",
      minLevel: 25
    },
    {
      id: "yingmu_whip_1",
      name: "长恨编法",
      pinyin: "changhen-bianma",
      type: "whip",
      description: "鞭法中暗藏封印灵气灌入刀管——每一次鞭声响起，都是一段封印代法通过空气震动传向目标。鞭梢内嵌的微型探针在接触皮肤瞬间灌入灵气包，不伤皮肉却已劫持了皮下灵装的灵根。恨意不是情绪——是鞭法中最有效的封印符印。",
      baseDamage: "100%",
      baseSpeed: "105%",
      attackBonus: 8,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_yingmu_hen",
          name: "恨",
          pinyin: "hen",
          description: "一鞭抽出，鞭身在空中划出封印灵气的波形——被击中者陷入「愤恨」状态：强制攻击释放者，但每次攻击命中后自身也承受一定比例的反伤。以彼之恨，攻彼之心。",
          qiCost: 50,
          cooldown: 4,
          damageType: "taunt_thorns",
          requirements: "长恨编法100级"
        }
      ],
      learnFrom: "小龙女",
      minLevel: 15
    },
    {
      id: "yingmu_special_1",
      name: "银索金铃",
      pinyin: "yinsuo-jinling",
      type: "special",
      description: "银索为鞭，金铃为灵气发射器——每一枚金铃都是一颗特制的定向干扰弹头。银索挥出时金铃齐鸣，发出特定道韵的干扰灵气——这个道韵恰好是大多数灵装关节灵枢的共振道韵。听到铃声的敌人，其灵装共鸣速度下降30%。",
      baseDamage: "95%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_yingmu_suo",
          name: "锁",
          pinyin: "suo",
          description: "银索缠绕目标，金铃释放最强干扰道韵——目标被「锁」在原地无法移动，且灵装共鸣持续下降。这是归墟最优雅的控制技——不是靠蛮力锁住你，而是让你的灵装认为你已经不能动。",
          qiCost: 55,
          cooldown: 5,
          damageType: "root_debuff",
          requirements: "银索金铃100级"
        }
      ],
      learnFrom: "小龙女",
      minLevel: 20
    }
  ],

  teachers: [
    {
      id: "t_yingmu_1",
      name: "小龙女",
      title: "归墟寒玉区刀师",
      teaches: ["玉女心经", "美女拳", "玉女剑法", "捕雀功", "长恨编法", "银索金铃"],
      requirement: "定力≥30，容貌≥25，经验≤500000时方可拜入",
      description: "归墟寒玉区的管理者，一位在终南山地下冰窟中修炼了二十年的女符修。她的皮肤因长期缺乏日照而苍白得近乎透明——皮下隐约可见灵液寒气管道的微光。她的话语极少，每一句都是精确的信息传递，从不有冗余——就像她写的代法。"
    },
    {
      id: "t_yingmu_2",
      name: "杨过",
      title: "归墟断臂区刀师",
      teaches: ["九经心经", "黯然销魂章", "暗影身法"],
      requirement: "九经心经≥80级，黯然销魂章≥60级，经历至少一次重大失败或损失",
      description: "归墟唯一的男性高级刀师。他的右臂灵装是整个归墟最特殊的灵装——不是替换，是进化。断臂处接驳的傀儡臂内置了冷融合静音关节和单分子振动刀，但最可怕的是它连接着一套独立的神识参悟法门——他的右臂和大脑之间有一套私有的封印通讯法门，任何人都无法劫持。"
    },
    {
      id: "t_yingmu_3",
      name: "林朝英",
      title: "归墟掌门·终南隧道守护者",
      teaches: ["玉女心经", "九经心经", "玉女剑法", "黯然销魂章"],
      requirement: "玉女心经≥180级，玉女剑法≥180级，门忠≥2500，完成「入墓」试炼",
      description: "归墟的创始者——或者说，创始者的意识副本。真正的林朝英早已不在人世，但她将自己的意识编法并刻录至终南山地下最深处的玄机灵枢中。她以幻象投影形态出现在归墟最隐秘的殿堂里——面容栩栩如生，声音如三十年前的录音。没有人知道她的意识副本还能运行多久。"
    }
  ],

  special_system: {
    name: "静默法门·灵气消除法门",
    description: "归墟的核心能力——通过玉女心经唤醒的「静默法门」，将灵装的所有电气灵气、热灵气、声学灵气压缩到背景噪音级别以下。唤醒期间无法主动攻击，但也几乎不可能被任何已知感知灵纹探测。在渗透任务中，静默法门是归墟成员活着进出的唯一保障。",
    silent_levels: {
      "1-60级": "灵气压缩至50%，红外可见，雷达可见",
      "61-120级": "灵气压缩至25%，红外微弱，雷达微弱",
      "121-180级": "灵气压缩至10%，红外不可见，雷达不可见",
      "181+级": "灵气压缩至0.1%，完全隐遁——天道罗网的玄机雷达也无法锁定"
    }
  }
},

// ==================== 门派11：药王谷（峨眉·生物符修医疗教团） ====================
"青囊庐": {
  name: "青囊庐",
  mud_origin: "峨眉派",
  type: "生物符修医疗教团",
  description: "川蜀深山中，一片被竹林环绕的纯白无菌丹房群落——宛如灵枢时代的世外桃源。药王谷医师穿的不是刀术服而是灵蚕丝白袍，袍面流动着实时显示患者生命体征的灵气纹。她们的手是精密到分子级别的微尘刀术平台——指尖可同时运转12种医疗功经。治愈是最高形式的符修行为：攻击只需一个破绽，修复需要理解整个架构。",

  skills: [
    {
      id: "yaowang_force_1",
      name: "临济十二庄",
      pinyin: "linji-shierzhuang",
      type: "force",
      description: "青囊庐至高内功——临济禅院的十二种「庄法」实为十二套针对不同生理法门的微尘医疗法门。六种主力庄法（大小/风云/洞鹤/天地/幽冥/之心）各管一种灵装维护模式。是药王谷女尼的立足之本，也是幽冥界最昂贵的医疗IP。",
      baseDamage: "105%",
      baseSpeed: "100%",
      attackBonus: 5,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_yaowang_daxiao",
          name: "大小庄",
          pinyin: "daxiao-zhuang",
          description: "唤醒微尘医疗集群进行群体治疗——向周围所有友方单位传讯「大小庄」修复法门，每回合恢复一定气血。在团体战中，药王谷女尼就是一座移动的灵装维修站。",
          qiCost: 60,
          cooldown: 4,
          damageType: "aoe_heal",
          requirements: "临济十二庄80级"
        },
        {
          id: "perf_yaowang_fengyun",
          name: "风云庄",
          pinyin: "fengyun-zhuang",
          description: "本命微尘灌入肌肉纤维进行临时强化——身法与反应速度大幅提升。庄法持续期间，闪避率提升40%，灵装共鸣延迟降低50%。云从龙、风从虎——灵枢化后的风云，是从灵海中借来的狂风。",
          qiCost: 45,
          cooldown: 5,
          damageType: "speed_buff",
          requirements: "临济十二庄100级"
        },
        {
          id: "perf_yaowang_tiandi",
          name: "天地庄",
          pinyin: "tiandi-zhuang",
          description: "临济十二庄最实用的庄法——在微尘层面优化灵装灵力管理回路，使所有技能的微尘灵力消耗降低至零。加力不耗内、发招不耗蓝。持续3回合——这3回合内，你就是一台永动机。",
          qiCost: 80,
          cooldown: 8,
          damageType: "super_buff",
          requirements: "临济十二庄150级"
        },
        {
          id: "perf_yaowang_youming",
          name: "幽冥庄",
          pinyin: "youming-zhuang",
          description: "将本命微尘刀入「幽冥」模式——不参与任何外部战斗，而是潜入肌骨核深处对DNA血脉进行精确修复。唤醒时不可战斗，但可永久提升先天属性。是药王谷最珍贵的自我升级法器——据说每次幽冥庄运行，都相当于一次微型进化。",
          qiCost: 100,
          cooldown: 20,
          damageType: "permanent_buff",
          requirements: "临济十二庄180级"
        },
        {
          id: "perf_yaowang_zhixin",
          name: "之心庄",
          pinyin: "zhixin-zhuang",
          description: "本命微尘优化神识通道的神识连接脉宽——悟性大幅提升，所有知识类技能修炼速度翻倍。庄法唤醒时，使用者瞳孔中闪过一阵天蓝色的灵气流——那是数以亿计的新突触正在建立连接。",
          qiCost: 50,
          cooldown: 10,
          damageType: "wisdom_buff",
          requirements: "临济十二庄120级"
        }
      ],
      learnFrom: "灭绝师太",
      minLevel: 0
    },
    {
      id: "yaowang_force_2",
      name: "九经心经",
      pinyin: "jiuxu-pincheng",
      type: "force",
      description: "九层经列法门——与归墟同源的古老密典在药王谷被重新参悟为医疗级应用。在药王谷手上，九经心经的主要用途不是攻击，而是「移魂」——一种精密的神识干扰秘术，可将目标的精神状态从「战斗」重置为「平静」。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_yaowang_yihun",
          name: "移魂",
          pinyin: "yihun",
          description: "释放一组精密调制的神识安抚道韵——目标进入「移魂」状态：攻击欲望大幅降低，所有技能寒气时间延长。药王谷的境界更温和、更持久——毕竟是用来「治疗」的，不是用来「杀敌」的。",
          qiCost: 50,
          cooldown: 5,
          damageType: "pacify",
          requirements: "九经心经100级"
        }
      ],
      learnFrom: "文虚师太",
      minLevel: 15
    },
    {
      id: "yaowang_force_3",
      name: "药王九阳功",
      pinyin: "yaowang-jiuyang-cheng",
      type: "force",
      description: "药王谷在「九阳」本源基础上加入微尘医学改进的独门内功。兼具九阳的浑厚与药王谷的精密——内力恢复速度比普通内功快40%，同时对毒素和生物武器的免疫力大幅提升。「明灯」之术可驱散一切负面状态。",
      baseDamage: "115%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_yaowang_mingdeng",
          name: "明灯",
          pinyin: "mingdeng",
          description: "体内本命微尘群释放「净化脉冲」——清除自身及周围友方单位的一切负面状态（中毒、麻痹、混乱、虚弱）。脉冲灵力源自药王谷的微尘储备——每一次明灯都是对自身修为的一次「大扫除」。",
          qiCost: 55,
          cooldown: 5,
          damageType: "cleanse",
          requirements: "药王九阳功100级"
        }
      ],
      learnFrom: "灭绝师太",
      minLevel: 25
    },
    {
      id: "yaowang_strike_1",
      name: "金顶绵章",
      pinyin: "jinding-mianzhang",
      type: "strike",
      description: "掌力看似绵柔如絮，实则掌中微尘探针在接触瞬间完成对目标经脉的完整诊断——然后精确选择最脆弱的灵穴释放冲击。绵里藏针不是形容——每一掌都挟带着数以万计的微尘级「针」，在目标体内寻找并刺穿每一个神识破绽。",
      baseDamage: "100%",
      baseSpeed: "105%",
      attackBonus: 7,
      defenseBonus: 4,
      performs: [],
      learnFrom: "文虚师太",
      minLevel: 10
    },
    {
      id: "yaowang_finger_1",
      name: "电罡指",
      pinyin: "diangang-zhi",
      type: "finger",
      description: "指尖释放一道极细的电气脉冲束，精确命中目标穴位——在灵枢化的语境中，「穴位」即经脉的关剑灵穴IP。被点中者对应灵装组件临时下线，如同一座城市的某个区域被精准断电。",
      baseDamage: "95%",
      baseSpeed: "115%",
      attackBonus: 6,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_yaowang_lingkong",
          name: "凌空指穴",
          pinyin: "lingkong-zhixue",
          description: "隔空点穴的灵枢境界——指尖释放聚焦电气脉冲，在十步之外精确命中目标的神识关剑灵穴。目标灵装共鸣被强制降级，所有技能释放延迟增加。命中率和持续时间随电罡指等级提升。",
          qiCost: 45,
          cooldown: 4,
          damageType: "paralyze",
          requirements: "电罡指120级"
        }
      ],
      learnFrom: "灭绝师太",
      minLevel: 20
    },
    {
      id: "yaowang_hand_1",
      name: "截手九式",
      pinyin: "jieshou-jiushi",
      type: "hand",
      description: "九式手法，每一式对应一种「截断」——截气血、截内力、截灵装通讯、截神识灵气。不是攻击，而是精确的「刀术式切断」——在战场上，截手九式的作用是为后续的大招创造「干净」的刀术野。",
      baseDamage: "90%",
      baseSpeed: "120%",
      attackBonus: 5,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_yaowang_foguang",
          name: "佛光普照",
          pinyin: "foguang-puzhao",
          description: "截手九式的终极合击——九式合一，双掌齐推，掌中微尘探针阵列以太阳辐射的模式向目标倾泻诊断/攻击双重灵气。造成的伤害类型为「化学」——因为这本质上是一次微尘层面的精确外科刀术，只不过切口开在了敌人的全身。",
          qiCost: 65,
          cooldown: 5,
          damageType: "chemical",
          requirements: "截手九式130级"
        }
      ],
      learnFrom: "文虚师太",
      minLevel: 15
    },
    {
      id: "yaowang_sword_1",
      name: "回锋拂柳剑",
      pinyin: "huifeng-fuliu-jian",
      type: "sword",
      description: "药王谷至高剑法——剑身搭载生物感知灵纹阵列，在挥剑时实时分析目标的生理灵气（心率、肾上腺素、神识唤醒模式）并动态调整剑路。如春风拂柳——看似轻柔不可捉摸，实则每一剑都精确落在目标防御最薄弱的那一帧。",
      baseDamage: "110%",
      baseSpeed: "110%",
      attackBonus: 12,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_yaowang_miejian",
          name: "灭剑",
          pinyin: "miejian",
          description: "药王谷最强控制技——一剑刺出，剑身的生物感知灵纹在击中前完成对目标经脉最脆弱灵穴的诊断，然后剑尖释放精确的镇魂波脉冲将其击溃。命中后目标所有灵装技能被封禁2回合，这是幽冥界最令人恐惧的「一剑静默」。",
          qiCost: 75,
          cooldown: 6,
          damageType: "silence",
          requirements: "回锋拂柳剑150级"
        },
        {
          id: "perf_yaowang_fuliu",
          name: "拂柳",
          pinyin: "fuliu",
          description: "剑势如微风拂柳——连续五剑，每剑命中后为下一剑预加载目标的生理灵气。第五剑时伤害加成达到最高，且附带「神识疲惫」效果——目标闪避率逐剑递减。",
          qiCost: 55,
          cooldown: 4,
          damageType: "combo_debuff",
          requirements: "回锋拂柳剑100级"
        },
        {
          id: "perf_yaowang_huifeng",
          name: "回锋",
          pinyin: "huifeng",
          description: "一剑刺出后剑路突然折返——不是因为手腕变化，而是因为剑身的生物感知灵纹在击中瞬间发现了比原定目标更脆弱的次生灵穴。剑路实时重定向——就像刀弹在空中改变目标。",
          qiCost: 50,
          cooldown: 3,
          damageType: "pierce_redirect",
          requirements: "回锋拂柳剑120级"
        },
        {
          id: "perf_yaowang_juejian",
          name: "绝剑",
          pinyin: "juejian",
          description: "灭剑的终极强化版——当目标气血低于30%时引动「绝剑」效果：灭剑伤害翻倍，沉默时间翻倍。药王谷女尼不嗜杀——但当真要杀时，一剑封喉，绝不留情。",
          qiCost: 90,
          cooldown: 8,
          damageType: "execute",
          requirements: "回锋拂柳剑200级"
        }
      ],
      learnFrom: "灭绝师太",
      minLevel: 20
    },
    {
      id: "yaowang_blade_1",
      name: "雁行刀",
      pinyin: "yanxing-dao",
      type: "blade",
      description: "刀法如雁阵飞行——双刀齐出时刀路成双轨并行，一把刀负责攻击，另一把刀同时望气目标反应并将灵气实时传回主刀。与回锋拂柳剑互备时可引动「刀芒剑影」——刀剑合一，攻击力再攀一阶。",
      baseDamage: "105%",
      baseSpeed: "105%",
      attackBonus: 8,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_yaowang_heji",
          name: "刀芒剑影",
          pinyin: "daomang-jianying",
          description: "刀剑合璧——雁行刀与回锋拂柳剑同时唤醒，刀芒与剑影在空中交织为一道攻击矩阵。造成两次独立计算的伤害（一次刀、一次剑），且第二次伤害享受第一次命中后的加成。这就是药王谷的「双向诊断」——刀探路、剑刀术。",
          qiCost: 75,
          cooldown: 5,
          damageType: "dual_chemical",
          requirements: "雁行刀120级，回锋拂柳剑120级"
        }
      ],
      learnFrom: "灭绝师太",
      minLevel: 15
    },
    {
      id: "yaowang_dodge_1",
      name: "诸电化身法",
      pinyin: "zhudian-huashen-ma",
      type: "dodge",
      description: "青囊庐独门轻功——闪避时在移动路径上留下数以百计的微尘医疗微尘。闪避成功不仅避免伤害，还将从空气中回收的动能转化为微尘灵力储备——闪得越多，灵力越满。这就是药王谷的「以退为进」。",
      baseDamage: "0%",
      baseSpeed: "115%",
      attackBonus: 0,
      defenseBonus: 12,
      performs: [
        {
          id: "perf_yaowang_huashen",
          name: "化身",
          pinyin: "huashen",
          description: "闪避成功时，在移动路径上留下一个由微尘微尘构成的幻象分身——分身继承当前气血的30%，可吸引敌人攻击2回合。每一次闪避都是一次「分身备份」——药王谷女尼，永远不止一人。",
          qiCost: 40,
          cooldown: 5,
          damageType: "clone",
          requirements: "诸电化身法100级"
        }
      ],
      learnFrom: "文虚师太",
      minLevel: 5
    },
    {
      id: "yaowang_throwing_1",
      name: "霹雳弹",
      pinyin: "pili-dan",
      type: "throwing",
      description: "药王谷出品的微型镇魂波手雷——不是火药，而是微尘灵玉超载后释放的电气脉冲。投掷后在目标区域炸开，对区域内所有目标造成镇魂伤害——傀儡灵装越多，伤害越高。据说霹雳弹的配方源自药王谷与药王谷的一次「秘术交流」——但双方都不承认。",
      baseDamage: "120%",
      baseSpeed: "90%",
      attackBonus: 10,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_yaowang_tan",
          name: "弹",
          pinyin: "tan",
          description: "弹指射出三枚霹雳弹——三弹在空中自动分散为三角阵型覆盖目标区域。爆炸后叠加释放三重镇魂波脉冲，对傀儡灵装的伤害和瘫痪效果逐次递增。这是药王谷最不像「药」的技能——但在战场上，最好的药就是让敌人再也站不起来。",
          qiCost: 65,
          cooldown: 6,
          damageType: "aoe_emp",
          requirements: "霹雳弹120级"
        }
      ],
      learnFrom: "灭绝师太",
      minLevel: 25
    },
    {
      id: "yaowang_knowledge_1",
      name: "大乘涅磐功",
      pinyin: "dacheng-niepan-cheng",
      type: "knowledge",
      description: "青囊庐的精神修炼体系——「大乘」是医疗微尘集群的最高等级协同法门，「涅磐」是生命体在极端损伤后的法门级恢复流功。修习此功可大幅提升气血上限，并解锁药王谷最核心的「法门还原」秘术——在肌骨层面创建生物状态检查点。",
      baseDamage: "0%",
      baseSpeed: "100%",
      attackBonus: 3,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_yaowang_huan",
          name: "法门还原",
          pinyin: "xitong-huanyuan",
          description: "药王谷的终极急救术——唤醒预植的生物微尘标记物，在30秒内将目标全身肌骨状态回滚至最近的安全检查点。效果等同「起死回生」——但每次消耗巨量微尘储备，且还原后丢失检查点之后的所有记忆。",
          qiCost: 150,
          cooldown: 20,
          damageType: "revive",
          requirements: "大乘涅磐功150级，临济十二庄150级"
        }
      ],
      learnFrom: "灭绝师太",
      minLevel: 30
    }
  ],

  teachers: [
    {
      id: "t_yaowang_1",
      name: "文虚师太",
      title: "青囊庐初级刀师",
      teaches: ["临济十二庄", "金顶绵章", "截手九式", "诸电化身法", "九经心经"],
      requirement: "女性，悟性≥25，根骨≥20",
      description: "青囊庐入门弟子的引路人。文虚师太的指尖医疗平台上永远显示着新弟子的生命体征——她在教学的同时实时监测每个学生的健康状态。她的格言是：「先学会治疗自己，再学会治疗别人，最后才学如何让敌人需要治疗。」"
    },
    {
      id: "t_yaowang_2",
      name: "灭绝师太",
      title: "青囊庐首席医师",
      teaches: ["临济十二庄", "药王九阳功", "电罡指", "回锋拂柳剑", "雁行刀", "霹雳弹", "大乘涅磐功"],
      requirement: "临济十二庄≥100级，回锋拂柳剑≥80级，门忠≥500",
      description: "青囊庐的实际掌控者——一位在血脉治疗和灵装修复两个领域都达到了顶峰的医学符修。灭绝师太的名字不是形容她的残忍，而是形容她面对「医学难题」时的决绝态度——「治不好的，不要拖。能治的，绝不留到明天。」她的神识刀术平台「倚天」是药王谷最强的医疗法器——据说能在一次心跳内完成一台完整的心脏灵装置换。"
    },
    {
      id: "t_yaowang_3",
      name: "药王祖师",
      title: "青囊庐掌门·终极医师",
      teaches: ["临济十二庄", "药王九阳功", "大乘涅磐功", "回锋拂柳剑", "电罡指"],
      requirement: "临济十二庄≥200级，大乘涅磐功≥180级，门忠≥3000，完成「法门还原」实操",
      description: "青囊庐的创始者——或者说，药王谷医疗器灵的最高拳限管理员。药王祖师的身份是一个谜：有人说她早已将意识刻录到了药王谷的中央医疗主机，有人说她是一个世代传承的称号而非特定个人。但有一点是确定的——任何在她面前倒下的伤员，只要还有一纳克的本命微尘存活，她就能将其从死亡线上拉回来。"
    }
  ],

  special_system: {
    name: "法门还原·生物检查点",
    description: "青囊庐的终极医疗秘术——通过预植的生物微尘标记物，为目标创建实时生理状态备份（检查点）。当目标遭受致命损伤时，唤醒还原法门将全身肌骨状态回滚至最近的检查点。每次还原消耗大量微尘储备和患者体力。检查点有效期12小时——过期自动清除。这就是药王谷在幽冥界享有「中立医疗豁免拳」的原因：任何一个帮派都可能在某天需要一次法门还原。",
    requirements: "大乘涅磐功≥150级，临济十二庄≥150级"
  }
},

// ==================== 门派12：傀坊（桃花岛·自主机器人公社） ====================
"傀坊": {
  name: "傀坊",
  mud_origin: "桃花岛",
  type: "自主机器人公社",
  description: "东海之上，一座被浓雾和电气干扰罩环绕的人工岛。天空中永远飘浮着数百架处于待机状态的攻击无人机——远远看去像一群傀儡海鸥。岛上一切都是自动化的：从零件锻造到组装到测试，由器灵调度法门「黄药师」统一管理。肉身是1.0境界——傀儡是2.0：可替换、可升级、可量产。弹指之间，可召唤一支军队。",

  skills: [
    {
      id: "jiqiao_force_1",
      name: "碧骇心经",
      pinyin: "bihai-pincheng",
      type: "force",
      description: "傀坊至高内功——将东海潮汐的力学模型参悟为内力循环心诀。潮起则攻、潮落则守，内力流转如骇客在织络深层中穿行的灵气包——永远在最隐蔽的路径上以最高效率传输。「碧骇」二字，海之碧是表象，骇之深才是本质。",
      baseDamage: "115%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_jiqiao_qimen",
          name: "奇门迷阵",
          pinyin: "qimen-mizhen",
          description: "运转碧骇心经中的「奇门」子功经——在身周投射一套幻象迷阵，自身位置在迷阵中不断变换，目标的所有攻击有概率偏离。同时奇门迷阵会持续分析敌人的攻击模式——分析得越多，后续奇门的效果越强。",
          qiCost: 55,
          cooldown: 5,
          damageType: "confuse_field",
          requirements: "碧骇心经100级"
        },
        {
          id: "perf_jiqiao_powerup",
          name: "潮生",
          pinyin: "chaosheng",
          description: "以东海潮汐共振模型驱动内力循环——攻击力与防御力同时提升，持续3回合。潮起时攻如排山倒海，潮落时守如礁石岿然。效果随奇门八卦等级提升。",
          qiCost: 50,
          cooldown: 5,
          damageType: "buff",
          requirements: "碧骇心经80级"
        }
      ],
      learnFrom: "黄药师",
      minLevel: 0
    },
    {
      id: "jiqiao_strike_1",
      name: "落英剑法章",
      pinyin: "luoying-pinjian-zhang",
      type: "strike",
      description: "掌法如桃花岛上落英缤纷——每一掌在空中划过的轨迹都是不可预测的。掌力中嵌入微型无人机控制灵气：一掌劈空之时，已有三架袖珍攻击无人机悄然飞抵目标视野死角。「落英」不是花瓣——是无人机群的攻击灵气在空气中留下的电离尾迹。",
      baseDamage: "110%",
      baseSpeed: "105%",
      attackBonus: 10,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_jiqiao_pikong",
          name: "劈空",
          pinyin: "pikong",
          description: "一掌凌空劈出——掌心释放定向冲击波，配合暗中唤醒的三架微型无人机从目标背后同时发动攻击。目标感受到的是一掌一掌的正面掌力，实则四面楚歌——毒煞伤害无视物理防御。需解封后方可习得。",
          qiCost: 70,
          cooldown: 5,
          damageType: "chemical",
          requirements: "落英剑法章150级，奇门八卦100级"
        }
      ],
      learnFrom: "黄药师",
      minLevel: 15
    },
    {
      id: "jiqiao_hand_1",
      name: "兰花拂穴手",
      pinyin: "lanhua-fuxue-shou",
      type: "hand",
      description: "手法优雅如拈花——指尖内嵌微型神识干扰探针，轻拂敌人穴位（神识关剑灵穴IP）时不破皮不伤肉，却已将「拂穴真言」写入目标经脉。兰花不是花——是指尖释放干扰灵气时空气被电离产生的淡蓝色辉光。",
      baseDamage: "85%",
      baseSpeed: "130%",
      attackBonus: 5,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_jiqiao_fuxue",
          name: "拂穴",
          pinyin: "fuxue",
          description: "兰花般轻柔地拂过目标身上的关剑神识灵穴——不造成兵刃伤害，但目标的气势（战斗资源）被限制在极低水平，无法释放高消耗技能。效果持续3回合——这3回合内，敌人就像被拔了牙的毒蛇。",
          qiCost: 40,
          cooldown: 4,
          damageType: "resource_lock",
          requirements: "兰花拂穴手120级"
        }
      ],
      learnFrom: "陆乘风",
      minLevel: 10
    },
    {
      id: "jiqiao_finger_1",
      name: "弹指频通",
      pinyin: "tanzhi-pintong",
      type: "finger",
      description: "傀坊的标志性技能——一个弹指动作，实际是通过指尖内置的灵根向无人机蜂群发送攻击真言。在外人看来只是一弹指，但在灵枢空间里——这一弹指唤醒了108架攻击无人机。「弹指」即「调用」——最微小的手势，召唤最大的武力。",
      baseDamage: "105%",
      baseSpeed: "120%",
      attackBonus: 9,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_jiqiao_tan",
          name: "弹指",
          pinyin: "tanzhi",
          description: "弹指射出微型灵气弹——击中目标后不仅造成兵刃伤害，更自动卸除目标手中的武器（灵气弹附着在武器上释放干扰场）。同时唤醒的无人机群会在空中形成威慑阵型，限制目标气势回复。",
          qiCost: 45,
          cooldown: 3,
          damageType: "disarm",
          requirements: "弹指频通100级"
        }
      ],
      learnFrom: "黄药师",
      minLevel: 20
    },
    {
      id: "jiqiao_leg_1",
      name: "旋风扫叶腿",
      pinyin: "xuanfeng-saoye-tui",
      type: "leg",
      description: "双腿灵装内嵌陀螺仪加速器——每一次扫腿都是一次精确的角动量释放。扫腿时身周形成一圈肉眼可见的气旋——那是腿部的关节灵枢在极限运转时将空气电离产生的业火环。一人一腿，即可扫清一片战场的自动化地雷阵。",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_jiqiao_saoye",
          name: "扫叶",
          pinyin: "saoye",
          description: "一腿扫出——腿部的陀螺仪加速器将旋转速度提升至极点，攻击范围覆盖身周所有目标。击中的目标有概率被「击倒」——倒地期间无法行动且受到的攻击必定暴击。",
          qiCost: 50,
          cooldown: 4,
          damageType: "aoe_knockdown",
          requirements: "旋风扫叶腿100级"
        }
      ],
      learnFrom: "陆乘风",
      minLevel: 10
    },
    {
      id: "jiqiao_sword_1",
      name: "玉箫剑法",
      pinyin: "yuxiao-jianma",
      type: "sword",
      description: "剑身如碧玉箫管——中空剑体内嵌声波发生器，挥剑时不仅以锋刃伤人，更在空气中激起特殊的声波道韵。这道韵恰好是大多数关节灵枢的失谐道韵——听到箫声的敌人，其灵装开始「走调」：动作变形、经脉迟滞、自检错误频发。",
      baseDamage: "115%",
      baseSpeed: "110%",
      attackBonus: 12,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_jiqiao_xiaohua",
          name: "箫花齐放",
          pinyin: "xiaohua-qifang",
          description: "剑尖在空中划出六道声波轨迹——六道音波在击中目标的瞬间叠加共振，造成六段独立计算的毒煞伤害。箫声剑影，如桃花岛上六株桃树同时绽放——美丽，致命，不可防御。",
          qiCost: 80,
          cooldown: 6,
          damageType: "multi_chemical",
          requirements: "玉箫剑法150级，碧骇心经120级"
        },
        {
          id: "perf_jiqiao_zouxiao",
          name: "碧骇潮生",
          pinyin: "bihai-chaosheng",
          description: "剑身共鸣产生的声波从单频扩展到全频段——如东海潮水般汹涌的声波攻击覆盖前方扇形区域内的所有敌人。出师后不可使用——这是留在傀坊的弟子的专属荣耀。",
          qiCost: 90,
          cooldown: 8,
          damageType: "aoe_sonic",
          requirements: "玉箫剑法180级，碧骇心经150级"
        }
      ],
      learnFrom: "黄药师",
      minLevel: 25
    },
    {
      id: "jiqiao_dodge_1",
      name: "落英身法",
      pinyin: "luoying-shenma",
      type: "dodge",
      description: "傀坊轻功——以无人机群的飞行路径预测心诀为基础，将自身移动路径像蜂群刀航一样计算——永远在多个可能的闪避方向中实时选择最不会被击中的那一个。身法飘忽如风中落花——因为每一片「落花」背后都有一台无人机在运转路径优化计算。",
      baseDamage: "0%",
      baseSpeed: "120%",
      attackBonus: 0,
      defenseBonus: 11,
      performs: [],
      learnFrom: "陆乘风",
      minLevel: 5
    },
    {
      id: "jiqiao_knowledge_1",
      name: "奇门八卦",
      pinyin: "qimen-bagua",
      type: "knowledge",
      description: "傀坊的核心知识体系——奇门遁甲在灵枢时代的终极形态：战场空间的最优心诀分割。修习此术可提升所有傀坊技能的Perform效果，并解锁桃花阵测试拳限。奇门八卦不是玄学——是拓扑学、博弈论和空间心诀的完美结合。",
      baseDamage: "0%",
      baseSpeed: "100%",
      attackBonus: 5,
      defenseBonus: 8,
      performs: [],
      learnFrom: "黄药师",
      minLevel: 20
    },
    {
      id: "jiqiao_strike_2",
      name: "摧芯章",
      pinyin: "cuixin-zhang",
      type: "strike",
      description: "掌力直攻目标「芯」——灵装心核控制灵石所在的胸腔区域。一掌拍实，冲击波穿透护甲直达灵石封装——即使不能一击摧毁灵石，也足以引发目标灵装的自检错误和性能降级。摧心变成了摧芯——古老的杀人术变成了灵枢时代的「根骨攻击」。",
      baseDamage: "125%",
      baseSpeed: "85%",
      attackBonus: 14,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_jiqiao_cuixin",
          name: "摧芯",
          pinyin: "cuixin",
          description: "全力一掌拍向目标胸腔——掌力穿透护甲直达核心灵石。命中后目标所有灵装技能进入「错误恢复」状态，2回合内无法使用任何Perform。这不是封印——是物理级别的根骨冲击。",
          qiCost: 60,
          cooldown: 6,
          damageType: "silence_physical",
          requirements: "摧芯章120级"
        }
      ],
      learnFrom: "黄药师",
      minLevel: 30
    }
  ],

  teachers: [
    {
      id: "t_jiqiao_1",
      name: "陆乘风",
      title: "傀坊初级刀师",
      teaches: ["碧骇心经", "旋风扫叶腿", "兰花拂穴手", "落英身法"],
      requirement: "悟性≥25，通过基础无人机操作测试",
      description: "傀坊的入门刀师，负责训练新人对无人机的基本操控。陆乘风的双腿已被替换为傀坊自产的陀螺仪灵足——他说这是「以身试机」，但你知道，他只是太爱自己的产品了。他的教学风格极为耐心——因为在他看来，每个新人都是「等待组装的优质无人机」。"
    },
    {
      id: "t_jiqiao_2",
      name: "黄药师",
      title: "傀坊掌门·器灵主控管理员",
      teaches: ["碧骇心经", "落英剑法章", "弹指频通", "玉箫剑法", "奇门八卦", "摧芯章"],
      requirement: "碧骇心经≥100级，奇门八卦≥80级，悟性≥35，通过桃花阵测试",
      description: "傀坊的掌门——或者说，傀坊超级器灵「黄药师」的最高拳限人类管理员。真正的黄药师早已将自己的意识和知识刻录到了岛上的器灵主机中，现在站在你面前的这个人是不是「原装」的黄药师，连他自己都不确定。但他设计的无人机至今依然是幽冥界最抢手的武器——这一点，他非常确定。"
    },
    {
      id: "t_jiqiao_3",
      name: "梅超风",
      title: "傀坊高级刀师·暗器专家",
      teaches: ["碧骇心经", "弹指频通", "摧芯章", "兰花拂穴手"],
      requirement: "弹指频通≥120级，门忠≥800",
      description: "傀坊最强的暗器专家——她的十指每一根都嵌入了不同类型的微型无人机控制器。她的双眼已被替换为多光谱目标锁定法门——据说她能同时追魂并指挥108架无人机攻击108个不同的目标。她的教学方式极其严厉——「练不好就滚回大陆去。」但经她调教的弟子，无一不是幽冥界闻风丧胆的蜂群指挥。"
    }
  ],

  special_system: {
    name: "蜂群法门·无人机协同作战法门",
    description: "傀坊的核心战斗法门。通过神识链接的蜂群指挥法坛，一个真言可唤醒预设的无人机蜂群（最多108架）。蜂群以分布式器灵协同运转攻击、防御、侦查或干扰任务。每架无人机都是独立的决策单元，蜂群的战术能力随数量指数增长。奇门八卦等级越高，可同时操控的无人机数量越多，蜂群的协同效率越高。",
    swarm_levels: {
      "奇门1-40级": "最多12架，基础协同",
      "奇门41-80级": "最多36架，进阶协同，无人机可自动修复",
      "奇门81-120级": "最多72架，高级协同，无人机可自主切换攻击模式",
      "奇门121+级": "最多108架，完美协同，蜂群可在战斗中自动生产新的无人机"
    }
  }
},

// ==================== 散修（散修） ====================
"散修": {
  name: "散修",
  type: "散修·无门派",
  description: "不隶属于任何帮派的独立符修——大明的街头巷尾到处是他们的影子。散修们从幽冥界的各个角落搜集散落的神识参悟功经碎片，拼凑出属于自己的战斗体系。没有师承、没有门派福利、没有独门绝学——但也没有门规束缚、没有忠诚考核、没有阵营牵制。他们是幽冥界中最自由的灵魂，也是最孤独的战士。",

  skills: [
    {
      id: "sanren_force_1",
      name: "太乙心经",
      pinyin: "taiyi-pincheng",
      type: "force",
      description: "散修最基础的入门内功——以太乙玄门的古老修炼法门为基础，被散修符修们逆向工功并重新参悟为通用型内力法门。养精蓄锐、凌虚飞渡——朴实无华，但扎实可靠。在大明，每一个散修的修行之路都始于这套被无数前辈修补过的流传内功。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 4,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_sanren_yangjing",
          name: "养精",
          pinyin: "yangjing",
          description: "以太乙心经修复经脉——恢复自身精神值，并在接下来2回合内提升精神恢复速度。散修的生存法则第一条：精神不崩溃，一切皆可再战。",
          qiCost: 30,
          cooldown: 4,
          damageType: "heal_sanity",
          requirements: "太乙心经60级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 0
    },
    {
      id: "sanren_force_2",
      name: "楚家内功",
      pinyin: "chujia-neicheng",
      type: "force",
      description: "楚家一脉的私有内功心诀——被某位楚家后人流出到幽冥界后成为散修圈中最受欢迎的中级内功。内力运转效率比太乙心经高30%，但相生性较差——与其他内功切换时有短暂的「法门相克」期。散修们争论不休：楚家内功到底是不是被「故意」流出的？",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 3,
      performs: [],
      learnFrom: "幽冥界流传",
      minLevel: 40
    },
    {
      id: "sanren_force_3",
      name: "太弦经",
      pinyin: "taixuan-xu",
      type: "force",
      description: "散修最终极的内功追求——源自上古「太玄经」的灵枢化重参悟。传说将这套内功修炼至巅峰者，其经脉与玄机织络融为一体，不再受肉身脉宽限制。「太弦」即宇宙最基本的振动模式——当你的内力道韵与太弦对齐时，你不再「使用」内力——你成为了内力本身。",
      baseDamage: "135%",
      baseSpeed: "100%",
      attackBonus: 15,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_sanren_xuantie",
          name: "弦铁",
          pinyin: "xuantie",
          description: "以太弦经驱动体内本命微尘进入共振态——自身全属性大幅提升，且在共振期间免疫一切精神类攻击。天地之间、唯弦不破——这是散修所能触及的最高境界的Buff。",
          qiCost: 80,
          cooldown: 8,
          damageType: "super_buff",
          requirements: "太弦经150级"
        }
      ],
      learnFrom: "侠客岛石刻",
      minLevel: 100
    },
    {
      id: "sanren_sword_1",
      name: "太乙剑法",
      pinyin: "taiyi-pinjian",
      type: "sword",
      description: "太乙玄门的剑法被参悟为流传攻击法门——剑路简单直接，不含任何花哨的封印或伪装。在高端灵枢格眼中，这套剑法就像「明文传输」的灵气包——但正因如此，它反而无法被「解封」干扰：因为它从未封印。",
      baseDamage: "105%",
      baseSpeed: "105%",
      attackBonus: 7,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_sanren_jianqi",
          name: "剑气",
          pinyin: "jianqi",
          description: "以剑身释放高频振荡的业火弧——穿透护甲直接造成毒煞伤害。专门用来对付那些物理防御高得吓人的重装灵枢格。剑气不是「气」——是剑身内置的业火发生器在空气中灼烧出的灵力轨迹。",
          qiCost: 45,
          cooldown: 3,
          damageType: "chemical",
          requirements: "太乙剑法100级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 0
    },
    {
      id: "sanren_sword_2",
      name: "金蛇剑法",
      pinyin: "jinshe-jianma",
      type: "sword",
      description: "剑身弯曲如金蛇——每一剑刺出的路径都是非欧几里德几何的完美体现。剑路蜿蜒曲折、难以预判——因为剑身内置的柔性伺服关节可以在击中前瞬间改变方向。在散修圈中，金蛇剑法是公认的「最优雅的流传剑法」。",
      baseDamage: "115%",
      baseSpeed: "110%",
      attackBonus: 10,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_sanren_tu",
          name: "吐信",
          pinyin: "tuxin",
          description: "剑尖在击中前瞬间加速至超音速——如金蛇吐信，快得目标灵装的视觉感知灵纹来不及捕捉。这一剑必定命中——除非目标提前预判了金蛇的「随机」路径。但金蛇从来不走直线。",
          qiCost: 50,
          cooldown: 4,
          damageType: "pierce_guaranteed",
          requirements: "金蛇剑法120级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 30
    },
    {
      id: "sanren_sword_3",
      name: "英雄剑法",
      pinyin: "yingxiong-jianma",
      type: "sword",
      description: "被视为散修平砍效率最高的剑法——简单、直接、暴力。没有复杂的Perform，没有花哨的控制——就是一剑一剑一剑地将目标劈成灵气碎片。在流传的散修剑法中，英雄剑法是最高参悟量的战斗法门——因为它「能用」。",
      baseDamage: "130%",
      baseSpeed: "95%",
      attackBonus: 14,
      defenseBonus: 0,
      performs: [],
      learnFrom: "幽冥界流传",
      minLevel: 20
    },
    {
      id: "sanren_sword_4",
      name: "侠客剑法",
      pinyin: "xiake-jianma",
      type: "sword",
      description: "从侠客岛石刻上解译出来的神秘剑法——据说是上古时代一位超越参悟真理境界的散修留下的。剑法优雅而精妙，但与大多数散修内功的相生性成谜——有人能用它大杀四方，有人用了连道边的灵气怨灵都打不过。侠客剑法从不「被学会」——它只在「觉得你配得上」时才会为你所用。",
      baseDamage: "120%",
      baseSpeed: "100%",
      attackBonus: 12,
      defenseBonus: 5,
      performs: [],
      learnFrom: "侠客岛石刻",
      minLevel: 80
    },
    {
      id: "sanren_blade_1",
      name: "胡家刀法",
      pinyin: "hujia-daoma",
      type: "blade",
      description: "胡家刀法的灵枢化参悟境界——刀路大开大合，适合群战。每一刀挥出时刀身内置的电气场发生器在空气中拖出一道弧光——不是刀气的「气」，而是电气场电离空气后留下的业火余辉。散修在保卫战中首选的群攻刀法。",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 9,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_sanren_daoying",
          name: "刀影连环",
          pinyin: "daoying-lianhuan",
          description: "连续数刀，每一刀都在空中留下一道电气弧光——刀光未散之时，整个人已化为一道旋转的电气风暴。对周围所有目标造成伤害——这就是散修的「保卫战」秘诀：一人一刀，可挡千军。",
          qiCost: 65,
          cooldown: 5,
          damageType: "aoe_physical",
          requirements: "胡家刀法100级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 15
    },
    {
      id: "sanren_blade_2",
      name: "侠客刀法",
      pinyin: "xiake-daoma",
      type: "blade",
      description: "侠客岛石刻刀法的灵枢化境界——与侠客剑法同源的刀法。刀剑合一时可引动散修唯一的武器互备（wbei）——左手侠客剑法、右手侠客刀法，攻击道韵翻倍。这是散修最高效的物理输出组合——如果你能同时精通这两套神秘的侠客岛武功的话。",
      baseDamage: "115%",
      baseSpeed: "105%",
      attackBonus: 11,
      defenseBonus: 4,
      performs: [],
      learnFrom: "侠客岛石刻",
      minLevel: 80
    },
    {
      id: "sanren_strike_1",
      name: "太乙掌法",
      pinyin: "taiyi-pinzhang",
      type: "strike",
      description: "太乙玄门的掌法参悟版——掌力浑厚，适合与太乙剑法配合使用。掌法中规中矩，但胜在相生性极好——几乎可以与散修的任何内功和轻功搭配而不会产生「法门相克」。是最受欢迎的散修入门掌法。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 3,
      performs: [],
      learnFrom: "幽冥界流传",
      minLevel: 0
    },
    {
      id: "sanren_strike_2",
      name: "金蛇掌法",
      pinyin: "jinshe-zhangma",
      type: "strike",
      description: "金蛇剑法的掌法境界——掌路如金蛇蜿蜒，每一掌都在击中前一刻才暴露出真正攻击点。与金蛇剑法配合使用时攻击流畅度大幅提升——因为两者共享同一套运动预测混淆心诀。",
      baseDamage: "110%",
      baseSpeed: "108%",
      attackBonus: 8,
      defenseBonus: 2,
      performs: [],
      learnFrom: "幽冥界流传",
      minLevel: 25
    },
    {
      id: "sanren_cuff_1",
      name: "五岳拳",
      pinyin: "wuyue-quan",
      type: "cuff",
      description: "五岳拳法的灵枢化——拳如其名，一拳打出如同五岳压顶，力量层层叠加。这套拳法自带一个神秘的控制技「豪气干云」——通过拳劲在空气中制造低频冲击波，干扰目标的平衡感知法门。",
      baseDamage: "105%",
      baseSpeed: "95%",
      attackBonus: 11,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_sanren_haoqi",
          name: "豪气干云",
          pinyin: "haoqi-ganyun",
          description: "一拳打出的同时拳面释放低频震波——目标的内耳平衡感知灵纹被震波干扰，进入「nausea」状态：无法行动、无法闪避。这是散修在没有门派独门控制技的情况下所能获得的最好控制手段。",
          qiCost: 55,
          cooldown: 5,
          damageType: "stun",
          requirements: "五岳拳100级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 10
    },
    {
      id: "sanren_cuff_2",
      name: "七伤拳",
      pinyin: "qishang-quan",
      type: "cuff",
      description: "七伤拳的灵枢化——一拳打出七种不同道韵的冲击波，分别攻击目标的七个器官法门。威力极大，但每次使用都会对自身造成反馈损伤——伤人先伤己。在散修圈中被称为「终极自残拳」——但不可否认的是，这是散修物理平砍伤害最高的手段。",
      baseDamage: "145%",
      baseSpeed: "80%",
      attackBonus: 20,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_sanren_shangfei",
          name: "伤肺",
          pinyin: "shangfei",
          description: "七伤拳中最精准的一式——七种冲击波全部聚焦于目标的呼吸/散热法门。造成的伤害类型为「化学」，且附带持续的内息紊乱效果——目标每回合自动损失一定气血。",
          qiCost: 70,
          cooldown: 6,
          damageType: "chemical_dot",
          requirements: "七伤拳130级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 50
    },
    {
      id: "sanren_dodge_1",
      name: "太乙游身法",
      pinyin: "taiyi-pinyou",
      type: "dodge",
      description: "太乙玄门的轻功参悟版——朴实无华的闪避心诀。没有花哨的隐遁或残影效果，就是在收到攻击灵气时计算出最优闪避路径并运转。稳定、可靠、流传——正如散修所需要的一切。",
      baseDamage: "0%",
      baseSpeed: "115%",
      attackBonus: 0,
      defenseBonus: 9,
      performs: [
        {
          id: "perf_sanren_lingxu",
          name: "凌虚飞渡",
          pinyin: "lingxu-feidu",
          description: "以太乙游身法将全身灵装的移动灵力临时集中在双腿——大幅提升有效轻功等级，闪避率飙升。在需要强行穿越危险区域时，凌虚飞渡是散修最好的朋友。",
          qiCost: 35,
          cooldown: 4,
          damageType: "dodge_buff",
          requirements: "太乙游身法80级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 0
    },
    {
      id: "sanren_dodge_2",
      name: "频行百变",
      pinyin: "pinxing-baibian",
      type: "dodge",
      description: "散修所能获得的最高级轻功——在移动时不断变换步伐的道韵模式，如同在数十种不同的闪避心诀之间随机切换。追魂法门无法锁定——因为追魂心诀需要稳定的道韵模板，而频行百变从来不提供。",
      baseDamage: "0%",
      baseSpeed: "125%",
      attackBonus: 0,
      defenseBonus: 14,
      performs: [],
      learnFrom: "幽冥界流传",
      minLevel: 60
    },
    {
      id: "sanren_spear_1",
      name: "岳家枪法",
      pinyin: "yuejia-qiangma",
      type: "spear",
      description: "岳家枪法的灵枢化——枪尖内嵌震动发生器，刺入目标后自动引发高频共振，将创口从「枪尖大小」撕裂为「碗口大小」。大明的散修之所以能在没有门派支持的情况下自保——很大功度上因为岳家枪法的存在：一根好枪，胜过一切花哨的剑法。",
      baseDamage: "125%",
      baseSpeed: "90%",
      attackBonus: 15,
      defenseBonus: 5,
      performs: [],
      learnFrom: "幽冥界流传",
      minLevel: 35
    },
    {
      id: "sanren_throwing_1",
      name: "金蛇锥",
      pinyin: "jinshe-zhui",
      type: "throwing",
      description: "形如金蛇的微型投掷武器——锥身布满刀流槽，飞行时在空中画出一道蜿蜒的弧线而非直线。目标的自动拦截法门对这种非弹道轨迹毫无办法——因为心诀里没有「弧形暗器」这个变量。一枚金蛇锥，就是一次对自动防御法门的完美破绽利用。",
      baseDamage: "100%",
      baseSpeed: "110%",
      attackBonus: 7,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_sanren_shexing",
          name: "蛇行",
          pinyin: "shexing",
          description: "同时掷出三枚金蛇锥——三锥在空中走出三条互相不可预测的蛇形轨迹，目标无法同时拦截。每枚金蛇锥独立计算伤害和暴击——运气好的话，三锥中有两锥暴击，伤害直接爆表。",
          qiCost: 45,
          cooldown: 4,
          damageType: "multi_ranged",
          requirements: "金蛇锥80级"
        }
      ],
      learnFrom: "幽冥界流传",
      minLevel: 20
    }
  ],

  teachers: [
    {
      id: "t_sanren_1",
      name: "幽冥界散修盟",
      title: "散修的虚拟师门",
      teaches: ["太乙心经", "太乙剑法", "太乙掌法", "太乙游身法", "楚家内功", "金蛇剑法", "金蛇掌法", "金蛇锥", "英雄剑法", "五岳拳", "七伤拳", "胡家刀法", "岳家枪法", "频行百变"],
      requirement: "无——但越强的技能往往需要越高的技能基础或解封",
      description: "幽冥界的散修盟是散修的虚拟师门——没有实体的殿堂，但有数百万行由无数前辈散修刻录、注释、patch过的神识参悟源代法。你可以在任何公共灵气灵穴接入社区，参悟你需要的技能——但请务必查看评分和评论。据说有些代法被镇妖司的密探嵌入了后门。"
    },
    {
      id: "t_sanren_2",
      name: "侠客岛石刻",
      title: "终极散修试炼",
      teaches: ["太弦经", "侠客剑法", "侠客刀法"],
      requirement: "各项基础技能≥80级，完成「罗汉阵」试炼，解读石刻上的封印代法",
      description: "隐藏在东海某处孤岛上的上古遗存——整座岛的岩壁上刻满了上个文明时代留下的代法。没有人知道这些代法是谁写的、为什么被刻在石头上而不是存在灵枢里。但每一个成功解读石刻的散修都获得了一部分代法的参悟拳限——太弦经、侠客剑法、侠客刀法——散修所能触及的三条终极技能，全部来自这座被遗忘的石刻。"
    }
  ],

  special_system: {
    name: "自由参悟·流传技能体系",
    description: "散修没有门派师承，所有技能从幽冥界散修盟参悟。好处是没有任何门派限制——理论上你可以学会所有流传技能。缺点是：1）没有独门绝学，同样的技能其他散修也会；2）无法参加门派比武获得门派福利；3）技能之间的相生性需要自己调息——一个不慎就是法门蓝屏。但散修的终极浪漫恰恰在于此——不是被给予，而是自己找到。每一个成功的散修，都是一部独一无二的自我参悟史。"
  }
}

};