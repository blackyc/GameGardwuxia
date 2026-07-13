const assert = require('assert');

(async () => {
  const { TutorialService } = await import('../src/tutorial_service.js');
  const logs = [];
  let combatStart = null;
  const game = {
    state: {
      faction: '问剑峰',
      tutorialPhase: 'ch1_done',
      tutorialActionState: null,
      location: '问剑峰·弟子房',
      explored: ['问剑峰·弟子房'],
      skills: {},
      chart: null,
      mp: 80,
      maxMp: 80,
      hp: 100,
      maxHp: 100,
    },
    data: {
      WENJIANFENG_TUTORIAL_CH2: {
        boar: { id: 'wjf_ch2_boar', name: '黑鬃野猪', hp: 4200, atk: 28, def: 8, spd: 9 },
        showcase: {
          enemy: { id: 'wjf_ch2_unknown', name: '？？？', hp: 100, atk: 0, def: 0, spd: 0 },
          chart: { A: 1091, B: 1092, D: 1094 },
        },
        nodes: {},
      },
    },
    addLog(text, type) { logs.push({ text, type }); },
    renderer: { updateUI() {} },
    markDirty() {},
    startCombat(name, enemy, options) { combatStart = { name, enemy, options }; return true; },
  };
  game.tutorial = new TutorialService(game);

  console.log('\nWenjianfeng chapter 2 behavior test');
  game.tutorial.resume();
  assert.strictEqual(game.state.tutorialPhase, 'ch2_ready');
  assert.strictEqual(game.tutorial.beginMorningPractice(), true);
  assert.strictEqual(game.state.location, '问剑峰·剑坪');
  game.tutorial.handleAction('lesson_slot', { slot: 'A' });
  game.tutorial.handleAction('lesson_slot', { slot: 'B' });
  assert.deepStrictEqual(game.state.chart, { A: 1001, B: 1002, C: 1003, D: 1004, E: 1005 });
  assert.strictEqual(Object.keys(game.state.skills).length, 5);

  const state = game.state.tutorialActionState;
  state.node = 'water_fill';
  game.state.location = '问剑峰·洗剑池';
  game.tutorial.handleAction('fill_water');
  for (let i = 0; i < 14; i++) {
    game.tutorial.handleAction('balance_water', { side: i % 2 === 0 ? 'left' : 'right' });
  }
  assert.strictEqual(state.node, 'water_loaded');
  assert.strictEqual(state.carry.waterUnits, 2);

  state.node = 'bamboo_cut';
  game.state.location = '问剑峰·竹林';
  let safety = 100;
  while (state.node === 'bamboo_cut' && safety-- > 0) game.tutorial.handleAction('cut_bamboo');
  assert.strictEqual(state.counters.bambooCount, 7);
  assert.strictEqual(state.node, 'boar_pending');
  assert.strictEqual(game.tutorial.beforeMove('问剑峰·洗剑池'), false);

  game.tutorial.handleAction('start_boar');
  assert.strictEqual(combatStart.options.mode, 'tutorial');
  assert.deepStrictEqual(combatStart.options.playerChart, game.state.chart);
  combatStart.options.onComplete({ outcome: 'victory' });
  assert.strictEqual(state.node, 'anomaly');
  assert.strictEqual(game.state.boarCombatResult, 'win');

  game.tutorial.handleAction('face_anomaly');
  assert.strictEqual(combatStart.options.mode, 'showcase');
  assert.strictEqual(combatStart.options.manualControl, true);
  assert.strictEqual(combatStart.options.syncPlayerState, false);
  combatStart.options.onComplete({ outcome: 'victory' });
  assert.strictEqual(state.node, 'aftermath');
  assert.strictEqual(game.state.residualSwordSeen, true);
  assert.ok(logs.some(entry => entry.text.includes('完整')));
  console.log('  PASS full chart, tap minigames, formal boar battle, isolated showcase');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
