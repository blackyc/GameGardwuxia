// Verify jianghu page HTML structure via HTTP fetch
const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetch('http://127.0.0.1:3001/');

  const checks = {
    // 新元素（应存在）
    roomCard: html.includes('id="room-card"'),
    diamondBadge: html.includes('diamond-badge'),
    cultivateSubmenu: html.includes('id="cultivate-submenu"'),
    cultivateMenu: html.includes('data-action="cultivate-menu"'),
    perceptionPanel: html.includes('id="perception-panel"'),
    recentLog: html.includes('recent-log') || html.includes('log-area'),
    bottomNav: html.includes('bottom-nav'),
    // 旧元素（应删除）
    oldCardProgress: html.includes('id="card-progress"'),
    oldCardLocation: html.includes('id="card-location"'),
    oldCardActions: html.includes('id="card-actions"'),
    oldCardLog: html.includes('id="card-log"'),
    oldTimeBar: html.includes('id="time-bar"'),
    oldPageHeader: html.includes('class="page-header"'),
    // 方向键（应删除）
    dirBtnNorth: html.includes('data-dir="north"'),
    dirBtnUp: html.includes('data-dir="up"'),
    // 旧行动按钮（应删除或移走）
    oldAskAround: html.includes('data-action="askAround"'),
    oldPushup: html.includes('data-action="pushup"') && !html.includes('cultivate-submenu'),
    oldPracticeMenu: html.includes('data-action="practiceMenu"') && !html.includes('wuxue'),
    oldAskTeacher: html.includes('data-action="askTeacher"'),
    oldTalk: html.includes('data-action="talk"'),
    oldSwitchPageWuxue: html.includes('data-action="switchPage" data-page="wuxue"'),
    oldSwitchPageRenwu: html.includes('data-action="switchPage" data-page="renwu"'),
    oldSwitchPageYutu: html.includes('data-action="switchPage" data-page="yutu"'),
  };

  console.log('=== 江湖页 HTML 结构检查 ===');
  for (const [k, v] of Object.entries(checks)) {
    const icon = v ? '✅' : '❌';
    console.log(`  ${icon} ${k}: ${v}`);
  }

  // 统计
  const passed = Object.values(checks).filter((v, i) => {
    const key = Object.keys(checks)[i];
    // 旧元素应该 false（删除成功），新元素应该 true
    return key.startsWith('old') ? !v : v;
  }).length;
  const total = Object.keys(checks).length;
  console.log(`\n  ${passed}/${total} checks passed`);

  // 感知面板 CSS 检查
  const css = await fetch('http://127.0.0.1:3001/src/styles/app_v3.css');
  const cssChecks = {
    perceptionFixed: css.includes('position: fixed') && css.includes('.perception-panel'),
    perceptionMaxHeight: css.includes('max-height: 0') && css.includes('.perception-panel'),
    perceptionInnerScroll: css.includes('max-height: 60vh') && css.includes('.perception-inner'),
  };
  console.log('\n=== 感知面板 CSS 检查 ===');
  for (const [k, v] of Object.entries(cssChecks)) {
    const icon = v ? '✅' : '❌';
    console.log(`  ${icon} ${k}: ${v}`);
  }
}

main().catch(e => console.log('ERROR:', e.message));
