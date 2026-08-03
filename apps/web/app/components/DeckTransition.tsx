"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface DeckTransitionProps {
  zIndexTarget?: number;
}

export default function DeckTransition({ zIndexTarget = 20 }: DeckTransitionProps) {
  const spacerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!spacerRef.current) return;

    const spacer = spacerRef.current;
    const prevSection = spacer.previousElementSibling as HTMLElement;
    const nextSection = spacer.nextElementSibling as HTMLElement;

    if (!prevSection || !nextSection) return;

    // Apply z-index logic so the next section slides OVER the previous one
    gsap.set(prevSection, { position: "relative", zIndex: zIndexTarget - 1 });
    // Explicitly add a subtle drop shadow to the incoming section to emphasize physical depth
    gsap.set(nextSection, { position: "relative", zIndex: zIndexTarget, boxShadow: "0px -20px 40px rgba(0, 0, 0, 0.4)" });

    // Create a ScrollTrigger that pins prevSection while nextSection scrolls over it
    ScrollTrigger.create({
      trigger: nextSection,
      start: "top bottom", 
      end: "top top",      
      pin: prevSection,
      pinSpacing: false, // Allows nextSection to scroll over it
      scrub: true,
      animation: gsap.to(prevSection, {
        scale: 0.95,
        filter: "blur(4px) brightness(0.5)", // Reduced blur for massive performance boost
        transformOrigin: "top center",
        ease: "none",
      })
    });
  }, { dependencies: [zIndexTarget] });

  return (
    <div
      ref={spacerRef}
      style={{
        width: "100%",
        height: "1px", // Minimal height, purely structural
        pointerEvents: "none",
        visibility: "hidden"
      }}
      aria-hidden="true"
    />
  );
}
