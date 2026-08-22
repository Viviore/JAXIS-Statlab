"use client";

import React, { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className = "",
}) => {
  // RULE_MEM_01: Effect cleanup for keyboard escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-xl bg-gradient-to-b from-[#011C38] via-[#01162E] to-[#010D1F] border-l border-white/[0.12] shadow-2xl shadow-black/80 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 ${className}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-white/[0.02]">
            <div className="flex flex-col gap-1.5 pr-2 min-w-0">
              {title && <div className="text-lg font-bold text-white font-sans">{title}</div>}
              {description && (
                <p className="text-xs text-white/60 font-sans leading-relaxed">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0"
              aria-label="Close panel"
            >
              <IconX size={20} stroke={1.5} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {children}
          </div>

          {/* Footer Actions */}
          {footer && (
            <div className="p-5 border-t border-white/[0.08] bg-[#011124]/90 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
