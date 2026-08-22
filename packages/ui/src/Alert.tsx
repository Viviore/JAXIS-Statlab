"use client";

import React from "react";
import { IconX } from "@tabler/icons-react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const alertStyles: Record<AlertVariant, { container: string; icon: string; title: string }> = {
  info: {
    container: "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-white",
    icon: "text-[#3B82F6]",
    title: "text-[#3B82F6]",
  },
  success: {
    container: "bg-[#10B981]/10 border-[#10B981]/30 text-white",
    icon: "text-[#10B981]",
    title: "text-[#10B981]",
  },
  warning: {
    container: "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-white",
    icon: "text-[#F59E0B]",
    title: "text-[#F59E0B]",
  },
  danger: {
    container: "bg-[#EF4444]/10 border-[#EF4444]/30 text-white",
    icon: "text-[#EF4444]",
    title: "text-[#EF4444]",
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  className = "",
  onClose,
}) => {
  const styles = alertStyles[variant];

  return (
    <div
      role="alert"
      className={`relative w-full border rounded-[2px] p-4 text-sm flex items-start gap-3 transition-all ${styles.container} ${className}`}
    >
      <div className="flex-1">
        {title && <h5 className={`font-semibold mb-1 text-sm ${styles.title}`}>{title}</h5>}
        <div className="text-white/80 leading-relaxed text-xs sm:text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors p-1 rounded-[2px] hover:bg-white/10 cursor-pointer"
          aria-label="Close alert"
        >
          <IconX size={16} stroke={1.5} />
        </button>
      )}
    </div>
  );
};
