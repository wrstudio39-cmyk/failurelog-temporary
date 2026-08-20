import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CircleDollarSign, Users } from "lucide-react";
import { StatusStamp } from "@/components/ui/status-stamp";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { formatPrice, formatCompactNumber, getBusinessModelLabel } from "@/lib/config";
import type { Listing } from "@/types";

export function ProjectCard({ listing }: { listing: Listing }) {
  const cover = listing.media?.find((m) => m.is_cover)?.url;
  return (
    <Link href={`/projects/${listing.slug}`} className="project-card group">
      <div className="project-card-top">
        <div className="flex min-w-0 items-center gap-2">
          <span className="micro-kicker">{getBusinessModelLabel(listing.business_model)}</span>
          <span className="dot-sep" />
          <span className="micro-kicker">{listing.category.replaceAll("-", " ")}</span>
        </div>
        <StatusStamp variant="abandoned" />
      </div>

      {cover ? (
        <div className="project-cover">
          <Image src={cover} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="cover-overlay" />
          <span className="cover-index">CASE / {listing.id.slice(-3)}</span>
        </div>
      ) : (
        <div className="project-cover project-cover--empty">
          <div className="case-grid" />
          <span className="cover-index">CASE / {listing.id.slice(-3)}</span>
          <span className="cover-word">FAILED</span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <h3 className="font-display text-[21px] font-bold leading-[1.05] tracking-[-0.035em] text-ink group-hover:text-brick transition-colors">
          {listing.title}
        </h3>
        <p className="mt-3 line-clamp-2 font-body text-[15px] leading-6 text-ink-soft">{listing.tagline}</p>
        {listing.seller?.is_premium && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="font-body text-xs text-ink-soft">Sold by {listing.seller.name}</span>
            <PremiumBadge />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {listing.tech_tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tech-chip">{tag}</span>
          ))}
          {listing.tech_tags.length > 3 && <span className="tech-chip">+{listing.tech_tags.length - 3}</span>}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-y border-hairline py-4">
          <div className="metric-mini"><Users size={13} /><span>{formatCompactNumber(listing.metrics.total_users)} users</span></div>
          <div className="metric-mini"><CircleDollarSign size={13} /><span>${formatCompactNumber(listing.metrics.lifetime_revenue)} lifetime</span></div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="micro-kicker">Acquisition price</div>
            <div className="mt-1 font-display text-[22px] font-bold tracking-[-0.03em]">{formatPrice(listing.price)}</div>
          </div>
          <span className="card-arrow"><ArrowUpRight size={16} /></span>
        </div>
      </div>
    </Link>
  );
}
