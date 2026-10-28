import { STORAGE_KEY } from "./constants";

function canStore(value) {
  return (
    value &&
    typeof value.id === "string" &&
    typeof value.hotelId === "string" &&
    typeof value.hotelName === "string" &&
    typeof value.roomName === "string" &&
    typeof value.checkIn === "string" &&
    typeof value.checkOut === "string" &&
    typeof value.total === "number" &&
    (value.status === "confirmed" || value.status === "cancelled")
  );
}

export function loadBookings(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(canStore);
  } catch {
    return [];
  }
}

export function saveBookings(bookings, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Quota or private-mode failures leave the in-memory list usable for this session.
  }
}
