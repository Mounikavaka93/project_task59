import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { Photo } from "../components/Photo";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../context/BookingContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDisplayDate, formatINR, formatPhone, plural } from "../utils/format";

const TABS = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "cancelled", label: "Cancelled" },
];

export function MyBookingsPage() {
  const { bookings, cancelBooking } = useBookings();
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const [pending, setPending] = useState(null);
  const close = useCallback(() => setPending(null), []);
  usePageTitle("My bookings");

  const mine = user
    ? bookings.filter((booking) => booking.email.toLowerCase() === user.email.toLowerCase())
    : [];
  const visible = mine.filter((booking) => tab === "all" || booking.status === tab);

  if (!user) {
    return (
      <div className="page">
        <div className="shell narrow">
          <header className="page-intro">
            <h1>My bookings</h1>
          </header>
          <EmptyState
            title="Sign in to see your stays."
            body="Bookings appear here after you pay. They stay on this device for the account you used."
            action={
              <Link to="/sign-in?next=/bookings" className="btn btn-primary">
                Sign in
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="shell narrow-list">
        <header className="page-intro">
          <h1>My bookings</h1>
          <p className="lede">Saved on this device for {user.email}. Cancelling keeps the record and marks it cancelled.</p>
        </header>
        <div className="tabs" role="group" aria-label="Booking status">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={tab === item.id}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {mine.length === 0 ? (
          <EmptyState
            title="No bookings yet."
            body="When you pay for a stay, it will show up here."
            action={
              <Link to="/hotels" className="btn btn-primary">
                Browse stays
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title={tab === "cancelled" ? "No cancelled stays." : "No confirmed stays."}
            body="Switch tabs to see the rest of your bookings."
          />
        ) : (
          <div className="booking-list">
            {visible.map((booking) => (
              <article
                key={booking.id}
                className={booking.status === "cancelled" ? "booking-card is-cancelled" : "booking-card"}
                aria-labelledby={`booking-${booking.id}`}
              >
                <div className="booking-media">
                  <Photo src={booking.image} alt="" />
                </div>
                <div className="booking-body">
                  <div className="booking-top">
                    <h2 id={`booking-${booking.id}`}>{booking.hotelName}</h2>
                    <span className={booking.status === "confirmed" ? "pill pill-ok" : "pill pill-muted"}>
                      {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                    </span>
                  </div>
                  <p className="ref">{booking.id}</p>
                  <p>
                    {booking.roomName}
                    <br />
                    {formatDisplayDate(booking.checkIn)} – {formatDisplayDate(booking.checkOut)}
                    <br />
                    {booking.city}, {booking.region}
                  </p>
                  <p>
                    {booking.guestName} · {formatPhone(booking.phone)}
                    <br />
                    {booking.email}
                    <br />
                    {plural(booking.guests, "guest")} · {plural(booking.rooms, "room")} · {plural(booking.nights, "night")}
                  </p>
                  {booking.requests ? <p className="fine">Requests: {booking.requests}</p> : null}
                  <p className="price">
                    <strong>{formatINR(booking.total)}</strong>
                    <span> total, taxes included</span>
                  </p>
                  <div className="actions">
                    <Link to={`/hotels/${booking.hotelId}`} className="btn btn-ghost">
                      View hotel
                    </Link>
                    {booking.status === "confirmed" && (
                      <button type="button" className="btn btn-danger" onClick={() => setPending(booking)}>
                        Cancel booking
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {pending && (
          <Modal title="Cancel this booking?" onClose={close}>
            <p>
              This marks the stay at {pending.hotelName} ({pending.id}) as cancelled. This demo does not contact the
              hotel.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={close}>
                Keep booking
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  cancelBooking(pending.id);
                  setPending(null);
                }}
              >
                Yes, cancel stay
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
