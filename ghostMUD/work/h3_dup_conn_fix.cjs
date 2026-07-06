/**
 * h3_dup_conn_fix.cjs — 自动修复重复 connections 键
 * 
 * 策略：
 * 1. 用正则扫描源码，找到每个 connections 块中的重复键
 * 2. 对每个重复键，收集所有候选目标
 * 3. 检查哪个候选目标有反向连接指回当前房间（双向连通性验证）
 * 4. 优先选择双向连通的目标；如果没有，优先选择带命名空间的
 * 5. 重写 connections 块，每个方向只保留一个目标
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const FILES = [
  'rebuild_rooms_city.js',
  'rebuild_rooms_wild.js',
  'rebuild_rooms_wenjianfeng.js',
];

// 加载所有房间数据（求值后的，用于检查反向连接）
const allRooms = {};
for (const f of FILES) {
  const src = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox);
  for (const key of Object.keys(sandbox.window)) {
    const val = sandbox.window[key];
    if (val && typeof val === 'object' && val.connections) {
      allRooms[key] = val;
    }
  }
}
console.log(`加载 ${Object.keys(allRooms).length} 个房间`);

// 反向索引：哪些房间的某个方向指向 targetRoom
function findReverseConnections(targetRoomName) {
  const reverses = [];
  for (const [roomName, room] of Object.entries(allRooms)) {
    for (const [dir, target] of Object.entries(room.connections)) {
      if (target === targetRoomName) {
        reverses.push({ from: roomName, dir });
      }
    }
  }
  return reverses;
}

// 方向反义词
const OPPOSITE = {
  '东': '西', '西': '东', '南': '北', '北': '南',
  '东北': '西南', '西南': '东北', '东南': '西北', '西北': '东南',
  '上': '下', '下': '上', '进': '出', '出': '进',
};

let totalFixed = 0;
const fixLog = [];

for (const file of FILES) {
  const filePath = path.join(DATA_DIR, file);
  let src = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 找所有 connections: { ... } 块（包括跨行的）
  const connRegex = /connections\s*:\s*\{([^}]*)\}/g;
  const matches = [];
  let m;
  while ((m = connRegex.exec(src)) !== null) {
    matches.push({
      fullMatch: m[0],
      block: m[1],
      index: m.index,
      endIndex: m.index + m[0].length,
    });
  }
  
  // 从后往前修改，避免偏移
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const block = match.block;
    
    // 提取所有键值对
    // 匹配 '键': '值' 或 "键": "值" 或 键: '值' 或 键: "值"
    const pairRegex = /(?:'([^']+)'|"([^"]+)"|([^\s:,'"]+))\s*:\s*(?:'([^']+)'|"([^"]+)"|([^\s,}]+))/g;
    const pairs = [];
    let pm;
    while ((pm = pairRegex.exec(block)) !== null) {
      const key = pm[1] || pm[2] || pm[3];
      const value = pm[4] || pm[5] || pm[6];
      pairs.push({ key, value });
    }
    
    // 找重复键
    const keyCounts = {};
    for (const p of pairs) {
      keyCounts[p.key] = (keyCounts[p.key] || 0) + 1;
    }
    
    const dupKeys = Object.entries(keyCounts).filter(([k, c]) => c > 1);
    if (dupKeys.length === 0) continue;
    
    // 找房间名
    const beforeBlock = src.substring(0, match.index);
    const nameMatches = [...beforeBlock.matchAll(/name\s*:\s*['"`]([^'"`]+)['"`]/g)];
    const roomName = nameMatches.length > 0 ? nameMatches[nameMatches.length - 1][1] : '未知';
    
    // 对每个重复键，选择最佳目标
    const seenKeys = new Set();
    const newPairs = [];
    
    for (const p of pairs) {
      if (keyCounts[p.key] > 1 && !seenKeys.has(p.key)) {
        seenKeys.add(p.key);
        
        // 收集所有候选目标
        const candidates = pairs.filter(pp => pp.key === p.key).map(pp => pp.value);
        
        // 检查双向连通性
        const oppositeDir = OPPOSITE[p.key];
        let bestTarget = null;
        let bestReason = '';
        
        for (const candidate of candidates) {
          const candidateRoom = allRooms[candidate];
          if (candidateRoom && oppositeDir) {
            const reverseTarget = candidateRoom.connections[oppositeDir];
            if (reverseTarget === roomName) {
              bestTarget = candidate;
              bestReason = `双向连通（${candidate}.${oppositeDir}→${roomName}）`;
              break;
            }
          }
        }
        
        // 如果没有双向连通的，选带命名空间的
        if (!bestTarget) {
          const namespaced = candidates.find(c => c.includes('·') || c.includes('_'));
          if (namespaced) {
            // 优先带 · 的（命名空间格式）
            const dotFormat = candidates.find(c => c.includes('·'));
            bestTarget = dotFormat || namespaced;
            bestReason = `无双向连通，选命名空间格式`;
          } else {
            bestTarget = candidates[0];
            bestReason = `无双向连通，取第一个`;
          }
        }
        
        // 如果最佳目标不存在于房间列表中，但有个候选存在，选存在的
        if (!allRooms[bestTarget]) {
          const existing = candidates.find(c => allRooms[c]);
          if (existing) {
            bestTarget = existing;
            bestReason = `原选择不存在，选存在的目标`;
          }
        }
        
        newPairs.push({ key: p.key, value: bestTarget });
        
        const removed = candidates.filter(c => c !== bestTarget);
        fixLog.push({
          file,
          room: roomName,
          direction: p.key,
          candidates,
          kept: bestTarget,
          removed,
          reason: bestReason,
        });
        totalFixed++;
      } else if (keyCounts[p.key] <= 1) {
        // 非重复键，原样保留
        newPairs.push(p);
      }
      // 重复键的后续出现已通过 seenKeys 跳过
    }
    
    // 重建 connections 块
    const newBlock = newPairs.map(p => {
      // 使用引号包裹所有键和值
      const k = typeof p.key === 'string' && /^[a-zA-Z0-9_\u4e00-\u9fff]+$/.test(p.key) ? `'${p.key}'` : `'${p.key}'`;
      const v = typeof p.value === 'string' && /^[a-zA-Z0-9_\u4e00-\u9fff]+$/.test(p.value) ? `'${p.value}'` : `'${p.value}'`;
      return `${k}: ${v}`;
    }).join(', ');
    
    const newConnBlock = `connections: { ${newBlock} }`;
    
    src = src.substring(0, match.index) + newConnBlock + src.substring(match.endIndex);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`已修改 ${file}`);
  }
}

// 输出修复日志
console.log('\n' + '═'.repeat(60));
console.log('  修复日志');
console.log('═'.repeat(60));
for (const f of fixLog) {
  console.log(`\n  [${f.file}] ${f.room} — ${f.direction}`);
  console.log(`    候选: ${f.candidates.join(', ')}`);
  console.log(`    保留: ${f.kept} (${f.reason})`);
  if (f.removed.length > 0) {
    console.log(`    移除: ${f.removed.join(', ')}`);
  }
}
console.log(`\n总计修复: ${totalFixed} 处`);
