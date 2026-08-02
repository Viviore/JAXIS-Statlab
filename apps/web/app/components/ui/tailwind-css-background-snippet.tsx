import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const Hero = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register plugin (safe to do multiple times)
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // A professional, subtle opacity fade (spotlight reveal) without any "warping" scale distortion
      gsap.fromTo(
        ".bg-glow",
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.getElementById("contact"), // Pass the element directly to bypass the gsap.context scope
            start: "top 90%", // start fading in when footer top is 90% down the viewport
            end: "top 30%", // finish fading when footer top is 30% down the viewport
            scrub: true, 
          },
        }
      );
    }, containerRef);

    return () => ctx.revert(); // crucial cleanup
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative", height: "100%" }} className={className}>
      {/* Background Pattern */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          className="bg-glow"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -10,
            background: "radial-gradient(125% 125% at 50% 10%, var(--bg-primary) 40%, var(--surface-secondary) 100%)",
          }}
        ></div>
      </div>
    </div>
  );
};
