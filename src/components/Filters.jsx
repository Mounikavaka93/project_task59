import { PRICE_MAX, PRICE_MIN, PRICE_STEP, RATING_FILTERS, SORTS } from "../utils/constants";
import { formatINR } from "../utils/format";

export function Filters({ value, onChange, onClear }) {
  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <aside className="filters" aria-label="Filter stays">
      <div className="filters-head">
        <h2>Filters</h2>
        <button type="button" className="text-button" onClick={onClear}>
          Clear filters
        </button>
      </div>
      <label className="field">
        <span>Minimum nightly rate</span>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={value.minPrice}
          onChange={(event) => {
            const next = Number(event.target.value);
            update({ minPrice: Math.min(next, value.maxPrice) });
          }}
        />
      </label>
      <label className="field">
        <span>Maximum nightly rate</span>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={value.maxPrice}
          onChange={(event) => {
            const next = Number(event.target.value);
            update({ maxPrice: Math.max(next, value.minPrice) });
          }}
        />
      </label>
      <p className="fine">
        {formatINR(value.minPrice)} – {formatINR(value.maxPrice)} starting rate
      </p>
      <label className="field">
        <span>Minimum rating</span>
        <select
          value={String(value.minRating)}
          onChange={(event) => update({ minRating: Number(event.target.value) })}
        >
          {RATING_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sort by</span>
        <select value={value.sort} onChange={(event) => update({ sort: event.target.value })}>
          {SORTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
