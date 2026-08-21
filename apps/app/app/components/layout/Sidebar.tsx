"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { RoleName } from "@prisma/client";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  count?: number;
  badge?: string;
  badgeColor?: "orange" | "emerald" | "sky" | "amber" | "indigo";
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export interface SidebarProps {
  role?: RoleName | string;
  roleLabel?: string;
  userFullName?: string;
  userEmail?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const Icons = {
  Overview: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Studies: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Intake: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Vault: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  Receipt: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Terminal: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Scripts: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  UploadCloud: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Feedback: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  ShieldCheck: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  CheckQueue: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Award: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  FinanceVault: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  KeyRelease: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  Users: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Audit: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Activity: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Clock: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ─── Role-Specific Navigation Definitions ─────────────────────────────────────

const ROLE_NAV_GROUPS: Record<string, NavGroup[]> = {
  CLIENT: [
    {
      groupTitle: "RESEARCH DESK",
      items: [
        {
          label: "Client Portal",
          href: "/dashboard/client",
          icon: Icons.Overview,
        },
        {
          label: "My Active Studies",
          href: "/dashboard/client#studies",
          icon: Icons.Studies,
          count: 4,
        },
        {
          label: "Submit New Intake",
          href: "/dashboard/client#intake",
          icon: Icons.Intake,
          badge: "+ NEW",
          badgeColor: "orange",
        },
        {
          label: "Deliverables Vault",
          href: "/dashboard/client#deliverables",
          icon: Icons.Vault,
          badge: "APA 7th",
          badgeColor: "emerald",
        },
      ],
    },
    {
      groupTitle: "BILLING & SUPPORT",
      items: [
        {
          label: "Invoices & Receipts",
          href: "/dashboard/client#billing",
          icon: Icons.Receipt,
        },
        {
          label: "Workspace Telemetry",
          href: "/dashboard",
          icon: Icons.Overview,
        },
      ],
    },
  ],

  STATISTICIAN: [
    {
      groupTitle: "COMPUTATIONAL LAB",
      items: [
        {
          label: "Statistician Workbench",
          href: "/dashboard/statistician",
          icon: Icons.Terminal,
        },
        {
          label: "Assigned Studies",
          href: "/dashboard/statistician#assigned",
          icon: Icons.Studies,
          count: 6,
        },
        {
          label: "R / SPSS Scripts",
          href: "/dashboard/statistician#scripts",
          icon: Icons.Scripts,
          badge: "v4.3",
          badgeColor: "indigo",
        },
        {
          label: "Submit to QA Queue",
          href: "/dashboard/statistician#submit-qa",
          icon: Icons.UploadCloud,
          count: 2,
          badgeColor: "amber",
        },
      ],
    },
    {
      groupTitle: "AUDIT & GOVERNANCE",
      items: [
        {
          label: "QA Feedback & Notes",
          href: "/dashboard/statistician#feedback",
          icon: Icons.Feedback,
          count: 1,
          badgeColor: "amber",
        },
        {
          label: "Global Operations",
          href: "/dashboard",
          icon: Icons.Overview,
        },
      ],
    },
  ],

  SENIOR_QA_LEAD: [
    {
      groupTitle: "VERIFICATION STUDIO",
      items: [
        {
          label: "QA Studio Desk",
          href: "/dashboard/qa",
          icon: Icons.ShieldCheck,
        },
        {
          label: "Dual-Blind Queue",
          href: "/dashboard/qa#queue",
          icon: Icons.CheckQueue,
          count: 4,
          badge: "URGENT",
          badgeColor: "amber",
        },
        {
          label: "APA 7th Verification",
          href: "/dashboard/qa#seals",
          icon: Icons.Award,
          count: 12,
          badgeColor: "emerald",
        },
      ],
    },
    {
      groupTitle: "COMPLIANCE GATES",
      items: [
        {
          label: "Methodology Audits",
          href: "/dashboard/qa#methodology",
          icon: Icons.Audit,
        },
        {
          label: "Global Operations",
          href: "/dashboard",
          icon: Icons.Overview,
        },
      ],
    },
  ],

  FINANCE_OFFICER: [
    {
      groupTitle: "ESCROW & SETTLEMENT",
      items: [
        {
          label: "Finance Console",
          href: "/dashboard/finance",
          icon: Icons.FinanceVault,
        },
        {
          label: "Milestone Releases",
          href: "/dashboard/finance#releases",
          icon: Icons.KeyRelease,
          count: 3,
          badge: "RULE_REL_01",
          badgeColor: "emerald",
        },
        {
          label: "Stripe Settlement",
          href: "/dashboard/finance#stripe",
          icon: Icons.Receipt,
        },
      ],
    },
    {
      groupTitle: "AUDIT & VAULT",
      items: [
        {
          label: "Escrow Ledger",
          href: "/dashboard/finance#ledger",
          icon: Icons.Audit,
        },
        {
          label: "Global Operations",
          href: "/dashboard",
          icon: Icons.Overview,
        },
      ],
    },
  ],

  CEO: [
    {
      groupTitle: "EXECUTIVE INTELLIGENCE",
      items: [
        {
          label: "CEO Console",
          href: "/dashboard/ceo",
          icon: Icons.Activity,
        },
        {
          label: "Live Telemetry Hub",
          href: "/dashboard",
          icon: Icons.Overview,
        },
        {
          label: "Institutional Retention",
          href: "/dashboard/ceo#retention",
          icon: Icons.Award,
          badge: "94.2%",
          badgeColor: "emerald",
        },
        {
          label: "Department SLAs",
          href: "/dashboard/ceo#sla",
          icon: Icons.Clock,
        },
      ],
    },
    {
      groupTitle: "MACRO REVENUE",
      items: [
        {
          label: "Escrow Vault Overview",
          href: "/dashboard/finance",
          icon: Icons.FinanceVault,
          badge: "$64.5k",
          badgeColor: "emerald",
        },
        {
          label: "QA Verification Index",
          href: "/dashboard/qa",
          icon: Icons.ShieldCheck,
        },
      ],
    },
  ],

  ADMIN: [
    {
      groupTitle: "OPERATIONS & GOVERNANCE",
      items: [
        {
          label: "Admin Command",
          href: "/dashboard/admin",
          icon: Icons.Terminal,
        },
        {
          label: "All Active Studies",
          href: "/dashboard",
          icon: Icons.Overview,
          count: 24,
        },
        {
          label: "Statistician Lab",
          href: "/dashboard/statistician",
          icon: Icons.Scripts,
        },
        {
          label: "QA Verification Desk",
          href: "/dashboard/qa",
          icon: Icons.ShieldCheck,
          count: 4,
        },
        {
          label: "Escrow Payment Vault",
          href: "/dashboard/finance",
          icon: Icons.FinanceVault,
          count: 3,
        },
      ],
    },
    {
      groupTitle: "SYSTEM ADMINISTRATION",
      items: [
        {
          label: "Stakeholder Directory",
          href: "/dashboard/admin#users",
          icon: Icons.Users,
        },
        {
          label: "Cryptographic Audit Log",
          href: "/dashboard/admin#audit",
          icon: Icons.Audit,
        },
      ],
    },
  ],
};

const BADGE_STYLES: Record<string, string> = {
  orange: "bg-[#CC6600]/25 text-[#CC6600] border-[#CC6600]/40",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  sky: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({
  role = "ADMIN",
  userFullName = "Developer Account",
  userEmail = "dev@jaxis.local",
  className = "",
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();
  const normalizedRole = (role?.toUpperCase() || "ADMIN") as string;
  const navGroups = ROLE_NAV_GROUPS[normalizedRole] || ROLE_NAV_GROUPS.ADMIN!;

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-20
        w-[18.5rem] min-w-[18.5rem] max-w-[18.5rem] h-full max-h-full
        bg-[#010114] border-r border-white/[0.08] flex flex-col justify-between
        select-none flex-shrink-0 overflow-hidden
        transition-transform duration-200 ease-out shadow-2xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${className}
      `}
      style={{
        width: "18.5rem",
        minWidth: "18.5rem",
        maxWidth: "18.5rem",
        height: "100%",
        maxHeight: "100%",
        flexShrink: 0,
        backgroundColor: "#010114",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Top Navigation Sections */}
      <div
        className="p-4 sm:p-5 flex flex-col gap-5 overflow-y-auto flex-1"
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {/* Mobile Header with Official Logo & Close Button */}
        <div className="flex lg:hidden items-center justify-between pb-3.5 border-b border-white/[0.08] -mt-1">
          <div className="flex items-center gap-2 font-sans">
            <Image
              src="/jaxislogo.png"
              alt="JAXIS Logo"
              width={22}
              height={22}
              className="h-5.5 w-auto"
            />
            <div className="flex items-baseline gap-1 font-sans">
              <span className="font-bold text-sm tracking-wider text-white">JAXIS</span>
              <span className="font-bold text-sm tracking-wider text-[#CC6600]">STATLAB</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Groups */}
        <nav aria-label="Sidebar navigation" className="flex flex-col gap-5" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span
                className="text-xs font-sans font-semibold tracking-widest text-white/40 px-3 uppercase mb-1.5"
                style={{ paddingLeft: "0.75rem", paddingRight: "0.75rem", marginBottom: "0.375rem", fontSize: "0.688rem" }}
              >
                {group.groupTitle}
              </span>
              {group.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-out group ${
                      isActive
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
                      <span className={`${isActive ? "text-[#CC6600]" : "text-white/50 group-hover:text-white"} transition-colors flex-shrink-0`}>
                        {item.icon}
                      </span>
                      <span className="font-sans font-medium whitespace-nowrap">{item.label}</span>
                    </div>

                    {/* Badges / Counters */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.count !== undefined && (
                        <span
                          className={`text-xs font-sans px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isActive ? "bg-[#CC6600]/30 text-white font-bold" : "bg-white/[0.08] text-white/60 group-hover:text-white"
                          }`}
                          style={{
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
                          className={`text-xs font-sans px-2 py-0.5 rounded-[3px] border font-medium flex-shrink-0 ${
                            BADGE_STYLES[item.badgeColor || "indigo"]
                          }`}
                          style={{
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
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Info Card (Bottom) */}
      <div className="p-4 sm:p-4.5 border-t border-white/[0.08] bg-white/[0.02] flex-shrink-0" style={{ padding: "1rem 1.25rem", flexShrink: 0, backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
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
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate leading-none" style={{ fontSize: "0.875rem" }}>{userFullName}</span>
              <span className="text-xs text-white/40 truncate mt-1 font-sans" style={{ fontSize: "0.75rem" }}>{userEmail}</span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </div>
    </aside>
  );
};
