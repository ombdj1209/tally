# Tally — Good times. Clear tabs.

**Split expenses, keep friendships out of spreadsheets, and understand where your money goes.**

Tally is a mobile-first expense tracker with flexible bill splitting, simplified balances, spending insights, and an optional AI sidekick. A cream, ink, and lime interface brings rounded cards, attached bottom navigation, thoughtful motion, and customizable themes to everyday money admin. No gradients.

[Report a bug](https://github.com/ombdj1209/tally/issues) · [Request a feature](https://github.com/ombdj1209/tally/issues) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

> **Current scope:** Tally tracks shared expenses inside a private ledger owned by one account. It does not yet offer collaborative group accounts or move real money. You can try the local demo without an account or API key.

## Contents

- [Why Tally](#why-tally)
- [Run locally](#run-locally)
- [First steps](#first-steps)
- [Configuration](#configuration)
- [Deploy on Vercel](#deploy-on-vercel)
- [Connect Supabase](#connect-supabase)
- [Included features](#included)
- [Assistant, receipts, and voice](#assistant-receipt-import-and-voice)
- [Architecture](#architecture)
- [Verification](#verify)
- [Troubleshooting](#troubleshooting)
- [Scope and limitations](#scope)
- [Contributing and licensing](#contributing-and-licensing)

## Why Tally

- **Split the way you actually spend.** Equal shares, exact amounts, and percentages, with every cent accounted for.
- **See what needs settling.** Simplified balances and partial settlement records reduce bookkeeping.
- **Understand your share.** Spending breakdowns focus on what belongs to you, with expense evidence behind assistant summaries.
- **Give your assistant some personality.** Choose calm, warm, or a little sassy; tune its name, instructions, voice, pace, and pitch.
- **Keep the interface personal.** Light, dark, and system appearance with lime, peach, and lavender accents.
- **Start small.** Use a browser-local ledger, then configure Supabase and optional cloud AI when needed.

### Technology

| Layer | Implementation |
| --- | --- |
| UI | React 19, TypeScript, Vite 8, CSS, Lucide icons |
| Persistence | Browser localStorage or Supabase Postgres |
| Authentication | Supabase email magic links |
| Access control | Row-level security and revision-checked writes |
| Optional AI | Server-side OpenAI Responses API with structured output |
| Voice | Browser Web Speech recognition and synthesis |
| Deployment | Vercel static frontend and Node API function |
| Tests | Node's built-in test runner |

## Run locally

Use Node 22.12+ or Node 24 with npm. Run commands from the Tally project directory.

```sh
git clone https://github.com/ombdj1209/tally.git
cd tally
npm install
npm run dev
```

Open http://127.0.0.1:5178. Without Supabase variables, the app opens a clearly labeled demo that persists in localStorage. Account settings → Start with an empty local workspace clears that demo. Set your currency before adding expenses.

If you already have the source, skip the clone command. In the original parent workspace, the project directory is the nested `tally/` folder. A fresh `npm install` generates `package-lock.json`; commit that lockfile and use `npm ci` for subsequent reproducible installs.

## First steps

1. Explore the sample groups, expenses, balances, and insights.
2. Open Settings to choose a theme and customize your sidekick.
3. When ready, choose **Start with an empty local workspace**. This clears the current local demo ledger; export any expenses you want to keep first.
4. Set the workspace currency before recording transactions.
5. Create people and groups, then add an expense with a payer and participants.
6. Review balances and record settlements after payments happen outside Tally.
7. Open Insights to explore your spending, or export expenses as CSV.

Local browser data is not an account backup. Clearing site data removes it. Signing in starts a separate cloud ledger and does not automatically migrate the demo.

## Configuration

Copy `.env.example` to `.env.local` in the project root. Leave cloud settings empty to use the local demo.

```sh
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local`.

| Variable | Required for | Visibility / purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Cloud sign-in and sync | Public Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Cloud sign-in and sync | Public anon key; access is enforced by RLS |
| `OPENAI_API_KEY` | Cloud assistant | **Server-only secret**, never use a `VITE_` prefix |
| `OPENAI_MODEL` | Optional AI model override | Defaults to `gpt-4.1-mini`; must support image input and structured output |
| `SUPABASE_URL` | Optional server override | Falls back to `VITE_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | Optional server override | Falls back to `VITE_SUPABASE_ANON_KEY`; not a service-role key |

Anything prefixed `VITE_` is available to the browser. Do not place private credentials there. Restart the development server after environment changes; redeploy after changing production configuration.

## Deploy on Vercel

1. Push this folder to your Git repository. If keeping the parent repository, set the Vercel **Root Directory** to `tally`.
2. Select the **Vite** framework preset. Build command: `npm run build`; output: `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project. Use the public/anon key, never a service-role key.
4. Deploy. Redeploy after changing Vite environment variables; they are embedded at build time.

## Connect Supabase

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Copy `.env.example` to `.env.local`, then fill in your project URL and public anon key for local development.
3. Enable email authentication. In Authentication → URL Configuration, set Site URL to your deployed Vercel origin and add your local origin and any intended preview origins to allowed redirect URLs.
4. Configure production email delivery in Supabase before inviting real users.
5. Open account settings in Tally and request a magic sign-in link. Signed-in accounts start with an empty ledger; demo data is not uploaded automatically.

RLS restricts every row to its authenticated owner. Writes use a revision check to prevent silently overwriting changes from another tab/device. A conflict asks the user to reload. Cloud mutations update the UI only after the database confirms success; failures preserve the form. No service-role credentials are required.

## Included

- Groups and people; equal, exact-amount, and percentage expense splits.
- Add, inspect, edit, delete, search, and filter expenses; CSV export.
- Cent-accurate equal splitting, conserved balances, simplified settlement transfers, partial payments, and undoable payment records.
- Insights based on your share, category breakdowns, daily spending, and month filters.
- Responsive mobile bottom tabs, desktop sidebar, keyboard-accessible native dialogs, reduced-motion support, and a web app manifest.
- Local demo and Supabase email sign-in with a private synced ledger per account.

## Scope

This is a personal ledger, not a shared multi-user workspace. People are records you manage; adding them does not email them or grant access. Collaborative invitations, recurring bills, notifications, offline cloud edits, exchange-rate conversion, and payment processing are not implemented. Settlement records do not transfer money. One currency per ledger is supported; currency is locked once transactions exist to avoid relabeling existing values. Amounts use two decimal places, including JPY input, so use whole-yen amounts for JPY.

The manifest supports standalone launch where browsers permit it; there is no offline service worker. Fonts load from Google Fonts with a local sans-serif fallback.

## Verify

```sh
npm test
npm run build
```

Tests cover cent rounding, balance conservation, and settlement correctness. A live Supabase integration still requires your project credentials and schema.

The assistant suite also covers weighted and itemized splits, tax/tip allocation, invalid input rejection, duplicate hints, insight evidence, authentication, quota errors, and clarification handling. Provider responses are mocked; passing tests does not establish a working live AI account or microphone.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development app and assistant API at port 5178 |
| `npm test` | Model and assistant tests |
| `npm run build` | Type-check and generate `dist/` |
| `npm run preview` | Preview the static build at port 4178; no assistant API |

The current build has 13 automated tests. Before a production launch, verify email redirects, persistence across sessions, conflict handling, and speech on the actual devices you intend to support.

## Assistant, receipt import, and voice

Open **You make the plans. I'll do the math.** on Overview, or **Say it. Scan it. Split it.** from Add expense. Insights opens the same sidekick in spending mode. Settings has assistant name, calm/warm/sassy tone, personal instructions, speech language, device voice, pace, pitch, auto-read, and an on-device-only speech switch. These preferences are device-local.

### Enable cloud AI

1. Run `supabase/assistant.sql` after the original schema. This adds an atomic quota of 50 requests per authenticated account per UTC day. Attempts that reach the quota check count even if the provider later fails.
2. Add `OPENAI_API_KEY` as a **server-only** environment variable in Vercel and in `tally/.env.local` for development. Never prefix it with `VITE_` and never paste it into app settings.
3. Optionally set `OPENAI_MODEL` to a compatible text-and-image model with Structured Outputs. The initial default is `gpt-4.1-mini`. Model availability and costs depend on your OpenAI account.
4. Supply Supabase URL and public anon key using the existing `VITE_SUPABASE_*` variables or the server aliases `SUPABASE_URL` / `SUPABASE_ANON_KEY`. Redeploy Vercel or restart `npm run dev` after changes.
5. Sign in to Tally, then select **Cloud AI** in the assistant. A valid Supabase session is required; anonymous users cannot use the paid endpoint.

Vite development serves `/api/assistant` through the same handler used by the Vercel Node function. The API is excluded from SPA rewrites. No additional Node server is needed on Vercel. Previewing only `dist` does not provide this endpoint.

### What works

- Typed or dictated requests become reviewable drafts, not automatic ledger writes.
- Up to three JPEG/PNG/WebP receipts or screenshots per request, compressed in the browser. No PDF or HEIC support in this release.
- Equal, exact, weighted (nights/ratios/percentages), and item-based splits. Code validates identities, dates, currency, totals, and proportional tax/tip. Missing details produce questions. Foreign-currency conversions are never guessed.
- One draft can be opened in the ordinary manual editor; multiple drafts can be removed or revised through another message. Confirmation saves the selected batch atomically through the existing ledger persistence path.
- Spending questions produce a date/category/group filter. Actual sums, comparisons, categories, and source expense links are calculated in code from the authenticated ledger. Comparisons use the previous equal-length period, not an assumed complete bank history.
- Possible duplicates are flagged when amount, payer, and date match. This is a review hint, not a fraud detector.

The cloud AI receives message text, recent in-sheet conversation, images, names/groups, currency, and personality instructions. Full ledger transactions are not sent to the model for spending summaries: the server computes the results. Requests use `store:false`. Tally does not persist receipt uploads or assistant chat; closing the sheet clears those local drafts. Provider retention policies still apply.

Without configuration, **Local helper** uses an explicitly limited deterministic parser, not an AI simulation. It supports `I paid 120 for dinner with Maya` and all-time spending summaries. Complex requests, conversational follow-up, and receipt extraction require cloud AI. No receipt or natural-language model call has been verified against a live account until your credentials are supplied.

### Speech tradeoffs

- STT: Web Speech (`SpeechRecognition` / `webkitSpeechRecognition`). Push to talk, live interim transcript, stop control, 25-second session cap, typed fallback, and useful permission/network error messages. Recognition never automatically submits a message.
- TTS: `speechSynthesis`, device voice selection, language, rate/pitch controls, explicit Listen/Stop, and opt-in auto-read. Playback may need a user tap in browsers with autoplay restrictions.
- Web Speech is **not necessarily local**. Browser recognition and some voices may use remote services. On-device-only mode requires installed local synthesis voices and supported `SpeechRecognition.available()` / `processLocally`; it refuses fallback to remote recognition when unavailable. It does not download language packs automatically.
- Expressive text is customizable, but system TTS cannot guarantee humanlike emotional delivery or matching voices across devices. Neural streaming speech would be a separate optional upgrade with server credentials and usage cost; no paid speech service is integrated here.
- Microphone and voice playback must be tried on the user's target devices. Automated verification covers data calculations and endpoint behavior, not audible delivery or microphone permissions.

Collaborative invitations, shared approval, automatic group-memory rules, proactive reminders, and full trip closeout remain outside this release. The existing personal-ledger model is unchanged.

## Architecture

```text
tally/
├── api/assistant.ts          # HTTP handler for Vercel and local development
├── server/assistant.ts       # Authentication, quota checks, model requests
├── src/
│   ├── App.tsx              # Pages, dialogs, and ledger workflows
│   ├── model.ts             # Money calculations and ledger types
│   ├── cloud.ts             # Supabase authentication and persistence
│   ├── Assistant.tsx        # Conversation, attachments, and draft review
│   ├── assistant-core.ts    # Draft validation and evidence-based insights
│   ├── appearance.tsx       # Theme preferences
│   ├── voice.tsx            # Personality settings and browser speech
│   └── styles.css           # Responsive layout, themes, and motion
├── supabase/
│   ├── schema.sql           # Private ledgers and RLS policies
│   └── assistant.sql        # Authenticated daily AI quota
├── tests/                   # Ledger and assistant unit tests
├── public/                  # Icons, manifest, and appearance initialization
├── .env.example             # Empty configuration template
└── vercel.json              # Build, API duration, and SPA routing
```

### Data flow

In local mode, the UI reads and writes a browser-local ledger. In cloud mode, the user's Supabase session grants access to their own ledger row. The ledger is stored as JSON with a revision number; updates check that revision before replacing it. This prevents silent concurrent overwrites but is not automatic merging or realtime collaboration.

The cloud assistant verifies the session, loads the authenticated ledger, consumes a quota slot, and asks the model for a structured plan. Application code validates expense drafts and calculates insight totals. The endpoint never writes ledger transactions itself. The user reviews drafts before the normal persistence flow saves them.

### Privacy and cost boundaries

- Themes and assistant preferences stay on the device.
- Supabase stores the signed-in user's ledger under RLS.
- Cloud AI sends the request context and attached images to the AI provider as described above.
- Browser speech may involve a browser vendor's online service unless supported on-device-only mode is selected.
- AI usage limits are per account, not a global billing cap. Configure provider budgets and monitor usage before opening registration broadly.
- Never use real receipts, tokens, or personal ledger exports as public issue attachments or test fixtures.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| App stays in demo mode | Both frontend Supabase variables must be set before starting or building the app. |
| Magic link returns to the wrong URL | Check Supabase Site URL and allowed redirect URLs for the exact origin. |
| Cloud save fails | Confirm `schema.sql` was applied, RLS is configured, and the session is valid. Preserve the form while resolving the error. |
| Revision conflict | Reload to retrieve the latest ledger, then reapply the intended edit. |
| Cloud AI is unavailable | Configure the server API key and Supabase, restart/redeploy, and sign in. |
| Assistant quota check fails | Apply `supabase/assistant.sql` after `schema.sql`; check the daily account quota. |
| AI works in development but not preview | `npm run preview` serves static files only. Use the dev server or Vercel for `/api/assistant`. |
| Microphone control is unavailable | The browser may lack Web Speech recognition. Use typed input. |
| Recognition fails or has no permission | Check browser microphone permissions and connectivity. On-device-only mode also needs supported local recognition. |
| A chosen voice is missing | Voices depend on the operating system/browser. Select an available voice in Settings. |
| No automatic voice playback | Tap Listen; browser autoplay rules may require a user gesture. |
| Receipt cannot be attached | Use JPEG, PNG, or WebP, with no more than three images per request. PDF and HEIC are unsupported. |
| Existing currency cannot change | Currency locks after transactions exist to prevent relabeling amounts without conversion. |

## Contributing and licensing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, change guidelines, and verification. Use [GitHub Issues](https://github.com/ombdj1209/tally/issues) for reproducible bugs and focused feature proposals. For security concerns, follow [SECURITY.md](SECURITY.md) instead of publishing sensitive details.

Potential future work includes collaborative groups, recurring bills, richer offline support, and optional neural voice. These are directions for discussion, not shipping features or delivery commitments.

**License:** [MIT](LICENSE). Copyright © 2026 ombdj1209.

