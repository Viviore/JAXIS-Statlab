"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ParticleGlobe = dynamic(() => import("./ParticleGlobe"), { ssr: false });

// Stagger timing constants (ms)
const SNIPPET_BASE_DELAY    = 1600;  // ms — snippets start after headline settles
const HEADLINE_BASE_DELAY   = 700;   // ms — headline starts while globe is mid-fade
const HEADLINE_LINE_STAGGER = 300;   // ms between headline lines
const SNIPPET_BLOCK_STAGGER = 320;   // ms between each snippet block
const SNIPPET_LINE_STAGGER  = 220;   // ms between lines within a block
const TYPEWRITER_DURATION   = 900;   // ms — must match CSS animation duration

const CODE_SNIPPETS = [
  {
    id: "snippet-top-left",
    lines: [
      "ANOVA  F(3,196) = 8.42",
      "p = 0.00002  η² = 0.114",
      "Post-hoc: Tukey HSD ✓",
    ],
    position: { top: "18%", left: "4%", right: "auto", bottom: "auto" } as React.CSSProperties,
    blockDelay: 0,
  },
  {
    id: "snippet-top-right",
    lines: [
      "Power = 0.92  α = 0.05",
      "n_required = 148",
      "Effect size d = 0.51",
    ],
    position: { top: "18%", right: "4%", left: "auto", bottom: "auto" } as React.CSSProperties,
    blockDelay: 1,
  },
  {
    id: "snippet-bottom-left",
    lines: [
      "95% CI [2.14, 5.87]",
      "β₁ = 3.21  SE = 0.94",
      "R² = 0.763  p < 0.001",
    ],
    position: { bottom: "18%", left: "4%", top: "auto", right: "auto" } as React.CSSProperties,
    blockDelay: 2,
  },
  {
    id: "snippet-bottom-right",
    lines: [
      "Shapiro-Wilk W = 0.991",
      "Levene p = 0.412",
      "Assumptions met ✓",
    ],
    position: { bottom: "18%", right: "4%", top: "auto", left: "auto" } as React.CSSProperties,
    blockDelay: 3,
  },
];

// Headline broken into animatable lines
const HEADLINE_LINES = [
  { text: "Evidence-backed decisions",  delay: 0 },
  { text: "at the speed of",           delay: 1 },
  { text: "discovery.",                 delay: 2, accent: true },
];

export default function Hero() {
  const wrapperRef = useRef<HTMLElement>(null);

  // Subtle parallax on mouse move — pointer-capable devices only
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const headline = wrapper.querySelector<HTMLElement>("#hero-headline");
    if (!headline) return;

    const onMouseEnter = () => { headline.style.willChange = "transform"; };
    const onMouseLeave = () => {
      headline.style.willChange = "auto";
      headline.style.transform = "";
    };
    const onMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth  - 0.5) * 12;
      const dy = (e.clientY / window.innerHeight - 0.5) * 8;
      headline.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    wrapper.addEventListener("mouseenter", onMouseEnter, { passive: true });
    wrapper.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      wrapper.removeEventListener("mouseenter", onMouseEnter);
      wrapper.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousemove", onMouseMove);
    };
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
        background: "var(--bg-primary)",
      }}
    >
      {/* ── Three.js Globe — fades in via Three.js loop, not CSS ── */}
      <ParticleGlobe />

      {/* Bottom navy glow */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "radial-gradient(ellipse 90% 60% at 50% 110%, rgba(1,22,57,0.80) 0%, rgba(0,4,20,0) 65%)",
      }} />

      {/* Top/bottom vignette */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
        background: "linear-gradient(to bottom, rgba(0,0,8,0.55) 0%, transparent 20%, transparent 75%, rgba(0,0,8,0.5) 100%)",
      }} />

      {/* Edge radial mask */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
        background: "radial-gradient(ellipse 62% 56% at 50% 50%, transparent 20%, rgba(0,8,20,0.38) 58%, rgba(0,8,20,0.90) 80%)",
      }} />

      {/* ── Floating statistical code annotations ── */}
      {CODE_SNIPPETS.map((snippet) => {
        const blockStart = SNIPPET_BASE_DELAY + snippet.blockDelay * SNIPPET_BLOCK_STAGGER;
        return (
          <div
            key={snippet.id}
            id={snippet.id}
            aria-hidden="true"
            style={{
              position: "absolute",
              ...snippet.position,
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.62rem",
              lineHeight: "1.9",
              color: "rgba(255,255,255,0.30)",
              letterSpacing: "0.04em",
              userSelect: "none",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            {snippet.lines.map((line, i) => {
              const isLast   = i === snippet.lines.length - 1;
              // Each line starts after the previous one finishes typing
              const lineDelay = blockStart + i * (TYPEWRITER_DURATION + SNIPPET_LINE_STAGGER);
              // Cursor fades out right after THIS line finishes
              const cursorDelay = TYPEWRITER_DURATION;
              return (
                <div
                  key={i}
                  className={`snippet-line${isLast ? " snippet-line-last" : ""}`}
                  style={{
                    animationDelay: `${lineDelay}ms`,
                    ...(isLast ? { "--cursor-delay": `${cursorDelay}ms` } as React.CSSProperties : {}),
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* ── Content: headline + caption + CTA ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "900px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
            textShadow: "0 2px 24px rgba(0,0,0,0.55), 0 1px 6px rgba(0,0,0,0.4)",
          }}
        >
          {HEADLINE_LINES.map(({ text, delay, accent }) => (
            <span
              key={text}
              className="hero-line"
              style={{ animationDelay: `${HEADLINE_BASE_DELAY + delay * HEADLINE_LINE_STAGGER}ms` }}
            >
              {accent ? (
                <em style={{ fontStyle: "normal", color: "var(--accent-orange)", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
                  {text}
                </em>
              ) : text}
            </span>
          ))}
        </h1>

        <p
          className="hero-caption"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.78rem",
            fontWeight: 400,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.65,
            maxWidth: "380px",
            margin: "1.75rem auto 0",
            letterSpacing: "0.01em",
            animationDelay: `${HEADLINE_BASE_DELAY + HEADLINE_LINE_STAGGER * 3 + 300}ms`,
          }}
        >
          Continuously validating, analyzing, and delivering statistical
          intelligence across your research, clinical, and enterprise data.
        </p>

        <a
          href="#contact"
          id="hero-cta"
          className="hero-caption"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            textDecoration: "none",
            padding: "10px 28px",
            border: "1px solid rgba(255,255,255,0.45)",
            borderRadius: "2px",
            background: "transparent",
            marginTop: "2rem",
            display: "inline-block",
            transition: "border-color 0.2s ease, background 0.2s ease",
            animationDelay: `${HEADLINE_BASE_DELAY + HEADLINE_LINE_STAGGER * 3 + 600}ms`,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "var(--accent-orange)";
            el.style.background = "rgba(204,102,0,0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "rgba(255,255,255,0.45)";
            el.style.background = "transparent";
          }}
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
