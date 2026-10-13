import { useEffect, useRef, useState } from "react";
import { BODY_WIDTH, CANVAS_WIDTH, STAGE_HEIGHT, features } from "./features.js";
import Hero from "./Hero.jsx";

const NAV = ["Features", "Demo", "How It Works", "Why Qube?", "FAQs"];
const SCROLL_STEPS = features.length - 1;
const STEP_DEGREES = 90;
const CUBE_YAW = 45;
const SIDE_FACES = [
  { name: "front", angle: 0 },
  { name: "right", angle: 90 },
  { name: "back", angle: 180 },
  { name: "left", angle: 270 },
];

const HOLD_SCREENS = 0.5;
const TURN_SCREENS = 1;
const SCROLL_SCREENS = features.length * HOLD_SCREENS + SCROLL_STEPS * TURN_SCREENS;

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function sectionPosition(screens) {
  let remaining = screens;
  for (let step = 0; step < SCROLL_STEPS; step++) {
    if (remaining < HOLD_SCREENS) return step;
    remaining -= HOLD_SCREENS;
    if (remaining < TURN_SCREENS) return step + easeInOut(remaining / TURN_SCREENS);
    remaining -= TURN_SCREENS;
  }
  return SCROLL_STEPS;
}

function sideShade(degrees) {
  const lightFromRight = (Math.sin((degrees * Math.PI) / 180) + 1) / 2;
  const level = Math.round(150 + (217 - 150) * lightFromRight);
  return `rgb(${level}, ${level}, ${level})`;
}

export default function App() {
  const trackRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    let frame = 0;

    const update = () => {
      frame = 0;
      const nextScale = Math.min(
        window.innerWidth / CANVAS_WIDTH,
        window.innerHeight / STAGE_HEIGHT,
        1,
      );
      setScale(nextScale);

      const distance = track.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-track.getBoundingClientRect().top, 0), distance);
      setPosition(sectionPosition(scrolled / window.innerHeight));
      setProgress(distance <= 0 ? 0 : scrolled / distance);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const spin = position * -STEP_DEGREES;

  return (
    <div className="page">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand">
            <img src="/assets/logo.svg" width="43.256" height="36.047" alt="" />
            <span>Qube</span>
          </div>
          <nav className="nav">
            {NAV.map((label) => (
              <span key={label} className="nav-link">
                {label}
              </span>
            ))}
            <span className="waitlist">Join Waitlist</span>
          </nav>
        </div>
      </header>
      <Hero />
      <div
        className="track"
        ref={trackRef}
        style={{ height: `${(1 + SCROLL_SCREENS) * 100}vh` }}
      >
        <div className="sticky-stage">
          <div
            className="scroll-progress"
            role="progressbar"
            aria-label="Section progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div className="scroll-progress-fill" style={{ transform: `scaleY(${progress})` }} />
          </div>
          <div className="canvas" style={{ zoom: scale }}>
            <div className="rule-mask">
              <img
                className="rule-horizontal"
                src="/assets/line-3.svg"
                width="1513"
                height="3"
                alt=""
              />
              <img
                className="rule-left"
                src="/assets/line-1.svg"
                width="1839"
                height="3"
                alt=""
              />
              <img
                className="rule-right"
                src="/assets/line-2.svg"
                width="1830"
                height="3"
                alt=""
              />
            </div>

            <h1>What you can build with Qube?</h1>

            <div className="cube-scene" style={{ "--spin": `${spin}deg` }}>
              <div className="cube">
                {SIDE_FACES.map((face) => (
                  <div
                    key={face.name}
                    className={`cube-face cube-side cube-${face.name}`}
                    style={{ background: sideShade(CUBE_YAW + spin + face.angle) }}
                  />
                ))}
                <div className="cube-face cube-top" />
                <div className="cube-face cube-bottom" />
              </div>
            </div>

            <div className="creature-stage" aria-label="characters">
              {features.map((feature, index) => {
                const turn = Math.max(-90, Math.min(90, spin + index * STEP_DEGREES));
                const opacity = Math.max(0, 1 - Math.abs(position - index) * 2);

                return (
                  <div
                    className="creature-slot"
                    key={feature.id}
                    style={{
                      opacity,
                      transform: `perspective(1500px) rotateY(${turn}deg)`,
                    }}
                    aria-hidden={opacity < 0.45}
                  >
                    <img
                      src={feature.image}
                      width={feature.spread.image.w}
                      height={feature.spread.image.h}
                      alt={feature.imageAlt}
                    />
                  </div>
                );
              })}
            </div>

            <SlideStack className="title-stack" position={position} label="titles">
              {features.map((feature) => (
                <span
                  className="feature-title"
                  key={feature.id}
                  style={{ width: feature.spread.title.w, height: 72 }}
                >
                  <span style={{ width: feature.spread.title.w }}>{feature.titleSpread}</span>
                </span>
              ))}
            </SlideStack>

            <SlideStack
              className="body-stack"
              position={position}
              label="descriptions"
            >
              {features.map((feature) => (
                <span className="feature-body" key={feature.id} style={{ width: BODY_WIDTH }}>
                  <span style={{ width: BODY_WIDTH }}>{feature.body}</span>
                </span>
              ))}
            </SlideStack>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideStack({ className, position, label, children }) {
  return (
    <div className={`slide-stack ${className}`} aria-label={label}>
      {children.map((child, index) => {
        const offset = Math.max(-1, Math.min(1, position - index));
        const opacity = Math.max(0, 1 - Math.abs(offset));

        return (
          <div
            className="slide-item"
            key={index}
            style={{
              opacity,
              transform: `translateY(${-offset * 100}%)`,
            }}
            aria-hidden={opacity < 0.5}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
