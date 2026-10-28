import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { validateSignIn } from "../utils/auth";
import { DEMO_ACCOUNT } from "../utils/constants";
import { safeNext } from "../utils/redirect";

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

export function SignInPage() {
  const { user, signIn } = useAuth();
  const [params] = useSearchParams();
  const destination = safeNext(params.get("next"));
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  usePageTitle("Sign in");

  if (user) return <Navigate to={destination} replace />;

  const finish = (nextEmail, nextPassword) => {
    const nextErrors = validateSignIn({ email: nextEmail, password: nextPassword });
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;
    const result = signIn(nextEmail, nextPassword);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate(destination, { replace: true });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    finish(email, password);
  };

  const useDemo = () => {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    finish(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
  };

  return (
    <div className="page">
      <div className="shell">
        <header className="page-intro">
          <h1>Sign in</h1>
          <p className="lede">Use the demo account, or one you created on this device.</p>
        </header>
        <div className="split">
          <form className="booking-form" onSubmit={onSubmit} noValidate>
            {formError && (
              <p className="field-error" role="alert">
                {formError}
              </p>
            )}
            <Field id="sign-email" label="Email" error={errors.email}>
              <input
                id="sign-email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "sign-email-error" : undefined}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field id="sign-password" label="Password" error={errors.password}>
              <input
                id="sign-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "sign-password-error" : undefined}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <button type="submit" className="btn btn-primary">
              Sign in
            </button>
            <p className="fine">
              New here? <Link to={`/create-account?next=${encodeURIComponent(destination)}`}>Create an account</Link>
            </p>
          </form>
          <aside className="demo-box">
            <h2>Demo account</h2>
            <p>Already saved in this browser. Nothing is sent to a server.</p>
            <dl>
              <dt>Name</dt>
              <dd>{DEMO_ACCOUNT.name}</dd>
              <dt>Email</dt>
              <dd>{DEMO_ACCOUNT.email}</dd>
              <dt>Password</dt>
              <dd>{DEMO_ACCOUNT.password}</dd>
              <dt>Mobile</dt>
              <dd>{DEMO_ACCOUNT.phone}</dd>
            </dl>
            <button type="button" className="btn btn-primary" onClick={useDemo}>
              Use demo account
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
