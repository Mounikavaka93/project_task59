function iconPaths(name) {
  switch (name) {
    case "wifi":
      return (
        <>
          <path d="M5 12.5c4.2-4 9.8-4 14 0" />
          <path d="M8.2 15.4c2.4-2.2 5.2-2.2 7.6 0" />
          <path d="M12 18.5h.01" />
        </>
      );
    case "pool":
      return (
        <>
          <path d="M3 15c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0" />
          <path d="M7 15V8.5a2 2 0 0 1 2-2h1" />
          <path d="M4 19c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0" />
        </>
      );
    case "spa":
      return (
        <>
          <path d="M12 21c4-3 6-6.2 6-9.2A6 6 0 0 0 6 11.8C6 14.8 8 18 12 21z" />
          <path d="M12 11c.6-2 2-3.2 3.5-4" />
        </>
      );
    case "breakfast":
      return (
        <>
          <path d="M4 9h11v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" />
          <path d="M15 10h2.5a2.5 2.5 0 0 1 0 5H15" />
          <path d="M8 21h6" />
        </>
      );
    case "parking":
      return (
        <>
          <rect x="4" y="3.5" width="16" height="17" rx="2" />
          <path d="M9 16.5V7.5h3.2a2.4 2.4 0 0 1 0 4.8H9" />
        </>
      );
    case "gym":
      return (
        <>
          <path d="M6 9v6" />
          <path d="M18 9v6" />
          <path d="M3.5 10.5v3" />
          <path d="M20.5 10.5v3" />
          <path d="M6 12h12" />
        </>
      );
    case "beach":
      return (
        <>
          <path d="M4 18c2.2-1.4 3.8-1.4 6 0s3.8 1.4 6 0 3.8-1.4 4 0" />
          <path d="M8 18V8l8 3.2" />
          <path d="M8 11.2l8 3.2" />
        </>
      );
    case "ac":
      return (
        <>
          <rect x="3.5" y="5" width="17" height="8" rx="1.5" />
          <path d="M7 16.5c.6 1.2 1.2 1.8 2 1.8s1.3-.8 1.6-2" />
          <path d="M13 16.5c.6 1.2 1.2 1.8 2 1.8s1.3-.8 1.6-2" />
        </>
      );
    case "restaurant":
      return (
        <>
          <path d="M6 3.5v7" />
          <path d="M4.5 3.5v4" />
          <path d="M7.5 3.5v4" />
          <path d="M6 10.5V20" />
          <path d="M15 3.5c1.6 1.8 2.2 3.4 2.2 5.2 0 1.6-1 2.6-2.2 2.6V20" />
        </>
      );
    case "bar":
      return (
        <>
          <path d="M5 4h14l-5.2 6.2a3 3 0 0 1-3.6 0L5 4z" />
          <path d="M12 11v8" />
          <path d="M8.5 19.5h7" />
        </>
      );
    case "fireplace":
      return (
        <>
          <path d="M5 20V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V20" />
          <path d="M4 20h16" />
          <path d="M12 17c1.4-1 2-2.2 2-3.4 0-1.6-1.2-2.4-2-3.6-.8 1.2-2 2-2 3.6 0 1.2.6 2.4 2 3.4z" />
        </>
      );
    case "boat":
      return (
        <>
          <path d="M3 15l9 4 9-4" />
          <path d="M5 15l2.2 4.2a2 2 0 0 0 1.8 1.1h6a2 2 0 0 0 1.8-1.1L19 15" />
          <path d="M12 15V5" />
          <path d="M12 6.5h5l-1.6 3.2" />
        </>
      );
    case "mountain":
      return (
        <>
          <path d="M3 18l6.2-9 3.3 4.6L16 9l5 9H3z" />
        </>
      );
    case "garden":
      return (
        <>
          <path d="M12 21V11" />
          <path d="M12 14c-3-1-5-3.2-5-6 2.6.2 4.4 1.6 5 3" />
          <path d="M12 12c3-.6 5.2-2.4 5.5-5.2-2.8.2-4.6 1.8-5.5 3.6" />
        </>
      );
    case "workspace":
      return (
        <>
          <rect x="4" y="5" width="16" height="11" rx="1.5" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
        </>
      );
    case "lake":
      return (
        <>
          <path d="M3 15c1.6 1 3 1 4.6 0s3-1 4.6 0 3 1 4.6 0 3-1 4.2 0" />
          <path d="M3 19c1.6 1 3 1 4.6 0s3-1 4.6 0 3 1 4.6 0 3-1 4.2 0" />
          <path d="M8 12l2.2-6h1.2L14 12" />
        </>
      );
    case "star":
      return <path d="M12 3.2l2.1 4.4 4.8.7-3.5 3.4.8 4.8L12 14.8 7.8 16.5l.8-4.8L5.1 8.3l4.8-.7L12 3.2z" />;
    default:
      return <path d="M5 12.5l4.2 4.2L19 7.2" />;
  }
}

export function Icon({ name, size = 18 }) {
  const filled = name === "star";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths(name)}
    </svg>
  );
}
