import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import { ArrowUpRight } from "lucide-react";
import { api, formatDate, type Post } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function Blog() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(t("blog.title"));

  useEffect(() => {
    let active = true;
    api
      .posts()
      .then((data) => {
        if (active) {
          setPosts(data);
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
    <Layout active="blog">
      <section className="mx-auto max-w-content px-5 pb-10 pt-16 sm:px-6 md:px-8 md:pt-20 lg:px-10">
        <p className="eyebrow mb-4">{t("blog.eyebrow")}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("blog.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate">
          {t("blog.intro")}
        </p>
      </section>

      <section className="mx-auto max-w-content px-5 pb-20 sm:px-6 md:px-8 lg:px-10">
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card flex flex-col p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
                <Skeleton className="mt-5 h-7 w-4/5" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
                <Skeleton className="mt-6 h-4 w-24" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card p-8 text-center text-slate">
            {t("blog.error")}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="card p-8 text-center text-slate">
            {t("blog.empty")}
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.slug + i}
                to={`/blog/${post.slug}`}
                className="card card-interactive group flex h-full flex-col p-6 md:p-7"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate">
                    {formatDate(post.created_at)}
                  </p>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-slate transition-colors group-hover:bg-signal group-hover:text-paper">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
                <h2 className="mt-5 font-display text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-signal">
                  {post.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate">
                  {post.summary}
                </p>
                <span className="mt-auto pt-6 text-sm font-medium text-signal">
                  {t("blog.read")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
