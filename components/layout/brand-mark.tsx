/**
 * FailureLog mark — paper plane, redrawn as clean vector from the supplied
 * logo artwork (hand-drawn plane + "Failure / LOG" wordmark).
 *
 * Two shapes only, so it holds up at favicon size: an outlined wing and a
 * solid front fold, matching the shading in the original sketch. Uses
 * currentColor so it inherits ink color in light/dark and works inverted.
 */
export function PlaneMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="FailureLog"
    >
      {/* Wing — outlined */}
      <polygon
        points="82,14 14,62 46,60"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Front fold — solid, matches the shaded crease in the original sketch */}
      <polygon
        points="82,14 46,60 52,90"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
