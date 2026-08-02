"use client";

import React, { useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { globeScrollState } from "./globeState";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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
      "[JAXIS_Engine] Data pre-flight complete",
      "0% Missingness | Normality assumed ✓",
    ],
    position: { top: "18%", left: "4%", right: "auto", bottom: "auto" } as React.CSSProperties,
    blockDelay: 0,
  },
  {
    id: "snippet-top-right",
    lines: [
      "[Studio_OS] Methodology SOW Locked",
      "Routing to Rank 3 Methodologist...",
    ],
    position: { top: "18%", right: "4%", left: "auto", bottom: "auto" } as React.CSSProperties,
    blockDelay: 1,
  },
  {
    id: "snippet-bottom-left",
    lines: [
      "[AOG_Script] APA 7th Ed.",
      "Table Generation: SUCCESS",
    ],
    position: { bottom: "18%", left: "4%", top: "auto", right: "auto" } as React.CSSProperties,
    blockDelay: 2,
  },
  {
    id: "snippet-bottom-right",
    lines: [
      "[QA_Gateway] Tier 2 Peer Review: PASSED",
      "Ready for Panel Defense ✓",
    ],
    position: { bottom: "18%", right: "4%", top: "auto", left: "auto" } as React.CSSProperties,
    blockDelay: 3,
  },
];

// Headline broken into animatable lines
const HEADLINE_LINES = [
  { text: "Panel-Ready",    delay: 0 },
  { text: "Research.",      delay: 1, accent: false },
];

export default function Hero() {
  const wrapperRef = useRef<HTMLElement>(null);
  const introTextRef = useRef<HTMLHeadingElement>(null);

  const introText = "JAXIS is statistical consulting for researchers and students. Every project gets analyzed by one statistician and double-checked by another before you receive it — so your results hold up when your adviser or panel questions them.";
  const introWords = useMemo(() => introText.split(" "), [introText]);

  // Subtle parallax on mouse move — pointer-capable devices only
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

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

  useGSAP(() => {
    if (!wrapperRef.current || !introTextRef.current) return;

    // Trigger on the outer wrapper that we want to pin
    const triggerEl = document.querySelector(".hero-pin-trigger") || wrapperRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: "top top",
        end: "+=250%", 
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    // ── Phase 1: Text & Globe Transition (0% to 20%) ──
    // Hero text fades out, snippets fade out
    tl.to(".hero-main-content", { y: -50, opacity: 0, duration: 0.2, ease: "power2.inOut" }, 0);
    tl.to(".hero-snippets-container", { y: -30, opacity: 0, duration: 0.2, ease: "power2.inOut" }, 0);

    // ── Phase 1.5: Reveal Jaxis Intro text (20% to 40%) ──
    const introWordElements = introTextRef.current.querySelectorAll(".reveal-word");
    tl.fromTo(introWordElements,
      { opacity: 0, y: 30, scale: 0.95, filter: "blur(12px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", stagger: { amount: 0.2 }, duration: 0.2, ease: "power2.out" },
      0.2
    );

    // ── Phase 1.5: Globe transforms ──
    // The globe comes close to the camera while the Jaxis Intro text is revealed
    tl.to(globeScrollState, {
      yOffset: -4.5,
      scale: 2.8,
      offset: Math.PI * 2,
      duration: 0.4, 
      ease: "power2.inOut" 
    }, 0.1); 

    // ── Phase 2: Dwell Time (40% to 60%) ──
    // No animations. The intro text remains readable on screen while scrolling.

    // ── Phase 3: Stacking Card Transition (60% to 100%) ──
    // CoreInfrastructure is pulled up by -100vh, so it enters the bottom of the screen exactly at 60% of this 250vh pin.
    // The scale/dim must use linear easing ("none") to perfectly map to the physical scroll distance.
    tl.to(".hero-intro-wrapper", {
      scale: 0.92,
      borderRadius: "40px",
      filter: "brightness(0.25)",
      duration: 0.4,
      ease: "none" 
    }, 0.6);

    // ── Fix for Resize Animation Restart ──
    // GSAP ScrollTrigger temporarily removes and re-adds the pinned element on resize to recalculate layout.
    // This DOM detach/attach causes all CSS keyframe animations to restart from 0%.
    // To prevent this, we lock in the final state of the CSS animations after they finish playing once.
    gsap.delayedCall(3.5, () => {
      document.querySelectorAll(".hero-line, .hero-caption").forEach(el => {
        const e = el as HTMLElement;
        e.style.opacity = "1";
        e.style.transform = "none";
        e.style.animation = "none";
      });
      document.querySelectorAll(".snippet-line").forEach(el => {
        const e = el as HTMLElement;
        e.style.maxWidth = "100%";
        e.style.animation = "none";
      });
    });

  }, { scope: wrapperRef, dependencies: [] });

  return (
    <section
      id="hero"
      ref={wrapperRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* ── Three.js Globe is now in page.tsx ── */}
      {/* ── Floating statistical code annotations ── */}
        <div className="hero-snippets-container" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
        {CODE_SNIPPETS.map((snippet) => {
          const blockStart = SNIPPET_BASE_DELAY + snippet.blockDelay * SNIPPET_BLOCK_STAGGER;
        return (
          <div
            key={snippet.id}
            id={snippet.id}
            className="hero-snippet-block"
            aria-hidden="true"
            style={{
              position: "absolute",
              ...snippet.position,
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.75rem",
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
              const lineDelay = blockStart + i * (TYPEWRITER_DURATION + SNIPPET_LINE_STAGGER);
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
                  {line.split("").map((char, charIdx) => {
                    // Deterministic pseudo-random delay based on character index so it matches perfectly on server/client hydration
                    const seed = snippet.blockDelay * 100 + i * 50 + charIdx;
                    // Format to fixed decimal places to prevent server/client float precision hydration mismatches
                    const pseudoRandom = Math.abs(Math.sin(seed * 9999)) * 12;
                    // Delay the flicker until AFTER the typewriter animation finishes for this specific line
                    const startOffset = (lineDelay + TYPEWRITER_DURATION) / 1000; 
                    const totalDelay = (startOffset + pseudoRandom).toFixed(2);
                    return (
                      <span key={charIdx} className="flicker-char" style={{ animationDelay: `${totalDelay}s` }}>
                        {char === " " ? "\u00A0" : char}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
      </div>

      {/* ── Content: headline + caption + CTA ── */}
      <div
        className="hero-main-content"
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
            textAlign: "center",
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
          Premium statistical consulting for students and researchers
          who cannot afford to get their data analysis wrong.
        </p>

        <div className="hero-cta-wrapper">
          <a
            href="#contact"
            id="hero-cta"
            className="hero-caption hero-cta-btn"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              textDecoration: "none",
              padding: "12px 32px",
              border: "1px solid rgba(255,255,255,0.45)",
              borderRadius: "2px",
              background: "transparent",
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
            Submit Your Research for Review
          </a>
        </div>
      </div>

      {/* ── Jaxis Intro Text (Reveals on Scroll) ── */}
      <div 
        style={{ 
          position: "absolute", 
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "1100px", 
          margin: "0 auto", 
          textAlign: "center", 
          zIndex: 10, 
          padding: "0 2rem",
          pointerEvents: "none" // Prevents interfering with clicks before it's visible
        }}
      >
        <h2 
          ref={introTextRef}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "clamp(1.1rem, 3.5vw, 3.2rem)",
            fontWeight: 300,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            textShadow: "0 2px 24px rgba(0,0,0,0.55), 0 1px 6px rgba(0,0,0,0.4)",
            margin: 0
          }}
        >
          {introWords.map((word, i) => (
            <React.Fragment key={i}>
              <span className="reveal-word" style={{ willChange: "opacity, transform", display: "inline-block" }}>
                {word}
              </span>
              {i < introWords.length - 1 && " "}
            </React.Fragment>
          ))}
        </h2>
      </div>
    </section>
  );
}
