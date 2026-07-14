import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

const PageTransitionContext = createContext(null);

export const PAGE_LABELS = {
  "/": "Home",
  "/story": "Story",
  "/character": "Character",
  "/book": "Book",
};

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  // Soft fallback — avoid blank blue crash during HMR remounts
  if (!ctx) {
    return {
      navigateWithTransition: (to) => {
        if (typeof window !== "undefined") window.location.assign(to);
      },
    };
  }
  return ctx;
}

export function PageTransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRef = useRef(null);
  const titleRef = useRef(null);
  const busyRef = useRef(false);
  const [label, setLabel] = useState("");

  // Clear any stuck curtain after HMR / interrupted transitions
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.killTweensOf(overlay);
    gsap.set(overlay, { display: "none", top: 0, height: 0, clearProps: "clipPath" });
    busyRef.current = false;
  }, []);

  const navigateWithTransition = useCallback(
    (to, pageLabel) => {
      if (busyRef.current) return;
      if (location.pathname === to) return;

      const overlay = overlayRef.current;
      const title = titleRef.current;
      if (!overlay || !title) {
        navigate(to);
        return;
      }

      busyRef.current = true;
      const finalLabel = pageLabel || PAGE_LABELS[to] || "Harry Potter";
      setLabel(finalLabel);

      // Home (first page): curtain rises from the bottom; elsewhere: expands from the top nav
      const fromHome = location.pathname === "/";
      const stripH = Math.max(
        document.querySelector("nav")?.getBoundingClientRect().height || 72,
        64
      );
      const vh = window.innerHeight;

      if (fromHome) {
        gsap.set(overlay, {
          display: "flex",
          top: vh - stripH,
          bottom: "auto",
          height: stripH,
          clipPath: "none",
          opacity: 1,
        });
        gsap.set(title, { opacity: 0, y: -28 });
      } else {
        gsap.set(overlay, {
          display: "flex",
          top: 0,
          bottom: "auto",
          height: stripH,
          clipPath: "none",
          opacity: 1,
        });
        gsap.set(title, { opacity: 0, y: 28 });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, {
            display: "none",
            top: 0,
            bottom: "auto",
            height: stripH,
            clipPath: "none",
          });
          gsap.set(title, { opacity: 0, y: 0 });
          busyRef.current = false;
        },
      });

      // 1) Expand to full black screen
      if (fromHome) {
        tl.to(overlay, {
          top: 0,
          height: "100vh",
          duration: 0.75,
          ease: "power3.inOut",
        });
      } else {
        tl.to(overlay, {
          height: "100vh",
          duration: 0.75,
          ease: "power3.inOut",
        });
      }

      // 2) Show destination page name
      tl.to(
        title,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.15"
      );

      // 3) Brief hold, then navigate under the curtain
      tl.to({}, { duration: 0.35 });
      tl.add(() => {
        navigate(to);
        window.scrollTo(0, 0);
      });

      // 4) Fade title, then compress (opposite direction on home)
      tl.to(title, {
        opacity: 0,
        duration: 0.25,
        ease: "power1.in",
      });

      if (fromHome) {
        // Compress upward (exits toward the top)
        tl.to(overlay, {
          top: 0,
          height: 0,
          duration: 0.8,
          ease: "power3.inOut",
        });
      } else {
        // Compress downward (exits toward the bottom)
        tl.to(overlay, {
          top: "100vh",
          height: 0,
          duration: 0.8,
          ease: "power3.inOut",
        });
      }
    },
    [navigate, location.pathname]
  );

  return (
    <PageTransitionContext.Provider value={{ navigateWithTransition }}>
      {children}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-[300] hidden items-center justify-center overflow-hidden bg-[#0a0a0c]"
        aria-hidden="true"
      >
        <h1
          ref={titleRef}
          className="hp-brand px-6 text-center text-5xl tracking-[0.14em] opacity-0 md:text-7xl"
        >
          {label}
        </h1>
      </div>
    </PageTransitionContext.Provider>
  );
}
