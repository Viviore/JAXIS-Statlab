import React from "react";
import { Badge } from "@repo/ui";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface SidebarProps {
  roleLabel?: string;
  navItems?: NavItem[];
  userFullName?: string;
  userEmail?: string;
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", active: true },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Messages", href: "/dashboard/messages" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Settings", href: "/dashboard/settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  roleLabel = "ADMINISTRATOR DESK",
  navItems = defaultNavItems,
  userFullName = "Developer Account",
  userEmail = "dev@jaxis.local",
  className = "",
}) => {
  return (
    <aside
      className={`w-60 h-full bg-[#010114] border-r border-white/10 flex flex-col justify-between select-none z-20 ${className}`}
    >
      {/* Top navigation section */}
      <div className="p-4 flex flex-col gap-6">
        {/* Role Badge Slot */}
        <div className="px-2">
          <Badge variant="accent" size="sm" className="w-full justify-center">
            {roleLabel}
          </Badge>
        </div>

        {/* Navigation list */}
        <nav aria-label="Sidebar navigation" className="flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-[2px] transition-colors ${
                item.active
                  ? "bg-[#CC6600]/15 text-white border-l-2 border-[#CC6600]"
                  : "text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              {item.icon && <span className="text-white/60">{item.icon}</span>}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* User Info Card (Bottom) */}
      <div className="p-4 border-t border-white/10 bg-[#012E57]/40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-[2px] bg-[#012E57] border border-white/15 flex items-center justify-center font-mono text-xs text-white font-semibold">
            {userFullName.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-white truncate">{userFullName}</span>
            <span className="text-[0.625rem] font-mono text-white/40 truncate">{userEmail}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
