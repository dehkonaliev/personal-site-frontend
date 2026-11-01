import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Award,
  Briefcase,
  Code2,
  Cpu,
  ExternalLink,
  FileText,
  FolderTree,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Newspaper,
  X,
} from "lucide-react";
import {
  ADMIN_PATH,
  AdminApiError,
  UNAUTHORIZED_EVENT,
  adminApi,
  clearAdminToken,
  errorMessage,
  getAdminToken,
  setAdminToken,
  tokenFromUrlHash,
} from "../../lib/adminApi";
import Overview from "./Overview";
import ResourcePage from "./ResourcePage";
import SingletonEditor from "./SingletonEditor";
import { RESOURCES, findResource } from "./resources";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import ThemeToggle from "../../components/ThemeToggle";

type AuthState = "checking" | "signedOut" | "signedIn" | "disabled";

const ICONS: Record<string, typeof Home> = {
  activities: Activity,
  experiences: Briefcase,
  educations: GraduationCap,
  "skill-types": Layers,
  skills: Code2,
  certificates: Award,
  projects: FolderTree,
  posts: Newspaper,
  technologies: Cpu,
};

interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", to: "", icon: LayoutDashboard },
  { key: "home", label: "Home page", to: "home", icon: Home },
  { key: "resume", label: "Resume", to: "resume", icon: FileText },
  ...RESOURCES.map((resource) => ({
    key: resource.key,
    label: resource.label,
    to: resource.key,
    icon: ICONS[resource.key] ?? FolderTree,
  })),
];

export default function AdminPanel() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const hashToken = tokenFromUrlHash();
    if (hashToken) setAdminToken(hashToken);
    return getAdminToken() ? "checking" : "signedOut";
  });
  const [disabledReason, setDisabledReason] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  const section = location.pathname
    .replace(/\/+$/, "")
    .slice(ADMIN_PATH.length)
    .replace(/^\/+/, "");
  const sectionLabel =
    section === ""
      ? "Dashboard"
      : section === "home"
        ? "Home page"
        : section === "resume"
          ? "Resume"
          : (findResource(section)?.label ?? "Dashboard");
  useDocumentTitle(
    auth === "signedIn" ? `Admin · ${sectionLabel}` : "Admin sign in",
  );

  useEffect(() => {
    if (!getAdminToken()) return;

    let active = true;
    adminApi
      .verify()
      .then(() => {
        if (active) setAuth("signedIn");
      })
      .catch((error) => {
        if (!active) return;
        clearAdminToken();
        if (error instanceof AdminApiError && error.status === 503) {
          setDisabledReason(error.message);
          setAuth("disabled");
        } else {
          setAuth("signedOut");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setAuth("signedOut");
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  async function handleLogin(token: string): Promise<string | null> {
    setAdminToken(token);
    try {
      await adminApi.verify();
      setAuth("signedIn");
      setDisabledReason("");
      return null;
    } catch (error) {
      clearAdminToken();
      if (error instanceof AdminApiError && error.status === 503) {
        setDisabledReason(error.message);
        setAuth("disabled");
        return error.message;
      }
      if (error instanceof AdminApiError && error.status === 401) {
        return "That token was rejected. Check ADMIN_API_TOKEN on the API.";
      }
      return errorMessage(error);
    }
  }

  function handleLogout() {
    clearAdminToken();
    setAuth("signedOut");
  }

  if (auth === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-slate">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (auth !== "signedIn") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        disabledReason={auth === "disabled" ? disabledReason : ""}
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased lg:flex">
      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-black text-white transition-transform lg:static lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link to={ADMIN_PATH} className="font-display text-lg tracking-tight">
            Site admin
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="p-1 text-white/70 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.to ? `${ADMIN_PATH}/${item.to}` : ADMIN_PATH}
              end={item.to === ""}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm ${
                  isActive
                    ? "text-gold"
                    : "text-white/65"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
          <div className="flex items-center justify-between px-3 py-2 text-sm text-white/65">
            <span>Appearance</span>
            <ThemeToggle />
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/65"
          >
            <ExternalLink size={16} /> View site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white/65"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="p-2 text-slate hover:text-ink"
          >
            <Menu size={20} />
          </button>
          <span className="font-display">Site admin</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="p-2 text-slate hover:text-ink"
          >
            <LogOut size={18} />
          </button>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="home" element={<SingletonEditor kind="home" />} />
            <Route path="resume" element={<SingletonEditor kind="resume" />} />
            {RESOURCES.map((resource) => (
              <Route
                key={resource.key}
                path={resource.key}
                element={<ResourcePage resource={resource} />}
              />
            ))}
            <Route path="*" element={<Navigate to={ADMIN_PATH} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

interface LoginScreenProps {
  onLogin: (token: string) => Promise<string | null>;
  disabledReason: string;
}

function LoginScreen({ onLogin, disabledReason }: LoginScreenProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState(disabledReason);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    setSubmitting(true);
    setError("");
    const message = await onLogin(token);
    if (message) setError(message);
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 text-ink font-sans antialiased">
      <div className="w-full max-w-sm border border-line bg-paper p-8">
        <div className="mb-4 inline-flex items-center gap-2 text-signal">
          <LockKeyhole size={18} />
          <span className="text-xs font-medium uppercase tracking-wide">
            Admin access
          </span>
        </div>
        <h1 className="font-display text-2xl">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Enter the admin API token. It stays in this browser tab only and is
          sent with each request as an{" "}
          <code className="text-xs">X-Admin-Token</code> header.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6">
          <label
            htmlFor="admin-token"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate"
          >
            Admin token
          </label>
          <input
            id="admin-token"
            type="password"
            autoComplete="current-password"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="w-full border border-line bg-paper px-3 py-2 text-sm focus:border-signal focus:outline-none"
            placeholder="ADMIN_API_TOKEN"
          />

          {error && (
            <div className="mt-3 flex items-start gap-2 border border-danger-line bg-danger-surface px-3 py-2 text-sm text-danger">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !token.trim()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-signal px-4 py-2.5 text-sm text-paper hover:brightness-90 disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Checking…" : "Unlock"}
          </button>
        </form>

        <p className="mt-4 text-xs leading-relaxed text-slate/80">
          Tip: you can open the secret link with{" "}
          <code className="text-xs">#token=…</code> to sign in automatically.
        </p>
      </div>
    </div>
  );
}
