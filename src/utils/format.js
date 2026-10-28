import { parseISODate } from "./dates";

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDisplayDate(iso) {
  const date = parseISODate(iso);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatPhone(digits) {
  if (!digits || digits.length !== 10) return digits || "";
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
