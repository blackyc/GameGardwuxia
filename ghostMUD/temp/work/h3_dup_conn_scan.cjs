/**
 * h3_dup_conn_scan.cjs — 扫描所有数据文件中的重复 connections 键
 * 
 * JS 对象字面量中重复的键会被静默覆盖，导致地图拓扑断裂。
 * 本脚本用正则扫描源码（而非求值后检查），找出所有重复方向键。
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js'));

let totalDups = 0;
const report = [];

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  const src = fs.readFileSync(filePath, 'utf8');
  
  // 找到所有 connections: { ... } 块
  // 匹配 connections: { '方向': '目标', ... }
  const connRegex = /connections\s*:\s*\{([^}]*)\}/g;
  let match;
  
  while ((match = connRegex.exec(src)) !== null) {
    const block = match[1];
    const blockStart = src.lastIndexOf('\n', match.index) + 1;
    const lineNum = src.substring(0, match.index).split('\n').length;
    
    // 提取所有方向键（支持引号和无引号）
    const keyRegex = /(?:'([^']+)'|"([^"]+)"|([^\s:,'"]+))\s*:/g;
    const keys = [];
    let km;
    while ((km = keyRegex.exec(block)) !== null) {
      const key = km[1] || km[2] || km[3];
      keys.push(key);
    }
    
    // 找重复
    const counts = {};
    for (const k of keys) {
      counts[k] = (counts[k] || 0) + 1;
    }
    
    const dups = Object.entries(counts).filter(([k, c]) => c > 1);
    if (dups.length > 0) {
      // 找到房间名（向上找 name: 字段）
      let roomName = '未知';
      const beforeBlock = src.substring(0, match.index);
      const nameMatches = [...beforeBlock.matchAll(/name\s*:\s*['"`]([^'"`]+)['"`]/g)];
      if (nameMatches.length > 0) {
        roomName = nameMatches[nameMatches.length - 1][1];
      }
      
      for (const [dir, count] of dups) {
        totalDups++;
        report.push({
          file,
          line: lineNum,
          room: roomName,
          direction: dir,
          count,
        });
      }
    }
  }
}

// 输出报告
console.log('═'.repeat(60));
console.log('  重复 connections 键扫描报告');
console.log('═'.repeat(60));
console.log();

if (report.length === 0) {
  console.log('  ✅ 未发现重复连接键');
} else {
  console.log(`  ❌ 发现 ${report.length} 处重复连接键\n`);
  console.log(`  ${'文件'.padEnd(35)} ${'行'.padStart(5)} ${'方向'.padEnd(6)} ${'次数'.padStart(4)}  房间名`);
  console.log('  ' + '─'.repeat(80));
  
  // 按文件分组
  const byFile = {};
  for (const r of report) {
    if (!byFile[r.file]) byFile[r.file] = [];
    byFile[r.file].push(r);
  }
  
  for (const [file, items] of Object.entries(byFile)) {
    for (const r of items) {
      console.log(`  ${file.padEnd(35)} ${String(r.line).padStart(5)} ${r.direction.padEnd(6)} ${String(r.count).padStart(4)}  ${r.room}`);
    }
    console.log();
  }
}

console.log(`\n总计: ${totalDups} 处重复`);
process.exit(totalDups > 0 ? 1 : 0);
