const fs = require('fs');
const c = fs.readFileSync('D:/MUD/rooms_expansion.js', 'utf8');

const targetRooms = [
  '光明顶纳米阵列', '剑巢暗网节点', '地坛回收站', '大相国寺暗网',
  '大雁塔离线圣地', '天坛改造营', '御街密钥黑市', '朱雀数据荒漠',
  '梵网山', '樊楼数据酒馆', '汴河数据暗渠', '玄武暗网港',
  '秦淮数据河', '紫禁城实验室', '紫霞量子观', '血镰谷',
  '金陵机器局旧地', '铁塔量子中继', '鸡鸣寺量子观', '鼓楼信号塔',
  '鼓楼西暗市',
  '午门', '奉天殿', '应天西门', '应天东门', '应天南门', '应天北门',
  '应天驿站', '应天暗巷', '长安西门', '长安驿站', '顺天驿站', '聚宝门',
  '逍遥驿车队', '开封驿站'
];

const results = {};
for (const name of targetRooms) {
  const key = "'" + name + "':{";
  const idx = c.indexOf(key);
  if (idx === -1) {
    results[name] = 'NOT_FOUND';
    continue;
  }
  let depth = 0;
  let end = idx;
  let inStr = false;
  for (let i = idx; i < c.length; i++) {
    const ch = c[i];
    if (ch === "'" && (i === 0 || c[i - 1] !== '\\')) inStr = !inStr;
    if (!inStr) {
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) { end = i + 1; break; }
      }
    }
  }
  results[name] = c.substring(idx, end);
}

fs.writeFileSync('D:/MUD/ghostMUD/work/extracted_rooms.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Extracted ' + Object.keys(results).length + ' rooms');
console.log('Not found: ' + Object.entries(results).filter(([k, v]) => v === 'NOT_FOUND').map(([k]) => k).join(', '));
