"use client";

import React, { useRef, useMemo } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function JaxisIntro() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  const text = "JAXIS is statistical consulting for researchers and students. Every project gets analyzed by one statistician and double-checked by another before you receive it — so your results hold up when your adviser or panel questions them.";

  // Split text into words to animate individually
  const words = useMemo(() => text.split(" "), [text]);

  useGSAP(() => {
    if (!containerRef.current || !textRef.current) return;

    const wordElements = textRef.current.querySelectorAll(".reveal-word");

    // We use a single timeline to sequence the events.
    // Total pin duration is 250%. 
    // The margin-bottom of 150vh delays CoreInfrastructure from sliding up immediately.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=250%", 
        scrub: 1,      
        pin: true,     
        pinSpacing: false, 
      }
    });

    // 1. Text reveal (takes up the first part of the scroll, while the 150vh margin is scrolling)
    tl.fromTo(wordElements,
      { opacity: 0.15 },
      { opacity: 1, stagger: 0.1, ease: "none", duration: 1.5 }
    );

    // 2. Small pause where text is fully visible
    tl.to({}, { duration: 0.2 });

    // 3. Stacking scale animation (happens as CoreInfrastructure finally slides over)
    tl.to(containerRef.current, {
      scale: 0.92,
      opacity: 0.4,
      borderRadius: "24px",
      ease: "power2.out",
      duration: 1
    });

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      style={{
        minHeight: "100vh",
        marginBottom: "150vh", // Pushes the next section down so it doesn't immediately overlap

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        position: "relative",
        zIndex: 5,
        padding: "0 2rem",
        overflow: "hidden"
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center", zIndex: 10, position: "relative" }}>
        <h2 
          ref={textRef}
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "clamp(2rem, 4vw, 4rem)",
            fontWeight: 300,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            textShadow: "0 2px 24px rgba(0,0,0,0.55), 0 1px 6px rgba(0,0,0,0.4)",
            margin: 0
          }}
        >
          {words.map((word, i) => (
            <React.Fragment key={i}>
              <span className="reveal-word" style={{ willChange: "opacity" }}>
                {word}
              </span>
              {i < words.length - 1 && " "}
            </React.Fragment>
          ))}
        </h2>
      </div>
    </section>
  );
}
