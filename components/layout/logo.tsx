import { PlaneMark } from "@/components/layout/brand-mark";

/**
 * Full FailureLog lockup — plane mark beside a two-line wordmark
 * ("Failure" in brush script, "LOG" in tracked small caps below it),
 * matching the supplied logo composition rotated into a horizontal
 * lockup so it fits a header/footer row instead of a stacked hero mark.
 *
 * `size` controls the mark's pixel size; text scales with it via the
 * `word` / `caption` size classes below.
 */
const SCALE = {
  sm: { mark: 26, word: "text-xl", caption: "text-[8px]" },
  md: { mark: 32, word: "text-2xl", caption: "text-[9px]" },
  lg: { mark: 44, word: "text-4xl", caption: "text-[11px]" },
} as const;

export function Logo({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SCALE;
  className?: string;
}) {
  const s = SCALE[size];
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <PlaneMark size={s.mark} className="shrink-0 text-primary" />
      <span className="flex flex-col leading-none">
        <span className={`font-script ${s.word} leading-none text-ink`}>Failure</span>
        <span className={`font-mono ${s.caption} font-medium uppercase tracking-[0.3em] text-ink-soft`}>Log</span>
      </span>
    </span>
  );
}
