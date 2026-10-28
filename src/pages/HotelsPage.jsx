import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Filters } from "../components/Filters";
import { HotelCard } from "../components/HotelCard";
import { SearchForm } from "../components/SearchForm";
import { HOTELS } from "../data/hotels";
import { usePageTitle } from "../hooks/usePageTitle";
import { PRICE_MAX, PRICE_MIN } from "../utils/constants";
import { nightsBetween } from "../utils/dates";
import { applyHotelFilters } from "../utils/filters";
import { formatDisplayDate, plural } from "../utils/format";
import { readFilters, readStay, writeFilters, writeStay } from "../utils/query";
import { validateStay } from "../utils/validation";

const CLEARED_FILTERS = {
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  minRating: 0,
  sort: "recommended",
};

export function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stay = readStay(searchParams);
  const filters = readFilters(searchParams);
  const results = useMemo(
    () => applyHotelFilters(HOTELS, { location: stay.location, ...filters }),
    [stay.location, filters]
  );
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const stayErrors = stay.checkIn || stay.checkOut ? validateStay(stay) : {};
  const validStay = Object.keys(stayErrors).length === 0 && nights > 0;
  const title = stay.location === "all" ? "All stays" : `Stays in ${stay.location}`;
  usePageTitle(title);

  const updateFilters = (next) => {
    const params = new URLSearchParams(searchParams);
    writeFilters(params, next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="page">
      <div className="shell">
        <header className="page-intro">
          <h1>{title}</h1>
          <p className="lede">
            {validStay
              ? `${formatDisplayDate(stay.checkIn)} – ${formatDisplayDate(stay.checkOut)} · ${plural(nights, "night")} · ${plural(stay.guests, "guest")}`
              : "Add dates to see what a stay would cost."}
          </p>
        </header>
        <SearchForm
          initial={stay}
          tone="band"
          onSubmit={(values) => {
            const params = new URLSearchParams(searchParams);
            writeStay(params, values);
            setSearchParams(params);
          }}
        />
        <div className="listing-layout">
          <Filters value={filters} onChange={updateFilters} onClear={() => updateFilters(CLEARED_FILTERS)} />
          <section>
            <p className="fine results-count" aria-live="polite">
              {plural(results.length, "stay")} found
            </p>
            {results.length === 0 ? (
              <EmptyState
                title="No stays match these filters."
                body="Widen the price range or clear the rating filter."
                action={
                  <button type="button" className="btn btn-ghost" onClick={() => updateFilters(CLEARED_FILTERS)}>
                    Clear filters
                  </button>
                }
              />
            ) : (
              <div className="results-grid" role="list" aria-label="Hotel results">
                {results.map((hotel, index) => (
                  <div role="listitem" key={hotel.id} style={{ "--delay": `${index * 40}ms` }}>
                    <HotelCard hotel={hotel} stay={stay} nights={validStay ? nights : 0} variant="row" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
