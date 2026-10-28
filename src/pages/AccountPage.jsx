import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatPhone } from "../utils/format";

export function AccountPage() {
  const { user, signOut } = useAuth();
  usePageTitle("Account");

  if (!user) return <Navigate to="/sign-in?next=/account" replace />;

  return (
    <div className="page">
      <div className="shell narrow">
        <header className="page-intro">
          <h1>{user.name}</h1>
          <p className="lede">This account lives in this browser.</p>
        </header>
        <dl className="account-details">
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Mobile</dt>
          <dd>{formatPhone(user.phone) || "Not added"}</dd>
        </dl>
        <div className="actions">
          <Link to="/bookings" className="btn btn-primary">
            View my bookings
          </Link>
          <button type="button" className="btn btn-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
