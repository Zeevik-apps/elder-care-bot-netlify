import OpenAI from 'openai';
import { chooseModel, MODELS } from './config/models.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Convert an audio buffer into text using OpenAI's speech‑to‑text API. This
 * function selects the STT model via configuration and falls back to a
 * secondary model if the primary is unavailable. Errors are logged with
 * the model name to aid debugging of hard‑coded references.
 *
 * @param {ArrayBuffer|Blob|File|Buffer} fileBuffer The audio to transcribe.
 * @returns {Promise<string>} The transcribed text.
 */
export async function speechToText(fileBuffer) {
  const sttModel = chooseModel({ kind: 'stt' });
  try {
    const res = await client.audio.transcriptions.create({
      model: sttModel,
      file: new File([fileBuffer], 'speech.wav', { type: 'audio/wav' }),
    });
    return res.text;
  } catch (error) {
    console.error(
      `Speech‑to‑text failed for model "${sttModel}":`,
      error?.error || error
    );
    const code = error?.error?.code || error?.code;
    const status = error?.statusCode || error?.status || error?.error?.status;
    if (
      code === 'model_not_found' ||
      status === 400 ||
      status === 404
    ) {
      const fallbackModel = MODELS.stt.fallback;
      if (fallbackModel && fallbackModel !== sttModel) {
        try {
          const res2 = await client.audio.transcriptions.create({
            model: fallbackModel,
            file: new File([fileBuffer], 'speech.wav', { type: 'audio/wav' }),
          });
          return res2.text;
        } catch (fallbackError) {
          console.error(
            `Speech‑to‑text fallback model "${fallbackModel}" failed:`,
            fallbackError?.error || fallbackError
          );
          throw fallbackError;
        }
      }
    }
    throw error;
  }
}

/**
 * Convert a string of text into speech audio using OpenAI's TTS API. If the
 * primary TTS model returns a 400/404 or model_not_found error, the function
 * will automatically retry with a fallback model defined in the config. All
 * failures are logged with the model name to surface hard‑coded strings.
 *
 * @param {string} text The text to convert to speech.
 * @param {Object} opts Optional parameters.
 * @param {string} [opts.voice='alloy'] The voice to use. See OpenAI docs for
 *   available voices.
 * @param {string} [opts.format='mp3'] The audio format ('mp3','wav','ogg').
 * @returns {Promise<ArrayBuffer>} The raw audio data.
 */
export async function textToSpeech(
  text,
  { voice = 'alloy', format = 'mp3' } = {}
) {
  const ttsModel = chooseModel({ kind: 'tts' });
  try {
    const res = await client.audio.speech.create({
      model: ttsModel,
      voice,
      input: text,
      format,
    });
    // `res` may be a stream depending on SDK; normalize to ArrayBuffer.
    if (typeof res.arrayBuffer === 'function') {
      return await res.arrayBuffer();
    }
    return res;
  } catch (error) {
    console.error(
      `Text‑to‑speech failed for model "${ttsModel}":`,
      error?.error || error
    );
    const code = error?.error?.code || error?.code;
    const status = error?.statusCode || error?.status || error?.error?.status;
    if (
      code === 'model_not_found' ||
      status === 400 ||
      status === 404
    ) {
      const fallbackModel = MODELS.tts.fallback;
      if (fallbackModel && fallbackModel !== ttsModel) {
        try {
          const res2 = await client.audio.speech.create({
            model: fallbackModel,
            voice,
            input: text,
            format,
          });
          if (typeof res2.arrayBuffer === 'function') {
            return await res2.arrayBuffer();
          }
          return res2;
        } catch (fallbackError) {
          console.error(
            `Text‑to‑speech fallback model "${fallbackModel}" failed:`,
            fallbackError?.error || fallbackError
          );
          throw fallbackError;
        }
      }
    }
    throw error;
  }
}