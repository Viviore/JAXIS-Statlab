"use client";

import React, { useState } from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    left: "right-full top-1/2 -translate-y-1/2 mr-3",
    right: "left-full top-1/2 -translate-y-1/2 ml-3",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-[100] pointer-events-none rounded-[3px] bg-[#01142B] border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-md animate-content-fade ${positionClasses[position]}`}
          style={{
            padding: "0.875rem 1.125rem", // 14px vertical, 18px horizontal guaranteed padding
            boxShadow: "0 16px 40px -4px rgba(0, 0, 0, 0.85)",
            minWidth: "220px",
            maxWidth: "360px",
          }}
        >
          {content}
          {/* Subtle Pointer Arrow */}
          {position === "top" && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#01142B] border-r border-b border-white/20" />
          )}
          {position === "bottom" && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#01142B] border-l border-t border-white/20" />
          )}
        </div>
      )}
    </div>
  );
}

export interface TagsOverflowProps {
  tags: string[];
  limit?: number;
  title?: string;
  emptyText?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Reusable enterprise tag chip display with overflow +N badge & hover tooltip.
 */
export function TagsOverflow({
  tags,
  limit = 2,
  title = "Additional Items",
  emptyText = "--",
  position = "bottom",
  className = "",
}: TagsOverflowProps) {
  if (!tags || tags.length === 0) {
    return <span className="text-xs text-white/25 italic">{emptyText}</span>;
  }

  const visibleTags = tags.slice(0, limit);
  const remainingTags = tags.slice(limit);

  return (
    <div className={`flex items-center gap-1.5 whitespace-nowrap ${className}`}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className="text-[0.6875rem] font-mono px-2 py-0.5 rounded-[2px] bg-white/[0.03] text-slate-300/80 border border-white/[0.08] whitespace-nowrap truncate max-w-[130px]"
          title={tag}
        >
          {tag}
        </span>
      ))}

      {remainingTags.length > 0 && (
        <Tooltip
          position={position}
          content={
            <div className="flex flex-col gap-2 text-left">
              <span className="text-[0.625rem] font-mono uppercase tracking-widest text-white/50 font-semibold border-b border-white/[0.08] pb-1.5">
                {title} (+{remainingTags.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {remainingTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-[2px] bg-white/[0.06] text-slate-200 border border-white/10 text-[0.6875rem] font-mono whitespace-nowrap shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          }
        >
          <span className="text-[0.6875rem] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#012E57]/80 text-[#38BDF8] border border-[#38BDF8]/30 whitespace-nowrap cursor-help hover:bg-[#012E57] hover:border-[#38BDF8] transition-colors select-none">
            +{remainingTags.length}
          </span>
        </Tooltip>
      )}
    </div>
  );
}
