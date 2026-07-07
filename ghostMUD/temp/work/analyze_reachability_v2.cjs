// analyze_reachability_v2.cjs — 用正则提取房间数据，分析 BFS 可达性
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const integrationFile = path.join(dataDir, 'integration_v2.js');
const integrationSrc = fs.readFileSync(integrationFile, 'utf-8');

// 提取 _ID_MAP
const migration = {};
const migrationMatch = integrationSrc.match(/_ID_MAP\s*=\s*\{([\s\S]*?)\}/);
if (migrationMatch) {
  const re = /'([^']+)':\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(migrationMatch[1])) !== null) migration[m[1]] = m[2];
}
console.log(`迁移映射: ${Object.keys(migration).length} 条`);

// 从所有 rebuild_rooms_*.js 文件中提取房间
const LOCATIONS = {};
const roomFiles = ['rebuild_rooms_city.js', 'rebuild_rooms_wild.js', 'rebuild_rooms_wenjianfeng.js'];
roomFiles.forEach(f => {
  const src = fs.readFileSync(path.join(dataDir, f), 'utf-8');
  // 匹配 '房间名': { ... connections: { ... }, ... }
  // 用正则提取房间名和 connections
  const roomRe = /'([^']+)':\s*\{/g;
  let roomMatch;
  while ((roomMatch = roomRe.exec(src)) !== null) {
    const roomName = roomMatch[1];
    const startPos = roomMatch.index + roomMatch[0].length;
    // 找到对应的 connections
    // 从房间开始位置往后找 connections:
    const afterRoom = src.substring(startPos, startPos + 5000);
    const connMatch = afterRoom.match(/connections:\s*\{([^}]+)\}/);
    if (connMatch) {
      const conns = {};
      const pairs = connMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g);
      let p;
      while ((p = pairs.next()).done === false) {
        conns[p.value[1]] = p.value[2];
      }
      LOCATIONS[roomName] = { connections: conns };
    } else {
      // 可能没有 connections 或格式不同
      if (!LOCATIONS[roomName]) LOCATIONS[roomName] = {};
    }
  }
});

console.log(`加载房间: ${Object.keys(LOCATIONS).length} 个`);

// 处理 integration_v2.js 中的 addConnection 调用
const addConnRe = /addConnection\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
let acm;
while ((acm = addConnRe.exec(integrationSrc)) !== null) {
  const [, from, dir, to] = acm;
  const fromN = migration[from] || from;
  const toN = migration[to] || to;
  if (LOCATIONS[fromN] && LOCATIONS[toN]) {
    if (!LOCATIONS[fromN].connections) LOCATIONS[fromN].connections = {};
    LOCATIONS[fromN].connections[dir] = toN;
  }
}

// 处理 integration_v2.js 中直接修改 connections 的情况
// LOCATIONS['xxx'].connections = { ... }
const directRe = /LOCATIONS\[(['"])([^'"]+)\1\]\.connections\s*=\s*\{([^}]+)\}/g;
let dm;
while ((dm = directRe.exec(integrationSrc)) !== null) {
  const locName = dm[2];
  const connStr = dm[3];
  if (!LOCATIONS[locName]) LOCATIONS[locName] = {};
  if (!LOCATIONS[locName].connections) LOCATIONS[locName].connections = {};
  const pairs = [...connStr.matchAll(/'([^']+)':\s*'([^']+)'/g)];
  pairs.forEach(p => {
    LOCATIONS[locName].connections[p[1]] = migration[p[2]] || p[2];
  });
}

// BFS
const CARDINAL = new Set(['北','南','东','西','上','下','出','north','south','east','west','up','down','out']);
const visited = new Set();
const queue = ['应天府·十字街口'];
visited.add('应天府·十字街口');
const parent = {};
while (queue.length > 0) {
  const cur = queue.shift();
  const loc = LOCATIONS[cur];
  if (!loc || !loc.connections) continue;
  for (const [dir, target] of Object.entries(loc.connections)) {
    const t = migration[target] || target;
    if (LOCATIONS[t] && !visited.has(t)) {
      visited.add(t);
      parent[t] = { from: cur, dir };
      queue.push(t);
    }
  }
}

const allRooms = Object.keys(LOCATIONS).filter(n => LOCATIONS[n].connections);
const unreachable = allRooms.filter(n => !visited.has(n));
console.log(`\n总房间(有connections): ${allRooms.length}, 可达: ${visited.size}, 不可达: ${unreachable.length}\n`);

// 分析不可达房间
const fixList = [];
unreachable.forEach(room => {
  const conns = LOCATIONS[room].connections;
  const outbound = [];
  for (const [dir, target] of Object.entries(conns)) {
    const t = migration[target] || target;
    if (LOCATIONS[t]) {
      outbound.push({ dir, target: t, targetReachable: visited.has(t) });
    }
  }
  const reachableOut = outbound.filter(o => o.targetReachable);
  if (reachableOut.length > 0) {
    reachableOut.forEach(o => {
      fixList.push({
        room,
        fromRoom: o.target,
        suggestedKey: room.split('·').pop(),
        note: `${room}的${o.dir}→${o.target}已连通，需在${o.target}添加入口`
      });
    });
  } else {
    fixList.push({
      room,
      fromRoom: '(孤立)',
      suggestedKey: room.split('·').pop(),
      note: `完全孤立，出站: ${outbound.map(o => o.dir+'→'+o.target).join(', ')}`
    });
  }
});

// 按入口房间分组
const byRoom = {};
fixList.forEach(f => {
  if (!byRoom[f.fromRoom]) byRoom[f.fromRoom] = [];
  byRoom[f.fromRoom].push(f);
});

console.log('=== 按入口房间分组 ===\n');
Object.entries(byRoom).sort().forEach(([room, fixes]) => {
  console.log(`【${room}】需添加 ${fixes.length} 个入口:`);
  fixes.forEach(f => console.log(`  '${f.suggestedKey}': '${f.room}',  // ${f.note}`));
  console.log();
});
console.log(`总计: ${fixList.length} 个入口，涉及 ${Object.keys(byRoom).length} 个入口房间`);
