/**
 * main.js — 应用入口
 * Vite ES6 模块入口点
 */

import { Game } from './game.js';
import { PageManager } from './ui/page_manager.js';
// 顶部工具条（参考猫国建设者：保存/选项/重置/删档/APP/Ver）
import topbar from './ui/topbar.js';
// 行功战斗系统 v3.0 — 预加载模块确保 Vite 打包
import { BattleEngine } from './battle_async.js';
import { HijackEngine } from './battle_hijack.js';
import { InterveneEngine } from './battle_intervene.js';
// 背景音乐（入场即启动）
import audio from './audio/AudioManager.js';

// 将战斗引擎类挂载到 window，供 game.js 及调试使用
window.BattleEngine = BattleEngine;
window.HijackEngine = HijackEngine;
window.InterveneEngine = InterveneEngine;

// 🔒 立即隐藏游戏内容（防止开场引导前闪现），由 intro 完成后 JS 显示
// 不依赖 CSS visibility:hidden（stylesheet 覆盖不可靠）
const appEl = document.getElementById('app');
if (appEl) appEl.style.visibility = 'hidden';

// 启动 BGM（Chrome 首次可能需用户手势后才能播，下一帧将再试）
audio.startBgm();

/** 核心启动：初始化 PageManager + Game */
function boot() {
  if (typeof window.LOCATIONS === 'undefined') {
    console.error('[Main] 卷宗文件未加载！');
    const la = document.getElementById('log-area');
    if (la) la.innerHTML = '<div class="log-entry system">⚠ 卷宗加载失败！请刷新页面重试。</div>';
    return;
  }
  window.pageManager = new PageManager();
  window.pageManager.init();
  window.game = new Game();
  topbar.mount(window.game);
}

// 等待 DOM 加载完成后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
