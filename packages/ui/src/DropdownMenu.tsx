"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IconDotsVertical } from "@tabler/icons-react";

export interface DropdownMenuItem {
  key?: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  variant?: "default" | "warning" | "danger" | "success";
  disabled?: boolean;
  dividerBefore?: boolean;
  onClick: () => void;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
  width?: string;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  items,
  trigger,
  align = "right",
  width = "230px",
  className = "",
  isOpen: controlledIsOpen,
  onOpenChange,
}: DropdownMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  const triggerRef = useRef<HTMLDivElement | HTMLButtonElement | null>(null);
  const menuPortalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalIsOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  // Calculate fixed floating coordinates relative to viewport
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidthNum = parseInt(width, 10) || 230;
    const estimatedMenuHeight = items.length * 46 + 20;

    // Check if space below trigger is constrained (< estimated height)
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenTop =
      spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

    const top = shouldOpenTop ? rect.top - 6 : rect.bottom + 6;
    let left = align === "right" ? rect.right - menuWidthNum : rect.left;

    // Viewport edge collision guards
    if (left < 10) left = 10;
    if (left + menuWidthNum > window.innerWidth - 10) {
      left = window.innerWidth - menuWidthNum - 10;
    }

    setCoords({
      top,
      left,
      placement: shouldOpenTop ? "top" : "bottom",
    });
  }, [align, width, items.length]);

  useEffect(() => {
    if (open) {
      updateCoords();
    }
  }, [open, updateCoords]);

  // Click outside, Escape key, and scroll listener
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      if (menuPortalRef.current && menuPortalRef.current.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleScrollOrResize = (event: Event) => {
      // Ignore scroll inside the menu itself
      if (
        menuPortalRef.current &&
        menuPortalRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open, setOpen]);

  const getVariantStyles = (variant: DropdownMenuItem["variant"] = "default") => {
    switch (variant) {
      case "warning":
        return "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10";
      case "danger":
        return "text-red-400 hover:text-red-300 hover:bg-red-500/10";
      case "success":
        return "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10";
      default:
        return "text-slate-200 hover:text-white hover:bg-white/[0.08]";
    }
  };

  const getIconColor = (variant: DropdownMenuItem["variant"] = "default") => {
    switch (variant) {
      case "warning":
        return "text-amber-400/80 group-hover:text-amber-400";
      case "danger":
        return "text-red-400/80 group-hover:text-red-400";
      case "success":
        return "text-emerald-400/80 group-hover:text-emerald-400";
      default:
        return "text-slate-400 group-hover:text-slate-200";
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {trigger ? (
        <div
          ref={triggerRef as React.RefObject<HTMLDivElement>}
          onClick={() => setOpen(!open)}
          className="cursor-pointer"
        >
          {trigger}
        </div>
      ) : (
        <button
          ref={triggerRef as React.RefObject<HTMLButtonElement>}
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-8 h-8 rounded-[2px] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer text-sm font-bold select-none ${
            open ? "bg-white/[0.08] text-white border-white/20" : ""
          }`}
          title="More actions"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <IconDotsVertical size={16} stroke={1.5} />
        </button>
      )}

      {/* Floating Portal Menu — Zero DOM layout shift inside table */}
      {open &&
        mounted &&
        coords &&
        createPortal(
          <div
            ref={menuPortalRef}
            role="menu"
            className="rounded-[3px] bg-[#01142B] border border-white/20 flex flex-col font-sans backdrop-blur-md animate-content-fade"
            style={{
              position: "fixed",
              top: coords.placement === "top" ? undefined : coords.top,
              bottom:
                coords.placement === "top"
                  ? window.innerHeight - coords.top
                  : undefined,
              left: coords.left,
              padding: "0.5rem", // 8px card padding
              minWidth: width || "230px",
              boxShadow: "0 20px 48px -4px rgba(0, 0, 0, 0.95)",
              zIndex: 9999,
            }}
          >
            {items.map((item, idx) => (
              <React.Fragment key={item.key ?? idx}>
                {item.dividerBefore && (
                  <div
                    className="bg-white/[0.08]"
                    style={{ height: "1px", margin: "0.375rem 0.25rem" }}
                  />
                )}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    item.onClick();
                    setOpen(false);
                  }}
                  style={{
                    padding: "0.55rem 0.75rem", // 9px vertical, 12px horizontal item padding
                    margin: "0.075rem 0",
                  }}
                  className={`w-full text-left rounded-[2px] flex items-center gap-3 cursor-pointer transition-colors group text-xs ${getVariantStyles(
                    item.variant
                  )} ${item.disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
                >
                  {item.icon && (
                    <span
                      className={`flex-shrink-0 ${getIconColor(item.variant)}`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <div className="flex flex-col text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          style={{ padding: "0.125rem 0.35rem" }}
                          className={`text-[0.5625rem] font-mono rounded-[2px] uppercase ${
                            item.variant === "danger"
                              ? "bg-red-950/90 text-red-300 border border-red-800/50"
                              : "bg-white/10 text-white/80 border border-white/15"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <span className="text-[0.6875rem] text-white/40 font-mono truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </button>
              </React.Fragment>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
