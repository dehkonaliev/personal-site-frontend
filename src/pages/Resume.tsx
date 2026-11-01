import { useEffect, useState, type ReactNode } from "react";
import Layout from "../components/Layout";
import SeeMoreText from "../components/SeeMoreText";
import Skeleton from "../components/Skeleton";
import { Download, ExternalLink } from "lucide-react";
import {
  api,
  formatDate,
  type Certificate,
  type Education,
  type Experience,
  type Resume as ResumeData,
  type SkillGroup,
} from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const isPresent = (iso: string) =>
  new Date(iso).getTime() > Date.now() + 1000 * 60 * 60 * 24;

const dateRange = (from: string, to: string) =>
  `${shortDate(from)} — ${isPresent(to) ? "Present" : shortDate(to)}`;

interface TimelineEntry {
  id: number;
  dates: string;
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  extra?: string | null;
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="relative ml-1 space-y-9 border-l border-line pl-7">
      {entries.map((entry) => (
        <div key={entry.id} className="relative">
          <span className="absolute -left-[34px] top-1.5 h-3 w-3 rounded-full border-2 border-surface bg-signal ring-4 ring-surface" />
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate">
            {entry.dates}
          </p>
          <h3 className="mt-1.5 font-medium text-ink">{entry.title}</h3>
          {entry.subtitle && (
            <p className="text-sm text-slate">{entry.subtitle}</p>
          )}
          {entry.location && (
            <p className="mt-0.5 text-xs text-slate">{entry.location}</p>
          )}
          {entry.description && (
            <SeeMoreText
              text={entry.description}
              className="mt-2 text-sm leading-relaxed text-slate"
            />
          )}
          {entry.extra && (
            <a
              href={entry.extra}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline"
            >
              Diploma <ExternalLink size={13} />
            </a>
          )}
        </div>
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
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentTitle("Resume");

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
  }, []);

  const experienceEntries: TimelineEntry[] = experiences.map((exp) => ({
    id: exp.id,
    dates: dateRange(exp.from_date, exp.to_date),
    title: exp.job,
    subtitle: exp.company,
    location: exp.location ?? undefined,
    description: exp.activity ?? undefined,
  }));

  const educationEntries: TimelineEntry[] = educations.map((edu) => ({
    id: edu.id,
    dates: dateRange(edu.from_date, edu.to_date),
    title: edu.field,
    subtitle: edu.edu_place,
    description: edu.what_learnt,
    extra: edu.certification,
  }));

  return (
    <Layout active="Resume">
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
              <p className="eyebrow mb-3">Profile</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Resume
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
              <Download size={15} /> Download PDF
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
              <SectionHeading>Summary</SectionHeading>
              <p className="mt-4 max-w-3xl leading-relaxed text-slate">
                {resume.summary}
              </p>
            </section>
          )}

          {experiences.length > 0 && (
            <section className="card p-6 md:p-8">
              <SectionHeading>Experience</SectionHeading>
              <div className="mt-6">
                <Timeline entries={experienceEntries} />
              </div>
            </section>
          )}

          {educations.length > 0 && (
            <section className="card p-6 md:p-8">
              <SectionHeading>Education</SectionHeading>
              <div className="mt-6">
                <Timeline entries={educationEntries} />
              </div>
            </section>
          )}

          {skillGroups.length > 0 && (
            <section className="card p-6 md:p-8">
              <SectionHeading>Skills</SectionHeading>
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
              <SectionHeading>Certificates</SectionHeading>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {certificates.map((cert) => (
                  <article
                    key={cert.id}
                    className="card card-interactive flex h-full flex-col p-6"
                  >
                    <div className="flex items-start gap-5">
                      {cert.photo_overview && (
                        <img
                          src={cert.photo_overview}
                          alt={cert.name}
                          width={96}
                          height={96}
                          className="h-24 w-24 shrink-0 rounded-xl border border-line object-cover"
                        />
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
                          View credential <ExternalLink size={13} />
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
                          <Download size={14} /> Download
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
    </Layout>
  );
}
