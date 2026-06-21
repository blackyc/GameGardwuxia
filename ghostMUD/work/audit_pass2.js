const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/work/ghost_npc_transformed.js', 'utf8');

// Extra edge case checks
const checks = ['机器', '机械', '计算机', '数码', '数据', '网络', '暗网', '终端', '屏幕', '键盘', '程序', '算法', '系统', '电子', '信号', '频率', '电池', '充电', '公司', '企业', '实验室', '研究所', '纳米', '基因', '克隆', '病毒', '防火墙', '服务器', '数据库', '下载', '上传', '备份', '记录', '芯片', '黑客', '天线', '雷达', '电路', '波段', '扫描'];

console.log('=== EXTRA EDGE CASE SCAN ===');
checks.forEach(t => {
  const regex = new RegExp(t, 'g');
  const matches = c.match(regex);
  if (matches && matches.length > 0) {
    // Show context
    const idx = c.indexOf(t);
    const ctx = c.substring(Math.max(0,idx-30), Math.min(c.length,idx+50)).replace(/\n/g,'\\n');
    console.log('FOUND: "' + t + '" x' + matches.length + ' | context: ...' + ctx.substring(0,100) + '...');
  }
});

// Check for room name issues
console.log('\n=== ROOM NAME SPOT CHECK ===');
const roomNames = [
  '秦淮灵河', '鼓楼望气塔', '樊楼灵酒馆', '忘尘宗', '赤霞峰', '锈剑冢', '丝狱', 
  '焚身道', '逍遥驿', '药王谷', '血禅寺', '镜阁', '归墟', '青囊庐', '傀坊'
];
roomNames.forEach(name => {
  const count = (c.match(new RegExp(name, 'g')) || []).length;
  if (count > 0) console.log(name + ': ' + count + ' occurrences');
  else console.log(name + ': NOT FOUND');
});

// Check original gang names are gone
console.log('\n=== OLD GANG NAME CHECK ===');
['梵网寺', '紫霞山', '剑巢', '蚁网', '焰心教', '毒巢', '血镰', '斗转阁', '影墓', '机巧岛'].forEach(name => {
  const count = (c.match(new RegExp(name, 'g')) || []).length;
  if (count > 0) console.log('WARNING: ' + name + ' still present x' + count);
  else console.log(name + ': CLEAN');
});

// Check for term replacements
console.log('\n=== TERM REPLACEMENT CHECK ===');
[['HP', '气血'], ['精神', '道心'], ['修为值', '修为'], ['武器', '法器'], ['黑客', '符修'], ['佣兵', '游方修士'], ['商人', '行商']].forEach(([old,nu]) => {
  const oldCount = (c.match(new RegExp(old, 'g')) || []).length;
  if (oldCount > 0) console.log('WARNING: "' + old + '" still present x' + oldCount + ' (should be ' + nu + ')');
  else console.log(old + ' → ' + nu + ': CLEAN');
});

console.log('\n=== DONE ===');
