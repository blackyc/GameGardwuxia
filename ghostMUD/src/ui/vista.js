// ============================================================
// vista.js — 江湖页 vista 时辰页头（诡仙归 V3.2 终稿移植）
// 十二时辰天色板 + 星辰萤火生成 + 鼠标视差。
// 颜色经 @property 注册的自定义属性过渡（见 vista.css）。
// DOM 契约（index.html）：#vista 容器、#vista-stars-svg、#vista-clouds、
// #vista-far、#vista-sun-disc、#vista-birds、#vista-near、#vista-ff、
// #vista-time-label / #vista-time-name。
// ============================================================

// 十二时辰色板：n=名 l=时 skyT/skyB=天色 far/mid/near=山色 cloud=云 sun=日色
// sx/sy=日位(%) so=日透明度 st=星 ff=萤火 bd=鸟
export const SHICHEN = [
  { n: '子', l: '夜半',   skyT: '#0A0E1A', skyB: '#1A2438', far: '#131B28', mid: '#0E141F', near: '#0A0E16', cloud: '#141C2A', sun: '#D8E2F2', sx: 68, sy: 26, so: 0.85, st: 1.00, ff: 0.85, bd: 0 },
  { n: '丑', l: '鸡鸣',   skyT: '#0C1020', skyB: '#1E2A42', far: '#151E2E', mid: '#101826', near: '#0C1220', cloud: '#182234', sun: '#D8E2F2', sx: 74, sy: 32, so: 0.72, st: 0.90, ff: 0.75, bd: 0 },
  { n: '寅', l: '平旦',   skyT: '#182238', skyB: '#4A3A48', far: '#2A2E40', mid: '#1E2434', near: '#161C2A', cloud: '#3A3450', sun: '#E8A868', sx: 80, sy: 52, so: 0.30, st: 0.45, ff: 0.40, bd: 0.10 },
  { n: '卯', l: '日出',   skyT: '#3A4A6A', skyB: '#C8865A', far: '#5A5468', mid: '#46445A', near: '#343448', cloud: '#B08A7A', sun: '#F2B872', sx: 78, sy: 44, so: 0.90, st: 0.08, ff: 0, bd: 0.60 },
  { n: '辰', l: '食时',   skyT: '#5A7A9A', skyB: '#D8C8A0', far: '#6E7A88', mid: '#5A6878', near: '#485668', cloud: '#D8CDB4', sun: '#F5D998', sx: 74, sy: 34, so: 1.00, st: 0, ff: 0, bd: 1 },
  { n: '巳', l: '隅中',   skyT: '#4A6E96', skyB: '#C8D2C8', far: '#62788A', mid: '#50657A', near: '#40546A', cloud: '#DCD8C8', sun: '#FAECC0', sx: 60, sy: 22, so: 1.00, st: 0, ff: 0, bd: 0.9 },
  { n: '午', l: '日中',   skyT: '#3E6490', skyB: '#BCCAC8', far: '#5A7285', mid: '#486078', near: '#3A5068', cloud: '#DCDCD2', sun: '#FFF8DC', sx: 50, sy: 16, so: 1.00, st: 0, ff: 0, bd: 0.7 },
  { n: '未', l: '日昳',   skyT: '#46688E', skyB: '#C4C4AC', far: '#5E7484', mid: '#4C6276', near: '#3E5266', cloud: '#D8D4BE', sun: '#FAF0C8', sx: 40, sy: 22, so: 1.00, st: 0, ff: 0, bd: 0.7 },
  { n: '申', l: '晡时',   skyT: '#54688A', skyB: '#C8AE84', far: '#6A7080', mid: '#565E70', near: '#464E60', cloud: '#CCB894', sun: '#F5DFA0', sx: 26, sy: 34, so: 1.00, st: 0, ff: 0, bd: 0.8 },
  { n: '酉', l: '日入',   skyT: '#5A4A6A', skyB: '#C87A4A', far: '#685468', mid: '#54485C', near: '#443E50', cloud: '#B08072', sun: '#F0A860', sx: 18, sy: 48, so: 0.95, st: 0.12, ff: 0, bd: 0.5 },
  { n: '戌', l: '黄昏',   skyT: '#2A2A48', skyB: '#6A4A52', far: '#3E3A54', mid: '#323048', near: '#28283C', cloud: '#5A4A62', sun: '#D88A68', sx: 12, sy: 62, so: 0.35, st: 0.55, ff: 0.30, bd: 0.15 },
  { n: '亥', l: '人定',   skyT: '#10141F', skyB: '#242A40', far: '#1A2232', mid: '#141A28', near: '#10141F', cloud: '#1E2636', sun: '#D8E2F2', sx: 60, sy: 24, so: 0.80, st: 0.95, ff: 0.70, bd: 0 }
];

// 时辰名兼容：state.gameTime 是 0-11 序号；若上游给中文名也接住
const NAME_TO_IDX = { 子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5, 午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11 };

let meteorEl = null;
let vistaBound = false;

export function setVistaTime(i) {
  const vista = document.getElementById('vista');
  if (!vista) return;
  let idx = Number(i);
  if (!Number.isFinite(idx)) idx = NAME_TO_IDX[String(i)] ?? 6;
  idx = ((Math.round(idx) % 12) + 12) % 12;
  const d = SHICHEN[idx];

  vista.style.setProperty('--skyT', d.skyT);
  vista.style.setProperty('--skyB', d.skyB);
  vista.style.setProperty('--cFar', d.far);
  vista.style.setProperty('--cMid', d.mid);
  vista.style.setProperty('--cNear', d.near);
  vista.style.setProperty('--cCloud', d.cloud);
  vista.style.setProperty('--cSun', d.sun);

  const sun = document.getElementById('vista-sun-disc');
  if (sun) {
    sun.style.left = d.sx + '%';
    sun.style.top = d.sy + '%';
    sun.style.opacity = d.so;
  }
  const stars = document.getElementById('vista-stars');
  if (stars) stars.style.opacity = d.st;
  const ffs = document.getElementById('vista-ff');
  if (ffs) ffs.style.opacity = d.ff;
  const birds = document.getElementById('vista-birds');
  if (birds) birds.style.opacity = d.bd;

  // 竖排时辰签：昼暖墨、夜米白
  const vt = vista.querySelector('.vtime');
  if (vt) {
    const label = vt.querySelector('#vista-time-label');
    const name = vt.querySelector('#vista-time-name');
    if (label) label.textContent = d.l;
    if (name) name.textContent = d.n + '时';
    const day = idx >= 3 && idx <= 9;
    vt.style.color = day ? '#4A4038' : '#E6DAC0';
    vt.style.textShadow = day ? '0 1px 1px rgba(240,230,205,.4)' : '0 1px 2px rgba(0,0,0,.5)';
  }
  // 流星只在星多的时辰出现
  if (meteorEl) meteorEl.style.display = d.st > 0.5 ? '' : 'none';
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function spawnStars(vista) {
  // 星辰画进 #vista-stars-svg（viewBox 870×280），避免 DOM 散乱
  const svg = document.getElementById('vista-stars-svg');
  if (svg && !svg.childElementCount) {
    for (let k = 0; k < 26; k++) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', (Math.random() * 870).toFixed(1));
      c.setAttribute('cy', (Math.random() * 154).toFixed(1));
      c.setAttribute('r', (0.8 + Math.random() * 1.3).toFixed(2));
      c.style.animationDelay = (Math.random() * 4) + 's';
      c.style.animationDuration = (2.5 + Math.random() * 3) + 's';
      svg.appendChild(c);
    }
  }
  // 萤火：#vista-ff 容器 + i.vista-ff 粒子
  const ff = document.getElementById('vista-ff');
  if (ff && !ff.childElementCount) {
    for (let k = 0; k < 7; k++) {
      const f = document.createElement('i');
      f.className = 'vista-ff';
      f.style.left = (6 + Math.random() * 88) + '%';
      f.style.top = (48 + Math.random() * 40) + '%';
      f.style.animationDelay = (Math.random() * 7) + 's';
      ff.appendChild(f);
    }
  }
  if (!meteorEl) {
    meteorEl = document.createElement('div');
    meteorEl.className = 'vista-meteor';
    vista.appendChild(meteorEl);
  }
}

function bindParallax(vista) {
  if (vistaBound) return;
  vistaBound = true;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layers = [
    ['vista-clouds', 4], ['vista-far', 8], ['vista-sun', 6],
    ['vista-birds', 13], ['vista-near', 16], ['vista-ff', 22]
  ].map(([id, f]) => ({ el: document.getElementById(id), f })).filter(x => x.el);
  if (reduced || !layers.length) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;
  vista.addEventListener('mousemove', (e) => {
    const r = vista.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  vista.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
  (function loop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    for (const { el, f } of layers) {
      el.style.transform = `translate(${(-cx * f).toFixed(2)}px, ${(-cy * f * 0.35).toFixed(2)}px)`;
    }
    requestAnimationFrame(loop);
  })();
}

export function initVista(game) {
  const vista = document.getElementById('vista');
  if (!vista) return;
  spawnStars(vista);
  bindParallax(vista);
  const now = () => {
    const t = game && game.state ? game.state.gameTime : null;
    setVistaTime(Number.isFinite(Number(t)) ? Number(t) : new Date().getHours() % 12);
  };
  now();
  // 天色缓刷：游戏 tick 每 300 秒推时辰，这里兜底同步
  setInterval(now, 60000);
}
