import { formatINR, plural } from "../utils/format";

export function RoomOption({ room, nights, selected, onSelect }) {
  const stayTotal = nights > 0 ? room.price * nights : 0;
  return (
    <button
      type="button"
      className={selected ? "room is-selected" : "room"}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="room-copy">
        <span className="room-name">{room.name}</span>
        <span className="room-meta">
          {room.beds} · {room.size} · Sleeps {room.capacity}
        </span>
        <span className="fine">{room.description}</span>
      </span>
      <span className="room-price">
        <strong>{formatINR(room.price)}</strong>
        <small>per night</small>
        {nights > 0 && (
          <small>
            {formatINR(stayTotal)} for {plural(nights, "night")}
          </small>
        )}
      </span>
    </button>
  );
}
