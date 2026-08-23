"use client";

import React from "react";
import { IconLoader2 } from "@tabler/icons-react";

export type LoadingStateVariant = "page" | "table" | "card" | "inline";

export interface LoadingStateProps {
  variant?: LoadingStateVariant;
  label?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
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
      <div className={`inline-flex items-center gap-2 text-xs font-sans text-white/70 ${className}`}>
        <IconLoader2
          size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
          stroke={1.5}
          className="animate-spin text-[#CC6600]"
        />
        <span>{label || "Loading..."}</span>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={`py-12 px-4 flex flex-col items-center justify-center gap-2.5 animate-content-fade ${className}`}>
        <div className="relative flex items-center justify-center h-10 w-10">
          <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#CC6600]/20 opacity-75" />
          <IconLoader2
            size={24}
            stroke={1.5}
            className="animate-spin text-[#CC6600] relative z-10"
          />
        </div>
        <div className="flex flex-col items-center gap-1 text-center max-w-sm">
          <span className="text-sm font-semibold text-white/80 font-sans tracking-tight">
            {label || "Loading records..."}
          </span>
          <span className="text-xs text-white/40 font-sans leading-relaxed">
            {description || "Please wait a moment"}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={`min-h-[50vh] w-full flex flex-col items-center justify-center gap-4 p-8 animate-content-fade ${className}`}
      >
        <div className="relative flex items-center justify-center h-14 w-14 rounded-[2px] bg-[#011B38] border border-white/[0.08] shadow-xl">
          <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-[#CC6600]/25 opacity-75" />
          <IconLoader2
            size={32}
            stroke={1.5}
            className="animate-spin text-[#CC6600] relative z-10"
          />
        </div>
        <div className="flex flex-col items-center gap-1 text-center max-w-md">
          <span className="text-base font-semibold text-white font-sans tracking-tight">
            {label || "Loading workspace..."}
          </span>
          <span className="text-xs text-white/50 font-sans leading-relaxed">
            {description || "Please wait while we load your session"}
          </span>
        </div>
      </div>
    );
  }

  // Default: "card"
  return (
    <div
      className={`min-h-[140px] h-full w-full flex-1 flex flex-col items-center justify-center gap-2.5 p-6 text-center animate-content-fade ${className}`}
    >
      <IconLoader2
        size={22}
        stroke={1.5}
        className="animate-spin text-[#CC6600]"
      />
      <div className="flex flex-col items-center justify-center text-center gap-1 max-w-sm">
        <span className="text-sm font-semibold text-white/80 font-sans tracking-tight">
          {label || "Loading..."}
        </span>
        {description && (
          <span className="text-xs text-white/40 font-sans leading-relaxed">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
