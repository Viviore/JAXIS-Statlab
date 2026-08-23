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

const variantStyles: Record<ButtonVariant, { className: string }> = {
  primary: {
    className:
      "bg-gradient-to-b from-[#E67300] to-[#CC6600] hover:from-[#FF8000] hover:to-[#E67300] active:from-[#B35900] active:to-[#994D00] text-white font-bold border border-[#CC6600] border-t-[#FFA040]/70 border-b-[#994D00] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(204,102,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
  },
  secondary: {
    className:
      "bg-gradient-to-b from-[#02254B] to-[#011C38] hover:from-[#033468] hover:to-[#02254B] active:from-[#01142A] active:to-[#010D1F] text-white font-semibold border border-white/20 border-t-white/35 border-b-black/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_3px_rgba(0,0,0,0.4)] hover:border-white/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]",
  },
  outline: {
    className:
      "bg-transparent hover:bg-white/[0.06] active:bg-white/[0.12] text-white/90 hover:text-white font-semibold border border-white/30 hover:border-white/50 border-t-white/40 border-b-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]",
  },
  ghost: {
    className:
      "bg-transparent hover:bg-white/10 active:bg-white/15 text-white/80 hover:text-white font-semibold border border-transparent active:scale-[0.985]",
  },
  danger: {
    className:
      "bg-gradient-to-b from-[#EF4444] to-[#DC2626] hover:from-[#F87171] hover:to-[#EF4444] active:from-[#B91C1C] active:to-[#991B1B] text-white font-bold border border-[#DC2626] border-t-[#FCA5A5]/60 border-b-[#991B1B] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(220,38,38,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
  },
};

const sizeStyles: Record<ButtonSize, { className: string }> = {
  sm: {
    className: "text-[0.688rem] px-4.5 py-1.5 min-h-[32px] tracking-[0.06em]",
  },
  md: {
    className: "text-xs px-6 py-2 min-h-[38px] tracking-[0.06em]",
  },
  lg: {
    className: "text-sm px-8 py-2.5 min-h-[44px] tracking-[0.08em]",
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
        className={`inline-flex items-center justify-center gap-2 font-sans uppercase rounded-[2px] transition-all duration-150 ease-out select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#CC6600] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantConfig.className} ${sizeConfig.className} ${className}`}
        style={{
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
