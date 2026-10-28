import { TAX_RATE } from "../utils/constants";
import { formatINR, plural } from "../utils/format";

export function PriceBreakdown({ quote }) {
  const taxPercent = Math.round(TAX_RATE * 100);
  return (
    <div className="breakdown">
      <div>
        <span>
          {formatINR(quote.pricePerNight)} × {plural(quote.nights, "night")} × {plural(quote.rooms, "room")}
        </span>
        <span>{formatINR(quote.subtotal)}</span>
      </div>
      <div>
        <span>Taxes ({taxPercent}%)</span>
        <span>{formatINR(quote.taxes)}</span>
      </div>
      <div className="breakdown-total">
        <span>Total</span>
        <strong data-testid="stay-total">{formatINR(quote.total)}</strong>
      </div>
    </div>
  );
}
