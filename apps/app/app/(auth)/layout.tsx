import React from "react";
import Link from "next/link";
import Image from "next/image";
import AuthParticleGlobe from "@/components/ui/AuthParticleGlobe";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full bg-[#010114] text-white flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-[#CC6600]/30 selection:text-white"
      style={{
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#010114",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* ── Left Side: Industrial Executive Auth Command Panel ─────────── */}
      <aside
        className="flex-shrink-0 bg-[#010B18] border-r border-white/[0.08] z-10 shadow-2xl relative"
        style={{
          width: "560px",
          minWidth: "480px",
          maxWidth: "600px",
          height: "100vh",
          minHeight: "100vh",
          maxHeight: "100vh",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "2.75rem 3rem",
          boxSizing: "border-box",
          backgroundColor: "#010B18",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          overflowY: "auto",
          zIndex: 10,
        }}
      >
        {/* Top Header: Logo + Live Operational Status */}
        <header
          className="flex items-center justify-between w-full flex-shrink-0"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexShrink: 0,
          }}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 text-decoration-none group"
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <Image
              src="/jaxislogo.png"
              alt="JAXIS Logo"
              width={26}
              height={26}
              className="h-6.5 w-auto"
              priority
            />
            <div
              className="flex items-baseline gap-1.5 font-sans"
              style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}
            >
              <span className="font-bold text-sm tracking-wider text-white">
                JAXIS
              </span>
              <span className="font-bold text-sm tracking-wider text-[#CC6600]">
                STATLAB
              </span>
              <span
                className="hidden sm:inline-block text-[0.625rem] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-white/50 tracking-wider ml-1"
                style={{ padding: "0.125rem 0.375rem", marginLeft: "0.25rem" }}
              >
                Workspace
              </span>
            </div>
          </Link>

          {/* Operational Status Pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/25 text-[0.688rem] text-emerald-400 font-mono font-semibold tracking-wider"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 0.75rem",
              borderRadius: "2px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#34D399",
              fontSize: "0.688rem",
              fontWeight: 600,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"
              style={{
                height: "0.375rem",
                width: "0.375rem",
                borderRadius: "9999px",
                backgroundColor: "#34D399",
              }}
            />
            <span>PORTAL ONLINE</span>
          </div>
        </header>

        {/* Dynamic Form Content: Centered in vertical space */}
        <div
          className="w-full flex-shrink-0"
          style={{
            width: "100%",
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "auto",
            marginBottom: "auto",
            paddingTop: "1.5rem",
            paddingBottom: "1.5rem",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>

        {/* Bottom Compliance & Security Footer */}
        <footer
          className="border-t border-white/[0.08] flex items-center justify-between text-[0.688rem] text-slate-400 font-mono w-full flex-shrink-0"
          style={{
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.688rem",
            color: "#94A3B8",
            width: "100%",
            flexShrink: 0,
          }}
        >
          <span>© 2026 JAXIS StatLab Inc.</span>
          <div
            className="flex items-center gap-3 text-slate-500"
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#64748B" }}
          >
            <span>ISO/IEC 27001</span>
            <span>·</span>
            <span>APA 7th</span>
          </div>
        </footer>
      </aside>

      {/* ── Right Side: Atmospheric 3D Particle Globe Viewport ─────────── */}
      <main
        className="hidden lg:flex flex-1 relative bg-[#010114] items-center justify-center overflow-hidden"
        style={{
          flex: 1,
          position: "relative",
          backgroundColor: "#010114",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          height: "100vh",
        }}
      >
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(2,132,199,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(1,46,87,0.30),transparent_50%)] pointer-events-none" />

        {/* 3D Hardware-Accelerated Particle Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <AuthParticleGlobe />
        </div>

        {/* Floating Atmospheric Telemetry Highlights */}
        <div className="absolute bottom-10 right-10 flex flex-col gap-3 z-10 pointer-events-none">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-[2px] bg-[#01142B]/80 border border-white/[0.12] backdrop-blur-md shadow-2xl">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold text-white">Dual-Blind Verification</span>
              <span className="font-mono text-[0.625rem] text-white/50 uppercase">Zero Hypothesis Leaks</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-[2px] bg-[#01142B]/80 border border-white/[0.12] backdrop-blur-md shadow-2xl">
            <span className="h-2 w-2 rounded-full bg-[#CC6600]" />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold text-white">98.4% Defense Pass Rate</span>
              <span className="font-mono text-[0.625rem] text-white/50 uppercase">APA 7th Standardized Outputs</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
