import './index.css'
import './i18n'
import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";

export const createRoot = ViteReactSSG({ routes });
