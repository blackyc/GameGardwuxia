const fs = require('fs');
const html = fs.readFileSync('C:/Users/tabe/Desktop/GameFi/GameCard/GameGard/AllbackupAssets/cards-html-view/cards-gallery.html', 'utf8');

// 提取 CARDS 数组的 JS 文本
const match = html.match(/const CARDS=\[([\s\S]*?)\];/);
if (!match) { console.error('CARDS not found'); process.exit(1); }

const jsSource = match[1];

// 用 Function 构造安全解析
const CARDS = (new Function('EM','FN','EC','XINFA_BC', `
  ${html.match(/const EM[\s\S]*?const XINFA_BC[\s\S]*?};/)?.[0] || ''}
  return [${jsSource}];
`))(null,null,null,null);

fs.writeFileSync(
  'C:/Users/tabe/Desktop/GameFi/GameCard/GameGard/AllbackupAssets/cards-html-view/cards-data.json',
  JSON.stringify(CARDS, null, 2)
);
console.log('Success! Total cards: ' + CARDS.length);
