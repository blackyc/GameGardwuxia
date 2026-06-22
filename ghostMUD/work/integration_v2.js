// ============================================================
// Ghost MUD v2.0 · 卷宗集成桥接层
// 将7个 rebuild 文件的卷宗适配为引擎所需变量
// 2026-06-21 | 自动生成
// 运行前提：rebuild_*.js 已在 <script> 标签中先加载
// ============================================================

// ============================================================
// 1. 合并 ROOMS → LOCATIONS（并展开嵌套子房间）
// ============================================================
var LOCATIONS = {};

if (typeof CITY_ROOMS !== 'undefined') {
  var _cityKeys = Object.keys(CITY_ROOMS);
  for (var _ci = 0; _ci < _cityKeys.length; _ci++) {
    LOCATIONS[_cityKeys[_ci]] = CITY_ROOMS[_cityKeys[_ci]];
  }
}
if (typeof WILD_ROOMS !== 'undefined') {
  var _wildKeys = Object.keys(WILD_ROOMS);
  for (var _wi = 0; _wi < _wildKeys.length; _wi++) {
    LOCATIONS[_wildKeys[_wi]] = WILD_ROOMS[_wildKeys[_wi]];
  }
}
if (typeof DUNGEON_ROOMS !== 'undefined') {
  var _dungeonKeys = Object.keys(DUNGEON_ROOMS);
  for (var _di = 0; _di < _dungeonKeys.length; _di++) {
    LOCATIONS[_dungeonKeys[_di]] = DUNGEON_ROOMS[_dungeonKeys[_di]];
  }
}

// 从 observable.sub_rooms 展开嵌套子房间到 LOCATIONS 顶层
(function() {
  function _flattenSubRooms(roomsObj) {
    var roomNames = Object.keys(roomsObj);
    for (var i = 0; i < roomNames.length; i++) {
      var roomName = roomNames[i];
      var room = roomsObj[roomName];
      if (!room || !room.observable || !room.observable.sub_rooms) continue;
      var subs = room.observable.sub_rooms;
      for (var j = 0; j < subs.length; j++) {
        var sub = subs[j];
        var subName = sub.name;
        if (!LOCATIONS[subName]) {
          var subConnections = {};
          if (sub.exits) {
            var exitDirs = Object.keys(sub.exits);
            for (var k = 0; k < exitDirs.length; k++) {
              var d = exitDirs[k];
              subConnections[d] = sub.exits[d];
            }
          }
          // 建立父→子、子→父的双向连接
          var exitDir = sub.exits ? (Object.keys(sub.exits)[0] || '出') : '出';
          subConnections[exitDir] = roomName;
          // 对父房间也添加"入"方向的入口（不覆盖已有连接）
          if (LOCATIONS[roomName] && LOCATIONS[roomName].connections) {
            if (!LOCATIONS[roomName].connections['入']) {
              LOCATIONS[roomName].connections['入'] = subName;
            }
          }

          LOCATIONS[subName] = {
            desc: sub.desc || '',
            desc_awakened: sub.desc_awakened || '',
            connections: subConnections,
            danger: sub.danger || 1,
            events: sub.events || [],
            npcs: sub.npcs || [],
            items: sub.items || [],
            isSubRoom: true,
            parentRoom: roomName,
            prereq: sub.prereq || null
          };
        }
      }
    }
  }
  if (typeof CITY_ROOMS !== 'undefined') _flattenSubRooms(CITY_ROOMS);
  if (typeof WILD_ROOMS !== 'undefined') _flattenSubRooms(WILD_ROOMS);
})();

// ============================================================
// 2. ID→名称映射表
//    WILD_ROOMS 的 connections 使用 yt_* 内部 ID
//    子房间通过 observable.sub_rooms[].id 自动注册
// ============================================================
var _ID_MAP = {
  // 城门
  'yt_north_gate': '太平门',
  'yt_east_gate': '正阳门',
  'yt_south_gate': '聚宝门',
  'yt_west_gate': '石城门',

  // 应天府城区街道
  'yt_scholar_st': '成贤街',
  'yt_north_st': '北大街',
  'yt_south_st': '南大街',
  'yt_silk_st': '绫庄巷',
  'yt_west_st': '西大街',
  'yt_east_st': '东大街',

  // 鸡鸣寺
  'yt_jiming_gate': '鸡鸣寺·山门',
  'yt_jiming_court': '鸡鸣寺·外院',
  'yt_jiming_hall': '鸡鸣寺·大雄宝殿',
  'yt_jiming_bell': '鸡鸣寺·钟楼',
  'yt_jiming_tower': '鸡鸣寺·藏经阁',
  'yt_jiming_back': '鸡鸣寺·后山禅院',

  // 灵谷寺
  'yt_linggu_gate': '灵谷寺·无梁殿',
  'yt_linggu_pagoda': '灵谷寺·九层塔',

  // 朝天宫
  'yt_chaotian_gate': '朝天宫·棂星门',
  'yt_chaotian_sanqing': '朝天宫·三清殿',
  'yt_chaotian_alchemy': '朝天宫·炼丹房',
  'yt_chaotian_scripture': '朝天宫·经阁',

  // 天妃宫 / 静海寺
  'yt_tianfei': '天妃宫·正殿',
  'yt_jinghai': '静海寺·大殿',

  // 城隍庙 / 土地庙
  'yt_city_god': '城隍庙·正殿',
  'yt_land_god': '土地庙',

  // 栖霞道院 / 狐仙祠
  'yt_qixia_hermit': '栖霞道院·隐修洞',
  'yt_fox_shrine': '狐仙祠',

  // 铁剑庐 / 斗转茶舍
  'yt_iron_sword': '铁剑庐·兵器铺后堂',
  'yt_tea_house': '斗转茶舍·二楼'
};

// 从子房间的 id 字段自动提取映射
(function() {
  function _autoMap(roomsObj) {
    var names = Object.keys(roomsObj);
    for (var i = 0; i < names.length; i++) {
      var room = roomsObj[names[i]];
      if (room && room.observable && room.observable.sub_rooms) {
        var subs = room.observable.sub_rooms;
        for (var j = 0; j < subs.length; j++) {
          var sub = subs[j];
          if (sub.id && sub.name && !_ID_MAP[sub.id]) {
            _ID_MAP[sub.id] = sub.name;
          }
        }
      }
    }
  }
  if (typeof CITY_ROOMS !== 'undefined') _autoMap(CITY_ROOMS);
  if (typeof WILD_ROOMS !== 'undefined') _autoMap(WILD_ROOMS);
})();

// ============================================================
// 3. 郊区连接器房间（yt_suburb_* 虚拟中转点）
//    为 BFS 地图连通性提供完整的拓扑
// ============================================================
var _SUBURB_DESC = {
  '东郊': {
    desc: '听人说，这应天府东郊，驿道自此渐窄。路面从青石板过渡为夯土——也许是走的人多了，道旁散落着几间茶棚和歇脚的茅亭，看着都有些年头了。',
    desc_awakened: '应天府东郊，驿道至此渐窄，路面由青石板过渡为夯土。道旁散落着几间茶棚和歇脚的茅亭。'
  },
  '东北郊': {
    desc: '应天府东北郊——地势渐高，往北隐约能望见钟山的黛色轮廓。荒地间零星几座土坟，坟头草歪向同一方向，似乎是风吹的，也许是别的什么。',
    desc_awakened: '应天府东北郊，地势渐高，往北能望见钟山黛色轮廓。荒地间零星几座土坟，坟头草歪向同一方向——不是风吹的。'
  },
  '西北郊': {
    desc: '应天府西北郊，驿道穿过一片低矮的丘陵。路边有座废弃的砖窑，窑口黑漆漆地张着——打更人说，他曾在子时见过窑口里亮了一下，也许是看花了眼。',
    desc_awakened: '应天府西北郊，驿道穿过一片低矮的丘陵。路边有座废弃的砖窑，窑口黑漆漆地张着。'
  },
  '东南郊': {
    desc: '应天府东南郊，官道两侧是水田和桑林。远处秦淮河的反光时隐时现，空气里似乎飘着一股水腥气，也许是稻田里沤着的。',
    desc_awakened: '应天府东南郊，官道两侧是水田和桑林。远处秦淮河的反光时隐时现，空气里飘着水腥气。'
  },
  '西南郊': {
    desc: '应天府西南郊，路面渐趋泥泞。路边立着一块倒了一半的界碑——字迹已不可辨，谁知道上面原来写的什么。摸上去，石面似乎比寻常界碑凉了一截。',
    desc_awakened: '应天府西南郊，路面渐趋泥泞。路边立着一块倒了一半的界碑，字迹已不可辨——刻痕不是风雨磨掉的，是指甲刮花的。'
  },
  '北郊': {
    desc: '应天府北郊——官道在此分岔，一条往玄武湖，一条往幕府山。岔路口有棵枯死的榆树，但枝头挂着一根新绿的藤，也许是春天的事。老辈人讲，这棵榆树枯了十几年了，从没发过芽。',
    desc_awakened: '应天府北郊，官道在此分岔，一条往玄武湖，一条往幕府山。岔路口有棵枯死的榆树——枯了十几年了，但枝头挂着一根新绿的藤，不是从树干里长出来的。'
  },
  '南郊': {
    desc: '应天府南郊——大路往南延伸入雨花台方向的丘陵。路边有几家骡马店，招牌被风吹得啪啪响。往来商贩都避着走，据他们说，这附近天黑后不太安宁。',
    desc_awakened: '应天府南郊，大路往南延伸入雨花台方向的丘陵。路边有几家骡马店，招牌被风吹得啪啪响。'
  }
};
var _SUBURB_NAMES = Object.keys(_SUBURB_DESC);
for (var _si = 0; _si < _SUBURB_NAMES.length; _si++) {
  var _sn = _SUBURB_NAMES[_si];
  var _sd = _SUBURB_DESC[_sn];
  LOCATIONS[_sn] = {
    desc: _sd.desc,
    desc_awakened: _sd.desc_awakened,
    connections: {},
    danger: 1,
    events: [],
    npcs: [],
    items: [],
    isSuburb: true
  };
}

_ID_MAP['yt_suburb_e'] = '东郊';
_ID_MAP['yt_suburb_ne'] = '东北郊';
_ID_MAP['yt_suburb_nw'] = '西北郊';
_ID_MAP['yt_suburb_se'] = '东南郊';
_ID_MAP['yt_suburb_sw'] = '西南郊';
_ID_MAP['yt_suburb_n'] = '北郊';
_ID_MAP['yt_suburb_s'] = '南郊';

// ============================================================
// 4. 标准化所有房间的 connections（yt_* ID → 中文房间名）
// ============================================================
(function() {
  function _resolve(connVal) {
    if (!connVal) return null;
    if (LOCATIONS[connVal]) return connVal;
    if (_ID_MAP[connVal]) {
      var resolved = _ID_MAP[connVal];
      if (LOCATIONS[resolved]) return resolved;
    }
    return null;
  }

  var _locNames = Object.keys(LOCATIONS);
  // 第一轮：解析所有 connections
  for (var i = 0; i < _locNames.length; i++) {
    var roomName = _locNames[i];
    var room = LOCATIONS[roomName];
    if (!room || !room.connections) continue;
    var resolved = {};
    var connDirs = Object.keys(room.connections);
    for (var j = 0; j < connDirs.length; j++) {
      var dir = connDirs[j];
      var target = _resolve(room.connections[dir]);
      if (target && target !== roomName) {
        resolved[dir] = target;
      }
    }
    room.connections = resolved;
  }

  // 第二轮：建立反向连接（仅在目标还没有该方向连接时填充）
  var OPPOSITE = { '北': '南', '南': '北', '东': '西', '西': '东', '上': '下', '下': '上', '入': '出', '出': '入' };
  for (var i2 = 0; i2 < _locNames.length; i2++) {
    var rName = _locNames[i2];
    var r = LOCATIONS[rName];
    if (!r || !r.connections) continue;
    var rDirs = Object.keys(r.connections);
    for (var j2 = 0; j2 < rDirs.length; j2++) {
      var d = rDirs[j2];
      var t = r.connections[d];
      if (!t || t === rName || !LOCATIONS[t]) continue;
      // 跳过已经是双向连通的（suburb 已由另一侧建立完整双向）
      if (LOCATIONS[t].isSuburb) continue;
      var opp = OPPOSITE[d];
      // 只在不覆盖已存在的不同连接时填充反向连接
      if (opp && !LOCATIONS[t].connections[opp]) {
        LOCATIONS[t].connections[opp] = rName;
      }
    }
  }
})();

// ============================================================
// 5. BFS 生成 MAP_POS（支持跨 cluster 连接矫正）
// ============================================================
var MAP_POS = {};
var _visited = {};

(function() {
  var DIR_VEC = {
    '北': [0, 1], '南': [0, -1], '东': [1, 0], '西': [-1, 0],
    '上': [0, 0], '下': [0, 0], '入': [0, 0], '出': [0, 0]
  };

  function _bfs(startRoom) {
    if (_visited[startRoom]) return;
    var queue = [startRoom];
    _visited[startRoom] = true;
    MAP_POS[startRoom] = { x: 0, y: 0 };

    while (queue.length > 0) {
      var current = queue.shift();
      var curPos = MAP_POS[current];
      var room = LOCATIONS[current];
      if (!room || !room.connections) continue;

      var dirs = Object.keys(room.connections);
      for (var j = 0; j < dirs.length; j++) {
        var dir = dirs[j];
        var target = room.connections[dir];
        if (!target || !LOCATIONS[target]) continue;
        var vec = DIR_VEC[dir];
        if (!vec) continue;

        var targetPos;
        if (vec[0] === 0 && vec[1] === 0) {
          targetPos = { x: curPos.x, y: curPos.y };
        } else {
          targetPos = { x: curPos.x + vec[0], y: curPos.y + vec[1] };
        }

        // 如果目标已有坐标，检查是否需要重新定位当前房间
        if (_visited[target]) {
          // 当前房间尚未定位的情况（跨 cluster 对接）
          if (!_visited[current]) {
            MAP_POS[current] = { x: targetPos.x - (vec[0]||0), y: targetPos.y - (vec[1]||0) };
            _visited[current] = true;
          }
          continue;
        }

        MAP_POS[target] = targetPos;
        _visited[target] = true;
        queue.push(target);
      }
    }
  }

  // BFS 起点优先级
  var _starts = ['应天府·十字街口'];
  var _allNames = Object.keys(LOCATIONS);
  for (var i = 0; i < _allNames.length; i++) {
    if (_starts.indexOf(_allNames[i]) < 0 && !LOCATIONS[_allNames[i]].isSuburb) {
      _starts.push(_allNames[i]);
    }
  }
  for (var s = 0; s < _starts.length; s++) {
    if (LOCATIONS[_starts[s]]) _bfs(_starts[s]);
  }

  // 后处理：位置矫正
  // 对于连接到已定位房间的未对齐cluster，重新定位
  // 例如：鸡鸣寺·山门→南→成贤街，但成贤街已有city坐标，则鸡鸣寺·山门应在成贤街北方
  var _changed = true;
  var _maxIter = 10;
  while (_changed && _maxIter > 0) {
    _changed = false;
    _maxIter--;
    for (var ri = 0; ri < _allNames.length; ri++) {
      var rn = _allNames[ri];
      var room = LOCATIONS[rn];
      if (!room || !room.connections || !MAP_POS[rn]) continue;
      var dirs2 = Object.keys(room.connections);
      for (var dj = 0; dj < dirs2.length; dj++) {
        var d2 = dirs2[dj];
        var t2 = room.connections[d2];
        if (!t2 || !MAP_POS[t2]) continue;
        var vec2 = DIR_VEC[d2];
        if (!vec2 || (vec2[0] === 0 && vec2[1] === 0)) continue;
        // 计算当前房间相对目标的预期位置
        var expectedX = MAP_POS[t2].x - vec2[0];
        var expectedY = MAP_POS[t2].y - vec2[1];
        var dx = MAP_POS[rn].x - expectedX;
        var dy = MAP_POS[rn].y - expectedY;
        if (dx !== 0 || dy !== 0) {
          // 调整当前房间及其cluster
          _shiftCluster(rn, -dx, -dy, {});
          _changed = true;
          break;
        }
      }
      if (_changed) break;
    }
  }

  function _shiftCluster(root, dx, dy, seen) {
    if (seen[root]) return;
    seen[root] = true;
    if (MAP_POS[root]) {
      MAP_POS[root].x += dx;
      MAP_POS[root].y += dy;
    }
    var rr = LOCATIONS[root];
    if (!rr || !rr.connections) return;
    var ds = Object.keys(rr.connections);
    for (var k = 0; k < ds.length; k++) {
      var dd = ds[k];
      var tt = rr.connections[dd];
      if (tt && !seen[tt]) {
        _shiftCluster(tt, dx, dy, seen);
      }
    }
  }

  // Normalize 坐标
  var minX = Infinity, minY = Infinity;
  var _posNames = Object.keys(MAP_POS);
  for (var p = 0; p < _posNames.length; p++) {
    var pt = MAP_POS[_posNames[p]];
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
  }
  if (minX < Infinity) {
    for (var q = 0; q < _posNames.length; q++) {
      MAP_POS[_posNames[q]].x -= minX;
      MAP_POS[_posNames[q]].y -= minY;
    }
  }
})();

// ============================================================
// 6. 生成 MAP_CONN（去重连接对）
// ============================================================
var MAP_CONN = [];

(function() {
  var _seen = {};
  var _flatDirs = { '北': true, '南': true, '东': true, '西': true };
  var _locNames = Object.keys(LOCATIONS);

  for (var i = 0; i < _locNames.length; i++) {
    var roomName = _locNames[i];
    var room = LOCATIONS[roomName];
    if (!room || !room.connections) continue;
    var dirs = Object.keys(room.connections);
    for (var j = 0; j < dirs.length; j++) {
      var dir = dirs[j];
      if (!_flatDirs[dir]) continue;
      var target = room.connections[dir];
      if (!target || !LOCATIONS[target]) continue;
      var key = roomName < target ? roomName + ':::' + target : target + ':::' + roomName;
      if (!_seen[key]) {
        _seen[key] = true;
        MAP_CONN.push([roomName, target]);
      }
    }
  }
})();

// ============================================================
// 7. 生成 ROOM_SEARCH
// ============================================================
var ROOM_SEARCH = {};

(function() {
  function _searchChance(danger) {
    var dm = { 1: 0.4, 2: 0.45, 3: 0.5, 4: 0.55, 5: 0.6 };
    return dm[danger] || 0.4;
  }

  function _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 收集物品名
  var _itemPool = [];
  var _pillPool = [];
  if (typeof ITEMS !== 'undefined') {
    var _itemKeys = Object.keys(ITEMS);
    for (var ik = 0; ik < _itemKeys.length; ik++) {
      var it = ITEMS[_itemKeys[ik]];
      if (it && it.type === '丹药') {
        _pillPool.push(_itemKeys[ik]);
      } else if (it) {
        _itemPool.push(_itemKeys[ik]);
      }
    }
  }
  // 内置后备
  if (_itemPool.length === 0) _itemPool = ['孙猴糖人', '柳叶', '碎青石', '树根花生', '多页书'];
  if (_pillPool.length === 0) _pillPool = ['聚气散', '培元丹', '金创散', '回春丹', '护脉丹'];

  var _locNames = Object.keys(LOCATIONS);
  for (var i = 0; i < _locNames.length; i++) {
    var roomName = _locNames[i];
    var room = LOCATIONS[roomName];
    if (!room) continue;
    var danger = room.danger || 1;

    ROOM_SEARCH[roomName] = {
      searchChance: _searchChance(danger),
      results: []
    };

    var results = ROOM_SEARCH[roomName].results;

    // 金钱类
    var minGold = danger * 8 + _rand(0, 5);
    var maxGold = danger * 15 + _rand(10, 25);
    results.push({
      type: 'money',
      amount: minGold + '-' + maxGold,
      desc: '你在' + roomName + '翻找了一阵，从角落捡到' + maxGold + '枚铜钱。',
      chance: 0.35
    });

    // 物品类
    var ri = _itemPool[_rand(0, _itemPool.length - 1)];
    results.push({
      type: 'item',
      item: ri,
      desc: '你仔细搜寻，发现了【' + ri + '】。',
      chance: 0.13
    });

    // 丹药类
    var rp = _pillPool[_rand(0, _pillPool.length - 1)];
    results.push({
      type: 'heal',
      item: rp,
      desc: '你翻到一个旧布包，里面有一枚【' + rp + '】。',
      chance: 0.12
    });

    // 高危险区额外
    if (danger >= 4) {
      results.push({
        type: 'skillScroll',
        desc: '在一堆杂物中，你发现了一卷泛黄的兽皮，上面写着修炼心得。',
        chance: 0.03
      });
    }

    // 空手
    results.push({
      type: 'nothing',
      desc: '你翻找了一阵，什么也没找到。',
      chance: 0.12
    });

    // 归一化概率
    var total = 0;
    for (var r = 0; r < results.length; r++) total += results[r].chance;
    if (total > 0) {
      for (var r2 = 0; r2 < results.length; r2++) {
        results[r2].chance = Math.round(results[r2].chance / total * 100) / 100;
      }
    }
  }
})();

// ============================================================
// 8. 生成 NPC_ENCOUNTERS
// ============================================================
var NPC_ENCOUNTERS = {};

(function() {
  function _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function _pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // 引擎（ghost_mud_v2.html 的 triggerNPCEncounter/npcChoice）要求的 result 契约：
  //   { choice: <按钮文案>, log?: <台词>, effect?: <键:值>, reward?: <键:值> }
  // 本适配层原先生成的是旧式 { type, text }，这里做一次翻译，避免模态出现 undefined。
  function _extractGold(text) {
    var m = String(text).match(/(\d+)\s*文/);
    return m ? parseInt(m[1], 10) : 0;
  }
  function _toEngineResult(r) {
    var text = r.text || '';
    var choiceText, effect = null, reward = null;
    switch (r.type) {
      case 'heal':   choiceText = '🙏 求医问药'; effect = 'heal:30'; break;
      case 'buff':   choiceText = '🪔 求符问卜'; effect = 'daoxin:3'; break;
      case 'money':  choiceText = '🪙 讨些盘缠'; reward = 'gain_gold:' + (_extractGold(text) || 20); break;
      case 'item':   choiceText = '📦 索要物件'; reward = 'random_item:1'; break;
      case 'skill':  choiceText = '📖 求教武学'; reward = 'random_technique:1'; break;
      case 'info':
      default:       choiceText = '🗣 闲聊几句'; break;
    }
    return { choice: choiceText, log: text, effect: effect, reward: reward };
  }

  var _merchants = [
    { id: 'wandering_merchant', name: '游方货郎', desc: '一个背着大包袱的行商，沿路叫卖。' },
    { id: 'tea_seller', name: '茶贩老吴', desc: '挑着茶担的老人，走累了就找个阴凉处歇脚。' },
    { id: 'fortune_teller_wand', name: '算命瞎子', desc: '拄着竹杖的瞎眼算命，竹杖笃笃敲着路面。' },
    { id: 'begging_monk', name: '化缘僧', desc: '一个赤脚的托钵僧，沿路化缘。他手里的钵是裂的，但从不漏水。' },
    { id: 'street_performer', name: '耍猴人', desc: '牵着一只瘦猴的江湖艺人，猴子蹲在他肩上抓耳挠腮。' },
    { id: 'herb_picker', name: '采药人', desc: '背着竹篓的采药人，篓子里飘出混杂的草药味。' },
    { id: 'letter_writer', name: '代书先生', desc: '在路边摆张小桌为人代写书信的老秀才，墨盒里总有洗不净的旧墨渣。' }
  ];

  function _randomRoomName() {
    var keys = Object.keys(LOCATIONS);
    var filtered = [];
    for (var i = 0; i < keys.length; i++) {
      if (!LOCATIONS[keys[i]].isSuburb) filtered.push(keys[i]);
    }
    return _pick(filtered);
  }

  var _locNames = Object.keys(LOCATIONS);
  for (var i = 0; i < _locNames.length; i++) {
    var roomName = _locNames[i];
    var room = LOCATIONS[roomName];
    if (!room) continue;
    var encounters = [];

    if (room.npcs && room.npcs.length > 0) {
      for (var j = 0; j < room.npcs.length; j++) {
        var npc = room.npcs[j];
        if (!npc || !npc.name) continue;
        var results = [];
        var npcName = npc.name;

        if (npcName.indexOf('僧') >= 0 || npcName.indexOf('方丈') >= 0 || npcName.indexOf('比丘') >= 0) {
          results.push({ type: 'heal', text: npcName + '合十道："施主有缘，这粒丹药赠与施主。"获得【回春丹】。' });
          results.push({ type: 'info', text: npcName + '低诵佛号，压低声音道："施主若往' + _randomRoomName() + '去，切记不要回头。"' });
        } else if (npcName.indexOf('掌柜') >= 0 || npcName.indexOf('伙计') >= 0 || npcName.indexOf('货郎') >= 0 || npcName.indexOf('商') >= 0 || npcName.indexOf('贩') >= 0) {
          results.push({ type: 'item', text: npcName + '从担子里翻出一件东西塞给你。' });
          results.push({ type: 'money', text: npcName + '今日开张生意，给你便宜了几个铜板。获得' + _rand(10, 50) + '文钱。' });
        } else if (npcName.indexOf('兵') >= 0 || npcName.indexOf('守') >= 0) {
          results.push({ type: 'info', text: npcName + '四下张望后低声道："夜里别在' + _randomRoomName() + '附近转——不干净。"' });
          results.push({ type: 'item', text: npcName + '悄悄塞给你一件东西："防身用。"获得【金创散】。' });
        } else if (npcName.indexOf('书生') >= 0 || npcName.indexOf('秀才') >= 0 || npcName.indexOf('监生') >= 0) {
          results.push({ type: 'info', text: npcName + '合上书，一脸神秘："我最近读的书里，有一页每天写的东西都不一样……"' });
        } else if (npcName.indexOf('老') >= 0 || npcName.indexOf('叟') >= 0 || npcName.indexOf('妪') >= 0) {
          results.push({ type: 'buff', text: npcName + '在你手心画了个符，什么也没说就走了。你感觉灵觉清晰了几分。（道心+3，临时）' });
          results.push({ type: 'item', text: npcName + '从怀里掏出一件旧物塞给你，扭头便走。' });
        } else if (npcName.indexOf('乞丐') >= 0) {
          results.push({ type: 'info', text: npcName + '伸手道："给几个铜板，我告诉你一个秘密——关于' + _randomRoomName() + '的。"' });
        } else if (npcName.indexOf('道') >= 0 || npcName.indexOf('真人') >= 0) {
          results.push({ type: 'skill', text: npcName + '打量你一番："根基不错。贫道传你一手保命的本事。"' });
        } else {
          results.push({ type: 'info', text: npcName + '同你聊了几句，不经意间透露了些许消息。' });
          results.push({ type: 'money', text: npcName + '给了你一些盘缠。获得' + _rand(10, 40) + '文钱。' });
        }

        encounters.push({
          id: npc.id || ('npc_' + j),
          name: npcName,
          title: npcName,    // 引擎模态读 enc.title；与 name 并存以兼容旧引用
          desc: npc.desc || '',
          desc_awakened: npc.desc_awakened || '',
          trigger: '交谈',
          results: results.map(_toEngineResult)
        });
      }
    }

    // 无 npc 的房间：50% 概率生成随机游商/路人
    if (encounters.length === 0 && Math.random() < 0.5) {
      var m = _pick(_merchants);
      encounters.push({
        id: m.id + '_' + roomName.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '_'),
        name: m.name,
        title: m.name,
        desc: m.desc,
        trigger: '交谈',
        results: [
          { type: 'item', text: m.name + '叫住你："客官，看看这东西——"说着从包袱里翻出件物事来。' },
          { type: 'info', text: m.name + '压低声音，说了一些关于' + _randomRoomName() + '的传闻。' }
        ].map(_toEngineResult)
      });
    }

    if (encounters.length > 0) {
      NPC_ENCOUNTERS[roomName] = encounters;
    }
  }
})();

// ============================================================
// 9. 技能树桥接
// ============================================================
var FACTIONS = {};

if (typeof GHOST_SKILL_TREES_1 !== 'undefined') {
  var _f1Keys = Object.keys(GHOST_SKILL_TREES_1);
  for (var _fi = 0; _fi < _f1Keys.length; _fi++) {
    FACTIONS[_f1Keys[_fi]] = GHOST_SKILL_TREES_1[_f1Keys[_fi]];
  }
}
if (typeof GHOST_SKILL_TREES_2 !== 'undefined') {
  var _f2Keys = Object.keys(GHOST_SKILL_TREES_2);
  for (var _fj = 0; _fj < _f2Keys.length; _fj++) {
    if (!FACTIONS[_f2Keys[_fj]]) {
      FACTIONS[_f2Keys[_fj]] = GHOST_SKILL_TREES_2[_f2Keys[_fj]];
    }
  }
}

var ROGUE_SKILLS = FACTIONS['散修'];
if (ROGUE_SKILLS) {
  delete FACTIONS['散修'];
}

// ============================================================
// 10. QUESTS（最小任务集，15个）
//     location 使用 LOCATIONS 中的实际房间名
// ============================================================
var QUESTS = [
  {
    id: 'q001',
    name: '初识红尘',
    desc: '在应天府四处转转，熟悉这座城。一个游历之人，先从脚下开始。',
    stages: [
      { desc: '到醉仙楼打听消息', location: '醉仙楼', action: 'talk', target: '跑堂', reward: { exp: 20, money: 30 } },
      { desc: '前往秦淮河画舫码头探查', location: '秦淮河·画舫码头', action: 'arrive', reward: { exp: 50, money: 50 } }
    ]
  },
  {
    id: 'q002',
    name: '寺庙里的钟声',
    desc: '鸡鸣寺的钟声近来有些异样——有人说钟声里多了一声，多出来的那声不是从钟里传出的。',
    stages: [
      { desc: '前往鸡鸣寺山门', location: '鸡鸣寺·山门', action: 'arrive', reward: { exp: 30 } },
      { desc: '进入大雄宝殿参拜', location: '鸡鸣寺·大雄宝殿', action: 'arrive', reward: { exp: 40 } },
      { desc: '登上钟楼查看铜钟', location: '鸡鸣寺·钟楼', action: 'arrive', reward: { exp: 60, money: 40 } },
      { desc: '与撞钟僧交谈', location: '鸡鸣寺·钟楼', action: 'talk', target: '撞钟僧·叩音', reward: { exp: 80, item: '撞钟木槌' } }
    ]
  },
  {
    id: 'q003',
    name: '城门的秘密',
    desc: '正阳门的守兵最近夜不能寐——城门每到子时就响，但门外空无一人。',
    stages: [
      { desc: '到正阳门与城门守兵交谈', location: '正阳门', action: 'talk', target: '城门守兵王大', reward: { exp: 20 } },
      { desc: '夜间在正阳门守候', location: '正阳门', action: 'arrive', reward: { exp: 40 } },
      { desc: '将发现报告给应天府衙', location: '应天府衙·正堂', action: 'arrive', reward: { exp: 80, money: 100 } }
    ]
  },
  {
    id: 'q004',
    name: '书铺异闻',
    desc: '北大街书铺的旧书里，据说每一本都多了一页——那一页上写的东西，不是过去，也不是现在。',
    stages: [
      { desc: '到北大街书铺找老李', location: '北大街', action: 'talk', target: '书铺老李', reward: { exp: 20 } },
      { desc: '在书铺中找到那本"多页书"', location: '北大街', action: 'search', reward: { exp: 40, item: '多页书' } },
      { desc: '去国子监请教', location: '国子监·彝伦堂', action: 'arrive', reward: { exp: 50 } }
    ]
  },
  {
    id: 'q005',
    name: '秦淮夜渡',
    desc: '秦淮河夜晚的画舫里，据说有不是活人的乘客。河边的老船工说，有些乘客付的船钱，第二天会变成纸灰。',
    stages: [
      { desc: '到秦淮河北岸调查', location: '秦淮河·北岸', action: 'arrive', reward: { exp: 30 } },
      { desc: '前往画舫码头查看', location: '秦淮河·画舫码头', action: 'arrive', reward: { exp: 50 } },
      { desc: '渡河后前往南岸', location: '秦淮河·南岸', action: 'arrive', reward: { exp: 30 } },
      { desc: '前往秦淮渡口东埠', location: '秦淮渡口·东埠', action: 'arrive', reward: { exp: 60, money: 60 } }
    ]
  },
  {
    id: 'q006',
    name: '古井怪谈',
    desc: '古井巷的老井夜半会传出哭声——巷子里的住户说，那声音是从井底往上爬的。',
    stages: [
      { desc: '前往古井巷查看老井', location: '古井巷', action: 'arrive', reward: { exp: 25 } },
      { desc: '深夜在古井巷守候', location: '古井巷', action: 'arrive', reward: { exp: 70 } }
    ]
  },
  {
    id: 'q007',
    name: '乱葬岗之约',
    desc: '义庄看守说，每逢月圆，乱葬岗上会多出一座新坟——不是人埋的，是土自己拱起来的。',
    stages: [
      { desc: '前往义庄乱葬岗', location: '义庄·乱葬岗', action: 'arrive', reward: { exp: 50 } },
      { desc: '进入停尸房探查', location: '义庄·乱葬岗·停尸房内', action: 'arrive', reward: { exp: 80 } },
      { desc: '与义庄看守交谈', location: '义庄·乱葬岗', action: 'talk', target: '义庄看守', reward: { exp: 60, money: 50 } }
    ]
  },
  {
    id: 'q008',
    name: '无梁殿之谜',
    desc: '灵谷寺无梁殿的石佛——有人说祂在低头，而且每天低一分。住持说那只是光影错觉。但你不信。',
    stages: [
      { desc: '前往灵谷寺无梁殿', location: '灵谷寺·无梁殿', action: 'arrive', reward: { exp: 40 } },
      { desc: '与灵谷住持交谈', location: '灵谷寺·无梁殿', action: 'talk', target: '灵谷住持·印光', reward: { exp: 50 } },
      { desc: '攀登灵谷寺九层塔', location: '灵谷寺·九层塔', action: 'arrive', reward: { exp: 70 } }
    ]
  },
  {
    id: 'q009',
    name: '星陨异象',
    desc: '紫金山观星台附近夜半星落。观星老道说——落下来的不是星，陨石里面是空的。',
    stages: [
      { desc: '前往紫金山观星台废墟', location: '紫金山·观星台废墟', action: 'arrive', reward: { exp: 50 } },
      { desc: '调查陨星坑', location: '紫金山·观星台废墟·陨星坑', action: 'arrive', reward: { exp: 60 } },
      { desc: '与观星老道交谈', location: '紫金山·观星台废墟·陨星坑', action: 'talk', target: '观星老道', reward: { exp: 60, item: '星图石片' } }
    ]
  },
  {
    id: 'q010',
    name: '雨花玛瑙',
    desc: '雨花台的玛瑙石最近颜色越发鲜艳。捡石人刘五说石头在吃颜色——但颜色从哪来的？',
    stages: [
      { desc: '前往雨花台碎石坡', location: '雨花台·碎石坡', action: 'arrive', reward: { exp: 40 } },
      { desc: '与捡石人刘五交谈', location: '雨花台·碎石坡', action: 'talk', target: '捡石人·刘五', reward: { exp: 40 } },
      { desc: '找到一颗特异的雨花玛瑙', location: '雨花台·碎石坡', action: 'search', reward: { exp: 50, item: '雨花玛瑙' } }
    ]
  },
  {
    id: 'q011',
    name: '狐仙幻境',
    desc: '栖霞野林里有人说看见了狐仙——一只白狐在林间穿行，身后跟着一串不点自亮的灯笼。',
    stages: [
      { desc: '前往栖霞野林', location: '栖霞野林', action: 'arrive', reward: { exp: 50 } },
      { desc: '寻找狐仙幻境入口', location: '栖霞野林', action: 'search', reward: { exp: 60 } },
      { desc: '进入狐仙幻境', location: '栖霞野林·狐仙幻境', action: 'arrive', reward: { exp: 80, money: 120 } }
    ]
  },
  {
    id: 'q012',
    name: '鬼市交易',
    desc: '鬼市外的石牌坊后面有一条暗巷——巷子里卖的东西，不是给人用的。但有些人对那些东西很感兴趣。',
    stages: [
      { desc: '前往鬼市外石牌坊', location: '鬼市外·石牌坊', action: 'arrive', reward: { exp: 60 } },
      { desc: '找到暗门后巷', location: '鬼市外·石牌坊·暗门后巷', action: 'arrive', reward: { exp: 80 } }
    ]
  },
  {
    id: 'q013',
    name: '药铺寻药',
    desc: '回春堂的老大夫说，义庄附近有一种只在尸气滋养下生长的药引——尸苔花。需要有人敢去采。',
    stages: [
      { desc: '到回春堂药铺接任务', location: '回春堂药铺', action: 'arrive', reward: { exp: 20 } },
      { desc: '前往义庄乱葬岗寻找尸苔花', location: '义庄·乱葬岗', action: 'search', reward: { exp: 40 } },
      { desc: '将药引送回回春堂', location: '回春堂药铺', action: 'arrive', reward: { exp: 40, money: 150, item: '回春丹' } }
    ]
  },
  {
    id: 'q014',
    name: '铁剑封魔',
    desc: '牛首山古矿洞里插着一把铁剑，剑锷滚烫。矿工说那把剑插了三百年，最近在松动——剑底下压着的东西在往上顶。',
    stages: [
      { desc: '前往牛首山采茶径', location: '牛首山·采茶径', action: 'arrive', reward: { exp: 30 } },
      { desc: '进入古矿洞查看铁剑', location: '牛首山·采茶径·古矿洞', action: 'arrive', reward: { exp: 70 } }
    ]
  },
  {
    id: 'q015',
    name: '朝天秘丹',
    desc: '朝天宫的炼丹房近日丹火异动——炉中炼的不是丹，是一个被封在丹药里的人。丹药裂了一道缝。',
    stages: [
      { desc: '前往朝天宫棂星门', location: '朝天宫·棂星门', action: 'arrive', reward: { exp: 30 } },
      { desc: '进入朝天宫三清殿', location: '朝天宫·三清殿', action: 'arrive', reward: { exp: 40 } },
      { desc: '前往朝天宫炼丹房探查', location: '朝天宫·炼丹房', action: 'arrive', reward: { exp: 80, money: 100 } }
    ]
  }
];

// ============================================================
// ENEMIES / REALMS / ITEMS 直接来自 rebuild 文件
// 引擎会直接引用这些全局变量，无需重新定义
// ============================================================

// ============================================================
// 统计输出
// ============================================================
(function() {
  var locCount = Object.keys(LOCATIONS).length;
  var posCount = Object.keys(MAP_POS).length;
  var connCount = MAP_CONN.length;
  var searchCount = Object.keys(ROOM_SEARCH).length;
  var npcEncCount = Object.keys(NPC_ENCOUNTERS).length;
  var factionCount = Object.keys(FACTIONS).length;
  var rogueSkillCount = (ROGUE_SKILLS && ROGUE_SKILLS.skills) ? ROGUE_SKILLS.skills.length : 0;
  var questCount = QUESTS.length;

  function _pad(s, n) {
    while (s.length < n) s = ' ' + s;
    return s;
  }

  console.log('╔═══════════════════════════════════╗');
  console.log('║  Ghost MUD v2.0 集成桥接层报告   ║');
  console.log('╠═══════════════════════════════════╣');
  console.log('║ LOCATIONS     : ' + _pad(String(locCount), 5) + ' 间       ║');
  console.log('║ MAP_POS       : ' + _pad(String(posCount), 5) + ' 个坐标   ║');
  console.log('║ MAP_CONN      : ' + _pad(String(connCount), 5) + ' 条连接   ║');
  console.log('║ ROOM_SEARCH   : ' + _pad(String(searchCount), 5) + ' 间       ║');
  console.log('║ NPC_ENCOUNTERS: ' + _pad(String(npcEncCount), 5) + ' 间       ║');
  console.log('║ FACTIONS      : ' + _pad(String(factionCount), 5) + ' 个宗派   ║');
  console.log('║ ROGUE_SKILLS  : ' + _pad(String(rogueSkillCount), 5) + ' 个技能   ║');
  console.log('║ QUESTS        : ' + _pad(String(questCount), 5) + ' 个任务   ║');
  if (typeof ENEMIES !== 'undefined' && ENEMIES) {
    console.log('║ ENEMIES       : ' + _pad(String(Object.keys(ENEMIES).length), 5) + ' 种敌人   ║');
  }
  if (typeof REALMS !== 'undefined' && REALMS) {
    console.log('║ REALMS        : ' + _pad(String(REALMS.length), 5) + ' 重境界   ║');
  }
  if (typeof ITEMS !== 'undefined' && ITEMS) {
    console.log('║ ITEMS         : ' + _pad(String(Object.keys(ITEMS).length), 5) + ' 种物品   ║');
  }
  console.log('╚═══════════════════════════════════╝');
  console.log('Integration完成');
})();

// ============================================================
// 双描述系统：根据主角境界自动选择 desc / desc_awakened
// realm >= 2（筑基及以上）→ desc_awakened；否则 → desc
// ⚠️ 同时挂到 window 和 var，确保 HTML 内联脚本和 VM 沙箱均可访问
// ============================================================
var getDesc = window.getDesc = function(obj) {
  if (!obj) return '';
  if (window.game && window.game.state && window.game.state.realm >= 2 && obj.desc_awakened) {
    return obj.desc_awakened;
  }
  return obj.desc || '';
};
