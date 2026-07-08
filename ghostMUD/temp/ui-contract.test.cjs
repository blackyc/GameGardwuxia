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

test('NPC cards expose only names until focused', () => {
  const buttonsStart = renderer.indexOf('const buttons = list.map');
  const dossierStart = renderer.indexOf("let dossier = ''", buttonsStart);
  assert.ok(buttonsStart >= 0 && dossierStart > buttonsStart, 'NPC button renderer block missing');
  const buttonBlock = renderer.slice(buttonsStart, dossierStart);
  assert.ok(buttonBlock.includes('room-npc-card'), 'NPC buttons missing room-npc-card');
  assert.ok(!buttonBlock.includes('focused.desc'), 'NPC card button must not render focused description');
  assert.ok(renderer.includes('npc-dossier-desc'), 'focused dossier description missing');
  assert.ok(renderer.includes('npc-dossier-memory'), 'focused dossier memory line missing');
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
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('UI contract result: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  - ' + f.name + ': ' + f.error);
}
process.exit(failed > 0 ? 1 : 0);
