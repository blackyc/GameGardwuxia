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
      this._bindSceneInteraction();
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
      const action = btn.dataset.action;
      switch (action) {
        case 'explore':
          this.game.explore(btn.dataset.dir);
          break;
        case 'cultivate-menu': {
          const sub = document.getElementById('cultivate-submenu');
          if (sub) {
            const opening = sub.style.display === 'none' || !sub.style.display;
            if (opening) this.game.closePerception();
            sub.style.display = opening ? 'flex' : 'none';
          }
          break;
        }
        case 'meditate':
          this.game.cultivate();
          break;
        case 'rest':
          this.game.rest();
          break;
        case 'searchArea':
          this.game.closePerception();
          this.game.searchArea();
          break;
        case 'sceneClose':
          this.game.sceneInteraction?.close();
          break;
        case 'sceneEnter':
          this.game.sceneInteraction?.enter(btn.dataset.dir);
          break;
        case 'sceneReveal':
          this.game.sceneInteraction?.reveal(btn.dataset.routeId);
          break;
        case 'talk':
          this.game.talk();
          break;
        case 'focusNpc': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx)) this.game.openNpcInteraction(idx, type);
          break;
        }
        case 'closeNpcFocus':
          this.game.closeNPC();
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
          if (!Number.isNaN(idx)) this.game.inspectNpc(idx, type);
          break;
        }
        case 'sparNpc': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx)) this.game.sparNpc(idx, type);
          break;
        }
        case 'npcGift': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx)) this.game.toggleNpcGift(idx, type);
          break;
        }
        case 'confirmNpcGift': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const itemIndex = parseInt(btn.dataset.itemIndex, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx) && !Number.isNaN(itemIndex)) this.game.giveGiftToNpc(idx, type, itemIndex);
          break;
        }
        case 'npcInteractionBack':
          this.game.npc.returnNpcInteraction();
          break;
        case 'npcGiftPage':
          this.game.npc.setGiftPage(parseInt(btn.dataset.page, 10));
          break;
        case 'confirmNpcSpar':
          this.game.confirmNpcSpar();
          break;
        case 'npcAsk': {
          const idx = parseInt(btn.dataset.npcIdx, 10);
          const type = btn.dataset.npcType || 'encounter';
          if (!Number.isNaN(idx)) this.game.askNpc(idx, type);
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
        case 'tutorial':
          this.game.tutorialAction(btn.dataset.tutorialAction, {
            slot: btn.dataset.tutorialSlot,
            side: btn.dataset.tutorialSide,
          });
          break;
        case 'combatSlot':
          this.game.castCombatSlot(btn.dataset.slot);
          break;
        case 'mpGate':
          this.game.resolveCombatMpGate(btn.dataset.gate);
          break;
        case 'dismissCombatResult':
          this.game.dismissCombatResult();
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

    // 言路短笺是线性过场：任意一次点击只推进短笺，不穿透到底层操作。
    document.addEventListener('click', (e) => {
      const ribbon = document.getElementById('dialogue-ribbon');
      if (!ribbon || ribbon.hidden) return;
      e.preventDefault();
      e.stopPropagation();
      this.game.nextDialogueRibbon();
    }, true);

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

  _bindSceneInteraction() {
    const layer = document.getElementById('scene-interaction-modal');
    if (!layer) return;
    layer.addEventListener('click', event => {
      if (event.target === layer) this.game.sceneInteraction?.close();
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
