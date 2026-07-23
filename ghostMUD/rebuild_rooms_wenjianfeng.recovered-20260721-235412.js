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
    desc: '一座青石牌坊立在山脚路口，楣上刻着「问剑」二字。',
    desc_morning: '守山弟子身形笔挺，如一杆利剑立在牌坊之下。',
    desc_noon: '烈日当头，守山弟子额上已见汗珠，身形却未有丝毫动摇。',
    desc_dusk: '换岗。交接的口令声从石阶下面传上来。两个弟子在牌坊下下交汇，二人验过令牌，拱手为礼。',
    desc_night: '山风自阶上盘旋而下，掠过牌坊，发出破空轻啸，为这寂静山门平添几分萧杀。',
    zoneKind: 'faction_hq',
    connections: { 北: '问剑峰·剑阶·下段' },
    routeSketch: {
      北: { id: 'wjf_shanmen_to_stairs_lower', label: '剑阶', kind: 'world', layout: { anchor: 'N', lane: 0 } },
    },
    danger: 0,
    npcs: [
      {
        id: 'wenjianfeng_zhixing',
        name: '守山弟子',
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
    desc: '此乃由山门通往峰顶的唯一石阶，自此盘旋而上，名为「剑阶」。',
    desc_morning: '山岚晨雾，弥漫剑阶前，将山门牌坊隐于一片朦胧之后。',
    desc_noon: '日头毒辣，石阶被晒得有些烫脚。',
    desc_dusk: '斜阳贴着石阶斜切下来，山门的换岗口令只剩断续几句。',
    desc_night: '下方的牌坊灯已渺如豆火。松影横在阶上，走急了很容易把它看成伸出的手。',
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
    desc: '石阶在这里绕过一株斜松，风把碎松针吹到台阶缝里，石缝旁有一小片被人踩歪的白芷。',
    desc_morning: '越是向上，自山门处传来的喝叱与兵刃相击之声，便越是清晰可闻，催人步履。',
    desc_noon: '越是向上，自山门处传来的喝叱与兵刃相击之声，便越是清晰可闻，催人步履。',
    desc_dusk: '越是向上，自山门处传来的喝叱与兵刃相击之声，便越是清晰可闻，催人步履。',
    desc_night: '石缝里的白芷在月色下颜色很浅。风吹过时，草叶拂在石面上，像极轻的脚步。',
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
        hint: '斜松根下贴着一圈刚被风吹落的白芷花，像是谁匆忙遗下的。',
        item: {
          id: 'wjf_baizhi_wreath',
          name: '白芷花环',
          type: 'special',
          boundNpc: 'wenjianfeng_suxiaotang',
          giftAffinity: 3,
          giftFlags: { returned_baizhi_wreath: true },
          giftNote: '将遗落的白芷花环还给小棠',
          giftLog: '苏小棠怔了一下，把花环接过去，小声说了句「我还以为找不回来了。」',
          desc: '用新鲜白芷编成的小花环，边缘压扁了一点，像是从谁发间滑落的。',
        },
        foundText: '你在斜松根下找到了一个白芷花环。',
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
    desc: '石阶行至此处，地势豁然开朗，风里也多了汗水的味道。',
    desc_morning: '晨雾在脚下散开，剑坪上有人影静立',
    desc_noon: '四下里暑气蒸腾，连蝉都噤了声，唯有剑坪方向，「砰、砰」闷响不绝于耳。',
    desc_dusk: '远处已经能看清收剑人影。石阶尽头的风带着炊烟味，伙房多半正在备饭。',
    desc_night: '剑峰只剩一层冷白月光。却闻台阶上方传来轻响，是谁在月下舞剑？',
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
    desc: '一片开阔石台，乃是剑峰的心口。正地势险要，是本门弟子砥砺剑技之所。',
    desc_morning: '天光乍破，晨雾未散，露湿青衫。坪上已有一人伫立。',
    desc_noon: '烈日当空，石坪上热浪蒸腾，空无一人。唯有廊下的柳师叔自顾自地手谈对弈，落子无悔。',
    desc_dusk: '夕阳熔金，暮色四合。弟子们三三两两收剑归鞘，或去伙房，或返居舍，喧闹声渐行渐远。',
    desc_night: '月华如水，泻满剑坪。残剑师姐仍如白日一般，纹丝不动，若非衣袂被风微微吹动，你几乎要以为她已入定物化。',
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
        desc: '剑未出鞘，斜挂腰间。面容冷淡，眉目如刀刻。她站在剑坪中央，一动不动。',
        dialogue: '……（她微微点了一下头，没有说话。也许她不说话。也许她只是不跟你说话。）'
      },
      {
        id: 'wenjianfeng_liushishu',
        name: '柳师叔',
        desc: '一个须发半白的老者，坐在廊下石凳上，面前摆着一盘棋。黑白子都由他一个人下。',
        dialogue: '你走那边——对，将死，承让。'
      }
    ],
    items: [
      { id: 'practice_sword', name: '旧木剑', desc: '一把木柄旧剑，插在木桩上。', desc_awakened: '一把木柄旧剑，插在木桩上，剑身上有一道新痕。' }
    ]
  },

  // ============ 生活区与后山过渡带 ============

  '问剑峰·伙房外院': {
    name: '问剑峰·伙房外院',
    displayName: '伙房外院',
    zoneKind: 'faction_hq',
    desc: '剑坪东侧的矮院。两口水缸挨着墙根，柴棚下码着新劈的松木，几只木桶倒扣在石板上。',
    desc_morning: '天刚破晓，伙房的头一缕炊烟正缓缓升起。几只麻雀落在柴棚顶上，探头探脑。',
    desc_noon: '剑坪东侧的矮院。两口水缸挨着墙根，柴棚下码着新劈的松木，几只木桶倒扣在石板上。',
    desc_dusk: '天色昏黄，伙房的头一缕炊烟正缓缓升起。几只麻雀落在柴棚顶上，探头探脑。',
    desc_night: '剑坪东侧的矮院。两口水缸挨着墙根，柴棚下码着新劈的松木，几只木桶倒扣在石板上。',
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
    desc: '从剑坪西侧步入，便是一段幽深的石廊，尽头才是藏剑阁。廊檐下挂着两只旧铜铃，风再大也只轻响一声。',
    desc_morning: '晨光如尺，一寸一寸地量过廊柱。阁门虚掩着，像在等人，也像不欢迎人。',
    desc_night: '廊下比剑坪暗得多。目力所及，一片沉沉黑暗，唯有藏剑阁的窗纸上，晕开一点烛光。',
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
    desc_dusk: '晚风穿过晾衣绳，木屋里陆续亮灯。有人在院中争最后一桶热水。',
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
    desc: '石径至此愈发狭窄。一侧崖壁宛如巨剑剖开，另一侧却是万丈深渊。山风过处，可俯瞰下方层叠的殿宇飞檐。',
    desc_morning: '清晨，总有勤勉的弟子挑着水，借着微光在前面一摇一晃。',
    desc_dusk: '炊烟从山下斜飘上来。',
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
    desc: '一道浅渠沿着石阶内侧蜿蜒而下，引的是自山壁石缝间渗出的清泉，水声淙淙，不绝于耳。',
    desc_morning: '渠水清得见底，几片竹叶顺着坡往下漂。此地青苔湿滑，担水上行的弟子们到此皆会放缓脚步。',
    desc_night: '月光如练，泻于渠中。自坡顶的洗剑池方向，隐有寒光一泓，不知是月色，还是剑光。',
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
    desc: '越过洗剑池，山径贴着一道浅涧往北。涧水潺潺，石栏也到此而尽。再往前，门派日常的痕迹开始少下来。',
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
    desc: '此处山路渐缓，密不透风的竹林在此让开一道口，依稀可辨是往北入林和往东去药圃的两条岔路。',
    desc_morning: '一串小兽脚印从竹根间钻出，又消失在田埂方向。',
    desc_night: '月色难入，竹影幢幢，自林海深处漫延而出，几乎要将这条小路也一并吞噬。',
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
    desc: '一道窄窄的田埂。埂下是灌溉用的浅沟，积着些许清水。两旁的奇花异草有高有低，被门中弟子照料得极好。',
    desc_morning: '露水沾满裤脚，田埂边插着阿青新换的木牌，「参王勿踩」。',
    desc_dusk: '露水沾满裤脚，田埂边插着阿青新换的木牌，「参王勿踩」。',
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
    desc: '竹林北面一段陡坡，有人把练废弃兵刃放在坡边，天长日久，竟聚出了一股萧杀之气。',
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
    desc: '一列窄石阶沿山脊向北，山石上以力劲刻字「非祭拜者，不得擅入」。落叶似也知趣，不曾飘过一步。',
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
    desc: '一间不大灶房，青砖灶台占了半壁江山。灶台后面堆着柴火，墙上挂着几串干辣椒和一把锅铲。炊烟袅袅，顺着山势散入云里。',
    desc_morning: '老蔡生火，小荷揉面。灶台上的大锅咕嘟咕嘟响。',
    desc_noon: '铁牛扛米袋进来，搁墙角，闷头又出去。老蔡头也不抬：「不够，来了新人，再来一袋。」',
    desc_dusk: '锅碗叮当，人声鼎沸。老蔡手持大勺，看谁敢插队便是一通大骂。小荷盛菜盛得手酸。',
    desc_night: '灶台还温着，是留给守夜弟子的粥。',
    connections: { 西: '问剑峰·伙房外院' },
    routeSketch: {
      西: { id: 'wjf_kitchen_to_court', label: '伙房外院', kind: 'world', layout: { anchor: 'W', lane: 0 } }
    },
    danger: 0,
    npcs: [
      {
        id: 'wenjianfeng_laocai',
        name: '老蔡',
        desc: '一个圆脸中年人，围着围裙，手里永远拿着锅铲。看着和气，但嗓门极大。',
        dialogue: '多吃点，练剑费力气。上次周碛饿晕在剑坪上。'
      },
      {
        id: 'wenjianfeng_xiaohe',
        name: '小荷',
        desc: '一个十二三岁的小丫头，手上沾满面粉，一直在揉面。',
        dialogue: '蔡师父说再揉两年就能出师了。你觉得他在骗我吗？'
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
    desc: '山泉一脉汇而成池，不大，三丈见方。池底横陈数柄断剑，锈痕深重，年月不可考。',
    desc_morning: '池水如镜，断剑历历可见，惨惨如白骨。若伸手进去，定会觉有鱼儿咬你。',
    desc_noon: '日光碎在水面，白茫茫刺人双目。池底断剑隐入光中，唯偶尔一两点寒芒明灭，也不知是什么。',
    desc_dusk: '盲眼老妪独坐池畔，翕动嘴唇，似在与人交谈。奇怪的是，明明无风，水面竟漾开一圈涟漪。',
    desc_night: '四下无声，灯笼映在水里，恍如点亮了水府的宫灯。月影、灯影之间，你似乎还看到了第三个影子。',
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
        desc: '一个白发老妪坐在池边石板上，眼窝深。',
        dialogue: '你的剑鞘没擦干净。第三次了。……你问我怎么知道？我闻得到。'
      }
    ],
    items: []
  },

  // ============ 竹林 ============

  '问剑峰·竹林': {
    name: '问剑峰·竹林',
    desc: '后山青竹成林，竿竿挺直，风穿竹梢，万竿齐响。林中搭一竹棚，棚下矮桌竹椅，搁着半盏凉茶。',
    desc_morning: '竹叶上挂着露珠。劳叔已经开始削竹丝了。他坐在竹棚下，手里一把小刀，竹丝翻飞，速度极快。',
    desc_noon: '竹叶凝露，晨光未透。劳叔已坐棚下削竹丝，小刀翻飞，丝如雪片，他眼不抬手不停。',
    desc_dusk: '竹影摇曳，恍惚有群人穿行其间。你定睛再看——只有风。',
    desc_night: '月色穿林，竹影如墨。沙沙声四起——是风，是兽，还是别的什么？你望着黑暗深处，有些犹豫，白天那里有路吗？',
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
          hiddenMessage: '你只看见层层竹影，这里真的有路吗？'
        }
      }
    },
    danger: 1,
    npcs: [
      {
        id: 'wenjianfeng_laoshu',
        name: '劳叔',
        desc: '一个清瘦中年人，坐在竹棚下削竹丝。手稳，刀快。',
        dialogue: '新来的。你走偏了。左脚往左三寸——那根竹子我留着做剑鞘的。'
      },
      {
        id: 'wenjianfeng_shitou',
        name: '石头',
        desc: '一个壮实哑巴，光着膀子在劈柴。一斧下去，木桩裂成两半。',
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
    desc: '此处乃一药圃。地垄歪歪斜斜，草药也种得东倒西歪。角落里有一间草棚，木牌插在棚下——有几个字划去，又歪歪扭扭重写过。',
    desc_morning: '露重药香浓。阿青蹲在地垄边上，拿树枝戳弄着一条花蛇。',
    desc_noon: '日头毒辣，草药尽数蔫了。木牌上「蛇胆草」三个字被划了两道，旁边歪歪扭扭补着「不是这种」。',
    desc_dusk: '夕照拉长了阿青的影子。她在棚里收拾草药，干的入袋，湿的摊开，手脚极快。远处竹林沙沙作响，一条蛇从垄间探头，又缩了回去——大约认得她。',
    desc_night: '夜来药味更烈，甜苦辛辣搅作一团。月光下草药白的如骨，青的如胆。垄间窸窣不绝，不知是蛇是鼠。',
    connections: { 西: '问剑峰·药圃田埂' },
    routeSketch: {
      西: { id: 'wjf_herb_garden_to_ridge', label: '药圃田埂', kind: 'world', layout: { anchor: 'W', lane: 0 } }
    },
    danger: 0,
    npcs: [
      {
        id: 'wenjianfeng_aqing',
        name: '阿青',
        desc: '一个扎着双髻的姑娘，蹲在地上拿树枝戳蛇。',
        dialogue: '你认识蛇胆草吗？……不是这种。上次我采错了，师兄拉了一天肚子。'
      }
    ],
    items: []
  },

  // ============ 剑冢 ============

  '问剑峰·剑冢': {
    name: '问剑峰·剑冢',
    desc: '问剑峰绝顶。四野空旷，唯断剑如林，密插于地。万余柄残剑，或折或锈，已辨不出本来面目。正中一柄独大，余仅三之一，刃上锈鳞层叠，如老蛟蜕皮。',
    desc_morning: '晨光东来，百柄断剑影子横陈于地，根根如栅。',
    desc_noon: '安静。剑翁在打盹。风从四面八方吹来，断剑之间的间隙发出嗡嗡声响。',
    desc_night: '剑翁未眠，灯在风中摇。月色落在断剑上，倒似水冷。正中巨剑锈壳剥落寸许，露出底下一抹银色。不知是月光，还是它本就如此。',
    connections: { 南: '问剑峰·守冢石阶' },
    routeSketch: {
      南: { id: 'wjf_tomb_to_steps', label: '守冢石阶', kind: 'world', layout: { anchor: 'S', lane: 0 } }
    },
    danger: 2,
    npcs: [
      {
        id: 'wenjianfeng_jianweng',
        name: '剑翁',
        desc: '一个独眼老人，身形枯瘦，坐在断剑丛中。左眼半阖。手边一把扫帚。',
        dialogue: '多了。……我知道。回去的时候注意脚下。'
      }
    ],
    items: [
      { id: 'broken_sword_fragment', name: '一截残剑', desc: '从地上捡到的一截残剑，边缘很锋利。', desc_awakened: '从地上捡到的一截残剑，断口处有极细的锻打纹。' }
    ]
  },

  // ============ 藏剑阁 ============

  '问剑峰·藏剑阁': {
    name: '问剑峰·藏剑阁',
    desc: '二层木楼，门虚掩着。里入内木架成排，书卷剑谱陈列其间，尘不甚厚，有人常来拂拭。',
    desc_morning: '阁老在打盹。穆先生在窗边读书。晨光照在书卷上，墨迹清清楚楚。穆先生翻页很慢，有时停下来看窗外。他看的不是书——或者说，他同时在看书和看窗外。',
    desc_noon: '阁老在打盹。穆先生不见了。你向内张望，右边第三排书架前——你总觉得那里空了一块，像应该有什么东西。',
    desc_dusk: '阁老在打盹。你自语「左起第三架」，他忽然开口：「不是那边。」眼未睁，声不高，像是说梦话。你拿不准他醒着没有。',
    desc_night: '门从里面闩了，你推不动。窗缝里透出一丝光，细如刀刃。',
    connections: { 东: '问剑峰·藏剑阁前庭' },
    routeSketch: {
      东: { id: 'wjf_archive_to_court', label: '藏剑阁前庭', kind: 'world', layout: { anchor: 'E', lane: 0 } }
    },
    danger: 1,
    npcs: [
      {
        id: 'wenjianfeng_gelao',
        name: '藏剑阁老',
        desc: '一个干瘦的老人，坐在门口的竹椅上打盹。',
        dialogue: '……（阁老没有睁眼。但你碰到右边书架时他立刻说了一声「回来！」。）'
      },
      {
        id: 'wenjianfeng_muxiansheng',
        name: '穆先生',
        desc: '一个面色苍白的书生，坐在窗边读书。衣衫整洁，不似山中之人。他偶尔咳嗽。',
        dialogue: '山下……咳咳……三年前的事了。不太记得了。你问这些做什么？'
      }
    ],
    items: [
      { id: 'sword_manual', name: '剑谱残卷', desc: '一卷泛黄的竹简，上面画着剑招图解。几页模糊了，几页缺了角。', desc_awakened: '一卷泛黄的竹简，上面画着剑招图解。残缺处的断口是被人撕走的，像是不想让谁看到那一式。' }
    ]
  },

  // ============ 弟子房（4间）============

  '问剑峰·弟子房': {
    name: '问剑峰·弟子房',
    desc: '一间不大的木屋，你住的地方，墙上挂着你来时背的包袱。',
    desc_morning: '清晨的阳光从窗子照进来，在床铺上画了一个方块。',
    desc_noon: '正午的阳光直射进来，屋里很亮。桌上的油灯没点，但屋里不暗。',
    desc_dusk: '黄昏的光从窗子斜进来，在墙上映出橙红一块。剑坪上有人在收剑。你听见隔壁苏小棠在唱歌，似乎有些跑调。',
    desc_night: '夜里很安静。油灯的光在墙上晃。远处剑坪方向好像有个人影。',
    connections: { 外: '问剑峰·弟子院' },
    routeSketch: {
      外: { id: 'wjf_player_room_to_dorm_court', label: '弟子院', kind: 'interior', layout: { anchor: 'ABOVE', lane: 0 } }
    },
  },

  '问剑峰·苏小棠房': {
    name: '问剑峰·苏小棠房',
    desc: '隔壁苏小棠的房间。门虚掩着。你推门看了一眼——和你的差不多大，但乱得多。桌上堆着零碎物件，墙角有一把没入鞘的剑。',
    desc_morning: '（门关着。里面有声音——苏小棠在哼歌。你最好不要进去。）',
    desc_noon: '（门关着。苏小棠不在。）',
    desc_dusk: '（门关着。苏小棠在里面。她说了声「谁？」）',
    desc_night: '（门关着。灯灭了。苏小棠睡了。）',
    connections: {},
    danger: 0,
    npcs: [],
    items: [],
    locked: true,
    lock_message: '虽然苏小棠是你邻居，但你也不能随便进去，这不合理。'
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
    lock_message: '这不是个好主意。他要是知道你进去了，明天挑水你得多挑两桶。'
  },

  '问剑峰·阿满房': {
    name: '问剑峰·阿满房',
    desc: '对面隔壁阿满的房间。门上挂着一根草绳，说是"门铃"。你碰一下草绳，里面传来一阵翻身动静。',
    desc_morning: '（门关着。阿满在里面穿衣服——他起得晚。）',
    desc_noon: '（门关着。阿满去挑水了。）',
    desc_dusk: '（门关着。阿满在里面——你听见他在数东西。「一、二、三……」数到几停了。然后从头数。）',
    desc_night: '（门关着。阿满睡了。呼吸均匀。他睡得比谁都早。）',
    connections: {},
    danger: 0,
    npcs: [],
    items: [],
    locked: true,
    lock_message: '这不礼貌。他才十二岁，你进他房间做什么？'
  },

  // ============ 竹林深处·入口 + 迷宫（5间，环形拓扑）============
  // 仅子时开放入口，设计为走不出去的循环

  '问剑峰·竹林深处': {
    name: '问剑峰·竹林深处',
    desc: '竹深不见天，蜿蜒没入暗处，像张着嘴等你——你不记得白天这里有过岔路。但现在是子时。',
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
    desc: '竹愈密，天愈暗。泥径分岔，远处一竿歪竹上刻着「甲」。你觉此地似曾相识，却想不起何时来过。',
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
    desc: '矮竹丛中路分数道，远处一竿上刻着「乙」。本就是「乙」，还是你看花了眼？',
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
   desc: '露从叶坠，路分南东，远处一竿上刻着「丙」。路似该尽了，却仍在延。',
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
    desc: '你分明走了许久，回头一望，远处一竿上刻着「丁」。竹影无向，你亦无向。',
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
