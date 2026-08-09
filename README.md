# Dark Lord — AI Study Bot

This repository contains a minimal Vite + React demo for the "Dark Lord" AI Study Bot. It is intentionally local-first so students can try it quickly without creating accounts.

Quick start

1. Install:

   npm install

2. Create a local env file to enable the AI proxy (optional):

   cp .env.example .env.local
   # then open .env.local and set GROQ_API_KEY and GROQ_API_URL if you intend to call Groq.ai

3. Run the dev server:

   npm run dev

Notes

- The demo stores chats and flashcards in localStorage.
- To enable AI calls you must deploy the api/ai-proxy serverless function and set GROQ_API_KEY in the environment. See api/ai-proxy.js for a proxy stub.
- Do NOT commit your API keys.
