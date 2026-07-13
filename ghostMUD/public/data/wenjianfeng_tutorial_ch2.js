// ============================================================
// Ghost MUD v2.0 · 问剑峰新手引导 · 第二章·入门
// 纯数据：场景、教学技能、野猪战与残剑展示战文案
// ============================================================

var WENJIANFENG_TUTORIAL_CH2 = {
  id: 'wenjianfeng_tutorial_ch2',
  version: '1.0.0',
  source: 'aidoc/archive_20260707/docs/narrative/wenjianfeng_tutorial_golden3.md#6-第二章入门',

  rooms: {
    morningTraining: '问剑峰·剑坪',
    waterSource: '问剑峰·洗剑池',
    waterDestination: '问剑峰·伙房',
    bambooGrove: '问剑峰·竹林',
    eveningMeal: '问剑峰·伙房',
    swordTomb: '问剑峰·剑冢'
  },

  skills: {
    morningLesson: [
      { id: 'wenjianfeng_ch2_qishi', name: '起式', order: 1 },
      { id: 'wenjianfeng_ch2_chengshi', name: '承式', order: 2 }
    ],
    awardedChart: { A: 1001, B: 1002, C: 1003, D: 1004, E: 1005 },
    showcase: [
      { id: 1091, name: '起式·残月', slot: 'A' },
      { id: 1092, name: '承式·断岳', slot: 'B' },
      { id: 1094, name: '合式·无声', slot: 'D' }
    ]
  },

  boar: {
    id: 'wjf_ch2_boar',
    name: '黑鬃野猪',
    room: '问剑峰·竹林',
    hp: 4200,
    atk: 28,
    def: 8,
    spd: 9,
    exp: 0,
    gold: 0,
    profile: {
      hp: 'normal',
      attack: 'medium',
      speed: 'fast'
    },
    displayProfile: {
      hp: '正常',
      attack: '中等',
      speed: '快'
    },
    tutorialActions: ['guard', 'dodge', 'attack', 'stamina'],
    attackCombo: [1001, 1002, 1003, 1004, 1005],
    outcomes: ['victory', 'knockdown']
  },

  showcase: {
    actor: { id: 'wenjianfeng_canjian', name: '残剑师姐' },
    enemy: {
      id: 'wjf_ch2_unknown',
      name: '？？？',
      hp: 100,
      atk: 0,
      def: 0,
      spd: 0,
      exp: 0,
      gold: 0
    },
    chart: { A: 1091, B: 1092, D: 1094 },
    target: {
      id: 'wenjianfeng_unknown',
      name: '？？？',
      hp: '？？？？？？',
      attack: '？？？？？？'
    },
    skillIds: [1091, 1092, 1094],
    temporaryControl: true,
    returnsControlToPlayer: true
  },

  nodes: {
    morningPractice: {
      lines: [
        { id: 'n101', speaker: 'narrator', text: '天还没亮透。剑坪上已经响起了脚步声。萧远站在前面，剑斜背在背后，剑柄上缠的布很旧。' },
        { id: 'd101', speaker: '萧远', text: '他扫了你一眼，沉声道：「新来的。」', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「新来的。」', action: '萧远扫了你一眼。', branch_to: 'd102' },
        { id: 'n102', speaker: 'narrator', text: '所有人对齐。苏小棠在你左边，周碛在你右边。' },
        { id: 'd102', speaker: '萧远', text: '他按住背后的剑柄，道：「今天学两式。起式。承式。看一遍。」', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「今天学两式。起式。承式。看一遍。」', action: '萧远按住背后的剑柄。', branch_to: 'd103' },
        { id: 'n103', speaker: 'narrator', text: '他没有慢动作。但你清楚地看见——剑锋扫过，气如长虹。' },
        { id: 'd103', speaker: '萧远', text: '他收剑立定，只道：「练。」', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「练。」', action: '萧远收剑立定。', branch_to: null },
        { id: 'n104', speaker: 'narrator', text: '萧远的剑太快。你合上眼，脑海里不断闪过他的步伐、动作……' },
        { id: 'n105', speaker: 'narrator', text: '旁边传来一声闷响。苏小棠的剑气偏了三分，打在地上，扬起一片土。萧远指出她起式时左脚多迈了半步，承式便追不上。' }
      ]
    },

    lessonComplete: {
      lines: [
        { id: 'd104', speaker: '萧远', text: '萧远看过你的剑路，微微点头：「可以了。」', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「可以了。」', action: '萧远看过你的剑路，微微点头。', branch_to: 'd105' },
        { id: 'd105', speaker: '萧远', text: '他收了剑，道：「上午的课完了。去伙房帮忙。」', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「上午的课完了。去伙房帮忙。」', action: '萧远收了剑。', branch_to: null },
        { id: 'n106', speaker: 'narrator', text: '周碛已经走了。苏小棠还在练那一式——这次似乎对了。' }
      ]
    },

    waterPool: {
      lines: [
        { id: 'n107', speaker: 'narrator', text: '你去洗剑池挑水。盲眼老妪坐在池边。她没看你，却先开了口。' },
        { id: 'd106', speaker: '盲眼老妪', text: '她面朝池水，缓缓道：「今天的水比昨天冷。池底的剑又多了一把。」', character: '盲眼老妪', avatar: 'wenjianfeng_laoyu', line: '「今天的水比昨天冷。池底的剑又多了一把。」', action: '盲眼老妪面朝池水。', branch_to: 'd107' },
        { id: 'n108', speaker: 'narrator', text: '你往池里看——看不清。水太暗了。' },
        { id: 'd107', speaker: '盲眼老妪', text: '她轻敲池边石板，道：「不用找了。新来的看不到的。」', character: '盲眼老妪', avatar: 'wenjianfeng_laoyu', line: '「不用找了。新来的看不到的。」', action: '盲眼老妪轻敲池边石板。', branch_to: null }
      ]
    },

    zhouQiSpill: {
      lines: [
        { id: 'n109', speaker: 'narrator', text: '你挑着两桶水迈上石阶，肩膀已经酸得发抖。周碛迎面走来，斜跨一步，正卡在你换肩换气的死角。' },
        { id: 'd108', speaker: '周碛', text: '他嗤笑一声，剑梢往扁担前端轻轻一搭：「下盘飘得跟水面上的浮萍似的，挑个水也能喘成这样。」', character: '周碛', avatar: 'wenjianfeng_zhouqi', line: '「下盘飘得跟水面上的浮萍似的，挑个水也能喘成这样。」', action: '周碛嗤笑一声，剑梢往扁担前端轻轻一搭。', branch_to: 'd109' },
        { id: 'n110', speaker: 'narrator', text: '一股巧劲袭来。扁担猛地一晃，半桶冷水泼出来，把你的裤脚浇得湿透。' },
        { id: 'd109', speaker: '周碛', text: '他连头也不回，懒洋洋地道：「哎呀，手滑。新来的，这水要是挑不齐，老蔡今晚可不给你开灶。」', character: '周碛', avatar: 'wenjianfeng_zhouqi', line: '「哎呀，手滑。新来的，这水要是挑不齐，老蔡今晚可不给你开灶。」', action: '周碛连头也不回，懒洋洋地走了。', branch_to: null }
      ]
    },

    waterDelivered: {
      lines: [
        { id: 'n111', speaker: 'narrator', text: '你咬着牙把水挑进伙房。老蔡瞥了一眼你湿透的裤脚，又看了看只剩半满的水桶，叹了口气。' },
        { id: 'd110', speaker: '老蔡', text: '他把菜刀往案板上一落：「又是他。半桶也够。但下次你得撞回来。」', character: '老蔡', avatar: 'wenjianfeng_laocai', line: '「又是他。半桶也够。但下次你得撞回来。」', action: '老蔡把菜刀往案板上一落。', branch_to: 'd111' },
        { id: 'd111', speaker: '老蔡', text: '老蔡抬眼看着你：「我问剑峰可没孬种。」', character: '老蔡', avatar: 'wenjianfeng_laocai', line: '「我问剑峰可没孬种。」', action: '老蔡抬眼看着你。', branch_to: null }
      ]
    },

    bambooWork: {
      lines: [
        { id: 'n112', speaker: 'narrator', text: '后山竹林。劳叔在削竹丝。' },
        { id: 'd112', speaker: '劳叔', text: '他把沉甸甸的砍刀递给你：「砍十根。粗的不要。太细的不要。刚好握得住的。」', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「砍十根。粗的不要。太细的不要。刚好握得住的。」', action: '劳叔把沉甸甸的砍刀递给你。', branch_to: 'd113' },
        { id: 'd113', speaker: '劳叔', text: '劳叔低头继续削竹丝：「不着急。砍完就行。」', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「不着急。砍完就行。」', action: '劳叔低头继续削竹丝。', branch_to: null }
      ]
    },

    boarArrival: {
      lines: [
        { id: 'n113', speaker: 'narrator', text: '砍到第七根的时候，竹林深处传来一阵闷响。不是风。劳叔手里的竹丝停了。' },
        { id: 'd114', speaker: '劳叔', text: '劳叔抬起头，握紧砍刀：「……退后。」', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「……退后。」', action: '劳叔抬起头，握紧砍刀。', branch_to: null },
        { id: 'n114', speaker: 'narrator', text: '一头黑鬃野猪从竹林中撞了出来。它盯着你。獠牙比你的剑还长。' },
        { id: 'd115', speaker: '劳叔', text: '他横刀挡在身前：「别看这东西长得凶，就一偷吃竹笋的货。不要怕，它是比你快，但也比你笨。」', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「别看这东西长得凶，就一偷吃竹笋的货。不要怕，它是比你快，但也比你笨。」', action: '劳叔横刀挡在身前。', branch_to: null }
      ]
    },

    boarVictory: {
      lines: [
        { id: 'n115', speaker: 'narrator', text: '野猪轰然倒地。你喘着气，剑上沾了血。' },
        { id: 'd116', speaker: '苏小棠', text: '苏小棠从远处跑来，急声问道：「你没事吧——」', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「你没事吧——」', action: '苏小棠从远处跑来。', branch_to: null }
      ]
    },

    boarDefeat: {
      lines: [
        { id: 'n116', speaker: 'narrator', text: '野猪撞在你胸口。你飞出去，摔在竹子上。疼。但你没死。劳叔一刀砍在它后腿上，野猪嚎叫着跑了。' },
        { id: 'n117', speaker: 'narrator', text: '你听见一声极轻的落地声。残剑师姐不知何时站在旁边。她什么也没说，只扔给你一瓶金疮药，转身走了。' },
        { id: 'd117', speaker: '苏小棠', text: '苏小棠哭着跑来，嘴角却没压住：「你被猪拱了——我不是在笑我真的不是在笑——」', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「你被猪拱了——我不是在笑我真的不是在笑——」', action: '苏小棠哭着跑来，嘴角却没压住。', branch_to: null }
      ]
    },

    anomaly: {
      lines: [
        { id: 'n118', speaker: 'narrator', text: '野猪倒在泥地里，粗重的喘息声渐渐微弱。你刚想拔出铁剑，风突然停了。竹叶声尽数消失，竹林里的光也暗了下去。' },
        { id: 'n119', speaker: 'narrator', text: '黑暗深处，几道交错的影子在空气中蠕动。两点红光缓缓亮起。你无法呼吸，四肢仿佛被万年风雪冻住。来者……不可知，不可看。' },
        { id: 'n120', speaker: 'narrator', text: '敌人名称：？？？。血量：？？？？？？。攻击力：？？？？？？。' },
        { id: 'd118', speaker: '残剑师姐', text: '残剑师姐出现在你身前，手按剑柄，低声道：「别动。看好。我不教第二次。」', character: '残剑师姐', avatar: 'wenjianfeng_canjian', line: '「别动。看好。我不教第二次。」', action: '残剑师姐出现在你身前，手按剑柄。', branch_to: null }
      ]
    },

    morningTraining: {
      id: 'ch2_morning_training',
      stage: 2,
      title: '清晨·剑坪·晨练',
      room: '问剑峰·剑坪',
      next: 'ch2_water_carry',
      copy: [
        { id: 'n001', type: 'narration', text: '天还没亮透。剑坪上已经响起了脚步声。' },
        { id: 'n002', type: 'narration', text: '萧远站在前面——一个看起来四十岁出头的中年人。他的剑斜背在背后。剑柄上缠的布很旧。' },
        { id: 'd001', type: 'dialogue', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「新来的。」', action: '萧远扫了你一眼。', branch_to: 'd002' },
        { id: 'n003', type: 'narration', text: '所有人对齐。苏小棠在你左边，周碛在你右边。' },
        { id: 'd002', type: 'dialogue', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「今天学两式。起式。承式。」', action: '萧远抬手按住背后的剑柄。', branch_to: 'd003' },
        { id: 'd003', type: 'dialogue', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「看一遍。」', action: '萧远拔剑起势。', branch_to: 'd004' },
        { id: 'n004', type: 'narration', text: '他没有慢动作。但你清楚地看见——剑锋扫过，气如长虹。' },
        { id: 'd004', type: 'dialogue', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「练。」', action: '萧远收剑立定。', branch_to: 'd005' },
        { id: 'n005', type: 'narration', text: '萧远的剑太快。你合上眼，脑海里不断闪过他的步伐、动作……' },
        { id: 's001', type: 'system', text: '点击尝试模仿他的起手式。' },
        { id: 's002', type: 'choice', text: '起式→承式 / 承式→起式' },
        { id: 'n006', type: 'narration', text: '旁边传来一声闷响。苏小棠的剑气偏了三分——打在地上，扬起一片土。' },
        { id: 'd005', type: 'dialogue', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「啊啊啊——对不起对不起——」', action: '苏小棠慌忙收剑。', branch_to: 'd006' },
        { id: 'd006', type: 'dialogue', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「起式的时候左脚多迈了半步。承式追不上你。」', action: '萧远看了苏小棠一眼。', branch_to: 'd007' },
        { id: 'd007', type: 'dialogue', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「我再试一次——」', action: '苏小棠重新摆好架势。', branch_to: 'd008' },
        { id: 'd008', type: 'dialogue', character: '周碛', avatar: 'wenjianfeng_zhouqi', line: '「就你这样的还敢教新人？」', action: '周碛抱着剑，冷冷看了她一眼。', branch_to: null },
        { id: 'n007', type: 'narration', text: '苏小棠的脸红了。' },
        { id: 's003', type: 'system', text: '练习行功图排列，直到萧远说“可以了”。' }
      ]
    },

    waterCarry: {
      id: 'ch2_water_carry',
      stage: 3,
      title: '上午·挑水',
      room: '问剑峰·洗剑池',
      destination: '问剑峰·伙房',
      next: 'ch2_bamboo_chop',
      copy: [
        { id: 'd009', type: 'dialogue', character: '萧远', avatar: 'wenjianfeng_xiaoyuan', line: '「上午的课完了。去伙房帮忙。」', action: '萧远收了剑。', branch_to: 'd010' },
        { id: 'n008', type: 'narration', text: '周碛已经走了。苏小棠还在练那一式——这次似乎对了。' },
        { id: 'n009', type: 'narration', text: '你去洗剑池挑水。盲眼老妪坐在池边。她没看你，却先开了口。' },
        { id: 'd010', type: 'dialogue', character: '盲眼老妪', avatar: 'wenjianfeng_laoyu', line: '「今天的水比昨天冷。池底的剑又多了一把。」', action: '老妪把手搭在膝上，脸仍朝着池水。', branch_to: 'd011' },
        { id: 'n010', type: 'narration', text: '你往池里看——看不清。水太暗了。' },
        { id: 'd011', type: 'dialogue', character: '盲眼老妪', avatar: 'wenjianfeng_laoyu', line: '「不用找了。新来的看不到的。」', action: '老妪轻轻敲了敲池边石板。', branch_to: 'd012' },
        { id: 's004', type: 'system', text: '从洗剑池挑水到伙房。挑水时行动速度略微下降。' },
        { id: 'n011', type: 'narration', text: '你挑着满满两桶水，刚迈上洗剑池的石阶，肩膀已经酸得微微发抖。周碛迎面走下来。他手里只拎着一把剑，神色恹恹地拨弄着路边的野草。' },
        { id: 'n012', type: 'narration', text: '在经过你身边时，周碛停下脚，斜斜跨出一步，刚好卡在你换肩换气的死角。' },
        { id: 'd012', type: 'dialogue', character: '周碛', avatar: 'wenjianfeng_zhouqi', line: '「下盘飘得跟水面上的浮萍似的，挑个水也能喘成这样。」', action: '周碛嗤笑一声，剑梢在扁担前端轻轻一搭。', branch_to: 'd013' },
        { id: 'n013', type: 'narration', text: '一股巧劲袭来。扁担猛地一晃，半桶冷水泼了出来，把你的裤脚浇得湿透。' },
        { id: 'd013', type: 'dialogue', character: '周碛', avatar: 'wenjianfeng_zhouqi', line: '「哎呀，手滑。新来的，这水要是挑不齐，老蔡今晚可不给你开灶。」', action: '周碛连头都没回，懒洋洋地走了。', branch_to: 'd014' },
        { id: 'n014', type: 'narration', text: '你咬着牙把水挑进伙房。老蔡正在切土豆，他瞥了一眼你湿漉漉的裤脚，又看了看只有半满的水桶，叹了口气。' },
        { id: 'd014', type: 'dialogue', character: '老蔡', avatar: 'wenjianfeng_laocai', line: '「又是他。」', action: '老蔡把菜刀往案板上一落。', branch_to: 'd015' },
        { id: 'd015', type: 'dialogue', character: '老蔡', avatar: 'wenjianfeng_laocai', line: '「半桶也够。但下次你得撞回来。」', action: '老蔡抬眼看着你。', branch_to: 'd016' },
        { id: 'd016', type: 'dialogue', character: '老蔡', avatar: 'wenjianfeng_laocai', line: '「我问剑峰可没孬种。」', action: '老蔡说完，低头继续切土豆。', branch_to: null }
      ]
    },

    bambooChop: {
      id: 'ch2_bamboo_chop',
      stage: 4,
      title: '下午·砍竹',
      room: '问剑峰·竹林',
      targetCount: 10,
      boarTriggerCount: 7,
      next: 'ch2_boar_combat',
      copy: [
        { id: 'n015', type: 'narration', text: '后山竹林。劳叔在削竹丝。' },
        { id: 'd017', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「砍十根。粗的不要。太细的不要。刚好握得住的。」', action: '劳叔把砍刀递给你。刀很沉。', branch_to: 'd018' },
        { id: 'd018', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「不着急。砍完就行。」', action: '劳叔低下头，继续削手里的竹丝。', branch_to: 'd019' },
        { id: 's005', type: 'system', text: '砍竹——连续点击操作。每根竹子需要三至五次点击。' },
        { id: 'n016', type: 'narration', text: '砍到第七根的时候，竹林深处传来一阵闷响。不是风。劳叔手里的竹丝停了。' },
        { id: 'd019', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「……退后。」', action: '劳叔抬起头，握紧了手里的刀。', branch_to: null },
        { id: 'n017', type: 'narration', text: '一头黑鬃野猪从竹林中撞了出来。它盯着你。獠牙比你的剑还长。' }
      ]
    },

    boarCombat: {
      id: 'ch2_boar_combat',
      stage: 5,
      title: '野猪战斗',
      room: '问剑峰·竹林',
      next: 'ch2_unknown_appears',
      copy: [
        { id: 'n018', type: 'narration', text: '劳叔后退了一步。' },
        { id: 'd020', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「别看这东西长得凶，就一偷吃竹笋的货。」', action: '劳叔横刀挡在身前。', branch_to: 'd021' },
        { id: 'd021', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「不要怕，它是比你快，但也比你笨。」', action: '劳叔盯着野猪的前蹄。', branch_to: null },
        { id: 's006', type: 'system', text: '战斗开始。敌人：黑鬃野猪。血量：正常 / 攻击：中等 / 速度：快。' },
        { id: 's007', type: 'system', text: '格挡可减少伤害；闪避可完全躲避；以起式、承式出剑连击；连续攻击后需喘息。' }
      ],
      outcomes: {
        victory: [
          { id: 'n019', type: 'narration', text: '野猪轰然倒地。你喘着气，剑上沾了血。' },
          { id: 'd022', type: 'dialogue', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「你没事吧——」', action: '苏小棠从远处跑来。', branch_to: null }
        ],
        knockdown: [
          { id: 'n020', type: 'narration', text: '野猪撞在你胸口——你直接飞了出去，摔在竹子上。疼。但你没死。那头野猪没有继续冲——它不知道为什么停住了。' },
          { id: 'n021', type: 'narration', text: '劳叔一刀砍在它后腿上。野猪嚎叫着跑了。' },
          { id: 'd023', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「——回来！别追——」', action: '劳叔收刀，喝住要追的人。', branch_to: 'd024' },
          { id: 'n022', type: 'narration', text: '你的胸口像裂开了一样。但你能站起来。然后你听到一声极轻的落地声。残剑师姐不知何时站在你旁边。她什么都没说，只扔给你一瓶金疮药，转身走了。' },
          { id: 'd024', type: 'dialogue', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「你被猪拱了——我不是在笑我真的不是在笑——」', action: '苏小棠哭着跑过来，嘴角却没压住。', branch_to: null }
        ]
      }
    },

    unknownAppears: {
      id: 'ch2_unknown_appears',
      stage: 6,
      title: '？？？现身',
      room: '问剑峰·竹林',
      next: 'ch2_residual_sword_showcase',
      copy: [
        { id: 'n023', type: 'narration', text: '野猪倒在泥地里，粗重的喘息声渐渐微弱。你擦了一把额头上的汗，刚想拔出铁剑——风，突然停了。' },
        { id: 'n024', type: 'narration', text: '原本满是竹叶沙沙声的后山，瞬间静如死域。你脖颈后的汗毛一根根竖了起来。竹林里的光线骤然暗了下去。你猛地抬头，有什么东西挡住了光。' },
        { id: 'n025', type: 'narration', text: '黑暗深处，有什么动了一下。不。那不是东西。那是几道交错的、蠕动的“影子”，它们没有实体，却在空气中撕扯出咝咝声。' },
        { id: 'n026', type: 'narration', text: '黑暗中缓缓亮起两点红光。你甚至无法呼吸。脑海一片空白，四肢仿佛被万年风雪所冻。来者……不可知，不可看。' },
        { id: 's008', type: 'system', text: '你无法行动。' },
        { id: 's009', type: 'system', text: '敌人名称：？？？' },
        { id: 's010', type: 'system', text: '？？？的血量：？？？？？？' },
        { id: 's011', type: 'system', text: '？？？的攻击力：？？？？？？' }
      ]
    },

    residualSwordShowcase: {
      id: 'ch2_residual_sword_showcase',
      stage: 6,
      title: '残剑师姐展示战',
      room: '问剑峰·竹林',
      next: 'ch2_aftermath',
      copy: [
        { id: 'd025', type: 'dialogue', character: '残剑师姐', avatar: 'wenjianfeng_canjian', line: '「别动。」', action: '残剑师姐出现在你身前。你没有看见她何时来的。', branch_to: 'd026' },
        { id: 'n027', type: 'narration', text: '她手按在剑柄上。只是按着。？？？发出低沉声响。' },
        { id: 'd026', type: 'dialogue', character: '残剑师姐', avatar: 'wenjianfeng_canjian', line: '「看好。我不教第二次。」', action: '残剑师姐没有回头看你们。', branch_to: null },
        { id: 's012', type: 'system', text: '你暂时控制「残剑师姐」。' },
        { id: 'n028', type: 'narration', text: '她的招式你一个都没见过。不是萧远教的那两式。' },
        { id: 's013', type: 'skill', skillId: 1091, text: '起式·残月' },
        { id: 'n029', type: 'narration', text: '剑未出鞘。鞘尖划出一道弧光——？？？的身形在弧光里裂开了一个口子。透过缝隙你能看到竹林——竹林的影子似乎不对？' },
        { id: 's014', type: 'skill', skillId: 1092, text: '承式·断岳' },
        { id: 'n030', type: 'narration', text: '鞘身横转。光拉成一条线。？？？退了半步。你第一次看到那东西后退。' },
        { id: 's015', type: 'skill', skillId: 1094, text: '合式·无声' },
        { id: 'n031', type: 'narration', text: '第三招。残剑师姐的前两招是流水，这一招是止水。时间仿佛静止了一瞬。？？？发出你从未听过的声响——然后它消失了。' },
        { id: 'n032', type: 'narration', text: '你瞪大了眼。' }
      ]
    },

    aftermath: {
      id: 'ch2_aftermath',
      stage: 6,
      title: '沉默的余波',
      room: '问剑峰·竹林',
      next: 'ch2_evening_meal',
      lines: [
        { id: 'n121', speaker: 'narrator', text: '你发现自己坐在地上。什么时候坐下去的不记得了。残剑师姐已经转身往回走，手依旧按在剑柄上。' },
        { id: 'd119', speaker: '苏小棠', text: '苏小棠跑过来，脸色发白：「天啊——你们看到了吗——刚才那是什么——师姐好厉害——」', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「天啊——你们看到了吗——刚才那是什么——师姐好厉害——」', action: '苏小棠跑过来，脸色发白。', branch_to: 'd120' },
        { id: 'd120', speaker: '劳叔', text: '劳叔沉默许久，看了一眼残剑师姐的背影：「我在这片竹林砍了三十年竹子。没见过那东西。」', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「我在这片竹林砍了三十年竹子。没见过那东西。」', action: '劳叔沉默许久，看了一眼残剑师姐的背影。', branch_to: 'd121' },
        { id: 'd121', speaker: '劳叔', text: '他顿了顿，又道：「……她每年都会来一次竹林。以前我以为她是来散步。」', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「……她每年都会来一次竹林。以前我以为她是来散步。」', action: '劳叔说到这里，忽然闭了口。', branch_to: null }
      ],
      copy: [
        { id: 'n033', type: 'narration', text: '你发现自己坐在地上。什么时候坐下去的不记得了。残剑师姐已经转身往回走，走得很慢，手依旧按在剑柄上。' },
        { id: 'n034', type: 'narration', text: '苏小棠跑过来，脸是白的。' },
        { id: 'd027', type: 'dialogue', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「天啊——你们看到了吗——刚才那是什么——」', action: '苏小棠望着残剑师姐的背影，声音发颤。', branch_to: 'd028' },
        { id: 'd028', type: 'dialogue', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「师姐好厉害——」', action: '苏小棠攥紧了剑带，脸色仍白。', branch_to: 'd029' },
        { id: 'n035', type: 'narration', text: '劳叔沉默了很久。' },
        { id: 'd029', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「我在这片竹林砍了三十年竹子。没见过那东西。」', action: '劳叔看了一眼残剑师姐的背影。', branch_to: 'd030' },
        { id: 'd030', type: 'dialogue', character: '劳叔', avatar: 'wenjianfeng_laoshu', line: '「……她每年都会来一次竹林。以前我以为她是来散步。」', action: '劳叔说到这里，忽然闭了口。', branch_to: null }
      ],
      inquiryReplies: [
        { id: 'd037', character: '问剑峰众人', avatar: 'wenjianfeng_disciple', line: '「不知道。」', action: '对方摇了摇头。', branch_to: null },
        { id: 'd038', character: '问剑峰众人', avatar: 'wenjianfeng_disciple', line: '「别问了。」', action: '对方移开目光，不再开口。', branch_to: null }
      ]
    },

    boarFeast: {
      lines: [
        { id: 'n122', speaker: 'narrator', text: '黄昏。伙房。你把野猪拖到门口。老蔡看了三秒。' },
        { id: 'd122', speaker: '老蔡', text: '他看了看野猪，只道：「打得不错。」没有问那个东西的事。', character: '老蔡', avatar: 'wenjianfeng_laocai', line: '「打得不错。」', action: '老蔡看了看野猪，没有问那个东西的事。', branch_to: null },
        { id: 'n123', speaker: 'narrator', text: '那天晚上的红烧肉特别多。全门派都在——除了残剑师姐和剑翁。苏小棠吃了三碗。周碛难得没嘴贱，只在吃肉时看了你一眼。铁牛拍了拍你肩膀——你差点趴下。' },
        { id: 'd123', speaker: '铁牛', text: '铁牛收回手掌，只说了一个字：「好。」', character: '铁牛', avatar: 'wenjianfeng_tieniu', line: '「好。」', action: '铁牛收回手掌。', branch_to: null },
        { id: 'n124', speaker: 'narrator', text: '剑翁那份由你送上去。' }
      ]
    },

    jianweng: {
      lines: [
        { id: 'n125', speaker: 'narrator', text: '剑翁吃了一口，停了一下。' },
        { id: 'd124', speaker: '剑翁', text: '他看着碗里的肉，道：「野猪。你自己打的？」', character: '剑翁', avatar: 'wenjianfeng_jianweng', line: '「野猪。你自己打的？」', action: '剑翁看着碗里的肉。', branch_to: 'd125' },
        { id: 'n126', speaker: 'narrator', text: '你点头。' },
        { id: 'd125', speaker: '剑翁', text: '剑翁放下筷子，问道：「那个也来了？」', character: '剑翁', avatar: 'wenjianfeng_jianweng', line: '「那个也来了？」', action: '剑翁放下筷子。', branch_to: null },
        { id: 'n127', speaker: 'narrator', text: '你愣了一下。剑翁没有再问。但他把碗里的肉吃干净了。以前他总是剩半碗。' }
      ]
    },

    eveningMeal: {
      id: 'ch2_evening_meal',
      stage: 6,
      title: '回到日常·野猪加餐',
      room: '问剑峰·伙房',
      next: 'ch2_done',
      copy: [
        { id: 'n036', type: 'narration', text: '黄昏。伙房。你把野猪拖回伙房门口。老蔡看了三秒。' },
        { id: 'd031', type: 'dialogue', character: '老蔡', avatar: 'wenjianfeng_laocai', line: '「打得不错。」', action: '老蔡看了看野猪，没有问那个东西的事。', branch_to: 'd032' },
        { id: 'n037', type: 'narration', text: '那天晚上的红烧肉特别多。全门派都在——除了残剑师姐和剑翁。苏小棠吃了三碗。' },
        { id: 'd032', type: 'dialogue', character: '苏小棠', avatar: 'wenjianfeng_suxiaotang', line: '「你杀的猪真好吃——」', action: '苏小棠捧着第三碗饭，筷子没停。', branch_to: 'd033' },
        { id: 'n038', type: 'narration', text: '周碛难得没嘴贱，只在吃肉时看了你一眼。那眼神和平时不一样。铁牛拍了拍你肩膀——你差点趴下。' },
        { id: 'd033', type: 'dialogue', character: '铁牛', avatar: 'wenjianfeng_tieniu', line: '「好。」', action: '铁牛收回蒲扇般的手掌。', branch_to: 'd034' },
        { id: 'n039', type: 'narration', text: '剑翁那份由你送上去。剑翁吃了一口，停了一下。' },
        { id: 'd034', type: 'dialogue', character: '剑翁', avatar: 'wenjianfeng_jianweng', line: '「野猪。」', action: '剑翁看着碗里的肉。', branch_to: 'd035' },
        { id: 'd035', type: 'dialogue', character: '剑翁', avatar: 'wenjianfeng_jianweng', line: '「你自己打的？」', action: '剑翁抬眼看你。', branch_to: 'd036' },
        { id: 'n040', type: 'narration', text: '你点头。' },
        { id: 'd036', type: 'dialogue', character: '剑翁', avatar: 'wenjianfeng_jianweng', line: '「那个也来了？」', action: '剑翁放下筷子。', branch_to: null },
        { id: 'n041', type: 'narration', text: '你愣了一下。剑翁没有再问。但他把碗里的肉吃干净了。以前他总是剩半碗。' }
      ]
    }
  }
};

window.WENJIANFENG_TUTORIAL_CH2 = WENJIANFENG_TUTORIAL_CH2;
if (typeof module !== 'undefined') module.exports = WENJIANFENG_TUTORIAL_CH2;

// === DATA MANIFEST REGISTRY (auto-generated, do not edit) ===
window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof WENJIANFENG_TUTORIAL_CH2 !== 'undefined') window.__DATA_REGISTRY['WENJIANFENG_TUTORIAL_CH2'] = WENJIANFENG_TUTORIAL_CH2; } catch(e) { console.warn('[Registry] WENJIANFENG_TUTORIAL_CH2 not registered:', e.message); }
