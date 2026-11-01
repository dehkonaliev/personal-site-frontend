import { useEffect } from "react";

export const SITE_NAME = "Maksudbek Dehqonaliyev";

export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
