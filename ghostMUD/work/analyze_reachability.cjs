// analyze_reachability.cjs — 分析 BFS 不可达房间，推导入口连接
// 运行: node analyze_reachability.cjs

const fs = require('fs');
const path = require('path');

// 加载所有房间数据
const dataDir = path.join(__dirname, '..', 'public', 'data');

// 模拟 integration_v2.js 的加载过程
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js') && f.startsWith('rebuild_'));
const integrationFile = path.join(dataDir, 'integration_v2.js');
const integrationSrc = fs.readFileSync(integrationFile, 'utf-8');

// 提取 ROOM_ID_MIGRATION 映射
const migrationMatch = integrationSrc.match(/var ROOM_ID_MIGRATION\s*=\s*\{([\s\S]*?)\};/);
const migration = {};
if (migrationMatch) {
  const lines = migrationMatch[1].trim().split('\n');
  lines.forEach(line => {
    const m = line.match(/'([^']+)':\s*'([^']+)'/);
    if (m) migration[m[1]] = m[2];
  });
}

// 加载所有 LOCATIONS
const LOCATIONS = {};
files.forEach(f => {
  const src = fs.readFileSync(path.join(dataDir, f), 'utf-8');
  // 提取变量名: CITY_ROOMS, WILD_ROOMS, WENJIANFENG_ROOMS 等
  const varMatch = src.match(/const (\w+)\s*=\s*\{/);
  if (!varMatch) return;
  const varName = varMatch[1];
  
  // 用 eval 加载（简化处理）
  try {
    const fn = new Function(src + '\nreturn ' + varName + ';');
    const rooms = fn();
    Object.assign(LOCATIONS, rooms);
  } catch(e) {
    console.error('Failed to load', f, e.message);
  }
});

// 加载 addConnection 调用
const addConnMatches = integrationSrc.match(/addConnection\([^)]+\)/g) || [];
addConnMatches.forEach(line => {
  const m = line.match(/addConnection\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/);
  if (m) {
    const [, from, dir, to] = m;
    // 迁移 ID
    const fromN = migration[from] || from;
    const toN = migration[to] || to;
    if (LOCATIONS[fromN] && LOCATIONS[toN]) {
      if (!LOCATIONS[fromN].connections) LOCATIONS[fromN].connections = {};
      LOCATIONS[fromN].connections[dir] = toN;
    }
  }
});

// 也处理 integration_v2.js 中直接赋值 connections 的情况
const directConnMatches = integrationSrc.match(/LOCATIONS\[([^]]+)\]\.connections\s*=\s*\{([^}]+)\}/g) || [];
directConnMatches.forEach(match => {
  const locMatch = match.match(/LOCATIONS\[([^]]+)\]\.connections\s*=\s*\{([^}]+)\}/);
  if (locMatch) {
    let locName = locMatch[1].trim();
    if (locName.startsWith("'") || locName.startsWith('"')) locName = locName.slice(1, -1);
    const connStr = locMatch[2];
    if (LOCATIONS[locName] && !LOCATIONS[locName].connections) {
      LOCATIONS[locName].connections = {};
    }
    // 解析连接
    const pairs = connStr.match(/'([^']+)':\s*'([^']+)'/g) || [];
    pairs.forEach(p => {
      const m = p.match(/'([^']+)':\s*'([^']+)'/);
      if (m && LOCATIONS[locName]) {
        LOCATIONS[locName].connections[m[1]] = migration[m[2]] || m[2];
      }
    });
  }
});

// BFS 从十字街口
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

// 找不可达房间
const allRooms = Object.keys(LOCATIONS).filter(n => LOCATIONS[n] && LOCATIONS[n].connections);
const unreachable = allRooms.filter(n => !visited.has(n));

console.log(`总房间: ${allRooms.length}, 可达: ${visited.size}, 不可达: ${unreachable.length}\n`);

// 分析不可达房间：检查它们自己的 connections 指向哪里
// 如果有 connections 中指向某个可达房间，说明需要那个可达房间添加反向连接
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
  // 找到可达的出站目标——说明入口应该从这里来
  const reachableOut = outbound.filter(o => o.targetReachable);
  if (reachableOut.length > 0) {
    // 这个房间的出口指向某个可达房间，需要那个可达房间添加入口
    reachableOut.forEach(o => {
      // 推导入口简称：从房间名提取
      const shortName = room.split('·').pop();
      fixList.push({
        room,
        fromRoom: o.target,
        suggestedKey: shortName,
        existingDir: o.dir,
        note: `${room} 的 ${o.dir}→${o.target} 已连通，需在 ${o.target} 添加入口`
      });
    });
  } else {
    // 没有可达出站——需要从其他可达房间添加连接
    // 检查是否有不可达出站链
    fixList.push({
      room,
      fromRoom: '(none reachable)',
      suggestedKey: room.split('·').pop(),
      note: `完全孤立，出站: ${outbound.map(o => o.dir + '→' + o.target).join(', ')}`
    });
  }
});

// 输出修复清单
console.log('=== 需要添加入口的房间 ===\n');
fixList.forEach(f => {
  console.log(`[${f.room}]`);
  console.log(`  入口房间: ${f.fromRoom}`);
  console.log(`  建议key: ${f.suggestedKey}`);
  console.log(`  说明: ${f.note}`);
  console.log();
});

// 按入口房间分组
const byRoom = {};
fixList.forEach(f => {
  if (!byRoom[f.fromRoom]) byRoom[f.fromRoom] = [];
  byRoom[f.fromRoom].push(f);
});

console.log('\n=== 按入口房间分组 ===\n');
Object.entries(byRoom).forEach(([room, fixes]) => {
  console.log(`【${room}】需要添加 ${fixes.length} 个入口:`);
  fixes.forEach(f => console.log(`  '${f.suggestedKey}': '${f.room}',`));
  console.log();
});

// 输出统计
console.log(`\n总计: ${fixList.length} 个入口需要添加`);
console.log(`涉及 ${Object.keys(byRoom).length} 个入口房间`);
