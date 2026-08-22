"use client";

import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<
  ButtonVariant,
  { className: string; bg: string; text: string; border: string; hoverBg: string; hoverBorder: string }
> = {
  primary: {
    className:
      "bg-[#CC6600]/20 hover:bg-[#CC6600]/35 active:bg-[#CC6600]/45 text-white border border-[#CC6600] shadow-sm shadow-[#CC6600]/20 hover:shadow-[#CC6600]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    bg: "rgba(204, 102, 0, 0.20)",
    text: "#FFFFFF",
    border: "1px solid #CC6600",
    hoverBg: "rgba(204, 102, 0, 0.35)",
    hoverBorder: "#CC6600",
  },
  secondary: {
    className:
      "bg-[#011C38]/80 hover:bg-[#012E57] active:bg-[#01162E] text-white/90 hover:text-white border border-white/20 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm",
    bg: "rgba(1, 28, 56, 0.80)",
    text: "#FFFFFF",
    border: "1px solid rgba(255, 255, 255, 0.20)",
    hoverBg: "rgba(1, 46, 87, 1)",
    hoverBorder: "rgba(255, 255, 255, 0.40)",
  },
  outline: {
    className:
      "bg-transparent hover:bg-white/[0.06] active:bg-white/[0.12] text-white/90 hover:text-white border border-white/35 hover:border-white/60 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    bg: "transparent",
    text: "#FFFFFF",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    hoverBg: "rgba(255, 255, 255, 0.06)",
    hoverBorder: "rgba(255, 255, 255, 0.60)",
  },
  ghost: {
    className:
      "bg-transparent hover:bg-white/10 active:bg-white/15 text-white/80 hover:text-white border border-transparent active:scale-[0.98]",
    bg: "transparent",
    text: "rgba(255, 255, 255, 0.85)",
    border: "1px solid transparent",
    hoverBg: "rgba(255, 255, 255, 0.10)",
    hoverBorder: "transparent",
  },
  danger: {
    className:
      "bg-[#EF4444]/20 hover:bg-[#EF4444]/35 active:bg-[#EF4444]/45 text-[#EF4444] hover:text-white border border-[#EF4444]/60 hover:border-[#EF4444] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    bg: "rgba(239, 68, 68, 0.20)",
    text: "#FFFFFF",
    border: "1px solid rgba(239, 68, 68, 0.60)",
    hoverBg: "rgba(239, 68, 68, 0.35)",
    hoverBorder: "#EF4444",
  },
};

const sizeStyles: Record<ButtonSize, { className: string; padding: string; fontSize: string; minHeight: string }> = {
  sm: {
    className: "text-[0.688rem] px-4.5 py-1.5 min-h-[30px] tracking-[0.10em] uppercase",
    padding: "0.35rem 1.125rem",
    fontSize: "0.688rem",
    minHeight: "30px",
  },
  md: {
    className: "text-xs px-6 py-2 min-h-[38px] tracking-[0.10em] uppercase",
    padding: "0.55rem 1.5rem",
    fontSize: "0.75rem",
    minHeight: "38px",
  },
  lg: {
    className: "text-sm px-8 py-3 min-h-[46px] tracking-[0.12em] uppercase",
    padding: "0.75rem 2rem",
    fontSize: "0.875rem",
    minHeight: "46px",
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      children,
      className = "",
      type = "button",
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const variantConfig = variantStyles[variant];
    const sizeConfig = sizeStyles[size];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 font-semibold font-sans uppercase rounded-[2px] transition-[transform,background-color,border-color,box-shadow,color] duration-150 ease-out select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#CC6600] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantConfig.className} ${sizeConfig.className} ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: sizeConfig.padding,
          fontSize: sizeConfig.fontSize,
          minHeight: sizeConfig.minHeight,
          backgroundColor: variantConfig.bg,
          color: variantConfig.text,
          border: variantConfig.border,
          borderRadius: "2px",
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          lineHeight: 1.2,
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <svg
              className="animate-spin h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ height: "0.875rem", width: "0.875rem" }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
