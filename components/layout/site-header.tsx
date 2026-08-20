"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/layout/logo";
import { GlobalSearch } from "@/components/layout/global-search";

const NAV = [
  { href: "/marketplace", label: "Explore" },
  { href: "/sell", label: "Sell a project" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes, and whenever the
  // viewport grows past the breakpoint where the menu is even shown.
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => setMenuOpen(false);
    mq.addEventListener("change", close);
    document.body.style.overflow = "hidden";
    return () => { mq.removeEventListener("change", close); document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
        <Link href="/" className="brand group">
          <Logo size="sm" className="transition-transform duration-fast group-hover:-translate-y-0.5" />
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft lg:inline">
            failed / documented / useful
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <GlobalSearch />
          <span className="hidden items-center gap-1 rounded-md border border-hairline px-1.5 py-1 font-mono text-[9px] text-ink-soft lg:flex">
            <kbd>⌘</kbd><kbd>K</kbd>
          </span>
          <ThemeToggle />
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
          <Link href="/signup" className="btn-primary group hidden sm:inline-flex">
            Join FailureLog <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav-panel" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="mobile-nav-link">
              {item.label} <ArrowUpRight size={14} className="text-ink-soft" />
            </Link>
          ))}
          <Link href="/login" className="mobile-nav-link sm:hidden">
            Log in <ArrowUpRight size={14} className="text-ink-soft" />
          </Link>
          <Link href="/signup" className="btn-primary mt-2 w-full justify-center sm:hidden">
            Join FailureLog
          </Link>
        </nav>
      )}
    </header>
  );
}
