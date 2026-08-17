"use client";

import React from "react";

// ── Shared SVG Definitions for the Concave Hourglass Horizon ──
function HorizonDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      {/* Left Wing Spotlight Flare */}
      <radialGradient id={`${prefix}LeftWing`} cx="0%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
        <stop offset="25%" stopColor="#2563eb" stopOpacity="0.80" />
        <stop offset="55%" stopColor="#1e3a8a" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#010114" stopOpacity="0" />
      </radialGradient>

      {/* Right Wing Spotlight Flare */}
      <radialGradient id={`${prefix}RightWing`} cx="100%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
        <stop offset="25%" stopColor="#2563eb" stopOpacity="0.80" />
        <stop offset="55%" stopColor="#1e3a8a" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#010114" stopOpacity="0" />
      </radialGradient>

      {/* Center Horizon Bridge */}
      <linearGradient id={`${prefix}CenterBridge`} x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.85" />
        <stop offset="18%" stopColor="#3b82f6" stopOpacity="0.75" />
        <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.70" />
        <stop offset="82%" stopColor="#3b82f6" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.85" />
      </linearGradient>

      {/* Core Sapphire Filament */}
      <linearGradient id={`${prefix}CoreFilament`} x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
        <stop offset="22%" stopColor="#60a5fa" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.75" />
        <stop offset="78%" stopColor="#60a5fa" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
      </linearGradient>

      {/* Gaussian Glow Filters */}
      <filter id={`${prefix}SoftGlow`} x="-20%" y="-40%" width="140%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
      </filter>
      <filter id={`${prefix}DeepAtmosphere`} x="-20%" y="-40%" width="140%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="55" />
      </filter>
      <filter id={`${prefix}CoreBlur`} x="-10%" y="-20%" width="120%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
      </filter>
    </defs>
  );
}

// ── 1. Top Half: Embedded at bottom of Hero section ──
export function HeroHorizonTopHalf() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "220px",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "440px",
          display: "block",
        }}
      >
        <HorizonDefs prefix="heroTop" />

        {/* 1. Deep Atmospheric Outer Hourglass Ribbon */}
        <path
          d="M 0,20 Q 720,170 1440,20 L 1440,400 Q 720,250 0,400 Z"
          fill="url(#heroTopCenterBridge)"
          filter="url(#heroTopDeepAtmosphere)"
          opacity="0.80"
        />

        {/* 2. Main High-Luminance Hourglass Ribbon */}
        <path
          d="M 0,50 Q 720,185 1440,50 L 1440,365 Q 720,235 0,365 Z"
          fill="url(#heroTopCenterBridge)"
          filter="url(#heroTopSoftGlow)"
          opacity="0.90"
        />

        {/* 3. Left Wing Spotlight Cone */}
        <ellipse cx="0" cy="220" rx="420" ry="200" fill="url(#heroTopLeftWing)" filter="url(#heroTopSoftGlow)" />

        {/* 4. Right Wing Spotlight Cone */}
        <ellipse cx="1440" cy="220" rx="420" ry="200" fill="url(#heroTopRightWing)" filter="url(#heroTopSoftGlow)" />

        {/* 5. Core Sharp Horizon Filament */}
        <path
          d="M 0,130 Q 720,210 1440,130 L 1440,290 Q 720,210 0,290 Z"
          fill="url(#heroTopCoreFilament)"
          filter="url(#heroTopCoreBlur)"
          opacity="0.80"
        />
      </svg>

      {/* Top soft feather fade into #010114 beneath the globe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #010114 0%, rgba(1, 1, 20, 0.90) 18%, transparent 45%)",
        }}
      />
    </div>
  );
}

// ── 2. Bottom Half: Embedded at top of Approach section ──
export function ApproachHorizonBottomHalf() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "220px",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: "-220px",
          left: 0,
          width: "100%",
          height: "440px",
          display: "block",
        }}
      >
        <HorizonDefs prefix="appBottom" />

        {/* 1. Deep Atmospheric Outer Hourglass Ribbon */}
        <path
          d="M 0,20 Q 720,170 1440,20 L 1440,400 Q 720,250 0,400 Z"
          fill="url(#appBottomCenterBridge)"
          filter="url(#appBottomDeepAtmosphere)"
          opacity="0.80"
        />

        {/* 2. Main High-Luminance Hourglass Ribbon */}
        <path
          d="M 0,50 Q 720,185 1440,50 L 1440,365 Q 720,235 0,365 Z"
          fill="url(#appBottomCenterBridge)"
          filter="url(#appBottomSoftGlow)"
          opacity="0.90"
        />

        {/* 3. Left Wing Spotlight Cone */}
        <ellipse cx="0" cy="220" rx="420" ry="200" fill="url(#appBottomLeftWing)" filter="url(#appBottomSoftGlow)" />

        {/* 4. Right Wing Spotlight Cone */}
        <ellipse cx="1440" cy="220" rx="420" ry="200" fill="url(#appBottomRightWing)" filter="url(#appBottomSoftGlow)" />

        {/* 5. Core Sharp Horizon Filament */}
        <path
          d="M 0,130 Q 720,210 1440,130 L 1440,290 Q 720,210 0,290 Z"
          fill="url(#appBottomCoreFilament)"
          filter="url(#appBottomCoreBlur)"
          opacity="0.80"
        />
      </svg>

      {/* Bottom soft feather fade into #010114 behind the Approach cards */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, transparent 50%, rgba(1, 1, 20, 0.90) 80%, #010114 100%)",
        }}
      />
    </div>
  );
}

export default function CosmicHorizonGradient() {
  return null;
}
