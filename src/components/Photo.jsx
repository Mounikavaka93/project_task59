import { useEffect, useState } from "react";

export function Photo({ src, alt = "", className = "", priority = false }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    if (!alt) return <div className={`photo-fallback ${className}`.trim()} aria-hidden="true" />;
    return <div className={`photo-fallback ${className}`.trim()} role="img" aria-label={alt} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
