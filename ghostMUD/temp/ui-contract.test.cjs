const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const jianghuCss = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'jianghu.css'), 'utf8');
const renderer = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'renderer.js'), 'utf8');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log('  ✗ ' + name);
    console.log('    → ' + e.message);
  }
}

function pos(token) {
  const index = html.indexOf(token);
  assert.ok(index >= 0, 'missing HTML token: ' + token);
  return index;
}

function assertCss(regex, label) {
  assert.ok(regex.test(jianghuCss), 'missing CSS contract: ' + label);
}

console.log('\nUI contract test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

test('jianghu page keeps the three fixed visual zones in order', () => {
  const z1 = pos('class="location-banner"');
  const z2 = pos('class="jianghu-main-zone"');
  const z3 = pos('class="recent-log"');
  assert.ok(z1 < z2 && z2 < z3, 'zones must be banner -> main -> log');
  assert.ok(pos('id="location-name"') < z2, 'room name must stay in zone 1');
  assert.ok(pos('id="location-desc"') > z2 && pos('id="location-desc"') < z3, 'scene prose must stay in zone 2');
  assert.ok(pos('id="room-npcs"') > z2 && pos('id="room-npcs"') < z3, 'NPC cards must stay in zone 2');
  assert.ok(pos('id="log-area"') > z3, 'recent log must stay in zone 3');
});

test('jianghu CSS preserves mobile background segmentation contract', () => {
  assertCss(/body\[data-page="jianghu"\]\s+#scene-bg[\s\S]*background-image:\s*url\('\/ui\/jianghu-mobile-bg\.jpg'\)/, 'scene background image');
  assertCss(/\.location-banner\s*\{[\s\S]*position:\s*absolute[\s\S]*top:\s*18px/, 'zone 1 absolute banner');
  assertCss(/\.jianghu-main-zone\s*\{[\s\S]*top:\s*12\.5dvh[\s\S]*height:\s*60\.5dvh/, 'zone 2 main proportions');
  assertCss(/\.page\[data-page="jianghu"\]\s+\.recent-log\s*\{[\s\S]*top:\s*73dvh/, 'zone 3 log anchor');
});

test('NPC card hotfix keeps name tags compact', () => {
  assertCss(/\.page\[data-page="jianghu"\]\s+\.room-npc-list\s*\{[\s\S]*display:\s*flex[\s\S]*flex-wrap:\s*wrap/, 'NPC list uses compact wrapping tags');
  assertCss(/\.page\[data-page="jianghu"\]\s+\.room-npc-card\s*\{[\s\S]*flex:\s*0 0 auto[\s\S]*max-width:\s*148px/, 'NPC card compact width');
  assert.ok(renderer.includes('const canSpar = focused.canSpar !== false'), 'focused dossier must derive robust canSpar');
});

test('NPC cards expose only names until focused', () => {
  const buttonsStart = renderer.indexOf('const buttons = list.map');
  const dossierStart = renderer.indexOf("let dossier = ''", buttonsStart);
  assert.ok(buttonsStart >= 0 && dossierStart > buttonsStart, 'NPC button renderer block missing');
  const buttonBlock = renderer.slice(buttonsStart, dossierStart);
  assert.ok(buttonBlock.includes('room-npc-card'), 'NPC buttons missing room-npc-card');
  assert.ok(!buttonBlock.includes('focused.desc'), 'NPC card button must not render focused description');
  assert.ok(renderer.includes('npc-dossier-desc'), 'focused dossier description missing');
  assert.ok(renderer.includes('npc-dossier-relation'), 'focused dossier inline relation missing');
  assert.ok(!renderer.includes('data-action="closeNpcFocus">收起'), 'focused dossier must collapse from its selected name chip');
  ['交谈', '切磋', '送礼', '打听'].forEach(label => assert.ok(renderer.includes("npcAction('" + label), 'missing NPC action: ' + label));
});

test('ink dialogue layer keeps history and choices inside one shell', () => {
  ['id="npc-modal"', 'id="npc-title"', 'id="npc-desc"', 'id="npc-choices"', 'id="dialogue-history-drawer"'].forEach(token => pos(token));
  assertCss(/\.dialogue-layer\s*\{[\s\S]*position:\s*fixed/, 'dialogue layer fixed overlay');
  assertCss(/\.dialogue-scroll\s*\{[\s\S]*max-height:\s*min\(78vh,\s*690px\)/, 'dialogue shell bounded height');
  assertCss(/\.dialogue-choices\s*\{[\s\S]*flex-direction:\s*column/, 'choices vertical stack');
});

test('scene feed and recent log stay separated', () => {
  assert.ok(renderer.includes("type === 'scene' || type === 'dialogue'"), 'scene/dialogue should route to scene feed');
  assert.ok(renderer.includes("document.getElementById('log-area')"), 'recent log target missing');
  assertCss(/\.page\[data-page="jianghu"\]\s+#log-area\s+\.log-entry:nth-last-child\(n \+ 6\)/, 'recent log caps visible entries');
});

test('diamond action buttons keep circular inner lining', () => {
  assertCss(/\.page\[data-page="jianghu"\]\s+\.diamond-badge::before\s*\{[\s\S]*border-radius:\s*50%/, 'diamond inner circular lining');
  assert.ok(html.includes('<span class="label">察看</span>'), 'scene observation action missing');
  assert.ok(html.includes('<span class="label">探索</span>'), 'scene search action missing');
});

test('perception no longer duplicates NPC, rumor or search controls', () => {
  const start = renderer.indexOf('renderPerception(data)');
  const end = renderer.indexOf('// === 内部工具 ===', start);
  const block = renderer.slice(start, end);
  assert.ok(!block.includes('> 在场人物'), 'perception must not duplicate scene NPCs');
  assert.ok(!block.includes('> 可打听'), 'perception must not keep room-level rumor action');
  assert.ok(!block.includes('> 可探索'), 'perception must not duplicate the search action');
  assert.ok(!block.includes('perc-close'), 'perception must collapse from the 察看 trigger');
});

test('only NPC name chips use layered irregular ink strokes', () => {
  assertCss(/\.room-npc-card\.npc-chip::before[\s\S]*clip-path:\s*polygon/, 'rough NPC name-chip outer stroke');
  assert.ok(!jianghuCss.includes('.npc-dossier::before'), 'NPC detail cards keep their regular double-line frame');
  ['guide', 'key', 'locked', 'selected'].forEach(state => assert.ok(jianghuCss.includes('npc-chip--' + state), 'missing chip state: ' + state));
});

test('chapter two tap tasks have a dedicated live panel before scene prose', () => {
  const panel = pos('id="tutorial-action-panel"');
  const feed = pos('id="scene-feed"');
  assert.ok(panel < feed, 'tutorial action panel must precede the scene feed');
  assert.ok(html.includes('class="tutorial-action-panel"'), 'tutorial action panel class missing');
  assert.ok(renderer.includes('renderTutorialActionPanel'), 'tutorial action renderer missing');
  assert.ok(renderer.includes('data-tutorial-action'), 'tutorial action payload missing');
});

test('combat dialog exposes five manual chart slots and live playback', () => {
  assert.ok(html.includes('id="combat-modal" role="dialog" aria-modal="true"'), 'combat modal semantics missing');
  assert.ok(html.includes('id="combat-title" tabindex="-1"'), 'combat title focus fallback missing');
  assert.strictEqual((html.match(/data-action="combatSlot"/g) || []).length, 5, 'combat must expose five chart slots');
  assert.ok(html.includes('id="combat-log" aria-live="polite"'), 'combat playback must be announced');
  assert.ok(renderer.includes('dataset.state = slot.state'), 'combat slot state contract missing');
});

test('route sketch resolves overlapping exits before drawing and clicking', () => {
  assert.ok(renderer.includes('function resolveRoutePoints(routes)'), 'route collision resolver missing');
  assert.ok(renderer.includes('const routePoints = resolveRoutePoints([...visibleRoutes, ...sensedRoutes])'), 'route renderer must resolve all visible and sensed points together');
  assert.ok(renderer.includes('routePoints.get(route.id) || routePoint(route)'), 'route nodes and lines must consume resolved positions');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('UI contract result: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f.name + ': ' + f.error);
}
process.exit(failed > 0 ? 1 : 0);
