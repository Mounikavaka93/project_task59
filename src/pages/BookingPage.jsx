import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Photo } from "../components/Photo";
import { PriceBreakdown } from "../components/PriceBreakdown";
import { useAuth } from "../context/AuthContext";
import { getHotelById } from "../data/hotels";
import { usePageTitle } from "../hooks/usePageTitle";
import { MAX_REQUEST_LENGTH, MAX_ROOMS } from "../utils/constants";
import { nightsBetween } from "../utils/dates";
import { saveDraft } from "../utils/draft";
import { formatDisplayDate, formatINR, plural } from "../utils/format";
import { calculateQuote, clampRoomCount, minimumRooms } from "../utils/pricing";
import { hotelPath, readStay } from "../utils/query";
import { validateGuest, validateStay } from "../utils/validation";
import { NotFoundPage } from "./NotFoundPage";

function GuestField({ id, label, error, children }) {
  return (
    <div className={error ? "field has-error" : "field"}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingPage() {
  const { hotelId } = useParams();
  const hotel = getHotelById(hotelId);
  const [searchParams, setSearchParams] = useSearchParams();
  const stay = readStay(searchParams);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guest, setGuest] = useState({ name: "", email: "", phone: "", requests: "" });
  const [errors, setErrors] = useState({});

  usePageTitle("Guest details");

  useEffect(() => {
    if (!user) return;
    setGuest((current) => ({
      ...current,
      name: current.name || user.name,
      email: user.email,
      phone: current.phone || user.phone,
    }));
  }, [user]);

  if (!hotel) {
    return <NotFoundPage title="We couldn't find that stay." body="Choose another hotel to continue." />;
  }

  const room = hotel.rooms.find((item) => item.id === searchParams.get("room"));
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const stayErrors = validateStay(stay);
  if (!room || nights < 1 || Object.keys(stayErrors).length > 0) {
    return <Navigate to={hotelPath(hotel.id, stay)} replace />;
  }

  const needed = minimumRooms(stay.guests, room.capacity);
  const rooms = clampRoomCount(searchParams.get("rooms"), stay.guests, room.capacity);
  const quote = calculateQuote({ pricePerNight: room.price, nights, rooms });

  const setRooms = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set("rooms", String(next));
    setSearchParams(params, { replace: true });
  };

  const updateGuest = (key) => (event) => {
    const value = event.target.value;
    setGuest((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const nextGuest = user ? { ...guest, email: user.email } : guest;
    const nextErrors = validateGuest(nextGuest);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = ["name", "email", "phone", "requests"].find((field) => nextErrors[field]);
      document.getElementById(first)?.focus();
      return;
    }
    saveDraft({
      hotelId: hotel.id,
      roomId: room.id,
      stay,
      guest: {
        name: nextGuest.name.trim(),
        email: user ? user.email : nextGuest.email.trim(),
        phone: nextGuest.phone,
        requests: nextGuest.requests,
      },
      rooms,
    });
    const payPath = `/pay/${hotel.id}`;
    if (!user) {
      navigate(`/sign-in?next=${encodeURIComponent(payPath)}`);
      return;
    }
    navigate(payPath);
  };

  return (
    <div className="page">
      <div className="shell">
        <header className="page-intro">
          <h1>Guest details</h1>
          <p className="lede">Next is payment. The booking is saved only after the stay is paid.</p>
        </header>
        <div className="split">
          <form id="booking-form" className="booking-form" onSubmit={onSubmit} noValidate>
            <GuestField id="name" label="Full name" error={errors.name}>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={guest.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                onChange={updateGuest("name")}
              />
            </GuestField>
            <GuestField id="email" label="Email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={user ? user.email : guest.email}
                readOnly={Boolean(user)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                onChange={updateGuest("email")}
              />
            </GuestField>
            <GuestField id="phone" label="Mobile number" error={errors.phone}>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile"
                value={guest.phone}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                onChange={updateGuest("phone")}
              />
            </GuestField>
            <GuestField id="requests" label="Requests" error={errors.requests}>
              <textarea
                id="requests"
                name="requests"
                rows={4}
                maxLength={MAX_REQUEST_LENGTH}
                value={guest.requests}
                aria-invalid={Boolean(errors.requests)}
                aria-describedby={errors.requests ? "requests-error" : undefined}
                onChange={updateGuest("requests")}
              />
              <span className="fine">
                {guest.requests.length}/{MAX_REQUEST_LENGTH}. Optional.
              </span>
            </GuestField>
            <button type="submit" className="btn btn-primary">
              Continue to payment
            </button>
          </form>
          <aside className="summary">
            <div className="summary-media">
              <Photo src={hotel.images[0]} alt="" />
            </div>
            <div>
              <h2>{hotel.name}</h2>
              <p className="stay-place">
                {hotel.city}, {hotel.region}
              </p>
            </div>
            <p>
              <strong>{room.name}</strong>
              <br />
              {formatDisplayDate(stay.checkIn)} – {formatDisplayDate(stay.checkOut)}
              <br />
              {plural(stay.guests, "guest")}
            </p>
            <div role="group" aria-label="Number of rooms" aria-describedby="room-help">
              <div className="stepper">
                <button
                  type="button"
                  aria-label="Remove a room"
                  disabled={rooms <= needed}
                  onClick={() => setRooms(Math.max(needed, rooms - 1))}
                >
                  −
                </button>
                <strong>{rooms}</strong>
                <button
                  type="button"
                  aria-label="Add a room"
                  disabled={rooms >= MAX_ROOMS}
                  onClick={() => setRooms(Math.min(MAX_ROOMS, rooms + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <p id="room-help" className="fine">
              At least {plural(needed, "room")} for {plural(stay.guests, "guest")} in this room type.
              {rooms > 1 ? ` ${formatINR(room.price)} per room each night.` : ""}
            </p>
            <div aria-live="polite">
              <PriceBreakdown quote={quote} />
            </div>
            <p className="fine">Taxes are 12% of the room total. You will pay this amount on the next step.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
