import { describe, expect, test } from "vitest";
import { AMENITY_LABELS } from "../data/amenities";
import { HOTELS } from "../data/hotels";
import { LOCATIONS } from "../data/locations";
import { buildBooking, createBookingId, withCancellation } from "../utils/booking";
import { MAX_NIGHTS, PRICE_MAX, PRICE_MIN, STORAGE_KEY } from "../utils/constants";
import { addDaysISO, nightsBetween, todayISO } from "../utils/dates";
import { applyHotelFilters } from "../utils/filters";
import { calculateQuote, clampRoomCount, minimumRooms } from "../utils/pricing";
import { readFilters, writeFilters } from "../utils/query";
import { loadBookings, saveBookings } from "../utils/storage";
import { validateGuest, validateStay } from "../utils/validation";

const sampleHotels = [
  { id: "a", region: "Goa", priceFrom: 5000, rating: 4.2, reviews: 10, editorialRank: 2 },
  { id: "b", region: "Goa", priceFrom: 9000, rating: 4.8, reviews: 20, editorialRank: 1 },
  { id: "c", region: "Delhi", priceFrom: 7000, rating: 4.6, reviews: 5, editorialRank: 3 },
];

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

describe("pricing", () => {
  test("adds 12 percent tax rounded to the rupee", () => {
    expect(calculateQuote({ pricePerNight: 12400, nights: 3, rooms: 1 })).toEqual({
      pricePerNight: 12400,
      nights: 3,
      rooms: 1,
      subtotal: 37200,
      taxes: 4464,
      total: 41664,
    });
    expect(calculateQuote({ pricePerNight: 10, nights: 1, rooms: 1 }).taxes).toBe(1);
  });

  test("counts the rooms needed for the guest group", () => {
    expect(minimumRooms(5, 2)).toBe(3);
    expect(minimumRooms(4, 4)).toBe(1);
    expect(minimumRooms(1, 2)).toBe(1);
    expect(clampRoomCount(1, 5, 2)).toBe(3);
    expect(clampRoomCount(9, 2, 2)).toBe(4);
  });
});

describe("stay rules", () => {
  const checkIn = addDaysISO(todayISO(), 4);
  const checkOut = addDaysISO(todayISO(), 7);

  test("accepts a normal stay and rejects bad dates", () => {
    expect(validateStay({ location: "Goa", checkIn, checkOut, guests: 2 })).toEqual({});
    expect(validateStay({ location: "Goa", checkIn: "", checkOut, guests: 2 }).checkIn).toMatch(/check-in/i);
    expect(
      validateStay({ location: "Goa", checkIn: addDaysISO(todayISO(), -1), checkOut, guests: 2 }).checkIn
    ).toMatch(/past/i);
    expect(validateStay({ location: "Goa", checkIn, checkOut: checkIn, guests: 2 }).checkOut).toMatch(/after/i);
    expect(
      validateStay({
        location: "Goa",
        checkIn,
        checkOut: addDaysISO(checkIn, MAX_NIGHTS + 1),
        guests: 2,
      }).checkOut
    ).toMatch(/30 nights/i);
    expect(nightsBetween(checkIn, checkOut)).toBe(3);
  });

  test("checks guest contact details", () => {
    expect(validateGuest({ name: "Asha Menon", email: "asha@example.com", phone: "98765 43210" })).toEqual({});
    expect(validateGuest({ name: "A", email: "asha@", phone: "123" }).name).toBeTruthy();
    expect(validateGuest({ name: "Asha Menon", email: "asha@", phone: "9876543210" }).email).toMatch(/email/i);
    expect(validateGuest({ name: "Asha Menon", email: "asha@example.com", phone: "987654321" }).phone).toMatch(/10-digit/);
  });
});

describe("filters and query", () => {
  test("filters by destination, price, and rating, then sorts", () => {
    const goa = applyHotelFilters(sampleHotels, { location: "Goa" });
    expect(goa.map((hotel) => hotel.id)).toEqual(["b", "a"]);
    expect(applyHotelFilters(sampleHotels, { minRating: 4.5 }).map((hotel) => hotel.id)).toEqual(["b", "c"]);
    expect(applyHotelFilters(sampleHotels, { maxPrice: 6000 }).map((hotel) => hotel.id)).toEqual(["a"]);
    expect(applyHotelFilters(sampleHotels, { sort: "price-desc" }).map((hotel) => hotel.id)).toEqual(["b", "c", "a"]);
  });

  test("uses the full price range when the url omits it", () => {
    expect(readFilters(new URLSearchParams("location=Goa"))).toEqual({
      minPrice: PRICE_MIN,
      maxPrice: PRICE_MAX,
      minRating: 0,
      sort: "recommended",
    });
  });

  test("reads price bounds back into a safe range", () => {
    const params = new URLSearchParams("minPrice=18000&maxPrice=5000&rating=4.5&sort=price-asc");
    expect(readFilters(params)).toEqual({
      minPrice: 5000,
      maxPrice: 18000,
      minRating: 4.5,
      sort: "price-asc",
    });
    const cleared = new URLSearchParams(params);
    writeFilters(cleared, { minPrice: PRICE_MIN, maxPrice: PRICE_MAX, minRating: 0, sort: "recommended" });
    expect(cleared.has("minPrice")).toBe(false);
    expect(cleared.has("rating")).toBe(false);
  });
});

describe("bookings storage", () => {
  test("builds a booking and ignores corrupt saved rows", () => {
    const hotel = HOTELS[0];
    const room = hotel.rooms[0];
    const checkIn = addDaysISO(todayISO(), 6);
    const booking = buildBooking({
      hotel,
      room,
      stay: { location: hotel.region, checkIn, checkOut: addDaysISO(checkIn, 2), guests: 2 },
      guest: { name: "Asha Menon", email: "asha@example.com", phone: "(98765) 43210", requests: "  Late arrival  " },
      rooms: 1,
    });
    expect(booking.id).toMatch(/^ML-[A-Z2-9]{6}$/);
    expect(booking.phone).toBe("9876543210");
    expect(booking.requests).toBe("Late arrival");
    expect(booking.total).toBe(calculateQuote({ pricePerNight: room.price, nights: 2, rooms: 1 }).total);
    expect(createBookingId()).toMatch(/^ML-/);

    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify([booking, { id: "bad" }, "nope"]),
    });
    expect(loadBookings(storage)).toEqual([booking]);
    expect(loadBookings(memoryStorage({ [STORAGE_KEY]: "{" }))).toEqual([]);

    const cancelled = withCancellation([booking], booking.id);
    expect(cancelled[0].status).toBe("cancelled");
    expect(withCancellation(cancelled, booking.id)[0].status).toBe("cancelled");
    saveBookings(cancelled, storage);
    expect(loadBookings(storage)[0].status).toBe("cancelled");
  });

  test("refuses an incomplete booking", () => {
    const hotel = HOTELS[0];
    expect(() =>
      buildBooking({
        hotel,
        room: hotel.rooms[0],
        stay: { location: "Goa", checkIn: todayISO(), checkOut: todayISO(), guests: 2 },
        guest: { name: "Asha Menon", email: "asha@example.com", phone: "9876543210" },
        rooms: 1,
      })
    ).toThrow(/incomplete/i);
  });
});

describe("hotel catalog", () => {
  test("regions, prices, and amenities stay consistent", () => {
    const regions = new Set(LOCATIONS.map((item) => item.value));
    expect(HOTELS.length).toBeGreaterThanOrEqual(8);
    for (const hotel of HOTELS) {
      expect(regions.has(hotel.region)).toBe(true);
      expect(hotel.priceFrom).toBe(Math.min(...hotel.rooms.map((room) => room.price)));
      expect(hotel.images.length).toBeGreaterThanOrEqual(3);
      expect(hotel.rooms.length).toBeGreaterThanOrEqual(2);
      for (const amenity of hotel.amenities) {
        expect(AMENITY_LABELS[amenity]).toBeTruthy();
      }
    }
  });
});
