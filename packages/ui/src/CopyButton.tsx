"use client";

import * as React from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { cn } from "./utils";

export interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onCopy"> {
  value: string;
  label?: string;
  copiedLabel?: string;
  iconOnly?: boolean;
  timeout?: number;
  onCopy?: (value: string) => void;
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  iconOnly = false,
  timeout = 2000,
  className = "",
  onCopy,
  onClick,
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
      onCopy?.(value);

      setTimeout(() => {
        setHasCopied(false);
      }, timeout);
    } catch {
      // Fallback if clipboard API not available
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setHasCopied(true);
      onCopy?.(value);

      setTimeout(() => {
        setHasCopied(false);
      }, timeout);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={hasCopied ? copiedLabel : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 font-mono text-xs font-medium transition-all select-none",
        hasCopied
          ? "border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]"
          : "border-white/15 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white",
        iconOnly && "px-1.5 py-1",
        className
      )}
      {...props}
    >
      {hasCopied ? (
        <IconCheck size={14} stroke={2} className="text-[#10B981]" />
      ) : (
        <IconCopy size={14} stroke={1.5} className="text-white/60" />
      )}
      {!iconOnly && (
        <span className="text-[0.6875rem] uppercase tracking-wider">
          {hasCopied ? copiedLabel : label}
        </span>
      )}
    </button>
  );
}
