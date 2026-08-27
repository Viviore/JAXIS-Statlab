"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

export const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-[2px] border bg-[#011C38] px-4 py-3 sm:px-5 sm:py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#38BDF8] disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-sans resize-y box-border",
  {
    variants: {
      hasError: {
        true: "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
        false: "border-white/12 hover:border-white/20 focus:border-[#38BDF8]",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ hasError: Boolean(error), className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
