const assert = require('assert');

(async () => {
  global.window = {
    __DATA_REGISTRY: {
      COMBAT_SKILLS_V3: [
        { id: 1, name: '起', slot: 'A', cd: 0.1, mpCost: 0, skillNum: 10, skillNumLvAdd: 0, effects: [], tags: [] },
        { id: 2, name: '承', slot: 'B', cd: 0.1, mpCost: 0, skillNum: 10, skillNumLvAdd: 0, effects: [], tags: [] },
        { id: 3, name: '合', slot: 'D', cd: 0.1, mpCost: 0, skillNum: 10, skillNumLvAdd: 0, effects: [], tags: [] },
      ],
    },
  };
  const { collectData } = await import('../src/data/data_loader.js');
  collectData();
  const { BattleEngine } = await import('../src/battle_async.js');

  const persistent = { hp: 100, maxHp: 100, mp: 80, maxMp: 80, attack: 1, defense: 0, realm: 0, path: 'wu', equipment: {}, corruptionLevel: 0, cultivation: 0 };
  const game = { state: persistent, addMoney() {}, checkBreakthrough() {} };

  console.log('\nCombat runtime V1.7 behavior test');
  const sparse = new BattleEngine(game, { seed: 7 });
  sparse.startCombat({ id: 'dummy', name: '木桩', hp: 999, atk: 0, def: 0, spd: 0 }, { A: 1, B: 2 }, { autoStart: false, startReady: true, enemyPassive: true });
  sparse.tick();
  assert.strictEqual(sparse.battleState.currentSlot, 1, 'A should advance to B');
  sparse.tick();
  assert.strictEqual(sparse.battleState.currentSlot, 0, 'B should wrap to A instead of stalling on C');

  const showcase = new BattleEngine(game, { seed: 9 });
  let result = null;
  showcase._onEnd = value => { result = value; };
  showcase.startCombat(
    { id: 'unknown', name: '？？？', hp: 30, atk: 0, def: 0, spd: 0 },
    { A: 1, B: 2, D: 3 },
    {
      autoStart: false,
      startReady: true,
      manualControl: true,
      enemyPassive: true,
      syncPlayerState: false,
      mode: 'showcase',
      controlledActorId: 'canjian',
      playerOverride: { hp: 50, maxHp: 50, mp: 0, maxMp: 0, atk: 1, def: 99, critProb: 0, dodge: 1 },
    }
  );
  assert.strictEqual(showcase.castSlot('B').reason, 'wrong-order');
  assert.strictEqual(showcase.castSlot('A').ok, true);
  assert.strictEqual(showcase.castSlot('B').ok, true);
  assert.strictEqual(showcase.castSlot('D').ok, true);
  assert.strictEqual(showcase.battleState.enemy.hp, 0, 'zero defense must remain zero so three authored strikes land exactly');
  assert.strictEqual(result.outcome, 'victory');
  assert.strictEqual(persistent.hp, 100, 'showcase must not overwrite player HP');
  console.log('  PASS sparse chart loop, manual sequence, HP-zero victory, state isolation');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
