"use client";

import React, { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register GSAP Plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Simple deterministic PRNG
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export default function PixelTransition() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. The original animation: fade in the white pixels
      const pixels = gsap.utils.toArray<SVGRectElement>('.pixel-rect');
      
      pixels.sort((a, b) => {
        const yA = parseInt(a.getAttribute('data-y') || '0');
        const yB = parseInt(b.getAttribute('data-y') || '0');
        return (yB - yA) + (Math.random() * 8 - 4); 
      });

      gsap.to(pixels, {
        opacity: 1,
        ease: "none",
        stagger: {
          amount: 1.5, 
        },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 95%",
          end: "top 10%",
          scrub: 1.2, 
        }
      });

      // 2. The cleanup animation: flawlessly turn the dark pixels white organically, 
      // while fading in a white backing to seal any SVG microscopic cracks.
      // We NEVER animate opacity to 0 here, because semi-transparent dark pixels over a background look muddy gray!
      const darkPixels = gsap.utils.toArray<SVGRectElement>('.pixel-dark');
      
      // Sort so bottom dark pixels turn white first, eating upwards
      darkPixels.sort((a, b) => {
        const yA = parseInt(a.getAttribute('data-y') || '0');
        const yB = parseInt(b.getAttribute('data-y') || '0');
        return (yB - yA) + (Math.random() * 4 - 2); 
      });

      // Animate the SVG fill color. This keeps the pixels 100% solid and crisp!
      gsap.to(darkPixels, {
        fill: '#F8F9FA',
        ease: "none",
        stagger: {
          amount: 1, 
        },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 15%",
          end: "bottom 60%",
          scrub: 1.2,
        }
      });

      // Fade in the white backing behind the opaque pixels to perfectly seal any SVG anti-aliasing cracks
      gsap.to('.white-bg', {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 15%",
          end: "bottom 60%",
          scrub: 1.2,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const rects = useMemo(() => {
    const cols = 100;
    const rows = 10;
    const items = [];
    const random = mulberry32(888); 
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const progress = y / (rows - 1);
        let lightProb = Math.pow(progress, 1.4); 
        
        // Force top to be sparse and bottom to be dense
        if (y === 0) lightProb = 0.01;
        if (y === 1) lightProb = 0.05;
        if (y === 2) lightProb = 0.12;
        if (y === rows - 3) lightProb = 0.88;
        if (y === rows - 2) lightProb = 0.98;
        if (y === rows - 1) lightProb = 1.0; 

        const rand = random();
        let isLight = rand < lightProb;
        let color = isLight ? '#F8F9FA' : '#010114';

        const classes = [];
        if (isLight) {
          classes.push('pixel-rect');
        } else {
          classes.push('pixel-dark');
        }

        items.push(
          <rect 
            key={`${x}-${y}`} 
            x={x} 
            y={y}
            data-y={y} 
            width={1} 
            height={1} 
            fill={color} 
            className={classes.join(' ')}
            shapeRendering="crispEdges"
          />
        );
      }
    }
    return items;
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative',
        width: '100%', 
        height: '400px',
        backgroundColor: '#010114',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center'
      }} 
      aria-hidden="true"
    >
      <style>{`
        /* All light/accent pixels start completely invisible */
        .pixel-rect {
          opacity: 0;
        }
      `}</style>

      {/* Solid white background that crossfades in */}
      <div 
        className="white-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#F8F9FA',
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
      
      {/* Wrapper for the SVG */}
      <div 
        className="svg-wrapper"
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <svg viewBox="0 0 100 10" width="4000" height="400" style={{ flexShrink: 0 }}>
          {rects}
        </svg>
      </div>
    </div>
  );
}
