"use client";

import React, { useState, useRef, useEffect } from "react";

export interface AnimateHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // duration in ms
}

export const AnimateHeight: React.FC<AnimateHeightProps> = ({
  children,
  className = "",
  duration = 260,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const isFirstRender = useRef(true);

  // RULE_MEM_01: Strict ResizeObserver cleanup
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const newHeight = entry.target.getBoundingClientRect().height;
          setHeight(newHeight);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Avoid animating on first mount
  useEffect(() => {
    if (height !== undefined && isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [height]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden transition-[height] ${className}`}
      style={{
        height: height !== undefined ? `${height}px` : "auto",
        transitionDuration: isFirstRender.current ? "0ms" : `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};
