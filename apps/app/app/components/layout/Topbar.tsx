"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  UserAvatar,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui";
import {
  IconChevronDown,
  IconSettings,
  IconLogout,
  IconMenu2,
} from "@tabler/icons-react";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
            <span className="hidden sm:inline-block text-[0.625rem] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-white/50 tracking-wider ml-1">
              Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls: User Profile + Mobile Hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Radix / Shadcn Dropdown Menu */}
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 py-1 px-1.5 sm:px-2 rounded-[3px] hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer focus:outline-none"
            >
              <UserAvatar
                name={userFullName}
                role={userRole}
                size="sm"
              />

              <span className="hidden sm:inline-block text-sm font-medium text-white tracking-tight">
                {userFullName}
              </span>

              <IconChevronDown
                size={14}
                stroke={2}
                className="hidden sm:block text-white/60 transition-transform duration-200"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5">
            {/* Header User Identity */}
            <div className="px-2.5 py-2 border-b border-white/[0.08] mb-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white truncate">
                  {userFullName}
                </p>
                <span className="text-[0.563rem] font-mono font-bold uppercase px-1.5 py-0.5 rounded-[2px] bg-[#CC6600]/20 text-[#CC6600] border border-[#CC6600]/30 leading-none shrink-0">
                  {userRole}
                </span>
              </div>
              <p className="text-[0.688rem] font-mono text-white/45 truncate mt-0.5">
                {userEmail}
              </p>
            </div>

            {/* Menu Options */}
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard#settings"
                className="flex items-center gap-2.5 cursor-pointer w-full text-xs text-white/80"
              >
                <IconSettings size={16} stroke={1.5} className="text-white/50" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout Action */}
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer text-xs"
            >
              {isLoggingOut ? (
                <span className="h-3.5 w-3.5 border-2 border-white/20 border-t-red-400 rounded-full animate-spin mr-2" />
              ) : (
                <IconLogout size={16} stroke={1.5} className="text-red-400 mr-2 shrink-0" />
              )}
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>

        {/* Mobile Sidebar Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <IconMenu2 size={20} stroke={1.5} />
        </button>
      </div>
    </header>
  );
};
