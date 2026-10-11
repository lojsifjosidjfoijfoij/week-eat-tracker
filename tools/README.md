# tools

Not part of the app. Install only when needed (`cd tools && npm install && npx playwright install chromium`).

- `e2e/` — runs the real app in a browser against an in-memory fake Supabase (`mock.mjs`, sample week in `seed.mjs`).
  Start the app first: `npm run build && npx vite preview --port 4173`, then `cd tools && npm run e2e`.
- `ad/` — the 20-second 9:16 ad. `stage.html` is the phone frame + captions; `record.mjs` drives the real app
  inside it and saves every frame with all animations stepped on a virtual clock (so the video is exactly the app).
  Needs the app on :4173 and the stage on :4174 (`cd tools/ad && python3 -m http.server 4174`), plus ffmpeg.
  `LANG_AD=en node record.mjs` makes the English version (captions in `stage.html`, sample data in `record.mjs` + `e2e/seed.mjs`).
- `ad/tiktok.html` + `ad/tiktok-record.mjs` + `ad/sound.py` — the "every family group chat at 5pm" TikTok.
  Record frames (`node tiktok-record.mjs`), then `python3 sound.py` (all sounds are synthesized, no samples),
  then mux with ffmpeg. Emoji images are Google Noto (Apache-2.0).
