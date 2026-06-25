/**
 * main.js — 应用入口
 * Vite ES6 模块入口点
 */

import { Game } from './game.js';
// 行功战斗系统 v3.0 — 预加载模块确保 Vite 打包
import { BattleEngine } from './battle_async.js';
import { HijackEngine } from './battle_hijack.js';
import { InterveneEngine } from './battle_intervene.js';

// 将战斗引擎类挂载到 window，供 game.js 及调试使用
window.BattleEngine = BattleEngine;
window.HijackEngine = HijackEngine;
window.InterveneEngine = InterveneEngine;

// 等待 DOM 加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 确保卷宗文件已加载（通过 index.html 的 <script> 标签）
    if (typeof window.LOCATIONS === 'undefined') {
      console.error('[Main] 卷宗文件未加载！请检查 index.html 中的 <script> 标签。');
      document.getElementById('log-area').innerHTML = '<div class="log-entry system">⚠ 卷宗加载失败！请刷新页面重试。</div>';
      return;
    }
    window.game = new Game();
  });
} else {
  // DOM 已就绪
  if (typeof window.LOCATIONS === 'undefined') {
    console.error('[Main] 卷宗文件未加载！');
    setTimeout(() => {
      window.game = new Game();
    }, 500);
  } else {
    window.game = new Game();
  }
}
