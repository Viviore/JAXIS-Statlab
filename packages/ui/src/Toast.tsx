"use client";

import React from "react";
import { IconX } from "@tabler/icons-react";

export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastProps {
  message: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
  className?: string;
}

const toastStyles: Record<ToastVariant, { border: string; bg: string; text: string; icon: string }> = {
  info: {
    border: "border-[#3B82F6]/50",
    bg: "bg-[#012E57]",
    text: "text-white",
    icon: "text-[#3B82F6]",
  },
  success: {
    border: "border-[#10B981]/50",
    bg: "bg-[#012E57]",
    text: "text-white",
    icon: "text-[#10B981]",
  },
  warning: {
    border: "border-[#F59E0B]/50",
    bg: "bg-[#012E57]",
    text: "text-white",
    icon: "text-[#F59E0B]",
  },
  danger: {
    border: "border-[#EF4444]/50",
    bg: "bg-[#012E57]",
    text: "text-white",
    icon: "text-[#EF4444]",
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  description,
  variant = "info",
  onClose,
  className = "",
}) => {
  const styles = toastStyles[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 min-w-[320px] max-w-md border rounded-[2px] shadow-2xl ${styles.bg} ${styles.border} ${className}`}
    >
      <div className="flex-1">
        <h6 className={`text-sm font-semibold ${styles.text}`}>{message}</h6>
        {description && <p className="text-xs text-white/70 mt-1 leading-relaxed">{description}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors p-1 rounded-[2px] hover:bg-white/10"
          aria-label="Dismiss notification"
        >
          <IconX size={16} stroke={1.5} />
        </button>
      )}
    </div>
  );
};
