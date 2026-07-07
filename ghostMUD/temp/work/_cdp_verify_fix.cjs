// CDP 验证 IntroScene 修复后状态
const http = require('http');
const fs = require('fs');
const CDP_PORT = 3530;
const TARGET_URL = 'http://127.0.0.1:3001/';
const WAIT_MS = 8000;

function getTargets() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json`, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

function cdpSend(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e6);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  const targets = await getTargets();
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) { console.log('No page target. Start browser with --remote-debugging-port=' + CDP_PORT); process.exit(1); }
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r, e) => { ws.addEventListener('open', r); ws.addEventListener('error', e); });

  const logs = [];
  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        logs.push(`[${msg.params.type}] ${msg.params.args.map(a => a.value || '').join(' ')}`);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        logs.push(`[EXCEPTION] ${msg.params.exceptionDetails.text}`);
      }
    } catch(e) {}
  });

  await cdpSend(ws, 'Page.enable');
  await cdpSend(ws, 'Runtime.enable');
  await cdpSend(ws, 'Page.navigate', { url: TARGET_URL });
  await new Promise(r => setTimeout(r, WAIT_MS));

  // 检查 IntroScene 状态
  const check = await cdpSend(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const stage = document.getElementById('intro-stage');
      const nar = document.getElementById('intro-narrative');
      const choices = document.getElementById('intro-choices');
      const app = document.getElementById('app');
      const skip = document.getElementById('intro-skip');
      
      const result = {
        stageExists: !!stage,
        stageActive: stage ? stage.classList.contains('active') : false,
        stageDisplay: stage ? getComputedStyle(stage).display : 'N/A',
        appVisibility: app ? getComputedStyle(app).visibility : 'N/A',
        narrativeExists: !!nar,
        narrativeDisplay: nar ? getComputedStyle(nar).display : 'N/A',
        narrativeOffsetH: nar ? nar.offsetHeight : 0,
        narrativeOffsetW: nar ? nar.offsetWidth : 0,
        narrativeText: nar ? nar.textContent.slice(0, 80) : 'N/A',
        narrativeColor: nar ? getComputedStyle(nar).color : 'N/A',
        narrativeFontSize: nar ? getComputedStyle(nar).fontSize : 'N/A',
        narrativeWritingMode: nar ? getComputedStyle(nar).writingMode : 'N/A',
        choicesCount: choices ? choices.children.length : 0,
        skipVisible: skip ? getComputedStyle(skip).display : 'N/A',
        introSeen: (window.game && window.game.state) ? window.game.state.introSeen : 'no_game',
      };
      return JSON.stringify(result);
    })()`,
    returnByValue: true,
  });
  console.log('IntroScene state:', check.result.value);

  // 截图
  const sc = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('D:/MUD/ghostMUD/work/_screenshot_verify.png', Buffer.from(sc.data, 'base64'));
  console.log('Screenshot: work/_screenshot_verify.png');

  console.log('\n=== Console Logs ===');
  logs.forEach(l => console.log(l));

  ws.close();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
