// matchups: { "md_vs_wd": ["modeng_xuedao","wudang_wuji"], ... }
var MAP = {
  md_vs_wd: ['modeng_xuedao', 'wudang_wuji'],
  md_vs_yt: ['modeng_xuedao', 'yintang_yeshura'],
  wd_vs_yt: ['wudang_wuji', 'yintang_yeshura']
};

var matchupId = process.argv[2] || 'md_vs_wd';
var games = parseInt(process.argv[3]) || 100;

var pair = MAP[matchupId];
if (!pair) { console.error('Unknown matchup: ' + matchupId); process.exit(1); }

var GameEngine = require('../src/engine/engine');
var { BaseAI } = require('../src/engine/ai');
var chars = require('../src/data/characters.json');
var decks = require('../src/data/decks.json');

var d1 = JSON.parse(JSON.stringify(decks[pair[0]]));
var d2 = JSON.parse(JSON.stringify(decks[pair[1]]));
var c1 = JSON.parse(JSON.stringify(chars[decks[pair[0]].character]));
var c2 = JSON.parse(JSON.stringify(chars[decks[pair[1]].character]));

var matchupLabel = pair[0].replace('_',' ') + ' vs ' + pair[1].replace('_',' ');
var wins = { p1: 0, p2: 0 };
var totalRounds = 0, totalReversals = 0;

for (var g = 0; g < games; g++) {
  try {
    var engine = new GameEngine(
      JSON.parse(JSON.stringify(d1)),
      JSON.parse(JSON.stringify(d2)),
      JSON.parse(JSON.stringify(c1)),
      JSON.parse(JSON.stringify(c2)),
      new BaseAI(pair[0].split('_')[0], pair[1].split('_')[0]),
      new BaseAI(pair[1].split('_')[0], pair[0].split('_')[0])
    );
    var r = engine.run();
    totalRounds += r.rounds;
    // 统计反转次数（判定交替=反转）
    if (r.log) {
      var rev = 0;
      var last = '';
      for (var li = 0; li < r.log.length; li++) {
        var line = r.log[li];
        if (line.indexOf('反转:') >= 0) rev++;
      }
      totalReversals += rev;
    }
    if (r.winner === 1) wins.p1++;
    else wins.p2++;
  } catch(e) {
    console.error('Game ' + g + ' error: ' + e.message);
  }
}

var result = {
  matchupId: matchupId,
  label: matchupLabel,
  deck1: pair[0], deck2: pair[1],
  totalGames: games,
  p1Wins: wins.p1, p2Wins: wins.p2,
  p1Rate: (wins.p1 / games * 100).toFixed(1),
  p2Rate: (wins.p2 / games * 100).toFixed(1),
  avgRounds: (totalRounds / games).toFixed(1),
  avgReversals: (totalReversals / games).toFixed(1),
  timestamp: new Date().toISOString()
};

var fs = require('fs');
var outPath = 'D:\\jianghuCCG\\sim\\orchestration\\results\\raw\\' + matchupId + '.json';
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
console.log('=== DONE ' + matchupLabel + ' ===');
console.log('P1: ' + result.p1Rate + '% | P2: ' + result.p2Rate + '% | ' + result.avgRounds + 'R | rev=' + result.avgReversals);
