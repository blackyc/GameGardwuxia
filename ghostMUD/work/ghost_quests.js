// 鬼修MUD · 基础任务链
// 聊斋化基础任务 — 10条
// 宗派名已按faction_rebrand统一
var QUESTS = [
  {
    "id": "lost_chip",
    "name": "失窃的灵石",
    "giver": "兜帽男子",
    "location": "酒馆（随机）",
    "desc": "有人托你去附近的险地寻回一枚封印过的灵石。对方低声补了句：那地方常年不见光，石阶上长出来的不是苔——是指甲。天黑之前出来。",
    "stages": [
      {
        "type": "go",
        "target": "dungeon",
        "desc": "前往{target}寻找灵石"
      },
      {
        "type": "encounter",
        "enemy": "random",
        "desc": "击败看守灵石的守卫——它们不太像活人"
      },
      {
        "type": "collect",
        "item": "封印灵石",
        "desc": "拾取灵石——入手冰凉，好像握着另一只手"
      },
      {
        "type": "return",
        "desc": "回去找兜帽男子交差。他验过灵石后放进了衣襟——放进去之后衣襟鼓起的形状，还是灵石。不是胸口的轮廓。"
      }
    ],
    "rewards": {
      "spiritStones": 300,
      "cultivation": 50
    }
  },
  {
    "id": "missing_son",
    "name": "失踪的儿子",
    "giver": "香客妇人",
    "location": "寺庙",
    "desc": "一个妇人求你寻她儿子——他去城外某处寻矿，失联已三日。妇人一直攥着儿子的旧鞋，鞋底磨穿了，但她不肯换。她说鞋认得路。",
    "stages": [
      {
        "type": "go",
        "target": "city_tech",
        "desc": "前往{target}打听失踪者的下落"
      },
      {
        "type": "find_clue",
        "desc": "在{target}搜寻线索——地上有一串脚印，走了几步就变成了拖痕"
      },
      {
        "type": "encounter",
        "enemy": "random",
        "desc": "找到被困的少年，击败囚他之物"
      },
      {
        "type": "talk",
        "npc": "失踪的儿子",
        "desc": "护送少年回去——他说被困的三天里每晚都有人给他递水。水是温的。但他始终没看见递水人的脸。"
      }
    ],
    "rewards": {
      "spiritStones": 150,
      "item": "妇人的谢礼"
    }
  },
  {
    "id": "ant_network",
    "name": "织狱的招揽",
    "giver": "谷口探子",
    "location": "市场",
    "desc": "织狱正在招人——但入狱之前，你得先在银丝上看清自己的命线。织狱的人说：每根丝上都挂着曾经走过的人留下的一个片段。踩上去之前——先确认那片段不是你自己的。",
    "stages": [
      {
        "type": "find",
        "item": "rare_data",
        "desc": "在废弃墟地收集三片残存的灵气结晶"
      },
      {
        "type": "deliver",
        "npc": "织狱联络人",
        "desc": "把灵气结晶交给织狱联络人——她接入之后手抖了一下，然后递给你，没多说什么"
      },
      {
        "type": "go",
        "target": "faction",
        "desc": "前往织狱据点接受试炼——谷口的银丝在风里轻轻荡着，但你走过去的时候有一根碰了你的额头"
      }
    ],
    "rewards": {
      "spiritStones": 200,
      "technique": "银丝步法入门",
      "faction": "织狱"
    }
  },
  {
    "id": "blood_sickle_bounty",
    "name": "血禅寺的悬赏",
    "giver": "血镜行者",
    "location": "暗街",
    "desc": "血禅寺悬赏追缉一个叛僧——他偷的不是经书，是正殿黑镜上的一小块镜片。镜片里的东西比镜片本身贵重。追回镜片——叛僧的死活自行决断。",
    "stages": [
      {
        "type": "investigate",
        "desc": "在各处打听目标的行踪——有人说他在一座废弃佛堂里抱着镜片说梦话"
      },
      {
        "type": "go",
        "target": "faction_hq",
        "desc": "前往目标藏身的废弃佛堂"
      },
      {
        "type": "encounter",
        "enemy": "boss",
        "desc": "找到叛僧——他对着镜片喃喃自语。镜片里映着一张不是他的脸。击败他，取回镜片。"
      }
    ],
    "rewards": {
      "spiritStones": 500,
      "equipment": "血禅·噬骨刀"
    }
  },
  {
    "id": "forget_dust_scripture",
    "name": "忘尘经·全本",
    "giver": "净尘长老",
    "location": "忘尘峰·藏经阁",
    "desc": "《忘尘经》三卷散落在三处：忘尘峰经阁藏第一卷，旧墟遗迹藏第二卷，第三卷在一个疯修士手中。集齐全部，方得忘尘大法。净尘长老补了句：第三卷会认人——它不认的人翻开什么也看不见。不是空白——是看见了然后立刻忘。",
    "stages": [
      {
        "type": "go",
        "target": "city_temple",
        "desc": "前往忘尘峰经阁找到第一卷——经书合着，但你靠近时它自己翻了一页"
      },
      {
        "type": "go",
        "target": "city_ruin",
        "desc": "前往旧墟遗迹找到第二卷——埋在石碑下，石碑上的刻字在变"
      },
      {
        "type": "encounter",
        "enemy": "boss",
        "desc": "找到疯修士——他在念经。念的不是经文——是一串名字。每个名字念到第三遍的时候就轻了。击败他，取回第三卷。"
      }
    ],
    "rewards": {
      "cultivation": 200,
      "technique": "忘尘大法"
    }
  },
  {
    "id": "quantum_addiction",
    "name": "噬魂丹药",
    "giver": "卖药老头",
    "location": "街头",
    "desc": "某药商兜售的'醒神丹'让多人灵台崩裂——服丹之人整夜睁眼睡不醒，手脚自己动。查清这批丹药的来源，追到炼药之人。卖药老头说每次去取货，炼药人的影子不在自己脚下——在墙上。他早该注意的。",
    "stages": [
      {
        "type": "investigate",
        "desc": "向卖药老头打听货源——他递给你一个空丹瓶，瓶底的残渣还在蠕动"
      },
      {
        "type": "go",
        "target": "dungeon",
        "desc": "追踪到深山中的隐秘丹房"
      },
      {
        "type": "encounter",
        "enemy": "boss",
        "desc": "丹房里的炼药师背对你坐着——他的背上有人脸的轮廓。不是纹身。是皮肤自己鼓起来的。击败他。"
      },
      {
        "type": "collect",
        "item": "毒丹配方",
        "desc": "获取配方——配方最后一行写着：'服此丹者，他夜醒时身旁站着的不是幻觉。'"
      }
    ],
    "rewards": {
      "spiritStones": 400,
      "item": "定魂丹×3"
    }
  },
  {
    "id": "machine_ascension",
    "name": "傀儡飞升之路",
    "giver": "傀坊巧匠",
    "location": "傀坊·入城吊桥",
    "desc": "一个痴迷于'人变傀儡'的老巧匠在做一项不安的尝试——他说能把经脉替换为灵木筋络，但缺三种罕见的材料。他说这些材料是活的——采集时不要惊动它们。惊动了——你回来的时候身上会多点什么。",
    "stages": [
      {
        "type": "collect",
        "item": "稀有材料×3",
        "desc": "在三处收集三种稀有灵材——每种灵材在采集时都会发出极轻的呼吸声"
      },
      {
        "type": "go",
        "target": "city_tech",
        "desc": "把材料送给老巧匠——他的手抖了一下，不是因为激动"
      },
      {
        "type": "choice",
        "desc": "选择：接受灵木筋络改造，还是拒绝——他说改过的人，夜里关节会自己响"
      }
    ],
    "rewards": {
      "equipment": "灵木臂·初锻"
    }
  },
  {
    "id": "dark_web_offline",
    "name": "鬼市离线节点",
    "giver": "暗街探子",
    "location": "市场",
    "desc": "祂的注视越来越密。鬼市正试图在城下建一座永久离线节点——一个祂看不到的死角。需要你护送一位节点建造师安全到达地下工事。探子说：穿过祂的注视区域时别抬头。抬头它就知道你在找它。",
    "stages": [
      {
        "type": "escort",
        "npc": "节点建造师",
        "desc": "护送建造师穿越注视区域——路标上的字在你经过时会变"
      },
      {
        "type": "encounter",
        "enemy": "random",
        "desc": "途中遭遇受祂驱使的游荡傀儡"
      },
      {
        "type": "go",
        "target": "dungeon",
        "desc": "到达地下工事——工事的墙壁上画满了闭着的眼睛。建造师说这是第一代建的人画的：'祂找不到这里——所以祂用别的东西来找。画上的眼睛闭着的时候，那些别的东西也闭着。'"
      }
    ],
    "rewards": {
      "spiritStones": 350,
      "access": "鬼市离线节点"
    }
  },
  {
    "id": "wulin_tournament",
    "name": "散修擂台",
    "giver": "说书人",
    "location": "酒馆",
    "desc": "城外将举办一场小型斗法——胜者有重赏。说书人劝你试一试。他又压低声音：上一届擂主在决赛后说他在擂台上看到了自己——一个站在台下看着台上的自己。第二天他就失踪了。但赏金到现在没被领完。",
    "stages": [
      {
        "type": "go",
        "target": "city_government",
        "desc": "前往擂台报名——登记簿上好几个名字在滴水"
      },
      {
        "type": "encounter",
        "enemy": "random",
        "desc": "第一场：对决",
        "repeat": 3
      },
      {
        "type": "encounter",
        "enemy": "boss",
        "desc": "最终战：对决守擂者——他的招式里有你昨晚梦里的动作"
      }
    ],
    "rewards": {
      "spiritStones": 600,
      "cultivation": 300
    }
  },
  {
    "id": "star_picking_refugee",
    "name": "摘星楼遗民",
    "giver": "偶遇老修",
    "location": "废墟",
    "desc": "在废墟边缘遇到一个自称摘星楼后代的老修士。他说先祖守护的秘密封在一座弃塔中——需要一把半截的钥匙。钥匙的另一半在塔里。合在一起——塔会记得自己是谁建的。老修士说完这句话之后，天上暗了一息。不是云。他说：祂听见了——不过不要紧，反正祂去不了那座塔。",
    "stages": [
      {
        "type": "find",
        "item": "rare_key",
        "desc": "寻找摘星密钥——钥匙挂在一棵死树上，树周边没有鸟"
      },
      {
        "type": "go",
        "target": "city_ruin",
        "desc": "前往弃塔——塔门自己开了，但门轴没发出声音"
      },
      {
        "type": "encounter",
        "enemy": "boss",
        "desc": "塔中守灵——一个古老的塔灵。它问你话：不是用嘴，是用你心里正在想的那句话反过来问你。击败它的问答，获得秘法。"
      }
    ],
    "rewards": {
      "spiritStones": 500,
      "technique": "摘星秘法"
    }
  }
];

// ==================== 导出（Node.js） ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTS };
}
