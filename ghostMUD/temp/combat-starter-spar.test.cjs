const assert = require('assert');

(async () => {
  const basicSkills = [
    { id: 9001, name: 'Left fist', slot: 'A', cd: 1.5, mpCost: 0, skillNum: 0.75, skillNumLvAdd: 0, effects: [], tags: ['unarmed'] },
    { id: 9002, name: 'Right fist', slot: 'B', cd: 2.0, mpCost: 0, skillNum: 0.8, skillNumLvAdd: 0, effects: [], tags: ['unarmed'] },
    { id: 9003, name: 'Left kick', slot: 'C', cd: 2.5, mpCost: 0, skillNum: 0.85, skillNumLvAdd: 0, effects: [], tags: ['unarmed'] },
    { id: 9004, name: 'Right stomp', slot: 'D', cd: 3.0, mpCost: 0, skillNum: 0.9, skillNumLvAdd: 0, effects: [], tags: ['unarmed'] },
    { id: 1091, name: 'Demo moon', slot: 'A', cd: 0.1, mpCost: 0, skillNum: 32, skillNumLvAdd: 0, demoOnly: true, effects: [], tags: [] },
  ];
  global.window = { __DATA_REGISTRY: { COMBAT_SKILLS_V3: basicSkills } };

  const { collectData } = await import('../src/data/data_loader.js');
  collectData();
  const { CombatFacade } = await import('../src/combat_facade.js');

  const game = {
    state: {
      hp: 100, maxHp: 100, mp: 80, maxMp: 80,
      attack: 15, defense: 1, realm: 0, path: 'wu', equipment: {},
      corruptionLevel: 0, cultivation: 0, faction: '问剑峰',
      skills: {},
      // Regression fixture: a previous build leaked a showcase chart into save data.
      chart: { A: 1091, B: 1091, C: 1091, D: 1091, E: 1091 },
    },
    addLog() {},
    addMoney() {},
    checkBreakthrough() {},
    renderer: { updateCombatUI() {}, updateUI() {} },
  };

  const facade = new CombatFacade(game);
  const enemy = {
    id: 'sparring-partner', name: 'Sparring partner', hp: 96, atk: 6, def: 2, spd: 5,
    chart: { A: 9001, B: 9002, C: 9003, D: 9004 },
  };
  assert.strictEqual(facade.startCombat(enemy.name, enemy, { mode: 'spar', autoStart: false, startReady: false }), true);

  const bs = facade.battleEngine.battleState;
  assert.deepStrictEqual(bs.chart, { A: 9001, B: 9002, C: 9003, D: 9004 });
  assert.deepStrictEqual(bs.cooldowns, { A: 1.5, B: 2, C: 2.5, D: 3, E: 0 });
  assert.deepStrictEqual(bs.enemyCooldowns, { A: 1.5, B: 2, C: 2.5, D: 3, E: 0 });
  assert.ok(!Object.values(bs.chart).includes(1091), 'showcase skills must not enter an ordinary spar');

  for (let i = 0; i < 14; i++) facade.battleEngine.tick();
  assert.strictEqual(bs.events.filter(event => event.type === 'combat').length, 0, 'no move may fire before the first 1.5s cooldown completes');

  facade.battleEngine.tick();
  assert.strictEqual(bs.active, true, 'the opening exchange must not end the spar');
  assert.ok(bs.enemy.hp > 0 && bs.enemy.hp < enemy.hp, 'the first basic move should deal bounded damage');
  assert.ok(bs.player.hp < bs.player.maxHp, 'the enemy opening move must also reduce player HP');

  facade.battleEngine.finishCombat('victory');
  assert.ok(facade._pendingBattleResult, 'victory must wait for player acknowledgement');
  assert.ok(game.state.combat?.awaitingDismissal, 'the runtime combat snapshot must remain available during victory hold');
  assert.strictEqual(facade.dismissCombatResult(), true, 'victory acknowledgement should close the battle');
  assert.strictEqual(game.state.combat, null, 'combat state should clear only after acknowledgement');
  console.log('Combat starter spar test: PASS basic chart, opening cooldowns, no showcase leak');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
