import { cn } from "@/lib/utils";

const VARIANTS = {
  abandoned: { label: "ABANDONED", className: "case-stamp--abandoned" },
  verified: { label: "VERIFIED", className: "case-stamp--verified" },
  pending: { label: "UNDER REVIEW", className: "case-stamp--pending" },
  sold: { label: "SOLD", className: "case-stamp--sold" },
} as const;

export function StatusStamp({
  variant,
  className,
}: {
  variant: keyof typeof VARIANTS;
  className?: string;
}) {
  const v = VARIANTS[variant];
  return <span className={cn("case-stamp", v.className, className)}>{v.label}</span>;
}
