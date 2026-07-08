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
      this._bindPerceptionPanel();
      this._bindDocumentFocus();
      console.log('[Input] All event handlers initialized');
    } catch (e) {
      console.error('[Input] Error during initialization:', e);
    }
  }

  /** 绑定 data-action 按钮（事件委托模式，支持动态注入的按钮） */
  _bindActionButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      // 感知面板有自己的委托器，通用处理器不再重复消费。
      if (btn.closest('#perception-panel')) return;
      const action = btn.dataset.action;
      switch (action) {
        case 'explore':
          this.game.explore(btn.dataset.dir);
          break;
        case 'cultivate-menu': {
          const sub = document.getElementById('cultivate-submenu');
          if (sub) sub.style.display = (sub.style.display === 'none' || !sub.style.display) ? 'flex' : 'none';
          break;
        }
        case 'meditate':
          this.game.cultivate();
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
        case 'focusNpc': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx)) {
            this.game.focusedNpcIndex = idx;
            this.game.focusedNpcType = type;
            const perc = this.game.getRoomPerception ? this.game.getRoomPerception() : null;
            const npc = perc && perc.npcs ? perc.npcs.find(n => Number(n.index) === idx && ((n.type || 'encounter') === type)) : null;
            if (npc) this.game.addLog('你看向' + npc.name + '。', 'info');
            this.game.renderer.updateUI('location');
          }
          break;
        }
        case 'closeNpcFocus':
          this.game.focusedNpcIndex = null;
          this.game.focusedNpcType = null;
          this.game.renderer.updateUI('location');
          break;
        case 'talkNpc': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx)) this.game.speakToNpc(idx, type);
          break;
        }
        case 'npcObserve': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          const perc = this.game.getRoomPerception ? this.game.getRoomPerception() : null;
          const npc = perc && perc.npcs ? perc.npcs.find(n => Number(n.index) === idx && ((n.type || 'encounter') === type)) : null;
          if (npc) this.game.addLog('你细看' + npc.name + '，把此人的神态记在心里。', 'info');
          break;
        }
        case 'sparNpc': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx)) this.game.sparNpc(idx, type);
          break;
        }
        case 'npcDisabled':
          this.game.addLog('「' + (btn.dataset.label || '此项') + '」尚未开放。', 'system');
          break;
        case 'askAround':
          this.game.askAround();
          break;
        case 'pushup':
          this.game.train();
          break;
        case 'peek':
          this.game.peek();
          break;
        case 'perceive':
          this.game.openPerception();
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
        case 'switchPage':
          if (window.pageManager) window.pageManager.switchTo(btn.dataset.page);
          break;
        case 'combat':
          this.game.combatAction(btn.dataset.combat);
          break;
      }
    });
  }

  /** Tab 按钮事件 + 底部导航 */
  _bindTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.game.switchTab(btn.dataset.tab);
      });
    });
    // 人物页子 Tab
    document.querySelectorAll('.subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.subtab;
        document.querySelectorAll('.subtab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById('subtab-' + target);
        if (panel) panel.classList.add('active');
      });
    });
    // 底部 5 导航（临时绑定，PageManager 就绪后替代）
    document.querySelectorAll('#bottom-nav .nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (window.pageManager) {
          window.pageManager.switchTo(page);
        } else {
          document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.dataset.page === page));
          document.querySelectorAll('#bottom-nav .nav-btn').forEach(b => b.classList.toggle('active', b === btn));
        }
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
    document.addEventListener('click', (e) => {
      const control = e.target.closest('[data-dialogue-action]');
      if (!control) return;
      const action = control.dataset.dialogueAction;
      if (action === 'history') {
        this.game.npc.toggleDialogueHistory();
      } else if (action === 'next') {
        this.game.npc.nextDialogueLine();
      } else if (action === 'history-close') {
        this.game.npc.toggleDialogueHistory(false);
      } else if (action === 'close') {
        this.game.closeNPC();
      }
    });
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

  /** 感知面板事件委托（面板内容由 renderPerception 动态生成） */
  _bindPerceptionPanel() {
    const panel = document.getElementById('perception-panel');
    if (!panel) return;
    panel.addEventListener('click', (e) => {
      const target = e.target.closest('[data-perc-action], .perc-close, .perc-path, .perc-search, .perc-subbtn, .perc-npc');
      if (!target) return;

      // 收起按钮
      if (target.classList.contains('perc-close')) {
        this.game.closePerception();
        return;
      }

      // 通路点击（探索）
      if (target.closest('.perc-path')) {
        const pathEl = target.closest('.perc-path');
        const dir = pathEl.dataset.dir;
        if (dir) {
          this.game.closePerception();
          // 微小延迟让面板关闭动效触发后再移动
          setTimeout(() => this.game.explore(dir), 200);
        }
        return;
      }

      // 搜索点
      if (target.closest('.perc-search')) {
        this.game.closePerception();
        setTimeout(() => this.game.searchArea(), 200);
        return;
      }

      // 可打听（房间级流言，独立一级）
      if (target.closest('.perc-rumor') || target.closest('[data-perc-action="rumor"]')) {
        this.game.closePerception();
        setTimeout(() => this.game.askAround(), 200);
        return;
      }

      // NPC 子选项（交谈→定向遭遇 / 交易→待开放 / 拜师→askTeacher）
      if (target.classList.contains('perc-subbtn')) {
        const idx = parseInt(target.dataset.npcIdx, 10);
        const type = target.dataset.npcType || 'encounter';
        const action = target.dataset.npcAction;
        if (isNaN(idx)) return;
        if (action === 'talk') {
          this.game.closePerception();
          // 定向触发该 NPC 的遭遇，不再从房间池随机抽取
          setTimeout(() => this.game.speakToNpc(idx, type), 200);
        } else if (action === 'trade') {
          this.game.addLog('💬 「交易」功能将在后续版本开放。', 'system');
        } else if (action === 'askTeacher') {
          this.game.closePerception();
          setTimeout(() => this.game.askTeacher(), 200);
        } else if (action === 'spar') {
          this.game.closePerception();
          setTimeout(() => this.game.sparNpc(idx, type), 200);
        }
        return;
      }
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
