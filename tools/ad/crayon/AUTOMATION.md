# Automated crayon video run (cloud, 4× a week) — TikTok, Facebook Reel, YouTube Shorts

A scheduled task starts a fresh cloud session Mon/Wed/Thu/Sat early morning and follows this file.
Louis's computer can be off: everything happens in the cloud session, GitHub and Metricool.
Read BRIEF.md first — style, sound, story formula and end-card are fixed and must be kept.

## 0. Setup
```
git clone --depth 1 -b claude/nordic-redesign https://github.com/lojsifjosidjfoijfoij/week-eat-tracker.git ~/dinrr
cd ~/dinrr && git config user.name "Claude" && git config user.email "noreply@anthropic.com"
```
The environment has Chromium at /opt/pw-browsers/chromium, ffmpeg, python3 with numpy/scipy/Pillow.
`tools/ad/crayon/make_video.sh` installs npm deps + Playwright, builds the app and starts both servers itself.

## 1. Pick the idea
- N = highest existing `scenesN.js` number + 1.
- Take the first unchecked line in `ideas.md`. If the queue is empty, invent a new idea (relatable family dinner/shopping problem → the real app fixes it), append it, use it.

## 2. Write the video
- `cp scenes4.js scenes$N.js` (or the newest one), `cp record4.mjs record$N.mjs`, `cp sound4.py sound$N.py`.
- In `record$N.mjs`: change the default PAGE `crayon4.html` → `crayon$N.html` and `sfx4.json` → `sfx$N.json`; adapt the mock meals/ingredients and the tap list to what the app scene must show (ticks use `.shop-row__main` with the row name; the shopping list opens via `.shop-btn`).
- In `sound$N.py`: DUR, `sfx4.json`, output names `sfx$N/music$N/mix$N.wav`, and the music section times to the new timeline. Add new SFX types if needed (all synthesized, cartoon sounds, never chiptune/coins, never samples).
- Write the scenes: 22–28 s, hook in 0–3 s, something new every 1–2 s, climax, ~6 s of the REAL app in the crayon phone with three yellow caption bands, the same scene resolved, then the fixed dinrr end-card (green "dinrr", orange underline, one red/navy point line, yellow @dinrr.app pill). English text only. Own characters only — no known characters, brands or logos.

## 3. Stills → self-review (max 3 rounds)
`SLUG=<kebab-title> tools/ad/crayon/make_video.sh $N stills "<8–14 times covering every beat>"`
Open `stills$N/sheet.png` with Read and check: nothing cut off or overlapping text, characters readable, the joke reads without sound, app scene shows the right rows, end-card correct. Fix and repeat.

## 4. Render
`SLUG=<kebab-title> tools/ad/crayon/make_video.sh $N render` (~10 min; run with a 15-min timeout).
Check: both files in `out$N/`, duration 22–28 s (ffprobe), size < 30 MB. Make a contact sheet from ~10 frames in `frames$N/` and look at it.
If the render fails twice: commit the sources, log the failure, report, and stop (no Metricool).

## 5. Public URL
```
git fetch --depth 1 origin media && git worktree add ../mediawt FETCH_HEAD
cd ../mediawt && git switch -c media-upload && cp ../dinrr/tools/ad/crayon/out$N/*.mp4 . && git add -A && git commit -m "media: dinrr #$N <title>" && git push origin HEAD:media
```
Verify `https://raw.githubusercontent.com/lojsifjosidjfoijfoij/week-eat-tracker/media/<file>.mp4` returns 200.

## 6. Metricool — DRAFTS ONLY (brand/blogId 7364131, Europe/Copenhagen)
Louis's Metricool plan is FREE, so the review/approval flow is not available. Deliver as **drafts**:
`createScheduledPost` with `"draft": true`. A draft is never published by itself; Louis opens it in Metricool and schedules it.
NEVER create a non-draft post, never use `updateScheduledPost` to change a draft into a live post, never touch posts this run did not create.
1. `getScheduledPosts` for the next 7 days.
2. Slots: both TikTok and Facebook Reel = the same day as the run, 14:00 (Europe/Copenhagen). One post per platform per day: if a day already has one on that platform, move that platform to the next free day, still 14:00.
3. Three drafts (TikTok, Facebook Reel, YouTube Short), music version URL in `media`:
   - TikTok: providers `[{"network":"tiktok"}]`, `tiktokData {privacyOption:"PUBLIC_TO_EVERYONE", title, photoCoverIndex:0}`.
   - Facebook: providers `[{"network":"facebook"}]`, `facebookData {type:"REEL", title}`.
   - text: one short comment-bait line + 4–6 hashtags, English (see BRIEF §6).
   - YouTube Short (channel UCo77aEKLLxaBfem3psxsA_w is connected): a third draft, always, providers `[{"network":"youtube"}]`, `youtubeData {title:"<title> #shorts", type:"short", privacy:"public", madeForKids:false, isAiGeneratedContent:false, category:"COMEDY"}`, same text, same 14:00 slot rule.
4. `getScheduledPosts` again and confirm all three drafts exist with the right time, platform and text.

## 7. Save & report
- Tick the idea in `ideas.md` (`- [x] #N "Title" — YYYY-MM-DD`), append one line to `LOG.md` (date, N, title, files, draft times or failure).
- Commit `scenes$N.js record$N.mjs sound$N.py crayon$N.html ideas.md LOG.md` (frames/stills/out/wav are ignored), `git fetch origin claude/nordic-redesign && git rebase FETCH_HEAD`, push to `claude/nordic-redesign`.
- Final message (short, Danish): title, what happens in the video, the three draft times, and that they wait as drafts in Metricool. Attach the stills sheet and the music mp4 with SendUserFile.
