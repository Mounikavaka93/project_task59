import { BRAND } from "../data/brand";
import { MAX_REQUEST_LENGTH, MAX_ROOMS } from "./constants";
import { nightsBetween } from "./dates";
import { calculateQuote, minimumRooms } from "./pricing";
import { validateGuest, validateStay } from "./validation";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }
  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function createBookingId() {
  let id = BRAND.idPrefix;
  for (const byte of randomBytes(6)) {
    id += ALPHABET[byte % ALPHABET.length];
  }
  return id;
}

export function buildBooking({ hotel, room, stay, guest, rooms }) {
  const stayErrors = validateStay(stay);
  const guestErrors = validateGuest(guest);
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const needed = minimumRooms(stay.guests, room.capacity);
  if (
    Object.keys(stayErrors).length > 0 ||
    Object.keys(guestErrors).length > 0 ||
    nights < 1 ||
    rooms < needed ||
    rooms > MAX_ROOMS
  ) {
    throw new Error("Booking details are incomplete.");
  }

  const quote = calculateQuote({
    pricePerNight: room.price,
    nights,
    rooms,
  });

  return {
    id: createBookingId(),
    hotelId: hotel.id,
    hotelName: hotel.name,
    region: hotel.region,
    city: hotel.city,
    image: hotel.images[0],
    roomId: room.id,
    roomName: room.name,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    guests: stay.guests,
    rooms,
    guestName: guest.name.trim(),
    email: guest.email.trim(),
    phone: guest.phone.replace(/\D/g, ""),
    requests: (guest.requests || "").trim().slice(0, MAX_REQUEST_LENGTH),
    pricePerNight: quote.pricePerNight,
    nights: quote.nights,
    subtotal: quote.subtotal,
    taxes: quote.taxes,
    total: quote.total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
}

export function withCancellation(bookings, id) {
  const cancelledAt = new Date().toISOString();
  return bookings.map((booking) =>
    booking.id === id && booking.status === "confirmed"
      ? { ...booking, status: "cancelled", cancelledAt }
      : booking
  );
}
