import { createNarrativeContext } from './narrative/context.js';
import { evaluateCondition } from './narrative/condition_resolver.js';

const TIME_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

function numericValue(value) {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    return Number(value.level ?? value.value ?? value.rank ?? 0);
  }
  return Number(value || 0);
}

function compare(actual, expected, operator = '>=') {
  if (operator === '>' ) return actual > expected;
  if (operator === '<' ) return actual < expected;
  if (operator === '<=') return actual <= expected;
  if (operator === '===' || operator === '==') return actual === expected;
  return actual >= expected;
}

function hasItem(state, rule) {
  const wanted = rule.id || rule.item || rule.name;
  const requiredCount = Number(rule.value || rule.count || 1);
  if (!wanted) return false;
  const count = (state.inventory || []).reduce((total, item) => {
    const matches = item && (item.id === wanted || item.item === wanted || item.name === wanted);
    return matches ? total + Number(item.count || item.quantity || 1) : total;
  }, 0);
  return count >= requiredCount;
}

function realmIndex(game, name) {
  const realms = typeof game.getRealms === 'function'
    ? game.getRealms()
    : (game.state?.path === 'ling' ? game.LING_REALMS : game.WU_REALMS);
  return Array.isArray(realms) ? realms.findIndex(realm => realm && realm.name === name) : -1;
}

/**
 * Evaluate one room-entry prerequisite against the current game state.
 * Existing data follows docs/游戏主要设计.md 入口条件:
 * numeric skill, realm and daoxin requirements are minimum thresholds.
 */
export function meetsEntryPrerequisite(game, rule) {
  return evaluateCondition(rule, createNarrativeContext(game));
}

/**
 * Resolve visibility and movement permission for a connection target.
 * Conditional sub-rooms remain absent from perception until eligible, while
 * direct/stale movement commands still receive their authored failure text.
 */
export function getEntryAccess(game, targetName) {
  const room = game?.LOCATIONS?.[targetName];
  if (!room) {
    return { visible: false, allowed: false, message: '那个地方已经不在此世。', successMessage: '' };
  }

  if (room.locked === true) {
    return {
      visible: room.hiddenUntilEligible !== true,
      allowed: false,
      message: room.lock_message || room.fail_msg || '此处暂不可入。',
      successMessage: ''
    };
  }

  const allowed = meetsEntryPrerequisite(game, room.prereq);
  const hiddenUntilEligible = room.hiddenUntilEligible !== false;
  return {
    visible: allowed || !room.prereq || !hiddenUntilEligible,
    allowed,
    message: allowed ? '' : (room.fail_msg || '你尚未满足进入此处的条件。'),
    successMessage: allowed ? (room.success_msg || '') : ''
  };
}
