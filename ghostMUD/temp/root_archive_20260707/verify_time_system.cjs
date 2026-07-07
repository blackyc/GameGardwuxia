// 时间系统验证脚本
const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\MUD\\ghostMUD';
let allPass = true;

function check(name, cond) {
  console.log((cond ? '✅ ' : '❌ ') + name);
  if (!cond) allPass = false;
}

// === game.js ===
const gameJs = fs.readFileSync(path.join(ROOT, 'src/game.js'), 'utf-8');

check('TIME_NAMES 常量定义', gameJs.includes("const TIME_NAMES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']"));
check('state.gameTime: 0 初始化', gameJs.includes('gameTime: 0,'));
check('state.realTimeAccumulator: 0 初始化', gameJs.includes('realTimeAccumulator: 0'));
check('idleTick 中 realTimeAccumulator += 30000', gameJs.includes('s.realTimeAccumulator += 30000'));
check('idleTick 中 gameTime 推进逻辑', gameJs.includes('s.gameTime = (s.gameTime + 1) % 12'));
check('idleTick 中 renderer.updateTimeDisplay() 调用', gameJs.includes('this.renderer.updateTimeDisplay()'));
check('getRoomDesc(roomId) 方法定义', gameJs.includes('getRoomDesc(roomId)'));
check('isZiHour() 方法定义', gameJs.includes('isZiHour()'));
check('getTimeName() 方法定义', gameJs.includes('getTimeName()'));
check('explore 中竹林深处子时判定', gameJs.includes('target.includes(\'竹林深处\') && !this.isZiHour()'));
check('explore 中使用 getRoomDesc(target)', gameJs.includes('this.getRoomDesc(target)'));
check('getRoomDesc 中 desc_night 字段查询', gameJs.includes('desc_night'));
check('getRoomDesc 中 desc_morning 字段查询', gameJs.includes('desc_morning'));
check('getRoomDesc 中 desc_noon 字段查询', gameJs.includes('desc_noon'));
check('getRoomDesc 中 desc_dusk 字段查询', gameJs.includes('desc_dusk'));
check('getRoomDesc 中竹林深处排除逻辑', gameJs.includes('竹林深处'));

// === storage.js ===
const storageJs = fs.readFileSync(path.join(ROOT, 'src/core/storage.js'), 'utf-8');
check('storage.js 中 gameTime 序列化', storageJs.includes('gameTime: state.gameTime'));
check('storage.js 中 realTimeAccumulator 序列化', storageJs.includes('realTimeAccumulator: state.realTimeAccumulator'));

// === renderer.js ===
const rendererJs = fs.readFileSync(path.join(ROOT, 'src/ui/renderer.js'), 'utf-8');
check('renderer.js 中 updateTimeDisplay() 方法定义', rendererJs.includes('updateTimeDisplay()'));
check('renderer.js 中 time-display 元素引用', rendererJs.includes("'time-display'"));
check('renderer.js 中 getRoomDesc 调用（已有）', rendererJs.includes('this.game.getRoomDesc'));

// === index.html ===
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
check('index.html 中 time-bar 元素', indexHtml.includes('id="time-bar"'));
check('index.html 中 time-display 元素', indexHtml.includes('id="time-display"'));
check('index.html 中时辰标签文字', indexHtml.includes('时辰'));

// === main.css ===
const mainCss = fs.readFileSync(path.join(ROOT, 'src/styles/main.css'), 'utf-8');
check('main.css 中 #time-bar 样式', mainCss.includes('#time-bar'));
check('main.css 中 #time-display 样式', mainCss.includes('#time-display'));

// === 语法检查 ===
const acorn = require('acorn');
try {
  acorn.parse(gameJs, { ecmaVersion: 2022, sourceType: 'module' });
  check('game.js 语法正确', true);
} catch(e) {
  check('game.js 语法正确', false);
  console.log('  错误: ' + e.message);
  if (e.loc) {
    const lines = gameJs.split('\n');
    for (let i = Math.max(0, e.loc.line - 2); i < Math.min(lines.length, e.loc.line + 1); i++) {
      console.log('  ' + (i+1) + ': ' + lines[i]);
    }
  }
}

try {
  acorn.parse(rendererJs, { ecmaVersion: 2022, sourceType: 'module' });
  check('renderer.js 语法正确', true);
} catch(e) {
  check('renderer.js 语法正确', false);
  console.log('  错误: ' + e.message);
}

try {
  acorn.parse(storageJs, { ecmaVersion: 2022, sourceType: 'module' });
  check('storage.js 语法正确', true);
} catch(e) {
  check('storage.js 语法正确', false);
  console.log('  错误: ' + e.message);
}

console.log('\n' + (allPass ? '🎉 全部检查通过！' : '⚠️ 存在未通过的项目'));
process.exit(allPass ? 0 : 1);
