const FALLBACK_SCENE_ART = '/ui/jianghu-mobile-bg.jpg';

function firstText(...values) {
  return values.find(value => typeof value === 'string' && value.trim()) || '';
}

/**
 * Owns the modal presentation shared by 张望 (look) and 探索 (find).
 * World mutation remains in RouteService/SearchService; this class only
 * orchestrates presentation and scene-entry commands.
 */
export class SceneInteractionService {
  constructor(game) {
    this.game = game;
    this.activeMode = null;
  }

  openLook() {
    const g = this.game;
    if (g.state.combat || g.state.npcEncounter) {
      g.addLog('当前无法张望。', 'combat');
      return { open: false, blocked: true };
    }

    const cultivate = document.getElementById('cultivate-submenu');
    if (cultivate) cultivate.style.display = 'none';

    g.routes?.senseCurrentRoom();
    const model = this._lookModel();
    if (!model.hasAuthoredContent) {
      this.close();
      g.showMomentFeedback?.('未有特别之处', 'muted');
      return { open: false, empty: true };
    }

    this._render(model);
    return { open: true, model };
  }

  openFind(result = {}) {
    const room = this.game.LOCATIONS?.[this.game.state.location] || {};
    const illustration = firstText(
      result.illustration,
      result.art,
      result.image,
      room.findIllustration,
      room.searchIllustration,
      room.sceneIllustration
    );
    const model = {
      mode: 'find',
      title: result.title || '探索所得',
      prompt: '',
      text: result.text || '你寻了一阵，未见所得。',
      illustration: illustration || FALLBACK_SCENE_ART,
      illustrationAlt: result.illustrationAlt || result.title || '探索所见',
      options: []
    };
    this._render(model);
    return { open: true, model };
  }

  enter(direction) {
    if (!direction) return;
    this.close();
    window.setTimeout(() => this.game.explore(direction, { viaLook: true }), 120);
  }

  reveal(routeId) {
    const result = this.game.routes?.revealRoute(routeId) || { ok: false, message: '此处没有可循的痕迹。' };
    this.game.addLog(result.message, result.ok ? 'special' : 'system');
    if (result.ok) {
      this.game.showMomentFeedback?.('发现 · ' + (result.route?.label || '隐路'), 'discovery');
      this.game.renderer.updateLocation();
    }
    this.openLook();
    return result;
  }

  close() {
    const layer = document.getElementById('scene-interaction-modal');
    if (layer) {
      layer.classList.remove('active');
      layer.setAttribute('aria-hidden', 'true');
    }
    this.activeMode = null;
    const trigger = document.querySelector('[data-action="perceive"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  _lookModel() {
    const g = this.game;
    const room = g.LOCATIONS?.[g.state.location] || {};
    const entrances = g.routes?.getLookEntrances?.() || [];
    const clues = g.routes?.getPerceptionClues?.() || [];
    const illustration = firstText(
      room.lookIllustration,
      room.sceneIllustration,
      room.illustration,
      room.art
    );

    const options = [];
    entrances.forEach(route => {
      options.push({
        action: 'enter',
        id: route.id,
        direction: route.direction,
        label: route.label,
        disabled: !route.clickable,
        reason: route.blockedReason || ''
      });
    });
    clues.forEach(route => {
      options.push({
        action: 'reveal',
        id: route.id,
        label: route.revealLabel || '循迹细察',
        hint: route.hint || '此处似有异样。'
      });
    });

    return {
      mode: 'look',
      title: '张望',
      prompt: '你观此处有',
      text: '',
      illustration: illustration || (options.length ? FALLBACK_SCENE_ART : ''),
      illustrationAlt: room.name || g.state.location || '此处景象',
      options,
      hasAuthoredContent: Boolean(illustration || options.length)
    };
  }

  _render(model) {
    const layer = document.getElementById('scene-interaction-modal');
    if (!layer) return;
    const title = layer.querySelector('#scene-interaction-title');
    const image = layer.querySelector('#scene-interaction-image');
    const fallback = layer.querySelector('#scene-interaction-art-fallback');
    const prompt = layer.querySelector('#scene-interaction-prompt');
    const text = layer.querySelector('#scene-interaction-text');
    const options = layer.querySelector('#scene-interaction-options');

    layer.dataset.mode = model.mode;
    if (title) title.textContent = model.title;
    if (prompt) {
      prompt.textContent = model.prompt || '';
      prompt.hidden = !model.prompt;
    }
    if (text) {
      text.textContent = model.text || '';
      text.hidden = !model.text;
    }
    if (image) {
      image.hidden = !model.illustration;
      if (model.illustration) {
        image.src = model.illustration;
        image.alt = model.illustrationAlt || '';
      } else {
        image.removeAttribute('src');
        image.alt = '';
      }
    }
    if (fallback) fallback.hidden = Boolean(model.illustration);
    if (options) {
      options.innerHTML = model.options.map(option => {
        const disabled = option.disabled ? ' disabled' : '';
        const attrs = option.action === 'reveal'
          ? `data-action="sceneReveal" data-route-id="${this._esc(option.id)}"`
          : `data-action="sceneEnter" data-dir="${this._esc(option.direction)}"`;
        const hint = option.hint ? `<small>${this._esc(option.hint)}</small>` : '';
        const reason = option.disabled && option.reason ? `<small>${this._esc(option.reason)}</small>` : '';
        return `<button type="button" class="scene-interaction-option" ${attrs}${disabled}><span>${this._esc(option.label)}</span>${hint}${reason}</button>`;
      }).join('');
      options.hidden = model.options.length === 0;
    }

    this.activeMode = model.mode;
    layer.classList.add('active');
    layer.setAttribute('aria-hidden', 'false');
    const trigger = document.querySelector('[data-action="perceive"]');
    if (trigger) trigger.setAttribute('aria-expanded', model.mode === 'look' ? 'true' : 'false');
  }

  _esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }
}

export default SceneInteractionService;
