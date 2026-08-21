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
    <div className="min-h-screen w-full bg-[#010114] text-white flex flex-col lg:flex-row font-sans selection:bg-[#CC6600]/30 selection:text-white">
      {/* ── Left Side: Industrial Executive Auth Command Panel ─────────── */}
      <aside
        className="w-full lg:w-[560px] min-h-screen lg:h-screen lg:max-h-screen flex-shrink-0 bg-[#010B18] border-b lg:border-b-0 lg:border-r border-white/[0.08] z-10 shadow-2xl relative flex flex-col justify-between overflow-y-auto"
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
                Workspace
              </span>
            </div>
          </Link>
        </header>

        {/* Dynamic Form Content: With comfortable horizontal breathing room */}
        <div
          className="w-full my-auto py-8 lg:py-6"
          style={{
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            boxSizing: "border-box",
          }}
        >
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

      {/* ── Right Side: Atmospheric 3D Particle Globe Viewport ─────────── */}
      <main className="hidden lg:flex flex-1 relative bg-[#010114] items-center justify-center overflow-hidden h-screen">
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_85%_50%,rgba(2,132,199,0.20),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(1,46,87,0.35),transparent_60%)] pointer-events-none" />

        {/* 3D Hardware-Accelerated Particle Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <AuthParticleGlobe />
        </div>
      </main>
    </div>
  );
}
