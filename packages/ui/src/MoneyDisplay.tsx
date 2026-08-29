"use client";

import * as React from "react";
import { cn } from "./utils";

export interface MoneyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  currency?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  decimals?: number;
  subtext?: string;
  variant?: "default" | "emerald" | "amber" | "sky" | "muted";
}

const sizeVariants = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base font-semibold",
  lg: "text-xl font-bold",
  xl: "text-2xl sm:text-3xl font-bold",
  hero: "text-3xl sm:text-4xl lg:text-5xl font-extrabold",
};

const colorVariants = {
  default: "text-white",
  emerald: "text-[#10B981]",
  amber: "text-[#CC6600]",
  sky: "text-[#38BDF8]",
  muted: "text-white/60",
};

export function Peso({ className = "" }: { className?: string }) {
  return (
    <span className={cn("peso-symbol font-sans font-normal opacity-85 select-none inline-block mr-0.5", className)}>
      ₱
    </span>
  );
}

export function MoneyDisplay({
  amount,
  currency = "₱",
  size = "md",
  decimals = 0,
  subtext,
  variant = "default",
  className = "",
  ...props
}: MoneyDisplayProps) {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-mono tracking-tight select-none",
        sizeVariants[size],
        colorVariants[variant],
        className
      )}
      {...props}
    >
      <span className="font-sans font-normal opacity-80 shrink-0">{currency}</span>
      <span className="tabular-nums font-mono">{formatted}</span>
      {subtext && (
        <span className="text-[0.6875rem] font-sans font-normal text-white/50 tracking-normal ml-1">
          {subtext}
        </span>
      )}
    </span>
  );
}

