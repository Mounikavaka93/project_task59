import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AmenityList } from "../components/AmenityList";
import { Photo } from "../components/Photo";
import { PriceBreakdown } from "../components/PriceBreakdown";
import { RoomOption } from "../components/RoomOption";
import { SearchForm } from "../components/SearchForm";
import { StarRating } from "../components/StarRating";
import { getHotelById } from "../data/hotels";
import { usePageTitle } from "../hooks/usePageTitle";
import { MAX_ROOMS } from "../utils/constants";
import { nightsBetween } from "../utils/dates";
import { formatDisplayDate, plural } from "../utils/format";
import { calculateQuote, minimumRooms, roomFitsGuests } from "../utils/pricing";
import { readStay, writeStay } from "../utils/query";
import { validateStay } from "../utils/validation";
import { NotFoundPage } from "./NotFoundPage";

export function HotelDetailsPage() {
  const { hotelId } = useParams();
  const hotel = getHotelById(hotelId);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const stay = readStay(searchParams);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [roomId, setRoomId] = useState("");

  usePageTitle(hotel ? hotel.name : "Stay");

  useEffect(() => {
    setPhotoIndex(0);
    setRoomId("");
  }, [hotelId]);

  if (!hotel) {
    return (
      <NotFoundPage title="We couldn't find that stay." body="It may have been removed from this demo." />
    );
  }

  const room = hotel.rooms.find((item) => item.id === roomId) || hotel.rooms[0];
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const hasDates = Boolean(stay.checkIn || stay.checkOut);
  const stayErrors = hasDates ? validateStay(stay) : {};
  const datesValid = hasDates && Object.keys(stayErrors).length === 0 && nights > 0;
  const needed = minimumRooms(stay.guests, room.capacity);
  const fits = roomFitsGuests(stay.guests, room.capacity);
  const canContinue = datesValid && fits;
  const quote = canContinue ? calculateQuote({ pricePerNight: room.price, nights, rooms: needed }) : null;
  const listQuery = searchParams.toString();

  const continueBooking = () => {
    if (!canContinue) return;
    const params = new URLSearchParams(searchParams);
    writeStay(params, stay);
    params.set("room", room.id);
    params.set("rooms", String(needed));
    navigate(`/book/${hotel.id}?${params.toString()}`);
  };

  return (
    <div className="page">
      <div className="shell">
        <p className="crumb">
          <Link to={listQuery ? `/hotels?${listQuery}` : "/hotels"}>Stays</Link>
          <span aria-hidden="true"> / </span>
          <span>{hotel.region}</span>
        </p>
        <div className="details-grid">
          <div>
            <div className="gallery">
              <button
                type="button"
                className="gallery-main"
                aria-label="Next photo"
                onClick={() => setPhotoIndex((index) => (index + 1) % hotel.images.length)}
              >
                <Photo
                  src={hotel.images[photoIndex]}
                  alt={`${hotel.name}, photo ${photoIndex + 1} of ${hotel.images.length}`}
                  priority
                />
              </button>
              <div className="thumbs">
                {hotel.images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    className={index === photoIndex ? "thumb is-active" : "thumb"}
                    aria-label={`Show photo ${index + 1}`}
                    aria-pressed={index === photoIndex}
                    onClick={() => setPhotoIndex(index)}
                  >
                    <Photo src={src} alt="" priority />
                  </button>
                ))}
              </div>
            </div>
            <header className="details-title">
              <div>
                <h1>{hotel.name}</h1>
                <p className="stay-place">{hotel.address}</p>
              </div>
              <StarRating value={hotel.rating} reviews={hotel.reviews} />
            </header>
            {Object.keys(stayErrors).length > 0 && (
              <div className="banner" role="alert">
                {Object.values(stayErrors).join(" ")}
              </div>
            )}
            <SearchForm
              initial={stay}
              tone="band"
              submitLabel="Update dates"
              onSubmit={(values) => {
                const params = new URLSearchParams(searchParams);
                writeStay(params, values);
                setSearchParams(params);
              }}
            />
            <section className="prose">
              <h2>About this stay</h2>
              <p>{hotel.description}</p>
              <p className="fine">
                Check-in {hotel.checkInTime} · Check-out {hotel.checkOutTime}
              </p>
            </section>
            <section>
              <h2>Amenities</h2>
              <AmenityList items={hotel.amenities} />
            </section>
            <section>
              <h2>Rooms</h2>
              <div className="room-list">
                {hotel.rooms.map((item) => (
                  <RoomOption
                    key={item.id}
                    room={item}
                    nights={datesValid ? nights : 0}
                    selected={item.id === room.id}
                    onSelect={() => setRoomId(item.id)}
                  />
                ))}
              </div>
            </section>
          </div>
          <aside className="booking-panel">
            <h2>Your stay</h2>
            {datesValid ? (
              <p>
                {formatDisplayDate(stay.checkIn)} – {formatDisplayDate(stay.checkOut)}
                <br />
                {plural(nights, "night")} · {plural(stay.guests, "guest")}
              </p>
            ) : (
              <p>Add dates to calculate the stay total.</p>
            )}
            <p>
              <strong>{room.name}</strong>
              <br />
              <span className="fine">Sleeps {room.capacity}</span>
            </p>
            {datesValid && !fits && (
              <p className="field-error" role="alert">
                This room cannot fit {stay.guests} guests within {MAX_ROOMS} rooms. Choose a larger room or fewer
                guests.
              </p>
            )}
            {quote && (
              <div aria-live="polite">
                <PriceBreakdown quote={quote} />
                {needed > 1 && <p className="fine">Starting total for {plural(needed, "room")} so your group fits.</p>}
              </div>
            )}
            <button type="button" className="btn btn-primary" disabled={!canContinue} onClick={continueBooking}>
              Continue to booking
            </button>
            <p className="fine">The total includes taxes. No payment is taken in this demo.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
