import { DRAFT_KEY } from "./constants";

export function saveDraft(draft, storage = globalThis.sessionStorage) {
  storage?.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(storage = globalThis.sessionStorage) {
  try {
    const raw = storage?.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.hotelId !== "string" || typeof parsed.roomId !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(storage = globalThis.sessionStorage) {
  storage?.removeItem(DRAFT_KEY);
}
