import { useEffect } from "react";
import { BRAND } from "../data/brand";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND.name}` : `${BRAND.name} — Hotel stays`;
  }, [title]);
}
