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
import { DutyClockWidget } from "@/features/attendance/components/DutyClockWidget";

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
      className={`h-16 sm:h-18 w-full bg-[#010114] border-b border-white/10 px-6 sm:px-10 lg:px-14 flex items-center justify-between z-30 select-none ${className}`}
      style={{
        height: "4.5rem",
        paddingLeft: "clamp(1.5rem, 4vw, 3.5rem)",
        paddingRight: "clamp(1.5rem, 4vw, 3.5rem)",
      }}
    >
      {/* Brand logo mark & title */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-decoration-none group py-1">
          <Image
            src="/jaxislogo.png"
            alt="JAXIS Logo"
            width={28}
            height={28}
            className="h-7 w-auto transition-transform group-hover:scale-105"
            priority
          />
          <div className="flex items-center gap-2 font-sans">
            <span className="font-extrabold text-base tracking-wider text-white">
              JAXIS
            </span>
            <span className="font-extrabold text-base tracking-wider text-[#CC6600]">
              STATLAB
            </span>
            <span className="hidden sm:inline-flex items-center text-xs font-sans uppercase px-2.5 py-0.5 rounded-[4px] bg-white/[0.08] border border-white/15 text-white/70 font-semibold tracking-wider ml-1">
              Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls: Duty Clock Widget + User Profile + Mobile Hamburger */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Topbar Duty Clock Widget for internal staff */}
        <DutyClockWidget userRole={userRole} />

        {/* Radix / Shadcn Dropdown Menu */}
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 sm:gap-3 py-1.5 px-2 sm:px-2.5 rounded-[4px] bg-transparent hover:bg-white/[0.06] transition-all duration-150 cursor-pointer focus:outline-none group select-none"
            >
              <UserAvatar
                name={userFullName}
                role={userRole}
                size="sm"
              />

              <span className="hidden sm:inline-block text-sm font-semibold text-white tracking-tight">
                {userFullName}
              </span>

              <IconChevronDown
                size={16}
                stroke={2}
                className="hidden sm:block text-white/50 group-hover:text-white/80 transition-transform duration-150"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 p-2 bg-[#01142B] border border-white/15 shadow-2xl rounded-[4px] backdrop-blur-xl"
          >
            {/* Header User Identity */}
            <div className="px-3 py-2 mb-1 flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-white truncate font-sans">
                {userFullName}
              </span>
              <span className="text-xs font-sans font-normal text-white/50 truncate">
                {userEmail}
              </span>
            </div>

            <DropdownMenuSeparator className="-mx-2 my-1.5 bg-white/10" />

            {/* Menu Options */}
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard#settings"
                className="flex items-center gap-3 cursor-pointer w-full text-sm font-sans font-medium text-white/85 px-3 py-2.5 rounded-[4px] hover:bg-white/[0.06] hover:text-white transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0 ring-0"
              >
                <IconSettings size={18} stroke={1.5} className="text-white/60 shrink-0" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="-mx-2 my-1.5 bg-white/10" />

            {/* Logout Action */}
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 cursor-pointer w-full text-sm font-sans font-semibold text-red-400 px-3 py-2.5 rounded-[4px] hover:bg-red-500/10 hover:text-red-300 transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0 ring-0"
            >
              {isLoggingOut ? (
                <span className="h-4 w-4 border-2 border-white/20 border-t-red-400 rounded-full animate-spin mr-1" />
              ) : (
                <IconLogout size={18} stroke={1.5} className="text-red-400 shrink-0" />
              )}
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>

        {/* Mobile Sidebar Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/10"
          aria-label="Toggle navigation menu"
        >
          <IconMenu2 size={22} stroke={1.5} />
        </button>
      </div>
    </header>
  );
};
