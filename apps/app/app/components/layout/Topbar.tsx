import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

export interface TopbarProps {
  userFullName?: string;
  userRole?: string;
  userEmail?: string;
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  userFullName = "Developer Account",
  userRole = "ADMIN",
  userEmail = "dev@jaxis.local",
  className = "",
}) => {
  return (
    <header
      className={`h-14 w-full bg-[#010114]/90 backdrop-blur-md border-b border-white/[0.08] px-8 md:px-10 flex items-center justify-between z-30 select-none ${className}`}
      style={{
        height: "3.5rem",
        width: "100%",
        backgroundColor: "rgba(1, 1, 20, 0.90)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 30,
      }}
    >
      {/* Brand logo mark & search */}
      <div className="flex items-center gap-6" style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 text-decoration-none group" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Image
            src="/jaxislogo.png"
            alt="JAXIS Logo"
            width={26}
            height={26}
            className="h-6.5 w-auto"
            priority
          />
          <div className="flex items-baseline gap-1.5 font-sans" style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
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
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
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

      {/* Right status & user section */}
      <div className="flex items-center gap-5" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {/* Real-time System Indicators */}
        <div
          className="hidden md:flex items-center gap-3.5 text-xs text-white/50 border-r border-white/10 pr-4"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            paddingRight: "1rem",
          }}
        >
          <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ height: "0.375rem", width: "0.375rem", borderRadius: "9999px", backgroundColor: "#10B981" }} />
            <span className="font-sans text-xs text-white/70">Database: Online</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" style={{ height: "0.375rem", width: "0.375rem", borderRadius: "9999px", backgroundColor: "#38BDF8" }} />
            <span className="font-sans text-xs text-white/70">R2 Encrypted</span>
          </div>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-3" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            className="h-8 w-8 rounded-sm bg-gradient-to-br from-[#012E57] to-[#011B38] border border-white/15 flex items-center justify-center font-sans text-xs text-white font-semibold shadow-inner flex-shrink-0"
            style={{
              height: "2rem",
              width: "2rem",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            {userFullName.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col text-left" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span className="text-xs font-semibold text-white leading-none">{userFullName}</span>
            <div className="flex items-center gap-1.5 mt-1 font-sans" style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.25rem" }}>
              <span className="text-[0.625rem] text-[#CC6600] uppercase font-bold tracking-wider">
                {userRole}
              </span>
              <span className="text-[0.625rem] text-white/30">·</span>
              <span className="text-[0.688rem] text-white/45">{userEmail}</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};
