# gts-services Copilot Instructions

## Quick Context
- Next.js 15 App Router app that must run inside LINE LIFF, so most pages/components are `"use client"` and rely on the `useLiff` hook plus `lib/liff` helpers for login/profile/close.
- Persistence lives in Supabase (`bookings`, `users`, `booking_history`); the SQL schema and permissive RLS policies are in `supabase-schema.sql` with setup notes in `SUPABASE_SETUP.md`.
- Styling uses Tailwind CSS v4 (`@import "tailwindcss"`) with the Prompt font declared in `app/globals.css` and color tokens like `line-green`; keep new UI consistent.

## Running & Environment
- Package manager is Yarn 1.22; common scripts live in `package.json`: `yarn dev`, `yarn build`, `yarn lint`, `yarn start`.
- Required env vars (all public because LIFF/Supabase run client-side): `NEXT_PUBLIC_LIFF_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Missing values trigger warnings from `lib/supabase.ts`.
- When testing LIFF-only flows locally, start the dev server then expose it via ngrok/tunnel and configure the LIFF endpoint per `README.md`.

## Architecture & Data Flow
- UI entry at `app/page.tsx` handles LIFF login, user lookup via `/api/users`, and gates navigation tabs (`components/Navigation`) until registration succeeds.
- Feature pages (`app/calendar`, `app/history`, `app/reports`) fetch via `/api/*` route handlers under `app/api`. Keep business logic in `lib/**` (e.g., `lib/booking.ts`) and call from routes/components via fetch, not by duplicating Supabase queries.
- `app/api/bookings` exposes CRUD + validation, `app/api/bookings/validate` runs the same checks without mutating, `/api/history` reads audit trails, `/api/users` manages registration data, `/api/reports` aggregates statistics.
- Client components call those routes through lightweight helper functions defined at the top of each page (e.g., `app/calendar/page.tsx` uses `fetch("/api/bookings?...")`). Reuse those helpers when extending behavior to keep fetch shapes consistent.

## Booking Rules & Helpers
- Always rely on `lib/booking.ts` for Supabase CRUD and validations; it enforces: max 2 people per day (`validateDateCapacity`), one leave request per user per month (`validateMonthlyLimit`), and max days per category (domestic 7, international 9).
- `validateCanEdit` ensures past bookings cannot be edited/deleted. API handlers call it automatically; if you add new mutation paths, do the same to preserve auditing accuracy.
- All create/update/delete operations must log to `booking_history` via `logCreate`, `logUpdate`, `logDelete` in `lib/history.ts`. Do not bypass these helpers or reports/history pages will desync.

## Dates, Localization & UI Patterns
- Timezone handling is Bangkok-centric; use `lib/dateUtils` helpers (`getTodayBangkok`, `formatDateString`, `getDaysCount`, etc.) instead of raw `Date` math.
- Text/UI copy is intentionally Thai with UX notes (Fitts's Law, Miller's Rule) sprinkled in comments—keep tone and density aligned when adding components.
- `BookingFooter` controls leave confirmation UX; it derives day counts and category caps. If you change booking flows, update this component alongside `app/calendar/page.tsx` to keep validations mirrored.

## Reporting & PDFs
- Aggregations live in `lib/reports.ts` (`getSummaryReport`, `getTimePeriodReport`, etc.) and power both `/api/reports` and client-side PDF export flows.
- `lib/pdfExport.ts` + `lib/pdfFonts.ts` load Sarabun fonts from `public/fonts/sarabun-*.ttf` before calling jsPDF/autotable. Always `await loadSarabunFont()` once per document and keep font files in sync when renaming.
- The LIFF client cannot download files directly, so `app/reports/download/page.tsx` re-fetches reports, generates the PDF, then closes its window. When adding new report types, update both `app/reports/page.tsx` (UI) and the download page so they stay in parity.

## Supabase Tips
- `lib/supabase.ts` creates a client even during builds (using a placeholder if env vars are absent) so imports never crash; still, real data operations depend on the true env values.
- Schema changes must be reflected in `supabase-schema.sql`, `types/supabase.ts`, and any derived TypeScript interfaces in `types/booking.ts` or `types/user.ts`.
- Current RLS policies allow full CRUD for demo purposes. If you introduce sensitive data, tighten policies and ensure API routes enforce the same access checks.

## LIFF & Mini App Features
- `hooks/useMiniAppFeatures` + `lib/miniAppFeatures.ts` expose information about multi-tab/add-to-home/etc. Use `useMiniAppFeatures()` instead of duplicating UA parsing.
- Only invoke LIFF SDK calls (`liff.login`, `liff.sendMessages`, `liff.openWindow`) through `lib/liff.ts` wrappers so errors remain centralized and mockable.

## When Extending Functionality
- Prefer adding new server logic inside `lib/**` and expose it via a route under `app/api` instead of hitting Supabase directly from multiple components.
- Reuse existing fetch helpers at the top of pages/components to keep response shapes uniform; if you change an API payload, audit every caller (Calendar, History, Reports, Download page).
- Keep UI responsive/mobile-first: components assume small viewports with large tap targets; follow Tailwind patterns already in `components/*`.
- Before saving bookings or users programmatically, mirror the client-side validation rules (phone regex, email format, booking caps) so Supabase data stays clean.
- Mention LIFF prerequisites in any new documentation so other developers remember to configure `NEXT_PUBLIC_LIFF_ID` and tunnel URLs.
