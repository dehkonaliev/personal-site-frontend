import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Mail } from "lucide-react";
import { FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa6";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Resume", href: "/resume" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
];

const FOOTER_TEXT =
  import.meta.env.VITE_FOOTER_TEXT ||
  "Tashkent, Uzbekistan — open to backend & ML roles.";
const EMAIL = import.meta.env.VITE_EMAIL || "you@example.com";
const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || "";
const LINKEDIN_URL = import.meta.env.VITE_LINKEDIN_URL || "";
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL || "";

interface LayoutProps {
  children: ReactNode;
  active?: string;
}

export default function Layout({ children, active = "Home" }: LayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-5 sm:px-6 md:px-8 lg:px-10">
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Maksudbek Dehqonaliyev
          </Link>

          <div className="flex items-center gap-2 md:gap-5">
            <ThemeToggle />
            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((item) => {
                const isActive = item.label === active;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-signal/10 text-signal"
                        : "text-slate hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-slate shadow-sm transition-colors hover:border-signal/50 hover:text-ink md:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div id="mobile-nav" className="border-t border-line bg-surface md:hidden">
            <nav
              aria-label="Mobile"
              className="mx-auto flex max-w-content flex-col gap-1 px-5 py-4 sm:px-6"
            >
              {NAV_LINKS.map((item) => {
                const isActive = item.label === active;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-xl px-4 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-signal/10 text-signal"
                        : "text-slate hover:bg-surface-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
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
            {FOOTER_TEXT}
          </p>
          <div className="flex items-center gap-2">
            {EMAIL && (
              <a
                href={`mailto:${EMAIL}`}
                aria-label="Email"
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
  );
}
