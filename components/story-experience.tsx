"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gallery, letter as fallbackLetter, type LetterContent } from "@/lib/story";

type SlideId = "begin" | "words" | "face" | "voice" | "smile" | "gallery" | "letter" | "end";

const slides: { id: SlideId; label: string; number: string }[] = [
  { id: "begin", label: "Shuruaat", number: "01" },
  { id: "words", label: "Baaton ka jaadu", number: "02" },
  { id: "face", label: "Ek tasveer", number: "03" },
  { id: "voice", label: "Awaaz ka note", number: "04" },
  { id: "smile", label: "Muskaan", number: "05" },
  { id: "gallery", label: "Yaadon ki gallery", number: "06" },
  { id: "letter", label: "Ek khat", number: "07" },
  { id: "end", label: "Aakhri gulaab", number: "08" }
];

const petals = Array.from({ length: 22 }, (_, index) => ({
  left: `${(index * 37 + 9) % 100}%`,
  delay: (index % 9) * 1.45,
  duration: 13 + (index % 7) * 2.1,
  size: 7 + (index % 5) * 2,
  drift: (index % 2 === 0 ? 1 : -1) * (20 + (index % 6) * 11)
}));

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`arrow-icon ${direction === "left" ? "arrow-left" : ""}`}>
      <path d="M4.5 12h14M12.5 5.5 19 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RoseMark() {
  return <span className="rose-mark" aria-hidden="true">✿</span>;
}

export default function StoryExperience() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [glowMode, setGlowMode] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [letter, setLetter] = useState<LetterContent>(fallbackLetter);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/letter", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Letter service unavailable");
        return response.json() as Promise<LetterContent>;
      })
      .then((data) => { if (live && data?.paragraphs?.length) setLetter(data); })
      .catch(() => { /* The bundled letter remains available if the API is offline. */ });
    return () => { live = false; };
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const goTo = useCallback((index: number) => {
    setActive(Math.max(0, Math.min(slides.length - 1, index)));
    setLightbox(null);
    setLetterOpen(false);
    setSecretOpen(false);
  }, []);

  const next = useCallback(() => goTo(active === slides.length - 1 ? 0 : active + 1), [active, goTo]);
  const previous = useCallback(() => goTo(active === 0 ? slides.length - 1 : active - 1), [active, goTo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (lightbox !== null) {
        if (event.key === "Escape") setLightbox(null);
        if (event.key === "ArrowRight") setLightbox((index) => index === null ? null : (index + 1) % gallery.length);
        if (event.key === "ArrowLeft") setLightbox((index) => index === null ? null : (index - 1 + gallery.length) % gallery.length);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") next();
      if (event.key === "ArrowLeft" || event.key === "PageUp") previous();
      if (event.key === "Escape") { setLetterOpen(false); setSecretOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, next, previous]);

  const shareSite = useCallback(async () => {
    const shareData = {
      title: "Dhwani — Ek Midnight Rose",
      text: "Dhwani, tumhare liye ek chhota sa Princess Day surprise. 🌹",
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        notify("Link copy ho gaya — ab bhej do! 🌹");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") notify("Share nahi hua. Link address bar se copy kar lo.");
    }
  }, [notify]);

  const copyLetter = useCallback(async () => {
    const text = `${letter.title}\n\n${letter.paragraphs.join("\n\n")}\n\n${letter.poem.join("\n")}\n\n${letter.signoff}`;
    try {
      await navigator.clipboard.writeText(text);
      notify("Khat copy ho gaya. 💌");
    } catch {
      notify("Copy block hua — khat ko select karke copy kar sakte ho.");
    }
  }, [letter, notify]);

  const downloadLetter = useCallback(() => {
    const text = `${letter.title}\n${letter.subtitle}\n\n${letter.paragraphs.join("\n\n")}\n\n${letter.poem.join("\n")}\n\n${letter.signoff}`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Dhwani-ke-naam-ek-khat.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    notify("Tumhara khat save ho gaya. ✨");
  }, [letter, notify]);

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchEnd.current = null;
    touchStart.current = event.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    touchEnd.current = event.changedTouches[0]?.clientX ?? null;
    if (touchStart.current === null || touchEnd.current === null) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) > 70) distance > 0 ? next() : previous();
  };

  const currentSlide = slides[active];
  const backgroundPetals = useMemo(() => petals, []);

  return (
    <main className={`experience ${glowMode ? "glow-mode" : ""}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="film-grain" aria-hidden="true" />
      <div className="ambient-halo halo-one" aria-hidden="true" />
      <div className="ambient-halo halo-two" aria-hidden="true" />
      <div className="petal-field" aria-hidden="true">
        {!reduceMotion && backgroundPetals.map((petal, index) => (
          <motion.i
            className="falling-petal"
            key={index}
            style={{ left: petal.left, width: petal.size, height: petal.size * 1.55 }}
            initial={{ y: "-12vh", x: 0, rotate: -35, opacity: 0 }}
            animate={{ y: "112vh", x: petal.drift, rotate: 320, opacity: [0, 0.55, 0.5, 0] }}
            transition={{ duration: reduceMotion ? 0 : petal.duration, delay: petal.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <header className="topbar">
        <button className="brand-lockup" onClick={() => goTo(0)} aria-label="Kahaani ki shuruaat par jao">
          <span className="brand-symbol"><RoseMark /></span>
          <span><strong>MIDNIGHT GULAAB</strong><small>EK CHHOTI SI KAHANI</small></span>
        </button>
        <div className="topbar-right">
          <span className="recipient-chip"><span className="status-dot" /> DHWANI KE LIYE</span>
          <button className={`glow-toggle ${glowMode ? "is-on" : ""}`} onClick={() => setGlowMode((value) => !value)} aria-pressed={glowMode}>
            <span aria-hidden="true">✧</span> {glowMode ? "Roshni on" : "Roshni badhao"}
          </button>
          <button className="share-button" onClick={shareSite} aria-label="Website share karo" title="Website share karo">
            <ShareGlyph /> <span>Bhejo</span>
          </button>
        </div>
      </header>

      <div className="top-progress" aria-label={`Slide ${active + 1} of ${slides.length}`}>
        <div className="top-progress-fill" style={{ width: `${((active + 1) / slides.length) * 100}%` }} />
      </div>

      <div className="story-shell">
        <aside className="side-rail" aria-label="Story slides">
          <span className="rail-caption">KAHANI</span>
          <div className="rail-lines">
            {slides.map((slide, index) => (
              <button key={slide.id} className={`rail-dot ${active === index ? "active" : ""}`} onClick={() => goTo(index)} aria-label={`${slide.number} ${slide.label}`} aria-current={active === index ? "step" : undefined}>
                <span>{slide.number}</span>
              </button>
            ))}
          </div>
          <span className="rail-bottom">SWIPE / AAGE BADHO</span>
        </aside>

        <div className="story-main">
          <div className="slide-meta">
            <span><i /> PRINCESS DAY · 18 NOVEMBER</span>
            <span className="slide-counter">{currentSlide.number} <b>/</b> 08</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={currentSlide.id}
              className="story-slide"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18, filter: "blur(5px)" }}
              transition={{ duration: reduceMotion ? 0.01 : 0.62, ease: [0.22, 1, 0.36, 1] }}
              aria-live="polite"
            >
              {currentSlide.id === "begin" && <CoverSlide onContinue={next} />}
              {currentSlide.id === "words" && <WordsSlide />}
              {currentSlide.id === "face" && <PortraitSlide />}
              {currentSlide.id === "voice" && <VoiceSlide />}
              {currentSlide.id === "smile" && <SmileSlide />}
              {currentSlide.id === "gallery" && <GallerySlide onOpen={setLightbox} />}
              {currentSlide.id === "letter" && <LetterSlide letter={letter} open={letterOpen} setOpen={setLetterOpen} onCopy={copyLetter} onDownload={downloadLetter} />}
              {currentSlide.id === "end" && <FinaleSlide onShare={shareSite} secretOpen={secretOpen} setSecretOpen={setSecretOpen} />}
            </motion.section>
          </AnimatePresence>

          <footer className="story-controls">
            <div className="control-left">
              <button className="nav-previous" onClick={previous}><ArrowIcon direction="left" /> <span>PEECHE</span></button>
              <div className="control-progress"><span style={{ width: `${((active + 1) / slides.length) * 100}%` }} /></div>
              <span className="control-step">{String(active + 1).padStart(2, "0")} — 08</span>
            </div>
            <div className="control-right">
              <div className="mini-dots" aria-label="Slide selection">
                {slides.map((slide, index) => <button key={slide.id} onClick={() => goTo(index)} className={active === index ? "active" : ""} aria-label={`${slide.label} par jao`} />)}
              </div>
              <button className="nav-next" onClick={next}>{active === slides.length - 1 ? "PHIR SE" : "AAGE"} <ArrowIcon /></button>
            </div>
          </footer>
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <GalleryLightbox index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />
        )}
        {toast && (
          <motion.div className="toast-message" role="status" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <RoseMark /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bottom-signature"><span>EK CHHOTI SI WISH</span><span>PYAAR SE BANAYA · DAKSH MANISH BISHT</span></div>
    </main>
  );
}

function CoverSlide({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="cover-layout">
      <div className="cover-copy">
        <motion.div className="eyebrow" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}><span /> EK RAAT · EK GULAAB · EK KAHANI</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
          Dhwani<span className="title-comma">,</span><br /><em>yeh raat</em><br />tumhare naam.
        </motion.h1>
        <motion.p className="cover-lede" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.56 }}>
          Kuch baatein hoti hain jo simple si hoti hain, phir bhi yaad reh jaati hain. Aaj unhi baaton ke naam ek chhota sa royal surprise.
        </motion.p>
        <motion.div className="cover-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 }}>
          <button className="primary-button" onClick={onContinue}>Kahaani shuru karein <ArrowIcon /></button>
          <span className="cover-note">Aaram se dekhna · koi jaldi nahi</span>
        </motion.div>
        <div className="cover-bottomline"><span>01 / 08</span><span className="tiny-divider" /><span>THODI SI RAAT KI JAADUGARI</span></div>
      </div>
      <div className="cover-art">
        <div className="cover-orbit orbit-a" /><div className="cover-orbit orbit-b" />
        <div className="cover-photo-frame">
          <Image src="/gallery/portrait-2.webp" alt="Dhwani ke portrait ka royal frame" fill priority sizes="(max-width: 760px) 78vw, 38vw" className="cover-photo" />
          <div className="photo-vignette" />
        </div>
        <motion.div className="floating-seal" animate={{ y: [0, -10, 0], rotate: [-4, 3, -4] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>
          <span className="seal-star">✦</span><span>FOR</span><strong>D</strong><span>ONLY</span>
        </motion.div>
        <motion.div className="rose-stamp" animate={{ rotate: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity }}><RoseMark /></motion.div>
        <div className="art-caption"><span>TASVEER 01</span><span>FRAME MEIN TUM</span></div>
      </div>
    </div>
  );
}

function WordsSlide() {
  const words = [
    { number: "I", title: "Thodi si masti", text: "Kabhi ek chhota sa tease, kabhi woh unexpected reply — tumhari chats mein ek playful spark rehta hai." },
    { number: "II", title: "Thodi si shayari", text: "Tumhara mujhe ‘poet’ kehna aur phir ‘wah wah’ bol dena — chhoti baat thi, par yaad reh gayi." },
    { number: "III", title: "Apni si clarity", text: "Tum jo feel karti ho, use seedhe words mein keh deti ho. Yeh quality genuinely respect karne layak hai." }
  ];
  return (
    <div className="editorial-slide words-slide">
      <div className="section-kicker">02 · BAATON KE BEECH</div>
      <div className="editorial-heading-row"><h2>Kuch baatein,<br /><em>jo yaad reh gayin.</em></h2><p>Har conversation ek kahaani nahi hoti. Kabhi-kabhi bas kuch lines hi kaafi hoti hain.</p></div>
      <div className="word-cards">
        {words.map((word, index) => (
          <motion.article className="word-card" key={word.number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }}>
            <span className="word-number">{word.number}</span><div className="word-rule" /><h3>{word.title}</h3><p>{word.text}</p><span className="card-ornament">✧</span>
          </motion.article>
        ))}
      </div>
      <div className="quote-strip"><span>“</span><p>Keep smiling and spreading happiness.</p><small>— EK CHHOTI SI WISH</small></div>
    </div>
  );
}

function PortraitSlide() {
  return (
    <div className="portrait-layout">
      <div className="portrait-image-wrap">
        <Image src="/gallery/portrait-1.webp" alt="Dhwani ka portrait, red printed outfit mein" fill sizes="(max-width: 760px) 78vw, 38vw" className="portrait-image" />
        <div className="portrait-image-shade" />
        <span className="portrait-photo-tag">YAAD REHNE WALA FRAME · 03</span>
        <span className="portrait-image-flower">✿</span>
      </div>
      <div className="portrait-copy">
        <div className="section-kicker">03 · CHHOTI CHHOTI BAATEIN</div>
        <h2>Chehre par<br /><em>thehri hui roshni.</em></h2>
        <p className="lead-copy">Tumhari photos mein ek natural sa andaaz dikhta hai — bina extra effort ke, apne jaisa.</p>
        <p className="body-copy">Kabhi-kabhi camera sirf ek moment capture karta hai, par us moment ka feel usse thoda zyada hota hai. Tumhare expressions mein woh simplicity hai jo frame ko warm bana deti hai. Na kisi perfect pose ki zaroorat, na kisi heavy filter ki.</p>
        <div className="scribble-note"><span>✧</span> “Khoobsurati kabhi-kabhi bas apne jaisa rehne mein hoti hai.”</div>
      </div>
    </div>
  );
}

function VoiceSlide() {
  return (
    <div className="voice-layout">
      <div className="voice-copy">
        <div className="section-kicker">04 · TUMHARI AAWAAZ KE NAAM</div>
        <h2>Kuch awaazein,<br /><em>pal ban kar reh jaati hain.</em></h2>
        <p className="lead-copy">Tumhari voice note ka woh chhota sa moment bhi is kahaani ka hissa hai.</p>
        <p className="body-copy">Kabhi words screen par padhte hain, aur kabhi kisi ki awaaz un words ko ek alag sa ehsaas de deti hai. Main tumhari awaaz ko kisi filmy adjective mein bandhna nahi chahta — bas itna ki us moment ne normal si chat ko ek real, yaad rehne wali baat bana diya.</p>
        <p className="body-copy muted-copy">Kuch cheezein describe karne se zyada mehsoos karne ke liye hoti hain.</p>
      </div>
      <div className="voice-art">
        <div className="voice-circle circle-outer" /><div className="voice-circle circle-mid" /><div className="voice-circle circle-inner" />
        <div className="voice-center"><span className="voice-symbol">♫</span><span>EK CHHOTA SA MOMENT</span><small>KOI RECORDING NAHI · BAS EK YAAD</small></div>
        <div className="waveform" aria-hidden="true">{Array.from({ length: 31 }, (_, index) => <i key={index} style={{ height: `${12 + ((index * 17) % 44)}px`, animationDelay: `${(index % 7) * -0.22}s` }} />)}</div>
        <span className="voice-side-note">EK PAL KI AAWAAZ</span>
      </div>
    </div>
  );
}

function SmileSlide() {
  return (
    <div className="smile-layout">
      <div className="smile-photo">
        <Image src="/gallery/portrait-3.webp" alt="Dhwani ki ek smiling portrait photo" fill sizes="(max-width: 760px) 78vw, 35vw" className="smile-image" />
        <div className="smile-photo-overlay" />
        <span className="smile-vertical">ANDHERE MEIN EK ROSHNI</span>
      </div>
      <div className="smile-copy">
        <div className="section-kicker">05 · MUSKAAN KE NAAM</div>
        <h2>Ek muskaan,<br /><em>hazaar soft moments.</em></h2>
        <p className="lead-copy">Tumhari smile mein ek simple si warmth hai.</p>
        <p className="body-copy">Koi loud announcement nahi, koi dramatic entry nahi — bas ek natural si muskaan jo photo ko aur zinda kar deti hai. Jaise shaam ke waqt window se aati halki roshni; chhoti si, par poore scene ka mood badal de.</p>
        <div className="smile-quote"><span>“</span><p>Keep that smile. Duniya ko uski zaroorat hai.</p></div>
        <span className="handwritten">— ek achhi vibe ki tareef karne wale ki taraf se</span>
      </div>
    </div>
  );
}

function GallerySlide({ onOpen }: { onOpen: (index: number) => void }) {
  return (
    <div className="gallery-slide">
      <div className="gallery-heading"><div><div className="section-kicker">06 · CHAAR PYAARE FRAME</div><h2>Yaadon ki<br /><em>chhoti si gallery.</em></h2></div><p>Har photo par tap karo — frame thoda aur paas aa jayega.</p></div>
      <div className="photo-grid">
        {gallery.map((photo, index) => (
          <motion.button className={`gallery-tile gallery-tile-${index + 1}`} key={photo.src} onClick={() => onOpen(index)} whileHover={{ y: -7, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
            <span className="gallery-image-box"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) 42vw, 24vw" className="gallery-image" /></span>
            <span className="gallery-tile-caption"><span>0{index + 1}</span><strong>{photo.caption}</strong><i>↗</i></span>
          </motion.button>
        ))}
      </div>
      <div className="gallery-footnote"><span>✧</span> Chaar frames · Apne-apne andaaz mein khoobsurat</div>
    </div>
  );
}

function LetterSlide({ letter, open, setOpen, onCopy, onDownload }: { letter: LetterContent; open: boolean; setOpen: (value: boolean) => void; onCopy: () => void; onDownload: () => void }) {
  return (
    <div className="letter-slide">
      <div className="letter-heading"><div className="section-kicker">07 · PYAAR SE BANDHAA KHAT</div><h2>Ek khat,<br /><em>sirf tumhare naam.</em></h2><p>Is envelope ko kholo. Andar kuch alfaaz hain, jo araam se padhne ke liye likhe gaye hain.</p></div>
      {!open ? (
        <motion.button className="envelope-stage" onClick={() => setOpen(true)} whileHover={{ y: -7 }} whileTap={{ scale: 0.98 }} aria-label="Khat kholo">
          <div className="envelope-back" /><div className="envelope-paper"><span>DH WANI</span><RoseMark /><small>EK CHHOTI SI WISH</small></div><div className="envelope-front" /><div className="envelope-flap" /><div className="wax-seal">D</div>
          <span className="envelope-open-label">KHOLNE KE LIYE TAP KARO</span>
        </motion.button>
      ) : (
        <motion.article className="letter-paper" initial={{ opacity: 0, y: 24, rotateX: -7 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.72 }}>
          <div className="letter-paper-top"><span>18 · 11 · 2026</span><span>EK APNA SA NOTE</span></div>
          <h3>{letter.title}</h3><p className="letter-subtitle">{letter.subtitle}</p>
          <div className="letter-body">{letter.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <div className="letter-poem">{letter.poem.map((line) => <span key={line}>{line}</span>)}</div>
          <p className="letter-signoff">{letter.signoff.split("\n").map((line) => <span key={line}>{line}</span>)}</p>
          <div className="letter-actions"><button onClick={onCopy}>KHAT COPY KARO</button><button onClick={onDownload}>NOTE SAVE KARO ↓</button><button onClick={() => setOpen(false)}>WAAPAS BAND KARO ↺</button></div>
        </motion.article>
      )}
    </div>
  );
}

function FinaleSlide({ onShare, secretOpen, setSecretOpen }: { onShare: () => void; secretOpen: boolean; setSecretOpen: (value: boolean) => void }) {
  return (
    <div className="finale-slide">
      <div className="finale-rose" aria-hidden="true"><span>✿</span><i /><b /></div>
      <div className="finale-copy">
        <div className="section-kicker">08 · AAKHRI GULAAB</div>
        <p className="finale-overline">USKE NAAM JO APNI KAHANI KHUD LIKHTI HAI</p>
        <h2>Keep shining,<br /><em>Princess Dhwani.</em></h2>
        <p className="finale-message">Tumhari kahaani tumhari marzi se likhi jaaye — aur uske har chapter mein hasi, sukoon aur naye sapne ho.</p>
        <button className="secret-button" onClick={() => setSecretOpen(!secretOpen)}>{secretOpen ? "NOTE BAND KARO −" : "EK AAKHRI BAAT +"}</button>
        <AnimatePresence>{secretOpen && <motion.p className="secret-note" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>Agar kabhi din thoda dull lage, toh yaad rakhna — tumhari smile, tumhari masti aur tumhari apni si energy already kaafi special hai. Bas khush rehna. 🌷</motion.p>}</AnimatePresence>
        <button className="final-share" onClick={onShare}>YEH CHHOTI SI WISH BHEJO <ArrowIcon /></button>
        <p className="finale-sign">With warmth,<br /><strong>Daksh Manish Bisht</strong></p>
      </div>
      <span className="finale-stamp">BAS<br /><i>ITNA HI</i></span>
    </div>
  );
}

function GalleryLightbox({ index, onClose, onChange }: { index: number; onClose: () => void; onChange: (index: number) => void }) {
  const item = gallery[index];
  return (
    <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Gallery band karo">×</button>
      <button className="lightbox-arrow lightbox-prev" onClick={(event) => { event.stopPropagation(); onChange((index - 1 + gallery.length) % gallery.length); }} aria-label="Pichhli photo">‹</button>
      <motion.div className="lightbox-content" key={item.src} initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={(event) => event.stopPropagation()}>
        <div className="lightbox-photo"><Image src={item.src} alt={item.alt} fill sizes="(max-width: 760px) 90vw, 70vw" className="lightbox-image" priority /></div>
        <div className="lightbox-caption"><span>0{index + 1} / 04</span><strong>{item.caption}</strong><p>{item.detail}</p></div>
      </motion.div>
      <button className="lightbox-arrow lightbox-next" onClick={(event) => { event.stopPropagation(); onChange((index + 1) % gallery.length); }} aria-label="Agli photo">›</button>
    </motion.div>
  );
}

function ShareGlyph() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13.5v5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
