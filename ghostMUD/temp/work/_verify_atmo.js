const fs = require('fs');
const text = fs.readFileSync('D:/MUD/ghostMUD/work/rebuild_atmosphere.js', 'utf8');
const forbidden = ['电脑','芯片','终端','服务器','系统','程序','接口','数据','信号','扫描',
  '电路','算法','神经网络','天网','数据流','量子','节点','防火墙','数据库','代码','屏幕',
  '键盘','鼠标','电池','充电','频率','波段','扫描仪','纳米','基因','分子',
  '赛博','朋克','义体','植入体','网络','骇客','黑客','矩阵',
  '契约','合同','利息','文档','报告','档案','问卷','表格',
  '这儿','那儿','这么','那么','非常','十分','极其','显然','当然',
  '不禁','忍不住','不由得','下意识地','不由自主地',
  '空气中弥漫着','与此同时','另一边','时间来到了','不知为何','似乎在说','好像在说'];
let found = [];
forbidden.forEach(w => { let c = (text.match(new RegExp(w, 'g')) || []).length; if (c>0) found.push(w+' x'+c); });
if (found.length) console.log('FORBIDDEN:\n' + found.join('\n'));
else console.log('PASS: Zero forbidden words');
// also count items
const items = require('D:/MUD/ghostMUD/work/rebuild_atmosphere.js');
const keys = Object.keys(items).filter(k => items[k].type === '场景物品');
console.log('Item count:', keys.length);
// check all desc have 1+1 (at least one comma)
let issues = [];
keys.forEach(k => {
  const d = items[k].desc;
  if (!d.includes('。') || d.length < 20) issues.push(k + ': desc too short or missing period');
});
if (issues.length) console.log('DESC ISSUES:\n' + issues.join('\n'));
else console.log('PASS: All desc look valid');
