import { MAX_ROOMS, TAX_RATE } from "./constants";

export function calculateQuote({ pricePerNight, nights, rooms }) {
  const safeNights = Math.max(0, Number(nights) || 0);
  const safeRooms = Math.max(0, Number(rooms) || 0);
  const subtotal = pricePerNight * safeNights * safeRooms;
  const taxes = Math.round(subtotal * TAX_RATE);
  return {
    pricePerNight,
    nights: safeNights,
    rooms: safeRooms,
    subtotal,
    taxes,
    total: subtotal + taxes,
  };
}

export function minimumRooms(guests, capacity) {
  const beds = Math.max(1, Number(capacity) || 1);
  const people = Math.max(1, Number(guests) || 1);
  return Math.max(1, Math.ceil(people / beds));
}

export function roomFitsGuests(guests, capacity) {
  return minimumRooms(guests, capacity) <= MAX_ROOMS;
}

export function clampRoomCount(requested, guests, capacity) {
  const minimum = minimumRooms(guests, capacity);
  const numeric = Number(requested);
  const starting = Number.isInteger(numeric) ? numeric : minimum;
  return Math.min(MAX_ROOMS, Math.max(minimum, starting));
}
