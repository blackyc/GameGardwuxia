const fs = require('fs');

const filePath = 'D:/MUD/ghostMUD/work/rebuild_rooms_wenjianfeng.js';
const content = fs.readFileSync(filePath, 'utf8');

// Extract all quoted room IDs from the object keys
const roomIdMatches = content.match(/'([^']+)'\s*:\s*\{/g) || [];
const roomIds = roomIdMatches.map(m => m.replace(/'([^']+)'\s*:\s*\{/, '$1'));

// Also find quoted connections targets
const connMatches = content.match(/'(?:上|下|东|西|南|北|深|入|东南|西南|东北|西北)'[^']*'([^']+)'/g) || [];
const connectedTargets = connMatches.map(m => {
  const parts = m.split("'");
  return parts[parts.length - 2];
});

// Unique room IDs from keys
const uniqueRoomIds = [...new Set(roomIds)];
console.log('Total room keys:', uniqueRoomIds.length);

let errors = [];

// Check · in all room IDs
for (const id of uniqueRoomIds) {
  if (!id.includes('\u00b7')) {
    errors.push('Missing middle-dot: ' + id);
  }
}

// Check connections
for (const id of uniqueRoomIds) {
  const regex = new RegExp("'" + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'\\s*:\\s*\\{[^}]*connections\\s*:\\s*\\{([^}]*)\\}", 's');
  const match = content.match(regex);
  if (match) {
    const connBlock = match[1];
    const conns = connBlock.match(/'(.)'\s*:\s*'([^']+)'/g) || [];
    for (const conn of conns) {
      const parts = conn.match(/'(.))'\s*:\s*'([^']+)'/);
      if (parts) {
        const target = parts[2];
        if (!uniqueRoomIds.includes(target)) {
          errors.push('Room [' + id + '] -> [' + target + '] NOT FOUND');
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.log('ERRORS:');
  errors.forEach(e => console.log('  ' + e));
  process.exit(1);
} else {
  console.log('All room IDs contain middle-dot');
  console.log('All connections valid');
}

console.log('\nRoom IDs (' + uniqueRoomIds.length + '):');
uniqueRoomIds.forEach(id => console.log('  ' + id));

// Count maze vs main
const maze = uniqueRoomIds.filter(id => id.includes('\u7af9\u6797\u6df1\u5904'));
const main = uniqueRoomIds.filter(id => !id.includes('\u7af9\u6797\u6df1\u5904'));
console.log('\nMain rooms: ' + main.length + ' (expected 14)');
console.log('Maze rooms: ' + maze.length + ' (expected 4)');
