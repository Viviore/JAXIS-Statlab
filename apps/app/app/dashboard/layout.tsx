import React from "react";
import { Topbar } from "../components/layout/Topbar";
import { Sidebar } from "../components/layout/Sidebar";
import { auth } from "@/lib/auth";
import type { RoleName } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const userRole = (user?.role as RoleName) || "ADMIN";
  const userFullName = user?.fullName || user?.name || "Dr. Aris Thorne";
  const userEmail = user?.email || "admin@jaxis.dev";

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
      {/* Topbar (56px) */}
      <Topbar
        userFullName={userFullName}
        userRole={userRole}
        userEmail={userEmail}
      />

      {/* Main Workspace Body (Sidebar + Content) */}
      <div
        className="flex flex-1 h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] w-full overflow-hidden"
        style={{
          display: "flex",
          flex: 1,
          height: "calc(100dvh - 56px)",
          maxHeight: "calc(100dvh - 56px)",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Role-Aware Sidebar */}
        <Sidebar
          role={userRole}
          roleLabel={userRole}
          userFullName={userFullName}
          userEmail={userEmail}
        />

        {/* Content Area */}
        <main
          className="flex-1 min-w-0 h-full max-h-full bg-[#010114] overflow-y-auto"
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            maxHeight: "100%",
            padding: "2rem 2.5rem",
            backgroundColor: "#010114",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
