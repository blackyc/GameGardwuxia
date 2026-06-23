// ============================================================
// v1 NPC 遭遇数据注入补丁（鼓楼西鬼市 + 鸡鸣寺区域）
// 从 ghost_npc_encounters.js 精选还原，聊斋志怪风格轻度改写
// 不修改原数据文件，运行时合并到 NPC_ENCOUNTERS
// 加载顺序：在 integration_v2.js 之后加载本文件
// ============================================================

(function() {
  // v1→v2 结果格式转换器
  function _convertResult(r) {
    var result = {
      choice: r.choice || '交谈',
      log: r.log || r.successLog || '',
      effect: null,
      reward: null
    };
    if (r.effect) result.effect = r.effect;
    if (r.successReward) result.reward = r.successReward;
    else if (r.reward) result.reward = r.reward;
    if (r.successLog && !result.log) result.log = r.successLog;
    return result;
  }

  function _convertBlock(block) {
    var enc = {
      id: block.id || ('v1_npc_' + Math.random().toString(36).substr(2, 6)),
      name: block.title,
      title: block.title,
      desc: block.desc,
      desc_awakened: block.desc,
      trigger: '交谈',
      results: (block.results || []).map(_convertResult)
    };
    if (block.questStart) enc.questStart = block.questStart;
    return enc;
  }

  function _inject(roomName, blocks) {
    if (typeof LOCATIONS === 'undefined' || !LOCATIONS[roomName]) return 0;
    if (typeof NPC_ENCOUNTERS === 'undefined') return 0;
    if (!NPC_ENCOUNTERS[roomName]) NPC_ENCOUNTERS[roomName] = [];
    var existing = NPC_ENCOUNTERS[roomName];
    var existingNames = {};
    for (var i = 0; i < existing.length; i++) {
      existingNames[existing[i].name || existing[i].title] = true;
    }
    var injected = 0;
    for (var j = 0; j < blocks.length; j++) {
      var enc = _convertBlock(blocks[j]);
      if (!existingNames[enc.name]) {
        existing.push(enc);
        existingNames[enc.name] = true;
        injected++;
      }
    }
    return injected;
  }

  // ====== 鼓楼西鬼市区域 NPC ======
  var _ghostMarketNPCs = [
    {
      type: 'npc_talk', title: '鬼市卦师', id: 'ghost_market_diviner',
      desc: '牌坊阴影里蹲着个戴墨镜的男子——天上没有太阳，更没有月亮。他朝你勾勾手指：「嘿，你。想知道点什么？祂的网最新动静？哪个宗门见不得人的事？还是——」他摘下墨镜，左眼眶里不是眼睛，是一团缓慢旋转的黑雾，「——某个人在哪儿？」',
      results: [
        { choice: '请他算一卦（10灵石）', effect: 'spend_gold:10',
          log: '他咧嘴一笑，露出几颗金属牙——齿缝间嵌着极细的符文。他掐指一算，声音忽然变得很远：「最近织狱在招人，开价不错。血禅寺在追查一批被劫的货，悬赏很高。至于鬼市——」他压低了声音：「大相国寺下面有个沉寂关窍，去那儿能躲开祂的网查察。但进去需要门路——门路就是你的左眼。」他指了指自己的空眼眶，又指了指你的眼睛。' },
        { choice: '转身离开', effect: null,
          log: '「没兴趣？没关系。反正你迟早会来找我的。」他在你背后说道。你走了七八步再回头——牌坊下空无一人。但地上多了一副墨镜，镜片朝上的那一面映出的不是天空，是一片极深的黑色水面。' }
      ],
      questTrigger: null
    },
    {
      type: 'npc_talk', title: '法器身商贩', id: 'ghost_market_body_merchant',
      desc: '满脸横肉的男人在摊位前摆弄一排法器部件——手指关节、眼球、一整条前臂，上面爬满精细纹路。那些纹路在光线暗处会自己挪动。「客官看看货？都是鬼市回收站里淘来的好成色，价钱公道——」他压低了声音，「——但这只眼睛，我劝你别碰。它还在看东西。」',
      results: [
        { choice: '看看有什么好东西', effect: null,
          log: '他向你展示了一件件法器身：幽冥加速指节、夜视虹膜、强化腕关节……但每件都带着微妙的血迹或焦痕。「二手嘛，就是这个样子。生命有保障？——这个嘛…大概七成吧。」他拿起那只眼球——眼球追着你的脸转了半圈，他赶紧用布盖住。' },
        { choice: '打听鬼市的消息', effect: null,
          log: '他压低声音：「听说最近祂的网在扫荡鬼市关窍。你要是有什么见不得人的货，最好赶紧出手——或者藏深点。对了，城北有个叫『老鬼』的家伙在收二手灵息碎片，价格不错。不过老鬼自己也是碎片拼起来的——这话你别往外说。」' }
      ],
      questTrigger: null
    },
    {
      type: 'find_item', title: '地摊淘宝', id: 'ghost_market_stall',
      desc: '杂货摊上堆满稀奇物件：旧书、破损灵石、生锈法器、叫不出名字的兽骨。摊主在打瞌睡——但每次有人拿起东西看，他的鼾声就停一瞬。有一根骨头，你拿起来的时候它弯了一下。活的。',
      results: [
        { choice: '仔细翻找', effect: null,
          log: '你在一堆杂物里翻到了一样有意思的东西——一只小铜瓶，瓶口封着蜡。蜡上压着一个指印，指纹的纹路是螺旋形的，不是人的指纹。你把铜瓶翻过来，瓶底刻着一行字：「打开后不可收回。」摊主的鼾声在这一瞬停了——你抬头看他，他闭着眼，但嘴角微微上翘。',
          reward: 'random_item' },
        { choice: '放下东西赶紧走', effect: null,
          log: '你把骨头放回原处——骨头在摊面上滚了半圈，自己停回了原来的位置。摊主的鼾声恢复了。你转身走的时候，身后传来一声极轻的笑——不是摊主笑的，是那根骨头。' }
      ],
      questTrigger: null
    },
    {
      type: 'npc_talk', title: '烧香妇人', id: 'ghost_market_incense_mother',
      desc: '一个披着灰头巾的妇人蹲在坊柱下烧香。她烧的香是倒着插的——香头朝下，香脚朝天。问她为什么，她说「烧给人看的香才要正着插。」她的头巾下露出一缕白发——白发梢头是黑色的，像被什么东西从发根处染了回来。',
      results: [
        { choice: '问她烧香给谁', effect: null,
          log: '妇人没抬头：「给我儿子。他在鬼市里走丢了——二十年前走丢的。我每年今日来烧一炷香，香灰落完之前他能回来就回来，回不来——」她顿了一下，「回不来就再等一年。」你看了一眼香——香灰堆了极高却不掉，像被什么东西托住了。香灰的形状隐约是一个人影，面朝牌坊外站着。' },
        { choice: '帮她一起烧一炷', effect: 'spend_gold:5',
          log: '你从妇人手里接过一炷香，也倒着插了。香火的烟不往上飘——往下沉，沉到地面后沿着石缝往牌坊里流。妇人终于抬头看了你一眼——她的眼睛是全白的，没有瞳孔。但她的嘴角在笑：「好人。我儿子——他刚才说了，让你也小心。他说牌坊里面有人叫你的名字，但不是他在叫。」',
          reward: 'daoxin:8' }
      ],
      questTrigger: null
    },
    {
      type: 'npc_talk', title: '迷路的孩童', id: 'ghost_market_lost_child',
      desc: '芦苇荡边缘站着个小男孩，眼泪汪汪地看着四周：「我找不到家了……我家在……」他想了想，「……在一个庙旁边。」他拽住你的衣角。手很凉——不是天冷的那种凉，是东西搁久了的那种凉。牌坊下的灯火在他身后一盏一盏地灭。',
      results: [
        { choice: '带他去找家人', effect: null,
          log: '你牵着他在芦苇荡间转了几圈，最后在一扇你从没见过的门前停下——门是芦苇编的，挂在半空中，门后是黑的。他不哭了。门开了，一个女人站在门里，脸上没有表情。她朝你点了点头，塞给你几块灵石。门关上的时候，你没听见脚步声——他们俩都没有。芦苇荡的灯火重新亮了，但多了一盏。',
          reward: 'gain_gold:15' },
        { choice: '告诉他你也是外地人', effect: null,
          log: '男孩泪汪汪地望着你，慢慢松开衣角。你刚转身，听见背后有人喊「小宝！又乱跑！」回头——妇人抱着孩子走远了。但你刚才分明没有看到那妇人出现。牌坊下的灯火在她走过时全部灭了——又一盏一盏地亮回来。但有一盏不亮了。那盏灯的位置，正是男孩刚才站着的地方。' }
      ],
      questTrigger: null
    }
  ];

  // 鬼道·迷雾径 NPC
  var _ghostPathNPCs = [
    {
      type: 'npc_talk', title: '雾中行者', id: 'fog_walker',
      desc: '浓雾中有个身影和你并肩走着——你停，他停；你走，他走。你转头看他时，他也在转头看你。但他的转法是反的——先动肩膀，再动头，像镜子里的倒影。他开口说话了，声音像从很远的地方传来：「你也迷路了？没关系——迷路是这里的规矩。直走的人到不了目的地。」',
      results: [
        { choice: '问他怎么走出去', effect: null,
          log: '他没回答——只是抬手指了指前方。雾里隐约有一条路，但你刚才明明走过那里，那里是死路。他笑了笑——笑的时候嘴角先动，笑容再慢慢爬到眼睛里，像表情在液体里扩散。「你走过的路在这里不算数。雾把路吃掉了——你每走一步，身后的路就少一条。所以不要回头。回头的人会发现自己站在原地，但已经不是原来的那个自己了。」你低头看自己的脚印——只有一对，是你刚踩下的。身后的雾里什么都没有。' },
        { choice: '伸手碰一下他', effect: 'check_agility',
          successLog: '你的手指穿过他的肩膀——不是穿透，是他的肩膀在你的手指碰到时变成了雾。但雾是温的，有体温。你的手指在雾里摸到了一样东西——一根极细的丝线，连着他的肩膀和你的指尖。丝线在你摸到它的同一瞬间收紧了，像被拉直的琴弦。然后断了。断的时候你的指尖多了一个极小的针眼——不流血，但能看到针眼里透出微弱的白光。他看了你一眼——这一眼不是从旁边看的，是从你的手指里面看的。',
          failLog: '你的手刚伸出去——他已经不在了。但你的手掌上多了一层薄雾，贴着皮肤不散。雾的温度和体温一样。你想擦掉它，但越擦越厚——最后雾渗进了皮肤里。你的掌心在接下来三天里都能看见雾，只有你自己能看见。',
          successReward: 'sanity:-6|gain_cultivation:12' }
      ],
      questTrigger: null
    },
    {
      type: 'find_item', title: '雾中纸钱', id: 'fog_paper_money',
      desc: '脚边忽然多了一张纸钱——不是飘来的，是你停下脚步时它就出现在那儿了。纸面上画着一个你认识的符号，但你想不起是在哪里见过的。纸钱的边缘烧了一半，烧断处和未烧处的边界极齐——像火焰在烧到一半时忽然停住了。',
      results: [
        { choice: '捡起来仔细看', effect: null,
          log: '你捡起纸钱——纸面上的符号在你注视下缓缓变形了。不是变了形状，是它的笔画在重新排列。排完之后你认出来了——是你的名字。但不是你现在用的名字，是一个你小时候用过的、已经忘了的小名。纸钱在你手心里慢慢变暖，烧焦的边缘开始重新燃烧——不是从外往里烧，是从里往外烧。火烧到中央时纸钱消失了，你的手心里多了一道浅浅的灰色印痕——是那个小名的最后一个字。',
          reward: 'sanity:-4|gain_cultivation:8' },
        { choice: '不去碰它', effect: null,
          log: '你绕过纸钱继续走——但每走三步，脚边就多一张。你走了一炷香，纸钱已经铺了一路。你回头看——所有的纸钱都正面朝上，纸面上的符号全都一样。你终于想起来了——那个符号你在梦里见过。每次梦见它，第二天早上枕头底下都会多一张纸钱。' }
      ],
      questTrigger: null
    }
  ];

  // ====== 鸡鸣寺区域 NPC ======
  // 鸡鸣寺（父房间）
  var _jimingTempleNPCs = [
    {
      type: 'npc_talk', title: '扫地僧', id: 'jiming_sweeping_monk',
      desc: '大雄宝殿后院的石阶上，一个老僧拿着竹扫帚扫落叶——但院子里没有树。落叶是从院墙外飘进来的，每一片落叶在落地前都已经在空中转了三圈。老僧扫得很慢，每一扫帚只扫一片。他看了一眼飘进来的落叶，又看了你一眼：「施主也是追叶子的？」',
      results: [
        { choice: '问他落叶从哪来', effect: null,
          log: '老僧停了扫帚：「不知道。来了三十年了，每天扫，每天来。我问过方丈——方丈说叶子是从『以前』飘来的。」他把刚扫起来的一簸箕叶子倒在你面前——叶子全是黄的，但叶脉是绿的。他用指甲掐了一下叶脉——叶脉里渗出了一滴极清的水。「这不是树上的叶子。这是记忆里的叶子——谁的记忆，我不知道。但叶子记得自己从哪棵树上掉下来的。你看——」他把一片叶子翻过来，叶背上有密密麻麻的虫蛀小洞，洞的排列组成了一个字：归。「虫子也识字。虫子比人先知道该回哪儿去。」',
          reward: 'sanity:-3|gain_cultivation:10' },
        { choice: '帮他一起扫', effect: null,
          log: '你接过扫帚扫了一片——叶子在扫帚碰到它时忽然变重了，像扫的不是一片叶子，是一段很长的光阴。你手一抖，叶子从扫帚上滚下来，落在地上时变成了两片——原来的一片和你的那片重叠在一起。老僧看了你一眼：「你的叶子也掉下来了。别捡——让它自己飘回去。」',
          reward: 'gain_cultivation:8' }
      ],
      questTrigger: null
    },
    {
      type: 'npc_talk', title: '进香客', id: 'jiming_pilgrim',
      desc: '一个穿青布袍的中年人跪在蒲团上，三炷香举过头顶。香灰落了他一脸——他不动。他的膝盖骨在蒲团上硌出了一声脆响，但你仔细听——不是骨头响，是蒲团里有什么东西碎了。他磕了第三个头后站起来，面朝你：「你也是来求什么的？求什么都行——就是别求心安。这庙里不求心安。」',
      results: [
        { choice: '问他为什么不能求心安', effect: null,
          log: '他苦笑了一下：「我三年前来求心安——方丈说好，给我上了一炷香。香烧完之后我什么都记不起来了——不是忘了什么事，是忘了『心安』是什么感觉。三年了，我知道自己活着，知道吃知道喝，但不知道什么是安心。跟行尸走肉差不多。」他指了指蒲团：「蒲团里那东西——你听到了吧？那是上一求心安的人留下的。他把自己的心安塞进了蒲团里，说这样就不必带着走了。然后他就不会不安了——因为他不会任何感觉了。」' },
        { choice: '不理他，绕着走', effect: null,
          log: '你绕过他——他没追。但你走到殿门时回头看了一眼：他还跪在蒲团上，三炷香又点着了。刚才那三炷香分明已经烧完了。你揉了揉眼——他这次磕头的方式不一样了，磕下去后没有再起来。蒲团发出了一声脆响。' }
      ],
      questTrigger: null
    },
    {
      type: 'npc_talk', title: '论道', id: 'jiming_debate',
      desc: '藏经阁前的石台上，两个僧人正在辩经——一个胖一个瘦。胖的拍手说「万法归一」，瘦的摇头说「一亦非一」。你走近时他们同时停下来看你：「施主来评评理——万法归一，那一归何处？」你还没回答，瘦的补充了一句：「别说『归万法』——那是绕回去。我们要的是出去。」',
      results: [
        { choice: '说「一归于无」', effect: null,
          log: '胖僧拍掌：「好！一归于无——无再归于何？」你刚要回答——瘦僧忽然指了指你身后。你回头——身后什么都没有。瘦僧说：「你刚才说『无』的时候，你身后确实出现了一个『无』——不是没有，是有一个叫『无』的东西站在那里。它听了你的话之后走了。」胖僧点头：「它走的时候把你身上一样东西带走了——你不会发现的。但你下次再说『无』的时候，它会回来。因为它认定你了。」',
          reward: 'sanity:-4|gain_cultivation:15' },
        { choice: '说「我不知道」', effect: null,
          log: '两个僧人对视一眼，同时笑了。胖僧说：「不知道是对的——知道的人不会来这里。」瘦僧说：「不知道就是『一』的出处。你不知道——所以一来自你的不知道。你哪天知道了——一就没了。一没了——万法也就没了。所以千万别知道。」他们说完美喝了一口茶——茶杯是空的。' }
      ],
      questTrigger: null
    }
  ];

  // 鸡鸣寺·钟楼 NPC
  var _jimingBellNPCs = [
    {
      type: 'npc_talk', title: '自响的木鱼', id: 'jiming_self_woodfish',
      desc: '深夜的鸡鸣寺钟楼里，木鱼忽然自己敲了起来——咚、咚、咚，节奏不像是僧人在敲，太慢了，慢到每个声之间停顿的时间够一个人深呼吸三次。一个值夜的沙弥缩在钟楼柱子后面，脸已经白了。铜钟在木鱼声响的时候微微振动——但没有人碰钟。',
      results: [
        { choice: '循着木鱼声找来源', effect: null,
          log: '木鱼声不是从钟楼正中的供台上发出的——是从地砖下面。你找到钟楼角落一块松动的砖，搬开后露出通往暗室的石阶。暗室里坐着一具被金刚索捆死的肉身——木鱼就在它面前，没人敲。你把耳朵贴到肉身胸口——不是听心跳，是骨传导——木鱼声是从它的胸腔里传出来的。每敲一下，它的肋骨就微微振动一次。你看了一眼木鱼旁边的砖面——砖面上有人用指尖蘸着灰画了一行字：「念到第三式就停。——停，就没事了。」但那行字的最末尾被人划掉了后半句。',
          reward: 'sanity:-10|gain_cultivation:25' },
        { choice: '跟着木鱼节奏打坐', effect: null,
          log: '你盘腿坐下，跟着木鱼的节奏调息——每一呼一吸之间恰好隔了三次木鱼声。坐了一炷香后你忽然发现——木鱼停了，但你的心跳变成了木鱼的节奏。你站起来时心跳恢复了正常，但你的耳朵里多了一个声音——极轻的、持续的、像很远的地方有人在敲木鱼。沙弥说你刚才打坐时脸上一直没有表情——不是平静，是空白。' }
      ],
      questTrigger: null
    }
  ];

  // 鸡鸣寺·大雄宝殿 NPC
  var _jimingHallNPCs = [
    {
      type: 'npc_talk', title: '唱经的盲僧', id: 'jiming_blind_chanting',
      desc: '大雄宝殿角落里一个盲僧在唱经——不是念，是唱。曲调极古，不像佛经，像某种更旧的东西。他唱的时候大殿梁上的铁马风铃不响了——不是风停了，是风铃在听。他唱完一段后朝你的方向转了转头——他的眼睛是全白的，但白里有极细的黑线在游动，像墨滴在水里扩散。「施主身上有旧债的气味——不是我闻到的，是我听到的。你的脚步声里有杂音。」',
      results: [
        { choice: '请他帮忙听听是什么杂音', effect: 'spend_gold:5',
          log: '他侧耳听了一会儿——白眼里的黑线忽然全部停止了游动，凝成了一个小小的圆点。「你的杂音——不是你的。是跟着你走的。它不是债主，是引路人。它用你的脚步声计算你走了多远——等你走到某个地方的时候，它就不跟了。它会在那里等你——不是它停下来，是你停下来了。」他顿了一下：「那个地方——我不知道在哪。但杂音知道。杂音一直在知道。」',
          reward: 'daoxin:10' },
        { choice: '摇头离开', effect: null,
          log: '你转身走——盲僧又开始了唱经。但这次你走出大殿后，风铃声没有恢复。你回头看了一眼——大殿里所有风铃都在微微振动，但没有声音。它们在跟着盲僧的经文振动——但经文的频率不在人耳的范围内。你站在殿门口听了一刻钟——什么也没听到，但你的脚底在发麻。' }
      ],
      questTrigger: null
    }
  ];

  // 执行注入
  var _report = [];
  _report.push(_inject('鬼市外·石牌坊', _ghostMarketNPCs));
  _report.push(_inject('鬼道·迷雾径', _ghostPathNPCs));
  _report.push(_inject('鸡鸣寺', _jimingTempleNPCs));
  _report.push(_inject('鸡鸣寺·钟楼', _jimingBellNPCs));
  _report.push(_inject('鸡鸣寺·大雄宝殿', _jimingHallNPCs));

  if (typeof console !== 'undefined' && console.log) {
    var total = _report.reduce(function(a, b) { return a + b; }, 0);
    console.log('[v1 NPC注入] 鼓楼西鬼市+鸡鸣寺区域: 注入 ' + total + ' 个NPC遭遇');
    console.log('  鬼市外·石牌坊: +' + _report[0]);
    console.log('  鬼道·迷雾径: +' + _report[1]);
    console.log('  鸡鸣寺: +' + _report[2]);
    console.log('  鸡鸣寺·钟楼: +' + _report[3]);
    console.log('  鸡鸣寺·大雄宝殿: +' + _report[4]);
  }
})();
