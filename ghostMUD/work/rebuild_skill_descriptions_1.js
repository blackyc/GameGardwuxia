// ============================================================
// 鬼修MUD · 宗派技能（前六宗派 + 散修）
// Ghost MUD - Skill Descriptions Part 1 (聊斋白描版)
// 迁移时间: 2026-06-19
// 基于: faction_rebrand.md + shared_constraint_v3.md + terminology_map.md 重写
// ============================================================

var GHOST_SKILL_TREES_1 = {

  // ==========================================
  // 宗派一：忘尘宗
  // ==========================================
  "忘尘宗": {
    name: "忘尘宗",
    description: "忘尘峰上孤寺一座。僧袍灰白，不点戒疤——长老说戒疤会留下痕迹，痕迹会被祂追踪。寺中无钟声，钟在也不响——响的时候就是祂听见的时候。七十二绝艺皆不传其形，只传其意：忘掉招式，忘掉内息，忘掉自己。祂就看不见你了。",
    skills: [
      {
        id: "fanwang_force_1",
        name: "混元一器功",
        pinyin: "hunyuan-yiqi-gong",
        type: "force",
        description: "忘尘宗根基心法。取一口丹田气，循任督二脉周流不息——初成时气如薄雾，包裹周身化为护体罡芒；大成时气凝如金钟，刀剑加之如劈铁壁，百邪不得近身。这是忘尘的第一步：先修得一身不被看透的壳。",
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
        description: "忘尘宗至高心法。初入时气行十二经，每过一关，筋骨便密一分；练至极境，筋骨如铁、皮肤如铜，拳脚触及处听不到血肉之声——只闻金石相击的闷响。传说是达摩面壁时悟出的换骨之术：不是修肉身，是换一具祂认不出的躯壳。",
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
        description: "忘尘宗身法。僧侣移步时足不沾尘——不是轻，是每一脚落下前已将地面灵气压至虚无。远远望去只见灰白人影在林间一闪一闪，追的人跑得越快，离得越远。足底的灵气涟漪散开时如蛛丝网住身后的视线，看的人以为看清了，其实什么也没看见。",
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
        description: "忘尘宗拳法。出拳时拇指内扣、四指紧握如持金刚杵，拳未至而拳风先至——对方的护体罡气触及拳风的刹那，像被什么东西压住了，怎么也提不起来。一拳落实，如千斤铁砧砸在胸口，震的不是皮肉，是经脉深处那一口护着心脉的本命元气。",
        baseDamage: "130%",
        baseSpeed: "95%",
        attackBonus: 8,
        defenseBonus: 0,
        performs: [
          {
            id: "jingang",
            name: "大金刚",
            pinyin: "dajingang",
            description: "拳端凝出一道暗金色的气劲，离手时大如碗口，飞行中越缩越小——到对方身前三寸时已细如针尖，尽数钻进护甲缝隙，直抵经脉底层的窍穴。中拳者往往当场无恙，三日后才发觉自己调动不了半分内力。",
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
        description: "忘尘宗入门拳法，一百零八式皆取自罗汉伏虎降龙之形。表面看去平平无奇——直拳、勾拳、摆拳，和山下武馆教的别无二致。但修过拈花指的人打出这套拳时，拳风里夹着一丝若有若无的佛光——旁人觉得这只是招式精进了，练拳的人自己知道：那不是精进，是觉醒了什么。",
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
        description: "忘尘宗指法。指尖轻拈如摘花，隔空一点——指尖凝出一道若有若无的青色气丝，触到对方身体时无声无息地散开。被点中的人意识清醒，偏生动弹不得：想迈腿，腿不抬；想运气，气不转。仿佛身体有了自己的主意，不打算再听凭使唤。",
        baseDamage: "105%",
        baseSpeed: "125%",
        attackBonus: 5,
        defenseBonus: 0,
        performs: [
          {
            id: "hua",
            name: "拈花",
            pinyin: "nianhua",
            description: "只见指尖微动——外人看不出任何端倪，对方却忽然僵在原地。手脚不听使唤，内力凝在丹田提不上来，像是被一只看不见的手按住后脑。这道指劲不伤皮肉，专封经脉枢纽——封住之后，纵有千般武艺也施展不出。",
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
        description: "忘尘宗隐秘指法。指风出时无形无色——不是没有气劲，是气劲离手便化入了风中。被击中的人只觉得经脉一滞，回头看时，身后空无一人，左右同门亦是同样神情。无相劫指的厉害处不在指上，在那份「不知是谁」的恐慌。",
        baseDamage: "115%",
        baseSpeed: "110%",
        attackBonus: 4,
        defenseBonus: 0,
        performs: [
          {
            id: "wuxiang",
            name: "无相劫",
            pinyin: "wuxiang-jie",
            description: "指风化作数道残影，每道都朝着不同方向散开——明明看着施术者就在眼前，指尖落处却在身后、在左侧、在天上。被指风扫中的人接二连三僵在原地，彼此对视时都从对方眼中看到了同一个疑问：他到底在哪里？",
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
        description: "忘尘宗防御手法。双手张开如千叶齐舒——不是挡，是拨。每一片「叶」都是一缕柔劲，缠住对方的刀锋往旁边轻轻一带。百刀齐落，百叶齐舒；刀刀都像砍在水里，明明对准了，落下去时全偏了方向。",
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
        description: "忘尘宗手法。左手如春风拂柳——掌缘贴着对方兵刃一路滑下去，卸去的力道无声地散入地下；右手如夏云裹雷——看似绵软，拍到身上时却是一股沉闷的巨力，震得对方虎口发麻、兵器差点脱手。一刚一柔，一明一暗。",
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
        description: "忘尘宗爪法。五指弯曲如钩，探出时指节噼啪作响——那不是骨头的声响，是指尖真气在空气中撕裂出来的尖啸。一爪扣住对方肩胛，五指猛地收紧，对方整条手臂便像被人抽了筋一样软软垂了下去。",
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
        description: "忘尘宗探敌爪法。五指不取要害，专走偏门——一爪下去扣在对方手腕的脉门处，指尖真气如五根细针同时探入经络。收手时不带血，带回的却是对方内力运行的全部路数。被他爪过的人，再对上时招招被制，像是被提前翻遍了底牌。",
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
        description: "忘尘宗刚猛刀法。刀锋过处不留血——刀气先行，如一道暗红色的弧光劈在对方护体罡气上。一击未破？第二刀已在同一处落下。修罗刀的诀窍不在快，在「重」：每一刀都劈在上一刀留下的裂隙上，三刀之内，再厚的护体真气也得崩碎。",
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
        description: "忘尘宗火行刀法。刀锋擦过空气时自燃——不是人力点燃的，是刀气与风中灵气相激自发燃起的青焰。每一刀劈出都在半空留下一道久久不散的灼痕，被这刀气扫中的地方，皮肤上不见伤口，经脉深处却像被烙铁烫过一样火辣辣地疼。",
        baseDamage: "140%",
        baseSpeed: "85%",
        attackBonus: 12,
        defenseBonus: 0,
        performs: [
          {
            id: "fentian",
            name: "焚天",
            pinyin: "fentian",
            description: "刀身急旋，青焰暴涨如轮——一刀挥出，半月形的火浪贴着地面席卷而去。被火浪扫过的人只觉体内真气像被泼了滚油，翻涌不止，想运功压住，反而越压越烫。",
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
        description: "忘尘宗至高剑法。剑不是铁铸的——是灵气凝成的。出剑时剑身发出幽幽的青光，刺入对方防御时如热刀入蜡，护体罡气层层消融，竟无一招能挡。传说此剑的剑意来自达摩面壁时悟出的一个念：最锋利的不是剑刃，是忘掉一切之后剩下的那个'看'。",
        baseDamage: "145%",
        baseSpeed: "100%",
        attackBonus: 10,
        defenseBonus: 5,
        performs: [
          {
            id: "sanmei",
            name: "三昧",
            pinyin: "sanmei",
            description: "三道剑光——定剑锁其形，慧剑乱其心，戒剑碎其护。三剑先后刺出，剑气在对方身前汇作一团青白交织的光，轰然炸开。剑光散去后，对方身上的护体真气荡然无存——不是被击穿了，是被「烧」干净了。",
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
        description: "忘尘宗奇门棍法。身形摇摇晃晃如醉酒，脚下东倒西歪——但每一歪都恰好避开刀锋，每一倒都正巧让棍梢弹在对方的空门。看他打棍像看一个醉了的人跳舞，可那舞步走到哪里，棍就落到哪里，避无可避。",
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
        description: "忘尘宗护法棍法。棍身在手中急旋如轮，嗡声不绝——那不是棍子破空的声音，是棍劲将周围的空气搅成了一道环形气墙。暗器飞来被气墙带到三丈外，拳脚攻来被棍影裹住拉偏。这是守的功夫，守得滴水不漏。",
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
        description: "忘尘宗鞭法。鞭身是灰白色的细丝编成，挥出时在日光下几乎看不见——只见一道白影掠过。日鞭之法是缠：鞭梢如灵蛇绕上对方手腕脚踝，越收越紧；月鞭之法是刺：鞭梢绷直如针，专点对方关节窝里的软筋，一触之下半身酸麻。",
        baseDamage: "115%",
        baseSpeed: "110%",
        attackBonus: 4,
        defenseBonus: 3,
        performs: [
          {
            id: "chan",
            name: "缠",
            pinyin: "chan",
            description: "鞭梢缠住对方手腕后缓缓收紧——每一寸收紧都伴随着细微的噼啪轻响，像是鞭身上附着无数微小的雷电。被缠住的人全身经络像灌了铅一样沉重，明明心里想着出招，手脚就是慢了半拍。",
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
        description: "忘尘宗禅修法门。诵经不是念字——是让经文在意识中一遍遍沉下去，像墨渗入宣纸。修得深的人，眼神比常人沉静得多，旁人用摄魂术看他，只看到一片深不见底的寂静，找不到可以下手的地方。",
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
        description: "忘尘宗感应法门。闭目入定时，周遭百丈之内的灵气流动清晰如绘图——哪处有人在运功，哪处有妖气潜伏，了然于心。这不是神通，是心静到极处后的自然感知。如同水面平静时自然照出岸边每一株草的摇曳。",
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
        description: "忘尘宗终极禅法。涅槃不是死——是灭掉最后一丝执念后进入的一种状态。修至极处，即使肉身被毁，灵识仍能独存三日。三日之内若能找到新的躯壳，便可复生。只是复生的人还是不是原来的人——谁也不知道。",
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
        description: "忘尘宗隐秘禅法。修成之后，自身灵气波动化为虚无——不是收敛了，是消失了。望气的人看过来，只觉得这里什么也没有，连风都绕着你走。不是隐身，是让天地暂时忘了你在这里。",
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
  // 宗派二：问剑峰
  // ==========================================
  "问剑峰": {
    name: "问剑峰",
    description: "问剑峰上终年霞光不散——但那霞不是太阳照的。道士们在血池边打坐，以池中倒影代替内观。他们说在血池里能看到自己真正的内脏。太极在这里不是拳理，是血脉的阴阳流转：阳面燃尽凡胎，阴面镇守本心。",
    skills: [
      {
        id: "zixia_force_1",
        name: "太极心经",
        pinyin: "taiji-pincheng",
        type: "force",
        description: "问剑峰镇派心法。以血池倒影为镜，观照体内阴阳二气的运转。阳极时气血沸腾，每一拳都有千斤之力；阴极时气息沉入丹田，任外界攻伐如狂风骤雨，体内始终是深潭止水。两仪切换只在心念一动之间。",
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
        description: "问剑峰拳法。拳出如推磨——慢，但每推一圈力道便深一分。对方一刀劈来，拳劲不硬接，而是顺着刀势一转一带，那砍下来的力道便绕着太极圆弧转了一圈，原路回到对方自己身上。",
        baseDamage: "125%",
        baseSpeed: "90%",
        attackBonus: 5,
        defenseBonus: 8,
        performs: [
          {
            id: "zhan",
            name: "震字诀",
            pinyin: "zhenzijue",
            description: "拳端爆发一股暗劲，无声无息地透过皮肤直入对方经络——中拳者外表无伤，体内的真气却被震得四散乱窜，想重新聚气时才发现每一丝真气都像浸了水的棉絮，沉重得抬不起来。",
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
        description: "问剑峰入门拳法。三十六式皆是基本拳路——直、劈、崩、靠，招招朴素。但朴素自有朴素的好处：拳速快、破绽少、连招流畅如行云流水。练到极处的人说，这套拳不是为了打人，是为了让自己感受问剑峰在每一拳里跳动的脉搏。",
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
        description: "问剑峰至高剑法。剑走太极圆弧——刺出时剑尖微微颤动，看似在画圈，实则在找对方护体真气的缝隙。太极剑从不硬碰：剑气贴着对方的防御一路滑过去，滑到缝隙处才骤然发力——一剑破防，无声无息。",
        baseDamage: "135%",
        baseSpeed: "105%",
        attackBonus: 8,
        defenseBonus: 6,
        performs: [
          {
            id: "chan",
            name: "缠字诀",
            pinyin: "chanzijue",
            description: "剑尖绕出一道螺旋气劲，如藤缠树般缠上对方的兵器。对方全力一刀劈出，被这螺旋劲道带偏了三寸——就这三寸，一刀劈在了空处，回劲反震得自己虎口崩裂。",
            damageType: "控制效果",
            moraleCost: 30,
            cooldown: 16,
            effects: "令目标busy 4-6回合，有概率在busy结束后令目标下次攻击误伤自身（概率=太极剑等级/目标定力×50%）"
          },
          {
            id: "lian",
            name: "连字诀",
            pinyin: "lianzijue",
            description: "剑尖连刺七剑，一剑紧似一剑——看似各自为战，实则七剑的剑气在空气中汇成一道漩涡，最后一剑刺出时将前六剑残留的剑气一并卷入，轰然贯穿。",
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
        description: "问剑峰剑法。十三剑各走一路真气运转之法——有的剑厚重如劈山，有的剑尖细如银针刺穴，有的剑气忽冷忽热。十三剑连环使出，对方的防守总有一处跟不上变化，那一剑便会自己找到破绽。",
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
        description: "问剑峰刀法。刀招沉稳，一刀劈出后不急收刀——刀身横在身前引气入地，将对方的力道顺着刀脊一路卸入脚底的石板。不是不攻，是先让对方的攻势落空，再一刀探入方才自己让出的空门。",
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
        description: "问剑峰刀法。刀锋过处不见血却嗡嗡作响——不是刀在响，是刀气震荡迫使对方体内真气跟着共振。一刀砍在护甲上，对方的四肢百骸却像被同时震了一下，气血翻涌不止。",
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
        description: "问剑峰身法。纵身时足底生出一团淡淡的白气——不是踩在实物上，是踩在自身逼出的真气上。一步踏出，身形已经拔起三丈，踏空而上如在登一道看不见的阶梯。",
        baseDamage: "100%",
        baseSpeed: "130%",
        attackBonus: 0,
        defenseBonus: 8,
        performs: [
          {
            id: "zong",
            name: "纵字诀",
            pinyin: "zongzijue",
            description: "脚底真气猛地炸开，身形如飞矢般冲天而起——地面轰然一震，周围敌人被这突如其来的气浪推得站不住脚，踉跄后退。",
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
        description: "问剑峰霸道手法。五指如虎爪扣住对方关节，指尖真气沿着骨缝钻入——猛一发力，只听咔嗒一声脆响，对方的关节便被卸了下来，整条手臂悬在那里晃荡。此招歹毒，中招者即使接回关节也需三月卧床——长老明令：非生死关头禁用。",
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
        description: "问剑峰养生法门。取道家炼丹术的药理，不炼丹而炼气——修习者的一呼一吸都有节奏地在经脉中运转，将吃下去的五谷精华炼化为精纯的真元。修得久的人，一日只食一餐，却面如桃花、气息绵长。",
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
      { name: "张三丰", title: "问剑峰祖师·道枢超级计算机集群首席架构师", maxSkills: 500, requirements: "门忠2000，道家养生术≥150，道德值≥50000" },
      { name: "俞莲舟", title: "问剑峰掌教·血脉调控研究所所长", maxSkills: 350, requirements: "门忠1000，太极心经≥120" },
      { name: "殷梨亭", title: "问剑峰长老·剑法神识参悟组组长", maxSkills: 250, requirements: "门忠500，太极剑≥60" },
      { name: "谷虚道长", title: "问剑峰接引使·入门弟子刀师", maxSkills: 120, requirements: "无" }
    ]
  },

  // ==========================================
  // 宗派四：紫霞山
  // ==========================================
  "紫霞山": {
    name: "紫霞山",
    description: "峡谷上方是密密麻麻的蛛网——不是普通的蛛丝，是银丝，肉眼可见灵气在其中流动。紫霞山的人走在丝上，用丝来感知和传递消息。最长的几根银丝延伸入雾中，没人知道连着哪里。",
    skills: [
      {
        id: "yiwang_force_1",
        name: "混电器功",
        pinyin: "hundian-qicheng",
        type: "force",
        description: "紫霞山基础心法。将散布在天地间的零散灵气一丝丝地收入丹田——闹市中人气鼎沸，灵气反而最旺。修习者只要身处城池，内力便源源不绝；荒山野岭反而不济。",
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
        description: "紫霞山至高掌法。十八掌对应十八条龙脉之气——每一掌击出都有龙吟之声伴随。掌力不是一波推出去，而是层层叠叠如浪涌来，第一重未到第二重已生，十八重掌劲叠加的当口，便是山也要裂开。",
        baseDamage: "165%",
        baseSpeed: "85%",
        attackBonus: 15,
        defenseBonus: 5,
        performs: [
          {
            id: "kanglong",
            name: "亢龙有悔",
            pinyin: "kanglong-youhui",
            description: "一掌拍出，掌力凝成一道浑厚的金色光柱——不散开、不偏转，直直地对着对方胸口轰去。中掌的人眼前一黑，耳朵里嗡的一声长鸣，五感在那一瞬间同时失灵。",
            damageType: "物理+灵气混合伤害",
            moraleCost: 50,
            cooldown: 20,
            effects: "造成200%武器伤害，无视目标30%防御，50%概率附加「感官反噬」（目标命中-30%，持续2回合）"
          },
          {
            id: "fei",
            name: "飞龙在天",
            pinyin: "feilong-zaitian",
            description: "身形腾空而起，半空中一掌朝下轰落——掌风如瀑，从高处倾泻而下，砸在地面时朝四方溅开。站得越近的人被波及得越厉害。",
            damageType: "范围兵刃伤害",
            moraleCost: 45,
            cooldown: 22,
            effects: "对目标及周围2格内所有敌人造成150%-180%伤害（伤害随目标数量递增），主目标额外承受一次击退效果"
          },
          {
            id: "jian",
            name: "见龙在田",
            pinyin: "jianlong-zaitian",
            description: "双掌往地面一拍——一股暗劲沿着地表向四周荡开，震得地上的碎石跳起来。被这股暗劲从脚底透过的人，身体忽然不听使唤：迈左腿时右腿先抬了起来，出掌时拳先到。令人手忙脚乱。",
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
        description: "紫霞山独门棒法。棒身看似一根寻常青竹，暗藏三十六种变化——挑、绊、缠、点、戳、转，招招克敌要害。打狗棒法不以力胜，以巧制人。",
        baseDamage: "120%",
        baseSpeed: "115%",
        attackBonus: 6,
        defenseBonus: 4,
        performs: [
          {
            id: "chan",
            name: "缠字诀",
            pinyin: "chanzijue",
            description: "棒端一晃，棒影化出数道细丝般的真气缠上对方四肢。真丝越收越紧，对方越挣扎缠得越牢——不是力大就能挣脱的，得知道收丝的气路。",
            damageType: "控制效果",
            moraleCost: 30,
            cooldown: 14,
            effects: "令目标busy 3-5回合，期间目标每次尝试行动时额外受到10%当前生命值的反噬伤害"
          },
          {
            id: "chuo",
            name: "戳字诀",
            pinyin: "chuozijue",
            description: "棒端收束如枪尖，一棒戳出——不打别处，专找护甲接缝、铁板间隙这些最薄弱的地方。一棒戳透，对方护甲的气机被破了口，再厚的甲也减了三成防护。",
            damageType: "物理破甲",
            moraleCost: 25,
            cooldown: 12,
            effects: "造成140%伤害，无视目标护甲50%，对重型护甲目标额外造成30%伤害"
          },
          {
            id: "zhuan",
            name: "转字诀",
            pinyin: "zhuanzijue",
            description: "棒身急旋如轮——暗器飞来被棒风卷住，顺着旋转的方向甩了出去。不是挡住，是'送'走。送的方向还恰好是对着自己同伙的脸。",
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
        description: "紫霞山擒拿术。虎口卡住对方喉结，拇指压在两侧气脉上——不掐死，但让对方一口气提不上来。被锁喉的人脸涨得通红，四肢使不出一丝力气。",
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
        description: "紫霞山招架术。来招不硬接——手掌贴着对方的手臂一路滑过去，像蛛丝缠住飞蛾。缠上的地方越多，对方的招式就越施展不开，到最后像被裹在一张无形的网里，越动越紧。",
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
        description: "紫霞山实用刀法。六式街头砍杀，简单直白——没有虚招、没有噱头，刀刀奔着要害去。不是用来表演的，是用来在巷战里活命的。",
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
        description: "紫霞山身法。穿过闹市如穿过空巷——身形混在人群里，步频和旁边挑担的小贩一样，肩的高低和看热闹的闲汉一样。逍遥游练到家的，站在你身边一盏茶的功夫，你都想不起他是几时来的。",
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
        description: "紫霞山暗器。一把细针撒出去，如春雨润物无声——针太细，肉眼几乎看不见，但每一根针上都附着施术者的一丝真气，沾到身上便开始干扰对手的内息运转。",
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
      { name: "洪七公", title: "紫霞山帮主·降龙十八章法门栈唯一完整传承者", maxSkills: 500, requirements: "门忠2000，混电器功≥150，完成「九指」解封任务" },
      { name: "鲁有脚", title: "紫霞山污衣派长老·街头格斗训练官", maxSkills: 250, requirements: "门忠500" },
      { name: "彭长老", title: "紫霞山净衣派长老·情报交易协调人", maxSkills: 250, requirements: "门忠500（净衣派路线）" },
      { name: "黎生", title: "紫霞山接引人·新兵招募与基础训练", maxSkills: 120, requirements: "须由现有紫霞山成员推荐" }
    ]
  },

  // ==========================================
  // 宗派五：焰心教
  // ==========================================
  "焰心教": {
    name: "焰心教",
    description: "焰墟——一座三千年前被烧毁的古城的废墟。焰心教的人说那不是失火，是第一任教主'点燃'了这座城市。废墟中央的火焰至今不灭。弟子入门第一件事：将右手探入火中，数到七。手不燃，通过。手燃——通过的另一种方式。",
    skills: [
      {
        id: "yanxin_force_1",
        name: "圣火心经",
        pinyin: "shenghuo-pincheng",
        type: "force",
        description: "焰心教核心心法。修习者丹田中点燃一道'圣火'——不是明火，是一团永不熄灭的灼热真元。运功时体温骤升，掌风热浪逼人，每出一招都带着炙烤之力。",
        baseDamage: "140%",
        baseSpeed: "100%",
        attackBonus: 5,
        defenseBonus: 5,
        performs: [
          {
            id: "shenghuo",
            name: "圣火焚天",
            pinyin: "shenghuo-fentian",
            description: "丹田圣火爆燃——一道灼热的真元波从体内炸开，朝四周席卷而去。被这股热浪扫中的人觉得体内的血像被点燃了一样，皮肤下透出暗红色的光。",
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
        description: "焰心教至高心法。九道真元分别在九处大穴中各自燃烧——九阳齐耀时，周身经脉如九条火龙翻腾，气血恢复速度快得不合常理。",
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
        description: "焰心教身法。身形如蝙蝠掠地——唰的一下从人眼前闪过，快得只剩一道残影。直线冲刺无人能及，但转弯是硬伤。",
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
        description: "焰心教至高防御法。运转此法时，身上泛起一层薄薄的金红色光晕——敌方的攻击打在这层光晕上，力道被'扭转'了一个方向，反向弹了回去。攻击越强，反弹越狠。",
        baseDamage: "100%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 20,
        performs: [
          {
            id: "yi",
            name: "挪移",
            pinyin: "nuoyi",
            description: "周身光晕骤然亮起——所有打过来的攻击都被这层光晕兜住、转了半圈、反手甩回去。对手越用力，反噬越重。第七层时，简直像是让敌人自己打自己。",
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
        description: "焰心教阴寒掌法。与圣火迥异——掌风中夹着刺骨的寒气，一掌拍在对方身上，皮肤表面立时结出一层白霜。中掌的人不是被冻僵了，是体内的真气被这股寒气'凝'住了，流速越来越慢。",
        baseDamage: "130%",
        baseSpeed: "95%",
        attackBonus: 8,
        defenseBonus: 0,
        performs: [
          {
            id: "hanbing",
            name: "寒冰绵掌",
            pinyin: "hanbing-mianzhang",
            description: "双掌齐出，白雾般的寒气笼罩对手全身——关节处咯咯作响，手臂举到一半就僵在那里。不是人被冻住了，是关节窝里的真气被寒气凝成了冰，卡住了所有的活动。",
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
        description: "焰心教禁忌拳法。一拳七伤——出拳前以自身七处要穴为祭，每祭一处，拳劲便多一层诡异的穿透力。伤肺则对方呼吸困难，伤肝则对方气血淤滞……七伤叠加时，一拳之下对方不死也去了半条命。但祭穴的代价是自身也同样承受一份。",
        baseDamage: "155%",
        baseSpeed: "80%",
        attackBonus: 14,
        defenseBonus: -8,
        performs: [
          {
            id: "shang",
            name: "七伤总诀",
            pinyin: "qishang-zongjue",
            description: "七伤齐发——一拳下去，拳劲分成七道，各自奔着对方的心、肝、脾、肺、肾、胆、胃而去。中拳之人表面只有一个拳印，体内七处窍穴却在同时哀鸣。但出拳的人自己也好不到哪里——七伤拳，伤人七分，自伤三分。",
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
        description: "焰心教火行刀法。刀身运功时变得通红，劈砍处留下一道焦黑的刀痕，刀痕边缘火星点点——那些火星不是溅出来的铁渣，是真元留在伤口上的余火，不烧尽就不灭。",
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
        description: "焰心教奇门剑法。剑身是一块刻满铭文的玄铁令——出剑时铭文在火光中闪闪发光，剑势诡异不循常理。每一剑刺出，剑身上的符文便在空中留下短暂的残影，残影尚未消散，下一剑又从另一个不可思议的角度劈来。",
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
      { name: "张无忌", title: "焰心教教主·乾坤大挪移与九阳心经唯一完整传承者", maxSkills: 500, requirements: "门忠2000，圣火心经≥150，完成「光明顶解封」" },
      { name: "杨逍", title: "焰心教光明左使·圣火令法与烈焰刀传承者", maxSkills: 350, requirements: "门忠1000，圣火心经≥100" },
      { name: "韦一笑", title: "焰心教青翼蝠王·寒冰绵章与青翼蝠王身法刀师", maxSkills: 250, requirements: "门忠500" },
      { name: "谢逊", title: "焰心教金毛狮王·七伤拳传承者（需获得屠龙符印解封）", maxSkills: 300, requirements: "门忠800，完成「冰火岛」解封任务" },
      { name: "殷天正", title: "焰心教白眉鹰王·入门教徒基础训练官", maxSkills: 120, requirements: "通过「圣火洗礼」（存活率60%）" }
    ]
  },

  // ==========================================
  // 宗派六：逍遥驿
  // ==========================================
  "逍遥驿": {
    name: "逍遥驿",
    description: "荒原上一座孤驿。门口挂着'客满'的牌子，但里面只有一盏灯亮着。茶水永远有人续——不是店里的伙计，是茶壶自己。院子里的花一年四季开着，不是园丁在打理。逍遥驿在等的不是客人——是那位一直没有到的'客人'。",
    skills: [
      {
        id: "xiaoyao_force_1",
        name: "八荒六合唯我独尊功",
        pinyin: "bahuang-liuhe-weiwoduzun-cheng",
        type: "force",
        description: "逍遥驿至高心法。运功时周身气息自成一体——不是隔绝外界，是让外界的真气'绕'着你走。任何想侵入体内的外来真气都会被这股唯我独尊的气场弹开。",
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
        description: "逍遥驿巧变心法。无固定形态——修习者可仿效任意门派的真气运行路数。模仿虽不精深，但胜在变化无常：前一招还是佛门正大，下一招已悄然化作道家绵长。",
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
        description: "逍遥驿摄夺心法。北冥之渊，容纳百川——修习者可吸取对方外放的真气化为己用。对手每一招攻来，打在你身上的力道被你'吞'掉一部分，转化为自身真元。",
        baseDamage: "130%",
        baseSpeed: "100%",
        attackBonus: 0,
        defenseBonus: 0,
        performs: [
          {
            id: "suck",
            name: "北冥神吸",
            pinyin: "beiming-shenxi",
            description: "掌心生出一股强大的吸力——不是吸实物，是吸对方体内的真气。对手只觉得丹田一空，运气时发觉自己的内力像被什么东西源源不断地抽走了。",
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
        description: "逍遥驿掌法。六道掌劲分走六条经脉——或刚或柔、或寒或热，六阳齐发时一掌之内蕴着六重变化。更可怕的是掌法中暗藏的'生死符'：一丝真气留在对方体内，蛰伏不出，只在施术者一念之间才猛然暴起。",
        baseDamage: "135%",
        baseSpeed: "110%",
        attackBonus: 8,
        defenseBonus: 0,
        performs: [
          {
            id: "shengsi",
            name: "种生死符",
            pinyin: "zhong-shengsi-fu",
            description: "掌力拍入对方体内时，不光送进去一股掌劲——还在对方经脉深处悄悄埋下一道符。这道符平时不发作，只在施术者遥遥一指时才苏醒。苏醒了做什么——让生让死，全由施术者定夺。",
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
        description: "逍遥驿手法。二十七路手法精妙如折梅——空手入白刃不是硬夺，是在对方兵刃划过身侧的间隙中，探手一拨一扣。指尖触到兵器柄部的瞬间，对方只觉手腕一酸，兵器便已易主。",
        baseDamage: "125%",
        baseSpeed: "120%",
        attackBonus: 6,
        defenseBonus: 4,
        performs: [
          {
            id: "zhemei",
            name: "折梅",
            pinyin: "zhemei",
            description: "双手穿梭如折花——在对方刀剑劈来的空隙中探手而入，指尖点中对方手腕的脉门。兵器当啷落地。再捡起来时，你会发现运不上内力了——那件兵器像睡着了一样，不肯再与你经脉共鸣。",
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
        description: "逍遥驿奇门剑法。剑身是十六片薄如蝉翼的羽刃——出剑时十六片羽刃四散飘飞，在半空中各自划出不同的轨迹。它们不是乱飞的——每一片都精准地冲着你的空门去。",
        baseDamage: "140%",
        baseSpeed: "115%",
        attackBonus: 11,
        defenseBonus: 2,
        performs: [
          {
            id: "tianyu",
            name: "天羽散花",
            pinyin: "tianyu-sanhua",
            description: "剑身碎裂——十六片羽刃漫天散开，在空中悬了一瞬，然后同时落下。不是从一个方向飞来的，是从十六个方向同时刺来的。防得住前面，防不住背后；防得住左边，防不住头顶。",
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
        description: "逍遥驿身法。脚步忽左忽右、时快时慢——不是刻意走的，是让身体跟着月下的影子走。影子飘到哪里，脚步就踏到哪里。对方每次出招都扑空，因为连跳舞的人自己也不知道下一步落在哪里。",
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
        description: "逍遥驿鞭法。鞭身是一条极长的白绫——出鞭时如长袖起舞，美得让人不忍躲。可鞭梢落到身上时，带来的不只是皮肉之痛：被击中的人眼前会闪过一些不该看到的画面——也许是前世的片段，也许是未来的碎片。",
        baseDamage: "125%",
        baseSpeed: "110%",
        attackBonus: 7,
        defenseBonus: 2,
        performs: [
          {
            id: "hen",
            name: "长恨歌",
            pinyin: "changhen-ge",
            description: "长鞭舞成一圈圈的白浪，节奏如诗、韵律如歌。最后一鞭落下时，对方的意识被一股巨大的哀怨之气淹没——眼前闪过无数破碎的画面，耳边回荡着不知谁在吟诵的诗句。等到清醒时，战斗早已结束。",
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
  // 散修
  // ==========================================
  "散修": {
    name: "散修",
    description: "无门无派的修行者。武艺杂而不精，但胜在无所顾忌——今天在鬼市买一套残谱，明天从某个破落修士手中换一份心得。没有师父指路，只有自己摸着石头过河。但自由自在，本身就是一种修行。",
    skills: [
      {
        id: "sanren_force_1",
        name: "太乙心经",
        pinyin: "taiyi-pincheng",
        type: "force",
        description: "散修通用心法。以太乙术数为根基，简单稳定，不挑练法——不管你是偷师回来的心法，还是鬼市买来的残本，以太乙心经为底子都能圆满运转。江湖浪子入门第一课。",
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
        description: "上古遗迹中发现的武功残卷。据传是一位白发修士耗尽一生所著——翻开第一页时还是个少年，读完最后一页时已是满头白发。残卷记载的不是招式，是一种将自身融入天地脉动的心法。读懂了，天下无敌；读不懂，只是废纸一叠。",
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
        description: "散修基础身法。脚步不疾不徐——看似闲庭信步，其实每一步踏出都在调整自身的灵气波动，使之与周围环境融为一体。不引人注目，不费力不讨好，是散修在街头巷尾保命的根本。",
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
        description: "散修入门剑法。来源已不可考——有人说是一位落魄将军所创，有人说是某个无名侠客临终时的遗赠。剑招正气凛然，每一剑都带着一股不服输的英气。招式算不得绝妙，但无数散修靠着它在鬼市上活了下来。",
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
        description: "散修进阶剑法。相传是一位叛出官府的修士所创——剑走诡谲，如金蛇出洞，专攻关节缝隙这些常人防备不到的地方。剑尖忽左忽右，明明看着刺胸口，落时却在膝盖窝里。鬼市上最抢手的剑谱之一。",
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
        description: "散修刀法。辽东胡家世代相传——刀法刚猛直率，没有花哨的虚招。一刀下去就是一刀的份量。鬼市上流传一句话：'跟胡家刀对刀？先看看你的刀够不够硬。'",
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
        description: "江湖流传的禁忌拳法。一拳七伤——伤人时自己也挨着同等的痛。据说是焰心教某位前辈刻录到鬼市上去的，自此成了散修搏命的压箱底招式。用这拳就是在赌：谁先倒下。",
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
        description: "散修基础拳法。取五岳之势——泰山雄、华山险、衡山秀、恒山奇、嵩山峻，五岳拳意化入拳中。入门简单，但练到深处，一拳含五岳之重，是为散修最可靠的傍身手段。",
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
        description: "散修枪法。传自南宋岳家军的遗存——枪法中自带一股忠烈之气。枪尖刺出时，残留的杀意在空气中嘶嘶作响。鬼市上卖岳家枪法的人从来不少——因为练它的人，多半已经死在冲锋的路上了。",
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
// ============================================================
// 输出（兼容 CommonJS 与浏览器全局变量）
// ============================================================;