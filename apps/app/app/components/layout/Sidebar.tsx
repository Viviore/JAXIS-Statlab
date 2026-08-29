"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { RoleName } from "@prisma/client";
import {
  IconLayoutDashboard,
  IconFiles,
  IconFilePlus,
  IconDatabase,
  IconReceipt,
  IconTerminal2,
  IconCode,
  IconCloudUpload,
  IconMessageReport,
  IconShieldCheck,
  IconClipboardCheck,
  IconAward,
  IconCoins,
  IconKey,
  IconUsers,
  IconShieldLock,
  IconActivity,
  IconClock,
  IconCalendarTime,
  IconX,
} from "@tabler/icons-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  count?: number;
  badge?: string;
  badgeColor?: "orange" | "emerald" | "sky" | "amber" | "indigo" | "gray";
  disabled?: boolean;
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
  clientProfileIncomplete?: boolean;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// ─── Tabler Icons ───────────────────────────────────────────────────────────

const Icons = {
  Overview: <IconLayoutDashboard size={16} stroke={1.5} className="flex-shrink-0" />,
  Studies: <IconFiles size={16} stroke={1.5} className="flex-shrink-0" />,
  Intake: <IconFilePlus size={16} stroke={1.5} className="flex-shrink-0" />,
  Vault: <IconDatabase size={16} stroke={1.5} className="flex-shrink-0" />,
  Receipt: <IconReceipt size={16} stroke={1.5} className="flex-shrink-0" />,
  Terminal: <IconTerminal2 size={16} stroke={1.5} className="flex-shrink-0" />,
  Scripts: <IconCode size={16} stroke={1.5} className="flex-shrink-0" />,
  UploadCloud: <IconCloudUpload size={16} stroke={1.5} className="flex-shrink-0" />,
  Feedback: <IconMessageReport size={16} stroke={1.5} className="flex-shrink-0" />,
  ShieldCheck: <IconShieldCheck size={16} stroke={1.5} className="flex-shrink-0" />,
  CheckQueue: <IconClipboardCheck size={16} stroke={1.5} className="flex-shrink-0" />,
  Award: <IconAward size={16} stroke={1.5} className="flex-shrink-0" />,
  FinanceVault: <IconCoins size={16} stroke={1.5} className="flex-shrink-0" />,
  KeyRelease: <IconKey size={16} stroke={1.5} className="flex-shrink-0" />,
  Users: <IconUsers size={16} stroke={1.5} className="flex-shrink-0" />,
  Audit: <IconShieldLock size={16} stroke={1.5} className="flex-shrink-0" />,
  Activity: <IconActivity size={16} stroke={1.5} className="flex-shrink-0" />,
  Clock: <IconClock size={16} stroke={1.5} className="flex-shrink-0" />,
  LeaveDesk: <IconCalendarTime size={16} stroke={1.5} className="flex-shrink-0" />,
};

// ─── Role-Specific Navigation Definitions ─────────────────────────────────────
// Only fully functional/implemented modules are active; upcoming modules are greyed out with "SOON".

const ROLE_NAV_GROUPS: Record<string, NavGroup[]> = {
  CLIENT: [
    {
      groupTitle: "RESEARCH DESK",
      items: [
        {
          label: "Client Overview",
          href: "/dashboard/client",
          icon: Icons.Overview,
        },
        {
          label: "Active Studies",
          href: "/dashboard/client/projects",
          icon: Icons.Studies,
        },
        {
          label: "Submit New Intake",
          href: "/dashboard/client/projects/new",
          icon: Icons.Intake,
          badge: "+ NEW",
          badgeColor: "orange",
        },
        {
          label: "Quotations & SOW",
          href: "/dashboard/client/quotations",
          icon: Icons.Receipt,
          badge: "PROPOSALS",
          badgeColor: "orange",
        },
        {
          label: "Final Files & Outputs",
          href: "/dashboard/client/deliverables",
          icon: Icons.Vault,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Defense Coaching",
          href: "/dashboard/client/defenselab",
          icon: Icons.Terminal,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
      ],
    },
    {
      groupTitle: "COMMUNICATION & ACCOUNT",
      items: [
        {
          label: "Messages",
          href: "/dashboard/client/messages",
          icon: Icons.Feedback,
        },
        {
          label: "Billing & Payments",
          href: "/dashboard/client/payments",
          icon: Icons.FinanceVault,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "School & Contact Info",
          href: "/dashboard/client/profile",
          icon: Icons.Users,
        },
      ],
    },
  ],

  STATISTICIAN: [
    {
      groupTitle: "STUDIES & DATA",
      items: [
        {
          label: "Statistician Workbench",
          href: "/dashboard/statistician",
          icon: Icons.Terminal,
        },
        {
          label: "Messages",
          href: "/dashboard/statistician/messages",
          icon: Icons.Feedback,
        },
        {
          label: "Analysis & Scripts",
          href: "/dashboard/statistician/analysis",
          icon: Icons.Scripts,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Upload Final Files",
          href: "/dashboard/statistician/uploads",
          icon: Icons.UploadCloud,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Defense Coaching",
          href: "/dashboard/statistician/defenselab",
          icon: Icons.Award,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
      ],
    },
    {
      groupTitle: "MY WORKSPACE",
      items: [
        {
          label: "My HR & Timeclock",
          href: "/dashboard/staff/hr",
          icon: Icons.LeaveDesk,
          badge: "HR",
          badgeColor: "orange",
        },
        {
          label: "My Profile",
          href: "/dashboard/statistician/profile",
          icon: Icons.Users,
        },
      ],
    },
  ],

  SENIOR_QA_LEAD: [
    {
      groupTitle: "QUALITY CHECKS",
      items: [
        {
          label: "QA Review Desk",
          href: "/dashboard/qa",
          icon: Icons.ShieldCheck,
        },
        {
          label: "Messages",
          href: "/dashboard/qa/messages",
          icon: Icons.Feedback,
        },
        {
          label: "Review History",
          href: "/dashboard/qa/audits",
          icon: Icons.Audit,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
      ],
    },
    {
      groupTitle: "MY WORKSPACE",
      items: [
        {
          label: "My HR & Timeclock",
          href: "/dashboard/staff/hr",
          icon: Icons.LeaveDesk,
          badge: "HR",
          badgeColor: "orange",
        },
        {
          label: "My Profile",
          href: "/dashboard/qa/profile",
          icon: Icons.Users,
        },
      ],
    },
  ],

  FINANCE_OFFICER: [
    {
      groupTitle: "PAYMENTS & FINANCES",
      items: [
        {
          label: "Finance Overview",
          href: "/dashboard/finance",
          icon: Icons.FinanceVault,
        },
        {
          label: "Deposit Queue",
          href: "/dashboard/finance/payments",
          icon: Icons.CheckQueue,
          badge: "QUEUE",
          badgeColor: "orange",
        },
        {
          label: "Milestone Payments",
          href: "/dashboard/finance/payouts",
          icon: Icons.Award,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Refunds & Disputes",
          href: "/dashboard/finance/refunds",
          icon: Icons.Receipt,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
      ],
    },
    {
      groupTitle: "RECORDS & PROFILE",
      items: [
        {
          label: "Transactions",
          href: "/dashboard/finance/ledgers",
          icon: Icons.Audit,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Disputes & Chargebacks",
          href: "/dashboard/finance/disputes",
          icon: Icons.Feedback,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "My Profile",
          href: "/dashboard/finance/profile",
          icon: Icons.Users,
        },
      ],
    },
    {
      groupTitle: "HR & STAFF",
      items: [
        {
          label: "My HR & Timeclock",
          href: "/dashboard/staff/hr",
          icon: Icons.LeaveDesk,
          badge: "PORTAL",
          badgeColor: "orange",
        },
        {
          label: "Leave Approvals",
          href: "/dashboard/finance/leaves",
          icon: Icons.LeaveDesk,
          badge: "HR",
          badgeColor: "orange",
        },
        {
          label: "Staff Timesheets",
          href: "/dashboard/finance/attendance",
          icon: Icons.Clock,
          badge: "HR",
          badgeColor: "orange",
        },
        {
          label: "Payroll & Payslips",
          href: "/dashboard/finance/payroll",
          icon: Icons.Receipt,
          badge: "PAYROLL",
          badgeColor: "orange",
        },
      ],
    },
  ],

  CEO: [
    {
      groupTitle: "CEO OVERVIEW",
      items: [
        {
          label: "CEO Overview",
          href: "/dashboard/ceo",
          icon: Icons.Activity,
        },
        {
          label: "Pricing & Quotations",
          href: "/dashboard/admin/quotations",
          icon: Icons.Receipt,
          badge: "PRICING",
          badgeColor: "orange",
        },
        {
          label: "Turnaround Times",
          href: "/dashboard/ceo/slas",
          icon: Icons.Clock,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Client Retention",
          href: "/dashboard/ceo/retention",
          icon: Icons.Award,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
      ],
    },
    {
      groupTitle: "MANAGEMENT & AUDIT",
      items: [
        {
          label: "My HR & Timeclock",
          href: "/dashboard/staff/hr",
          icon: Icons.LeaveDesk,
          badge: "PORTAL",
          badgeColor: "orange",
        },
        {
          label: "Finance & Payments",
          href: "/dashboard/finance",
          icon: Icons.FinanceVault,
        },
        {
          label: "QA Review Desk",
          href: "/dashboard/qa",
          icon: Icons.ShieldCheck,
        },
        {
          label: "Staff Directory",
          href: "/dashboard/admin/staff",
          icon: Icons.Users,
        },
        {
          label: "Staff Timesheets",
          href: "/dashboard/ceo/attendance",
          icon: Icons.Clock,
          badge: "AUDIT",
          badgeColor: "orange",
        },
        {
          label: "Payroll Settings",
          href: "/dashboard/ceo/payroll",
          icon: Icons.Receipt,
          badge: "POLICY",
          badgeColor: "orange",
        },
        {
          label: "Firewall Logs",
          href: "/dashboard/admin/messages",
          icon: Icons.ShieldCheck,
          badge: "FIREWALL",
          badgeColor: "orange",
        },
        {
          label: "Reports & Analytics",
          href: "/dashboard/ceo/analytics",
          icon: Icons.Audit,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
      ],
    },
  ],

  ADMIN: [
    {
      groupTitle: "STUDIES & INTAKE",
      items: [
        {
          label: "Admin Overview",
          href: "/dashboard/admin",
          icon: Icons.Terminal,
        },
        {
          label: "New Study Requests",
          href: "/dashboard/admin/intake",
          icon: Icons.CheckQueue,
          badge: "INTAKE",
          badgeColor: "orange",
        },
        {
          label: "All Active Studies",
          href: "/dashboard/admin/projects",
          icon: Icons.Studies,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Pricing & Quotations",
          href: "/dashboard/admin/quotations",
          icon: Icons.Receipt,
          badge: "PRICING",
          badgeColor: "orange",
        },
        {
          label: "Assign Experts",
          href: "/dashboard/admin/assignments",
          icon: Icons.KeyRelease,
          badge: "ASSIGN",
          badgeColor: "orange",
        },
      ],
    },
    {
      groupTitle: "STAFF & TOOLS",
      items: [
        {
          label: "My HR & Timeclock",
          href: "/dashboard/staff/hr",
          icon: Icons.LeaveDesk,
          badge: "PORTAL",
          badgeColor: "orange",
        },
        {
          label: "Staff Directory",
          href: "/dashboard/admin/staff",
          icon: Icons.Users,
        },
        {
          label: "Staff Timesheets",
          href: "/dashboard/finance/attendance",
          icon: Icons.Clock,
          badge: "HR",
          badgeColor: "orange",
        },
        {
          label: "Firewall Logs",
          href: "/dashboard/admin/messages",
          icon: Icons.ShieldCheck,
          badge: "FIREWALL",
          badgeColor: "orange",
        },
        {
          label: "Disputes & Issues",
          href: "/dashboard/admin/disputes",
          icon: Icons.ShieldCheck,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "Activity Log",
          href: "/dashboard/admin/audit",
          icon: Icons.Audit,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
        {
          label: "System Reports",
          href: "/dashboard/admin/reporting",
          icon: Icons.Activity,
          disabled: true,
          badge: "SOON",
          badgeColor: "gray",
        },
      ],
    },
  ],
};

const BADGE_STYLES: Record<string, string> = {
  orange: "bg-[#CC6600]/20 text-[#FFA040] border-[#CC6600]/40",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  gray: "bg-white/[0.04] text-white/35 border-white/[0.08]",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({
  role = "ADMIN",
  userFullName = "Developer Account",
  userEmail = "dev@jaxis.local",
  clientProfileIncomplete = false,
  className = "",
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();
  const normalizedRole = (role?.toUpperCase() || "ADMIN") as string;
  let effectiveRole = normalizedRole;
  if (normalizedRole === "QA" || normalizedRole === "SENIOR_QA_LEAD") {
    effectiveRole = "SENIOR_QA_LEAD";
  } else if (normalizedRole === "FINANCE" || normalizedRole === "FINANCE_OFFICER") {
    effectiveRole = "FINANCE_OFFICER";
  }
  let navGroups = ROLE_NAV_GROUPS[effectiveRole] || ROLE_NAV_GROUPS.ADMIN!;

  if (effectiveRole === "CLIENT" && clientProfileIncomplete) {
    navGroups = navGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.href === "/dashboard/client/profile") {
          return {
            ...item,
            badge: "REQUIRED",
            badgeColor: "orange" as const,
          };
        }
        if (item.href === "/dashboard/client/projects/new") {
          return {
            ...item,
            badge: "SETUP REQ",
            badgeColor: "amber" as const,
          };
        }
        return item;
      }),
    }));
  }

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-20
        w-[19.5rem] min-w-[19.5rem] max-w-[19.5rem] h-full max-h-full
        bg-[#010114] border-r border-white/[0.08] flex flex-col justify-between
        select-none flex-shrink-0 overflow-hidden
        transition-transform duration-200 ease-out shadow-2xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${className}
      `}
      style={{
        width: "19.5rem",
        minWidth: "19.5rem",
        maxWidth: "19.5rem",
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
        className="p-5 sm:p-6 flex flex-col gap-6 overflow-y-auto flex-1"
        style={{
          padding: "1.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
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
            <IconX size={18} stroke={1.5} />
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
                const isDisabled = Boolean(item.disabled);

                if (isDisabled) {
                  return (
                    <div
                      key={item.href + item.label}
                      className="flex items-center justify-between px-3 py-2 text-xs rounded-md select-none opacity-40 cursor-not-allowed"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                        fontSize: "0.8125rem",
                      }}
                      title={`${item.label} (Under Active Development)`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2" style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0, flex: 1, paddingRight: "0.5rem" }}>
                        <span className="text-white/30 flex-shrink-0">
                          {item.icon}
                        </span>
                        <span className="font-sans font-normal text-white/40 text-[0.8125rem] truncate" title={item.label}>
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                        <span
                          className="text-xs font-sans px-1.5 py-0.5 rounded-[3px] border font-medium flex-shrink-0 bg-white/[0.04] text-white/30 border-white/[0.08]"
                          style={{
                            padding: "0.1rem 0.375rem",
                            borderRadius: "3px",
                            fontSize: "0.625rem",
                            fontWeight: 600,
                            height: "18px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                            letterSpacing: "0.025em",
                          }}
                        >
                          {item.badge || "SOON"}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 ease-out group ${
                      isActive
                        ? "bg-[#CC6600]/15 text-white font-semibold"
                        : "text-white/75 hover:text-white hover:bg-white/[0.05]"
                    }`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2" style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0, flex: 1, paddingRight: "0.5rem" }}>
                      <span className={`${isActive ? "text-[#CC6600]" : "text-white/60 group-hover:text-white"} transition-colors flex-shrink-0`}>
                        {item.icon}
                      </span>
                      <span className="font-sans font-medium text-[0.8125rem] truncate" title={item.label}>
                        {item.label}
                      </span>
                    </div>

                    {/* Badges / Counters */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
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
                          className={`text-xs font-sans px-1.5 py-0.5 rounded-[3px] border font-medium flex-shrink-0 ${
                            BADGE_STYLES[item.badgeColor || "indigo"]
                          }`}
                          style={{
                            padding: "0.1rem 0.4rem",
                            borderRadius: "3px",
                            fontSize: "0.625rem",
                            fontWeight: 600,
                            height: "18px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                            letterSpacing: "0.025em",
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
