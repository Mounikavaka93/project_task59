export function parseISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return formatISODate(new Date());
}

export function addDaysISO(iso, days) {
  const date = parseISODate(iso);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function nightsBetween(checkIn, checkOut) {
  const start = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}
