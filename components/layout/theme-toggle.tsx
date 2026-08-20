"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

const ORDER: Theme[] = ["light", "dark", "system"];
const ICON = { light: Sun, dark: Moon, system: Monitor };
const LABEL = { light: "Light theme", dark: "Dark theme", system: "System theme" };

function apply(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem("waleed-theme") as Theme) || "system";
    setTheme(stored);
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    localStorage.setItem("waleed-theme", next);
    apply(next);
  };

  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      className="theme-toggle"
      aria-label={`${LABEL[theme]} — click to change`}
      title={LABEL[theme]}
    >
      <Icon size={16} />
    </button>
  );
}
