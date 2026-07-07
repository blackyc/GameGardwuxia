/**
 * generate-script-tags.cjs — 从 manifest.js 生成 index.html 中的 <script> 标签块
 *
 * 用法: node temp/work/generate-script-tags.cjs
 *
 * 从 src/data/manifest.js 的 DATA_MANIFEST 提取文件列表，
 * 生成与 index.html 中一致的 <script> 标签块，并校验是否同步。
 *
 * H3 目标：消除 index.html 与 manifest.js 的双源配置。
 * 后续可改为 Vite 插件自动注入，当前先提供校验+生成能力。
 */
const fs = require('fs');
const path = require('path');

// 从 manifest.js 提取文件列表（简单正则，避免 ES module 解析）
const manifestPath = 'src/data/manifest.js';
const manifestCode = fs.readFileSync(manifestPath, 'utf8');

// 提取 file: 'xxx.js' 
const fileRegex = /file:\s*['"]([^'"]+)['"]/g;
const manifestFiles = [];
let match;
while ((match = fileRegex.exec(manifestCode)) !== null) {
  manifestFiles.push(match[1]);
}

console.log('Manifest 文件数:', manifestFiles.length);
console.log('文件列表:');
manifestFiles.forEach((f, i) => console.log(`  ${i+1}. ${f}`));

// 读取 index.html，提取当前 script 标签
const indexPath = 'index.html';
const html = fs.readFileSync(indexPath, 'utf8');

const scriptRegex = /<script\s+src="\/data\/([^"]+)"><\/script>/g;
const htmlFiles = [];
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  htmlFiles.push(m[1]);
}

console.log('\nindex.html 数据脚本数:', htmlFiles.length);

// 比对
const manifestSet = new Set(manifestFiles);
const htmlSet = new Set(htmlFiles);

const onlyManifest = [...manifestSet].filter(f => !htmlSet.has(f));
const onlyHtml = [...htmlSet].filter(f => !manifestSet.has(f));

// P2 修复：顺序检查
let orderMismatch = false;
const minLen = Math.min(manifestFiles.length, htmlFiles.length);
for (let i = 0; i < minLen; i++) {
  if (manifestFiles[i] !== htmlFiles[i]) {
    orderMismatch = true;
    break;
  }
}

if (onlyManifest.length === 0 && onlyHtml.length === 0 && !orderMismatch) {
  console.log('\n✅ Manifest 与 index.html 完全同步（含顺序）');
} else {
  if (onlyManifest.length > 0) {
    console.log('\n⚠️  Manifest 有但 index.html 缺少:');
    onlyManifest.forEach(f => console.log(`    - ${f}`));
  }
  if (onlyHtml.length > 0) {
    console.log('\n⚠️  index.html 有但 Manifest 缺少:');
    onlyHtml.forEach(f => console.log(`    - ${f}`));
  }
  if (orderMismatch) {
    console.log('\n⚠️  顺序不一致:');
    console.log('    Manifest 顺序:');
    manifestFiles.forEach((f, i) => console.log(`      ${i+1}. ${f}`));
    console.log('    index.html 顺序:');
    htmlFiles.forEach((f, i) => console.log(`      ${i+1}. ${f}`));
  }

  // 生成正确的 script 块
  console.log('\n--- 生成的 script 标签块 ---');
  const scriptBlock = manifestFiles.map(f => `    <script src="/data/${f}"></script>`).join('\n');
  console.log(scriptBlock);
  console.log('--- END ---');

  // 自动修复模式
  if (process.argv.includes('--fix')) {
    // 替换 index.html 中从第一个到最后一个 data script 标签的区域
    const firstScript = `<script src="/data/${htmlFiles[0]}"></script>`;
    const lastScript = `<script src="/data/${htmlFiles[htmlFiles.length - 1]}"></script>`;
    const startIdx = html.indexOf(firstScript);
    const endIdx = html.indexOf(lastScript) + lastScript.length;

    if (startIdx === -1 || endIdx === -1) {
      console.error('❌ 无法定位 index.html 中的 script 块');
      process.exit(1);
    }

    const newBlock = manifestFiles.map(f => `    <script src="/data/${f}"></script>`).join('\n    ');
    const newHtml = html.substring(0, startIdx) + newBlock + html.substring(endIdx);
    fs.writeFileSync(indexPath, newHtml);
    console.log('\n✅ index.html 已更新');
  } else {
    console.log('\n运行 `node temp/work/generate-script-tags.cjs --fix` 自动同步');
  }
  
  // P2 修复：校验失败时非零退出
  process.exit(1);
}
