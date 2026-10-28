import { Link } from "react-router-dom";
import { AMENITY_LABELS } from "../data/amenities";
import { formatINR, plural } from "../utils/format";
import { hotelPath } from "../utils/query";
import { Photo } from "./Photo";
import { StarRating } from "./StarRating";
import { Tilt } from "./Tilt";

export function HotelCard({ hotel, stay, nights = 0, variant = "tile", priority = false }) {
  return (
    <Tilt className="stay-tilt" max={variant === "row" ? 6 : 10}>
    <article className={`stay-card ${variant}`} style={{ animationDelay: "var(--delay, 0ms)" }}>
      <Link className="stay-card-link" to={hotelPath(hotel.id, stay)}>
        <div className="stay-card-media">
          <Photo src={hotel.images[0]} alt="" priority={priority} />
        </div>
        <div className="stay-card-body">
          <div className="stay-card-top">
            <h2>{hotel.name}</h2>
            <StarRating value={hotel.rating} reviews={hotel.reviews} />
          </div>
          <p className="stay-place">
            {hotel.city}, {hotel.region}
          </p>
          <ul className="chip-row">
            {hotel.amenities.slice(0, 3).map((item) => (
              <li key={item}>{AMENITY_LABELS[item]}</li>
            ))}
          </ul>
          <p className="price">
            <strong>{formatINR(hotel.priceFrom)}</strong>
            <span> / night</span>
          </p>
          {nights > 0 && (
            <p className="fine">
              {formatINR(hotel.priceFrom * nights)} for {plural(nights, "night")}, before taxes
            </p>
          )}
        </div>
      </Link>
    </article>
    </Tilt>
  );
}
