// _scan_terms.js — 扫描重建文件中武学 vs 修真术语频率
var fs = require('fs');
var dir = 'D:\\MUD\\ghostMUD\\work\\';
var files = ['rebuild_rooms_city.js','rebuild_rooms_wild.js','rebuild_rooms_dungeon.js',
  'rebuild_enemies_items_realms.js','rebuild_skill_descriptions_1.js','rebuild_skill_descriptions_2.js',
  'integration_v2.js'];
var total = '';
files.forEach(function(f){
  var path = dir + f;
  if (fs.existsSync(path)) total += fs.readFileSync(path, 'utf8');
});

var wuxue = ['剑法','刀法','拳法','掌法','内功','轻功','真气','内力','经脉','穴位','招式','外功','武功','功法'];
var xiuzhen = ['筑基','金丹','元婴','化神','灵气','灵脉','神识','元神','天道','渡劫','飞升','仙元','修仙','修真','法器','法宝','符箓','丹药'];

console.log('=== 武学侧 ===');
wuxue.forEach(function(w){ console.log('  ' + w + ': ' + (total.split(w).length-1)); });
console.log('=== 修真侧 ===');
xiuzhen.forEach(function(w){ console.log('  ' + w + ': ' + (total.split(w).length-1)); });

// 灵石 vs 金银
console.log('=== 货币 ===');
['灵石','银子','银两','铜钱','金币','银币'].forEach(function(w){
  console.log('  ' + w + ': ' + (total.split(w).length-1));
});

// 境界命名来源
console.log('=== 境界 ===');
console.log('  REALMS names:');
var realmMatch = total.match(/REALMS\s*=\s*\[[\s\S]*?\]/);
if (realmMatch) console.log(realmMatch[0].substring(0, 500));
