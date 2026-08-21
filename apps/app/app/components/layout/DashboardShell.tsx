"use client";

import React, { useState } from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import type { RoleName } from "@prisma/client";

export interface DashboardShellProps {
  userFullName: string;
  userRole: RoleName | string;
  userEmail: string;
  clientProfileIncomplete?: boolean;
  children: React.ReactNode;
}

export function DashboardShell({
  userFullName,
  userRole,
  userEmail,
  clientProfileIncomplete = false,
  children,
}: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-[#010114] text-white overflow-hidden"
      style={{
        backgroundColor: "#010114",
        height: "100dvh",
        maxHeight: "100dvh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Topbar (56px) with Mobile Hamburger */}
      <Topbar
        userFullName={userFullName}
        userRole={userRole}
        userEmail={userEmail}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Workspace Body */}
      <div
        className="flex flex-1 h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] w-full overflow-hidden relative"
        style={{
          display: "flex",
          flex: 1,
          height: "calc(100dvh - 56px)",
          maxHeight: "calc(100dvh - 56px)",
          width: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-modal-backdrop-in"
            aria-hidden="true"
          />
        )}

        {/* Responsive Role-Aware Sidebar */}
        <Sidebar
          role={userRole}
          roleLabel={userRole}
          userFullName={userFullName}
          userEmail={userEmail}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area with Guaranteed Consistent Responsive Padding */}
        <main
          className="flex-1 min-w-0 h-full max-h-full bg-[#010114] overflow-y-auto overflow-x-hidden"
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            maxHeight: "100%",
            backgroundColor: "#010114",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
            padding: "clamp(1.5rem, 3.5vw, 2.5rem)",
          }}
        >
          <div
            className="w-full max-w-7xl mx-auto"
            style={{
              width: "100%",
              maxWidth: "80rem",
              marginLeft: "auto",
              marginRight: "auto",
              boxSizing: "border-box",
            }}
          >
            {clientProfileIncomplete && (
              <div className="mb-6 bg-[#CC6600]/10 border border-[#CC6600]/30 rounded-[2px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[#CC6600] font-mono text-sm font-bold uppercase tracking-wider">
                    Action Required: Institutional Profile Incomplete
                  </span>
                  <span className="text-white/70 text-sm font-sans">
                    You must complete your institutional affiliation details before submitting project intake requests.
                  </span>
                </div>
                <a
                  href="/dashboard/client/profile"
                  className="whitespace-nowrap px-4 py-2 bg-[#CC6600] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#b35a00] transition-colors"
                >
                  Complete Profile →
                </a>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
