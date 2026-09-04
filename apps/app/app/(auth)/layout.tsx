import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthGlobeClient } from "@/components/ui/AuthGlobeClient";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#010114] text-white flex flex-col lg:flex-row font-sans selection:bg-[#CC6600]/30 selection:text-white">
      {/* ── Left Side: Industrial Executive Auth Command Panel ─────────── */}
      <aside
        className="w-full lg:w-[480px] xl:w-[520px] min-h-screen lg:h-screen lg:max-h-screen flex-shrink-0 bg-[#010B18] border-b lg:border-b-0 lg:border-r border-white/[0.08] z-10 shadow-2xl relative flex flex-col justify-between overflow-y-auto"
        style={{
          padding: "2.5rem 2rem",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header: Brand Logo */}
        <header className="flex items-center justify-between w-full flex-shrink-0 mb-6 lg:mb-0">
          <Link
            href="/login"
            className="flex items-center gap-2.5 text-decoration-none group"
          >
            <Image
              src="/jaxislogo.png"
              alt="JAXIS Logo"
              width={26}
              height={26}
              className="h-6.5 w-auto"
              priority
            />
            <div className="flex items-baseline gap-1.5 font-sans">
              <span className="font-bold text-sm tracking-wider text-white">
                JAXIS
              </span>
              <span className="font-bold text-sm tracking-wider text-[#CC6600]">
                STATLAB
              </span>
              <span className="text-[0.625rem] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-white/50 tracking-wider ml-1">
                Studio
              </span>
            </div>
          </Link>
        </header>

        {/* Dynamic Form Content: Centered with comfortable breathing room */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-8 lg:py-6">
          {children}
        </div>

        {/* Bottom Compliance & Security Footer */}
        <footer className="border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.688rem] text-slate-400 font-mono w-full flex-shrink-0 pt-4 sm:pt-5 mt-6 lg:mt-0">
          <span>© 2026 JAXIS StatLab Inc.</span>
          <div className="flex items-center gap-3 text-slate-500">
            <span>ISO/IEC 27001</span>
            <span>·</span>
            <span>APA 7th</span>
          </div>
        </footer>
      </aside>

      {/* ── Right Side: Half-Moon Particle Globe on Right with Research Showcase in Center ─────────── */}
      <main className="hidden lg:flex flex-1 relative bg-[#010114] items-center justify-start overflow-hidden h-screen px-10 xl:px-16 2xl:px-24 select-none">
        {/* Ambient Glows Framed on Right Edge behind the Half-Moon Globe */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_85%_50%,rgba(2,132,199,0.22),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_45%,rgba(1,46,87,0.38),transparent_60%)] pointer-events-none" />

        {/* 3D Hardware-Accelerated Particle Canvas (Half-Moon on Right Edge) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <AuthGlobeClient />
        </div>

        {/* Top Right Live Telemetry Badge */}
        <div className="absolute top-8 right-8 z-10 hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-[#01142B]/80 border border-white/10 text-white/60 text-xs font-mono backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>RESEARCH CLOUD • ONLINE</span>
        </div>

        {/* Hero Showcase — Fills the middle area between login form and right half-moon */}
        <div className="relative z-10 max-w-lg xl:max-w-xl flex flex-col gap-6">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-white/[0.04] border border-white/10 text-white/70 text-xs font-mono backdrop-blur-md self-start">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>RESEARCH CLOUD • ISO/IEC 27001</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-[1.25] font-sans">
              Precision Statistical Computing for High-Stakes Empirical Research
            </h2>
            <p className="text-xs xl:text-sm text-white/60 leading-relaxed font-sans max-w-lg">
              Collaborate directly with Lead Statisticians and Senior QA Specialists under milestone-gated escrow security and reproducible analytics.
            </p>
          </div>

          {/* 4 Bento Capability Cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
            <div className="p-3.5 rounded-[2px] bg-[#01142B]/75 border border-white/10 backdrop-blur-md flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.688rem] uppercase tracking-wider text-white/45 font-semibold">Verification</span>
                <span className="font-mono text-xs font-bold text-emerald-400">99.8%</span>
              </div>
              <span className="text-xs font-semibold text-white font-sans">Double-Blind QA Audit</span>
              <span className="text-[0.688rem] text-white/50 leading-relaxed font-sans">
                Rigorous multi-stage methodology and statistical verification.
              </span>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#01142B]/75 border border-white/10 backdrop-blur-md flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.688rem] uppercase tracking-wider text-white/45 font-semibold">Escrow Protection</span>
                <span className="font-mono text-xs font-bold text-[#CC6600]">100%</span>
              </div>
              <span className="text-xs font-semibold text-white font-sans">Milestone-Gated Release</span>
              <span className="text-[0.688rem] text-white/50 leading-relaxed font-sans">
                Funds held in secure escrow until deliverables meet all criteria.
              </span>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#01142B]/75 border border-white/10 backdrop-blur-md flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.688rem] uppercase tracking-wider text-white/45 font-semibold">Standard</span>
                <span className="font-mono text-xs font-bold text-sky-400">APA 7th</span>
              </div>
              <span className="text-xs font-semibold text-white font-sans">Publication-Ready</span>
              <span className="text-[0.688rem] text-white/50 leading-relaxed font-sans">
                Formatted reporting tables, charts, and mathematical appendices.
              </span>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#01142B]/75 border border-white/10 backdrop-blur-md flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.688rem] uppercase tracking-wider text-white/45 font-semibold">Compliance</span>
                <span className="font-mono text-xs font-bold text-white/80">ISO 27001</span>
              </div>
              <span className="text-xs font-semibold text-white font-sans">Zero Data Leakage</span>
              <span className="text-[0.688rem] text-white/50 leading-relaxed font-sans">
                End-to-end encrypted consultation, audit logs, and secure storage.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40 font-mono pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <span>Trusted by university faculties, clinical researchers, and data teams</span>
          </div>
        </div>
      </main>
    </div>
  );
}
