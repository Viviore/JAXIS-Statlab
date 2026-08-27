"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "./utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans uppercase rounded-[2px] transition-all duration-150 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.985]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#E67300] to-[#CC6600] hover:from-[#FF8000] hover:to-[#E67300] active:from-[#B35900] active:to-[#994D00] text-white font-bold border border-[#CC6600] border-t-[#FFA040]/70 border-b-[#994D00] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(204,102,0,0.35)] hover:-translate-y-0.5 active:translate-y-0",
        primary:
          "bg-gradient-to-b from-[#E67300] to-[#CC6600] hover:from-[#FF8000] hover:to-[#E67300] active:from-[#B35900] active:to-[#994D00] text-white font-bold border border-[#CC6600] border-t-[#FFA040]/70 border-b-[#994D00] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(204,102,0,0.35)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-gradient-to-b from-[#02254B] to-[#011C38] hover:from-[#033468] hover:to-[#02254B] active:from-[#01142A] active:to-[#010D1F] text-white font-semibold border border-white/20 border-t-white/35 border-b-black/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_3px_rgba(0,0,0,0.4)] hover:border-white/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "bg-transparent hover:bg-white/[0.06] active:bg-white/[0.12] text-white/90 hover:text-white font-semibold border border-white/30 hover:border-white/50 border-t-white/40 border-b-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "bg-transparent hover:bg-white/10 active:bg-white/15 text-white/80 hover:text-white font-semibold border border-transparent",
        destructive:
          "bg-gradient-to-b from-[#EF4444] to-[#DC2626] hover:from-[#F87171] hover:to-[#EF4444] active:from-[#B91C1C] active:to-[#991B1B] text-white font-bold border border-[#DC2626] border-t-[#FCA5A5]/60 border-b-[#991B1B] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(220,38,38,0.35)] hover:-translate-y-0.5 active:translate-y-0",
        danger:
          "bg-gradient-to-b from-[#EF4444] to-[#DC2626] hover:from-[#F87171] hover:to-[#EF4444] active:from-[#B91C1C] active:to-[#991B1B] text-white font-bold border border-[#DC2626] border-t-[#FCA5A5]/60 border-b-[#991B1B] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(220,38,38,0.35)] hover:-translate-y-0.5 active:translate-y-0",
        link:
          "text-[#38BDF8] underline-offset-4 hover:underline border-transparent bg-transparent font-semibold lowercase tracking-normal",
      },
      size: {
        default: "text-xs px-5 sm:px-6 py-2 min-h-[38px] tracking-[0.06em]",
        sm: "text-[0.688rem] px-3.5 sm:px-4.5 py-1.5 min-h-[32px] tracking-[0.06em]",
        md: "text-xs px-5 sm:px-6 py-2 min-h-[38px] tracking-[0.06em]",
        lg: "text-sm px-6 sm:px-8 py-2.5 min-h-[44px] tracking-[0.08em]",
        icon: "h-9 w-9 p-0 min-h-[36px] min-w-[36px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "danger"
  | "link";

export type ButtonSize = "default" | "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <IconLoader2 size={16} stroke={2} className="animate-spin text-current shrink-0" />
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";
