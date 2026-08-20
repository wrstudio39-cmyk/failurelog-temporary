import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // WALEED Design Bible — Chapter 4, Part I, Section 2: The Color System
        primary: { DEFAULT: "#5B5FEF", dim: "#E4E4FD" },   // Electric Indigo
        secondary: { DEFAULT: "#38BDF8", dim: "#DCF3FD" }, // Cyan Blue
        accent: { DEFAULT: "#10B981", dim: "#D3F3E7" },    // Emerald — success
        warning: { DEFAULT: "#F59E0B", dim: "#FDEACB" },   // Amber
        error: { DEFAULT: "#EF4444", dim: "#FBDADA" },     // Red
        info: { DEFAULT: "#3B82F6", dim: "#DCE9FE" },      // Sky Blue

        // Neutral Color System — 10-step grayscale (Gray 50 → Gray 900)
        gray: {
          50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0", 300: "#CBD5E1",
          400: "#94A3B8", 500: "#64748B", 600: "#475569", 700: "#334155",
          800: "#1E293B", 900: "#0F172A",
        },

        // Legacy tokens kept so existing markup keeps working, remapped to the
        // book's palette via CSS variables so light/dark both work automatically
        // (opacity modifiers like bg-paper-dim/40 still apply).
        paper: "rgb(var(--surface-0-rgb) / <alpha-value>)",
        "paper-dim": "rgb(var(--surface-2-rgb) / <alpha-value>)",
        ink: "rgb(var(--text-primary-rgb) / <alpha-value>)",
        "ink-soft": "rgb(var(--text-secondary-rgb) / <alpha-value>)",
        hairline: "rgb(var(--border-rgb) / <alpha-value>)",
        amber: { DEFAULT: "#F59E0B", dim: "#FDEACB" },
        brick: { DEFAULT: "#EF4444", dim: "#FBDADA" },
        signal: { DEFAULT: "#10B981", dim: "#D3F3E7" },
      },
      fontFamily: {
        // Section 3: Typography — Inter (UI), JetBrains Mono (technical/code)
        display: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
        // Brand wordmark only — matches the hand-drawn "Failure" logotype.
        // Never used for body/heading copy (Design Bible: "never use more
        // than two font families" for interface text).
        script: ["var(--font-marker)", "cursive"],
      },
      fontSize: {
        // Typography Scale table, Section 3
        display: ["4.5rem", { lineHeight: "1.1", fontWeight: "700" }],   // 72px
        h1: ["3rem", { lineHeight: "1.15", fontWeight: "700" }],         // 48px
        h2: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],       // 36px
        h3: ["1.875rem", { lineHeight: "1.25", fontWeight: "600" }],     // 30px
        h4: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],        // 24px
        h5: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],      // 20px
        h6: ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],      // 18px
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],                  // 18px
        body: ["1rem", { lineHeight: "1.6" }],                           // 16px
        small: ["0.875rem", { lineHeight: "1.5" }],                      // 14px
        caption: ["0.75rem", { lineHeight: "1.5" }],                     // 12px
      },
      spacing: {
        // 8-Point Spacing System, Section 3
        1: "4px", 2: "8px", 4: "16px", 6: "24px", 8: "32px",
        10: "40px", 12: "48px", 16: "64px", 20: "80px", 24: "96px",
      },
      borderRadius: {
        // Border Radius & Elevation, Section 3 + Button sizing, Part II Section 2
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",   // cards / medium buttons
        lg: "16px",   // dialogs / large buttons
        xl: "24px",   // large illustrations
      },
      boxShadow: {
        // Shadows & Focus States, Section 4 — three elevation levels
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)",
        dropdown: "0 4px 12px rgba(15, 23, 42, 0.10), 0 2px 4px rgba(15, 23, 42, 0.06)",
        dialog: "0 12px 32px rgba(15, 23, 42, 0.18), 0 4px 8px rgba(15, 23, 42, 0.08)",
      },
      transitionDuration: {
        // Animation Durations, Section 4
        instant: "100ms",
        fast: "150ms",
        DEFAULT: "250ms",
        slow: "450ms",
      },
      backgroundImage: {
        grain: "url('/grain.svg')",
      },
      zIndex: {
        // Layer tokens, Section 4 — "keep stacking order predictable
        // across the entire application." Use z-dropdown / z-modal /
        // z-overlay / z-toast / z-tooltip instead of arbitrary values.
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        modal: "var(--z-modal)",
        overlay: "var(--z-overlay)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
  plugins: [typography],
};
export default config;
