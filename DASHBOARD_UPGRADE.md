# Seller dashboard upgrade

The seller dashboard at `app/dashboard/page.tsx` was rebuilt as a premium seller control room while preserving the existing FailureLog visual language.

Highlights:
- Live Supabase loading for profile, listings, purchases, and seller payouts with graceful demo fallback.
- Revenue velocity chart with period controls.
- Trust Index / seller reputation panel.
- Archive inventory with status-aware case files.
- Decision feed combining reviews, sales, and drafts.
- Buyer attention, response window, and archive completeness signals.
- Seller-specific action hierarchy and motion/hover states.
- Responsive layout and reduced-motion compatibility inherited from the existing design system.

No new dependency was added.
