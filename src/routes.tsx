import type { RouteRecord } from "vite-react-ssg";
import AppShell from "./components/AppShell";
import Blog from "./pages/Blog";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import {
  blogLoader,
  homeLoader,
  postLoader,
  postStaticPaths,
  projectLoader,
  projectStaticPaths,
  projectsLoader,
  resumeLoader,
} from "./lib/pageLoaders";
import AdminPanel from "./pages/admin/AdminPanel";
import { ADMIN_PATH } from "./lib/adminApi";

export const routes: RouteRecord[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Home />, loader: homeLoader, entry: "src/pages/Home.tsx" },
      {
        path: "resume",
        element: <Resume />,
        loader: resumeLoader,
        entry: "src/pages/Resume.tsx",
      },
      {
        path: "projects",
        element: <Projects />,
        loader: projectsLoader,
        entry: "src/pages/Projects.tsx",
      },
      {
        path: "projects/:slug",
        element: <ProjectDetail />,
        loader: projectLoader,
        getStaticPaths: projectStaticPaths,
        entry: "src/pages/ProjectDetail.tsx",
      },
      {
        path: "blog",
        element: <Blog />,
        loader: blogLoader,
        entry: "src/pages/Blog.tsx",
      },
      {
        path: "blog/:slug",
        element: <PostDetail />,
        loader: postLoader,
        getStaticPaths: postStaticPaths,
        entry: "src/pages/PostDetail.tsx",
      },
      { path: `${ADMIN_PATH}/*`, element: <AdminPanel /> },
    ],
  },
];
