import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../context/BookingContext";
import { BRAND } from "../data/brand";

function navClass({ isActive }) {
  return isActive ? "nav-link is-active" : "nav-link";
}

export function Layout() {
  const { bookings } = useBookings();
  const { user, signOut } = useAuth();
  const confirmed = bookings.filter(
    (booking) =>
      booking.status === "confirmed" &&
      user &&
      booking.email.toLowerCase() === user.email.toLowerCase()
  ).length;

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link to="/" className="logo">
            <span className="logo-mark" aria-hidden="true">
              {BRAND.mark}
            </span>
            <span>{BRAND.name}</span>
          </Link>
          <nav aria-label="Primary">
            <NavLink to="/hotels" className={navClass}>
              Stays
            </NavLink>
            <NavLink to="/bookings" className={navClass}>
              My bookings
              {confirmed > 0 && <span className="nav-count">{confirmed}</span>}
            </NavLink>
            {user ? (
              <>
                <NavLink to="/account" className={navClass}>
                  {user.name.split(" ")[0]}
                </NavLink>
                <button type="button" className="nav-link nav-button" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/sign-in" className={navClass}>
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="shell footer-inner">
          <div>
            <strong>{BRAND.name}</strong>
            <p>A hotel desk for searching stays and keeping bookings on this device.</p>
          </div>
          <p className="footer-note">
            Demo payment only. A stay is saved after you pay with the sample card. Cancel anytime from My bookings.
          </p>
        </div>
      </footer>
    </div>
  );
}
