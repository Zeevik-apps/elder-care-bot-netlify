import OpenAI from 'openai';
import { chooseModel, MODELS } from './config/models.js';

/**
 * Run a single chat completion against OpenAI. The model used for the request
 * is selected via the `tier` argument and resolved through `chooseModel`. If
 * the chosen model cannot be found, a fallback model is attempted and the
 * error is logged with the offending model name to aid debugging.
 *
 * @param {string} prompt The user input to send to the assistant.
 * @param {Object} opts Additional options.
 * @param {'cheap'|'default'|'quality'|'o'} [opts.tier='default'] The model
 *   tier to use for text completions.
 * @returns {Promise<string>} The assistant's reply.
 */
export async function runChat(prompt, { tier = 'cheap' } = {}) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const modelName = chooseModel({ kind: 'text', tier });
  try {
    const res = await client.responses.create({
      model: modelName,
      input: prompt,
      temperature: 0.7,
    });
    return res.output_text;
  } catch (error) {
    // Log the error and model that caused it. This will surface any
    // lingering hard‑coded model names in your codebase.
    console.error(
      `OpenAI request failed for model "${modelName}":`,
      error?.error || error
    );
    // If the error indicates the model does not exist, attempt a fallback.
    const code = error?.error?.code || error?.code;
    const status = error?.statusCode || error?.status || error?.error?.status;
    if (
      code === 'model_not_found' ||
      status === 400 ||
      status === 404
    ) {
      const fallbackModel = chooseModel({ kind: 'text', tier: 'default' });
      // Avoid infinite recursion if the fallback is the same as the original.
      if (fallbackModel !== modelName) {
        try {
          const fallbackRes = await client.responses.create({
            model: fallbackModel,
            input: prompt,
            temperature: 0.7,
          });
          return fallbackRes.output_text;
        } catch (fallbackError) {
          console.error(
            `Fallback OpenAI request failed for model "${fallbackModel}":`,
            fallbackError?.error || fallbackError
          );
          throw fallbackError;
        }
      }
    }
    throw error;
  }
}