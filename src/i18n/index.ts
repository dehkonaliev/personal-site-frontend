import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en";
import ru from "./locales/ru";
import uz from "./locales/uz";

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ["en", "ru", "uz"],
    fallbackLng: "en",
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export type Language = "en" | "uz" | "ru";

export const LANGUAGES: Array<{
  code: Language;
  label: string;
  short: string;
}> = [
  { code: "uz", label: "O‘zbekcha", short: "UZ" },
  { code: "en", label: "English", short: "EN" },
  { code: "ru", label: "Русский", short: "RU" },
];

export function currentLanguage(): Language {
  return normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
}

export function normalizeLanguage(value: string | undefined | null): Language {
  const code = (value ?? "").toLowerCase();
  if (code.startsWith("uz")) return "uz";
  if (code.startsWith("ru")) return "ru";
  return "en";
}

export function intlLocale(language: Language = currentLanguage()): string {
  if (language === "uz") return "uz-UZ";
  if (language === "ru") return "ru-RU";
  return "en-GB";
}

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = normalizeLanguage(language);
});

export default i18n;

