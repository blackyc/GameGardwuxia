// ============================================================
// 聊斋仙途 · rooms_integrate.js
// 将 rooms_ghost_all.js 的22个宗派据点覆盖到 LOCATIONS
// 加载顺序：game_data.js → rooms_ghost_all.js → rooms_integrate.js
// 浏览器和 Node.js 双环境兼容
// ============================================================

(function() {
  'use strict';

  // 兼容双环境
  var _LOC = typeof LOCATIONS !== 'undefined' ? LOCATIONS : (typeof global !== 'undefined' && global.LOCATIONS ? global.LOCATIONS : null);
  var _GHOST = typeof GHOST_ALL_FACTION_ROOMS !== 'undefined' ? GHOST_ALL_FACTION_ROOMS : (typeof global !== 'undefined' && global.GHOST_ALL_FACTION_ROOMS ? global.GHOST_ALL_FACTION_ROOMS : {});

  if (!_LOC) { console.warn('[ghostMUD] LOCATIONS 未找到，跳过集成'); return; }

  var ROOM_NAME_MAP = {
    '梵网山': '忘尘峰', '紫霞量子观': '问剑峰·观星台', '剑巢暗网节点': '锈剑冢·地窟',
    '梵网寺': '忘尘宗·禅院', '紫霞山·万化炉': '问剑峰·丹房', '紫霞山': '问剑峰·丹房',
    '蚁网·盘丝窟': '织狱·盘丝窟', '蚁网·中枢节点': '汴河地下暗渠',
    '焰心教·密坛': '光明顶·焰心殿', '逍遥驿': '逍遥驿·车马院',
    '毒巢·炼毒坊': '鼓楼西·地下丹房', '血镰寺': '血禅寺', '血镰': '血禅寺',
    '斗转阁·水晶殿': '镜阁·万镜堂', '斗转阁': '镜阁·万镜堂',
    '影墓·深渊': '归墟洞', '影墓': '归墟洞',
    '药王谷·百草园': '青囊庐', '药王谷': '青囊庐',
    '机巧岛·天工坊': '傀坊·机关城', '机巧岛': '傀坊·机关城', '工部·旧遗址': '傀坊·工部遗址',
    '梵网寺后院': '忘尘峰', '紫霞丹房': '问剑峰·丹房', '剑巢·无名殿': '锈剑冢·地窟',
  };

  // Step 1: 注入所有 ghost 房间
  var ghostNames = Object.keys(_GHOST);
  for (var i = 0; i < ghostNames.length; i++) {
    _LOC[ghostNames[i]] = _GHOST[ghostNames[i]];
  }

  // Step 2: 迁移旧名→新名
  for (var oldN in ROOM_NAME_MAP) {
    var newN = ROOM_NAME_MAP[oldN];
    if (_LOC[oldN] && !_LOC[newN]) { _LOC[newN] = _LOC[oldN]; }
  }

  // Step 3: 更新所有 connections 引用
  var roomKeys = Object.keys(_LOC);
  for (var ri = 0; ri < roomKeys.length; ri++) {
    var room = _LOC[roomKeys[ri]];
    if (!room || !room.connections) continue;
    var dirs = Object.keys(room.connections);
    for (var di = 0; di < dirs.length; di++) {
      var target = room.connections[dirs[di]];
      if (ROOM_NAME_MAP[target]) { room.connections[dirs[di]] = ROOM_NAME_MAP[target]; }
    }
  }

  // Step 4: 删除旧名键
  for (var oldN2 in ROOM_NAME_MAP) {
    if (_LOC[oldN2] && ghostNames.indexOf(oldN2) === -1) { delete _LOC[oldN2]; }
  }

  // Step 5: 补占位
  var REV = { north:'south', south:'north', east:'west', west:'east', up:'down', down:'up' };
  for (var gi = 0; gi < ghostNames.length; gi++) {
    var gr = _GHOST[ghostNames[gi]];
    if (!gr || !gr.connections) continue;
    var gDirs = Object.keys(gr.connections);
    for (var gdi = 0; gdi < gDirs.length; gdi++) {
      var gt = gr.connections[gDirs[gdi]];
      if (!_LOC[gt]) {
        _LOC[gt] = { desc:'雾中隐约能辨出轮廓，但再往前便看不清了。', connections:{}, danger:1, events:['你走近了些——雾更浓了。除了自己的呼吸声，什么也听不见。'] };
        _LOC[gt].connections[REV[gDirs[gdi]] || 'south'] = ghostNames[gi];
      }
    }
  }

  console.log('[ghostMUD] 集成完成。宗派据点聊斋化：' + ghostNames.length + ' 房间。');

})();
