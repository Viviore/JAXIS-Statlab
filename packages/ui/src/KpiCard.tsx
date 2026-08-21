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
      className={`p-5 transition-all duration-150 group ${VARIANT_BORDER_ACCENTS[variant]} ${
        href ? "cursor-pointer hover:bg-white/[0.03]" : ""
      } ${className}`}
    >
      <div className="flex flex-col justify-between h-full gap-3">
        {/* Header Row: Label + Icon / Badge */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs select-none uppercase tracking-wider font-medium ${
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

        {/* Value Row: Large prominent metric display */}
        <div className="my-1">
          <span
            className={`text-3xl font-mono font-bold tracking-tight block ${VARIANT_VALUE_COLORS[variant]}`}
            style={{ fontSize: "1.875rem", lineHeight: "2.25rem", fontWeight: 700 }}
          >
            {value}
          </span>
        </div>

        {/* Footer / Subtitle Row */}
        {description && (
          <div className="flex items-center gap-1.5 text-[0.688rem] font-mono select-none">
            <span className={`${VARIANT_DOT_COLORS[variant]} flex-shrink-0 leading-none`}>●</span>
            <span className="text-white/60 truncate">{description}</span>
          </div>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
};
