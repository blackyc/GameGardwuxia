// ============================================================
// tassel.js — NPC 卷轴名帖流苏拖拽（诡仙归 V3.2 终稿移植）
// document 级委托：抓住 .npc-tassel 拖拽，松手阻尼单摆。
// 抓流苏时拦截事件，避免触发 NPC 选中（focusNpc）。
// ============================================================

export function initTassels() {
  if (window.__tasselBound) return;
  window.__tasselBound = true;

  const CAP = 60; // 逻辑像素，与 npc-tassel 的 60px 长度对应
  let drag = null;

  document.addEventListener('pointerdown', (e) => {
    const t = e.target && e.target.closest ? e.target.closest('.npc-tassel') : null;
    if (!t) return;
    e.stopPropagation();
    e.preventDefault();
    drag = { t, anchor: t.parentElement, angle: 0, vel: 0, dragging: true, px: e.clientX, py: e.clientY, raf: 0 };
    try { t.setPointerCapture(e.pointerId); } catch (_) { /* jsdom 等无捕获 */ }
    step();
  }, true);

  // 捕获阶段吞掉流苏上的 click，避免委托到 [data-action="npc"] 触发选中
  document.addEventListener('click', (e) => {
    if (e.target && e.target.closest && e.target.closest('.npc-tassel')) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  window.addEventListener('pointermove', (e) => {
    if (drag && drag.dragging) { drag.px = e.clientX; drag.py = e.clientY; }
  });
  window.addEventListener('pointerup', () => { if (drag) drag.dragging = false; });

  function step() {
    if (!drag) return;
    const { t, anchor } = drag;
    if (!t.isConnected || !anchor || !anchor.isConnected) { drag = null; return; }
    if (drag.dragging) {
      const r = anchor.getBoundingClientRect();
      const ax = r.left + r.width / 2;
      const ay = r.top + 4;
      const a = Math.atan2(drag.px - ax, Math.max(14, drag.py - ay));
      const na = Math.max(-1.1, Math.min(1.1, a));
      drag.vel = (na - drag.angle) * 0.6;
      drag.angle = na;
    } else {
      drag.vel += -0.0022 * Math.sin(drag.angle) * CAP;
      drag.vel *= 0.96;
      drag.angle += drag.vel;
      if (Math.abs(drag.angle) < 0.008 && Math.abs(drag.vel) < 0.008) {
        t.style.transform = 'rotate(0deg)';
        drag = null;
        return;
      }
    }
    t.style.transform = `rotate(${drag.angle.toFixed(3)}rad)`;
    drag.raf = requestAnimationFrame(step);
  }
}
