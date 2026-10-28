import { Link, Navigate, useParams } from "react-router-dom";
import { PriceBreakdown } from "../components/PriceBreakdown";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../context/BookingContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDisplayDate, formatINR, plural } from "../utils/format";
import { NotFoundPage } from "./NotFoundPage";

export function BookingMadePage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const { bookings } = useBookings();
  const booking = bookings.find((item) => item.id === bookingId);

  usePageTitle("Booking is made");

  if (!user) return <Navigate to={`/sign-in?next=${encodeURIComponent(`/booked/${bookingId}`)}`} replace />;

  if (!booking || booking.email.toLowerCase() !== user.email.toLowerCase()) {
    return (
      <NotFoundPage
        title="We couldn't find that booking."
        body="It may belong to another account on this device."
      />
    );
  }

  return (
    <div className="page">
      <div className="shell narrow success">
        <p className="eyebrow">Payment received</p>
        <h1>Booking is made</h1>
        <p>
          Your reference is <strong className="ref">{booking.id}</strong>. It is saved for {booking.email}
          {booking.payment?.last4 ? ` and paid with the card ending ${booking.payment.last4}` : ""}.
        </p>
        <div className="summary">
          <h2>{booking.hotelName}</h2>
          <p>
            {booking.roomName}
            <br />
            {formatDisplayDate(booking.checkIn)} – {formatDisplayDate(booking.checkOut)}
            <br />
            {plural(booking.guests, "guest")} · {plural(booking.rooms, "room")}
          </p>
          <p>
            {booking.guestName}
            <br />
            {booking.email}
          </p>
          <PriceBreakdown
            quote={{
              pricePerNight: booking.pricePerNight,
              nights: booking.nights,
              rooms: booking.rooms,
              subtotal: booking.subtotal,
              taxes: booking.taxes,
              total: booking.total,
            }}
          />
          <p className="fine">Total paid {formatINR(booking.total)}. This demo does not charge a real card.</p>
        </div>
        <div className="actions">
          <Link to="/bookings" className="btn btn-primary">
            View my bookings
          </Link>
          <Link to="/hotels" className="btn btn-ghost">
            Browse stays
          </Link>
        </div>
      </div>
    </div>
  );
}
