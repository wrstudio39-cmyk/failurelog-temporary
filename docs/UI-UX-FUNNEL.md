# FailureLog UI/UX Funnel

This is the working funnel for the visual/product decisions. It is intentionally a challenge loop, not a checklist of generic design trends.

## 01 — Thesis before decoration
Ask: what should a visitor understand in 5 seconds?

FailureLog is not a generic asset shop. It is an archive of abandoned products where the failure story is part of the value.

Design consequence: every major screen should expose **context before conversion**.

## 02 — Emotional first impression
Test the first viewport for three feelings:

1. Curiosity — “What happened to these projects?”
2. Credibility — “These are real case files, not hype.”
3. Agency — “I could buy one, restart one, or list mine.”

If a visual element does not strengthen one of these, challenge it.

## 03 — Information hierarchy
Every screen gets one dominant question.

- Home: Why should I care?
- Marketplace: Which project deserves my attention?
- Project page: Is this failure useful to me?
- Sell flow: Can I tell this story without friction?
- Dashboard: What needs my attention next?
- Admin: What decision needs to be made?

## 04 — Discovery loop
For each feature, generate at least three UI approaches before settling on one:

A. Expected / conventional
B. FailureLog-specific
C. Contrarian

Prefer B or C when they improve comprehension without harming usability.

## 05 — Anti-generic filter
Reject ideas that are only there because modern SaaS sites commonly use them:

- meaningless gradients
- decorative blobs
- fake statistics
- excessive glassmorphism
- giant empty hero copy with no product evidence
- animation for animation's sake
- generic “AI-powered” style language
- dashboard cards with no decision attached

## 06 — Friction audit
For every interaction ask:

- What is the user trying to decide?
- What information is missing?
- What is the next action?
- Can one step be removed?
- Can the result be made visible immediately?
- What happens on empty/error/loading states?

## 07 — Trust audit
FailureLog deals with code, money, revenue, users and failure claims.

Trust should be designed into the information architecture:

- distinguish seller-reported metrics from verified metrics
- show what is included in an acquisition
- make purchase terms visible before checkout
- make moderation status understandable
- never invent credibility signals

## 08 — Motion rules
Motion should explain state, hierarchy, or continuity.

Use subtle movement for:
- card lift on hover
- navigation/search focus
- step transitions
- purchase confirmation
- admin status changes

Do not animate core content just to make the page feel “premium.”

## 09 — Mobile-first challenge
Every desktop composition must survive a narrow screen without becoming a stacked desktop.

Ask:
- What becomes primary?
- What can disappear?
- What should become sticky?
- What can become a horizontal scroll?
- What must remain one tap away?

## 10 — Ship / measure / challenge again
Before calling a screen finished:

1. Compare it against the product thesis.
2. Remove one unnecessary element.
3. Strengthen one weak hierarchy point.
4. Add one useful state the generic version would miss.
5. Test mobile.
6. Test keyboard/focus.
7. Test empty/loading/error states.
8. Only then polish the micro-details.
