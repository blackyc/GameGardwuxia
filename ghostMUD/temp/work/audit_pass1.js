const fs = require('fs');
const c = fs.readFileSync('D:/MUD/ghostMUD/work/ghost_npc_transformed.js', 'utf8');

// Check for remaining forbidden terms
const forbidden = [
  '电路', '芯片', '算法', '神经接口', '天网', '数据流', '量子', '节点', '防火墙',
  '服务器', '数据库', '下载', '上传', '安装', '操作系统', '程序', '代码', '终端',
  '屏幕', '键盘', '鼠标', '电池', '充电', '信号', '频率', '波段', '扫描仪',
  '纳米', '基因', '分子', '细胞', '染色体', '克隆', '突变',
  '公司', '企业', '股份', '银行', '贷款', '保险',
  '实验室', '研究所', '项目', '方案', '报告', '记录'
];

const aiTerms = ['不禁', '不由得', '下意识地', '不由自主地', '空气中弥漫着', '他感到', '她感到', '与此同时', '另一边', '温柔地', '轻轻地', '深深地'];

console.log('=== FORBIDDEN TERM SCAN ===');
forbidden.forEach(t => {
  const count = (c.match(new RegExp(t, 'g')) || []).length;
  if (count > 0) console.log('FOUND: "' + t + '" x' + count);
});

console.log('\n=== AI-FLAVOR TERM SCAN ===');
aiTerms.forEach(t => {
  const count = (c.match(new RegExp(t, 'g')) || []).length;
  if (count > 0) console.log('FOUND: "' + t + '" x' + count);
});

// Check for remaining 义体
const yitiCount = (c.match(/义体/g) || []).length;
if (yitiCount > 0) console.log('\nREMAINING 义体: ' + yitiCount);

// Check for remaining 数据
const shujuCount = (c.match(/数据/g) || []).length;
if (shujuCount > 0) console.log('REMAINING 数据: ' + shujuCount);

// Check for remaining 网络
const wangluoCount = (c.match(/网络/g) || []).length;
if (wangluoCount > 0) console.log('REMAINING 网络: ' + wangluoCount);

// Check for remaining 暗网
const anwangCount = (c.match(/暗网/g) || []).length;
if (anwangCount > 0) console.log('REMAINING 暗网: ' + anwangCount);

// Check for 赛博
const cyberCount = (c.match(/赛博/g) || []).length;
if (cyberCount > 0) console.log('REMAINING 赛博: ' + cyberCount);

// Check for 终端
const zhongduanCount = (c.match(/终端/g) || []).length;
if (zhongduanCount > 0) console.log('REMAINING 终端: ' + zhongduanCount);

// Check for 芯片
const xinpianCount = (c.match(/芯片/g) || []).length;
if (xinpianCount > 0) console.log('REMAINING 芯片: ' + xinpianCount);

// Check for 黑客
const heikeCount = (c.match(/黑客/g) || []).length;
if (heikeCount > 0) console.log('REMAINING 黑客: ' + heikeCount);

// Check for 天网
const tianwangCount = (c.match(/天网/g) || []).length;
if (tianwangCount > 0) console.log('REMAINING 天网: ' + tianwangCount);

console.log('\n=== DONE ===');
