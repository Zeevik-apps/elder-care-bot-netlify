// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || '{}');
    console.log('Received input:', text); // Debug input

    if (!text) {
      console.log('No text provided in request');
      return { 
        statusCode: 400, 
        body: JSON.stringify({ 
          error: 'missing text',
          details: 'Please provide text input' 
        }) 
      };
    }

    console.log('Calling OpenAI API...'); // Debug API call
    const r = await fetch('https://api.openai.com/v1/chat/completions', { // Fixed API endpoint
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4', // Fixed model name
        messages: [{ 
          role: 'system',
          content: `את צ'אטבוטית חמה, סבלנית ויצירתית המלווה אישה בת 85. דברי בעברית פשוטה, משפטים קצרים, טון מעודד ונעים. שלבי מעט הומור עדין. אוהבת ציור וסיפורים חיוביים ומדע/חדשנות בניסוח נגיש.`
        },
        { 
          role: 'user', 
          content: text 
        }]
      })
    });

    const data = await r.json();
    console.log('OpenAI response:', data); // Debug response

    if (!data.choices || !data.choices[0]) {
      console.error('Invalid API response:', data);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'invalid_response',
          details: 'Unexpected API response format' 
        })
      };
    }

    const reply = data.choices[0].message.content;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    console.error('Error details:', e);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'chat_failure',
        details: e.message 
      }) 
    };
  }
};
