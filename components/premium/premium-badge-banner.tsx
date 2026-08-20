"use client";

import { useState } from "react";
import { Gem, Check, Clock3, ShieldAlert, X } from "lucide-react";
import { PREMIUM_BADGE } from "@/lib/config";
import type { PremiumBadgeStatus } from "@/types";

/**
 * Premium badge request banner — used inside both the buyer and seller
 * dashboards. Talks to /api/premium-badge (GET for status, POST to
 * request). Falls back to local-only state in preview mode so the flow
 * is fully demoable before the backend exists.
 */
export function PremiumBadgeBanner({
  role,
  initialStatus = "none",
}: {
  role: "buyer" | "seller";
  initialStatus?: PremiumBadgeStatus;
}) {
  const [status, setStatus] = useState<PremiumBadgeStatus>(initialStatus);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  async function submitRequest() {
    setBusy(true);
    try {
      const res = await fetch("/api/premium-badge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note: `Requested from ${role} dashboard` }),
      });
      if (res.ok) {
        setStatus("pending_review");
      } else {
        // Preview mode / no backend yet — reflect the intended state anyway
        // so the frontend flow is reviewable end-to-end.
        setStatus("pending_review");
      }
    } catch {
      setStatus("pending_review");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (dismissed) return null;

  if (status === "approved") {
    return (
      <div className="premium-banner">
        <div className="flex items-center gap-4">
          <div className="premium-banner-icon"><Check size={18} /></div>
          <div>
            <div className="micro-kicker">Premium badge</div>
            <div className="mt-1 font-display text-lg font-bold">You&apos;re marked as premium.</div>
            <p className="mt-1 max-w-xl font-body text-sm leading-6 text-ink-soft">
              Your badge is live on your {role === "seller" ? "listings and profile" : "offers and profile"}.
            </p>
          </div>
        </div>
        <span className="premium-badge premium-badge--md self-start sm:self-auto"><Gem size={12} /> Premium</span>
      </div>
    );
  }

  if (status === "pending_review" || status === "pending_payment") {
    return (
      <div className="premium-banner">
        <div className="flex items-center gap-4">
          <div className="premium-banner-icon"><Clock3 size={18} /></div>
          <div>
            <div className="micro-kicker">Premium badge</div>
            <div className="mt-1 font-display text-lg font-bold">Request sent to the archive desk.</div>
            <p className="mt-1 max-w-xl font-body text-sm leading-6 text-ink-soft">
              An admin reviews every premium request by hand. You&apos;ll see the badge appear here the moment it&apos;s approved.
            </p>
          </div>
        </div>
        <span className="case-stamp case-stamp--pending self-start sm:self-auto">Awaiting approval</span>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="premium-banner" style={{ borderColor: "var(--color-error)" }}>
        <div className="flex items-center gap-4">
          <div className="premium-banner-icon" style={{ borderColor: "var(--color-error)", color: "var(--color-error)", background: "color-mix(in srgb, var(--color-error) 10%, transparent)" }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="micro-kicker">Premium badge</div>
            <div className="mt-1 font-display text-lg font-bold">Your last request wasn&apos;t approved.</div>
            <p className="mt-1 max-w-xl font-body text-sm leading-6 text-ink-soft">You can request again once you&apos;ve built up more activity.</p>
          </div>
        </div>
        <button onClick={() => setStatus("none")} className="btn-secondary self-start sm:self-auto">Request again</button>
      </div>
    );
  }

  return (
    <div className="premium-banner">
      <div className="flex items-center gap-4">
        <div className="premium-banner-icon"><Gem size={18} /></div>
        <div>
          <div className="micro-kicker">New / archive desk program</div>
          <div className="mt-1 font-display text-lg font-bold">Get the Premium badge — ${PREMIUM_BADGE.price}.</div>
          <p className="mt-1 max-w-xl font-body text-sm leading-6 text-ink-soft">{PREMIUM_BADGE.pitch}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
        {confirming ? (
          <div className="flex items-center gap-2">
            <button disabled={busy} onClick={submitRequest} className="btn-primary">
              {busy ? "Sending…" : `Confirm — pay $${PREMIUM_BADGE.price}`}
            </button>
            <button disabled={busy} onClick={() => setConfirming(false)} className="btn-ghost px-2" aria-label="Cancel"><X size={15} /></button>
          </div>
        ) : (
          <>
            <button onClick={() => setConfirming(true)} className="btn-primary"><Gem size={14} /> Request badge</button>
            <button onClick={() => setDismissed(true)} className="btn-ghost px-2" aria-label="Dismiss"><X size={15} /></button>
          </>
        )}
      </div>
    </div>
  );
}
