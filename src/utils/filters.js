import { PRICE_MAX, PRICE_MIN } from "./constants";

const SORTERS = {
  recommended: (a, b) => a.editorialRank - b.editorialRank,
  "price-asc": (a, b) => a.priceFrom - b.priceFrom || a.editorialRank - b.editorialRank,
  "price-desc": (a, b) => b.priceFrom - a.priceFrom || a.editorialRank - b.editorialRank,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
};

export function applyHotelFilters(hotels, criteria = {}) {
  const {
    location = "all",
    minPrice = PRICE_MIN,
    maxPrice = PRICE_MAX,
    minRating = 0,
    sort = "recommended",
  } = criteria;

  const filtered = hotels.filter((hotel) => {
    if (location && location !== "all" && hotel.region !== location) return false;
    if (hotel.priceFrom < minPrice || hotel.priceFrom > maxPrice) return false;
    if (minRating && hotel.rating < Number(minRating)) return false;
    return true;
  });

  const sorter = SORTERS[sort] || SORTERS.recommended;
  return [...filtered].sort(sorter);
}

export function featuredHotels(hotels, count = 3) {
  return [...hotels].sort((a, b) => a.editorialRank - b.editorialRank).slice(0, count);
}
