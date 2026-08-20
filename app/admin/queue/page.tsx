import { redirect } from "next/navigation";
import { getPendingListings } from "@/lib/listings";
import { StatusStamp } from "@/components/ui/status-stamp";
import { AdminReviewActions } from "@/components/admin/review-actions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminQueuePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const pending = await getPendingListings();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="field-label mb-2">Admin</div>
      <h1 className="font-display text-3xl font-semibold">Review queue</h1>
      <p className="mt-2 font-body text-ink-soft">{pending.length} listing(s) awaiting review.</p>

      <div className="mt-8 space-y-4">
        {pending.length === 0 && (
          <div className="doc-card p-8 text-center font-body text-ink-soft">Queue is empty.</div>
        )}
        {pending.map((listing) => (
          <div key={listing.id} className="doc-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <StatusStamp variant="pending" />
                <h2 className="mt-2 font-display text-lg font-semibold">{listing.title}</h2>
                <p className="font-body text-sm text-ink-soft">{listing.tagline}</p>
              </div>
              <AdminReviewActions listingId={listing.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
