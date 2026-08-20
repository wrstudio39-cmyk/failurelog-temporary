import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/config";
import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-paper-dim/30">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_.6fr_.6fr]">
          <div>
            <Logo size="md" />
            <p className="mt-5 max-w-md font-body text-lg leading-7 text-ink-soft">A marketplace for the projects that didn&apos;t make it — and the reasons why.</p>
            <Link href="/marketplace" className="btn-ghost mt-6 group">Enter the archive <ArrowUpRight size={14}/></Link>
          </div>
          <div><div className="field-label mb-4">Explore</div><ul className="space-y-3 font-body text-sm"><li><Link href="/marketplace" className="transition-colors duration-fast hover:text-brick">Browse projects</Link></li><li><Link href="/sell" className="transition-colors duration-fast hover:text-brick">Sell a project</Link></li><li><Link href="/login" className="transition-colors duration-fast hover:text-brick">Log in</Link></li></ul></div>
          <div><div className="field-label mb-4">About</div><ul className="space-y-3 font-body text-sm"><li><Link href="/about" className="transition-colors duration-fast hover:text-brick">Why FailureLog</Link></li><li><Link href="/contact" className="transition-colors duration-fast hover:text-brick">Contact</Link></li></ul></div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-5 font-mono text-[9px] uppercase tracking-[.12em] text-ink-soft sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} {SITE.name}</span><span>Every listing is a case file, not a pitch.</span></div>
      </div>
    </footer>
  );
}
