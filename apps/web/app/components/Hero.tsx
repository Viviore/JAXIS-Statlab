"use client";

import { useEffect, useRef, lazy, Suspense } from "react";

// Dynamically import the Three.js globe to keep it client-only
// and avoid SSR issues with WebGL
const ParticleGlobe = lazy(() => import("./ParticleGlobe"));

// Floating code annotations — mimics the reference design's terminal-style overlays
const CODE_SNIPPETS = [
  {
    id: "snippet-top-right",
    lines: [
      "push  %rbp",
      "mov   %rsp, %rbp",
      "call  0x1177391a39b8a04",
    ],
    position: { top: "28%", right: "7%", left: "auto", bottom: "auto" } as React.CSSProperties,
  },
  {
    id: "snippet-bottom-right",
    lines: [
      "clt, clv, lss #40!",
      "cli, lr",
      "dl, lats, dlr",
    ],
    position: { top: "auto", right: "7%", left: "auto", bottom: "28%" } as React.CSSProperties,
  },
];

export default function Hero() {
  const wrapperRef = useRef<HTMLElement>(null);

  // Subtle parallax: headline shifts slightly on mouse move
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const headline = wrapper.querySelector<HTMLElement>("#hero-headline");
    if (!headline) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 12;
      const dy = (e.clientY / window.innerHeight - 0.5) * 8;
      headline.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <section
      id="hero"
      ref={wrapperRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#000008",
      }}
    >
      {/* ── Three.js Particle Globe — fills the full section ── */}
      <Suspense fallback={null}>
        <ParticleGlobe />
      </Suspense>

      {/* Deep radial blue-violet glow at bottom — matching reference */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 55% at 50% 105%, rgba(20, 30, 90, 0.65) 0%, rgba(1, 2, 14, 0) 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Top + bottom vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,8,0.55) 0%, transparent 20%, transparent 75%, rgba(0,0,8,0.5) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Radial mask fades the globe edges into darkness */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 58% 52% at 50% 50%, transparent 25%, rgba(0,0,8,0.45) 60%, rgba(0,0,8,0.92) 82%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Floating code annotations */}
      {CODE_SNIPPETS.map((snippet) => (
        <div
          key={snippet.id}
          id={snippet.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            ...snippet.position,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "0.62rem",
            lineHeight: "1.8",
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.04em",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {snippet.lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ))}

      {/* Main headline — sits above everything */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <h1
          id="hero-headline"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "clamp(2.6rem, 7vw, 5.5rem)",
            fontWeight: 300,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            margin: 0,
            transition: "transform 0.15s ease-out",
            willChange: "transform",
          }}
        >
          Statistics that moves
          <br />
          at the speed of your
          <br />
          <em
            style={{
              fontStyle: "normal",
              background:
                "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            research.
          </em>
        </h1>
      </div>

      {/* Sub-caption — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: "9%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
          padding: "0 1rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.78rem",
            fontWeight: 400,
            color: "rgba(255,255,255,0.42)",
            lineHeight: 1.65,
            maxWidth: "380px",
            margin: "0 auto",
            letterSpacing: "0.01em",
          }}
        >
          Continuously validating, analyzing, and delivering statistical
          intelligence across your research, clinical, and enterprise data.
        </p>
      </div>
    </section>
  );
}
