#!/usr/bin/env node
// H3 Migration: Rename bare room IDs to 大区·房间名 format
// This script:
// 1. Reads rebuild_rooms_city.js, rebuild_rooms_wild.js, integration_v2.js
// 2. Replaces all bare ID keys and references with new IDs
// 3. Scans other data files and src/ for references
// 4. Writes a migration map for save-game compatibility

const fs = require('fs');
const path = require('path');

const ROOT = 'D:/git/GameGardwuxia/ghostMUD';

// ─── Migration Map ───
const MIGRATION_MAP = {
  '东大街': '应天府·东大街',
  '西大街': '应天府·西大街',
  '南大街': '应天府·南大街',
  '北大街': '应天府·北大街',
  '正阳门': '应天府·正阳门',
  '石城门': '应天府·石城门',
  '聚宝门': '应天府·聚宝门',
  '太平门': '应天府·太平门',
  '钟楼街': '应天府·钟楼街',
  '鼓楼街': '应天府·鼓楼街',
  '御道街': '应天府·御道街',
  '成贤街': '应天府·成贤街',
  '绫庄巷': '应天府·绫庄巷',
  '醉仙楼': '应天府·醉仙楼',
  '清风茶馆': '应天府·清风茶馆',
  '老陈面馆': '应天府·老陈面馆',
  '秦淮饺儿铺': '应天府·秦淮饺儿铺',
  '状元粥铺': '应天府·状元粥铺',
  '炙肉坊': '应天府·炙肉坊',
  '聚宝当铺': '应天府·聚宝当铺',
  '神兵铁匠铺': '应天府·神兵铁匠铺',
  '回春堂药铺': '应天府·回春堂药铺',
  '锦绣布庄': '应天府·锦绣布庄',
  '四海钱庄': '应天府·四海钱庄',
  '秦淮集市': '应天府·秦淮集市',
  '鲁班木作坊': '应天府·鲁班木作坊',
  '丰裕米行': '应天府·丰裕米行',
  '草药市': '应天府·草药市',
  '镇淮桥': '应天府·镇淮桥',
  '文德桥': '应天府·文德桥',
  '墨香巷': '应天府·墨香巷',
  '花市巷': '应天府·花市巷',
  '古井巷': '应天府·古井巷',
  '弈棋巷': '应天府·弈棋巷',
  '青竹巷': '应天府·青竹巷',
  '薛家旧宅': '应天府·薛家旧宅',
  '李府废园': '应天府·李府废园',
  '通铺客栈': '应天府·通铺客栈',
  '夫子庙': '应天府·夫子庙',
  '朝天宫': '应天府·朝天宫',
  '鸡鸣寺': '应天府·鸡鸣寺',
  '莫愁湖': '应天府·莫愁湖',
  '明故宫': '应天府·明故宫',
  '织造府': '应天府·织造府',
  '燕子矶': '应天府·燕子矶',
  '清凉山': '应天府·清凉山',
  '石头城': '应天府·石头城',
  '乌衣巷': '应天府·乌衣巷',
  '长干里': '应天府·长干里',
  '桃叶渡': '应天府·桃叶渡',
  '瞻园': '应天府·瞻园',
  '白鹭洲': '应天府·白鹭洲',
  '栖霞街': '应天府·栖霞街',
  // Suburbs
  '东郊': '应天府·东郊',
  '南郊': '应天府·南郊',
  '北郊': '应天府·北郊',
  '东北郊': '应天府·东北郊',
  '东南郊': '应天府·东南郊',
  '西北郊': '应天府·西北郊',
  '西南郊': '应天府·西南郊',
  // Special areas (sub-rooms already have proper prefixes)
  '狐仙内室': '应天府·狐仙内室',
  '丹房密室': '朝天宫·丹房密室',
  '城隍暗室': '城隍庙·城隍暗室',
  '义庄地窖': '义庄·义庄地窖',
  '试剑密室': '铁剑庐·试剑密室',
  '江底沉船': '扬子江·江底沉船',
  '龙脉裂隙': '钟山龙脉·龙脉裂隙',
};

// Don't migrate these - they are already namespaced or are yt_* internal IDs
const SKIP_PREFIXES = ['应天府·', '朝天宫·', '城隍庙·', '义庄·', '铁剑庐·', '扬子江·', '钟山龙脉·', '鸡鸣寺·', '灵谷寺·', '静海寺·', '天妃宫·', '悦来客栈·', '太白遗风·', '斗转茶舍·', '江南贡院·', '国子监·', '秦淮河·', '玄武湖·', '紫金山·', '青龙山·', '雨花台·', '牛首山·', '清凉山·', '幕府山·', '蒋山·', '冶山古道·', '钟山北麓·', '栖霞道院·', '紫微阁·', '梵音堂·', '赤炎居·', '药王坊·', '影壁街·', '逍遥馆·', '巧工坊·', '应天府衙·', '阴司牢·', '城隍司·', '土地庙'];

// ─── Helper: replace bare ID references in text ───
// We need to be careful to only replace IDs that appear as:
// 1. Object keys: '东大街': {
// 2. Connection values: '北': '东大街'  or  北: '东大街'
// 3. String references in arrays/objects
// But NOT inside longer strings (like in desc text)

function replaceBareIds(content) {
  let result = content;
  
  // Sort by length descending so longer names are replaced first
  // (e.g., "东北郊" before "东郊", "聚宝当铺" before "聚宝门")
  const sortedIds = Object.keys(MIGRATION_MAP).sort((a, b) => b.length - a.length);
  
  for (const oldId of sortedIds) {
    const newId = MIGRATION_MAP[oldId];
    
    // Pattern 1: As object key - '东大街': {
    // Replace 'oldId': with 'newId':
    const keyPattern = new RegExp(`'${escapeRegex(oldId)}'(\\s*:)`, 'g');
    result = result.replace(keyPattern, `'${newId}'$1`);
    
    // Pattern 2: As connection value - '北': '东大街'
    // or 北: '东大街'
    const valPattern = new RegExp(`'${escapeRegex(oldId)}'`, 'g');
    // Only replace when it's a value (not a key - keys already handled above)
    // We need to be more careful: replace 'oldId' that appears after : or , or [ or (
    // Actually, since keys have already been replaced with newId (which contains ·),
    // remaining 'oldId' references are values. But we need to avoid replacing inside desc text.
    // Strategy: only replace 'oldId' that are NOT preceded by text characters (i.e., they're standalone quoted strings)
    
    // Use a pattern that ensures the quoted string is a standalone value
    // Look for 'oldId' not inside a longer string - it should be preceded by : , [ ( { or whitespace+'
    // Since desc text uses backtick template literals or is inside other quotes, 
    // and the bare IDs in connections are always '东大街' format,
    // we can safely replace all remaining 'oldId' occurrences
  }
  
  // Now handle value references (after key replacements)
  for (const oldId of sortedIds) {
    const newId = MIGRATION_MAP[oldId];
    // Replace 'oldId' as a value (not as a key, which was already replaced)
    const valPattern = new RegExp(`'${escapeRegex(oldId)}'`, 'g');
    result = result.replace(valPattern, `'${newId}'`);
  }
  
  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Main ───
console.log('=== H3 Room ID Migration ===\n');

// Files to process
const filesToProcess = [
  'public/data/rebuild_rooms_city.js',
  'public/data/rebuild_rooms_wild.js',
  'public/data/integration_v2.js',
];

// Scan for additional files that might reference bare IDs
const additionalFiles = [];
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.cjs')) {
      // Skip this script itself
      if (entry.name === 'migrate_h3.js') continue;
      // Skip node_modules
      if (fullPath.includes('node_modules')) continue;
      // Skip .tools
      if (fullPath.includes('.tools')) continue;
      additionalFiles.push(fullPath);
    }
  }
}

scanDir(path.join(ROOT, 'public'));
scanDir(path.join(ROOT, 'src'));

console.log('Files to process (primary):');
filesToProcess.forEach(f => console.log('  ' + f));
console.log('\nScanning additional files for bare ID references...');

// Process primary files
for (const file of filesToProcess) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`  SKIP (not found): ${file}`);
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const newContent = replaceBareIds(content);
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    const changes = (content.match(/'/g) || []).length - (newContent.match(/'/g) || []).length;
    console.log(`  UPDATED: ${file}`);
  } else {
    console.log(`  NO CHANGES: ${file}`);
  }
}

// Scan additional files
const allBareIds = Object.keys(MIGRATION_MAP);
const refsFound = {};

for (const file of additionalFiles) {
  const relPath = path.relative(ROOT, file);
  if (filesToProcess.includes(relPath)) continue;
  
  try {
    const content = fs.readFileSync(file, 'utf8');
    const found = [];
    
    for (const id of allBareIds) {
      // Check for bare ID as a quoted string value
      const singleQuote = new RegExp(`'${escapeRegex(id)}'`);
      const doubleQuote = new RegExp(`"${escapeRegex(id)}"`);
      if (singleQuote.test(content) || doubleQuote.test(content)) {
        found.push(id);
      }
    }
    
    if (found.length > 0) {
      refsFound[relPath] = found;
    }
  } catch(e) {
    // skip
  }
}

// Process additional files that have references
for (const [file, ids] of Object.entries(refsFound)) {
  const fullPath = path.join(ROOT, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const newContent = replaceBareIds(content);
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`  UPDATED: ${file} (${ids.length} bare IDs)`);
  }
}

// Also update the _ID_MAP in integration_v2.js
// The _ID_MAP maps yt_* IDs to room names - those room names need to be updated too
// But we already processed integration_v2.js above, so the _ID_MAP values should be updated

// Write migration map for save-game compatibility
const migrationMapContent = `// H3 Migration: Old bare ID → New namespaced ID
// Used in save-game loading to migrate old location IDs
const ROOM_ID_MIGRATION = ${JSON.stringify(MIGRATION_MAP, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ROOM_ID_MIGRATION;
}
`;
fs.writeFileSync(path.join(ROOT, 'src/data/room_id_migration.js'), migrationMapContent, 'utf8');
console.log('\n  WROTE: src/data/room_id_migration.js (save-game migration map)');

// Summary
console.log('\n=== Migration Summary ===');
console.log(`Total bare IDs mapped: ${Object.keys(MIGRATION_MAP).length}`);
console.log(`Primary files updated: ${filesToProcess.length}`);
console.log(`Additional files with refs: ${Object.keys(refsFound).length}`);
for (const [file, ids] of Object.entries(refsFound)) {
  console.log(`  ${file}: ${ids.length} refs`);
}
console.log('\nDone. Run tests to verify: node test/run-all.cjs');
