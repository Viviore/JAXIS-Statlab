import React from "react";
import Link from "next/link";
import { StatusBadge } from "@repo/ui";

export default function RootHomePage() {
  return (
    <div className="min-h-screen bg-[#010114] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#CC6600]/30 selection:text-white">
      {/* ── Ambient Background Lighting & Precision Grid ── */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle 800px at 50% -120px, rgba(1, 46, 87, 0.55), transparent 75%),
            radial-gradient(circle 600px at 90% 85%, rgba(204, 102, 0, 0.08), transparent 60%),
            radial-gradient(circle 500px at 10% 90%, rgba(14, 165, 233, 0.06), transparent 50%),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* ── Top Header Navigation ── */}
      <header className="relative z-10 border-b border-white/[0.08] bg-[#010114]/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand mark */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-[#CC6600] to-[#E67300] rounded-sm flex items-center justify-center font-mono font-bold text-white text-sm tracking-wider shadow-lg shadow-[#CC6600]/20 border border-white/20">
              JX
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-white">
                  JAXIS STATLAB
                </span>
                <span className="text-[0.625rem] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-white/[0.06] border border-white/10 text-white/60 tracking-wider">
                  v2.4 Enterprise
                </span>
              </div>
              <span className="text-[0.688rem] text-white/45 tracking-wide">
                Mission-Critical Statistical Intelligence Platform
              </span>
            </div>
          </div>

          {/* System Telemetry & Quick Links */}
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-4 text-xs text-white/50 border-r border-white/10 pr-5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[0.688rem] text-white/70">Postgres: Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="font-mono text-[0.688rem] text-white/70">R2 Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-mono text-[0.688rem] text-white/70">QA Gate Active</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="http://localhost:3002"
                className="text-xs font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-sm hover:bg-white/[0.04]"
              >
                Public Site
              </a>
              <Link
                href="/login"
                className="text-xs font-medium text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded-sm hover:bg-white/[0.06] border border-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="text-xs font-semibold uppercase tracking-wider text-white bg-[#CC6600] hover:bg-[#E67300] active:bg-[#B35900] px-4 py-2 rounded-sm shadow-md shadow-[#CC6600]/25 transition-all flex items-center gap-1.5"
              >
                <span>Enter Workspace</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Hero & Workspace Gateways ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 w-full flex-1 flex flex-col justify-center">
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#012E57]/60 border border-[#38bdf8]/25 text-[#38bdf8] text-[0.688rem] font-mono uppercase tracking-widest mb-4 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8] animate-ping" />
            Centralized Operational Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Statistical Governance &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-white to-[#CC6600]">
              Defense Intelligence
            </span>
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-white/65 leading-relaxed max-w-2xl mx-auto font-sans">
            Connecting Researchers, Statisticians, Senior QA Leads, and Finance Officers with cryptographic compliance gates, automated data hygiene, and APA 7th reporting.
          </p>
        </div>

        {/* ── 4 Key Role Gateway Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Card 1: Client Research Portal */}
          <div className="bg-[#012E57]/40 hover:bg-[#012E57]/70 border border-white/[0.12] hover:border-sky-400/40 rounded-sm p-5 transition-all duration-200 group flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-sm bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <StatusBadge status="ACTIVE" />
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors">
                Researcher Portal
              </h3>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Submit Chapter 1 &amp; survey data, track real-time study progress, review drafts, and download locked APA deliverables.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[0.688rem] font-mono text-white/45">Client Desk</span>
              <Link href="/dashboard" className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1">
                <span>Access</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Statistician Workbench */}
          <div className="bg-[#012E57]/40 hover:bg-[#012E57]/70 border border-white/[0.12] hover:border-indigo-400/40 rounded-sm p-5 transition-all duration-200 group flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-sm bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className="text-[0.625rem] font-mono px-1.5 py-0.5 rounded-[2px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Workbench
                </span>
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
                Statistician Lab
              </h3>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Run automated data hygiene, test assumption validations, compute R/Python/SPSS pipelines, and compile APA 7th tables.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[0.688rem] font-mono text-white/45">Analysis Desk</span>
              <Link href="/dashboard" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>Access</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Senior QA Verification Lead */}
          <div className="bg-[#012E57]/40 hover:bg-[#012E57]/70 border border-white/[0.12] hover:border-emerald-400/40 rounded-sm p-5 transition-all duration-200 group flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-sm bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <StatusBadge status="FOR_QA" />
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Senior QA Lead Desk
              </h3>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Dual-blind peer verification, p-value audit, methodology validation, and ethical guardrail signoff (`RULE_ETH_01`).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[0.688rem] font-mono text-white/45">Audit Desk</span>
              <Link href="/dashboard" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Access</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Finance & Executive Command */}
          <div className="bg-[#012E57]/40 hover:bg-[#012E57]/70 border border-white/[0.12] hover:border-[#CC6600]/60 rounded-sm p-5 transition-all duration-200 group flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#CC6600]/15 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-sm bg-[#CC6600]/20 border border-[#CC6600]/40 flex items-center justify-center text-[#CC6600]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <StatusBadge status="FULLY_PAID" />
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors">
                Executive &amp; Finance
              </h3>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Escrow authorization, quote management (`RULE_QUO_01`), payment proof approval, and locked deliverable release keys.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[0.688rem] font-mono text-white/45">Finance Desk</span>
              <Link href="/dashboard" className="text-xs font-medium text-[#CC6600] group-hover:text-amber-400 flex items-center gap-1">
                <span>Access</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── System Governance & Compliance Strip ── */}
        <div className="bg-[#012E57]/25 border border-white/[0.08] rounded-sm p-4 backdrop-blur-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-white/[0.06]">
            <div className="px-2">
              <div className="text-[0.625rem] font-mono uppercase text-white/45 tracking-wider">Payment Gate</div>
              <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <span>RULE_REL_01</span>
                <span className="text-[0.625rem] text-white/50">· Enforced</span>
              </div>
            </div>
            <div className="px-2">
              <div className="text-[0.625rem] font-mono uppercase text-white/45 tracking-wider">Ethical Guardrail</div>
              <div className="text-xs font-semibold text-sky-400 mt-1 flex items-center justify-center gap-1">
                <span>RULE_ETH_01</span>
                <span className="text-[0.625rem] text-white/50">· Zero Fraud</span>
              </div>
            </div>
            <div className="px-2">
              <div className="text-[0.625rem] font-mono uppercase text-white/45 tracking-wider">Storage Encryption</div>
              <div className="text-xs font-semibold text-white mt-1 flex items-center justify-center gap-1">
                <span>Cloudflare R2</span>
                <span className="text-[0.625rem] text-white/50">· AES-256</span>
              </div>
            </div>
            <div className="px-2">
              <div className="text-[0.625rem] font-mono uppercase text-white/45 tracking-wider">Compute Engine</div>
              <div className="text-xs font-semibold text-[#CC6600] mt-1 flex items-center justify-center gap-1">
                <span>Trigger.dev</span>
                <span className="text-[0.625rem] text-white/50">· Scaled Workers</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#010114]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.688rem] text-white/40 font-mono">
          <div>
            JAXIS STATLAB · CONFIDENTIAL &amp; PROPRIETARY RESEARCH INFRASTRUCTURE
          </div>
          <div className="flex items-center gap-4 text-white/50">
            <span>APA 7th Compliant</span>
            <span>·</span>
            <span>Next.js 16 App Router</span>
            <span>·</span>
            <span>Supabase PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
