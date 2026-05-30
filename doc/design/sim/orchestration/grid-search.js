// 四象克制链 × 初始血量 组合扫参器
// 目标: 找到胜率接近 [50%-55%] 且三方形成克制循环的最佳组合
// node D:\jianghuCCG\sim\orchestration\grid-search.js [--games N]

var fs = require('fs');
var path = require('path');

var gamesPer = parseInt(process.argv[3]) || 200;
var CONST_PATH = path.join(__dirname, '..', 'src', 'data', 'constants.json');
var CHAR_PATH = path.join(__dirname, '..', 'src', 'data', 'characters.json');
var RUNNER = path.join(__dirname, 'run-pipeline.js');
var OUT_PATH = path.join(__dirname, 'results', 'audit', 'grid-results-v3.json');

// ═══ 所有可测试的克制链（4元素全排列 = 24种） ═══
// 默认链: 灵→诡→巧→霸→灵
// 格式: 克制关系 [克方, 被克方]
var chains = [
  { id: 'default', name: '灵克诡克巧克霸克灵', bonus: { spirit: 'deceptive', deceptive: 'skillful', skillful: 'domineering', domineering: 'spirit' } },
  { id: 'c1', name: '灵克巧克诡克霸克灵', bonus: { spirit: 'skillful', skillful: 'deceptive', deceptive: 'domineering', domineering: 'spirit' } },
  { id: 'c2', name: '灵克霸克巧克诡克灵', bonus: { spirit: 'domineering', domineering: 'skillful', skillful: 'deceptive', deceptive: 'spirit' } },
  { id: 'c3', name: '巧克霸克灵克诡克巧', bonus: { skillful: 'domineering', domineering: 'spirit', spirit: 'deceptive', deceptive: 'skillful' } },
  { id: 'c4', name: '巧克灵克霸克诡克巧', bonus: { skillful: 'spirit', spirit: 'domineering', domineering: 'deceptive', deceptive: 'skillful' } },
  { id: 'c5', name: '霸克灵克巧克诡克霸', bonus: { domineering: 'spirit', spirit: 'skillful', skillful: 'deceptive', deceptive: 'domineering' } },
  { id: 'c6', name: '霸克诡克灵克巧克霸', bonus: { domineering: 'deceptive', deceptive: 'spirit', spirit: 'skillful', skillful: 'domineering' } },
];

// HP组合: 血刀(魔教), 无极道人(武当), 夜修罗(隐堂)
var hpCombos = [
  { name: 'base', md: 3, wd: 3, yt: 2 },
  { name: 'h1', md: 4, wd: 3, yt: 2 },
  { name: 'h2', md: 3, wd: 4, yt: 2 },
  { name: 'h3', md: 4, wd: 4, yt: 3 },
  { name: 'h4', md: 5, wd: 3, yt: 2 },
  { name: 'h5', md: 3, wd: 5, yt: 2 },
  { name: 'h6', md: 4, wd: 4, yt: 2 },
  { name: 'h7', md: 3, wd: 3, yt: 3 },
  { name: 'h8', md: 5, wd: 4, yt: 3 },
  { name: 'h9', md: 4, wd: 5, yt: 3 },
  { name: 'h10', md: 5, wd: 5, yt: 4 },
];

var origConstants = JSON.parse(fs.readFileSync(CONST_PATH, 'utf-8'));
var origChars = JSON.parse(fs.readFileSync(CHAR_PATH, 'utf-8'));

var results = [];
var totalCombos = chains.length * hpCombos.length;

console.log('═══════════════════════════════');
console.log('  克制链 × HP 组合扫参');
console.log('  克制链: ' + chains.length + ' | HP组合: ' + hpCombos.length);
console.log('  总计: ' + totalCombos + ' | 每组合: ' + gamesPer + '局×3');
console.log('  预估: ' + (totalCombos * gamesPer * 3 / 1000) + 'k局, ' + Math.ceil(totalCombos * 0.3) + 'min');
console.log('═══════════════════════════════\n');

var t0 = Date.now();
var execSync = require('child_process').execSync;

chains.forEach(function(chain) {
  // 修改克制关系
  var c = JSON.parse(JSON.stringify(origConstants));
  c.counterBonus = 6;
  c.counterChain = chain.bonus;
  fs.writeFileSync(CONST_PATH, JSON.stringify(c, null, 2), 'utf-8');

  hpCombos.forEach(function(hp) {
    // 修改HP
    var ch = JSON.parse(JSON.stringify(origChars));
    ch.xuedao.hp = hp.md;
    ch.wuji.hp = hp.wd;
    ch.yeshura.hp = hp.yt;
    fs.writeFileSync(CHAR_PATH, JSON.stringify(ch, null, 2), 'utf-8');

    // 跑测试
    process.stdout.write(chain.id + '/' + hp.name + ' ');

    try {
      execSync('node "' + RUNNER + '" md_vs_wd ' + gamesPer, { cwd: __dirname, stdio: 'pipe', timeout: 30000 });
    } catch(e) {}
    try {
      execSync('node "' + RUNNER + '" md_vs_yt ' + gamesPer, { cwd: __dirname, stdio: 'pipe', timeout: 30000 });
    } catch(e) {}
    try {
      execSync('node "' + RUNNER + '" wd_vs_yt ' + gamesPer, { cwd: __dirname, stdio: 'pipe', timeout: 30000 });
    } catch(e) {}

    // 读结果
    function readRate(id) {
      var f = path.join(__dirname, 'results', 'raw', id + '.json');
      if (!fs.existsSync(f)) return { p1: 0, p2: 0 };
      var r = JSON.parse(fs.readFileSync(f, 'utf-8'));
      return { p1: parseFloat(r.p1Rate), p2: parseFloat(r.p2Rate) };
    }

    var mdwd = readRate('md_vs_wd');
    var mdyt = readRate('md_vs_yt');
    var wdyt = readRate('wd_vs_yt');

    // 判断三方克制循环: 魔胜武 > 武胜隐 > 隐胜魔 (或反向)
    var modengWudang = mdwd.p1 > 50;  // 魔是否克制武
    var wudangYintang = wdyt.p1 > 50; // 武是否克制隐
    var yintangModeng = mdyt.p2 > 50; // 隐是否克制魔

    var hasCycle = (modengWudang && wudangYintang && yintangModeng) || 
                   (!modengWudang && !wudangYintang && !yintangModeng);

    // 计算"最接近50-55%"分数
    function closeness(rate) { return Math.abs(rate - 52.5); } // 理想=52.5(即50-55中点)
    var score = closeness(mdwd.p1) + closeness(mdyt.p1 === 0 ? 100 - mdyt.p2 : mdyt.p1) + closeness(wdyt.p1);
    // 魔教胜率(对武当+对隐堂)/2
    var mdRate = ((mdwd.p1 || 0) + (mdyt.p1 || 0)) / 2;
    var wdRate = ((100 - (mdwd.p1 || 0)) + (wdyt.p1 || 0)) / 2;
    var ytRate = ((100 - (mdyt.p1 || 0)) + (100 - (wdyt.p1 || 0))) / 2;

    var entry = {
      chainId: chain.id, chainName: chain.name,
      hp: hp.name, hpMd: hp.md, hpWd: hp.wd, hpYt: hp.yt,
      mdVsWd: mdwd.p1, mdVsYt: mdyt.p1, wdVsYt: wdyt.p1,
      mdRate: mdRate.toFixed(1), wdRate: wdRate.toFixed(1), ytRate: ytRate.toFixed(1),
      hasCycle: hasCycle, score: score,
      range3: (Math.max(mdRate, wdRate, ytRate) - Math.min(mdRate, wdRate, ytRate)).toFixed(1)
    };

    results.push(entry);
    console.log([mdRate.toFixed(1), wdRate.toFixed(1), ytRate.toFixed(1), entry.range3, hasCycle ? '🔄' : '✗'].join('%/') + '%');

    // 中期保存
    if (results.length % 10 === 0) {
      fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
    }
  });
});

// 恢复原始配置
fs.writeFileSync(CONST_PATH, JSON.stringify(origConstants, null, 2), 'utf-8');
fs.writeFileSync(CHAR_PATH, JSON.stringify(origChars, null, 2), 'utf-8');

// 排序: 最好(接近50-55%且有三方循环)
results.sort(function(a, b) { return a.score - b.score; });

console.log('\n═══════════════════════════════');
console.log('  TOP 10 最佳组合');
console.log('═══════════════════════════════\n');
console.log('链 | HP(魔/武/隐) | 魔% | 武% | 隐% | 极差 | 循环 | 分');
console.log('---|------------|-----|-----|-----|-----|------|-----');
results.slice(0, 10).forEach(function(r) {
  console.log([r.chainId, r.hpMd + '/' + r.hpWd + '/' + r.hpYt, r.mdRate, r.wdRate, r.ytRate, r.range3, r.hasCycle ? '🔄' : '✗', r.score.toFixed(1)].join(' | '));
});

fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
console.log('\n完整结果: ' + OUT_PATH);
console.log('总耗时: ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
