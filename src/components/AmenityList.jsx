import { AMENITY_LABELS } from "../data/amenities";
import { Icon } from "./Icons";

export function AmenityList({ items }) {
  return (
    <ul className="amenities" aria-label="Amenities">
      {items.map((item) => (
        <li key={item}>
          <Icon name={item} />
          <span>{AMENITY_LABELS[item] || item}</span>
        </li>
      ))}
    </ul>
  );
}
