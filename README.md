# English Tutor — Zero‑Cost (Client-side) — Preview

This project is a zero-cost, client-only English tutor web app:
- Next.js + TypeScript (static build)
- Browser voice: SpeechRecognition (STT) + SpeechSynthesis (TTS)
- Local self‑learning: conversations and feedback saved in localStorage
- Retrieval-based context (local) to improve replies over time
- No external paid APIs required (works entirely in the browser)

Quick start (local):
1. npm install
2. npm run dev
3. Open http://localhost:3000

How it works:
- The app keeps a conversation history in localStorage.
- For each user message, the app retrieves similar past messages and constructs a context.
- If a local WASM LLM is installed (optional, user-provided), the app will call it. Otherwise a lightweight generation + retrieval template produces replies.
- Voice: press microphone to speak; app converts speech to text and sends it to the chat.

Deploy to Vercel:
- Connect this repository to Vercel (free tier).
- Vercel will auto-build and deploy on push to main.
- No environment variables are required for the zero-cost setup.

Notes & next steps:
- Optionally add a client-side WASM model (gpt4all/llama.cpp) later: the code contains hooks (window.localModel) for that.
- To collect server-side aggregated training data in future, add a server API and storage (not included in zero-cost mode).