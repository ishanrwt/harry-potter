import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import { usePageTransition } from "./components/PageTransition";

// Memoized static components
const Logo = memo(() => (
  <div className="logo flex gap-7">
    <h3 className="hp-brand text-4xl -mt-[8px] leading-none">Harry Potter</h3>
  </div>
));

const INTRO_DONE_KEY = "hp-intro-complete";

// In-memory only — resets on full reload, stays set during SPA navigation
let introPlayedThisLoad = false;

try {
  sessionStorage.removeItem(INTRO_DONE_KEY);
} catch {
  /* ignore */
}

function hasIntroPlayed() {
  return introPlayedThisLoad;
}

function markIntroPlayed() {
  introPlayedThisLoad = true;
}

function App() {
  const skipIntro = hasIntroPlayed();
  const [showContent, setShowContent] = useState(skipIntro);
  const [phase, setPhase] = useState(skipIntro ? "content" : "hold"); // hold → reveal → content
  const [showOverlay, setShowOverlay] = useState(!skipIntro);
  const [introReady, setIntroReady] = useState(false);
  const [showStoryBtn, setShowStoryBtn] = useState(false);
  const overlayRef = useRef(null);
  const mainRef = useRef(null);
  const { navigateWithTransition } = usePageTransition();

  const beginReveal = useCallback(() => {
    setShowOverlay(false);
    setPhase((p) => (p === "hold" ? "reveal" : p));
  }, []);

  // Wait for display font so gold text is actually visible (first visit only)
  useEffect(() => {
    if (skipIntro) return;

    let cancelled = false;
    const ready = () => {
      if (!cancelled) setIntroReady(true);
    };

    if (document.fonts?.load) {
      document.fonts
        .load('900 92px Cinzel')
        .then(() => document.fonts.ready)
        .then(ready)
        .catch(ready);
    } else {
      ready();
    }

    const fallback = window.setTimeout(ready, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [skipIntro]);

  // Preload + play transparent overlay; kick off mask when it ends
  useEffect(() => {
    if (phase !== "hold") return;
    const el = overlayRef.current;
    if (!el) return;

    let done = false;
    let safetyTimer = 0;

    const finish = () => {
      if (done) return;
      done = true;
      if (safetyTimer) window.clearTimeout(safetyTimer);
      beginReveal();
    };

    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.preload = "auto";
    el.playbackRate = 3;

    const armSafety = () => {
      if (safetyTimer) window.clearTimeout(safetyTimer);
      const rate = el.playbackRate || 3;
      const ms =
        el.duration && Number.isFinite(el.duration)
          ? Math.min((el.duration * 1000) / rate + 1200, 12000)
          : 9000;
      safetyTimer = window.setTimeout(finish, ms);
    };

    const tryPlay = () => {
      if (!introReady) return;
      el.playbackRate = 3;
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          window.setTimeout(() => {
            el.playbackRate = 3;
            el.play().catch(() => finish());
          }, 250);
        });
      }
    };

    const onLoadedMeta = () => armSafety();
    const onTimeUpdate = () => {
      if (el.duration && Number.isFinite(el.duration) && el.currentTime >= el.duration - 0.15) {
        finish();
      }
    };

    const onPlaying = () => {
      el.playbackRate = 3;
    };

    el.addEventListener("loadedmetadata", onLoadedMeta);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("ended", finish);
    el.addEventListener("error", finish);
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("timeupdate", onTimeUpdate);

    armSafety();
    if (el.readyState >= 2) {
      onLoadedMeta();
      tryPlay();
    } else {
      el.load();
    }

    if (el.ended) finish();

    return () => {
      el.removeEventListener("loadedmetadata", onLoadedMeta);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("ended", finish);
      el.removeEventListener("error", finish);
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("timeupdate", onTimeUpdate);
      if (safetyTimer) window.clearTimeout(safetyTimer);
    };
  }, [phase, introReady, beginReveal]);

  // Mask scale-out — after overlay video finishes
  useGSAP(() => {
    if (phase !== "reveal") return;

    const svgEl = document.querySelector(".svg");
    if (!svgEl) {
      markIntroPlayed();
      setShowContent(true);
      setPhase("content");
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          markIntroPlayed();
          svgEl.style.display = "none";
          setShowContent(true);
          setPhase("content");
        },
      });

      // Start scale almost immediately so there's no pause after the video
      tl.to(".hp-mask-fill", {
        opacity: 0,
        duration: 0.55,
        ease: "power2.inOut",
      }).to(
        [".vi-mask-group", ".hp-stars"],
        {
          scale: 14,
          duration: 2,
          ease: "expo.inOut",
          transformOrigin: "50% 50%",
          opacity: 0,
        },
        "-=0.45"
      );
    });

    // Safety if GSAP timeline is killed by StrictMode / HMR
    const safety = window.setTimeout(() => {
      markIntroPlayed();
      setShowContent(true);
      setPhase("content");
    }, 5000);

    return () => {
      window.clearTimeout(safety);
      ctx.revert();
    };
  }, { dependencies: [phase] });

  // Main content animations
  useGSAP(() => {
    if (!showContent) return;

    let storyTimer;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.to(".main", { scale: 1, rotate: 0, duration: 2, delay: -1, ease: "expo.inOut" }, 0)
        .to(".sky", { scale: 1.3, rotate: 0, duration: 2, delay: -0.8, ease: "expo.inOut" }, 0)
        .to(".bg", { scale: 1.6, rotate: 0, duration: 2, delay: -0.8, ease: "expo.inOut" }, 0)
        .to(".character", { scale: 1.2, x: "-50%", bottom: "-70%", rotate: 0, duration: 2, delay: -0.8, ease: "expo.inOut" }, 0)
        .to(".text", { scale: 1, rotate: 0, duration: 2, delay: -0.8, ease: "expo.inOut" }, 0);

      const harryEl = document.querySelector(".text h1:nth-child(1)");
      const potterEl = document.querySelector(".text h1:nth-child(2)");
      if (harryEl && potterEl) {
        tl.fromTo(harryEl, { x: "-60vw" }, { x: "48vw", duration: 1.8, ease: "power3.out" }, 0);
        tl.fromTo(potterEl, { x: "60vw" }, { x: "-33vw", duration: 1.8, ease: "power3.out" }, 0);
      }

      // Show Story CTA early — don't wait for the full landing timeline
      storyTimer = window.setTimeout(() => setShowStoryBtn(true), 400);
    });

    return () => {
      if (storyTimer) window.clearTimeout(storyTimer);
      ctx.revert();
    };
  }, { dependencies: [showContent] });

  // Parallax effect - optimized with RAF throttling
  useEffect(() => {
    if (!showContent) return;
    
    const main = document.querySelector(".main");
    if (!main) return;

    gsap.set(".imagesdiv", { transformPerspective: 800, transformStyle: "preserve-3d" });
    gsap.set(".character", { transformPerspective: 900, force3D: true });
    
    let rafId = null;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const handleMouseMove = (e) => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        const xMove = (e.clientX / window.innerWidth - 0.5) * 120;
        const yMove = (e.clientY / window.innerHeight - 0.5) * 120;

        const skyScale = 1.3, skyPad = 12;
        const skyLimitX = (window.innerWidth * (skyScale - 1)) / 2 - skyPad;
        const skyLimitY = (window.innerHeight * (skyScale - 1)) / 2 - skyPad;
        gsap.to(".sky", { x: clamp(xMove * 0.6, -skyLimitX, skyLimitX), y: clamp(yMove * 0.6, -skyLimitY, skyLimitY), duration: 0.3 });

        const bgScale = 1.6, bgPad = 12;
        const bgLimitX = (window.innerWidth * (bgScale - 1)) / 2 - bgPad;
        const bgLimitY = (window.innerHeight * (bgScale - 1)) / 2 - bgPad;
        gsap.to(".bg", { x: clamp(xMove * 0.5, -bgLimitX, bgLimitX), y: clamp(yMove * 0.4, -bgLimitY, bgLimitY), duration: 0.3 });
        
        // Original scene tilt (sky/bg/text move together)
        gsap.to(".imagesdiv", { rotationY: xMove * 0.06, rotationX: -yMove * 0.06, duration: 0.3 });

        // Character tilts opposite to the scene for depth contrast
        gsap.to(".character", {
          rotationY: -xMove * 0.18,
          rotationX: yMove * 0.14,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
        
        rafId = null;
      });
    };

    main.addEventListener("mousemove", handleMouseMove);
    return () => {
      main.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [showContent]);

  return (
    <>
      {(phase === "hold" || phase === "reveal") && (
        <div className="fixed inset-0 z-[90] bg-[#00072D]" aria-hidden="true" />
      )}

      {(phase === "hold" || phase === "reveal") && (
      <div className="svg flex items-center justify-center fixed top-0 left-0 z-[100] w-full h-screen overflow-hidden bg-[#00072D]">
        <img
          src="/stars_texture.jpg"
          alt=""
          aria-hidden="true"
          className="hp-stars absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />

        {/* Same gold SVG text for frame hold + mask reveal */}
        <svg
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
          className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${introReady ? "opacity-100" : "opacity-0"}`}
        >
          <defs>
            <linearGradient id="hpMaskFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8D5A3" />
              <stop offset="45%" stopColor="#F5E6C8" />
              <stop offset="100%" stopColor="#C9A227" />
            </linearGradient>
            <mask id="viMask">
              <rect width="100%" height="100%" fill="black" />
              <g className="vi-mask-group">
                <text
                  x="50%"
                  y="44%"
                  fontSize="92"
                  textAnchor="middle"
                  fill="white"
                  dominantBaseline="middle"
                  fontFamily="Cinzel, Georgia, serif"
                  fontWeight="900"
                  letterSpacing="8"
                >
                  Harry
                </text>
                <text
                  x="50%"
                  y="58%"
                  fontSize="92"
                  textAnchor="middle"
                  fill="white"
                  dominantBaseline="middle"
                  fontFamily="Cinzel, Georgia, serif"
                  fontWeight="900"
                  letterSpacing="8"
                >
                  Potter
                </text>
              </g>
            </mask>
          </defs>
          <image
            href="/bg.png"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            mask="url(#viMask)"
          />
          <rect
            className="hp-mask-fill"
            width="100%"
            height="100%"
            fill="url(#hpMaskFill)"
            mask="url(#viMask)"
          />
        </svg>

        {phase === "hold" && (
          <div
            className={`pointer-events-none absolute inset-0 z-[120] overflow-hidden transition-opacity duration-200 ${
              showOverlay && introReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <video
              ref={overlayRef}
              src="/ball-alpha.webm?v=3x"
              className="absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-[53%] -translate-y-[64%] scale-[1.7] bg-transparent object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
            />
          </div>
        )}
      </div>
      )}

      {showContent && (
        <div className="home-fit">
          <div className="home-fit-inner">
            <div className="main w-full h-full rotate-[-10deg] scale-[1.7]" ref={mainRef}>
              <div className="landing overflow-hidden relative w-full h-full bg-black">
                <div className="navbar absolute top-0 left-0 z-[10] w-full py-10 px-10">
                  <Logo />
                </div>

                <div className="imagesdiv relative overflow-hidden w-full h-full">
                  <img className="absolute sky scale-[1.5] rotate-[-20deg] top-0 left-0 w-full h-full object-cover" src="/sky.png" alt="" />
                  <img className="absolute scale-[1.8] rotate-[-3deg] bg top-0 left-0 w-full h-full object-cover" src="/bg.png" alt="" />
                  <div className="text text-white flex flex-col gap-3 absolute top-20 left-1/2 -translate-x-1/2 scale-[1.4] rotate-[-10deg]">
                    <h1 className="text-[12rem] leading-none -ml-40">Harry</h1>
                    <h1 className="text-[12rem] leading-none ml-20">Potter</h1>
                  </div>
                  <img className="absolute character -bottom-[150%] left-1/2 -translate-x-1/2 scale-[3] rotate-[-20deg]" src="/girlbg.png" alt="" />
                </div>

                {showStoryBtn && (
                  <div className="absolute bottom-10 left-1/2 z-[20] -translate-x-1/2">
                    <button
                      type="button"
                      onClick={() => navigateWithTransition("/story", "Story")}
                      className="inline-block bg-yellow-500 px-12 py-5 text-3xl text-black transition-transform hover:scale-105"
                    >
                      Story
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
