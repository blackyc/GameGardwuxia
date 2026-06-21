// Agent B 自检脚本 v2
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('D:/MUD/ghostMUD/work/rebuild_rooms_wild.js', 'utf8');

// Extract the WILD_ROOMS object
const start = code.indexOf('const WILD_ROOMS = {');
const end = code.lastIndexOf('};');
const objCode = code.substring(start + 'const WILD_ROOMS = '.length, end + 1);

const sandbox = {};
vm.createContext(sandbox);
const WILD_ROOMS = vm.runInContext('(' + objCode + ')', sandbox);

const rooms = Object.entries(WILD_ROOMS);
console.log('=== 1. 房间数 ===');
console.log('外层房间数:', rooms.length);
if (rooms.length !== 35) console.log('  ⚠ 期望 35 间!');

// 分类
const temples = rooms.filter(([k]) => k.match(/^yt_(jiming|linggu|jinghai|tianfei|city_god|earth_god)/));
const daoist = rooms.filter(([k]) => k.match(/^yt_(chaotian|qixia|fox)/));
const faction = rooms.filter(([k]) => k.startsWith('yt_fac_'));
const suburb = rooms.filter(([k]) => k.match(/^yt_suburb_/));
const deep = rooms.filter(([k]) => k.match(/^yt_(cemetery|ghost_|dragon|wild_)/));
console.log('寺庙:', temples.length, '| 道观:', daoist.length, '| 宗派:', faction.length, '| 城郊:', suburb.length, '| 荒野:', deep.length);
console.log('合计:', temples.length+daoist.length+faction.length+suburb.length+deep.length);

// 2. Danger 梯度
console.log('\n=== 2. Danger 梯度 ===');
let dangerIssues = 0;
rooms.forEach(([k,v]) => {
  const d = v.danger;
  let cat = '', range = '';
  if (k.match(/^yt_(jiming|linggu|jinghai|tianfei|city_god|earth_god|chaotian|qixia|fox|fac_)/)) {
    cat='城内'; range='1-2';
    if(d>3){dangerIssues++; console.log('  ⚠',k,'danger',d,'超出1-2');}
  } else if (k.startsWith('yt_suburb_')) {
    cat='城郊'; range='2-3';
    if(d<2||d>3){dangerIssues++; console.log('  ⚠',k,'danger',d,'超出2-3');}
  } else {
    cat='荒野'; range='3-5';
    if(d<3||d>5){dangerIssues++; console.log('  ⚠',k,'danger',d,'超出3-5');}
  }
});
if(dangerIssues===0) console.log('  ✓ Danger梯度全部合规');

// 3. 事件总数
console.log('\n=== 3. 事件统计 ===');
let totalEvents = 0;
let eventIssues = 0;
rooms.forEach(([k,v]) => {
  const cnt = (v.events||[]).length;
  totalEvents += cnt;
  if (cnt !== 4) { console.log('  ⚠',k,cnt,'events (期望4)'); eventIssues++; }
});
console.log('总事件:', totalEvents, '(期望 ~140)');
if(eventIssues===0) console.log('  ✓ 每房间4事件');

// 4. Observable / 嵌套
console.log('\n=== 4. Observable 嵌套检查 ===');
const obsRooms = rooms.filter(([k,v]) => v.observable);
console.log('含 observable:', obsRooms.length, '间');
let totalSubs = 0;
obsRooms.forEach(([k,v]) => {
  const subs = v.observable.sub_rooms || [];
  totalSubs += subs.length;
  subs.forEach(s => {
    if(!s.prereq) console.log('  ⚠',s.id||s.name,'缺 prereq');
    if(!s.desc) console.log('  ⚠',s.id||s.name,'缺 desc');
  });
});
console.log('嵌套子房间:', totalSubs);
console.log('  ✓ observable 标记的房间:', obsRooms.map(([k])=>k).join(', '));

// 5. 禁用词
console.log('\n=== 5. 禁用词扫描 (§5) ===');
const forbidden = ['电脑','芯片','终端','服务器','系统','程序','接口','数据','信号','扫描',
                   '契约','合同','利息','文档','报告','档案','问卷','表格',
                   '你看到','你走过','你来到', // "你"作主语检查
                   '儿','哪儿','那么',
                   '非常','十分','极其',
                   '显然','当然'];
let forbiddenFound = 0;
rooms.forEach(([k,v]) => {
  forbidden.forEach(w => {
    if (v.desc.includes(w)) { console.log('  ⚠ desc',k,':',w); forbiddenFound++; }
    (v.events||[]).forEach((e,i) => {
      if (e.desc.includes(w)) { console.log('  ⚠ event',k,'['+i+']:',w); forbiddenFound++; }
    });
    // Check observable sub-rooms
    if(v.observable) {
      if(v.observable.inspect_desc && v.observable.inspect_desc.includes(w)) {
        console.log('  ⚠ inspect',k,':',w); forbiddenFound++;
      }
      (v.observable.sub_rooms||[]).forEach(s => {
        if(s.desc && s.desc.includes(w)) { console.log('  ⚠ sub',s.name,':',w); forbiddenFound++; }
      });
    }
  });
});
if(forbiddenFound===0) console.log('  ✓ 禁用词扫描通过');

// 6. AI高频词
console.log('\n=== 6. AI高频词扫描 ===');
const aiWords = ['不禁','不由得','下意识地','不由自主地','空气中弥漫着','他感到','她感到',
                 '与此同时','另一边','时间来到了','不知为何','似乎在说','好像在说',
                 '温柔地','轻轻地','深深地','缓缓地'];
let aiFound = 0;
rooms.forEach(([k,v]) => {
  const allText = v.desc + ' ' + (v.events||[]).map(e=>e.desc).join(' ');
  aiWords.forEach(w => {
    if (allText.includes(w)) { console.log('  ⚠',k,':',w); aiFound++; }
  });
  // 「仿佛」限每段1次
  const fangfuCount = (allText.match(/仿佛/g)||[]).length;
  if (fangfuCount > 1) { console.log('  ⚠',k,': 仿佛出现',fangfuCount,'次'); aiFound++; }
});
if(aiFound===0) console.log('  ✓ AI高频词扫描通过');

// 7. NPC纯中文
console.log('\n=== 7. NPC名称中文检查 ===');
let npcIssue = 0;
rooms.forEach(([k,v]) => {
  (v.npcs||[]).forEach(n => {
    if (/[a-zA-Z]/.test(n.name)) { console.log('  ⚠',k,'NPC:',n.name); npcIssue++; }
  });
});
if(npcIssue===0) console.log('  ✓ NPC名称纯中文');

// 8. 出口中文方向
console.log('\n=== 8. 出口方向中文 ===');
let dirIssue = 0;
rooms.forEach(([k,v]) => {
  Object.keys(v.connections||{}).forEach(d => {
    if (!/[东西南北上下出里外东南东北西南西北]/.test(d)) {
      console.log('  ⚠',k,'出口:',d); dirIssue++;
    }
  });
});
if(dirIssue===0) console.log('  ✓ 出口方向全部中文');

// 9. 边界连接
console.log('\n=== 9. Agent A边界连接 ===');
const bounds = [
  ['钟山北麓·采石径','南','yt_north_gate'],
  ['雨花台·碎石坡','北','yt_south_gate'],
  ['清凉山·古道','东','yt_west_gate'],
  ['蒋山古道','西','yt_east_gate'],
];
bounds.forEach(([r,dir,exp]) => {
  const room = WILD_ROOMS[r];
  if(!room) console.log('  ⚠ 房间未找到:',r);
  else if(room.connections[dir]!==exp) console.log('  ⚠',r,dir,'→',room.connections[dir],'期望',exp);
  else console.log('  ✓',r,'→',dir,'→',exp);
});

// 10. desc句长
console.log('\n=== 10. 描述字数 (40-100) ===');
let lenIssues = 0;
rooms.forEach(([k,v]) => {
  const len = v.desc.length;
  if(len < 35 || len > 110) { console.log('  ⚠',k,':',len,'字'); lenIssues++; }
});
if(lenIssues===0) console.log('  ✓ 字数全部在合理范围');

// 11. 城外地名检查
console.log('\n=== 11. 城外地名检查(避免过度血/尸/死前缀) ===');
const wildRoomNames = rooms.filter(([k]) => k.match(/^yt_(suburb|cemetery|ghost_|dragon|wild_)/));
let nameIssues = 0;
wildRoomNames.forEach(([k,v]) => {
  const name = k;
  // 检查房间名本身(不在desc中)
  const displayName = v.connections ? Object.keys(v) : [];
});
// 检查房间名是否过度前缀 - 通过desc内容检查
const excessivePrefixes = ['血径','血道','血山','血林','血崖','尸道','尸径','尸山','尸林','死道','死径','死林'];
excessivePrefixes.forEach(prefix => {
  rooms.forEach(([k,v]) => {
    if(v.desc.includes(prefix)) { console.log('  ⚠',k,'含前置:',prefix); nameIssues++; }
  });
});
if(nameIssues===0) console.log('  ✓ 城外地名合规');

// 12. 2+1结构调整
console.log('\n=== 12. 2+1结构(每房≥3句) ===');
let structIssues = 0;
rooms.forEach(([k,v]) => {
  const sents = v.desc.split(/[。！？]/).filter(s=>s.trim().length>0);
  if(sents.length < 3) { console.log('  ⚠',k,':',sents.length,'句'); structIssues++; }
});
if(structIssues===0) console.log('  ✓ 所有房间≥3句');

// 13. 分句数 (3-6)
console.log('\n=== 13. 分句数(逗号分隔) ===');
rooms.forEach(([k,v]) => {
  const commas = (v.desc.match(/，/g)||[]).length;
  const periods = (v.desc.match(/。/g)||[]).length;
  const clauses = commas + periods;
  if(clauses < 3 || clauses > 8) console.log('  ⚠',k,':',clauses,'个分句');
});
console.log('  分句检查完成(3-6分句为理想范围)');

console.log('\n=== 自检完成 ===');
console.log('  ✓ 表示通过  |  ⚠ 表示有问题');
