import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reusable "Premium" mark — shown next to a seller/buyer name once an
 * admin has approved their $10 badge request. Never render this from a
 * client-guessed state; it must come from `profile.is_premium`. */
export function PremiumBadge({ className, size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "premium-badge",
        size === "md" && "premium-badge--md",
        className
      )}
      title="Approved by the archive desk"
    >
      <Gem size={size === "md" ? 12 : 10} />
      Premium
    </span>
  );
}
