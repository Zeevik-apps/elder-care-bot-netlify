// netlify/functions/speak.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'missing text' }) };

    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-transcribe',
        voice: 'alloy',   // אפשר להחליף קול בהמשך
        format: 'mp3',
        input: text
      })
    });

    const buf = Buffer.from(await r.arrayBuffer());
    const base64 = buf.toString('base64');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mp3: `data:audio/mpeg;base64,${base64}` })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: 'tts failure' }) };
  }
};
