import { SITE } from "@/lib/config";

export const metadata = {
  title: `About — ${SITE.name}`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="field-label mb-3">About</div>
      <h1 className="display-lg">Why {SITE.name} exists.</h1>
      <div className="prose-post-mortem mt-8">
        <p>
          Most marketplaces sell you a pitch. {SITE.name} sells you the
          post-mortem — the traffic that stalled, the revenue that never
          arrived, and the reasons a founder finally closed the tab.
        </p>
        <p>
          Every listing is reviewed before it goes live, and every seller is
          asked to document what actually happened, not just what was built.
          If you&apos;re going to restart someone else&apos;s idea, you
          deserve to know why it stopped the first time.
        </p>
      </div>
    </div>
  );
}
