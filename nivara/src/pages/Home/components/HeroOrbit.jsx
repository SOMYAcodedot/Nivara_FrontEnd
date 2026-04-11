import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { FaBrain, FaChartLine, FaClipboardCheck, FaHeadset, FaRobot } from "react-icons/fa";
import NivaraButterflyMark from "../../../components/NivaraButterflyMark/NivaraButterflyMark";
import "./HeroOrbit.css";

const FEATURE_CARDS = [
  { id: "ai", label: "AI Therapy", icon: <FaRobot />, color: "#667eea" },
  { id: "mood", label: "Mood Tracking", icon: <FaChartLine />, color: "#33b274" },
  { id: "cycle", label: "Cycle Insights", icon: <FaBrain />, color: "#f093fb" },
  { id: "reports", label: "Smart Reports", icon: <FaClipboardCheck />, color: "#45b7d1" },
  { id: "support", label: "24/7 Support", icon: <FaHeadset />, color: "#ff7b7b" },
];

const PARTICLE_COUNT = 64;
const BUBBLE_COUNT = 12;
const SPARKLE_COUNT = 10;
const ORBIT_DURATION_SECONDS = 42;
/**
 * Inset from the hero box edge so orbiting chips stay inside the square (px).
 * Orbit radius is derived from container half-width minus this — not from chip–center clearance.
 */
const EDGE_PADDING = 36;

/** Minimum orbit radius (px): center disk half-max + half chip width + breathing room (horizontal chips reach inward). */
/** Slightly above center-disk half-max + chip half-width + gap so chips never overlap the hub. */
const MIN_ORBIT_RADIUS = 200;

/** Prefer pushing chips toward the outer band of the hero (fraction of half-width). */
const ORBIT_RADIUS_FRACTION = 0.78;

/** Absolute ceiling so layout stays sane on very large viewports. */
const MAX_ORBIT_RADIUS = 318;

/** ~half of min chip width (see `.hero-orbit-chip`); chips stay horizontal — inner edge clears center. */
const CHIP_HALF_WIDTH = 78;

const makeParticles = (count) =>
  Array.from({ length: count }, (_, idx) => {
    const base = idx + 1;
    const layer = base <= 40 ? "deep" : base <= 56 ? "mid" : "highlight";
    const size = 3 + (base % 12);
    const driftSec = 9 + (base % 8);
    const blinkSec = 2.2 + (base % 4) * 0.65;
    return {
      id: `particle-${base}`,
      layer,
      top: `${(base * 17) % 100}%`,
      left: `${(base * 29) % 100}%`,
      size,
      blur: layer === "deep" ? 2.4 : layer === "mid" ? 1.1 : 0,
      driftX: `${((base * 21) % 104) - 52}px`,
      driftY: `${((base * 19) % 96) - 48}px`,
      driftDuration: `${driftSec}s`,
      driftDelay: `${-(base % 13) * 0.95}s`,
      blinkDuration: `${blinkSec}s`,
      blinkDelay: `${-(base % 11) * 0.38}s`,
    };
  });

const makeBubbles = (count) =>
  Array.from({ length: count }, (_, idx) => {
    const base = idx + 1;
    return {
      id: `bubble-${base}`,
      angleDeg: (360 / count) * idx,
      radius: 132 + (base % 8) * 28,
      size: 16 + (base % 5) * 9,
      orbitDuration: `${52 + (base % 9) * 8}s`,
      bobDuration: `${14 + (base % 5) * 2.2}s`,
      delay: `${-(base % 8) * 1.4}s`,
      opacity: 0.22 + (base % 5) * 0.06,
    };
  });

const makeSparkles = (count) =>
  Array.from({ length: count }, (_, idx) => {
    const base = idx + 1;
    return {
      id: `sparkle-${base}`,
      angleDeg: (360 / count) * idx,
      radius: 132 + (base % 3) * 20,
      size: 7 + (base % 4),
      duration: `${9 + (base % 4) * 1.5}s`,
      delay: `${-(base % 5) * 0.6}s`,
    };
  });

const OrbitCard = ({ item, pointerX, pointerY, reduceMotion, orbitRadius }) => {
  const theta = useMotionValue((item.angleDeg * Math.PI) / 180);
  const bob = useMotionValue(0);
  const speed = reduceMotion ? 0 : (Math.PI * 2) / ORBIT_DURATION_SECONDS;
  const bobSpeed = reduceMotion ? 0 : 0.0021;

  useAnimationFrame((time, delta) => {
    if (reduceMotion) return;
    theta.set(theta.get() + speed * (delta / 1000));
    bob.set(Math.sin(time * bobSpeed + item.angleDeg) * 5);
  });

  const angle = useTransform(theta, (v) => `${(v * 180) / Math.PI}deg`);
  const counterAngle = useTransform(theta, (v) => `${(-v * 180) / Math.PI}deg`);
  const orbitTransform = useMotionTemplate`translate(-50%, -50%) rotate(${angle}) translateX(${orbitRadius}px)`;
  const chipTransform = useMotionTemplate`rotate(${counterAngle}) translateY(${bob}px)`;

  return (
    <motion.div
      className="hero-orbit-card-anchor"
      style={{ transform: orbitTransform, x: pointerX * 5, y: pointerY * 5 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <div className="hero-orbit-chip-shell">
        <motion.div className="hero-orbit-chip" style={{ "--chip-color": item.color, transform: chipTransform }}>
          <span className="chip-icon">{item.icon}</span>
          <span className="chip-label">{item.label}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

const HeroOrbit = () => {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState(0);
  const particles = useMemo(() => makeParticles(PARTICLE_COUNT), []);
  const bubbles = useMemo(() => makeBubbles(BUBBLE_COUNT), []);
  const sparkles = useMemo(() => makeSparkles(SPARKLE_COUNT), []);
  const cards = useMemo(() => {
    const step = 360 / FEATURE_CARDS.length;
    return FEATURE_CARDS.map((card, index) => ({
      ...card,
      angleDeg: index * step - 90,
    }));
  }, []);
  const orbitRadius = useMemo(() => {
    const size = containerSize || 620;
    const half = size / 2;
    /** Furthest orbit so chip bounding box stays inside padded square (left/right extremes). */
    const maxRadial = Math.max(0, half - EDGE_PADDING - CHIP_HALF_WIDTH);
    const preferred = Math.min(maxRadial, half * ORBIT_RADIUS_FRACTION);
    const radius = Math.min(maxRadial, Math.max(Math.min(MIN_ORBIT_RADIUS, maxRadial), preferred));
    return Math.min(MAX_ORBIT_RADIUS, radius);
  }, [containerSize]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const node = containerRef.current;
    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setContainerSize(Math.min(rect.width, rect.height));
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setPointer({ x: nx, y: ny });
  };

  const resetPointer = () => setPointer({ x: 0, y: 0 });

  return (
    <div
      ref={containerRef}
      className="hero-orbit"
      aria-label="Nivara feature orbit animation"
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
    >
      <div className="hero-orbit-halo" aria-hidden />

      <div className="hero-orbit-sonar" aria-hidden>
        <div className="sonar-ping" />
        <div className="sonar-ping" style={{ animationDelay: "-1.6s" }} />
        <div className="sonar-ping" style={{ animationDelay: "-3.2s" }} />
      </div>

      <div className="hero-orbit-ring ring-outer" aria-hidden />
      <div className="hero-orbit-ring ring-middle" aria-hidden />
      <div className="hero-orbit-ring ring-inner" aria-hidden />

      <div className="hero-ring-orbs" aria-hidden>
        <div className="ring-orb ring-orb-outer" />
        <div className="ring-orb ring-orb-middle" />
      </div>

      {/* Small blinking dots distributed along each ring path */}
      <div className="hero-orbit-ring-dots" aria-hidden>
        <div className="rdt rdt-outer" style={{ animationDelay: "0s",       "--bd": "-0.4s" }} />
        <div className="rdt rdt-outer" style={{ animationDelay: "-6.67s",   "--bd": "-1.1s" }} />
        <div className="rdt rdt-outer" style={{ animationDelay: "-13.33s",  "--bd": "-2.2s" }} />
        <div className="rdt rdt-outer" style={{ animationDelay: "-20s",     "--bd": "-0.9s" }} />
        <div className="rdt rdt-outer" style={{ animationDelay: "-26.67s",  "--bd": "-1.8s" }} />
        <div className="rdt rdt-outer" style={{ animationDelay: "-33.33s",  "--bd": "-2.7s" }} />
        <div className="rdt rdt-middle" style={{ animationDelay: "0s",      "--bd": "-0.6s" }} />
        <div className="rdt rdt-middle" style={{ animationDelay: "-13.75s", "--bd": "-1.5s" }} />
        <div className="rdt rdt-middle" style={{ animationDelay: "-27.5s",  "--bd": "-2.4s" }} />
        <div className="rdt rdt-middle" style={{ animationDelay: "-41.25s", "--bd": "-3.3s" }} />
      </div>

      <div className="hero-orbit-particles" aria-hidden>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="hero-particle-orbit"
            style={{
              top: particle.top,
              left: particle.left,
            }}
          >
            <span
              className={`hero-particle-dot particle-${particle.layer}`}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                "--particle-drift-x": particle.driftX,
                "--particle-drift-y": particle.driftY,
                "--particle-drift-duration": particle.driftDuration,
                "--particle-drift-delay": particle.driftDelay,
                "--particle-blink-duration": particle.blinkDuration,
                "--particle-blink-delay": particle.blinkDelay,
                filter: particle.blur ? `blur(${particle.blur}px)` : "none",
              }}
            />
          </div>
        ))}
      </div>

      <div className="hero-bubble-layer" aria-hidden>
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="hero-bubble-arm"
            style={{
              "--bubble-angle": `${bubble.angleDeg}deg`,
              "--bubble-radius": `${bubble.radius}px`,
              "--bubble-orbit-duration": bubble.orbitDuration,
              "--bubble-delay": bubble.delay,
            }}
          >
            <span
              className="hero-bubble"
              style={{
                "--bubble-size": `${bubble.size}px`,
                "--bubble-bob-duration": bubble.bobDuration,
                "--bubble-opacity": bubble.opacity,
                "--bubble-delay": bubble.delay,
              }}
            />
          </div>
        ))}
      </div>

      <div className="hero-orbit-track" aria-hidden>
        {cards.map((item) => (
          <OrbitCard
            key={item.id}
            item={item}
            pointerX={pointer.x}
            pointerY={pointer.y}
            reduceMotion={Boolean(reduceMotion)}
            orbitRadius={orbitRadius}
          />
        ))}
      </div>

      <div className="hero-orbit-center hero-orbit-center-pulse">
        <div className="hero-orbit-center-stack">
          <div className="hero-orbit-logo-wrap">
            <NivaraButterflyMark className="hero-orbit-logo" decorative />
          </div>
          <p className="hero-orbit-title">Nivara</p>
          <p className="hero-orbit-subtitle">AI-driven women&apos;s wellness</p>
        </div>
      </div>

      <div className="hero-orbit-sparkles" aria-hidden>
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className="hero-sparkle"
            style={{
              "--sparkle-angle": `${sparkle.angleDeg}deg`,
              "--sparkle-radius": `${sparkle.radius}px`,
              "--sparkle-size": `${sparkle.size}px`,
              "--sparkle-duration": sparkle.duration,
              "--sparkle-delay": sparkle.delay,
            }}
          />
        ))}
      </div>

    </div>
  );
};

export default HeroOrbit;
