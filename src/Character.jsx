import { useRef, useState, memo, useCallback, useMemo } from "react";
import Navbar from "./components/Navbar";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const harryPotterCharacters = [
  {
    id: 1,
    name: "Harry Potter",
    role: "The Chosen One",
    relationship: "Friend",
    house: "Gryffindor",
    summary: "The main protagonist. Known as 'The Boy Who Lived', destined to defeat Voldemort.",
    image: "/Harry.jpg",
    traits: ["Brave", "Loyal", "Selfless", "Gryffindor"],
    famousQuote: "I don't go looking for trouble. Trouble usually finds me.",
    wand: "Holly, 11\", Phoenix Feather core",
    patronus: "Stag",
    video: "/video/harry.mp4",
  },
  {
    id: 2,
    name: "Hermione Granger",
    role: "The Brightest Witch",
    relationship: "Friend",
    house: "Gryffindor",
    summary: "An intelligent and dedicated witch, always ready with a spell or formula.",
    image: "/Harmainy.jpg",
    traits: ["Intelligent", "Logical", "Courageous", "Gryffindor"],
    famousQuote: "It's leviOsa, not levioSA!",
    wand: "Vine wood, Dragon heartstring, 10¾ inches",
    patronus: "Otter",
    video: "/video/hermione.mp4",
  },
  {
    id: 3,
    name: "Ron Weasley",
    role: "Loyal Best Friend",
    relationship: "Friend",
    house: "Gryffindor",
    summary: "Harry's best mate and a loyal friend. Known for his humor and bravery.",
    image: "/Ron.png",
    traits: ["Loyal", "Funny", "Supportive", "Gryffindor"],
    famousQuote: "Don't let the muggles get you down.",
    wand: "Willow, 14\", Unicorn hair",
    patronus: "Jack Russell Terrier",
    video: "/video/ron.mp4",
  },
  {
    id: 4,
    name: "Albus Dumbledore",
    role: "Mentor & Headmaster",
    relationship: "Guide",
    house: "Gryffindor",
    summary: "The wise headmaster of Hogwarts and mentor to Harry. Believes in love and truth.",
    image: "/Professor Dumbledore.jpg",
    traits: ["Wise", "Powerful", "Compassionate", "Order of the Phoenix"],
    famousQuote: "It does not do to dwell on dreams and forget to live.",
    wand: "Elder Wand",
    patronus: "Phoenix",
    video: "/video/dumbledore.mp4",
  },
  {
    id: 5,
    name: "Lord Voldemort",
    role: "The Dark Lord",
    relationship: "Enemy",
    house: "Slytherin",
    summary: "Dark wizard lusting for power and immortality. Fears only death and Harry.",
    image: "/voldermort.jpg",
    traits: ["Feared", "Cunning", "Power-hungry", "Slytherin"],
    famousQuote: "There is no good and evil, there is only power and those too weak to seek it.",
    wand: "Yew, 13½\", Phoenix Feather",
    patronus: null,
    video: "/video/voldemort.mp4",
  },
];

const InfoTile = memo(({ label, value }) => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
    <div className="text-[11px] uppercase tracking-wide text-white/50 font-serif">{label}</div>
    <div className="text-sm text-white/90 mt-0.5 font-serif">{value}</div>
  </div>
));

const Card = memo(({ data, onClick }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const handleHoverStart = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, []);

  const handleHoverEnd = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const handleClick = useCallback(() => {
    if (isAnimatingRef.current) return;
    const el = cardRef.current;
    if (!el) { onClick?.(); return; }
    
    isAnimatingRef.current = true;
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .set(el, { transformOrigin: "50% 60%", transformPerspective: 900, willChange: "transform", force3D: true })
      .to(el, { duration: 0.28, rotateX: -18, z: 60, scale: 1.04 })
      .to(el, { duration: 0.34, rotateX: 0, z: 0, scale: 1 })
      .add(() => {
        onClick?.();
        gsap.set(el, { clearProps: "transform,willChange" });
        isAnimatingRef.current = false;
      });
  }, [onClick]);

  return (
    <div style={{ perspective: 1000 }}>
      <div
        onClick={handleClick}
        ref={cardRef}
        className="char-card group transform-gpu rounded-xl overflow-hidden border border-yellow-400/20 bg-white/5 cursor-pointer"
      >
        <div className="relative aspect-[2/3] bg-black/50" onMouseEnter={handleHoverStart} onMouseLeave={handleHoverEnd}>
          {data.video ? (
            <video
              ref={videoRef}
              src={data.video}
              poster={data.image}
              playsInline
              muted
              preload="none"
              className="w-full h-full object-cover filter grayscale transition duration-300 group-hover:grayscale-0"
            />
          ) : (
            <img src={data.image} alt={data.name} loading="lazy" className="w-full h-full object-cover filter grayscale transition duration-300 group-hover:grayscale-0" />
          )}
          <span className="absolute left-3 top-3 text-xs px-2 py-1 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
            {data.house}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl text-yellow-300">{data.name}</h2>
              <p className="text-sm text-white/70 mt-1 font-serif">{data.role}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-serif bg-yellow-400/15 text-yellow-300 border border-yellow-400/20">
              {data.relationship}
            </span>
          </div>
          <p className="text-sm text-white/70 mt-3 line-clamp-2 font-serif">{data.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2 font-serif">
            {data.traits?.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded border border-white/10 bg-white/10">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const Modal = memo(({ selected, onClose }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    if (!selected) return;
    gsap.timeline()
      .set(overlayRef.current, { autoAlpha: 0 })
      .set(contentRef.current, { autoAlpha: 0, scale: 0.92, y: 16 })
      .to(overlayRef.current, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0)
      .to(contentRef.current, { autoAlpha: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" }, 0.05)
      .from(".trait-badge", { autoAlpha: 0, y: 8, stagger: 0.06, duration: 0.25, ease: "power2.out" }, "<+0.1");
  }, [selected]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!selected) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div ref={contentRef} className="relative w-full max-w-3xl rounded-2xl border border-yellow-400/20 bg-[rgb(12,12,16)] shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute right-3 top-3 z-10 text-white/70 hover:text-white text-xl">×</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative aspect-[4/5] md:aspect-auto md:h-full bg-black/50">
            <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl text-yellow-300">{selected.name}</h2>
                <p className="text-sm font-serif text-white/70 mt-1">{selected.role}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/20">{selected.relationship}</span>
            </div>
            <blockquote className="mt-4 border-l-2 border-yellow-400/30 pl-3 italic font-serif text-white/90">"{selected.famousQuote}"</blockquote>
            <p className="text-sm font-serif text-white/80 mt-4">{selected.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.traits?.map((t) => (
                <span key={t} className="trait-badge text-xs px-2 py-1 font-serif rounded border border-white/10 bg-white/5">{t}</span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoTile label="House" value={selected.house} />
              <InfoTile label="Wand" value={selected.wand} />
              <InfoTile label="Patronus" value={selected.patronus || "—"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function Character() {
  const containerRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const closeModal = useCallback(() => setSelected(null), []);

  useGSAP(() => {
    const cards = gsap.utils.toArray(".char-card");
    gsap.set(cards, { autoAlpha: 0, y: 28, scale: 0.95, transformOrigin: "50% 60%" });
    gsap.to(cards, {
      autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", stagger: 0.18,
    });
  }, { scope: containerRef });

  const cardElements = useMemo(() => 
    harryPotterCharacters.map((c) => (
      <Card key={c.id} data={c} onClick={() => setSelected(c)} />
    )), 
  []);

  return (
    <div className="hp-site min-h-screen w-full bg-[rgb(5,5,7)] text-white" ref={containerRef}>
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6">
        <h1 className="hp-brand text-4xl">Characters</h1>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardElements}
        </div>
      </div>
      <Modal selected={selected} onClose={closeModal} />
    </div>
  );
}

export default Character;
