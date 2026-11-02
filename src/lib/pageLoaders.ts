import type { LoaderFunctionArgs } from "react-router-dom";
import {
  api,
  type Certificate,
  type Education,
  type Experience,
  type Resume,
  type SkillGroup,
} from "./api";

export const homeLoader = () => api.home();
export const blogLoader = () => api.posts();
export const projectsLoader = () => api.projects();

export async function postLoader({ params }: LoaderFunctionArgs) {
  if (!params.slug) throw new Error("Missing blog post slug.");
  return api.post(params.slug);
}

export async function postStaticPaths() {
  const posts = await api.posts();
  return posts.map((post) => `blog/${post.slug}`);
}

export async function projectLoader({ params }: LoaderFunctionArgs) {
  if (!params.slug) throw new Error("Missing project slug.");
  return api.project(params.slug);
}

export async function projectStaticPaths() {
  const projects = await api.projects();
  return projects.map((project) => `projects/${project.slug}`);
}

export interface ResumePageData {
  resume: Resume | null;
  educations: Education[];
  experiences: Experience[];
  skillGroups: SkillGroup[];
  certificates: Certificate[];
}

async function loadOr<T>(request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export async function resumeLoader(): Promise<ResumePageData> {
  const [resume, educations, experiences, skillGroups, certificates] =
    await Promise.all([
      loadOr(api.resume(), null),
      loadOr(api.educations(), []),
      loadOr(api.experiences(), []),
      loadOr(api.skills(), []),
      loadOr(api.certificates(), []),
    ]);

  return { resume, educations, experiences, skillGroups, certificates };
}
