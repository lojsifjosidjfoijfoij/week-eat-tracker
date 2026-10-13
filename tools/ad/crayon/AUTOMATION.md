# Automated crayon video run (cloud, 4× a week) — TikTok, Facebook Reel, YouTube Shorts, published automatically

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
- **Hook rule (from analytics: viewers left after ~7 s of 23 s on #1).** Frame 0 must already show the problem — no establishing shot, no slow build. A big yellow label or speech bubble with the funniest line is readable in the first second, there is movement in the first 0.5 s and a sound at t=0. The first 2 s must make sense with sound off. Escalate fast; the real app must start before ~12 s. Aim for 20–24 s and an end frame that loops back into frame 0. Before writing scenes, read `STATS.md` (if present) and lean into what worked.
- Write the scenes: 20–26 s, hook in 0–2 s, something new every 1–2 s, climax, ~6 s of the REAL app in the crayon phone with three yellow caption bands, the same scene resolved, then the fixed dinrr end-card (green "dinrr", orange underline, one red/navy point line, yellow @dinrr.app pill). English text only. Own characters only — no known characters, brands or logos.

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

## 6. Metricool — publish automatically (brand/blogId 7364131, Europe/Copenhagen)
Louis decided (2026-10-13) that videos are published without his approval. Create **scheduled posts** with `createScheduledPost`, `"draft": false`, `"autoPublish": true` — but ONLY if the self-review in step 3/4 passed (no cut-off text, the joke reads, real app shown, end-card correct, no rule problems below). If the video failed review or you are unsure, create the same three posts with `"draft": true` instead and say so in the report.
Never edit or delete posts this run did not create.

**Platform rules (TikTok Community Guidelines / branded content, YouTube, Meta) — always:**
- TikTok: `commercialContentOwnBrand: true` (we promote our own app = "Your brand" disclosure) and `isAigc: true` (the video is made with AI). Facebook/YouTube: no extra flags; YouTube `isAiGeneratedContent:false` is correct because nothing is realistic.
- Original content only: our own drawings and our own synthesized sound. No real people, celebrities, known characters, logos, brands, products or copyrighted music.
- Honest: no false or exaggerated claims about the app (only features it really has), no fake reviews/testimonials, no "#1 app", no prices/discounts/giveaways, no links or promo codes in the text.
- Safe & family-friendly: nothing dangerous, no unsafe food handling, no mocking groups of people, no violence beyond cartoon slapstick, kids characters only in everyday family situations.
- No engagement manipulation: a genuine question is fine; never "like/follow for…" demands, never fake counts. 4–6 relevant hashtags, no unrelated trending tags.
- Max one post per platform per day.

1. `getScheduledPosts` for the next 7 days.
2. Slots: TikTok, Facebook Reel and YouTube Short = the same day as the run, 14:00 (Europe/Copenhagen). If a platform already has a post that day, move that platform to the next free day, still 14:00.
3. Three posts, music version URL in `media`:
   - TikTok: providers `[{"network":"tiktok"}]`, `tiktokData {privacyOption:"PUBLIC_TO_EVERYONE", title, photoCoverIndex:0, commercialContentOwnBrand:true, isAigc:true}`.
   - Facebook: providers `[{"network":"facebook"}]`, `facebookData {type:"REEL", title}`.
   - text (TikTok + Facebook): one short line that makes people want to answer + 4–6 hashtags, English (see BRIEF §6).
   - YouTube Short: providers `[{"network":"youtube"}]`, `youtubeData {title:"<title> #shorts", type:"short", privacy:"public", madeForKids:false, isAiGeneratedContent:false, category:"COMEDY", tags:[…]}`. YouTube gets its OWN longer text (it is the video description): line 1 = hook from the video; blank line; 2 sentences: the problem in the video + how dinrr solves it; blank line; a comment question with 👇; blank line; "📲 dinrr – the weekly meal planner for families" and "TikTok: @dinrr.app"; blank line; "#shorts" + 5 hashtags. `tags` = 6–8 search phrases, always incl. "meal planner app" and "dinrr". Title max ~60 chars, ends with " #shorts". Example: the #4 YouTube post in Metricool (2026-10-18 16:00).
4. `getScheduledPosts` again and confirm all three exist with the right time, platform, text and draft:false.

## 7. Save & report
- Tick the idea in `ideas.md` (`- [x] #N "Title" — YYYY-MM-DD`), append one line to `LOG.md` (date, N, title, files, post times or failure).
- Commit `scenes$N.js record$N.mjs sound$N.py crayon$N.html ideas.md LOG.md` (frames/stills/out/wav are ignored), `git fetch origin claude/nordic-redesign && git rebase FETCH_HEAD`, push to `claude/nordic-redesign`.
- Final message (short, Danish): title, what happens in the video, the three publish times (and if anything fell back to draft, why). Attach the stills sheet and the music mp4 with SendUserFile.
