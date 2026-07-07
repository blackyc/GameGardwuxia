// CDP check script — verify jianghu page renders correctly
const http = require('http');

function getTargets() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function main() {
  let targets;
  try {
    targets = await getTargets();
  } catch (e) {
    console.log('CDP_NOT_AVAILABLE:', e.message);
    process.exit(0);
  }
  const page = targets.find(t => t.type === 'page');
  if (!page) { console.log('NO_PAGE'); process.exit(0); }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();

  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.addEventListener('open', async () => {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://127.0.0.1:3001/' });
    await new Promise(r => setTimeout(r, 6000));

    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const checks = {};
        // 江湖页核心元素
        checks.roomCard = !!document.getElementById('room-card');
        checks.roomName = document.getElementById('location-name')?.textContent || 'MISSING';
        checks.roomDesc = (document.getElementById('location-desc')?.textContent || '').slice(0, 50);
        checks.roomNpcs = document.getElementById('room-npcs')?.innerHTML || 'MISSING';
        checks.diamondBadges = document.querySelectorAll('.diamond-badge').length;
        checks.cultivateSubmenu = !!document.getElementById('cultivate-submenu');
        checks.cultivateSubmenuDisplay = document.getElementById('cultivate-submenu')?.style.display || 'N/A';
        checks.recentLog = !!document.querySelector('.recent-log');
        checks.logArea = !!document.getElementById('log-area');
        checks.perceptionPanel = !!document.getElementById('perception-panel');
        checks.perceptionPanelClass = document.getElementById('perception-panel')?.className || 'MISSING';
        // 已删除的元素（应为false）
        checks.oldCardProgress = !!document.getElementById('card-progress');
        checks.oldCardLocation = !!document.getElementById('card-location');
        checks.oldCardActions = !!document.getElementById('card-actions');
        checks.oldCardLog = !!document.getElementById('card-log');
        checks.oldTimeBar = !!document.getElementById('time-bar');
        checks.oldPageHeader = !!document.querySelector('.page-header');
        // 底部导航
        checks.bottomNav = !!document.querySelector('.bottom-nav');
        // app可见性
        checks.appVisibility = document.getElementById('app')?.style.visibility || 'default';
        // 当前active page
        checks.activePage = document.querySelector('.page.active')?.dataset.page || 'MISSING';
        return JSON.stringify(checks, null, 2);
      })()`,
      returnByValue: true
    });

    console.log(result.result?.value || result.error || 'UNKNOWN');
    ws.close();
  });
}

main().catch(e => console.log('ERROR:', e.message));
