/**
 * weather_service.js — 区域天气服务
 *
 * 天气按 climateZone 存储，确定性（seed + gameTime + zone），禁止运行时随机数。
 */

const WEATHER_TYPES = ['clear', 'cloudy', 'mist', 'drizzle', 'rain', 'storm', 'snow'];

const WEATHER_LABELS = Object.freeze({
  clear: '晴',
  cloudy: '阴',
  mist: '雾',
  drizzle: '细雨',
  rain: '雨',
  storm: '暴雨',
  snow: '雪',
});

/** 表驱动转移：禁止 clear → storm 直接跳转 */
const TRANSITIONS = Object.freeze({
  clear: ['cloudy', 'mist'],
  cloudy: ['clear', 'mist', 'drizzle'],
  mist: ['cloudy', 'clear', 'drizzle'],
  drizzle: ['cloudy', 'mist', 'rain'],
  rain: ['drizzle', 'cloudy', 'storm'],
  storm: ['rain', 'cloudy'],
  snow: ['cloudy', 'mist', 'clear'],
});

const INDOOR_HINTS = /[殿室房楼阁塔舱库仓厅堂庵观院舍屋]/;
const SHELTERED_HINTS = /[廊亭檐门阙桥]/;
const OUTDOOR_HINTS = /[道阶坪林池街巷岗坡崖峰岭野渡津口台湖河江山]/;
const NONE_HINTS = /幻境|梦境|识海|精神|心象|虚空|禁天气/;

/**
 * @param {string} roomId
 * @param {object} room
 * @returns {'outdoor'|'sheltered'|'indoor'|'none'}
 */
export function inferWeatherExposure(roomId = '', room = {}) {
  if (room.weatherExposure) return room.weatherExposure;
  if (room.disableWeather || room.noWeather) return 'none';
  if (room.zoneKind === 'dungeon' && room.spaceLayer === 'spirit') return 'none';

  const id = String(roomId || '');
  const name = String(room.name || id);
  const blob = `${id} ${name} ${room.desc || ''}`;

  if (NONE_HINTS.test(blob) || room.spaceLayer === 'spirit') return 'none';

  const short = name.includes('·') ? name.split('·').pop() : name;
  const tail = short || name;

  if (INDOOR_HINTS.test(tail) && !SHELTERED_HINTS.test(tail)) return 'indoor';
  if (SHELTERED_HINTS.test(tail)) return 'sheltered';
  if (OUTDOOR_HINTS.test(tail)) return 'outdoor';

  // 保守：明确室内关键字优先
  if (/内$|内室|密室|厢房/.test(tail)) return 'indoor';
  return 'outdoor';
}

/**
 * @param {string} roomId
 * @param {object} room
 */
export function inferClimateZone(roomId = '', room = {}) {
  if (room.climateZone) return String(room.climateZone);
  if (room.region) return String(room.region);
  if (room.area) return String(room.area);
  const id = String(roomId || '');
  const sep = id.indexOf('·');
  if (sep > 0) return id.slice(0, sep);
  return id || 'default';
}

function fnv1a(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickIndex(seedKey, modulo) {
  if (modulo <= 0) return 0;
  return fnv1a(seedKey) % modulo;
}

/**
 * 由 seed + gameTime + zone 确定性解析当前天气（每 2 时辰一槽）。
 */
export function resolveWeatherType(seed, gameTime, climateZone) {
  const slot = Math.floor((Number(gameTime) || 0) / 2);
  const zone = String(climateZone || 'default');
  const s = Number(seed) || 0;
  let current = WEATHER_TYPES[pickIndex(`${s}|${zone}|init`, WEATHER_TYPES.length)];
  for (let i = 1; i <= slot; i++) {
    const options = TRANSITIONS[current] || ['cloudy'];
    const idx = pickIndex(`${s}|${zone}|${i}|${current}`, options.length);
    current = options[idx];
  }
  return current;
}

function modifiersFor(type, exposure) {
  if (exposure === 'none' || exposure === 'indoor') {
    return { perceptionModifier: 0, searchModifier: 0 };
  }
  const table = {
    clear: { perceptionModifier: 0.05, searchModifier: 0.05 },
    cloudy: { perceptionModifier: 0, searchModifier: 0 },
    mist: { perceptionModifier: -0.1, searchModifier: -0.05 },
    drizzle: { perceptionModifier: -0.05, searchModifier: -0.05 },
    rain: { perceptionModifier: -0.1, searchModifier: -0.1 },
    storm: { perceptionModifier: -0.15, searchModifier: -0.15 },
    snow: { perceptionModifier: -0.1, searchModifier: -0.08 },
  };
  const m = table[type] || { perceptionModifier: 0, searchModifier: 0 };
  if (exposure === 'sheltered') {
    return {
      perceptionModifier: clampMod(m.perceptionModifier * 0.5),
      searchModifier: clampMod(m.searchModifier * 0.5),
    };
  }
  return {
    perceptionModifier: clampMod(m.perceptionModifier),
    searchModifier: clampMod(m.searchModifier),
  };
}

function clampMod(n) {
  if (n < -0.15) return -0.15;
  if (n > 0.1) return 0.1;
  return Math.round(n * 1000) / 1000;
}

function descriptionVariant(type, exposure, visible) {
  if (exposure === 'none') return 'none';
  if (exposure === 'indoor') {
    if (type === 'rain' || type === 'storm' || type === 'drizzle') return 'indoor_rain_sound';
    if (type === 'storm') return 'indoor_storm_sound';
    return 'indoor_neutral';
  }
  if (!visible) return 'hidden';
  return `outdoor_${type}`;
}

export class WeatherService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  _ensureState() {
    const s = this.game.state;
    if (!s.weather || typeof s.weather !== 'object') {
      s.weather = {
        seed: (Number(s.gameStart) || 1) % 2147483647 || 1,
        regions: {},
      };
    }
    if (!Number.isFinite(Number(s.weather.seed))) {
      s.weather.seed = 1;
    }
    if (!s.weather.regions || typeof s.weather.regions !== 'object') {
      s.weather.regions = {};
    }
    return s.weather;
  }

  /**
   * @param {string} roomId
   */
  getWeatherForRoom(roomId) {
    const id = roomId || this.game.state?.location;
    const room = this.game.LOCATIONS?.[id] || {};
    const exposure = inferWeatherExposure(id, room);
    const climateZone = inferClimateZone(id, room);
    const weather = this._ensureState();
    const gameTime = Number(this.game.state?.gameTime) || 0;

    if (exposure === 'none') {
      return {
        type: 'clear',
        label: WEATHER_LABELS.clear,
        visible: false,
        exposure,
        climateZone,
        descriptionVariant: 'none',
        perceptionModifier: 0,
        searchModifier: 0,
      };
    }

    this.advanceTo(gameTime);
    const region = weather.regions[climateZone] || {};
    const type = region.current || resolveWeatherType(weather.seed, gameTime, climateZone);
    const visible = exposure === 'outdoor' || exposure === 'sheltered';
    const mods = modifiersFor(type, exposure);

    return {
      type,
      label: WEATHER_LABELS[type] || type,
      visible,
      exposure,
      climateZone,
      descriptionVariant: descriptionVariant(type, exposure, visible),
      perceptionModifier: mods.perceptionModifier,
      searchModifier: mods.searchModifier,
    };
  }

  /**
   * 将各区域天气推进到给定 gameTime（确定性）。
   * @param {number} gameTime
   */
  advanceTo(gameTime) {
    const weather = this._ensureState();
    const t = Number(gameTime) || 0;
    const locations = this.game.LOCATIONS || {};
    const zones = new Set();

    // 至少覆盖当前房间气候区
    const loc = this.game.state?.location;
    if (loc) zones.add(inferClimateZone(loc, locations[loc] || {}));

    // 以及已有 region 键
    for (const z of Object.keys(weather.regions || {})) zones.add(z);

    // 已探索房间气候区（有限）
    const explored = this.game.state?.explored;
    if (Array.isArray(explored)) {
      for (const roomId of explored) {
        zones.add(inferClimateZone(roomId, locations[roomId] || {}));
      }
    }

    for (const zone of zones) {
      if (!zone) continue;
      const current = resolveWeatherType(weather.seed, t, zone);
      const nextSlotTime = (Math.floor(t / 2) + 1) * 2;
      const next = resolveWeatherType(weather.seed, nextSlotTime, zone);
      weather.regions[zone] = {
        current,
        next,
        changedAtGameTime: Math.floor(t / 2) * 2,
      };
    }

    return weather;
  }
}

export default WeatherService;
