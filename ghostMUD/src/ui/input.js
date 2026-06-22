/**
 * input.js — 输入事件绑定器
 * 参考猫国建设器 game.js 的 UI 绑定模式
 * 统一通过 data-action 属性分发事件，替代 HTML 中的 onclick
 */

export class InputManager {
  constructor(game) {
    this.game = game;
  }

  /** 初始化所有事件监听 */
  init() {
    console.log('[Input] Initializing event handlers...');
    try {
      this._bindActionButtons();
      this._bindTabButtons();
      this._bindCommandInput();
      this._bindModalButtons();
      this._bindDocumentFocus();
      console.log('[Input] All event handlers initialized');
    } catch (e) {
      console.error('[Input] Error during initialization:', e);
    }
  }

  /** 绑定 data-action 按钮 */
  _bindActionButtons() {
    const buttons = document.querySelectorAll('[data-action]');
    console.log(`[Input] Found ${buttons.length} action buttons`);
    buttons.forEach(btn => {
      const action = btn.dataset.action;
      btn.addEventListener('click', () => {
        console.log(`[Input] Button clicked: ${action}`, btn.dataset);
        switch (action) {
          case 'explore':
            this.game.explore(btn.dataset.dir);
            break;
          case 'meditate':
            this.game.meditate();
            break;
          case 'rest':
            this.game.rest();
            break;
          case 'searchArea':
            this.game.searchArea();
            break;
          case 'talk':
            this.game.talk();
            break;
          case 'askAround':
            this.game.askAround();
            break;
          case 'pushup':
            this.game.pushup();
            break;
          case 'peek':
            this.game.peek();
            break;
          case 'practiceMenu':
            this.game.practiceMenu();
            break;
          case 'askTeacher':
            this.game.askTeacher();
            break;
          case 'toggleMap':
            this.game.toggleMap();
            break;
          case 'switchTab':
            this.game.switchTab(btn.dataset.tab);
            break;
          case 'combat':
            this.game.combatAction(btn.dataset.combat);
            break;
        }
      });
    });
  }

  /** Tab 按钮事件 */
  _bindTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.game.switchTab(btn.dataset.tab);
      });
    });
  }

  /** 命令行输入 */
  _bindCommandInput() {
    const input = document.getElementById('cmd-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';
        if (cmd) this.game.processCommand(cmd);
      }
    });
  }

  /** 模态框按钮 */
  _bindModalButtons() {
    // NPC 模态框关闭
    const npcClose = document.getElementById('npc-close-btn');
    if (npcClose) {
      npcClose.addEventListener('click', () => this.game.closeNPC());
    }

    // 绝招返回
    const performBack = document.getElementById('perform-back-btn');
    if (performBack) {
      performBack.addEventListener('click', () => this.game.hidePerforms());
    }

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  /** 点击空白区域聚焦命令行 */
  _bindDocumentFocus() {
    const input = document.getElementById('cmd-input');
    document.addEventListener('click', (e) => {
      if (e.target && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        input.focus();
      }
    });
    input.focus();
  }
}
