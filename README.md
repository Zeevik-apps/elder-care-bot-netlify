# Elder Care Voice Bot (Hebrew) — Netlify
Minimal MVP: single web page with a big “דברי איתי” button + Netlify Functions for chat and TTS.
- Frontend: static HTML/JS in `/client`
- Backend: Netlify Functions in `/netlify/functions`
- Deploy: Netlify (Site: publish dir = `client`, Functions dir = `netlify/functions`)
- Secrets: `OPENAI_API_KEY` (Netlify Site settings → Environment variables)

## Quick start (local preview)
1) Install the Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```
2) From the project root, run:
   ```bash
   netlify dev
   ```
   It will serve the static site AND the functions locally.

## Deploy on Netlify (recommended)
1) Push this folder to a new GitHub repo (e.g., `elder-care-bot-netlify`).
2) In Netlify → **Add new site** → **Import an existing project** → choose the GitHub repo.
3) Build config:
   - **Base directory**: (leave empty)
   - **Build command**: (leave empty)
   - **Publish directory**: `client`
   - **Functions directory**: `netlify/functions`
4) In **Site settings → Environment variables**, add:
   - `OPENAI_API_KEY` = `sk-...`
5) Deploy. Visit the site URL on your tablet and add it to the home screen.

## Notes
- Hebrew STT uses the browser’s SpeechRecognition (webkitSpeechRecognition) with `he-IL`. If the tablet/browser doesn’t support it, a message will ask to type instead.
- TTS uses OpenAI Audio TTS. You can switch voices in `speak.js` (`voice: "alloy"` by default).
- The bot’s tone is gentle, positive, and creative by design (see `chat.js` instructions).

## Security & Privacy
- The site sends only the user’s transcribed text to your Netlify Function and then to OpenAI. No PII is required.
- You can disable logs in Netlify (Site settings → Log drain) and avoid storing request bodies.

## FYI
- If you later prefer WhatsApp/Telegram, we can reuse most of the logic from these functions.
- For Yiddish speech (TTS), quality varies; start with Hebrew voice and add Yiddish text support first.
