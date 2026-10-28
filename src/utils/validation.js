import { LOCATIONS } from "../data/locations";
import { MAX_GUESTS, MAX_NIGHTS, MAX_REQUEST_LENGTH } from "./constants";
import { addDaysISO, nightsBetween, parseISODate, todayISO } from "./dates";

const LOCATION_VALUES = new Set(LOCATIONS.map((item) => item.value));

export function validateStay({ location = "all", checkIn, checkOut, guests }) {
  const errors = {};
  const today = todayISO();
  const horizon = addDaysISO(today, 365);

  if (!location || !LOCATION_VALUES.has(location)) {
    errors.location = "Choose a destination.";
  }

  if (!checkIn) {
    errors.checkIn = "Choose a check-in date.";
  } else if (!parseISODate(checkIn)) {
    errors.checkIn = "Enter a valid check-in date.";
  } else if (checkIn < today) {
    errors.checkIn = "Check-in cannot be in the past.";
  } else if (checkIn > horizon) {
    errors.checkIn = "Choose a check-in within the next year.";
  }

  if (!checkOut) {
    errors.checkOut = "Choose a check-out date.";
  } else if (!parseISODate(checkOut)) {
    errors.checkOut = "Enter a valid check-out date.";
  } else if (!errors.checkIn && checkOut <= checkIn) {
    errors.checkOut = "Check-out must be after check-in.";
  } else if (!errors.checkIn && nightsBetween(checkIn, checkOut) > MAX_NIGHTS) {
    errors.checkOut = `Stays can be up to ${MAX_NIGHTS} nights.`;
  }

  const count = Number(guests);
  if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) {
    errors.guests = `Guests must be between 1 and ${MAX_GUESTS}.`;
  }

  return errors;
}

export function validateGuest({ name, email, phone, requests = "" }) {
  const errors = {};
  const trimmedName = (name || "").trim();
  const trimmedEmail = (email || "").trim();
  const digits = (phone || "").replace(/\D/g, "");
  const note = (requests || "").trim();

  if (trimmedName.length < 2) {
    errors.name = "Enter the guest's full name.";
  } else if (!/^[a-zA-Z][a-zA-Z .'-]{1,60}$/.test(trimmedName)) {
    errors.name = "Use letters in the guest name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (digits.length !== 10) {
    errors.phone = "Enter a 10-digit mobile number.";
  }

  if (note.length > MAX_REQUEST_LENGTH) {
    errors.requests = `Keep requests to ${MAX_REQUEST_LENGTH} characters.`;
  }

  return errors;
}
