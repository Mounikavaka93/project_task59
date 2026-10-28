import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { withCancellation } from "../utils/booking";
import { loadBookings, saveBookings } from "../utils/storage";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => loadBookings());

  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  const value = useMemo(
    () => ({
      bookings,
      addBooking(booking) {
        setBookings((current) => [booking, ...current]);
      },
      cancelBooking(id) {
        setBookings((current) => withCancellation(current, id));
      },
    }),
    [bookings]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within BookingProvider");
  }
  return context;
}
