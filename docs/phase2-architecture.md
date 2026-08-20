# FailureLog Phase 2 Integration Architecture

Phase 2 is scaffolded behind feature flags so the MVP frontend can remain stable while integrations are connected later.

## 1. Stripe Connect payouts
- `lib/stripe.ts` centralizes the Stripe server client.
- `lib/phase2/payouts.ts` provides seller transfer creation.
- `seller_payouts` stores payout state and Stripe transfer IDs.
- `profiles.stripe_connect_account_id` stores the seller's connected account.
- Enable with `FEATURES.stripeConnectPayouts`.

## 2. Automated GitHub verification
- `lib/phase2/github-verification.ts` validates public repository metadata through GitHub's API.
- `project_verifications` stores verification state.
- Enable with `FEATURES.automatedVerification`.

## 3. Stripe revenue verification
- `lib/phase2/stripe-verification.ts` verifies successful PaymentIntents server-side.
- Store verification output in `project_verifications`.
- Never trust seller-entered revenue as verified revenue.

## 4. Buyer/seller messaging
- `conversations` and `messages` tables are ready.
- `lib/phase2/messaging.ts` provides server-side conversation/message helpers.
- Enable with `FEATURES.messaging`.

## 5. Newsletter
- `newsletter_subscriptions` stores subscriber state.
- `lib/phase2/newsletter.ts` is provider-agnostic and can be connected to the chosen newsletter service later.
- Enable with `FEATURES.newsletterAutomation`.

These services are intentionally separated from the current UI. Future pages/components can call these services without replacing the core marketplace architecture.
