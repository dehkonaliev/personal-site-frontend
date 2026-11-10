import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";
import Layout from "../components/Layout";
import SeoHead from "../components/SeoHead";
import SeeMoreText from "../components/SeeMoreText";
import Skeleton from "../components/Skeleton";
import ImageLightbox from "../components/ImageLightbox";
import { Download, ExternalLink, ZoomIn } from "lucide-react";
import {
  api,
  formatDate,
  type Certificate,
  type Education,
  type Experience,
  type Resume as ResumeData,
  type SkillGroup,
} from "../lib/api";
import { intlLocale } from "../i18n";
import type { ResumePageData } from "../lib/pageLoaders";

const shortDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const isPresent = (iso: string) =>
  new Date(iso).getTime() > Date.now() + 1000 * 60 * 60 * 24;

const dateRange = (from: string, to: string, present: string, locale: string) =>
  `${shortDate(from, locale)} — ${isPresent(to) ? present : shortDate(to, locale)}`;

interface TimelineEntry {
  id: number;
  dates: string;
  isCurrent: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  extra?: string | null;
}

function Timeline({
  entries,
  current,
  diploma,
}: {
  entries: TimelineEntry[];
  current: string;
  diploma: string;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="timeline-track relative ml-1 border-l-2">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="relative grid gap-2 pb-9 pl-7 last:pb-0 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:pl-8"
        >
          <span
            aria-label={entry.isCurrent ? current : undefined}
            className={`timeline-marker absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-surface ${
              entry.isCurrent ? "timeline-marker-current" : ""
            }`}
          />
          <div className="flex flex-wrap items-center gap-2 md:block">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate">
              {entry.dates}
            </p>
            {entry.isCurrent && (
              <span className="timeline-current-label inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
                <span className="timeline-current-dot h-1.5 w-1.5 rounded-full" />
                {current}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug text-ink">
              {entry.title}
            </h3>
            {entry.subtitle && (
              <p className="mt-0.5 text-sm font-medium text-slate">
                {entry.subtitle}
              </p>
            )}
            {entry.location && (
              <p className="mt-1 text-xs text-slate">{entry.location}</p>
            )}
            {entry.description && (
              <SeeMoreText
                text={entry.description}
                className="mt-3 text-sm leading-relaxed text-slate"
              />
            )}
            {entry.extra && (
              <a
                href={entry.extra}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline"
              >
                {diploma} <ExternalLink size={13} />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export default function Resume() {
  const { t, i18n } = useTranslation();
  const initialData = useLoaderData() as ResumePageData;
  const [resume, setResume] = useState<ResumeData | null>(initialData.resume);
  const [educations, setEducations] = useState(initialData.educations);
  const [experiences, setExperiences] = useState(initialData.experiences);
  const [skillGroups, setSkillGroups] = useState(initialData.skillGroups);
  const [certificates, setCertificates] = useState(initialData.certificates);
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.resume().catch(() => null),
      api.educations().catch(() => [] as Education[]),
      api.experiences().catch(() => [] as Experience[]),
      api.skills().catch(() => [] as SkillGroup[]),
      api.certificates().catch(() => [] as Certificate[]),
    ])
      .then(([r, e, x, s, c]) => {
        if (active) {
          setResume(r);
          setEducations(e);
          setExperiences(x);
          setSkillGroups(s);
          setCertificates(c);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [i18n.resolvedLanguage]);

  const locale = intlLocale();
  const experienceEntries: TimelineEntry[] = experiences.map((exp) => ({
    id: exp.id,
    dates: dateRange(exp.from_date, exp.to_date, t("common.present"), locale),
    isCurrent: isPresent(exp.to_date),
    title: exp.job,
    subtitle: exp.company,
    location: exp.location ?? undefined,
    description: exp.activity ?? undefined,
  }));

  const educationEntries: TimelineEntry[] = educations.map((edu) => ({
    id: edu.id,
    dates: dateRange(edu.from_date, edu.to_date, t("common.present"), locale),
    isCurrent: isPresent(edu.to_date),
    title: edu.field,
    subtitle: edu.edu_place,
    description: edu.what_learnt,
    extra: edu.certification,
  }));

  return (
    <>
      <SeoHead
        title={t("resume.title")}
        description={resume?.summary || t("resume.profile")}
        pathname="/resume"
      />
      <Layout active="resume">
      <section className="mx-auto max-w-content px-5 pb-10 pt-16 sm:px-6 md:px-8 md:pt-20 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 rounded-[1.75rem] bg-signal/10" />
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-line bg-surface shadow-card md:h-36 md:w-36">
                {resume?.image ? (
                  <img
                    src={resume.image}
                    alt="Maksudbek Dehqonaliyev"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-3xl font-semibold text-signal/60">
                    MD
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">{t("resume.profile")}</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                {t("resume.title")}
              </h1>
              {resume && (resume.location || resume.email) && (
                <p className="mt-2 text-slate">
                  {[resume.location, resume.email].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          {resume?.resume_file && (
            <a
              href={resume.resume_file}
              className="btn btn-secondary self-start md:self-auto"
            >
              <Download size={15} /> {t("resume.downloadPdf")}
            </a>
          )}
        </div>
      </section>

      {loading ? (
        <div className="mx-auto max-w-content space-y-6 px-5 pb-20 sm:px-6 md:px-8 lg:px-10">
          <div className="card space-y-4 p-6 md:p-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-2/3 max-w-xl" />
          </div>
          <div className="card space-y-8 p-6 md:p-8">
            <Skeleton className="h-6 w-40" />
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-full max-w-xl" />
              </div>
            ))}
          </div>
          <div className="card space-y-6 p-6 md:p-8">
            <Skeleton className="h-6 w-28" />
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-content space-y-6 px-5 pb-20 sm:px-6 md:px-8 lg:px-10">
          {resume?.summary && (
            <section className="card p-6 md:p-8">
              <SectionHeading>{t("resume.summary")}</SectionHeading>
              <p className="mt-4 max-w-3xl leading-relaxed text-slate">
                {resume.summary}
              </p>
            </section>
          )}

          {experiences.length > 0 && (
            <section className="card p-6 md:p-8">
              <SectionHeading>{t("resume.experience")}</SectionHeading>
              <div className="mt-6">
                <Timeline
                  entries={experienceEntries}
                  current={t("common.current")}
                  diploma={t("resume.diploma")}
                />
              </div>
            </section>
          )}

          {educations.length > 0 && (
            <section className="card p-6 md:p-8">
              <SectionHeading>{t("resume.education")}</SectionHeading>
              <div className="mt-6">
                <Timeline
                  entries={educationEntries}
                  current={t("common.current")}
                  diploma={t("resume.diploma")}
                />
              </div>
            </section>
          )}

          {skillGroups.length > 0 && (
            <section className="card p-6 md:p-8">
              <SectionHeading>{t("resume.skills")}</SectionHeading>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {skillGroups.map((group) => (
                  <div key={group.name}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-signal">
                      {group.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.skills.map((skill) => (
                        <span key={skill.name} className="tag">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="pt-4">
              <SectionHeading>{t("resume.certificates")}</SectionHeading>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {certificates.map((cert) => (
                  <article
                    key={cert.id}
                    className="card card-interactive flex h-full flex-col p-6"
                  >
                    <div className="flex items-start gap-5">
                      {cert.photo_overview && (
                        <button
                          type="button"
                          onClick={() => setPreview(cert)}
                          aria-label={t("resume.previewCertificate")}
                          className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-muted"
                        >
                          <img
                            src={cert.photo_overview}
                            alt={cert.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="pointer-events-none absolute bottom-1.5 right-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper shadow-md ring-1 ring-paper/50 transition-transform duration-200 group-hover:scale-110">
                            <ZoomIn size={14} />
                          </span>
                        </button>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate">
                          {formatDate(cert.created_at)}
                        </p>
                        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug">
                          {cert.name}
                        </h3>
                        {cert.issued_by && (
                          <p className="mt-1 text-sm text-slate">
                            {cert.issued_by}
                          </p>
                        )}
                      </div>
                    </div>

                    <SeeMoreText
                      text={cert.what_learnt}
                      className="mt-4 text-sm leading-relaxed text-slate"
                    />

                    {cert.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {cert.technologies.map((tech) => (
                          <span key={tech.id} className="tag">
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-5 pt-6">
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline"
                        >
                          {t("resume.viewCredential")} <ExternalLink size={13} />
                        </a>
                      )}
                      {cert.file && (
                        <a
                          href={cert.file}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline"
                        >
                          <Download size={14} /> {t("common.download")}
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {preview && preview.photo_overview && (
        <ImageLightbox
          src={preview.photo_overview}
          alt={preview.name}
          title={preview.name}
          closeLabel={t("common.closePreview")}
          onClose={() => setPreview(null)}
        />
      )}
      </Layout>
    </>
  );
}
