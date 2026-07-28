/**
 * Runtime audio assets and logical cues.
 *
 * Maintenance rules:
 * - Gameplay references cue ids, never public file paths.
 * - Catalogued assets are classified and ready for later authoring but are not
 *   played until a cue references them.
 * - Movement surface fallbacks currently share the stone cue by design.
 */

const asset = (src, category, sourceName, tags, status = 'catalogued') =>
  Object.freeze({ src, category, sourceName, tags: Object.freeze(tags), status });

export const AUDIO_ASSET_DEFINITIONS = Object.freeze({
  'audio.ui.click': asset('/assets/audio/ui/ui-click.wav', 'ui', 'ui-click.wav', ['click', 'button'], 'active'),

  'audio.movement.stone.01': asset('/assets/audio/movement/stone/st1-footstep.mp3', 'movement', 'st1-footstep.mp3', ['footstep', 'stone'], 'active'),
  'audio.movement.stone.02': asset('/assets/audio/movement/stone/st2-footstep.mp3', 'movement', 'st2-footstep.mp3', ['footstep', 'stone'], 'active'),
  'audio.movement.nature.trail': asset('/assets/audio/movement/nature/footsteps-nature-trail.mp3', 'movement', 'footsteps-on-the-nature-trail.mp3', ['footstep', 'nature']),

  'audio.ambience.rural.cows': asset('/assets/audio/ambience/rural/cows.wav', 'ambience', 'cows.wav', ['animal', 'rural']),
  'audio.ambience.supernatural.dark': asset('/assets/audio/ambience/supernatural/dark-mystical-atmosphere.wav', 'ambience', 'dark-mystical-atmosphere-healing-ghostly-presence.wav', ['dark', 'mystical', 'ghostly']),
  'audio.ambience.fire.crackling': asset('/assets/audio/ambience/fire/fire-crackling-roar.wav', 'ambience', 'firecracklingroar-of-flame-2_em_4lrs.wav', ['fire', 'loop-candidate']),
  'audio.ambience.mountain.wind': asset('/assets/audio/ambience/mountain/mountain-wind.mp3', 'ambience', '-mountain-wind-.mp3', ['mountain', 'wind', 'loop-candidate']),
  'audio.ambience.nature.birds': asset('/assets/audio/ambience/nature/birds.mp3', 'ambience', '鸟叫.mp3', ['birds', 'nature']),

  'audio.voice.female.evil_laugh': asset('/assets/audio/voice/female/evil-yandere-laugh.mp3', 'voice', 'evil-women-yandere-laugh.mp3', ['female', 'laugh', 'hostile']),
  'audio.voice.female.sigh': asset('/assets/audio/voice/female/female-sigh.mp3', 'voice', 'female-sigh.mp3', ['female', 'sigh']),
  'audio.voice.female.chuckle': asset('/assets/audio/voice/female/girl-chuckle.mp3', 'voice', '-girl-chucklewav.mp3', ['female', 'young', 'chuckle']),
  'audio.voice.female.giggle': asset('/assets/audio/voice/female/girl-giggling.mp3', 'voice', 'girl-giggling.mp3', ['female', 'young', 'giggle']),
  'audio.voice.female.crying': asset('/assets/audio/voice/female/female-crying.mp3', 'voice', 'universfield-female-crying.mp3', ['female', 'crying']),
  'audio.voice.female.big_gasp': asset('/assets/audio/voice/female/big-gasp.mp3', 'voice', 'women-big-gasp-.mp3', ['female', 'gasp', 'surprise']),
  'audio.voice.female.cold_laugh': asset('/assets/audio/voice/female/cold-laugh.mp3', 'voice', 'women-cold-laughing.mp3', ['female', 'laugh', 'cold']),
  'audio.voice.female.cough': asset('/assets/audio/voice/female/cough.mp3', 'voice', 'wuman-cough.mp3', ['female', 'cough']),
  'audio.voice.female.young_laugh': asset('/assets/audio/voice/female/young-woman-laugh.mp3', 'voice', 'young-woman-laugh.mp3', ['female', 'young', 'laugh']),

  'audio.voice.male.deep_laugh': asset('/assets/audio/voice/male/deep-laugh-chuckle.mp3', 'voice', 'man-deep-laugh-chuckle.mp3', ['male', 'deep', 'laugh']),
  'audio.voice.male.gasp': asset('/assets/audio/voice/male/gasp.mp3', 'voice', 'man-gasp-82819.mp3', ['male', 'gasp']),
  'audio.voice.male.short_cough': asset('/assets/audio/voice/male/short-cough.mp3', 'voice', 'man-short-cough-85213.mp3', ['male', 'cough']),
  'audio.voice.male.old_laugh': asset('/assets/audio/voice/male/old-man-laugh.mp3', 'voice', 'oldman laugh.mp3', ['male', 'old', 'laugh']),
});

export const AUDIO_CUES = Object.freeze({
  'cue.ui.click': Object.freeze({
    variants: Object.freeze(['audio.ui.click']),
    gain: 0.72,
    poolSize: 4,
  }),
  'cue.movement.stone': Object.freeze({
    variants: Object.freeze([
      'audio.movement.stone.01',
      'audio.movement.stone.02',
    ]),
    gain: 0.82,
    poolSize: 4,
  }),
});

export const MOVEMENT_SURFACE_CUES = Object.freeze({
  stone: 'cue.movement.stone',
  dirt: 'cue.movement.stone',
  wood: 'cue.movement.stone',
  grass: 'cue.movement.stone',
});

export function resolveAudioAsset(assetId) {
  return AUDIO_ASSET_DEFINITIONS[assetId]?.src || '';
}

export function resolveAudioCue(cueId) {
  return AUDIO_CUES[cueId] || null;
}

export function resolveMovementCue(surface = 'stone') {
  return MOVEMENT_SURFACE_CUES[surface] || MOVEMENT_SURFACE_CUES.stone;
}
