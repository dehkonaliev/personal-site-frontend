import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Breadcrumb from "../components/Breadcrumb";
import Skeleton from "../components/Skeleton";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { api, type ProjectDetail } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

const projectYear = (iso: string) => new Date(iso).getFullYear();

export default function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState(false);

  useDocumentTitle(project?.title ?? "Projects");

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
  }, [slug]);

  return (
    <Layout active="Projects">
      <section className="mx-auto max-w-content px-5 pb-20 pt-12 sm:px-6 md:px-8 lg:px-10">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Projects", to: "/projects" },
            ...(project ? [{ label: project.title }] : []),
          ]}
        />

        {error && (
          <div className="card mt-10 p-8 text-center">
            <p className="text-slate">Project not found.</p>
            <Link to="/projects" className="btn btn-secondary mt-5">
              <ArrowLeft size={14} /> All projects
            </Link>
          </div>
        )}

        {!error && !project && (
          <article className="card mt-8 max-w-3xl p-6 md:p-10">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-8 h-12 w-full max-w-xl" />
            <Skeleton className="mt-3 h-12 w-2/3 max-w-md" />
            <Skeleton className="mt-8 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-2/3 max-w-xl" />
          </article>
        )}

        {!error && project && (
          <article className="card mt-8 max-w-3xl p-6 md:p-10">
            <p className="eyebrow mb-4">Project</p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.12em] text-slate">
              {projectYear(project.created_at)}
            </p>
            <p className="mt-5 text-lg leading-relaxed text-slate">
              {project.summary}
            </p>

            {project.technologies.filter(
              (tech): tech is NonNullable<typeof tech> & { name: string } =>
                typeof tech === "object" && tech !== null && "name" in tech,
            ).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {project.technologies
                  .filter(
                    (tech) =>
                      typeof tech === "object" && tech !== null && "name" in tech,
                  )
                  .map((tech) => (
                    <span key={tech.name} className="tag">
                      {tech.name}
                    </span>
                  ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.github_link && (
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  <FaGithub size={15} /> View code <ArrowUpRight size={15} />
                </a>
              )}
              <Link to="/projects" className="btn btn-secondary">
                <ArrowLeft size={14} /> All projects
              </Link>
            </div>

            {project.context && (
              <div
                className="rich-text mt-10 max-w-2xl border-t border-line pt-8"
                dangerouslySetInnerHTML={{ __html: project.context }}
              />
            )}
          </article>
        )}
      </section>
    </Layout>
  );
}
