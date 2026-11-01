import { useEffect, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

export type TransitionVariant = "circle";

export interface ThemeToggleProps {
  className?: string;
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

export type Theme = "light" | "dark";

const DARK_THEME_COLOR = "#000000";
const LIGHT_THEME_COLOR = "#F5F7FA";

const storedTheme = (): Theme => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
    );
};

const persistTheme = (theme: Theme) => {
  try {
    localStorage.setItem("theme", theme);
  } catch {}
};

export default function ThemeToggle({
  className = "",
  duration = 600,
  variant = "circle",
  fromCenter = false,
  theme: controlledTheme,
  onThemeChange,
}: ThemeToggleProps) {
  const [internalTheme, setInternalTheme] = useState<Theme>(storedTheme);
  const isControlled = controlledTheme !== undefined;
  const activeTheme = controlledTheme ?? internalTheme;

  useEffect(() => {
    applyTheme(activeTheme);
    if (!isControlled) persistTheme(activeTheme);
  }, [activeTheme, isControlled]);

  const nextTheme = activeTheme === "dark" ? "light" : "dark";

  const updateTheme = (theme: Theme) => {
    if (isControlled) onThemeChange?.(theme);
    else setInternalTheme(theme);
  };

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hasViewTransition =
      typeof document.startViewTransition === "function";

    if (!hasViewTransition || reduceMotion || variant !== "circle") {
      updateTheme(nextTheme);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = fromCenter
      ? window.innerWidth / 2
      : rect.left + rect.width / 2;
    const y = fromCenter
      ? window.innerHeight / 2
      : rect.top + rect.height / 2;
    const originX = (x / window.innerWidth) * 100;
    const originY = (y / window.innerHeight) * 100;

    const transition = document.startViewTransition(() => {
      applyTheme(nextTheme);
      flushSync(() => updateTheme(nextTheme));
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0% at ${originX}% ${originY}%)`,
              `circle(150% at ${originX}% ${originY}%)`,
            ],
          },
          {
            duration,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          } as KeyframeAnimationOptions & { pseudoElement: string },
        );
      })
      .catch(() => undefined);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-slate shadow-sm transition-colors hover:border-signal/50 hover:text-ink ${className}`.trim()}
    >
      {activeTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
