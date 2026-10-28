import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Photo } from "../components/Photo";
import { PriceBreakdown } from "../components/PriceBreakdown";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../context/BookingContext";
import { getHotelById } from "../data/hotels";
import { usePageTitle } from "../hooks/usePageTitle";
import { buildBooking } from "../utils/booking";
import { DEMO_CARD } from "../utils/constants";
import { nightsBetween } from "../utils/dates";
import { clearDraft, loadDraft } from "../utils/draft";
import { formatDisplayDate, formatINR, plural } from "../utils/format";
import { cardDigits, formatCardNumber, formatExpiry, validatePayment } from "../utils/payment";
import { calculateQuote } from "../utils/pricing";

function Field({ id, label, error, children }) {
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

export function PaymentPage() {
  const { hotelId } = useParams();
  const hotel = getHotelById(hotelId);
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const navigate = useNavigate();
  const draft = loadDraft();
  const [card, setCard] = useState({
    name: user?.name || DEMO_CARD.name,
    number: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const lock = useRef(false);

  usePageTitle("Payment");

  if (!user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(`/pay/${hotelId}`)}`} replace />;
  }

  const room = hotel?.rooms.find((item) => item.id === draft?.roomId);
  const stay = draft?.stay;
  const nights = stay ? nightsBetween(stay.checkIn, stay.checkOut) : 0;
  const ready = Boolean(hotel && room && draft?.hotelId === hotel.id && nights > 0 && draft.guest);

  if (!ready) {
    return (
      <div className="page">
        <div className="shell narrow empty">
          <h1>Nothing to pay yet</h1>
          <p>Choose a room and enter guest details before payment.</p>
          <Link to="/hotels" className="btn btn-primary">
            Browse stays
          </Link>
        </div>
      </div>
    );
  }

  const quote = calculateQuote({ pricePerNight: room.price, nights, rooms: draft.rooms });

  const update = (key, format) => (event) => {
    const value = format ? format(event.target.value) : event.target.value;
    setCard((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key === "name" ? "cardName" : key]: undefined }));
  };

  const fillDemo = () => {
    setCard({
      name: DEMO_CARD.name,
      number: formatCardNumber(DEMO_CARD.number),
      expiry: DEMO_CARD.expiry,
      cvv: DEMO_CARD.cvv,
    });
    setErrors({});
    setFormError("");
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validatePayment({
      name: card.name,
      number: card.number,
      expiry: card.expiry,
      cvv: card.cvv,
    });
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      const first = ["card-name", "card-number", "card-expiry", "card-cvv"].find((id) => {
        const key = { "card-name": "cardName", "card-number": "number", "card-expiry": "expiry", "card-cvv": "cvv" }[id];
        return nextErrors[key];
      });
      document.getElementById(first)?.focus();
      return;
    }
    if (lock.current) return;
    lock.current = true;
    try {
      const booking = buildBooking({
        hotel,
        room,
        stay,
        guest: { ...draft.guest, email: user.email },
        rooms: draft.rooms,
      });
      const paid = {
        ...booking,
        payment: {
          last4: cardDigits(card.number).slice(-4),
          paidAt: new Date().toISOString(),
        },
      };
      addBooking(paid);
      clearDraft();
      navigate(`/booked/${paid.id}`, { replace: true });
    } catch {
      lock.current = false;
      setFormError("We couldn't save this booking. Go back and check the stay details.");
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <header className="page-intro">
          <h1>Payment</h1>
          <p className="lede">
            Paying as {user.name} · {user.email}. This is a demo card. Nothing is charged.
          </p>
        </header>
        <div className="split">
          <form className="booking-form" onSubmit={onSubmit} noValidate>
            {formError && (
              <p className="field-error" role="alert">
                {formError}
              </p>
            )}
            <Field id="card-name" label="Name on card" error={errors.cardName}>
              <input id="card-name" name="card-name" autoComplete="cc-name" value={card.name} onChange={update("name")} />
            </Field>
            <Field id="card-number" label="Card number" error={errors.number}>
              <input
                id="card-number"
                name="card-number"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={update("number", formatCardNumber)}
              />
            </Field>
            <div className="card-row">
              <Field id="card-expiry" label="Expiry" error={errors.expiry}>
                <input
                  id="card-expiry"
                  name="card-expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={update("expiry", formatExpiry)}
                />
              </Field>
              <Field id="card-cvv" label="CVV" error={errors.cvv}>
                <input
                  id="card-cvv"
                  name="card-cvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={card.cvv}
                  onChange={update("cvv")}
                />
              </Field>
            </div>
            <button type="submit" className="btn btn-primary">
              Pay and confirm
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
              {draft.guest.name} · {plural(stay.guests, "guest")} · {plural(draft.rooms, "room")}
            </p>
            <PriceBreakdown quote={quote} />
            <div className="demo-box">
              <h2>Demo card</h2>
              <dl>
                <dt>Number</dt>
                <dd>4242 4242 4242 4242</dd>
                <dt>Expiry</dt>
                <dd>{DEMO_CARD.expiry}</dd>
                <dt>CVV</dt>
                <dd>{DEMO_CARD.cvv}</dd>
                <dt>Name</dt>
                <dd>{DEMO_CARD.name}</dd>
              </dl>
              <button type="button" className="btn btn-ghost" onClick={fillDemo}>
                Use demo card
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
