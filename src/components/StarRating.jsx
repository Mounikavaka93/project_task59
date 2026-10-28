import { Icon } from "./Icons";

export function StarRating({ value, reviews }) {
  return (
    <p className="rating">
      <Icon name="star" size={15} />
      <span>{Number(value).toFixed(1)}</span>
      <span className="sr-only">out of 5</span>
      {typeof reviews === "number" && <span className="rating-count">{reviews} reviews</span>}
    </p>
  );
}
