import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { LANGUAGES, currentLanguage, type Language } from "../i18n";

export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const active = currentLanguage();

  function change(language: Language) {
    if (language !== active) void i18n.changeLanguage(language);
  }

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={`inline-flex h-11 items-center gap-1 rounded-full border border-line bg-surface px-1.5 shadow-sm ${className}`.trim()}
    >
      <Globe size={15} aria-hidden className="ml-1 hidden text-slate sm:block" />
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
  );
}
