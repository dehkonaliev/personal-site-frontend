import { StrictMode } from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

export default function AppShell() {
  return (
    <StrictMode>
      <ScrollToTop />
      <Outlet />
    </StrictMode>
  );
}
