import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { AccountPage } from "./pages/AccountPage";
import { BookingMadePage } from "./pages/BookingMadePage";
import { BookingPage } from "./pages/BookingPage";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { HomePage } from "./pages/HomePage";
import { HotelDetailsPage } from "./pages/HotelDetailsPage";
import { HotelsPage } from "./pages/HotelsPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PaymentPage } from "./pages/PaymentPage";
import { SignInPage } from "./pages/SignInPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
            <Route path="/book/:hotelId" element={<BookingPage />} />
            <Route path="/pay/:hotelId" element={<PaymentPage />} />
            <Route path="/booked/:bookingId" element={<BookingMadePage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BookingProvider>
    </AuthProvider>
  );
}
