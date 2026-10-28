import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { validateSignup } from "../utils/auth";
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

const EMPTY = { name: "", email: "", phone: "", password: "", confirm: "" };

export function CreateAccountPage() {
  const { user, signUp } = useAuth();
  const [params] = useSearchParams();
  const destination = safeNext(params.get("next"));
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  usePageTitle("Create account");

  if (user) return <Navigate to={destination} replace />;

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateSignup(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      const first = ["name", "email", "phone", "password", "confirm"].find((field) => nextErrors[field]);
      document.getElementById(first)?.focus();
      return;
    }
    const result = signUp(form);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate(destination, { replace: true });
  };

  return (
    <div className="page">
      <div className="shell narrow">
        <header className="page-intro">
          <h1>Create an account</h1>
          <p className="lede">
            Saved only in this browser. The demo sign-in is on the <Link to="/sign-in">sign-in page</Link>.
          </p>
        </header>
        <form className="booking-form" onSubmit={onSubmit} noValidate>
          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
          <Field id="name" label="Full name" error={errors.name}>
            <input id="name" name="name" autoComplete="name" value={form.name} onChange={update("name")} />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
            />
          </Field>
          <Field id="phone" label="Mobile number" error={errors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit mobile"
              value={form.phone}
              onChange={update("phone")}
            />
          </Field>
          <Field id="password" label="Password" error={errors.password}>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
            />
          </Field>
          <Field id="confirm" label="Confirm password" error={errors.confirm}>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={update("confirm")}
            />
          </Field>
          <p className="fine">At least 8 characters, with a letter and a number.</p>
          <button type="submit" className="btn btn-primary">
            Create account
          </button>
          <p className="fine">
            Already have one? <Link to={`/sign-in?next=${encodeURIComponent(destination)}`}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
