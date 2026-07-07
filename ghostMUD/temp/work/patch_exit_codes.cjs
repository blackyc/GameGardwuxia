// patch_exit_codes.cjs - Add process.exit to test files
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '..', 'test');
const files = ['data-validate.test.cjs', 'save-schema.test.cjs', 'smoke.test.cjs'];

for (const file of files) {
  const fp = path.join(testDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Check if process.exit already exists
  if (content.includes('process.exit(failed')) {
    console.log(`${file}: already has process.exit, skipping`);
    continue;
  }
  
  // Find the last occurrence of "process.exit" or the results block
  // Pattern: at end of file, after "failures.forEach(...)" or similar
  // We need to add process.exit(failed > 0 ? 1 : 0) before module.exports
  
  // Look for module.exports
  const exportIdx = content.lastIndexOf('module.exports');
  if (exportIdx < 0) {
    console.log(`${file}: no module.exports found, appending at end`);
    content += '\nprocess.exit(failed > 0 ? 1 : 0);\n';
    fs.writeFileSync(fp, content, 'utf8');
    console.log(`${file}: added process.exit at end`);
    continue;
  }
  
  // Insert before module.exports
  const insertCode = '\nprocess.exit(failed > 0 ? 1 : 0);\n\n';
  content = content.substring(0, exportIdx) + insertCode + content.substring(exportIdx);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`${file}: added process.exit before module.exports`);
}
