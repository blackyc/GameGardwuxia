// ============================================================
// Ghost MUD v2.0 · 问剑峰新手引导 · 第一章·上山
// 生成: 2026-07-01
// 设计文档: docs/剧情文案.md；历史来源见 aidoc/archive_20260707/docs/narrative/wenjianfeng_tutorial_golden3.md
// 引擎依赖: game.js startFactionTutorial → ch1_arrival
// 加载方式: <script> 标签全局加载, 暴露 window.WENJIANFENG_TUTORIAL_CH1
// ============================================================

var WENJIANFENG_TUTORIAL_CH1 = {

  // ============ 巡礼路线：10个停留点 ============
  tourRoute: [
    '问剑峰·山门',
    '问剑峰·剑阶',
    '问剑峰·剑坪',
    '问剑峰·伙房',
    '问剑峰·洗剑池',
    '问剑峰·竹林',
    '问剑峰·药圃',
    '问剑峰·藏剑阁',
    '问剑峰·剑冢',
    '问剑峰·弟子房',
  ],

  // ============ V1.5.1 引路同伴：苏小棠 ============
  guideNpcId: 'wenjianfeng_suxiaotang',
  guideNpcName: '苏小棠',
  guideLeaveRoom: '问剑峰·弟子房',

  guideLines: {
    '问剑峰·山门': '苏小棠坐在第十三级台阶上，朝你晃了晃手里的树枝。',
    '问剑峰·剑阶': '苏小棠倒着走在前头，鞋跟一点一点蹭着石阶。',
    '问剑峰·剑坪': '苏小棠站在剑坪边上，指给你看各处去路。',
    '问剑峰·伙房': '苏小棠闻到锅气，脚步明显快了些。',
    '问剑峰·洗剑池': '苏小棠压低声音，提醒你别碰池底断剑。',
    '问剑峰·竹林': '苏小棠避开竹根，小声说劳叔听得见脚步。',
    '问剑峰·药圃': '苏小棠拉你绕开几株药草，生怕你踩错。',
    '问剑峰·藏剑阁': '苏小棠放轻脚步，示意你不要吵醒阁老。',
    '问剑峰·剑冢': '苏小棠缩了缩脖子，站在你身后半步。',
    '问剑峰·弟子房': '苏小棠把你送到门前，长长松了口气。',
  },

  guideTalk: {
    '问剑峰·山门': [
      { speaker: '苏小棠', text: '「新来的？」苏小棠从石阶上跳下来，打量你两眼。' },
      { speaker: '苏小棠', text: '「我叫苏小棠。萧师叔让我带你认路，先记住今天的口令：残月。」' },
    ],
    '问剑峰·剑阶': [
      { speaker: '苏小棠', text: '「这一段一百零八级。你要是走不动，就说一声。」' },
      { speaker: '苏小棠', text: '「不过别太大声，我会假装没听见。」' },
    ],
    '问剑峰·剑坪': [
      { speaker: '苏小棠', text: '「这里是剑坪。除了吃饭睡觉，大家基本都在这儿。」' },
      { speaker: '苏小棠', text: '「伙房、洗剑池、竹林、药圃、藏剑阁、剑冢，全都从这边绕。」' },
    ],
    '问剑峰·伙房': [
      { speaker: '苏小棠', text: '「老蔡做什么都好吃。他要是凶你，你别怕，他凶谁都那样。」' },
    ],
    '问剑峰·洗剑池': [
      { speaker: '苏小棠', text: '「剑用完了来这里洗。池底那几把断剑别碰，会被骂。」' },
    ],
    '问剑峰·竹林': [
      { speaker: '苏小棠', text: '「劳叔天天在里面削竹子。你别跟他比耐心，真的。」' },
    ],
    '问剑峰·药圃': [
      { speaker: '苏小棠', text: '「阿青在这儿。她认识很多草，更多是她以为自己认识。」' },
    ],
    '问剑峰·藏剑阁': [
      { speaker: '苏小棠', text: '「阁老在门口打盹。别吵他，虽然吵了他也未必醒。」' },
    ],
    '问剑峰·剑冢': [
      { speaker: '苏小棠', text: '「剑翁住在最上面。他不下山吃饭，老蔡会送。以后可能轮到你。」' },
    ],
    '问剑峰·弟子房': [
      { speaker: '苏小棠', text: '「这是弟子房。你住这间，我住隔壁，周碛住对面。」' },
      { speaker: '苏小棠', text: '「走累了，剩下的你自己转悠吧！」' },
    ],
  },

  isGuideActive: function(game, room) {
    var s = game && game.state ? game.state : {};
    var here = room || s.location;
    return s.tutorialPhase === 'ch1_tour'
      && s.guideCompanion === this.guideNpcId
      && this.tourRoute.indexOf(here) >= 0;
  },

  getGuideHint: function(room) {
    return this.guideLines[room] || '';
  },

  getGuideEncounter: function(game, room) {
    if (!this.isGuideActive(game, room)) return null;
    var here = room || game.state.location;
    var lines = this.guideTalk[here] || [{ speaker: this.guideNpcName, text: '「跟上，我带你认路。」' }];
    var routeIndex = this.tourRoute.indexOf(here);
    var nextRoom = this.tourRoute[routeIndex + 1];
    var nextName = nextRoom ? nextRoom.replace('问剑峰·', '') : '';
    return {
      id: this.guideNpcId + '_guide',
      title: this.guideNpcName,
      name: this.guideNpcName,
      memoryKey: this.guideNpcId,
      desc: '一个年轻女弟子，剑悬在身前，站得笔直。她正带你认路。',
      dialogueTier: 'story',
      canSpar: false,
      dialogueLines: lines,
      results: [{
        choice: nextRoom ? '请她继续带路' : '向她道谢',
        log: nextRoom ? '你请苏小棠继续带路。' : '你向苏小棠道谢。',
        nextLines: [{
          speaker: this.guideNpcName,
          text: nextRoom ? ('「下一站是' + nextName + '。跟紧些。」') : '「走累了，剩下的你自己转悠吧！」'
        }],
        relationship: {
          affinity: 1,
          flags: ['suxiaotang_guided'],
          note: '苏小棠记得你认真听她说路。'
        }
      }]
    };
  },

  // ============ 每个房间的剧情事件 ============
  scenes: {

    '问剑峰·山门': {
      onEnter: function(game) {
        game.state.location = '问剑峰·山门';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一条青石阶蜿蜒入云，消失在雾里。石阶很老了——有些缺了角，有些长了青苔。但中间那一道被踩得很光。` },
        { speaker: '苏小棠', text: `「新来的？」一个声音从上面飘下来。苏小棠坐在第十三级台阶上，两条腿晃荡着看你。笑得很好看。` },
        { speaker: '苏小棠', text: `「你也是来练剑的？太好了——这山上终于有比我晚来的了！」` },
        { speaker: '苏小棠', text: `「我叫苏小棠。来了一年半。暂时还打不过周碛——」` },
        { speaker: '苏小棠', text: `「——但是快了！真的快了！你先别笑——」` },
        { speaker: '苏小棠', text: `「……你叫什么名字？」` },
        { speaker: '苏小棠', text: `「名字还行。」她站起来，拍了拍衣服上的灰。「走吧，我带你去见萧师叔——」` },
        { speaker: '苏小棠', text: `她走了两步，又回头。「对了。山门口的值星会问你口令。今天的口令是「残月」。」` },
        { speaker: '苏小棠', text: `「记住了？」` },
      ],
      moveHint: `跟随苏小棠往北走（剑阶方向）——点击「感知」选择方向`,
      availableMoves: ['上'],
    },

    '问剑峰·剑阶': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑阶';
      },
      npcDialog: [
        { speaker: 'narrator', text: `石阶共一百零八级。中间被踩出一道浅槽，两侧生了青苔。苏小棠在前面倒着走，一点都不怕摔着。` },
        { speaker: '苏小棠', text: `「新来的，我可跟你说清楚。带你认路是萧师叔派的任务，耽误了我吃午饭，你得赔我。」` },
      ],
      moveHint: `继续往上走（剑坪方向）`,
      availableMoves: ['上'],
    },

    '问剑峰·剑坪': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑坪';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一片开阔的石台。地面青石板被踩得很光。正中立着一个木桩，上面插着卷了刃的旧剑。` },
        { speaker: '苏小棠', text: `她侧过身，指了指那片宽阔的平地。「前面是剑坪。除了吃饭睡觉，基本都在那。」` },
        { speaker: '苏小棠', text: `「左边——伙房。老蔡做什么都好吃。他要是凶你，你别怕——他凶谁都那样。」` },
        { speaker: '苏小棠', text: `「往上——洗剑池。剑用完了去洗。池子里有几把断剑，别碰，会被骂。」` },
        { speaker: '苏小棠', text: `「右边那条小路——后山竹林。劳叔天天在里面削竹子，一削就是一天。千万别去跟他比耐心，上个月周碛去比，在竹林里坐了两个时辰，最后被蚊子抬出来的。」` },
        { speaker: '苏小棠', text: `「往上那条岔路——药圃。阿青在那。她认识很多草——但是更多是她以为她认识。」` },
        { speaker: '苏小棠', text: `「至于最上面……」苏小棠缩了缩脖子。` },
        { speaker: '苏小棠', text: `「最高的地方——剑冢。那是剑翁的地盘。他不下山吃饭。老蔡会送。以后可能轮到你送。」` },
        { speaker: '苏小棠', text: `「哦对了——我们住弟子房。你跟我住隔壁。周碛住对面。阿满住对面隔壁。」` },
        { speaker: '苏小棠', text: `她一拍手，笑得眼睛弯成了月牙：「好了，认完了！要是迷路了别找我，找我也没用，因为我偶尔也迷路。」` },
        // 残剑师姐
        { speaker: 'narrator', text: `残剑师姐正在剑坪中央站着。剑未出鞘。她的姿势一动不动，像一尊石雕。苏小棠放慢了脚步。` },
        { speaker: '苏小棠', text: `「残剑师姐——」她小声叫你：「你不用跟她打招呼。她不一定理你。但是别怕她——她只是不爱说话。」` },
        { speaker: 'narrator', text: `走近时，残剑师姐微微点了一下头。` },
        { speaker: '苏小棠', text: `苏小棠瞪大了眼睛。「她对你点头了？？？我来了大半年她才对我点头！！！」` },
      ],
      moveHint: `往东走，去伙房看看`,
      availableMoves: ['东'],
    },

    '问剑峰·伙房': {
      onEnter: function(game) {
        game.state.location = '问剑峰·伙房';
      },
      npcDialog: [
        { speaker: 'narrator', text: `灶台上的大锅咕嘟咕嘟响。墙上挂着几串干辣椒和一把锅铲。炊烟顺着山势往上飘。` },
        { speaker: '老蔡', text: `老蔡从灶台后面探出头。锅铲还在手里。「新来的？——晚饭有你一份。别迟到。」` },
        { speaker: '苏小棠', text: `苏小棠小声：「他在跟锅铲说话还是跟我们说话？」` },
        { speaker: '老蔡', text: `「我都听见了。」` },
      ],
      moveHint: `回头往西走回剑坪，然后往上走（洗剑池方向）`,
      availableMoves: ['西'],
    },

    '问剑峰·洗剑池': {
      onEnter: function(game) {
        game.state.location = '问剑峰·洗剑池';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一泓山泉汇成的池子，水清见底——池底有几把断剑，锈迹斑斑。水从上面岩壁的裂缝渗出来，叮咚叮咚落进池里。` },
        { speaker: 'narrator', text: `盲眼老妪坐在池边石板上，眼窝深陷，似盲。她的手搭在膝上，指节粗大。她没有看你。` },
      ],
      moveHint: `继续往上走（竹林方向）`,
      availableMoves: ['上'],
    },

    '问剑峰·竹林': {
      onEnter: function(game) {
        game.state.location = '问剑峰·竹林';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一片青竹长在后山，密密匝匝。风过竹林，沙沙作响。林中有一间竹棚，棚下有一张矮桌、一把竹椅。竹丝散了一地。` },
        { speaker: '劳叔', text: `劳叔没抬头。「新来的。」「嗯。」` },
        { speaker: '劳叔', text: `劳叔手里削竹丝的速度一点没变。「你走偏了。左脚往左三寸——那根竹子我留着做剑鞘的。」` },
        { speaker: 'narrator', text: `你没碰到那根竹子。但你还是挪了一步。` },
        { speaker: '苏小棠', text: `「他怎么知道的——他在看你吗？他是不是在看你？他明明没抬头——」` },
        { speaker: '劳叔', text: `劳叔还是没抬头。` },
      ],
      moveHint: `往东走（药圃方向）`,
      availableMoves: ['东'],
    },

    '问剑峰·药圃': {
      onEnter: function(game) {
        game.state.location = '问剑峰·药圃';
      },
      npcDialog: [
        { speaker: 'narrator', text: `竹林东边辟了一小块地，种着些草药。地垄挖得不太直，有些药草种得歪歪斜斜。角落里有一间草棚，气味浓烈。` },
        { speaker: '阿青', text: `阿青蹲在地上，拿树枝戳一条蛇。「你走不走？你不走我采错草了你负不负责？」` },
        { speaker: '阿青', text: `看见你们路过，她抬头：「新师弟？——你认识蛇胆草吗？」` },
        { speaker: '苏小棠', text: `苏小棠拉着你走了。「不认识。走。」` },
      ],
      moveHint: `往西回竹林，然后继续往上（剑冢方向）。路上会经过藏剑阁——先去那看看`,
      availableMoves: ['西'],
    },

    '问剑峰·藏剑阁': {
      onEnter: function(game) {
        game.state.location = '问剑峰·藏剑阁';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一栋二层木楼，门虚掩着。里面是一排排木架，架上放着书卷和剑谱。靠窗有一张书桌，桌上有砚台和半卷书。` },
        { speaker: 'narrator', text: `门口坐着一个老人——在打盹。` },
        { speaker: '苏小棠', text: `苏小棠拉了你一把：「别吵他。虽然吵他也不会醒——但万一醒了呢。」` },
        { speaker: 'narrator', text: `老人还是没动。` },
      ],
      moveHint: `往东回剑坪，然后往上经过洗剑池、竹林，到剑冢`,
      availableMoves: ['东'],
    },

    '问剑峰·剑冢': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑冢';
      },
      npcDialog: [
        { speaker: 'narrator', text: `问剑峰最高处。一片空旷的平地，插满了断剑。有的只剩半截，有的锈得看不出形状。粗略数去，有上百把。` },
        { speaker: 'narrator', text: `一个独眼老人坐在一把最大的断剑后面。` },
        { speaker: '剑翁', text: `剑翁抬头看了你一眼。又看了一眼苏小棠。「多了。」` },
        { speaker: '苏小棠', text: `「剑翁，这是新来的师弟——」` },
        { speaker: '剑翁', text: `「我知道。」剑翁闭上了眼睛。「回去的时候注意脚下。」` },
      ],
      moveHint: `下山回弟子房——往下走`,
      availableMoves: ['下'],
    },

    '问剑峰·弟子房': {
      onEnter: function(game) {
        game.state.location = '问剑峰·弟子房';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一排木屋。苏小棠把你领到一间门前。` },
        { speaker: '苏小棠', text: `「这是弟子房。你住这间——我住隔壁。周碛住对面。阿满住对面隔壁。」` },
        { speaker: '苏小棠', text: `「东西放好。晚饭还有半个时辰——你可以到处逛逛，也可以等着。」` },
        { speaker: '苏小棠', text: `她走了两步又回来。「对了——老蔡要是给你加菜，你得分我一半。」` },
        { speaker: 'narrator', text: `💡 巡礼结束！你现在可以自由活动了。到处逛逛，到了饭点去伙房吃晚饭。` },
      ],
      moveHint: null, // 巡礼结束，进入自由活动
      availableMoves: [],
      onTourComplete: true,
    },

  },

  // ============ 自由活动阶段的NPC额外对话 ============
  freeTimeDialogs: {
    '问剑峰·剑坪': [
      { speaker: '残剑师姐', text: `残剑师姐依旧站在剑坪中央。剑未出鞘。她没有看你。也许她不需要看。` },
    ],
    '问剑峰·伙房': [
      { speaker: '老蔡', text: `老蔡在灶台后面忙活。他瞥了你一眼。「还没开饭。要帮忙就过来揉面——别添乱就行。」` },
    ],
    '问剑峰·洗剑池': [
      { speaker: '盲眼老妪', text: `盲眼老妪坐在池边。她没有看你。但她开口了。「你的剑鞘没擦干净。第三次了。」——其实只有两次。` },
    ],
    '问剑峰·竹林': [
      { speaker: '劳叔', text: `劳叔在削竹丝。没有抬头。「又来了？那边——对，那根竹子也不好。别碰。」` },
    ],
    '问剑峰·药圃': [
      { speaker: '阿青', text: `阿青在翻土。「你要是没事做，帮我把那堆杂草清了。——别碰蛇胆草！那棵不是杂草，是我种的……大概。」` },
    ],
    '问剑峰·藏剑阁': [
      { speaker: '藏剑阁老', text: `阁老在打盹。你从他面前经过。他忽然开口了：「不是那边。」——你不知道他在说什么。他也没睁眼。` },
    ],
    '问剑峰·剑冢': [
      { speaker: '剑翁', text: `剑翁在扫落叶。那些叶子昨天扫过了。「你又来了。」他没回头。「回去的时候注意脚下。」` },
    ],
    '问剑峰·弟子房': [
      { speaker: 'narrator', text: `你的房间。木床、被褥、矮桌、油灯。窗子朝南，能看见剑坪。隔壁传来苏小棠哼歌的声音——跑调了。` },
    ],
  },

  // ============ 晚饭事件 ============
  dinnerEvent: {
    trigger: '问剑峰·伙房',
    // 触发条件：自由活动阶段（ch1_free）第一次进入伙房
    dialog: [
      { speaker: 'narrator', text: `伙房里挤满了人。老蔡一个人在灶台后面忙，锅铲翻飞。铁牛在搬碗筷。小荷在盛饭。` },
      { speaker: '老蔡', text: `老蔡给你盛了一碗——碗底藏了一块红烧肉。「昨天剩的。别跟别人说。」` },
      { speaker: '苏小棠', text: `苏小棠从你碗里夹走了半块。「你说得分你一半的。」` },
      { speaker: '周碛', text: `周碛从对面看过来：「新来的都能分肉？老蔡你偏心。」` },
      { speaker: '老蔡', text: `「你上周偷吃了我三块肉。记账的。」` },
      { speaker: 'narrator', text: `全体哄笑。周碛嘟囔了一句，继续吃饭。` },
    ],
    afterDinner: function(game) {
      game.state.tutorialPhase = 'ch1_done';
      game.addLog(`💡 第一章·上山 完。明日清晨，剑坪晨练。`, 'system');
      game.addLog(`💡 你现在可以自由探索问剑峰，或者等待第二章更新。`, 'system');
      game.renderer.updateUI();
    },
  },

  // ============ 主入口：由 game.js 的 startFactionTutorial 调用 ============
  start: function(game) {
    game.state.tutorialPhase = 'ch1_tour';
    game.state.tutorialStep = 0;
    game.state.guideCompanion = this.guideNpcId;
    game.state.tutorialSeenRooms = {};
    this.enterScene(game, 0);
  },

  // ============ 进入巡礼的第n步 ============
  enterScene: function(game, step) {
    var room = this.tourRoute[step];
    var scene = this.scenes[room];
    if (!scene) return;
    game.state.location = room;
    game.state.tutorialStep = step;
    game.state.tutorialSeenRooms = game.state.tutorialSeenRooms || {};
    game.state.tutorialSeenRooms[room] = true;
    if (Array.isArray(game.state.explored) && game.state.explored.indexOf(room) < 0) {
      game.state.explored.push(room);
    }
    if (scene.onEnter) scene.onEnter(game);

    var hint = this.getGuideHint(room);
    if (hint) game.addLog(hint, 'info');
    if (scene.moveHint) {
      game.addLog('💡 ' + scene.moveHint, 'system');
    }

    // 完整人物台本不写入主场景区，改由苏小棠 NPC 的言路窗口承载。
    if (scene.onTourComplete) {
      game.addLog('苏小棠：「走累了，剩下的你自己转悠吧！」', 'info');
      game.state.guideCompanion = null;
      game.state.tutorialPhase = 'ch1_free';
      game.addLog('💡 自由活动：你可以去剑坪、伙房、洗剑池等地方逛逛。到了饭点去伙房吃晚饭。', 'system');
    }
    if (game.renderer && game.renderer.updateUI) game.renderer.updateUI();
  },

  // ============ 玩家移动时由 game.js 调用 ============
  // 参数: game, target(目标房间名)
  // 返回: true=允许移动, false=阻止移动
  onMove: function(game, target) {
    var step = game.state.tutorialStep || 0;
    var phase = game.state.tutorialPhase;

    if (phase === 'ch1_tour') {
      var nextRoom = this.tourRoute[step + 1];
      if (target === nextRoom) {
        this.enterScene(game, step + 1);
        return true;
      }
      var routeIndex = this.tourRoute.indexOf(target);
      if (routeIndex >= 0 && routeIndex < step) {
        game.addLog('苏小棠停在前头等你，示意你看完就跟上。', 'info');
        return true;
      }
      game.addLog('苏小棠在前面招手，示意你先跟着她认路。', 'info');
      return false;
    }

    if (phase === 'ch1_free') {
      if (target === this.dinnerEvent.trigger && !game.state.wenjianfengDinnerDone) {
        game.state.wenjianfengDinnerDone = true;
        game.addLog('伙房里热气腾腾，老蔡给你盛了饭。苏小棠从你碗里夹走半块肉。', 'info');
        this.dinnerEvent.afterDinner(game);
        return true;
      }
      return true;
    }

    if (phase === 'ch1_done') return true;
    return false;
  },

  // ============ 玩家进入房间后调用（自由活动阶段）============
  // 由 game.js explore() 在移动完成后调用
  onEnterRoom: function(game, room) {
    // V1.5.1：自由活动阶段不再把 NPC 台本自动灌入主场景区。
    // 房间氛围由 room desc 负责，人物台本由 NPC 言路窗口负责。
    if (game.state.tutorialPhase !== 'ch1_free') return;
  },

};

window.WENJIANFENG_TUTORIAL_CH1 = WENJIANFENG_TUTORIAL_CH1;
if (typeof module !== 'undefined') module.exports = WENJIANFENG_TUTORIAL_CH1;

// === DATA MANIFEST REGISTRY (auto-generated, do not edit) ===
window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof WENJIANFENG_TUTORIAL_CH1 !== 'undefined') window.__DATA_REGISTRY['WENJIANFENG_TUTORIAL_CH1'] = WENJIANFENG_TUTORIAL_CH1; } catch(e) { console.warn('[Registry] WENJIANFENG_TUTORIAL_CH1 not registered:', e.message); }
