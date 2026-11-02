import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, Mail } from "lucide-react";
import { FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa6";
import ThemeToggle from "./ThemeToggle";
import Starfield from "./Starfield";
import LanguageSwitcher from "./LanguageSwitcher";

export type NavKey = "home" | "resume" | "projects" | "blog";

const NAV_LINKS: Array<{ key: NavKey; href: string }> = [
  { key: "home", href: "/" },
  { key: "resume", href: "/resume" },
  { key: "projects", href: "/projects" },
  { key: "blog", href: "/blog" },
];

const EMAIL = import.meta.env.VITE_EMAIL || "you@example.com";
const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || "";
const LINKEDIN_URL = import.meta.env.VITE_LINKEDIN_URL || "";
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL || "";

interface LayoutProps {
  children: ReactNode;
  active?: NavKey;
}

export default function Layout({ children, active = "home" }: LayoutProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`starry-shell min-h-screen bg-paper text-ink font-sans antialiased ${
        active === "home" ? "starry-shell-home" : ""
      }`}
    >
      <Starfield home={active === "home"} />
      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-5 sm:px-6 md:px-8 lg:px-10">
            <Link
              to="/"
              className="font-display text-lg font-semibold tracking-tight"
            >
              Maqsudbek Dehqonaliyev
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <nav
                aria-label={t("common.primaryNav")}
                className="hidden items-center gap-1 md:flex"
              >
                {NAV_LINKS.map((item) => {
                  const isActive = item.key === active;
                  return (
                    <Link
                      key={item.key}
                      to={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`site-nav-link site-nav-link-desktop px-4 py-2 text-sm font-medium transition-colors ${
                        isActive ? "text-signal" : "text-slate"
                      }`}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  );
                })}
              </nav>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-slate shadow-sm transition-colors hover:border-signal/50 hover:text-ink md:hidden"
                onClick={() => setOpen(!open)}
                aria-label={open ? t("common.closeMenu") : t("common.openMenu")}
                aria-expanded={open}
                aria-controls="mobile-nav"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {open && (
            <div
              id="mobile-nav"
              className="mobile-nav-panel absolute inset-x-0 top-full z-50 border-t border-line bg-paper/95 shadow-card backdrop-blur-xl md:hidden"
            >
              <nav
                aria-label={t("common.mobileNav")}
                className="mx-auto flex max-w-content flex-col gap-1 px-5 py-4 sm:px-6"
              >
                {NAV_LINKS.map((item) => {
                  const isActive = item.key === active;
                  return (
                    <Link
                      key={item.key}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`site-nav-link site-nav-link-mobile flex min-h-11 items-center px-4 text-base font-medium transition-colors ${
                        isActive ? "text-signal" : "text-slate"
                      }`}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </header>

        <main className="min-h-[60vh]">{children}</main>

        <footer className="mt-24 border-t border-line">
          <div className="mx-auto flex max-w-content flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
            <p className="max-w-md text-sm leading-relaxed text-slate">
              {t("footer.text")}
            </p>
            <div className="flex items-center gap-2">
              {EMAIL && (
                <a
                  href={`mailto:${EMAIL}`}
                  aria-label={t("common.email")}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-slate shadow-sm transition-colors hover:border-signal/50 hover:text-signal"
                >
                  <Mail size={18} />
                </a>
              )}
              {GITHUB_URL && (
                <a
                  href={GITHUB_URL}
                  aria-label="GitHub"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-slate shadow-sm transition-colors hover:border-signal/50 hover:text-signal"
                >
                  <FaGithub size={18} />
                </a>
              )}
              {LINKEDIN_URL && (
                <a
                  href={LINKEDIN_URL}
                  aria-label="LinkedIn"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-slate shadow-sm transition-colors hover:border-signal/50 hover:text-signal"
                >
                  <FaLinkedin size={18} />
                </a>
              )}
              {TELEGRAM_URL && (
                <a
                  href={TELEGRAM_URL}
                  aria-label="Telegram"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-slate shadow-sm transition-colors hover:border-signal/50 hover:text-signal"
                >
                  <FaTelegram size={18} />
                </a>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
