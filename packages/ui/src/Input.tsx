"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

export const inputVariants = cva(
  "flex w-full h-11 sm:h-12 px-3.5 sm:px-4 text-sm rounded-[2px] text-white placeholder:text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans box-border border focus:outline-none focus:ring-1 focus:ring-[#38BDF8] file:border-0 file:bg-transparent file:text-sm file:font-medium [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#011C38] border-white/12 hover:border-white/20 focus:border-[#38BDF8]",
        terminal: "bg-[#010E21] border-white/15 hover:border-white/25 focus:border-[#38BDF8] font-mono",
        auth: "bg-[#01142B] border-white/15 hover:border-white/25 focus:border-[#38BDF8]",
      },
      hasError: {
        true: "!border-[#EF4444] focus:!border-[#EF4444] focus:!ring-[#EF4444]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hasError: false,
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", variant, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, hasError: Boolean(error), className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
