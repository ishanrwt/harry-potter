import { useState, memo, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { usePageTransition, PAGE_LABELS } from "./PageTransition";

const Navlinks = {
  Home: "/",
  Story: "/story",
  Character: "/character",
  Book: "/book",
};

const NavItem = memo(({ label, href, currentPath, onNavigate }) => {
  const active = currentPath === href;
  return (
    <button
      type="button"
      onClick={() => onNavigate(href, label)}
      className={`uppercase text-sm tracking-widest transition-colors ${
        active ? "text-yellow-300" : "text-white/80 hover:text-yellow-300"
      }`}
    >
      {label}
    </button>
  );
});

function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const entries = Object.entries(Navlinks);
  const { pathname } = useLocation();
  const { navigateWithTransition } = usePageTransition();

  const closeMenu = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  const onNavigate = useCallback(
    (href, label) => {
      closeMenu();
      navigateWithTransition(href, label || PAGE_LABELS[href]);
    },
    [closeMenu, navigateWithTransition]
  );

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (y < 24) {
        setHidden(false);
      } else if (delta > 6) {
        setHidden(true);
        setOpen(false);
      } else if (delta < -6) {
        setHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 z-[50] w-full border-b border-white/10 bg-[#0a0a0c]/95 backdrop-blur-md transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          type="button"
          className="flex items-center gap-3"
          onClick={() => onNavigate("/", "Home")}
        >
          <span className="hp-brand text-2xl md:text-3xl">Harry Potter</span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {entries.map(([label, href]) => (
            <NavItem
              key={label}
              label={label}
              href={href}
              currentPath={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <button
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          aria-expanded={open}
          className="border border-yellow-400/30 p-2 text-yellow-300 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#0a0a0c] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {entries.map(([label, href]) => (
              <NavItem
                key={label}
                label={label}
                href={href}
                currentPath={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default memo(Navbar);
