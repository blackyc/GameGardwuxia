/**
 * main.js — 应用入口
 * Vite ES6 模块入口点
 */

import { Game } from './game.js';

// 等待 DOM 加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 确保数据文件已加载（通过 index.html 的 <script> 标签）
    if (typeof window.LOCATIONS === 'undefined') {
      console.error('[Main] 数据文件未加载！请检查 index.html 中的 <script> 标签。');
      document.getElementById('log-area').innerHTML = '<div class="log-entry system">⚠ 数据加载失败！请刷新页面重试。</div>';
      return;
    }
    window.game = new Game();
  });
} else {
  // DOM 已就绪
  if (typeof window.LOCATIONS === 'undefined') {
    console.error('[Main] 数据文件未加载！');
    setTimeout(() => {
      window.game = new Game();
    }, 500);
  } else {
    window.game = new Game();
  }
}
