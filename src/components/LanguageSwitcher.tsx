import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Globe } from "lucide-react";
import { LANGUAGES, currentLanguage, type Language } from "../i18n";

export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const active = currentLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  function change(language: Language) {
    if (language !== active) void i18n.changeLanguage(language);
    setMenuOpen(false);
  }

  return (
    <div className={`inline-flex ${className}`.trim()}>
      <div className="relative sm:hidden">
        <button
          type="button"
          aria-label={t("language.label")}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-controls="mobile-language-options"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-signal/50"
        >
          <Globe size={15} aria-hidden className="text-slate" />
          {LANGUAGES.find((language) => language.code === active)?.short}
          <ChevronDown
            size={14}
            aria-hidden
            className={`text-slate transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>
        {menuOpen && (
          <div
            id="mobile-language-options"
            role="listbox"
            aria-label={t("language.label")}
            className="absolute right-0 top-full z-50 mt-2 min-w-40 rounded-2xl border border-line bg-surface p-1.5 shadow-card"
          >
            {LANGUAGES.map((language) => {
              const isActive = language.code === active;
              return (
                <button
                  key={language.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => change(language.code)}
                  className={`flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-signal text-paper"
                      : "text-ink hover:bg-surface-muted"
                  }`}
                >
                  {language.label}
                  <span
                    className={`text-xs font-semibold ${
                      isActive ? "text-paper/80" : "text-slate"
                    }`}
                  >
                    {language.short}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        role="group"
        aria-label={t("language.label")}
        className="hidden h-11 items-center gap-1 rounded-full border border-line bg-surface px-1.5 shadow-sm sm:inline-flex"
      >
        <Globe size={15} aria-hidden className="ml-1 text-slate" />
        {LANGUAGES.map((language) => {
          const isActive = language.code === active;
          return (
            <button
              key={language.code}
              type="button"
              onClick={() => change(language.code)}
              aria-pressed={isActive}
              title={language.label}
              className={`inline-flex h-8 items-center justify-center rounded-full px-2.5 text-xs font-semibold tracking-wide transition-colors ${
                isActive
                  ? "bg-signal text-paper"
                  : "text-slate hover:bg-surface-muted hover:text-ink"
              }`}
            >
              {language.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
