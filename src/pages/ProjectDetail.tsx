import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Breadcrumb from "../components/Breadcrumb";
import SeoHead from "../components/SeoHead";
import Skeleton from "../components/Skeleton";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { api, type ProjectDetail } from "../lib/api";

const projectYear = (iso: string) => new Date(iso).getFullYear();

export default function ProjectDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug = "" } = useParams();
  const initialProject = useLoaderData() as ProjectDetail;
  const [project, setProject] = useState<ProjectDetail | null>(initialProject);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .project(slug)
      .then((project) => {
        if (active) {
          setError(false);
          setProject(project);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setProject(null);
          setError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [slug, i18n.resolvedLanguage]);

  return (
    <>
      <SeoHead
        title={project?.title ?? t("projects.title")}
        description={project?.summary ?? t("projects.intro")}
        pathname={`/projects/${encodeURIComponent(project?.slug ?? slug)}`}
      />
      <Layout active="projects">
      <section className="mx-auto max-w-content px-5 pb-20 pt-12 sm:px-6 md:px-8 lg:px-10">
        <Breadcrumb
          items={[
            { label: t("nav.home"), to: "/" },
            { label: t("nav.projects"), to: "/projects" },
            ...(project ? [{ label: project.title }] : []),
          ]}
        />

        {error && (
          <div className="mt-12 max-w-3xl border-t border-line pt-8">
            <p className="text-slate">{t("projects.notFound")}</p>
            <Link to="/projects" className="btn btn-secondary mt-5">
              <ArrowLeft size={14} /> {t("projects.allProjects")}
            </Link>
          </div>
        )}

        {!error && !project && (
          <article className="mt-12 max-w-content">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-8 h-12 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-12 w-2/3 max-w-xl" />
            <Skeleton className="mt-8 h-5 w-full max-w-3xl" />
            <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-2/3 max-w-xl" />
          </article>
        )}

        {!error && project && (
          <article className="mt-12 max-w-content">
            <header className="max-w-4xl border-b border-line pb-10 md:pb-12">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-signal">
                {t("projects.selected")} <span className="px-2 text-line">/</span>{" "}
                {projectYear(project.created_at)}
              </p>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                {project.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate md:text-xl">
                {project.summary}
              </p>
            </header>

            {project.preview_image && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface-muted">
                <img
                  src={project.preview_image}
                  alt={`${project.title} preview`}
                  className="w-full object-cover"
                />
              </div>
            )}

            <div className="grid gap-10 py-9 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-16 md:py-12">
              <div>
                {project.context ? (
                  <div
                    className="rich-text max-w-3xl"
                    dangerouslySetInnerHTML={{ __html: project.context }}
                  />
                ) : (
                  <p className="text-sm text-slate">
                    {t("projects.comingSoon")}
                  </p>
                )}
              </div>

              <aside className="space-y-8 md:border-l md:border-line md:pl-8">
                {project.technologies.filter(
                  (tech): tech is NonNullable<typeof tech> & { name: string } =>
                    typeof tech === "object" && tech !== null && "name" in tech,
                ).length > 0 && (
                  <section>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                      {t("projects.builtWith")}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies
                        .filter(
                          (tech) =>
                            typeof tech === "object" &&
                            tech !== null &&
                            "name" in tech,
                        )
                        .map((tech) => (
                          <span key={tech.name} className="tag">
                            {tech.name}
                          </span>
                        ))}
                    </div>
                  </section>
                )}

                <section className="flex flex-col items-start gap-3">
                  {project.live_link && (
                    <a
                      href={project.live_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      <ExternalLink size={15} /> {t("projects.viewLive")}{" "}
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                  {project.github_link && (
                    <a
                      href={project.github_link}
                      target="_blank"
                      rel="noreferrer"
                      className={project.live_link ? "btn btn-secondary" : "btn btn-primary"}
                    >
                      <FaGithub size={15} /> {t("projects.viewCode")}{" "}
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                  <Link to="/projects" className="btn btn-secondary">
                    <ArrowLeft size={14} /> {t("projects.allProjects")}
                  </Link>
                </section>
              </aside>
            </div>
          </article>
        )}
      </section>
      </Layout>
    </>
  );
}
