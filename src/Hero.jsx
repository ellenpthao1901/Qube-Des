import { useEffect, useRef, useState } from "react";

const IMAGE_RATIO = 864 / 1152;

// reveal: share of the image hidden below the screen that the layer scrolls into view
const LAYERS = [
  { name: "sky", src: "/assets/hero-sky.webp", rise: 4, grow: 0.03, reveal: 0 },
  { name: "hills", src: "/assets/hero-hills.webp", rise: 22, grow: 0.1, reveal: 0.5 },
  { name: "text" },
  { name: "trees", src: "/assets/hero-trees.webp", rise: 50, grow: 0.3, reveal: 1 },
];

export default function Hero() {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      setOverflow(Math.max(0, window.innerWidth * IMAGE_RATIO - window.innerHeight));
      if (motion.matches) {
        setProgress(0);
        return;
      }
      const distance = track.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-track.getBoundingClientRect().top, 0), distance);
      setProgress(distance <= 0 ? 0 : scrolled / distance);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    motion.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero" ref={trackRef} aria-label="Introduction">
      <div className="hero-stage">
        {LAYERS.map((layer) =>
          layer.name === "text" ? (
            <div
              key={layer.name}
              className="hero-copy"
              style={{ transform: `translateY(${-progress * 20}vh)` }}
            >
              <div className="hero-copy-inner">
                <h1 className="hero-title">Build the Minecraft mod you imagined.</h1>
                <p className="hero-subtitle">
                  Qube helps you build, revise, and extend Minecraft mods with AI-assisted code,
                  assets, Minecraft runs, and in-game review.
                </p>
                <div className="hero-actions">
                  <a className="hero-button hero-button-primary" href="#">
                    Download for Windows
                  </a>
                  <a className="hero-button hero-button-secondary" href="#">
                    Join Discord
                  </a>
                </div>
                <p className="hero-note">For Windows 10 and 11.</p>
              </div>
            </div>
          ) : (
            <div
              key={layer.name}
              className={`hero-layer hero-${layer.name}`}
              style={{
                transform: `translateY(calc(${-progress * layer.rise}vh - ${progress * layer.reveal * overflow}px)) scale(${1 + progress * layer.grow})`,
              }}
              aria-hidden="true"
            >
              <div className="hero-image" style={{ backgroundImage: `url(${layer.src})` }} />
              {layer.name === "trees" && <div className="hero-skirt" />}
            </div>
          ),
        )}
        <div className="hero-fade" style={{ opacity: Math.max(0, progress * 2 - 1) }} aria-hidden="true" />
      </div>
    </section>
  );
}
