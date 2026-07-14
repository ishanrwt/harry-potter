import { useEffect, useRef, useState, memo, useMemo } from "react";
import Navbar from "./components/Navbar";

// Dynamically import 3D component to isolate errors
const ThreeD = memo(function ThreeDWrapper() {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    import("./components/ThreeD")
      .then((mod) => {
        if (mounted) setComponent(() => mod.default);
      })
      .catch(() => {
        if (mounted) setError(true);
      });

    return () => { mounted = false; };
  }, []);

  if (error || !Component) return null;
  
  return <Component />;
});

const videos = [
  "/Harry video/intro.mp4",
  "/Harry video/fight.mp4",
  "/Harry video/fight1.mp4",
  "/Harry video/2nd.mp4",
  "/Harry video/last.mp4",
  "/Harry video/scret.mp4",
  "/Harry video/vold.mp4",
];

const hpTexts = [
  "Expecto Patronum",
  "The Boy Who Lived",
  "Mischief Managed",
  "Expelliarmus",
  "Hogwarts",
  "Gryffindor",
  "Lumos",
];

const textBySrc = Object.fromEntries(videos.map((src, i) => [src, hpTexts[i % hpTexts.length]]));

const LazyVideo = memo(({ src, className }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isVisible && (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
      )}
    </div>
  );
});

const VideoCard = memo(({ src, gridClass }) => (
  <div className={`relative overflow-hidden rounded-xl bg-zinc-900/40 border border-white/10 ${gridClass}`}>
    <LazyVideo src={src} className="w-full h-full" />
    <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    <div className="absolute bottom-3 left-3 z-20 bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm">
      <span className="text-amber-100 text-sm md:text-base font-semibold tracking-wide">{textBySrc[src]}</span>
    </div>
  </div>
));

const gridClasses1 = [
  "col-span-2 md:col-span-3 row-span-2",
  "col-span-2 md:col-span-3 row-span-1",
  "col-span-1 md:col-span-2 row-span-1",
  "col-span-1 md:col-span-1 row-span-1",
];

const gridClasses2 = [
  "col-span-2 md:col-span-4 row-span-2",
  "col-span-2 md:col-span-2 row-span-1",
  "col-span-2 md:col-span-2 row-span-1",
];

function Story() {
  const [show3D, setShow3D] = useState(false);

  // Delay 3D render to avoid blocking initial paint
  useEffect(() => {
    const timer = setTimeout(() => setShow3D(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const firstGrid = useMemo(() => 
    videos.slice(0, 4).map((src, i) => (
      <VideoCard key={src} src={src} gridClass={gridClasses1[i]} />
    )), 
  []);

  const secondGrid = useMemo(() => 
    videos.slice(4).map((src, i) => (
      <VideoCard key={src} src={src} gridClass={gridClasses2[i]} />
    )), 
  []);

  return (
    <div className="hp-site bg-black min-h-screen">
      {/* Hero Section */}
      <div className="h-screen w-full relative text-white overflow-hidden">
        <img src="/sky.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
        <img src="/bg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-[1]" />
        <Navbar />
        
        {/* 3D Scene - loaded after delay */}
        {show3D && (
          <div className="absolute inset-0 z-[2]">
            <ThreeD />
          </div>
        )}
        
        {/* Text overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center max-w-3xl px-6 z-[3] pointer-events-none">
          <h1 className="hp-brand text-8xl drop-shadow-lg">Harry Potter</h1>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-gray-200 drop-shadow-md">
            Harry Potter follows a young wizard who discovers his magical heritage on his eleventh birthday and
            attends Hogwarts School of Witchcraft and Wizardry. Alongside his friends, he faces daunting challenges,
            unravels mysteries about his past, and confronts the dark wizard Lord Voldemort whose return threatens
            both the wizarding and Muggle worlds.
          </p>
        </div>
      </div>

      {/* Video Grid Section */}
      <div className="w-full bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-6 auto-rows-[160px] md:auto-rows-[200px]">
            {firstGrid}
          </div>
          <div className="mt-16 grid gap-4 grid-cols-2 md:grid-cols-6 auto-rows-[160px] md:auto-rows-[200px]">
            {secondGrid}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Story;
