# FailureLog

Ported from the original "WALEED" HTML/JS marketplace template into
Next.js 14 (App Router) + TypeScript + Tailwind, per the client PRD's
recommended stack. This is an MVP-scope build — Phase 2 items from the
PRD (Stripe Connect payouts, automated verification, in-app messaging,
newsletter automation) are deliberately not implemented.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Stripe keys
npm run dev
```

Then in Supabase: SQL Editor → run `docs/schema.sql`. Create three
storage buckets: `listing-assets` (private), `listing-media` (public),
`avatars` (public). Enable the GitHub provider under Authentication →
Providers.

Until Supabase env vars are set, the site runs on demo data
(`lib/demo-data.ts`) — same pattern as the old template's localStorage
demo mode, so you can see the UI immediately.

## What's built

- Design system (Tailwind tokens, fonts, `case-stamp`/`doc-card`
  components) — the "incident report" visual direction
- Homepage, marketplace catalog with filtering, project detail /
  post-mortem page
- 6-step seller submission wizard, wired to Supabase inserts
  (`listings` → `pending_review`)
- Admin review queue with approve/reject
- Email + GitHub OAuth login/signup
- FailureLog data model (`docs/schema.sql`) with RLS

## What's stubbed / still needed

- **Checkout**: `app/api/checkout/route.ts` is a stub — needs the
  Stripe Checkout Session + webhook handler wired in (commented with
  the exact steps).
- **Admin route guarding**: `/admin/queue` isn't role-checked yet —
  add a middleware/server check before this ships.
- **Media upload**: the wizard's asset step doesn't yet upload to the
  `listing-media` bucket — needs a Supabase Storage upload call.
- **Seller dashboard**: shell only; needs the `listings` query filtered
  to the logged-in seller.
- **Cart, wishlist, messaging, reviews**: these existed in the old
  WALEED template but are out of MVP scope. Per your instruction they
  were *not* ported into Next.js pages yet, and are absent from nav —
  effectively hidden. `lib/config.ts` has a `FEATURES` flag object as
  the on-ramp for re-enabling them later without re-deciding scope.

## Stack deviation to flag with the client

The PRD's "recommended" stack assumed a rewrite; the original template
was vanilla HTML/JS. This port follows the PRD stack exactly (as you
chose), which means it's closer to a rewrite than a reuse — worth
letting AURAE know the "reuse existing architecture" instruction and
the "use the recommended stack" instruction were in tension, and stack
fidelity won.

## Phase 2 integration scaffolding

The project now contains integration-ready server modules and database tables for the PRD's Phase 2 features. They are disabled by default through `FEATURES` in `lib/config.ts`, so the current MVP UI does not depend on them.

Available integration points:

- `lib/phase2/payouts.ts` — Stripe Connect seller transfers.
- `app/api/phase2/stripe-connect/onboard/route.ts` — seller Connect onboarding URL.
- `lib/phase2/github-verification.ts` — GitHub repository verification.
- `lib/phase2/stripe-verification.ts` — server-side Stripe revenue verification.
- `lib/phase2/messaging.ts` and `app/api/phase2/messages/route.ts` — buyer/seller messaging.
- `lib/phase2/newsletter.ts` and `app/api/phase2/newsletter/route.ts` — newsletter provider integration.

Run the additive Phase 2 SQL at the end of `docs/schema.sql` after the base schema. Add the relevant environment variables from `.env.example` when each integration is connected. Keep the feature flags false until the corresponding provider and UI are tested.

## Admin Control Plane

`/admin` is the privileged command center for platform operations. It includes:

- moderation queue with risk levels, evidence inspection hooks, approve/reject actions
- transfer-integrity dispute desk for unverified transfers and incomplete handoffs
- payout / commission ledger with release states and settlement visibility
- people overview for sellers and buyers
- compounding idea funnel that converts repeated friction into experiments
- marketplace intake pause/resume control for incident response
- admin-first visual language consistent with the seller dashboard

For production, run `docs/admin-schema.sql` after `docs/schema.sql` and set the server-only `SUPABASE_SERVICE_ROLE_KEY`. The page checks the signed-in profile role before rendering the control plane. Never send the service-role key to the browser.

## Completion pass: secure marketplace core

The completion migration is `docs/completion-v3.sql`.

It adds:
- private asset storage metadata + signed download delivery
- offer/deal objects and an `/offers` deal desk
- explicit purchase lifecycle / hold / delivery / buyer-confirmation / dispute states
- delivery event ledger
- richer post-mortem failure taxonomy and evidence fields
- Stripe Checkout session creation with server-side webhook completion

Required server setup:
- create a private Supabase Storage bucket named `listing-assets`
- set `SUPABASE_SERVICE_ROLE_KEY`
- set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- point Stripe's webhook to `/api/webhooks/stripe`

Never make `listing-assets` public and never expose the service role key to the browser.
