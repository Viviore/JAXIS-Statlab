"use client";

import React, { useMemo, useEffect, useState } from 'react';

// Simple deterministic PRNG to prevent hydration mismatches
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export default function PixelTransition() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const rects = useMemo(() => {
    // By using a repeating pattern, we can ensure the pixels are ALWAYS perfect squares.
    // We will generate a block of 100 columns by 12 rows. 
    // It will loop horizontally seamlessly.
    const cols = 80;
    const rows = 7;
    const items = [];
    const random = mulberry32(888); // deterministic seed
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const progress = y / (rows - 1);
        let lightProb = Math.pow(progress, 1.4); 
        
        // Force edges to be solid for a clean transition
        if (y === 0) lightProb = 0.02;
        if (y === 1) lightProb = 0.15;
        if (y === rows - 2) lightProb = 0.85;
        if (y === rows - 1) lightProb = 0.98;

        const rand = random();
        
        let isLight = rand < lightProb;
        let color = isLight ? '#F8F9FA' : '#010114';
        
        // Add random accents in the middle transition area
        if (y > 0 && y < rows - 1 && random() < 0.04) {
          color = random() > 0.5 ? '#CC6600' : '#012E57'; // Orange or Deep Blue
        }

        // Fade out the grid lines as they reach the bottom so they blend into the solid white section seamlessly
        const strokeOpacity = isLight ? 0.06 * (1 - (y / (rows - 1))) : 0;
        const strokeColor = strokeOpacity > 0.001 ? `rgba(1, 1, 20, ${strokeOpacity.toFixed(3)})` : 'transparent';

        items.push(
          <rect 
            key={`${x}-${y}`} 
            x={x} 
            y={y} 
            width={1.05} 
            height={1.05} 
            fill={color} 
            stroke={strokeColor}
            strokeWidth={0.05}
          />
        );
      }
    }
    return items;
  }, []);

  // Server-side placeholder with exact same height to prevent layout shift
  if (!mounted) {
    return <div style={{ width: '100%', height: '280px', backgroundColor: '#010114' }} aria-hidden="true" />;
  }

  // We map the 80x7 grid to 3200px x 280px. 
  // This guarantees each block is exactly 40x40 pixels, making them incredibly chunky.
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '280px',
        backgroundColor: '#010114',
        overflow: 'hidden'
      }} 
      aria-hidden="true"
    >
      <svg width="100%" height="280px" style={{ display: 'block' }}>
        <defs>
          <pattern 
            id="pixel-pattern" 
            x="0" 
            y="0" 
            width="3200" 
            height="280" 
            patternUnits="userSpaceOnUse"
          >
            <svg viewBox="0 0 80 7" width="3200" height="280">
              {rects}
            </svg>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#pixel-pattern)" />
      </svg>
    </div>
  );
}
