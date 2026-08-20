# FailureLog frontend completion pass

## Completed in this pass
- Role-friendly dashboard aliases for `/seller` and `/creator`.
- Seller dashboard navigation to control room, new case file, offers and purchases.
- Revenue chart now derives from completed purchase records instead of a hard-coded visual.
- Removed hard-coded buyer attention/response claims from the seller dashboard.
- Added global loading, not-found and recoverable error states.
- Added server-side admin role protection to the standalone review queue.
- Preserved the existing MVP architecture and FailureLog visual language.

## Deliberately not invented
- No fake analytics numbers.
- No fake wallet balances.
- No live payout claims before the payment provider is confirmed.
- No Phase 2 UI dependencies.

## Before client handoff
1. Configure Supabase and payment credentials.
2. Run all migrations in `docs/`.
3. Test authentication, listing submission, moderation, checkout, delivery and disputes with real accounts.
4. Run `npm install` and `npm run build`.
5. Perform browser QA on mobile, tablet and desktop.
