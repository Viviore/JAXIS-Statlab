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
  default: "bg-white/40",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  sky: "bg-sky-400",
  red: "bg-red-400",
  orange: "bg-[#CC6600]",
};

const BADGE_STYLES: Record<string, string> = {
  orange: "bg-[#CC6600]/20 text-[#FFA040] border-[#CC6600]/40",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  sky: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  gray: "bg-white/[0.06] text-white/60 border-white/10",
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
  monoLabel = false,
}) => {
  const content = (
    <Card
      variant="kpi"
      className={`rounded-[4px] transition-all duration-200 group h-full flex flex-col justify-between min-h-[150px] bg-[#01142B]/95 border border-white/10 hover:border-white/20 shadow-xl ${
        href ? "cursor-pointer hover:bg-[#011B38]" : ""
      } ${className}`}
      style={{
        padding: "1.5rem",
        boxSizing: "border-box",
        minHeight: "150px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        className="flex flex-col justify-between h-full w-full gap-3 flex-1"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          gap: "0.875rem",
        }}
      >
        {/* Header Row: Label + Icon / Badge */}
        <div className="flex items-center justify-between gap-3 min-h-[1.5rem]">
          <span
            className={`text-xs select-none uppercase tracking-wider font-medium truncate ${
              monoLabel ? "font-mono text-white/50" : "font-sans text-white/60"
            }`}
          >
            {label}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge && (
              <span
                className={`text-xs font-sans px-2.5 py-0.5 rounded-[3px] border font-medium tracking-wider ${
                  BADGE_STYLES[badgeColor]
                }`}
              >
                {badge}
              </span>
            )}
            {icon && (
              <div className="h-7 w-7 rounded-[3px] bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                {icon}
              </div>
            )}
          </div>
        </div>

        {/* Value Row: Calibrated, elegant metric display (Font-Semibold, Not Extrabold) */}
        <div className="py-1 my-auto">
          <span
            className={`font-sans font-semibold tracking-tight block ${
              typeof value === "string" && value.length > 8
                ? "text-xl sm:text-2xl"
                : "text-2xl sm:text-3xl"
            } ${VARIANT_VALUE_COLORS[variant]}`}
          >
            {typeof value === "string" && value.includes("₱") ? (
              (() => {
                const parts = value.split("₱");
                return (
                  <span className="inline-flex items-baseline font-mono">
                    {parts[0] && <span>{parts[0]}</span>}
                    <span className="font-sans font-normal text-[0.72em] opacity-80 mr-1 select-none">
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

        {/* Footer / Subtitle Row */}
        <div className="pt-2.5 border-t border-white/[0.08] flex items-center min-h-[1.5rem]">
          {description ? (
            <div className="flex items-center gap-2 text-xs font-sans font-normal text-white/55 select-none w-full">
              <span className={`h-1.5 w-1.5 rounded-full ${VARIANT_DOT_COLORS[variant]} flex-shrink-0`} />
              <span className="truncate">{description}</span>
            </div>
          ) : (
            <div className="text-xs text-transparent select-none">&nbsp;</div>
          )}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block no-underline h-full flex flex-col group"
      >
        {content}
      </Link>
    );
  }

  return content;
};
