import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api, type HomeData } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function Home() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(home?.job_title);

  useEffect(() => {
    api
      .home()
      .then(setHome)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout active="Home">
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-signal/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-signal/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-content px-5 pb-20 pt-20 sm:px-6 md:px-8 md:pb-28 md:pt-28 lg:px-10">
          {loading ? (
            <div className="max-w-3xl">
              <Skeleton className="mb-6 h-7 w-48 rounded-full" />
              <Skeleton className="mb-3 h-14 w-full max-w-2xl" />
              <Skeleton className="mb-6 h-14 w-3/4 max-w-xl" />
              <Skeleton className="h-5 w-full max-w-xl" />
              <Skeleton className="mt-2 h-5 w-2/3 max-w-lg" />
              <div className="mt-9 flex gap-3">
                <Skeleton className="h-11 w-40 rounded-full" />
                <Skeleton className="h-11 w-36 rounded-full" />
              </div>
            </div>
          ) : (
            <>
              {home?.job_title && (
                <span className="eyebrow mb-6">{home.job_title}</span>
              )}
              {home?.heading_activity && (
                <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                  {home.heading_activity}
                </h1>
              )}
              {home?.home_context && (
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate md:text-xl">
                  {home.home_context}
                </p>
              )}
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/projects" className="btn btn-primary">
                  See my projects <ArrowUpRight size={16} />
                </Link>
                <Link to="/resume" className="btn btn-secondary">
                  Read my resume
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {loading ? (
        <section className="mx-auto max-w-content px-5 pb-20 sm:px-6 md:px-8 lg:px-10">
          <div className="mb-8 max-w-xl space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card space-y-4 p-6 md:p-7">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        home?.activities &&
        home.activities.length > 0 && (
          <section className="mx-auto max-w-content px-5 pb-20 sm:px-6 md:px-8 lg:px-10">
            <div className="mb-8 max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                What I focus on
              </h2>
              <p className="mt-2 leading-relaxed text-slate">
                The work I care about most, from backend systems to the models
                that sit on top of them.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {home.activities.map((area, index) => (
                <article key={area.title} className="card p-6 md:p-7">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-signal/10 text-xs font-semibold text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                    {area.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {area.context}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )
      )}

      {loading ? (
        <section className="mx-auto max-w-content px-5 sm:px-6 md:px-8 lg:px-10">
          <div className="card p-8 md:p-12">
            <div className="mx-auto max-w-2xl space-y-4">
              <Skeleton className="mx-auto h-8 w-44" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mx-auto h-4 w-2/3" />
            </div>
          </div>
        </section>
      ) : (
        home?.off_board && (
          <section className="mx-auto max-w-content px-5 sm:px-6 md:px-8 lg:px-10">
            <div className="card p-8 md:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <span className="mx-auto mb-5 block h-1 w-10 rounded-full bg-signal" />
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  Off the board
                </h2>
                <p className="mt-4 leading-relaxed text-slate">
                  {home.off_board}
                </p>
              </div>
            </div>
          </section>
        )
      )}
    </Layout>
  );
}
