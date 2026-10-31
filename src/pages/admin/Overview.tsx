import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Home } from "lucide-react";
import { ADMIN_PATH, adminApi } from "../../lib/adminApi";
import { RESOURCES } from "./resources";

interface SectionLink {
  key: string;
  label: string;
  to: string;
  description: string;
  icon: typeof Home;
}

const TOP_LINKS: SectionLink[] = [
  {
    key: "home",
    label: "Home page",
    to: "home",
    description: "Hero heading, intro copy, and portrait.",
    icon: Home,
  },
  {
    key: "resume",
    label: "Resume",
    to: "resume",
    description: "Summary, contact links, and downloadable files.",
    icon: FileText,
  },
];

export default function Overview() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    Promise.all(
      RESOURCES.map(async (resource) => {
        const rows = await adminApi.list(resource.path);
        return [resource.key, rows.length] as const;
      }),
    )
      .then((entries) => {
        if (active) setCounts(Object.fromEntries(entries));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <div className="border-b border-line pb-6">
        <h1 className="font-display text-2xl">Dashboard</h1>
        <p className="mt-1 max-w-xl text-sm text-slate">
          Everything published on the site lives here. Changes go live as soon
          as you save.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TOP_LINKS.map((link) => (
          <Link
            key={link.key}
            to={`${ADMIN_PATH}/${link.to}`}
            className="group flex items-start justify-between gap-4 border border-line bg-paper p-5 hover:border-signal"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-signal">
                <link.icon size={16} />
                <span className="text-sm font-medium">{link.label}</span>
              </div>
              <p className="text-sm text-slate">{link.description}</p>
            </div>
            <ArrowUpRight
              size={16}
              className="shrink-0 text-slate group-hover:text-signal"
            />
          </Link>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-xs font-medium uppercase tracking-wide text-slate">
        Collections
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((resource) => (
          <Link
            key={resource.key}
            to={`${ADMIN_PATH}/${resource.key}`}
            className="group border border-line bg-paper p-4 hover:border-signal"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium group-hover:text-signal">
                {resource.label}
              </span>
              <span className="font-display text-xl text-slate">
                {counts[resource.key] ?? "–"}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate">
              {resource.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
