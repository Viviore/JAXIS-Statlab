import React from "react";
import { Topbar } from "../components/layout/Topbar";
import { Sidebar } from "../components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#010114] text-white"
      style={{ backgroundColor: "#010114", minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Topbar (56px) */}
      <Topbar />

      {/* Main Workspace Body (Sidebar + Content) */}
      <div
        className="flex flex-1 min-h-[calc(100vh-56px)] w-full overflow-hidden"
        style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 56px)", width: "100%", overflow: "hidden" }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main
          className="flex-1 min-w-0 bg-[#010114] overflow-y-auto"
          style={{
            flex: 1,
            minWidth: 0,
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
