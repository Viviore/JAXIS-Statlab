import React from "react";

export function LockIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Background grid/construction lines */}
      <path d="M20 0V100M80 0V100M0 50H100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      
      {/* The Lock Base */}
      <rect x="30" y="50" width="40" height="30" rx="4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      {/* Lock Shackle */}
      <path d="M35 50V35C35 26.7157 41.7157 20 50 20C58.2843 20 65 26.7157 65 35V50" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      
      {/* Keyhole abstract */}
      <circle cx="50" cy="62" r="3" fill="var(--accent-orange)" />
      <path d="M49 64L48 72H52L51 64" fill="var(--accent-orange)" />

      {/* Decorative Nodes */}
      <circle cx="35" cy="50" r="1.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="65" cy="50" r="1.5" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

export function PreFlightIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Matrix Grid */}
      <path d="M25 25H75M25 41.6H75M25 58.3H75M25 75H75" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M25 25V75M41.6 25V75M58.3 25V75M75 25V75" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      
      {/* Scanner Arc */}
      <path d="M15 50C15 30.67 30.67 15 50 15" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      
      {/* Scanner line passing over */}
      <line x1="15" y1="50" x2="85" y2="50" stroke="var(--accent-orange)" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="85" cy="50" r="2" fill="var(--accent-orange)" />

      {/* Data points (Normal) */}
      <circle cx="33" cy="33" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="66" cy="33" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="33" cy="66" r="2" fill="rgba(255,255,255,0.5)" />
      
      {/* Anomaly detected */}
      <circle cx="66" cy="66" r="3" fill="var(--accent-orange)" />
      <circle cx="66" cy="66" r="6" stroke="var(--accent-orange)" strokeWidth="1" />
    </svg>
  );
}

export function QAGatewayIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Horizontal construction line */}
      <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      
      {/* Lens 1 */}
      <circle cx="40" cy="50" r="25" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      {/* Lens 2 */}
      <circle cx="60" cy="50" r="25" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      
      {/* Intersection Highlight (The QA Pass) */}
      <path d="M50 27.2C54.4 32.5 57 39 57 46C57 53 54.4 59.5 50 64.8C45.6 59.5 43 53 43 46C43 39 45.6 32.5 50 27.2Z" fill="var(--accent-orange)" fillOpacity="0.2" stroke="var(--accent-orange)" strokeWidth="1" />
      
      {/* Document icon inside intersection */}
      <rect x="47" y="44" width="6" height="8" rx="1" stroke="var(--accent-orange)" strokeWidth="1" fill="none" />
      <line x1="48.5" y1="46" x2="51.5" y2="46" stroke="var(--accent-orange)" strokeWidth="0.5" />
      <line x1="48.5" y1="48" x2="51.5" y2="48" stroke="var(--accent-orange)" strokeWidth="0.5" />
      
      {/* Outer nodes */}
      <circle cx="15" cy="50" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="85" cy="50" r="2" fill="var(--accent-orange)" />
    </svg>
  );
}

export function AntiPHackingIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* Geometric background structure */}
      <path d="M50 10L90 30V70L50 90L10 70V30L50 10Z" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <path d="M10 30L50 50L90 30M50 50V90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      
      {/* Inner pristine cube */}
      <path d="M50 25L75 37.5V62.5L50 75L25 62.5V37.5L50 25Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <path d="M25 37.5L50 50L75 37.5M50 50V75" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      
      {/* Core truth node */}
      <circle cx="50" cy="50" r="4" fill="var(--accent-orange)" />
      
      {/* Radiating truth lines */}
      <line x1="50" y1="40" x2="50" y2="30" stroke="var(--accent-orange)" strokeWidth="1" />
      <line x1="41" y1="45.5" x2="33" y2="41.5" stroke="var(--accent-orange)" strokeWidth="1" />
      <line x1="59" y1="45.5" x2="67" y2="41.5" stroke="var(--accent-orange)" strokeWidth="1" />
    </svg>
  );
}
