"use client";

import { useState } from "react";

export function AdminReviewActions({ listingId }: { listingId: string }) {
  const [busy, setBusy] = useState(false);

  async function run(action: "approve" | "reject", payload?: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, entityType: "listing", entityId: listingId, payload }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error || "Action failed");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button disabled={busy} onClick={() => run("approve")} className="btn-secondary border-signal text-signal hover:bg-signal hover:text-paper">
        Approve
      </button>
      <button
        disabled={busy}
        onClick={() => {
          const reason = prompt("Reason for rejection (shown to the seller):");
          if (reason === null) return;
          run("reject", { reason });
        }}
        className="btn-secondary border-brick text-brick hover:bg-brick hover:text-paper"
      >
        Reject
      </button>
    </div>
  );
}
