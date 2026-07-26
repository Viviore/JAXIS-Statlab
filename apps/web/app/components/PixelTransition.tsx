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
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

interface PixelTransitionProps {
  direction?: 'dark-to-light' | 'light-to-dark';
}

export default function PixelTransition({ direction = 'dark-to-light' }: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const activeColor = direction === 'dark-to-light' ? '#F8F9FA' : '#010114';
  const inactiveColor = direction === 'dark-to-light' ? '#010114' : '#F8F9FA';
  const targetFillColor = direction === 'dark-to-light' ? '#F8F9FA' : '#010114';
  const containerBg = direction === 'dark-to-light' ? '#010114' : '#F8F9FA';
  const backingBgColor = direction === 'dark-to-light' ? '#F8F9FA' : '#010114';

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. The original animation: fade in the active pixels
      const pixels = gsap.utils.toArray<SVGRectElement>('.pixel-rect', containerRef.current || undefined);
      
      pixels.sort((a, b) => {
        const yA = parseInt(a.getAttribute('data-y') || '0');
        const yB = parseInt(b.getAttribute('data-y') || '0');
        return (yB - yA) + (Math.random() * 8 - 4); 
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1, 
        }
      });

      tl.from('.svg-wrapper', {
        filter: "blur(6px)",
        scale: 1.03,
        duration: 1.2,
        ease: "power3.out"
      }, 0);

      tl.to(pixels, {
        opacity: 1,
        duration: () => gsap.utils.random(0.08, 0.18),
        ease: "power2.out",
        stagger: {
          amount: 1.5, 
        }
      }, 0);

      // Fade in the solid backing behind it to hide the gap
      const backingBg = containerRef.current?.querySelector('.backing-bg');
      if (backingBg) {
        tl.to(backingBg, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        }, 1.0); // start fading in near the end of the pixel stagger
      }
    }, containerRef);

    return () => ctx.revert();
  }, [targetFillColor]);

  const rects = useMemo(() => {
    const cols = 100;
    const rows = 10;
    const items = [];
    const random = mulberry32(888); 
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const progress = y / (rows - 1);
        let lightProb = Math.pow(progress, 1.4); 
        
        if (y === 0) lightProb = 0.01;
        if (y === 1) lightProb = 0.05;
        if (y === 2) lightProb = 0.12;
        if (y === rows - 3) lightProb = 0.88;
        if (y === rows - 2) lightProb = 0.98;
        if (y === rows - 1) lightProb = 1.0; 

        const rand = random();
        const isLight = rand < lightProb;
        const color = isLight ? activeColor : inactiveColor;

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
  }, [activeColor, inactiveColor]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative',
        width: '100%', 
        height: '400px',
        backgroundColor: containerBg,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        marginTop: '-200px',
        marginBottom: '-200px',
        zIndex: 11
      }} 
      aria-hidden="true"
    >
      <style>{`
        /* All active pixels start completely invisible */
        .pixel-rect {
          opacity: 0;
        }
      `}</style>

      {/* Solid backing background that crossfades in */}
      <div 
        className="backing-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: backingBgColor,
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
