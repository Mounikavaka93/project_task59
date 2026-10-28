import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HotelCard } from "../components/HotelCard";
import { Photo } from "../components/Photo";
import { Reveal } from "../components/Reveal";
import { SearchForm } from "../components/SearchForm";
import { Tilt } from "../components/Tilt";
import { DESTINATIONS } from "../data/locations";
import { HOTELS } from "../data/hotels";
import { usePageTitle } from "../hooks/usePageTitle";
import { featuredHotels } from "../utils/filters";
import { staySearch } from "../utils/query";

const STEPS = [
  {
    n: "01",
    title: "Search",
    body: "Pick a city, dates, and how many guests are traveling.",
  },
  {
    n: "02",
    title: "Choose a room",
    body: "Compare nightly rates. The stay total updates before you continue.",
  },
  {
    n: "03",
    title: "Confirm",
    body: "Save the booking in this browser and cancel it whenever you need to.",
  },
];

function useHeroParallax(ref) {
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window.matchMedia !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const onMove = (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty("--hy", x.toFixed(3));
      node.style.setProperty("--hx", y.toFixed(3));
    };
    const reset = () => {
      node.style.removeProperty("--hy");
      node.style.removeProperty("--hx");
    };
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", reset);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", reset);
    };
  }, []);
}

export function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  usePageTitle("Find a stay");
  useHeroParallax(heroRef);
  const featured = featuredHotels(HOTELS, 3);

  return (
    <div className="page home-page">
      <section className="hero" ref={heroRef}>
        <div className="shell hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">Marrowlane · stays across India</p>
            <h1>
              Rooms with a <em>point of view</em>.
            </h1>
            <p className="lede">
              Search by city and dates. Prices update with the length of your stay, and bookings stay on this device.
            </p>
          </div>
          <div className="hero-stack" aria-hidden="true">
            {featured.map((hotel, index) => (
              <div className={`plane plane-${index}`} key={hotel.id}>
                <Photo src={hotel.images[0]} alt="" priority={index === 0} />
                <span>{hotel.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="shell search-wrap">
        <SearchForm
          initial={{ location: "all", checkIn: "", checkOut: "", guests: 2 }}
          onSubmit={(values) => navigate(`/hotels?${staySearch(values)}`)}
        />
      </div>
      <div className="shell">
        <section className="section">
          <div className="section-head">
            <h2>Destinations</h2>
          </div>
          <div className="dest-grid">
            {DESTINATIONS.map((destination, index) => (
              <Reveal key={destination.region} delay={index * 70}>
                <Tilt max={8}>
                  <Link className="dest-card" to={`/hotels?location=${encodeURIComponent(destination.region)}`}>
                    <Photo src={destination.image} alt="" priority />
                    <span>
                      <strong>{destination.region}</strong>
                      <small>{destination.blurb}</small>
                    </span>
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <h2>Featured stays</h2>
            <Link to="/hotels">Browse all</Link>
          </div>
          <div className="card-grid">
            {featured.map((hotel, index) => (
              <Reveal key={hotel.id} delay={index * 90}>
                <HotelCard hotel={hotel} variant="tile" priority />
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <h2>How a booking works</h2>
          </div>
          <div className="steps">
            {STEPS.map((step, index) => (
              <Reveal key={step.n} delay={index * 80}>
                <Tilt max={7}>
                  <article className="step">
                    <span>{step.n}</span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </article>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
