import { LOCATIONS } from "../data/locations";
import { MAX_GUESTS, PRICE_MAX, PRICE_MIN, RATING_FILTERS, SORTS } from "./constants";

const LOCATION_VALUES = new Set(LOCATIONS.map((item) => item.value));
const SORT_VALUES = new Set(SORTS.map((item) => item.value));
const RATING_VALUES = new Set(RATING_FILTERS.map((item) => item.value));

function clampPrice(value, fallback) {
  if (value === null || value === "") return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, numeric));
}

export function readStay(params) {
  const guests = Number(params.get("guests"));
  const location = params.get("location") || "all";
  return {
    location: LOCATION_VALUES.has(location) ? location : "all",
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    guests: Number.isInteger(guests) && guests >= 1 && guests <= MAX_GUESTS ? guests : 2,
  };
}

export function writeStay(params, stay) {
  if (!stay.location || stay.location === "all") params.delete("location");
  else params.set("location", stay.location);
  params.set("checkIn", stay.checkIn);
  params.set("checkOut", stay.checkOut);
  params.set("guests", String(stay.guests));
}

export function readFilters(params) {
  let minPrice = clampPrice(params.get("minPrice"), PRICE_MIN);
  let maxPrice = clampPrice(params.get("maxPrice"), PRICE_MAX);
  if (minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  const rating = Number(params.get("rating") || 0);
  const sort = params.get("sort") || "recommended";
  return {
    minPrice,
    maxPrice,
    minRating: RATING_VALUES.has(rating) ? rating : 0,
    sort: SORT_VALUES.has(sort) ? sort : "recommended",
  };
}

export function writeFilters(params, filters) {
  if (filters.minPrice === PRICE_MIN) params.delete("minPrice");
  else params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice === PRICE_MAX) params.delete("maxPrice");
  else params.set("maxPrice", String(filters.maxPrice));
  if (!filters.minRating) params.delete("rating");
  else params.set("rating", String(filters.minRating));
  if (!filters.sort || filters.sort === "recommended") params.delete("sort");
  else params.set("sort", filters.sort);
}

export function staySearch(stay = {}) {
  const params = new URLSearchParams();
  if (stay.location && stay.location !== "all") params.set("location", stay.location);
  if (stay.checkIn) params.set("checkIn", stay.checkIn);
  if (stay.checkOut) params.set("checkOut", stay.checkOut);
  if (stay.guests) params.set("guests", String(stay.guests));
  return params.toString();
}

export function hotelPath(hotelId, stay) {
  const query = staySearch(stay);
  return query ? `/hotels/${hotelId}?${query}` : `/hotels/${hotelId}`;
}
