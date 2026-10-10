# dinrr — overhaul oktober 2026

Hvad der blev lavet, og hvad der skal gøres for at få det i luften. (Koden ligger i ~/week-eat-tracker; backup af den gamle version: `_backup/dinrr-before-overhaul-2026-10-10.zip`.)

## Gør dette i rækkefølge

1. **Ryd gamle filer op** (Terminal, én linje):
   `cd ~/week-eat-tracker && rm -rf src/components/ui src/hooks src/integrations src/components/IngredientItem.tsx src/components/LanguageSelector.tsx src/pages/NotFound.tsx src/lib/queryClient.ts src/lib/utils.ts src/lib/translations.ts src/App.css tailwind.config.ts components.json bun.lockb public/placeholder.svg`
2. **Database**: Supabase → SQL Editor → indsæt hele `supabase/migrations/20261010120000_security_overhaul.sql` → Run. Kør den FØR du installerer den nye app.
3. **Giv dig selv dinrr+ til test** (SQL Editor, skift e-mail):
   `insert into public.entitlements (user_id, manual_grant) select id, true from auth.users where email = 'DIN@EMAIL' on conflict (user_id) do update set manual_grant = true;`
4. **RevenueCat secret key**: RevenueCat → Project settings → API keys → ny *secret* key (V1). Så i Terminal:
   `cd ~/week-eat-tracker && supabase secrets set REVENUECAT_SECRET_KEY=sk_DIN_NØGLE REVENUECAT_WEBHOOK_SECRET=FINDPÅENLANGTILFÆLDIGTEKST`
5. **Deploy edge functions**: `cd ~/week-eat-tracker && supabase functions deploy`
6. **Webhook**: RevenueCat → Integrations → Webhooks → URL `https://exfsipwxedgvlhsmfrub.supabase.co/functions/v1/revenuecat-webhook`, Authorization header = samme tekst som REVENUECAT_WEBHOOK_SECRET.
7. **Byg appen**: `cd ~/week-eat-tracker && npm install && npm run ios && npx cap open ios` → i Xcode: hæv Build-nummeret → Product › Archive → TestFlight. (Klager Xcode over pakker: File › Packages › Reset Package Caches.)
8. **Gem til GitHub**: `cd ~/week-eat-tracker && git add -A && git commit -m "Overhaul: sikkerhed, premium, live-sync, oversættelser" && git push --force`

## dinrr+ køb — tjekliste (det kan ikke fixes i koden)

- App Store Connect → Business → **Paid Applications Agreement = Active** (kræver Mortens bank- og skatteoplysninger). Uden den leverer Apple ingen produkter, heller ikke i sandbox.
- Begge abonnementer i en subscription group, status **Ready to Submit**, med pris, lokalisering og review-screenshot.
- RevenueCat → app-indstillinger → **In-App Purchase Key (.p8) uploadet** — kræves af RevenueCat SDK v5 (StoreKit 2), ellers fejler køb.
- RevenueCat: produkterne tilknyttet entitlement `dinerr +`, og en Offering markeret **Current** med Monthly + Annual packages.
- Det første abonnement skal sendes til review sammen med en app-version.
- Paywallen viser nu den præcise fejlkode (fx `#23 CONFIGURATION_ERROR`), så man kan se hvad der mangler.

## Andet at sætte i dashboards

- App Store Connect privacy labels: tilføj **Name, User ID, Other User Content** (matcher PrivacyInfo.xcprivacy).
- Supabase Auth: minimum 8 tegn i adgangskode, slå "leaked password protection" til, Redirect URL `dinrr://login-callback`, tjek "Reset password"-mailskabelonen.

## Hvad der blev ændret

- **Køb**: RevenueCat blev konfigureret to gange (AppDelegate + JS) → nu kun i `src/lib/revenuecat.ts`, med Supabase user id som App User ID. Robust pakke-opslag, rigtige fejlbeskeder, restore uden at genåbne paywallen, lytter på abonnementsændringer.
- **Sikkerhed**: 5-tryk testmode kun i dev; premium tjekkes på serveren (`public.entitlements`); familie oprettes/joines/forlades via server-funktioner; ingen kan læse andre familiers koder; join-koder er 8 tegn og rate-limited; AI kræver dinrr+ på serveren og har atomisk dagsgrænse + cache.
- **AI**: OpenAI lukker `gpt-4.1-nano` 23. okt. 2026 → skiftet til `gpt-6-luna` med `gpt-4.1-mini` som fallback; structured output.
- **Sync**: live familie-sync via Supabase Realtime, måltider gemmes debounced med upsert (ingen dubletter), ekstra varer på indkøbslisten deles nu med familien, fejl vises og rulles tilbage.
- **Brugervenlighed**: alt oversat (da/en/de/fr/es, auto-sprog), glemt adgangskode, vis adgangskode, iOS-autoudfyld, "I dag"-markering, rigtig ISO-ugenummer, "Tilføj alle"-AI-forslag, del familiekode, haptik, widget på dit sprog og skifter ved midnat.
- **Opdateret**: React 19, Vite 8, TypeScript 6, Capacitor 8.5, RevenueCat 13, supabase-js 2.117; ~40 ubrugte Lovable-pakker fjernet; skrifttyper ligger i appen (ingen Google Fonts-kald); 0 npm-sårbarheder.
