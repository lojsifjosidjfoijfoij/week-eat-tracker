# dinrr – video-brief (til en ny chat der KUN laver videoer)

Formål: lav korte, tegnede "crayon"-videoer til TikTok + Facebook, der får folk til at tænke "det dér er mig" – og som altid ender i selve dinrr-appen, så man kan mærke det er dinrr.

## 1. Den faste stil (må aldrig ændres)

**Look**
- Hånd-tegnet farvekridt på papir: skælvende streger (tegningen "koger" ca. 8 gange i sekundet), kridt-skravering, papirkorn og blød vignet. Tegnet i JS på et canvas (540×960, rendres i 1080×1920), ikke AI-video.
- Hele skærmen bruges (9:16), ingen ramme eller sort kant.
- Karakterer er simple pind-/æggefigurer **uden rigtige ansigter** (to prikker, en streg til mund, øjenbryn). Hver karakter er vores egen opfindelse – vi kopierer aldrig kendte figurer, logoer, mærker eller værker.
- Skrift: Patrick Hand (replikker) og Caveat Brush (overskrifter, tal, logo). Kun engelsk tekst i videoerne (internationalt publikum).
- Farver: varm creme/fersken baggrund, mørk navy streg (#22305A), dinrr-grøn (#2E7D32) + orange (#F28A2E) understregning, gul til "labels", rød til stress.
- Overgange: kridt-"scribble"-wipe i orange.

**Lyd (altid original, syntetiseret i Python – ingen samples, ingen copyright)**
- Cartoon-lyd, IKKE spil-lyd: træ-bonk, slide-whistle, klovnehorn, trist trombone, hundeglam, snare-roll, glasknus, ukulele/xylofon/tuba-musik. Aldrig chiptune/mønt-lyde.
- Hver video leveres i 2 versioner: **med musik** og **kun SFX** (så man kan lægge en trending lyd på inde i TikTok-appen).

## 2. Hvilken slags video til hvad

| Type | Brug | Eksempel |
|---|---|---|
| **Relatable familie-sketch** (kaos → vendepunkt → app) | Organisk TikTok/Facebook, kommentar-bait, deles af forældre | #3 "The Dinner Hotline" |
| **Mini-historie / sjov fortælling** med en lille helt og et mål | Organisk reach, folk ser til slutningen | #2 "Save the tomato" |
| **Gag/tidsrejse** ("hvad skal vi have at spise" gennem tiderne) | Hurtig hook, god til nye følgere | #1 "230 million years ago" |
| Produkt-reklamer (tools/ad/tiktok.html, UI-baserede) | Betalt reklame / profil, ikke organisk | tidligere reklamer |

Tommelfingerregel: **organisk = crayon-sketch**, **betalt = produkt-reklame**. Crayon-videoerne sælger ikke med funktionsliste, de sælger et gen-kendeligt problem.

## 3. Historie-formlen (hold den)

1. **0–3 s hook:** problemet vises med det samme (tæller, replik, gag). Ingen intro.
2. **Eskalation:** det bliver værre/sjovere, ca. hvert 1–2 s sker der noget nyt (lyd + visuel ændring).
3. **Vendepunkt:** klimaks (noget går i stykker, skiltet hænges op, tomaten ruller).
4. **Appen (ca. 6 s):** den ÆGTE dinrr-app i en kridt-telefon, i fuld skærm. Ugen fyldes ud live, indkøbslisten krydses af. Tre korte tekstbånd, fx "So Mom made a plan." / "Everyone sees it live." / "Nobody has to ask."
5. **Udløsning:** samme scene som starten, men nu løst (tæller viser 0, alle svarer "Tacos!").
6. **End-card (altid ens):** creme/fersken baggrund, grønt **"dinrr"** i Caveat Brush med orange understregning, én linje med pointen (fx "Stop being the dinner hotline."), gul pille **@dinrr.app**. Det er dét der gør at man mærker det er dinrr – lav det altid sådan, og lad appen være med i hver video.

Længde 22–28 s. Altid et loop-venligt, tydeligt slutbillede.

## 4. Idébank (næste videoer)
- "The Sunday Scaries": en far står i supermarkedet uden liste, 40 sms'er ruller ind → ugen er planlagt og listen synkroniseret.
- "Shopping list roulette": to forældre køber hver sin pakke pasta (dobbelt op) → fælles liste, tjek-af i realtid.
- "The leftovers monster": rester i køleskabet bliver til et monster der vokser hver dag → planlagt uge, ingen madspild.
- "Teenager vs. dinner": teenageren siger "jeg spiser ikke hjemme" 5 gange → ser menuen, bliver hjemme.
- "Grandma joins the family": bedstemor kommer med familiekoden (join-kode) og ser ugens menu.

## 5. Sådan laves en video (teknik)

Repo: `lojsifjosidjfoijfoij/week-eat-tracker`, mappe `tools/ad/crayon/` (arbejdskopi `/home/claude/work/dinrr`, branch `claude/nordic-redesign`).

- `engine3.html` = kridt-motoren (person(), hund, telefon osv.). `scenes3.js` = én videos scener + lyd-events (`window.SFX`). `crayon3.html` = de to filer sat sammen (`cat engine3.html scenesN.js > crayonN.html`).
- Alt er deterministisk: `window.render(t)` tegner sekund `t`.
- Forhåndsvisning af stills: `PAGE=crayon3.html T=0.5,3,9 node still.mjs` (serveren: `python3 -m http.server 4175` i mappen; appen kører på `vite preview` port 4173 via `bash scratchpad/serve.sh`).
- Optagelse: `node record3.mjs` (Playwright, 30 fps, skærmbillede pr. billede, ~10 min for 27 s; kør i baggrunden med `nohup`). Den ægte app vises i en iframe med mock-backend (`e2e/mock.mjs`), så den viser realistiske data.
- Lyd: `python3 sound3.py` skaber `sfx3.wav`, `music3.wav`, `mix3.wav` ud fra `sfx3.json`.
- Encode: ffmpeg libx264 CRF 17 + AAC, `loudnorm` på −14 LUFS; komprimér til CRF 24 (~19 MB) før levering.
- Ny video = kopiér `scenes3.js` til `scenes4.js`, skriv nye scener + SFX-events, genbrug resten.

## 6. Sådan postes de – og hvor

**Hvor:** TikTok (@dinrr.app), Facebook-siden (som Reel) og YouTube (som Short). Begge er koblet i Metricool (brand-id 7364131, tidszone Europe/Copenhagen). Gem helst ikke videoer på kun én platform – samme video på begge.

**Sådan (via Metricool-værktøjerne i chatten):**
1. Videoen skal have en **offentlig URL**. Vi lægger filen på den forældreløse git-branch `media` i det offentlige repo (worktree `scratchpad/mediawt`) og bruger `raw.githubusercontent.com/…/media/<fil>.mp4`. (Google Drive virker ikke, den kan kun dele med mails.) Metricool kopierer selv filen over til sin egen server.
2. `createScheduledPost` med `info` som JSON-streng: `providers`, `publicationDate` (lokal tid), `text` og enten `tiktokData` eller `facebookData{type:"REEL", title}`.
3. Ændringer: `updateScheduledPost` (id, uuid, blogId, info). Datoen ændres kun i `info.publicationDate`; id'et ændres ved hver opdatering, uuid'et er konstant.
4. **Tjek altid bagefter** med `getScheduledPosts` at tid, platform og tekst er rigtige.
5. Chatten må **aldrig planlægge/poste uden at du har sagt ja**.

**Hvornår:** bedste tider ifølge Metricool: tirsdag/onsdag ca. 10:00 og 12:00 (Facebook), onsdag/torsdag 10:00 og onsdag 18:00 (TikTok). Mål: 3–4 videoer om ugen, aldrig to på samme platform samme dag.

**Tekst og tags:** en kort kommentar-bait-linje + 4–6 hashtags, fx "Who's the dinner hotline in your family? 👇" + #whatsfordinner #momlife #familydinner #mealplanning #relatable #animation. Engelsk tekst.

**Lyd på TikTok:** brug SFX-only-versionen hvis du vil lægge en trending lyd på i appen (TikTok-API'et kan ikke vælge trending lyd). Musik-versionen er den vi planlægger direkte.

## 7. Status lige nu (12. oktober 2026)
- #1 "230 million years ago": udgivet på TikTok (man. 12:00); Facebook-reel planlagt tirsdag 13/10 kl. 10:00.
- #2 "Save the tomato": TikTok planlagt tirsdag 13/10 kl. 14:00.
- #3 "The Dinner Hotline": færdig, **ikke planlagt** (forslag: torsdag 10:00).

## 8. Første besked i den nye chat (kopiér)
> Læs projektdokumentet "dinrr-video-brief". Jeg vil kun lave dinrr crayon-videoer her. Hold stilen, lyden og slutningen (ægte app + dinrr end-card) præcis som beskrevet. Lav en ny video om: <idé>. Vis mig stills først, derefter render og send begge versioner. Planlæg ikke noget før jeg siger det.
