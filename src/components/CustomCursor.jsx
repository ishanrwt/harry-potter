import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const wandRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return undefined;

    const wand = wandRef.current;
    if (!wand) return undefined;

    document.documentElement.classList.add("hp-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let visible = false;
    let raf = 0;

    const setVisible = (on) => {
      visible = on;
      wand.style.opacity = on ? "1" : "0";
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onDown = () => wand.classList.add("is-lit");
    const onUp = () => wand.classList.remove("is-lit");

    const tick = () => {
      wand.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("hp-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={wandRef} className="hp-wand" aria-hidden="true">
      <svg
        className="hp-wand-svg"
        viewBox="0 0 64 64"
        width="64"
        height="64"
        fill="none"
      >
        <path
          d="M6 6 L46 52"
          stroke="#5c3d1e"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M6 6 L46 52"
          stroke="#8b5a2b"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M34 38 L46 52"
          stroke="#3d2612"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M36 40.5 L44.5 50.5"
          stroke="#c9a227"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle className="hp-wand-tip" cx="6" cy="6" r="3.2" fill="#d4c4a0" />
        <circle className="hp-wand-flare" cx="6" cy="6" r="7" fill="#ffe566" />
        <circle className="hp-wand-core" cx="6" cy="6" r="3.8" fill="#fff7b0" />
      </svg>
    </div>
  );
}
