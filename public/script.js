let recognition;

function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'he-IL';

        recognition.onstart = () => {
            console.log('Voice recognition started');
            document.getElementById('status').textContent = 'מקשיב...';
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            console.log('Recognized text:', text);
            document.getElementById('status').textContent = 'זיהיתי: ' + text;
            sendToBot(text);
        };

        recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            document.getElementById('status').textContent = 'שגיאה בזיהוי קול: ' + event.error;
        };

        recognition.onend = () => {
            console.log('Voice recognition ended');
            document.getElementById('status').textContent = 'הקלטה הסתיימה';
        };
    } else {
        console.error('Speech recognition not supported');
        document.getElementById('status').textContent = 'זיהוי קול אינו נתמך בדפדפן זה';
    }
}

async function sendToBot(text) {
    try {
        document.getElementById('status').textContent = 'שולח לבוט...';
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();
        console.log('Bot response:', data);

        if (data.error) {
            document.getElementById('status').textContent = 'שגיאה: ' + data.error;
        } else {
            document.getElementById('status').textContent = 'התקבלה תשובה';
            document.getElementById('response').textContent = data.reply;
        }
    } catch (e) {
        console.error('Error sending to bot:', e);
        document.getElementById('status').textContent = 'שגיאה בשליחה לבוט';
    }
}
