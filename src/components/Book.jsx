import React, { useEffect, useRef, useState, useCallback } from "react";

const PageFlipBook = () => {
  const book = useRef();
  const autoTimer = useRef(null);
  const [HTMLFlipBook, setHTMLFlipBook] = useState(null);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);

  // Chapter content stored inside the component
  const chapters = [
    {
      title: "Chapter 1: The Boy Who Lived",
      content:
        "We’re introduced to the Dursleys, an ordinary British family. Strange events take place as wizards celebrate Voldemort's downfall. Dumbledore and Hagrid leave baby Harry at the Dursleys' doorstep.",
      footer: "Harry Potter Book 1",
      image: "/images/ch1.jpg",
      video: "https://www.youtube.com/watch?si=gij1cMn1-5kbZ-x5&v=VyHV0BRtdxo&feature=youtu.be",
    },
    {
      title: "Chapter 2: The Vanishing Glass",
      content:
        "Harry grows up neglected by the Dursleys. During a zoo trip, Harry unknowingly talks to a snake and makes the glass disappear. Strange things always happen around Harry.",
      footer: "Harry Potter Book 1",
      image: "/images/ch2.jpg",
      video: "https://www.youtube.com/watch?si=h86b6uDZG7XLT_Vv&v=nE11U5iBnH0&feature=youtu.be",
    },
    {
      title: "Chapter 3: The Letters from No One",
      content:
        "Harry receives mysterious letters, which the Dursleys try to stop him from reading. The family goes into hiding, but the letters keep coming.",
      footer: "Harry Potter Book 1",
      image: "/images/ch3.jpg",
      video: "https://www.youtube.com/watch?si=luMdxRgVJs8IRkB9&v=VwErvYgoH70&feature=youtu.be",
    },
    {
      title: "Chapter 4: The Keeper of the Keys",
      content:
        "Hagrid bursts in on Harry's 11th birthday to bring him his Hogwarts letter. Harry learns he’s a wizard and about his past involving Voldemort.",
      footer: "Harry Potter Book 1",
      image: "/images/ch4.jpg",
      video: "https://www.youtube.com/watch?si=uC-W6IZ4VNFJHNa9&v=80kuiBq95So&feature=youtu.be",
    },
    {
      title: "Chapter 5: Diagon Alley",
      content:
        "Hagrid takes Harry to the magical marketplace, Diagon Alley. Harry buys school supplies and finds out he's famous in the wizarding world. He gets Hedwig the owl and a wand from Ollivanders.",
      footer: "Harry Potter Book 1",
      image: "/images/ch5.jpg",
      video: "https://www.youtube.com/watch?si=_LHwjDa6inkTcj6&v=LLAaW1EgyY8&feature=youtu.be",
    },
    {
      title: "Chapter 6: The Journey from Platform Nine and Three-Quarters",
      content:
        "Harry leaves for Hogwarts. He befriends Ron Weasley on the Hogwarts Express. We meet Hermione, Neville, Draco, and other key characters.",
      footer: "Harry Potter Book 1",
      image: "/images/ch6.jpg",
      video: "https://www.youtube.com/watch?si=LZ554h3SAM9xINN6&v=tAiy66Xrsz4&feature=youtu.be",
    },
    {
      title: "Chapter 7: The Sorting Hat",
      content:
        "Students arrive at Hogwarts and are sorted into houses. Harry is placed in Gryffindor, along with Ron and Hermione. We meet teachers like Snape, McGonagall, and Dumbledore.",
      footer: "Harry Potter Book 1",
      image: "/images/ch7.jpg",
      video: "https://www.youtube.com/watch?si=NxHGb8XQ18gDNqkJ&v=Su1LOpjvdZ4&feature=youtu.be",
    },
    {
      title: "Chapter 8: The Potions Master",
      content:
        "Harry attends his first classes. Snape seems to hate Harry for unknown reasons. Harry starts to suspect that something is being guarded at Hogwarts.",
      footer: "Harry Potter Book 1",
      image: "/images/ch8.jpg",
      video: "https://www.youtube.com/watch?si=QcnTzOoA6upVKK0v&v=mObK5XD8udk&feature=youtu.be",
    },
  ];

  const getEmbedUrl = (url) => {
    try {
      const u = new URL(url);
      let id = "";
      if (u.hostname.includes("youtu.be")) {
        id = u.pathname.replace("/", "");
      } else {
        id = u.searchParams.get("v") || "";
      }
      return id ? `https://www.youtube.com/embed/${id}` : url;
    } catch (e) {
      return url;
    }
  };

  const getFlip = useCallback(() => {
    try {
      return book.current?.pageFlip?.() ?? null;
    } catch {
      return null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (autoTimer.current) {
      clearInterval(autoTimer.current);
      autoTimer.current = null;
    }
  }, []);

  const pauseAuto = useCallback(() => {
    clearTimer();
    setAutoPlaying(false);
    setPaused(true);
  }, [clearTimer]);

  const flipOnce = useCallback(() => {
    const flip = getFlip();
    if (!flip) {
      clearTimer();
      setAutoPlaying(false);
      return false;
    }

    const current = flip.getCurrentPageIndex();
    const total = flip.getPageCount();
    if (current >= total - 1) {
      clearTimer();
      setAutoPlaying(false);
      setPaused(false);
      setFinished(true);
      return false;
    }

    flip.flipNext();
    return true;
  }, [getFlip, clearTimer]);

  const runAutoInterval = useCallback(() => {
    clearTimer();
    autoTimer.current = window.setInterval(() => {
      flipOnce();
    }, 3500);
  }, [clearTimer, flipOnce]);

  const startAuto = useCallback(() => {
    const flip = getFlip();
    if (!flip) return;

    clearTimer();
    setFinished(false);
    setPaused(false);
    setAutoPlaying(true);

    const begin = () => {
      flipOnce();
      runAutoInterval();
    };

    // Fresh play / repeat always starts from cover
    if (flip.getCurrentPageIndex() > 0) {
      flip.turnToPage(0);
      window.setTimeout(begin, 50);
    } else {
      begin();
    }
  }, [getFlip, clearTimer, flipOnce, runAutoInterval]);

  const resumeAuto = useCallback(() => {
    const flip = getFlip();
    if (!flip) return;

    setPaused(false);
    setFinished(false);
    setAutoPlaying(true);

    flipOnce();
    runAutoInterval();
  }, [getFlip, flipOnce, runAutoInterval]);

  const toggleAuto = useCallback(() => {
    if (autoPlaying) pauseAuto();
    else if (paused) resumeAuto();
    else startAuto();
  }, [autoPlaying, paused, pauseAuto, resumeAuto, startAuto]);

  const buttonLabel = autoPlaying
    ? "Pause"
    : finished
      ? "Repeat on Auto"
      : paused
        ? "Resume"
        : "Play on Auto";

  useEffect(() => {
    let active = true;
    import("react-pageflip")
      .then((mod) => {
        if (active) setHTMLFlipBook(() => mod.default);
      })
      .catch((err) => {
        console.error("Failed to load react-pageflip:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const BOOK_W = 380;
  const BOOK_H = 532;

  return (
    <div className="grid min-h-[calc(100vh-6rem)] w-full grid-cols-1 gap-8 overflow-visible bg-black px-6 py-8 lg:grid-cols-2 lg:px-10">
      {/* Left: book + controls — double-width slot so open left page stays visible */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 overflow-visible lg:items-start">
        <button
          type="button"
          onClick={toggleAuto}
          disabled={!HTMLFlipBook}
          className="relative z-20 rounded border border-yellow-400/40 bg-yellow-500 px-8 py-3 text-lg font-semibold tracking-wide text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 lg:ml-[calc(50%-0.5rem)] lg:-translate-x-1/2"
        >
          {buttonLabel}
        </button>

        {HTMLFlipBook ? (
          <div
            className="relative z-10 shrink-0 overflow-visible"
            style={{ width: BOOK_W * 2, minWidth: BOOK_W * 2 }}
          >
            <HTMLFlipBook
              width={BOOK_W}
              height={BOOK_H}
              size="fixed"
              autoSize={false}
              className="flip-book shadow-xl"
              showCover={true}
              useMouseEvents={true}
              ref={book}
            >
              <div className="page flex h-full w-full items-center justify-center bg-[url('/frontpage.jpg')] bg-cover bg-center text-2xl font-bold uppercase text-black" />

              {chapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="page flex flex-col justify-between bg-gray-200 p-5 text-gray-800"
                >
                  <h2 className="page-header mb-2 text-base font-bold">{chapter.title}</h2>
                  <img
                    src={chapter.image}
                    alt={chapter.title}
                    className="mb-3 h-28 w-full rounded-lg object-cover"
                  />
                  <p className="flex-1 font-sans text-sm leading-relaxed">{chapter.content}</p>
                  {chapter.video && (
                    <div className="mt-3">
                      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                        <iframe
                          src={getEmbedUrl(chapter.video)}
                          title={`YouTube video for ${chapter.title}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute top-0 left-0 h-full w-full rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                  <p className="page-footer mt-3 text-right font-sans text-xs italic">
                    {chapter.footer}
                  </p>
                </div>
              ))}

              <div className="page flex items-center justify-center bg-[url('/backpage.jpg')] bg-cover bg-center text-lg font-bold uppercase text-black" />
            </HTMLFlipBook>
          </div>
        ) : (
          <div className="text-white/80">Loading book...</div>
        )}
      </div>

      {/* Right: Harry video — responsive panel */}
      <aside className="relative flex w-full items-center justify-center py-4 sm:py-6 lg:min-h-[calc(100vh-7rem)]">
        <video
          src="/3d-model/harry-keyed.webm"
          className="h-auto max-h-[55vh] w-[72%] max-w-[420px] bg-transparent object-contain sm:max-h-[60vh] sm:w-[68%] sm:max-w-[460px] lg:max-h-[70vh] lg:w-[85%] lg:max-w-[520px]"
          style={{ mixBlendMode: "screen" }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={(e) => {
            const el = e.currentTarget;
            if (el.src.includes("-keyed")) {
              el.src = "/3d-model/harry_potter_cos_gamecubexbox-ascii.webm";
              el.load();
              el.play().catch(() => {});
            }
          }}
        />
      </aside>
    </div>
  );
};

export default PageFlipBook;
