// ============================================================
// 鬼修MUD · 技能树灵气 第二卷（描述清洗版）
// Ghost MUD Dynasty Skill Trees Vol.2 — Descriptions Rebuilt
// 包含：药王谷 | 血禅寺 | 镜阁 | 归墟 | 青囊庐 | 傀坊 | 散修
// 清洗时间: 2026-06-21
// 清洗说明: 全部desc文本重写为聊斋修仙风白描，保留所有数值字段
// ============================================================

var GHOST_SKILL_TREES_2 = {

// ==================== 门派7：药王谷 ====================
"药王谷": {
  name: "药王谷",
  mud_origin: "星宿派",
  type: "失控生化研究所",
  description: "青海沼泽深处，瘴气终年不散的低洼谷地。谷中石壁上凿满了丹房，从山脚叠到山顶，越往高处越是灼热。药王谷弟子皮肤上嵌着半透明的毒囊——荧光绿、暗紫、死黑的毒液在其中缓缓涌动。他们呼出的气息带着一丝若有若无的甜，闻久了四肢发麻。在这里，万物皆毒，剂量定生死——毒即是药，药即是毒，分别只在卖给谁。",

  skills: [
    {
      id: "duchao_force_1",
      name: "化功大法",
      pinyin: "huacheng-dama",
      type: "force",
      description: "以奇毒淬炼经脉，将外来真气化为己用。练至大成可化去他人内力、腐蚀对手护体罡气，甚至将毒素逆炼为疗伤之法。血脉腐蚀是它最终的模样——三日内可将中招者修为尽数消散。",
      baseDamage: "115%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_duchao_hua",
          name: "化功",
          pinyin: "huacheng",
          description: "一掌拍出，掌心毒气渗入对手经脉，缓缓腐蚀其内力运转。中招者如被抽去骨髓——力气尚在，却已不听使唤。",
          qiCost: 45,
          cooldown: 4,
          damageType: "debuff",
          requirements: "化功大法80级"
        },
        {
          id: "perf_duchao_huoyan",
          name: "毒焰",
          pinyin: "duyan",
          description: "将毒气逼出体外，在身周转出一圈碧幽幽的毒焰墙。踏入者皮肉嗤嗤作响，脚步也变得沉重迟滞。火焰中不断爆出细碎的绿芒——那是毒质在焰中自行裂变。",
          qiCost: 60,
          cooldown: 5,
          damageType: "aoe_dot",
          requirements: "化功大法120级，药王谷毒章100级"
        },
        {
          id: "perf_duchao_huoqiang",
          name: "毒墙",
          pinyin: "duqiang",
          description: "以化功大法催动四周毒气凝聚成一面半透明的毒液屏障，可挡住远攻并反弹部分伤害。屏障表面微微颤动，触碰者当即瘫软倒地。",
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
      description: "掌法中暗藏皮下毒囊，每一掌拍出不仅以力道伤人，更在接触瞬间灌入炼制的奇毒。掌法本身平平无奇，配上毒囊便成了江湖上最令人胆寒的近身杀招。",
      baseDamage: "105%",
      baseSpeed: "95%",
      attackBonus: 10,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_duchao_chousui",
          name: "抽髓三掌",
          pinyin: "chousui-sanzhang",
          description: "三掌连环，一掌深似一掌。第一掌破护体，第二掌注毒素，第三掌引爆前两掌残留之毒——三重苦楚叠加，中者蜷缩如虾，如骨髓被生生抽出。",
          qiCost: 55,
          cooldown: 4,
          damageType: "chemical",
          requirements: "药王谷毒章120级"
        },
        {
          id: "perf_duchao_sandu",
          name: "散毒",
          pinyin: "sandu",
          description: "双掌齐推，掌风中裹挟雾化的毒气，呈扇形向前方扩散。毒素自口鼻或肌肤渗入，中者各自毒发，时辰不一。",
          qiCost: 70,
          cooldown: 5,
          damageType: "aoe_dot",
          requirements: "药王谷毒章100级"
        },
        {
          id: "perf_duchao_bihuo",
          name: "碧火弹",
          pinyin: "bihuo-dan",
          description: "掌心凝聚一团高压毒液，掷出后在对手身上炸开，毒液四溅。空中拖出一道磷光尾迹——那是活体毒藻的冷冷萤火。",
          qiCost: 45,
          cooldown: 3,
          damageType: "chemical",
          requirements: "药王谷毒章80级"
        },
        {
          id: "perf_duchao_sanxiao",
          name: "三笑逍遥散",
          pinyin: "sanxiao-xiaoyaosan",
          description: "药王谷至高毒技——将三种奇毒炼入三段笑声。对手听到第一声笑，毒素潜伏入体；第二声，毒素苏醒蔓延；第三声，全身血脉剧毒同时发作。三笑过后，神仙难救。",
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
      description: "以奇毒模拟假死之境——气血降至冰点，周身如尸体冰冷僵硬。在对手以为你已毙命时，突然爆出致命一击。修习此功者体温常年低寒，心跳缓至常人三分之一而不倒。",
      baseDamage: "120%",
      baseSpeed: "85%",
      attackBonus: 12,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_duchao_jiashe",
          name: "假死",
          pinyin: "jiashe",
          description: "引动体内剧毒麻痹经脉，全身机能坠入假死之境——神识攻击与探查之术皆无法察觉。复苏后首次出手，力道翻倍。",
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
      description: "手法快如电闪，五指开合间将毒囊中的毒素精确涂于指尖。每一次触敌都是一次无声的注毒——无需破皮，毒素自毛孔渗入。",
      baseDamage: "90%",
      baseSpeed: "120%",
      attackBonus: 6,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_duchao_zhaixing",
          name: "摘星",
          pinyin: "zhaixing",
          description: "以不可思议的速度在对手身上连点数下，每一下都在不同穴位灌入不同毒素——麻痹、失明、迟缓、噤声——如摘星般精准而不可捉摸。",
          qiCost: 40,
          cooldown: 3,
          damageType: "multi_debuff",
          requirements: "摘星手100级"
        },
        {
          id: "perf_duchao_tantu",
          name: "弹指涂毒",
          pinyin: "tantu-tudou",
          description: "屈指弹出毒液微滴，十步之内可中的。微滴在空中自行崩散，化为一片肉眼不可见的毒雾。穿行其中者纷纷中毒。",
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
      description: "杖身暗藏毒液通道，杖头隐有喷口。每一杖挥出，不仅以力道伤人，更在击中时喷出一股毒雾。杖法源自西域苦寒之地，招式粗犷狠辣，到了药王谷手中，粗犷之上又添了几分阴毒。",
      baseDamage: "110%",
      baseSpeed: "90%",
      attackBonus: 8,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_duchao_tianshan",
          name: "活色生香",
          pinyin: "huose-shengxiang",
          description: "杖尖喷出一团色彩斑斓的毒雾，雾中混杂着迷魂之气。闻到者不仅中毒，还会生出美妙幻觉——香风阵阵、美人在侧——浑然不觉七窍已开始渗血。",
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
      description: "药王谷核心之学——将毒物的培育、融合、提纯之术编为一套完整的丹毒法门。从毒藻培育到毒虫杂交，从毒性增强到定向炼制——炼毒之术层层递进。药王谷说「炼毒即修炼」——毒越烈，灌入体内激发的抗性越强。",
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
      description: "身法轻灵如夜风，闪避时身形化为一道残影——不是快，是毒素模糊了对手双眼。移步换形之间，人如鬼魅。",
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
      description: "药王谷独门毒技——在身周布下一张由无数毒丝编织的隐形蛛网。入网者不仅中毒迟缓，其体内真气流动还会被毒丝感知并回传施术者——对手一举一动皆在掌握之中。",
      baseDamage: "50%",
      baseSpeed: "100%",
      attackBonus: 15,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_duchao_duwang",
          name: "毒网缠身",
          pinyin: "duwang-chanshen",
          description: "将蛛网阵收至极处，毒丝嵌入对手全身穴位，持续侵蚀并使其行动迟缓。毒丝同时将对手的气息回传——接下来数息之内，你对其出招了如指掌。",
          qiCost: 65,
          cooldown: 5,
          damageType: "dot_debuff",
          requirements: "蛛网阵120级"
        },
        {
          id: "perf_duchao_dushen",
          name: "毒神附体",
          pinyin: "dushen-futi",
          description: "将体内所有毒囊同时唤醒，剧毒涌入四肢百骸——周身萦绕一层幽幽毒芒。百毒不侵，每出一招皆带极烈毒性，力道暴涨。数息后毒气退散，人入虚弱。",
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
      title: "药王谷初级教习",
      teaches: ["化功大法", "冥域功", "摘星手", "摘星身法"],
      requirement: "道德值≤-5000，毒素抗性≥20",
      description: "药王谷最年轻的教习，脸上永远挂着甜美的笑容，一双眼睛却冷得像冰。她喜欢用自己的身子试毒，所以她的血可能是谷里最毒的一副。新人服毒仪式由她主持——她说这是「入门茶」。"
    },
    {
      id: "t_duchao_2",
      name: "丁春秋",
      title: "药王谷护法",
      teaches: ["化功大法", "药王谷毒章", "天山杖法", "蛛网阵"],
      requirement: "化功大法≥60级，药王谷毒章≥60级，道德值≤-30000",
      description: "药王谷的实际掌管者，一位将半生心血倾注于「血脉腐蚀」之法的老疯子。他的丹房在毒沼最深处，墙上爬满了活体毒藻。他欣赏聪明人，更欣赏狠人——「不毒则已，一毒到底」是他的格言。"
    },
    {
      id: "t_duchao_3",
      name: "李秋水",
      title: "药王谷掌门",
      teaches: ["化功大法", "药王谷毒章", "冥域功", "蛛网阵", "摘星手"],
      requirement: "蛛网阵≥150级，化功大法≥180级，道德值≤-100000，门忠≥1500",
      description: "药王谷的最高掌控者。传说她的身体已被奇毒完全炼化——她的每一滴血、每一次呼吸、每一次心跳都足以致命。她的容貌停留在炼化之时的模样，没人知道她在毒沼深处活了多少年。有人猜测她本身就是化功大法的最终成品——一个永远自我突破、永不死去的活毒。"
    }
  ],

  special_system: {
    name: "炼毒法门",
    description: "药王谷核心修行之法。在毒沼山洞中用毒液炼毒，需备照明之物。炼毒过程中毒素与体内之毒产生反应，可得修为与毒功经验。高深毒技可解锁毒虫融合——将数种毒虫与自身剧毒融合，创出独一无二的「本命毒素」。官府至今无法炼制通用解药——因为每个药王谷弟子的毒素配方皆是独门秘方。",
    commands: ["liandu — 炼毒，消耗毒液获取修为", "ronghe — 融合毒虫，创造本命毒素"]
  }
},

// ==================== 门派8：血禅寺 ====================
"血禅寺": {
  name: "血禅寺",
  mud_origin: "血刀门/大轮寺",
  type: "灵装赏金猎手公会·高速灵根游方修士集团",
  description: "藏边雪域的寒风穿过峡谷，发出如刀刃刮过铁石的尖啸——血禅寺因此得名。血禅寺猎手全身覆盖暗红铁甲——那不是颜料，是渗入铁甲纹理中的真血。每猎杀一个强敌，便将对方的心头血炼入自身护甲。额角嵌着一枚血色印记——那是身份的象征，也是燃血秘术的钥匙。",

  skills: [
    {
      id: "xuelian_force_1",
      name: "龙象频若功",
      pinyin: "longxiang-pinruocheng",
      type: "force",
      description: "源自密宗燃血秘术的十三层修为体系。每一层代表一重血炼境界——从基础的「象步」到终极的「龙变」。每突破一层，燃血之威随之暴增。",
      baseDamage: "130%",
      baseSpeed: "90%",
      attackBonus: 15,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_xuelian_longxiang",
          name: "龙象燃血",
          pinyin: "longxiang-chaopin",
          description: "唤醒额角血印，引燃全身血脉——力与速骤增，每一招皆带雷霆麻痹之效。数息后气血反噬，人入虚弱。",
          qiCost: 80,
          cooldown: 8,
          damageType: "super_buff",
          requirements: "龙象频若功120级"
        },
        {
          id: "perf_xuelian_13ceng",
          name: "十三龙象",
          pinyin: "shisan-longxiang",
          description: "龙象频若功第十三层至高奥义——同时唤醒全部十三重血炼回路。肉身迸出肉眼可见的血色光晕，全身功力翻倍。燃至极处，血印可能永久受损。",
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
      description: "血禅寺至高刀法——将自身血液中的真元通过血印灌入刀刃，斩击时刀身迸出刺目血光。每一刀需自损气血，但伤害与自损相称——血禅寺教众以自身为战场，祭血换杀。",
      baseDamage: "140%",
      baseSpeed: "105%",
      attackBonus: 20,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_xuelian_jixue",
          name: "祭血神刀",
          pinyin: "jixue-shendao",
          description: "割开额角血印窍穴，将鲜血灌入刀刃——刀刃瞬间迸出刺目血芒，力道骇人。代价是自身气血大损。血禅寺猎手的信条：先伤己，再伤人。",
          qiCost: 60,
          cooldown: 4,
          damageType: "physical_sacrifice",
          requirements: "血刀经100级"
        },
        {
          id: "perf_xuelian_shendao",
          name: "频刀穿芯",
          pinyin: "pindao-chuanxin",
          description: "刀刃发出震鸣，穿透护甲直攻对手经脉丹田。无视肉身防御，对傀儡化对手伤害倍增。中刀者短暂失神，四肢不受控制。",
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
      description: "将燃血之力化为掌心烈焰——每一掌挥出都带着灼烧经脉的高温气流。那火焰并非真火，而是真气极度凝聚后在空气中擦出的灼痕。被击中者不只是烧伤——更觉五脏如被沸水浇灌。",
      baseDamage: "120%",
      baseSpeed: "100%",
      attackBonus: 12,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_xuelian_daoqi",
          name: "活焰刀器",
          pinyin: "huoyan-daoqi",
          description: "双掌连环拍出，每掌在接触瞬间爆发灼热真气——三掌过后，对手经脉已呈「过热」之态：举手投足皆显迟滞，气力运转减半。",
          qiCost: 45,
          cooldown: 4,
          damageType: "debuff",
          requirements: "活焰刀100级"
        },
        {
          id: "perf_xuelian_ran",
          name: "活焰燃",
          pinyin: "huoyan-ran",
          description: "将掌心灼热提至极处，一掌印在对手胸口——高温穿透内甲直达心脉，造成极重的火毒伤害。中招者周身滚烫，如坠熔炉。",
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
      description: "密宗手法——手掌在拍出时暗含真言烙印，通过接触向对手心神写入「修罗令」。不是蛮力打击，而是对心智的侵袭——中招者短暂丧失神志，受施术者摆布。",
      baseDamage: "95%",
      baseSpeed: "110%",
      attackBonus: 8,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_xuelian_tianyin",
          name: "阿修罗天印",
          pinyin: "axiuluo-tianyin",
          description: "一掌印在对手额头，通过血印窍穴灌入「修罗真言」——中招者短暂陷入混乱，敌我不分，向身边最近之人出手。",
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
      description: "五指关节暗藏镇魂之力，抓握目标的瞬间释放冲击——直击颈部和头颅的经脉要穴。一爪下去，对手内息被强行截断，浑身气力溃散。",
      baseDamage: "115%",
      baseSpeed: "115%",
      attackBonus: 14,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_xuelian_liehou",
          name: "猎头",
          pinyin: "lietou",
          description: "五指锁死对手头颅，掌心镇魂之力尽数释放——对手经脉被强行截断数息，期间无法运转真气。这是血禅寺猎手的招牌绝技——此招一出，便可回去领赏了。",
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
      description: "藏边雪域淬炼出的潜行术——移动时将体温降至与冰雪无二，配合雪地藏身之法实现双重隐匿。在暴风雪中，血禅寺猎手就是雪本身。",
      baseDamage: "0%",
      baseSpeed: "120%",
      attackBonus: 0,
      defenseBonus: 14,
      performs: [
        {
          id: "perf_xuelian_xueyin",
          name: "雪隐",
          pinyin: "xueyin",
          description: "唤醒全身藏匿之法，将身形融入雪幕。隐匿期间不可出手，再现身时的第一击如鬼魅偷袭——对手不及反应，必定击中。",
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
      description: "五枚玄铁轮环套于双臂，可旋转掷出——每枚轮环都暗含追魂之术和爆裂之力。金轮在空中飞旋时发出令人胆寒的嗡鸣，那是轮缘上刻着的密宗咒文在高速旋转中自行诵唱。",
      baseDamage: "125%",
      baseSpeed: "85%",
      attackBonus: 16,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_xuelian_dazhuan",
          name: "五轮大转",
          pinyin: "wulun-dazhuan",
          description: "五枚金轮同时掷出，在空中织成一张攻击网——每枚轮各自追向对手周身不同要害。一击可同时截断五处经脉。",
          qiCost: 80,
          cooldown: 6,
          damageType: "multi_hit",
          requirements: "降伏轮120级"
        },
        {
          id: "perf_xuelian_wushuai",
          name: "电人五衰",
          pinyin: "dianren-wushuai",
          description: "降伏轮终极奥义——五枚金轮击中后同时爆发镇魂冲击。天、人、修、行、命——五衰齐至，对手周身功力步步衰减。",
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
      description: "一根玄铁铸就的巨型战杵，可伸缩——收时为短棍，放时为长枪。杵头沉重异常，击中目标时如有群山之力加持。常人一杵都举不起来。",
      baseDamage: "150%",
      baseSpeed: "70%",
      attackBonus: 22,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_xuelian_pozhen",
          name: "破阵",
          pinyin: "pozhen",
          description: "大力杵全力横扫，杵头在击中瞬间爆发泰山压顶之力——对目标造成巨创并击退数步。对铁甲和防御阵法有额外破坏之效。",
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
      description: "密宗秘术的根基——通过极致的神识刺激（大苦或大乐）突破经脉的承受上限。欢喜禅不是纵欲——是以极乐击碎经脉的自我保护，让猎手在战斗中承受远超常人的燃血之痛。",
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
      requirement: "体格≥30，提交一颗指定目标的心头血作为投名状",
      description: "血禅寺最活跃的猎头者，护甲上只有寥寥几道血纹——意味着他们的战绩簿还很薄。猎头者负责训练新人，传授基础的猎杀技巧和经脉弱点识破之术。他们的格言是：'别问猎物叫什么——那会让手变慢。'"
    },
    {
      id: "t_xuelian_2",
      name: "噬魂使",
      title: "血禅寺高阶猎手",
      teaches: ["龙象频若功", "血刀经", "活焰刀", "降伏轮", "无上大力杵"],
      requirement: "龙象频若功≥80级，血刀经≥60级，成功猎杀10个以上目标",
      description: "血禅寺的中坚力量，护甲上密布着数十道不同色泽的血纹——每一道都是一次成功的猎杀。噬魂使不再是单纯的「猎手」，而是「猎人」——他们会研究目标、制定策略、选择时机，然后一击毙命。"
    },
    {
      id: "t_xuelian_3",
      name: "血禅寺老祖",
      title: "血禅寺谷主·掌门",
      teaches: ["龙象频若功", "血刀经", "活焰刀", "降伏轮", "欢喜禅", "大手印"],
      requirement: "龙象频若功≥150级，血刀经≥150级，门忠≥2000",
      description: "血禅寺的绝对掌控者。老祖的真名早已无人知晓——他的护甲上积着厚达数寸的血纹，已看不出原本的铁色。传说老祖的「龙象频若功」已突破第十三层——这意味着他的血印可在不间断的燃血状态下运转，每一次心跳都是对自身的一次祭血。没有人见过他亲自出手——因为值得他出手的目标早已不存于世。"
    }
  ],

  special_system: {
    name: "祭血超载法门",
    description: "血禅寺核心战法。每次使用血刀经相关技能需消耗自身气血，消耗量与技能威力相称。祭血后进入「燃血」状态——杀伤力临时提升但持续流失气血。龙象频若功层次越高，燃血越久，虚弱越短。气血极低时，所有祭血技能自动获得威力加成——「垂死之刃，最为致命」。",
    layers: {
      "13层体系": {
        "1-3层": "基础燃血——祭血消耗高，威力加成低，燃血持续一息",
        "4-6层": "进阶燃血——祭血效率提升两成，燃血持续两息",
        "7-9层": "高阶燃血——祭血消耗减半，燃血持续三息",
        "10-12层": "大师燃血——祭血不再消耗气血而消耗真气，燃血持续四息",
        "13层": "龙变——祭血反而恢复气血（自敌人身上汲取），燃血不息"
      }
    }
  }
},

// ==================== 门派9：镜阁 ====================
"镜阁": {
  name: "镜阁",
  mud_origin: "慕容世家",
  type: "灵气拳贵秘密结社·金融/信息复合体",
  description: "苏州水乡深处，一片被玄妙阵罩覆盖的园林——远看只是寻常古典园林，近入方知是戒备森严的隐秘城邦。镜阁弟子着明代丝绸长袍，长袍下暗藏各大世家尚未流出的上乘护甲。他们的折扇并非装饰——每把扇骨都是一组定向阵旗，展开便是移动阵法。",

  skills: [
    {
      id: "douzhuan_force_1",
      name: "频元功",
      pinyin: "pinyuan-cheng",
      type: "force",
      description: "镜阁核心内功心法——以真气反演之道重构内力流转。不创造力量，而是精确量测并引导一切涌入自身的内力攻击。练至大成可在一息之间完成对任意攻击的道韵解析与反向输出。",
      baseDamage: "105%",
      baseSpeed: "100%",
      attackBonus: 5,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_douzhuan_hailao",
          name: "大海捞针",
          pinyin: "dahai-laozhen",
          description: "释放一缕极细微的探查真气，感知周围一切暗藏的机关、陷阱和隐匿之人。在这信息即生死的江湖，这一手是镜阁的第一道护身符——知己知彼。",
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
      description: "指尖暗含微细真气探针，一指点出便是向对手经脉写入一段「参合真言」——这段真言会迫使对手的内力运转泄漏于镜阁的感知范围。既是攻击，也是探查。慕容世家千年武学，化为最优雅的真气劫持之术。",
      baseDamage: "100%",
      baseSpeed: "110%",
      attackBonus: 8,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_douzhuan_canshang",
          name: "参商",
          pinyin: "canshang",
          description: "双指齐出——一指灌入劫持真言，一指写入自毁心诀。若第一道真言被护体罡气挡住，第二道即刻引发：对手的经脉被「参商」法门锁定，陷入永无止境的回旋——周而复始，直至真气耗尽。",
          qiCost: 60,
          cooldown: 5,
          damageType: "silence_loop",
          requirements: "参合指120级"
        },
        {
          id: "perf_douzhuan_xiuzhong",
          name: "袖中指",
          pinyin: "xiuzhong-zhi",
          description: "在广袖遮掩下无声点出一指——此招无预兆、无真气波动、无任何痕迹。被击中者甚至不知自己已遭暗算，直到数日后自查经脉，才发现内力运转的流向已被人窥探殆尽。",
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
      description: "慕容世家传承的剑法精髓，化为七套封印攻击之法。每一剑不仅是一次伤敌，更在接触瞬间运转一次灌注尝试：若对手功法与封印相生，则后续攻击可无视半数防御。",
      baseDamage: "110%",
      baseSpeed: "105%",
      attackBonus: 10,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_douzhuan_jianyu",
          name: "七剑连环指",
          pinyin: "qijian-lianhuanzhi",
          description: "七剑连环——每剑在击中后为下一剑积蓄攻势，七剑一剑快过一剑。第七剑时出剑已是初始的三倍之速，且可短暂制住对手心志。",
          qiCost: 70,
          cooldown: 6,
          damageType: "multi_accelerate",
          requirements: "斗转家传剑法130级"
        },
        {
          id: "perf_douzhuan_liuxing",
          name: "流星快剑",
          pinyin: "liuxing-kuaijian",
          description: "剑身快如流星——这一剑看似普通攻击，实则暗中在对手经脉中埋下一处后门。数息之后后门开启，下次出手势必暴击且无视护体。这便是镜阁的风格——不急着杀你，先确保随时能杀你。",
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
      description: "慕容世家「以彼之道还施彼身」的刀法境界——非独创刀法，而是将情报网中搜集的各门各派刀法融合为应变的攻击法门。对手用何种刀，百家刀法便用克制的反制刀回应。",
      baseDamage: "105%",
      baseSpeed: "100%",
      attackBonus: 7,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_douzhuan_qixing",
          name: "刀影七星",
          pinyin: "daoying-qixing",
          description: "七道刀影同时斩出——其中六道是幻象虚招，一道是真身攻击。对手无法分辨真假，只能赌。而镜阁最擅长的就是让你每次都赌错。",
          qiCost: 50,
          cooldown: 4,
          damageType: "multi_confuse",
          requirements: "百家刀法100级"
        },
        {
          id: "perf_douzhuan_daoying",
          name: "刀芒剑影",
          pinyin: "daomang-jianying",
          description: "刀身在挥舞中不断变换攻伐之韵——沉、轻、疾、缓，在瞬息之间试探对手护体罡气的所有破绽。一旦找到裂口，刀势便如山崩般灌入，从内部将对手护体震碎。",
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
      description: "镜阁的情报功法库——苏州燕子坞地下三层的机密中枢。修习此道可解锁水阁子网的使用权限，提升所有镜阁技能的反射与反制效率。水阁中存储着从各门派搜集的情报——知道得越多，斗转星移的威势越强。",
      baseDamage: "0%",
      baseSpeed: "100%",
      attackBonus: 3,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_douzhuan_jiechi",
          name: "真气劫持",
          pinyin: "zhenqi-jiechi",
          description: "展开折扇阵旗，干扰方圆百丈内的所有传音入密与真气传讯——数息之内，范围内的对手无法使用任何需要神识沟通的技能。这是镜阁的终极羞辱——让对手退回「聋哑」之境。",
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
      description: "慕容世家轻功——在受到攻击的瞬间，身法自动推算最优闪避方向并付诸行动。说是「闪躲」，不如说是被无形之手「引」到了安全之处。优雅精准，如流水绕过礁石。",
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
      description: "慕容世家至高绝学——在自身经脉中创建反向真气回路，将对手的攻击原路折射而回。攻击越强，折射越烈。这不是防御，而是将对手的兵器变为自己的兵器——以彼之道、还施彼身。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 20,
      defenseBonus: 20,
      performs: [
        {
          id: "perf_douzhuan_yi",
          name: "星移",
          pinyin: "xingyi",
          description: "在周身布下真气折射之场——此际受到的一切攻击（拳脚、毒功、真气）均有概率原路折返。折射之威与原始伤害相称，功效随境界提升而延长。",
          qiCost: 50,
          cooldown: 4,
          damageType: "reflect",
          requirements: "斗转星移80级"
        },
        {
          id: "perf_douzhuan_douzhuan",
          name: "斗转",
          pinyin: "douzhuan",
          description: "不仅折射攻击，还在折射的真气中嵌入镜阁的追魂印记——对手收到自己攻击的回击时，其经脉同时被镜阁渗透。此后镜阁对其出手，伤害大增。",
          qiCost: 70,
          cooldown: 6,
          damageType: "reflect_infect",
          requirements: "斗转星移120级"
        },
        {
          id: "perf_douzhuan_bishen",
          name: "彼身",
          pinyin: "bishen",
          description: "斗转星移终极形态——不折射攻击，而是完全复制对手的攻击之法并于同一回合内还施彼身。对手用何种武功，你便用何种武功回敬——但附加了镜阁的洞察与优化，威力更增两成。",
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
      description: "慕容氏剑法中的轻灵路数——剑尖在空中划出的轨迹如柳絮飘飞，无迹可寻。剑身与微风共舞，每一次挥出都融入四周的气流，让对手完全无法预判——预测之术里没有「柳絮」这个变数。",
      baseDamage: "95%",
      baseSpeed: "120%",
      attackBonus: 9,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_douzhuan_liuxu",
          name: "柳絮漫天",
          pinyin: "liuxu-mantian",
          description: "剑尖在空气中布下数十道微弱的真气残影——每一处都是一个幻象假身。对手的攻击预判之术被漫天虚像淹没，闪避大增。",
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
      requirement: "悟性≥25，福缘≥20，由镜阁内部弟子引荐",
      description: "镜阁的外务负责人，以毒舌闻名于世。表面上他只是一个爱说反话的老头，实际上他的神识连接着镜阁的「还施水阁」——每一次看似随口的讥讽，都可能是一次精心设计的试探。"
    },
    {
      id: "t_douzhuan_2",
      name: "慕容复",
      title: "镜阁少主",
      teaches: ["频元功", "参合指", "斗转身法", "斗转家传剑法", "百家刀法", "柳絮剑法"],
      requirement: "频元功≥60级，参合指≥60级，门忠≥500",
      description: "慕容世家的当代少主，将「以彼之道还施彼身」发挥到极致的俊杰。他的折扇是镜阁最强的定向阵旗——据说展开时可同时压制方圆百丈内的一切传音之法。他的分身在江湖各处行走，你永远分不清哪个是真人、哪个是幻象。"
    },
    {
      id: "t_douzhuan_3",
      name: "慕容博",
      title: "镜阁掌门·还施水阁掌管者",
      teaches: ["频元功", "参合指", "斗转星移", "斗转家传剑法", "百家刀法"],
      requirement: "频元功≥150级，斗转星移≥120级，门忠≥1500，经验≥1M",
      description: "慕容世家的幕后掌控者，也是镜阁「还施水阁」的最高掌管者。传说他的意识已部分融入水阁的古阵之中——这意味着他几乎掌握了大明每个贵胄的把柄。他极少露面，但苏州燕子坞的每一片树叶的颤动都在他的感知之下。"
    }
  ],

  special_system: {
    name: "斗转星移·真气折射法门",
    description: "镜阁核心战法。在受到任何攻击时，斗转星移自动进行道韵分析，并依据功法境界概率折射攻击。折射的真气中自动嵌入追魂印记——对手在承受折射伤害的同时，其经脉被镜阁渗透。境界越高，折射概率越大、折射伤害越强、嵌入印记越隐蔽。",
    levels: {
      "1-80级": "折射概率一成半，折射伤害三成",
      "81-120级": "折射概率二成半，折射伤害五成，轻微追魂印记",
      "121-180级": "折射概率四成，折射伤害七成，中度追魂印记",
      "181+级": "折射概率六成，折射伤害十成，深度追魂印记+可复制对手招式"
    }
  }
},

// ==================== 门派10：归墟 ====================
"归墟": {
  name: "归墟",
  mud_origin: "古墓派",
  type: "鬼市·地下渗透组织",
  description: "终南山脉地下深处，一段被历史遗忘的明代废弃隧道——总长据保守估计超过三百里。归墟弟子在黑暗中无声移动，衣衫上覆盖着暗色苔衣涂层，移动时没有关节的咯吱声——他们以牺牲气力换取完全的静谧。进入、行事、消失——没人知道他们来过。",

  skills: [
    {
      id: "yingmu_force_1",
      name: "玉女心经",
      pinyin: "yunv-xinma",
      type: "force",
      description: "归墟女弟子的专属内功心法——将情感起伏化为真气输出。心如止水则内息平稳，情丝波动则内息如潮。修至深处可进入「静默之境」——全身真气收敛至若有若无，如同从世间消失。",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_yingmu_xinjing",
          name: "心经",
          pinyin: "xinjing",
          description: "唤醒玉女心经中的「静默之境」——攻防、身法、悟性悉数提升三成。女子施展此术效果倍增。在归墟之道中，「静」不是无力——是最极致的蓄力。",
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
      description: "源自上古「九阴」密典——以九层心法逐层解除经脉的天然约束。每解除一层，便释放一部分被肉身主动压制的潜能。男弟子以此为主修内功——因玉女心经对男子有天然削弱。",
      baseDamage: "120%",
      baseSpeed: "100%",
      attackBonus: 10,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_yingmu_yihun",
          name: "移魂",
          pinyin: "yihun",
          description: "释放一缕经过精密调制的迷魂真气，直入对手识海——对手陷入「魂不守舍」之态：无法动弹、无法出招。受击后苏醒。",
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
      description: "看似柔美如舞的拳法——实则每一招都暗藏杀机，以精妙的角度绕过对手神识防御直击心神。拳路设计利用了人体本能的盲区——对手的目光在处理这些动作时会产生一瞬的迟疑，而这一瞬便是生死之隔。",
      baseDamage: "100%",
      baseSpeed: "115%",
      attackBonus: 7,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_yingmu_shexin",
          name: "摄心",
          pinyin: "shexin",
          description: "美女拳的精髓——三连击的每一击都向对手心神灌入暗示：第一击削弱斗志，第二击模糊判断，第三击植入恐惧。三击全中则对手心神失守——出招准头大降。",
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
      description: "以极致悲伤和绝望驱动的掌法——受伤越重，掌力越猛。每损一分气血，掌力便增一分。这不是术，是以「痛苦」为柴薪的悲愤一击——越是痛不欲生，掌风越是凌厉。",
      baseDamage: "130%",
      baseSpeed: "85%",
      attackBonus: 15,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_yingmu_anran",
          name: "黯然",
          pinyin: "anran",
          description: "将全身的绝望和痛苦于一掌中尽数释放。气血越低，伤害越烈——命悬一线之际，掌力暴涨数倍。掌风过处，连空中尘埃都似乎凝滞了一瞬——那是极寒真气冻结了四周。",
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
      description: "归墟至高剑法——双剑合璧时引动「玉女素心剑法」：两把剑的真气通过隐秘通道实时感通，每一次出剑都是双方功力的叠加。单独使用已属顶尖，双剑合璧时——攻伐翻倍、力道翻倍、准头翻倍。",
      baseDamage: "115%",
      baseSpeed: "110%",
      attackBonus: 12,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_yingmu_suxin",
          name: "素心",
          pinyin: "suxin",
          description: "双剑合璧——需与另一归墟弟子联手施展。双剑交替攻出，出剑之速倍增，每次攻击各自计算要害。二人共用寒气缩减——彼此的剑在气息层面是一体的。",
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
      description: "归墟基础轻功——将移步之道化为无形推算，每一步前已预判所有可能的威胁方向，选择最不易被击中的路径。闪避不是在「躲」，而是在解一道不断变幻的迷局——你永远不在最可能被击中的位置。",
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
      description: "归墟高阶轻功——移动时唤醒全身苔衣涂层，配合闭气敛息之法，实现目不可视、耳不可闻、气不可感的彻底隐匿。不是跑得快，而是跑得「不存在了」——从你离开原位的那一刻起，世间一切探查之法皆已失去你的踪迹。",
      baseDamage: "0%",
      baseSpeed: "110%",
      attackBonus: 5,
      defenseBonus: 15,
      performs: [
        {
          id: "perf_yingmu_wuhen",
          name: "无痕",
          pinyin: "wuhen",
          description: "唤醒全套隐匿之法——苔衣蔽形、闭气敛息、真气压制同时运转。进入完全隐匿状态，隐匿期间可移动和蓄势但不能出手。现身时的第一击必中。",
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
      description: "鞭法中暗含封印之力——每一次鞭响，都有一段禁制通过空气震波传向对手。鞭梢触皮瞬间释放真气，不伤皮肉却已锁住经脉。恨意不是情绪——是鞭法中最有效的封印真言。",
      baseDamage: "100%",
      baseSpeed: "105%",
      attackBonus: 8,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_yingmu_hen",
          name: "恨",
          pinyin: "hen",
          description: "一鞭抽出，鞭身在空中划出封印真气之波——中招者陷入「愤恨」：强制攻击施鞭者，但每次命中后自身也承受反噬。以彼之恨，攻彼之心。",
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
      description: "银索为鞭，金铃为镇魂之器——每一枚金铃都是一颗特制的扰神铃铛。银索挥出时金铃齐鸣，发出特定的扰魂音韵——这个音韵恰好能让人周身经脉迟滞。听到铃声者，出手速度大减。",
      baseDamage: "95%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_yingmu_suo",
          name: "锁",
          pinyin: "suo",
          description: "银索缠绕对手，金铃释放最强扰魂之音——对手被「锁」在原地动弹不得，浑身气力持续衰减。这是归墟最优雅的困敌之术——不是靠蛮力锁住你，而是让你的身体以为你已不能动。",
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
      title: "归墟寒玉区教习",
      teaches: ["玉女心经", "美女拳", "玉女剑法", "捕雀功", "长恨编法", "银索金铃"],
      requirement: "定力≥30，容貌≥25，经验≤500000时方可拜入",
      description: "归墟寒玉区的掌管者，在终南山地下冰窟中修炼了二十年的女修。她的皮肤因终年不见日光而苍白得近乎透明——皮下隐隐可见寒气流转的微光。她的话极少，每一句都是精炼的信息，从无冗余——就如她写的法诀。"
    },
    {
      id: "t_yingmu_2",
      name: "杨过",
      title: "归墟断臂区教习",
      teaches: ["九经心经", "黯然销魂章", "暗影身法"],
      requirement: "九经心经≥80级，黯然销魂章≥60级，经历至少一次重大挫败",
      description: "归墟唯一的男教习。他的右臂是归墟最特殊的存在——不是替换，是异化。断臂处接驳的异物内藏无声暗刃和独立心诀——他的右臂与心神之间有一条旁人无法窥探的隐秘通道。"
    },
    {
      id: "t_yingmu_3",
      name: "林朝英",
      title: "归墟掌门·终南隧道守护者",
      teaches: ["玉女心经", "九经心经", "玉女剑法", "黯然销魂章"],
      requirement: "玉女心经≥180级，玉女剑法≥180级，门忠≥2500，完成「入墓」试炼",
      description: "归墟的创始者——或者说，创始者的残念。真正的林朝英早已仙逝，但她将一缕意念刻入了终南山地下最深处的古阵之中。她以幻影之形出现在归墟最隐秘的殿堂里——面目栩栩如生，声音如三十年前的余音。没人知道这缕残念还能存续多久。"
    }
  ],

  special_system: {
    name: "静默法门·真气敛息法",
    description: "归墟核心能力——通过玉女心经唤醒的「静默之境」，将全身的真气波动、体热、声响收敛至若有若无。敛息期间无法主动出手，但也几乎不可能被发现。在渗透行事中，敛息法是归墟弟子活着进出的唯一倚仗。",
    silent_levels: {
      "1-60级": "真气收敛五成，热息可见，气感可察",
      "61-120级": "真气收敛七成半，热息微弱，气感微弱",
      "121-180级": "真气收敛九成，热息不可见，气感不可察",
      "181+级": "真气收敛至若有若无，彻底隐匿——天罗地网也无法锁定"
    }
  }
},

// ==================== 门派11：青囊庐 ====================
"青囊庐": {
  name: "青囊庐",
  mud_origin: "峨眉派",
  type: "生物符修医疗教团",
  description: "川蜀深山中，一片被竹林环绕的纯白院落群——宛如世外桃源。青囊庐医者穿着灵蚕丝白袍，袍面隐隐流转着代表患者生机的光纹。她们的手可同时运转十二种医道法诀。治愈是最高的修行：伤人只须一个破绽，救人却须懂得全部。",

  skills: [
    {
      id: "yaowang_force_1",
      name: "临济十二庄",
      pinyin: "linji-shierzhuang",
      type: "force",
      description: "青囊庐至高内功——临济禅院的十二种「庄法」实为十二套针对不同体质与伤势的医道法门。六种主力庄法（大小、风云、洞鹤、天地、幽冥、之心）各掌一种疗愈方式。是青囊庐女尼的立足之本。",
      baseDamage: "105%",
      baseSpeed: "100%",
      attackBonus: 5,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_yaowang_daxiao",
          name: "大小庄",
          pinyin: "daxiao-zhuang",
          description: "释放疗愈真气，向周围所有同道广播「大小庄」修复法诀，每息恢复一定气血。阵营战中，青囊庐女尼便是一座活动的回春之泉。",
          qiCost: 60,
          cooldown: 4,
          damageType: "aoe_heal",
          requirements: "临济十二庄80级"
        },
        {
          id: "perf_yaowang_fengyun",
          name: "风云庄",
          pinyin: "fengyun-zhuang",
          description: "体内真气灌入周身肌肉筋骨，身法与反应大幅提升。庄法持续间，闪避大增，出招迟滞锐减。云从龙，风从虎——风云之中，身如幻影。",
          qiCost: 45,
          cooldown: 5,
          damageType: "speed_buff",
          requirements: "临济十二庄100级"
        },
        {
          id: "perf_yaowang_tiandi",
          name: "天地庄",
          pinyin: "tiandi-zhuang",
          description: "临济十二庄最实用的庄法——在内息层面优化真气运转回路，使一切招式不耗内力。加力不耗气、出招不损元。持续三息——这三息之内，你便是一口永不枯竭的灵泉。",
          qiCost: 80,
          cooldown: 8,
          damageType: "super_buff",
          requirements: "临济十二庄150级"
        },
        {
          id: "perf_yaowang_youming",
          name: "幽冥庄",
          pinyin: "youming-zhuang",
          description: "将本命真气转入「幽冥」模式——不参与外战，而是潜入骨髓深处对根本体质进行精确修复。运转时不可出手，但可永久提升先天资质。是青囊庐最珍贵的自我升华之术——据说每次幽冥庄运转，都是一次微小的脱胎换骨。",
          qiCost: 100,
          cooldown: 20,
          damageType: "permanent_buff",
          requirements: "临济十二庄180级"
        },
        {
          id: "perf_yaowang_zhixin",
          name: "之心庄",
          pinyin: "zhixin-zhuang",
          description: "本命真气滋养神识通路——悟性大幅提升，一切知识类功法修炼速度倍增。庄法唤醒时，瞳孔之中闪过一片温润的玉色光华——那是灵智在生长。",
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
      description: "九层心法——与归墟同源的古老密典，在青囊庐被重新阐释为医道之用。在青囊庐手上，九经心经的主要用途不是攻伐，而是「移魂」——一种精密的安抚之术，可将对手的心神从「狂暴」抚为「平和」。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_yaowang_yihun",
          name: "移魂",
          pinyin: "yihun",
          description: "释放一缕精调的心神安抚真气——对手进入「移魂」状态：攻击欲望大减，一切招式运转迟滞。青囊庐的手法更温和、更持久——毕竟是用来「安抚」的，不是用来「杀伤」的。",
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
      description: "青囊庐在「九阳」根基上融入医道改进的独门内功。兼具九阳的浑厚与青囊的精细——内力恢复比寻常内功快四成，同时对毒素和疫病的抵抗力大增。「明灯」之术可驱散一切负面之态。",
      baseDamage: "115%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_yaowang_mingdeng",
          name: "明灯",
          pinyin: "mingdeng",
          description: "体内本命真气释放「净化之辉」——清除自身及周围同道的一切负面状态（中毒、麻痹、迷乱、虚弱）。辉光源自青囊庐的深厚根基——每一次明灯都是对自身修为的一次「大扫除」。",
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
      description: "掌力看似绵柔如絮，实则掌心暗含数以万计的细小真气之针——在接触瞬间完成对对手经脉的诊断，然后精确选择最脆弱之穴释放冲击。绵里藏针不是形容——每一掌都挟带着无数细针，在对手体内寻隙而入。",
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
      description: "指尖释放一道极细的罡气之束，精确命中对手穴位——在修行语境中，「穴位」即经脉的关键所在。被点中者对应肢体短暂失灵，如一处灯火被精确吹灭。",
      baseDamage: "95%",
      baseSpeed: "115%",
      attackBonus: 6,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_yaowang_lingkong",
          name: "凌空指穴",
          pinyin: "lingkong-zhixue",
          description: "隔空点穴——指尖释放聚焦罡气，十步之外精确命中对手经脉要穴。对手功力被强制压制，一切招式运转迟滞。命中率和持续时间随电罡指境界提升。",
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
      description: "九式手法，每一式对应一种「截断」——截气血、截内力、截神识、截真气。不是攻击，而是精确的「刀术式切断」——在战场上，截手九式的作用是为后续的大招清理干净的空间。",
      baseDamage: "90%",
      baseSpeed: "120%",
      attackBonus: 5,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_yaowang_foguang",
          name: "佛光普照",
          pinyin: "foguang-puzhao",
          description: "截手九式的终极合击——九式合一，双掌齐推，掌中真气之针如日光般向对手倾泻诊断与攻击双重之力。造成的伤势深入骨髓——因为这本就是一次精密的活体解剖，只不过剖在了对手的全身。",
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
      description: "青囊庐至高剑法——剑身暗含感知之力，在挥剑时感应对手的气息流转（心跳、呼吸、内力波动）并实时调整剑路。如春风拂柳——看似轻柔不可捉摸，实则每一剑都落在对手防御最薄弱的那一瞬。",
      baseDamage: "110%",
      baseSpeed: "110%",
      attackBonus: 12,
      defenseBonus: 5,
      performs: [
        {
          id: "perf_yaowang_miejian",
          name: "灭剑",
          pinyin: "miejian",
          description: "青囊庐最强封禁之术——一剑刺出，剑身在命中前完成对对手经脉最脆弱之处的诊断，然后剑尖释放镇魂之力将其击溃。命中后对手一切功法和招式被封禁数息。这是江湖上最令人胆寒的「一剑寂灭」。",
          qiCost: 75,
          cooldown: 6,
          damageType: "silence",
          requirements: "回锋拂柳剑150级"
        },
        {
          id: "perf_yaowang_fuliu",
          name: "拂柳",
          pinyin: "fuliu",
          description: "剑势如微风拂柳——连续五剑，每剑命中后为下一剑积蓄对对手的感知之力。第五剑时威力加成达到最高，且附带「心神疲惫」之效——对手闪避逐剑递减。",
          qiCost: 55,
          cooldown: 4,
          damageType: "combo_debuff",
          requirements: "回锋拂柳剑100级"
        },
        {
          id: "perf_yaowang_huifeng",
          name: "回锋",
          pinyin: "huifeng",
          description: "一剑刺出后剑路突然折返——不是因为手腕变化，而是因为剑身在击中瞬间感知到了比原定目标更脆弱的次要穴位。剑路实时变换——如在半空中折翼的燕子。",
          qiCost: 50,
          cooldown: 3,
          damageType: "pierce_redirect",
          requirements: "回锋拂柳剑120级"
        },
        {
          id: "perf_yaowang_juejian",
          name: "绝剑",
          pinyin: "juejian",
          description: "灭剑的终极强化——当对手气血不足三成时引发「绝剑」之效：灭剑之威翻倍，封禁时间翻倍。青囊庐女尼不嗜杀——但当真要出手时，一剑封喉，绝不留情。",
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
      description: "刀法如雁阵飞行——双刀齐出时刀路成双轨并行，一刀负责攻击，一刀同时感知对手反应并将结果回传。与回锋拂柳剑互备时可引动「刀芒剑影」——刀剑合一，威力再攀一阶。",
      baseDamage: "105%",
      baseSpeed: "105%",
      attackBonus: 8,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_yaowang_heji",
          name: "刀芒剑影",
          pinyin: "daomang-jianying",
          description: "刀剑合璧——雁行刀与回锋拂柳剑同时运转，刀芒与剑影在空中交织为一道攻击之网。造成两次独立的伤害（一伤刀、一伤剑），且第二次伤害享受第一次命中后的加成。这便是青囊庐的「双向诊断」——刀探路、剑出手。",
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
      description: "青囊庐独门轻功——闪避时在移动路径上留下大量疗愈真气凝成的微粒。闪避成功不仅避开伤害，还将空气中回收的劲力转化为真气储备——躲得越多，内力越足。这便是青囊庐的「以退为进」。",
      baseDamage: "0%",
      baseSpeed: "115%",
      attackBonus: 0,
      defenseBonus: 12,
      performs: [
        {
          id: "perf_yaowang_huashen",
          name: "化身",
          pinyin: "huashen",
          description: "闪避成功时，在移动路径上留下一个由真气凝聚的幻象分身——分身承受当前气血的三成，可吸引对手攻势二息。每一次闪避都是一次「分身备份」——青囊庐女尼，永远不止一人。",
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
      description: "青囊庐出品的镇魂之器——非火药，而是灵玉注满真气后释放的冲击。掷出后在目标区域炸开，对区域内一切目标造成镇魂伤害——对手身上的异物越多，伤害越高。据说霹雳弹的配方源自青囊庐与药王谷的一次「秘术交流」——但双方都不承认。",
      baseDamage: "120%",
      baseSpeed: "90%",
      attackBonus: 10,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_yaowang_tan",
          name: "弹",
          pinyin: "tan",
          description: "弹指射出三枚霹雳弹——三弹在空中自动分散为三角阵型覆盖目标区域。爆炸后叠加释放三重镇魂冲击，对傀儡化对手的伤害和瘫痪之效逐次递增。这是青囊庐最不像「医」的技能——但在战场上，最好的医术就是让敌人再也站不起来。",
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
      description: "青囊庐的精神修炼体系——「大乘」是疗愈真气的最高级协同法门，「涅磐」是生命体在极端损伤后的重生之道。修习此功可大幅提升气血上限，并解锁青囊庐最核心的「法门还原」秘术——在体魄层面创建生机烙印。",
      baseDamage: "0%",
      baseSpeed: "100%",
      attackBonus: 3,
      defenseBonus: 8,
      performs: [
        {
          id: "perf_yaowang_huan",
          name: "法门还原",
          pinyin: "shendai-huanyuan",
          description: "青囊庐的至高救治之术——唤醒预植的生机烙印，在半刻之内将目标全身肌骨状态回溯至最近的生机烙印点。效果等同「起死回生」——但每次消耗海量真气修炼，且还原后丢失烙印点之后的一切记忆。",
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
      title: "青囊庐初级教习",
      teaches: ["临济十二庄", "金顶绵章", "截手九式", "诸电化身法", "九经心经"],
      requirement: "女子，悟性≥25，根骨≥20",
      description: "青囊庐入门弟子的引路人。文虚师太的指尖始终轻抚着新弟子的脉门——她在传道的同时实时感知每个弟子的气血状况。她的格言是：「先学会治自己，再学会治别人，最后才学如何让敌人需要被治。」"
    },
    {
      id: "t_yaowang_2",
      name: "灭绝师太",
      title: "青囊庐首席医者",
      teaches: ["临济十二庄", "药王九阳功", "电罡指", "回锋拂柳剑", "雁行刀", "霹雳弹", "大乘涅磐功"],
      requirement: "临济十二庄≥100级，回锋拂柳剑≥80级，门忠≥500",
      description: "青囊庐的实际掌管者——一位在疗愈与武修两域都登峰造极的医修。灭绝师太的名字不是形容她的残忍，而是形容她面对「难症」时的决绝——「治不好的，莫拖。能治的，不留到明日。」她的法器「倚天」是青囊庐最强的疗愈之物——据说能在一次心跳内完成一次完整的经脉修复。"
    },
    {
      id: "t_yaowang_3",
      name: "药王祖师",
      title: "青囊庐掌门·至高医者",
      teaches: ["临济十二庄", "药王九阳功", "大乘涅磐功", "回锋拂柳剑", "电罡指"],
      requirement: "临济十二庄≥200级，大乘涅磐功≥180级，门忠≥3000，完成「法门还原」实操",
      description: "青囊庐的创始者——或者说，青囊庐疗愈之力的最高权限掌管者。药王祖师的身份是一个谜：有人说她早已将意识刻入了青囊庐的古阵之中，有人说这是一个世代传承的称号而非特定之人。但有一点确实无疑——任何在她面前倒下的伤者，只要还有一丝生机，她就能将其从鬼门关拉回来。"
    }
  ],

  special_system: {
    name: "法门还原·生机烙印",
    description: "青囊庐的至高医道秘术——通过预植的生机烙印，为目标创建实时体魄状态备份（烙印点）。当目标遭受致命损伤时，唤醒还原之术将全身肌骨状态回溯至最近的烙印点。每次还原消耗大量真气与患者体力。烙印点有效期十二时辰——过期自行消散。这便是青囊庐在江湖享有「中立豁免」的原因：任何一个门派都可能在某一日需要一次起死回生。",
    requirements: "大乘涅磐功≥150级，临济十二庄≥150级"
  }
},

// ==================== 门派12：傀坊 ====================
"傀坊": {
  name: "傀坊",
  mud_origin: "桃花岛",
  type: "自主机器人公社",
  description: "东海之上，一座被浓雾和阵罩笼罩的人工岛。天空中永远悬浮着数百只处于待命状态的机关飞鸢——远远看去像一群沉默的海鸥。岛上一切井然有序：从部件锻造到组装到校验，由岛上的中枢阵灵「黄药师」统一调度。凡躯是一重境界——傀儡是二重：可替换、可升级、可量产。弹指之间，可召出一支傀儡大军。",

  skills: [
    {
      id: "jiqiao_force_1",
      name: "碧骇心经",
      pinyin: "bihai-pincheng",
      type: "force",
      description: "傀坊至高内功——将东海潮汐之力化为内力循环心诀。潮起则攻、潮落则守，内力流转如海中暗流——永远在最隐秘的路径上以最高效率穿行。「碧骇」二字，海之碧是表象，深之骇才是真相。",
      baseDamage: "115%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 6,
      performs: [
        {
          id: "perf_jiqiao_qimen",
          name: "奇门迷阵",
          pinyin: "qimen-mizhen",
          description: "运转碧骇心经中的「奇门」子诀——在身周投射一座幻象迷阵，自身方位在阵中不断变换，对手的一切攻击均有概率落空。同时迷阵会持续解析对手的出手路数——解析越多，后续迷阵之威越强。",
          qiCost: 55,
          cooldown: 5,
          damageType: "confuse_field",
          requirements: "碧骇心经100级"
        },
        {
          id: "perf_jiqiao_powerup",
          name: "潮生",
          pinyin: "chaosheng",
          description: "以东海的潮汐之力驱动内力循环——攻击与防御同时提升，持续三息。潮起时攻如排山倒海，潮落时守如礁石岿然。效果随奇门八卦境界提升。",
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
      description: "掌法如桃花岛上落英缤纷——每一掌在空中划过的轨迹都不可预测。掌力中暗藏傀儡飞鸢的控制之法：一掌劈空之时，已有数只袖珍飞鸢悄然飞至对手视野死角。「落英」不是花瓣——是飞鸢群划破空气时留下的淡淡尾迹。",
      baseDamage: "110%",
      baseSpeed: "105%",
      attackBonus: 10,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_jiqiao_pikong",
          name: "劈空",
          pinyin: "pikong",
          description: "一掌凌空劈出——掌心释放定向罡气，配合暗中召来的三只微型飞鸢从对手背后同时发动攻势。对手感受到的是一掌接一掌的正面掌力，实则四面皆敌——内劲穿透一切外护。需解封后方可习得。",
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
      description: "手法优雅如拈花——指尖暗含微细扰神之力，轻拂对手穴位时不破皮不伤肉，却已将「拂穴真言」写入对手经脉。兰花不是花——是指尖释放扰神之力时空气被激起的淡淡幽光。",
      baseDamage: "85%",
      baseSpeed: "130%",
      attackBonus: 5,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_jiqiao_fuxue",
          name: "拂穴",
          pinyin: "fuxue",
          description: "兰花般轻柔地拂过对手经脉要穴——不造成外伤，但对手的气力被锁死在极低水平，无法施展耗费巨大的招式。效果持续数息——这数息之内，对手如同被拔了牙的毒蛇。",
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
      description: "傀坊的标志性技能——一个弹指动作，实为通过指尖向飞鸢群发送攻伐号令。在外人看来只是一弹指，但在冥冥之中——这一弹指唤醒了百余只飞鸢。「弹指」即「号令」——最微小的手势，召唤最大的武力。",
      baseDamage: "105%",
      baseSpeed: "120%",
      attackBonus: 9,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_jiqiao_tan",
          name: "弹指",
          pinyin: "tanzhi",
          description: "弹指射出微型真气弹——击中对手后不仅造成外劲伤害，更自动震落对手手中的兵刃（真气弹附着在兵刃上释放干扰之力）。同时醒来的飞鸢群在空中形成威慑之阵，压制对手气力回复。",
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
      description: "双腿内蕴回旋之力——每一次扫腿都是一次精确的劲力释放。扫腿时身周形成一圈肉眼可见的气旋——那是腿劲在极限运转时搅动空气产生的涡流。一人一腿，可扫清一片布满了暗器的战场。",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 8,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_jiqiao_saoye",
          name: "扫叶",
          pinyin: "saoye",
          description: "一腿扫出——腿部的回旋之力将旋转提至极处，攻击范围覆盖身周一切目标。击中的对手有概率被「击倒」——倒地期间动弹不得且承受的攻击势必命中要害。",
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
      description: "剑身如玉箫——中空剑体内藏声律机关，挥剑时不仅以锋刃伤人，更在空气中激起特殊的音律之波。这道音律正好能让大多数人的关节与经脉「走调」：动作变形、气力迟滞、周身失控。",
      baseDamage: "115%",
      baseSpeed: "110%",
      attackBonus: 12,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_jiqiao_xiaohua",
          name: "箫花齐放",
          pinyin: "xiaohua-qifang",
          description: "剑尖在空中划出六道音波轨迹——六道音波在击中对手的瞬间叠加共振，造成六段独立的内劲伤害。箫声剑影，如桃花岛上六株桃树同时绽放——绚丽、致命、不可抵挡。",
          qiCost: 80,
          cooldown: 6,
          damageType: "multi_chemical",
          requirements: "玉箫剑法150级，碧骇心经120级"
        },
        {
          id: "perf_jiqiao_zouxiao",
          name: "碧骇潮生",
          pinyin: "bihai-chaosheng",
          description: "剑身共鸣产生的音波从单一扩展到全频——如东海潮水般汹涌的音波攻势覆盖前方扇形区域内一切目标。离岛后不可施展——这是留在傀坊的弟子的专属荣耀。",
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
      description: "傀坊轻功——以飞鸢群的路径预测法为基础，将自身移动之道如蜂群穿梭般计算——永远在多个可能的闪避方向中实时选择最安全的那一个。身姿飘忽如风中落花——因为每一片「落花」背后都有飞鸢的暗中护持。",
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
      description: "傀坊核心知识体系——奇门遁甲的至高形态：战场空间的最优阵法分割。修习此术可提升所有傀坊招式的威能，并解锁桃花阵测试权限。奇门八卦不是玄学——是方位之学、变易之学和空间之法的完美融合。",
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
      description: "掌力直攻对手「心」——丹田气海所在的胸口区域。一掌拍实，冲击波穿透外护直达丹田——即使不能一击摧毁丹田，也足以引发对手周身气脉紊乱和功力下降。古老的摧心掌化为了直击根本的「根骨攻击」。",
      baseDamage: "125%",
      baseSpeed: "85%",
      attackBonus: 14,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_jiqiao_cuixin",
          name: "摧芯",
          pinyin: "cuixin",
          description: "全力一掌拍向对手胸腔——掌力穿透外护直达丹田。命中后对手一切功法和招式陷入「紊乱」状态，数息内无法施展任何绝技。这不是封印——是直击根本的劲力冲击。",
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
      title: "傀坊初级教习",
      teaches: ["碧骇心经", "旋风扫叶腿", "兰花拂穴手", "落英身法"],
      requirement: "悟性≥25，通过基础飞鸢操控测试",
      description: "傀坊的入门教习，负责训练新人对飞鸢的基本掌控。陆乘风的双腿已被替换为傀坊自产的回旋机关腿——他说这是「以身试机」，但你知道，他只是太爱自己的手艺了。他的传道极为耐心——因为在他看来，每个新人都是「等待组装的优质飞鸢」。"
    },
    {
      id: "t_jiqiao_2",
      name: "黄药师",
      title: "傀坊掌门·阵灵主控",
      teaches: ["碧骇心经", "落英剑法章", "弹指频通", "玉箫剑法", "奇门八卦", "摧芯章"],
      requirement: "碧骇心经≥100级，奇门八卦≥80级，悟性≥35，通过桃花阵测试",
      description: "傀坊的掌门——或者说，傀坊中枢阵灵「黄药师」的最高权限人类掌管者。真正的黄药师早已将自己的意识和学识刻入了岛上的阵灵之中，现在站在你面前的这个人是不是「原装」的黄药师，连他自己都不确定。但他设计的飞鸢至今依然是江湖上最抢手的利器——这一点，他非常确定。"
    },
    {
      id: "t_jiqiao_3",
      name: "梅超风",
      title: "傀坊高级教习·暗器宗师",
      teaches: ["碧骇心经", "弹指频通", "摧芯章", "兰花拂穴手"],
      requirement: "弹指频通≥120级，门忠≥800",
      description: "傀坊最强的暗器宗师——她的十指每根都嵌入了不同类型的微型飞鸢控制器。她的双眼已被换为多目标锁定之眼——据说她能同时号令百余只飞鸢分攻百余个目标。她的传道极为严厉——「练不好就滚回大陆去。」但经她调教的弟子，无一不是江湖上闻风丧胆的飞鸢指挥。"
    }
  ],

  special_system: {
    name: "蜂群法门·飞鸢协同战法",
    description: "傀坊核心战法。通过神识链接的飞鸢号令阵坛，一个真言可唤醒预设的飞鸢群（最多百余只）。飞鸢群以分散协同的方式执行攻伐、防御、探查或干扰任务。每只飞鸢都是独立的决策单元，飞鸢群的战术能力随数量递增。奇门八卦境界越高，可同时号令的飞鸢越多，群体的协同越精密。",
    swarm_levels: {
      "奇门1-40级": "最多十二只，基础协同",
      "奇门41-80级": "最多三十六只，进阶协同，飞鸢可自行修复",
      "奇门81-120级": "最多七十二只，高级协同，飞鸢可自主切换攻伐方式",
      "奇门121+级": "最多百余只，完美协同，飞鸢群可在交战中自行制造新的飞鸢"
    }
  }
},

// ==================== 散修 ====================
"散修": {
  name: "散修",
  type: "散修·无门派",
  description: "不隶属任何门派的独立修行者——大明的街头巷尾到处是他们的影子。散修们从江湖各处搜集散落的功法残卷，拼凑出属于自己的战斗体系。没有师承、没有门派供养、没有独门绝学——却也没有门规束缚、没有忠诚考验、没有阵营牵制。他们是江湖上最自由的魂，也是最孤独的剑。",

  skills: [
    {
      id: "sanren_force_1",
      name: "太乙心经",
      pinyin: "taiyi-pincheng",
      type: "force",
      description: "散修最基础的入门内功——以太乙玄门的古老修行法门为根基，被历代散修反复修补并重新参悟为通用型内力法门。养精蓄锐、凌虚飞渡——朴实无华，却扎实可靠。在大明，每一个散修的修行之路都始于这套被无数前辈打磨过的流传内功。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 4,
      defenseBonus: 4,
      performs: [
        {
          id: "perf_sanren_yangjing",
          name: "养精",
          pinyin: "yangjing",
          description: "以太乙心经修复经脉——恢复自身精神，并在随后数息内提升精神回复之速。散修的生存法则第一条：精神不崩溃，一切皆可再战。",
          qiCost: 30,
          cooldown: 4,
          damageType: "heal_sanity",
          requirements: "太乙心经60级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 0
    },
    {
      id: "sanren_force_2",
      name: "楚家内功",
      pinyin: "chujia-neicheng",
      type: "force",
      description: "楚家一脉的私传内功心法——被某位楚家后人流出后成为散修圈中最受欢迎的中级内功。内力运转比太乙心经快三成，但兼容性较差——与其他内功切换时有短暂的「气息相冲」之期。散修们争论不休：楚家内功到底是不是被「故意」流出的？",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 3,
      performs: [],
      learnFrom: "江湖流传",
      minLevel: 40
    },
    {
      id: "sanren_force_3",
      name: "太弦经",
      pinyin: "taixuan-xu",
      type: "force",
      description: "散修最终极的内功追求——源自上古「太玄经」的当代重释。传说将这套内功修炼至巅峰者，其经脉与天地共振，不再受肉身脉络限制。「太弦」即宇宙最基本的振动——当你的内力之韵与太弦相合时，你不再「使用」内力——你成为了内力本身。",
      baseDamage: "135%",
      baseSpeed: "100%",
      attackBonus: 15,
      defenseBonus: 10,
      performs: [
        {
          id: "perf_sanren_xuantie",
          name: "弦铁",
          pinyin: "xuantie",
          description: "以太弦经驱动体内本命真气进入共振之态——自身全属性大幅提升，且在共振期间不受一切心神攻击。天地之间、唯弦不破——这是散修所能触及的最高境界的强化。",
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
      description: "太乙玄门的剑法流传版——剑路简单直接，不含任何花哨的蓄势或伪装。在高手眼中，这套剑法就像明明白白摊开的书页——但正因如此，它反而无法被「破解」干扰：因为它从未隐藏。",
      baseDamage: "105%",
      baseSpeed: "105%",
      attackBonus: 7,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_sanren_jianqi",
          name: "剑气",
          pinyin: "jianqi",
          description: "剑身释放高频震荡的灼热剑气——穿透护甲直伤经脉。专克那些外功防御极高的重甲对手。剑气不是「气」——是剑身在空气中灼出的炽热轨迹。",
          qiCost: 45,
          cooldown: 3,
          damageType: "chemical",
          requirements: "太乙剑法100级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 0
    },
    {
      id: "sanren_sword_2",
      name: "金蛇剑法",
      pinyin: "jinshe-jianma",
      type: "sword",
      description: "剑身弯曲如金蛇——每一剑刺出的路径都是非寻常之道的完美体现。剑路蜿蜒曲折、难以预判——因为剑身的软韧可以在击中前瞬间改变方向。在散修圈中，金蛇剑法是公认的「最灵动的流传剑法」。",
      baseDamage: "115%",
      baseSpeed: "110%",
      attackBonus: 10,
      defenseBonus: 2,
      performs: [
        {
          id: "perf_sanren_tu",
          name: "吐信",
          pinyin: "tuxin",
          description: "剑尖在击中前瞬间快如蛇信——对手的双眼来不及捕捉。这一剑必定命中——除非对手提前预判了金蛇的「随机」路线。但金蛇从来不走直路。",
          qiCost: 50,
          cooldown: 4,
          damageType: "pierce_guaranteed",
          requirements: "金蛇剑法120级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 30
    },
    {
      id: "sanren_sword_3",
      name: "英雄剑法",
      pinyin: "yingxiong-jianma",
      type: "sword",
      description: "散修中平砍效率最高的剑法——简单、直接、刚猛。没有繁复的绝技，没有花哨的控场——就是一剑一剑一剑地将对手劈成碎片。在流传的散修剑法中，英雄剑法是最多参悟者选择的实战法门——因为它「能用」。",
      baseDamage: "130%",
      baseSpeed: "95%",
      attackBonus: 14,
      defenseBonus: 0,
      performs: [],
      learnFrom: "江湖流传",
      minLevel: 20
    },
    {
      id: "sanren_sword_4",
      name: "侠客剑法",
      pinyin: "xiake-jianma",
      type: "sword",
      description: "从侠客岛石刻上解译出来的神秘剑法——据说是上古时代一位超越理解极限的散修留下的。剑法优雅而精妙，但与大多数散修内功的相容性成谜——有人能用它大杀四方，有人用了连路边的孤魂野鬼都打不过。侠客剑法从不「被学会」——它只在「觉得你配得上」时才会为你所用。",
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
      description: "胡家刀法的流传版——刀路大开大合，适合群战。每一刀挥出时刀身在空气中拖出一道灼热的光弧——那是刀劲逼出的空气灼痕。散修在保卫战中首选的群攻刀法。",
      baseDamage: "110%",
      baseSpeed: "100%",
      attackBonus: 9,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_sanren_daoying",
          name: "刀影连环",
          pinyin: "daoying-lianhuan",
          description: "连环数刀，每刀都在空中留下一道刀光——刀光未散之际，人已化作一道旋转的刀风。对周围一切目标造成伤害——这便是散修的「保卫战」秘诀：一人一刀，可挡千军。",
          qiCost: 65,
          cooldown: 5,
          damageType: "aoe_physical",
          requirements: "胡家刀法100级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 15
    },
    {
      id: "sanren_blade_2",
      name: "侠客刀法",
      pinyin: "xiake-daoma",
      type: "blade",
      description: "侠客岛石刻刀法的流传版——与侠客剑法同源的刀法。刀剑合一时可引动散修唯一的武器互备——左手侠客剑法、右手侠客刀法，出剑之速倍增。这是散修最高效的物理输出组合——如果你能同时精通这两套神秘的侠客岛武功的话。",
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
      description: "太乙玄门的掌法流传版——掌力浑厚，适合与太乙剑法配合使用。掌法中规中矩，但胜在相容性极好——几乎与散修的任何内功和轻功搭配都不产生「气息相冲」。是最受欢迎的散修入门掌法。",
      baseDamage: "100%",
      baseSpeed: "100%",
      attackBonus: 6,
      defenseBonus: 3,
      performs: [],
      learnFrom: "江湖流传",
      minLevel: 0
    },
    {
      id: "sanren_strike_2",
      name: "金蛇掌法",
      pinyin: "jinshe-zhangma",
      type: "strike",
      description: "金蛇剑法的掌法之境——掌路如金蛇蜿蜒，每一掌都在击中前一刻才露出真正攻击点。与金蛇剑法配合使用时出手流畅度大幅提升——因为两者共享同一套变幻莫测的运劲法门。",
      baseDamage: "110%",
      baseSpeed: "108%",
      attackBonus: 8,
      defenseBonus: 2,
      performs: [],
      learnFrom: "江湖流传",
      minLevel: 25
    },
    {
      id: "sanren_cuff_1",
      name: "五岳拳",
      pinyin: "wuyue-quan",
      type: "cuff",
      description: "五岳拳法的流传版——拳如其名，一拳打出如同五岳压顶，劲力层层叠加。这套拳法自带一个神秘的控制技「豪气干云」——通过拳劲在空气中制造震荡，扰乱对手的平衡感知。",
      baseDamage: "105%",
      baseSpeed: "95%",
      attackBonus: 11,
      defenseBonus: 3,
      performs: [
        {
          id: "perf_sanren_haoqi",
          name: "豪气干云",
          pinyin: "haoqi-ganyun",
          description: "一拳打出的同时拳面释放震荡之波——对手的头晕目眩，陷入「眩晕」：无法动弹、无从闪避。这是散修在没有门派独门控制技的情况下所能获得的最好困敌手段。",
          qiCost: 55,
          cooldown: 5,
          damageType: "stun",
          requirements: "五岳拳100级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 10
    },
    {
      id: "sanren_cuff_2",
      name: "七伤拳",
      pinyin: "qishang-quan",
      type: "cuff",
      description: "七伤拳的流传版——一拳打出七种不同道韵的劲力，分别攻击对手的七个脏腑。威力极大，但每次施展都会对自身造成反噬——伤人先伤己。在散修圈中被称为「终极自损拳」——但不可否认的是，这是散修物理平砍伤害最高的手段。",
      baseDamage: "145%",
      baseSpeed: "80%",
      attackBonus: 20,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_sanren_shangfei",
          name: "伤肺",
          pinyin: "shangfei",
          description: "七伤拳中最精准的一式——七种劲力全部聚焦于对手的呼吸与内息运转。造成的伤势深入脏腑，且附带持续的内息紊乱——对手每息自行流失一定气血。",
          qiCost: 70,
          cooldown: 6,
          damageType: "chemical_dot",
          requirements: "七伤拳130级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 50
    },
    {
      id: "sanren_dodge_1",
      name: "太乙游身法",
      pinyin: "taiyi-pinyou",
      type: "dodge",
      description: "太乙玄门的轻功流传版——朴实无华的闪避心诀。没有花哨的隐匿或残影效果，就是在感受到攻击时推算出最优闪避路径并付诸行动。稳妥、可靠、流传——正如散修所需要的一切。",
      baseDamage: "0%",
      baseSpeed: "115%",
      attackBonus: 0,
      defenseBonus: 9,
      performs: [
        {
          id: "perf_sanren_lingxu",
          name: "凌虚飞渡",
          pinyin: "lingxu-feidu",
          description: "以太乙游身法将全身轻功劲力暂时集中于双腿——大幅提升有效轻功境界，闪避骤升。在需要强行穿越险境时，凌虚飞渡是散修最好的伙伴。",
          qiCost: 35,
          cooldown: 4,
          damageType: "dodge_buff",
          requirements: "太乙游身法80级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 0
    },
    {
      id: "sanren_dodge_2",
      name: "频行百变",
      pinyin: "pinxing-baibian",
      type: "dodge",
      description: "散修所能获得的最高级轻功——移动时不断变换步伐的韵律，如同在数十种不同的闪避心诀之间随机切换。追魂锁定之术无法奏效——因为锁定之术需要稳定的韵律模板，而频行百变从来不给。",
      baseDamage: "0%",
      baseSpeed: "125%",
      attackBonus: 0,
      defenseBonus: 14,
      performs: [],
      learnFrom: "江湖流传",
      minLevel: 60
    },
    {
      id: "sanren_spear_1",
      name: "岳家枪法",
      pinyin: "yuejia-qiangma",
      type: "spear",
      description: "岳家枪法的流传版——枪尖暗含震动之力，刺入后自行引发高频震颤，将创口从「枪尖大小」撕裂至「碗口大小」。大明的散修之所以能在没有门派庇护的情况下保全自身——很大程度上因为岳家枪法的存在：一杆好枪，胜过一切花哨的剑法。",
      baseDamage: "125%",
      baseSpeed: "90%",
      attackBonus: 15,
      defenseBonus: 5,
      performs: [],
      learnFrom: "江湖流传",
      minLevel: 35
    },
    {
      id: "sanren_throwing_1",
      name: "金蛇锥",
      pinyin: "jinshe-zhui",
      type: "throwing",
      description: "形如金蛇的微型投掷暗器——锥身布满导流槽，飞行时在空中画出蜿蜒的弧线而非直路。目标的自动拦截之术对这种非直线的轨迹毫无办法——因为诀窍里没有「弧形暗器」这个变数。一枚金蛇锥，就是一次对自动防御之术的精准破袭。",
      baseDamage: "100%",
      baseSpeed: "110%",
      attackBonus: 7,
      defenseBonus: 0,
      performs: [
        {
          id: "perf_sanren_shexing",
          name: "蛇行",
          pinyin: "shexing",
          description: "同时掷出三枚金蛇锥——三锥在空中走出三条互相不可预测的蛇形轨迹，对手无法同时拦截。每枚金蛇锥独立计算伤害和要害——时运好的话，三锥中有两锥直取要害，伤害惊人。",
          qiCost: 45,
          cooldown: 4,
          damageType: "multi_ranged",
          requirements: "金蛇锥80级"
        }
      ],
      learnFrom: "江湖流传",
      minLevel: 20
    }
  ],

  teachers: [
    {
      id: "t_sanren_1",
      name: "江湖散修盟",
      title: "散修的虚拟师门",
      teaches: ["太乙心经", "太乙剑法", "太乙掌法", "太乙游身法", "楚家内功", "金蛇剑法", "金蛇掌法", "金蛇锥", "英雄剑法", "五岳拳", "七伤拳", "胡家刀法", "岳家枪法", "频行百变"],
      requirement: "无——但越强的技能往往需要越高的根基或解封条件",
      description: "江湖散修盟是散修的无形师门——没有实体的殿堂，但有无数行由历代散修刻录、注解、修补过的功法传承。你可以在任何公共聚点接入联盟，参悟你需要的技能——但务必细查口碑与来历。据说有些功法被朝廷密探埋了暗手。"
    },
    {
      id: "t_sanren_2",
      name: "侠客岛石刻",
      title: "终极散修试炼",
      teaches: ["太弦经", "侠客剑法", "侠客刀法"],
      requirement: "各项基础技能≥80级，完成「罗汉阵」试炼，解读石刻上的封印心诀",
      description: "隐藏在东海孤岛上的上古遗存——整座岛的岩壁上刻满了上个时代留下的心诀。没有人知道这些心诀是谁写的、为何刻在石上而非存于卷中。但每一个成功解读石刻的散修都获得了一部分心诀的参悟权限——太弦经、侠客剑法、侠客刀法——散修所能触及的三条终极路径，全部来自这座被遗忘的石刻。"
    }
  ],

  special_system: {
    name: "自由参悟·流传技能体系",
    description: "散修没有门派师承，所有技能从江湖散修盟参悟。好处是没有任何门派限制——理论上你可以学会所有流传技能。缺点是：一、没有独门绝学，同样的技能其他散修也会；二、无法参加门派比武获得门派供给；三、技能之间的相容性需自己调和——一个不慎便是气息紊乱。但散修的终极浪漫恰恰在此——不是被给予，而是自己找到。每一个成功的散修，都是一部独一无二的自我修行史。"
  }
}

};
