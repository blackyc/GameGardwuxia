const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  PASS ' + name);
  } catch (error) {
    failed++;
    console.log('  FAIL ' + name + ': ' + error.message);
  }
}

(async () => {
  const { RouteService } = await import(pathToFileURL(path.join(ROOT, 'src', 'route_service.js')).href);
  const game = {
    state: { location: 'A', routeDiscoveries: {}, explored: ['A'] },
    LOCATIONS: {
      A: {
        connections: { north: 'B', back: 'B', secret: 'D' },
        routeSketch: {
          secret: {
            id: 'route_secret',
            discovery: { hint: 'A faint draft', revealLabel: 'Inspect' }
          }
        }
      },
      B: {},
      D: {}
    },
    markDirty() {}
  };
  const routes = new RouteService(game);

  console.log('\nRoute service test');
  test('known paths remain visible and clickable', () => {
    const north = routes.getRoutes().find(route => route.direction === 'north');
    assert.strictEqual(north.state, 'known');
    assert.strictEqual(north.clickable, true);
  });
  test('legacy fallback edge to the same room is normalized to one destination', () => {
    const toB = routes.getRoutes().filter(route => route.target === 'B');
    assert.strictEqual(toB.length, 1);
    assert.strictEqual(toB[0].direction, 'north');
  });
  test('hidden route cannot leak or be entered before perception', () => {
    const secret = routes.getRoutes().find(route => route.direction === 'secret');
    assert.strictEqual(secret.state, 'hidden');
    assert.strictEqual(routes.getRouteAccess('secret').allowed, false);
  });
  test('perception reveals only a trace before explicit confirmation', () => {
    routes.senseCurrentRoom();
    assert.strictEqual(routes.getRoutes().find(route => route.direction === 'secret').state, 'sensed');
    assert.strictEqual(routes.getRouteAccess('secret').allowed, false);
  });
  test('confirmed route becomes enterable and persists as revealed', () => {
    assert.strictEqual(routes.revealRoute('route_secret').ok, true);
    assert.strictEqual(routes.getRouteAccess('secret').allowed, true);
    assert.strictEqual(game.state.routeDiscoveries.route_secret, 'revealed');
  });
  test('real data includes the first authored perception route', () => {
    const integration = fs.readFileSync(path.join(ROOT, 'public', 'data', 'integration_v2.js'), 'utf8');
    assert.ok(integration.includes('route_jubao_hidden_cache'));
    assert.ok(integration.includes("room.routeSketch['暗格']"));
    assert.ok(integration.includes('alreadyReturns'), 'reverse-edge integration must reject duplicate fallback routes');
  });

  console.log('Route service result: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed > 0 ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
