import { useEffect, useRef } from "react";

function motionAllowed() {
  if (typeof window.matchMedia !== "function") return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function Tilt({ children, className = "", max = 9 }) {
  const ref = useRef(null);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = motionAllowed();
  }, []);

  const move = (event) => {
    const node = ref.current;
    if (!node || !enabled.current) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
    node.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
    node.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
    node.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
    node.classList.add("is-tilting");
  };

  const leave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.classList.remove("is-tilting");
  };

  return (
    <div className={`tilt-stage ${className}`.trim()}>
      <div ref={ref} className="tilt-card" onPointerMove={move} onPointerLeave={leave}>
        {children}
      </div>
    </div>
  );
}
