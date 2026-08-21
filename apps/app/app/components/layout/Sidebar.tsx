import React from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  count?: number;
  badge?: string;
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export interface SidebarProps {
  roleLabel?: string;
  userFullName?: string;
  userEmail?: string;
  className?: string;
}

const defaultNavGroups: NavGroup[] = [
  {
    groupTitle: "WORKSPACES",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        active: true,
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        label: "Projects & Studies",
        href: "/dashboard#projects",
        count: 24,
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: "Statistician Lab",
        href: "/dashboard#lab",
        badge: "R / SPSS",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
      },
    ],
  },
  {
    groupTitle: "GOVERNANCE & AUDIT",
    items: [
      {
        label: "QA Verification Queue",
        href: "/dashboard#qa",
        count: 7,
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
      {
        label: "Escrow & Payment Gates",
        href: "/dashboard#payments",
        count: 4,
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: "Cryptographic Audit Log",
        href: "/dashboard#audit",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
      },
    ],
  },
  {
    groupTitle: "SYSTEM",
    items: [
      {
        label: "Platform Settings",
        href: "/dashboard#settings",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  roleLabel = "ADMIN",
  userFullName = "Developer Account",
  userEmail = "dev@jaxis.local",
  className = "",
}) => {
  return (
    <aside
      className={`w-[18.5rem] min-w-[18.5rem] max-w-[18.5rem] min-h-[calc(100vh-56px)] bg-[#010114]/95 border-r border-white/[0.08] flex flex-col justify-between select-none z-20 flex-shrink-0 ${className}`}
      style={{
        width: "18.5rem",
        minWidth: "18.5rem",
        maxWidth: "18.5rem",
        flexShrink: 0,
        backgroundColor: "rgba(1, 1, 20, 0.95)",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Top Navigation Sections */}
      <div className="p-4 sm:p-5 flex flex-col gap-6" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Navigation Groups */}
        <nav aria-label="Sidebar navigation" className="flex flex-col gap-5" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {defaultNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span
                className="text-xs font-sans font-semibold tracking-widest text-white/40 px-3 uppercase mb-1.5"
                style={{ paddingLeft: "0.75rem", paddingRight: "0.75rem", marginBottom: "0.375rem", fontSize: "0.688rem" }}
              >
                {group.groupTitle}
              </span>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-out group ${
                    item.active
                      ? "bg-[#CC6600]/15 text-white font-semibold"
                      : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                  }`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontSize: "0.875rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0" style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
                    <span className={`${item.active ? "text-[#CC6600]" : "text-white/50 group-hover:text-white"} transition-colors flex-shrink-0`}>
                      {item.icon}
                    </span>
                    <span className="font-sans font-medium whitespace-nowrap">{item.label}</span>
                  </div>

                  {/* Badges / Counters */}
                  {item.count !== undefined && (
                    <span
                      className={`text-xs font-sans px-2 py-0.5 rounded-full flex-shrink-0 ${
                        item.active ? "bg-[#CC6600]/30 text-white font-bold" : "bg-white/[0.08] text-white/60 group-hover:text-white"
                      }`}
                      style={{
                        marginLeft: "0.5rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        height: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className="text-xs font-sans px-2 py-0.5 rounded-[3px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium flex-shrink-0"
                      style={{
                        marginLeft: "0.5rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "3px",
                        fontSize: "0.688rem",
                        fontWeight: 600,
                        height: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* User Info Card (Bottom) */}
      <div className="p-4 sm:p-4.5 border-t border-white/[0.08] bg-[#011833]/50" style={{ padding: "1rem 1.25rem" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#012E57] to-[#011B38] border border-white/15 flex items-center justify-center font-sans text-xs text-white font-semibold flex-shrink-0 shadow-inner">
              {userFullName.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate leading-none" style={{ fontSize: "0.875rem" }}>{userFullName}</span>
                <span className="text-[0.625rem] font-bold font-sans px-1.5 py-0.5 rounded-[2px] bg-[#CC6600]/20 text-[#CC6600] border border-[#CC6600]/30 leading-none">
                  {roleLabel}
                </span>
              </div>
              <span className="text-xs text-white/40 truncate mt-1 font-sans" style={{ fontSize: "0.75rem" }}>{userEmail}</span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </div>
    </aside>
  );
};
