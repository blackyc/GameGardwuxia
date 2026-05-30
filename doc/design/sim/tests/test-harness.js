// test-harness.js — interact3.js CLI全路径模糊测试
// 每次行动都 spawn node interact3.js <cmd>，测试序列化+命令分派完整链路
// 用法: node tests/test-harness.js [games=30] [matchup=all|1|2|3]

var cp = require("child_process");
var fs = require("fs");
var path = require("path");

var SRC_DIR = path.join(__dirname, "..", "src");
var STATE_FILE = path.join(SRC_DIR, "interact3-state.json");
var BUG_DIR = path.join(__dirname, "..", "bugs");

var MATCHUPS = [
  ["血刀", "无极道人"],
  ["夜修罗", "血刀"],
  ["无极道人", "夜修罗"],
];

var GAMES = parseInt(process.argv[2]) || 30;
var MATCHUP_FILTER = process.argv[3] || "all";

if (!fs.existsSync(BUG_DIR)) fs.mkdirSync(BUG_DIR, { recursive: true });

// ═══ 工具 ═══
function runCmd(cmd, timeoutMs) {
  var result = cp.spawnSync(process.execPath, ["interact3.js"].concat(cmd), {
    cwd: SRC_DIR,
    timeout: timeoutMs || 10000,
    encoding: "utf8",
  });
  return {
    code: result.status,
    stdout: (result.stdout || ""),
    stderr: (result.stderr || ""),
    elapsedMs: 0,
    error: result.error ? result.error.message : null,
  };
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); }
  catch (e) { return null; }
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══ 不变量检查 ═══
function checkInvariants(state, gameIdx) {
  var errors = [];
  var CONST = { maxHandSize: 8, maxDantian: 6, maxActionZone: 8 };
  try { CONST = require(path.join(SRC_DIR, "data", "constants.json")); } catch(e) {}

  if (!state || !state.players) { errors.push("state or players missing"); return errors; }
  for (var pi = 0; pi < 2; pi++) {
    var p = state.players[pi];
    if (typeof p.hp !== "number" || p.hp < 0) errors.push("P"+(pi+1)+" invalid HP: "+p.hp);
    if (typeof p.flaws !== "number" || p.flaws < 0) errors.push("P"+(pi+1)+" invalid flaws: "+p.flaws);
    if (p.hand && p.hand.length > CONST.maxHandSize) errors.push("P"+(pi+1)+" hand overflow: "+p.hand.length);
    if (p.dantian && p.dantian.length > CONST.maxDantian) errors.push("P"+(pi+1)+" dantian overflow: "+p.dantian.length);
    if (p.actionZone && p.actionZone.length > CONST.maxActionZone) errors.push("P"+(pi+1)+" AZ overflow: "+p.actionZone.length);
    if (typeof p.innerPower !== "number" || p.innerPower < 0) errors.push("P"+(pi+1)+" negative inner: "+p.innerPower);
  }
  return errors;
}

// ═══ 行动决策 ═══
function decideAction(state) {
  // 优先处理子状态标记
  if (state._pendingBloodMode) return ["bloodmode", String(Math.random() < 0.5 ? "1" : "2")];
  if (state._dantianSelect) {
    var cands = state._dantianSelect.candidates;
    var sel = [String(Math.floor(Math.random() * cands.length))];
    if (cands.length > 1 && Math.random() < 0.3) sel.push(String(Math.floor(Math.random() * cands.length)));
    return ["dantian"].concat(sel);
  }
  if (state._searchExtra && state._searchExtra.length > 0) {
    return ["searchpick", String(Math.floor(Math.random() * state._searchExtra.length))];
  }
  if (state._exileCandidates && state._exileCandidates.length > 0) {
    return ["exilepick", String(Math.floor(Math.random() * state._exileCandidates.length))];
  }
  if (state._responseWindow && state._responseWindow.candidates && state._responseWindow.candidates.length > 0) {
    if (Math.random() < 0.4) return ["skip"];
    return ["respond", String(Math.floor(Math.random() * state._responseWindow.candidates.length))];
  }

  // 按 phase 决定
  if (state.phase === "action") {
    if (Math.random() < 0.3) return ["pass"];
    var p1 = state.players[0];
    if (p1.hand.length === 0) return ["pass"];
    if (Math.random() < 0.1 && p1.character && p1.character.id === "xuedao" && !p1.hasUsedPassiveThisRound) {
      if (Math.random() < 0.5) return ["bloodwarfare", "cost"];
      return ["bloodwarfare", "discard"];
    }
    return ["choice", String(Math.floor(Math.random() * p1.hand.length))];
  }
  if (state.phase === "response") {
    if (Math.random() < 0.4) return ["skip"];
    return ["respond", "0"];
  }
  if (state.phase === "chooseJudgment") {
    var p1 = state.players[0];
    if (p1.hand.length === 0 || Math.random() < 0.3) return ["pass"];
    return ["choice", String(Math.floor(Math.random() * p1.hand.length))];
  }
  return ["status"];
}

// ═══ 单局测试 ═══
function runOneGame(char1, char2, gameIdx) {
  var startTime = Date.now();
  var actions = [];
  var bugs = [];
  var maxRounds = 300;
  var roundNum = 0;

  // Init
  var r = runCmd(["init", "普通", char1, char2]);
  if (r.code !== 0 && r.code !== null) {
    bugs.push({ type: "INIT_CRASH", msg: "init failed code=" + r.code, stderr: r.stderr });
    return { winner: null, actions: [], bugs: bugs, elapsed: Date.now() - startTime };
  }

  // Main loop
  while (roundNum < maxRounds) {
    roundNum++;
    var state = readState();
    if (!state) { bugs.push({ type: "STATE_MISSING", msg: "no state file at round " + roundNum }); break; }

    // Check invariants
    var invErrors = checkInvariants(state, gameIdx);
    for (var ei = 0; ei < invErrors.length; ei++) bugs.push({ type: "INVARIANT", msg: invErrors[ei], round: roundNum });

    // Check game over
    if (state.isGameOver || state.phase === "gameover") break;
    if (state.players[0].hp <= 0 || state.players[1].hp <= 0) break;
    // Check for victory log
    if (state.log) {
      var lastLogs = state.log.slice(-5).join("\n");
      if (/HP.*<=.*0|胜利|victory|game.over/i.test(lastLogs)) break;
    }

    // Auto-advance phases: issue a pass to let engine handle transition
    if (state.phase === "newRound" || state.phase === "nextRound" || state.phase === "preparation") {
      r = runCmd(["pass"]);
      actions.push("pass(auto-advance)");
      if (r.code !== 0) { bugs.push({ type: "ADVANCE_CRASH", msg: "advance failed", round: roundNum, stderr: r.stderr }); break; }
      continue;
    }

    // Decide and execute
    var cmd = decideAction(state);
    r = runCmd(cmd);
    var actionLabel = cmd.join(" ");
    actions.push(actionLabel);

    if (r.code !== 0 && r.code !== null) {
      // Differentiate: stderr = real crash, no stderr = intentional exit(1)
      if (r.stderr && r.stderr.length > 0) {
        bugs.push({ type: "CMD_CRASH", msg: actionLabel + " crashed code=" + r.code, round: roundNum, stderr: r.stderr, stderrFull: r.stderr });
      } else {
        bugs.push({ type: "SOFT_EXIT", msg: actionLabel + " rejected: " + r.stdout.substring(0, 100).trim().split('\n')[0], round: roundNum });
      }
      break;
    }

    // Detect game over in output
    if (r.stdout.indexOf("游戏结束") >= 0 || r.stdout.indexOf("game over") >= 0) break;
  }

  if (roundNum >= maxRounds) bugs.push({ type: "MAX_ROUNDS", msg: "exceeded max rounds" });

  var finalState = readState();
  var winner = finalState ? finalState.winner : null;
  return { winner: winner, rounds: roundNum, actions: actions, bugs: bugs, elapsed: Date.now() - startTime };
}

// ═══ 主循环 ═══
function main() {
  console.log("╔═══════════════════════════════╗");
  console.log("║  interact3.js CLI Fuzz Test  ║");
  console.log("╚═══════════════════════════════╝");
  console.log("Games: " + GAMES + " | Mode: " + MATCHUP_FILTER);
  console.log("");

  var totalBugs = 0;
  var gamesRun = 0;
  var bugReport = [];
  var byMatchup = {};

  for (var g = 0; g < GAMES; g++) {
    var mi = g % MATCHUPS.length;
    if (MATCHUP_FILTER !== "all") mi = parseInt(MATCHUP_FILTER) - 1;
    if (mi < 0 || mi >= MATCHUPS.length) { console.error("Invalid matchup filter"); return; }
    var m = MATCHUPS[mi];
    var mk = m[0] + "_vs_" + m[1];

    var result = runOneGame(m[0], m[1], g);
    gamesRun++;
    byMatchup[mk] = byMatchup[mk] || { games: 0, bugs: 0, p1wins: 0, p2wins: 0 };
    byMatchup[mk].games++;
    if (result.bugs.length > 0) byMatchup[mk].bugs++;
    if (result.winner === 1) byMatchup[mk].p1wins++;
    if (result.winner === 2) byMatchup[mk].p2wins++;

    var status = result.bugs.length > 0 ? "BUG " + result.bugs.length + " BUGS" : "OK";
    console.log("G" + g + " " + mk + " " + status + " R" + result.rounds + " A" + result.actions.length);

    if (result.bugs.length > 0) {
      totalBugs += result.bugs.length;
      bugReport.push({ game: g, matchup: mk, bugs: result.bugs, lastActions: (result.actions || []).slice(-10) });

      var bugMd = "# Bug: Game " + g + " (" + mk + ")\n\n";
      bugMd += "**Time:** " + new Date().toISOString() + "\n\n";
      bugMd += "**Bugs:**\n";
      result.bugs.forEach(function(b) { bugMd += "- [" + b.type + "] " + b.msg + (b.round ? " (R" + b.round + ")" : "") + "\n"; });
      bugMd += "\n**Last actions:**\n";
      result.actions.slice(-10).forEach(function(a) { bugMd += "- " + a + "\n"; });
      if (result.bugs.some(function(b){return b.stderr})) {
        bugMd += "\n**Stderr:**\n```\n" + result.bugs.map(function(b){return b.stderr||""}).join("\n---\n") + "\n```\n";
      }
      fs.writeFileSync(path.join(BUG_DIR, "cli-fuzz_" + mk + "_g" + g + ".md"), bugMd);
    }
  }

  // Summary
  var summary = "# CLI Fuzz Test Summary\n\n";
  summary += "**Date:** " + new Date().toISOString() + "\n";
  summary += "**Games:** " + gamesRun + "\n";
  summary += "**Bugs:** " + totalBugs + "\n\n";
  summary += "## By Matchup\n\n";
  summary += "| Matchup | Games | Bugs | P1 Win | P2 Win |\n";
  summary += "|---------|-------|------|--------|--------|\n";
  for (var k in byMatchup) {
    summary += "| " + k + " | " + byMatchup[k].games + " | " + byMatchup[k].bugs + " | " + byMatchup[k].p1wins + " | " + byMatchup[k].p2wins + " |\n";
  }
  summary += "\n## Bug Summary\n\n";
  if (bugReport.length === 0) { summary += "No bugs found.\n"; }
  else { bugReport.forEach(function(br) { summary += "- G" + br.game + " " + br.matchup + ": " + br.bugs.map(function(b){return b.type}).join(", ") + "\n"; }); }
  fs.writeFileSync(path.join(BUG_DIR, "cli-fuzz-summary.md"), summary);

  console.log("");
  console.log("═══ Done: " + gamesRun + " games, " + totalBugs + " bugs ═══");
}

main();
