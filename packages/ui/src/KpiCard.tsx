"use client";

import React from "react";
import Link from "next/link";
import { Card } from "./Card";

export type KpiCardVariant = "default" | "emerald" | "amber" | "sky" | "red" | "orange";

export interface KpiCardProps {
  label: string;
  value: string | number | React.ReactNode;
  description?: string | React.ReactNode;
  variant?: KpiCardVariant;
  badge?: string;
  badgeColor?: "orange" | "emerald" | "sky" | "amber" | "indigo" | "gray";
  icon?: React.ReactNode;
  href?: string;
  className?: string;
  monoLabel?: boolean;
}

const VARIANT_VALUE_COLORS: Record<KpiCardVariant, string> = {
  default: "text-white",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  sky: "text-sky-400",
  red: "text-red-400",
  orange: "text-[#CC6600]",
};

const VARIANT_DOT_COLORS: Record<KpiCardVariant, string> = {
  default: "text-white/50",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  sky: "text-sky-400",
  red: "text-red-400",
  orange: "text-[#CC6600]",
};

const VARIANT_BORDER_ACCENTS: Record<KpiCardVariant, string> = {
  default: "hover:border-white/20",
  emerald: "border-l-2 border-l-emerald-500/80 hover:border-l-emerald-400",
  amber: "border-l-2 border-l-amber-500/80 hover:border-l-amber-400",
  sky: "border-l-2 border-l-sky-500/80 hover:border-l-sky-400",
  red: "border-l-2 border-l-red-500/80 hover:border-l-red-400",
  orange: "border-l-2 border-l-[#CC6600]/80 hover:border-l-[#CC6600]",
};

const BADGE_STYLES: Record<string, string> = {
  orange: "bg-[#CC6600]/25 text-[#CC6600] border-[#CC6600]/40",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  sky: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  gray: "bg-white/[0.04] text-white/30 border-white/[0.08]",
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  description,
  variant = "default",
  badge,
  badgeColor = "gray",
  icon,
  href,
  className = "",
  monoLabel = true,
}) => {
  const content = (
    <Card
      className={`p-5 transition-all duration-150 group h-full flex flex-col justify-between min-h-[140px] ${VARIANT_BORDER_ACCENTS[variant]} ${
        href ? "cursor-pointer hover:bg-white/[0.03]" : ""
      } ${className}`}
      style={{
        height: "100%",
        minHeight: "140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div className="flex flex-col justify-between h-full w-full gap-2.5 flex-1" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", flex: 1 }}>
        {/* Header Row: Label + Icon / Badge (Level Height) */}
        <div className="flex items-center justify-between gap-2 min-h-[1.5rem]">
          <span
            className={`text-xs select-none uppercase tracking-wider font-medium truncate ${
              monoLabel ? "font-mono text-white/50" : "font-sans text-white/60"
            }`}
            style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            {label}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {badge && (
              <span
                className={`text-[0.625rem] font-mono px-1.5 py-0.5 rounded-[2px] border font-semibold ${
                  BADGE_STYLES[badgeColor]
                }`}
              >
                {badge}
              </span>
            )}
            {icon && <span className="text-white/40 group-hover:text-white transition-colors">{icon}</span>}
          </div>
        </div>

        {/* Value Row: Large prominent metric display (Vertically Level) */}
        <div className="my-auto py-0.5">
          <span
            className={`font-mono font-bold tracking-tight block ${
              typeof value === "string" && value.length > 8
                ? "text-2xl"
                : "text-3xl"
            } ${VARIANT_VALUE_COLORS[variant]}`}
            style={{
              fontSize: typeof value === "string" && value.length > 8 ? "1.5rem" : "1.875rem",
              lineHeight: "2.25rem",
              fontWeight: 700,
            }}
          >
            {typeof value === "string" && value.includes("₱") ? (
              (() => {
                const parts = value.split("₱");
                return (
                  <span className="inline-flex items-baseline">
                    {parts[0] && <span>{parts[0]}</span>}
                    <span
                      className="font-sans font-normal text-[0.72em] opacity-75 mr-0.5 select-none"
                      style={{ fontWeight: 400 }}
                    >
                      ₱
                    </span>
                    <span>{parts.slice(1).join("₱")}</span>
                  </span>
                );
              })()
            ) : (
              value
            )}
          </span>
        </div>

        {/* Footer / Subtitle Row (Level Baseline Divider) */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center min-h-[1.75rem]">
          {description ? (
            <div className="flex items-center gap-1.5 text-[0.688rem] font-mono select-none w-full">
              <span className={`${VARIANT_DOT_COLORS[variant]} flex-shrink-0 leading-none`}>●</span>
              <span className="text-white/60 truncate">{description}</span>
            </div>
          ) : (
            <div className="text-[0.688rem] text-transparent select-none">&nbsp;</div>
          )}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block no-underline h-full flex flex-col"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {content}
      </Link>
    );
  }

  return content;
};
