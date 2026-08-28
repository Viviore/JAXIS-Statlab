"use client";

import React from "react";

export type LoadingStateVariant = "page" | "table" | "card" | "inline";

export interface LoadingStateProps {
  variant?: LoadingStateVariant;
  label?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Precision Orbital Loader Indicator
 */
function OrbitalSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions =
    size === "sm"
      ? "h-5 w-5"
      : size === "lg"
      ? "h-12 w-12"
      : "h-9 w-9";

  const trackWidth = size === "sm" ? "border-[1.5px]" : "border-2";
  const nodeSize = size === "sm" ? "h-1 w-1" : size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5";

  return (
    <div className={`relative flex items-center justify-center ${dimensions} shrink-0`}>
      {/* Background Track */}
      <div className={`absolute inset-0 rounded-full ${trackWidth} border-white/[0.08]`} />

      {/* Active High-Precision Sweep Ring */}
      <div
        className={`absolute inset-0 rounded-full ${trackWidth} border-transparent border-t-[#CC6600] border-r-[#FFA040]/60 animate-spin`}
      />

      {/* Center Micro-Core Emitter */}
      <div
        className={`rounded-full bg-[#CC6600] shadow-[0_0_8px_rgba(204,102,0,0.8)] ${nodeSize}`}
      />
    </div>
  );
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = "card",
  label,
  description,
  className = "",
  size = "md",
}) => {
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2.5 text-xs font-sans text-white/75 ${className}`}>
        <OrbitalSpinner size={size === "lg" ? "md" : "sm"} />
        <span className="font-medium">{label || "Loading..."}</span>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={`py-16 px-4 flex flex-col items-center justify-center gap-3.5 text-center select-none animate-content-fade ${className}`}
      >
        <OrbitalSpinner size="md" />
        <div className="flex flex-col items-center gap-1 max-w-sm">
          <span className="text-sm font-semibold text-white font-sans tracking-tight">
            {label || "Loading records..."}
          </span>
          <span className="text-xs text-white/45 font-sans leading-relaxed">
            {description || "Please wait a moment while telemetry syncs"}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={`flex-1 min-h-[50vh] h-full w-full flex flex-col items-center justify-center gap-4 py-8 px-4 text-center select-none animate-content-fade my-auto mx-auto ${className}`}
      >
        <OrbitalSpinner size="lg" />
        <div className="flex flex-col items-center justify-center gap-1.5 max-w-md mx-auto text-center">
          <h3 className="text-base sm:text-lg font-semibold text-white font-sans tracking-tight">
            {label || "Loading workspace..."}
          </h3>
          <p className="text-xs sm:text-sm text-white/50 font-sans leading-relaxed max-w-sm text-center">
            {description || "Please wait while we load your research workspace"}
          </p>
        </div>
      </div>
    );
  }

  // Default: "card"
  return (
    <div
      className={`min-h-[160px] h-full w-full flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center select-none animate-content-fade ${className}`}
    >
      <OrbitalSpinner size={size} />
      <div className="flex flex-col items-center justify-center text-center gap-1 max-w-sm">
        <span className="text-sm font-semibold text-white font-sans tracking-tight">
          {label || "Loading..."}
        </span>
        {description && (
          <span className="text-xs text-white/45 font-sans leading-relaxed">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
