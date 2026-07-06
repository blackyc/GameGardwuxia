// patch_test_p2.cjs - Insert P2 test into data-validate.test.cjs
const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, '..', 'test', 'data-validate.test.cjs');
const lines = fs.readFileSync(testFile, 'utf8').split('\n');

// Find the line with result summary marker
let insertIdx = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('\u7ed3\u679c\u6c47\u603b')) {
    insertIdx = i;
    break;
  }
}

if (insertIdx < 0) {
  console.error('Cannot find result summary marker');
  process.exit(1);
}

// Find the "//" comment line before the marker
// Go back to find the empty line before the comment block
let commentStart = insertIdx;
while (commentStart > 0 && lines[commentStart - 1].startsWith('//')) {
  commentStart--;
}
// Skip one more empty line if exists
if (commentStart > 0 && lines[commentStart - 1].trim() === '') {
  commentStart--;
}

const newTests = [
  '// P2: manifest vs index.html order check',
  "const { execSync } = require('child_process');",
  "test('manifest.js and index.html script order match', () => {",
  '  try {',
  "    execSync('node work/generate-script-tags.cjs', {",
  "      cwd: path.join(__dirname, '..'),",
  "      stdio: 'pipe',",
  '    });',
  '  } catch (e) {',
  "    assert.fail('manifest vs index.html mismatch: ' + (e.stdout ? e.stdout.toString() : e.message));",
  '  }',
  '});',
  '',
  '',
];

// Insert before the result summary block
lines.splice(commentStart, 0, ...newTests);

fs.writeFileSync(testFile, lines.join('\n'), 'utf8');
console.log('Inserted P2 test at line', commentStart + 1);
console.log('New file size:', lines.length, 'lines');
