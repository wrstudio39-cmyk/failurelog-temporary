import { SITE } from "@/lib/config";

export const metadata = {
  title: `Contact — ${SITE.name}`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="field-label mb-3">Contact</div>
      <h1 className="display-lg">Talk to the archive desk.</h1>
      <p className="mt-6 max-w-xl font-body text-lg leading-8 text-ink-soft">
        Questions about a listing, a dispute, or selling your own project?
        Reach the team and we&apos;ll get back to you within one business day.
      </p>
      <div className="mt-8 doc-card p-6 sm:p-8">
        <div className="field-label mb-2">Email</div>
        <a href="mailto:hello@failurelog.example" className="font-display text-xl font-bold text-primary">
          hello@failurelog.example
        </a>
      </div>
    </div>
  );
}
