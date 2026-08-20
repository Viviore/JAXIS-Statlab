import React from "react";
import { Topbar } from "../components/layout/Topbar";
import { Sidebar } from "../components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#010114] text-white">
      {/* Topbar (56px) */}
      <Topbar />

      {/* Main Workspace Body (Sidebar + Content) */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Sidebar (240px) */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#010114]">
          {children}
        </main>
      </div>
    </div>
  );
}
