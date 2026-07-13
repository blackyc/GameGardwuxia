/**
 * Deterministic, serializable PRNG for combat resolution.
 * UI playback speed must never change the generated sequence.
 */
export class BattleRng {
  constructor(seed = Date.now(), savedState = null) {
    this.state = savedState?.state >>> 0 || hashSeed(seed);
    if (this.state === 0) this.state = 0x6d2b79f5;
  }

  next() {
    let x = this.state >>> 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 0x100000000;
  }

  snapshot() {
    return { state: this.state >>> 0 };
  }
}

export function createBattleRng(seed, savedState = null) {
  return new BattleRng(seed, savedState);
}

function hashSeed(value) {
  const text = String(value ?? 'ghostmud-battle');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
