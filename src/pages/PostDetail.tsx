import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Breadcrumb from "../components/Breadcrumb";
import Skeleton from "../components/Skeleton";
import { ArrowLeft } from "lucide-react";
import { api, formatDate, type PostDetail } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function PostDetailPage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [error, setError] = useState(false);

  useDocumentTitle(post?.title ?? "Blog");

  useEffect(() => {
    let active = true;
    api
      .post(slug)
      .then((post) => {
        if (active) {
          setError(false);
          setPost(post);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setPost(null);
          setError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <Layout active="Blog">
      <section className="mx-auto max-w-content px-5 pb-20 pt-12 sm:px-6 md:px-8 lg:px-10">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Blog", to: "/blog" },
            ...(post ? [{ label: post.title }] : []),
          ]}
        />

        {error && (
          <div className="card mt-10 p-8 text-center">
            <p className="text-slate">Post not found.</p>
            <Link to="/blog" className="btn btn-secondary mt-5">
              <ArrowLeft size={14} /> All posts
            </Link>
          </div>
        )}

        {!error && !post && (
          <article className="card mt-8 max-w-3xl p-6 md:p-10">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-7 h-12 w-full max-w-xl" />
            <Skeleton className="mt-3 h-12 w-1/2 max-w-sm" />
            <Skeleton className="mt-8 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-3/4 max-w-xl" />
          </article>
        )}

        {!error && post && (
          <article className="card mt-8 max-w-3xl p-6 md:p-10">
            <p className="eyebrow mb-4">Article</p>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate">
              {formatDate(post.created_at)}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline"
            >
              <ArrowLeft size={14} /> All posts
            </Link>
            {post.body && (
              <div
                className="rich-text mt-8 max-w-2xl border-t border-line pt-8"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            )}
          </article>
        )}
      </section>
    </Layout>
  );
}
