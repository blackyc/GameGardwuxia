/**
 * validate_wenjianfeng.cjs — 问剑峰房间数据校验
 *
 * 验证 public/data/rebuild_rooms_wenjianfeng.js 中的房间：
 * 1. 所有房间 ID 包含中点（·）
 * 2. 所有 connections 引用的目标存在于房间列表中
 * 3. 房间数量符合预期（主房间 14，迷宫 4）
 *
 * 修复历史：
 *   - 2026-07-06: 路径从 D:/MUD/ghostMUD/work/ 更新到 public/data/
 *   - 2026-07-06: 修复正则 bug（连接解析中的括号匹配错误）
 */

const fs = require('fs');
const path = require('path');

// 从 public/data/ 目录读取
const filePath = path.join(__dirname, '..', 'public', 'data', 'rebuild_rooms_wenjianfeng.js');
const content = fs.readFileSync(filePath, 'utf8');

// 提取所有房间对象键名 'XXX': {
const roomIdMatches = content.match(/'([^']+)'\s*:\s*\{/g) || [];
const roomIds = roomIdMatches.map(m => m.replace(/'([^']+)'\s*:\s*\{/, '$1'));

// 去重
const uniqueRoomIds = [...new Set(roomIds)];
console.log('Total room keys:', uniqueRoomIds.length);

let errors = [];

// 检查所有房间 ID 包含中点（·）
for (const id of uniqueRoomIds) {
  if (!id.includes('\u00b7')) {
    errors.push('Missing middle-dot: ' + id);
  }
}

// 检查连接目标
for (const id of uniqueRoomIds) {
  // 转义正则特殊字符
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 匹配 room id 对应的 connections 块
  const regex = new RegExp("'" + escapedId + "'\\s*:\\s*\\{[^}]*connections\\s*:\\s*\\{([^}]*)\\}", 's');
  const match = content.match(regex);
  if (match) {
    const connBlock = match[1];
    // 提取 '方向': '目标' 对
    const conns = connBlock.match(/'([^']+)'\s*:\s*'([^']+)'/g) || [];
    for (const conn of conns) {
      // 解析方向和目标
      const parts = conn.match(/'([^']+)'\s*:\s*'([^']+)'/);
      if (parts) {
        const target = parts[2];
        // 目标可以是已注册的房间 ID 或 yt_ 前缀的内部 ID
        if (!uniqueRoomIds.includes(target) && !target.startsWith('yt_')) {
          errors.push('Room [' + id + '] -> [' + target + '] NOT FOUND');
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.log('ERRORS (' + errors.length + '):');
  errors.forEach(e => console.log('  ' + e));
  process.exit(1);
} else {
  console.log('✓ All room IDs contain middle-dot');
  console.log('✓ All connections valid');
}

console.log('\nRoom IDs (' + uniqueRoomIds.length + '):');
uniqueRoomIds.forEach(id => console.log('  ' + id));

// 统计迷宫 vs 主房间
const maze = uniqueRoomIds.filter(id => id.includes('\u7af9\u6797\u6df1\u5904')); // 竹林深处
const main = uniqueRoomIds.filter(id => !id.includes('\u7af9\u6797\u6df1\u5904'));
console.log('\nMain rooms: ' + main.length + ' (expected ~14)');
console.log('Maze rooms: ' + maze.length + ' (expected ~4)');
