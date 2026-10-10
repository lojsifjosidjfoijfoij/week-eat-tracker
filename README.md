# dinrr

Family weekly dinner planner for iPhone — React 19 + TypeScript + Vite 8, wrapped with Capacitor 8,
backed by Supabase (auth, Postgres with RLS, realtime, edge functions) and RevenueCat (dinrr+).

## Everyday commands

```bash
cd ~/week-eat-tracker
npm install                 # after pulling changes to package.json
npm run dev                 # browser preview at http://localhost:8080 (tap the logo 5× for fake dinrr+)
npm run ios                 # typecheck + build + copy into the iOS project
npx cap open ios            # open Xcode
npm run lint && npm test    # checks
```

## Project layout

| Path | What it is |
| --- | --- |
| `src/config.ts` | Public keys, product ids, links |
| `src/lib/useWeekPlan.ts` | All planner data: local mode, family mode, realtime sync, debounced saves |
| `src/contexts/` | Auth, Family, Premium (RevenueCat + server status), Language, Toasts |
| `src/lib/revenuecat.ts` | The **only** place RevenueCat is configured |
| `src/lib/i18n.ts` | All texts in en / da / de / fr / es |
| `src/lib/aisles.ts` | Shopping-list aisle sorting (+ tests) |
| `supabase/migrations/` | Database schema & security (run in the SQL editor) |
| `supabase/functions/` | `suggest-ingredients`, `sync-premium`, `revenuecat-webhook`, `delete-account` |
| `ios/App/WeekplateWidget/` | Home-screen widget (reads the App Group) |

## How premium works

* The buyer's own subscription comes from the RevenueCat SDK instantly.
* The server keeps `public.entitlements` up to date (`sync-premium` on launch/purchase,
  `revenuecat-webhook` on renewals/cancellations). Everyone in a family gets dinrr+ while any
  member has an active subscription. Creating a family and AI suggestions are checked on the server.
* Testers / friends: give free dinrr+ with the SQL snippet at the bottom of the migration file.

## Backend setup (once)

1. Run `supabase/migrations/20261010120000_security_overhaul.sql` in the Supabase SQL editor.
2. Set secrets and deploy the functions:

```bash
supabase secrets set REVENUECAT_SECRET_KEY=sk_... REVENUECAT_WEBHOOK_SECRET=<random string>
supabase functions deploy        # deploys every function; JWT settings come from supabase/config.toml
```
