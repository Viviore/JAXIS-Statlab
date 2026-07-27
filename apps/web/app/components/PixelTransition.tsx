"use client";

import React, { useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register GSAP Plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Simple deterministic PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PixelTransitionProps {
  direction?: "dark-to-light" | "light-to-dark";
}

export default function PixelTransition({
  direction = "dark-to-light",
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // The transition bridges a source section (top) and a target section (bottom).
  // The container background is the source color, hiding the hard HTML seam.
  // We draw ONLY target color pixels, gradually increasing density to 100% at the bottom.
  const sourceColor = direction === "dark-to-light" ? "#010114" : "#F8F9FA";
  const targetColor = direction === "dark-to-light" ? "#F8F9FA" : "#010114";

  // [TWEAK]: The color of the scattered highlight pixels. Can be any valid CSS hex, rgb, or color name.
  const accentColor = "#CC6600"; // JAXIS Enterprise Orange

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const pixels = gsap.utils.toArray<SVGRectElement>(
        ".pixel-anim",
        containerRef.current || undefined,
      );

      // Sort pixels so the bottom ones (y=9) animate first, top ones (y=0) animate last
      pixels.sort((a, b) => {
        const yA = parseInt(a.getAttribute("data-y") || "0");
        const yB = parseInt(b.getAttribute("data-y") || "0");
        // Add random jitter so they don't appear in perfect horizontal lines
        return yB - yA + (Math.random() * 4 - 2);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      tl.to(pixels, {
        opacity: 1,
        // [TWEAK]: The speed at which each *individual* pixel fades in.
        // Min: 0.05 (instant snap), Max: 1.0 (very slow fade)
        duration: () => gsap.utils.random(0.15, 0.4),
        ease: "power3.out",
        stagger: {
          // [TWEAK]: The time delay from the very first bottom pixel fading in, to the last top pixel fading in.
          // Min: 0.5 (fast, blocky wave), Max: 3.0 (slow, gradual wave)
          amount: 2.0,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [targetColor]);

  const rects = useMemo(() => {
    // [TWEAK]: Grid resolution. More rows/cols = smaller, finer pixels. Less = bigger, blockier pixels.
    // Tip: Try to keep the 10:1 ratio between cols and rows to keep them perfect squares.
    // Min: cols=50/rows=5 (massive blocks), Max: cols=200/rows=20 (tiny dots).
    const cols = 100;
    const rows = 10;
    const items = [];
    const random = mulberry32(999);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const progress = y / (rows - 1);

        // [TWEAK]: The "shape" of the density curve.
        // 1.0 = linear (even spread).
        // Higher (e.g., 2.5) = fewer pixels in the middle, sudden dense cluster at the bottom.
        // Lower (e.g., 1.2) = more crowded in the middle.
        // Min: 1.0, Max: 3.0
        let prob = Math.pow(progress, 1.8); // exponential curve for density

        // Force the edges to be clean
        if (y === 0) prob = 0.0;
        if (y === 1) prob = 0.01;
        if (y === rows - 3) prob = 0.92;
        if (y === rows - 2) prob = 0.98;
        if (y === rows - 1) prob = 1.0;

        const rand = random();
        if (rand < prob) {
          let color = targetColor;

          // [TWEAK]: The probability that a pixel will be the Accent Color instead of the Target Color.
          // Currently `0.03` means a 3% chance.
          // Min: 0.00 (0%, no accents), Max: 0.10 (10%, more than this looks messy).
          if (y > 3 && y < rows - 3 && random() < 0.03) {
            color = accentColor;
          }

          items.push(
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              data-y={y}
              width={1.05} // slight overlap to prevent gaps
              height={1.05}
              fill={color}
              className="pixel-anim"
              style={{ opacity: 0 }} // start hidden
              shapeRendering="crispEdges"
            />,
          );
        }
      }
    }
    return items;
  }, [targetColor]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        // Use fluid height that guarantees horizontal overflow (keeps top/bottom rows perfectly intact)
        height: "clamp(150px, 12vw, 250px)",
        backgroundColor: sourceColor, // Solid source color hides the seam
        display: "flex",
        justifyContent: "center",
        // Pull UP to overlap the bottom padding of the previous section
        marginTop: "clamp(-250px, -12vw, -150px)", 
        // 0 bottom margin ensures it DOES NOT bleed into the target section's actual bounding box
        marginBottom: "0", 
        zIndex: 11,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div
        className="svg-wrapper"
        style={{
          position: "absolute",
          left: "50%",
          top: "0",
          transform: "translateX(-50%)",
          width: "100%", // Let preserveAspectRatio handle the overflow safely
          height: "100%",
        }}
      >
        <svg
          viewBox="0 0 100 10"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        >
          {rects}
        </svg>
      </div>
    </div>
  );
}
