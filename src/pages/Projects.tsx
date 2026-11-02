import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import { ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { api, type Project } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

const projectYear = (iso: string) => new Date(iso).getFullYear();

function techNames(techs: Project["technologies"]): string[] {
  const names: string[] = [];
  for (const tech of techs) {
    if (typeof tech === "string") {
      if (tech) names.push(tech);
    } else if (tech && typeof tech.name === "string") {
      names.push(tech.name);
    }
  }
  return names;
}

export default function Projects() {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(t("projects.title"));

  useEffect(() => {
    let active = true;
    api
      .projects()
      .then((data) => {
        if (active) {
          setProjects(data);
          setError(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [i18n.resolvedLanguage]);

  return (
    <Layout active="projects">
      <section className="mx-auto max-w-content px-5 pb-10 pt-16 sm:px-6 md:px-8 md:pt-20 lg:px-10">
        <p className="eyebrow mb-4">{t("projects.eyebrow")}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("projects.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate">
          {t("projects.intro")}
        </p>
      </section>

      <section className="mx-auto max-w-content px-5 pb-20 sm:px-6 md:px-8 lg:px-10">
        {loading && (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card flex flex-col p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
                <Skeleton className="mt-5 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <div className="mt-5 flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
                <Skeleton className="mt-6 h-11 w-32 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card p-8 text-center text-slate">
            {t("projects.error")}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="card p-8 text-center text-slate">
            {t("projects.empty")}
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project, i) => {
              const techs = techNames(project.technologies);
              return (
                <article
                  key={project.slug + i}
                  className="card card-interactive group flex h-full flex-col p-6 md:p-8"
                >
                  <div className="min-w-0">
                      <h2 className="font-display text-xl font-semibold leading-snug tracking-tight">
                        <Link
                          to={`/projects/${project.slug}`}
                          className="transition-colors group-hover:text-signal"
                        >
                          {project.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate">
                        {projectYear(project.created_at)}
                      </p>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate">
                    {project.summary}
                  </p>

                  {techs.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {techs.map((tech) => (
                        <span key={tech} className="tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="btn btn-primary"
                    >
                      {t("projects.viewDetails")} <ArrowUpRight size={15} />
                    </Link>
                    {project.github_link && (
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                      >
                        <FaGithub size={15} /> {t("projects.code")}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}
