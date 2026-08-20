"use client";

import { useId, useState, cloneElement, isValidElement } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUSINESS_MODELS, CATEGORIES, TECH_TAGS } from "@/lib/config";

const STEPS = [
  "Basic information",
  "Technology",
  "Project metrics",
  "Post-mortem",
  "Media & assets",
  "Pricing & submit",
];

type FormState = {
  title: string;
  tagline: string;
  businessModel: string;
  category: string;
  techTags: string[];
  monthlyTraffic: string;
  totalUsers: string;
  lifetimeRevenue: string;
  mrrAtShutdown: string;
  monthsActive: string;
  whyAbandoned: string;
  whatWentWrong: string;
  lessonsLearned: string;
  distributionNotes: string;
  targetMarketNotes: string;
  technicalNotes: string;
  failureStage: string;
  failureReasons: string[];
  acquisitionChannels: string[];
  attemptedInterventions: string;
  assets: string;
  price: string;
};

const INITIAL: FormState = {
  title: "",
  tagline: "",
  businessModel: "saas",
  category: "productivity",
  techTags: [],
  monthlyTraffic: "",
  totalUsers: "",
  lifetimeRevenue: "",
  mrrAtShutdown: "",
  monthsActive: "",
  whyAbandoned: "",
  whatWentWrong: "",
  lessonsLearned: "",
  distributionNotes: "",
  targetMarketNotes: "",
  technicalNotes: "",
  failureStage: "distribution",
  failureReasons: [],
  acquisitionChannels: [],
  attemptedInterventions: "",
  assets: "",
  price: "",
};

export default function SellWizardPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTech(tag: string) {
    setForm((f) => ({
      ...f,
      techTags: f.techTags.includes(tag) ? f.techTags.filter((t) => t !== tag) : [...f.techTags, tag],
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You need to be logged in to submit a case file.");
        window.location.href = "/login";
        return;
      }
      const slug = form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // RLS requires seller_id = auth.uid() on insert — it validates the row,
      // it doesn't populate it, so it has to be set explicitly here.
      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          slug,
          seller_id: user.id,
          title: form.title,
          tagline: form.tagline,
          business_model: form.businessModel,
          category: form.category,
          price: Number(form.price) || 0,
          tech_tags: form.techTags,
          status: "pending_review",
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("post_mortems").insert({
        listing_id: listing.id,
        why_abandoned: form.whyAbandoned,
        what_went_wrong: form.whatWentWrong,
        lessons_learned: form.lessonsLearned,
        distribution_notes: form.distributionNotes,
        target_market_notes: form.targetMarketNotes,
        technical_notes: form.technicalNotes,
        failure_stage: form.failureStage,
        failure_reasons: form.failureReasons,
        acquisition_channels: form.acquisitionChannels,
        attempted_interventions: form.attemptedInterventions,
      });

      await supabase.from("project_metrics").insert({
        listing_id: listing.id,
        monthly_traffic: Number(form.monthlyTraffic) || null,
        total_users: Number(form.totalUsers) || null,
        lifetime_revenue: Number(form.lifetimeRevenue) || null,
        mrr_at_shutdown: Number(form.mrrAtShutdown) || null,
        months_active: Number(form.monthsActive) || null,
      });

      const labels = form.assets.split("\n").map(x => x.trim()).filter(Boolean);
      if (labels.length) await supabase.from("project_assets").insert(labels.map((label, i) => ({ listing_id: listing.id, label, included: true, sort_order: i })));
      for (const file of files) {
        const fd = new FormData(); fd.append("listingId", listing.id); fd.append("file", file);
        const upload = await fetch("/api/assets/upload", { method: "POST", body: fd });
        if (!upload.ok) throw new Error("Asset upload failed");
      }
      for (const file of mediaFiles) {
        const fd = new FormData(); fd.append("listingId", listing.id); fd.append("file", file);
        const upload = await fetch("/api/media/upload", { method: "POST", body: fd });
        if (!upload.ok) throw new Error("Media upload failed");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed", err);
      alert("Couldn't submit — check you're logged in as a seller, and that Supabase is configured.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <div className="field-label mb-3">Submitted</div>
        <h1 className="font-display text-3xl font-semibold">Case file received</h1>
        <p className="mx-auto mt-4 max-w-md font-body text-ink-soft">
          Your project is now under admin review. You&apos;ll be notified once it&apos;s
          approved and published to the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside>
          <div className="field-label">Seller submission</div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-.05em]">Log the project you stopped.</h1>
          <p className="mt-5 font-body text-sm leading-6 text-ink-soft">The more honest the case file, the more useful it is to the person who buys it next.</p>
          <ol className="stepper mt-8">
            {STEPS.map((label, i) => (
              <li key={label} className={`step-item ${i === step ? "step-item--active" : ""}`}>
                <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-[9px] uppercase tracking-[.08em]">{label}</span>
              </li>
            ))}
          </ol>
        </aside>

        <section>
          <div className="mb-5 flex items-center justify-between border-b border-hairline pb-4">
            <span className="micro-kicker">Case file / submission {String(step + 1).padStart(2, "0")} of {STEPS.length}</span>
            <span className="font-mono text-[9px] uppercase tracking-[.1em] text-ink-soft">Draft is local until submitted</span>
          </div>
          <div className="doc-card p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Project name">
              <input className="input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="PingPad" />
            </Field>
            <Field label="One-line description">
              <input className="input" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="What it was, in one sentence" />
            </Field>
            <Field label="Business model">
              <select className="input" value={form.businessModel} onChange={(e) => update("businessModel", e.target.value)}>
                {BUSINESS_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="label mb-0">Tech stack (select all that apply)</legend>
            <div className="flex flex-wrap gap-1.5">
              {TECH_TAGS.map((tag) => {
                const active = form.techTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTech(tag)}
                    className={`rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors duration-fast ${active ? "border-ink bg-ink text-paper" : "border-hairline text-ink-soft hover:border-ink hover:text-ink"}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Monthly traffic at peak"><input type="number" className="input" value={form.monthlyTraffic} onChange={(e) => update("monthlyTraffic", e.target.value)} /></Field>
            <Field label="Total users"><input type="number" className="input" value={form.totalUsers} onChange={(e) => update("totalUsers", e.target.value)} /></Field>
            <Field label="Lifetime revenue ($)"><input type="number" className="input" value={form.lifetimeRevenue} onChange={(e) => update("lifetimeRevenue", e.target.value)} /></Field>
            <Field label="MRR at shutdown ($)"><input type="number" className="input" value={form.mrrAtShutdown} onChange={(e) => update("mrrAtShutdown", e.target.value)} /></Field>
            <Field label="Months active"><input type="number" className="input" value={form.monthsActive} onChange={(e) => update("monthsActive", e.target.value)} /></Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Field label="Failure stage"><select className="input" value={form.failureStage} onChange={e=>update("failureStage",e.target.value)}><option value="idea">Idea / validation</option><option value="product">Product</option><option value="distribution">Distribution</option><option value="monetization">Monetization</option><option value="operations">Operations</option><option value="founder">Founder capacity</option></select></Field>
            <Field label="Why was it abandoned?"><textarea className="input min-h-[100px]" value={form.whyAbandoned} onChange={(e) => update("whyAbandoned", e.target.value)} placeholder="What finally made continuing irrational?" /></Field>
            <Field label="What went wrong?"><textarea className="input min-h-[100px]" value={form.whatWentWrong} onChange={(e) => update("whatWentWrong", e.target.value)} placeholder="Describe the evidence, not just the conclusion." /></Field>
            <Field label="Distribution / growth evidence"><textarea className="input min-h-[90px]" value={form.distributionNotes} onChange={(e) => update("distributionNotes", e.target.value)} /></Field>
            <Field label="Target market notes"><textarea className="input min-h-[90px]" value={form.targetMarketNotes} onChange={(e) => update("targetMarketNotes", e.target.value)} /></Field>
            <Field label="Technical state"><textarea className="input min-h-[90px]" value={form.technicalNotes} onChange={(e) => update("technicalNotes", e.target.value)} placeholder="What still works, what is fragile, what needs replacement?" /></Field>
            <Field label="What did you try before stopping?"><textarea className="input min-h-[90px]" value={form.attemptedInterventions} onChange={(e) => update("attemptedInterventions", e.target.value)} /></Field>
            <Field label="Lessons learned"><textarea className="input min-h-[100px]" value={form.lessonsLearned} onChange={(e) => update("lessonsLearned", e.target.value)} /></Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <Field label="Asset manifest (one label per line)">
              <textarea className="input min-h-[100px]" value={form.assets} onChange={(e) => update("assets", e.target.value)} placeholder={"Full source code\nDatabase schema\nDocumentation\nFigma files"} />
            </Field>
            <Field label="Private deliverables">
              <input className="input" type="file" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))} />
            </Field>
            <Field label="Project screenshots / showcase media">
              <input className="input" type="file" accept="image/*" multiple onChange={e=>setMediaFiles(Array.from(e.target.files||[]))} />
            </Field>
            <div className="border border-hairline bg-paper-dim/40 p-4 font-body text-sm leading-6 text-ink-soft"><strong className="text-ink">Private by design.</strong> Files go into the private listing-assets bucket. Buyers receive short-lived download links only after the purchase reaches the released handoff state.</div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <Field label="Price ($)"><input type="number" className="input" value={form.price} onChange={(e) => update("price", e.target.value)} /></Field>
            <p className="font-body text-sm text-ink-soft">
              Your listing will be reviewed by an admin before it appears publicly.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-between border-t border-hairline pt-5">
          <button className="btn-secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : (
            <button className="btn-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          )}
        </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {isValidElement(children) ? cloneElement(children as React.ReactElement<{ id?: string }>, { id }) : children}
    </div>
  );
}
