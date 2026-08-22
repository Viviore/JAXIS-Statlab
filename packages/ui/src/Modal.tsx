"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className = "",
  size = "lg",
}) => {
  const actualOpen = open ?? isOpen ?? false;
  // Global Enter / Exit Animation Lifecycle
  const [isRendered, setIsRendered] = useState(actualOpen);
  const [isVisible, setIsVisible] = useState(actualOpen);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Content preservation cache to prevent empty body during exit transitions
  const [cachedContent, setCachedContent] = useState({
    title,
    description,
    children,
    footer,
  });

  useEffect(() => {
    if (actualOpen && (children !== null || title !== null)) {
      setCachedContent({
        title,
        description,
        children,
        footer,
      });
    }
  }, [actualOpen, title, description, children, footer]);

  useEffect(() => {
    if (actualOpen) {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setIsRendered(true);
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      exitTimerRef.current = setTimeout(() => {
        setIsRendered(false);
      }, 200);
      return () => {
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
        }
      };
    }
  }, [actualOpen]);

  // RULE_MEM_01: Strict Keyboard Listener Cleanup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isRendered) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, onClose]);

  if (!isRendered) return null;

  const currentTitle = open ? title : (title ?? cachedContent.title);
  const currentDesc = open ? description : (description ?? cachedContent.description);
  const currentChildren = open ? children : (children ?? cachedContent.children);
  const currentFooter = open ? footer : (footer ?? cachedContent.footer);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        boxSizing: "border-box",
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with seamless fade in / out */}
      <div
        className={`fixed inset-0 bg-[#010114]/85 backdrop-blur-md ${
          isVisible ? "animate-modal-backdrop-in" : "animate-modal-backdrop-out"
        }`}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(1, 1, 20, 0.85)",
          backdropFilter: "blur(12px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box with seamless scale & translate in / out */}
      <div
        className={`relative z-10 w-full ${sizeClasses[size]} bg-gradient-to-b from-[#011C38] via-[#01162E] to-[#010D1F] border border-white/[0.12] rounded-[2px] shadow-2xl shadow-black/90 text-white overflow-hidden ${
          isVisible ? "animate-modal-dialog-in" : "animate-modal-dialog-out"
        } ${className}`}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: size === "2xl" ? "56rem" : size === "xl" ? "48rem" : "42rem",
          backgroundColor: "#01162E",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "2px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)",
          boxSizing: "border-box",
        }}
      >
        {/* Subtle top edge specular highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.25] to-transparent"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 border-b border-white/[0.08] bg-white/[0.01]"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.875rem 1rem", // 14px top/bottom, 1rem (16px) left/right
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            boxSizing: "border-box",
          }}
        >
          <div className="min-w-0 pr-2">
            {currentTitle && <div className="text-base font-bold text-white tracking-tight">{currentTitle}</div>}
            {currentDesc && (
              <p
                className="text-xs text-white/60 mt-1 font-sans leading-relaxed"
                style={{ fontSize: "0.813rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "0.25rem" }}
              >
                {currentDesc}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-[2px] hover:bg-white/10 select-none focus:outline-none flex-shrink-0"
            style={{
              padding: "0.375rem",
              borderRadius: "2px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.4)",
            }}
            aria-label="Close modal"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        {/* Content Body */}
        <div
          className="text-sm text-white/90 overflow-y-auto"
          style={{
            padding: "1rem", // 1rem (16px) padding
            maxHeight: "82vh",
            overflowY: "auto",
            boxSizing: "border-box",
            fontSize: "0.875rem",
          }}
        >
          {currentChildren}
        </div>

        {/* Footer */}
        {currentFooter && (
          <div
            className="border-t border-white/[0.08] bg-black/30 flex justify-end items-center gap-3"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1rem", // 14px top/bottom, 1rem (16px) left/right
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              boxSizing: "border-box",
            }}
          >
            {currentFooter}
          </div>
        )}
      </div>
    </div>
  );
};
