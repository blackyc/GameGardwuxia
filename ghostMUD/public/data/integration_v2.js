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
// 问剑峰门派HQ（T7.3）
if (typeof WENJIANFENG_ROOMS !== 'undefined') {
  var _wjfKeys = Object.keys(WENJIANFENG_ROOMS);
  for (var _wjfi = 0; _wjfi < _wjfKeys.length; _wjfi++) {
    LOCATIONS[_wjfKeys[_wjfi]] = WENJIANFENG_ROOMS[_wjfKeys[_wjfi]];
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
            name: subName,
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
  'yt_north_gate': '应天府·太平门',
  'yt_east_gate': '应天府·正阳门',
  'yt_south_gate': '应天府·聚宝门',
  'yt_west_gate': '应天府·石城门',

  // 应天府城区街道
  'yt_scholar_st': '应天府·成贤街',
  'yt_north_st': '应天府·北大街',
  'yt_south_st': '应天府·南大街',
  'yt_silk_st': '应天府·绫庄巷',
  'yt_west_st': '应天府·西大街',
  'yt_east_st': '应天府·东大街',

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
  '应天府·东郊': {
    desc: '听人说，这应天府东郊，驿道自此渐窄。路面从青石板过渡为夯土——也许是走的人多了，道旁散落着几间茶棚和歇脚的茅亭，看着都有些年头了。',
    desc_awakened: '应天府东郊，驿道至此渐窄，路面由青石板过渡为夯土。道旁散落着几间茶棚和歇脚的茅亭。'
  },
  '应天府·东北郊': {
    desc: '应天府东北郊——地势渐高，往北隐约能望见钟山的黛色轮廓。荒地间零星几座土坟，坟头草歪向同一方向，似乎是风吹的，也许是别的什么。',
    desc_awakened: '应天府东北郊，地势渐高，往北能望见钟山黛色轮廓。荒地间零星几座土坟，坟头草歪向同一方向——不是风吹的。'
  },
  '应天府·西北郊': {
    desc: '应天府西北郊，驿道穿过一片低矮的丘陵。路边有座废弃的砖窑，窑口黑漆漆地张着——打更人说，他曾在子时见过窑口里亮了一下，也许是看花了眼。',
    desc_awakened: '应天府西北郊，驿道穿过一片低矮的丘陵。路边有座废弃的砖窑，窑口黑漆漆地张着。'
  },
  '应天府·东南郊': {
    desc: '应天府东南郊，官道两侧是水田和桑林。远处秦淮河的反光时隐时现，空气里似乎飘着一股水腥气，也许是稻田里沤着的。',
    desc_awakened: '应天府东南郊，官道两侧是水田和桑林。远处秦淮河的反光时隐时现，空气里飘着水腥气。'
  },
  '应天府·西南郊': {
    desc: '应天府西南郊，路面渐趋泥泞。路边立着一块倒了一半的界碑——字迹已不可辨，谁知道上面原来写的什么。摸上去，石面似乎比寻常界碑凉了一截。',
    desc_awakened: '应天府西南郊，路面渐趋泥泞。路边立着一块倒了一半的界碑，字迹已不可辨——刻痕不是风雨磨掉的，是指甲刮花的。'
  },
  '应天府·北郊': {
    desc: '应天府北郊——官道在此分岔，一条往玄武湖，一条往幕府山。岔路口有棵枯死的榆树，但枝头挂着一根新绿的藤，也许是春天的事。老辈人讲，这棵榆树枯了十几年了，从没发过芽。',
    desc_awakened: '应天府北郊，官道在此分岔，一条往玄武湖，一条往幕府山。岔路口有棵枯死的榆树——枯了十几年了，但枝头挂着一根新绿的藤，不是从树干里长出来的。'
  },
  '应天府·南郊': {
    desc: '应天府南郊——大路往南延伸入雨花台方向的丘陵。路边有几家骡马店，招牌被风吹得啪啪响。往来商贩都避着走，据他们说，这附近天黑后不太安宁。',
    desc_awakened: '应天府南郊，大路往南延伸入雨花台方向的丘陵。路边有几家骡马店，招牌被风吹得啪啪响。'
  }
};
var _SUBURB_NAMES = Object.keys(_SUBURB_DESC);
for (var _si = 0; _si < _SUBURB_NAMES.length; _si++) {
  var _sn = _SUBURB_NAMES[_si];
  var _sd = _SUBURB_DESC[_sn];
  LOCATIONS[_sn] = {
    name: _sn,
    desc: _sd.desc,
    desc_awakened: _sd.desc_awakened,
    connections: {
      '东': '灵谷寺·无梁殿',
      '北': '栖霞道院·隐修洞',
      '西': '蒋山·古道',
      '南': '青龙山·野渡'
    },
    // 反向连接由 integration_v2.js 末尾的 _reverse_dirs 标记逻辑自动计算
    danger: 1,
    events: [],
    npcs: [],
    items: [],
    isSuburb: true
  };
}

_ID_MAP['yt_suburb_e'] = '应天府·东郊';
_ID_MAP['yt_suburb_ne'] = '应天府·东北郊';
_ID_MAP['yt_suburb_nw'] = '应天府·西北郊';
_ID_MAP['yt_suburb_se'] = '应天府·东南郊';
_ID_MAP['yt_suburb_sw'] = '应天府·西南郊';
_ID_MAP['yt_suburb_n'] = '应天府·北郊';
_ID_MAP['yt_suburb_s'] = '应天府·南郊';

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
  var OPPOSITE = { '北': '南', '南': '北', '东': '西', '西': '东', '上': '下', '下': '上', '入': '出', '出': '入', '内': '外', '外': '内', '深': '出', '回岸': '入' };
  for (var i2 = 0; i2 < _locNames.length; i2++) {
    var rName = _locNames[i2];
    var r = LOCATIONS[rName];
    if (!r || !r.connections) continue;
    var rDirs = Object.keys(r.connections);
    for (var j2 = 0; j2 < rDirs.length; j2++) {
      var d = rDirs[j2];
      var t = r.connections[d];
      if (!t || t === rName || !LOCATIONS[t]) continue;
      var opp = OPPOSITE[d];
      // 优先用反向方向；若已被占用则用 '回' 作为后备
      if (opp && !LOCATIONS[t].connections[opp]) {
        LOCATIONS[t].connections[opp] = rName;
      } else if (!LOCATIONS[t].connections['回']) {
        LOCATIONS[t].connections['回'] = rName;
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
// 7.5 ROOM_SEARCH v1数据注入——城市核心20间房间
//     从 v1 ghost_room_search.js 的搜索数据还原，
//     描述文本按聊斋志怪风格改写，保留v1掉落逻辑
// ============================================================
(function() {
  // v1→v2 房间名映射表（城市核心20间）
  var V1_SEARCH_OVERRIDE = {
    // 1. 应天府·十字街口 ← 应天暗巷
    '应天府·十字街口': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '你在老槐树根部的泥地里摸到几枚铜钱，上面沾着青苔——像是埋了许久的。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '石墩底下的缝里塞着一只旧布袋，打开一看，几块碎银子滚落掌心。', chance: 0.1 },
        { type: 'find_type', itemType: 'random', desc: '你在糖人担子后面的角落里翻到了一件被遗忘的物事。', chance: 0.12 },
        { type: 'nothing', desc: '十字街口人来人往，地上什么也没留下。你直起腰来，膝盖咔嚓响了一声。', chance: 1 }
      ]
    },
    // 2. 东大街 ← 应天东门
    '应天府·东大街': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '你在歪脖子柳树根下的石缝里捡到几枚铜钱，铜钱上有一层绿色的锈——柳树泌的。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '布庄门口的台阶缝里卡着一只旧荷包，里面有几块碎银子。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在街角的香炉底座旁翻到一枚灵石残片，还有微弱的灵气在其中流转。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '柳树下的泥土里埋着一块残破灵石，灵气几乎散尽，但入手仍有凉意。', chance: 0.2 },
        { type: 'find_type', itemType: 'equipment', desc: '你在瓦砾堆下翻出一件蒙尘的法器——不知是哪个行商遗落的，擦去灰尘尚可一用。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在街边的杂物堆里摸到了一件说不清是什么的东西。', chance: 0.12 },
        { type: 'nothing', desc: '东大街的石板被车马碾得光滑，什么也没藏住。你拍了拍手上的灰。', chance: 1 }
      ]
    },
    // 3. 西大街 ← 应天西门
    '应天府·西大街': {
      searchChance: 0.4,
      results: [
        { type: 'find_type', itemType: 'consumable', desc: '当铺门口的石阶下，你翻到一枚灵石残片——大概是哪个走投无路的人当掉后遗落的。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '更夫老孙的竹梆子底下，嵌着一块残破灵石。他大概不知道那是什么——只知道梆子敲起来声音不一样。', chance: 0.2 },
        { type: 'find_type', itemType: 'technique', desc: '你在米行后墙的砖缝里抽出一卷泛黄的纸——上面写着功法口诀，墨迹已经洇开，但尚可辨认。', chance: 0.15 },
        { type: 'sanity', amount: 10, desc: '西大街的老铺子有种沉静的气息，你站在檐下歇了歇脚，心神莫名安宁了几分。', chance: 0.3 },
        { type: 'find_type', itemType: 'equipment', desc: '你在当铺后巷的废料堆里翻出一件旧法器，虽然蒙了厚厚的灰，但灵光未灭。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在街角不起眼的杂物堆里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '西大街的石板凹凸不平，缝里只有积水。你甩了甩手。', chance: 1 }
      ]
    },
    // 4. 南大街 ← 应天南门
    '应天府·南大街': {
      searchChance: 0.4,
      results: [
        { type: 'find_type', itemType: 'consumable', desc: '梧桐树下，红衣小囡蹲过的地方，你捡到一枚灵石残片——她大概不知道这是什么。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '银楼门口的石阶缝里，卡着一块残破灵石。往来的人多，谁也没弯过腰。', chance: 0.2 },
        { type: 'find_type', itemType: 'technique', desc: '绸缎庄后墙的墙皮剥落处，露出一段刻在砖上的功法残篇——不知何人所刻，笔力倒是不弱。', chance: 0.15 },
        { type: 'sanity', amount: 10, desc: '南大街的梧桐树荫浓密，你站在树下歇了歇，树冠里传来极轻的沙沙声——不是风。心神却安定了。', chance: 0.3 },
        { type: 'find_type', itemType: 'consumable', desc: '你在梧桐树根旁的草丛里找到了几株药草——不是寻常草药，叶脉里有隐约的灵纹。', chance: 0.3 },
        { type: 'cultivation', amount: 10, desc: '南大街的灵力波动虽然微弱，但你盘膝坐了片刻，经络中竟有一丝暖意流转。', chance: 0.2 },
        { type: 'find_type', itemType: 'random', desc: '你在街边不起眼的角落里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '南大街宽阔整洁，没什么能藏的。你拍了拍膝盖。', chance: 1 }
      ]
    },
    // 5. 北大街 ← 应天北门
    '应天府·北大街': {
      searchChance: 0.4,
      results: [
        { type: 'find_type', itemType: 'consumable', desc: '书铺门口的石阶下，你翻到一枚灵石残片——大概是哪位赶考书生遗落的盘缠。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '文昌祠的石狮子底座旁，埋着一块残破灵石。石狮子缺了半张脸，但灵石的凉意倒是完好的。', chance: 0.2 },
        { type: 'find_type', itemType: 'consumable', desc: '你在笔墨店后头的草丛里找到了几株药草——墨臭味盖住了药香，但灵纹还在。', chance: 0.3 },
        { type: 'cultivation', amount: 10, desc: '北大街的坡道高处灵气略浓，你站了片刻，感觉经络微微发热。', chance: 0.2 },
        { type: 'find_type', itemType: 'random', desc: '你在书铺间的杂物堆里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '北大街的书铺里全是书，地上倒是干净。你拍了拍手。', chance: 1 }
      ]
    },
    // 6. 正阳门 ← 应天东门
    '应天府·正阳门': {
      searchChance: 0.45,
      results: [
        { type: 'money', amount: '5-30', desc: '城门洞里的石板缝中，你摸到几枚铜钱——穿堂风吹得它们冰凉。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '城门根下卡着一只旧布袋，里面有几块碎银子——不知是过路客遗落的，还是被谁故意藏的。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '城墙砖缝里，你抠出一枚灵石残片。城墙上的灵气流动极慢——这块残片大概是卡在缝里几十年了。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '城门基座的石料间，嵌着一块残破灵石。守门的兵士日日踩过，谁也没弯过腰。', chance: 0.2 },
        { type: 'find_type', itemType: 'equipment', desc: '你在城墙根的瓦砾堆里翻出一件蒙尘的法器——城墙上渗出的意识残余让它微微泛凉。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在城门洞的角落里摸到了点东西——穿堂风呼呼地灌。', chance: 0.12 },
        { type: 'nothing', desc: '城门洞里风大，什么也藏不住。你缩了缩脖子。', chance: 1 }
      ]
    },
    // 7. 石城门 ← 应天西门
    '应天府·石城门': {
      searchChance: 0.45,
      results: [
        { type: 'find_type', itemType: 'consumable', desc: '城门石阶下，你翻到一枚灵石残片——石头城的石头灵气比别处浓，残片中的灵力尚存。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '城墙根的碎石堆里，混着一块残破灵石——石城门的石头本就比别处古老。', chance: 0.2 },
        { type: 'find_type', itemType: 'technique', desc: '城门内侧的墙壁上，刻着一段功法残篇——笔画极细，像是用指甲刻的。墨迹早已消失，但刻痕还在。', chance: 0.15 },
        { type: 'sanity', amount: 10, desc: '石城门的石墙厚实沉静，你靠在墙上歇了歇，心神莫名安稳了几分。', chance: 0.3 },
        { type: 'find_type', itemType: 'equipment', desc: '你在城门根下的废料堆里翻出一件旧法器——石头城的灵气浸润日久，法器虽旧，底子尚在。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在城门角落的碎石堆里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '石城门的地面全是碎石，踩上去咯吱响。你什么也没找到。', chance: 1 }
      ]
    },
    // 8. 聚宝门 ← 聚宝门
    '应天府·聚宝门': {
      searchChance: 0.45,
      results: [
        { type: 'find_type', itemType: 'random', desc: '聚宝门的城砖缝里，你摸到了一件说不上来的物事——城门聚宝，什么都有可能。', chance: 0.12 },
        { type: 'nothing', desc: '聚宝门人来人往，守门的兵士盯了你一眼。你讪讪地直起身来。', chance: 1 }
      ]
    },
    // 9. 太平门 ← 应天北门
    '应天府·太平门': {
      searchChance: 0.45,
      results: [
        { type: 'find_type', itemType: 'consumable', desc: '城门外的驿道旁，你捡到一枚灵石残片——大概是北行修士遗落的。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '城门基座的石缝里，嵌着一块残破灵石。太平门的风大，灵石上的灵气快被吹散了。', chance: 0.2 },
        { type: 'find_type', itemType: 'consumable', desc: '城门外的草丛里，你找到了几株药草——北郊的荒地上灵气虽薄，但药草的灵纹倒清晰。', chance: 0.3 },
        { type: 'cultivation', amount: 10, desc: '太平门外地势开阔，你站在城门下吐纳片刻，经络微微发热。', chance: 0.2 },
        { type: 'find_type', itemType: 'random', desc: '你在城门根下的杂物堆里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '太平门外北风呼啸，什么也藏不住。你缩了缩手。', chance: 1 }
      ]
    },
    // 10. 钟楼街 ← 鼓楼
    '应天府·钟楼街': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '钟楼街的石板缝里，你捡到几枚铜钱——铜钱上沾着陈年的钟锈。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '街边的石墩底下，塞着一只旧布袋，里面有几块碎银子。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在钟楼基座的石阶下翻到一枚灵石残片——钟楼的铜钟日日震荡，灵石中的灵力反倒被震得更活跃了。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '街边的碎石堆里，混着一块残破灵石——大概是建钟楼时从石料里筛出来的。', chance: 0.2 },
        { type: 'find_type', itemType: 'equipment', desc: '你在钟楼后巷的废料堆里翻出一件蒙尘的法器——虽然破旧，但钟声日日洗濯，底子不差。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在街角不起眼的杂物堆里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '钟楼街的石板平整，没什么杂物。你拍了拍手。', chance: 1 }
      ]
    },
    // 11. 鼓楼街 ← 鼓楼
    '应天府·鼓楼街': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '鼓楼根下的石板缝里，你摸到几枚铜钱——铜钱上有鼓声震出来的裂纹。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '街边的石狮子背后，藏着一只旧布袋，里面有几块碎银子。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在鼓楼基座的台阶下翻到一枚灵石残片——鼓声日日轰鸣，灵石中的灵力被震得微微发烫。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '街边的石料堆里，混着一块残破灵石。鼓楼的石头比别处的沉——灵气也沉。', chance: 0.2 },
        { type: 'find_type', itemType: 'equipment', desc: '你在鼓楼后巷的瓦砾堆里翻出一件旧法器——鼓声震荡日久，法器的灵光反而更亮了。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在街角不起眼的角落里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '鼓楼街的更夫看了你一眼。你讪讪地直起身。', chance: 1 }
      ]
    },
    // 12. 醉仙楼 ← 樊楼
    '应天府·醉仙楼': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '你在醉仙楼后厨的泔水桶旁捡到几枚铜钱——大概是食客掏赏钱时掉落的。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '楼下的条桌缝里，卡着一只旧布袋——里面有几块碎银子，带着酒气。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在雅间的窗台上发现一枚灵石残片——大概是哪位修士酒醉后遗落的。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '楼梯板下的暗格里，藏着一块残破灵石——灵气微弱，但酒气浸透了它。', chance: 0.2 },
        { type: 'hp', amount: 15, desc: '跑堂的收拾桌子时塞给你一碟剩菜——味道一般，但聊胜于无。你吃了几口，身上暖和了些。', chance: 0.4 },
        { type: 'find_type', itemType: 'random', desc: '你在酒楼大堂的角落里摸到了点东西——跑堂的没好气地瞪了你一眼。', chance: 0.12 },
        { type: 'nothing', desc: '醉仙楼里人声鼎沸，地上全是瓜子壳和骨头。你什么有用的也没找到。', chance: 1 }
      ]
    },
    // 13. 聚宝当铺 ← 地坛旧货摊
    '应天府·聚宝当铺': {
      searchChance: 0.4,
      results: [
        { type: 'find_type', itemType: 'equipment', desc: '你在当铺的死当柜子后面，翻出一件蒙尘的法器——无人赎回的死当里，偶尔有好东西。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在当铺后院的杂物堆里摸到了点东西——大概是哪家败落人家当掉的破烂。', chance: 0.12 },
        { type: 'nothing', desc: '当铺伙计精明得很，好东西都在柜子里。你只能在前厅转了转，什么也没摸到。', chance: 1 }
      ]
    },
    // 14. 秦淮河·北岸 ← 秦淮河畔
    '秦淮河·北岸': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '秦淮河岸的石阶缝里，你摸到几枚铜钱——河水日日浸着，铜钱上长了一层绿苔。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '岸边的柳树根下，埋着一只旧布袋——里面有几块碎银子，大概是画舫客人酒醉后遗落的。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在河岸的旧香案下旁找到一枚灵石残片——秦淮河的水气养着它，灵力尚存。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '河滩的碎石堆里，混着一块残破灵石——秦淮河水日日冲刷，灵气虽淡，但凉意沁骨。', chance: 0.2 },
        { type: 'find_type', itemType: 'random', desc: '你在河岸的杂物堆里摸到了点东西——水腥气扑鼻。', chance: 0.12 },
        { type: 'nothing', desc: '秦淮河的水声哗哗地响，你站在岸边望了许久，什么也没找到。', chance: 1 }
      ]
    },
    // 15. 秦淮河·南岸 ← 秦淮河畔
    '秦淮河·南岸': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '南岸的青石台阶缝里，你捡到几枚铜钱——比北岸的多了一层油渍，大概是食摊客人掉的。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '岸边的废弃货箱底，藏着一只旧布袋——里面有几块碎银子。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在南岸的旧码头石柱旁找到一枚灵石残片——南岸比北岸安静，灵力保存得更好些。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '河滩的淤泥里，你挖出一块残破灵石——灵气几乎被河水冲散了，但入手仍有凉意。', chance: 0.2 },
        { type: 'find_type', itemType: 'random', desc: '你在南岸的杂物堆里摸到了点东西。', chance: 0.12 },
        { type: 'nothing', desc: '秦淮河南岸比北岸冷清，你转了一圈，什么也没找到。', chance: 1 }
      ]
    },
    // 16. 秦淮河·画舫码头 ← 秦淮河畔
    '秦淮河·画舫码头': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '码头的木板缝隙里，你抠出几枚铜钱——画舫上的客人掉落的，铜钱上有胭脂的香气。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '码头的石墩后面，塞着一只旧荷包——里面有几块碎银子，绣着鸳鸯的荷包已经褪了色。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在码头的系船石柱旁翻到一枚灵石残片——画舫上修士遗落的，灵力被河水浸得微微发寒。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '码头下的河泥里，埋着一块残破灵石——画舫的灯笼光映在水面上，灵石的灵光在水底一闪一闪。', chance: 0.2 },
        { type: 'find_type', itemType: 'random', desc: '你在码头的杂物堆里摸到了点东西——水腥气混着脂粉气。', chance: 0.12 },
        { type: 'nothing', desc: '码头的船工看了你一眼，你讪讪地直起身。河水哗哗地拍着木桩。', chance: 1 }
      ]
    },
    // 17. 秦淮河·东水关 ← 秦淮河畔
    '秦淮河·东水关': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '水关的石闸缝里，你摸到几枚铜钱——水流冲刷日久，铜钱的字迹已经磨平了。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '水关的废弃闸板下，藏着一只旧布袋——里面有几块碎银子。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在水关的石壁上摸到一枚灵石残片——嵌在闸壁里，大概是很久以前修建水关时混入的。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '水关下的河床碎石中，你捞到一块残破灵石——灵气被水流冲得只剩下一点凉意。', chance: 0.2 },
        { type: 'find_type', itemType: 'random', desc: '你在水关的角落里摸到了点东西——水流声哗哗地响。', chance: 0.12 },
        { type: 'nothing', desc: '东水关的水流太急，什么也存不住。你甩了甩手上的水。', chance: 1 }
      ]
    },
    // 18. 玄武湖·北岸 ← 玄武渡口
    '玄武湖·北岸': {
      searchChance: 0.4,
      results: [
        { type: 'find_type', itemType: 'consumable', desc: '你在湖岸的旧船墩旁翻到一枚灵石残片——玄武湖的水气滋养，灵力尚可。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '湖滩的碎石堆里，混着一块残破灵石——玄武湖底灵气暗流，灵石虽破，凉意犹在。', chance: 0.2 },
        { type: 'find_type', itemType: 'equipment', desc: '你在废弃的渡口凉亭废墟里翻出一件蒙尘的法器——大概是哪位修士游湖时遗落的，虽旧尚用。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在湖岸的芦苇丛里摸到了点东西——芦苇叶子割手。', chance: 0.12 },
        { type: 'nothing', desc: '玄武湖的风大，湖面上什么也没有。你站了片刻，衣角被吹得猎猎响。', chance: 1 }
      ]
    },
    // 19. 秦淮渡口·东埠 ← 玄武渡口
    '秦淮渡口·东埠': {
      searchChance: 0.4,
      results: [
        { type: 'find_type', itemType: 'consumable', desc: '渡口的石阶下，你翻到一枚灵石残片——摆渡的船工大概见过很多，但没人在意这种碎石头。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '渡口的缆绳石柱底座旁，嵌着一块残破灵石——船来船往，谁也没弯过腰。', chance: 0.2 },
        { type: 'find_type', itemType: 'equipment', desc: '你在渡口的废弃货箱堆里翻出一件蒙尘的法器——不知是哪船货里漏出来的。', chance: 0.18 },
        { type: 'find_type', itemType: 'random', desc: '你在渡口的杂物堆里摸到了点东西——满手都是河泥的腥气。', chance: 0.12 },
        { type: 'nothing', desc: '渡口人来人往，船工吆喝着开船。你什么也没找到。', chance: 1 }
      ]
    },
    // 20. 夫子庙 ← 樊楼
    '应天府·夫子庙': {
      searchChance: 0.4,
      results: [
        { type: 'money', amount: '5-30', desc: '夫子庙前的石阶上，你捡到几枚铜钱——大概是香客布施时掉落的。', chance: 0.35 },
        { type: 'money', amount: '10-50', desc: '庙侧的功德箱后面，塞着一只旧布袋——里面有几块碎银子，大概是有人还愿时遗落的。', chance: 0.1 },
        { type: 'find_type', itemType: 'consumable', desc: '你在供桌底下翻到一枚灵石残片——夫子庙的香火气浸透了它，灵力中混着一丝书卷气。', chance: 0.25 },
        { type: 'find_type', itemType: 'stone', desc: '庙后的碎石堆里，混着一块残破灵石——夫子庙的灵气虽淡，但灵石上的灵纹反而比别处的清晰。', chance: 0.2 },
        { type: 'hp', amount: 15, desc: '庙里的执事看你面善，递了一碗素面——味道寡淡，但吃了身上暖和了些。', chance: 0.4 },
        { type: 'find_type', itemType: 'random', desc: '你在夫子庙的角落里摸到了点东西——满手都是香灰。', chance: 0.12 },
        { type: 'nothing', desc: '夫子庙里香客众多，地上被打扫得干干净净。你什么也没找到。', chance: 1 }
      ]
    }
  };

  // 注入：用 v1 还原数据覆盖默认生成的 ROOM_SEARCH
  var _overrideKeys = Object.keys(V1_SEARCH_OVERRIDE);
  for (var _oi = 0; _oi < _overrideKeys.length; _oi++) {
    var _roomName = _overrideKeys[_oi];
    if (LOCATIONS[_roomName]) {
      ROOM_SEARCH[_roomName] = V1_SEARCH_OVERRIDE[_roomName];
    }
  }

  if (typeof console !== 'undefined' && console.log) {
    console.log('[ROOM_SEARCH v1注入] 已注入 ' + _overrideKeys.length + ' 间城市核心房间的搜索数据');
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
      { desc: '到醉仙楼打听消息', location: '应天府·醉仙楼', action: 'talk', target: '跑堂', reward: { exp: 20, money: 30 } },
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
      { desc: '到正阳门与城门守兵交谈', location: '应天府·正阳门', action: 'talk', target: '城门守兵王大', reward: { exp: 20 } },
      { desc: '夜间在正阳门守候', location: '应天府·正阳门', action: 'arrive', reward: { exp: 40 } },
      { desc: '将发现报告给应天府衙', location: '应天府衙·正堂', action: 'arrive', reward: { exp: 80, money: 100 } }
    ]
  },
  {
    id: 'q004',
    name: '书铺异闻',
    desc: '北大街书铺的旧书里，据说每一本都多了一页——那一页上写的东西，不是过去，也不是现在。',
    stages: [
      { desc: '到北大街书铺找老李', location: '应天府·北大街', action: 'talk', target: '书铺老李', reward: { exp: 20 } },
      { desc: '在书铺中找到那本"多页书"', location: '应天府·北大街', action: 'search', reward: { exp: 40, item: '多页书' } },
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
      { desc: '前往古井巷查看老井', location: '应天府·古井巷', action: 'arrive', reward: { exp: 25 } },
      { desc: '深夜在古井巷守候', location: '应天府·古井巷', action: 'arrive', reward: { exp: 70 } }
    ]
  },
  {
    id: 'q007',
    name: '乱葬岗之约',
    desc: '义庄看守说，每逢月圆，乱葬岗上会多出一座新坟——不是人埋的，是土自己拱起来的。',
    stages: [
      { desc: '前往义庄乱葬岗', location: '义庄·乱葬岗', action: 'arrive', reward: { exp: 50 } },
      { desc: '进入停尸房探查', location: '义庄·乱葬岗·停尸房内', action: 'arrive', reward: { exp: 80 } },
      { desc: '与义庄看守交谈', location: '义庄·乱葬岗·停尸房内', action: 'talk', target: '义庄看守', reward: { exp: 60, money: 50 } }
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
      { desc: '前往栖霞·野林', location: '栖霞·野林', action: 'arrive', reward: { exp: 50 } },
      { desc: '寻找狐仙幻境入口', location: '栖霞·野林', action: 'search', reward: { exp: 60 } },
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
      { desc: '到回春堂药铺接任务', location: '应天府·回春堂药铺', action: 'arrive', reward: { exp: 20 } },
      { desc: '前往义庄乱葬岗寻找尸苔花', location: '义庄·乱葬岗', action: 'search', reward: { exp: 40 } },
      { desc: '将药引送回回春堂', location: '应天府·回春堂药铺', action: 'arrive', reward: { exp: 40, money: 150, item: '回春丹' } }
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

// ============================================================
// 11. v1 NPC 遭遇数据注入（鼓楼西鬼市 + 鸡鸣寺区域）
//     从 ghost_npc_encounters.js 精选还原，聊斋志怪风格轻度改写
//     不修改原数据文件，运行时合并到 NPC_ENCOUNTERS
//     注入逻辑在独立文件 npc_inject_patch.js 中实现
//     本段仅作为标记——实际注入代码在 npc_inject_patch.js
// ============================================================
// 注：请在 integration_v2.js 之后加载 npc_inject_patch.js}

// === REVERSE CONNECTION MARKING (auto-generated) ===
// 标记双向连接中的反向通道，供 game.js 做条件封锁
// 用法: if (room._reverse_dirs && room._reverse_dirs.includes(dir)) { /* 检查道具等条件 */ }
(function() {
  var DIR_REVERSE = {
    '北': '南', '南': '北', '东': '西', '西': '东',
    '上': '下', '下': '上', '入': '出', '出': '入',
    '内': '外', '外': '内', '前': '回', '回': '前',
    '深': '出', '回岸': '入'
  };
  for (var roomKey in LOCATIONS) {
    var room = LOCATIONS[roomKey];
    if (!room.connections) continue;
    var reverseDirs = [];
    for (var dir in room.connections) {
      var target = room.connections[dir];
      var targetRoom = LOCATIONS[target];
      if (!targetRoom || !targetRoom.connections) continue;
      // Check if any connection in target points back to this room
      for (var tDir in targetRoom.connections) {
        if (targetRoom.connections[tDir] === roomKey) {
          // This direction is a reverse of targetRoom[tDir] → roomKey
          // Mark it as reverse
          reverseDirs.push(dir);
          break;
        }
      }
    }
    if (reverseDirs.length > 0) {
      room._reverse_dirs = reverseDirs;
    }
  }
})();

// === DATA MANIFEST REGISTRY (auto-generated, do not edit) ===
window.__DATA_REGISTRY = window.__DATA_REGISTRY || {};
try { if (typeof LOCATIONS !== 'undefined') window.__DATA_REGISTRY['LOCATIONS'] = LOCATIONS; } catch(e) { console.warn('[Registry] LOCATIONS not registered:', e.message); }
try { if (typeof MAP_POS !== 'undefined') window.__DATA_REGISTRY['MAP_POS'] = MAP_POS; } catch(e) { console.warn('[Registry] MAP_POS not registered:', e.message); }
try { if (typeof MAP_CONN !== 'undefined') window.__DATA_REGISTRY['MAP_CONN'] = MAP_CONN; } catch(e) { console.warn('[Registry] MAP_CONN not registered:', e.message); }
try { if (typeof ROOM_SEARCH !== 'undefined') window.__DATA_REGISTRY['ROOM_SEARCH'] = ROOM_SEARCH; } catch(e) { console.warn('[Registry] ROOM_SEARCH not registered:', e.message); }
try { if (typeof NPC_ENCOUNTERS !== 'undefined') window.__DATA_REGISTRY['NPC_ENCOUNTERS'] = NPC_ENCOUNTERS; } catch(e) { console.warn('[Registry] NPC_ENCOUNTERS not registered:', e.message); }
try { if (typeof FACTIONS !== 'undefined') window.__DATA_REGISTRY['FACTIONS'] = FACTIONS; } catch(e) { console.warn('[Registry] FACTIONS not registered:', e.message); }
try { if (typeof ROGUE_SKILLS !== 'undefined') window.__DATA_REGISTRY['ROGUE_SKILLS'] = ROGUE_SKILLS; } catch(e) { console.warn('[Registry] ROGUE_SKILLS not registered:', e.message); }
try { if (typeof QUESTS !== 'undefined') window.__DATA_REGISTRY['QUESTS'] = QUESTS; } catch(e) { console.warn('[Registry] QUESTS not registered:', e.message); }
try { if (typeof getDesc !== 'undefined') window.__DATA_REGISTRY['getDesc'] = getDesc; } catch(e) { console.warn('[Registry] getDesc not registered:', e.message); }
