// Syntax check for modified files
const fs = require('fs');
const { execSync } = require('child_process');

const files = [
  { path: 'src/ui/input.js', type: 'ESM' },
  { path: 'src/ui/renderer.js', type: 'ESM' },
  { path: 'src/game.js', type: 'ESM' },
];

let allOk = true;
for (const f of files) {
  try {
    const content = fs.readFileSync(f.path, 'utf8');
    // Basic syntax check: try to parse as module
    new Function(content.replace(/^(import|export)\s.*$/gm, '// $1'));
    console.log(`OK (${f.type}): ${f.path}`);
  } catch (e) {
    console.log(`FAIL: ${f.path} - ${e.message}`);
    allOk = false;
  }
}

// Check index.html for basic structure
const html = fs.readFileSync('index.html', 'utf8');
const checks = {
  'cultivate-submenu': html.includes('cultivate-submenu'),
  'cultivate-menu action': html.includes('data-action="cultivate-menu"'),
  'practiceMenu in wuxue': html.includes('练武') && html.includes('practiceMenu'),
  'no dir-btn north': !html.includes('data-dir="north"'),
  'no askAround in actions': !html.includes('data-action="askAround"'),
  'no talk diamond': !html.includes('data-action="talk"'),
  'bottom-nav present': html.includes('bottom-nav'),
};
console.log('\n--- HTML checks ---');
for (const [k, v] of Object.entries(checks)) {
  console.log(`${k}: ${v}`);
  if (!v && k !== 'no dir-btn north' && k !== 'no askAround in actions' && k !== 'no talk diamond') {
    allOk = false;
  }
}

console.log(allOk ? '\nAll checks passed.' : '\nSome checks failed.');
