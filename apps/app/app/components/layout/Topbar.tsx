import React from "react";
import { Badge } from "@repo/ui";

export interface TopbarProps {
  userFullName?: string;
  userRole?: string;
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  userFullName = "Developer Account",
  userRole = "ADMIN",
  className = "",
}) => {
  return (
    <header
      className={`h-14 w-full bg-[#010114] border-b border-white/10 px-6 flex items-center justify-between z-30 select-none ${className}`}
    >
      {/* Brand logo mark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-[#CC6600] rounded-[2px] flex items-center justify-center font-mono font-bold text-white text-xs tracking-wider shadow-sm">
            JX
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-base tracking-widest text-white">
              JAXIS
            </span>
            <span className="font-mono text-[0.625rem] text-white/40 tracking-widest uppercase">
              STATLAB
            </span>
          </div>
        </div>
      </div>

      {/* Right status & user stub */}
      <div className="flex items-center gap-4">
        <Badge variant="muted" size="sm">
          DEV STUB
        </Badge>
        <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-white/10">
          <div className="h-7 w-7 rounded-[2px] bg-[#012E57] border border-white/15 flex items-center justify-center font-mono text-xs text-white font-medium">
            {userFullName.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-white">{userFullName}</span>
            <span className="text-[0.625rem] font-mono text-[#CC6600] uppercase tracking-wider">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
