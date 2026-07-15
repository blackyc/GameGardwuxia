import { noteNpcSeen, applyNpcChoiceMemory } from './npc_memory.js';

import { getData } from './data/data_loader.js';
import { BASIC_UNARMED_CHART } from './combat_contract.js';

export class NpcService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
    this.dialogueHistory = [];
    this.dialogueHistoryOpen = false;
    this.dialogueSettled = false;
    this.dialogueLines = [];
    this.dialogueLineIndex = 0;
    this.dialogueVariant = null;
    this.dialogueGraph = null;
    this.dialogueNodeId = null;
  }

  triggerNPCEncounter(active) {
    const g = this.game;
    const room = g.state.location;
    let pool = g.world?.getNpcPool(room) || g.NPC_ENCOUNTERS[room];
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
    const npc = this._resolveNpc(npcIndex, npcType);
    if (!npc) {
      g.addLog('此人已经不在此处了。', 'system');
      return;
    }
    this._presentEncounter(npc);
  }

  _resolveNpc(npcIndex, npcType = 'encounter') {
    const g = this.game;
    const room = g.state.location;
    const dl = getData();
    if (npcType === 'guide') {
      const tutorial = dl.WENJIANFENG_TUTORIAL_CH1;
      if (!tutorial) return null;
      if (typeof tutorial.getCompanionNpc === 'function') return tutorial.getCompanionNpc(g, room);
      return typeof tutorial.getGuideEncounter === 'function' ? tutorial.getGuideEncounter(g, room) : null;
    }
    if (npcType === 'recruiter') {
      if (g.world?.getZonePolicy(room).allowAmbientNpc === false) return null;
      return (dl.FACTION_RECRUITER_ENCOUNTERS[room] || [])[npcIndex] || null;
    }
    if (npcType === 'room') return (dl.LOCATIONS[room]?.npcs || [])[npcIndex] || null;
    return (g.world?.getNpcPool(room) || g.NPC_ENCOUNTERS[room] || [])[npcIndex] || null;
  }

  getGiftableItems() {
    const blockedTypes = new Set(['quest', 'equipment', 'equip', 'weapon', 'technique', 'manual', 'stone']);
    return (this.game.state.inventory || [])
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item && item.giftable !== false && (item.giftable === true || !blockedTypes.has(item.type)));
  }

  toggleNpcGift(npcIndex, npcType = 'encounter') {
    const g = this.game;
    const npc = this._resolveNpc(npcIndex, npcType);
    if (!npc) {
      g.addLog('此人已经不在此处了。', 'system');
      return;
    }
    const gifts = this.getGiftableItems();
    if (gifts.length === 0) {
      g.focusedNpcGiftKey = null;
      g.addLog('你的行囊里没有适合相赠之物。', 'system');
      g.showMomentFeedback?.('无物可赠', 'muted');
      return;
    }
    const key = npcType + ':' + npcIndex;
    g.focusedNpcGiftKey = g.focusedNpcGiftKey === key ? null : key;
    g.renderer.updateUI('location');
  }

  giveGiftToNpc(npcIndex, npcType = 'encounter', itemIndex) {
    const g = this.game;
    const npc = this._resolveNpc(npcIndex, npcType);
    const item = g.state.inventory?.[itemIndex];
    const allowed = this.getGiftableItems().some(entry => entry.index === itemIndex);
    if (!npc || !item || !allowed) {
      g.focusedNpcGiftKey = null;
      g.addLog('这份礼没有送成。', 'system');
      g.renderer.updateUI('location');
      return;
    }
    const npcKey = npc.memoryKey || npc.id || this._title(npc);
    if (item.boundNpc && item.boundNpc !== npcKey) {
      g.focusedNpcGiftKey = null;
      g.addLog('这件东西似乎该交给特定的人，你没有递出去。', 'system');
      g.showMomentFeedback?.('礼物尚未找到主人', 'muted');
      g.renderer.updateUI('location');
      return;
    }
    g.state.inventory.splice(itemIndex, 1);
    const name = this._title(npc);
    const result = applyNpcChoiceMemory(g.state, npc, {
      choice: '送礼：' + (item.name || '无名物'),
      relationship: {
        affinityDelta: Number.isFinite(item.giftAffinity) ? item.giftAffinity : 1,
        note: item.giftNote || ('收下了你赠送的' + (item.name || '礼物'))
      }
    }, { room: g.state.location, gameTime: g.state.gameTime });
    if (item.giftFlags && typeof item.giftFlags === 'object') Object.assign(g.state, item.giftFlags);
    g.focusedNpcGiftKey = null;
    g.addLog(item.giftLog || ('你将<b>' + this._esc(item.name || '无名物') + '</b>赠给' + this._esc(name) + '。对方收下了。'), 'npc');
    g.showMomentFeedback?.(name + ' · ' + (result.label || '眼熟'), 'relation');
    g.renderer.updateUI(['location', 'bag']);
  }

  askNpc(npcIndex, npcType = 'encounter') {
    const g = this.game;
    const npc = this._resolveNpc(npcIndex, npcType);
    if (!npc) {
      g.addLog('此人已经不在此处了。', 'system');
      return;
    }
    let answer = g.world?.getNpcRumor(npc, g.state.location) || '';
    if (!answer) {
      const route = (g.routes?.getRoutes() || []).find(item => item.clickable);
      answer = route
        ? '“若要去' + route.label + '，沿' + g.dirName(route.direction) + '边的路走。”'
        : '“这里的事，眼睛看见的往往比耳朵听来的可靠。”';
    }
    g.addLog('<b>' + this._esc(this._title(npc)) + '</b>：' + this._esc(answer), 'npc');
    g.showMomentFeedback?.('打听所得', 'info');
  }

  _presentEncounter(enc) {
    const g = this.game;
    g.state.npcEncounter = enc;
    noteNpcSeen(g.state, enc, { room: g.state.location, gameTime: g.state.gameTime });
    this.dialogueHistory = [];
    this.dialogueHistoryOpen = false;
    this.dialogueSettled = false;
    this.dialogueVariant = this._selectDialogueVariant(enc);
    this.dialogueGraph = enc.dialogueGraph || null;
    this.dialogueNodeId = this.dialogueGraph?.start || null;
    this.dialogueLines = this.dialogueGraph ? [this._graphLine()] : this._openingLines(enc);
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
    if (this.dialogueGraph) {
      const node = this._graphNode();
      if (node?.next) this._advanceGraph(node.next);
      return;
    }
    if (this.dialogueLineIndex >= this.dialogueLines.length - 1) return;
    this.dialogueLineIndex++;
    this._appendCurrentLine();
    this._renderCurrentLine();
  }

  npcChoice(index) {
    const g = this.game;
    const enc = g.state.npcEncounter;
    if (!enc) return;
    const results = this._dialogueResults(enc);
    const result = results && results[index];
    if (!result) return;
    const s = g.state;
    const previousRelation = g.describeNpcRelation ? g.describeNpcRelation(enc) : '';
    const memoryResult = applyNpcChoiceMemory(s, enc, result, { room: s.location, gameTime: s.gameTime });
    if (memoryResult.label && memoryResult.label !== previousRelation) {
      g.showMomentFeedback?.(this._title(enc) + ' · ' + memoryResult.label, 'relation');
    }
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

  dialogueChoice(choiceId) {
    const g = this.game;
    const enc = g.state.npcEncounter;
    const node = this._graphNode();
    const choice = node?.choices?.find(entry => entry?.id === choiceId);
    if (!enc || !choice) return;

    this._appendLine('你', choice.playerLine || choice.label || '沉默片刻。', 'player');
    const effects = choice.effects || {};
    const memoryResult = applyNpcChoiceMemory(g.state, enc, {
      choice: choice.label || choice.id,
      relationship: {
        affinityDelta: Number(effects.affinity || 0),
        flags: effects.flags,
        note: effects.note
      }
    }, { room: g.state.location, gameTime: g.state.gameTime });
    if (memoryResult.label) g.showMomentFeedback?.(this._title(enc) + ' · ' + memoryResult.label, 'relation');

    const progress = (g.state.dialogueProgress ||= {});
    progress[this.dialogueGraph.id || this._title(enc)] = {
      lastChoice: choice.id,
      lastNode: choice.next || this.dialogueNodeId,
      completed: !choice.next
    };
    g.markDirty();
    if (choice.next) this._advanceGraph(choice.next);
  }

  closeNPC() {
    const g = this.game;
    g.state.npcEncounter = null;
    this.dialogueHistory = [];
    this.dialogueHistoryOpen = false;
    this.dialogueSettled = false;
    this.dialogueLines = [];
    this.dialogueLineIndex = 0;
    this.dialogueVariant = null;
    this.dialogueGraph = null;
    this.dialogueNodeId = null;
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
    if (this.dialogueGraph) {
      const node = this._graphNode();
      if (!node) return;
      this._renderDialogue(enc, this._graphLine(), [], Boolean(node.next && !(node.choices?.length)));
      this._renderGraphChoices(node);
      return;
    }
    const line = this.dialogueLines[this.dialogueLineIndex] || this._line(this._title(enc), '对方沉默了片刻。', 'npc');
    const hasNext = this.dialogueLineIndex < this.dialogueLines.length - 1;
    const results = this.dialogueSettled ? [] : this._dialogueResults(enc);
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
      choicesDiv.innerHTML = '<button type="button" class="modal-choice dialogue-next" data-dialogue-action="next">... ...</button>';
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

  _renderGraphChoices(node) {
    const choicesDiv = document.getElementById('npc-choices');
    if (!choicesDiv) return;
    const choices = Array.isArray(node?.choices) ? node.choices.slice(0, 3) : [];
    if (choices.length === 0) {
      choicesDiv.innerHTML = node?.next
        ? '<button type="button" class="modal-choice dialogue-next" data-dialogue-action="next">... ...</button>'
        : '';
      return;
    }
    choicesDiv.innerHTML = choices.map(choice =>
      '<button type="button" class="modal-choice" data-dialogue-choice="' + this._esc(choice.id) + '">' + this._esc(choice.label || '回答') + '</button>'
    ).join('');
    choicesDiv.querySelectorAll('[data-dialogue-choice]').forEach(btn => {
      btn.addEventListener('click', () => this.dialogueChoice(btn.dataset.dialogueChoice));
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

  _graphNode() {
    return this.dialogueGraph?.nodes?.[this.dialogueNodeId] || null;
  }

  _graphLine() {
    const node = this._graphNode();
    return this._line(node?.speaker || this._title(this.game.state.npcEncounter), node?.text || '对方沉默了片刻。', 'npc');
  }

  _advanceGraph(nextNodeId) {
    const node = this.dialogueGraph?.nodes?.[nextNodeId];
    if (!node) return;
    this.dialogueNodeId = nextNodeId;
    this.dialogueLines = [this._graphLine()];
    this.dialogueLineIndex = 0;
    this._appendCurrentLine();
    const progress = (this.game.state.dialogueProgress ||= {});
    progress[this.dialogueGraph.id || this._title(this.game.state.npcEncounter)] = {
      ...(progress[this.dialogueGraph.id || this._title(this.game.state.npcEncounter)] || {}),
      lastNode: nextNodeId,
      completed: Boolean(node.end)
    };
    this.game.markDirty();
    this._renderCurrentLine();
  }

  _dialogueResults(enc) {
    const source = this.dialogueVariant || {};
    return source.results || source.dialogueChoices || source.choices || enc.results || [];
  }

  _selectDialogueVariant(enc) {
    const variants = enc?.dialogueVariants || enc?.variants;
    if (!Array.isArray(variants) || variants.length === 0) return null;
    let fallback = null;
    for (const variant of variants) {
      if (!variant) continue;
      if (variant.default) {
        fallback = variant;
        continue;
      }
      if (this._matchesDialogueWhen(variant.when)) return variant;
    }
    return fallback;
  }

  _matchesDialogueWhen(when) {
    if (!when || typeof when !== 'object') return false;
    for (const [key, expected] of Object.entries(when)) {
      const actual = this._stateValue(key);
      if (Array.isArray(expected)) {
        if (!expected.includes(actual)) return false;
      } else if (expected && typeof expected === 'object') {
        if ('not' in expected && actual === expected.not) return false;
        if ('exists' in expected && Boolean(actual) !== Boolean(expected.exists)) return false;
        if ('equals' in expected && actual !== expected.equals) return false;
      } else if (actual !== expected) {
        return false;
      }
    }
    return true;
  }

  _stateValue(path) {
    return String(path).split('.').reduce((obj, key) => (obj == null ? undefined : obj[key]), this.game.state || {});
  }

  _openingLines(enc) {
    const title = this._title(enc);
    const fallback = this.game.getDesc(enc) || enc.dialogue || '对方抬眼看向你，似乎正在等你开口。';
    const source = this.dialogueVariant || {};
    const raw = source.dialogueLines || source.lines || source.script || enc.dialogueLines || enc.lines || enc.script;
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

  /**
   * 与NPC切磋
   * @param {number} npcIndex - NPC 在房间中的索引
   * @param {string} npcType - NPC 类型 'encounter'|'room'
   */
  sparNpc(npcIndex, npcType = 'encounter') {
    const g = this.game;
    const s = g.state;
    if (npcType === 'guide') {
      g.addLog('苏小棠摆摆手：「先认路，回头再说。」', 'system');
      return;
    }

    // 获取 NPC 数据
    let npc = null;
    if (npcType === 'room') {
      const dl = getData();
      const loc = dl.LOCATIONS[s.location];
      if (loc && Array.isArray(loc.npcs)) {
        npc = loc.npcs[npcIndex];
      }
    } else {
      const pool = g.world?.getNpcPool(s.location) || g.NPC_ENCOUNTERS[s.location];
      if (pool && npcIndex < pool.length) {
        npc = pool[npcIndex];
      }
    }

    if (!npc) {
      g.addLog('此人已不在此处。', 'system');
      return;
    }
    if (g.world?.getZonePolicy(s.location).zoneKind === 'faction_hq' && npc.canSpar !== true) {
      g.addLog('对方此刻并未摆出切磋的意思。', 'system');
      return;
    }

    if (npc.sparProfile?.enabled === false) {
      g.addLog(npc.sparProfile.reason || '对方此刻无意与你切磋。', 'system');
      return;
    }

    // 构造切磋用敌人数据
    const npcName = this._title(npc);
    const enemyData = this._buildSparEnemy(npc);

    g.addLog(`你向${npcName}抱拳：「请指教！」`, 'event');
    g.addLog(`${npcName}拔剑而立：「好说。」`, 'event');

    // 启动战斗
    g.combat.startCombat(npcName, enemyData, {
      mode: 'spar',
      encounterId: npc.id || npcName,
      grantRewards: false,
      startReady: false,
      onComplete: (result) => {
        if (result.outcome === 'victory') {
          g.addLog(`${npcName}收剑抱拳：「承让。」`, 'event');
        } else if (result.outcome === 'defeat') {
          g.addLog(`${npcName}在最后一式及时收力：「根基还要再稳些。」`, 'event');
        }
      },
    });
  }

  /**
   * 构造切磋用敌人数据
   */
  _buildSparEnemy(npc) {
    const npcName = this._title(npc);
    const npcId = npc?.id || '';
    const profile = npc?.sparProfile || {};
    // 值星弟子 — 新手级弱敌
    const isZhixing = npcId.includes('zhixing') || npcName.includes('值星');

    if (isZhixing) {
      return {
        name: npcName,
        hp: profile.hp || 96,
        atk: profile.atk || 6,
        def: profile.def || 2,
        spd: profile.spd || 5,
        exp: 8,
        gold: 0,
        // 值星弟子也从完整 CD 开始读条，避免首场切磋变成演示秒杀。
        chart: profile.chart || { ...BASIC_UNARMED_CHART },
      };
    }

    // 默认弱敌
    return {
      name: npcName,
      hp: profile.hp || 72,
      atk: profile.atk || 5,
      def: profile.def || 1,
      spd: profile.spd || 5,
      exp: 5,
      gold: 0,
      chart: profile.chart || { ...BASIC_UNARMED_CHART },
    };
  }
}

export default NpcService;
