# Interview Prep Coach

Next.js app with a pre-built frontend and two backend endpoints powered by OpenAI.

## Setup
- Install dependencies: `npm install`
- Set `OPENAI_API_KEY` in your environment (e.g., `.env.local`).

## Development
- Start dev server: `npm run dev`
- API routes live at `/api/generate-question` and `/api/coach-answer`.

## Notes
- Backend uses the official `openai` SDK and Node runtime.
- Routes validate input and return JSON; unexpected errors respond with status 500.
