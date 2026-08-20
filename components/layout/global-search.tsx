"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CornerDownLeft, FileStack, Gauge, PlusCircle, Search } from "lucide-react";
import { formatPrice } from "@/lib/config";

type SearchResult = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  price: number;
  category: string;
  businessModel: string;
  techTags: string[];
};

const QUICK_LINKS = [
  { href: "/marketplace", label: "Browse the archive", icon: FileStack },
  { href: "/sell", label: "Sell a project", icon: PlusCircle },
  { href: "/dashboard", label: "Open your dashboard", icon: Gauge },
];

/**
 * Advanced search — a Cmd/Ctrl+K command palette that searches live
 * against /api/search (title, tagline, category, stack) with keyboard
 * navigation, plus quick links to the rest of the product. Mounted once
 * in the site header.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }, []);

  // Global keyboard shortcut: Cmd/Ctrl+K opens, Esc closes.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    else document.body.style.overflow = "";
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Debounced live search.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(handle);
  }, [query, open]);

  const totalItems = results.length + QUICK_LINKS.length;

  function go(index: number) {
    if (index < results.length) {
      router.push(`/projects/${results[index].slug}`);
    } else {
      router.push(QUICK_LINKS[index - results.length].href);
    }
    close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % Math.max(totalItems, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + totalItems) % Math.max(totalItems, 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (totalItems) go(active); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="nav-search" aria-label="Search the archive (Cmd+K)">
        <Search size={15} />
      </button>

      {open && (
        <div className="cmdk-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="cmdk-panel" role="dialog" aria-modal="true" aria-label="Search the archive">
            <div className="cmdk-input-row">
              <Search size={16} className="text-ink-soft shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search case files, stack, category…"
                className="cmdk-input"
                aria-label="Search"
              />
              <span className="cmdk-kbd hidden sm:inline">ESC</span>
            </div>

            <div className="cmdk-list">
              {loading && <div className="cmdk-empty">Searching the archive…</div>}

              {!loading && results.length > 0 && (
                <>
                  <div className="cmdk-section-label">Case files</div>
                  {results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => go(i)}
                      onMouseEnter={() => setActive(i)}
                      className={`cmdk-item ${active === i ? "cmdk-item--active" : ""}`}
                    >
                      <span className="cmdk-item-icon"><FileStack size={14} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-display text-sm font-semibold">{r.title}</span>
                          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[.06em] text-ink-soft">{r.businessModel}</span>
                        </span>
                        <span className="block truncate font-body text-xs text-ink-soft">{r.tagline}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs font-semibold text-ink-soft">{formatPrice(r.price)}</span>
                    </button>
                  ))}
                </>
              )}

              {!loading && query && results.length === 0 && (
                <div className="cmdk-empty">
                  Nothing in the archive matches &ldquo;{query}&rdquo;.
                  <div className="mt-1 text-xs text-ink-soft">Try a broader stack, category, or project name.</div>
                </div>
              )}

              <div className="cmdk-section-label">Go to</div>
              {QUICK_LINKS.map((link, i) => {
                const idx = results.length + i;
                const Icon = link.icon;
                return (
                  <button
                    key={link.href}
                    onClick={() => go(idx)}
                    onMouseEnter={() => setActive(idx)}
                    className={`cmdk-item ${active === idx ? "cmdk-item--active" : ""}`}
                  >
                    <span className="cmdk-item-icon"><Icon size={14} /></span>
                    <span className="flex-1 font-body text-sm">{link.label}</span>
                    <ArrowUpRight size={14} className="text-ink-soft" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-hairline px-4 py-2.5 font-mono text-[9px] uppercase tracking-[.06em] text-ink-soft">
              <span className="flex items-center gap-1.5"><CornerDownLeft size={11} /> select</span>
              <span>↑↓ navigate</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
