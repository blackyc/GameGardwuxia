/**
 * v17-non-ui.test.cjs — V1.7 非 UI 服务层确定性测试
 *
 * 运行: node temp/v17-non-ui.test.cjs
 * 不启动浏览器。
 */

const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const ret = fn();
    if (ret && typeof ret.then === 'function') {
      throw new Error('async test must be awaited externally');
    }
    passed++;
    console.log('  PASS ' + name);
  } catch (error) {
    failed++;
    console.log('  FAIL ' + name + ': ' + error.message);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed++;
    console.log('  PASS ' + name);
  } catch (error) {
    failed++;
    console.log('  FAIL ' + name + ': ' + error.message);
  }
}

function createMockLocalStorage(initial) {
  const data = { ...(initial || {}) };
  return {
    _data: data,
    getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); },
    removeItem(k) { delete data[k]; },
    clear() { Object.keys(data).forEach((k) => delete data[k]); },
  };
}

function makeGameStub(overrides = {}) {
  const state = {
    activeQuests: [],
    completedQuests: [],
    questStages: {},
    questProgress: {},
    primaryQuestId: null,
    explored: ['应天府·十字街口', '应天府·醉仙楼'],
    location: '应天府·十字街口',
    routeDiscoveries: {},
    mapWaypoint: null,
    weather: { seed: 42, regions: {} },
    gameTime: 0,
    gameStart: 1000,
    inventory: [],
    techniques: [],
    copperCoins: 0,
    spiritStones: 0,
    factionRep: 0,
    daoxin: 100,
    maxDaoXin: 100,
    hp: 100,
    maxHp: 100,
    cultivation: 0,
    ...overrides.state,
  };

  const QUESTS = overrides.QUESTS || [
    {
      id: 'q_go',
      name: '寻路',
      desc: '去指定房间',
      stages: [
        { type: 'go', roomId: '应天府·醉仙楼', desc: '前往醉仙楼' },
      ],
      rewards: {},
    },
    {
      id: 'q_talk',
      name: '问讯',
      desc: '与指定 NPC 对话',
      stages: [
        { type: 'talk', npcId: '跑堂', target: '跑堂', location: '应天府·醉仙楼', desc: '找跑堂打听' },
      ],
      rewards: {},
    },
    {
      id: 'q_count',
      name: '连杀',
      desc: '击杀两名敌人',
      stages: [
        { type: 'kill', target: '野猪', count: 2, desc: '击杀野猪×2' },
      ],
      rewards: {},
    },
    {
      id: 'q_side',
      name: '支线',
      desc: '支线任务',
      stages: [
        { type: 'go', roomId: '应天府·正阳门', desc: '去正阳门' },
      ],
      rewards: {},
    },
  ];

  const LOCATIONS = overrides.LOCATIONS || {
    '应天府·十字街口': {
      name: '十字街口',
      connections: {
        北: '应天府·醉仙楼',
        暗道: '应天府·暗室',
      },
      routeSketch: {
        暗道: {
          id: 'route_secret_cellar',
          discovery: { hint: '风缝', revealLabel: '细察' },
        },
      },
    },
    '应天府·醉仙楼': {
      name: '醉仙楼',
      weatherExposure: 'indoor',
      connections: { 南: '应天府·十字街口' },
    },
    '应天府·暗室': {
      name: '暗室',
      connections: { 出: '应天府·十字街口' },
    },
    '应天府·正阳门': {
      name: '正阳门',
      weatherExposure: 'outdoor',
      connections: {},
    },
    '问剑峰·大雄宝殿': {
      name: '大雄宝殿',
      connections: {},
    },
  };

  const logs = [];
  const game = {
    state,
    QUESTS,
    LOCATIONS,
    ITEMS: [],
    markDirty() {},
    addLog(msg) { logs.push(msg); },
    addMoney() {},
    addSpiritStones() {},
    getMoneyName() { return '铜钱'; },
    showMomentFeedback() {},
    joinFaction() {},
    checkBreakthrough() {},
    renderer: { updateUI() {} },
    logs,
  };
  return game;
}

(async () => {
  const { normalizeQuestEvent, stageMatchesEvent } = await import(
    pathToFileURL(path.join(SRC, 'contracts', 'quest_event.js')).href
  );
  const { QuestService } = await import(pathToFileURL(path.join(SRC, 'quest_service.js')).href);
  const {
    loadAudioPreferences,
    saveAudioPreferences,
    AUDIO_PREFS_KEY,
    DEFAULT_AUDIO_PREFERENCES,
  } = await import(pathToFileURL(path.join(SRC, 'audio', 'audio_preferences.js')).href);
  const { AudioManager } = await import(pathToFileURL(path.join(SRC, 'audio', 'AudioManager.js')).href);
  const { MapService } = await import(pathToFileURL(path.join(SRC, 'map_service.js')).href);
  const { RouteService } = await import(pathToFileURL(path.join(SRC, 'route_service.js')).href);
  const { WeatherService, resolveWeatherType, inferWeatherExposure } = await import(
    pathToFileURL(path.join(SRC, 'weather_service.js')).href
  );
  const { MomentFeedbackQueue } = await import(
    pathToFileURL(path.join(SRC, 'moment_feedback_queue.js')).href
  );

  console.log('\n=== V1.7 Non-UI Worker Tests ===\n');

  // ── A. Quest ──────────────────────────────────────
  console.log('[A] Quest progress');

  test('normalizeQuestEvent legacy go signature', () => {
    const e = normalizeQuestEvent('go', '问剑峰·剑坪');
    assert.strictEqual(e.type, 'go');
    assert.strictEqual(e.targetId, '问剑峰·剑坪');
    assert.strictEqual(e.roomId, '问剑峰·剑坪');
    assert.strictEqual(e.amount, 1);
  });

  test('1. wrong room does not advance go stage', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_go');
    qs.checkQuestProgress('go', '应天府·正阳门');
    assert.strictEqual(game.state.questProgress.q_go.stageIndex, 0);
    assert.ok(!game.state.completedQuests.includes('q_go'));
  });

  test('correct room advances go stage', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_go');
    qs.checkQuestProgress('go', '应天府·醉仙楼');
    assert.ok(game.state.completedQuests.includes('q_go'));
  });

  test('2. wrong NPC does not advance talk stage', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_talk');
    qs.checkQuestProgress({ type: 'talk', npcId: '路人甲', targetId: '路人甲' });
    assert.strictEqual(game.state.questProgress.q_talk.stageIndex, 0);
    assert.ok(!game.state.completedQuests.includes('q_talk'));
  });

  test('correct NPC advances talk stage', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_talk');
    qs.checkQuestProgress({ type: 'talk', npcId: '跑堂', targetId: '跑堂' });
    assert.ok(game.state.completedQuests.includes('q_talk'));
  });

  test('go event cannot advance talk stage', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_talk');
    qs.checkQuestProgress('go', '应天府·醉仙楼');
    assert.strictEqual(game.state.questProgress.q_talk.stageIndex, 0);
  });

  test('3. same eventId only counts once', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_count');
    qs.checkQuestProgress({ type: 'kill', targetId: '野猪', eventId: 'kill-1', amount: 1 });
    qs.checkQuestProgress({ type: 'kill', targetId: '野猪', eventId: 'kill-1', amount: 1 });
    assert.strictEqual(game.state.questProgress.q_count.current, 1);
    assert.strictEqual(game.state.questProgress.q_count.stageIndex, 0);
  });

  test('4. count stage does not complete before target', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_count');
    qs.checkQuestProgress({ type: 'kill', targetId: '野猪', eventId: 'a' });
    assert.ok(!game.state.completedQuests.includes('q_count'));
    assert.strictEqual(game.state.questProgress.q_count.current, 1);
    qs.checkQuestProgress({ type: 'kill', targetId: '野猪', eventId: 'b' });
    assert.ok(game.state.completedQuests.includes('q_count'));
  });

  test('5. first quest is primary; second does not overwrite', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_go');
    qs.startQuest('q_side');
    assert.strictEqual(game.state.primaryQuestId, 'q_go');
    assert.deepStrictEqual(game.state.activeQuests, ['q_go', 'q_side']);
  });

  test('6. completing primary switches to next active quest', () => {
    const game = makeGameStub();
    const qs = new QuestService(game);
    qs.startQuest('q_go');
    qs.startQuest('q_side');
    qs.checkQuestProgress('go', '应天府·醉仙楼');
    assert.ok(game.state.completedQuests.includes('q_go'));
    assert.strictEqual(game.state.primaryQuestId, 'q_side');
    const summary = qs.getPrimaryQuestSummary();
    assert.strictEqual(summary.questId, 'q_side');
    assert.strictEqual(summary.name, '支线');
    assert.ok(typeof summary.objective === 'string');
    assert.ok(!('innerHTML' in summary));
  });

  // ── B. Audio ──────────────────────────────────────
  console.log('\n[B] Audio preferences');

  test('7. corrupt audio preference JSON does not block startup', () => {
    const store = createMockLocalStorage({ [AUDIO_PREFS_KEY]: '{not-json' });
    const prefs = loadAudioPreferences(store);
    assert.strictEqual(prefs.bgmVolume, DEFAULT_AUDIO_PREFERENCES.bgmVolume);
    const am = new AudioManager(store);
    assert.strictEqual(am.getPreferences().masterMuted, false);
    assert.doesNotThrow(() => am.startBgm());
  });

  test('8. mute preference survives reload', () => {
    const store = createMockLocalStorage();
    const am1 = new AudioManager(store);
    am1.setBgmMuted(true);
    am1.setSfxMuted(true);
    const am2 = new AudioManager(store);
    const prefs = am2.getPreferences();
    assert.strictEqual(prefs.bgmMuted, true);
    assert.strictEqual(prefs.sfxMuted, true);
    assert.strictEqual(am2._bgmMuted, true);
    assert.strictEqual(am2._sfxMuted, true);
  });

  test('9. intro temporary mute ends but keeps user mute preference', () => {
    const store = createMockLocalStorage();
    const am = new AudioManager(store);
    am.setBgmMuted(true);
    am.setSfxMuted(true);
    am.pushTemporaryMute('intro');
    assert.strictEqual(am._bgmMuted, true);
    assert.strictEqual(am._sfxMuted, true);
    // 临时静音不得改写偏好
    const raw = JSON.parse(store.getItem(AUDIO_PREFS_KEY));
    assert.strictEqual(raw.bgmMuted, true);
    am.popTemporaryMute('intro');
    am.popTemporaryMute('intro'); // 幂等
    assert.strictEqual(am.getPreferences().bgmMuted, true);
    assert.strictEqual(am._bgmMuted, true);
    assert.strictEqual(am._sfxMuted, true);
  });

  test('setMuted only affects SFX preference', () => {
    const store = createMockLocalStorage();
    const am = new AudioManager(store);
    am.setBgmMuted(false);
    am.setMuted(true);
    assert.strictEqual(am.getPreferences().sfxMuted, true);
    assert.strictEqual(am.getPreferences().bgmMuted, false);
  });

  test('pushTemporaryMute does not force unmute after pop when user unmuted', () => {
    const store = createMockLocalStorage();
    const am = new AudioManager(store);
    am.setBgmMuted(false);
    am.pushTemporaryMute('intro');
    assert.strictEqual(am._bgmMuted, true);
    am.popTemporaryMute('intro');
    assert.strictEqual(am._bgmMuted, false);
  });

  // ── C. Map ────────────────────────────────────────
  console.log('\n[C] Map service');

  test('10. local graph hides undiscovered secret room real id', () => {
    const game = makeGameStub();
    game.routes = new RouteService(game);
    const map = new MapService(game);
    const graph = map.getLocalGraph('应天府·十字街口', { depth: 2 });
    const ids = graph.nodes.map((n) => n.id);
    assert.ok(!ids.includes('应天府·暗室'), 'hidden room id must not appear: ' + ids.join(','));
    const edgesToSecret = graph.edges.filter((e) => e.to === '应天府·暗室');
    assert.strictEqual(edgesToSecret.length, 0);
  });

  test('sensed route appears as anonymous node without real room id', () => {
    const game = makeGameStub();
    game.routes = new RouteService(game);
    game.routes.senseCurrentRoom();
    const map = new MapService(game);
    const graph = map.getLocalGraph('应天府·十字街口');
    assert.ok(!graph.nodes.some((n) => n.id === '应天府·暗室'));
    assert.ok(graph.nodes.some((n) => n.hidden && n.label === '？？？'));
  });

  test('11. setWaypoint rejects unexplored rooms', () => {
    const game = makeGameStub();
    const map = new MapService(game);
    const bad = map.setWaypoint('应天府·暗室');
    assert.strictEqual(bad.ok, false);
    assert.strictEqual(map.getWaypoint(), null);
    const good = map.setWaypoint('应天府·醉仙楼');
    assert.strictEqual(good.ok, true);
    assert.strictEqual(map.getWaypoint(), '应天府·醉仙楼');
  });

  // ── D. Weather ────────────────────────────────────
  console.log('\n[D] Weather service');

  test('12. same seed/time/zone yields same weather', () => {
    const a = resolveWeatherType(99, 4, '应天府');
    const b = resolveWeatherType(99, 4, '应天府');
    const c = resolveWeatherType(99, 6, '应天府');
    assert.strictEqual(a, b);
    // 不同时间槽允许不同（确定性下也可能相同，但不要求）
    assert.ok(typeof a === 'string');
    const game = makeGameStub({ state: { weather: { seed: 99, regions: {} }, gameTime: 4, location: '应天府·正阳门' } });
    const ws = new WeatherService(game);
    const w1 = ws.getWeatherForRoom('应天府·正阳门');
    const w2 = ws.getWeatherForRoom('应天府·正阳门');
    assert.strictEqual(w1.type, w2.type);
    assert.strictEqual(w1.type, resolveWeatherType(99, 4, '应天府'));
  });

  test('13. indoor room not visible rain but may hear rain sound variant', () => {
    // Force rain by scanning seeds until outdoor is rain, then check indoor same zone
    let seed = 1;
    let rainType = null;
    for (let s = 1; s < 5000; s++) {
      const t = resolveWeatherType(s, 4, '应天府');
      if (t === 'rain' || t === 'storm' || t === 'drizzle') {
        seed = s;
        rainType = t;
        break;
      }
    }
    assert.ok(rainType, 'could not find seed that yields wet weather');
    const game = makeGameStub({
      state: {
        weather: { seed, regions: {} },
        gameTime: 4,
        location: '应天府·醉仙楼',
        explored: ['应天府·醉仙楼', '应天府·正阳门'],
      },
    });
    const ws = new WeatherService(game);
    const indoor = ws.getWeatherForRoom('应天府·醉仙楼');
    assert.strictEqual(indoor.exposure, 'indoor');
    assert.strictEqual(indoor.visible, false);
    assert.strictEqual(indoor.type, rainType);
    assert.ok(
      indoor.descriptionVariant === 'indoor_rain_sound' || indoor.descriptionVariant === 'indoor_storm_sound' || indoor.descriptionVariant === 'indoor_neutral',
      indoor.descriptionVariant
    );
    if (rainType === 'rain' || rainType === 'storm' || rainType === 'drizzle') {
      assert.strictEqual(indoor.descriptionVariant, 'indoor_rain_sound');
    }
    assert.strictEqual(inferWeatherExposure('应天府·醉仙楼', game.LOCATIONS['应天府·醉仙楼']), 'indoor');
  });

  test('no Math.random in weather resolve path', () => {
    const src = require('fs').readFileSync(path.join(SRC, 'weather_service.js'), 'utf8');
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.ok(!codeOnly.includes('Math.random'), 'weather_service must not call Math.random');
  });

  // ── E. Moment feedback ────────────────────────────
  console.log('\n[E] Moment feedback queue');

  test('14. same eventId deduped; reward merges amount', () => {
    const q = new MomentFeedbackQueue();
    assert.strictEqual(q.enqueue({ eventId: 'r1', text: '灵石 +10', kind: 'reward', amount: 10, createdAt: 1000 }), true);
    assert.strictEqual(q.enqueue({ eventId: 'r1', text: '灵石 +10', kind: 'reward', amount: 10, createdAt: 1010 }), false);
    // 不同 eventId、相同 kind+text、500ms 内合并
    assert.strictEqual(q.enqueue({ eventId: 'r2', text: '灵石 +10', kind: 'reward', amount: 5, createdAt: 1200 }), true);
    const first = q.takeNext();
    assert.strictEqual(first.amount, 15);
    assert.strictEqual(q.takeNext(), null);
  });

  test('quest kind is not dropped before non-priority when over capacity', () => {
    const q = new MomentFeedbackQueue();
    q.enqueue({ eventId: 'a', text: 'info1', kind: 'info', amount: 1, createdAt: 1 });
    q.enqueue({ eventId: 'b', text: 'quest1', kind: 'quest', amount: 1, createdAt: 2 });
    q.enqueue({ eventId: 'c', text: 'clue1', kind: 'clue', amount: 1, createdAt: 3 });
    q.enqueue({ eventId: 'd', text: 'reward1', kind: 'reward', amount: 1, createdAt: 4 });
    // active + 2 waiting; d should cause drop of non-priority (info already active, so reward may drop or info stays active)
    const kinds = [];
    let item;
    while ((item = q.takeNext())) kinds.push(item.kind);
    assert.ok(kinds.includes('quest'));
    assert.ok(kinds.includes('clue'));
  });

  // ── Schema fields present ─────────────────────────
  console.log('\n[Schema]');

  await testAsync('SAVE_SCHEMA includes primaryQuestId and questProgress', async () => {
    const schema = await import(pathToFileURL(path.join(SRC, 'core', 'save_schema.js')).href);
    assert.ok(schema.SAVE_SCHEMA.primaryQuestId);
    assert.ok(schema.SAVE_SCHEMA.questProgress);
    assert.ok(schema.SAVE_SCHEMA.weather);
    assert.ok(schema.SAVE_SCHEMA.mapWaypoint);
    assert.strictEqual(schema.SAVE_SCHEMA.primaryQuestId.nullable, true);
  });

  console.log('\nResult: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
