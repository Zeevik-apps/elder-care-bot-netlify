/**
 * Centralized model configuration. This module defines the names of all
 * OpenAI models used throughout the application. By pulling values from
 * environment variables when available, we avoid hard‑coding model names in
 * multiple places. If you need to switch tiers (e.g. nano → mini), update the
 * relevant environment variable or override the tier in code via chooseModel.
 */

// Helper to read environment variables from both Node.js and browser builds.
const env = (key, fallback) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Vite / browser builds expose env via import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return fallback;
};

/**
 * Enumeration of all model names used in the application. Each kind of model
 * (text, stt, tts) has sensible defaults and optional fallbacks. Adjust the
 * defaults via environment variables rather than sprinkling strings in code.
 */
export const MODELS = {
  text: {
    // Ultra low cost model, great for testing and high volume usage.
    cheap: env('OPENAI_TEXT_MODEL_CHEAP', 'gpt-4.1-nano'),
    // Reasonable default for day‑to‑day use.
    default: env('OPENAI_TEXT_MODEL_DEFAULT', 'gpt-4.1-mini'),
    // Higher quality at a higher price.
    quality: env('OPENAI_TEXT_MODEL_QUALITY', 'gpt-4.1'),
    // o‑series models (e.g. gpt-4o) provide multi‑modal capabilities.
    o_series: env('OPENAI_TEXT_MODEL_O', 'gpt-4o'),
  },
  stt: {
    // Primary speech‑to‑text model.
    default: env('OPENAI_STT_MODEL', 'gpt-4o-transcribe'),
    // Fallback STT model (e.g. whisper-1) used when default is unavailable.
    fallback: env('OPENAI_STT_FALLBACK', 'whisper-1'),
  },
  tts: {
    // Primary text‑to‑speech model. Some orgs may have different names here.
    default: env('OPENAI_TTS_MODEL', 'gpt-4o-mini-tts'),
    // Fallback TTS model used when the default cannot be reached.
    fallback: env('OPENAI_TTS_FALLBACK', 'tts-1'),
  },
};

/**
 * Select a model name for the given kind and tier. If the requested kind or
 * tier is not known, an error will be thrown. For STT and TTS kinds, the
 * "tier" argument is ignored and the default model is returned.
 *
 * @param {Object} opts - Options for selecting a model.
 * @param {'text'|'stt'|'tts'} opts.kind - The kind of model to retrieve.
 * @param {'cheap'|'default'|'quality'|'o'} [opts.tier='default'] - Tier for
 *   text models. Ignored for STT and TTS.
 * @returns {string} The name of the selected model.
 */
export function chooseModel({ kind = 'text', tier = 'default' } = {}) {
  const group = MODELS[kind];
  if (!group) {
    throw new Error(`Unknown model kind: ${kind}`);
  }
  if (kind === 'text') {
    if (tier === 'cheap') return group.cheap;
    if (tier === 'quality') return group.quality;
    if (tier === 'o') return group.o_series;
    return group.default;
  }
  // For STT and TTS, ignore tier and return default.
  return group.default;
}