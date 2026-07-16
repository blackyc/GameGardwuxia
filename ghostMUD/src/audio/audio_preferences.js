/**
 * audio_preferences.js — 音频偏好独立持久化
 *
 * localStorage key: ghostmud.audio.preferences.v1
 * 与游戏存档分离；损坏时回退默认值，不抛异常。
 */

export const AUDIO_PREFS_KEY = 'ghostmud.audio.preferences.v1';

export const DEFAULT_AUDIO_PREFERENCES = Object.freeze({
  masterMuted: false,
  bgmMuted: false,
  sfxMuted: false,
  bgmVolume: 0.4,
  sfxVolume: 0.5,
});

/**
 * @param {*} value
 * @returns {typeof DEFAULT_AUDIO_PREFERENCES}
 */
export function normalizeAudioPreferences(value) {
  const base = { ...DEFAULT_AUDIO_PREFERENCES };
  if (!value || typeof value !== 'object') return base;
  return {
    masterMuted: Boolean(value.masterMuted),
    bgmMuted: Boolean(value.bgmMuted),
    sfxMuted: Boolean(value.sfxMuted),
    bgmVolume: clamp01(value.bgmVolume, base.bgmVolume),
    sfxVolume: clamp01(value.sfxVolume, base.sfxVolume),
  };
}

/**
 * @param {Storage|null|undefined} storage — localStorage-like
 */
export function loadAudioPreferences(storage) {
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store || typeof store.getItem !== 'function') {
      return { ...DEFAULT_AUDIO_PREFERENCES };
    }
    const raw = store.getItem(AUDIO_PREFS_KEY);
    if (raw == null || raw === '') return { ...DEFAULT_AUDIO_PREFERENCES };
    return normalizeAudioPreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_AUDIO_PREFERENCES };
  }
}

/**
 * @param {object} prefs
 * @param {Storage|null|undefined} storage
 */
export function saveAudioPreferences(prefs, storage) {
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store || typeof store.setItem !== 'function') return false;
    const normalized = normalizeAudioPreferences(prefs);
    store.setItem(AUDIO_PREFS_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

function clamp01(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export default {
  AUDIO_PREFS_KEY,
  DEFAULT_AUDIO_PREFERENCES,
  normalizeAudioPreferences,
  loadAudioPreferences,
  saveAudioPreferences,
};
