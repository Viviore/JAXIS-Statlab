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
 * Modern Minimalist Spinner
 * Clean single-track geometry, calibrated active arc with rounded caps, silky smooth spin.
 */
function ModernSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  if (size === "sm") {
    return (
      <div className="relative flex items-center justify-center h-4 w-4 shrink-0">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-spin"
          style={{ animationDuration: "0.85s" }}
        >
          <circle
            cx="10"
            cy="10"
            r="7.5"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            r="7.5"
            stroke="#CC6600"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="14 36"
          />
        </svg>
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div className="relative flex items-center justify-center h-10 w-10 shrink-0">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-spin"
          style={{ animationDuration: "0.85s" }}
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2.5"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#CC6600"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="28 72"
          />
        </svg>
      </div>
    );
  }

  // Default: "md" (28px)
  return (
    <div className="relative flex items-center justify-center h-7 w-7 shrink-0">
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-spin"
        style={{ animationDuration: "0.85s" }}
      >
        <circle
          cx="14"
          cy="14"
          r="11"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="2.25"
        />
        <circle
          cx="14"
          cy="14"
          r="11"
          stroke="#CC6600"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeDasharray="20 50"
        />
      </svg>
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
      <div className={`inline-flex items-center gap-2 text-xs font-sans text-white/75 ${className}`}>
        <ModernSpinner size={size === "lg" ? "md" : "sm"} />
        <span className="font-medium">{label || "Loading..."}</span>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={`py-16 px-4 flex flex-col items-center justify-center gap-4 text-center select-none animate-content-fade ${className}`}
      >
        <ModernSpinner size="md" />
        <div className="flex flex-col items-center gap-1 max-w-sm">
          <span className="text-sm font-semibold text-white font-sans tracking-tight">
            {label || "Loading records..."}
          </span>
          <span className="text-xs text-white/45 font-sans leading-relaxed">
            {description || "Please wait while records load"}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={`flex-1 min-h-full h-full w-full flex flex-col items-center justify-center gap-5 py-8 px-4 text-center select-none animate-content-fade my-auto mx-auto ${className}`}
      >
        <ModernSpinner size="lg" />
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
      className={`min-h-[160px] h-full w-full flex-1 flex flex-col items-center justify-center gap-3.5 p-6 text-center select-none animate-content-fade ${className}`}
    >
      <ModernSpinner size={size} />
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
