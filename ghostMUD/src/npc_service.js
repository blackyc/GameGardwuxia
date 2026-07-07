import { getData } from './data/data_loader.js';

export class NpcService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.dialogueHistory = [];
    this.dialogueHistoryOpen = false;
    this.dialogueSettled = false;
    this.dialogueLines = [];
    this.dialogueLineIndex = 0;
  }

  triggerNPCEncounter(active) {
    const g = this.game;
    const room = g.state.location;
    let pool = g.NPC_ENCOUNTERS[room];
    const dl = getData();
    const factionPool = dl.FACTION_RECRUITER_ENCOUNTERS[room] || null;

    if ((!pool || pool.length === 0) && factionPool && factionPool.length > 0 && g.state.faction === '散修' && Math.random() < 0.4) {
      pool = factionPool;
    } else if (!pool || pool.length === 0) {
      if (active) g.addLog('此处荒无人烟，你环顾四周却不见半个人影。换个热闹些的地方试试。', 'system');
      return;
    }

    this._presentEncounter(pool[Math.floor(Math.random() * pool.length)]);
  }

  speakToNpc(npcIndex, npcType = 'encounter') {
    const g = this.game;
    const room = g.state.location;
    let pool = g.NPC_ENCOUNTERS[room];
    if (npcType === 'recruiter') {
      const dl = getData();
      pool = dl.FACTION_RECRUITER_ENCOUNTERS[room] || null;
    }
    if (!pool || npcIndex >= pool.length) {
      g.addLog('此人已经不在此处了。', 'system');
      return;
    }
    this._presentEncounter(pool[npcIndex]);
  }

  _presentEncounter(enc) {
    const g = this.game;
    g.state.npcEncounter = enc;
    this.dialogueHistory = [];
    this.dialogueHistoryOpen = false;
    this.dialogueSettled = false;
    this.dialogueLines = this._openingLines(enc);
    this.dialogueLineIndex = 0;

    this._appendCurrentLine();
    this._renderCurrentLine();

    const modal = document.getElementById('npc-modal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  nextDialogueLine() {
    if (!this.game.state.npcEncounter) return;
    if (this.dialogueLineIndex >= this.dialogueLines.length - 1) return;
    this.dialogueLineIndex++;
    this._appendCurrentLine();
    this._renderCurrentLine();
  }

  npcChoice(index) {
    const g = this.game;
    const enc = g.state.npcEncounter;
    if (!enc) return;
    const result = enc.results && enc.results[index];
    if (!result) return;
    const s = g.state;
    const title = this._title(enc);

    this._appendLine('你', result.choice || '沉默片刻。', 'player');
    let outcome = result.log || result.successLog || result.failLog || '对方点了点头，没有再多说。';

    if (enc.npc_type === 'faction_recruiter' && enc.faction) {
      if (result.questStart) g.startQuest(result.questStart);
      if (result.log) outcome = result.log;
      this._settleDialogue(enc, title, outcome, result);
      return;
    }

    if (result.effect) {
      const parts = result.effect.split(';');
      for (const part of parts) {
        const [key, val] = part.split(':');
        if (key === 'spend_gold') g.spendMoney(parseInt(val));
        else if (key === 'lose_gold') {
          const cur = g.getMoney();
          g.addMoney(-Math.min(cur, parseInt(val)));
        } else if (key === 'check_atk') {
          if (s.attack >= parseInt(val)) {
            outcome = result.successLog || outcome;
            if (result.successReward) g.applyReward(result.successReward);
          } else {
            outcome = result.failLog || outcome;
          }
        } else if (key === 'check_agility') {
          if (Math.random() < 0.6) {
            outcome = result.successLog || outcome;
            if (result.successReward) g.applyReward(result.successReward);
          } else {
            outcome = result.failLog || outcome;
          }
        } else if (['heal', 'hp', 'daoxin', 'gain_gold', 'gain_cultivation', 'random_item', 'random_technique'].indexOf(key) >= 0) {
          g.applyReward(part);
        }
      }
    }

    if (result.reward) g.applyReward(result.reward);
    if (result.failReward) g.applyReward(result.failReward);
    if (result.questStart || enc.questTrigger) g.startQuest(result.questStart || enc.questTrigger);

    this._settleDialogue(enc, title, outcome, result);
  }

  closeNPC() {
    const g = this.game;
    g.state.npcEncounter = null;
    this.dialogueHistory = [];
    this.dialogueHistoryOpen = false;
    this.dialogueSettled = false;
    this.dialogueLines = [];
    this.dialogueLineIndex = 0;
    const modal = document.getElementById('npc-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    g.renderer.updateUI();
  }

  toggleDialogueHistory(force) {
    this.dialogueHistoryOpen = typeof force === 'boolean' ? force : !this.dialogueHistoryOpen;
    this._renderHistory();
  }

  _settleDialogue(enc, title, outcome, result) {
    const g = this.game;
    const followup = this._resultLines(result, title, outcome);
    this.dialogueLines = followup;
    this.dialogueLineIndex = 0;
    this.dialogueSettled = true;
    this._appendCurrentLine();
    this._renderCurrentLine();
    g.addLog('你与' + title + '交谈了几句。', 'npc');
    g.markDirty();
  }

  _renderCurrentLine() {
    const enc = this.game.state.npcEncounter;
    if (!enc) return;
    const line = this.dialogueLines[this.dialogueLineIndex] || this._line(this._title(enc), '对方沉默了片刻。', 'npc');
    const hasNext = this.dialogueLineIndex < this.dialogueLines.length - 1;
    const results = this.dialogueSettled ? [] : (enc.results || []);
    this._renderDialogue(enc, line, hasNext ? [] : results, hasNext);
  }

  _renderDialogue(enc, line, results, hasNext) {
    const title = this._title(enc);
    const speaker = line.speaker || title;
    const titleEl = document.getElementById('npc-title');
    const speakerEl = document.getElementById('dialogue-speaker');
    const descEl = document.getElementById('npc-desc');
    const portraitEl = document.getElementById('dialogue-portrait-initial');
    if (titleEl) titleEl.textContent = title;
    if (speakerEl) speakerEl.textContent = speaker;
    if (descEl) descEl.textContent = line.text;
    if (portraitEl) portraitEl.textContent = speaker.slice(0, 1) || '人';
    this._renderChoices(results, hasNext);
    this._renderHistory();
  }

  _renderChoices(results, hasNext) {
    const choicesDiv = document.getElementById('npc-choices');
    if (!choicesDiv) return;
    if (hasNext) {
      choicesDiv.innerHTML = '<button type="button" class="modal-choice dialogue-next" data-dialogue-action="next">下一句</button>';
      return;
    }
    if (!results || results.length === 0) {
      choicesDiv.innerHTML = '';
      return;
    }
    choicesDiv.innerHTML = results.slice(0, 3).map((r, i) =>
      '<button type="button" class="modal-choice" data-npc-choice="' + i + '">' + this._esc(r.choice || '答复') + '</button>'
    ).join('');
    choicesDiv.querySelectorAll('[data-npc-choice]').forEach(btn => {
      btn.addEventListener('click', () => this.npcChoice(parseInt(btn.dataset.npcChoice, 10)));
    });
  }

  _renderHistory() {
    const drawer = document.getElementById('dialogue-history-drawer');
    const list = document.getElementById('dialogue-history-list');
    if (!drawer || !list) return;
    drawer.hidden = !this.dialogueHistoryOpen;
    list.innerHTML = this.dialogueHistory.map(item =>
      '<div class="history-line ' + item.kind + '"><b>' + this._esc(item.speaker) + '</b><span>' + this._esc(item.text) + '</span></div>'
    ).join('');
  }

  _openingLines(enc) {
    const title = this._title(enc);
    const fallback = this.game.getDesc(enc) || enc.dialogue || '对方抬眼看向你，似乎正在等你开口。';
    const raw = enc.dialogueLines || enc.lines || enc.script;
    return this._normalizeLines(raw, title, fallback);
  }

  _resultLines(result, speaker, fallback) {
    const raw = result?.nextLines || result?.followupLines || result?.lines || result?.script;
    return this._normalizeLines(raw, speaker, fallback);
  }

  _normalizeLines(raw, fallbackSpeaker, fallbackText) {
    const source = Array.isArray(raw) && raw.length > 0 ? raw : [fallbackText];
    const lines = source.map(item => {
      if (typeof item === 'string') return this._line(fallbackSpeaker, item, 'npc');
      const speaker = item?.speaker || item?.name || fallbackSpeaker;
      const text = item?.text || item?.line || item?.dialogue || '';
      const kind = item?.kind || (speaker === '你' ? 'player' : 'npc');
      return this._line(speaker, text, kind);
    }).filter(line => line.text);
    return lines.length > 0 ? lines : [this._line(fallbackSpeaker, fallbackText, 'npc')];
  }

  _appendCurrentLine() {
    const line = this.dialogueLines[this.dialogueLineIndex];
    if (line) this._appendLine(line.speaker, line.text, line.kind);
  }

  _appendLine(speaker, text, kind) {
    this.dialogueHistory.push({ speaker, text: String(text || ''), kind: kind || 'npc' });
  }

  _line(speaker, text, kind) {
    return { speaker, text: String(text || ''), kind: kind || 'npc' };
  }

  _title(enc) {
    return enc?.title || enc?.name || '来人';
  }

  _esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }
}

export default NpcService;
