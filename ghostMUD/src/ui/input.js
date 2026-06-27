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
          case 'openSaveMenu':
            this.game.openSaveMenu();
            break;
          case 'exportSave':
            this.game.exportSaveFile();
            break;
          case 'importSave':
            this.game.openSaveMenu();
            // 展开导入区域
            const impInput = document.getElementById('import-str-input');
            const impBtn = document.getElementById('btn-import-str');
            if (impInput && impBtn) { impInput.style.display = 'block'; impBtn.style.display = 'inline-block'; }
            break;
          case 'wipeConfirm':
            this.game.wipeConfirm();
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

    // 存档面板按钮
    const saveClose = document.getElementById('save-close-btn');
    if (saveClose) saveClose.addEventListener('click', () => {
      document.getElementById('save-modal').classList.remove('active');
    });

    // 手动存档槽位按钮
    document.querySelectorAll('.save-btn[data-slot]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        if (btn.classList.contains('save')) this.game.manualSave(slot);
        else if (btn.classList.contains('load')) this.game.manualLoad(slot);
        else if (btn.classList.contains('del')) this.game.manualDelete(slot);
      });
    });

    // 导出/导入按钮
    const exportFile = document.getElementById('btn-export-file');
    if (exportFile) exportFile.addEventListener('click', () => this.game.exportSaveFile());

    const exportStr = document.getElementById('btn-export-str');
    if (exportStr) exportStr.addEventListener('click', () => this.game.exportSaveString());

    const importStr = document.getElementById('btn-import-str');
    if (importStr) importStr.addEventListener('click', () => this.game.importSaveString());

    const importFile = document.getElementById('btn-import-file');
    const fileInput = document.getElementById('import-file-input');
    if (importFile && fileInput) {
      importFile.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) this.game.importSaveFile(e.target.files[0]);
      });
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
