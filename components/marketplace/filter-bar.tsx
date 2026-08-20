"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES, BUSINESS_MODELS, TECH_TAGS } from "@/lib/config";
import { Search, SlidersHorizontal, X } from "lucide-react";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function clearAll() { router.push(pathname); }
  const hasFilters = searchParams.toString().length > 0;

  return (
    <aside className="filter-panel">
      <div className="filter-panel-head">
        <div className="flex items-center gap-2"><SlidersHorizontal size={14} /><span className="micro-kicker">Refine archive</span></div>
        {hasFilters && <button onClick={clearAll} className="filter-clear"><X size={12} /> Clear</button>}
      </div>

      <div className="filter-block">
        <label className="label" htmlFor="q">Search the archive</label>
        <div className="search-input-wrap">
          <Search size={15} />
          <input id="q" className="search-input" placeholder="Name, stack, idea…" defaultValue={searchParams.get("q") ?? ""}
            onKeyDown={(e) => { if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value); }} />
        </div>
      </div>

      <div className="filter-block">
        <div className="label">Business model</div>
        <div className="filter-options">
          <FilterRadio name="model" value="" label="Everything" active={!searchParams.get("model")} onSelect={setParam} />
          {BUSINESS_MODELS.map((m) => <FilterRadio key={m.value} name="model" value={m.value} label={m.label} active={searchParams.get("model") === m.value} onSelect={setParam} />)}
        </div>
      </div>

      <div className="filter-block">
        <div className="label">Category</div>
        <div className="filter-options">
          <FilterRadio name="category" value="" label="Everything" active={!searchParams.get("category")} onSelect={setParam} />
          {CATEGORIES.map((c) => <FilterRadio key={c.slug} name="category" value={c.slug} label={c.name} active={searchParams.get("category") === c.slug} onSelect={setParam} />)}
        </div>
      </div>

      <div className="filter-block">
        <div className="label">Stack</div>
        <div className="flex flex-wrap gap-1.5">
          {TECH_TAGS.slice(0, 12).map((tag) => {
            const active = searchParams.get("tech") === tag;
            return <button key={tag} onClick={() => setParam("tech", active ? "" : tag)} className={`tech-chip tech-chip--button ${active ? "tech-chip--active" : ""}`}>{tag}</button>;
          })}
        </div>
      </div>

      <div className="filter-block">
        <label className="label" htmlFor="maxPrice">Maximum acquisition price</label>
        <div className="price-input-wrap"><span>$</span><input id="maxPrice" type="number" className="search-input" placeholder="No limit" defaultValue={searchParams.get("maxPrice") ?? ""} onBlur={(e) => setParam("maxPrice", e.target.value)} /></div>
      </div>
    </aside>
  );
}

function FilterRadio({ name, value, label, active, onSelect }: { name: string; value: string; label: string; active: boolean; onSelect: (key: string, value: string) => void; }) {
  return <button onClick={() => onSelect(name, value)} className={`filter-option ${active ? "filter-option--active" : ""}`}><span className="filter-dot" />{label}</button>;
}
