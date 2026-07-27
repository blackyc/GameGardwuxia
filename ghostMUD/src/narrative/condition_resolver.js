function readPath(source, path) {
  return String(path || '').split('.').reduce((value, key) => (
    value == null ? undefined : value[key]
  ), source);
}

function compare(actual, expected, op = 'eq') {
  switch (op) {
    case 'ne': return actual !== expected;
    case 'gt': return Number(actual) > Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'lte': return Number(actual) <= Number(expected);
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'nin': return Array.isArray(expected) && !expected.includes(actual);
    case 'contains': return Array.isArray(actual)
      ? actual.includes(expected)
      : String(actual ?? '').includes(String(expected ?? ''));
    case 'exists': return Boolean(actual) === Boolean(expected);
    case 'eq':
    default: return actual === expected;
  }
}

function numericValue(value) {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    return Number(value.level ?? value.value ?? value.rank ?? 0);
  }
  return Number(value || 0);
}

function legacyComparison(operator) {
  return ({ '>': 'gt', '>=': 'gte', '<': 'lt', '<=': 'lte', '==': 'eq', '===': 'eq' })[operator] || 'gte';
}

function legacyEntryCondition(rule, context) {
  const state = context.state || {};
  switch (rule.type) {
    case 'composite':
      if (Array.isArray(rule.and)) return rule.and.every(item => evaluateCondition(item, context));
      if (Array.isArray(rule.or)) return rule.or.some(item => evaluateCondition(item, context));
      if (rule.not) return !evaluateCondition(rule.not, context);
      return true;
    case 'skill': {
      const actual = state.skills?.[rule.skill] ?? state[rule.skill];
      return compare(numericValue(actual), Number(rule.value || 0), legacyComparison(rule.operator));
    }
    case 'realm': {
      let expected = rule.value;
      if (typeof expected === 'string') {
        const realms = context.player?.path === 'ling'
          ? (context.game?.LING_REALMS || [])
          : (context.game?.WU_REALMS || context.game?.REALMS || []);
        expected = realms.findIndex(realm => realm?.name === rule.value);
        if (expected < 0) return false;
      }
      return compare(Number(state.realm || 0), Number(expected || 0), legacyComparison(rule.operator));
    }
    case 'daoxin': return compare(Number(state.daoxin || 0), Number(rule.value || 0), legacyComparison(rule.operator));
    case 'max_daoxin': return Number(state.daoxin || 0) <= Number(rule.value || 0);
    case 'cultivation': return compare(Number(state.cultivation || 0), Number(rule.value || 0), legacyComparison(rule.operator));
    case 'item': {
      const id = rule.id || rule.item || rule.name;
      return Number(context.inventory?.counts?.[id] || 0) >= Number(rule.value || rule.count || 1);
    }
    case 'quest': return context.quest?.completed?.includes(rule.id) === true;
    case 'active_quest': return context.quest?.active?.includes(rule.id) === true;
    case 'faction': return context.player?.faction === rule.id;
    case 'path': return context.player?.path === rule.value;
    case 'time': return context.time?.name === rule.value;
    default: return false;
  }
}

function legacyWorldCondition(rule, context) {
  const roomId = context.room?.id || '';
  const inventory = context.inventory?.counts || {};
  if (rule.paths && !rule.paths.includes(context.player?.path)) return false;
  if (rule.zoneKinds && !rule.zoneKinds.includes(context.room?.zoneKind)) return false;
  if (rule.roomIds && !rule.roomIds.includes(roomId)) return false;
  if (rule.excludeRoomIds?.includes(roomId)) return false;
  if (rule.regions && !rule.regions.some(prefix => roomId.startsWith(prefix))) return false;
  if (Number.isFinite(rule.realmMin) && context.player?.realm < rule.realmMin) return false;
  if (Number.isFinite(rule.realmMax) && context.player?.realm > rule.realmMax) return false;
  if (rule.gameTimes && !rule.gameTimes.includes(context.time?.index)) return false;
  if (rule.timePeriods && !rule.timePeriods.includes(context.time?.period)) return false;
  if (rule.excludeTimePeriods?.includes(context.time?.period)) return false;
  if (rule.requiresCompanion && context.state?.guideCompanion !== rule.requiresCompanion) return false;
  if (rule.requiresFlag && !readPath(context.state, rule.requiresFlag) && !context.flags?.[rule.requiresFlag]) return false;
  if (rule.excludesFlag && (readPath(context.state, rule.excludesFlag) || context.flags?.[rule.excludesFlag])) return false;
  if (rule.requiresItem && !inventory[rule.requiresItem]) return false;
  if (rule.excludesItem && inventory[rule.excludesItem]) return false;
  return true;
}

const LEGACY_WORLD_KEYS = new Set([
  'paths', 'zoneKinds', 'roomIds', 'excludeRoomIds', 'regions',
  'realmMin', 'realmMax', 'gameTimes', 'timePeriods', 'excludeTimePeriods',
  'requiresCompanion', 'requiresFlag', 'excludesFlag', 'requiresItem',
  'excludesItem', 'castSize', 'multiActor', 'allowAtNight'
]);

function matchesLegacyExpected(actual, expected) {
  if (Array.isArray(expected)) return expected.includes(actual);
  if (expected && typeof expected === 'object') {
    if ('not' in expected && actual === expected.not) return false;
    if ('exists' in expected && Boolean(actual) !== Boolean(expected.exists)) return false;
    if ('equals' in expected && actual !== expected.equals) return false;
    if ('in' in expected && (!Array.isArray(expected.in) || !expected.in.includes(actual))) return false;
    return true;
  }
  return actual === expected;
}

function legacyStateCondition(rule, context) {
  return Object.entries(rule).every(([key, expected]) => {
    if (LEGACY_WORLD_KEYS.has(key)) return true;
    const actual = readPath(context.state, key) ?? readPath(context, key);
    return matchesLegacyExpected(actual, expected);
  });
}

export function evaluateCondition(condition, context = {}) {
  if (condition == null || condition === true) return true;
  if (condition === false) return false;
  if (Array.isArray(condition)) return condition.every(item => evaluateCondition(item, context));
  if (typeof condition !== 'object') return false;
  if (condition.type) return legacyEntryCondition(condition, context);
  if (condition.conditions) return evaluateCondition(condition.conditions, context);
  if (Array.isArray(condition.all)) return condition.all.every(item => evaluateCondition(item, context));
  if (Array.isArray(condition.any)) return condition.any.some(item => evaluateCondition(item, context));
  if (condition.not) return !evaluateCondition(condition.not, context);
  if (condition.fact) return compare(readPath(context, condition.fact), condition.value, condition.op || 'eq');
  return legacyWorldCondition(condition, context) && legacyStateCondition(condition, context);
}

export function explainCondition(condition, context = {}) {
  const passed = evaluateCondition(condition, context);
  return { passed, condition, context: { room: context.room, player: context.player, story: context.story } };
}

export { readPath };

