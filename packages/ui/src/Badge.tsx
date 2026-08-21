import React from "react";

export type BadgeVariant =
  | "default"
  | "accent"
  | "muted"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-white border-white/20",
  accent: "bg-[#CC6600]/20 text-[#CC6600] border-[#CC6600]/40",
  muted: "bg-white/5 text-white/50 border-white/10",
  success: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
  warning: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
  danger: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  info: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: "text-[0.625rem] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "sm",
  children,
  className = "",
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-medium rounded-[2px] border select-none whitespace-nowrap ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
      {...props}
    >
      {children ?? label}
    </span>
  );
};
