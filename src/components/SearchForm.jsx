import { useEffect, useState } from "react";
import { LOCATIONS } from "../data/locations";
import { MAX_GUESTS } from "../utils/constants";
import { addDaysISO, todayISO } from "../utils/dates";
import { validateStay } from "../utils/validation";

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

const FIELD_IDS = {
  location: "stay-location",
  checkIn: "stay-check-in",
  checkOut: "stay-check-out",
  guests: "stay-guests",
};

export function SearchForm({ initial, onSubmit, submitLabel = "Search stays", tone = "overlay" }) {
  const [location, setLocation] = useState(initial?.location || "all");
  const [checkIn, setCheckIn] = useState(initial?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut || "");
  const [guests, setGuests] = useState(initial?.guests || 2);
  const [errors, setErrors] = useState({});
  const today = todayISO();

  useEffect(() => {
    setLocation(initial?.location || "all");
    setCheckIn(initial?.checkIn || "");
    setCheckOut(initial?.checkOut || "");
    setGuests(initial?.guests || 2);
    setErrors({});
  }, [initial?.location, initial?.checkIn, initial?.checkOut, initial?.guests]);

  const describedBy = (field) => (errors[field] ? `${FIELD_IDS[field]}-error` : undefined);

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {
      location,
      checkIn,
      checkOut,
      guests: Number(guests),
    };
    const nextErrors = validateStay(next);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = ["location", "checkIn", "checkOut", "guests"].find((field) => nextErrors[field]);
      document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }
    onSubmit(next);
  };

  return (
    <form className={`search-card ${tone === "band" ? "is-band" : ""}`} onSubmit={handleSubmit} noValidate>
      <Field id={FIELD_IDS.location} label="Destination" error={errors.location}>
        <select
          id={FIELD_IDS.location}
          value={location}
          aria-invalid={Boolean(errors.location)}
          aria-describedby={describedBy("location")}
          onChange={(event) => setLocation(event.target.value)}
        >
          {LOCATIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id={FIELD_IDS.checkIn} label="Check-in" error={errors.checkIn}>
        <input
          id={FIELD_IDS.checkIn}
          type="date"
          value={checkIn}
          min={today}
          max={addDaysISO(today, 365)}
          aria-invalid={Boolean(errors.checkIn)}
          aria-describedby={describedBy("checkIn")}
          onChange={(event) => {
            const next = event.target.value;
            setCheckIn(next);
            if (checkOut && next && checkOut <= next) setCheckOut("");
          }}
        />
      </Field>
      <Field id={FIELD_IDS.checkOut} label="Check-out" error={errors.checkOut}>
        <input
          id={FIELD_IDS.checkOut}
          type="date"
          value={checkOut}
          min={checkIn ? addDaysISO(checkIn, 1) : addDaysISO(today, 1)}
          aria-invalid={Boolean(errors.checkOut)}
          aria-describedby={describedBy("checkOut")}
          onChange={(event) => setCheckOut(event.target.value)}
        />
      </Field>
      <Field id={FIELD_IDS.guests} label="Guests" error={errors.guests}>
        <select
          id={FIELD_IDS.guests}
          value={guests}
          aria-invalid={Boolean(errors.guests)}
          aria-describedby={describedBy("guests")}
          onChange={(event) => setGuests(Number(event.target.value))}
        >
          {Array.from({ length: MAX_GUESTS }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </Field>
      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
