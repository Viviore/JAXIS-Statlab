"use client";

import React from "react";
import {
  IconX,
  IconAlertOctagon,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  badgeText?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  style?: React.CSSProperties;
  showIcon?: boolean;
}

const variantConfig = {
  danger: {
    defaultBadge: "Error",
    icon: IconAlertOctagon,
    iconColor: "#EF4444",
    iconBg: "rgba(239, 68, 68, 0.15)",
    iconBorder: "rgba(239, 68, 68, 0.3)",
    containerBg: "rgba(239, 68, 68, 0.08)",
    containerBorder: "rgba(239, 68, 68, 0.3)",
    borderLeft: "3px solid #EF4444",
    titleColor: "#FCA5A5",
    textColor: "rgba(255, 255, 255, 0.9)",
  },
  warning: {
    defaultBadge: "Warning",
    icon: IconAlertTriangle,
    iconColor: "#F59E0B",
    iconBg: "rgba(245, 158, 11, 0.15)",
    iconBorder: "rgba(245, 158, 11, 0.3)",
    containerBg: "rgba(245, 158, 11, 0.08)",
    containerBorder: "rgba(245, 158, 11, 0.3)",
    borderLeft: "3px solid #F59E0B",
    titleColor: "#FDE68A",
    textColor: "rgba(255, 255, 255, 0.9)",
  },
  success: {
    defaultBadge: "Success",
    icon: IconCircleCheck,
    iconColor: "#10B981",
    iconBg: "rgba(16, 185, 129, 0.15)",
    iconBorder: "rgba(16, 185, 129, 0.3)",
    containerBg: "rgba(16, 185, 129, 0.08)",
    containerBorder: "rgba(16, 185, 129, 0.3)",
    borderLeft: "3px solid #10B981",
    titleColor: "#A7F3D0",
    textColor: "rgba(255, 255, 255, 0.9)",
  },
  info: {
    defaultBadge: "Notice",
    icon: IconInfoCircle,
    iconColor: "#38BDF8",
    iconBg: "rgba(56, 189, 248, 0.15)",
    iconBorder: "rgba(56, 189, 248, 0.3)",
    containerBg: "rgba(56, 189, 248, 0.08)",
    containerBorder: "rgba(56, 189, 248, 0.3)",
    borderLeft: "3px solid #38BDF8",
    titleColor: "#BAE6FD",
    textColor: "rgba(255, 255, 255, 0.9)",
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  badgeText,
  children,
  className = "",
  onClose,
  style,
  showIcon = true,
}) => {
  const cfg = variantConfig[variant];
  const IconComponent = cfg.icon;
  const headerText = title || badgeText || cfg.defaultBadge;

  return (
    <div
      role="alert"
      className={`relative w-full rounded-[2px] transition-all flex items-start gap-3.5 backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: cfg.containerBg,
        border: `1px solid ${cfg.containerBorder}`,
        borderLeft: cfg.borderLeft,
        padding: "0.875rem 1.125rem",
        borderRadius: "2px",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.875rem",
        boxSizing: "border-box",
        width: "100%",
        ...style,
      }}
    >
      {showIcon && (
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-[2px] mt-0.5"
          style={{
            width: "1.875rem",
            height: "1.875rem",
            backgroundColor: cfg.iconBg,
            border: `1px solid ${cfg.iconBorder}`,
            color: cfg.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "2px",
            flexShrink: 0,
          }}
        >
          <IconComponent size={16} stroke={2} />
        </div>
      )}

      <div
        className="flex-1 min-w-0 flex flex-col gap-0.5"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
          flex: 1,
          minWidth: 0,
        }}
      >
        {headerText && (
          <h5
            className="font-sans text-xs font-bold uppercase tracking-wider select-none"
            style={{
              color: cfg.titleColor,
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {headerText}
          </h5>
        )}
        <div
          className="font-sans text-xs sm:text-sm leading-relaxed"
          style={{
            color: cfg.textColor,
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 text-white/40 hover:text-white transition-colors p-1 rounded-[2px] hover:bg-white/10 cursor-pointer"
          style={{
            flexShrink: 0,
            background: "none",
            border: "none",
            padding: "0.25rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "2px",
          }}
          aria-label="Close alert"
        >
          <IconX size={15} stroke={2} />
        </button>
      )}
    </div>
  );
};

