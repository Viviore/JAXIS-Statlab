"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

export interface TopbarProps {
  userFullName?: string;
  userRole?: string;
  userEmail?: string;
  className?: string;
  onToggleMobileSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  userFullName = "Developer Account",
  userRole = "ADMIN",
  userEmail = "dev@jaxis.local",
  className = "",
  onToggleMobileSidebar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  return (
    <header
      className={`h-14 w-full bg-[#010114] border-b border-white/[0.08] px-4 sm:px-6 md:px-8 flex items-center justify-between z-30 select-none ${className}`}
      style={{
        height: "3.5rem",
        width: "100%",
        backgroundColor: "#010114",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingLeft: "clamp(1.25rem, 2.5vw, 2rem)",
        paddingRight: "clamp(1.25rem, 2.5vw, 2rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 30,
      }}
    >
      {/* Brand logo mark & search */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-decoration-none group">
          <Image
            src="/jaxislogo.png"
            alt="JAXIS Logo"
            width={24}
            height={24}
            className="h-6 w-auto"
            priority
          />
          <div className="flex items-baseline gap-1.5 font-sans">
            <span className="font-bold text-sm tracking-wider text-white">
              JAXIS
            </span>
            <span className="font-bold text-sm tracking-wider text-[#CC6600]">
              STATLAB
            </span>
            <span className="hidden sm:inline-block text-[0.625rem] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-white/50 tracking-wider ml-1" style={{ padding: "0.125rem 0.375rem", marginLeft: "0.25rem" }}>
              Workspace
            </span>
          </div>
        </Link>

        {/* Global Search / Command Bar */}
        <div
          className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#011B38]/50 border border-white/[0.08] text-white/40 text-xs w-72 hover:border-white/[0.18] transition-colors cursor-pointer"
          style={{
            padding: "0.375rem 0.875rem",
            backgroundColor: "rgba(1, 27, 56, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "2px",
            width: "18rem",
            boxSizing: "border-box",
          }}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: "0.875rem", height: "0.875rem" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 truncate text-xs text-white/45">Search studies, datasets...</span>
          <kbd className="font-mono text-[0.625rem] bg-white/[0.08] px-1.5 py-0.5 rounded text-white/60" style={{ padding: "0.125rem 0.375rem", borderRadius: "2px" }}>⌘K</kbd>
        </div>
      </div>

      {/* Right Controls: User Profile + Mobile Hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* User Profile Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 py-1 px-1.5 sm:px-2 rounded-md hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer focus:outline-none"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
          {/* Circular Avatar */}
          <div
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#012E57] to-[#011B38] border border-white/20 flex items-center justify-center font-sans text-xs text-white font-semibold shadow-inner flex-shrink-0"
            style={{
              height: "2rem",
              width: "2rem",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {userFullName.charAt(0).toUpperCase()}
          </div>

          {/* User Full Name (Hidden on Mobile) */}
          <span className="hidden sm:inline-block text-sm font-medium text-white tracking-tight" style={{ fontSize: "0.875rem" }}>
            {userFullName}
          </span>

          {/* Down Chevron (Hidden on Mobile) */}
          <svg
            className={`hidden sm:block w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ width: "0.875rem", height: "0.875rem" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu Modal */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-md bg-[#011226] border border-white/[0.12] shadow-2xl backdrop-blur-xl py-1.5 z-50 animate-content-fade"
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: "0.5rem",
              width: "14.5rem",
              borderRadius: "4px",
              backgroundColor: "rgba(1, 18, 38, 0.96)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)",
              zIndex: 50,
            }}
          >
            {/* Header User Identity */}
            <div className="px-3.5 py-2.5 border-b border-white/[0.08]" style={{ padding: "0.625rem 0.875rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white truncate" style={{ fontSize: "0.813rem" }}>
                  {userFullName}
                </p>
                <span
                  className="text-[0.563rem] font-mono font-bold uppercase px-1.5 py-0.5 rounded-[2px] bg-[#CC6600]/20 text-[#CC6600] border border-[#CC6600]/30 leading-none flex-shrink-0"
                  style={{ fontSize: "0.563rem", padding: "0.1rem 0.35rem", borderRadius: "2px" }}
                >
                  {userRole}
                </span>
              </div>
              <p className="text-[0.688rem] font-mono text-white/45 truncate mt-0.5" style={{ fontSize: "0.688rem", marginTop: "0.125rem" }}>
                {userEmail}
              </p>
            </div>

            {/* Menu Options */}
            <div className="py-1" style={{ padding: "0.25rem 0" }}>
              <Link
                href="/dashboard#settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0.875rem",
                  fontSize: "0.813rem",
                }}
              >
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </Link>
            </div>

            {/* Logout Action */}
            <div className="border-t border-white/[0.08] pt-1" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "0.25rem" }}>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer disabled:opacity-50"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  width: "100%",
                  padding: "0.5rem 0.875rem",
                  fontSize: "0.813rem",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {isLoggingOut ? (
                  <span className="h-4 w-4 border-2 border-white/20 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Hamburger Button (Right Side) */}
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        className="lg:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </header>
);
};
