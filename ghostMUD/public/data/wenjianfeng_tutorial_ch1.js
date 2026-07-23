// ============================================================
// Ghost MUD v2.0 · 问剑峰新手引导 · 第一章·上山
// 生成: 2026-07-01
// 设计文档: docs/narrative/wenjianfeng_tutorial_golden3.md §5
// 引擎依赖: game.js startFactionTutorial → ch1_arrival
// 加载方式: <script> 标签全局加载, 暴露 window.WENJIANFENG_TUTORIAL_CH1
// ============================================================

var WENJIANFENG_TUTORIAL_CH1 = {

  // ============ 巡礼路线：真实往返，不跳过山路与院落 ============
  tourRoute: [
    '问剑峰·山门',
    '问剑峰·剑阶·下段',
    '问剑峰·剑阶·中段',
    '问剑峰·剑阶·上段',
    '问剑峰·剑坪',
    '问剑峰·藏剑阁前庭',
    '问剑峰·藏剑阁',
    '问剑峰·藏剑阁前庭',
    '问剑峰·剑坪',
    '问剑峰·伙房外院',
    '问剑峰·伙房',
    '问剑峰·伙房外院',
    '问剑峰·剑坪',
    '问剑峰·后山石径',
    '问剑峰·引泉坡',
    '问剑峰·洗剑池',
    '问剑峰·涧边小径',
    '问剑峰·竹林外缘',
    '问剑峰·竹林',
    '问剑峰·竹林外缘',
    '问剑峰·药圃田埂',
    '问剑峰·药圃',
    '问剑峰·药圃田埂',
    '问剑峰·竹林外缘',
    '问剑峰·竹林',
    '问剑峰·断剑坡',
    '问剑峰·守冢石阶',
    '问剑峰·剑冢',
    '问剑峰·守冢石阶',
    '问剑峰·断剑坡',
    '问剑峰·竹林',
    '问剑峰·竹林外缘',
    '问剑峰·涧边小径',
    '问剑峰·洗剑池',
    '问剑峰·引泉坡',
    '问剑峰·后山石径',
    '问剑峰·剑坪',
    '问剑峰·弟子院',
    '问剑峰·弟子房',
  ],

  // ============ 每个房间的剧情事件 ============
  scenes: {

    '问剑峰·山门': {
      onEnter: function(game) {
        game.state.location = '问剑峰·山门';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一条青石阶蜿蜒入云。` },
        { speaker: '苏小棠', text: `「新来的？」一个声音从上面飘下来。一个女弟子坐在台阶之上，两条腿晃荡着看你。笑得很好看。` },
        { speaker: '苏小棠', text: `「太好了——这山上终于有比我晚来的了！」` },
        { speaker: '苏小棠', text: `「我叫苏小棠。来了两年半……你叫什么名字？」` },
        { speaker: '苏小棠', text: `「名字还行。」她站起来，「走吧，我带你去见萧师叔——」` },
        { speaker: '苏小棠', text: `「对了。山门口的弟子会问你口令。今天的口令是「残月」。」` },
        { speaker: '苏小棠', text: `「你可记住？」` },
      ],
      moveHint: `跟随苏小棠沿石阶往北走——点击路线图上的「剑阶」`,
      availableMoves: ['北'],
    },

    '问剑峰·剑阶·下段': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑阶·下段';
      },
      npcDialog: [
        { speaker: 'narrator', text: `苏小棠在前面倒着走，一点都不怕摔着。` },
        { speaker: '苏小棠', text: `「快点快点~ 老蔡的午饭就要被大家吃光了！」` },
      ],
      moveHint: `继续沿石阶往北走`,
      availableMoves: ['北'],
    },

    '问剑峰·剑阶·中段': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑阶·中段';
      },
      npcDialog: [
        { speaker: 'narrator', text: `石阶绕过一株斜松，山门被树梢遮去。松根旁散着一片白芷，像有人匆忙停留过。` },
        { speaker: '苏小棠', text: `「小心这里的松根，别问我为什么。还有，你要是看见什么白白的东西，记得告诉我。」` },
      ],
      moveHint: `再沿石阶往北走一段`,
      availableMoves: ['北'],
    },

    '问剑峰·剑阶·上段': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑阶·上段';
      },
      npcDialog: [
        { speaker: 'narrator', text: `石阶渐缓，上方传来木剑相撞的闷响。` },
        { speaker: '苏小棠', text: `「到了。你看，剑坪就在前面——我说过吧，跟着我准没错。」` },
      ],
      moveHint: `继续往北走（剑坪方向）`,
      availableMoves: ['北'],
    },

    '问剑峰·剑坪': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑坪';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一片开阔的石台，正中立着一个木桩。` },
        { speaker: '苏小棠', text: `指了指宽阔平地：「剑坪。除了吃饭睡觉，基本都在这儿。」` },
        { speaker: '苏小棠', text: `「阁楼那边是藏剑阁；伙房在另一边。老蔡做什么都好吃，他要是凶你，你别怕，他就那样。」` },
        { speaker: '苏小棠', text: `「后山路要先过石径和引泉坡，才到洗剑池。剑用完了去洗，池子里有几把断剑，别碰，会被骂。」` },
        { speaker: '苏小棠', text: `「再往竹林里走，东边才是药圃。阿青认识很多草——呃，她觉得她认识。」` },
        { speaker: '苏小棠', text: `「最高处是剑冢，剑翁的地盘。他不下来吃饭，老蔡得送。以后可能轮到你送。」` },
        { speaker: '苏小棠', text: `「我们住弟子院，等会儿带你认门。你住我隔壁，周碛住对面，阿满住对面隔壁。」` },
        { speaker: '苏小棠', text: `「残剑师姐不用特地打招呼。她一定不会搭理你，不是讨厌你——她就是不爱说话。」` },
        { speaker: 'narrator', text: `走近时，残剑师姐微微点了一下头。` },
        { speaker: '苏小棠', text: `苏小棠瞪大了眼睛：「她对你点头了？？？我来了大半年她才对我点头！！！」` },
      ],
      moveHint: `苏小棠先往藏剑阁前庭走去。`,
      availableMoves: ['西'],
      variants: {
        8: {
          npcDialog: [
            { speaker: '苏小棠', text: `「阁老今天又没睡醒。走吧，咱们去伙房。饭香在，没意外。」` },
          ],
          moveHint: `她已经往伙房外院那边走了。`,
          availableMoves: ['东'],
        },
        12: {
          npcDialog: [
            { speaker: '苏小棠', text: `「认完饭香，接下来带你走正经山路。」` },
          ],
          moveHint: `跟着她转入后山石径。`,
          availableMoves: ['北'],
        },
        36: {
          npcDialog: [
            { speaker: 'narrator', text: `回到剑坪时，剑冢方向已经被树影遮住。一路的水声、竹声忽然都远了。` },
            { speaker: '苏小棠', text: `「好啦，最远的地方也认过了。现在回弟子院，给你看住处。可别一会儿又说自己记不得路。」` },
          ],
          moveHint: `苏小棠指向弟子院，等你跟上。`,
          availableMoves: ['东南'],
        },
      },
    },

    '问剑峰·藏剑阁前庭': {
      onEnter: function(game) {
        game.state.location = '问剑峰·藏剑阁前庭';
      },
      npcDialog: [
        { speaker: 'narrator', text: `檐下的石砖比剑坪干净些，一株老梅从矮墙后探出枝头。前方木楼门扉半掩，纸墨味散在风中。` },
        { speaker: '苏小棠', text: `「先在外头收收声。阁老看着总在打盹，真吵醒了，比背剑谱还麻烦。」` },
      ],
      moveHint: `她压低声音，示意进去看一眼。`,
      availableMoves: ['西'],
      variants: {
        7: {
          npcDialog: [
            { speaker: '苏小棠', text: `「看完啦？走走走，别挡着阁老晒太阳。下一站是伙房，我保证比剑谱好懂。」` },
          ],
          moveHint: `苏小棠折回剑坪。`,
          availableMoves: ['东'],
        },
      },
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
      moveHint: `苏小棠轻手轻脚退回前庭。`,
      availableMoves: ['东'],
    },

    '问剑峰·伙房外院': {
      onEnter: function(game) {
        game.state.location = '问剑峰·伙房外院';
      },
      npcDialog: [
        { speaker: 'narrator', text: `院里平码着柴垛，墙根摆着三口大水缸。水缸边湿了一圈，木桶来回拖出的水痕一直延到伙房门槛。` },
        { speaker: '苏小棠', text: `「看见没？明早挑水就得填这几口缸。你现在装作没看见也没用，老蔡记性好得很。」` },
      ],
      moveHint: `她推开伙房门帘。`,
      availableMoves: ['东'],
      variants: {
        11: {
          npcDialog: [
            { speaker: '苏小棠', text: `「走走走，老蔡快追上来啦！」` },
          ],
          moveHint: `她穿过外院，往剑坪折返。`,
          availableMoves: ['西'],
        },
      },
    },

    '问剑峰·伙房': {
      onEnter: function(game) {
        game.state.location = '问剑峰·伙房';
      },
      npcDialog: [
        { speaker: '老蔡', text: `老蔡从灶台后面探出头：「新来的？晚饭有你一份。别迟到。」` },
        { speaker: '苏小棠', text: `苏小棠小声：「他在跟锅铲说话还是跟我们说话？」` },
        { speaker: '老蔡', text: `「我都听见了。」` },
      ],
      moveHint: `苏小棠已经退回伙房外院。`,
      availableMoves: ['西'],
    },

    '问剑峰·后山石径': {
      onEnter: function(game) {
        game.state.location = '问剑峰·后山石径';
      },
      npcDialog: [
        { speaker: 'narrator', text: `剑坪的平石在身后收窄成一条山径。` },
        { speaker: '苏小棠', text: `「别小看这段。挑满两桶水回来，腿会跟你讲理。」` },
      ],
      moveHint: `她沿着有水痕的山径继续走。`,
      availableMoves: ['北'],
      variants: {
        35: {
          npcDialog: [
            { speaker: '苏小棠', text: `「是不是觉得这段也没那么远？那是你空着手！」` },
          ],
          moveHint: `她带你回剑坪。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·引泉坡': {
      onEnter: function(game) {
        game.state.location = '问剑峰·引泉坡';
      },
      npcDialog: [
        { speaker: 'narrator', text: `坡边凿着一条浅浅的引水槽，泉水在青石间淌过，汇成细亮的一线。` },
        { speaker: '苏小棠', text: `「到这儿可别乱跑。石头滑，我去年就在这儿一骨碌摔了下去。」` },
      ],
      moveHint: `前面便是洗剑池。`,
      availableMoves: ['北'],
      variants: {
        34: {
          npcDialog: [
            { speaker: '苏小棠', text: `「尤其挑水的时候要留神，摔了就白摔。」` },
          ],
          moveHint: `她沿坡回到后山石径。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·洗剑池': {
      onEnter: function(game) {
        game.state.location = '问剑峰·洗剑池';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一泓山泉汇成的池子，水清见底——池底有几把断剑，锈迹斑斑。` },
        { speaker: 'narrator', text: `一位老妪坐在池边。` },
      ],
      moveHint: `苏小棠示意沿涧边小径继续走。`,
      availableMoves: ['北'],
      variants: {
        33: {
          npcDialog: [
            { speaker: '苏小棠', text: `她朝池边的老妪轻轻摆手，压低声音：「别盯池底太久，走啦。」` },
          ],
          moveHint: `她领你沿来路回引泉坡。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·涧边小径': {
      onEnter: function(game) {
        game.state.location = '问剑峰·涧边小径';
      },
      npcDialog: [
        { speaker: '苏小棠', text: `「从这儿起就算进后山了。白天没什么，天黑以后别一个人乱钻——劳叔都说里面会绕路。」` },
      ],
      moveHint: `她朝竹林外缘走去。`,
      availableMoves: ['北'],
      variants: {
        32: {
          npcDialog: [
            { speaker: '苏小棠', text: `「你看，水声一响就知道快到洗剑池了。我也不是每次都迷路。」` },
          ],
          moveHint: `她沿涧边回洗剑池。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·竹林外缘': {
      onEnter: function(game) {
        game.state.location = '问剑峰·竹林外缘';
      },
      npcDialog: [
        { speaker: 'narrator', text: `竹子还没有合拢成林，地上散着新砍的竹节。再往里，光线被一层层叶子筛碎，只剩竹棚方向有一点人烟。` },
        { speaker: '苏小棠', text: `「这里还算近。再深一点就别乱拐了，劳叔会生气，野猪也会。」` },
      ],
      moveHint: `苏小棠钻进通往竹棚的正路。`,
      availableMoves: ['北'],
      variants: {
        19: {
          npcDialog: [
            { speaker: '苏小棠', text: `「药圃不在竹棚里面，得从外缘的田埂绕过去。你看，阿青的木牌，就是那根。」` },
          ],
          moveHint: `她沿药圃田埂走去。`,
          availableMoves: ['东'],
        },
        23: {
          npcDialog: [
            { speaker: '苏小棠', text: `「阿青今天没追出来，运气不错。我们回竹林正路，再去剑冢。」` },
          ],
          moveHint: `她朝竹棚方向走去。`,
          availableMoves: ['北'],
        },
        31: {
          npcDialog: [
            { speaker: '苏小棠', text: `她回头望了一眼幽深竹影，：「剑冢看完了，快走快走，天色可不等人。」` },
          ],
          moveHint: `她带你离开竹林。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·竹林': {
      onEnter: function(game) {
        game.state.location = '问剑峰·竹林';
      },
      npcDialog: [
        { speaker: '劳叔', text: `劳叔没抬头。「新来的？不错，是个好苗子。」` },
        { speaker: '劳叔', text: `劳叔手里削竹丝的速度一点没变。「你走偏了。左脚往左三寸——那根竹子我留着做剑鞘的。」` },
        { speaker: 'narrator', text: `但你挪了一步。` },
        { speaker: '苏小棠', text: `「他怎么知道的——他在看你吗？他明明没抬头——」` },
      ],
      moveHint: `苏小棠先退回竹林外缘，示意你别把路记错。`,
      availableMoves: ['南'],
      variants: {
        24: {
          npcDialog: [
            { speaker: '苏小棠', text: `「药圃也认过了。前面那段是断剑坡，别随便捡地上的东西，剑翁都知道。」` },
          ],
          moveHint: `她往断剑坡走去。`,
          availableMoves: ['北'],
        },
        30: {
          npcDialog: [
            { speaker: '苏小棠', text: `她走出几步才敢正常说话：「剑翁话少，但没凶你，说明你运气很好。我们回去吧。」` },
          ],
          moveHint: `她向竹林外缘走去。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·药圃田埂': {
      onEnter: function(game) {
        game.state.location = '问剑峰·药圃田埂';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一条窄田埂把竹影与药圃隔开，边上插着歪歪斜斜的木牌。泥土松软，能看见草鞋留下的新脚印。` },
        { speaker: '苏小棠', text: `「踩中药苗要赔的。阿青说赔一株也行——才怪，她只会递给你一筐，让你自己种。」` },
      ],
      moveHint: `她踮着脚往药圃里去。`,
      availableMoves: ['东'],
      variants: {
        22: {
          npcDialog: [
            { speaker: '苏小棠', text: `「趁阿青没想起那条蛇，快撤。」` },
          ],
          moveHint: `她沿田埂折回竹林外缘。`,
          availableMoves: ['西'],
        },
      },
    },

    '问剑峰·药圃': {
      onEnter: function(game) {
        game.state.location = '问剑峰·药圃';
      },
      npcDialog: [
        { speaker: '阿青', text: `阿青蹲在地上，拿树枝戳一条蛇。「你走不走？你不走我采错草了你负不负责？」` },
        { speaker: '阿青', text: `看见你们路过，她抬头：「新师弟？——你认识蛇胆草吗？」` },
        { speaker: '苏小棠', text: `苏小棠拉着你走了。「不认识。走。」` },
      ],
      moveHint: `她已经退回药圃田埂。`,
      availableMoves: ['西'],
    },

    '问剑峰·断剑坡': {
      onEnter: function(game) {
        game.state.location = '问剑峰·断剑坡';
      },
      npcDialog: [
        { speaker: 'narrator', text: `坡上碎石间埋着几截锈断的剑身，像是从更高处滚落，又被多年枯叶盖住。竹声到了这里已经稀薄。` },
        { speaker: '苏小棠', text: `「别捡。上次阿满捡了半截，剑翁看了他一眼，他就自己放回来了。」` },
      ],
      moveHint: `她放轻脚步，带你走向守冢石阶。`,
      availableMoves: ['北'],
      variants: {
        29: {
          npcDialog: [
            { speaker: '苏小棠', text: `「我就说回来时要看脚下吧。这里摔一跤，滚到竹林得丢半条命。」` },
          ],
          moveHint: `她领你回竹林。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·守冢石阶': {
      onEnter: function(game) {
        game.state.location = '问剑峰·守冢石阶';
      },
      npcDialog: [
        { speaker: 'narrator', text: `石阶比山门处窄得多，两侧无栏，只有风从断崖下卷上来。` },
        { speaker: '苏小棠', text: `她难得没有立刻说话，过了一会儿才道：「再前面就是剑冢。别乱碰，别乱问，嗯……先跟着我就好。」` },
      ],
      moveHint: `苏小棠走在前面，领你登上最后一段石阶。`,
      availableMoves: ['北'],
      variants: {
        28: {
          npcDialog: [
            { speaker: '苏小棠', text: `她直到离开剑冢几步才松口气。「走吧，先回断剑坡。」` },
          ],
          moveHint: `她沿石阶折返。`,
          availableMoves: ['南'],
        },
      },
    },

    '问剑峰·剑冢': {
      onEnter: function(game) {
        game.state.location = '问剑峰·剑冢';
      },
      npcDialog: [
        { speaker: 'narrator', text: `问剑峰最高处。一片空旷的平地，插满了断剑。有的只剩半截，有的锈得看不出形状。粗略数去，有上万把。` },
        { speaker: 'narrator', text: `一个老人坐在一把最大的断剑后面。` },
        { speaker: '剑翁', text: `剑翁抬头看了你一眼。又看了一眼苏小棠。「多了。」` },
        { speaker: '苏小棠', text: `「剑翁，这是新来的师弟——」` },
        { speaker: '剑翁', text: `「我知道。」剑翁闭上了眼睛。「回去的时候注意脚下。」` },
      ],
      moveHint: `苏小棠等你一起沿守冢石阶返回。`,
      availableMoves: ['南'],
    },

    '问剑峰·弟子院': {
      onEnter: function(game) {
        game.state.location = '问剑峰·弟子院';
      },
      npcDialog: [
        { speaker: 'narrator', text: `一方小院围着几排木屋，晒着洗净的练功服。墙根靠着木剑和水桶，窗纸里透出细碎的人声。` },
        { speaker: '苏小棠', text: `「这儿才算我们睡觉的地方。别看小，早晨谁起晚了，全院都能知道。」` },
      ],
      moveHint: `她领你去你的弟子房。`,
      availableMoves: ['内'],
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
        { speaker: '苏小棠', text: `她朝你摆摆手：「走累了，剩下的你自己转悠吧！」` },
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
      { speaker: '残剑师姐', text: `残剑师姐依旧站在剑坪中央。剑未出鞘。` },
    ],
    '问剑峰·伙房': [
      { speaker: '老蔡', text: `「还没开饭。要帮忙就过来揉面，别添乱就行。」` },
    ],
    '问剑峰·洗剑池': [
      { speaker: '盲眼老妪', text: `「你的剑鞘没擦干净。下次注意。」` },
    ],
    '问剑峰·竹林': [
      { speaker: '劳叔', text: `「又来了？那边——对，那根竹子也不好。别碰。」` },
    ],
    '问剑峰·药圃': [
      { speaker: '阿青', text: `「你要是没事做，帮我把那堆杂草清了。别碰那棵！那是我种的……大概。」` },
    ],
    '问剑峰·藏剑阁': [
      { speaker: '藏剑阁老', text: `阁老在打盹。你从他面前经过。他忽然开口了：「不是那边。」——你不知道他在说什么。` },
    ],
    '问剑峰·剑冢': [
      { speaker: '剑翁', text: `「你又来了。回去的时候注意脚下。」` },
    ],
    '问剑峰·弟子房': [
      { speaker: 'narrator', text: `你的房间。木床、被褥、矮桌、油灯。窗子越过弟子院的屋檐，能望见剑坪方向。隔壁传来苏小棠哼歌声。` },
    ],
  },

  // ============ 晚饭事件 ============
  dinnerEvent: {
    trigger: '问剑峰·伙房',
    // 触发条件：自由活动阶段（ch1_free）第一次进入伙房
    dialog: [
      { speaker: 'narrator', text: `伙房里挤满了人。老蔡一个人在灶台后面忙，锅铲翻飞。铁牛在搬碗筷。小荷在盛饭。` },
      { speaker: '老蔡', text: `老蔡给你盛了一碗红烧肉。「昨天剩的。」` },
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

  // ============ 苏小棠：巡礼期间的随行 NPC 数据 ============
  companionProfiles: {
    '问剑峰·山门': {
      desc: '问剑峰弟子，正引你熟悉山门。她说话很快，脚步却总会放慢半拍等你。',
      gossip: [
        '苏小棠压低声音说，剑坪晨练千万别迟到；残剑师姐不会骂人，只会多看你一眼。',
        '她说值星弟子的口令每日换一次，忘了就老实认错，别装作自己记得。',
      ],
      dialogueGraph: {
        id: 'wjf_suxiaotang_gate_intro',
        start: 'ask_name',
        nodes: {
          ask_name: {
            speaker: '苏小棠',
            text: '「……你叫什么名字？」',
            choices: [
              { id: 'introduce', label: '报上姓名', playerLine: '在下初来，劳烦师姐引路。', next: 'warm_reply', effects: { affinity: 1, flags: { introduced: true }, note: '山门处认真报上姓名' } },
              { id: 'ask_her_first', label: '先问名讳', playerLine: '还未请教师姐名讳。', next: 'playful_reply', effects: { affinity: 2, flags: { playful: true }, note: '山门处先向小棠问名' } },
              { id: 'salute', label: '拱手为礼', playerLine: '在下初来，还请多多关照。', next: 'reserved_reply', effects: { affinity: 0, flags: { reserved: true }, note: '山门处谨慎行礼' } },
            ],
          },
          warm_reply: {
            speaker: '苏小棠',
            text: '「名字还行。」她跳下台阶，「跟紧我，别被台阶甩掉。」',
            next: 'password_reminder',
          },
          playful_reply: {
            speaker: '苏小棠',
            text: '她眨眨眼：「苏小棠。记住啦？以后迷路可以喊我……不过我偶尔也迷路。」',
            next: 'password_reminder',
          },
          reserved_reply: {
            speaker: '苏小棠',
            text: '「不用这么客气，叫我小棠就行。」她摆摆手。',
            next: 'password_reminder',
          },
          password_reminder: {
            speaker: '苏小棠',
            text: '「对了，今天山门口令是『残月』。可别被守山弟子拦在自己家门外。」',
            end: true,
          },
        },
      },
    },

    '问剑峰·剑阶·下段': {
      desc: '苏小棠走在你前面，嘴上催得急，却会回头等你。',
      gossip: [
        '苏小棠说，剑阶早晨最滑，赶晨练的人宁愿迟到，也不愿在这里摔个四脚朝天。',
      ],
      dialogueGraph: {
        id: 'wjf_suxiaotang_stairs_lower',
        start: 'hurry',
        nodes: {
          hurry: {
            speaker: '苏小棠',
            text: '「快点快点~ 再慢一点，老蔡的午饭就要被周碛吃光了。」',
            choices: [
              { id: 'keep_up', label: '跟上她', playerLine: '我这就跟上。', next: 'keep_up_reply', effects: { affinity: 1, flags: { kept_pace: true }, note: '剑阶下段跟上小棠' } },
              { id: 'tease', label: '故意放慢', playerLine: '原来师姐惦记的是午饭。', next: 'tease_reply', effects: { affinity: 1, flags: { teased_about_lunch: true }, note: '剑阶下段打趣小棠' } },
            ],
          },
          keep_up_reply: { speaker: '苏小棠', text: '「这才对嘛。」她笑了一下，脚下却放慢了半步。', end: true },
          tease_reply: { speaker: '苏小棠', text: '「民以食为天，练剑也得吃饱。」她说得理直气壮。', end: true },
        },
      },
    },

    '问剑峰·剑阶·中段': {
      desc: '苏小棠在斜松旁放慢脚步。',
      gossip: [
        '苏小棠说斜松根下的白芷不是药圃种的，谁都别去拔，免得阿青追着问三天。',
      ],
      dialogueGraph: {
        id: 'wjf_suxiaotang_stairs_mid',
        start: 'white_herb',
        nodes: {
          white_herb: {
            speaker: '苏小棠',
            text: '「这里别踩松根，会滑。还有——看见白白的东西，记得告诉我。」',
            choices: [
              { id: 'ask_about_herb', label: '问白芷', playerLine: '这白花是药材？', next: 'herb_reply', effects: { affinity: 1, flags: { noticed_baizhi: true }, note: '剑阶中段留意白芷' } },
              { id: 'promise_care', label: '答应小心', playerLine: '我会看着脚下。', next: 'care_reply', effects: { affinity: 1, flags: { careful_on_stairs: true }, note: '剑阶中段答应小心' } },
            ],
          },
          herb_reply: { speaker: '苏小棠', text: '「算是吧……反正别碰就对了。」她说完便先往前走，耳尖有一点红。', end: true },
          care_reply: { speaker: '苏小棠', text: '「嗯，这里的石阶可不认人。」她抬手指了指更高处。', end: true },
        },
      },
    },

    '问剑峰·剑阶·上段': {
      desc: '苏小棠的脚步更轻快了，剑坪就在不远处，她显然急着把引路差事交出去。',
      gossip: [
        '苏小棠说剑坪木桩上的旧剑不能乱拔。',
      ],
      dialogueGraph: {
        id: 'wjf_suxiaotang_stairs_upper',
        start: 'swordyard_ahead',
        nodes: {
          swordyard_ahead: {
            speaker: '苏小棠',
            text: '「快到了。你看，剑坪就在前面——我说过吧，跟着我准没错。」',
            choices: [
              { id: 'thank_guide', label: '谢她引路', playerLine: '多亏师姐带路。', next: 'thank_reply', effects: { affinity: 2, flags: { thanked_for_guidance: true }, note: '剑阶上段感谢小棠引路' } },
              { id: 'look_to_yard', label: '望向剑坪', playerLine: '前面练剑的人不少。', next: 'yard_reply', effects: { affinity: 0, flags: { watched_swordyard: true }, note: '剑阶上段留意剑坪' } },
            ],
          },
          thank_reply: { speaker: '苏小棠', text: '「哼，这话我记下了。以后请我吃点心就行。」', end: true },
          yard_reply: { speaker: '苏小棠', text: '「早上更多。你先别盯着看，走路。」她伸手在你眼前晃了晃。', end: true },
        },
      },
    },

    default: {
      desc: '问剑峰外门弟子，正陪你走完巡礼。她熟门熟路，偶尔会因为自己的笑话先笑出声。',
      gossip: [
        '苏小棠只说峰上近处的事：哪里石阶湿，谁的晨练最早，哪口锅今天煮得慢。',
      ],
      dialogueGraph: {
        id: 'wjf_suxiaotang_tour',
        start: 'tour_comment',
        nodes: {
          tour_comment: {
            speaker: '苏小棠',
            text: '「先把路认熟。问剑峰不大，可岔路一多，第一次来的人照样会绕晕。」',
            choices: [
              { id: 'listen', label: '认真记路', playerLine: '我记住了。', next: 'listen_reply', effects: { affinity: 1, flags: { listened_on_tour: true }, note: '巡礼中认真记路' } },
              { id: 'ask_more', label: '再问一句', playerLine: '前面还有多远？', next: 'ask_more_reply', effects: { affinity: 0, flags: { asked_about_route: true }, note: '巡礼中询问前路' } },
            ],
          },
          listen_reply: { speaker: '苏小棠', text: '「很好，省得以后我去捞你。」她扬了扬下巴，示意继续走。', end: true },
          ask_more_reply: { speaker: '苏小棠', text: '「不远不远——再走一会儿。」她每次都这样回答。', end: true },
        },
      },
    },
  },

  getCompanionNpc: function(game, roomId) {
    this.reconcileProgress(game);
    if (!game || !game.state || game.state.guideCompanion !== 'wenjianfeng_suxiaotang') return null;
    if (this.tourRoute.indexOf(roomId) < 0) return null;

    var profile = this.companionProfiles[roomId] || this.companionProfiles.default;
    return {
      id: 'wenjianfeng_suxiaotang',
      source: 'authored',
      name: '苏小棠',
      title: '苏小棠',
      desc: profile.desc,
      requiresCompanion: 'wenjianfeng_suxiaotang',
      gossip: profile.gossip,
      dialogueGraph: profile.dialogueGraph,
    };
  },

  // Room expansion changed the early stair sequence from two stops to three.
  // Old saves can therefore carry a step number that no longer describes their
  // current room. Keep the authored route as the single source of truth.
  reconcileProgress: function(game) {
    if (!game || !game.state || game.state.tutorialPhase !== 'ch1_tour') return false;

    var location = game.state.location;
    var step = Number(game.state.tutorialStep);
    if (this.tourRoute[step] === location) return false;

    var candidates = [];
    for (var i = 0; i < this.tourRoute.length; i += 1) {
      if (this.tourRoute[i] === location) candidates.push(i);
    }
    if (candidates.length === 0) return false;

    // Several later tour stops revisit the same room. Preserve the closest
    // authored progress rather than blindly using the first occurrence.
    var corrected = candidates.reduce(function(best, candidate) {
      return Math.abs(candidate - step) < Math.abs(best - step) ? candidate : best;
    }, candidates[0]);

    game.state.tutorialStep = corrected;
    game.state.tutorialNextRoom = this.tourRoute[corrected + 1] || null;
    var nextRoom = game.state.tutorialNextRoom;
    var direction = nextRoom ? this.getRouteDirection(game, location, nextRoom) : null;
    game.state.tutorialAvailableMoves = direction ? [direction] : [];
    if (typeof game.markDirty === 'function') game.markDirty();
    console.warn('[Tutorial route migration] Corrected ch1 step', { location: location, from: step, to: corrected });
    return true;
  },

  // 从房间真实连接中取下一站方位；教程不再固化旧的“上/下/后”地面指令。
  getRouteDirection: function(game, fromRoom, targetRoom) {
    var locations = game && game.LOCATIONS;
    var room = locations && locations[fromRoom];
    var connections = room && room.connections;
    if (!connections) return null;
    var directions = ['北', '东', '南', '西', '东北', '东南', '西北', '西南', '内'];
    for (var i = 0; i < directions.length; i += 1) {
      if (connections[directions[i]] === targetRoom) return directions[i];
    }
    return null;
  },

  shortRoomName: function(roomId) {
    return String(roomId || '').replace(/^问剑峰·/, '');
  },

  // ============ 主入口：由 game.js 的 startFactionTutorial 调用 ============
  start: function(game) {
    game.state.tutorialPhase = 'ch1_tour';
    game.state.tutorialStep = 0;
    game.state.guideCompanion = 'wenjianfeng_suxiaotang';
    this.enterScene(game, 0);
  },

  // 旁白进入最近日志；NPC 主动发话只进入可逐句阅读的言路短笺。
  presentSceneDialog: function(game, dialog) {
    if (!Array.isArray(dialog) || dialog.length === 0) return;
    var callouts = [];
    dialog.forEach(function(d) {
      if (d.speaker === 'narrator') game.addLog(d.text, 'scene');
      else callouts.push({ speaker: d.speaker, text: d.text });
    });
    if (callouts.length > 0 && typeof game.showDialogueRibbon === 'function') {
      game.showDialogueRibbon({ lines: callouts });
    }
  },

  // ============ 进入巡礼的第n步 ============
  enterScene: function(game, step) {
    var room = this.tourRoute[step];
    var scene = this.scenes[room];
    if (!scene) return;
    var variant = scene.variants && scene.variants[step] ? scene.variants[step] : null;
    var hasVariantDialog = variant && Object.prototype.hasOwnProperty.call(variant, 'npcDialog');
    var hasVariantHint = variant && Object.prototype.hasOwnProperty.call(variant, 'moveHint');
    var dialog = hasVariantDialog ? variant.npcDialog : scene.npcDialog;
    var moveHint = hasVariantHint ? variant.moveHint : scene.moveHint;
    var nextRoom = this.tourRoute[step + 1] || null;
    var direction = nextRoom ? this.getRouteDirection(game, room, nextRoom) : null;

    game.state.location = room;
    game.state.tutorialStep = step;
    game.state.tutorialNextRoom = nextRoom;
    game.state.tutorialAvailableMoves = direction ? [direction] : [];
    if (scene.onEnter) scene.onEnter(game);
    if (dialog) this.presentSceneDialog(game, dialog);
    if (moveHint) {
      var routeHint = nextRoom
        ? (direction
          ? (direction === '内'
            ? ` 进入${this.shortRoomName(nextRoom)}。`
            : ` 往${direction}走，去${this.shortRoomName(nextRoom)}。`)
          : ` 前往${this.shortRoomName(nextRoom)}。`)
        : '';
      game.addLog(`💡 ` + moveHint + routeHint, 'system');
    }
    // 检查是否巡礼结束
    if (scene.onTourComplete) {
      game.state.tutorialPhase = 'ch1_free';
      game.state.guideCompanion = null;
      game.addLog(`💡 自由活动：你可以去剑坪、伙房、洗剑池等地方逛逛。到了饭点去伙房吃晚饭。`, 'system');
    }
    if (typeof game.markDirty === 'function') game.markDirty();
    game.renderer.updateUI();
  },

  // ============ 玩家移动时由 game.js 调用 ============
  // 参数: game, target(目标房间名)
  // 返回: true=允许移动, false=阻止移动
  onMove: function(game, target) {
    this.reconcileProgress(game);
    var step = game.state.tutorialStep || 0;
    var phase = game.state.tutorialPhase;

    // === 巡礼阶段 ===
    if (phase === 'ch1_tour') {
      var nextRoom = this.tourRoute[step + 1];
      if (target === nextRoom) {
        // 正确移动，进入下一步
        this.enterScene(game, step + 1);
        return true;
      }
      // 路线包含多次回到剑坪、竹林等节点；只有“下一站”能准确表达当前进度。
      // 放行旧节点会让重复房间被 indexOf 错配，造成教程状态与玩家位置脱节。
      var nextName = nextRoom ? this.shortRoomName(nextRoom) : '弟子房';
      var guideLine = `「这边这边！下一站是${nextName}。」`;
      if (typeof game.showDialogueRibbon === 'function') {
        game.showDialogueRibbon({ speaker: '苏小棠', text: guideLine });
      }
      return false;
    }

    // === 自由活动阶段 ===
    if (phase === 'ch1_free') {
      // 检查是否进入伙房（触发晚饭）
      if (target === this.dinnerEvent.trigger) {
        // 显示自由活动对话（如果有）
        var freeDialogs = this.freeTimeDialogs[target];
        // 触发晚饭事件
        this.presentSceneDialog(game, this.dinnerEvent.dialog);
        this.dinnerEvent.afterDinner(game);
        return true;
      }
      // 其他区域：显示自由活动对话
      var dialogs = this.freeTimeDialogs[target];
      if (dialogs) {
        this.presentSceneDialog(game, dialogs);
      }
      return true; // 自由活动允许任何移动
    }

    // === 晚饭后/已完成 ===
    if (phase === 'ch1_done') {
      // 第一章已完成，允许自由移动
      return true;
    }

    return false; // 未知阶段，不处理
  },

  // ============ 玩家进入房间后调用（自由活动阶段）============
  // 由 game.js explore() 在移动完成后调用
  onEnterRoom: function(game, room) {
    if (game.state.tutorialPhase !== 'ch1_free') return;
    // 显示自由活动对话
    var dialogs = this.freeTimeDialogs[room];
    if (dialogs) {
      this.presentSceneDialog(game, dialogs);
    }
  },

  // 第一章人物台本只在本文件维护。通用 NPC 文件保留结构、条件和
  // 分支契约；加载本脚本时，把已清洗的文案同步到它们的运行时对象。
  // index.html 保证 rebuild_rooms / npc_dialogues 先于本文件加载。
  syncAuthoredNpcText: function() {
    if (typeof WENJIANFENG_NPC_DIALOGUES !== 'undefined' && WENJIANFENG_NPC_DIALOGUES) {
      var entries = WENJIANFENG_NPC_DIALOGUES.entries || WENJIANFENG_NPC_DIALOGUES;
      if (!Array.isArray(entries)) return;
      Object.keys(this.freeTimeDialogs).forEach(function(roomId) {
        var bySpeaker = {};
        (WENJIANFENG_TUTORIAL_CH1.freeTimeDialogs[roomId] || []).forEach(function(line) {
          if (!line || line.speaker === 'narrator' || !String(line.text || '').trim()) return;
          if (!bySpeaker[line.speaker]) bySpeaker[line.speaker] = [];
          bySpeaker[line.speaker].push({ speaker: line.speaker, text: String(line.text).trim() });
        });
        entries.forEach(function(entry) {
          if (!entry || entry.room !== roomId) return;
          var oldLines = entry.dialogueLines || entry.lines || entry.script || [];
          var speaker = entry.npcName || entry.name || (entry.ensure && entry.ensure.name)
            || (oldLines[0] && oldLines[0].speaker);
          var authored = bySpeaker[speaker];
          if (!authored || authored.length === 0) return;
          if (Object.prototype.hasOwnProperty.call(entry, 'dialogueLines')) entry.dialogueLines = authored;
          else if (Object.prototype.hasOwnProperty.call(entry, 'script')) entry.script = authored;
          else entry.lines = authored;
        });
      });
    }
  },

};

WENJIANFENG_TUTORIAL_CH1.syncAuthoredNpcText();

window.WENJIANFENG_TUTORIAL_CH1 = WENJIANFENG_TUTORIAL_CH1;
if (typeof module !== 'undefined') module.exports = WENJIANFENG_TUTORIAL_CH1;

// === DATA MANIFEST REGISTRY (auto-generated, do not edit) ===
window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof WENJIANFENG_TUTORIAL_CH1 !== 'undefined') window.__DATA_REGISTRY['WENJIANFENG_TUTORIAL_CH1'] = WENJIANFENG_TUTORIAL_CH1; } catch(e) { console.warn('[Registry] WENJIANFENG_TUTORIAL_CH1 not registered:', e.message); }
