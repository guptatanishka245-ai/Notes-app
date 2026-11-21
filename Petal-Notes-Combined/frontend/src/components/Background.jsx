import { useEffect, useMemo, useRef } from "react";

const PETALS = ["🌸", "🌷", "💮", "✿", "❀", "🩷"];

// Falling petals + a soft glow that follows the cursor.
export default function Background() {
  const glow = useRef(null);

  const petals = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        char: PETALS[i % PETALS.length],
        left: Math.random() * 100,
        size: 12 + Math.random() * 22,
        dur: 12 + Math.random() * 14,
        delay: -Math.random() * 20,
        sway: 20 + Math.random() * 60,
        opacity: 0.25 + Math.random() * 0.4,
      })),
    []
  );

  useEffect(() => {
    const move = (e) => {
      if (glow.current) glow.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="cursor-glow" ref={glow} />
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            opacity: p.opacity,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            "--sway": `${p.sway}px`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
