"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  bodyClassName?: string;
  bodyStyle?: React.CSSProperties;
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
  bodyClassName = "",
  bodyStyle,
  size = "lg",
}) => {
  const actualOpen = open ?? isOpen ?? false;
  const [mounted, setMounted] = useState(false);
  // Global Enter / Exit Animation Lifecycle
  const [isRendered, setIsRendered] = useState(actualOpen);
  const [isVisible, setIsVisible] = useState(actualOpen);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll locking when modal is open
  useEffect(() => {
    if (actualOpen && typeof document !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [actualOpen]);

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
      }, 180);
      return () => {
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
        }
      };
    }
  }, [actualOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && actualOpen) {
        onClose();
      }
    };
    if (actualOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actualOpen, onClose]);

  if (!isRendered || !mounted || typeof document === "undefined") return null;

  const currentTitle = actualOpen ? title : cachedContent.title;
  const currentDesc = actualOpen ? description : cachedContent.description;
  const currentChildren = actualOpen ? children : cachedContent.children;
  const currentFooter = actualOpen ? footer : cachedContent.footer;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? "animate-modal-backdrop-in" : "animate-modal-backdrop-out"
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.82)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[min(90vh,calc(100dvh-2rem))] border border-white/[0.12] rounded-[2px] shadow-2xl overflow-hidden flex flex-col z-10 ${
          isVisible ? "animate-modal-dialog-in" : "animate-modal-dialog-out"
        } ${className}`}
        style={{
          backgroundColor: "#01162E",
          backgroundImage: "linear-gradient(180deg, rgba(1, 27, 56, 0.98) 0%, rgba(1, 18, 38, 0.99) 100%)",
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderRadius: "2px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.08)",
          boxSizing: "border-box",
          maxHeight: "min(90vh, calc(100dvh - 2rem))",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Decorative Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] z-30"
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

        {/* Sticky Header */}
        <div
          className="sticky top-0 z-20 flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/[0.08] bg-[#011B38]/98 backdrop-blur-md"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(1, 27, 56, 0.98)",
            boxSizing: "border-box",
          }}
        >
          <div className="min-w-0 pr-2">
            {currentTitle && <div className="text-base font-bold text-white tracking-tight font-sans">{currentTitle}</div>}
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
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-[2px] hover:bg-white/10 select-none focus:outline-none flex-shrink-0 cursor-pointer"
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

        {/* Scrollable Content Body */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto text-sm text-white/90 ${bodyClassName}`}
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            padding: "1.25rem 1.25rem",
            overflowY: "auto",
            boxSizing: "border-box",
            fontSize: "0.875rem",
            ...bodyStyle,
          }}
        >
          <div
            className="modal-body-child-wrapper w-full flex flex-col"
            style={{
              paddingLeft: "2px",
              paddingRight: "2px",
              paddingTop: 0,
              paddingBottom: 0,
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            {currentChildren}
          </div>
        </div>

        {/* Sticky Footer */}
        {currentFooter && (
          <div
            className="sticky bottom-0 z-20 flex-shrink-0 border-t border-white/[0.08] bg-[#011226]/98 backdrop-blur-md flex justify-end items-center gap-3"
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 20,
              flexShrink: 0,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1.25rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "rgba(1, 18, 38, 0.98)",
              boxSizing: "border-box",
            }}
          >
            {currentFooter}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
