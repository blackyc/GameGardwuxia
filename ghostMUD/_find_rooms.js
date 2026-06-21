const fs = require('fs');
const gameData = fs.readFileSync('D:/MUD/game_data.js', 'utf8');

// All possible old room names to search for
const oldNames = [
  '梵网山', '梵网寺', '梵网寺·禅院',
  '紫霞量子观', '紫霞山', '紫霞山·丹房',
  '剑巢', '剑巢暗网节点',
  '蚁网', '蚁网盘丝窟', '蚁网·暗渠',
  '光明顶', '焰心教', '焰心殿',
  '逍遥驿',
  '毒巢', '毒巢·地下丹房', '鼓楼西',
  '血镰', '血禅寺',
  '斗转阁', '镜阁',
  '影墓', '归墟', '归墟洞', '大明宫', '大明宫废墟',
  '药王谷', '青囊庐',
  '机巧岛', '机巧岛·机关城', '工部遗址',
  '樊楼', '樊楼后院', '御街古井',
  '紫禁城', '紫禁城旧药房',
  '暗湖渡口',
];

console.log('=== game_data.js 中存在的旧房间名 ===');
oldNames.forEach(name => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp("'" + escaped + "'", 'g');
  const matches = gameData.match(re);
  if (matches) {
    console.log(`  '${name}': ${matches.length} 次引用`);
  } else {
    console.log(`  '${name}': 不存在`);
  }
});
