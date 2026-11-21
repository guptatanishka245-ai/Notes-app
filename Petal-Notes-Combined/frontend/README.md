# Petal Notes 🌸 — React frontend

Baby-pink & white notes app UI for the Express/MongoDB backend (`/user/*`, `/note/*`).

## Run
1. Start the backend (port 8080 from its `.env`):  `npm run server`
2. In this folder:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

Vite proxies `/api/*` → `http://localhost:8080`, so **no backend changes / CORS setup needed** in dev.
If your backend runs on another port, edit `vite.config.js`.

For production, build with `VITE_API_URL=https://your-api npm run build` (the backend would then need the `cors` package).

## Features
Login / signup (animated toggle, password strength) · create / edit / delete notes · live search with highlight ·
sort · pin notes (saved in the browser) · 3D tilt cards · petals + cursor glow · confetti on save ·
toasts · skeleton loaders · shortcuts: `n` new note, `/` search, `Esc` close, `Ctrl+Enter` save.
