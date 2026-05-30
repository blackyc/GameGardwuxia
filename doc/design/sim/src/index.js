// 平衡模拟器 v5 —— 纯V1 + 秘术 + 震伤修正
var GameEngine = require('./engine/engine');
var { BaseAI } = require('./engine/ai');
var characters = require('./data/characters.json');
var decks = require('./data/decks.json');

var args = process.argv.slice(2);
var GAMES = 3000;
for (var i = 0; i < args.length; i++) {
  if (args[i] === '--games' && args[i + 1]) GAMES = parseInt(args[i + 1]);
}

function main() {
  console.log('═════════════════════════════════════');
  console.log('  江湖对决 平衡模拟器 v5');
  console.log('  +6克制 | 心法无战力加成 | V1规则');
  console.log('  秘术检索额外卡组 | 震伤即时触发');
  console.log('═════════════════════════════════════\n');

  var startTime = Date.now();
  var allStats = {};
  var deckKeys = Object.keys(decks);

  for (var a = 0; a < deckKeys.length; a++) {
    for (var b = a + 1; b < deckKeys.length; b++) {
      var key1 = deckKeys[a];
      var key2 = deckKeys[b];
      process.stdout.write('  ' + decks[key1].name + ' vs ' + decks[key2].name + ' [' + GAMES + '局] ');
      var stats = runSimulations(decks[key1], decks[key2], GAMES);
      allStats[key1 + '__vs__' + key2] = stats;
    }
  }

  console.log('\n');
  printReport(allStats, deckKeys);
  console.log('总耗时: ' + ((Date.now() - startTime) / 1000).toFixed(1) + 's');
}

function runSimulations(d1, d2, count) {
  var stats = { wins1: 0, wins2: 0, totalRounds: 0, surgeCount: 0 };

  for (var i = 0; i < count; i++) {
    var c1 = characterCopy(characters[d1.character]);
    var c2 = characterCopy(characters[d2.character]);
    var swap = i % 2 === 0;
    var faction1 = characterFaction(d1.character);
    var faction2 = characterFaction(d2.character);
    var ai1 = new BaseAI(faction1, faction2);
    var ai2 = new BaseAI(faction2, faction1);

    try {
      var engine = new GameEngine(cloneDeck(d1), cloneDeck(d2), c1, c2, ai1, ai2);
      var result = engine.run();
      if (result.winner === 1) stats.wins1++;
      else if (result.winner === 2) stats.wins2++;
      stats.totalRounds += result.rounds;
      for (var l = 0; l < result.log.length; l++) {
        if (result.log[l].indexOf('反转') >= 0) stats.surgeCount++;
      }
    } catch (e) {}

    if ((i + 1) % Math.max(1, Math.floor(count / 10)) === 0) process.stdout.write('.');
  }
  process.stdout.write('\n');
  return stats;
}

function printReport(allStats, deckKeys) {
  console.log('\n═══════════════════════════════════');
  console.log('  卡组胜率');
  console.log('═══════════════════════════════════');

  for (var d = 0; d < deckKeys.length; d++) {
    var wr = calcWR(allStats, deckKeys[d]);
    var bar = wr ? '█'.repeat(Math.round(wr / 4)) : '';
    console.log('  ' + decks[deckKeys[d]].name.padEnd(16) + ' ' + (wr ? wr.toFixed(1) + '%' : 'N/A') + '  ' + bar);
  }

  console.log('\n    对阵矩阵:');
  var header = '              ';
  for (var i = 0; i < deckKeys.length; i++) header += decks[deckKeys[i]].name.padEnd(12);
  console.log(header);

  for (var a = 0; a < deckKeys.length; a++) {
    var row = '  ' + decks[deckKeys[a]].name.padEnd(12);
    for (var b = 0; b < deckKeys.length; b++) {
      if (a === b) { row += '  -    '.padEnd(12); continue; }
      var pk = deckKeys[a] + '__vs__' + deckKeys[b];
      var rk = deckKeys[b] + '__vs__' + deckKeys[a];
      var s = allStats[pk] || allStats[rk];
      if (s) {
        var wr = allStats[rk] ? (s.wins2 / (s.wins1 + s.wins2) * 100).toFixed(1) :
                  (s.wins1 / (s.wins1 + s.wins2) * 100).toFixed(1);
        row += '  ' + wr + '%'.padEnd(12);
      } else row += '  N/A'.padEnd(12);
    }
    console.log(row);
  }

  // 回合数和反转
  var tg = 0, tr = 0, ts = 0;
  for (var k in allStats) {
    var st = allStats[k];
    tg += st.wins1 + st.wins2;
    tr += st.totalRounds;
    ts += st.surgeCount;
  }
  if (tg > 0) {
    console.log('\n  指标');
    console.log('  平均回合数: ' + (tr / tg).toFixed(1));
    console.log('  平均反转/局: ' + (ts / tg).toFixed(1));
    var spread = calcSpread(allStats, deckKeys);
    console.log('  胜率极差: ' + spread.toFixed(1) + '%');
  }
}

function calcWR(allStats, deckKey) {
  var wins = 0, total = 0;
  for (var pk in allStats) {
    var parts = pk.split('__vs__');
    var s = allStats[pk];
    if (parts[0] === deckKey) { wins += s.wins1; total += s.wins1 + s.wins2; }
    else if (parts[1] === deckKey) { wins += s.wins2; total += s.wins1 + s.wins2; }
  }
  return total > 0 ? (wins / total * 100) : null;
}

function calcSpread(allStats, deckKeys) {
  var min = 100, max = 0;
  for (var d = 0; d < deckKeys.length; d++) {
    var wr = calcWR(allStats, deckKeys[d]);
    if (wr && wr < min) min = wr;
    if (wr && wr > max) max = wr;
  }
  return max - min;
}

function cloneDeck(config) {
  return {
    mainDeck: config.mainDeck.map(function(e) { return { cardId: e.cardId, count: e.count }; }),
    extraDeck: config.extraDeck.map(function(e) { return { cardId: e.cardId, count: e.count }; })
  };
}
function characterCopy(c) { return JSON.parse(JSON.stringify(c)); }
function characterFaction(cid) {
  if (cid === 'xuedao') return 'modeng';
  if (cid === 'wuji') return 'wudang';
  if (cid === 'yeshura') return 'yintang';
  return 'generic';
}

main();
