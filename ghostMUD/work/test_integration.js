var fs = require('fs');

function loadGlobals(path) {
  var code = fs.readFileSync(path, 'utf8');
  // 在 Node.js 中，const 声明在 eval 中不创建全局变量
  // 将 const 替换为 var 以模拟浏览器的全局作用域
  code = code.replace(/^const /gm, 'var ');
  // 移除 module.exports 行（浏览器中不存在 module）
  code = code.replace(/^module\.exports\s*=.*;?\s*$/gm, '');
  (0, eval)(code);
}

try {
  console.log('Loading enemies...');
  loadGlobals('D:/MUD/ghostMUD/work/rebuild_enemies_items_realms.js');
  console.log('  ENEMIES: ' + Object.keys(ENEMIES || {}).length);

  console.log('Loading city rooms...');
  loadGlobals('D:/MUD/ghostMUD/work/rebuild_rooms_city.js');
  console.log('  CITY_ROOMS: ' + Object.keys(CITY_ROOMS || {}).length);

  console.log('Loading wild rooms...');
  loadGlobals('D:/MUD/ghostMUD/work/rebuild_rooms_wild.js');
  console.log('  WILD_ROOMS: ' + Object.keys(WILD_ROOMS || {}).length);

  console.log('Loading dungeon rooms...');
  loadGlobals('D:/MUD/ghostMUD/work/rebuild_dungeon_rooms.js');
  console.log('  DUNGEON_ROOMS: ' + Object.keys(DUNGEON_ROOMS || {}).length);

  console.log('Loading skills 1...');
  loadGlobals('D:/MUD/ghostMUD/work/rebuild_skill_descriptions_1.js');
  console.log('  ST1: ' + Object.keys(GHOST_SKILL_TREES_1 || {}).length);

  console.log('Loading skills 2...');
  loadGlobals('D:/MUD/ghostMUD/work/rebuild_skill_descriptions_2.js');
  console.log('  ST2: ' + Object.keys(GHOST_SKILL_TREES_2 || {}).length);

  console.log('Loading atmosphere...');
  loadGlobals('D:/MUD/ghostMUD/work/rebuild_atmosphere.js');

  console.log('Running integration_v2.js...');
  var intCode = fs.readFileSync('D:/MUD/ghostMUD/work/integration_v2.js', 'utf8');
  (0, eval)(intCode);

  console.log('\n=== RESULTS ===');
  console.log('LOCATIONS     : ' + Object.keys(LOCATIONS).length);
  console.log('MAP_POS       : ' + Object.keys(MAP_POS).length);
  console.log('MAP_CONN      : ' + MAP_CONN.length);
  console.log('ROOM_SEARCH   : ' + Object.keys(ROOM_SEARCH).length);
  console.log('NPC_ENCOUNTERS: ' + Object.keys(NPC_ENCOUNTERS).length);
  console.log('FACTIONS      : ' + Object.keys(FACTIONS).length);
  console.log('ROGUE_SKILLS  : ' + (ROGUE_SKILLS && ROGUE_SKILLS.skills ? ROGUE_SKILLS.skills.length : 0));
  console.log('QUESTS        : ' + QUESTS.length);

  // Sample rooms
  var samples = ['应天府·十字街口', '北大街', '鸡鸣寺·山门', '东郊', '紫金山·观星台废墟', '义庄·乱葬岗·停尸房内'];
  for (var i = 0; i < samples.length; i++) {
    var r = samples[i];
    var mp = MAP_POS[r];
    console.log(r + ': MAP_POS=' + (mp ? '(' + mp.x + ',' + mp.y + ')' : 'MISSING') + ' conn=' + JSON.stringify(LOCATIONS[r] ? LOCATIONS[r].connections : null));
  }

  var out = 'LOCATIONS: ' + Object.keys(LOCATIONS).length + '\n';
  out += 'MAP_POS: ' + Object.keys(MAP_POS).length + '\n';
  out += 'MAP_CONN: ' + MAP_CONN.length + '\n';
  out += 'ROOM_SEARCH: ' + Object.keys(ROOM_SEARCH).length + '\n';
  out += 'NPC_ENCOUNTERS: ' + Object.keys(NPC_ENCOUNTERS).length + '\n';
  out += 'FACTIONS: ' + Object.keys(FACTIONS).length + '\n';
  out += 'ROGUE_SKILLS: ' + (ROGUE_SKILLS ? ROGUE_SKILLS.skills.length : 0) + '\n';
  out += 'QUESTS: ' + QUESTS.length + '\n';
  fs.writeFileSync('D:/MUD/ghostMUD/work/integration_test_result.txt', out);

} catch(e) {
  console.log('ERROR: ' + e.message);
  console.log(e.stack);
}
