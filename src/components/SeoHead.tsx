import { Head } from "vite-react-ssg";
import { SITE_NAME } from "../lib/useDocumentTitle";

const SITE_URL = "https://www.dehkonaliev.uz";

interface SeoHeadProps {
  title: string;
  description: string;
  pathname: string;
  type?: "website" | "article";
}

export default function SeoHead({
  title,
  description,
  pathname,
  type = "website",
}: SeoHeadProps) {
  const canonical = new URL(pathname, SITE_URL).toString();

  return (
    <Head>
      <title>{`${title} — ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={`${title} — ${SITE_NAME}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={`${title} — ${SITE_NAME}`} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}
