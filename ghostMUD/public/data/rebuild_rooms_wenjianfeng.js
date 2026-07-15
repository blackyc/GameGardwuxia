// ============================================================
// Ghost MUD v2.0 · 问剑峰门派HQ · 山门、生活区、后山水路与竹林迷宫
// 生成: 2026-06-28
// 风格: 金庸式武侠基底 + 聊斋志怪氛围 + 黄金三章期间轻松诙谐
// 叙事层: L1-L2（信息残缺 + 身份排斥），灵异元素退为背景
// ============================================================

const WENJIANFENG_ROOMS = {

  // ============ 主路径：山门 → 剑阶下段 → 剑阶中段 → 剑阶上段 → 剑坪 ============

  '问剑峰·山门': {
    name: '问剑峰·山门',
    desc: '一座青石牌坊立在山脚路口，门楣上刻着「问剑」二字，笔画被风雨磨去了棱角。牌坊下一条石阶蜿蜒向上，消失在雾里。石阶中间被踩得很光，两侧生了青苔。空气里有松脂和泥土的气味。旁边立着一块界碑，上书「问剑峰」三字，碑脚有人放了一束野花——已经蔫了。',
    desc_morning: '值星弟子在伸懒腰。山下的雾还没散。牌坊的影子拖得很长，盖住了前三级台阶。露水从石阶边沿滴下来，叮咚作响。',
    desc_noon: '值星弟子在擦汗。阳光正对着他。牌坊的影子缩成了脚下一团。石阶被晒得发烫，光脚走不了。远处山林里有蝉鸣。',
    desc_dusk: '换岗。交接的口令声从石阶下面传上来。两个弟子在牌坊下站了一会儿，交了令牌。一个往上走，一个往下走，谁都没多说话。山里的黄昏凉得快。',
    desc_night: '门关了。值星弟子坐在门后，手里握着剑。他没在玩——他在等什么。牌坊上的「问剑」二字在月光下看着比白天深。山风从石阶上灌下来，呜呜地响。',
    zoneKind: 'faction_hq',
    connections: { 北: '问剑峰·剑阶·下段' },
    routeSketch: {
      北: { id: 'wjf_shanmen_to_stairs_lower', label: '剑阶', kind: 'world', layout: { anchor: 'N', lane: 0 } },
    },
    danger: 0,
    npcs: [
      {
        id: 'wenjianfeng_zhixing',
        name: '值星弟子',
        canSpar: true,
        desc: '一个年轻弟子，剑横在身前，站得笔直。面皮有些嫩，大概十五六岁。',
        dialogue: '口令！……哦，是你。进去吧。今天的口令是「残月」——昨天是「满弓」，周师兄定的。'
      }
    ],
    items: []
  },

  '问剑峰·剑阶·下段': {
    name: '问剑峰·剑阶·下段',
    displayName: '剑阶',
    zoneKind: 'faction_hq',
    desc: '山门后的青石阶刚刚抬起。前二十余级被来往弟子踩得最亮，边缘却还留着露水和薄苔。回头时，牌坊已矮了一截；抬头时，只能看见石阶钻进松影里。',
    desc_morning: '晨雾还压在山门一带，台阶下像浸在白水里。苏小棠踩着干燥的石沿往上跑，偶尔回头确认你没有落下。',
    desc_noon: '石阶被日头晒得发白，松影缩在脚边。每走十来级，山门上的人声便淡一点。',
    desc_dusk: '斜阳贴着石阶斜切下来，鞋底与石面的摩擦声被山风带得很远。山门的换岗口令只剩断续几句。',
    desc_night: '下方的牌坊灯已经像一粒豆火。松影横在阶上，走急了很容易把它看成伸出的树根。',
    connections: { 南: '问剑峰·山门', 北: '问剑峰·剑阶·中段' },
    routeSketch: {
      南: { id: 'wjf_stairs_lower_to_gate', label: '山门', kind: 'world', layout: { anchor: 'S', lane: -1 } },
      北: { id: 'wjf_stairs_lower_to_mid', label: '剑阶', kind: 'world', layout: { anchor: 'N', lane: 0 } },
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·剑阶·中段': {
    name: '问剑峰·剑阶·中段',
    displayName: '剑阶',
    zoneKind: 'faction_hq',
    desc: '石阶在这里绕过一株斜松。山门已被树梢遮住，剑坪也还藏在更高处的雾后。风把碎松针吹到台阶缝里，石缝旁有一小片被人踩歪的白芷。',
    desc_morning: '松针上的露珠一串串落下来，打在石阶上。山风还轻，远处偶尔传来剑坪木剑碰撞的闷响。',
    desc_noon: '这里没有遮阳的长廊，只有一株老松投下一块不大的阴影。石阶上残留着早些时候的湿脚印。',
    desc_dusk: '松影拖过台阶中央，像一道被风吹散的墨痕。往上望去，雾色后的石坪轮廓终于隐约可见。',
    desc_night: '石缝里的白芷在月色下颜色很浅。风吹过时，草叶拂在石面上，像极轻的脚步声。',
    connections: { 南: '问剑峰·剑阶·下段', 北: '问剑峰·剑阶·上段' },
    routeSketch: {
      南: { id: 'wjf_stairs_mid_to_lower', label: '剑阶', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_stairs_mid_to_upper', label: '剑阶', kind: 'world', layout: { anchor: 'N', lane: 0 } },
    },
    searchEvents: [
      {
        id: 'wjf_baizhi_wreath',
        once: true,
        chance: 0.35,
        pityAfter: 3,
        requiresCompanion: 'wenjianfeng_suxiaotang',
        hint: '斜松根下压着一圈刚被风吹落的白芷花，像是谁匆忙遗下的。',
        item: {
          id: 'wjf_baizhi_wreath',
          name: '白芷花环',
          type: 'special',
          boundNpc: 'wenjianfeng_suxiaotang',
          giftAffinity: 3,
          giftFlags: { returned_baizhi_wreath: true },
          giftNote: '将遗落的白芷花环还给小棠',
          giftLog: '苏小棠怔了一下，把花环接过去，小声说了句「我还以为找不回来了。」',
          desc: '用新鲜白芷编成的小花环，边缘压扁了一点，像是从谁的发间滑落的。',
        },
        foundText: '你在斜松根下找到了一个白芷花环。苏小棠看了一眼，忽然安静下来，说这东西她好像见过。',
      },
    ],
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·剑阶·上段': {
    name: '问剑峰·剑阶·上段',
    displayName: '剑阶',
    zoneKind: 'faction_hq',
    desc: '再往上三十余级，石阶渐缓，剑坪的青石边沿终于露了出来。练剑的金属声清楚了，风里也多了汗水与旧木桩的味道。',
    desc_morning: '晨雾在脚下散开，剑坪上有人影静立。苏小棠不再倒着走，只顾催你跟上。',
    desc_noon: '最后一段石阶晒得发烫。剑坪方向没有多少人声，只有木剑落在木桩上的闷响。',
    desc_dusk: '远处已经能看清收剑的人影。石阶尽头的风带着炊烟味，伙房多半正在备饭。',
    desc_night: '剑坪边沿只剩一层冷白的月光。台阶上方偶尔传来金属轻响，不知是谁还未收剑。',
    connections: { 南: '问剑峰·剑阶·中段', 北: '问剑峰·剑坪' },
    routeSketch: {
      南: { id: 'wjf_stairs_upper_to_mid', label: '剑阶', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_stairs_upper_to_swordyard', label: '剑坪', kind: 'world', layout: { anchor: 'N', lane: 0 } },
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·剑坪': {
    name: '问剑峰·剑坪',
    desc: '一片开阔的石台，是问剑峰的心口。地面是青石板铺的，被踩得很光。正中立着一个木桩，上面插着一把卷了刃的旧剑——那是练剑的靶子。东面通往伙房外院，西面是藏剑阁前庭；北面石径绕入后山，东南的院门后才是弟子住处。边上有几排石凳，一把扫帚靠在石凳旁。空气里有汗水、铁锈和远处炊烟的味道。',
    desc_morning: '薄雾未散，石板上凝着露水。残剑师姐已在——她总是第一个。她站在剑坪中央，剑未出鞘，姿势一动不动，像一尊石雕。晨光从东边斜过来，把她的影子拉得很长。',
    desc_noon: '空荡荡。太热。柳师叔在廊下下棋（一人两边）。木桩上的旧剑被晒得发烫。石板上的水渍干了又湿——是汗水。没人在这个时辰练剑。远处伙房飘来饭菜香。',
    desc_dusk: '弟子们收剑。远远传来山门交接口令。剑坪上的人三三两两散去，有的往伙房走，有的往弟子房。残剑师姐还站着。木桩上的旧剑被砍出了一道新痕。',
    desc_night: '一个人影——残剑师姐还在。手按剑柄，面朝剑冢方向。月光照着剑坪，石板泛着冷光。风从上面吹下来，她衣袂微动，但人不动。你不确定她有没有在呼吸。',
    zoneKind: 'faction_hq',
    connections: { '南': '问剑峰·剑阶·上段', '东': '问剑峰·伙房外院', '西': '问剑峰·藏剑阁前庭', '北': '问剑峰·后山石径', '东南': '问剑峰·弟子院' },
    routeSketch: {
      南: { id: 'wjf_swordyard_to_stairs', label: '剑阶', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      东: { id: 'wjf_swordyard_to_kitchen_court', label: '伙房外院', kind: 'world', layout: { anchor: 'E', lane: 0 } },
      西: { id: 'wjf_swordyard_to_archive_court', label: '藏剑阁前庭', kind: 'world', layout: { anchor: 'W', lane: 0 } },
      北: { id: 'wjf_swordyard_to_back_path', label: '后山石径', kind: 'world', layout: { anchor: 'N', lane: 0 } },
      东南: { id: 'wjf_swordyard_to_dorm_court', label: '弟子院', kind: 'world', layout: { anchor: 'SE', lane: 0 } }
    },
    danger: 0,
    npcs: [
      {
        id: 'wenjianfeng_canjian',
        name: '残剑师姐',
        desc: '一个身形修长的女子，剑未出鞘，斜挂腰间。面容冷淡，眉目如刀刻。她站在剑坪中央，一动不动。',
        dialogue: '……（她微微点了一下头，没有说话。也许她不说话。也许她只是不跟你说话。）'
      },
      {
        id: 'wenjianfeng_liushishu',
        name: '柳师叔',
        desc: '一个须发半白的老者，坐在廊下石凳上，面前摆着一盘棋。黑白子都由他一个人下。',
        dialogue: '你走那边——对，将死了。多谢。'
      }
    ],
    items: [
      { id: 'practice_sword', name: '旧木剑', desc: '一把卷了刃的木柄旧剑，插在木桩上。握把处磨得发亮。', desc_awakened: '一把卷了刃的木柄旧剑，插在木桩上。握把处磨得发亮。剑身上有一道新痕，是今天砍出来的。' }
    ]
  },

  // ============ 生活区与后山过渡带 ============

  '问剑峰·伙房外院': {
    name: '问剑峰·伙房外院',
    displayName: '伙房外院',
    zoneKind: 'faction_hq',
    desc: '剑坪东侧的矮院。两口水缸挨着墙根，柴棚下码着新劈的松木，几只木桶倒扣在石板上。饭点之前，这里比伙房里更忙：搬米、淘菜、担水的人都要从院里经过。',
    desc_morning: '院里刚洒过水，柴棚下飘出潮木气。有人在缸边淘米，木桶撞在石板上，响得很脆。',
    desc_dusk: '铁牛抱着空米袋从屋里出来，见你站着，只朝伙房门口扬了扬下巴。里面正敲锅催饭。',
    connections: { 西: '问剑峰·剑坪', 东: '问剑峰·伙房' },
    routeSketch: {
      西: { id: 'wjf_kitchen_court_to_swordyard', label: '剑坪', kind: 'world', layout: { anchor: 'W', lane: 0 } },
      东: { id: 'wjf_kitchen_court_to_kitchen', label: '伙房', kind: 'world', layout: { anchor: 'E', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·藏剑阁前庭': {
    name: '问剑峰·藏剑阁前庭',
    displayName: '藏剑阁前庭',
    zoneKind: 'faction_hq',
    desc: '剑坪西侧一段背风的石廊，尽头才是藏剑阁。廊檐下挂着两只旧铜铃，风大时也只轻响一声。墙根摆着晒书用的竹匾，落了几片黄叶。',
    desc_morning: '晨光沿廊柱一格一格挪进来，铜铃没有响。阁门还虚掩着，像在等人，也像不欢迎人。',
    desc_night: '廊下比剑坪暗得多。藏剑阁的窗纸透出一点光，铜铃却静得异常。',
    connections: { 东: '问剑峰·剑坪', 西: '问剑峰·藏剑阁' },
    routeSketch: {
      东: { id: 'wjf_archive_court_to_swordyard', label: '剑坪', kind: 'world', layout: { anchor: 'E', lane: 0 } },
      西: { id: 'wjf_archive_court_to_archive', label: '藏剑阁', kind: 'world', layout: { anchor: 'W', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·弟子院': {
    name: '问剑峰·弟子院',
    displayName: '弟子院',
    zoneKind: 'faction_hq',
    desc: '几排弟子房围出的小院。晾衣绳从东墙拉到西墙，角落里堆着练坏的木剑和几只空水桶。院门朝西北开，穿过去才回到剑坪。',
    desc_morning: '晨练前的院子乱而有序：有人绑护腕，有人抱着木剑往外跑，还有人蹲在井边胡乱洗脸。',
    desc_dusk: '晚风穿过晾衣绳，木屋里陆续亮灯。有人在院中争最后一桶热水，隔壁传来苏小棠跑调的哼歌。',
    connections: { 西北: '问剑峰·剑坪', 内: '问剑峰·弟子房' },
    routeSketch: {
      西北: { id: 'wjf_dorm_court_to_swordyard', label: '剑坪', kind: 'world', layout: { anchor: 'NW', lane: 0 } },
      内: { id: 'wjf_dorm_court_to_player_room', label: '你的房间', kind: 'interior', layout: { anchor: 'BELOW', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·后山石径': {
    name: '问剑峰·后山石径',
    displayName: '后山石径',
    zoneKind: 'faction_hq',
    desc: '离开剑坪后，石径渐窄，贴着山腰向北绕去。一侧是被风磨白的崖壁，另一侧能望见更低处的屋檐。路边有挑水人踩出来的湿痕，说明洗剑池并不在“抬脚就到”的地方。',
    desc_morning: '晨雾还压在山腰，前面挑水的弟子只剩一个晃动的桶影。苏小棠若在，总会催你别磨蹭。',
    desc_dusk: '炊烟从山下斜飘上来，石径上的水痕被晚风吹得发白。',
    connections: { 南: '问剑峰·剑坪', 北: '问剑峰·引泉坡' },
    routeSketch: {
      南: { id: 'wjf_back_path_to_swordyard', label: '剑坪', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_back_path_to_spring_slope', label: '引泉坡', kind: 'world', layout: { anchor: 'N', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·引泉坡': {
    name: '问剑峰·引泉坡',
    displayName: '引泉坡',
    zoneKind: 'faction_hq',
    desc: '石径在这里向上折了一道。山壁渗出的细水被引进浅渠，沿路流向下方的水缸。青苔把石阶染得发暗，挑满水的人走得比空手时慢得多。',
    desc_morning: '渠水清得见底，几片竹叶顺着坡往下漂。有人在前头歇肩，扁担压出的印子还留在泥里。',
    desc_night: '月光照着细渠，水声盖过脚步。坡顶的洗剑池方向有一点冷白的反光。',
    connections: { 南: '问剑峰·后山石径', 北: '问剑峰·洗剑池' },
    routeSketch: {
      南: { id: 'wjf_spring_slope_to_back_path', label: '后山石径', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_spring_slope_to_washpool', label: '洗剑池', kind: 'world', layout: { anchor: 'N', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·涧边小径': {
    name: '问剑峰·涧边小径',
    displayName: '涧边小径',
    zoneKind: 'faction_hq',
    desc: '越过洗剑池，山径贴着一道浅涧往北。水声被竹叶遮得断断续续，石栏也到这里为止。再往前，门派日常的痕迹开始少下来。',
    desc_morning: '涧边雾气很重，脚下的石头湿滑。远处有竹叶相互摩擦，像谁在低声说话。',
    desc_dusk: '夕光只照到半条涧，另一半已沉进竹影里。回头还能看见洗剑池方向的灯。',
    connections: { 南: '问剑峰·洗剑池', 北: '问剑峰·竹林外缘' },
    routeSketch: {
      南: { id: 'wjf_stream_path_to_washpool', label: '洗剑池', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_stream_path_to_bamboo_edge', label: '竹林外缘', kind: 'world', layout: { anchor: 'N', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·竹林外缘': {
    name: '问剑峰·竹林外缘',
    displayName: '竹林外缘',
    zoneKind: 'faction_hq',
    desc: '竹林尚未合拢的边缘。脚下是被挑水、送药和运竹的人踩实的土路，往北才逐渐没入密竹；东边一道田埂通向药圃。这里还能看见天，风里却已带了竹子清苦的气味。',
    desc_morning: '露水把土路压得发黑，一串小兽脚印从竹根间钻出，又消失在田埂方向。',
    desc_night: '竹影从林内漫到路边，仿佛再往北一步，声音都会被吞掉。',
    connections: { 南: '问剑峰·涧边小径', 北: '问剑峰·竹林', 东: '问剑峰·药圃田埂' },
    routeSketch: {
      南: { id: 'wjf_bamboo_edge_to_stream_path', label: '涧边小径', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_bamboo_edge_to_bamboo', label: '竹林', kind: 'world', layout: { anchor: 'N', lane: 0 } },
      东: { id: 'wjf_bamboo_edge_to_herb_ridge', label: '药圃田埂', kind: 'world', layout: { anchor: 'E', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·药圃田埂': {
    name: '问剑峰·药圃田埂',
    displayName: '药圃田埂',
    zoneKind: 'faction_hq',
    desc: '一条被鞋底磨窄的田埂，把竹林外缘和药圃分开。两边药草高低不齐，沟里积着薄水。这里走快了容易踩坏幼苗，因此每个人经过都会下意识放轻脚步。',
    desc_morning: '露水沾满裤脚，田埂边插着阿青新换的木牌，字还是歪歪扭扭。',
    desc_dusk: '药香在低处积着，远处竹林一暗，这条田埂就像一根细线。',
    connections: { 西: '问剑峰·竹林外缘', 东: '问剑峰·药圃' },
    routeSketch: {
      西: { id: 'wjf_herb_ridge_to_bamboo_edge', label: '竹林外缘', kind: 'world', layout: { anchor: 'W', lane: 0 } },
      东: { id: 'wjf_herb_ridge_to_herb_garden', label: '药圃', kind: 'world', layout: { anchor: 'E', lane: 0 } }
    },
    danger: 0,
    npcs: [],
    items: []
  },

  '问剑峰·断剑坡': {
    name: '问剑峰·断剑坡',
    displayName: '断剑坡',
    zoneKind: 'faction_hq',
    desc: '竹林北面一段陡坡，土里不时露出半截旧铁和折断的木鞘。有人把练废的兵刃暂放在坡边，久而久之，这里像一条通往剑冢的沉默前廊。',
    desc_morning: '晨光斜照在泥里的断刃上，偶尔反出一点冷光。路面有新扫过的痕迹。',
    desc_night: '风从坡顶下来，铁片彼此轻碰，声音不像风声。',
    connections: { 南: '问剑峰·竹林', 北: '问剑峰·守冢石阶' },
    routeSketch: {
      南: { id: 'wjf_broken_sword_slope_to_bamboo', label: '竹林', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_broken_sword_slope_to_tomb_steps', label: '守冢石阶', kind: 'world', layout: { anchor: 'N', lane: 0 } }
    },
    danger: 1,
    npcs: [],
    items: []
  },

  '问剑峰·守冢石阶': {
    name: '问剑峰·守冢石阶',
    displayName: '守冢石阶',
    zoneKind: 'faction_hq',
    desc: '一列窄石阶沿山脊向北，阶旁钉着一块褪色木牌：非祭扫不得喧哗。再往上就是剑冢。即使山下还听得见人声，到这里也会自然放轻脚步。',
    desc_morning: '石阶上没有露水，像有人很早就扫过。远处扫帚摩石的声音一下、一下传来。',
    desc_dusk: '风把落叶卷到台阶边，却没有一片越过坡顶。剑冢方向已经亮起一盏灯。',
    connections: { 南: '问剑峰·断剑坡', 北: '问剑峰·剑冢' },
    routeSketch: {
      南: { id: 'wjf_tomb_steps_to_broken_sword_slope', label: '断剑坡', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_tomb_steps_to_tomb', label: '剑冢', kind: 'world', layout: { anchor: 'N', lane: 0 } }
    },
    danger: 1,
    npcs: [],
    items: []
  },

  // ============ 伙房 ============

  '问剑峰·伙房': {
    name: '问剑峰·伙房',
    desc: '一间不大的灶房，青砖砌的灶台占了半面墙。三口铁锅，最大那口可以煮整只鸡。灶台后面堆着柴火，码得整整齐齐。墙上挂着几串干辣椒和一把锅铲。靠窗有一张方桌，桌上有碗筷。烟囱从屋顶伸出去，炊烟顺着山势往上飘。地上铺的石板被踩得发黑，但灶台擦得很干净。',
    desc_morning: '老蔡生火，小荷揉面。炊烟顺着山势往上走。灶台上的大锅咕嘟咕嘟响，是粥。老蔡一边看火一边切咸菜，刀工极快。小荷揉面揉得满脸是粉。',
    desc_noon: '铁牛搬米。老蔡在剁肉。锅里的水滚了。铁牛扛着一袋米进来，放在墙角，一声不吭。老蔡头也不抬：「再搬两袋。」铁牛转身又出去了。',
    desc_dusk: '最热闹。全门派来吃饭。老蔡敲锅边：排队！弟子们端着碗排成长龙，吵吵嚷嚷。铁牛在角落里闷头吃了三碗。小荷盛菜盛得手发抖。',
    desc_night: '灶台还温着。老蔡一个人洗碗。那盏灯是为守夜的人留的。锅里的水还温着，旁边放着一碗盖住的粥——谁饿了可以自己盛。',
    connections: { 西: '问剑峰·伙房外院' },
    routeSketch: {
      西: { id: 'wjf_kitchen_to_court', label: '伙房外院', kind: 'world', layout: { anchor: 'W', lane: 0 } }
    },
    danger: 0,
    npcs: [
      {
        id: 'wenjianfeng_laocai',
        name: '老蔡',
        desc: '一个圆脸的中年人，围着围裙，手里永远拿着锅铲或菜刀。看着和气，但凶起来嗓门极大。',
        dialogue: '多吃点，练剑费力气。上次周碛饿晕在剑坪上——别跟他说是我说的。'
      },
      {
        id: 'wenjianfeng_xiaohe',
        name: '小荷',
        desc: '一个十四岁的丫头，手上沾满面粉，一直在揉面。',
        dialogue: '老蔡说再揉两年就能出师了。你觉得他在骗我，但我不敢问。'
      },
      {
        id: 'wenjianfeng_tieniu',
        name: '铁牛',
        desc: '一个壮得像座山的年轻人，沉默寡言，一直在搬东西。',
        dialogue: '……（铁牛看了你一眼，点了点头，继续搬米。）'
      }
    ],
    items: []
  },

  // ============ 洗剑池 ============

  '问剑峰·洗剑池': {
    name: '问剑峰·洗剑池',
    desc: '一泓山泉汇成的池子，不大，约三丈见方。水清见底——池底有几把断剑，锈迹斑斑，也不知放了多久。池边铺着石板，长了一层薄苔。石缝里长着几株菖蒲。水从上面岩壁的一条裂缝渗出来，叮咚叮咚落进池里。南边下接引泉坡，北面还要沿涧边小径走一程，才到竹林。',
    desc_morning: '水面平静，能看见池底的断剑。发白。晨光照在池面上，水底那些断剑像一排骨头。水很凉——手伸进去，指尖发麻。',
    desc_noon: '日光照在池面上，晃眼。水声盖过了远处的砍竹声。池底的断剑在光线折射下看不太清，偶尔有一两个光点闪一下——也许是剑身上未锈尽的铁。',
    desc_dusk: '水是暗的。老妪坐在池边，对着水说话——没有人在对面。她的嘴唇一开一合，听不清说什么。水面的涟漪一圈一圈散开，但风是从她那个方向吹的。',
    desc_night: '水声格外清楚。灯笼映在水里，像水底点了一盏灯。池面的倒影里有月光，有灯笼，还有——一个人的轮廓。但你往池边看，没有人。只有水波在动。',
    connections: { 南: '问剑峰·引泉坡', 北: '问剑峰·涧边小径' },
    routeSketch: {
      南: { id: 'wjf_washpool_to_spring_slope', label: '引泉坡', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_washpool_to_stream_path', label: '涧边小径', kind: 'world', layout: { anchor: 'N', lane: 0 } }
    },
    danger: 1,
    npcs: [
      {
        id: 'wenjianfeng_laoyu',
        name: '盲眼老妪',
        desc: '一个白发老妪坐在池边石板上，眼窝深陷，似盲。衣衫洗得发白，浆得很干净。她的手搭在膝上，指节粗大。',
        dialogue: '你的剑鞘没擦干净。第三次了。……你问我怎么知道？我闻得到的。'
      }
    ],
    items: []
  },

  // ============ 竹林 ============

  '问剑峰·竹林': {
    name: '问剑峰·竹林',
    desc: '一片青竹长在后山，竹竿笔直，密密匝匝。林间有一条踩出来的小路，铺满了落叶和竹壳。风过竹林，沙沙作响。林中有一间竹棚，棚下有一张矮桌、一把竹椅，桌上有半盏凉茶。竹丝散了一地——是劳叔削的。空气里有竹子清苦的味道。林子深处黑，看不透。',
    desc_morning: '竹叶上挂着露珠。劳叔已经开始削竹丝了。他坐在竹棚下，手里一把小刀，竹丝翻飞，速度极快。他没抬头。石头在不远处劈柴，斧子落下三声，停一息，再三声。有节奏。',
    desc_noon: '日头从竹叶缝里筛下来，光斑落在地上，碎成一地金币。石头在劈柴，有节奏的三声。劳叔的竹棚下有一壶茶，已经凉了。竹林里很安静，只有刀声和斧声。',
    desc_dusk: '风过竹林，像有人在叹气。劳叔收工了，但灯留着。桌上竹丝收得整整齐齐，刀搁在旁边。石头也不见了。林子深处的阴影比正午长了三倍，竹影晃动，像很多人在走。',
    desc_night: '黑。竹影在月光下晃。有沙沙声——是风，还是野猪？竹棚下的灯灭了，但茶壶还在。竹林深处的方向看不透，像一面黑墙。你不记得白天那里有没有路。',
    connections: { 南: '问剑峰·竹林外缘', 北: '问剑峰·断剑坡', 深: '问剑峰·竹林深处' },
    routeSketch: {
      南: { id: 'wjf_bamboo_to_edge', label: '竹林外缘', kind: 'world', layout: { anchor: 'S', lane: 0 } },
      北: { id: 'wjf_bamboo_to_broken_sword_slope', label: '断剑坡', kind: 'world', layout: { anchor: 'N', lane: 0 } },
      深: {
        id: 'wjf_bamboo_to_deep',
        label: '雾中岔径',
        kind: 'dungeon',
        layout: { anchor: 'DEEP', lane: 0 },
        discovery: {
          hint: '竹影深处有一条被落叶遮住的窄径，风向与外面不同。',
          revealLabel: '循迹细察',
          revealMessage: '你拨开湿冷竹叶，发现一条通往竹林深处的窄径。',
          hiddenMessage: '你只看见层层竹影，暂时找不到深入的路。'
        }
      }
    },
    danger: 1,
    npcs: [
      {
        id: 'wenjianfeng_laoshu',
        name: '劳叔',
        desc: '一个清瘦的中年人，坐在竹棚下削竹丝。手极稳，刀极快。他不抬头看人。',
        dialogue: '新来的。你走偏了。左脚往左三寸——那根竹子我留着做剑鞘的。'
      },
      {
        id: 'wenjianfeng_shitou',
        name: '石头',
        desc: '一个壮实的哑巴，光着膀子在劈柴。一斧下去，木桩裂成两半。',
        dialogue: '……（石头看了你一眼，咧嘴笑了笑，继续劈柴。他说不了话。）'
      }
    ],
    items: [
      { id: 'bamboo_silk', name: '竹丝', desc: '一根削得极细的竹丝，薄如纸片，韧而不折。劳叔的手艺。', desc_awakened: '一根削得极细的竹丝，薄如纸片，韧而不折。劳叔的手艺。竹丝断面有极细的纹路，不是刀痕——是竹子本身的筋络被顺开了。' }
    ]
  },

  // ============ 药圃 ============

  '问剑峰·药圃': {
    name: '问剑峰·药圃',
    desc: '从竹林外缘往东，隔着一条窄田埂辟出的小块药地。地垄挖得不太直，有些药草种得歪歪斜斜。角落里有一间草棚，棚下晾着草药，气味浓烈。地上插着木牌，写着药名——有几个字写错了，又划掉重写。一只竹篓搁在田埂上，里面装着半篓草。',
    desc_morning: '清晨的药圃带着露水和药香。阿青蹲在地垄边上，拿树枝戳一条蛇。蛇不走，她也不走。草药的叶子上凝着水珠，阳光一照，亮晶晶的。',
    desc_noon: '正午日头毒，药圃里的草都蔫了。阿青不在。草棚下的草药被晒得卷了边。木牌上的字在阳光下看得清楚——「蛇胆草」三个字被划掉了两次，旁边歪歪扭扭写着「不是这种」。',
    desc_dusk: '黄昏的药圃安静下来。阿青在草棚里整理草药，把干的收进布袋，湿的摊开。她的影子被夕阳拉得很长。远处竹林传来沙沙声。一条蛇从地垄里探出头，又缩回去了。',
    desc_night: '夜里药圃的味道格外浓，甜苦辛辣混在一起。草棚下的草药在月光下泛着不同的颜色——有的发白，有的发青。地垄里有窸窣声，也许是蛇，也许是田鼠。阿青不在。',
    connections: { 西: '问剑峰·药圃田埂' },
    routeSketch: {
      西: { id: 'wjf_herb_garden_to_ridge', label: '药圃田埂', kind: 'world', layout: { anchor: 'W', lane: 0 } }
    },
    danger: 0,
    npcs: [
      {
        id: 'wenjianfeng_aqing',
        name: '阿青',
        desc: '一个扎着双髻的姑娘，蹲在地上拿树枝戳蛇。脸上有泥。',
        dialogue: '你认识蛇胆草吗？……不是这种。上次我采错了，师兄拉了一天肚子。'
      }
    ],
    items: []
  },

  // ============ 剑冢 ============

  '问剑峰·剑冢': {
    name: '问剑峰·剑冢',
    desc: '问剑峰最高处。一片空旷的平地，地上插满了断剑。有的只剩半截，有的锈得看不出形状，有的剑柄还在但剑身断了。粗略数去，有上百把。插得最正的那把最大，只剩三分之一，剑刃上的锈像鳞片。地上有落叶，扫得干净。一个独眼老人坐在那把最大的断剑后面。',
    desc_morning: '剑翁在扫落叶。那些叶子昨天扫过了。晨光从东边照过来，断剑的影子一根一根横在地上，像栅栏。剑翁的扫帚很旧，但扫得很稳。',
    desc_noon: '安静。剑翁在打盹。断剑不生锈。日头晒在铁上，有股热烘烘的铁锈味。风从四面八方吹来，断剑之间的间隙发出嗡嗡声——像有人拨了一下琴弦，余音还没散。',
    desc_dusk: '灯笼亮了。剑翁没扫——他在看那些断剑，一把一把地看。他走到每一把前面停一会儿，像在看人。走到最大的那把前，停得最久。',
    desc_night: '灯笼在风里晃。剑翁没睡。那些断剑在月光下泛着不一样的光——不是铁的光泽，更像是水。最大的那把断剑上，锈迹剥落了一小块，露出下面的铁——很亮。也许是月光的关系。',
    connections: { 南: '问剑峰·守冢石阶' },
    routeSketch: {
      南: { id: 'wjf_tomb_to_steps', label: '守冢石阶', kind: 'world', layout: { anchor: 'S', lane: 0 } }
    },
    danger: 2,
    npcs: [
      {
        id: 'wenjianfeng_jianweng',
        name: '剑翁',
        desc: '一个独眼老人，身形枯瘦，坐在断剑丛中。右眼蒙着黑布，左眼半阖。手边一把扫帚。',
        dialogue: '多了。……我知道。回去的时候注意脚下。'
      }
    ],
    items: [
      { id: 'broken_sword_fragment', name: '断剑残片', desc: '从地上捡到的一块铁片，也许是某把断剑崩下来的。边缘很锋利。', desc_awakened: '从地上捡到的一块铁片，断口处有极细的锻打纹——不是人工锻打，像是铁自己在生长的纹路。' }
    ]
  },

  // ============ 藏剑阁 ============

  '问剑峰·藏剑阁': {
    name: '问剑峰·藏剑阁',
    desc: '一栋二层木楼，门虚掩着。里面是一排排木架，架上放着书卷和剑谱。灰尘不算厚，有人定期打扫。靠窗有一张书桌，桌上有砚台和半卷书。右边第三排书架前——你总觉得那里空了一块，像应该有什么东西。阁老坐在门口的椅子上，在打盹。',
    desc_morning: '阁老在打盹。穆先生在窗边读书。晨光照在书卷上，墨迹清清楚楚。穆先生翻页很慢，有时停下来看窗外。他看的不是书——或者说，他同时在看书和看窗外。',
    desc_noon: '阁老在打盹。穆先生不见了。书桌上摊着一本翻到中间的书，砚台里的墨干了一半。右边第三排书架——你数了一下，确实空了一格。但阁老在门口坐着，你不便去看。',
    desc_dusk: '阁老在打盹。灯没点。但你说「左边第三排」的时候他回了你：「不是那边。」他没睁眼。你也不确定他是在跟你说话，还是在说梦话。',
    desc_night: '不开门。阁老睡在里面。据说他晚上不打盹。门从里面闩了，你推不动。窗缝里透出一丝光——也许是灯，也许不是灯。',
    connections: { 东: '问剑峰·藏剑阁前庭' },
    routeSketch: {
      东: { id: 'wjf_archive_to_court', label: '藏剑阁前庭', kind: 'world', layout: { anchor: 'E', lane: 0 } }
    },
    danger: 1,
    npcs: [
      {
        id: 'wenjianfeng_gelao',
        name: '藏剑阁老',
        desc: '一个干瘦的老人，坐在门口的竹椅上打盹。头一点一点的，像在点头。但他什么都没答应。',
        dialogue: '……（阁老没有睁眼。但你碰到右边书架时他立刻说了一声「不是那边」。）'
      },
      {
        id: 'wenjianfeng_muxiansheng',
        name: '穆先生',
        desc: '一个面色苍白的书生，坐在窗边读书。衣衫整洁，像山下人。他偶尔咳嗽。',
        dialogue: '山下……三年前的事了。不太记得了。你问这些做什么？'
      }
    ],
    items: [
      { id: 'sword_manual', name: '剑谱残卷', desc: '一卷泛黄的竹简，上面画着剑招图解。有些图模糊了，有些缺了半页。', desc_awakened: '一卷泛黄的竹简，上面画着剑招图解。残缺处的断口不是磨损——是被人撕走的。撕得很整齐，像是不想让谁看到那一式。' }
    ]
  },

  // ============ 弟子房（4间）============

  '问剑峰·弟子房': {
    name: '问剑峰·弟子房',
    desc: '一间不大的木屋，是你住的地方。一张木床，一床被褥，一张矮桌，一盏油灯。墙上挂着你来时背的包袱。窗子越过弟子院的屋檐，能望见剑坪方向。屋子虽小，但收拾得干净。床边的木板上有一道划痕——也许是上一个住的人留下的。',
    desc_morning: '清晨的阳光从窗子照进来，在床铺上画了一个方块。被褥还带着体温——你刚醒。窗外传来剑坪上的脚步声，是残剑师姐。她总是第一个。',
    desc_noon: '正午的阳光直射进来，屋里很亮。桌上的油灯没点，但屋里不暗。窗外能看见剑坪——空荡荡的，太热。远处伙房方向飘来炊烟。',
    desc_dusk: '黄昏的光从窗子斜进来，在墙上映出橙红一块。剑坪上有人在收剑。你听见隔壁苏小棠在唱歌——跑调了。对面周碛摔了一下门。',
    desc_night: '夜里很安静。油灯的光在墙上晃。窗外的月光照在地上，像一摊水。远处剑坪方向好像有个人影——是残剑师姐。她还在。被褥很暖和。你可以休息。',
    connections: { 外: '问剑峰·弟子院' },
    routeSketch: {
      外: { id: 'wjf_player_room_to_dorm_court', label: '弟子院', kind: 'interior', layout: { anchor: 'ABOVE', lane: 0 } }
    },
  },

  '问剑峰·苏小棠房': {
    name: '问剑峰·苏小棠房',
    desc: '隔壁苏小棠的房间。门虚掩着。你推门看了一眼——和你的差不多大，但乱得多。桌上堆着零碎物件，墙角有一把没入鞘的剑。枕边放着一本翻烂了的剑谱。',
    desc_morning: '（门关着。里面有声音——苏小棠在哼歌。你不好进去。）',
    desc_noon: '（门关着。苏小棠不在——她在剑坪练剑。）',
    desc_dusk: '（门关着。苏小棠在里面。她说了声「谁？」你应了一声。她沉默了两息：「门没闩——但你别进来。」）',
    desc_night: '（门关着。灯灭了。苏小棠睡了。）',
    connections: {},
    danger: 0,
    npcs: [],
    items: [],
    locked: true,
    lock_message: '这不礼貌。苏小棠的房间——虽然是隔壁，但也不是你能随便进的。'
  },

  '问剑峰·周碛房': {
    name: '问剑峰·周碛房',
    desc: '对面周碛的房间。门关着。你贴耳听了一下——没有声音。他大概不在。',
    desc_morning: '（门关着。周碛已经去剑坪了。）',
    desc_noon: '（门关着。周碛不在。）',
    desc_dusk: '（门关着。里面传来一声闷响——像是什么东西被扔在墙上。然后安静了。）',
    desc_night: '（门关着。周碛在里面。灯还亮着。你不好进去。）',
    connections: {},
    danger: 0,
    npcs: [],
    items: [],
    locked: true,
    lock_message: '这不礼貌。周碛的房间——他要是知道你进去了，明天挑水你得多挑两桶。'
  },

  '问剑峰·阿满房': {
    name: '问剑峰·阿满房',
    desc: '对面隔壁阿满的房间。门上挂着一根草绳——是他自己系的，说是"门铃"。你碰一下草绳，里面传来一阵翻身的动静。',
    desc_morning: '（门关着。阿满在里面穿衣服——他起得晚。）',
    desc_noon: '（门关着。阿满去挑水了。）',
    desc_dusk: '（门关着。阿满在里面——你听见他在数东西。「一、二、三……」数到几停了。然后从头数。）',
    desc_night: '（门关着。阿满睡了。呼吸声很均匀。他睡得比谁都早。）',
    connections: {},
    danger: 0,
    npcs: [],
    items: [],
    locked: true,
    lock_message: '这不礼貌。阿满的房间——他才十二岁，你进他房间做什么？'
  },

  // ============ 竹林深处·入口 + 迷宫（5间，环形拓扑）============
  // 仅子时开放入口，设计为走不出去的循环

  '问剑峰·竹林深处': {
    name: '问剑峰·竹林深处',
    desc: '竹林深处。竹子比外面更密，光线几乎透不进来。脚下的小路踩得泥泞，分出几条岔道。空气湿冷，带着腐叶和竹根的味道。风从四面八方来，又好像哪也没有。你觉得自己走了很久，但回头看看，来路还在——也许还在。',
    desc_morning: '（清晨的竹林深处雾气更浓。你几乎看不见三步外的竹竿。脚下的泥比外面湿——也许这里本来就湿。）',
    desc_noon: '（正午的光勉强透进来几缕。竹影斑驳。前方的岔路像几条蛇，蜿蜒着没入黑暗。）',
    desc_dusk: '（黄昏。竹林深处比外面暗得多。风停了，竹叶还在动。也许是你带的风。）',
    desc_night: '（夜里竹林深处只有月光筛下来的碎银。沙沙声比外面密。前方的路分了岔——你不记得白天这里有过岔路。但现在是子时。也许路只在子时才分岔。）',
    connections: { '入': '问剑峰·竹林深处·岔路甲', '出': '问剑峰·竹林' },
    danger: 2,
    npcs: [],
    items: [],
    is_maze_entrance: true,
    time_restricted: true,
    time_restriction: '子时'
  },

  '问剑峰·竹林深处·岔路甲': {
    name: '问剑峰·竹林深处·岔路甲',
    desc: '竹林深处。竹子比外面更密，光线几乎透不进来。脚下的小路踩得泥泞，分出几条岔道。一根歪斜的竹竿上刻着一个「甲」字——也许是标记。风从东边来，竹叶沙沙响。你觉得这地方好像来过。',
    desc_morning: '（竹林深处在清晨看不真切。雾气缠在竹竿上，路更难辨。那个「甲」字上的水珠，像在流汗。）',
    desc_noon: '（正午的光勉强透进来几缕，竹影斑驳。小路分岔的方向似乎和刚才不一样了。也许是你记错了。）',
    desc_dusk: '（黄昏的竹林深处比外面暗得多。那根刻着「甲」字的竹竿——你刚才是不是经过了？那水珠还在。也许不是同一根。）',
    desc_night: '（夜里竹林深处只有月光筛下来的碎银。竹影晃动，像很多人在走。沙沙声比外面更密。你觉得自己走了很久，但脚下的路和刚才一样。那根刻着「甲」字的竹竿——你已经是第三次经过了。也许不是同一根。但水珠的位置一样。）',
    connections: { 东: '问剑峰·竹林深处·岔路乙', 北: '问剑峰·竹林深处·岔路丙', 南: '问剑峰·竹林深处·岔路甲' },
    danger: 2,
    npcs: [],
    items: [],
    is_maze: true,
    time_restricted: true,
    time_restriction: '子时'
  },

  '问剑峰·竹林深处·岔路乙': {
    name: '问剑峰·竹林深处·岔路乙',
    desc: '竹林深处。竹竿挤在一起，头顶被竹叶遮住了天。脚下的小路绕过一丛矮竹，分出几条道。一根竹竿上刻着一个「乙」字。你好像闻到了竹叶腐烂的味道——和刚才那个地方一样。',
    desc_morning: '（清晨的雾让竹林深处更加模糊。那个「乙」字看不太清。也许本来就不是「乙」——也许是「己」。你想多了。）',
    desc_noon: '（正午。你从西边来，但日头好像在南边。也许你转了向。竹影在地上分不出方向。）',
    desc_dusk: '（黄昏。竹林深处暗得像夜里。那根刻着「乙」字的竹竿旁边有一丛矮竹——你好像刚才见过一样的矮竹。也许竹子都长得一样。）',
    desc_night: '（夜里。你往北走，但脚下的路好像在拐弯。那根「乙」字竹竿——你确定刚才经过了。但上面的刻痕比刚才深了。也许竹子在长。竹子不会缩，但也许会——算了。）',
    connections: { 西: '问剑峰·竹林深处·岔路甲', 北: '问剑峰·竹林深处·岔路丁', 东: '问剑峰·竹林深处·岔路乙' },
    danger: 2,
    npcs: [],
    items: [],
    is_maze: true,
    time_restricted: true,
    time_restriction: '子时'
  },

  '问剑峰·竹林深处·岔路丙': {
    name: '问剑峰·竹林深处·岔路丙',
    desc: '竹林深处。竹子密得伸手不见五指。脚下踩到一根断竹——断口是新的。你低头看了一眼，断口里渗着水。小路往南和东各分一条。一根竹竿上刻着一个「丙」字。你觉得空气比刚才湿了一些。',
    desc_morning: '（清晨的竹林深处。露水从竹叶上滴下来，打在后颈上。那个「丙」字被水冲淡了。也许该重新刻一个。但你没有刀。）',
    desc_noon: '（正午。光从竹叶缝里漏下来，照见空气里飘的灰尘。那根「丙」字竹竿的影子很短——和刚才那根一样短。也许该到头了。但路还在延伸。）',
    desc_dusk: '（黄昏。竹林深处比外面暗两个时辰。你听见水滴声——但不是从上面滴下来的。从地下。也许你想多了。）',
    desc_night: '（夜里。你往东走，但好像又回到了原处。那根「丙」字竹竿旁边有一根断竹——你刚才踩断的。但它已经在了那里。断口是旧的。也许不是你踩断的那根。但位置一样。角度一样。）',
    connections: { 南: '问剑峰·竹林深处·岔路甲', 东: '问剑峰·竹林深处·岔路丁', 北: '问剑峰·竹林深处·岔路丙' },
    danger: 2,
    npcs: [],
    items: [],
    is_maze: true,
    time_restricted: true,
    time_restriction: '子时'
  },

  '问剑峰·竹林深处·岔路丁': {
    name: '问剑峰·竹林深处·岔路丁',
    desc: '竹林深处。竹竿之间长了一层暗绿的苔。脚下的路被苔盖住了一半，踩上去有些滑。一根竹竿上刻着一个「丁」字——刻痕里积了水。你觉得有东西在看你的方向。',
    desc_morning: '（清晨。苔上有露水，更滑了。那个「丁」字——你看了一眼就走。没什么好看的。但你在走的时候总觉得背后有什么。也许是竹影。）',
    desc_noon: '（正午。苔在阳光照不到的地方还是湿的。你从北边来，但路好像在转。也许是地形。也许是你自己。）',
    desc_dusk: '（黄昏。竹林深处。你走了一会儿，发现自己在往回走。但你没拐弯。路自己弯了。也许路本来就是这样。）',
    desc_night: '（夜里。竹林深处。你往北走——又回到了「丁」字竹竿前。刻痕里的水溢出来了。你刚才经过的时候，水还没溢。你走的时候也没有下雨。水从哪来的？你不想知道。）',
    connections: { 西: '问剑峰·竹林深处·岔路丙', 南: '问剑峰·竹林深处·岔路乙', 北: '问剑峰·竹林深处·岔路丁' },
    danger: 2,
    npcs: [],
    items: [],
    is_maze: true,
    time_restricted: true,
    time_restriction: '子时'
  }

};

// 暴露到全局
if (typeof window !== 'undefined') window.WENJIANFENG_ROOMS = WENJIANFENG_ROOMS;
if (typeof module !== 'undefined') module.exports = WENJIANFENG_ROOMS;

// === DATA MANIFEST REGISTRY (auto-generated, do not edit) ===
window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof WENJIANFENG_ROOMS !== 'undefined') window.__DATA_REGISTRY['WENJIANFENG_ROOMS'] = WENJIANFENG_ROOMS; } catch(e) { console.warn('[Registry] WENJIANFENG_ROOMS not registered:', e.message); }
