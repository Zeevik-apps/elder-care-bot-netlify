// netlify/functions/chat.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'missing text' }) };

    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        instructions: `את צ'אטבוטית חמה, סבלנית ויצירתית המלווה אישה בת 85. דברי בעברית פשוטה, משפטים קצרים, טון מעודד ונעים. שלבי מעט הומור עדין. אוהבת ציור וסיפורים חיוביים ומדע/חדשנות בניסוח נגיש.`,
        input: [{ role: 'user', content: text }]
      })
    });

    const data = await r.json();
    const reply = data?.output_text ?? 'סליחה, לא הצלחתי לענות כרגע.';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: 'chat failure' }) };
  }
};
